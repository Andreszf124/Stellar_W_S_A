import { Link } from "react-router-dom"
import { platformAddress } from "../trustless/config"
import { isDemoAddress } from "./demo"
import PayDialog from "./PayDialog"
import { PetSvg, useOwnedPets, usePet, type Pet } from "./pets"

/** A Stellar text memo holds 28 bytes at most. */
const memoFor = (pet: Pet) => {
	let memo = ""
	for (const char of `Mascota ${pet.name}`) {
		if (new TextEncoder().encode(memo + char).length > 28) break
		memo += char
	}
	return memo
}

/**
 * The payment window for a pet. With a wallet the XLM goes to the platform
 * account; in demo mode the payment is only simulated. A pet is not shipped.
 */
const PetCheckout = ({
	pet,
	address,
	onClose,
}: {
	pet: Pet
	address: string
	onClose: () => void
}) => {
	const { add } = useOwnedPets(address)
	const { setPet } = usePet()
	const demo = isDemoAddress(address)

	return (
		<PayDialog
			title={pet.name}
			subtitle={`${pet.species} · mascota`}
			priceXlm={pet.priceXlm}
			demo={demo}
			to={platformAddress ?? ""}
			memo={memoFor(pet)}
			preview={<PetSvg petKey={pet.key} size={160} />}
			caption={demo ? "Mascota de demostración" : "Su nueva mascota"}
			onPaid={() => {
				add(pet.key)
				setPet(pet.key)
			}}
			successText={`Ya es suya: ${pet.name} lo acompaña en su avatar.${demo ? " Conecte una billetera para comprar de verdad en Stellar Testnet." : ""}`}
			successActions={<Link to="/avatar">Ver en mi avatar</Link>}
			onClose={onClose}
		/>
	)
}

export default PetCheckout
