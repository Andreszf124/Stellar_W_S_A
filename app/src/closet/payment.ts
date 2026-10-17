import {
	Asset,
	BASE_FEE,
	Horizon,
	Memo,
	Operation,
	TransactionBuilder,
} from "@stellar/stellar-sdk"
import {
	horizonUrl,
	networkPassphrase,
	stellarNetwork,
} from "@stellar-scaffold/app-lib"
import { type SignTransactionFn } from "../cavos/context"
import { friendlyError } from "./closetService"

const horizon = new Horizon.Server(horizonUrl, {
	allowHttp: stellarNetwork === "LOCAL",
})

/** What a payment costs the buyer beyond the price: the network fee and a margin. */
export const FEE_MARGIN_XLM = 2

/** The Horizon result codes that a person can do something about. */
const BY_RESULT_CODE: Record<string, string> = {
	op_underfunded: "No tiene suficiente XLM para este pago.",
	op_low_reserve:
		"El pago dejaría su cuenta sin el mínimo que la red exige. Cargue más XLM de prueba.",
	op_no_destination: "La cuenta de la tienda todavía no existe en la red.",
	tx_insufficient_balance: "No tiene suficiente XLM para este pago.",
}

function paymentError(e: unknown): string {
	const codes = (
		e as {
			response?: {
				data?: {
					extras?: {
						result_codes?: { transaction?: string; operations?: string[] }
					}
				}
			}
		}
	).response?.data?.extras?.result_codes
	const known = [...(codes?.operations ?? []), codes?.transaction ?? ""]
		.map((code) => BY_RESULT_CODE[code])
		.find(Boolean)
	return known ?? friendlyError(e)
}

/**
 * The buyer pays `amount` XLM to the store that registered the unit. The wallet
 * signs (extension or Cavos alike) and the app submits through Horizon, so no
 * secret key ever reaches this code. Returns the transaction hash.
 */
export async function payXlm({
	from,
	to,
	amount,
	memo,
	sign,
	onStep,
}: {
	from: string
	to: string
	amount: string
	memo: string
	sign: SignTransactionFn
	/** Called when the wallet is asked to sign and when the network gets the payment. */
	onStep?: (step: "sign" | "submit") => void
}): Promise<{ hash: string }> {
	try {
		const account = await horizon.loadAccount(from)
		const tx = new TransactionBuilder(account, {
			fee: BASE_FEE,
			networkPassphrase,
		})
			.addOperation(
				Operation.payment({
					destination: to,
					asset: Asset.native(),
					amount,
				}),
			)
			.addMemo(Memo.text(memo))
			.setTimeout(60)
			.build()
		onStep?.("sign")
		const { signedTxXdr } = await sign(tx.toXDR(), {
			address: from,
			networkPassphrase,
		})
		onStep?.("submit")
		const sent = await horizon.submitTransaction(
			TransactionBuilder.fromXDR(signedTxXdr, networkPassphrase),
		)
		return { hash: sent.hash }
	} catch (e) {
		throw new Error(paymentError(e))
	}
}

/** Link to a transaction on the public explorer (Testnet by default). */
export const txUrl = (hash: string) =>
	`https://stellar.expert/explorer/${stellarNetwork === "PUBLIC" ? "public" : "testnet"}/tx/${hash}`
