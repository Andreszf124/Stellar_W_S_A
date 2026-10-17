import { Buffer } from "buffer";
import { AssembledTransaction, Client as ContractClient, ClientOptions as ContractClientOptions, MethodOptions, Result } from "@stellar/stellar-sdk/contract";
import type { u32, u64 } from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";
export declare const networks: {
    readonly testnet: {
        readonly networkPassphrase: "Test SDF Network ; September 2015";
        readonly contractId: "CAQQRHJIBNWHDBBETYVT5JZI5D27SWQDYJKHRNY6QTX7RT2TYVYECTUO";
    };
};
export declare const Errors: {
    /**
     * No item exists with the given id.
     */
    1: {
        message: string;
    };
    /**
     * The item name is empty.
     */
    2: {
        message: string;
    };
    /**
     * This item was already claimed.
     */
    3: {
        message: string;
    };
    /**
     * The claim code is not the one that came with the product.
     */
    4: {
        message: string;
    };
    /**
     * The item has not been claimed yet, so it cannot be transferred.
     */
    5: {
        message: string;
    };
    /**
     * The new owner is already the current owner.
     */
    6: {
        message: string;
    };
};
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
export type DataKey = {
    tag: "Item";
    values: readonly [u32];
} | {
    tag: "Count";
    values: void;
} | {
    tag: "Owned";
    values: readonly [string];
};
export type Category = {
    tag: "Clothing";
    values: void;
} | {
    tag: "Accessory";
    values: void;
} | {
    tag: "Furniture";
    values: void;
};
export interface Client {
    /**
     * Construct and simulate a get_item transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Public read of an item.
     */
    get_item: ({ id }: {
        id: u32;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<Item>>>;
    /**
     * Construct and simulate a items_of transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Ids of the claimed items owned by `owner`.
     */
    items_of: ({ owner }: {
        owner: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Array<u32>>>;
    /**
     * Construct and simulate a claim_item transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Claim an item by revealing its one-time code. Signed by the buyer.
     */
    claim_item: ({ id, code, claimer }: {
        id: u32;
        code: Buffer;
        claimer: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a item_count transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Total number of registered items.
     */
    item_count: (options?: MethodOptions) => Promise<AssembledTransaction<u32>>;
    /**
     * Construct and simulate a register_item transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Register a unit for sale. Signed by the store. Returns the new item id (starts at 1).
     */
    register_item: ({ store, name, category, claim_hash }: {
        store: string;
        name: string;
        category: Category;
        claim_hash: Buffer;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<u32>>>;
    /**
     * Construct and simulate a transfer_item transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Give a claimed item to someone else. Signed by the current owner.
     */
    transfer_item: ({ id, new_owner }: {
        id: u32;
        new_owner: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
}
export declare class Client extends ContractClient {
    readonly options: ContractClientOptions;
    static deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions & Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
    }): Promise<AssembledTransaction<T>>;
    constructor(options: ContractClientOptions);
    readonly fromJSON: {
        get_item: (json: string) => AssembledTransaction<Result<Item, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        items_of: (json: string) => AssembledTransaction<number[]>;
        claim_item: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        item_count: (json: string) => AssembledTransaction<number>;
        register_item: (json: string) => AssembledTransaction<Result<number, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        transfer_item: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
    };
}
