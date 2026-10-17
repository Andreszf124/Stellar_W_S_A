import { useQueryClient, type QueryKey } from "@tanstack/react-query"
import { useEffect, useRef, useState, type ReactNode } from "react"
import { useWallet } from "../hooks/useWallet"
import styles from "./checkout.module.css"
import { amountString, formatXlm } from "./money"
import { FEE_MARGIN_XLM, payXlm, txUrl } from "./payment"

type Phase = "form" | "sign" | "submit" | "done" | "error"

const STEPS: { phase: Phase; label: string }[] = [
	{ phase: "sign", label: "Esperando su firma en la billetera" },
	{ phase: "submit", label: "Enviando el pago a la red Stellar" },
	{ phase: "done", label: "Pago confirmado" },
]

export interface PayDialogProps {
	/** Name of what is being bought. */
	title: string
	/** Line under the title: category, seller, item number. */
	subtitle?: ReactNode
	/** Price in XLM, the reference currency of the app. */
	priceXlm: number
	/** Address that receives the payment. */
	to: string
	/** Stellar text memo (28 bytes at most). */
	memo: string
	/** Picture on the left: the avatar trying the product on, a pet, a room. */
	preview: ReactNode
	/** Small text under the picture. */
	caption?: string
	/** Extra controls between the price and the payment methods (a seller picker). */
	extra?: ReactNode
	/** Called with the transaction hash once the payment is confirmed. */
	onPaid?: (hash: string) => void
	/** Queries to refresh after a payment. */
	invalidate?: QueryKey[]
	/** Text of the receipt. */
	successText: ReactNode
	/** Extra links and buttons in the receipt (next to "Seguir comprando"). */
	successActions?: ReactNode
	/** Closes the dialog. Called on Esc, backdrop click and the buttons. */
	onClose: () => void
}

/**
 * The payment window every purchase uses: shows the product, checks the
 * balance, asks the wallet to sign a payment in XLM and shows the receipt.
 * It never touches a secret key: signing goes through `useWallet`.
 */
const PayDialog = ({
	title,
	subtitle,
	priceXlm,
	to,
	memo,
	preview,
	caption,
	extra,
	onPaid,
	invalidate = [],
	successText,
	successActions,
	onClose,
}: PayDialogProps) => {
	const dialog = useRef<HTMLDialogElement>(null)
	const { address, signTransaction, balances, updateBalances } = useWallet()
	const queryClient = useQueryClient()
	const [phase, setPhase] = useState<Phase>("form")
	const [error, setError] = useState("")
	const [hash, setHash] = useState("")

	const busy = phase === "sign" || phase === "submit"
	const amount = amountString(priceXlm)
	const balance = Number(balances.xlm?.balance ?? 0)
	const enough = balance >= Number(amount) + FEE_MARGIN_XLM

	useEffect(() => {
		const el = dialog.current
		if (el && !el.open) el.showModal()
	}, [])

	const pay = async () => {
		if (!address) return
		setError("")
		setPhase("sign")
		try {
			const paid = await payXlm({
				from: address,
				to,
				amount,
				memo,
				sign: signTransaction,
				onStep: setPhase,
			})
			onPaid?.(paid.hash)
			setHash(paid.hash)
			setPhase("done")
			for (const queryKey of invalidate) {
				void queryClient.invalidateQueries({ queryKey })
			}
			void updateBalances()
		} catch (e) {
			setError(e instanceof Error ? e.message : "No se pudo completar el pago.")
			setPhase("error")
		}
	}

	const close = () => {
		if (!busy) onClose()
	}

	return (
		<dialog
			ref={dialog}
			className={styles.dialog}
			aria-labelledby="pay-title"
			onClose={onClose}
			onCancel={(e) => {
				// Esc must not close it while the payment is in progress.
				if (busy) e.preventDefault()
			}}
			onClick={(e) => {
				if (e.target === dialog.current) close()
			}}
		>
			<div className={styles.box}>
				<button
					type="button"
					className={styles.close}
					aria-label="Cerrar"
					disabled={busy}
					onClick={close}
				>
					×
				</button>

				<div className={styles.tryon}>
					{preview}
					{caption && <small>{caption}</small>}
				</div>

				<div className={styles.body}>
					<h2 id="pay-title">{title}</h2>
					{subtitle && <p className={styles.muted}>{subtitle}</p>}
					<p className={styles.price}>
						<strong>{formatXlm(priceXlm)}</strong>
					</p>
					{extra}

					{(phase === "form" || phase === "error") && (
						<>
							<fieldset className={styles.methods}>
								<legend>Forma de pago</legend>
								<label className={`${styles.method} ${styles.selected}`}>
									<input type="radio" name="method" defaultChecked />
									<span>
										<strong>XLM (Stellar)</strong>
										<small>Pago desde su billetera, con su firma</small>
									</span>
									<span className={styles.amount}>{formatXlm(priceXlm)}</span>
								</label>
								<label className={`${styles.method} ${styles.disabled}`}>
									<input type="radio" name="method" disabled />
									<span>
										<strong>USDC en Stellar</strong>
										<small>Próximamente</small>
									</span>
								</label>
							</fieldset>
							<p className={styles.muted}>
								Saldo de su billetera: <strong>{formatXlm(balance)}</strong>
							</p>
							{!enough && (
								<p className={styles.error} role="alert">
									Le faltan XLM para pagar (se necesitan {formatXlm(priceXlm)}{" "}
									más {FEE_MARGIN_XLM} de reserva). Use el botón{" "}
									<em>Fund Account</em> de la parte superior para cargar XLM de
									prueba.
								</p>
							)}
							{phase === "error" && (
								<p className={styles.error} role="alert">
									{error}
								</p>
							)}
							<button
								type="button"
								className={styles.pay}
								disabled={!enough}
								onClick={() => void pay()}
							>
								Pagar {formatXlm(priceXlm)}
							</button>
						</>
					)}

					{phase !== "form" && phase !== "error" && (
						<ul className={styles.steps} aria-live="polite">
							{STEPS.map((step, i) => {
								const current = STEPS.findIndex((s) => s.phase === phase)
								const state =
									i < current || phase === "done"
										? "done"
										: i === current
											? "active"
											: ""
								return (
									<li key={step.phase} className={styles[state] ?? ""}>
										<span className={styles.icon} aria-hidden="true">
											{state === "done" ? "✓" : ""}
										</span>
										{step.label}
									</li>
								)
							})}
						</ul>
					)}

					{phase === "done" && (
						<div className={styles.receipt} role="status">
							<h3>Compra registrada</h3>
							<p>{successText}</p>
							<p>
								<a href={txUrl(hash)} target="_blank" rel="noreferrer">
									Ver la transacción
								</a>
							</p>
							<div className={styles.actions}>
								{successActions}
								<button type="button" onClick={onClose}>
									Cerrar
								</button>
							</div>
						</div>
					)}
				</div>
			</div>
		</dialog>
	)
}

export default PayDialog
