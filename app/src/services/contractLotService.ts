import { signTransaction } from "@stellar-scaffold/app-lib"
import { granoDeOrigen } from "@stellar-scaffold/app-lib/clients"
import { LotError, type LotErrorCode } from "./errors"
import  { type Lot, type LotService } from "./lotService"

/** Contract error numbers, as declared in contracts/grano-de-origen/src/error.rs. */
const CONTRACT_ERROR_CODES: Record<number, LotErrorCode> = {
	1: "LotNotFound",
	2: "NotOwner",
	3: "InvalidInput",
	4: "SameOwner",
}

const CONTRACT_ERROR_PATTERN = /Error\(Contract, #(\d+)\)/

/** Turns anything thrown by the generated client into a `LotError`. */
const toLotError = (error: unknown): LotError => {
	if (error instanceof LotError) return error
	const raw = error instanceof Error ? error.message : String(error)
	const match = CONTRACT_ERROR_PATTERN.exec(raw)
	const code = match?.[1] ? CONTRACT_ERROR_CODES[Number(match[1])] : undefined
	if (code) return new LotError(code)
	if (/reject|declin|denied|cancel/i.test(raw)) {
		return new LotError(
			"Unknown",
			"La firma fue cancelada en la billetera. No se realizó ningún cambio.",
		)
	}
	console.error(error)
	return new LotError("Unknown")
}

/** Unwraps a contract `Result`, mapping its error number to a `LotError`. */
const unwrapResult = <T>(result: {
	isErr(): boolean
	unwrap(): T
	unwrapErr(): { message: string }
}): T => {
	if (result.isErr()) throw toLotError(new Error(result.unwrapErr().message))
	return result.unwrap()
}

const readLot = async (id: number): Promise<Lot> => {
	const tx = await granoDeOrigen.get_lot({ id })
	return unwrapResult(tx.result)
}

/** `LotService` backed by the deployed Soroban contract. */
export const contractLotService: LotService = {
	async registerLot({ owner, farm, harvest, process }) {
		try {
			const tx = await granoDeOrigen.register_lot(
				{ owner, farm, harvest, process },
				{ publicKey: owner },
			)
			const { result } = await tx.signAndSend({ signTransaction })
			return unwrapResult(result)
		} catch (error) {
			throw toLotError(error)
		}
	},

	async getLot(id) {
		try {
			return await readLot(id)
		} catch (error) {
			throw toLotError(error)
		}
	},

	async transferLot(id, newOwner, caller) {
		try {
			// The contract only rejects through auth, so check ownership first to
			// show a clear message instead of a failed signature.
			const lot = await readLot(id)
			if (lot.owner !== caller) throw new LotError("NotOwner")
			if (lot.owner === newOwner) throw new LotError("SameOwner")

			const tx = await granoDeOrigen.transfer_lot(
				{ id, new_owner: newOwner },
				{ publicKey: caller },
			)
			const { result } = await tx.signAndSend({ signTransaction })
			unwrapResult(result)
		} catch (error) {
			throw toLotError(error)
		}
	},

	async lotCount() {
		const tx = await granoDeOrigen.lot_count()
		return tx.result
	},
}
