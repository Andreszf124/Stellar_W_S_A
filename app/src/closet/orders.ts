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
	priceUsd: number
	amountXlm: string
	hash: string
	date: number
}

const key = (address: string) => `closet:orders:${address}`

export function loadOrders(address: string): Order[] {
	try {
		const raw = localStorage.getItem(key(address))
		const list: unknown = raw ? JSON.parse(raw) : []
		return Array.isArray(list) ? (list as Order[]) : []
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
