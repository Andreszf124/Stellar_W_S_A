# Escrow recipes

Role mappings for common apps. "platform" = an address your dApp controls (for a
workshop, the builder's own wallet). Every recipe reuses
`useEscrowTx().run(...)`.

## 1. Freelance gig board (multi-release)

- Client posts a job (store it: Soroban contract or just the escrow
  `title`/`description`).
- Freelancer applies → client picks one → deploy escrow: `approver = client`,
  `serviceProvider = freelancer`, `releaseSigner = client`,
  `disputeResolver = platform`, `platformAddress = platform`, milestones =
  deliverables with `amount` and `receiver = freelancer`.
- Client funds → freelancer marks done with evidence link → client approves +
  releases each.
- Use `engagementId = "job-<id>"` to find the escrow for a job:
  `getEscrowsByRole({ role: "approver", roleAddress: client, engagementId })`.

## 2. Rental / security deposit (single-release)

- `approver = landlord`, `serviceProvider = tenant`, `receiver = tenant`
  (refund), `releaseSigner = landlord`, `disputeResolver = platform`.
- Tenant funds the deposit. At move-out the landlord approves → release returns
  it.
- Damage? Landlord opens a dispute; resolver splits the balance (sum must equal
  balance).

## 3. Hackathon bounties / prizes (multi-release, many receivers)

- Sponsor deploys one escrow, one milestone per prize:
  `{ description: "1st place", amount: 500, receiver: winner }`.
- Receivers can be set when winners are known: `update-escrow` (platform only,
  BEFORE funding) or append milestones after funding.
- `approver = judges` wallet, `releaseSigner = sponsor`.

## 4. Marketplace purchase (single-release)

- `approver = buyer`, `serviceProvider = seller`, `receiver = seller`,
  `releaseSigner = buyer` (or platform for auto-release),
  `disputeResolver = platform`.
- Buyer funds at checkout; seller marks "shipped" (`newStatus: "shipped"`,
  evidence = tracking); buyer approves on delivery → release.

## 5. Crowdfunding with milestones (multi-release)

- Many backers fund the same escrow (anyone can fund).
- `serviceProvider = project`, `approver = community multisig / platform`,
  milestones = roadmap.
- Show progress with `escrow.balance` vs total of milestone amounts.

## 6. Grants in tranches (multi-release)

- Funder = approver + releaseSigner; grantee = serviceProvider + milestone
  receiver.
- Evidence = report links. Pairs well with `contracts/reputation`.

## 7. P2P / OTC trade (single-release)

- Seller of the off-chain good is `serviceProvider` + `receiver`; buyer is
  `approver` + funder.
- Buyer approves after receiving the off-chain asset (fiat transfer, item).

## Custom status vocabulary

`newStatus` is free text. Pick a small set per app and show it in the UI:
`"pending" → "in_progress" → "completed"` or `"shipped" → "delivered"`. Approval
is a separate flag set by the approver and cannot be undone.

## Code sketch: app-specific "create" button with fixed roles

```tsx
const { deployEscrow } = useInitializeEscrow()
const { run } = useEscrowTx()

const hire = (freelancer: string, job: Job) =>
	run("Hire freelancer", () =>
		deployEscrow(
			{
				signer: address!,
				engagementId: `job-${job.id}`,
				title: job.title,
				description: job.description,
				platformFee: 1,
				trustline: { address: USDC.address, symbol: USDC.symbol },
				roles: {
					approver: address!,
					releaseSigner: address!,
					serviceProvider: freelancer,
					disputeResolver: address!,
					platformAddress: address!,
				},
				milestones: job.milestones.map((m) => ({
					description: m.title,
					amount: m.usdc,
					receiver: freelancer,
				})),
			},
			"multi-release",
		),
	)
```
