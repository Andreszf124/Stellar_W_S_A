---
name: scaffold-stellar
description:
  How this Scaffold Stellar project is wired - environments.toml, the npm start
  dev loop that compiles, deploys to testnet and generates TypeScript clients,
  adding a new Soroban contract, calling contracts from React (reads, signed
  writes, events), CLI commands, troubleshooting and deployment. Use whenever
  you add/rename/deploy a contract, touch environments.toml or app/.env, import
  from @stellar-scaffold/app-lib, or the dev server/contract build fails.
license: Apache-2.0
metadata:
  scaffold-cli: "stellar-scaffold-cli 0.0.27 (config v1: environments.toml)"
  stellar-cli: ">=27"
---

# Scaffold Stellar in this repo

Scaffold Stellar = Soroban contracts (Rust) + a Vite/React app, glued by a CLI
plugin (`stellar scaffold`) that **builds → deploys → generates a typed TS
client** for each contract every time you save.

> ⚠️ Version: this repo uses the released CLI **0.0.27** with **config v1**
> (`environments.toml`
>
> - `scaffold.yml` `version: 1`). The upstream docs/skill at stellarscaffold.org
>   now describe config **v2** (`networks:`/`contracts:` in scaffold.yml). Do
>   NOT convert this repo to v2 or follow v2 examples unless the user explicitly
>   asks to migrate.

## Map

```
contracts/<crate>/            Rust/Soroban contracts (Cargo workspace members)
environments.toml             which contracts deploy where (per STELLAR_SCAFFOLD_ENV)
app/                          Vite + React 19 + TS frontend (routes in app/src/App.tsx)
app/.env                      STELLAR_SCAFFOLD_ENV, PUBLIC_* vars (copied from .env.example)
app/.config/stellar/          deployer identity + contract ids (gitignored, auto-created)
app-lib/                      shared TS: network env, wallet (Stellar Wallets Kit), friendbot, events
app-lib/clients/              GENERATED clients (gitignored, never edit) → import from "@stellar-scaffold/app-lib/clients"
app/src/trustless/            Trustless Work escrow integration (see trustless-work skill)
```

## Dev loop

```bash
npm start            # from repo root: `stellar scaffold watch --build-clients` + `vite` (http://localhost:5173)
```

- `development` targets **testnet** (no Docker). On first run it creates + funds
  the `me` deployer account, compiles every contract, deploys the ones listed in
  `environments.toml`, generates clients into `app-lib/clients/`. First run:
  ~1–2 min. Vite may show "Failed to resolve import
  @stellar-scaffold/app-lib/clients" until that finishes: wait.
- Saving a `.rs` file, `Cargo.toml` or `environments.toml` triggers a rebuild +
  redeploy (contracts with `upgrade(BytesN<32>)` are upgraded in place; others
  get a NEW contract id, so on-chain state resets). Saves during a rebuild can
  be missed: save again.
- Run Scaffold CLI commands **from `app/`** (or via the npm scripts), because
  `app/.env` sets `XDG_CONFIG_HOME=".config"` relative to the current directory.

Useful scripts (repo root): `npm run contracts:build` (one-off
build+deploy+clients), `npm run contracts:test` (`cargo test`), `npm run check`
(tests + typecheck + lint), `npm run doctor` (environment diagnosis).

## Add a new contract (the 5 steps)

1. Create `contracts/<crate-name>/` with `Cargo.toml` + `src/lib.rs` (+
   `src/test.rs`). Copy `contracts/reputation/Cargo.toml` and change
   `name`/`description`. Write it with the `soroban-contracts` skill. Run
   `cargo test -p <crate-name>`.
2. Register it in `environments.toml` under `[development.contracts]` (and
   `[staging.contracts]`):
   ```toml
   my_contract = { client = true }                                  # no constructor
   my_contract = { client = true, constructor_args = "--admin me" } # __constructor(admin: Address)
   ```
   The key MUST be the crate name with `-` → `_` (`my-contract` →
   `my_contract`). `me` is the deployer identity.
   `after_deploy = """\nfn_name --arg value\n"""` runs invocations after deploy.
3. Save / keep `npm start` running (or `npm run contracts:build`). Watch the
   "stellar" logs.
4. Import the generated client (camelCase of the key):
   ```ts
   import { myContract } from "@stellar-scaffold/app-lib/clients"
   ```
5. Use it in a component (below), add a route in `app/src/App.tsx` and a nav
   link.

Starting from a template instead: `stellar scaffold generate contract --ls`
lists examples;
`stellar scaffold generate contract --from oz/nft-enumerable -o contracts/my-nft`
copies one (OpenZeppelin `oz/*` ones may need extra `[workspace.dependencies]`
such as `stellar-contract-utils = "0.7.2"`; `stellar/*` examples currently fail
on version mismatch). `--from-wizard` opens
https://wizard.openzeppelin.com/stellar. `generate` never edits
`environments.toml`: do step 2 yourself.

## Calling contracts from React

```tsx
import { reputation } from "@stellar-scaffold/app-lib/clients"
import { useWallet } from "../hooks/useWallet"

// READ: simulation only, free, no wallet needed. Value is in `.result`.
const score = (await reputation.score_of({ subject })).result

// WRITE: build with the user's publicKey, then sign + send with the wallet.
const { address, signTransaction } = useWallet()
const tx = await reputation.review(
	{ reviewer: address!, subject, escrow, rating: 5, comment: "great" },
	{ publicKey: address },
)
const { result } = await tx.signAndSend({ signTransaction })
if (result.isErr()) throw new Error(result.unwrapErr().message) // contract errors (#[contracterror])
```

- Argument names = Rust parameter names (snake_case). Types: `Address` →
  `string` (G…/C…), `i128/u64` → `bigint`, `u32/i32` → `number`, `String/Symbol`
  → `string`, `Option<T>` → `T | undefined`, `Vec<T>` → `T[]`, structs →
  objects, `Result<T, E>` → `Result` with `isOk()/unwrap()/isErr()`.
- Wrap reads in React Query (`useQuery({ queryKey: [...], queryFn })`) as
  `ReputationPanel.tsx` does, and `invalidateQueries` after writes.
- Contract events: `useSubscription(contractId, topic, cb)`
  (`app/src/hooks/useSubscription.ts`) polls RPC events. Contract id:
  `reputation.options.contractId`.
- Wallet state: `useWallet()` → `address`, `connector` (`"cavos"` email/Google
  embedded wallet | `"extension"` Freighter & co.), `balances`
  (`balances.xlm.balance`), `signTransaction` (same shape for both connectors),
  `updateBalances`, `disconnect`, `networkPassphrase` (the wallet's network:
  warn if it's not testnet). Never import the wallet SDKs directly in features
  (see `cavos` skill).
- Env in code:
  `import { stellarNetwork, rpcUrl, networkPassphrase, horizonUrl } from "@stellar-scaffold/app-lib"`.
  Frontend env vars must start with `PUBLIC_` (Vite `envPrefix`).

## CLI one-liners (run from `app/`)

```bash
stellar contract invoke --id reputation --source me --network testnet -- score_of --subject G...   # alias = env key
stellar contract invoke --id reputation --source me --network testnet -- --help                   # list functions
stellar keys address me              # deployer address
stellar scaffold build --build-clients   # one-off (same as npm run contracts:build)
```

Avoid `stellar scaffold clean` unless asked: it wipes deployments/identities and
can touch global identities with the same name.

## Must-knows

- Scaffold tries to deploy **every crate in `contracts/`**. Crates you don't
  want deployed (references, WIP) must be listed with `client = false` (see the
  OpenZeppelin examples), otherwise the build prints
  `❌ Failed to generate client` (e.g. missing constructor args).
- Never edit `app-lib/clients/*` (regenerated). Wrap clients in your own code
  under `app/src/`.
- `PUBLIC_STELLAR_NETWORK` must be `TESTNET` (or `PUBLIC`/`LOCAL`/`FUTURENET`);
  an invalid value silently falls back to LOCAL/localhost. Mainnet is `PUBLIC`,
  not `MAINNET`.
- Changing only `constructor_args` doesn't redeploy. Touch the contract source
  (or delete its alias in `app/.config/stellar/contract-ids/`) to force a fresh
  deploy.
- Unit tests run natively with `cargo test`; they don't need the network.

More: `references/troubleshooting.md` (errors → fixes), `references/deploy.md`
(staging, production, hosting the frontend). Docs:
https://developers.stellar.org/docs/tools/scaffold-stellar (append `.md` for
markdown), https://stellarscaffold.org/docs (describes v2, see warning above).
