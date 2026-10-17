import { type InputHTMLAttributes } from "react"
import styles from "./ui.module.css"

interface Props extends InputHTMLAttributes<HTMLInputElement> {
	id: string
	label: string
	hint?: string
	error?: string
}

export const FormField = ({ id, label, hint, error, ...input }: Props) => {
	const hintId = hint ? `${id}-hint` : undefined
	const errorId = error ? `${id}-error` : undefined
	const describedBy = [hintId, errorId].filter(Boolean).join(" ")
	return (
		<div className={styles.field}>
			<label htmlFor={id}>{label}</label>
			<input
				id={id}
				className={styles.input}
				aria-invalid={error ? true : undefined}
				aria-describedby={describedBy || undefined}
				{...input}
			/>
			{hint && (
				<span id={hintId} className={styles.hint}>
					{hint}
				</span>
			)}
			{error && (
				<span id={errorId} className={styles.fieldError}>
					{error}
				</span>
			)}
		</div>
	)
}
