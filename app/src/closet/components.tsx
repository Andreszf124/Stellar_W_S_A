import { type ReactNode } from "react"
import { useWallet } from "../hooks/useWallet"
import { avatarSvg, roomSvg, type Furnishing, type Wear } from "./avatarArt"
import styles from "./closet.module.css"

// The SVG strings come from avatarArt.ts, built only from the fixed catalog
// with hex-checked colors, never from user input.
export const Avatar = ({ wear }: { wear: Wear[] }) => (
	<div
		className={styles.avatar}
		dangerouslySetInnerHTML={{ __html: avatarSvg(wear) }}
	/>
)

export const HomeScene = ({ furniture }: { furniture: Furnishing[] }) => (
	<div
		className={styles.scene}
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
