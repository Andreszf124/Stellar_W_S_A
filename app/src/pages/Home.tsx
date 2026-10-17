import { type ReactNode } from "react"
import { Link } from "react-router-dom"
import { CATEGORY_LABEL, MODELS } from "../closet/catalog"
import styles from "../closet/closet.module.css"
import { ModelThumb } from "../closet/components"
import home from "../closet/home.module.css"
import { formatXlm } from "../closet/money"
import { useBusinesses } from "../closet/useBusinesses"
import { useStats } from "../closet/useStats"
import { type StoreCategory } from "../lib/supabase"

const Icon = ({ children }: { children: ReactNode }) => (
	<svg
		className={home.icon}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="1.8"
		strokeLinecap="round"
		strokeLinejoin="round"
		aria-hidden="true"
	>
		{children}
	</svg>
)

const BENEFITS = [
	{
		title: "Algo digital con cada venta",
		text: "Su cliente se lleva, además del producto, una versión digital para su avatar o su hogar, y la paga en XLM.",
		icon: (
			<g>
				<rect x="3" y="8" width="18" height="12" rx="2" />
				<path d="M12 8v12M3 13h18" />
				<path d="M12 8c-3 0-4-4-1.5-4S12 8 12 8zM12 8c3 0 4-4 1.5-4S12 8 12 8z" />
			</g>
		),
	},
	{
		title: "Menos reclamos falsos",
		text: "El código es de un solo uso. En la red solo queda su huella, no el código.",
		icon: (
			<g>
				<path d="M12 3l8 3v6c0 4.5-3.2 7.8-8 9-4.8-1.2-8-4.5-8-9V6l8-3z" />
				<path d="M8.5 12l2.5 2.5 4.5-5" />
			</g>
		),
	},
	{
		title: "Cada unidad es verificable",
		text: "Cada unidad queda registrada en la red y se puede comprobar.",
		icon: (
			<g>
				<circle cx="11" cy="11" r="6.5" />
				<path d="M16 16l4.5 4.5M8.5 11l2 2 3.5-4" />
			</g>
		),
	},
]

const FAQ = [
	{
		q: "¿Necesito saber de blockchain?",
		a: "No. Solo necesita una billetera Freighter. La aplicación le guía en el resto.",
	},
	{
		q: "¿Cuesta dinero?",
		a: "Todo se paga en XLM, pero es una beta en Testnet: usa XLM de prueba, sin valor real.",
	},
	{
		q: "¿Cómo pago una compra?",
		a: "Desde Comprar, con XLM, firmando en su billetera. La aplicación nunca ve sus claves. Después el negocio le entrega el código para reclamar su ítem.",
	},
	{
		q: "¿Las mascotas tienen precio?",
		a: "Sí. Cada mascota tiene su precio en XLM y se paga a la cuenta de la plataforma.",
	},
	{
		q: "¿Qué son las misiones?",
		a: "Retos que un negocio pone para desbloquear productos específicos. La aplicación comprueba su avance, pero el bloqueo se verifica en la app, no en la red.",
	},
	{
		q: "¿Qué pasa si pierdo el código?",
		a: "El negocio lo entregó una sola vez. Debe pedírselo de nuevo.",
	},
	{
		q: "¿Puedo regalar un ítem?",
		a: "El contrato lo permite, pero la pantalla aún no tiene esa opción.",
	},
	{
		q: "¿Qué significa beta?",
		a: "Que está en pruebas y puede cambiar. Gracias por probarla.",
	},
]

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
		title: "Compre con XLM",
		text: "Elija un producto de un negocio y pague en XLM. El negocio le entrega un código de un solo uso.",
	},
	{
		title: "Reclame su ítem digital",
		text: "Escriba el código y el ítem queda a su nombre en la red Stellar.",
	},
	{
		title: "Vista y decore",
		text: "Equipe a su avatar, decore su hogar y complete misiones para desbloquear más productos.",
	},
]

const STORE_CATEGORY_LABEL: Record<StoreCategory, string> = {
	ropa: "Ropa",
	muebles: "Muebles",
	ambos: "Ropa y muebles",
}

const StoreDirectory = () => {
	const { businesses, isPending, isError } = useBusinesses()
	const shown = businesses.slice(0, 6)
	return (
		<div className={home.directory}>
			<h3 id="home-directory">Negocios</h3>
			{isPending && (
				<p className={home.directoryNote} role="status">
					Cargando los negocios...
				</p>
			)}
			{isError && (
				<p className={home.directoryNote} role="alert">
					No pudimos cargar los negocios ahora.
				</p>
			)}
			{!isPending && !isError && businesses.length === 0 && (
				<p className={home.directoryNote}>Por ahora no hay negocios.</p>
			)}
			{shown.length > 0 && (
				<ul className={home.storeList} aria-labelledby="home-directory">
					{shown.map((business) => (
						<li key={business.ref} className={home.storeCard}>
							<h4>
								<Link to={`/tiendas/${business.ref}`}>{business.name}</Link>
							</h4>
							<span className={home.storeTag}>
								<svg
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="1.8"
									strokeLinecap="round"
									strokeLinejoin="round"
									aria-hidden="true"
								>
									<path d="M4 9l1-4h14l1 4M4 9v10h16V9M4 9h16M10 19v-5h4v5" />
								</svg>
								{STORE_CATEGORY_LABEL[business.category] ?? business.category}
								{business.example ? " · ejemplo" : ""}
							</span>
							<p>{business.tagline ?? business.description}</p>
						</li>
					))}
				</ul>
			)}
			<Link to="/tiendas" className={styles.linkButton}>
				Ver todos los negocios
			</Link>
		</div>
	)
}

const Home = () => {
	const { itemCount } = useStats()
	return (
		<div className={styles.page}>
			<h1>Lo que compra, también en su mundo digital</h1>
			<p className={styles.lead}>
				Cada prenda o mueble que paga en XLM a un negocio le da su versión
				digital para su avatar y su hogar. Con misiones, usted desbloquea más
				productos.
			</p>

			<div className={styles.actions}>
				<Link
					to="/comprar"
					className={`${styles.linkButton} ${styles.linkButtonPrimary}`}
				>
					Comprar con XLM
				</Link>
				<Link to="/reclamar" className={styles.linkButton}>
					Reclamar un ítem
				</Link>
				<Link to="/closet" className={styles.linkButton}>
					Ver mi clóset
				</Link>
				<Link to="/hogar" className={styles.linkButton}>
					Mi hogar
				</Link>
				<Link to="/tareas" className={styles.linkButton}>
					Misiones
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
				¿Tiene un negocio? Registre sus unidades y cree sus productos en{" "}
				<Link to="/tienda">Mi negocio</Link>.
			</p>

			<dl className={home.stats}>
				<div className={home.stat}>
					<dt>Unidades registradas</dt>
					<dd>{itemCount}</dd>
				</div>
				<div className={home.stat}>
					<dt>Tipos de producto</dt>
					<dd>{MODELS.length}</dd>
				</div>
				<div className={home.stat}>
					<dt>Red</dt>
					<dd>Testnet (pruebas)</dd>
				</div>
			</dl>

			<section className={home.section} aria-labelledby="home-catalog">
				<h2 id="home-catalog">Qué puede comprar</h2>
				<p className={home.sectionLead}>
					Estos son los tipos de producto base y su precio en XLM. Los negocios
					pueden crear los suyos.
				</p>
				<ul className={home.grid}>
					{MODELS.map((model) => (
						<li key={model.key} className={home.card}>
							<div className={home.thumb}>
								<ModelThumb model={model} />
							</div>
							<h3>{model.name}</h3>
							<p>{CATEGORY_LABEL[model.category]}</p>
							<p>
								<strong>{formatXlm(model.priceXlm)}</strong>
							</p>
						</li>
					))}
				</ul>
				<Link to="/comprar" className={styles.linkButton}>
					Ir a comprar
				</Link>
			</section>

			<section className={home.section} aria-labelledby="home-stores">
				<h2 id="home-stores">Para las tiendas</h2>
				<ul className={home.benefits}>
					{BENEFITS.map((b) => (
						<li key={b.title}>
							<Icon>{b.icon}</Icon>
							<h3>{b.title}</h3>
							<p>{b.text}</p>
						</li>
					))}
				</ul>
				<p className={home.sectionLead}>
					Cada negocio puede crear sus productos, su perfil con su historia y
					sus misiones desde Mi negocio.
				</p>
				<Link
					to="/tienda"
					className={`${styles.linkButton} ${styles.linkButtonPrimary}`}
				>
					Ir a Mi negocio
				</Link>
				<StoreDirectory />
			</section>

			<section
				className={`${home.section} ${home.faq}`}
				aria-labelledby="home-faq"
			>
				<h2 id="home-faq">Preguntas frecuentes</h2>
				{FAQ.map((item) => (
					<details key={item.q}>
						<summary>{item.q}</summary>
						<p>{item.a}</p>
					</details>
				))}
			</section>

			<p className={home.footerNote}>
				<svg
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.8"
					strokeLinecap="round"
					strokeLinejoin="round"
					aria-hidden="true"
				>
					<path d="M9 3h6M10 3v6l-5 9a2 2 0 001.8 3h10.4a2 2 0 001.8-3l-5-9V3" />
				</svg>
				Beta en Stellar Testnet
			</p>
		</div>
	)
}

export default Home
