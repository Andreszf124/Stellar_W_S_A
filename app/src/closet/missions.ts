import { type MissionKind, type MissionRow } from "../lib/supabase"
import { type ClosetItem } from "./closetService"

/** A mission a business made: completing it unlocks one of its products. */
export interface Mission {
	id: number
	/** Address of the business that made it. */
	store: string
	title: string
	description: string
	kind: MissionKind
	target: number
	/** Exact name of the product it unlocks. */
	rewardProduct: string
}

export const toMission = (row: MissionRow): Mission => ({
	id: row.id,
	store: row.store_wallet,
	title: row.title,
	description: row.description,
	kind: row.kind,
	target: row.target,
	rewardProduct: row.reward_product,
})

/** The kinds a business can pick, with the text for its form. */
export const MISSION_KINDS: { kind: MissionKind; label: string }[] = [
	{ kind: "items_from_store", label: "Reclamar ítems de este negocio" },
	{ kind: "items_total", label: "Reclamar ítems de cualquier negocio" },
	{ kind: "furniture", label: "Tener muebles en su hogar" },
	{ kind: "equipped", label: "Tener prendas puestas en su avatar" },
]

/** What the person has to do, as a sentence ("Reclame 3 ítems de este negocio"). */
export function describeRequirement(m: Pick<Mission, "kind" | "target">) {
	const n = m.target
	switch (m.kind) {
		case "items_from_store":
			return `Reclame ${n} ítem${n === 1 ? "" : "s"} de este negocio`
		case "items_total":
			return `Reclame ${n} ítem${n === 1 ? "" : "s"} de cualquier negocio`
		case "furniture":
			return `Tenga ${n} mueble${n === 1 ? "" : "s"} en su hogar`
		case "equipped":
			return `Tenga ${n} prenda${n === 1 ? "" : "s"} puesta${n === 1 ? "" : "s"} en su avatar`
	}
}

/** What a person has, read from the network and from this browser. */
export interface UserProgress {
	/** Claimed items the person owns. */
	items: ClosetItem[]
	equippedCount: number
	furnitureCount: number
}

export const EMPTY_PROGRESS: UserProgress = {
	items: [],
	equippedCount: 0,
	furnitureCount: 0,
}

/** How far a person is in a mission. Checked against what they really own. */
export function missionProgress(m: Mission, p: UserProgress) {
	const current =
		m.kind === "items_total"
			? p.items.length
			: m.kind === "items_from_store"
				? p.items.filter((i) => i.store === m.store).length
				: m.kind === "furniture"
					? p.furnitureCount
					: p.equippedCount
	return {
		current: Math.min(current, m.target),
		target: m.target,
		done: current >= m.target,
	}
}

/**
 * The first unfinished mission that locks this product of this store, or
 * undefined when the product is free for this person.
 *
 * The lock is checked in the app, not on the network: it guides honest
 * buyers, it does not stop someone who skips the app.
 */
export function lockingMission(
	missions: Mission[],
	progress: UserProgress,
	productName: string,
	store: string,
): Mission | undefined {
	return missions.find(
		(m) =>
			m.rewardProduct === productName &&
			m.store === store &&
			!missionProgress(m, progress).done,
	)
}
