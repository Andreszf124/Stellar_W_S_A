use soroban_sdk::{Address, BytesN, String, contractevent, contracttype};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum Category {
    Clothing,
    Accessory,
    Furniture,
}

/// One unit of a physical product, as a digital item for the buyer's pet or home.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Item {
    pub id: u32,
    /// The store that registered the unit.
    pub store: Address,
    pub name: String,
    pub category: Category,
    /// The store until the item is claimed, then the buyer.
    pub owner: Address,
    pub claimed: bool,
    /// sha256 of the one-time code. The code itself is never stored.
    pub claim_hash: BytesN<32>,
    /// Ledger timestamp (unix seconds) when the store registered the unit.
    pub created_at: u64,
}

#[contracttype]
pub enum DataKey {
    /// id -> Item
    Item(u32),
    /// Number of registered items (also the last id).
    Count,
    /// owner -> Vec<u32> of claimed item ids
    Owned(Address),
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ItemRegistered {
    #[topic]
    pub store: Address,
    pub id: u32,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ItemClaimed {
    #[topic]
    pub claimer: Address,
    pub id: u32,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ItemTransferred {
    #[topic]
    pub from: Address,
    #[topic]
    pub to: Address,
    pub id: u32,
}
