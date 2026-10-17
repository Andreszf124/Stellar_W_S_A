export type StoreCategory = "ropa" | "muebles" | "ambos"

export type Store = {
	id: number
	name: string
	category: StoreCategory
	description: string
	wallet: string | null
}

/** Reads the public store directory from Supabase (read-only, public key). */
export const fetchStores = async (): Promise<Store[]> => {
	const url = import.meta.env.PUBLIC_SUPABASE_URL
	const key = import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY
	if (!url || !key) {
		throw new Error(
			"Missing PUBLIC_SUPABASE_URL or PUBLIC_SUPABASE_PUBLISHABLE_KEY",
		)
	}
	const response = await fetch(
		`${url}/rest/v1/stores?select=id,name,category,description,wallet&order=id`,
		{ headers: { apikey: key } },
	)
	if (!response.ok) {
		throw new Error(`Supabase request failed: ${response.status}`)
	}
	return (await response.json()) as Store[]
}
