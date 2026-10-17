import { Buffer } from "buffer";
import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Timepoint,
  Duration,
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CAQQRHJIBNWHDBBETYVT5JZI5D27SWQDYJKHRNY6QTX7RT2TYVYECTUO",
  }
} as const

export const Errors = {
  /**
   * No item exists with the given id.
   */
  1: {message:"ItemNotFound"},
  /**
   * The item name is empty.
   */
  2: {message:"EmptyField"},
  /**
   * This item was already claimed.
   */
  3: {message:"AlreadyClaimed"},
  /**
   * The claim code is not the one that came with the product.
   */
  4: {message:"InvalidCode"},
  /**
   * The item has not been claimed yet, so it cannot be transferred.
   */
  5: {message:"NotClaimed"},
  /**
   * The new owner is already the current owner.
   */
  6: {message:"SameOwner"}
}


/**
 * One unit of a physical product, as a digital item for the buyer's pet or home.
 */
export interface Item {
  category: Category;
  /**
 * sha256 of the one-time code. The code itself is never stored.
 */
claim_hash: Buffer;
  claimed: boolean;
  /**
 * Ledger timestamp (unix seconds) when the store registered the unit.
 */
created_at: u64;
  id: u32;
  name: string;
  /**
 * The store until the item is claimed, then the buyer.
 */
owner: string;
  /**
 * The store that registered the unit.
 */
store: string;
}

export type DataKey = {tag: "Item", values: readonly [u32]} | {tag: "Count", values: void} | {tag: "Owned", values: readonly [string]};

export type Category = {tag: "Clothing", values: void} | {tag: "Accessory", values: void} | {tag: "Furniture", values: void};




export interface Client {
  /**
   * Construct and simulate a get_item transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Public read of an item.
   */
  get_item: ({id}: {id: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Result<Item>>>

  /**
   * Construct and simulate a items_of transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Ids of the claimed items owned by `owner`.
   */
  items_of: ({owner}: {owner: string}, options?: MethodOptions) => Promise<AssembledTransaction<Array<u32>>>

  /**
   * Construct and simulate a claim_item transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Claim an item by revealing its one-time code. Signed by the buyer.
   */
  claim_item: ({id, code, claimer}: {id: u32, code: Buffer, claimer: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a item_count transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Total number of registered items.
   */
  item_count: (options?: MethodOptions) => Promise<AssembledTransaction<u32>>

  /**
   * Construct and simulate a register_item transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Register a unit for sale. Signed by the store. Returns the new item id (starts at 1).
   */
  register_item: ({store, name, category, claim_hash}: {store: string, name: string, category: Category, claim_hash: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<Result<u32>>>

  /**
   * Construct and simulate a transfer_item transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Give a claimed item to someone else. Signed by the current owner.
   */
  transfer_item: ({id, new_owner}: {id: u32, new_owner: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAAAAABdQdWJsaWMgcmVhZCBvZiBhbiBpdGVtLgAAAAAIZ2V0X2l0ZW0AAAABAAAAAAAAAAJpZAAAAAAABAAAAAEAAAPpAAAH0AAAAARJdGVtAAAAAw==",
        "AAAAAAAAACpJZHMgb2YgdGhlIGNsYWltZWQgaXRlbXMgb3duZWQgYnkgYG93bmVyYC4AAAAAAAhpdGVtc19vZgAAAAEAAAAAAAAABW93bmVyAAAAAAAAEwAAAAEAAAPqAAAABA==",
        "AAAAAAAAAEJDbGFpbSBhbiBpdGVtIGJ5IHJldmVhbGluZyBpdHMgb25lLXRpbWUgY29kZS4gU2lnbmVkIGJ5IHRoZSBidXllci4AAAAAAApjbGFpbV9pdGVtAAAAAAADAAAAAAAAAAJpZAAAAAAABAAAAAAAAAAEY29kZQAAAA4AAAAAAAAAB2NsYWltZXIAAAAAEwAAAAEAAAPpAAAAAgAAAAM=",
        "AAAAAAAAACFUb3RhbCBudW1iZXIgb2YgcmVnaXN0ZXJlZCBpdGVtcy4AAAAAAAAKaXRlbV9jb3VudAAAAAAAAAAAAAEAAAAE",
        "AAAAAAAAAFVSZWdpc3RlciBhIHVuaXQgZm9yIHNhbGUuIFNpZ25lZCBieSB0aGUgc3RvcmUuIFJldHVybnMgdGhlIG5ldyBpdGVtIGlkIChzdGFydHMgYXQgMSkuAAAAAAAADXJlZ2lzdGVyX2l0ZW0AAAAAAAAEAAAAAAAAAAVzdG9yZQAAAAAAABMAAAAAAAAABG5hbWUAAAAQAAAAAAAAAAhjYXRlZ29yeQAAB9AAAAAIQ2F0ZWdvcnkAAAAAAAAACmNsYWltX2hhc2gAAAAAA+4AAAAgAAAAAQAAA+kAAAAEAAAAAw==",
        "AAAAAAAAAEFHaXZlIGEgY2xhaW1lZCBpdGVtIHRvIHNvbWVvbmUgZWxzZS4gU2lnbmVkIGJ5IHRoZSBjdXJyZW50IG93bmVyLgAAAAAAAA10cmFuc2Zlcl9pdGVtAAAAAAAAAgAAAAAAAAACaWQAAAAAAAQAAAAAAAAACW5ld19vd25lcgAAAAAAABMAAAABAAAD6QAAAAIAAAAD",
        "AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAABgAAACFObyBpdGVtIGV4aXN0cyB3aXRoIHRoZSBnaXZlbiBpZC4AAAAAAAAMSXRlbU5vdEZvdW5kAAAAAQAAABdUaGUgaXRlbSBuYW1lIGlzIGVtcHR5LgAAAAAKRW1wdHlGaWVsZAAAAAAAAgAAAB5UaGlzIGl0ZW0gd2FzIGFscmVhZHkgY2xhaW1lZC4AAAAAAA5BbHJlYWR5Q2xhaW1lZAAAAAAAAwAAADlUaGUgY2xhaW0gY29kZSBpcyBub3QgdGhlIG9uZSB0aGF0IGNhbWUgd2l0aCB0aGUgcHJvZHVjdC4AAAAAAAALSW52YWxpZENvZGUAAAAABAAAAD9UaGUgaXRlbSBoYXMgbm90IGJlZW4gY2xhaW1lZCB5ZXQsIHNvIGl0IGNhbm5vdCBiZSB0cmFuc2ZlcnJlZC4AAAAACk5vdENsYWltZWQAAAAAAAUAAAArVGhlIG5ldyBvd25lciBpcyBhbHJlYWR5IHRoZSBjdXJyZW50IG93bmVyLgAAAAAJU2FtZU93bmVyAAAAAAAABg==",
        "AAAAAQAAAE5PbmUgdW5pdCBvZiBhIHBoeXNpY2FsIHByb2R1Y3QsIGFzIGEgZGlnaXRhbCBpdGVtIGZvciB0aGUgYnV5ZXIncyBwZXQgb3IgaG9tZS4AAAAAAAAAAAAESXRlbQAAAAgAAAAAAAAACGNhdGVnb3J5AAAH0AAAAAhDYXRlZ29yeQAAAD1zaGEyNTYgb2YgdGhlIG9uZS10aW1lIGNvZGUuIFRoZSBjb2RlIGl0c2VsZiBpcyBuZXZlciBzdG9yZWQuAAAAAAAACmNsYWltX2hhc2gAAAAAA+4AAAAgAAAAAAAAAAdjbGFpbWVkAAAAAAEAAABDTGVkZ2VyIHRpbWVzdGFtcCAodW5peCBzZWNvbmRzKSB3aGVuIHRoZSBzdG9yZSByZWdpc3RlcmVkIHRoZSB1bml0LgAAAAAKY3JlYXRlZF9hdAAAAAAABgAAAAAAAAACaWQAAAAAAAQAAAAAAAAABG5hbWUAAAAQAAAANFRoZSBzdG9yZSB1bnRpbCB0aGUgaXRlbSBpcyBjbGFpbWVkLCB0aGVuIHRoZSBidXllci4AAAAFb3duZXIAAAAAAAATAAAAI1RoZSBzdG9yZSB0aGF0IHJlZ2lzdGVyZWQgdGhlIHVuaXQuAAAAAAVzdG9yZQAAAAAAABM=",
        "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAAAwAAAAEAAAAKaWQgLT4gSXRlbQAAAAAABEl0ZW0AAAABAAAABAAAAAAAAAAuTnVtYmVyIG9mIHJlZ2lzdGVyZWQgaXRlbXMgKGFsc28gdGhlIGxhc3QgaWQpLgAAAAAABUNvdW50AAAAAAAAAQAAACVvd25lciAtPiBWZWM8dTMyPiBvZiBjbGFpbWVkIGl0ZW0gaWRzAAAAAAAABU93bmVkAAAAAAAAAQAAABM=",
        "AAAAAgAAAAAAAAAAAAAACENhdGVnb3J5AAAAAwAAAAAAAAAAAAAACENsb3RoaW5nAAAAAAAAAAAAAAAJQWNjZXNzb3J5AAAAAAAAAAAAAAAAAAAJRnVybml0dXJlAAAA",
        "AAAABQAAAAAAAAAAAAAAC0l0ZW1DbGFpbWVkAAAAAAEAAAAMaXRlbV9jbGFpbWVkAAAAAgAAAAAAAAAHY2xhaW1lcgAAAAATAAAAAQAAAAAAAAACaWQAAAAAAAQAAAAAAAAAAg==",
        "AAAABQAAAAAAAAAAAAAADkl0ZW1SZWdpc3RlcmVkAAAAAAABAAAAD2l0ZW1fcmVnaXN0ZXJlZAAAAAACAAAAAAAAAAVzdG9yZQAAAAAAABMAAAABAAAAAAAAAAJpZAAAAAAABAAAAAAAAAAC",
        "AAAABQAAAAAAAAAAAAAAD0l0ZW1UcmFuc2ZlcnJlZAAAAAABAAAAEGl0ZW1fdHJhbnNmZXJyZWQAAAADAAAAAAAAAARmcm9tAAAAEwAAAAEAAAAAAAAAAnRvAAAAAAATAAAAAQAAAAAAAAACaWQAAAAAAAQAAAAAAAAAAg==" ]),
      options
    )
  }
  public readonly fromJSON = {
    get_item: this.txFromJSON<Result<Item>>,
        items_of: this.txFromJSON<Array<u32>>,
        claim_item: this.txFromJSON<Result<void>>,
        item_count: this.txFromJSON<u32>,
        register_item: this.txFromJSON<Result<u32>>,
        transfer_item: this.txFromJSON<Result<void>>
  }
}