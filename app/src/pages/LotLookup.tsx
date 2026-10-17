import { useEffect, useState, type FormEvent } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { FormField } from "../components/FormField"
import { SearchIcon } from "../components/Icons"
import { LotCard } from "../components/LotCard"
import { StatusMessage } from "../components/StatusMessage"
import ui from "../components/ui.module.css"
import { useLot } from "../hooks/useLot"
import { parseLotId } from "../services/lotId"
import styles from "./Pages.module.css"

const LotLookup = () => {
	const { id: idParam } = useParams()
	const navigate = useNavigate()
	const [search, setSearch] = useState(idParam ?? "")
	const [searchError, setSearchError] = useState<string>()

	// Keep the search box in step with the URL (back button, shared links).
	useEffect(() => {
		setSearch(idParam ?? "")
	}, [idParam])

	const id = parseLotId(idParam)
	const invalidParam = idParam !== undefined && id === null
	const query = useLot(id)

	const submit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const parsed = parseLotId(search.trim())
		if (parsed === null) {
			setSearchError("Ingrese un número de lote válido, por ejemplo 1.")
			return
		}
		setSearchError(undefined)
		void navigate(`/lote/${parsed}`)
	}

	return (
		<div className={styles.page}>
			<h1>Consultar un lote</h1>
			<p className={styles.lead}>
				Revise el origen de un café con el número de lote. No necesita
				billetera.
			</p>

			<form className={styles.searchRow} onSubmit={submit} noValidate>
				<FormField
					id="lot-search"
					label="Número de lote"
					inputMode="numeric"
					autoComplete="off"
					value={search}
					error={searchError}
					onChange={(e) => {
						setSearch(e.target.value)
						setSearchError(undefined)
					}}
				/>
				<button type="submit" className={ui.button}>
					<SearchIcon size={18} />
					Buscar
				</button>
			</form>

			<div aria-live="polite">
				{idParam === undefined && (
					<StatusMessage variant="empty" title="Busque un lote">
						Escriba el número que aparece en el empaque o que le compartió el
						productor.
					</StatusMessage>
				)}
				{invalidParam && (
					<StatusMessage variant="error" title="Número de lote no válido">
						El número debe ser un entero positivo, por ejemplo 1.
					</StatusMessage>
				)}
				{query.status === "loading" && (
					<StatusMessage variant="loading" title="Buscando el lote">
						Consultando el registro.
					</StatusMessage>
				)}
				{query.status === "error" && (
					<StatusMessage variant="error" title="No se pudo mostrar el lote">
						{query.message}
					</StatusMessage>
				)}
				{query.status === "success" && <LotCard lot={query.lot} />}
			</div>
		</div>
	)
}

export default LotLookup
