import { Link } from "react-router-dom"
import { avatarSvg, HAIR_COLORS, SKIN_TONES } from "../closet/avatarArt"
import { SLOT_LABEL, SLOT_ORDER, findModel } from "../closet/catalog"
import { friendlyError } from "../closet/closetService"
import { Avatar, HomeScene, ModelThumb } from "../closet/components"
import { useAccount } from "../closet/demo"
import { PETS, PetSvg, useOwnedPets, usePet } from "../closet/pets"
import { useCloset } from "../closet/useCloset"
import { useNotification } from "../hooks/useNotification"

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
	<div className="swatch-row">
		<span id={`swatch-${label}`}>{label}</span>
		<div role="group" aria-labelledby={`swatch-${label}`} className="swatches">
			{colors.map((color, i) => (
				<button
					key={color}
					type="button"
					className="swatch"
					style={{ background: color }}
					aria-pressed={selected === color}
					aria-label={`${label}: ${names[i] ?? color}`}
					onClick={() => onPick(color)}
				/>
			))}
		</div>
	</div>
)

const Studio = ({ address }: { address: string }) => {
	const {
		items,
		find,
		isLoading,
		isFetching,
		error,
		refetch,
		wear,
		wornIds,
		furniture,
		toggleEquip,
		look,
		setLook,
	} = useCloset(address)
	const { addNotification } = useNotification()
	const { petKey, setPet } = usePet()
	const { owned: ownedPets } = useOwnedPets(address)
	const pet = PETS.find((p) => p.key === petKey)

	const refresh = async () => {
		const result = await refetch()
		addNotification(
			result.isError
				? "No se pudo leer la red Stellar."
				: "Su guardarropa se sincronizó con la red Stellar.",
			result.isError ? "error" : "success",
		)
	}

	// Items grouped by the part of the body they go on, in a fixed order.
	const groups = SLOT_ORDER.map((slot) => ({
		slot,
		items: items.filter((i) => find(i)?.slot === slot),
	})).filter((g) => g.items.length > 0)

	return (
		<div className="studio">
			<div className="panel studio-stage">
				<div className="stage-avatar">
					<Avatar wear={wear} look={look} />
					{pet && (
						<div className="pet-chip">
							<PetSvg petKey={pet.key} size={56} />
							<span>
								{pet.name} · {pet.species}
							</span>
						</div>
					)}
				</div>
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
					className="btn ghost"
					onClick={() => downloadAvatar(avatarSvg(wear, look))}
				>
					Descargar avatar (SVG)
				</button>
			</div>

			<div>
				<div className="section-head">
					<h2>Mi guardarropa NFT</h2>
					<button
						type="button"
						className="btn ghost small"
						disabled={isFetching}
						onClick={() => void refresh()}
					>
						{isFetching ? "Leyendo..." : "↻ Actualizar desde la red"}
					</button>
				</div>
				<p className="muted">
					Con una billetera conectada, estos ítems se leen en vivo del contrato
					en Stellar; sin billetera son ítems de demostración de este navegador.
					Toque uno para ponerlo o quitarlo.
				</p>
				{isLoading && <p role="status">Cargando sus ítems...</p>}
				{error && (
					<p className="error" role="alert">
						{friendlyError(error)}
					</p>
				)}
				{!isLoading && !error && items.length === 0 && (
					<div className="empty">
						<p>Todavía no tiene ítems NFT.</p>
						<p>
							Compre un producto en la <Link to="/">Tienda</Link>. En modo demo
							el ítem llega al instante; con una billetera, reclámelo en{" "}
							<Link to="/pedidos">Pedidos</Link> con el código que viene con él.
						</p>
					</div>
				)}
				{groups.map(({ slot, items: slotItems }) => (
					<div key={slot} className="slot-group">
						<h4>{SLOT_LABEL[slot]}</h4>
						<ul className="items">
							{slotItems.map((item) => {
								const model = findModel(item.name)
								const worn = wornIds.has(item.id)
								if (model?.slot === "furniture") {
									return (
										<li key={item.id}>
											<div className="item locked">
												<ModelThumb model={model} />
												<div className="i-name">{item.name}</div>
												<div className="i-code">
													n.º {item.id} · en su hogar
												</div>
											</div>
										</li>
									)
								}
								return (
									<li key={item.id}>
										<button
											type="button"
											className="item"
											aria-pressed={worn}
											onClick={() => toggleEquip(item)}
										>
											{worn && <span className="eq">PUESTO</span>}
											{model && <ModelThumb model={model} />}
											<div className="i-name">{item.name}</div>
											<div className="i-code">n.º {item.id}</div>
										</button>
									</li>
								)
							})}
						</ul>
					</div>
				))}

				<div className="slot-group">
					<h4>Mi hogar</h4>
					<div className="panel home-panel">
						<HomeScene furniture={furniture} />
						<p className="muted">
							{furniture.length === 0
								? "Todavía no tiene accesorios de hogar. Los hay en la Tienda."
								: `Tiene ${furniture.length} accesorio${furniture.length === 1 ? "" : "s"} de hogar.`}{" "}
							<Link to="/?c=home">Ver accesorios de hogar</Link>
						</p>
					</div>
				</div>

				<div className="slot-group">
					<h4>Mi mascota</h4>
					{ownedPets.length === 0 && !pet ? (
						<div className="empty">
							<p>Todavía no tiene mascota.</p>
							<Link to="/?c=pets">Ver las mascotas</Link>
						</div>
					) : (
						<ul className="items">
							{PETS.filter(
								(p) => ownedPets.includes(p.key) || p.key === petKey,
							).map((p) => (
								<li key={p.key}>
									<button
										type="button"
										className="item"
										aria-pressed={p.key === petKey}
										onClick={() => setPet(p.key)}
									>
										{p.key === petKey && <span className="eq">ELEGIDA</span>}
										<div className="thumb-pet">
											<PetSvg petKey={p.key} size={110} />
										</div>
										<div className="i-name">{p.name}</div>
										<div className="i-code">{p.species}</div>
									</button>
								</li>
							))}
						</ul>
					)}
				</div>
			</div>
		</div>
	)
}

const AvatarStudio = () => {
	const { address } = useAccount()
	return (
		<section className="view">
			<Studio key={address} address={address} />
		</section>
	)
}

export default AvatarStudio
