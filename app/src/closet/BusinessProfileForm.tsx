import { useQueryClient } from "@tanstack/react-query"
import { useId, useState, type FormEvent } from "react"
import { Link } from "react-router-dom"
import {
	createBusinessProfile,
	isMissingTable,
	SupabaseError,
	type StoreCategory,
} from "../lib/supabase"
import styles from "./admin.module.css"
import { PROFILES_KEY, useBusinesses } from "./useBusinesses"

const MIGRATION =
	"supabase/migrations/20261017120000_products_missions_profiles.sql"

const CATEGORIES: { value: StoreCategory; label: string }[] = [
	{ value: "ropa", label: "Ropa" },
	{ value: "muebles", label: "Muebles" },
	{ value: "ambos", label: "Ropa y muebles" },
]

const LIMITS = {
	nameMin: 2,
	name: 60,
	tagline: 120,
	story: 2000,
	place: 60,
	instagram: 60,
	yearMin: 1800,
	yearMax: 2100,
}

type FieldKey =
	| "name"
	| "category"
	| "tagline"
	| "story"
	| "city"
	| "province"
	| "instagram"
	| "year"

type Values = Record<FieldKey, string>
type Errors = Partial<Record<FieldKey, string>>

const EMPTY: Values = {
	name: "",
	category: "ropa",
	tagline: "",
	story: "",
	city: "",
	province: "",
	instagram: "",
	year: "",
}

/** "@mi_tienda", "https://instagram.com/mi_tienda/" y "mi_tienda" dan "mi_tienda". */
function normalizeInstagram(raw: string) {
	return (
		raw
			.trim()
			.replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
			.replace(/^@+/, "")
			.split(/[/?#]/)[0] ?? ""
	).replace(/\s+/g, "")
}

/** Mirrors the CHECK constraints of `business_profiles`. */
function validate(v: Values): Errors {
	const errors: Errors = {}
	const name = v.name.trim()
	if (name.length < LIMITS.nameMin || name.length > LIMITS.name) {
		errors.name = `El nombre debe tener entre ${LIMITS.nameMin} y ${LIMITS.name} caracteres.`
	}
	if (!CATEGORIES.some((c) => c.value === v.category)) {
		errors.category = "Elija una categoría de la lista."
	}
	if (v.tagline.trim().length > LIMITS.tagline) {
		errors.tagline = `El eslogan admite hasta ${LIMITS.tagline} caracteres.`
	}
	if (v.story.trim().length > LIMITS.story) {
		errors.story = `La historia admite hasta ${LIMITS.story} caracteres.`
	}
	if (v.city.trim().length > LIMITS.place) {
		errors.city = `La ciudad admite hasta ${LIMITS.place} caracteres.`
	}
	if (v.province.trim().length > LIMITS.place) {
		errors.province = `La provincia admite hasta ${LIMITS.place} caracteres.`
	}
	const instagram = normalizeInstagram(v.instagram)
	if (instagram.length > LIMITS.instagram) {
		errors.instagram = `El usuario admite hasta ${LIMITS.instagram} caracteres.`
	} else if (!/^[A-Za-z0-9._]*$/.test(instagram)) {
		errors.instagram = "Use solo letras, números, puntos o guiones bajos."
	}
	const year = v.year.trim()
	if (year) {
		const n = Number(year)
		if (!/^\d+$/.test(year) || n < LIMITS.yearMin || n > LIMITS.yearMax) {
			errors.year = `Escriba un año entre ${LIMITS.yearMin} y ${LIMITS.yearMax}, o déjelo vacío.`
		}
	}
	return errors
}

function describeError(e: unknown) {
	if (isMissingTable(e)) {
		return `Falta crear la tabla de perfiles. Abra Supabase > SQL Editor, pegue el contenido de ${MIGRATION} y pulse Run. Luego vuelva a intentarlo.`
	}
	if (e instanceof SupabaseError) {
		if (e.status === 409) {
			return "Ya existe un perfil para esta dirección. Recargue la página para verlo."
		}
		if (e.status === 0) {
			return "Falta configurar Supabase (PUBLIC_SUPABASE_URL y PUBLIC_SUPABASE_PUBLISHABLE_KEY en app/.env)."
		}
		return `No se pudo guardar el perfil (código ${e.status}). Revise los datos e inténtelo de nuevo.`
	}
	return "No hay conexión con el servidor. Revise su internet e inténtelo de nuevo."
}

type Result =
	| { status: "idle" }
	| { status: "sending" }
	| { status: "done" }
	| { status: "error"; message: string }

/** The business makes its public profile. The database allows creating, not editing. */
const BusinessProfileForm = ({ address }: { address: string }) => {
	const uid = useId()
	const queryClient = useQueryClient()
	const { byWallet, isPending } = useBusinesses()
	const [values, setValues] = useState<Values>(EMPTY)
	const [errors, setErrors] = useState<Errors>({})
	const [result, setResult] = useState<Result>({ status: "idle" })

	const id = (key: FieldKey) => `${uid}-${key}`
	const existing = byWallet(address)

	const set = (key: FieldKey, value: string) => {
		setValues((prev) => ({ ...prev, [key]: value }))
		if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
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

		const orNull = (s: string) => (s.trim() ? s.trim() : null)
		setResult({ status: "sending" })
		try {
			await createBusinessProfile({
				wallet: address,
				name: values.name.trim(),
				category: values.category as StoreCategory,
				tagline: orNull(values.tagline),
				story: orNull(values.story),
				city: orNull(values.city),
				province: orNull(values.province),
				instagram: orNull(normalizeInstagram(values.instagram)),
				since_year: values.year.trim() ? Number(values.year.trim()) : null,
			})
			await queryClient.invalidateQueries({ queryKey: PROFILES_KEY })
			setResult({ status: "done" })
		} catch (e) {
			if (e instanceof SupabaseError && e.status === 409) {
				void queryClient.invalidateQueries({ queryKey: PROFILES_KEY })
			}
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

	if (existing) {
		const category = CATEGORIES.find((c) => c.value === existing.category)
		const place = [existing.city, existing.province].filter(Boolean).join(", ")
		const rows: [string, string | null][] = [
			["Nombre", existing.name],
			["Categoría", category?.label ?? existing.category],
			["Eslogan", existing.tagline],
			["Ubicación", place || null],
			["Instagram", existing.instagram ? `@${existing.instagram}` : null],
			["Desde", existing.sinceYear ? String(existing.sinceYear) : null],
		]
		return (
			<section className={styles.section} aria-labelledby={`${uid}-title`}>
				<h2 id={`${uid}-title`}>Perfil del negocio</h2>
				<dl className={styles.readonly}>
					{rows.map(([label, value]) => (
						<div key={label}>
							<dt>{label}</dt>
							<dd>{value ?? "Sin completar"}</dd>
						</div>
					))}
					<div style={{ gridColumn: "1 / -1" }}>
						<dt>Nuestra historia</dt>
						<dd>{existing.story ?? "Sin completar"}</dd>
					</div>
				</dl>
				<p className={`${styles.notice} ${styles.success}`} role="status">
					El perfil ya está creado; por ahora solo se cambia desde el panel de
					Supabase.
				</p>
				<p>
					<Link className={styles.link} to={`/tiendas/${existing.ref}`}>
						Ver perfil público
					</Link>
				</p>
			</section>
		)
	}

	if (isPending) {
		return (
			<section className={styles.section}>
				<p className={styles.muted} role="status">
					Buscando su perfil...
				</p>
			</section>
		)
	}

	return (
		<section className={styles.section} aria-labelledby={`${uid}-title`}>
			<h2 id={`${uid}-title`}>Cree el perfil de su negocio</h2>
			<p className={styles.muted}>
				Es público: lo verá cualquier persona en la lista de negocios. No
				escriba datos personales. Una vez creado, no se edita desde la app.
			</p>
			<form className={styles.form} onSubmit={(e) => void submit(e)} noValidate>
				<div className={styles.field}>
					<label htmlFor={id("name")}>
						Nombre <span className={styles.required}>*</span>
					</label>
					<input
						{...fieldProps("name")}
						type="text"
						value={values.name}
						maxLength={LIMITS.name}
						autoComplete="organization"
						required
						onChange={(e) => set("name", e.target.value)}
					/>
					{fieldError("name")}
				</div>

				<div className={styles.field}>
					<label htmlFor={id("category")}>
						Categoría <span className={styles.required}>*</span>
					</label>
					<select
						{...fieldProps("category")}
						value={values.category}
						onChange={(e) => set("category", e.target.value)}
					>
						{CATEGORIES.map((c) => (
							<option key={c.value} value={c.value}>
								{c.label}
							</option>
						))}
					</select>
					{fieldError("category")}
				</div>

				<div className={`${styles.field} ${styles.wide}`}>
					<label htmlFor={id("tagline")}>Eslogan</label>
					<input
						{...fieldProps("tagline", true)}
						type="text"
						value={values.tagline}
						maxLength={LIMITS.tagline}
						onChange={(e) => set("tagline", e.target.value)}
					/>
					<p id={`${id("tagline")}-hint`} className={styles.hint}>
						Una frase corta, hasta {LIMITS.tagline} caracteres.
					</p>
					{fieldError("tagline")}
				</div>

				<div className={`${styles.field} ${styles.wide}`}>
					<label htmlFor={id("story")}>Nuestra historia</label>
					<textarea
						{...fieldProps("story", true)}
						value={values.story}
						maxLength={LIMITS.story}
						onChange={(e) => set("story", e.target.value)}
					/>
					<p id={`${id("story")}-hint`} className={styles.counter}>
						{values.story.length} / {LIMITS.story} caracteres
					</p>
					{fieldError("story")}
				</div>

				<div className={styles.field}>
					<label htmlFor={id("city")}>Ciudad</label>
					<input
						{...fieldProps("city")}
						type="text"
						value={values.city}
						maxLength={LIMITS.place}
						autoComplete="address-level2"
						onChange={(e) => set("city", e.target.value)}
					/>
					{fieldError("city")}
				</div>

				<div className={styles.field}>
					<label htmlFor={id("province")}>Provincia</label>
					<input
						{...fieldProps("province")}
						type="text"
						value={values.province}
						maxLength={LIMITS.place}
						autoComplete="address-level1"
						onChange={(e) => set("province", e.target.value)}
					/>
					{fieldError("province")}
				</div>

				<div className={styles.field}>
					<label htmlFor={id("instagram")}>Instagram</label>
					<input
						{...fieldProps("instagram", true)}
						type="text"
						value={values.instagram}
						autoCapitalize="none"
						autoCorrect="off"
						spellCheck={false}
						onChange={(e) => set("instagram", e.target.value)}
					/>
					<p id={`${id("instagram")}-hint`} className={styles.hint}>
						Solo el usuario, sin @ ni enlace. Ejemplo: mi_tienda
					</p>
					{fieldError("instagram")}
				</div>

				<div className={styles.field}>
					<label htmlFor={id("year")}>Año de fundación</label>
					<input
						{...fieldProps("year", true)}
						type="text"
						inputMode="numeric"
						value={values.year}
						maxLength={4}
						onChange={(e) => set("year", e.target.value)}
					/>
					<p id={`${id("year")}-hint`} className={styles.hint}>
						Opcional. Entre {LIMITS.yearMin} y {LIMITS.yearMax}.
					</p>
					{fieldError("year")}
				</div>

				<div className={`${styles.live} `} aria-live="polite">
					{result.status === "sending" && (
						<p className={styles.notice} role="status">
							Guardando el perfil...
						</p>
					)}
					{result.status === "done" && (
						<p className={`${styles.notice} ${styles.success}`} role="status">
							Perfil creado.
						</p>
					)}
					{result.status === "error" && (
						<p className={`${styles.notice} ${styles.error}`} role="alert">
							{result.message}
						</p>
					)}
				</div>

				<button type="submit" className={styles.primary} disabled={sending}>
					{sending ? "Guardando..." : "Crear perfil"}
				</button>
			</form>
		</section>
	)
}

export default BusinessProfileForm
