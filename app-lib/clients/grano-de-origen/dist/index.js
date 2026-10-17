import { Buffer } from "buffer";
import { Client as ContractClient, Spec as ContractSpec, } from "@stellar/stellar-sdk/contract";
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
};
export const Errors = {
    /**
     * No lot exists with the given id
     */
    1: { message: "LotNotFound" },
    /**
     * The caller is not the current owner of the lot
     */
    2: { message: "NotOwner" },
    /**
     * A required text field is empty
     */
    3: { message: "EmptyField" },
    /**
     * The new owner is already the current owner
     */
    4: { message: "SameOwner" }
};
export class Client extends ContractClient {
    options;
    static async deploy(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options) {
        return ContractClient.deploy(null, options);
    }
    constructor(options) {
        super(new ContractSpec(["AAAAAAAAABVQdWJsaWMgcmVhZCBvZiBhIGxvdC4AAAAAAAAHZ2V0X2xvdAAAAAABAAAAAAAAAAJpZAAAAAAABAAAAAEAAAPpAAAH0AAAAANMb3QAAAAAAw==",
            "AAAAAAAAACBUb3RhbCBudW1iZXIgb2YgbG90cyByZWdpc3RlcmVkLgAAAAlsb3RfY291bnQAAAAAAAAAAAAAAQAAAAQ=",
            "AAAAAAAAAFFSZWdpc3RlciBhIG5ldyBjb2ZmZWUgbG90IG93bmVkIGJ5IGBvd25lcmAuIFJldHVybnMgdGhlIG5ldyBsb3QgaWQgKHN0YXJ0cyBhdCAxKS4AAAAAAAAMcmVnaXN0ZXJfbG90AAAABAAAAAAAAAAFb3duZXIAAAAAAAATAAAAAAAAAARmYXJtAAAAEAAAAAAAAAAHaGFydmVzdAAAAAAQAAAAAAAAAAdwcm9jZXNzAAAAABAAAAABAAAD6QAAAAQAAAAD",
            "AAAAAAAAAERUcmFuc2ZlciBhIGxvdCB0byBgbmV3X293bmVyYC4gUmVxdWlyZXMgYXV0aCBmcm9tIHRoZSBjdXJyZW50IG93bmVyLgAAAAx0cmFuc2Zlcl9sb3QAAAACAAAAAAAAAAJpZAAAAAAABAAAAAAAAAAJbmV3X293bmVyAAAAAAAAEwAAAAEAAAPpAAAAAgAAAAM=",
            "AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAABAAAAB9ObyBsb3QgZXhpc3RzIHdpdGggdGhlIGdpdmVuIGlkAAAAAAtMb3ROb3RGb3VuZAAAAAABAAAALlRoZSBjYWxsZXIgaXMgbm90IHRoZSBjdXJyZW50IG93bmVyIG9mIHRoZSBsb3QAAAAAAAhOb3RPd25lcgAAAAIAAAAeQSByZXF1aXJlZCB0ZXh0IGZpZWxkIGlzIGVtcHR5AAAAAAAKRW1wdHlGaWVsZAAAAAAAAwAAACpUaGUgbmV3IG93bmVyIGlzIGFscmVhZHkgdGhlIGN1cnJlbnQgb3duZXIAAAAAAAlTYW1lT3duZXIAAAAAAAAE",
            "AAAAAQAAAAAAAAAAAAAAA0xvdAAAAAAGAAAAAAAAAApjcmVhdGVkX2F0AAAAAAAGAAAAAAAAAARmYXJtAAAAEAAAAAAAAAAHaGFydmVzdAAAAAAQAAAAAAAAAAJpZAAAAAAABAAAAAAAAAAFb3duZXIAAAAAAAATAAAAAAAAAAdwcm9jZXNzAAAAABA=",
            "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAAAgAAAAEAAAAAAAAAA0xvdAAAAAABAAAABAAAAAAAAAAAAAAABUNvdW50AAAA",
            "AAAABQAAAAAAAAAAAAAADUxvdFJlZ2lzdGVyZWQAAAAAAAABAAAADmxvdF9yZWdpc3RlcmVkAAAAAAACAAAAAAAAAAJpZAAAAAAABAAAAAEAAAAAAAAABW93bmVyAAAAAAAAEwAAAAAAAAAC",
            "AAAABQAAAAAAAAAAAAAADkxvdFRyYW5zZmVycmVkAAAAAAABAAAAD2xvdF90cmFuc2ZlcnJlZAAAAAADAAAAAAAAAAJpZAAAAAAABAAAAAEAAAAAAAAABGZyb20AAAATAAAAAAAAAAAAAAACdG8AAAAAABMAAAAAAAAAAg=="]), options);
        this.options = options;
    }
    fromJSON = {
        get_lot: (this.txFromJSON),
        lot_count: (this.txFromJSON),
        register_lot: (this.txFromJSON),
        transfer_lot: (this.txFromJSON)
    };
}
