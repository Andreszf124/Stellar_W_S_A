import { fundAccount } from "@stellar-scaffold/app-lib"
import { useState } from "react"
import { Link } from "react-router-dom"
import styles from "../closet/account.module.css"
import { WalletRequired } from "../closet/components"
import { useCloset } from "../closet/useCloset"
import { useNotification } from "../hooks/useNotification"
import { useWallet } from "../hooks/useWallet"

const EXPLAIN = [
	{
		title: "Su billetera firma, nadie más.",
		text: "La aplicación nunca ve su llave secreta: cada pago y cada reclamo se firman en su billetera.",
	},
	{
		title: "El pago va directo a la tienda.",
		text: "Cuando compra, un pago en XLM sale de su cuenta a la cuenta de la tienda que registró la unidad.",
	},
	{
		title: "La tienda entrega un código de un solo uso.",
		text: "En la red solo queda la huella del código, así que nadie puede reclamar el ítem sin él.",
	},
	{
		title: "Reclamar pasa el ítem a su nombre.",
		text: "Al escribir el código en Reclamar, el contrato registra que el ítem es suyo y aparece en su clóset.",
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
	const [funding, setFunding] = useState(false)
	const [copied, setCopied] = useState(false)

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
		<section className={styles.panel} aria-labelledby="wallet-title">
			<h2 id="wallet-title">Su billetera</h2>
			<p className={styles.bigNumber}>
				{xlm.toLocaleString("es", { maximumFractionDigits: 2 })}{" "}
				<span className={styles.unit}>XLM</span>
			</p>
			<p className={styles.muted}>
				{items.length} ítem{items.length === 1 ? "" : "s"} reclamado
				{items.length === 1 ? "" : "s"} ·{" "}
				{connector === "cavos"
					? "Billetera con correo"
					: "Billetera de extensión"}
			</p>
			<div className={styles.kv}>
				<span>Dirección pública (se puede compartir)</span>
				<code>{address}</code>
			</div>
			<div className={styles.actionsRow}>
				<button
					type="button"
					className={styles.primary}
					disabled={funding}
					onClick={() => void fund()}
				>
					{funding ? "Cargando..." : "Cargar XLM de prueba"}
				</button>
				<button type="button" onClick={() => void copy()}>
					{copied ? "Copiada" : "Copiar dirección"}
				</button>
				<a
					href={`https://stellar.expert/explorer/testnet/account/${address}`}
					target="_blank"
					rel="noreferrer"
					className={styles.linkButton}
				>
					Ver en el explorador
				</a>
			</div>
		</section>
	)
}

const Wallet = () => (
	<div className={styles.page}>
		<h1>Billetera</h1>
		<p className={styles.lead}>
			Su saldo, su dirección y cómo funciona todo en la red Stellar. Sus compras
			están en <Link to="/pedidos">Pedidos</Link>.
		</p>
		<WalletRequired>
			{(address) => <WalletPanel key={address} address={address} />}
		</WalletRequired>
		<section className={styles.panel} aria-labelledby="how-title">
			<h2 id="how-title">Cómo funciona en Stellar</h2>
			<ol className={styles.how}>
				{EXPLAIN.map((step) => (
					<li key={step.title}>
						<strong>{step.title}</strong> {step.text}
					</li>
				))}
			</ol>
		</section>
	</div>
)

export default Wallet
