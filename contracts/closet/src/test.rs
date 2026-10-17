#![cfg(test)]
extern crate std;

use super::*;
use soroban_sdk::{
    Address, Bytes, BytesN, Env, IntoVal, String,
    testutils::{Address as _, MockAuth, MockAuthInvoke},
};

fn setup() -> (Env, ClosetClient<'static>) {
    let env = Env::default();
    env.mock_all_auths();
    let id = env.register(Closet, ());
    let client = ClosetClient::new(&env, &id);
    (env, client)
}

fn code(env: &Env, text: &str) -> Bytes {
    Bytes::from_slice(env, text.as_bytes())
}

fn hash_of(env: &Env, code: &Bytes) -> BytesN<32> {
    env.crypto().sha256(code).to_bytes()
}

/// Registers a "T-shirt" with the code "ABC-123" and returns its id.
fn register_shirt(env: &Env, client: &ClosetClient, store: &Address) -> u32 {
    client.register_item(
        store,
        &String::from_str(env, "Camiseta azul"),
        &Category::Clothing,
        &hash_of(env, &code(env, "ABC-123")),
    )
}

#[test]
fn register_and_get_item() {
    let (env, client) = setup();
    let store = Address::generate(&env);
    let id = register_shirt(&env, &client, &store);

    assert_eq!(id, 1);
    let item = client.get_item(&id);
    assert_eq!(item.store, store);
    assert_eq!(item.owner, store);
    assert!(!item.claimed);
    assert_eq!(item.category, Category::Clothing);
    assert_eq!(client.item_count(), 1);
}

#[test]
fn ids_are_incremental() {
    let (env, client) = setup();
    let store = Address::generate(&env);
    assert_eq!(register_shirt(&env, &client, &store), 1);
    assert_eq!(register_shirt(&env, &client, &store), 2);
    assert_eq!(client.item_count(), 2);
}

#[test]
fn empty_name_is_rejected() {
    let (env, client) = setup();
    let store = Address::generate(&env);
    let result = client.try_register_item(
        &store,
        &String::from_str(&env, ""),
        &Category::Furniture,
        &hash_of(&env, &code(&env, "x")),
    );
    assert_eq!(result, Err(Ok(Error::EmptyField)));
}

#[test]
fn get_unknown_item_fails() {
    let (_env, client) = setup();
    assert_eq!(client.try_get_item(&99), Err(Ok(Error::ItemNotFound)));
}

#[test]
fn claim_with_correct_code() {
    let (env, client) = setup();
    let store = Address::generate(&env);
    let buyer = Address::generate(&env);
    let id = register_shirt(&env, &client, &store);

    client.claim_item(&id, &code(&env, "ABC-123"), &buyer);

    let item = client.get_item(&id);
    assert!(item.claimed);
    assert_eq!(item.owner, buyer);
    assert_eq!(client.items_of(&buyer).len(), 1);
    assert_eq!(client.items_of(&buyer).get(0), Some(id));
}

#[test]
fn claim_with_wrong_code_fails() {
    let (env, client) = setup();
    let store = Address::generate(&env);
    let buyer = Address::generate(&env);
    let id = register_shirt(&env, &client, &store);

    let result = client.try_claim_item(&id, &code(&env, "WRONG"), &buyer);
    assert_eq!(result, Err(Ok(Error::InvalidCode)));
    assert!(!client.get_item(&id).claimed);
    assert_eq!(client.items_of(&buyer).len(), 0);
}

#[test]
fn claim_twice_fails() {
    let (env, client) = setup();
    let store = Address::generate(&env);
    let buyer = Address::generate(&env);
    let other = Address::generate(&env);
    let id = register_shirt(&env, &client, &store);

    client.claim_item(&id, &code(&env, "ABC-123"), &buyer);
    let result = client.try_claim_item(&id, &code(&env, "ABC-123"), &other);
    assert_eq!(result, Err(Ok(Error::AlreadyClaimed)));
    assert_eq!(client.get_item(&id).owner, buyer);
}

#[test]
fn claim_unknown_item_fails() {
    let (env, client) = setup();
    let buyer = Address::generate(&env);
    let result = client.try_claim_item(&7, &code(&env, "ABC-123"), &buyer);
    assert_eq!(result, Err(Ok(Error::ItemNotFound)));
}

#[test]
fn transfer_before_claim_fails() {
    let (env, client) = setup();
    let store = Address::generate(&env);
    let buyer = Address::generate(&env);
    let id = register_shirt(&env, &client, &store);

    let result = client.try_transfer_item(&id, &buyer);
    assert_eq!(result, Err(Ok(Error::NotClaimed)));
}

#[test]
fn transfer_changes_owner_and_both_indexes() {
    let (env, client) = setup();
    let store = Address::generate(&env);
    let buyer = Address::generate(&env);
    let friend = Address::generate(&env);
    let id = register_shirt(&env, &client, &store);
    client.claim_item(&id, &code(&env, "ABC-123"), &buyer);

    client.transfer_item(&id, &friend);

    assert_eq!(client.get_item(&id).owner, friend);
    assert_eq!(client.items_of(&buyer).len(), 0);
    assert_eq!(client.items_of(&friend).get(0), Some(id));
}

#[test]
fn transfer_to_same_owner_fails() {
    let (env, client) = setup();
    let store = Address::generate(&env);
    let buyer = Address::generate(&env);
    let id = register_shirt(&env, &client, &store);
    client.claim_item(&id, &code(&env, "ABC-123"), &buyer);

    let result = client.try_transfer_item(&id, &buyer);
    assert_eq!(result, Err(Ok(Error::SameOwner)));
}

#[test]
fn transfer_requires_current_owner_auth() {
    let (env, client) = setup();
    let store = Address::generate(&env);
    let buyer = Address::generate(&env);
    let thief = Address::generate(&env);
    let id = register_shirt(&env, &client, &store);
    client.claim_item(&id, &code(&env, "ABC-123"), &buyer);

    // Only the thief signs, not the owner: the call must fail and nothing changes.
    env.mock_auths(&[MockAuth {
        address: &thief,
        invoke: &MockAuthInvoke {
            contract: &client.address,
            fn_name: "transfer_item",
            args: (id, thief.clone()).into_val(&env),
            sub_invokes: &[],
        },
    }]);
    assert!(client.try_transfer_item(&id, &thief).is_err());
    assert_eq!(client.get_item(&id).owner, buyer);

    // The real owner signing works.
    env.mock_auths(&[MockAuth {
        address: &buyer,
        invoke: &MockAuthInvoke {
            contract: &client.address,
            fn_name: "transfer_item",
            args: (id, thief.clone()).into_val(&env),
            sub_invokes: &[],
        },
    }]);
    client.transfer_item(&id, &thief);
    assert_eq!(client.get_item(&id).owner, thief);
}

#[test]
fn items_of_only_lists_claimed_items() {
    let (env, client) = setup();
    let store = Address::generate(&env);
    let buyer = Address::generate(&env);
    register_shirt(&env, &client, &store);

    assert_eq!(client.items_of(&store).len(), 0);
    assert_eq!(client.items_of(&buyer).len(), 0);
}
