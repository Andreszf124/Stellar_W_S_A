use soroban_sdk::{contractevent, contracttype, Address, String};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Lot {
    pub id: u32,
    pub owner: Address,
    pub farm: String,
    pub harvest: String,
    pub process: String,
    pub created_at: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    Lot(u32),
    Count,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct LotRegistered {
    #[topic]
    pub id: u32,
    pub owner: Address,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct LotTransferred {
    #[topic]
    pub id: u32,
    pub from: Address,
    pub to: Address,
}
