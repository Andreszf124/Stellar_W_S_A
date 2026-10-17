import { useQueryClient } from "@tanstack/react-query"
import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { useWallet } from "../hooks/useWallet"
import { type Wear } from "./avatarArt"
import { CATEGORY_LABEL, type Model } from "./catalog"
import styles from "./checkout.module.css"
import { type ClosetItem } from "./closetService"
import { Avatar, HomeScene } from "./components"
import { saveOrder } from "./orders"
import { FEE_MARGIN_XLM, payXlm, txUrl } from "./payment"
import { useCloset } from "./useCloset"
import { toXlm, useXlmRate } from "./useXlmRate"

type Phase = "form" | "sign" | "submit" | "done" | "error"

const STEPS: { phase: Phase; label: string }[] = [
	{ phase: "sign", label: "Esperando su firma en la billetera" },
	{ phase: "submit", label: "Enviando el pago a la red Stellar" },
	{ phase: "done", label: "Pago confirmado" },
]

interface Props {
	model: Model
	/** The unit being bought: the payment goes to the store that registered it. */
	unit: ClosetItem
	address: string
	onClose: () => void
}

const CheckoutDialog = ({ model, unit, address, onClose }: Props) => {
	const dialog = useRef<HTMLDialogElement>(null)
	const { signTransaction, balances, updateBalances } = useWallet()
	const { wear, look, furniture } = useCloset(address)
	const { rate, live } = useXlmRate()
	const queryClient = useQueryClient()
	const [phase, setPhase] = useState<Phase>("form")
	const [error, setError] = useState("")
	const [hash, setHash] = useState("")

	const busy = phase === "sign" || phase === "submit"
	const amount = toXlm(model.priceUsd, rate)
	const balance = Number(balances.xlm?.balance ?? 0)
	const enough = balance >= Number(amount) + FEE_MARGIN_XLM

	useEffect(() => {
		const el = dialog.current
		if (el && !el.open) el.showModal()
	}, [])

	// What the avatar would look like with the product on, replacing its slot.
	const tryOn: Wear[] = [
		...wear.filter((w) => w.slot !== model.slot),
		{ slot: model.slot, key: model.key, color: model.color },
	]

	const pay = async () => {
		setError("")
		setPhase("sign")
		try {
			const paid = await payXlm({
				from: address,
				to: unit.store,
				amount,
				memo: `Closet n.${unit.id}`,
				sign: signTransaction,
				onStep: setPhase,
			})
			saveOrder(address, {
				itemId: unit.id,
				name: model.name,
				store: unit.store,
				priceUsd: model.priceUsd,
				amountXlm: amount,
				hash: paid.hash,
				date: Date.now(),
			})
			setHash(paid.hash)
			setPhase("done")
			void queryClient.invalidateQueries({ queryKey: ["closet", "products"] })
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
			aria-labelledby="checkout-title"
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
					{model.slot === "furniture" ? (
						<HomeScene
							furniture={[...furniture, { key: model.key, color: model.color }]}
						/>
					) : (
						<Avatar wear={tryOn} look={look} />
					)}
					<small>
						{model.slot === "furniture"
							? "Así se vería en su hogar"
							: "Así se vería su avatar"}
					</small>
				</div>

				<div className={styles.body}>
					<h2 id="checkout-title">{model.name}</h2>
					<p className={styles.muted}>
						{CATEGORY_LABEL[model.category]} · ítem n.º {unit.id}
					</p>
					<p className={styles.price}>
						<strong>${model.priceUsd.toFixed(2)}</strong>
						<span>≈ {amount} XLM</span>
					</p>
					<p className={styles.muted}>
						Precio del XLM: ${rate.toFixed(4)} ({live ? "en vivo" : "de prueba"}
						).
					</p>

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
									<span className={styles.amount}>{amount} XLM</span>
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
								Saldo de su billetera: <strong>{balance.toFixed(2)} XLM</strong>
							</p>
							{!enough && (
								<p className={styles.error} role="alert">
									Le faltan XLM para pagar (se necesitan {amount} más{" "}
									{FEE_MARGIN_XLM} de reserva). Use el botón{" "}
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
								Pagar {amount} XLM
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
							<p>
								Pagó {amount} XLM a la tienda. Ella le entregará el código de un
								solo uso del ítem n.º <strong>{unit.id}</strong>; con ese código
								lo reclama y queda a su nombre.
							</p>
							<p>
								<a href={txUrl(hash)} target="_blank" rel="noreferrer">
									Ver la transacción
								</a>
							</p>
							<p>
								<Link to="/pedidos" onClick={onClose}>
									Ver mis pedidos
								</Link>
							</p>
							<div className={styles.actions}>
								<Link to="/reclamar" className={styles.pay} onClick={onClose}>
									Reclamar ahora
								</Link>
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

export default CheckoutDialog
