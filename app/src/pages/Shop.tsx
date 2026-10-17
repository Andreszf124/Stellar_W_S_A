import { useInfiniteQuery } from "@tanstack/react-query"
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react"
import { Link } from "react-router-dom"
import {
	CATEGORY_LABEL,
	MODELS,
	type CategoryTag,
	type Product,
} from "../closet/catalog"
import {
	friendlyError,
	listItems,
	type ClosetItem,
} from "../closet/closetService"
import { Avatar, ModelThumb } from "../closet/components"
import { lockingMission, type Mission } from "../closet/missions"
import { formatXlm } from "../closet/money"
import styles from "../closet/shop.module.css"
import { useBusinesses } from "../closet/useBusinesses"
import { useMissions, useUserProgress } from "../closet/useMissions"
import { useProducts } from "../closet/useProducts"
import { useWallet } from "../hooks/useWallet"

const ProductCheckout = lazy(() => import("../closet/ProductCheckout"))

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

const productId = (p: Product) => `${p.store ?? ""}|${p.key}|${p.name}`

interface Offer {
	/** Units this person can buy now, oldest first. */
	open: ClosetItem[]
	/** A mission that locks at least one unit, if any. */
	lockedBy?: Mission
	/** Businesses that have units of it, open or locked. */
	sellers: string[]
}

const Shop = () => {
	const { address } = useWallet()
	const { products }: { products: Product[] } = useProducts()
	const { missions } = useMissions()
	const { progress, isLoading: progressLoading } = useUserProgress(
		address ?? undefined,
	)
	const { byWallet, nameOf } = useBusinesses()
	const [filter, setFilter] = useState<Filter>("all")
	const [buying, setBuying] = useState<{
		product: Product
		units: ClosetItem[]
	}>()
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
	const unclaimed = useMemo(() => {
		const byName = new Map<string, ClosetItem[]>()
		for (const item of [...loaded].reverse()) {
			if (item.claimed) continue
			byName.set(item.name, [...(byName.get(item.name) ?? []), item])
		}
		return byName
	}, [loaded])

	// What each product offers this person: free units, locked ones and sellers.
	const offers = useMemo(() => {
		const map = new Map<string, Offer>()
		for (const product of products) {
			const units = (unclaimed.get(product.name) ?? []).filter(
				(u) => !product.store || u.store === product.store,
			)
			const open: ClosetItem[] = []
			let lockedBy: Mission | undefined
			for (const unit of units) {
				const lock = lockingMission(
					missions,
					progress,
					product.name,
					unit.store,
				)
				if (lock) lockedBy ??= lock
				else open.push(unit)
			}
			map.set(productId(product), {
				open,
				lockedBy,
				sellers: [...new Set(units.map((u) => u.store))],
			})
		}
		return map
	}, [products, unclaimed, missions, progress])

	const shown = products.filter(
		(p) => filter === "all" || p.category === filter,
	)
	const incomplete = total > loaded.length

	const buy = (
		product: Product,
		open: ClosetItem[],
		button: HTMLButtonElement,
	) => {
		if (open.length === 0) return
		if (!address) {
			setNeedWallet(true)
			return
		}
		setNeedWallet(false)
		opener.current = button
		// A snapshot: the list changes when the payment refreshes the stock, and
		// the open window must keep showing its receipt.
		setBuying({ product, units: open })
	}

	const sellerLine = (product: Product, sellers: string[]) => {
		const wallets =
			product.store && sellers.length === 0 ? [product.store] : sellers
		const [wallet] = wallets
		if (!wallet) return null
		if (wallets.length > 1) {
			return (
				<p className={styles.seller}>Vendido por {wallets.length} negocios</p>
			)
		}
		const ref = byWallet(wallet)?.ref
		return (
			<p className={styles.seller}>
				Vendido por{" "}
				{ref ? (
					<Link to={`/tiendas/${encodeURIComponent(ref)}`}>
						{nameOf(wallet)}
					</Link>
				) : (
					nameOf(wallet)
				)}
			</p>
		)
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
				{shown.map((product) => {
					const offer = offers.get(productId(product))
					const open = offer?.open ?? []
					const lockedBy = open.length === 0 ? offer?.lockedBy : undefined
					const checking = query.isLoading || progressLoading
					return (
						<li key={productId(product)} className={styles.card}>
							<div className={styles.thumb}>
								<ModelThumb model={product} />
							</div>
							<h3>{product.name}</h3>
							<span className={styles.badge}>
								{CATEGORY_LABEL[product.category]}
							</span>
							<p className={styles.desc}>{product.desc}</p>
							<p className={styles.price}>
								<strong>{formatXlm(product.priceXlm)}</strong>
							</p>
							{sellerLine(product, offer?.sellers ?? [])}
							{lockedBy && !checking ? (
								<p className={styles.locked}>
									Bloqueado por misión:{" "}
									<Link to="/tareas">{lockedBy.title}</Link>
									{!address &&
										" Conecte su billetera para ver si ya la cumplió."}
								</p>
							) : (
								<p className={open.length ? styles.stock : styles.out}>
									{checking
										? "Revisando..."
										: open.length
											? `${open.length} disponible${open.length > 1 ? "s" : ""}`
											: "Agotado"}
								</p>
							)}
							<button
								type="button"
								className={styles.buy}
								disabled={open.length === 0}
								onClick={(e) => buy(product, open, e.currentTarget)}
							>
								{lockedBy && !checking ? "Bloqueado" : "Comprar"}
							</button>
						</li>
					)
				})}
			</ul>

			<p className={styles.muted}>
				Todos los precios están en XLM. ¿Ya tiene un código?{" "}
				<Link to="/reclamar">Reclame su ítem</Link>.
			</p>

			{buying && address && (
				<Suspense fallback={null}>
					<ProductCheckout
						key={productId(buying.product)}
						product={buying.product}
						units={buying.units}
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
