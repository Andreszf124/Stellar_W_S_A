import { Buffer } from "buffer";
import { AssembledTransaction, Client as ContractClient, ClientOptions as ContractClientOptions, MethodOptions, Result } from "@stellar/stellar-sdk/contract";
import type { u32, u64 } from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";
export declare const networks: {
    readonly testnet: {
        readonly networkPassphrase: "Test SDF Network ; September 2015";
        readonly contractId: "CDTZKQAOMBPHRD7YK73ETWPJYDTVDM66DRBKQT375RHQSO7I7JZA6SI3";
    };
};
export declare const Errors: {
    /**
     * No lot exists with the given id
     */
    1: {
        message: string;
    };
    /**
     * The caller is not the current owner of the lot
     */
    2: {
        message: string;
    };
    /**
     * A required text field is empty
     */
    3: {
        message: string;
    };
    /**
     * The new owner is already the current owner
     */
    4: {
        message: string;
    };
};
export interface Lot {
    created_at: u64;
    farm: string;
    harvest: string;
    id: u32;
    owner: string;
    process: string;
}
export type DataKey = {
    tag: "Lot";
    values: readonly [u32];
} | {
    tag: "Count";
    values: void;
};
export interface Client {
    /**
     * Construct and simulate a get_lot transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Public read of a lot.
     */
    get_lot: ({ id }: {
        id: u32;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<Lot>>>;
    /**
     * Construct and simulate a lot_count transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Total number of lots registered.
     */
    lot_count: (options?: MethodOptions) => Promise<AssembledTransaction<u32>>;
    /**
     * Construct and simulate a register_lot transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Register a new coffee lot owned by `owner`. Returns the new lot id (starts at 1).
     */
    register_lot: ({ owner, farm, harvest, process }: {
        owner: string;
        farm: string;
        harvest: string;
        process: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<u32>>>;
    /**
     * Construct and simulate a transfer_lot transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Transfer a lot to `new_owner`. Requires auth from the current owner.
     */
    transfer_lot: ({ id, new_owner }: {
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
        get_lot: (json: string) => AssembledTransaction<Result<Lot, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        lot_count: (json: string) => AssembledTransaction<number>;
        register_lot: (json: string) => AssembledTransaction<Result<number, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        transfer_lot: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
    };
}
