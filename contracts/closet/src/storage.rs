use soroban_sdk::{Address, Env, Vec};

use crate::types::{DataKey, Item};

// Persistent entries live ~30 days (in ledgers, ~5s each) after each write.
const DAY_IN_LEDGERS: u32 = 17_280;
const TTL_EXTEND_TO: u32 = 30 * DAY_IN_LEDGERS;
const TTL_THRESHOLD: u32 = TTL_EXTEND_TO - DAY_IN_LEDGERS;

pub fn get_item(env: &Env, id: u32) -> Option<Item> {
    env.storage().persistent().get(&DataKey::Item(id))
}

pub fn set_item(env: &Env, item: &Item) {
    let key = DataKey::Item(item.id);
    let storage = env.storage().persistent();
    storage.set(&key, item);
    storage.extend_ttl(&key, TTL_THRESHOLD, TTL_EXTEND_TO);
}

pub fn get_count(env: &Env) -> u32 {
    env.storage().instance().get(&DataKey::Count).unwrap_or(0)
}

pub fn set_count(env: &Env, count: u32) {
    let storage = env.storage().instance();
    storage.set(&DataKey::Count, &count);
    storage.extend_ttl(TTL_THRESHOLD, TTL_EXTEND_TO);
}

pub fn owned(env: &Env, owner: &Address) -> Vec<u32> {
    env.storage()
        .persistent()
        .get(&DataKey::Owned(owner.clone()))
        .unwrap_or(Vec::new(env))
}

fn set_owned(env: &Env, owner: &Address, ids: &Vec<u32>) {
    let key = DataKey::Owned(owner.clone());
    let storage = env.storage().persistent();
    storage.set(&key, ids);
    storage.extend_ttl(&key, TTL_THRESHOLD, TTL_EXTEND_TO);
}

pub fn add_owned(env: &Env, owner: &Address, id: u32) {
    let mut ids = owned(env, owner);
    ids.push_back(id);
    set_owned(env, owner, &ids);
}

pub fn remove_owned(env: &Env, owner: &Address, id: u32) {
    let mut ids = owned(env, owner);
    if let Some(index) = ids.first_index_of(id) {
        ids.remove(index);
    }
    set_owned(env, owner, &ids);
}
