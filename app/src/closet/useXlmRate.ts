import { useQuery } from "@tanstack/react-query"

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

/**
 * The live XLM price in dollars, only to show a small conversion next to the
 * prices. Prices are set and paid in XLM; with no live rate nothing is shown.
 */
export function useXlmRate() {
	const query = useQuery({
		queryKey: ["xlm-rate"],
		queryFn: fetchRate,
		staleTime: 5 * 60_000,
		retry: false,
	})
	return { rate: query.data ?? null }
}

/** A short dollar amount for an XLM amount, like `≈ $4.30 USD`, or "" without a rate. */
export function usdText(xlm: number, rate: number | null) {
	if (rate === null) return ""
	const usd = xlm * rate
	return `≈ $${usd.toLocaleString("es", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	})} USD`
}
