import { Link } from "react-router-dom"
import { type Product } from "../closet/catalog"
import closetStyles from "../closet/closet.module.css"
import { friendlyError } from "../closet/closetService"
import { HomeScene, WalletRequired } from "../closet/components"
import styles from "../closet/hogar.module.css"
import { formatXlm } from "../closet/money"
import { PETS, PetSvg, usePet } from "../closet/pets"
import { useBusinesses } from "../closet/useBusinesses"
import { useCloset } from "../closet/useCloset"
import { useProducts } from "../closet/useProducts"

/** Identifies a catalog product: the same name can exist in several stores. */
const productId = (name: string, store?: string) => `${store ?? ""}|${name}`

const HogarView = ({ address }: { address: string }) => {
	const { items, find, furniture, isLoading, error } = useCloset(address)
	const { products } = useProducts()
	const { byWallet, nameOf } = useBusinesses()
	const { petKey } = usePet()
	const pet = PETS.find((p) => p.key === petKey)

	const owned = items.filter((item) => find(item)?.slot === "furniture")
	const ownedIds = new Set(
		owned.flatMap((item) => {
			const product = find(item)
			return product ? [productId(product.name, product.store)] : []
		}),
	)
	const catalog: Product[] = products.filter((p) => p.slot === "furniture")
	const missing = catalog.filter(
		(p) => !ownedIds.has(productId(p.name, p.store)),
	)
	const haveCount = catalog.length - missing.length

	const sellerOf = (store: string) => {
		const business = byWallet(store)
		return business ? (
			<Link className={styles.link} to={`/tiendas/${business.ref}`}>
				{business.name}
			</Link>
		) : (
			nameOf(store)
		)
	}

	return (
		<>
			{isLoading && <p role="status">Cargando su hogar...</p>}
			{error && (
				<p
					className={`${closetStyles.notice} ${closetStyles.error}`}
					role="alert"
				>
					{friendlyError(error)}
				</p>
			)}

			<div className={styles.stage}>
				<section className={closetStyles.panel} aria-labelledby="scene-title">
					<h2 id="scene-title">Su hogar digital</h2>
					<HomeScene
						furniture={furniture}
						label={
							furniture.length === 0
								? "Su hogar digital, todavía vacío"
								: `Su hogar digital con ${furniture.length} ${furniture.length === 1 ? "mueble" : "muebles"}`
						}
					/>
				</section>

				<section className={closetStyles.panel} aria-labelledby="pet-title">
					<h2 id="pet-title">Su mascota</h2>
					{pet ? (
						<div className={styles.petBox}>
							<PetSvg petKey={pet.key} size={120} />
							<strong>{pet.name}</strong>
							<p className={closetStyles.muted}>{pet.species}</p>
							<Link className={styles.link} to="/mascotas">
								Cambiar mascota
							</Link>
						</div>
					) : (
						<p className={closetStyles.muted}>
							Todavía no eligió una mascota.{" "}
							<Link className={styles.link} to="/mascotas">
								Elegir mascota
							</Link>
						</p>
					)}
				</section>
			</div>

			{!isLoading && !error && owned.length === 0 && (
				<section
					className={`${closetStyles.panel} ${styles.section}`}
					aria-labelledby="empty-title"
				>
					<h2 id="empty-title">Su hogar está vacío</h2>
					<p role="status">
						Todavía no tiene muebles. Compre uno en la tienda y reclámelo con el
						código que viene con él.
					</p>
					<div className={closetStyles.actions}>
						<Link
							className={`${closetStyles.linkButton} ${closetStyles.linkButtonPrimary}`}
							to="/comprar"
						>
							Ir a comprar
						</Link>
						<Link className={closetStyles.linkButton} to="/reclamar">
							Reclamar con un código
						</Link>
					</div>
				</section>
			)}

			{owned.length > 0 && (
				<section
					className={`${closetStyles.panel} ${styles.section}`}
					aria-labelledby="owned-title"
				>
					<h2 id="owned-title">Sus muebles</h2>
					<p className={styles.counter} aria-live="polite">
						{haveCount} de {catalog.length} muebles del catálogo
					</p>
					<ul className={styles.list}>
						{owned.map((item) => (
							<li key={item.id} className={styles.row}>
								<strong>{item.name}</strong>
								<span className={closetStyles.badge}>Mueble n.º {item.id}</span>
								<span className={styles.store}>
									Vendido por {sellerOf(item.store)}
								</span>
							</li>
						))}
					</ul>
				</section>
			)}

			{!isLoading && !error && (
				<section
					className={`${closetStyles.panel} ${styles.section}`}
					aria-labelledby="missing-title"
				>
					<h2 id="missing-title">Qué le falta</h2>
					{owned.length === 0 && (
						<p className={styles.counter}>
							0 de {catalog.length} muebles del catálogo
						</p>
					)}
					{missing.length === 0 ? (
						<p role="status">
							Tiene todos los muebles del catálogo. Su hogar está completo.
						</p>
					) : (
						<ul className={styles.list}>
							{missing.map((p) => (
								<li key={productId(p.name, p.store)} className={styles.row}>
									<strong>{p.name}</strong>
									<span className={styles.store}>
										{p.store ? sellerOf(p.store) : "Catálogo general"}
									</span>
									<span className={styles.price}>{formatXlm(p.priceXlm)}</span>
									<Link className={styles.link} to="/comprar">
										Ver en la tienda
									</Link>
								</li>
							))}
						</ul>
					)}
				</section>
			)}
		</>
	)
}

const Hogar = () => (
	<div className={closetStyles.page}>
		<h1>Mi hogar</h1>
		<p className={closetStyles.lead}>
			Los muebles que compra aparecen aquí. Decore su hogar digital y vea qué le
			falta para completarlo.
		</p>
		<WalletRequired>
			{(address) => <HogarView key={address} address={address} />}
		</WalletRequired>
	</div>
)

export default Hogar
