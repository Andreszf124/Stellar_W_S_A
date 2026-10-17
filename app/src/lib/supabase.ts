export type StoreCategory = "ropa" | "muebles" | "ambos"

export type Store = {
	id: number
	name: string
	category: StoreCategory
	description: string
	wallet: string | null
	// Optional columns: may not exist yet in the table.
	city?: string | null
	province?: string | null
	tagline?: string | null
	story?: string | null
	tags?: string[] | null
	rating?: number | null
	since_year?: number | null
	featured?: boolean | null
	instagram?: string | null
}

/** A business that made its own profile, identified by its Stellar address. */
export type BusinessProfileRow = {
	wallet: string
	name: string
	category: StoreCategory
	tagline: string | null
	story: string | null
	city: string | null
	province: string | null
	instagram: string | null
	since_year: number | null
	created_at: string
}
export type NewBusinessProfile = Omit<BusinessProfileRow, "created_at">

/** A product a business made from a base design (`model_key` in catalog.ts). */
export type ProductRow = {
	id: number
	store_wallet: string
	name: string
	model_key: string
	color: string
	price_xlm: number
	description: string
	created_at: string
}
export type NewProduct = Omit<ProductRow, "id" | "created_at">

/** What a person has to do to complete a mission. */
export type MissionKind =
	| "items_total"
	| "items_from_store"
	| "furniture"
	| "equipped"

/** A mission a business created: completing it unlocks `reward_product`. */
export type MissionRow = {
	id: number
	store_wallet: string
	title: string
	description: string
	kind: MissionKind
	target: number
	reward_product: string
	created_at: string
}
export type NewMission = Omit<MissionRow, "id" | "created_at">

export class SupabaseError extends Error {
	status: number
	constructor(message: string, status: number) {
		super(message)
		this.status = status
	}
}

/** True when a table has not been created yet (the SQL was not applied). */
export const isMissingTable = (e: unknown) =>
	e instanceof SupabaseError && e.status === 404

async function rest<T>(path: string, init?: RequestInit): Promise<T> {
	const url = import.meta.env.PUBLIC_SUPABASE_URL
	const key = import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY
	if (!url || !key) {
		throw new SupabaseError(
			"Missing PUBLIC_SUPABASE_URL or PUBLIC_SUPABASE_PUBLISHABLE_KEY",
			0,
		)
	}
	const response = await fetch(`${url}/rest/v1/${path}`, {
		...init,
		headers: {
			apikey: key,
			"Content-Type": "application/json",
			...init?.headers,
		},
	})
	if (!response.ok) {
		throw new SupabaseError(
			`Supabase request failed: ${response.status}`,
			response.status,
		)
	}
	return (response.status === 204 ? undefined : await response.json()) as T
}

const insert = <T>(table: string, row: object) =>
	rest<T[]>(table, {
		method: "POST",
		headers: { Prefer: "return=representation" },
		body: JSON.stringify(row),
	}).then((rows) => rows[0] as T)

/** Reads the public store directory from Supabase (read-only, public key). */
export const fetchStores = async (): Promise<Store[]> => {
	const rows = await rest<Store[]>("stores?select=*&order=id")
	// Featured first (if the column exists), then by id.
	return [...rows].sort(
		(a, b) =>
			Number(b.featured ?? false) - Number(a.featured ?? false) || a.id - b.id,
	)
}

export const fetchBusinessProfiles = () =>
	rest<BusinessProfileRow[]>("business_profiles?select=*&order=created_at")
export const createBusinessProfile = (row: NewBusinessProfile) =>
	insert<BusinessProfileRow>("business_profiles", row)

export const fetchProductRows = () =>
	rest<ProductRow[]>("products?select=*&order=id.desc")
export const createProductRow = (row: NewProduct) =>
	insert<ProductRow>("products", row)

export const fetchMissionRows = () =>
	rest<MissionRow[]>("missions?select=*&order=id.desc")
export const createMissionRow = (row: NewMission) =>
	insert<MissionRow>("missions", row)
