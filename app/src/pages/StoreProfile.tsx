import { useInfiniteQuery } from "@tanstack/react-query"
import { type ReactNode, useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { type Product } from "../closet/catalog"
import { friendlyError, listItems } from "../closet/closetService"
import { ModelThumb } from "../closet/components"
import { describeRequirement, missionProgress } from "../closet/missions"
import { formatXlm, shortAddress } from "../closet/money"
import styles from "../closet/profile.module.css"
import { type Business, useBusinesses } from "../closet/useBusinesses"
import { useMissions, useUserProgress } from "../closet/useMissions"
import { useProducts } from "../closet/useProducts"
import { useWallet } from "../hooks/useWallet"
import { type StoreCategory } from "../lib/supabase"
import { explorerUrl } from "../trustless/config"

const PAGE_SIZE = 24

const CATEGORY_LABEL: Record<StoreCategory, string> = {
	ropa: "Ropa",
	muebles: "Muebles",
	ambos: "Ropa y muebles",
}

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

const TagIcon = () => (
	<Icon>
		<path d="M4 9l1-4h14l1 4M4 9v10h16V9M4 9h16M10 19v-5h4v5" />
	</Icon>
)

/** A product card: its own drawing when known, units and a link to the shop. */
interface Entry {
	key: string
	name: string
	product?: Product
	desc?: string
	available: number
	claimed: number
	/** Created by the business (price set by it), not just registered units. */
	own: boolean
}

const EntryCard = ({ entry }: { entry: Entry }) => {
	const titleId = `prod-${entry.key}`
	const total = entry.available + entry.claimed
	return (
		<li className={styles.card} aria-labelledby={titleId}>
			{entry.product && (
				<div className={styles.thumb} aria-hidden="true">
					<ModelThumb model={entry.product} />
				</div>
			)}
			<h3 id={titleId} className={styles.cardTitle}>
				{entry.name}
			</h3>
			{(entry.desc ?? entry.product?.desc) && (
				<p className={styles.cardText}>{entry.desc ?? entry.product?.desc}</p>
			)}
			{entry.product && (
				<p className={styles.price}>{formatXlm(entry.product.priceXlm)}</p>
			)}
			<p className={styles.counts}>
				{total === 0
					? "Sin unidades registradas por ahora"
					: `${entry.available} ${entry.available === 1 ? "disponible" : "disponibles"} · ${entry.claimed} ${entry.claimed === 1 ? "reclamada" : "reclamadas"}`}
			</p>
			<Link to="/comprar" className={styles.button}>
				Ir a comprar
				<span className={styles.srOnly}> {entry.name}</span>
			</Link>
		</li>
	)
}

const BusinessProducts = ({ wallet }: { wallet: string }) => {
	const { custom, find } = useProducts()
	const query = useInfiniteQuery({
		queryKey: ["closet", "products"],
		initialPageParam: 0,
		queryFn: ({ pageParam }) => listItems(pageParam, PAGE_SIZE),
		getNextPageParam: (last, pages) => {
			const loaded = pages.length * PAGE_SIZE
			return loaded < last.total ? loaded : undefined
		},
	})

	const entries = useMemo(() => {
		const units = new Map<string, { available: number; claimed: number }>()
		for (const page of query.data?.pages ?? []) {
			for (const item of page.items) {
				if (item.store !== wallet) continue
				const counts = units.get(item.name) ?? { available: 0, claimed: 0 }
				if (item.claimed) counts.claimed += 1
				else counts.available += 1
				units.set(item.name, counts)
			}
		}
		const result: Entry[] = []
		const seen = new Set<string>()
		for (const product of custom.filter((p) => p.store === wallet)) {
			const counts = units.get(product.name) ?? { available: 0, claimed: 0 }
			seen.add(product.name)
			result.push({
				key: `own-${result.length}`,
				name: product.name,
				product,
				desc: product.desc,
				...counts,
				own: true,
			})
		}
		for (const [name, counts] of units) {
			if (seen.has(name)) continue
			result.push({
				key: `unit-${result.length}`,
				name,
				product: find(name, wallet),
				...counts,
				own: false,
			})
		}
		return result
		// `find` changes identity every render but depends only on `custom`.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [query.data, custom, wallet])

	const hasMore = query.hasNextPage

	return (
		<section className={styles.section} aria-labelledby="profile-products">
			<h2 id="profile-products">Productos</h2>
			{query.isLoading && (
				<p className={styles.status} role="status">
					Cargando productos...
				</p>
			)}
			{query.error && (
				<div className={styles.error} role="alert">
					<p>{friendlyError(query.error)}</p>
					<button
						type="button"
						className={styles.button}
						onClick={() => void query.refetch()}
					>
						Reintentar
					</button>
				</div>
			)}
			{!query.isLoading && !query.error && entries.length === 0 && (
				<p className={styles.status} role="status">
					Este negocio aún no tiene productos registrados
					{hasMore ? " entre las unidades ya cargadas" : ""}.
				</p>
			)}
			{entries.length > 0 && (
				<ul className={styles.grid}>
					{entries.map((entry) => (
						<EntryCard key={entry.key} entry={entry} />
					))}
				</ul>
			)}
			{hasMore && !query.error && (
				<div className={styles.more}>
					<button
						type="button"
						className={styles.buttonOutline}
						disabled={query.isFetchingNextPage}
						onClick={() => void query.fetchNextPage()}
					>
						{query.isFetchingNextPage ? "Cargando..." : "Cargar más unidades"}
					</button>
					<p className={styles.hint}>
						Se muestran las unidades ya cargadas de la red.
					</p>
				</div>
			)}
		</section>
	)
}

const BusinessMissions = ({ wallet }: { wallet: string }) => {
	const { missions, isLoading } = useMissions()
	const { address } = useWallet()
	const { progress } = useUserProgress(address ?? undefined)
	const mine = useMemo(
		() => missions.filter((m) => m.store === wallet),
		[missions, wallet],
	)

	return (
		<section className={styles.section} aria-labelledby="profile-missions">
			<h2 id="profile-missions">Misiones</h2>
			{isLoading && (
				<p className={styles.status} role="status">
					Cargando misiones...
				</p>
			)}
			{!isLoading && mine.length === 0 && (
				<p className={styles.status} role="status">
					Este negocio aún no tiene misiones.
				</p>
			)}
			{mine.length > 0 && (
				<>
					{!address && (
						<p className={styles.hint}>
							Conecte su billetera para ver su avance en cada misión.
						</p>
					)}
					<ul className={styles.missions}>
						{mine.map((m) => {
							const p = address ? missionProgress(m, progress) : null
							const titleId = `mission-${m.id}`
							return (
								<li
									key={m.id}
									className={styles.mission}
									aria-labelledby={titleId}
								>
									<h3 id={titleId} className={styles.cardTitle}>
										{m.title}
									</h3>
									{m.description && (
										<p className={styles.cardText}>{m.description}</p>
									)}
									<p className={styles.cardText}>{describeRequirement(m)}</p>
									<p className={styles.reward}>
										Recompensa: <strong>{m.rewardProduct}</strong>
									</p>
									{p && (
										<div className={styles.progressWrap}>
											<div
												className={styles.progress}
												role="progressbar"
												aria-label={`Avance en ${m.title}`}
												aria-valuemin={0}
												aria-valuemax={p.target}
												aria-valuenow={p.current}
												aria-valuetext={`${p.current} de ${p.target}`}
											>
												<div
													className={styles.progressFill}
													style={{
														width: `${p.target > 0 ? (p.current / p.target) * 100 : 0}%`,
													}}
												/>
											</div>
											<span className={styles.progressText}>
												{p.done ? "Completada" : `${p.current} de ${p.target}`}
											</span>
										</div>
									)}
								</li>
							)
						})}
					</ul>
					<Link to="/tareas" className={styles.buttonOutline}>
						Ver todas las misiones
					</Link>
				</>
			)}
		</section>
	)
}

const NetworkSection = ({ wallet }: { wallet: string | null }) => {
	const [copied, setCopied] = useState(false)

	if (!wallet) {
		return (
			<section className={styles.section} aria-labelledby="profile-network">
				<h2 id="profile-network">En la red Stellar</h2>
				<p className={styles.status}>
					Este negocio del directorio aún no registra unidades en la red.
				</p>
			</section>
		)
	}

	const copy = async () => {
		try {
			await navigator.clipboard.writeText(wallet)
			setCopied(true)
		} catch {
			setCopied(false)
		}
	}

	return (
		<section className={styles.section} aria-labelledby="profile-network">
			<h2 id="profile-network">En la red Stellar</h2>
			<div className={styles.wallet}>
				<code title={wallet}>{shortAddress(wallet)}</code>
				<button
					type="button"
					className={styles.buttonOutline}
					onClick={() => void copy()}
				>
					Copiar dirección
				</button>
				<a
					href={explorerUrl(wallet)}
					target="_blank"
					rel="noreferrer"
					className={styles.link}
				>
					Ver cuenta en stellar.expert
					<span className={styles.srOnly}> (se abre en otra pestaña)</span>
				</a>
			</div>
			<p className={styles.status} role="status">
				{copied ? "Dirección copiada." : ""}
			</p>
		</section>
	)
}

const Profile = ({ business }: { business: Business }) => {
	const place = [business.city, business.province].filter(Boolean).join(", ")
	const story = business.story?.trim() || business.description.trim()
	const instagram = business.instagram?.trim().replace(/^@/, "")
	return (
		<>
			<header className={styles.header} aria-labelledby="profile-title">
				{(business.example || business.featured) && (
					<div className={styles.badges}>
						{business.example && (
							<span className={styles.badgeExample}>Ejemplo</span>
						)}
						{business.featured && (
							<span className={styles.badgeFeatured}>
								<StarIcon />
								Destacada
							</span>
						)}
					</div>
				)}
				<h1 id="profile-title">{business.name}</h1>
				{business.tagline && (
					<p className={styles.tagline}>{business.tagline}</p>
				)}
				<p className={styles.facts}>
					<span className={styles.fact}>
						<TagIcon />
						{CATEGORY_LABEL[business.category] ?? business.category}
					</span>
					{place && (
						<span className={styles.fact}>
							<PinIcon />
							{place}
						</span>
					)}
					{business.sinceYear && <span>Desde {business.sinceYear}</span>}
					{business.rating !== null && (
						<span className={styles.fact}>
							<StarIcon />
							{business.rating.toFixed(1)} de 5
						</span>
					)}
				</p>
				{instagram && (
					<p className={styles.facts}>
						<a
							href={`https://instagram.com/${encodeURIComponent(instagram)}`}
							target="_blank"
							rel="noreferrer"
							className={styles.link}
						>
							Instagram: @{instagram}
							<span className={styles.srOnly}> (se abre en otra pestaña)</span>
						</a>
					</p>
				)}
			</header>

			<section className={styles.section} aria-labelledby="profile-story">
				<h2 id="profile-story">Nuestra historia</h2>
				{story ? (
					<p className={styles.story}>{story}</p>
				) : (
					<p className={styles.status}>
						Este negocio todavía no cuenta su historia. Si es su negocio, puede
						escribirla desde <Link to="/tienda">Mi negocio</Link>.
					</p>
				)}
				{business.tags.length > 0 && (
					<ul className={styles.chips} aria-label="Etiquetas">
						{business.tags.map((tag) => (
							<li key={tag} className={styles.chip}>
								{tag}
							</li>
						))}
					</ul>
				)}
			</section>

			<NetworkSection wallet={business.wallet} />

			{business.wallet && (
				<>
					<BusinessProducts wallet={business.wallet} />
					<BusinessMissions wallet={business.wallet} />
				</>
			)}
		</>
	)
}

const StoreProfile = () => {
	const { ref = "" } = useParams()
	const { find, isPending, isError } = useBusinesses()
	const business = find(ref)

	return (
		<div className={styles.page}>
			<Link to="/tiendas" className={styles.back}>
				← Volver al directorio
			</Link>
			{business ? (
				<Profile business={business} />
			) : isPending ? (
				<p className={styles.status} role="status">
					Cargando el negocio...
				</p>
			) : isError ? (
				<div className={styles.error} role="alert">
					<p>
						No pudimos cargar el directorio ahora. Intente de nuevo en un rato.
					</p>
				</div>
			) : (
				<section className={styles.section} aria-labelledby="notfound-title">
					<h1 id="notfound-title">No encontramos este negocio</h1>
					<p>
						Puede que el enlace esté incompleto o que el negocio ya no esté
						publicado.
					</p>
					<Link to="/tiendas" className={styles.button}>
						Ver todos los negocios
					</Link>
				</section>
			)}
		</div>
	)
}

export default StoreProfile
