import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { type Furnishing, type Wear } from "./avatarArt"
import { findModel } from "./catalog"
import { itemsOf, type ClosetItem } from "./closetService"
import { completedTaskIds, levelOf, levelProgress, pointsFor } from "./tasks"

type Equipped = Record<string, number>

const storageKey = (address: string) => `closet:equipped:${address}`

function load(address: string): Equipped {
	try {
		const raw = localStorage.getItem(storageKey(address))
		return raw ? (JSON.parse(raw) as Equipped) : {}
	} catch {
		return {}
	}
}

function save(address: string, equipped: Equipped) {
	try {
		localStorage.setItem(storageKey(address), JSON.stringify(equipped))
	} catch {
		// Private mode: the avatar just won't remember what it wears.
	}
}

/**
 * The owner's items from the contract, what the avatar wears (saved in this
 * browser) and the level that comes from the tasks they completed.
 */
export function useCloset(address: string) {
	const query = useQuery({
		queryKey: ["closet", address],
		queryFn: () => itemsOf(address),
	})
	const [equipped, setEquipped] = useState<Equipped>(() => load(address))

	const items: ClosetItem[] = query.data ?? []

	// Only items that are still owned can be worn.
	const wear: Wear[] = []
	const wornIds = new Set<number>()
	for (const [slot, id] of Object.entries(equipped)) {
		const item = items.find((i) => i.id === id)
		const model = item && findModel(item.name)
		if (item && model && model.slot === slot) {
			wear.push({ slot: model.slot, key: model.key, color: model.color })
			wornIds.add(item.id)
		}
	}

	const furniture: Furnishing[] = items.flatMap((item) => {
		const model = findModel(item.name)
		return model?.slot === "furniture"
			? [{ key: model.key, color: model.color }]
			: []
	})

	const toggleEquip = (item: ClosetItem) => {
		const model = findModel(item.name)
		if (!model || model.slot === "furniture") return
		const next = { ...equipped }
		if (next[model.slot] === item.id) delete next[model.slot]
		else next[model.slot] = item.id
		setEquipped(next)
		save(address, next)
	}

	const done = completedTaskIds({
		itemCount: items.length,
		equippedCount: wear.length,
		furnitureCount: furniture.length,
	})
	const points = pointsFor(done)

	return {
		items,
		isLoading: query.isLoading,
		error: query.error,
		wear,
		wornIds,
		furniture,
		toggleEquip,
		done,
		points,
		level: levelOf(points),
		progress: levelProgress(points),
	}
}
