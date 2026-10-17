import { useQueries, useQueryClient } from "@tanstack/react-query"
import { useMemo, useState, type FormEvent } from "react"
import { findModel } from "../closet/catalog"
import { claimItem, friendlyError, getItem } from "../closet/closetService"
import { ModelThumb } from "../closet/components"
import { useAccount } from "../closet/demo"
import { formatXlm, shortAddress } from "../closet/money"
import { loadOrders, shippingStatus, type Order } from "../closet/orders"
import { closetContractUrl, txUrl } from "../closet/payment"
import { useWallet } from "../hooks/useWallet"

const SHIPPING_LABEL = {
	processing: "Preparando",
	shipped: "Enviado",
	delivered: "Entregado",
}

/** The buyer types the code that came with the product and the item is theirs. */
const ClaimInline = ({ order, address }: { order: Order; address: string }) => {
	const { signTransaction } = useWallet()
	const queryClient = useQueryClient()
	const [code, setCode] = useState("")
	const [sending, setSending] = useState(false)
	const [error, setError] = useState("")

	const submit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		if (!code.trim()) {
			setError("Escriba el código que viene con el producto.")
			return
		}
		setError("")
		setSending(true)
		try {
			await claimItem(order.itemId, code, address, signTransaction)
			await queryClient.invalidateQueries({ queryKey: ["closet"] })
			setCode("")
		} catch (e) {
			setError(friendlyError(e))
		} finally {
			setSending(false)
		}
	}

	return (
		<>
			<form className="o-claim" onSubmit={(e) => void submit(e)} noValidate>
				<input
					aria-label={`Código del ítem n.º ${order.itemId}`}
					placeholder="Código del producto: K7QM-2XWD-9PTA"
					autoComplete="off"
					autoCapitalize="characters"
					value={code}
					disabled={sending}
					onChange={(e) => setCode(e.target.value)}
				/>
				<button type="submit" className="btn small" disabled={sending}>
					{sending ? "Esperando su firma..." : "Reclamar mi NFT"}
				</button>
			</form>
			{error && (
				<p className="error o-claim" role="alert">
					{error}
				</p>
			)}
		</>
	)
}

const OrdersList = ({ address }: { address: string }) => {
	const orders = useMemo(() => loadOrders(address), [address])

	// The claim status comes from the contract: an item is "claimed" once its code is used.
	const statuses = useQueries({
		queries: orders.map((o) => ({
			queryKey: ["closet", "item", o.itemId],
			queryFn: () => getItem(o.itemId),
			staleTime: 15_000,
			// Demo orders have no item on the network to read.
			enabled: o.method !== "demo",
		})),
	})

	if (orders.length === 0) {
		return <div className="empty">Todavía no hay pedidos.</div>
	}

	return (
		<ul className="orders">
			{orders.map((order, i) => {
				const model = findModel(order.name)
				const status = statuses[i]
				const claimed = status?.data?.claimed
				const ship = shippingStatus(order)
				const demo = order.method === "demo"
				const claimLabel = demo
					? "NFT de demostración"
					: status?.isError
						? "Sin datos"
						: claimed === undefined
							? "Revisando..."
							: claimed
								? "NFT reclamado"
								: "NFT por reclamar"
				const claimTone = demo
					? "done"
					: claimed === undefined
						? ""
						: claimed
							? "done"
							: "pending"
				return (
					<li key={order.id} className="panel order">
						{model ? <ModelThumb model={model} /> : <div />}
						<div>
							<div className="o-title">
								{order.name} <span className="muted">· {order.id}</span>
							</div>
							<div className="o-meta">
								{new Date(order.date).toLocaleString("es")} · Pagó{" "}
								{formatXlm(order.priceXlm)}
								{order.method === "demo" && " (simulado, modo demo)"}
								<br />
								{order.shipping && (
									<>
										Enviar a: {order.shipping.name}, {order.shipping.address}
										<br />
									</>
								)}
								Ítem n.º {order.itemId}
								{!demo && <> · Tienda {shortAddress(order.store)}</>}
								{order.hash && (
									<>
										{" "}
										·{" "}
										<a
											href={txUrl(order.hash)}
											target="_blank"
											rel="noreferrer"
										>
											transacción ↗
										</a>
									</>
								)}
								{!demo && (
									<>
										{" "}
										·{" "}
										<a
											href={closetContractUrl()}
											target="_blank"
											rel="noreferrer"
										>
											contrato ↗
										</a>
									</>
								)}
							</div>
						</div>
						<div className="status-col">
							<span className={`status ${ship}`}>{SHIPPING_LABEL[ship]}</span>
							<span className={`status ${claimTone}`}>{claimLabel}</span>
						</div>
						{claimed === false && (
							<ClaimInline order={order} address={address} />
						)}
					</li>
				)
			})}
		</ul>
	)
}

const Orders = () => {
	const { address } = useAccount()
	return (
		<section className="view">
			<h2 className="page-title">Pedidos</h2>
			<p className="muted">
				Cada pedido envía un producto físico y trae un ítem NFT. El envío es
				simulado en esta demo. Con una billetera conectada, el estado del NFT se
				lee de la red Stellar y se reclama con el código que viene con el
				producto; sin billetera, el NFT de demostración llega al instante.
			</p>
			<OrdersList key={address} address={address} />
		</section>
	)
}

export default Orders
