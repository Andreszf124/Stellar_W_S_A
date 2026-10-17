import { Link } from "react-router-dom"
import styles from "../closet/closet.module.css"

const ICONS = [
	<g key="icon1">
		<path d="M6 8h12l-1 12H7L6 8z" />
		<path d="M9 8a3 3 0 016 0" />
	</g>,
	<g key="icon2">
		<rect x="4" y="4" width="16" height="16" rx="3" />
		<path d="M8 12.5l3 3 5-6" />
	</g>,
	<g key="icon3">
		<circle cx="12" cy="7" r="3" />
		<path d="M5 20c0-4 3-6 7-6s7 2 7 6" />
	</g>,
]

const STEPS = [
	{
		title: "Compre en una tienda",
		text: "Cada producto de ropa o muebles trae un código de un solo uso.",
	},
	{
		title: "Reclame su ítem digital",
		text: "Escriba el código y el ítem queda a su nombre en la red Stellar.",
	},
	{
		title: "Vista y decore",
		text: "Equipe a su avatar, decore su hogar y suba de nivel con tareas.",
	},
]

const Home = () => (
	<div className={styles.page}>
		<h1>Lo que compra, también en su mundo digital</h1>
		<p className={styles.lead}>
			Cada prenda o mueble que compra en una tienda le da su versión digital
			para su avatar y su hogar. Con tareas, usted lo hace crecer.
		</p>

		<div className={styles.actions}>
			<Link
				to="/reclamar"
				className={`${styles.linkButton} ${styles.linkButtonPrimary}`}
			>
				Reclamar un ítem
			</Link>
			<Link to="/closet" className={styles.linkButton}>
				Ver mi clóset
			</Link>
		</div>

		<ol className={styles.steps}>
			{STEPS.map((step, i) => (
				<li key={step.title}>
					<svg
						className={styles.stepIcon}
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="1.8"
						strokeLinecap="round"
						strokeLinejoin="round"
						aria-hidden="true"
					>
						{ICONS[i]}
					</svg>
					<h2>{step.title}</h2>
					<p>{step.text}</p>
				</li>
			))}
		</ol>

		<p className={styles.muted}>
			¿Tiene una tienda? Registre sus unidades en{" "}
			<Link to="/tienda">Tienda</Link>.
		</p>
	</div>
)

export default Home
