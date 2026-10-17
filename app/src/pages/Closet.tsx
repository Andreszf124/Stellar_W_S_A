import { Link } from "react-router-dom"
import { CATEGORY_LABEL, findModel } from "../closet/catalog"
import styles from "../closet/closet.module.css"
import { friendlyError } from "../closet/closetService"
import { Avatar, HomeScene, WalletRequired } from "../closet/components"
import { PETS, PetSvg, usePet } from "../closet/pets"
import petStyles from "../closet/pets.module.css"
import { useCloset } from "../closet/useCloset"

const ClosetView = ({ address }: { address: string }) => {
	const {
		items,
		isLoading,
		error,
		wear,
		wornIds,
		furniture,
		toggleEquip,
		level,
		points,
		progress,
	} = useCloset(address)
	const { petKey } = usePet()
	const pet = PETS.find((p) => p.key === petKey)

	return (
		<>
			<div className={styles.layout}>
				<section className={styles.panel} aria-labelledby="avatar-title">
					<h2 id="avatar-title">Su avatar</h2>
					<Avatar wear={wear} />
					<div className={styles.level}>
						<span>Nivel {level}</span>
						<span className={styles.muted}>{points} puntos</span>
					</div>
					<div
						className={styles.bar}
						role="progressbar"
						aria-label="Avance al siguiente nivel"
						aria-valuemin={0}
						aria-valuemax={100}
						aria-valuenow={progress}
					>
						<div className={styles.barFill} style={{ width: `${progress}%` }} />
					</div>
					<p className={styles.muted}>
						Suba de nivel con las <Link to="/tareas">tareas</Link>.
					</p>
				</section>

				<section className={styles.panel} aria-labelledby="items-title">
					<h2 id="items-title">Sus ítems</h2>
					{isLoading && <p role="status">Cargando sus ítems...</p>}
					{error && (
						<p className={`${styles.notice} ${styles.error}`} role="alert">
							{friendlyError(error)}
						</p>
					)}
					{!isLoading && !error && items.length === 0 && (
						<p className={styles.notice} role="status">
							Todavía no tiene ítems. Cuando compre un producto, use el código
							que viene con él en <Link to="/reclamar">Reclamar</Link>.
						</p>
					)}
					<ul className={styles.items}>
						{items.map((item) => {
							const model = findModel(item.name)
							const isFurniture = model?.slot === "furniture"
							const worn = wornIds.has(item.id)
							return (
								<li key={item.id} className={styles.item}>
									<strong>{item.name}</strong>
									<span className={styles.badge}>
										{CATEGORY_LABEL[item.category]} n.º {item.id}
									</span>
									{isFurniture ? (
										<span className={styles.muted}>En su hogar</span>
									) : model ? (
										<button
											type="button"
											aria-pressed={worn}
											onClick={() => toggleEquip(item)}
										>
											{worn ? "Quitar" : "Equipar"}
										</button>
									) : (
										<span className={styles.muted}>Sin diseño todavía</span>
									)}
								</li>
							)
						})}
					</ul>
				</section>
			</div>

			<section
				className={styles.panel}
				style={{ marginBottom: "1.5rem" }}
				aria-labelledby="pet-title"
			>
				<h2 id="pet-title">Su mascota</h2>
				{pet ? (
					<div className={petStyles.panelPet}>
						<div className={petStyles.art}>
							<PetSvg petKey={pet.key} size={120} />
						</div>
						<div>
							<strong>{pet.name}</strong>
							<p className={petStyles.muted}>{pet.species}</p>
							<Link className={petStyles.link} to="/mascotas">
								Cambiar mascota
							</Link>
						</div>
					</div>
				) : (
					<p className={petStyles.muted}>
						Todavía no eligió una mascota.{" "}
						<Link className={petStyles.link} to="/mascotas">
							Elegir mascota
						</Link>
					</p>
				)}
			</section>

			<section className={styles.panel} aria-labelledby="home-title">
				<h2 id="home-title">Su hogar digital</h2>
				<HomeScene furniture={furniture} />
				{furniture.length === 0 && (
					<p className={styles.muted}>Reclame un mueble para verlo aquí.</p>
				)}
			</section>
		</>
	)
}

const Closet = () => (
	<div className={styles.page}>
		<h1>Mi clóset y hogar</h1>
		<p className={styles.lead}>
			Aquí viven los ítems digitales de lo que compra. Vista a su avatar y
			decore su hogar.
		</p>
		<WalletRequired>
			{(address) => <ClosetView key={address} address={address} />}
		</WalletRequired>
	</div>
)

export default Closet
