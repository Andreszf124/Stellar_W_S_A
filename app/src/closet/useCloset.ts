import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import {
	DEFAULT_LOOK,
	HAIR_COLORS,
	SKIN_TONES,
	type Furnishing,
	type Look,
	type Wear,
} from "./avatarArt"
import { findModel } from "./catalog"
import { itemsOf, type ClosetItem } from "./closetService"
import { isDemoAddress, loadDemoItems } from "./demo"

type Equipped = Record<string, number>

const storageKey = (address: string) => `closet:equipped:${address}`
const lookKey = (address: string) => `closet:look:${address}`

/** What was saved in this browser, ignoring anything that is not a known color. */
function loadLook(address: string): Look {
	try {
		const raw = localStorage.getItem(lookKey(address))
		const saved = raw ? (JSON.parse(raw) as Partial<Look>) : {}
		return {
			skin: SKIN_TONES.find((c) => c === saved.skin) ?? DEFAULT_LOOK.skin,
			hair: HAIR_COLORS.find((c) => c === saved.hair) ?? DEFAULT_LOOK.hair,
		}
	} catch {
		return DEFAULT_LOOK
	}
}

function saveLook(address: string, look: Look) {
	try {
		localStorage.setItem(lookKey(address), JSON.stringify(look))
	} catch {
		// Private mode: the avatar just won't remember its colors.
	}
}

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
 * The owner's items from the contract and what the avatar wears (saved in this
 * browser). Without an address it still returns the default avatar, so the shop
 * can show one before anyone connects a wallet.
 */
export function useCloset(address: string | undefined) {
	const query = useQuery({
		queryKey: ["closet", address],
		// The demo visitor's items are local; a wallet's come from the contract.
		queryFn: () =>
			isDemoAddress(address) ? loadDemoItems() : itemsOf(address ?? ""),
		enabled: Boolean(address),
	})
	const key = address ?? ""
	const find = (item: ClosetItem) => findModel(item.name)
	const [equipped, setEquipped] = useState<Equipped>(() => load(key))
	const [look, setLookState] = useState<Look>(() => loadLook(key))

	const setLook = (change: Partial<Look>) => {
		const next = { ...look, ...change }
		setLookState(next)
		if (address) saveLook(address, next)
	}

	const items: ClosetItem[] = query.data ?? []

	// Only items that are still owned can be worn.
	const wear: Wear[] = []
	const wornIds = new Set<number>()
	for (const [slot, id] of Object.entries(equipped)) {
		const item = items.find((i) => i.id === id)
		const model = item && find(item)
		if (item && model && model.slot === slot) {
			wear.push({ slot: model.slot, key: model.key, color: model.color })
			wornIds.add(item.id)
		}
	}

	const furniture: Furnishing[] = items.flatMap((item) => {
		const model = find(item)
		return model?.slot === "furniture"
			? [{ key: model.key, color: model.color }]
			: []
	})

	const toggleEquip = (item: ClosetItem) => {
		const model = find(item)
		if (!model || model.slot === "furniture" || !address) return
		const next = { ...equipped }
		if (next[model.slot] === item.id) delete next[model.slot]
		else next[model.slot] = item.id
		setEquipped(next)
		save(address, next)
	}

	return {
		items,
		/** The design an owned item refers to. */
		find,
		isLoading: query.isLoading,
		isFetching: query.isFetching,
		error: query.error,
		refetch: query.refetch,
		wear,
		wornIds,
		/** Furniture that furnishes the home. */
		furniture,
		toggleEquip,
		look,
		setLook,
	}
}
