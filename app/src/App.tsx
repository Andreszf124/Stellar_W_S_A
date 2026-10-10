import { labPrefix } from "@stellar-scaffold/app-lib"
import { NavLink, Outlet, Route, Routes } from "react-router-dom"
import styles from "./App.module.css"
import ConnectAccount from "./components/ConnectAccount"
import Debug from "./pages/Debug"
import Escrows from "./pages/Escrows"
import Home from "./pages/Home"

function App() {
	return (
		<Routes>
			<Route element={<AppLayout />}>
				<Route path="/" element={<Home />} />
				<Route path="/escrows" element={<Escrows />} />
				<Route path="/debug" element={<Debug />} />
				<Route path="/debug/:contractName" element={<Debug />} />
			</Route>
		</Routes>
	)
}

const AppLayout = () => (
	<div className={styles.AppLayout}>
		<header className={styles.header}>
			<NavLink to="/" className={styles.logo}>
				Scaffold Pura Vida
			</NavLink>
			<nav className={styles.headerNav}>
				<NavLink
					to="/escrows"
					className={({ isActive }) => (isActive ? styles.active : "")}
				>
					Escrow Studio
				</NavLink>
				<NavLink
					to="/debug"
					className={({ isActive }) => (isActive ? styles.active : "")}
				>
					Contracts
				</NavLink>
				<a href={labPrefix()} target="_blank" rel="noreferrer">
					Transaction Explorer
				</a>
			</nav>
			<ConnectAccount />
		</header>

		<main className={styles.main}>
			<Outlet />
		</main>

		<footer className={styles.footer}>
			<nav className={styles.footerNav}>
				<a
					href="https://github.com/stellar-scaffold/cli"
					target="_blank"
					rel="noreferrer"
				>
					Built on Scaffold Stellar
				</a>
				<a href="https://stellarscaffold.org" target="_blank" rel="noreferrer">
					Scaffold docs
				</a>
				<a
					href="https://docs.trustlesswork.com"
					target="_blank"
					rel="noreferrer"
				>
					Trustless Work docs
				</a>
				<a
					href="https://developers.stellar.org"
					target="_blank"
					rel="noreferrer"
				>
					Stellar docs
				</a>
			</nav>
		</footer>
	</div>
)

export default App
