import { useQueryClient } from "@tanstack/react-query"
import { useMemo, useState, type FormEvent } from "react"
import { createProductRow, SupabaseError } from "../lib/supabase"
import styles from "./business.module.css"
import { CATEGORY_LABEL, MODELS } from "./catalog"
import { ModelThumb } from "./components"
import { formatXlm } from "./money"
import { PRODUCTS_KEY, useProducts } from "./useProducts"

const MIGRATION =
	"supabase/migrations/20261017120000_products_missions_profiles.sql"
const HEX = /^#[0-9a-fA-F]{6}$/
const PALETTE = [
	{ hex: "#ef4444", name: "Rojo" },
	{ hex: "#f97316", name: "Naranja" },
	{ hex: "#facc15", name: "Amarillo" },
	{ hex: "#16a34a", name: "Verde" },
	{ hex: "#14b8a6", name: "Turquesa" },
	{ hex: "#2563eb", name: "Azul" },
	{ hex: "#7c3aed", name: "Violeta" },
	{ hex: "#ec4899", name: "Rosa" },
	{ hex: "#92400e", name: "Café" },
	{ hex: "#0b1020", name: "Negro" },
]

const normalize = (text: string) =>
	text.normalize("NFD").replace(/[̀-ͯ]/g, "").trim().toLowerCase()

type Result =
	| { status: "idle" }
	| { status: "saving" }
	| { status: "done"; name: string }
	| { status: "error"; message: string }

const MissingTableNotice = () => (
	<p className={`${styles.notice} ${styles.warning}`} role="alert">
		La tabla de productos todavía no existe en Supabase. Aplique el archivo{" "}
		<code>{MIGRATION}</code> en Supabase &gt; SQL Editor y vuelva a intentar.
	</p>
)

/** Parses a price typed by hand: more than 0, at most 100000, 2 decimals. */
function parsePrice(text: string): number | null {
	const clean = text.trim().replace(",", ".")
	if (!/^\d+(\.\d{1,2})?$/.test(clean)) return null
	const value = Number(clean)
	return value > 0 && value <= 100000 ? value : null
}

const ProductForm = ({ address }: { address: string }) => {
	const queryClient = useQueryClient()
	const { custom, isLoading, missingTable, error } = useProducts()
	const mine = useMemo(
		() => custom.filter((p) => p.store === address),
		[custom, address],
	)

	const [name, setName] = useState("")
	const [modelKey, setModelKey] = useState(MODELS[0]?.key ?? "")
	const [color, setColor] = useState(MODELS[0]?.color ?? "#b8431f")
	const [colorTouched, setColorTouched] = useState(false)
	const [price, setPrice] = useState("")
	const [description, setDescription] = useState("")
	const [touched, setTouched] = useState(false)
	const [result, setResult] = useState<Result>({ status: "idle" })

	const base = MODELS.find((m) => m.key === modelKey) ?? MODELS[0]

	const trimmed = name.trim()
	const nameError =
		trimmed.length < 2 || trimmed.length > 40
			? "El nombre debe tener entre 2 y 40 caracteres."
			: mine.some((p) => normalize(p.name) === normalize(trimmed))
				? "Ya tiene un producto con ese nombre."
				: null
	const priceValue = parsePrice(price)
	const priceError =
		priceValue === null
			? "Escriba un precio mayor que 0 y hasta 100000 XLM, con máximo 2 decimales."
			: null
	const colorError = HEX.test(color) ? null : "Elija un color válido."
	const descError =
		description.length > 300
			? "La descripción admite hasta 300 caracteres."
			: null
	const invalid = Boolean(nameError ?? priceError ?? colorError ?? descError)

	const pickModel = (key: string) => {
		setModelKey(key)
		const next = MODELS.find((m) => m.key === key)
		if (next && !colorTouched) setColor(next.color)
	}

	const pickColor = (hex: string) => {
		setColor(hex)
		setColorTouched(true)
	}

	const submit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		setTouched(true)
		if (invalid || !base || priceValue === null) {
			setResult({
				status: "error",
				message: "Revise los campos marcados antes de guardar.",
			})
			return
		}
		setResult({ status: "saving" })
		try {
			await createProductRow({
				store_wallet: address,
				name: trimmed,
				model_key: base.key,
				color,
				price_xlm: priceValue,
				description: description.trim(),
			})
			await queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY })
			setResult({ status: "done", name: trimmed })
			setName("")
			setPrice("")
			setDescription("")
			setTouched(false)
		} catch (e) {
			if (e instanceof SupabaseError && e.status === 409) {
				setResult({
					status: "error",
					message: "Ya tiene un producto con ese nombre.",
				})
			} else if (e instanceof SupabaseError && e.status === 404) {
				setResult({
					status: "error",
					message: `Falta crear la tabla de productos: aplique ${MIGRATION} en Supabase > SQL Editor.`,
				})
			} else {
				console.error(e)
				setResult({
					status: "error",
					message:
						"No se pudo guardar el producto. Revise su conexión e intente de nuevo.",
				})
			}
		}
	}

	if (!base) return null
	const saving = result.status === "saving"
	const preview = {
		...base,
		name: trimmed || base.name,
		color: HEX.test(color) ? color : base.color,
		priceXlm: priceValue ?? 0,
	}

	return (
		<div className={styles.section}>
			<section className={styles.panel} aria-labelledby="new-product">
				<h2 id="new-product">Crear un producto propio</h2>
				<p className={styles.muted}>
					Elija un diseño base, póngale su nombre, color y precio en XLM. Luego
					podrá registrar unidades de él.
				</p>
				{missingTable && <MissingTableNotice />}
				<div className={styles.formGrid}>
					<form
						className={styles.form}
						onSubmit={(e) => void submit(e)}
						noValidate
					>
						<div className={styles.field}>
							<label htmlFor="p-name">Nombre (2 a 40 caracteres)</label>
							<input
								id="p-name"
								type="text"
								maxLength={40}
								value={name}
								disabled={saving}
								aria-invalid={touched && nameError ? true : undefined}
								aria-describedby={
									touched && nameError ? "p-name-err" : undefined
								}
								onChange={(e) => setName(e.target.value)}
							/>
							{touched && nameError && (
								<p id="p-name-err" className={styles.fieldError}>
									{nameError}
								</p>
							)}
						</div>

						<div className={styles.field}>
							<label htmlFor="p-model">Diseño base</label>
							<select
								id="p-model"
								value={modelKey}
								disabled={saving}
								onChange={(e) => pickModel(e.target.value)}
							>
								{MODELS.map((m) => (
									<option key={m.key} value={m.key}>
										{m.name} ({CATEGORY_LABEL[m.category]})
									</option>
								))}
							</select>
							<span className={styles.muted}>
								El diseño define dónde se usa y su categoría.
							</span>
						</div>

						<fieldset className={styles.field}>
							<legend>Color</legend>
							<div className={styles.swatches}>
								{PALETTE.map((c) => (
									<button
										key={c.hex}
										type="button"
										className={styles.swatch}
										style={{ background: c.hex }}
										aria-label={c.name}
										aria-pressed={color.toLowerCase() === c.hex}
										disabled={saving}
										onClick={() => pickColor(c.hex)}
									/>
								))}
								<input
									type="color"
									className={styles.colorInput}
									aria-label="Otro color"
									value={HEX.test(color) ? color : "#000000"}
									disabled={saving}
									onChange={(e) => pickColor(e.target.value)}
								/>
								<span className={styles.hex}>{color}</span>
							</div>
							{touched && colorError && (
								<p className={styles.fieldError}>{colorError}</p>
							)}
						</fieldset>

						<div className={styles.field}>
							<label htmlFor="p-price">Precio en XLM</label>
							<input
								id="p-price"
								type="text"
								inputMode="decimal"
								placeholder="Por ejemplo: 85.50"
								value={price}
								disabled={saving}
								aria-invalid={touched && priceError ? true : undefined}
								aria-describedby={
									touched && priceError ? "p-price-err" : undefined
								}
								onChange={(e) => setPrice(e.target.value)}
							/>
							{touched && priceError && (
								<p id="p-price-err" className={styles.fieldError}>
									{priceError}
								</p>
							)}
						</div>

						<div className={styles.field}>
							<label htmlFor="p-desc">Descripción (opcional)</label>
							<textarea
								id="p-desc"
								maxLength={300}
								value={description}
								disabled={saving}
								aria-describedby="p-desc-count"
								onChange={(e) => setDescription(e.target.value)}
							/>
							<span id="p-desc-count" className={styles.muted}>
								{description.length} de 300 caracteres
							</span>
						</div>

						<button type="submit" className={styles.primary} disabled={saving}>
							{saving ? "Guardando..." : "Guardar producto"}
						</button>

						<div aria-live="polite">
							{result.status === "done" && (
								<p
									className={`${styles.notice} ${styles.success}`}
									role="status"
								>
									Producto «{result.name}» guardado. Ya puede registrar
									unidades.
								</p>
							)}
							{result.status === "error" && (
								<p className={`${styles.notice} ${styles.error}`} role="alert">
									{result.message}
								</p>
							)}
						</div>
					</form>

					<aside
						className={styles.preview}
						aria-label="Vista previa del producto"
					>
						<div className={styles.previewArt} aria-hidden="true">
							<ModelThumb model={preview} />
						</div>
						<strong>{preview.name}</strong>
						<span className={styles.badge}>
							{CATEGORY_LABEL[base.category]}
						</span>
						<span className={styles.price}>
							{priceValue === null ? "Sin precio" : formatXlm(priceValue)}
						</span>
					</aside>
				</div>
			</section>

			<section className={styles.panel} aria-labelledby="my-products">
				<h2 id="my-products">Mis productos ({mine.length})</h2>
				{isLoading && <p role="status">Cargando productos...</p>}
				{!isLoading && error && !missingTable && (
					<p className={`${styles.notice} ${styles.error}`} role="alert">
						No se pudieron cargar sus productos. Revise su conexión.
					</p>
				)}
				{!isLoading && !error && mine.length === 0 && (
					<p className={styles.empty}>
						Todavía no creó productos propios. Mientras tanto puede registrar
						unidades de los diseños base.
					</p>
				)}
				{mine.length > 0 && (
					<ul className={styles.cards}>
						{mine.map((p) => (
							<li key={p.name} className={styles.card}>
								<div className={styles.cardArt} aria-hidden="true">
									<ModelThumb model={p} />
								</div>
								<strong>{p.name}</strong>
								<span className={styles.badge}>
									{CATEGORY_LABEL[p.category]}
								</span>
								<span className={styles.price}>{formatXlm(p.priceXlm)}</span>
								{p.desc && <span className={styles.muted}>{p.desc}</span>}
							</li>
						))}
					</ul>
				)}
			</section>
		</div>
	)
}

export default ProductForm
