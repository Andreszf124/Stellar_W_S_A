import { type ReactNode } from "react"
import { AlertIcon, BeanIcon, CheckIcon, SpinnerIcon } from "./Icons"
import styles from "./ui.module.css"

type Variant = "loading" | "empty" | "error" | "success"

interface Props {
	variant: Variant
	title: string
	children?: ReactNode
}

const ICONS = {
	loading: <SpinnerIcon className={styles.spin} />,
	empty: <BeanIcon />,
	error: <AlertIcon />,
	success: <CheckIcon />,
}

const VARIANT_CLASS: Record<Variant, string> = {
	loading: "",
	empty: "",
	error: styles.error ?? "",
	success: styles.success ?? "",
}

/** Visible loading, empty, error and success feedback. */
export const StatusMessage = ({ variant, title, children }: Props) => (
	<div
		className={`${styles.status} ${VARIANT_CLASS[variant]}`}
		role={variant === "error" ? "alert" : "status"}
	>
		{ICONS[variant]}
		<div>
			<h3>{title}</h3>
			{children && <p>{children}</p>}
		</div>
	</div>
)
