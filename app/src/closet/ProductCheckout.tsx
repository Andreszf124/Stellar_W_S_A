import { Link } from "react-router-dom"
import { CATEGORY_LABEL, type Model } from "./catalog"
import { type ClosetItem } from "./closetService"
import { Avatar, HomeScene } from "./components"
import { addDemoItem, isDemoAddress } from "./demo"
import { shortAddress } from "./money"
import { newOrderId, saveOrder } from "./orders"
import PayDialog from "./PayDialog"
import { useCloset } from "./useCloset"

interface Props {
	product: Model
	/** The unit that is bought: the oldest one still for sale. None in demo mode. */
	unit?: ClosetItem
	/** The connected wallet, or the demo visitor. */
	address: string
	onClose: () => void
}

/** The payment window for one product, with the avatar trying it on. */
const ProductCheckout = ({ product, unit, address, onClose }: Props) => {
	const { wear, look, furniture } = useCloset(address)
	const isFurniture = product.slot === "furniture"
	const demo = isDemoAddress(address)

	const tryOn = [
		...wear.filter((w) => w.slot !== product.slot),
		{ slot: product.slot, key: product.key, color: product.color },
	]

	return (
		<PayDialog
			title={product.name}
			subtitle={
				demo || !unit ? (
					<>{CATEGORY_LABEL[product.category]} · modo demo</>
				) : (
					<>
						{CATEGORY_LABEL[product.category]} · ítem n.º {unit.id} · Tienda{" "}
						{shortAddress(unit.store)}
					</>
				)
			}
			priceXlm={product.priceXlm}
			shipping
			demo={demo}
			to={unit?.store ?? ""}
			memo={`Closet n.${unit?.id ?? 0}`}
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
				isFurniture
					? `Vista previa: su hogar con ${product.name}`
					: `Vista previa: su avatar con ${product.name}`
			}
			onPaid={(result) => {
				// Demo: the item is delivered at once, as a local item. With a wallet
				// it is the contract's unit, claimed later with the code.
				const item = demo
					? addDemoItem(product.name, product.category)
					: undefined
				const itemId = item?.id ?? unit?.id
				if (itemId === undefined) return
				saveOrder(address, {
					id: newOrderId(),
					itemId,
					name: product.name,
					store: item?.store ?? unit?.store ?? "",
					method: result.method,
					priceXlm: result.xlm,
					hash: result.hash,
					date: Date.now(),
					shipping: result.shipping,
				})
			}}
			invalidate={[["closet"]]}
			successText={
				demo ? (
					<>
						Su pedido de demostración quedó registrado y su ítem NFT de prueba
						ya está en su guardarropa. Conecte una billetera para comprar de
						verdad en Stellar Testnet.
					</>
				) : (
					<>
						Su pedido quedó registrado. La tienda le entrega el código de un
						solo uso del ítem n.º {unit?.id} junto con el producto; con ese
						código lo reclama en Pedidos y su ítem NFT pasa a ser suyo.
					</>
				)
			}
			successActions={
				<>
					{demo && (
						<Link to="/avatar">
							{isFurniture ? "Ver en mi hogar" : "Equipar en mi avatar"}
						</Link>
					)}
					<Link to="/pedidos">Ir a mis pedidos</Link>
				</>
			}
			onClose={onClose}
		/>
	)
}

export default ProductCheckout
