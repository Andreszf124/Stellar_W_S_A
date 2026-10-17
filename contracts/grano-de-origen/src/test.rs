#![cfg(test)]
extern crate std;

use soroban_sdk::{
    testutils::{Address as _, Ledger, MockAuth, MockAuthInvoke},
    Address, Env, IntoVal, String,
};

use crate::{error::Error, GranoDeOrigen, GranoDeOrigenClient};

fn setup() -> (Env, GranoDeOrigenClient<'static>) {
    let env = Env::default();
    let id = env.register(GranoDeOrigen, ());
    let client = GranoDeOrigenClient::new(&env, &id);
    (env, client)
}

fn s(env: &Env, v: &str) -> String {
    String::from_str(env, v)
}

fn register(env: &Env, client: &GranoDeOrigenClient, owner: &Address) -> u32 {
    client.register_lot(
        owner,
        &s(env, "Finca La Esperanza"),
        &s(env, "2025"),
        &s(env, "Lavado"),
    )
}

#[test]
fn register_and_get_lot() {
    let (env, client) = setup();
    env.mock_all_auths();
    env.ledger().set_timestamp(1_700_000_000);
    let owner = Address::generate(&env);

    let id = register(&env, &client, &owner);
    assert_eq!(id, 1);

    let lot = client.get_lot(&id);
    assert_eq!(lot.id, 1);
    assert_eq!(lot.owner, owner);
    assert_eq!(lot.farm, s(&env, "Finca La Esperanza"));
    assert_eq!(lot.harvest, s(&env, "2025"));
    assert_eq!(lot.process, s(&env, "Lavado"));
    assert_eq!(lot.created_at, 1_700_000_000);
}

#[test]
fn ids_are_incremental() {
    let (env, client) = setup();
    env.mock_all_auths();
    let owner = Address::generate(&env);
    assert_eq!(register(&env, &client, &owner), 1);
    assert_eq!(register(&env, &client, &owner), 2);
    assert_eq!(register(&env, &client, &owner), 3);
}

#[test]
fn empty_field_is_rejected() {
    let (env, client) = setup();
    env.mock_all_auths();
    let owner = Address::generate(&env);
    let ok = s(&env, "x");
    let empty = s(&env, "");

    let r = client.try_register_lot(&owner, &empty, &ok, &ok);
    assert_eq!(r, Err(Ok(Error::EmptyField)));
    let r = client.try_register_lot(&owner, &ok, &empty, &ok);
    assert_eq!(r, Err(Ok(Error::EmptyField)));
    let r = client.try_register_lot(&owner, &ok, &ok, &empty);
    assert_eq!(r, Err(Ok(Error::EmptyField)));
    assert_eq!(client.lot_count(), 0);
}

#[test]
fn get_unknown_lot_fails() {
    let (_env, client) = setup();
    assert_eq!(client.try_get_lot(&99), Err(Ok(Error::LotNotFound)));
}

#[test]
fn transfer_unknown_lot_fails() {
    let (env, client) = setup();
    env.mock_all_auths();
    let new_owner = Address::generate(&env);
    assert_eq!(
        client.try_transfer_lot(&42, &new_owner),
        Err(Ok(Error::LotNotFound))
    );
}

#[test]
fn transfer_changes_owner() {
    let (env, client) = setup();
    env.mock_all_auths();
    let owner = Address::generate(&env);
    let new_owner = Address::generate(&env);
    let id = register(&env, &client, &owner);

    client.transfer_lot(&id, &new_owner);
    assert_eq!(client.get_lot(&id).owner, new_owner);
}

#[test]
fn transfer_requires_current_owner_auth() {
    let (env, client) = setup();
    let owner = Address::generate(&env);
    let attacker = Address::generate(&env);

    // Register with a specific auth for the owner.
    env.mock_auths(&[MockAuth {
        address: &owner,
        invoke: &MockAuthInvoke {
            contract: &client.address,
            fn_name: "register_lot",
            args: (&owner, s(&env, "Finca"), s(&env, "2025"), s(&env, "Honey")).into_val(&env),
            sub_invokes: &[],
        },
    }]);
    let id = client.register_lot(&owner, &s(&env, "Finca"), &s(&env, "2025"), &s(&env, "Honey"));

    // Only the attacker signs: must fail because the owner did not authorize.
    env.mock_auths(&[MockAuth {
        address: &attacker,
        invoke: &MockAuthInvoke {
            contract: &client.address,
            fn_name: "transfer_lot",
            args: (id, &attacker).into_val(&env),
            sub_invokes: &[],
        },
    }]);
    assert!(client.try_transfer_lot(&id, &attacker).is_err());
    assert_eq!(client.get_lot(&id).owner, owner);

    // The real owner signing succeeds.
    env.mock_auths(&[MockAuth {
        address: &owner,
        invoke: &MockAuthInvoke {
            contract: &client.address,
            fn_name: "transfer_lot",
            args: (id, &attacker).into_val(&env),
            sub_invokes: &[],
        },
    }]);
    client.transfer_lot(&id, &attacker);
    assert_eq!(client.get_lot(&id).owner, attacker);
}

#[test]
fn transfer_to_same_owner_fails() {
    let (env, client) = setup();
    env.mock_all_auths();
    let owner = Address::generate(&env);
    let id = register(&env, &client, &owner);
    assert_eq!(
        client.try_transfer_lot(&id, &owner),
        Err(Ok(Error::SameOwner))
    );
}

#[test]
fn lot_count_tracks_registrations() {
    let (env, client) = setup();
    env.mock_all_auths();
    let owner = Address::generate(&env);
    assert_eq!(client.lot_count(), 0);
    register(&env, &client, &owner);
    register(&env, &client, &owner);
    assert_eq!(client.lot_count(), 2);
}
