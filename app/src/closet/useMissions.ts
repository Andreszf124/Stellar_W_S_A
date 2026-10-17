import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { fetchMissionRows, isMissingTable } from "../lib/supabase"
import { itemsOf } from "./closetService"
import {
	EMPTY_PROGRESS,
	toMission,
	type Mission,
	type UserProgress,
} from "./missions"
import { useProducts } from "./useProducts"

export const MISSIONS_KEY = ["missions"] as const

/** The missions businesses created. Failures leave the list empty. */
export function useMissions() {
	const query = useQuery({
		queryKey: MISSIONS_KEY,
		queryFn: fetchMissionRows,
		retry: 1,
		staleTime: 30_000,
	})
	const missions: Mission[] = useMemo(
		() => (query.data ?? []).map(toMission),
		[query.data],
	)
	return {
		missions,
		isLoading: query.isLoading,
		error: query.error,
		/** The SQL that creates the `missions` table was not applied yet. */
		missingTable: isMissingTable(query.error),
	}
}

/** How many of the owned items are worn, from what this browser saved. */
function equippedCount(address: string, ownedIds: Set<number>) {
	try {
		const raw = localStorage.getItem(`closet:equipped:${address}`)
		const equipped = raw ? (JSON.parse(raw) as Record<string, number>) : {}
		return Object.values(equipped).filter((id) => ownedIds.has(id)).length
	} catch {
		return 0
	}
}

/**
 * What the person has, to check missions against. Shares the cache with the
 * closet (`["closet", address]`). Without an address the progress is empty.
 */
export function useUserProgress(address?: string): {
	progress: UserProgress
	isLoading: boolean
} {
	const { find } = useProducts()
	const query = useQuery({
		queryKey: ["closet", address],
		queryFn: () => itemsOf(address as string),
		enabled: Boolean(address),
	})
	const items = query.data
	const progress = useMemo(() => {
		if (!address || !items) return EMPTY_PROGRESS
		return {
			items,
			equippedCount: equippedCount(address, new Set(items.map((i) => i.id))),
			furnitureCount: items.filter(
				(i) => find(i.name, i.store)?.slot === "furniture",
			).length,
		}
		// `find` changes identity every render but depends only on the products
		// query, so recompute when the items or the address change.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address, items])
	return { progress, isLoading: Boolean(address) && query.isLoading }
}
