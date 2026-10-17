import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import {
	fetchBusinessProfiles,
	type BusinessProfileRow,
	type Store,
	type StoreCategory,
} from "../lib/supabase"
import { shortAddress } from "./money"
import { useStores } from "./useStores"

const EXAMPLE_PREFIX = "Tienda de ejemplo: "

/** A business as the app shows it, from the directory or its own profile. */
export interface Business {
	/** Its Stellar address when known, else the directory id as text. Used in URLs. */
	ref: string
	wallet: string | null
	name: string
	category: StoreCategory
	tagline: string | null
	/** Long text about the business: its history. */
	story: string | null
	description: string
	city: string | null
	province: string | null
	tags: string[]
	rating: number | null
	sinceYear: number | null
	featured: boolean
	instagram: string | null
	/** Made-up directory data for the demo. */
	example: boolean
}

function fromStore(s: Store): Business {
	return {
		ref: s.wallet ?? String(s.id),
		wallet: s.wallet,
		name: s.name.startsWith(EXAMPLE_PREFIX)
			? s.name.slice(EXAMPLE_PREFIX.length)
			: s.name,
		category: s.category,
		tagline: s.tagline ?? null,
		story: s.story ?? null,
		description: s.description,
		city: s.city ?? null,
		province: s.province ?? null,
		tags: s.tags ?? [],
		rating: typeof s.rating === "number" ? s.rating : null,
		sinceYear: s.since_year ?? null,
		featured: Boolean(s.featured),
		instagram: s.instagram ?? null,
		example: s.name.startsWith(EXAMPLE_PREFIX),
	}
}

function fromProfile(p: BusinessProfileRow): Business {
	return {
		ref: p.wallet,
		wallet: p.wallet,
		name: p.name,
		category: p.category,
		tagline: p.tagline,
		story: p.story,
		description: p.tagline ?? "",
		city: p.city,
		province: p.province,
		tags: [],
		rating: null,
		sinceYear: p.since_year,
		featured: false,
		instagram: p.instagram,
		example: false,
	}
}

export const PROFILES_KEY = ["business-profiles"] as const

/**
 * Every business: the directory (read-only, `stores`) plus the profiles the
 * businesses made themselves (`business_profiles`). A directory row with the
 * same address wins. Either source can fail without breaking the other.
 */
export function useBusinesses() {
	const stores = useStores()
	const profiles = useQuery({
		queryKey: PROFILES_KEY,
		queryFn: fetchBusinessProfiles,
		retry: 1,
		staleTime: 30_000,
	})

	const businesses = useMemo(() => {
		const fromDirectory = (stores.data ?? []).map(fromStore)
		const known = new Set(fromDirectory.flatMap((b) => (b.wallet ? [b.wallet] : [])))
		const own = (profiles.data ?? [])
			.filter((p) => !known.has(p.wallet))
			.map(fromProfile)
		return [...fromDirectory, ...own]
	}, [stores.data, profiles.data])

	return {
		businesses,
		/** The business behind a URL ref (address or directory id). */
		find: (ref: string) => businesses.find((b) => b.ref === ref),
		/** The business that owns an address, if it has a profile. */
		byWallet: (wallet: string) => businesses.find((b) => b.wallet === wallet),
		/** Its name, or the short address when it has no profile yet. */
		nameOf: (wallet: string) =>
			businesses.find((b) => b.wallet === wallet)?.name ??
			`Negocio ${shortAddress(wallet)}`,
		isPending: stores.isPending && profiles.isPending,
		isError: stores.isError && profiles.isError,
	}
}
