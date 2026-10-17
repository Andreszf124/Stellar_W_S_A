// import { granoDeOrigen } from "@stellar-scaffold/app-lib/clients"
// TODO: when the generated client exists, implement `LotService` on top of
// `granoDeOrigen` (see signAndSend flow in GuessTheNumber) and export it as
// `lotService`. UI code only depends on the `LotService` interface below.
import { LotError } from "./errors"

export interface Lot {
	id: number
	owner: string
	farm: string
	harvest: string
	process: string
	created_at: bigint
}

export interface RegisterLotInput {
	owner: string
	farm: string
	harvest: string
	process: string
}

export interface LotService {
	registerLot(input: RegisterLotInput): Promise<number>
	getLot(id: number): Promise<Lot>
	/** `caller` is the connected wallet; the real client derives it from the signer. */
	transferLot(id: number, newOwner: string, caller: string): Promise<void>
	lotCount(): Promise<number>
}

const STELLAR_ADDRESS = /^G[A-Z2-7]{55}$/

export const isValidAddress = (value: string) => STELLAR_ADDRESS.test(value)

const MOCK_LATENCY_MS = 600
const delay = () => new Promise((r) => setTimeout(r, MOCK_LATENCY_MS))

// Fake, well-formed addresses for demo data only.
const DEMO_PRODUCER_A =
	"GDEMOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
const DEMO_PRODUCER_B =
	"GDEMOBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"

const nowSeconds = () => BigInt(Math.floor(Date.now() / 1000))

function createMockLotService(): LotService {
	const lots = new Map<number, Lot>()
	const seed: Omit<Lot, "id">[] = [
		{
			owner: DEMO_PRODUCER_A,
			farm: "Finca La Esperanza, Tarrazú",
			harvest: "Cosecha 2025/2026",
			process: "Lavado",
			created_at: 1_736_000_000n,
		},
		{
			owner: DEMO_PRODUCER_B,
			farm: "Finca El Mirador, Naranjo",
			harvest: "Cosecha 2025/2026",
			process: "Honey",
			created_at: 1_738_000_000n,
		},
		{
			owner: DEMO_PRODUCER_A,
			farm: "Finca Los Cedros, Tres Ríos",
			harvest: "Cosecha 2024/2025",
			process: "Natural",
			created_at: 1_716_000_000n,
		},
	]
	seed.forEach((lot, i) => lots.set(i + 1, { id: i + 1, ...lot }))

	return {
		async registerLot({ owner, farm, harvest, process }) {
			await delay()
			if (!farm.trim() || !harvest.trim() || !process.trim()) {
				throw new LotError("InvalidInput", "Complete finca, cosecha y proceso.")
			}
			const id = lots.size + 1
			lots.set(id, {
				id,
				owner,
				farm: farm.trim(),
				harvest: harvest.trim(),
				process: process.trim(),
				created_at: nowSeconds(),
			})
			return id
		},

		async getLot(id) {
			await delay()
			const lot = lots.get(id)
			if (!lot) throw new LotError("LotNotFound")
			return { ...lot }
		},

		async transferLot(id, newOwner, caller) {
			await delay()
			const lot = lots.get(id)
			if (!lot) throw new LotError("LotNotFound")
			if (lot.owner !== caller) throw new LotError("NotOwner")
			if (lot.owner === newOwner) throw new LotError("SameOwner")
			lots.set(id, { ...lot, owner: newOwner })
		},

		async lotCount() {
			await delay()
			return lots.size
		},
	}
}

export const mockLotService: LotService = createMockLotService()

// Swap for the real client adapter once the contract is deployed.
export const lotService: LotService = mockLotService
