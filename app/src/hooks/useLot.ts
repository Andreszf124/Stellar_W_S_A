import { useEffect, useState } from "react"
import { toFriendlyMessage } from "../services/errors"
import { lotService, type Lot } from "../services/lotService"

type Settled =
	| { id: number; lot: Lot; error?: undefined }
	| { id: number; lot?: undefined; error: string }

export type LotQuery =
	| { status: "idle" }
	| { status: "loading" }
	| { status: "success"; lot: Lot }
	| { status: "error"; message: string }

/** Loads a lot by id through `lotService`. `id` null means nothing to load. */
export function useLot(id: number | null): LotQuery {
	const [settled, setSettled] = useState<Settled | null>(null)

	useEffect(() => {
		if (id === null) return
		let cancelled = false
		lotService
			.getLot(id)
			.then((lot) => !cancelled && setSettled({ id, lot }))
			.catch(
				(e: unknown) =>
					!cancelled && setSettled({ id, error: toFriendlyMessage(e) }),
			)
		return () => {
			cancelled = true
		}
	}, [id])

	if (id === null) return { status: "idle" }
	if (!settled || settled.id !== id) return { status: "loading" }
	if (settled.error !== undefined) {
		return { status: "error", message: settled.error }
	}
	return { status: "success", lot: settled.lot }
}
