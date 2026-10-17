import { Link } from "react-router-dom"
import styles from "../closet/closet.module.css"

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
			Cada prenda o mueble que compra en una tienda aliada le da su versión
			digital para su avatar y su hogar. Con tareas, usted lo hace crecer.
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
			{STEPS.map((step) => (
				<li key={step.title}>
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
