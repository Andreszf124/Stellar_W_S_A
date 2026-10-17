use soroban_sdk::Env;

use crate::types::{DataKey, Lot};

const DAY_IN_LEDGERS: u32 = 17_280;
/// Extend lot TTL when fewer than this many ledgers remain.
const LOT_TTL_THRESHOLD: u32 = 30 * DAY_IN_LEDGERS;
/// Target TTL after extending a lot.
const LOT_TTL_EXTEND_TO: u32 = 90 * DAY_IN_LEDGERS;
const INSTANCE_TTL_THRESHOLD: u32 = 30 * DAY_IN_LEDGERS;
const INSTANCE_TTL_EXTEND_TO: u32 = 90 * DAY_IN_LEDGERS;

pub fn get_lot(env: &Env, id: u32) -> Option<Lot> {
    let key = DataKey::Lot(id);
    let lot: Option<Lot> = env.storage().persistent().get(&key);
    if lot.is_some() {
        env.storage()
            .persistent()
            .extend_ttl(&key, LOT_TTL_THRESHOLD, LOT_TTL_EXTEND_TO);
    }
    lot
}

pub fn set_lot(env: &Env, lot: &Lot) {
    let key = DataKey::Lot(lot.id);
    env.storage().persistent().set(&key, lot);
    env.storage()
        .persistent()
        .extend_ttl(&key, LOT_TTL_THRESHOLD, LOT_TTL_EXTEND_TO);
}

pub fn get_count(env: &Env) -> u32 {
    env.storage().instance().get(&DataKey::Count).unwrap_or(0)
}

pub fn set_count(env: &Env, count: u32) {
    env.storage().instance().set(&DataKey::Count, &count);
    env.storage()
        .instance()
        .extend_ttl(INSTANCE_TTL_THRESHOLD, INSTANCE_TTL_EXTEND_TO);
}
