import { NavLink } from "react-router-dom"
import styles from "../App.module.css"
import { PlusIcon, SearchIcon, TransferIcon } from "./Icons"

const ITEMS = [
	{ to: "/registrar", label: "Registrar", icon: <PlusIcon size={18} /> },
	{ to: "/lote", label: "Consultar", icon: <SearchIcon size={18} /> },
	{ to: "/transferir", label: "Transferir", icon: <TransferIcon size={18} /> },
]

export const AppNav = () => (
	<nav className={styles.headerNav} aria-label="Principal">
		{ITEMS.map(({ to, label, icon }) => (
			<NavLink
				key={to}
				to={to}
				className={({ isActive }) => (isActive ? styles.active : "")}
			>
				{icon}
				{label}
			</NavLink>
		))}
	</nav>
)
