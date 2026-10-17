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
        contractId: "CAQQRHJIBNWHDBBETYVT5JZI5D27SWQDYJKHRNY6QTX7RT2TYVYECTUO",
    }
};
export const Errors = {
    /**
     * No item exists with the given id.
     */
    1: { message: "ItemNotFound" },
    /**
     * The item name is empty.
     */
    2: { message: "EmptyField" },
    /**
     * This item was already claimed.
     */
    3: { message: "AlreadyClaimed" },
    /**
     * The claim code is not the one that came with the product.
     */
    4: { message: "InvalidCode" },
    /**
     * The item has not been claimed yet, so it cannot be transferred.
     */
    5: { message: "NotClaimed" },
    /**
     * The new owner is already the current owner.
     */
    6: { message: "SameOwner" }
};
export class Client extends ContractClient {
    options;
    static async deploy(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options) {
        return ContractClient.deploy(null, options);
    }
    constructor(options) {
        super(new ContractSpec(["AAAAAAAAABdQdWJsaWMgcmVhZCBvZiBhbiBpdGVtLgAAAAAIZ2V0X2l0ZW0AAAABAAAAAAAAAAJpZAAAAAAABAAAAAEAAAPpAAAH0AAAAARJdGVtAAAAAw==",
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
            "AAAABQAAAAAAAAAAAAAAD0l0ZW1UcmFuc2ZlcnJlZAAAAAABAAAAEGl0ZW1fdHJhbnNmZXJyZWQAAAADAAAAAAAAAARmcm9tAAAAEwAAAAEAAAAAAAAAAnRvAAAAAAATAAAAAQAAAAAAAAACaWQAAAAAAAQAAAAAAAAAAg=="]), options);
        this.options = options;
    }
    fromJSON = {
        get_item: (this.txFromJSON),
        items_of: (this.txFromJSON),
        claim_item: (this.txFromJSON),
        item_count: (this.txFromJSON),
        register_item: (this.txFromJSON),
        transfer_item: (this.txFromJSON)
    };
}
