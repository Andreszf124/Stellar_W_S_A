import { useQueryClient } from "@tanstack/react-query"
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react"
import { useWallet } from "../hooks/useWallet"
import styles from "./business.module.css"
import { CATEGORY_LABEL, MODELS, type Product } from "./catalog"
import { generateClaimCode } from "./claimCode"
import { friendlyError, registerItem } from "./closetService"
import { formatXlm } from "./money"
import { useProducts } from "./useProducts"

const MAX_UNITS = 10

interface Issued {
	id: number
	name: string
	code: string
}

/** What is left to do after a unit failed. */
interface Pending {
	product: Product
	total: number
	remaining: number
}

const csvCell = (value: string | number) =>
	`"${String(value).replace(/"/g, '""')}"`

const UnitsRegistrar = ({ address }: { address: string }) => {
	const { signTransaction } = useWallet()
	const queryClient = useQueryClient()
	const { custom } = useProducts()
	const mine = useMemo(
		() => custom.filter((p) => p.store === address),
		[custom, address],
	)

	const [choice, setChoice] = useState(`base:${MODELS[0]?.key ?? ""}`)
	const [quantity, setQuantity] = useState("1")
	const [issued, setIssued] = useState<Issued[]>([])
	const [progress, setProgress] = useState<{
		current: number
		total: number
	} | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [pending, setPending] = useState<Pending | null>(null)
	const [saved, setSaved] = useState(true)
	const [notice, setNotice] = useState("")
	const running = useRef(false)

	const product: Product | undefined = choice.startsWith("custom:")
		? mine.find((p) => p.name === choice.slice(7))
		: MODELS.find((m) => m.key === choice.slice(5))

	const count = Number(quantity)
	const countValid =
		/^\d+$/.test(quantity.trim()) && count >= 1 && count <= MAX_UNITS

	// Warn before leaving while there are codes the person has not saved.
	useEffect(() => {
		if (issued.length === 0 || saved) return
		const warn = (event: BeforeUnloadEvent) => {
			event.preventDefault()
		}
		window.addEventListener("beforeunload", warn)
		return () => window.removeEventListener("beforeunload", warn)
	}, [issued.length, saved])

	const runBatch = async (
		target: Product,
		total: number,
		remaining: number,
	) => {
		if (running.current) return
		running.current = true
		setError(null)
		setPending(null)
		setNotice("")
		let made = 0
		try {
			for (let n = 0; n < remaining; n++) {
				setProgress({ current: total - remaining + n + 1, total })
				// The code is made here; only its hash goes on-chain.
				const code = generateClaimCode()
				try {
					const id = await registerItem(address, target, code, signTransaction)
					made += 1
					setSaved(false)
					setIssued((prev) => [...prev, { id, name: target.name, code }])
				} catch (e) {
					setError(
						`Unidad ${total - remaining + n + 1} de ${total}: ${friendlyError(e)}`,
					)
					setPending({ product: target, total, remaining: remaining - n })
					return
				}
			}
			setNotice(
				`Listo: ${total === 1 ? "se registró 1 unidad" : `se registraron ${total} unidades`} de «${target.name}».`,
			)
		} finally {
			running.current = false
			setProgress(null)
			if (made > 0) {
				await Promise.all([
					queryClient.invalidateQueries({ queryKey: ["closet", "products"] }),
					queryClient.invalidateQueries({
						queryKey: ["closet", "inventory", address],
					}),
				])
			}
		}
	}

	const submit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		if (!product || !countValid) {
			setError(`Elija un producto y una cantidad entre 1 y ${MAX_UNITS}.`)
			return
		}
		void runBatch(product, count, count)
	}

	const retry = () => {
		if (pending)
			void runBatch(pending.product, pending.total, pending.remaining)
	}

	const copyAll = async () => {
		const text = issued.map((i) => `${i.id}\t${i.name}\t${i.code}`).join("\n")
		try {
			await navigator.clipboard.writeText(text)
			setSaved(true)
			setNotice("Códigos copiados.")
		} catch {
			setNotice("No se pudo copiar. Use «Descargar CSV» o copie a mano.")
		}
	}

	const downloadCsv = () => {
		const lines = [
			"item,producto,codigo",
			...issued.map((i) => [i.id, csvCell(i.name), i.code].join(",")),
		]
		// The BOM lets Excel read the accents.
		const blob = new Blob([`﻿${lines.join("\r\n")}\r\n`], {
			type: "text/csv;charset=utf-8",
		})
		const url = URL.createObjectURL(blob)
		const link = document.createElement("a")
		link.href = url
		link.download = "codigos-de-reclamo.csv"
		document.body.appendChild(link)
		link.click()
		link.remove()
		URL.revokeObjectURL(url)
		setSaved(true)
		setNotice("Archivo CSV descargado.")
	}

	const clear = () => {
		setIssued([])
		setSaved(true)
		setNotice("")
	}

	const busy = progress !== null

	return (
		<div className={styles.section}>
			<section className={styles.panel} aria-labelledby="units-title">
				<h2 id="units-title">Registrar unidades</h2>
				<p className={styles.muted}>
					Cada unidad es un ítem en la red con su propio código de un solo uso.
					Cada una pide su firma en la billetera.
				</p>
				<form className={styles.form} onSubmit={submit} noValidate>
					<div className={styles.row}>
						<div className={styles.field}>
							<label htmlFor="u-product">Producto</label>
							<select
								id="u-product"
								value={choice}
								disabled={busy}
								onChange={(e) => setChoice(e.target.value)}
							>
								{mine.length > 0 && (
									<optgroup label="Mis productos">
										{mine.map((p) => (
											<option key={p.name} value={`custom:${p.name}`}>
												{p.name} ({formatXlm(p.priceXlm)})
											</option>
										))}
									</optgroup>
								)}
								<optgroup label="Diseños base">
									{MODELS.map((m) => (
										<option key={m.key} value={`base:${m.key}`}>
											{m.name} ({CATEGORY_LABEL[m.category]})
										</option>
									))}
								</optgroup>
							</select>
						</div>
						<div className={styles.field}>
							<label htmlFor="u-qty">Cantidad (1 a {MAX_UNITS})</label>
							<input
								id="u-qty"
								type="number"
								min={1}
								max={MAX_UNITS}
								step={1}
								inputMode="numeric"
								value={quantity}
								disabled={busy}
								aria-invalid={countValid ? undefined : true}
								onChange={(e) => setQuantity(e.target.value)}
							/>
						</div>
					</div>
					<button
						type="submit"
						className={styles.primary}
						disabled={busy || !product || !countValid}
					>
						{busy
							? "Registrando..."
							: countValid
								? `Registrar ${count} ${count === 1 ? "unidad" : "unidades"}`
								: "Registrar unidades"}
					</button>
				</form>

				<div aria-live="polite">
					{progress && (
						<p className={styles.notice} role="status">
							Unidad {progress.current} de {progress.total}: esperando su firma
							en la billetera.
						</p>
					)}
					{!progress && notice && (
						<p className={`${styles.notice} ${styles.success}`} role="status">
							{notice}
						</p>
					)}
				</div>
				{error && (
					<div className={`${styles.notice} ${styles.error}`} role="alert">
						<p>{error}</p>
						{issued.length > 0 && (
							<p>
								Las unidades ya registradas se conservan en la lista de abajo.
							</p>
						)}
						{pending && (
							<button type="button" disabled={busy} onClick={retry}>
								Reintentar las {pending.remaining} restantes
							</button>
						)}
					</div>
				)}
			</section>

			{issued.length > 0 && (
				<section className={styles.panel} aria-labelledby="codes-title">
					<h2 id="codes-title">Códigos de reclamo ({issued.length})</h2>
					<p className={`${styles.notice} ${styles.warning}`}>
						<strong>Guárdelos ahora: no se vuelven a mostrar.</strong> En la red
						solo queda su huella, así que no hay forma de recuperarlos. Entregue
						a cada comprador el n.º de ítem y su código.
					</p>
					<div className={styles.actions}>
						<button type="button" onClick={() => void copyAll()}>
							Copiar todos
						</button>
						<button type="button" onClick={downloadCsv}>
							Descargar CSV
						</button>
						<button type="button" disabled={!saved || busy} onClick={clear}>
							Limpiar lista
						</button>
					</div>
					{!saved && (
						<p className={styles.muted}>
							«Limpiar lista» se activa cuando copie o descargue los códigos.
						</p>
					)}
					<ul className={styles.codes}>
						{issued.map((i) => (
							<li key={i.id}>
								<span>
									Ítem n.º <strong>{i.id}</strong>
								</span>
								<span>{i.name}</span>
								<span className={styles.codeValue}>{i.code}</span>
							</li>
						))}
					</ul>
				</section>
			)}
		</div>
	)
}

export default UnitsRegistrar
