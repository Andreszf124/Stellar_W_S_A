import { useQueryClient } from "@tanstack/react-query"
import { useId, useMemo, useState, type FormEvent } from "react"
import {
	createMissionRow,
	isMissingTable,
	SupabaseError,
	type MissionKind,
} from "../lib/supabase"
import styles from "./admin.module.css"
import { MODELS } from "./catalog"
import { describeRequirement, MISSION_KINDS } from "./missions"
import { MISSIONS_KEY, useMissions } from "./useMissions"
import { useProducts } from "./useProducts"

const MIGRATION =
	"supabase/migrations/20261017120000_products_missions_profiles.sql"

const LIMITS = {
	titleMin: 2,
	title: 80,
	description: 300,
	targetMin: 1,
	targetMax: 100,
	rewardMin: 2,
	reward: 40,
}

type FieldKey = "title" | "description" | "kind" | "target" | "reward"
type Values = Record<FieldKey, string>
type Errors = Partial<Record<FieldKey, string>>

const EMPTY: Values = {
	title: "",
	description: "",
	kind: MISSION_KINDS[0]?.kind ?? "items_from_store",
	target: "1",
	reward: "",
}

function describeError(e: unknown) {
	if (isMissingTable(e)) {
		return `Falta crear la tabla de misiones. Abra Supabase > SQL Editor, pegue el contenido de ${MIGRATION} y pulse Run. Luego vuelva a intentarlo.`
	}
	if (e instanceof SupabaseError) {
		if (e.status === 0) {
			return "Falta configurar Supabase (PUBLIC_SUPABASE_URL y PUBLIC_SUPABASE_PUBLISHABLE_KEY en app/.env)."
		}
		return `No se pudo guardar la misión (código ${e.status}). Revise los datos e inténtelo de nuevo.`
	}
	return "No hay conexión con el servidor. Revise su internet e inténtelo de nuevo."
}

type Result =
	| { status: "idle" }
	| { status: "sending" }
	| { status: "done"; title: string }
	| { status: "error"; message: string }

/** The business creates missions that unlock one of its products. */
const MissionsAdmin = ({ address }: { address: string }) => {
	const uid = useId()
	const queryClient = useQueryClient()
	const { missions, isLoading, error, missingTable } = useMissions()
	const { custom } = useProducts()
	const [values, setValues] = useState<Values>(EMPTY)
	const [errors, setErrors] = useState<Errors>({})
	const [result, setResult] = useState<Result>({ status: "idle" })

	const id = (key: FieldKey) => `${uid}-${key}`
	const mine = useMemo(
		() => missions.filter((m) => m.store === address),
		[missions, address],
	)

	// Own products first, then the base models. The exact name is what is saved.
	const options = useMemo(() => {
		const own = custom
			.filter((p) => p.store === address)
			.map((p) => ({ name: p.name, label: `${p.name} (producto propio)` }))
		const ownNames = new Set(own.map((p) => p.name))
		const base = MODELS.filter((m) => !ownNames.has(m.name)).map((m) => ({
			name: m.name,
			label: `${m.name} (modelo base)`,
		}))
		return [...own, ...base]
	}, [custom, address])

	const set = (key: FieldKey, value: string) => {
		setValues((prev) => ({ ...prev, [key]: value }))
		if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
	}

	/** Mirrors the CHECK constraints of `missions`. */
	const validate = (v: Values): Errors => {
		const found: Errors = {}
		const title = v.title.trim()
		if (title.length < LIMITS.titleMin || title.length > LIMITS.title) {
			found.title = `El título debe tener entre ${LIMITS.titleMin} y ${LIMITS.title} caracteres.`
		}
		if (v.description.trim().length > LIMITS.description) {
			found.description = `La descripción admite hasta ${LIMITS.description} caracteres.`
		}
		if (!MISSION_KINDS.some((k) => k.kind === v.kind)) {
			found.kind = "Elija un tipo de la lista."
		}
		const target = Number(v.target)
		if (
			!/^\d+$/.test(v.target.trim()) ||
			target < LIMITS.targetMin ||
			target > LIMITS.targetMax
		) {
			found.target = `La meta debe ser un número entero entre ${LIMITS.targetMin} y ${LIMITS.targetMax}.`
		}
		if (!v.reward) {
			found.reward = "Elija el producto que se desbloquea."
		} else if (
			v.reward.length < LIMITS.rewardMin ||
			v.reward.length > LIMITS.reward
		) {
			found.reward = `El nombre del producto debe tener entre ${LIMITS.rewardMin} y ${LIMITS.reward} caracteres.`
		}
		return found
	}

	const submit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const found = validate(values)
		setErrors(found)
		const first = (Object.keys(EMPTY) as FieldKey[]).find((k) => found[k])
		if (first) {
			document.getElementById(id(first))?.focus()
			setResult({
				status: "error",
				message: "Revise los campos marcados antes de guardar.",
			})
			return
		}

		const title = values.title.trim()
		setResult({ status: "sending" })
		try {
			await createMissionRow({
				store_wallet: address,
				title,
				description: values.description.trim(),
				kind: values.kind as MissionKind,
				target: Number(values.target),
				reward_product: values.reward,
			})
			await queryClient.invalidateQueries({ queryKey: MISSIONS_KEY })
			setValues(EMPTY)
			setResult({ status: "done", title })
		} catch (e) {
			setResult({ status: "error", message: describeError(e) })
		}
	}

	const sending = result.status === "sending"

	const fieldProps = (key: FieldKey, hint?: boolean) => ({
		id: id(key),
		"aria-invalid": errors[key] ? (true as const) : undefined,
		"aria-describedby":
			[errors[key] ? `${id(key)}-error` : "", hint ? `${id(key)}-hint` : ""]
				.filter(Boolean)
				.join(" ") || undefined,
		disabled: sending,
	})

	const fieldError = (key: FieldKey) =>
		errors[key] ? (
			<p id={`${id(key)}-error`} className={styles.fieldError}>
				{errors[key]}
			</p>
		) : null

	return (
		<section className={styles.section} aria-labelledby={`${uid}-title`}>
			<h2 id={`${uid}-title`}>Misiones de su negocio</h2>
			<p className={styles.muted}>
				Una misión pide algo a la persona (por ejemplo, reclamar ítems) y, al
				cumplirla, desbloquea uno de sus productos.
			</p>

			<h3>Sus misiones</h3>
			{isLoading ? (
				<p className={styles.muted} role="status">
					Cargando misiones...
				</p>
			) : missingTable ? (
				<p className={`${styles.notice} ${styles.warning}`} role="alert">
					Falta crear la tabla de misiones. Abra Supabase &gt; SQL Editor, pegue
					el contenido de {MIGRATION} y pulse Run.
				</p>
			) : error ? (
				<p className={`${styles.notice} ${styles.error}`} role="alert">
					No se pudieron cargar las misiones. Revise su conexión y recargue la
					página.
				</p>
			) : mine.length === 0 ? (
				<p className={styles.muted}>Aún no creó misiones.</p>
			) : (
				<ul className={styles.list}>
					{mine.map((m) => (
						<li key={m.id} className={styles.mission}>
							<h4>{m.title}</h4>
							{m.description && <p>{m.description}</p>}
							<p>
								<strong>Requisito:</strong> {describeRequirement(m)}
							</p>
							<p>
								<strong>Recompensa:</strong> desbloquea{" "}
								<span className={styles.badge}>{m.rewardProduct}</span>
							</p>
						</li>
					))}
				</ul>
			)}

			<h3>Crear una misión</h3>
			<p className={`${styles.notice} ${styles.warning}`}>
				El bloqueo se comprueba en la aplicación. Los productos de esta misión
				solo se podrán comprar a su negocio cuando la persona la complete.
				Conviene que el producto ya tenga unidades registradas en «Registrar
				unidades». Una misión creada no se edita ni se borra desde la app.
			</p>
			<form className={styles.form} onSubmit={(e) => void submit(e)} noValidate>
				<div className={`${styles.field} ${styles.wide}`}>
					<label htmlFor={id("title")}>
						Título <span className={styles.required}>*</span>
					</label>
					<input
						{...fieldProps("title")}
						type="text"
						value={values.title}
						maxLength={LIMITS.title}
						required
						onChange={(e) => set("title", e.target.value)}
					/>
					{fieldError("title")}
				</div>

				<div className={`${styles.field} ${styles.wide}`}>
					<label htmlFor={id("description")}>Descripción</label>
					<textarea
						{...fieldProps("description", true)}
						value={values.description}
						maxLength={LIMITS.description}
						onChange={(e) => set("description", e.target.value)}
					/>
					<p id={`${id("description")}-hint`} className={styles.counter}>
						{values.description.length} / {LIMITS.description} caracteres
					</p>
					{fieldError("description")}
				</div>

				<div className={styles.field}>
					<label htmlFor={id("kind")}>
						Tipo <span className={styles.required}>*</span>
					</label>
					<select
						{...fieldProps("kind")}
						value={values.kind}
						onChange={(e) => set("kind", e.target.value)}
					>
						{MISSION_KINDS.map((k) => (
							<option key={k.kind} value={k.kind}>
								{k.label}
							</option>
						))}
					</select>
					{fieldError("kind")}
				</div>

				<div className={styles.field}>
					<label htmlFor={id("target")}>
						Meta <span className={styles.required}>*</span>
					</label>
					<input
						{...fieldProps("target", true)}
						type="number"
						inputMode="numeric"
						min={LIMITS.targetMin}
						max={LIMITS.targetMax}
						step={1}
						value={values.target}
						required
						onChange={(e) => set("target", e.target.value)}
					/>
					<p id={`${id("target")}-hint`} className={styles.hint}>
						Cantidad a cumplir, de {LIMITS.targetMin} a {LIMITS.targetMax}.
					</p>
					{fieldError("target")}
				</div>

				<div className={`${styles.field} ${styles.wide}`}>
					<label htmlFor={id("reward")}>
						Producto que desbloquea <span className={styles.required}>*</span>
					</label>
					<select
						{...fieldProps("reward", true)}
						value={values.reward}
						required
						onChange={(e) => set("reward", e.target.value)}
					>
						<option value="">Elija un producto</option>
						{options.map((o) => (
							<option key={o.name} value={o.name}>
								{o.label}
							</option>
						))}
					</select>
					<p id={`${id("reward")}-hint`} className={styles.hint}>
						Aparecen sus productos propios y los modelos base. Se guarda el
						nombre exacto.
					</p>
					{fieldError("reward")}
				</div>

				<div className={styles.live} aria-live="polite">
					{result.status === "sending" && (
						<p className={styles.notice} role="status">
							Guardando la misión...
						</p>
					)}
					{result.status === "done" && (
						<p className={`${styles.notice} ${styles.success}`} role="status">
							Misión «{result.title}» creada.
						</p>
					)}
					{result.status === "error" && (
						<p className={`${styles.notice} ${styles.error}`} role="alert">
							{result.message}
						</p>
					)}
				</div>

				<button type="submit" className={styles.primary} disabled={sending}>
					{sending ? "Guardando..." : "Crear misión"}
				</button>
			</form>
		</section>
	)
}

export default MissionsAdmin
