import { useQuery } from "@tanstack/react-query"

/** Dollars per XLM used when the live price can't be fetched. */
export const FALLBACK_RATE = 0.4

/** The price of 1 XLM in dollars, or `null` if the service didn't answer in time. */
async function fetchRate(): Promise<number | null> {
	try {
		const response = await fetch(
			"https://api.coingecko.com/api/v3/simple/price?ids=stellar&vs_currencies=usd",
			{ signal: AbortSignal.timeout(4000) },
		)
		const usd = ((await response.json()) as { stellar?: { usd?: number } })
			.stellar?.usd
		return typeof usd === "number" && usd > 0 ? usd : null
	} catch {
		return null
	}
}

/** Live XLM price with a fixed fallback, so the shop always has a number. */
export function useXlmRate() {
	const query = useQuery({
		queryKey: ["xlm-rate"],
		queryFn: fetchRate,
		staleTime: 5 * 60_000,
		retry: false,
	})
	const live = typeof query.data === "number"
	return { rate: query.data ?? FALLBACK_RATE, live }
}

/** Dollars to XLM, rounded up to the cent so the store is never underpaid. */
export const toXlm = (usd: number, rate: number) =>
	(Math.ceil((usd / rate) * 100) / 100).toFixed(2)
