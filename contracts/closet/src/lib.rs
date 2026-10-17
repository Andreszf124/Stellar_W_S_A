#![no_std]
//! # Closet
//!
//! A store registers one unit of a physical product (clothing, accessory or
//! furniture) with the sha256 of a one-time code that ships with it. The buyer
//! claims the digital version by revealing the code, and from then on owns it
//! and can transfer it.
//!
//! The code itself is never stored, only its hash, so nobody can claim an item
//! by reading the chain.
use soroban_sdk::{Address, Bytes, BytesN, Env, String, Vec, contract, contractimpl};

mod error;
mod storage;
mod types;

pub use error::Error;
pub use types::{Category, Item};
use types::{ItemClaimed, ItemRegistered, ItemTransferred};

#[contract]
pub struct Closet;

#[contractimpl]
impl Closet {
    /// Register a unit for sale. Signed by the store. Returns the new item id (starts at 1).
    pub fn register_item(
        env: Env,
        store: Address,
        name: String,
        category: Category,
        claim_hash: BytesN<32>,
    ) -> Result<u32, Error> {
        store.require_auth();
        if name.is_empty() {
            return Err(Error::EmptyField);
        }

        let id = storage::get_count(&env) + 1;
        storage::set_count(&env, id);
        storage::set_item(
            &env,
            &Item {
                id,
                store: store.clone(),
                name,
                category,
                owner: store.clone(),
                claimed: false,
                claim_hash,
                created_at: env.ledger().timestamp(),
            },
        );

        ItemRegistered { store, id }.publish(&env);
        Ok(id)
    }

    /// Claim an item by revealing its one-time code. Signed by the buyer.
    pub fn claim_item(env: Env, id: u32, code: Bytes, claimer: Address) -> Result<(), Error> {
        claimer.require_auth();
        let mut item = storage::get_item(&env, id).ok_or(Error::ItemNotFound)?;
        if item.claimed {
            return Err(Error::AlreadyClaimed);
        }
        let digest: BytesN<32> = env.crypto().sha256(&code).to_bytes();
        if digest != item.claim_hash {
            return Err(Error::InvalidCode);
        }

        item.owner = claimer.clone();
        item.claimed = true;
        storage::set_item(&env, &item);
        storage::add_owned(&env, &claimer, id);

        ItemClaimed { claimer, id }.publish(&env);
        Ok(())
    }

    /// Give a claimed item to someone else. Signed by the current owner.
    pub fn transfer_item(env: Env, id: u32, new_owner: Address) -> Result<(), Error> {
        let mut item = storage::get_item(&env, id).ok_or(Error::ItemNotFound)?;
        if !item.claimed {
            return Err(Error::NotClaimed);
        }
        item.owner.require_auth();
        if item.owner == new_owner {
            return Err(Error::SameOwner);
        }

        let from = item.owner.clone();
        storage::remove_owned(&env, &from, id);
        storage::add_owned(&env, &new_owner, id);
        item.owner = new_owner.clone();
        storage::set_item(&env, &item);

        ItemTransferred {
            from,
            to: new_owner,
            id,
        }
        .publish(&env);
        Ok(())
    }

    /// Public read of an item.
    pub fn get_item(env: Env, id: u32) -> Result<Item, Error> {
        storage::get_item(&env, id).ok_or(Error::ItemNotFound)
    }

    /// Ids of the claimed items owned by `owner`.
    pub fn items_of(env: Env, owner: Address) -> Vec<u32> {
        storage::owned(&env, &owner)
    }

    /// Total number of registered items.
    pub fn item_count(env: Env) -> u32 {
        storage::get_count(&env)
    }
}

mod test;
