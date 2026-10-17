/** Error codes mirrored from the Soroban contract plus client-side ones. */
export type LotErrorCode =
	| "LotNotFound"
	| "NotOwner"
	| "SameOwner"
	| "InvalidInput"
	| "WalletRequired"
	| "Unknown"

export class LotError extends Error {
	readonly code: LotErrorCode

	constructor(code: LotErrorCode, message?: string) {
		super(message ?? FRIENDLY_MESSAGES[code])
		this.name = "LotError"
		this.code = code
	}
}

const FRIENDLY_MESSAGES: Record<LotErrorCode, string> = {
	LotNotFound:
		"No encontramos un lote con ese número. Revise el número e intente de nuevo.",
	NotOwner: "Solo el dueño actual del lote puede transferirlo.",
	SameOwner: "La dirección indicada ya es la dueña del lote.",
	InvalidInput: "Revise los datos ingresados.",
	WalletRequired: "Conecte su billetera para continuar.",
	Unknown: "Algo salió mal. Intente de nuevo en unos momentos.",
}

/** Contract error names that may appear inside raw error messages. */
const CONTRACT_CODES: LotErrorCode[] = ["LotNotFound", "NotOwner", "SameOwner"]

/** Converts any thrown value into text safe to show to the end user. */
export function toFriendlyMessage(error: unknown): string {
	if (error instanceof LotError) return error.message
	const raw = error instanceof Error ? error.message : String(error)
	const code = CONTRACT_CODES.find((c) => raw.includes(c))
	if (code) return FRIENDLY_MESSAGES[code]
	if (/reject|declin|denied|cancel/i.test(raw)) {
		return "La firma fue cancelada en la billetera. No se realizó ningún cambio."
	}
	return FRIENDLY_MESSAGES.Unknown
}
