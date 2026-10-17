import { useInfiniteQuery } from "@tanstack/react-query"
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { SHOP_FILTERS, SHOP_MODELS, type Model } from "../closet/catalog"
import {
	friendlyError,
	listItems,
	type ClosetItem,
} from "../closet/closetService"
import { Avatar, ModelThumb } from "../closet/components"
import { useAccount } from "../closet/demo"
import { PETS, PetSvg, useOwnedPets, usePet, type Pet } from "../closet/pets"
import Price from "../closet/Price"
import { useCloset } from "../closet/useCloset"
import { useWallet } from "../hooks/useWallet"
import { platformAddress } from "../trustless/config"

const ProductCheckout = lazy(() => import("../closet/ProductCheckout"))
const PetCheckout = lazy(() => import("../closet/PetCheckout"))

const PAGE_SIZE = 24
const MAX_UNITS = 120

const STEPS = [
	"Compre un producto y pague en XLM",
	"Reciba su ítem NFT en Stellar",
	"Equípelo en su avatar",
]

const HeroAvatar = ({ address }: { address: string }) => {
	const { wear, look } = useCloset(address)
	return <Avatar wear={wear} look={look} />
}

const Shop = () => {
	const { address, isDemo } = useAccount()
	const { items: owned } = useCloset(address)
	const { address: wallet } = useWallet()
	const [params, setParams] = useSearchParams()
	const filter = params.get("c") ?? "all"
	const setFilter = (id: string) => setParams(id === "all" ? {} : { c: id })
	const { petKey, setPet } = usePet()
	const { isOwned } = useOwnedPets(address)
	const [buyingPet, setBuyingPet] = useState<Pet>()
	const [buying, setBuying] = useState<{ product: Model; unit?: ClosetItem }>()
	const opener = useRef<HTMLButtonElement | null>(null)

	// The stock is read from the contract. In demo mode nothing is bought on the
	// network, so the shop stays open and there is nothing to read.
	const query = useInfiniteQuery({
		queryKey: ["closet", "products"],
		initialPageParam: 0,
		enabled: !isDemo,
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
			!isDemo &&
			hasNextPage &&
			!isFetchingNextPage &&
			!error &&
			loaded.length < MAX_UNITS
		) {
			void fetchNextPage()
		}
	}, [
		isDemo,
		hasNextPage,
		isFetchingNextPage,
		error,
		loaded.length,
		fetchNextPage,
	])

	// Units still for sale per product name, oldest first.
	const unclaimed = useMemo(() => {
		const byName = new Map<string, ClosetItem[]>()
		for (const item of [...loaded].reverse()) {
			if (item.claimed) continue
			byName.set(item.name, [...(byName.get(item.name) ?? []), item])
		}
		return byName
	}, [loaded])

	const slots = SHOP_FILTERS.find((f) => f.id === filter)?.slots
	const showPets = filter === "all" || filter === "pets"
	const shown =
		filter === "pets"
			? []
			: SHOP_MODELS.filter((m) => !slots || slots.includes(m.slot))
	// With a wallet the pet is paid to the platform account, which must be set.
	const canBuyPet = isDemo || Boolean(wallet && platformAddress)
	const incomplete = !isDemo && total > loaded.length
	const checking = !isDemo && query.isLoading

	const buy = (
		product: Model,
		unit: ClosetItem | undefined,
		button: HTMLButtonElement,
	) => {
		opener.current = button
		// A snapshot: the stock refreshes after the payment and the open window
		// must keep showing its receipt.
		setBuying({ product, unit })
	}

	return (
		<section className="view">
			<div className="hero">
				<div>
					<span className="pill">Stellar Testnet</span>
					<h1>
						Compre lo real.
						<br />
						Vístalo en el metaverso.
					</h1>
					<p>
						Cada producto físico que compra llega a su puerta <em>y</em> trae un
						ítem NFT en la red Stellar. Use sus ítems para vestir a su avatar.
						Todo se paga en XLM (Stellar Lumens) con su billetera.
					</p>
					<ol className="hero-steps">
						{STEPS.map((step, i) => (
							<li key={step}>
								<b>{i + 1}</b> {step}
							</li>
						))}
					</ol>
				</div>
				<div className="hero-avatar">
					<HeroAvatar key={address} address={address} />
				</div>
			</div>

			<div className="filters" role="group" aria-label="Categoría">
				{[
					{ id: "all", label: "Todo" },
					...SHOP_FILTERS,
					{ id: "pets", label: "Mascotas" },
				].map((f) => (
					<button
						key={f.id}
						type="button"
						className="chip"
						aria-pressed={filter === f.id}
						onClick={() => setFilter(f.id)}
					>
						{f.label}
					</button>
				))}
			</div>

			{checking && (
				<p role="status" className="muted">
					Revisando qué hay disponible en la red...
				</p>
			)}
			{!isDemo && query.error && (
				<div className="error" role="alert">
					<p>{friendlyError(query.error)}</p>
					<button type="button" onClick={() => void query.refetch()}>
						Reintentar
					</button>
				</div>
			)}
			{incomplete && !query.error && (
				<p className="muted" role="status">
					Se han revisado {loaded.length} de {total} unidades; puede haber más
					disponibles.
				</p>
			)}

			<ul className="grid">
				{shown.map((product) => {
					const units = unclaimed.get(product.name) ?? []
					const [unit] = units
					const available = isDemo || Boolean(unit)
					const ownedCount = owned.filter((i) => i.name === product.name).length
					return (
						<li key={product.key} className="panel product">
							<div className="thumb">
								<ModelThumb model={product} />
								{ownedCount > 0 && (
									<span className="badge">
										✓ Ya tiene {ownedCount} NFT{ownedCount > 1 ? "s" : ""}
									</span>
								)}
							</div>
							<h3>{product.name}</h3>
							<p className="desc">{product.desc}</p>
							<Price xlm={product.priceXlm} />
							<p className={available ? "stock" : "out"}>
								{checking
									? "Revisando..."
									: isDemo
										? "Disponible (demo)"
										: unit
											? `${units.length} disponible${units.length > 1 ? "s" : ""}`
											: "Agotado"}
							</p>
							<button
								type="button"
								className="btn block"
								disabled={!available || checking}
								onClick={(e) => buy(product, unit, e.currentTarget)}
							>
								Comprar y recibir NFT
							</button>
						</li>
					)
				})}
			</ul>

			{showPets && (
				<>
					<h2 className="section-title">Mascotas</h2>
					{!canBuyPet && (
						<p className="notice" role="note">
							Las compras de mascotas están desactivadas: falta definir{" "}
							<code>PUBLIC_PLATFORM_ADDRESS</code> en <code>app/.env</code>, la
							dirección que recibe sus pagos.
						</p>
					)}
					<ul className="grid">
						{PETS.map((pet) => {
							const mine = isOwned(pet.key) || petKey === pet.key
							const selected = petKey === pet.key
							return (
								<li key={pet.key} className="panel product">
									<div className="thumb pet-thumb">
										<PetSvg petKey={pet.key} size={160} />
										{selected && <span className="badge">✓ Su mascota</span>}
									</div>
									<h3>
										{pet.name} <span className="muted">· {pet.species}</span>
									</h3>
									<p className="desc">{pet.description}</p>
									<Price xlm={pet.priceXlm} />
									{mine ? (
										<button
											type="button"
											className="btn block"
											aria-pressed={selected}
											onClick={() => setPet(pet.key)}
										>
											{selected ? "Elegida" : "Elegir"}
										</button>
									) : (
										<button
											type="button"
											className="btn block"
											disabled={!canBuyPet}
											onClick={() => setBuyingPet(pet)}
										>
											Comprar mascota
										</button>
									)}
								</li>
							)
						})}
					</ul>
				</>
			)}

			{buyingPet && (
				<Suspense fallback={null}>
					<PetCheckout
						key={buyingPet.key}
						pet={buyingPet}
						address={address}
						onClose={() => setBuyingPet(undefined)}
					/>
				</Suspense>
			)}

			{buying && (
				<Suspense fallback={null}>
					<ProductCheckout
						key={`${buying.product.key}-${buying.unit?.id ?? "demo"}`}
						product={buying.product}
						unit={buying.unit}
						address={address}
						onClose={() => {
							setBuying(undefined)
							opener.current?.focus()
						}}
					/>
				</Suspense>
			)}
		</section>
	)
}

export default Shop
