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
    contractId: "CB5VHRXKO6CPFKSELKIHN3JJXMLQUDRCEBKDCCVRMZW7A534YLYIRK45",
  }
} as const

export const Errors = {
  /**
   * Rating must be between 1 and 5.
   */
  1: {message:"InvalidRating"},
  /**
   * You cannot review yourself.
   */
  2: {message:"SelfReview"},
  /**
   * This reviewer already reviewed this escrow.
   */
  3: {message:"AlreadyReviewed"},
  /**
   * Comment is longer than `MAX_COMMENT_LEN` bytes.
   */
  4: {message:"CommentTooLong"}
}


export interface Score {
  /**
 * How many reviews this address has received.
 */
count: u32;
  /**
 * Sum of all ratings received. Average = total / count.
 */
total: u32;
}


export interface Review {
  comment: string;
  /**
 * The escrow (contract address, `C...`) this review is about.
 */
escrow: string;
  /**
 * 1 to 5 stars.
 */
rating: u32;
  reviewer: string;
  subject: string;
  /**
 * Ledger timestamp (unix seconds) when the review was posted.
 */
timestamp: u64;
}


export interface Client {
  /**
   * Construct and simulate a review transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Post a review about `subject` for the given `escrow`. Must be signed by `reviewer`.
   */
  review: ({reviewer, subject, escrow, rating, comment}: {reviewer: string, subject: string, escrow: string, rating: u32, comment: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a score_of transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * All-time score of `subject`.
   */
  score_of: ({subject}: {subject: string}, options?: MethodOptions) => Promise<AssembledTransaction<Score>>

  /**
   * Construct and simulate a get_review transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * The review `reviewer` left for `escrow`, if any.
   */
  get_review: ({reviewer, escrow}: {reviewer: string, escrow: string}, options?: MethodOptions) => Promise<AssembledTransaction<Option<Review>>>

  /**
   * Construct and simulate a reviews_of transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Latest reviews received by `subject` (oldest first).
   */
  reviews_of: ({subject}: {subject: string}, options?: MethodOptions) => Promise<AssembledTransaction<Array<Review>>>

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
      new ContractSpec([ "AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAABAAAAB9SYXRpbmcgbXVzdCBiZSBiZXR3ZWVuIDEgYW5kIDUuAAAAAA1JbnZhbGlkUmF0aW5nAAAAAAAAAQAAABtZb3UgY2Fubm90IHJldmlldyB5b3Vyc2VsZi4AAAAAClNlbGZSZXZpZXcAAAAAAAIAAAArVGhpcyByZXZpZXdlciBhbHJlYWR5IHJldmlld2VkIHRoaXMgZXNjcm93LgAAAAAPQWxyZWFkeVJldmlld2VkAAAAAAMAAAAvQ29tbWVudCBpcyBsb25nZXIgdGhhbiBgTUFYX0NPTU1FTlRfTEVOYCBieXRlcy4AAAAADkNvbW1lbnRUb29Mb25nAAAAAAAE",
        "AAAAAQAAAAAAAAAAAAAABVNjb3JlAAAAAAAAAgAAACtIb3cgbWFueSByZXZpZXdzIHRoaXMgYWRkcmVzcyBoYXMgcmVjZWl2ZWQuAAAAAAVjb3VudAAAAAAAAAQAAAA1U3VtIG9mIGFsbCByYXRpbmdzIHJlY2VpdmVkLiBBdmVyYWdlID0gdG90YWwgLyBjb3VudC4AAAAAAAAFdG90YWwAAAAAAAAE",
        "AAAAAQAAAAAAAAAAAAAABlJldmlldwAAAAAABgAAAAAAAAAHY29tbWVudAAAAAAQAAAAO1RoZSBlc2Nyb3cgKGNvbnRyYWN0IGFkZHJlc3MsIGBDLi4uYCkgdGhpcyByZXZpZXcgaXMgYWJvdXQuAAAAAAZlc2Nyb3cAAAAAABMAAAANMSB0byA1IHN0YXJzLgAAAAAAAAZyYXRpbmcAAAAAAAQAAAAAAAAACHJldmlld2VyAAAAEwAAAAAAAAAHc3ViamVjdAAAAAATAAAAO0xlZGdlciB0aW1lc3RhbXAgKHVuaXggc2Vjb25kcykgd2hlbiB0aGUgcmV2aWV3IHdhcyBwb3N0ZWQuAAAAAAl0aW1lc3RhbXAAAAAAAAAG",
        "AAAAAAAAAFNQb3N0IGEgcmV2aWV3IGFib3V0IGBzdWJqZWN0YCBmb3IgdGhlIGdpdmVuIGBlc2Nyb3dgLiBNdXN0IGJlIHNpZ25lZCBieSBgcmV2aWV3ZXJgLgAAAAAGcmV2aWV3AAAAAAAFAAAAAAAAAAhyZXZpZXdlcgAAABMAAAAAAAAAB3N1YmplY3QAAAAAEwAAAAAAAAAGZXNjcm93AAAAAAATAAAAAAAAAAZyYXRpbmcAAAAAAAQAAAAAAAAAB2NvbW1lbnQAAAAAEAAAAAEAAAPpAAAAAgAAAAM=",
        "AAAAAAAAABxBbGwtdGltZSBzY29yZSBvZiBgc3ViamVjdGAuAAAACHNjb3JlX29mAAAAAQAAAAAAAAAHc3ViamVjdAAAAAATAAAAAQAAB9AAAAAFU2NvcmUAAAA=",
        "AAAABQAAAEVFbWl0dGVkIGV2ZXJ5IHRpbWUgYSByZXZpZXcgaXMgcG9zdGVkLiBGcm9udGVuZHMgY2FuIHN1YnNjcmliZSB0byBpdC4AAAAAAAAAAAAADFJldmlld1Bvc3RlZAAAAAEAAAANcmV2aWV3X3Bvc3RlZAAAAAAAAAQAAAAAAAAAB3N1YmplY3QAAAAAEwAAAAEAAAAAAAAACHJldmlld2VyAAAAEwAAAAEAAAAAAAAABmVzY3JvdwAAAAAAEwAAAAAAAAAAAAAABnJhdGluZwAAAAAABAAAAAAAAAAC",
        "AAAAAAAAADBUaGUgcmV2aWV3IGByZXZpZXdlcmAgbGVmdCBmb3IgYGVzY3Jvd2AsIGlmIGFueS4AAAAKZ2V0X3JldmlldwAAAAAAAgAAAAAAAAAIcmV2aWV3ZXIAAAATAAAAAAAAAAZlc2Nyb3cAAAAAABMAAAABAAAD6AAAB9AAAAAGUmV2aWV3AAA=",
        "AAAAAAAAADRMYXRlc3QgcmV2aWV3cyByZWNlaXZlZCBieSBgc3ViamVjdGAgKG9sZGVzdCBmaXJzdCkuAAAACnJldmlld3Nfb2YAAAAAAAEAAAAAAAAAB3N1YmplY3QAAAAAEwAAAAEAAAPqAAAH0AAAAAZSZXZpZXcAAA==" ]),
      options
    )
  }
  public readonly fromJSON = {
    review: this.txFromJSON<Result<void>>,
        score_of: this.txFromJSON<Score>,
        get_review: this.txFromJSON<Option<Review>>,
        reviews_of: this.txFromJSON<Array<Review>>
  }
}