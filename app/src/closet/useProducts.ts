import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import {
	fetchProductRows,
	isMissingTable,
	type ProductRow,
} from "../lib/supabase"
import { lookupProduct, MODELS, type Product } from "./catalog"

const HEX = /^#[0-9a-fA-F]{6}$/

/** A database row as a product, or null if its base design no longer exists. */
function toProduct(row: ProductRow): Product | null {
	const base = MODELS.find((m) => m.key === row.model_key)
	if (!base) return null
	return {
		...base,
		name: row.name,
		color: HEX.test(row.color) ? row.color : base.color,
		priceXlm: Number(row.price_xlm),
		desc: row.description,
		store: row.store_wallet,
	}
}

export const PRODUCTS_KEY = ["products"] as const

/**
 * Every product the app knows: the built-in models plus the custom products
 * businesses made. Failures (or a table that was not created yet) leave just
 * the built-in models, so the app keeps working.
 */
export function useProducts() {
	const query = useQuery({
		queryKey: PRODUCTS_KEY,
		queryFn: fetchProductRows,
		retry: 1,
		staleTime: 30_000,
	})
	const custom = useMemo(
		() =>
			(query.data ?? []).flatMap((row) => {
				const product = toProduct(row)
				return product ? [product] : []
			}),
		[query.data],
	)
	const products = useMemo<Product[]>(() => [...MODELS, ...custom], [custom])
	return {
		/** Built-in models first, then the custom products (newest first). */
		products,
		/** Only the custom products. */
		custom,
		/** The product an on-chain item name (and store) refers to. */
		find: (name: string, store?: string) =>
			lookupProduct(products, name, store),
		isLoading: query.isLoading,
		error: query.error,
		/** The SQL that creates the `products` table was not applied yet. */
		missingTable: isMissingTable(query.error),
	}
}
