/** XLM is the reference currency of the whole app: every price is in XLM. */
export const formatXlm = (amount: number) =>
	`${amount.toLocaleString("es", { maximumFractionDigits: 2 })} XLM`

/** The amount as Stellar wants it: a string with at most 7 decimals. */
export const amountString = (amount: number) => amount.toFixed(2)

/** `GABC…WXYZ`, for showing an address where there is no name to show. */
export const shortAddress = (address: string) =>
	address.length > 12 ? `${address.slice(0, 4)}…${address.slice(-4)}` : address
