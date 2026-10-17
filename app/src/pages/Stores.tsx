import { type ReactNode, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import styles from "../closet/stores.module.css"
import { type Business, useBusinesses } from "../closet/useBusinesses"
import { useProducts } from "../closet/useProducts"
import { type StoreCategory } from "../lib/supabase"

const PAGE_SIZE = 12

const CATEGORY_LABEL: Record<StoreCategory, string> = {
	ropa: "Ropa",
	muebles: "Muebles",
	ambos: "Ropa y muebles",
}

type CategoryFilter = "todas" | StoreCategory

const CATEGORY_OPTIONS: { value: CategoryFilter; label: string }[] = [
	{ value: "todas", label: "Todas" },
	{ value: "ropa", label: "Ropa" },
	{ value: "muebles", label: "Muebles" },
	{ value: "ambos", label: "Ropa y muebles" },
]

const normalize = (text: string) =>
	text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()

const Icon = ({ children }: { children: ReactNode }) => (
	<svg
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="1.8"
		strokeLinecap="round"
		strokeLinejoin="round"
		aria-hidden="true"
	>
		{children}
	</svg>
)

const CategoryIcon = ({ category }: { category: StoreCategory }) => {
	if (category === "ropa") {
		return (
			<Icon>
				<path d="M9 4l-6 3 2 4 3-1v10h8V10l3 1 2-4-6-3a3 3 0 0 1-6 0z" />
			</Icon>
		)
	}
	if (category === "muebles") {
		return (
			<Icon>
				<path d="M5 11V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3M3 13a2 2 0 0 1 4 0v2h10v-2a2 2 0 0 1 4 0v5H3zM6 18v2M18 18v2" />
			</Icon>
		)
	}
	return (
		<Icon>
			<path d="M4 9l1-4h14l1 4M4 9v10h16V9M4 9h16M10 19v-5h4v5" />
		</Icon>
	)
}

const PinIcon = () => (
	<Icon>
		<path d="M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11z" />
		<circle cx="12" cy="10" r="2" />
	</Icon>
)

const StarIcon = () => (
	<Icon>
		<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />
	</Icon>
)

const SearchIcon = () => (
	<Icon>
		<circle cx="11" cy="11" r="6" />
		<path d="M20 20l-4.5-4.5" />
	</Icon>
)

const StoreCard = ({
	store,
	productCount,
}: {
	store: Business
	productCount: number
}) => {
	const place = [store.city, store.province].filter(Boolean).join(", ")
	const tags = store.tags
	const rating = store.rating
	const titleId = `store-${store.ref}`
	const summary = store.description || store.tagline
	return (
		<li
			className={`${styles.card} ${store.featured ? styles.cardFeatured : ""}`}
			aria-labelledby={titleId}
		>
			{(store.example || store.featured) && (
				<div className={styles.badges}>
					{store.example && (
						<span className={styles.badgeExample}>Ejemplo</span>
					)}
					{store.featured && (
						<span className={styles.badgeFeatured}>
							<StarIcon />
							Destacada
						</span>
					)}
				</div>
			)}
			<h3 id={titleId} className={styles.cardTitle}>
				{store.name}
			</h3>
			<p className={styles.meta}>
				<span className={styles.metaItem}>
					<CategoryIcon category={store.category} />
					{CATEGORY_LABEL[store.category] ?? store.category}
				</span>
				{place && (
					<span className={styles.metaItem}>
						<PinIcon />
						{place}
					</span>
				)}
			</p>
			{store.tagline && store.description && (
				<p className={styles.tagline}>{store.tagline}</p>
			)}
			<p className={styles.description}>{summary}</p>
			{tags.length > 0 && (
				<ul className={styles.chips} aria-label="Etiquetas">
					{tags.map((tag) => (
						<li key={tag} className={styles.chip}>
							{tag}
						</li>
					))}
				</ul>
			)}
			{(store.sinceYear || rating !== null || productCount > 0) && (
				<p className={styles.facts}>
					{store.sinceYear && <span>Desde {store.sinceYear}</span>}
					{productCount > 0 && (
						<span className={styles.productCount}>
							{productCount}{" "}
							{productCount === 1 ? "producto propio" : "productos propios"}
						</span>
					)}
					{rating !== null && (
						<span className={styles.metaItem}>
							<StarIcon />
							{rating.toFixed(1)} de 5
						</span>
					)}
				</p>
			)}
			<Link
				to={`/tiendas/${encodeURIComponent(store.ref)}`}
				className={styles.cardLink}
			>
				Ver perfil y productos
				<span className={styles.srOnly}> de {store.name}</span>
			</Link>
		</li>
	)
}

const Skeletons = () => (
	<ul className={styles.grid} aria-hidden="true">
		{Array.from({ length: 6 }, (_, i) => (
			<li key={i} className={`${styles.card} ${styles.skeleton}`} />
		))}
	</ul>
)

const Stores = () => {
	const { businesses: stores, isPending, isError } = useBusinesses()
	const { custom } = useProducts()
	const [query, setQuery] = useState("")
	const [category, setCategory] = useState<CategoryFilter>("todas")
	const [province, setProvince] = useState("")
	const [onlyFeatured, setOnlyFeatured] = useState(false)
	const [visible, setVisible] = useState(PAGE_SIZE)

	const productCounts = useMemo(() => {
		const counts = new Map<string, number>()
		for (const p of custom) {
			if (p.store) counts.set(p.store, (counts.get(p.store) ?? 0) + 1)
		}
		return counts
	}, [custom])
	const hasExample = stores.some((s) => s.example)
	const provinces = useMemo(
		() =>
			[
				...new Set(
					stores.map((s) => s.province).filter((p): p is string => !!p),
				),
			].sort((a, b) => a.localeCompare(b, "es")),
		[stores],
	)
	const hasFeatured = stores.some((s) => s.featured)

	const filtered = useMemo(() => {
		const q = normalize(query.trim())
		return stores.filter((s) => {
			if (category !== "todas" && s.category !== category) return false
			if (province && s.province !== province) return false
			if (onlyFeatured && !s.featured) return false
			if (!q) return true
			const haystack = normalize([s.name, s.city ?? "", ...s.tags].join(" "))
			return haystack.includes(q)
		})
	}, [stores, query, category, province, onlyFeatured])

	const reset = () => {
		setQuery("")
		setCategory("todas")
		setProvince("")
		setOnlyFeatured(false)
		setVisible(PAGE_SIZE)
	}
	const shown = filtered.slice(0, visible)

	return (
		<div className={styles.page}>
			<h1>Directorio de tiendas</h1>
			{!isPending && (
				<p className={styles.count}>
					{stores.length} {stores.length === 1 ? "tienda" : "tiendas"} en total
				</p>
			)}
			{hasExample && (
				<p className={styles.notice}>
					Las tiendas marcadas como Ejemplo son datos de demostración.
				</p>
			)}

			<form
				className={styles.filters}
				role="search"
				onSubmit={(e) => e.preventDefault()}
			>
				<div className={styles.field}>
					<label htmlFor="stores-search">
						Buscar por nombre, etiqueta o ciudad
					</label>
					<div className={styles.searchWrap}>
						<SearchIcon />
						<input
							id="stores-search"
							type="search"
							value={query}
							onChange={(e) => {
								setQuery(e.target.value)
								setVisible(PAGE_SIZE)
							}}
						/>
					</div>
				</div>
				<div className={styles.field}>
					<label htmlFor="stores-category">Categoría</label>
					<select
						id="stores-category"
						value={category}
						onChange={(e) => {
							setCategory(e.target.value as CategoryFilter)
							setVisible(PAGE_SIZE)
						}}
					>
						{CATEGORY_OPTIONS.map((o) => (
							<option key={o.value} value={o.value}>
								{o.label}
							</option>
						))}
					</select>
				</div>
				{provinces.length > 0 && (
					<div className={styles.field}>
						<label htmlFor="stores-province">Provincia</label>
						<select
							id="stores-province"
							value={province}
							onChange={(e) => {
								setProvince(e.target.value)
								setVisible(PAGE_SIZE)
							}}
						>
							<option value="">Todas</option>
							{provinces.map((p) => (
								<option key={p} value={p}>
									{p}
								</option>
							))}
						</select>
					</div>
				)}
				{hasFeatured && (
					<label className={styles.check} htmlFor="stores-featured">
						<input
							id="stores-featured"
							type="checkbox"
							checked={onlyFeatured}
							onChange={(e) => {
								setOnlyFeatured(e.target.checked)
								setVisible(PAGE_SIZE)
							}}
						/>
						Solo destacadas
					</label>
				)}
			</form>

			{isPending && (
				<>
					<p className={styles.status} role="status">
						Cargando el directorio...
					</p>
					<Skeletons />
				</>
			)}
			{isError && stores.length === 0 && (
				<p className={styles.error} role="alert">
					No pudimos cargar el directorio ahora.
				</p>
			)}
			{!isPending && !isError && filtered.length === 0 && (
				<div className={styles.empty}>
					<p>Ninguna tienda coincide con su búsqueda</p>
					<button type="button" className={styles.button} onClick={reset}>
						Limpiar filtros
					</button>
				</div>
			)}
			{filtered.length > 0 && (
				<>
					<p className={styles.status} aria-live="polite">
						Mostrando {shown.length} de {filtered.length}
					</p>
					<ul className={styles.grid}>
						{shown.map((store) => (
							<StoreCard
								key={store.ref}
								store={store}
								productCount={
									store.wallet ? (productCounts.get(store.wallet) ?? 0) : 0
								}
							/>
						))}
					</ul>
					{shown.length < filtered.length && (
						<div className={styles.more}>
							<button
								type="button"
								className={styles.button}
								onClick={() => setVisible((v) => v + PAGE_SIZE)}
							>
								Mostrar más
							</button>
						</div>
					)}
				</>
			)}
		</div>
	)
}

export default Stores
