import { type ReactNode } from "react"
import { useWallet } from "../hooks/useWallet"
import { StatusMessage } from "./StatusMessage"

interface Props {
	children: (address: string) => ReactNode
}

/** Renders children only when a wallet is connected. */
export const WalletGate = ({ children }: Props) => {
	const { address } = useWallet()
	if (!address) {
		return (
			<StatusMessage variant="empty" title="Conecte su billetera">
				Para esta acción necesitamos saber quién es usted. Use el botón de
				conexión en la parte superior de la página.
			</StatusMessage>
		)
	}
	return <>{children(address)}</>
}
