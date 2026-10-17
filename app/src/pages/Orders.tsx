import { useQueries } from "@tanstack/react-query"
import { useMemo } from "react"
import { Link } from "react-router-dom"
import styles from "../closet/account.module.css"
import { getItem } from "../closet/closetService"
import { ModelThumb, WalletRequired } from "../closet/components"
import { formatXlm } from "../closet/money"
import { loadOrders } from "../closet/orders"
import { txUrl } from "../closet/payment"
import { useBusinesses } from "../closet/useBusinesses"
import { useProducts } from "../closet/useProducts"

const OrdersList = ({ address }: { address: string }) => {
	const orders = useMemo(() => loadOrders(address), [address])
	const { find } = useProducts()
	const { byWallet, nameOf } = useBusinesses()

	// The status comes from the contract: an item is "claimed" once its code is used.
	const statuses = useQueries({
		queries: orders.map((o) => ({
			queryKey: ["closet", "item", o.itemId],
			queryFn: () => getItem(o.itemId),
			staleTime: 15_000,
		})),
	})

	if (orders.length === 0) {
		return (
			<p className={styles.empty} role="status">
				Todavía no ha hecho compras desde este navegador.{" "}
				<Link to="/comprar">Ir a comprar</Link>
			</p>
		)
	}

	return (
		<ul className={styles.orders}>
			{orders.map((order, i) => {
				const model = find(order.name, order.store)
				const profile = byWallet(order.store)
				const status = statuses[i]
				const claimed = status?.data?.claimed
				const label = status?.isError
					? "Sin datos"
					: claimed === undefined
						? "Revisando..."
						: claimed
							? "Reclamado"
							: "Por reclamar"
				const tone =
					claimed === undefined
						? ""
						: claimed
							? styles.statusDone
							: styles.statusPending
				return (
					<li key={order.hash} className={styles.order}>
						<div className={styles.orderThumb}>
							{model && <ModelThumb model={model} />}
						</div>
						<div className={styles.orderInfo}>
							<strong>{order.name}</strong>
							<span className={styles.muted}>
								Ítem n.º {order.itemId} ·{" "}
								{new Date(order.date).toLocaleString("es")}
							</span>
							<span className={styles.muted}>
								Pagó {formatXlm(order.priceXlm)} a{" "}
								{profile ? (
									<Link to={`/tiendas/${encodeURIComponent(profile.ref)}`}>
										{profile.name}
									</Link>
								) : (
									nameOf(order.store)
								)}
							</span>
							<span className={styles.links}>
								<a href={txUrl(order.hash)} target="_blank" rel="noreferrer">
									Ver la transacción
								</a>
								{claimed === false && (
									<Link to="/reclamar">
										Reclamar con el código de la tienda
									</Link>
								)}
							</span>
						</div>
						<span className={`${styles.status} ${tone}`}>{label}</span>
					</li>
				)
			})}
		</ul>
	)
}

const Orders = () => (
	<div className={styles.page}>
		<h1>Mis pedidos</h1>
		<p className={styles.lead}>
			Cada pedido es un pago en XLM a una tienda. Pasa a “Reclamado” cuando
			usted usa el código que la tienda le entregó; ese estado se lee de la red.
		</p>
		<WalletRequired>
			{(address) => <OrdersList key={address} address={address} />}
		</WalletRequired>
	</div>
)

export default Orders
