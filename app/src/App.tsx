import { Navigate, NavLink, Outlet, Route, Routes } from "react-router-dom"
import styles from "./App.module.css"
import ConnectAccount from "./components/ConnectAccount"
import { useWallet } from "./hooks/useWallet"
import AvatarStudio from "./pages/AvatarStudio"
import Debug from "./pages/Debug"
import Escrows from "./pages/Escrows"
import Orders from "./pages/Orders"
import Shop from "./pages/Shop"
import Wallet from "./pages/Wallet"

function App() {
	return (
		<Routes>
			<Route element={<AppLayout />}>
				<Route path="/" element={<Shop />} />
				<Route path="/avatar" element={<AvatarStudio />} />
				<Route path="/pedidos" element={<Orders />} />
				<Route path="/billetera" element={<Wallet />} />
				<Route path="/escrows" element={<Escrows />} />
				<Route path="/debug" element={<Debug />} />
				<Route path="/debug/:contractName" element={<Debug />} />
				<Route path="*" element={<Navigate to="/" replace />} />
			</Route>
		</Routes>
	)
}

const navClass = ({ isActive }: { isActive: boolean }) =>
	isActive ? styles.active : ""

const FLOW = [
	{ to: "/", label: "Tienda", text: "elija y compre" },
	{ to: "/pedidos", label: "Pedidos", text: "siga su compra" },
	{ to: "/avatar", label: "Mi avatar", text: "vista su ítem" },
	{ to: "/billetera", label: "Billetera", text: "conecte la suya" },
]

/** Shown while no wallet is connected: the app works as a guided demo. */
const DemoBanner = () => (
	<aside className="demo-banner" aria-label="Modo demo">
		<p>
			<strong>Modo demo.</strong> Puede recorrer todo sin billetera: las compras
			son simuladas y se guardan solo en este navegador. Conecte una billetera
			con el botón de arriba para pagar de verdad en Stellar Testnet.
		</p>
		<ol className="demo-flow">
			{FLOW.map((step, i) => (
				<li key={step.to}>
					<NavLink to={step.to} end>
						<b>{i + 1}</b> {step.label}
					</NavLink>
					<span>{step.text}</span>
				</li>
			))}
		</ol>
	</aside>
)

const AppLayout = () => {
	const { address } = useWallet()
	return (
		<div className={styles.AppLayout}>
			<header className={styles.header}>
				<NavLink to="/" className={styles.logo}>
					<span className={styles.logoMark} aria-hidden="true">
						✦
					</span>
					<span className={styles.logoText}>
						<span className={styles.logoName}>ZooKi</span>
						<span className={styles.logoTag}>
							Productos reales · Ítems reales · En Stellar
						</span>
					</span>
				</NavLink>
				<nav className={styles.headerNav} aria-label="Principal">
					<NavLink to="/" end className={navClass}>
						Tienda
					</NavLink>
					<NavLink to="/avatar" className={navClass}>
						Mi avatar
					</NavLink>
					<NavLink to="/pedidos" className={navClass}>
						Pedidos
					</NavLink>
					<NavLink to="/billetera" className={navClass}>
						Billetera
					</NavLink>
				</nav>
				<div className={styles.account}>
					<ConnectAccount />
				</div>
			</header>

			<main className={`${styles.main} nebula`}>
				{!address && <DemoBanner />}
				<Outlet />
			</main>

			<footer className={styles.footer}>
				<nav className={styles.footerNav} aria-label="Enlaces de ayuda">
					<a
						href="https://developers.stellar.org"
						target="_blank"
						rel="noreferrer"
					>
						Stellar docs
					</a>
					<a
						href="https://stellarscaffold.org"
						target="_blank"
						rel="noreferrer"
					>
						Scaffold Stellar
					</a>
					<a
						href="https://stellar.expert/explorer/testnet"
						target="_blank"
						rel="noreferrer"
					>
						Explorador Testnet
					</a>
				</nav>
			</footer>
		</div>
	)
}

export default App
