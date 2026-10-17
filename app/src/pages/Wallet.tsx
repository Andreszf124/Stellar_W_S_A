import { fundAccount } from "@stellar-scaffold/app-lib"
import { closet } from "@stellar-scaffold/app-lib/clients"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { DEMO_ADDRESS, resetDemo } from "../closet/demo"
import { accountUrl, closetContractUrl } from "../closet/payment"
import { useCloset } from "../closet/useCloset"
import { useXlmRate, usdText } from "../closet/useXlmRate"
import { useNotification } from "../hooks/useNotification"
import { useWallet } from "../hooks/useWallet"

const EXPLAIN = [
	{
		title: "Su billetera firma, nadie más.",
		text: "La aplicación nunca ve su llave secreta: cada pago y cada reclamo se firman en su billetera (Freighter, xBull, Lobstr o la billetera con correo).",
	},
	{
		title: "Todo se paga en XLM.",
		text: "Los precios están en Lumens (XLM), la moneda de Stellar: un pago firmado por usted sale a la cuenta de la tienda, con una comisión menor a 0.00001 XLM.",
	},
	{
		title: "Un ítem NFT por unidad.",
		text: "Cada unidad que registra la tienda es un ítem único en el contrato closet de Stellar. En la red solo queda la huella (sha256) del código, nunca el código.",
	},
	{
		title: "Reclamar pasa el ítem a su nombre.",
		text: "Al escribir el código del producto en Pedidos, el contrato comprueba la huella y registra que el ítem es suyo; así aparece en Mi avatar.",
	},
	{
		title: "Todo es de prueba.",
		text: "Esto corre en Stellar Testnet: el XLM no tiene valor real y puede pedir más cuando quiera.",
	},
]

const WalletPanel = ({ address }: { address: string }) => {
	const { balances, connector, updateBalances } = useWallet()
	const { addNotification } = useNotification()
	const { items } = useCloset(address)
	const { rate } = useXlmRate()
	const [funding, setFunding] = useState(false)
	const [copied, setCopied] = useState(false)

	const count = useQuery({
		queryKey: ["closet", "count"],
		queryFn: async () => Number((await closet.item_count()).result),
		staleTime: 30_000,
	})

	const xlm = Number(balances.xlm?.balance ?? 0)

	const fund = async () => {
		setFunding(true)
		try {
			const { ok, message } = await fundAccount(address)
			if (ok) await updateBalances()
			addNotification(message, ok ? "success" : "error")
		} finally {
			setFunding(false)
		}
	}

	const copy = async () => {
		try {
			await navigator.clipboard.writeText(address)
			setCopied(true)
		} catch {
			setCopied(false)
		}
	}

	return (
		<div className="wallet-grid">
			<div className="panel">
				<h3>Su billetera</h3>
				<p className="big-num">
					{xlm.toLocaleString("es", { maximumFractionDigits: 2 })}{" "}
					<small>XLM</small>
				</p>
				<div className="muted">
					Stellar Lumens (XLM)
					{usdText(xlm, rate) && ` ${usdText(xlm, rate)}`} · {items.length} ítem
					{items.length === 1 ? "" : "s"} NFT ·{" "}
					{connector === "cavos"
						? "Billetera con correo"
						: "Billetera de extensión"}
				</div>
				<div className="kv">
					<span>Dirección pública (se puede compartir)</span>
					<code>{address}</code>
				</div>
				<div className="row">
					<button
						type="button"
						className="btn small"
						disabled={funding}
						onClick={() => void fund()}
					>
						{funding ? "Cargando..." : "+ XLM de prueba (Friendbot)"}
					</button>
					<button
						type="button"
						className="btn ghost small"
						onClick={() => void copy()}
					>
						{copied ? "Copiada" : "Copiar dirección"}
					</button>
					<a
						className="btn ghost small"
						href={accountUrl(address)}
						target="_blank"
						rel="noreferrer"
					>
						Explorador ↗
					</a>
				</div>
			</div>

			<div className="panel">
				<h3>Contrato de ítems NFT</h3>
				<p className="big-num">
					{count.data ?? "…"} <small>unidades registradas</small>
				</p>
				<div className="muted">
					Las tiendas registran unidades y usted las reclama con su código.
				</div>
				<div className="kv">
					<span>Contrato closet (Stellar Testnet)</span>
					<code>{closet.options.contractId}</code>
				</div>
				<div className="row">
					<a
						className="btn ghost small"
						href={closetContractUrl()}
						target="_blank"
						rel="noreferrer"
					>
						Explorador ↗
					</a>
				</div>
			</div>
		</div>
	)
}

const DemoPanel = () => {
	const { items } = useCloset(DEMO_ADDRESS)
	return (
		<div className="wallet-grid">
			<div className="panel">
				<h3>Modo demo (sin billetera)</h3>
				<p className="big-num">
					{items.length}{" "}
					<small>ítem{items.length === 1 ? "" : "s"} de prueba</small>
				</p>
				<div className="muted">
					Puede recorrer toda la tienda sin billetera: las compras son
					simuladas, no se firma nada y todo se guarda solo en este navegador.
				</div>
				<div className="row">
					<button
						type="button"
						className="btn ghost small"
						onClick={() => {
							if (
								window.confirm(
									"¿Borrar los pedidos y los ítems de la demo de este navegador?",
								)
							) {
								resetDemo()
								window.location.reload()
							}
						}}
					>
						Reiniciar la demo
					</button>
				</div>
			</div>
			<div className="panel">
				<h3>Conectar una billetera</h3>
				<div className="muted">
					Use el botón de la parte superior para entrar con correo o con una
					billetera (Freighter, xBull, Lobstr). Entonces las compras se pagan en
					XLM, se firman en su billetera y los ítems son del contrato en Stellar
					Testnet. La demo no se pierde: vuelve cuando desconecte.
				</div>
			</div>
		</div>
	)
}

const Wallet = () => {
	const { address } = useWallet()
	return (
		<section className="view">
			<h2 className="page-title">Billetera</h2>
			{address ? (
				<WalletPanel key={address} address={address} />
			) : (
				<DemoPanel />
			)}
			<div className="panel how">
				<h3>Cómo funciona en Stellar</h3>
				<ol>
					{EXPLAIN.map((step) => (
						<li key={step.title}>
							<b>{step.title}</b> {step.text}
						</li>
					))}
				</ol>
			</div>
		</section>
	)
}

export default Wallet
