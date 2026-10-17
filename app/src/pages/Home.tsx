import React from "react"
import { Link } from "react-router-dom"
import { PlusIcon, SearchIcon, TransferIcon } from "../components/Icons"
import styles from "./Home.module.css"

const ACTIONS = [
	{
		to: "/registrar",
		title: "Registrar un lote",
		text: "Soy productor y quiero dejar constancia del origen de mi café.",
		icon: <PlusIcon size={24} />,
	},
	{
		to: "/lote",
		title: "Consultar un lote",
		text: "Quiero saber de dónde viene el café. No necesito billetera.",
		icon: <SearchIcon size={24} />,
	},
	{
		to: "/transferir",
		title: "Transferir un lote",
		text: "Soy productor y quiero entregar la propiedad a un comprador.",
		icon: <TransferIcon size={24} />,
	},
]

const Home: React.FC = () => (
	<div className={styles.Home}>
		<section className={styles.intro}>
			<h1>Grano de Origen</h1>
			<p>
				Hoy es difícil comprobar de qué finca viene un café, cuándo se cosechó y
				cómo se procesó. Con Grano de Origen el productor registra cada lote en
				Stellar y cualquier comprador puede verificarlo, sin intermediarios y
				sin que nadie pueda cambiar el historial.
			</p>
		</section>

		<ul className={styles.actions}>
			{ACTIONS.map(({ to, title, text, icon }) => (
				<li key={to}>
					<Link to={to} className={styles.action}>
						<span className={styles.actionIcon}>{icon}</span>
						<span className={styles.actionTitle}>{title}</span>
						<span className={styles.actionText}>{text}</span>
					</Link>
				</li>
			))}
		</ul>
	</div>
)

export default Home
