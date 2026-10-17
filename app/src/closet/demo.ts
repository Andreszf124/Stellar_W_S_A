import { useWallet } from "../hooks/useWallet"
import { type CategoryTag } from "./catalog"
import { type ClosetItem } from "./closetService"

/**
 * Demo mode: with no wallet connected, a visitor can still go through the whole
 * flow (buy, see the order, wear the item). Nothing goes to the network: the
 * "NFT" is a local item saved in this browser, and nothing is signed or paid.
 * Connecting a wallet switches to the real flow on Stellar Testnet.
 */
export const DEMO_ADDRESS = "demo"

const ITEMS_KEY = "closet:demo:items"

/** Demo item numbers start high so they never look like a real contract id. */
const FIRST_DEMO_ID = 9_000_001

export const isDemoAddress = (address: string | undefined) =>
	address === DEMO_ADDRESS

/** Who is shopping: the connected wallet, or the demo visitor. */
export function useAccount() {
	const { address } = useWallet()
	return {
		address: address ?? DEMO_ADDRESS,
		/** The connected wallet, if any. */
		wallet: address ?? undefined,
		isDemo: !address,
	}
}

export function loadDemoItems(): ClosetItem[] {
	try {
		const raw = localStorage.getItem(ITEMS_KEY)
		const list: unknown = raw ? JSON.parse(raw) : []
		if (!Array.isArray(list)) return []
		return list.flatMap((raw: unknown) => {
			const entry = raw as Partial<ClosetItem> | null
			return typeof entry?.id === "number" && typeof entry.name === "string"
				? [
						{
							id: entry.id,
							name: entry.name,
							category: (entry.category ?? "Clothing") as CategoryTag,
							owner: DEMO_ADDRESS,
							store: DEMO_ADDRESS,
							claimed: true,
						},
					]
				: []
		})
	} catch {
		return []
	}
}

/** Gives the demo visitor a new item and returns it. */
export function addDemoItem(name: string, category: CategoryTag): ClosetItem {
	const items = loadDemoItems()
	const id = Math.max(FIRST_DEMO_ID - 1, ...items.map((i) => i.id)) + 1
	const item: ClosetItem = {
		id,
		name,
		category,
		owner: DEMO_ADDRESS,
		store: DEMO_ADDRESS,
		claimed: true,
	}
	try {
		localStorage.setItem(ITEMS_KEY, JSON.stringify([...items, item]))
	} catch {
		// Private mode: the demo item just won't be remembered.
	}
	return item
}

/** Forgets everything from the demo: items, orders, what the avatar wears. */
export function resetDemo() {
	try {
		for (const key of [
			ITEMS_KEY,
			`closet:orders:${DEMO_ADDRESS}`,
			`closet:equipped:${DEMO_ADDRESS}`,
			`closet:look:${DEMO_ADDRESS}`,
		]) {
			localStorage.removeItem(key)
		}
	} catch {
		// Nothing to clear.
	}
}
