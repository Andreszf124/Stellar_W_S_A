# Architecture patterns

```
 Browser (app/)                     Stellar testnet
 ┌───────────────────────┐          ┌───────────────────────────────┐
 │ React page            │  sign    │ Your Soroban contract (C…)    │  ← Scaffold deploys,
 │  ├ generated client ──┼─────────▶│  listings / profiles / reviews│    TS client generated
 │  ├ useEscrowTx ───┐   │          │                               │
 │  └ wallet (SWK)   │   │          │ Trustless Work escrow (C…)    │  ← one per deal, deployed
 └───────────────────┼───┘          │  holds USDC, enforces roles   │    via TW API
                     │ build/send   └───────────────────────────────┘
                     ▼                          ▲
           Trustless Work API ──────────────────┘ (returns unsigned XDR, submits signed XDR,
           (dev.api.trustlesswork.com)              indexes escrows for queries)
```

## Pattern A: escrow-only (fastest, start here)

All state = escrows. Encode your app's object in `title`, `description`,
`engagementId` (e.g. `"job-<uuid>"`) and milestone
`description`/`status`/`evidence`. List with `useGetEscrowsFromIndexerByRole` /
`BySigner` and filter by `engagementId` or `title`. Good for: deposits, simple
freelance, pre-orders.

## Pattern B: escrow + registry contract (most workshop apps)

A small Soroban contract holds the things people browse before money moves (job
posts, listings, bounty specs, profiles). When a deal starts, deploy the escrow
and save its `contractId` in your contract (`escrow: Option<Address>`), or use
`engagementId = "<kind>-<id>"` to find it. Flow: `post()` (contract) →
`deployEscrow` (TW) → `link_escrow(id, escrowId)` (contract) →
fund/approve/release (TW) → `review()` (reputation). Remember: the contract
can't see TW off-chain index; the frontend orchestrates both.

## Pattern C: contract as a role holder (advanced, unsupported by TW)

TW roles are checked with `require_auth`, so a contract address _could_ be the
approver (e.g. a voting contract approves when quorum is reached) by invoking
the escrow contract directly. Not documented/supported by Trustless Work and not
indexed automatically. Only for experienced builders; prefer having a human
wallet act on the contract's decision.

## Where data goes

| Data                                                                          | Put it in                                              |
| ----------------------------------------------------------------------------- | ------------------------------------------------------ |
| Money, who can move it, deal status                                           | Trustless Work escrow                                  |
| Public, shared, must be tamper-proof (listings, votes, reputation, ownership) | Soroban contract                                       |
| Big blobs (images, long text, files)                                          | Off-chain (IPFS/URL); store only the URL/hash on-chain |
| UI preferences, drafts                                                        | `localStorage`                                         |
| Secrets                                                                       | Nowhere in the frontend. Never.                        |
