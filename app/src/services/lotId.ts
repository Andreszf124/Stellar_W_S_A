/** Lot ids are u32 in the contract, and the first one is 1. */
const MAX_LOT_ID = 4_294_967_295

/** Returns a valid lot id, or null when the text is not one. */
export const parseLotId = (value: string | undefined): number | null => {
	if (!value || !/^\d+$/.test(value)) return null
	const id = Number(value)
	return Number.isSafeInteger(id) && id > 0 && id <= MAX_LOT_ID ? id : null
}
