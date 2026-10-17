import { Link } from "react-router-dom"
import { avatarSvg, HAIR_COLORS, SKIN_TONES } from "../closet/avatarArt"
import {
	CATEGORY_LABEL,
	findModel,
	SLOT_LABEL,
	SLOT_ORDER,
} from "../closet/catalog"
import styles from "../closet/closet.module.css"
import { friendlyError } from "../closet/closetService"
import { Avatar, HomeScene, WalletRequired } from "../closet/components"
import { PETS, PetSvg, usePet } from "../closet/pets"
import petStyles from "../closet/pets.module.css"
import { useCloset } from "../closet/useCloset"

const SKIN_NAMES = ["muy claro", "claro", "medio", "oscuro", "muy oscuro"]
const HAIR_NAMES = [
	"negro",
	"castaño oscuro",
	"castaño rojizo",
	"rubio",
	"gris",
]

/** Saves the avatar as a standalone SVG file. */
function downloadAvatar(svg: string) {
	const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }))
	const link = document.createElement("a")
	link.href = url
	link.download = "mi-avatar.svg"
	link.click()
	setTimeout(() => URL.revokeObjectURL(url), 1000)
}

const Swatches = ({
	label,
	colors,
	names,
	selected,
	onPick,
}: {
	label: string
	colors: string[]
	names: string[]
	selected: string
	onPick: (color: string) => void
}) => (
	<div className={styles.swatchRow}>
		<span id={`swatch-${label}`}>{label}</span>
		<div
			role="group"
			aria-labelledby={`swatch-${label}`}
			className={styles.swatches}
		>
			{colors.map((color, i) => (
				<button
					key={color}
					type="button"
					className={styles.swatch}
					style={{ background: color }}
					aria-pressed={selected === color}
					aria-label={`${label}: ${names[i] ?? color}`}
					onClick={() => onPick(color)}
				/>
			))}
		</div>
	</div>
)

const ClosetView = ({ address }: { address: string }) => {
	const {
		items,
		isLoading,
		error,
		wear,
		wornIds,
		furniture,
		toggleEquip,
		look,
		setLook,
		level,
		points,
		progress,
	} = useCloset(address)
	const { petKey } = usePet()
	const pet = PETS.find((p) => p.key === petKey)

	// Items grouped by the part of the body they go on, in a fixed order.
	const groups = SLOT_ORDER.map((slot) => ({
		slot,
		items: items.filter((i) => findModel(i.name)?.slot === slot),
	})).filter((g) => g.items.length > 0)
	const noDesign = items.filter((i) => !findModel(i.name))

	return (
		<>
			<div className={styles.layout}>
				<section className={styles.panel} aria-labelledby="avatar-title">
					<h2 id="avatar-title">Su avatar</h2>
					<Avatar wear={wear} look={look} />
					<Swatches
						label="Piel"
						colors={SKIN_TONES}
						names={SKIN_NAMES}
						selected={look.skin}
						onPick={(skin) => setLook({ skin })}
					/>
					<Swatches
						label="Cabello"
						colors={HAIR_COLORS}
						names={HAIR_NAMES}
						selected={look.hair}
						onPick={(hair) => setLook({ hair })}
					/>
					<button
						type="button"
						className={styles.download}
						onClick={() => downloadAvatar(avatarSvg(wear, look))}
					>
						Descargar avatar (SVG)
					</button>
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
					{groups.map(({ slot, items: slotItems }) => (
						<div key={slot} className={styles.slotGroup}>
							<h3>{SLOT_LABEL[slot]}</h3>
							<ul className={styles.items}>
								{slotItems.map((item) => {
									const model = findModel(item.name)
									const worn = wornIds.has(item.id)
									return (
										<li
											key={item.id}
											className={`${styles.item} ${worn ? styles.worn : ""}`}
										>
											{worn && <span className={styles.wornTag}>Puesto</span>}
											<strong>{item.name}</strong>
											<span className={styles.badge}>
												{CATEGORY_LABEL[item.category]} n.º {item.id}
											</span>
											{model?.slot === "furniture" ? (
												<span className={styles.muted}>En su hogar</span>
											) : (
												<button
													type="button"
													aria-pressed={worn}
													onClick={() => toggleEquip(item)}
												>
													{worn ? "Quitar" : "Equipar"}
												</button>
											)}
										</li>
									)
								})}
							</ul>
						</div>
					))}
					{noDesign.length > 0 && (
						<div className={styles.slotGroup}>
							<h3>Sin diseño todavía</h3>
							<ul className={styles.items}>
								{noDesign.map((item) => (
									<li key={item.id} className={styles.item}>
										<strong>{item.name}</strong>
										<span className={styles.badge}>
											{CATEGORY_LABEL[item.category]} n.º {item.id}
										</span>
									</li>
								))}
							</ul>
						</div>
					)}
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
