import { NavLink, Outlet, Route, Routes } from "react-router-dom"
import styles from "./App.module.css"
import ConnectAccount from "./components/ConnectAccount"
import Claim from "./pages/Claim"
import Closet from "./pages/Closet"
import Debug from "./pages/Debug"
import Escrows from "./pages/Escrows"
import Explore from "./pages/Explore"
import Hogar from "./pages/Hogar"
import Home from "./pages/Home"
import Orders from "./pages/Orders"
import Pets from "./pages/Pets"
import Shop from "./pages/Shop"
import Store from "./pages/Store"
import StoreProfile from "./pages/StoreProfile"
import Stores from "./pages/Stores"
import Tasks from "./pages/Tasks"
import Wallet from "./pages/Wallet"

function App() {
	return (
		<Routes>
			<Route element={<AppLayout />}>
				<Route path="/" element={<Home />} />
				<Route path="/comprar" element={<Shop />} />
				<Route path="/pedidos" element={<Orders />} />
				<Route path="/billetera" element={<Wallet />} />
				<Route path="/closet" element={<Closet />} />
				<Route path="/hogar" element={<Hogar />} />
				<Route path="/mascotas" element={<Pets />} />
				<Route path="/tareas" element={<Tasks />} />
				<Route path="/reclamar" element={<Claim />} />
				<Route path="/tiendas" element={<Stores />} />
				<Route path="/tiendas/:ref" element={<StoreProfile />} />
				<Route path="/tienda" element={<Store />} />
				<Route path="/productos" element={<Explore />} />
				<Route path="/escrows" element={<Escrows />} />
				<Route path="/debug" element={<Debug />} />
				<Route path="/debug/:contractName" element={<Debug />} />
			</Route>
		</Routes>
	)
}

const navClass = ({ isActive }: { isActive: boolean }) =>
	isActive ? styles.active : ""

const AppLayout = () => (
	<div className={styles.AppLayout}>
		<header className={styles.header}>
			<NavLink to="/" className={styles.logo}>
				Mascota Digital
			</NavLink>
			<nav className={styles.headerNav} aria-label="Principal">
				<NavLink to="/comprar" className={navClass}>
					Comprar
				</NavLink>
				<NavLink to="/closet" className={navClass}>
					Mi clóset
				</NavLink>
				<NavLink to="/hogar" className={navClass}>
					Mi hogar
				</NavLink>
				<NavLink to="/mascotas" className={navClass}>
					Mascotas
				</NavLink>
				<NavLink to="/tareas" className={navClass}>
					Misiones
				</NavLink>
				<NavLink to="/reclamar" className={navClass}>
					Reclamar
				</NavLink>
				<NavLink to="/tiendas" className={navClass}>
					Negocios
				</NavLink>
				<NavLink to="/tienda" end className={navClass}>
					Mi negocio
				</NavLink>
			</nav>
			<div className={styles.account}>
				<nav className={styles.accountNav} aria-label="Cuenta">
					<NavLink to="/pedidos" className={navClass}>
						Pedidos
					</NavLink>
					<NavLink to="/billetera" className={navClass}>
						Billetera
					</NavLink>
				</nav>
				<ConnectAccount />
			</div>
		</header>

		<main className={styles.main}>
			<Outlet />
		</main>

		<footer className={styles.footer}>
			<nav className={styles.footerNav} aria-label="Enlaces de ayuda">
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
