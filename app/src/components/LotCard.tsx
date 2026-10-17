import { type ReactNode } from "react"
import { type Lot } from "../services/lotService"
import { CalendarIcon, PinIcon, ProcessIcon, UserIcon } from "./Icons"
import styles from "./LotCard.module.css"
import { LotQr } from "./LotQr"

const formatDate = (seconds: bigint) =>
	new Date(Number(seconds) * 1000).toLocaleDateString("es-CR", {
		year: "numeric",
		month: "long",
		day: "numeric",
	})

const Row = ({
	icon,
	label,
	children,
}: {
	icon: ReactNode
	label: string
	children: ReactNode
}) => (
	<div className={styles.row}>
		<dt>
			{icon}
			<span>{label}</span>
		</dt>
		<dd>{children}</dd>
	</div>
)

export const LotCard = ({ lot }: { lot: Lot }) => (
	<article className={styles.card} aria-labelledby={`lot-${lot.id}-title`}>
		<header className={styles.header}>
			<span className={styles.kicker}>Lote</span>
			<h2 id={`lot-${lot.id}-title`}>N.º {lot.id}</h2>
		</header>
		<dl className={styles.list}>
			<Row icon={<PinIcon size={18} />} label="Finca">
				{lot.farm}
			</Row>
			<Row icon={<CalendarIcon size={18} />} label="Cosecha">
				{lot.harvest}
			</Row>
			<Row icon={<ProcessIcon size={18} />} label="Proceso">
				{lot.process}
			</Row>
			<Row icon={<UserIcon size={18} />} label="Dueño actual">
				<code className={styles.address}>{lot.owner}</code>
			</Row>
			<Row icon={<CalendarIcon size={18} />} label="Registrado el">
				{formatDate(lot.created_at)}
			</Row>
		</dl>
		<footer className={styles.qr}>
			<LotQr lotId={lot.id} size={160} />
		</footer>
	</article>
)
