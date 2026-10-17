import { useState, type FormEvent } from "react"
import { CATEGORY_LABEL, MODELS, findModel } from "../closet/catalog"
import { generateClaimCode } from "../closet/claimCode"
import styles from "../closet/closet.module.css"
import { friendlyError, registerItem } from "../closet/closetService"
import { WalletRequired } from "../closet/components"
import { useWallet } from "../hooks/useWallet"

type Result =
	| { status: "idle" }
	| { status: "sending" }
	| { status: "done"; id: number; code: string; name: string }
	| { status: "error"; message: string }

const StoreForm = ({ address }: { address: string }) => {
	const { signTransaction } = useWallet()
	const [modelName, setModelName] = useState(MODELS[0]?.name ?? "")
	const [result, setResult] = useState<Result>({ status: "idle" })
	const [copied, setCopied] = useState(false)

	const submit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const model = findModel(modelName)
		if (!model) {
			setResult({ status: "error", message: "Elija un modelo de la lista." })
			return
		}

		setCopied(false)
		setResult({ status: "sending" })
		// The code is made here and only its hash goes on-chain. It is shown once.
		const code = generateClaimCode()
		try {
			const id = await registerItem(address, model, code, signTransaction)
			setResult({ status: "done", id, code, name: model.name })
		} catch (e) {
			setResult({ status: "error", message: friendlyError(e) })
		}
	}

	const copy = async (code: string) => {
		try {
			await navigator.clipboard.writeText(code)
			setCopied(true)
		} catch {
			setCopied(false)
		}
	}

	const sending = result.status === "sending"

	return (
		<>
			<form className={styles.form} onSubmit={(e) => void submit(e)}>
				<div className={styles.field}>
					<label htmlFor="model">Producto</label>
					<select
						id="model"
						value={modelName}
						disabled={sending}
						onChange={(e) => setModelName(e.target.value)}
					>
						{MODELS.map((m) => (
							<option key={m.key} value={m.name}>
								{m.name} ({CATEGORY_LABEL[m.category]})
							</option>
						))}
					</select>
					<span className={styles.muted}>
						Por ahora el catálogo es fijo. Cada registro es una unidad que usted
						vende.
					</span>
				</div>
				<button type="submit" className={styles.primary} disabled={sending}>
					{sending ? "Esperando su firma..." : "Registrar unidad"}
				</button>
			</form>

			{result.status === "error" && (
				<p className={`${styles.notice} ${styles.error}`} role="alert">
					{result.message}
				</p>
			)}
			{result.status === "done" && (
				<section
					className={`${styles.notice} ${styles.success}`}
					role="status"
					aria-labelledby="done-title"
				>
					<h2 id="done-title">Unidad registrada</h2>
					<p>
						{result.name}, ítem n.º <strong>{result.id}</strong>. Entregue al
						comprador este número y este código:
					</p>
					<p>
						<span className={styles.code}>{result.code}</span>
					</p>
					<p className={styles.muted}>
						Guárdelo ahora: no se vuelve a mostrar. En la red solo queda su
						huella, así que nadie puede reclamar el ítem sin el código.
					</p>
					<button type="button" onClick={() => void copy(result.code)}>
						{copied ? "Copiado" : "Copiar código"}
					</button>
				</section>
			)}
		</>
	)
}

const Store = () => (
	<div className={styles.page}>
		<h1>Tienda</h1>
		<p className={styles.lead}>
			Registre cada unidad que vende y entregue al comprador su código de un
			solo uso. Con él reclamará la versión digital.
		</p>
		<WalletRequired>
			{(address) => <StoreForm key={address} address={address} />}
		</WalletRequired>
	</div>
)

export default Store
