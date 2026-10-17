import { useState, type FormEvent } from "react"
import { Link } from "react-router-dom"
import { FormField } from "../components/FormField"
import { PlusIcon } from "../components/Icons"
import { StatusMessage } from "../components/StatusMessage"
import ui from "../components/ui.module.css"
import { WalletGate } from "../components/WalletGate"
import { toFriendlyMessage } from "../services/errors"
import { lotService } from "../services/lotService"
import styles from "./Pages.module.css"

type Result =
	| { status: "idle" }
	| { status: "loading" }
	| { status: "success"; id: number }
	| { status: "error"; message: string }

const EMPTY = { farm: "", harvest: "", process: "" }
type Values = typeof EMPTY
type Errors = Partial<Record<keyof Values, string>>

const REQUIRED = "Este campo es obligatorio."

const validate = (values: Values): Errors => {
	const errors: Errors = {}
	for (const key of Object.keys(values) as (keyof Values)[]) {
		if (!values[key].trim()) errors[key] = REQUIRED
	}
	return errors
}

const RegisterForm = ({ owner }: { owner: string }) => {
	const [values, setValues] = useState<Values>(EMPTY)
	const [errors, setErrors] = useState<Errors>({})
	const [result, setResult] = useState<Result>({ status: "idle" })

	const bind = (key: keyof Values) => ({
		name: key,
		value: values[key],
		error: errors[key],
		onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
			setValues((v) => ({ ...v, [key]: e.target.value }))
			setErrors((er) => ({ ...er, [key]: undefined }))
		},
	})

	const submit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const found = validate(values)
		setErrors(found)
		if (Object.keys(found).length > 0) return

		setResult({ status: "loading" })
		try {
			const id = await lotService.registerLot({ owner, ...values })
			setResult({ status: "success", id })
			setValues(EMPTY)
		} catch (e) {
			setResult({ status: "error", message: toFriendlyMessage(e) })
		}
	}

	const busy = result.status === "loading"

	return (
		<>
			<form className={ui.form} onSubmit={submit} noValidate>
				<FormField
					id="farm"
					label="Finca"
					hint="Nombre y zona, por ejemplo: Finca La Esperanza, Tarrazú."
					required
					disabled={busy}
					{...bind("farm")}
				/>
				<FormField
					id="harvest"
					label="Cosecha"
					hint="Por ejemplo: Cosecha 2025/2026."
					required
					disabled={busy}
					{...bind("harvest")}
				/>
				<FormField
					id="process"
					label="Proceso"
					hint="Por ejemplo: lavado, honey o natural."
					required
					disabled={busy}
					{...bind("process")}
				/>
				<div>
					<button type="submit" className={ui.button} disabled={busy}>
						<PlusIcon size={18} />
						{busy ? "Registrando..." : "Registrar lote"}
					</button>
				</div>
			</form>

			{result.status === "loading" && (
				<StatusMessage variant="loading" title="Registrando su lote">
					Esto puede tardar unos segundos.
				</StatusMessage>
			)}
			{result.status === "error" && (
				<StatusMessage variant="error" title="No se pudo registrar">
					{result.message}
				</StatusMessage>
			)}
			{result.status === "success" && (
				<StatusMessage
					variant="success"
					title={`Lote N.º ${result.id} registrado`}
				>
					Comparta este número con sus compradores para que consulten el origen.{" "}
					<Link to={`/lote/${result.id}`}>Ver el lote</Link>
				</StatusMessage>
			)}
		</>
	)
}

const RegisterLot = () => (
	<div className={styles.page}>
		<h1>Registrar un lote</h1>
		<p className={styles.lead}>
			Deje constancia del origen de su café. El lote quedará a su nombre.
		</p>
		<WalletGate>{(address) => <RegisterForm owner={address} />}</WalletGate>
	</div>
)

export default RegisterLot
