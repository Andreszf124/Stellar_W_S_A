import { type signTransaction } from "@stellar-scaffold/app-lib"
import { closet } from "@stellar-scaffold/app-lib/clients"
import { errorMessage } from "../lib/errors"
import { type CategoryTag, type Model } from "./catalog"
import { claimHash, codeBytes } from "./claimCode"

type Sign = typeof signTransaction

export interface ClosetItem {
	id: number
	name: string
	category: CategoryTag
	owner: string
	store: string
	claimed: boolean
}

/** Just the fields of the contract's `Item` that the app uses. */
interface ContractItem {
	id: number
	name: string
	category: { tag: CategoryTag }
	owner: string
	store: string
	claimed: boolean
}

const toItem = (i: ContractItem): ClosetItem => ({
	id: i.id,
	name: i.name,
	category: i.category.tag,
	owner: i.owner,
	store: i.store,
	claimed: i.claimed,
})

// Contract errors (contracts/closet/src/error.rs) as Spanish text. Reads return
// the error's doc comment, writes fail with `Error(Contract, #N)`: match both.
const BY_NUMBER: Record<string, string> = {
	"1": "No existe un ítem con ese número.",
	"2": "Escriba un nombre para el ítem.",
	"3": "Este ítem ya fue reclamado.",
	"4": "El código no es el correcto. Revíselo e intente de nuevo.",
	"5": "Este ítem todavía no se ha reclamado.",
	"6": "Esa dirección ya es la dueña del ítem.",
}
const BY_TEXT: [RegExp, string][] = [
	[/No item exists/i, BY_NUMBER["1"] ?? ""],
	[/name is empty/i, BY_NUMBER["2"] ?? ""],
	[/already claimed/i, BY_NUMBER["3"] ?? ""],
	[/not the one that came/i, BY_NUMBER["4"] ?? ""],
	[/not been claimed/i, BY_NUMBER["5"] ?? ""],
	[/already the current owner/i, BY_NUMBER["6"] ?? ""],
]

/** Anything thrown by the client or the wallet, as text for the person. */
export function friendlyError(e: unknown): string {
	const raw = errorMessage(e)
	const number = /Error\(Contract, #(\d+)\)/.exec(raw)?.[1]
	if (number && BY_NUMBER[number]) return BY_NUMBER[number]
	const byText = BY_TEXT.find(([pattern]) => pattern.test(raw))
	if (byText) return byText[1]
	if (/reject|declin|denied|cancel/i.test(raw)) {
		return "Se canceló la firma en la billetera. No se hizo ningún cambio."
	}
	console.error(e)
	return "Algo salió mal. Intente de nuevo en unos momentos."
}

/** Unwraps a contract `Result`, turning its error into a readable message. */
const unwrap = <T>(result: {
	isErr(): boolean
	unwrap(): T
	unwrapErr(): { message: string }
}): T => {
	if (result.isErr()) throw new Error(result.unwrapErr().message)
	return result.unwrap()
}

export async function getItem(id: number): Promise<ClosetItem> {
	const tx = await closet.get_item({ id })
	return toItem(unwrap(tx.result))
}

/** The claimed items owned by `owner`. A free read: no signature needed. */
export async function itemsOf(owner: string): Promise<ClosetItem[]> {
	const tx = await closet.items_of({ owner })
	return Promise.all(tx.result.map((id) => getItem(id)))
}

/** The store registers one unit and puts only the hash of its code on-chain. */
export async function registerItem(
	store: string,
	model: Model,
	code: string,
	sign: Sign,
): Promise<number> {
	const tx = await closet.register_item(
		{
			store,
			name: model.name,
			category: { tag: model.category, values: undefined },
			claim_hash: await claimHash(code),
		},
		{ publicKey: store },
	)
	// Contract errors show up in the simulation: check them before asking the
	// wallet to sign.
	unwrap(tx.result)
	const sent = await tx.signAndSend({ signTransaction: sign })
	return unwrap(sent.result)
}

/** The buyer reveals the code from the package and the item becomes theirs. */
export async function claimItem(
	id: number,
	code: string,
	claimer: string,
	sign: Sign,
): Promise<void> {
	const tx = await closet.claim_item(
		{ id, code: codeBytes(code), claimer },
		{ publicKey: claimer },
	)
	unwrap(tx.result)
	const sent = await tx.signAndSend({ signTransaction: sign })
	unwrap(sent.result)
}
