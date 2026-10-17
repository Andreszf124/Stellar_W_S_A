use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    /// No item exists with the given id.
    ItemNotFound = 1,
    /// The item name is empty.
    EmptyField = 2,
    /// This item was already claimed.
    AlreadyClaimed = 3,
    /// The claim code is not the one that came with the product.
    InvalidCode = 4,
    /// The item has not been claimed yet, so it cannot be transferred.
    NotClaimed = 5,
    /// The new owner is already the current owner.
    SameOwner = 6,
}
