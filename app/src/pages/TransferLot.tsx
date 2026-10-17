import { useState, type FormEvent } from "react"
import { Link } from "react-router-dom"
import { FormField } from "../components/FormField"
import { TransferIcon } from "../components/Icons"
import { StatusMessage } from "../components/StatusMessage"
import ui from "../components/ui.module.css"
import { WalletGate } from "../components/WalletGate"
import { toFriendlyMessage } from "../services/errors"
import { isValidAddress, lotService } from "../services/lotService"
import styles from "./Pages.module.css"

/** Lot ids are u32 in the contract. */
const MAX_LOT_ID = 4_294_967_295

type Result =
	| { status: "idle" }
	| { status: "loading" }
	| { status: "success"; id: number }
	| { status: "error"; message: string }

const TransferForm = ({ caller }: { caller: string }) => {
	const [lotId, setLotId] = useState("")
	const [newOwner, setNewOwner] = useState("")
	const [idError, setIdError] = useState<string>()
	const [ownerError, setOwnerError] = useState<string>()
	const [result, setResult] = useState<Result>({ status: "idle" })

	const submit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const id = /^\d+$/.test(lotId.trim()) ? Number(lotId.trim()) : 0
		const owner = newOwner.trim()
		const idMsg =
			id > 0 && id <= MAX_LOT_ID
				? undefined
				: "Ingrese un número de lote válido."
		const ownerMsg = isValidAddress(owner)
			? undefined
			: "La dirección debe empezar con G y tener 56 caracteres."
		setIdError(idMsg)
		setOwnerError(ownerMsg)
		if (idMsg || ownerMsg) return

		setResult({ status: "loading" })
		try {
			await lotService.transferLot(id, owner, caller)
			setResult({ status: "success", id })
			setLotId("")
			setNewOwner("")
		} catch (e) {
			setResult({ status: "error", message: toFriendlyMessage(e) })
		}
	}

	const busy = result.status === "loading"

	return (
		<>
			<form className={ui.form} onSubmit={submit} noValidate>
				<FormField
					id="transfer-id"
					label="Número de lote"
					inputMode="numeric"
					autoComplete="off"
					required
					disabled={busy}
					value={lotId}
					error={idError}
					onChange={(e) => {
						setLotId(e.target.value)
						setIdError(undefined)
					}}
				/>
				<FormField
					id="transfer-owner"
					label="Dirección del nuevo dueño"
					hint="Dirección pública de Stellar, empieza con G."
					autoComplete="off"
					spellCheck={false}
					required
					disabled={busy}
					value={newOwner}
					error={ownerError}
					onChange={(e) => {
						setNewOwner(e.target.value)
						setOwnerError(undefined)
					}}
				/>
				<div>
					<button type="submit" className={ui.button} disabled={busy}>
						<TransferIcon size={18} />
						{busy ? "Transfiriendo..." : "Transferir lote"}
					</button>
				</div>
			</form>

			{result.status === "loading" && (
				<StatusMessage variant="loading" title="Transfiriendo el lote">
					Esto puede tardar unos segundos.
				</StatusMessage>
			)}
			{result.status === "error" && (
				<StatusMessage variant="error" title="No se pudo transferir">
					{result.message}
				</StatusMessage>
			)}
			{result.status === "success" && (
				<StatusMessage
					variant="success"
					title={`Lote N.º ${result.id} transferido`}
				>
					El nuevo dueño ya figura en el registro.{" "}
					<Link to={`/lote/${result.id}`}>Ver el lote</Link>
				</StatusMessage>
			)}
		</>
	)
}

const TransferLot = () => (
	<div className={styles.page}>
		<h1>Transferir un lote</h1>
		<p className={styles.lead}>
			Entregue la propiedad de un lote a otra persona. Solo el dueño actual
			puede hacerlo.
		</p>
		<WalletGate>{(address) => <TransferForm caller={address} />}</WalletGate>
	</div>
)

export default TransferLot
