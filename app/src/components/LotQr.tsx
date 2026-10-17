import { QRCodeSVG } from "qrcode.react"
import { useRef } from "react"
import styles from "./LotQr.module.css"

interface LotQrProps {
	lotId: number | string
	size?: number
}

const DEFAULT_SIZE = 192

export function LotQr({ lotId, size = DEFAULT_SIZE }: LotQrProps) {
	const wrapperRef = useRef<HTMLDivElement>(null)
	const url = `${window.location.origin}/lote/${lotId}`
	const label = `Código QR del lote ${lotId}. Abre la página pública de trazabilidad.`

	const handleDownload = () => {
		const svg = wrapperRef.current?.querySelector("svg")
		if (!svg) return
		const source = new XMLSerializer().serializeToString(svg)
		const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" })
		const objectUrl = URL.createObjectURL(blob)
		const link = document.createElement("a")
		link.href = objectUrl
		link.download = `lote-${lotId}.svg`
		document.body.appendChild(link)
		link.click()
		link.remove()
		URL.revokeObjectURL(objectUrl)
	}

	return (
		<div className={styles.root}>
			<div ref={wrapperRef} className={styles.qr} role="img" aria-label={label}>
				<QRCodeSVG
					value={url}
					size={size}
					level="M"
					marginSize={2}
					bgColor="#ffffff"
					fgColor="#000000"
					aria-hidden="true"
				/>
			</div>
			<button type="button" className={styles.button} onClick={handleDownload}>
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					aria-hidden="true"
				>
					<path d="M12 3v12" />
					<path d="m7 10 5 5 5-5" />
					<path d="M5 21h14" />
				</svg>
				Descargar QR
			</button>
		</div>
	)
}

export default LotQr
