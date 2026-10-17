import { useState } from "react"
import { Link } from "react-router-dom"
import styles from "../closet/business.module.css"
import BusinessProfileForm from "../closet/BusinessProfileForm"
import { WalletRequired } from "../closet/components"
import InventoryTable from "../closet/InventoryTable"
import MissionsAdmin from "../closet/MissionsAdmin"
import ProductForm from "../closet/ProductForm"
import UnitsRegistrar from "../closet/UnitsRegistrar"
import { useBusinesses } from "../closet/useBusinesses"

const SECTIONS = [
	{ id: "inventario", label: "Inventario" },
	{ id: "productos", label: "Productos" },
	{ id: "unidades", label: "Registrar unidades" },
	{ id: "perfil", label: "Perfil" },
	{ id: "misiones", label: "Misiones" },
] as const

type SectionId = (typeof SECTIONS)[number]["id"]

const fromHash = (): SectionId => {
	const hash = window.location.hash.slice(1)
	return SECTIONS.find((s) => s.id === hash)?.id ?? "inventario"
}

const BusinessPanel = ({ address }: { address: string }) => {
	const { byWallet, isPending } = useBusinesses()
	const [section, setSection] = useState<SectionId>(fromHash)
	const business = byWallet(address)

	const open = (id: SectionId) => {
		setSection(id)
		window.history.replaceState(null, "", `#${id}`)
	}

	return (
		<>
			<div className={styles.headerRow}>
				{business ? (
					<>
						<p className={styles.businessName}>{business.name}</p>
						<Link to={`/tiendas/${business.ref}`} className={styles.publicLink}>
							Ver mi perfil público
						</Link>
					</>
				) : (
					<p className={styles.businessName} role="status">
						{isPending
							? "Buscando su perfil..."
							: "Aún no tiene perfil: créelo abajo"}
						{!isPending && (
							<>
								{" "}
								(
								<button
									type="button"
									className={styles.linkButton}
									onClick={() => open("perfil")}
								>
									ir a Perfil
								</button>
								)
							</>
						)}
					</p>
				)}
			</div>

			<nav aria-label="Secciones de Mi negocio">
				<ul className={styles.tabs}>
					{SECTIONS.map((s) => (
						<li key={s.id}>
							<button
								type="button"
								className={styles.tab}
								aria-pressed={section === s.id}
								onClick={() => open(s.id)}
							>
								{s.label}
							</button>
						</li>
					))}
				</ul>
			</nav>

			<div id={section}>
				{section === "inventario" && <InventoryTable address={address} />}
				{section === "productos" && <ProductForm address={address} />}
				{section === "unidades" && <UnitsRegistrar address={address} />}
				{section === "perfil" && <BusinessProfileForm address={address} />}
				{section === "misiones" && <MissionsAdmin address={address} />}
			</div>
		</>
	)
}

const Store = () => (
	<div className={styles.page}>
		<h1>Mi negocio</h1>
		<p className={styles.lead}>
			Cree sus productos, registre cada unidad que vende y entregue al comprador
			su código de un solo uso. Su negocio es la dirección de su billetera
			conectada.
		</p>
		<WalletRequired>
			{(address) => <BusinessPanel key={address} address={address} />}
		</WalletRequired>
	</div>
)

export default Store
