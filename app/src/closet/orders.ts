/**
 * Purchases made from this browser. The payment itself is on the network (the
 * hash links to it); this list only remembers what was bought so the orders
 * page can show it. It holds no personal data and no codes.
 */
export interface Order {
	/** Item number in the contract, the one the store hands a code for. */
	itemId: number
	name: string
	store: string
	/** Price paid, in XLM. */
	priceXlm: number
	hash: string
	date: number
}

const key = (address: string) => `closet:orders:${address}`

/**
 * Reads one saved entry. Older versions saved `amountXlm` as text next to a
 * `priceUsd` that no longer exists, so both are tolerated here.
 */
function normalize(raw: unknown): Order | null {
	if (!raw || typeof raw !== "object") return null
	const o = raw as Record<string, unknown>
	const itemId = Number(o.itemId)
	if (!Number.isFinite(itemId) || typeof o.hash !== "string" || !o.hash) {
		return null
	}
	const price = Number(o.priceXlm ?? o.amountXlm)
	return {
		itemId,
		name: typeof o.name === "string" ? o.name : "",
		store: typeof o.store === "string" ? o.store : "",
		priceXlm: Number.isFinite(price) ? price : 0,
		hash: o.hash,
		date: Number(o.date) || 0,
	}
}

export function loadOrders(address: string): Order[] {
	try {
		const raw = localStorage.getItem(key(address))
		const list: unknown = raw ? JSON.parse(raw) : []
		if (!Array.isArray(list)) return []
		return list.flatMap((entry) => {
			const order = normalize(entry)
			return order ? [order] : []
		})
	} catch {
		return []
	}
}

export function saveOrder(address: string, order: Order) {
	try {
		const next = [order, ...loadOrders(address)]
		localStorage.setItem(key(address), JSON.stringify(next))
	} catch {
		// Private mode: the payment is still on the network, just not listed here.
	}
}
