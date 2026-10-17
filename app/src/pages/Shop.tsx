import { useInfiniteQuery } from "@tanstack/react-query"
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react"
import { Link } from "react-router-dom"
import {
	CATEGORY_LABEL,
	MODELS,
	type CategoryTag,
	type Model,
} from "../closet/catalog"
import {
	friendlyError,
	listItems,
	type ClosetItem,
} from "../closet/closetService"
import { Avatar, ModelThumb } from "../closet/components"
import styles from "../closet/shop.module.css"
import { toXlm, useXlmRate } from "../closet/useXlmRate"
import { useWallet } from "../hooks/useWallet"

const CheckoutDialog = lazy(() => import("../closet/CheckoutDialog"))

// Same page size as the catalog page, so both share one cache.
const PAGE_SIZE = 24
const MAX_UNITS = 120

type Filter = "all" | CategoryTag

const FILTERS: { id: Filter; label: string }[] = [
	{ id: "all", label: "Todo" },
	{ id: "Clothing", label: "Ropa" },
	{ id: "Accessory", label: "Accesorios" },
	{ id: "Furniture", label: "Muebles" },
]

const STEPS = [
	"Elija un producto y pague en XLM con su billetera.",
	"La tienda le entrega el código de un solo uso.",
	"Reclame el ítem y vístalo en su avatar o su hogar.",
]

const FEATURED = MODELS.find((m) => m.key === "hoodie") ?? MODELS[0]

const Shop = () => {
	const { address } = useWallet()
	const { rate, live } = useXlmRate()
	const [filter, setFilter] = useState<Filter>("all")
	const [buying, setBuying] = useState<{ model: Model; unit: ClosetItem }>()
	const [needWallet, setNeedWallet] = useState(false)
	const opener = useRef<HTMLButtonElement | null>(null)

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

	// Keep loading pages until there are enough units to know what is in stock.
	const { hasNextPage, isFetchingNextPage, fetchNextPage, error } = query
	useEffect(() => {
		if (
			hasNextPage &&
			!isFetchingNextPage &&
			!error &&
			loaded.length < MAX_UNITS
		) {
			void fetchNextPage()
		}
	}, [hasNextPage, isFetchingNextPage, error, loaded.length, fetchNextPage])

	// Units still for sale per product name, oldest first.
	const stock = useMemo(() => {
		const byName = new Map<string, ClosetItem[]>()
		for (const item of [...loaded].reverse()) {
			if (item.claimed) continue
			byName.set(item.name, [...(byName.get(item.name) ?? []), item])
		}
		return byName
	}, [loaded])

	const models = MODELS.filter((m) => filter === "all" || m.category === filter)
	const incomplete = total > loaded.length

	const buy = (model: Model, button: HTMLButtonElement) => {
		const unit = stock.get(model.name)?.[0]
		if (!unit) return
		if (!address) {
			setNeedWallet(true)
			return
		}
		setNeedWallet(false)
		opener.current = button
		setBuying({ model, unit })
	}

	return (
		<div className={styles.page}>
			<section className={styles.hero}>
				<div>
					<span className={styles.pill}>Stellar Testnet</span>
					<h1>Compre lo real. Vístalo en su mundo digital.</h1>
					<p className={styles.lead}>
						Cada producto que compra en una tienda trae su versión digital para
						su avatar o su hogar. Aquí paga en XLM con su billetera.
					</p>
					<ol className={styles.heroSteps}>
						{STEPS.map((step, i) => (
							<li key={step}>
								<b>{i + 1}</b> {step}
							</li>
						))}
					</ol>
				</div>
				<div className={styles.heroArt} aria-hidden="true">
					{FEATURED && (
						<Avatar
							wear={[
								{
									slot: FEATURED.slot,
									key: FEATURED.key,
									color: FEATURED.color,
								},
							]}
						/>
					)}
				</div>
			</section>

			<div className={styles.filters} role="group" aria-label="Categoría">
				{FILTERS.map((f) => (
					<button
						key={f.id}
						type="button"
						className={styles.chip}
						aria-pressed={filter === f.id}
						onClick={() => setFilter(f.id)}
					>
						{f.label}
					</button>
				))}
			</div>

			{needWallet && (
				<p className={styles.notice} role="status">
					Conecte su billetera con el botón de la parte superior para comprar.
				</p>
			)}
			{query.isLoading && (
				<p role="status" className={styles.muted}>
					Revisando qué hay disponible...
				</p>
			)}
			{query.error && (
				<div className={styles.errorBox} role="alert">
					<p>{friendlyError(query.error)}</p>
					<button type="button" onClick={() => void query.refetch()}>
						Reintentar
					</button>
				</div>
			)}
			{incomplete && !query.error && (
				<p className={styles.muted} role="status">
					Se han revisado {loaded.length} de {total} unidades; puede haber más
					disponibles.
				</p>
			)}

			<ul className={styles.grid}>
				{models.map((model) => {
					const available = stock.get(model.name)?.length ?? 0
					return (
						<li key={model.key} className={styles.card}>
							<div className={styles.thumb}>
								<ModelThumb model={model} />
							</div>
							<h3>{model.name}</h3>
							<span className={styles.badge}>
								{CATEGORY_LABEL[model.category]}
							</span>
							<p className={styles.desc}>{model.desc}</p>
							<p className={styles.price}>
								<strong>${model.priceUsd.toFixed(2)}</strong>
								<span>≈ {toXlm(model.priceUsd, rate)} XLM</span>
							</p>
							<p className={available ? styles.stock : styles.out}>
								{query.isLoading
									? "Revisando..."
									: available
										? `${available} disponible${available > 1 ? "s" : ""}`
										: "Agotado"}
							</p>
							<button
								type="button"
								className={styles.buy}
								disabled={available === 0}
								onClick={(e) => buy(model, e.currentTarget)}
							>
								Comprar
							</button>
						</li>
					)
				})}
			</ul>

			<p className={styles.muted}>
				El precio en XLM usa una tasa {live ? "en vivo" : "de prueba"} de $
				{rate.toFixed(4)}. ¿Ya tiene un código?{" "}
				<Link to="/reclamar">Reclame su ítem</Link>.
			</p>

			{buying && address && (
				<Suspense fallback={null}>
					<CheckoutDialog
						key={buying.unit.id}
						model={buying.model}
						unit={buying.unit}
						address={address}
						onClose={() => {
							setBuying(undefined)
							opener.current?.focus()
						}}
					/>
				</Suspense>
			)}
		</div>
	)
}

export default Shop
