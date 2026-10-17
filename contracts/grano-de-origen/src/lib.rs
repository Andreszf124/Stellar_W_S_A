#![no_std]
use soroban_sdk::{contract, contractimpl, Address, Env, String};

mod error;
mod storage;
mod types;

use error::Error;
use types::{Lot, LotRegistered, LotTransferred};

#[contract]
pub struct GranoDeOrigen;

#[contractimpl]
impl GranoDeOrigen {
    /// Register a new coffee lot owned by `owner`. Returns the new lot id (starts at 1).
    pub fn register_lot(
        env: &Env,
        owner: Address,
        farm: String,
        harvest: String,
        process: String,
    ) -> Result<u32, Error> {
        owner.require_auth();
        if farm.is_empty() || harvest.is_empty() || process.is_empty() {
            return Err(Error::EmptyField);
        }

        let id = storage::get_count(env) + 1;
        storage::set_count(env, id);
        storage::set_lot(
            env,
            &Lot {
                id,
                owner: owner.clone(),
                farm,
                harvest,
                process,
                created_at: env.ledger().timestamp(),
            },
        );

        LotRegistered { id, owner }.publish(env);
        Ok(id)
    }

    /// Public read of a lot.
    pub fn get_lot(env: &Env, id: u32) -> Result<Lot, Error> {
        storage::get_lot(env, id).ok_or(Error::LotNotFound)
    }

    /// Transfer a lot to `new_owner`. Requires auth from the current owner.
    pub fn transfer_lot(env: &Env, id: u32, new_owner: Address) -> Result<(), Error> {
        let mut lot = storage::get_lot(env, id).ok_or(Error::LotNotFound)?;
        lot.owner.require_auth();
        if lot.owner == new_owner {
            return Err(Error::SameOwner);
        }

        let from = lot.owner.clone();
        lot.owner = new_owner.clone();
        storage::set_lot(env, &lot);

        LotTransferred {
            id,
            from,
            to: new_owner,
        }
        .publish(env);
        Ok(())
    }

    /// Total number of lots registered.
    pub fn lot_count(env: &Env) -> u32 {
        storage::get_count(env)
    }
}

mod test;
