import { lazy, Suspense, useState } from "react"
import { Link } from "react-router-dom"
import { formatXlm } from "../closet/money"
import { PETS, PetSvg, useOwnedPets, usePet, type Pet } from "../closet/pets"
import styles from "../closet/pets.module.css"
import { useWallet } from "../hooks/useWallet"
import { platformAddress } from "../trustless/config"

const PayDialog = lazy(() => import("../closet/PayDialog"))

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

/** A Stellar text memo holds 28 bytes at most. */
const memoFor = (pet: Pet) => {
	let memo = ""
	for (const char of `Mascota ${pet.name}`) {
		if (new TextEncoder().encode(memo + char).length > 28) break
		memo += char
	}
	return memo
}

const Pets = () => {
	const { address } = useWallet()
	const { petKey, setPet } = usePet()
	const { add, isOwned } = useOwnedPets(address)
	const [buying, setBuying] = useState<Pet | null>(null)

	const canBuy = Boolean(address && platformAddress)

	return (
		<div className={styles.page}>
			<h1>Mascotas</h1>
			<p className={styles.lead}>
				Compre la mascota que lo acompaña. El pago es en XLM de prueba (red
				Testnet), sin dinero real, y va a la cuenta de la plataforma.
			</p>
			<p className={styles.notice} role="note">
				Sus mascotas se guardan en este navegador, no en la blockchain. Por
				ahora no se visten ni suben de nivel por separado: la ropa se equipa en
				su avatar.
			</p>
			{!address && (
				<p className={styles.notice} role="note">
					Conecte su billetera para comprar.
				</p>
			)}
			{!platformAddress && (
				<p className={`${styles.notice} ${styles.warn}`} role="note">
					Las compras están desactivadas: falta definir{" "}
					<code>PUBLIC_PLATFORM_ADDRESS</code> en <code>app/.env</code>, la
					dirección que recibe los pagos de las mascotas.
				</p>
			)}
			<ul className={styles.grid}>
				{PETS.map((pet) => {
					// A pet chosen back when they were free still counts as theirs.
					const mine = isOwned(pet.key) || petKey === pet.key
					const selected = petKey === pet.key
					return (
						<li key={pet.key} className={styles.card} data-selected={selected}>
							<div className={styles.art}>
								<PetSvg petKey={pet.key} size={160} />
							</div>
							<h2>{pet.name}</h2>
							<p className={styles.species}>{pet.species}</p>
							<p className={styles.desc}>{pet.description}</p>
							<p className={styles.price}>{formatXlm(pet.priceXlm)}</p>
							{mine ? (
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
							) : (
								<button
									type="button"
									className={styles.buy}
									disabled={!canBuy}
									aria-label={`Comprar a ${pet.name} por ${formatXlm(pet.priceXlm)}`}
									onClick={() => setBuying(pet)}
								>
									Comprar por {formatXlm(pet.priceXlm)}
								</button>
							)}
						</li>
					)
				})}
			</ul>
			{buying && platformAddress && (
				<Suspense fallback={null}>
					<PayDialog
						title={buying.name}
						subtitle={`${buying.species} · mascota`}
						priceXlm={buying.priceXlm}
						to={platformAddress}
						memo={memoFor(buying)}
						preview={<PetSvg petKey={buying.key} size={160} />}
						invalidate={[]}
						onPaid={() => {
							add(buying.key)
							setPet(buying.key)
						}}
						successText={`Ya es suya: ${buying.name} lo acompaña`}
						successActions={<Link to="/closet">Ir a mi clóset</Link>}
						onClose={() => setBuying(null)}
					/>
				</Suspense>
			)}
		</div>
	)
}

export default Pets
