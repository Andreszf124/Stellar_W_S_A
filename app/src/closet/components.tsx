import { type ReactNode } from "react"
import { useWallet } from "../hooks/useWallet"
import {
	avatarSvg,
	roomSvg,
	type Furnishing,
	type Look,
	type Wear,
} from "./avatarArt"
import { type Model } from "./catalog"

// The SVG strings come from avatarArt.ts, built only from the fixed catalog
// with hex-checked colors, never from user input.
export const Avatar = ({
	wear,
	look,
	label = "Su avatar",
	mannequin = false,
}: {
	wear: Wear[]
	look?: Look
	label?: string
	/** A neutral grey figure, the way a product looks on its own in the shop. */
	mannequin?: boolean
}) => (
	<div
		role="img"
		aria-label={label}
		dangerouslySetInnerHTML={{ __html: avatarSvg(wear, look, mannequin) }}
	/>
)

/** The digital home with the given furniture in it. */
export const HomeScene = ({
	furniture,
	label = "Su hogar digital",
}: {
	furniture: Furnishing[]
	label?: string
}) => (
	<div
		role="img"
		aria-label={label}
		dangerouslySetInnerHTML={{ __html: roomSvg(furniture) }}
	/>
)

/** A product on its own: furniture in the room, the rest on the neutral figure. */
export const ModelThumb = ({ model }: { model: Model }) =>
	model.slot === "furniture" ? (
		<HomeScene
			label={model.name}
			furniture={[{ key: model.key, color: model.color }]}
		/>
	) : (
		<Avatar
			mannequin
			label={model.name}
			wear={[{ slot: model.slot, key: model.key, color: model.color }]}
		/>
	)

/** Shows the page only when a wallet is connected. */
export const WalletRequired = ({
	children,
}: {
	children: (address: string) => ReactNode
}) => {
	const { address } = useWallet()
	if (!address) {
		return (
			<p className="notice" role="status">
				Conecte su billetera con el botón de la parte superior para continuar.
			</p>
		)
	}
	return <>{children(address)}</>
}
