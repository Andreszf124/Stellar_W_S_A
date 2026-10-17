import { useQueryClient } from "@tanstack/react-query"
import { useState, type FormEvent } from "react"
import { Link } from "react-router-dom"
import styles from "../closet/closet.module.css"
import { claimItem, friendlyError } from "../closet/closetService"
import { WalletRequired } from "../closet/components"
import { useWallet } from "../hooks/useWallet"

type Result =
	| { status: "idle" }
	| { status: "sending" }
	| { status: "done"; id: number }
	| { status: "error"; message: string }

const ClaimForm = ({ address }: { address: string }) => {
	const { signTransaction } = useWallet()
	const queryClient = useQueryClient()
	const [id, setId] = useState("")
	const [code, setCode] = useState("")
	const [result, setResult] = useState<Result>({ status: "idle" })

	const submit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const itemId = Number(id)
		if (!/^\d+$/.test(id.trim()) || itemId < 1 || itemId > 4_294_967_295) {
			setResult({
				status: "error",
				message: "Escriba el número del ítem, por ejemplo 1.",
			})
			return
		}
		if (!code.trim()) {
			setResult({ status: "error", message: "Escriba el código del producto." })
			return
		}

		setResult({ status: "sending" })
		try {
			await claimItem(itemId, code, address, signTransaction)
			await queryClient.invalidateQueries({ queryKey: ["closet", address] })
			setResult({ status: "done", id: itemId })
			setId("")
			setCode("")
		} catch (e) {
			setResult({ status: "error", message: friendlyError(e) })
		}
	}

	const sending = result.status === "sending"

	return (
		<>
			<form className={styles.form} onSubmit={(e) => void submit(e)} noValidate>
				<div className={styles.field}>
					<label htmlFor="item-id">Número del ítem</label>
					<input
						id="item-id"
						inputMode="numeric"
						autoComplete="off"
						value={id}
						disabled={sending}
						onChange={(e) => setId(e.target.value)}
					/>
				</div>
				<div className={styles.field}>
					<label htmlFor="item-code">Código del producto</label>
					<input
						id="item-code"
						autoComplete="off"
						autoCapitalize="characters"
						placeholder="K7QM-2XWD-9PTA"
						value={code}
						disabled={sending}
						onChange={(e) => setCode(e.target.value)}
					/>
					<span className={styles.muted}>
						Viene impreso en el empaque o en la etiqueta del producto.
					</span>
				</div>
				<button type="submit" className={styles.primary} disabled={sending}>
					{sending ? "Esperando su firma..." : "Reclamar ítem"}
				</button>
			</form>

			{result.status === "error" && (
				<p className={`${styles.notice} ${styles.error}`} role="alert">
					{result.message}
				</p>
			)}
			{result.status === "done" && (
				<p className={`${styles.notice} ${styles.success}`} role="status">
					Listo, el ítem n.º {result.id} ya es suyo. Véalo en{" "}
					<Link to="/closet">su clóset</Link>.
				</p>
			)}
		</>
	)
}

const Claim = () => (
	<div className={styles.page}>
		<h1>Reclamar un ítem</h1>
		<p className={styles.lead}>
			Cada producto físico trae un código de un solo uso. Escríbalo aquí y el
			ítem digital queda a su nombre.
		</p>
		<WalletRequired>
			{(address) => <ClaimForm key={address} address={address} />}
		</WalletRequired>
	</div>
)

export default Claim
