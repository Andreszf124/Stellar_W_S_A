# Idea bank (each fits in a workshop)

Every idea lists: escrow type · roles · optional Soroban contract. ⭐ = good
first project.

1. ⭐ **Chamba / gig board**: clients post jobs, freelancers apply, hire =
   multi-release escrow per deliverable. · approver/releaseSigner = client,
   serviceProvider + receivers = freelancer, resolver = platform · contract:
   `JobBoard` (post, apply, hire→store escrow id) + reputation.
2. ⭐ **Rental deposit**: tenant locks the deposit, landlord approves the refund
   or disputes for damages. · single-release, receiver = tenant · no contract
   needed (title = property address).
3. **Hackathon bounties**: sponsor funds prizes, judges approve, winners get
   paid per milestone. · multi-release, one milestone per prize/winner ·
   contract: submissions + judge votes.
4. **Group trip / vaquita**: friends each fund a shared escrow; the organizer
   gets paid per booking (flights, hotel) once the group approves. ·
   multi-release, many funders.
5. **Pre-order / crowdfunding**: backers fund; the maker unlocks money per
   production milestone; refund via dispute if it fails. · multi-release ·
   contract: backer list + rewards NFT.
6. **Grants in tranches**: DAO/community funds a project, releases per report. ·
   multi-release · contract: proposals + votes (approver = multisig/committee
   wallet).
7. **Freelancer reputation passport**: profile page showing every escrow you
   completed + reviews from `contracts/reputation`. · reads only from indexer +
   contract.
8. **P2P marketplace (secondhand items)**: buyer funds, seller ships with
   tracking evidence, buyer approves on delivery. · single-release · contract:
   listings.
9. **Tutoring / classes pack**: student prepays 10 classes, teacher marks each
   class done, student approves → paid per class. · multi-release (10
   milestones).
10. **Event tickets with refund guarantee**: attendees' payments sit in escrow
    until the event happens; cancelled event → resolver refunds. ·
    single-release per order.
11. **Wedding/event vendor payments**: deposit + final payment milestones for
    each vendor.
12. **Bug bounty board**: maintainers fund bounties per issue; PR merged =
    evidence; approve + release. · multi-release · contract: issue registry
    linking GitHub issue ↔ escrow.
13. **Remittance with conditions**: family member abroad funds school fees
    released when the school confirms enrollment (approver = school). ·
    single-release.
14. **Proof-of-work NFT badge**: after a released escrow, mint an NFT
    certificate (enable `nft_enumerable_example` in `environments.toml` or write
    a minimal NFT).

Spicy add-ons (pick one if there's time): reputation-gated hiring (min score),
events feed via `useSubscription`, shareable escrow links (`/escrows?id=C…`), QR
code to fund an escrow, "agent mode": a page that explains each escrow state in
plain language.
