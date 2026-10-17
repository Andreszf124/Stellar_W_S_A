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
import styles from "./closet.module.css"

// The SVG strings come from avatarArt.ts, built only from the fixed catalog
// with hex-checked colors, never from user input.
export const Avatar = ({
	wear,
	look,
	label = "Su avatar",
}: {
	wear: Wear[]
	look?: Look
	label?: string
}) => (
	<div
		className={styles.avatar}
		role="img"
		aria-label={label}
		dangerouslySetInnerHTML={{ __html: avatarSvg(wear, look) }}
	/>
)

/** A product on its own: furniture in the room, everything else on the avatar. */
export const ModelThumb = ({ model }: { model: Model }) =>
	model.slot === "furniture" ? (
		<HomeScene furniture={[{ key: model.key, color: model.color }]} />
	) : (
		<Avatar wear={[{ slot: model.slot, key: model.key, color: model.color }]} />
	)

export const HomeScene = ({
	furniture,
	label = "Su hogar digital",
}: {
	furniture: Furnishing[]
	label?: string
}) => (
	<div
		className={styles.scene}
		role="img"
		aria-label={label}
		dangerouslySetInnerHTML={{ __html: roomSvg(furniture) }}
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
			<p className={styles.notice} role="status">
				Conecte su billetera con el botón de la parte superior para continuar.
			</p>
		)
	}
	return <>{children(address)}</>
}
