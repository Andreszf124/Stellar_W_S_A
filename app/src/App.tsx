import { labPrefix } from "@stellar-scaffold/app-lib"
import { Link, Outlet, Route, Routes } from "react-router-dom"
import styles from "./App.module.css"
import { AppNav } from "./components/AppNav"
import ConnectAccount from "./components/ConnectAccount"
import { BeanIcon } from "./components/Icons"
import Debug from "./pages/Debug"
import Home from "./pages/Home"
import LotLookup from "./pages/LotLookup"
import RegisterLot from "./pages/RegisterLot"
import TransferLot from "./pages/TransferLot"

function App() {
	return (
		<Routes>
			<Route element={<AppLayout />}>
				<Route path="/" element={<Home />} />
				<Route path="/registrar" element={<RegisterLot />} />
				<Route path="/lote" element={<LotLookup />} />
				<Route path="/lote/:id" element={<LotLookup />} />
				<Route path="/transferir" element={<TransferLot />} />
				<Route path="/debug" element={<Debug />} />
				<Route path="/debug/:contractName" element={<Debug />} />
			</Route>
		</Routes>
	)
}

const AppLayout = () => (
	<div className={styles.AppLayout}>
		<header className={styles.header}>
			<Link to="/" className={styles.logo}>
				<BeanIcon size={22} />
				Grano de Origen
			</Link>
			<AppNav />
			<ConnectAccount />
		</header>

		<main className={styles.main}>
			<Outlet />
		</main>

		<footer className={styles.footer}>
			<nav className={styles.footerNav}>
				<span>Trazabilidad de café en Stellar</span>
				<a href={labPrefix()} target="_blank" rel="noreferrer">
					Explorador de transacciones
				</a>
			</nav>
		</footer>
	</div>
)

export default App
