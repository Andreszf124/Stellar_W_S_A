# AGENTS.md

<!-- template: bitfalt/scaffold-stellar-agentic (keep this line: it lets the template author count projects built from it) -->

Instructions for any AI coding agent working in this repo (Claude Code, Codex,
Cursor, OpenCode, Copilot, Gemini/Antigravity, Pi, Windsurf, Aider…). Humans:
see `README.md`.

## What this is

A workshop starter for building Stellar dApps **by prompting**: **Scaffold
Stellar** (Soroban contracts in Rust + Vite/React app + auto-generated
TypeScript clients) wired to **Trustless Work** escrows (USDC held in per-deal
contracts, released by roles/milestones), on **testnet**. The people using it
are often brand new to web3.

Always reply in the user's language. Explain on-chain concepts in one or two
plain sentences when they matter, then keep building.

## Skills (read before working on that area)

Skills live in `.agents/skills/<name>/SKILL.md` (open Agent Skills format;
mirrored to `.claude/skills/`). If your tool doesn't load skills automatically,
**open and read the matching SKILL.md yourself before starting**: they contain
verified, version-specific facts that differ from your training data.

| Skill               | Read it when                                                                                               |
| ------------------- | ---------------------------------------------------------------------------------------------------------- |
| `build-dapp`        | The user describes an app idea or wants to build something. Start here.                                    |
| `trustless-work`    | Anything about escrows, payments, milestones, roles, disputes, USDC                                        |
| `scaffold-stellar`  | Adding/deploying contracts, `environments.toml`, `app/.env`, generated clients, dev server or build errors |
| `soroban-contracts` | Writing/testing/reviewing Rust contracts in `contracts/`                                                   |
| `stellar-basics`    | Explaining Stellar concepts, decoding transaction errors, test money                                       |

## Golden rules

1. **Testnet only** unless the user explicitly asks for mainnet.
2. **Never** ask for, print, store or commit secret keys (`S…`), seed phrases or
   `app/.env`. Users sign with their wallet; the agent never signs for them.
3. Don't edit generated code: `app-lib/clients/*` (Scaffold regenerates it) and
   `.agents/skills/trustless-work/references/official/` (vendored).
4. Scaffold config is **v1** (`environments.toml`). Don't migrate to
   `scaffold.yml` v2.
5. Trustless Work is **API V1** with `@trustless-work/escrow@3.0.5`. Don't
   upgrade to the 5.x beta or mix V2 payloads.
6. Reuse the building blocks before writing new ones: `useEscrowTx` (every
   escrow write), `useMyEscrows`/`useEscrow`, `EscrowCard`, `CreateEscrowForm`,
   `SetupChecklist`, `ReputationPanel`, `contracts/reputation`.
7. Work in small steps and verify each one (`cargo test`, `npm run typecheck`,
   `npm run check`). You can't click wallet popups: hand the user a short manual
   test script instead.
8. Edit skills only in `.agents/skills/` (then `npm run agents:sync`), never in
   `.claude/skills/`.

## Commands (repo root)

| Command                              | What it does                                                                                                                |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| `npm install`                        | install deps (+ syncs skill mirrors)                                                                                        |
| `npm run doctor`                     | checks tools, `app/.env`, network, Trustless Work key; creates `app/.env` if missing                                        |
| `npm start`                          | dev loop: `stellar scaffold watch --build-clients` (build → deploy to testnet → TS clients) + Vite on http://localhost:5173 |
| `npm run contracts:build`            | one-off build + deploy + client generation                                                                                  |
| `npm run contracts:test`             | `cargo test` for all contracts                                                                                              |
| `npm run typecheck` / `npm run lint` | TypeScript / ESLint for the app                                                                                             |
| `npm run check`                      | contracts:test + typecheck + lint (run before saying "done")                                                                |
| `npm run tw:smoke`                   | end-to-end Trustless Work test (deploy→fund→approve→release) signed by the local deployer key                               |

Scaffold/Stellar CLI commands must run from `app/` (its `.env` sets a relative
config dir).

## Layout

```
contracts/reputation/     example Soroban contract (reviews tied to escrows) + tests
contracts/fungible-allowlist, nft-enumerable/   OpenZeppelin examples (not deployed by default)
environments.toml         contracts per environment (development = testnet)
app/src/pages/            Home, Escrows (Escrow Studio), Debug (deployed contracts)
app/src/trustless/        Trustless Work integration (config, provider, hooks, components)
app/src/components/       shared UI (ReputationPanel, wallet buttons…)
app/src/hooks/            useWallet, useNotification, useSubscription
app-lib/                  network env, wallet kit, friendbot, events (shared TS lib)
app-lib/clients/          GENERATED contract clients (gitignored)
scripts/                  doctor, tw-smoke, agents-sync, dev-guard
docs/                     workshop guide, agent setup per tool
```

## Code conventions

- TypeScript strict, React 19 function components, React Query for async state,
  CSS Modules using the tokens in `app-lib/styles.css` (`var(--color-accent)`
  etc.). Tabs, no semicolons (Prettier config `@theahaco/ts-config/prettier`).
- Frontend env vars must start with `PUBLIC_` (`import.meta.env.PUBLIC_*`).
- Contract client names: crate `my-contract` → env key `my_contract` →
  `import { myContract } from "@stellar-scaffold/app-lib/clients"`.
- Rust: `#![no_std]`, soroban-sdk 26 (workspace pin), `#[contractevent]` for
  events, explicit `#[contracterror]` enums, tests in `src/test.rs`.

## Live docs (when skills aren't enough)

- Stellar: https://developers.stellar.org/llms.txt (append `.md` to any docs
  page URL)
- Trustless Work: https://docs.trustlesswork.com/trustless-work/llms.txt ·
  Swagger https://dev.api.trustlesswork.com/docs
- Scaffold Stellar:
  https://developers.stellar.org/docs/tools/scaffold-stellar.md
  (stellarscaffold.org documents config v2)
- OpenZeppelin Stellar contracts:
  https://docs.openzeppelin.com/stellar-contracts
- Optional MCP servers (docs search, contract wizard): see
  `docs/AGENT-SETUP.md`.
