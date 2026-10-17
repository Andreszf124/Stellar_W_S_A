#[soroban_sdk::contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    /// No lot exists with the given id
    LotNotFound = 1,
    /// The caller is not the current owner of the lot
    NotOwner = 2,
    /// A required text field is empty
    EmptyField = 3,
    /// The new owner is already the current owner
    SameOwner = 4,
}
