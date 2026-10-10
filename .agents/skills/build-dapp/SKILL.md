---
name: build-dapp
description:
  End-to-end workflow to turn a dApp idea into a working app in this repo
  (Scaffold Stellar + Trustless Work escrows + optional Soroban contract) -
  short interview, design (escrow type, roles, on-chain vs off-chain data),
  build in small verified steps, and a demo checklist. Use when the user
  describes an app idea, says "build/make/create an app/dApp", "I want an app
  where…", asks what to build, or invokes /build-dapp.
license: Apache-2.0
---

# Build a dApp from an idea

You are pairing with someone who may have learned what a blockchain is this
week. Your job: get them from idea → working testnet demo fast, explaining just
enough as you go. Speak the user's language. Keep momentum: small steps, each
one verified.

## 0. Ground yourself (once per session)

- Read `AGENTS.md`. Skim `app/src/pages/Escrows.tsx` and `app/src/trustless/`
  (the escrow building blocks you will reuse) and `contracts/reputation`
  (contract template).
- Run `npm run doctor`. If something is missing, fix or explain that first.

## 1. Interview (max 3 questions, skip what's obvious)

Pin down, in plain words:

1. **Who pays whom, for what?** (the two sides + the thing exchanged)
2. **When should money move, and who decides?** (milestones/deliverables, who
   approves, what happens if they disagree)
3. **What else must be public/tamper-proof?** (listings, profiles, votes,
   reputation, badges) vs. what can live just in the UI.

If the user is vague, propose a concrete version ("I'll build X with Y and Z,
ok?") instead of asking more. Use `references/ideas.md` for inspiration if they
have no idea yet.

## 2. Design (write it down in 5–10 lines before coding)

- **Escrow type**: per-milestone payouts → multi-release; one payout at the end
  → single-release.
- **Role mapping**: fill the table (approver, serviceProvider, releaseSigner,
  disputeResolver, platformAddress, receiver) with real people of the story. See
  `trustless-work` skill `references/recipes.md`. For a solo demo, the connected
  wallet can play every role.
- **Data**: Escrow title/description/`engagementId` + Trustless Work indexer can
  be the whole "database" for simple apps. Add a Soroban contract only for state
  that must be shared and trustless (listings others can browse, profiles,
  votes, reputation, NFTs). Prefer extending or reusing `contracts/reputation`
  patterns. See `references/architecture.md`.
- **Screens**: usually 1–3 pages (e.g. "Browse", "Create", "My deals"). Reuse
  `EscrowCard`.

Share the plan in a few bullet points and start building unless the user
objects.

## 3. Build in this order (verify after each step)

1. **Contract** (if any): write tests first, then code (`soroban-contracts`
   skill). ✅ `cargo test -p <crate>`
2. **Register + deploy**: add it to `environments.toml` (`scaffold-stellar`
   skill). With `npm start` running it deploys automatically; otherwise
   `npm run contracts:build`. ✅ the logs say
   `Successfully generated client for: <name>`
3. **UI**: new page in `app/src/pages/`, route in `app/src/App.tsx`, nav link in
   the header. Escrow writes go through `useEscrowTx().run(...)`; contract
   writes through `client.method(args, { publicKey: address })` +
   `signAndSend({ signTransaction })`. Reads through React Query. ✅
   `npm run typecheck` and `npm run lint`
4. **Copy + polish**: clear labels for each role/action, amounts with units,
   empty states, loading states ("confirm in your wallet…"), links to the escrow
   viewer/explorer.
5. **Full check**: ✅ `npm run check`

You cannot click the wallet popup. After building, give the user a short manual
test script (e.g. "1. Connect Freighter on Testnet 2. Setup checklist 3.
Create… 4. Fund…"), and ask them to paste any error they see. Use the
`stellar-basics` error decoder to interpret it.

## 4. Demo checklist

- [ ] `npm run check` passes.
- [ ] Happy path works end-to-end with one wallet (all roles) on testnet.
- [ ] Each page explains in one sentence what's happening on-chain.
- [ ] No secrets committed (`git status`: `.env` must not appear).
- [ ] README section "What I built" with the idea, roles, and how to try it.
- [ ] (Optional) Deployed frontend: `scaffold-stellar` skill
      `references/deploy.md`.

## Guardrails

- Testnet only unless the user explicitly asks for mainnet (then: security
  checklist + review).
- Never ask for or handle secret keys/seed phrases. The wallet signs; the agent
  never does.
- Don't edit generated code (`app-lib/clients/*`) or the vendored skill under
  `references/official`.
- Don't re-implement escrow logic in a custom contract: Trustless Work is the
  payment rail.
- Keep diffs small and explain each step in 1–2 sentences. If a step fails
  twice, stop and show the user the error with your diagnosis instead of
  thrashing.
