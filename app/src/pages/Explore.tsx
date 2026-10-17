import { useInfiniteQuery } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { CATEGORY_LABEL, findModel, type CategoryTag } from "../closet/catalog"
import {
	friendlyError,
	listItems,
	type ClosetItem,
} from "../closet/closetService"
import { Avatar, HomeScene } from "../closet/components"
import styles from "../closet/explore.module.css"

const PAGE_SIZE = 24
const SKELETONS = Array.from({ length: 8 }, (_, i) => i)

type CategoryFilter = "all" | CategoryTag
type StatusFilter = "all" | "available" | "claimed"

const normalize = (text: string) =>
	text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()

const Preview = ({ name }: { name: string }) => {
	const model = findModel(name)
	if (!model) return null
	return (
		<div className={styles.preview} aria-hidden="true">
			{model.slot === "furniture" ? (
				<HomeScene furniture={[{ key: model.key, color: model.color }]} />
			) : (
				<Avatar
					wear={[{ slot: model.slot, key: model.key, color: model.color }]}
				/>
			)}
		</div>
	)
}

const StatusIcon = ({ claimed }: { claimed: boolean }) => (
	<svg
		viewBox="0 0 24 24"
		width="14"
		height="14"
		fill="none"
		stroke="currentColor"
		strokeWidth="2.5"
		strokeLinecap="round"
		strokeLinejoin="round"
		aria-hidden="true"
	>
		{claimed ? (
			<path d="M5 12.5l4.5 4.5L19 7" />
		) : (
			<circle cx="12" cy="12" r="6" />
		)}
	</svg>
)

const ProductCard = ({ item }: { item: ClosetItem }) => (
	<li className={styles.card}>
		<Preview name={item.name} />
		<h3 className={styles.name}>{item.name}</h3>
		<div className={styles.meta}>
			<span className={styles.badge}>{CATEGORY_LABEL[item.category]}</span>
			<span className={styles.id}>n.º {item.id}</span>
		</div>
		<span
			className={`${styles.status} ${item.claimed ? styles.claimed : styles.available}`}
		>
			<StatusIcon claimed={item.claimed} />
			{item.claimed ? "Reclamado" : "Disponible"}
		</span>
	</li>
)

const Explore = () => {
	const [category, setCategory] = useState<CategoryFilter>("all")
	const [status, setStatus] = useState<StatusFilter>("all")
	const [search, setSearch] = useState("")

	const query = useInfiniteQuery({
		queryKey: ["closet", "products"],
		initialPageParam: 0,
		queryFn: ({ pageParam }) => listItems(pageParam, PAGE_SIZE),
		getNextPageParam: (last, pages) => {
			const loaded = pages.length * PAGE_SIZE
			return loaded < last.total ? loaded : undefined
		},
	})

	const loaded = useMemo(
		() => query.data?.pages.flatMap((p) => p.items) ?? [],
		[query.data],
	)
	const total = query.data?.pages[0]?.total ?? 0

	const visible = useMemo(() => {
		const needle = normalize(search.trim())
		return loaded.filter(
			(i) =>
				(category === "all" || i.category === category) &&
				(status === "all" || (status === "claimed") === i.claimed) &&
				(!needle || normalize(i.name).includes(needle)),
		)
	}, [loaded, category, status, search])

	const isInitialLoading = query.isLoading
	const hasMore = query.hasNextPage
	const hasFilters = category !== "all" || status !== "all" || search !== ""

	return (
		<div className={styles.page}>
			<h1>Catálogo de productos</h1>
			<p className={styles.lead}>
				Explore las unidades que las tiendas han registrado. Las más nuevas
				aparecen primero.
			</p>

			<div className={styles.toolbar}>
				<div className={styles.field}>
					<label htmlFor="f-category">Categoría</label>
					<select
						id="f-category"
						value={category}
						onChange={(e) => setCategory(e.target.value as CategoryFilter)}
					>
						<option value="all">Todas</option>
						<option value="Clothing">Ropa</option>
						<option value="Accessory">Accesorio</option>
						<option value="Furniture">Mueble</option>
					</select>
				</div>
				<div className={styles.field}>
					<label htmlFor="f-status">Estado</label>
					<select
						id="f-status"
						value={status}
						onChange={(e) => setStatus(e.target.value as StatusFilter)}
					>
						<option value="all">Todos</option>
						<option value="available">Disponibles</option>
						<option value="claimed">Reclamados</option>
					</select>
				</div>
				<div className={`${styles.field} ${styles.grow}`}>
					<label htmlFor="f-search">Buscar por nombre</label>
					<input
						id="f-search"
						type="search"
						value={search}
						placeholder="Por ejemplo: gorra"
						onChange={(e) => setSearch(e.target.value)}
					/>
				</div>
			</div>

			<div className={styles.summaryRow}>
				{!isInitialLoading && !query.error && (
					<p className={styles.summary} role="status">
						Mostrando {visible.length} de {loaded.length} cargados
						{total > loaded.length ? ` (${total} en total)` : ""}.
					</p>
				)}
				<Link to="/reclamar" className={styles.claimLink}>
					Reclamar un ítem
				</Link>
			</div>

			{hasMore && hasFilters && !query.isFetchingNextPage && (
				<p className={styles.hint}>
					Faltan {total - loaded.length} por cargar. Los filtros solo se aplican
					a los ítems ya cargados.
				</p>
			)}

			{isInitialLoading && (
				<>
					<p role="status" className={styles.loading}>
						Cargando productos...
					</p>
					<ul className={styles.grid} aria-hidden="true">
						{SKELETONS.map((i) => (
							<li key={i} className={`${styles.card} ${styles.skeleton}`} />
						))}
					</ul>
				</>
			)}

			{query.error && (
				<div className={styles.error} role="alert">
					<p>{friendlyError(query.error)}</p>
					<button type="button" onClick={() => void query.refetch()}>
						Reintentar
					</button>
				</div>
			)}

			{!isInitialLoading && !query.error && visible.length === 0 && (
				<p className={styles.empty} role="status">
					{loaded.length === 0
						? "Todavía no hay productos registrados."
						: "Ningún producto cargado coincide con los filtros."}
				</p>
			)}

			{visible.length > 0 && (
				<ul className={styles.grid}>
					{visible.map((item) => (
						<ProductCard key={item.id} item={item} />
					))}
				</ul>
			)}

			{hasMore && !query.error && (
				<div className={styles.more}>
					<button
						type="button"
						className={styles.primary}
						disabled={query.isFetchingNextPage}
						onClick={() => void query.fetchNextPage()}
					>
						{query.isFetchingNextPage ? "Cargando..." : "Cargar más"}
					</button>
				</div>
			)}

			<p className={styles.note}>
				Los códigos de reclamo los entrega la tienda con el producto; no se
				muestran aquí.
			</p>
		</div>
	)
}

export default Explore
