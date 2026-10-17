import { formatXlm } from "./money"
import styles from "./price.module.css"
import { useXlmRate, usdText } from "./useXlmRate"

/** A price in XLM (Stellar Lumens) with its small conversion to dollars. */
const Price = ({
	xlm,
	className = "",
}: {
	xlm: number
	className?: string
}) => {
	const { rate } = useXlmRate()
	const usd = usdText(xlm, rate)
	return (
		<span className={`${styles.price} ${className}`}>
			<strong className={styles.xlm}>{formatXlm(xlm)}</strong>
			{usd && <small className={styles.usd}>{usd}</small>}
		</span>
	)
}

export default Price
