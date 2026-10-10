# Blueprint: voting / polls (contract only, no escrow)

For "I want a voting app", "polls", "surveys", "let my community decide",
"elections for my club"… Nobody holds money, so: **one Soroban contract + 2–3
pages. No Trustless Work, no API key.** Cavos "Sign in" makes voting
frictionless for non-crypto people.

## Data placement (decide with the user)

- **On-chain**: polls (question, options, deadline), tallies, who already voted.
  That's the point: nobody, not even the app owner, can rig results.
- **Off-chain**: long descriptions or images → a URL field; voter names/emails →
  never on-chain (Cavos login already gives each person an address).
- **Ask the user**: "On-chain, anyone can see which address voted for what. Is
  open voting OK, or do you need secret ballots? (secret = much more complex:
  commit-reveal or zero-knowledge)". Default for a demo: open voting.
- **Ask if relevant**: should anyone create polls, or only some people
  (allowlist / members holding a token)?

## Contract `polls` (`contracts/polls`, no constructor needed)

Copy `contracts/reputation` (Cargo.toml, storage/TTL/event/test patterns) and
adapt:

```text
Poll { id: u32, creator: Address, question: String, options: Vec<String>, ends_at: u64 }

DataKey::Count                  instance   u32 (next poll id)
DataKey::Poll(id)               persistent Poll
DataKey::Tally(id)              persistent Vec<u32> (one counter per option)
DataKey::Voted(id, voter)       persistent u32 (the option chosen)
```

Functions (sign = `require_auth` on that address):

- `create_poll(creator, question, options, duration_secs) -> u32`: creator
  signs. Validate 2–10 options, question ≤ 200 bytes, each option ≤ 64 bytes,
  duration 60 s – 30 days. `ends_at = env.ledger().timestamp() + duration_secs`.
  Tally starts as zeros. Emit `PollCreated { #[topic] creator, id }`.
- `vote(voter, poll_id, option: u32)`: voter signs. Errors if the poll doesn't
  exist, `timestamp >= ends_at`, `option >= options.len()`, or
  `Voted(id, voter)` exists. Increment the tally, store `Voted`. Emit
  `VoteCast { #[topic] poll_id, option }`.
- Reads: `get_poll(id)`, `results(id) -> Vec<u32>`,
  `vote_of(id, voter) -> Option<u32>`, `count()`,
  `list_polls(start, limit) -> Vec<Poll>` (cap `limit` at 50, newest-first is
  done in the UI).
- `#[contracterror]` with a `///` user-facing message on each variant:
  `PollNotFound`, `PollClosed`, `InvalidOption`, `AlreadyVoted`,
  `TooFewOptions`, `TooManyOptions`, `TextTooLong`, `InvalidDuration`.
- TTL: extend `Poll`, `Tally` and `Voted` keys on every write to ~60 days
  (`17_280 * 60` ledgers) so they outlive the poll.

Tests (`cargo test -p polls`): create + vote + results; second vote →
`AlreadyVoted`; vote after `env.ledger().set_timestamp(ends_at)` → `PollClosed`;
bad option; 1 and 11 options rejected; `env.auths()` shows the voter signed;
`list_polls` respects the cap.

Register: `polls = { client = true }` in `[development.contracts]` (and
staging). Import: `import { polls } from "@stellar-scaffold/app-lib/clients"`.

## Pages

- **Polls** (`/` or `/polls`): list with question, time left, total votes,
  leading option. "Create poll" button.
- **Create** (`/polls/new`): question, 2–10 option inputs, duration select (1 h,
  1 day, 1 week). After success, navigate to the poll.
- **Poll** (`/polls/:id`): option buttons while open; result bars (CSS width =
  votes / total); "You voted: X" from `vote_of`; countdown from
  `Number(ends_at) * 1000` (u64 is `bigint` in TS); share link. Refetch results
  every ~10 s or subscribe to `VoteCast` with `useSubscription`.

Writes:
`polls.vote({ voter: address, poll_id, option }, { publicKey: address })` →
`if (tx.result.isErr()) …` → `signAndSend({ signTransaction })`. `vote_of`
returns `null` (not `undefined`) when the user hasn't voted.

Remove the "Escrow Studio" nav link (keep the code); the app doesn't use
escrows.

## Honest limits (tell the user)

- **Votes are public**: anyone can see which address voted for what. Secret
  ballots need commit-reveal or zero-knowledge proofs (advanced).
- **One address ≠ one person**: addresses are free, so a determined person can
  vote many times. Options, from simple to strong: an **allowlist** chosen by
  the creator (`Allowed(id, addr)` keys, capped), **token-gated** voting (hold a
  membership NFT/token: `TokenClient::new(&env, &token).balance(&voter) > 0`,
  see the OpenZeppelin examples), or off-chain identity checks.
- Each vote is a transaction: voters need a little XLM (Friendbot on testnet;
  Cavos users too).

## When money DOES enter a poll

- Pay-to-vote or donations per option → direct transfers in `vote`
  (`TokenClient::transfer`), still no escrow.
- A prize pool held until the poll closes and someone judges the outcome →
  that's a conditional hold: now a Trustless Work escrow makes sense.
