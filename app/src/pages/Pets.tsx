import { PETS, PetSvg, usePet } from "../closet/pets"
import styles from "../closet/pets.module.css"

const Check = () => (
	<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
		<path
			d="M3 8.5l3.2 3L13 4.5"
			fill="none"
			stroke="currentColor"
			strokeWidth="2.2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
)

const Pets = () => {
	const { petKey, setPet } = usePet()
	return (
		<div className={styles.page}>
			<h1>Mascotas</h1>
			<p className={styles.lead}>
				Elija la mascota que lo acompaña. Por ahora la ropa se equipa en su
				avatar.
			</p>
			<p className={styles.notice} role="note">
				Las mascotas son una beta: todavía no se visten ni suben de nivel por
				separado.
			</p>
			<ul className={styles.grid}>
				{PETS.map((pet) => {
					const selected = petKey === pet.key
					return (
						<li key={pet.key} className={styles.card} data-selected={selected}>
							<div className={styles.art}>
								<PetSvg petKey={pet.key} size={160} />
							</div>
							<h2>{pet.name}</h2>
							<p className={styles.species}>{pet.species}</p>
							<p className={styles.desc}>{pet.description}</p>
							<button
								type="button"
								className={styles.choose}
								aria-pressed={selected}
								aria-label={`${selected ? "Elegida" : "Elegir"}: ${pet.name}`}
								onClick={() => setPet(pet.key)}
							>
								{selected && <Check />}
								{selected ? "Elegida" : "Elegir"}
							</button>
						</li>
					)
				})}
			</ul>
		</div>
	)
}

export default Pets
