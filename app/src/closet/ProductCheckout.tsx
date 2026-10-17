import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { CATEGORY_LABEL, type Product } from "./catalog"
import styles from "./checkout.module.css"
import { type ClosetItem } from "./closetService"
import { Avatar, HomeScene } from "./components"
import { saveOrder } from "./orders"
import PayDialog from "./PayDialog"
import { useBusinesses } from "./useBusinesses"
import { useCloset } from "./useCloset"

interface Props {
	product: Product
	/** Units already unlocked for this person, oldest first. */
	units: ClosetItem[]
	address: string
	onClose: () => void
}

const ProductCheckout = ({ product, units, address, onClose }: Props) => {
	const { wear, look, furniture } = useCloset(address)
	const { byWallet, nameOf } = useBusinesses()
	const stores = useMemo(() => [...new Set(units.map((u) => u.store))], [units])
	const [store, setStore] = useState(stores[0] ?? "")
	const [paid, setPaid] = useState(false)

	const unit = units.find((u) => u.store === store) ?? units[0]
	if (!unit) return null

	const profile = byWallet(unit.store)
	const sellerLink = profile && (
		<Link to={`/tiendas/${encodeURIComponent(profile.ref)}`}>
			{nameOf(unit.store)}
		</Link>
	)

	const isFurniture = product.slot === "furniture"
	const tryOn = [
		...wear.filter((w) => w.slot !== product.slot),
		{ slot: product.slot, key: product.key, color: product.color },
	]

	return (
		<PayDialog
			key={unit.id}
			title={product.name}
			subtitle={
				<>
					{CATEGORY_LABEL[product.category]} · ítem n.º {unit.id} · Vendido por{" "}
					{sellerLink ?? nameOf(unit.store)}
				</>
			}
			priceXlm={product.priceXlm}
			to={unit.store}
			memo={`Closet n.${unit.id}`}
			preview={
				isFurniture ? (
					<HomeScene
						furniture={[
							...furniture,
							{ key: product.key, color: product.color },
						]}
					/>
				) : (
					<Avatar wear={tryOn} look={look} />
				)
			}
			caption={
				isFurniture ? "Así se vería en su hogar" : "Así se vería su avatar"
			}
			extra={
				stores.length > 1 ? (
					<div className={styles.sellerPick}>
						<label htmlFor="buy-from">Comprar a</label>
						<select
							id="buy-from"
							value={unit.store}
							disabled={paid}
							onChange={(e) => setStore(e.target.value)}
						>
							{stores.map((s) => (
								<option key={s} value={s}>
									{nameOf(s)}
								</option>
							))}
						</select>
						{sellerLink && <span>Ver el perfil de {sellerLink}</span>}
					</div>
				) : undefined
			}
			onPaid={(hash) => {
				setPaid(true)
				saveOrder(address, {
					itemId: unit.id,
					name: product.name,
					store: unit.store,
					priceXlm: product.priceXlm,
					hash,
					date: Date.now(),
				})
			}}
			invalidate={[["closet", "products"]]}
			successText={
				<>
					La tienda le entregará el código de un solo uso del ítem n.º {unit.id}
					. Con ese código lo reclama y pasa a ser suyo.
				</>
			}
			successActions={
				<>
					<Link to="/pedidos">Ver mis pedidos</Link>
					<Link to="/reclamar">Reclamar un ítem</Link>
				</>
			}
			onClose={onClose}
		/>
	)
}

export default ProductCheckout
