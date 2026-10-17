import { useQueryClient, type QueryKey } from "@tanstack/react-query"
import {
	useEffect,
	useRef,
	useState,
	type FormEvent,
	type ReactNode,
} from "react"
import { useWallet } from "../hooks/useWallet"
import styles from "./checkout.module.css"
import { amountString, formatXlm } from "./money"
import { type PayMethod, type Shipping } from "./orders"
import { FEE_MARGIN_XLM, payXlm, txUrl } from "./payment"
import { useXlmRate, usdText } from "./useXlmRate"

type Phase = "form" | "sign" | "submit" | "done" | "error"

const STEPS: Record<PayMethod, { phase: Phase; label: string }[]> = {
	xlm: [
		{ phase: "sign", label: "Esperando su firma en la billetera" },
		{ phase: "submit", label: "Enviando el pago a la red Stellar" },
		{ phase: "done", label: "Pago confirmado en Stellar" },
	],
	demo: [
		{ phase: "sign", label: "Firmando (simulado, sin billetera)" },
		{ phase: "submit", label: "Enviando a Stellar (simulado)" },
		{ phase: "done", label: "Ítem NFT de demostración entregado" },
	],
}

/** What the dialog reports once a payment went through. */
export interface Paid {
	method: PayMethod
	/** Transaction hash; empty for the simulated demo payment. */
	hash: string
	/** The XLM paid (in demo mode, the amount shown). */
	xlm: number
	shipping?: Shipping
}

export interface PayDialogProps {
	/** Name of what is being bought. */
	title: string
	/** Line under the title: category, seller, item number. */
	subtitle?: ReactNode
	/** Price in XLM (Stellar Lumens). */
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
	/** Asks where to ship a physical product. */
	shipping?: boolean
	/** Demo mode: no wallet is connected, so the payment is only simulated. */
	demo?: boolean
	/** Called once the payment is confirmed. */
	onPaid?: (paid: Paid) => void
	/** Queries to refresh after a payment. */
	invalidate?: QueryKey[]
	/** Text of the receipt. */
	successText: ReactNode
	/** Extra links and buttons in the receipt (next to "Seguir comprando"). */
	successActions?: ReactNode
	/** Closes the dialog. Called on Esc, backdrop click and the buttons. */
	onClose: () => void
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

/**
 * The payment window every purchase uses: shows the product, checks the
 * balance, asks the wallet to sign a payment in XLM (Stellar Lumens) and shows
 * the receipt. Without a wallet (demo mode) the payment is only simulated.
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
	shipping = false,
	demo = false,
	onPaid,
	invalidate = [],
	successText,
	successActions,
	onClose,
}: PayDialogProps) => {
	const dialog = useRef<HTMLDialogElement>(null)
	const { address, signTransaction, balances, updateBalances } = useWallet()
	const queryClient = useQueryClient()
	const { rate } = useXlmRate()
	const [phase, setPhase] = useState<Phase>("form")
	const [error, setError] = useState("")
	const [paid, setPaid] = useState<Paid>()
	const [ship, setShip] = useState<Shipping>({ name: "", address: "" })

	const busy = phase === "sign" || phase === "submit"
	const amount = amountString(priceXlm)
	const balance = Number(balances.xlm?.balance ?? 0)
	const enough = demo || balance >= priceXlm + FEE_MARGIN_XLM
	const method: PayMethod = demo ? "demo" : "xlm"

	useEffect(() => {
		const el = dialog.current
		if (el && !el.open) el.showModal()
	}, [])

	const finish = (result: Paid) => {
		onPaid?.(result)
		setPaid(result)
		setPhase("done")
		for (const queryKey of invalidate) {
			void queryClient.invalidateQueries({ queryKey })
		}
		void updateBalances()
	}

	const pay = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		if (!address && !demo) return
		setError("")
		const shippingInfo = shipping
			? { name: ship.name.trim(), address: ship.address.trim() }
			: undefined
		if (demo) {
			setPhase("sign")
			await wait(700)
			setPhase("submit")
			await wait(700)
			finish({
				method: "demo",
				hash: "",
				xlm: priceXlm,
				shipping: shippingInfo,
			})
			return
		}
		setPhase("sign")
		try {
			const sent = await payXlm({
				from: address ?? "",
				to,
				amount,
				memo,
				sign: signTransaction,
				onStep: setPhase,
			})
			finish({
				method: "xlm",
				hash: sent.hash,
				xlm: priceXlm,
				shipping: shippingInfo,
			})
		} catch (e) {
			setError(e instanceof Error ? e.message : "No se pudo completar el pago.")
			setPhase("error")
		}
	}

	const close = () => {
		if (!busy) onClose()
	}

	const showForm = phase === "form" || phase === "error"
	const steps = STEPS[method]

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
						<span>Stellar Lumens</span>
						{usdText(priceXlm, rate) && (
							<small className={styles.usdNote}>
								{usdText(priceXlm, rate)}
							</small>
						)}
					</p>
					{extra}

					{showForm && (
						<form onSubmit={(e) => void pay(e)}>
							<fieldset className={styles.methods}>
								<legend>Forma de pago</legend>
								<label className={`${styles.method} ${styles.selected}`}>
									<input type="radio" name="method" checked readOnly />
									<span>
										<strong>Stellar Lumens (XLM)</strong>
										<small>
											{demo
												? "Simulado en modo demo · no hay billetera conectada"
												: "Pago en la red desde su billetera · comisión menor a 0.00001 XLM"}
										</small>
									</span>
									<span className={styles.amount}>
										{formatXlm(priceXlm)}
										{usdText(priceXlm, rate) && (
											<small className={styles.usdNote}>
												{usdText(priceXlm, rate)}
											</small>
										)}
									</span>
								</label>
								<label className={`${styles.method} ${styles.disabled}`}>
									<input type="radio" name="method" disabled />
									<span>
										<strong>USDC en Stellar</strong>
										<small>Próximamente</small>
									</span>
									<span className={styles.amount}>
										{priceXlm.toFixed(2)} USDC
									</span>
								</label>
							</fieldset>

							{demo ? (
								<p className={styles.muted}>
									Modo demo: no se firma nada ni se mueve XLM. Conecte una
									billetera para pagar de verdad en Stellar Testnet.
								</p>
							) : (
								<>
									<p className={styles.muted}>
										Saldo de su billetera: <strong>{formatXlm(balance)}</strong>
									</p>
									{!enough && (
										<p className={styles.error} role="alert">
											Le faltan XLM para pagar (se necesitan{" "}
											{formatXlm(priceXlm)} más {FEE_MARGIN_XLM} de reserva).
											Use el botón <em>Fund Account</em> de la parte superior
											para cargar XLM de prueba.
										</p>
									)}
								</>
							)}

							{shipping && (
								<fieldset className={styles.fields}>
									<legend>Enviar el producto físico a</legend>
									<div className={styles.field}>
										<label htmlFor="ship-name">Nombre completo</label>
										<input
											id="ship-name"
											required
											autoComplete="name"
											value={ship.name}
											onChange={(e) =>
												setShip({ ...ship, name: e.target.value })
											}
										/>
									</div>
									<div className={styles.field}>
										<label htmlFor="ship-address">Dirección</label>
										<input
											id="ship-address"
											required
											autoComplete="street-address"
											value={ship.address}
											onChange={(e) =>
												setShip({ ...ship, address: e.target.value })
											}
										/>
									</div>
								</fieldset>
							)}

							{phase === "error" && (
								<p className={styles.error} role="alert">
									{error}
								</p>
							)}
							<button type="submit" className={styles.pay} disabled={!enough}>
								Pagar {formatXlm(priceXlm)}
							</button>
						</form>
					)}

					{!showForm && (
						<ul className={styles.steps} aria-live="polite">
							{steps.map((step, i) => {
								const current = steps.findIndex((s) => s.phase === phase)
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

					{phase === "done" && paid && (
						<div className={styles.receipt} role="status">
							<h3>Compra registrada</h3>
							<p>{successText}</p>
							{paid.method === "xlm" ? (
								<p>
									<a href={txUrl(paid.hash)} target="_blank" rel="noreferrer">
										Ver la transacción en Stellar
									</a>
								</p>
							) : (
								<p className={styles.muted}>
									Pago simulado en modo demo: no se firmó nada ni se movió XLM.
								</p>
							)}
							<div className={styles.actions}>
								{successActions}
								<button type="button" onClick={onClose}>
									Seguir comprando
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
