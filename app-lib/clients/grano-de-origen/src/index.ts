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
    contractId: "CDTZKQAOMBPHRD7YK73ETWPJYDTVDM66DRBKQT375RHQSO7I7JZA6SI3",
  }
} as const

export const Errors = {
  /**
   * No lot exists with the given id
   */
  1: {message:"LotNotFound"},
  /**
   * The caller is not the current owner of the lot
   */
  2: {message:"NotOwner"},
  /**
   * A required text field is empty
   */
  3: {message:"EmptyField"},
  /**
   * The new owner is already the current owner
   */
  4: {message:"SameOwner"}
}


export interface Lot {
  created_at: u64;
  farm: string;
  harvest: string;
  id: u32;
  owner: string;
  process: string;
}

export type DataKey = {tag: "Lot", values: readonly [u32]} | {tag: "Count", values: void};



export interface Client {
  /**
   * Construct and simulate a get_lot transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Public read of a lot.
   */
  get_lot: ({id}: {id: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Result<Lot>>>

  /**
   * Construct and simulate a lot_count transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Total number of lots registered.
   */
  lot_count: (options?: MethodOptions) => Promise<AssembledTransaction<u32>>

  /**
   * Construct and simulate a register_lot transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Register a new coffee lot owned by `owner`. Returns the new lot id (starts at 1).
   */
  register_lot: ({owner, farm, harvest, process}: {owner: string, farm: string, harvest: string, process: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<u32>>>

  /**
   * Construct and simulate a transfer_lot transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Transfer a lot to `new_owner`. Requires auth from the current owner.
   */
  transfer_lot: ({id, new_owner}: {id: u32, new_owner: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

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
      new ContractSpec([ "AAAAAAAAABVQdWJsaWMgcmVhZCBvZiBhIGxvdC4AAAAAAAAHZ2V0X2xvdAAAAAABAAAAAAAAAAJpZAAAAAAABAAAAAEAAAPpAAAH0AAAAANMb3QAAAAAAw==",
        "AAAAAAAAACBUb3RhbCBudW1iZXIgb2YgbG90cyByZWdpc3RlcmVkLgAAAAlsb3RfY291bnQAAAAAAAAAAAAAAQAAAAQ=",
        "AAAAAAAAAFFSZWdpc3RlciBhIG5ldyBjb2ZmZWUgbG90IG93bmVkIGJ5IGBvd25lcmAuIFJldHVybnMgdGhlIG5ldyBsb3QgaWQgKHN0YXJ0cyBhdCAxKS4AAAAAAAAMcmVnaXN0ZXJfbG90AAAABAAAAAAAAAAFb3duZXIAAAAAAAATAAAAAAAAAARmYXJtAAAAEAAAAAAAAAAHaGFydmVzdAAAAAAQAAAAAAAAAAdwcm9jZXNzAAAAABAAAAABAAAD6QAAAAQAAAAD",
        "AAAAAAAAAERUcmFuc2ZlciBhIGxvdCB0byBgbmV3X293bmVyYC4gUmVxdWlyZXMgYXV0aCBmcm9tIHRoZSBjdXJyZW50IG93bmVyLgAAAAx0cmFuc2Zlcl9sb3QAAAACAAAAAAAAAAJpZAAAAAAABAAAAAAAAAAJbmV3X293bmVyAAAAAAAAEwAAAAEAAAPpAAAAAgAAAAM=",
        "AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAABAAAAB9ObyBsb3QgZXhpc3RzIHdpdGggdGhlIGdpdmVuIGlkAAAAAAtMb3ROb3RGb3VuZAAAAAABAAAALlRoZSBjYWxsZXIgaXMgbm90IHRoZSBjdXJyZW50IG93bmVyIG9mIHRoZSBsb3QAAAAAAAhOb3RPd25lcgAAAAIAAAAeQSByZXF1aXJlZCB0ZXh0IGZpZWxkIGlzIGVtcHR5AAAAAAAKRW1wdHlGaWVsZAAAAAAAAwAAACpUaGUgbmV3IG93bmVyIGlzIGFscmVhZHkgdGhlIGN1cnJlbnQgb3duZXIAAAAAAAlTYW1lT3duZXIAAAAAAAAE",
        "AAAAAQAAAAAAAAAAAAAAA0xvdAAAAAAGAAAAAAAAAApjcmVhdGVkX2F0AAAAAAAGAAAAAAAAAARmYXJtAAAAEAAAAAAAAAAHaGFydmVzdAAAAAAQAAAAAAAAAAJpZAAAAAAABAAAAAAAAAAFb3duZXIAAAAAAAATAAAAAAAAAAdwcm9jZXNzAAAAABA=",
        "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAAAgAAAAEAAAAAAAAAA0xvdAAAAAABAAAABAAAAAAAAAAAAAAABUNvdW50AAAA",
        "AAAABQAAAAAAAAAAAAAADUxvdFJlZ2lzdGVyZWQAAAAAAAABAAAADmxvdF9yZWdpc3RlcmVkAAAAAAACAAAAAAAAAAJpZAAAAAAABAAAAAEAAAAAAAAABW93bmVyAAAAAAAAEwAAAAAAAAAC",
        "AAAABQAAAAAAAAAAAAAADkxvdFRyYW5zZmVycmVkAAAAAAABAAAAD2xvdF90cmFuc2ZlcnJlZAAAAAADAAAAAAAAAAJpZAAAAAAABAAAAAEAAAAAAAAABGZyb20AAAATAAAAAAAAAAAAAAACdG8AAAAAABMAAAAAAAAAAg==" ]),
      options
    )
  }
  public readonly fromJSON = {
    get_lot: this.txFromJSON<Result<Lot>>,
        lot_count: this.txFromJSON<u32>,
        register_lot: this.txFromJSON<Result<u32>>,
        transfer_lot: this.txFromJSON<Result<void>>
  }
}