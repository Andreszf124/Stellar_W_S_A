/**
 * Purchases made from this browser. An XLM payment is on the network (the hash
 * links to it); a card payment is simulated and has no hash. This list only
 * remembers what was bought so the orders page can show it. It holds no
 * secrets and no claim codes; the shipping details stay in this browser.
 */
export type PayMethod = "xlm" | "demo"

export interface Shipping {
	name: string
	address: string
}

export interface Order {
	/** Unique id of the order (the hash for older orders). */
	id: string
	/** Item number in the contract, the one the store hands a code for. */
	itemId: number
	name: string
	store: string
	method: PayMethod
	/** XLM paid on the network; in a simulated (demo) payment, the amount shown. */
	priceXlm: number
	/** Transaction hash; empty for a simulated (demo) payment. */
	hash: string
	date: number
	shipping?: Shipping
}

const key = (address: string) => `closet:orders:${address}`

/** A short, readable order number: `MD` + time in base 36. */
export const newOrderId = () => `MD${Date.now().toString(36).toUpperCase()}`

/**
 * Reads one saved entry. Older versions saved `amountXlm` as text and had no id
 * or method: all tolerated. Entries from the removed card option are skipped.
 */
function normalize(raw: unknown): Order | null {
	if (!raw || typeof raw !== "object") return null
	const o = raw as Record<string, unknown>
	const itemId = Number(o.itemId)
	if (!Number.isFinite(itemId)) return null
	if (o.method === "card") return null
	const method: PayMethod = o.method === "demo" ? "demo" : "xlm"
	const hash = typeof o.hash === "string" ? o.hash : ""
	if (method === "xlm" && !hash) return null
	const id = typeof o.id === "string" && o.id ? o.id : hash
	if (!id) return null
	const price = Number(o.priceXlm ?? o.amountXlm)
	const shipping = o.shipping as Partial<Shipping> | undefined
	return {
		id,
		itemId,
		name: typeof o.name === "string" ? o.name : "",
		store: typeof o.store === "string" ? o.store : "",
		method,
		priceXlm: Number.isFinite(price) ? price : 0,
		hash,
		date: Number(o.date) || 0,
		shipping:
			shipping &&
			typeof shipping.name === "string" &&
			typeof shipping.address === "string"
				? { name: shipping.name, address: shipping.address }
				: undefined,
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

/** Shipping progress is simulated from the time since the order. */
export function shippingStatus(
	order: Order,
): "processing" | "shipped" | "delivered" {
	const minutes = (Date.now() - order.date) / 60_000
	if (minutes < 2) return "processing"
	if (minutes < 10) return "shipped"
	return "delivered"
}
