import { useInfiniteQuery } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import styles from "./business.module.css"
import { friendlyError, listItems } from "./closetService"
import { ModelThumb } from "./components"
import { formatXlm, shortAddress } from "./money"
import { useProducts } from "./useProducts"

const PAGE_SIZE = 24

type StatusFilter = "all" | "available" | "claimed"

const normalize = (text: string) =>
	text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()

const InventoryTable = ({ address }: { address: string }) => {
	const { find } = useProducts()
	const [status, setStatus] = useState<StatusFilter>("all")
	const [search, setSearch] = useState("")
	const [loadingAll, setLoadingAll] = useState(false)

	// Same paging as the public catalog; the page keeps only this store's units.
	const query = useInfiniteQuery({
		queryKey: ["closet", "inventory", address],
		initialPageParam: 0,
		queryFn: ({ pageParam }) => listItems(pageParam, PAGE_SIZE),
		getNextPageParam: (last, pages) => {
			const loaded = pages.length * PAGE_SIZE
			return loaded < last.total ? loaded : undefined
		},
	})

	const total = query.data?.pages[0]?.total ?? 0
	const scanned = Math.min((query.data?.pages.length ?? 0) * PAGE_SIZE, total)
	const mine = useMemo(
		() =>
			(query.data?.pages.flatMap((p) => p.items) ?? [])
				.filter((i) => i.store === address)
				.sort((a, b) => b.id - a.id),
		[query.data, address],
	)

	const summary = useMemo(() => {
		const available = mine.filter((i) => !i.claimed)
		let value = 0
		let unpriced = 0
		for (const item of available) {
			const product = find(item.name, item.store)
			if (product) value += product.priceXlm
			else unpriced += 1
		}
		return {
			total: mine.length,
			available: available.length,
			claimed: mine.length - available.length,
			value,
			unpriced,
		}
	}, [mine, find])

	const visible = useMemo(() => {
		const needle = normalize(search.trim())
		return mine.filter(
			(i) =>
				(status === "all" || (status === "claimed") === i.claimed) &&
				(!needle || normalize(i.name).includes(needle)),
		)
	}, [mine, status, search])

	const hasMore = query.hasNextPage
	const busy = query.isFetchingNextPage || loadingAll

	const loadAll = async () => {
		setLoadingAll(true)
		try {
			let result = await query.fetchNextPage()
			while (result.hasNextPage && !result.isError) {
				result = await query.fetchNextPage()
			}
		} finally {
			setLoadingAll(false)
		}
	}

	return (
		<section className={styles.panel} aria-labelledby="inventory-title">
			<h2 id="inventory-title">Inventario</h2>

			{query.isLoading && <p role="status">Cargando su inventario...</p>}

			{query.error && (
				<div className={`${styles.notice} ${styles.error}`} role="alert">
					<p>{friendlyError(query.error)}</p>
					<button type="button" onClick={() => void query.refetch()}>
						Reintentar
					</button>
				</div>
			)}

			{!query.isLoading && !query.error && (
				<>
					<dl className={styles.summaryGrid}>
						<div className={styles.stat}>
							<dt>Unidades</dt>
							<dd>{summary.total}</dd>
						</div>
						<div className={styles.stat}>
							<dt>Disponibles</dt>
							<dd>{summary.available}</dd>
						</div>
						<div className={styles.stat}>
							<dt>Reclamadas</dt>
							<dd>{summary.claimed}</dd>
						</div>
						<div className={styles.stat}>
							<dt>Valor disponible</dt>
							<dd>{formatXlm(summary.value)}</dd>
						</div>
					</dl>
					{summary.unpriced > 0 && (
						<p className={styles.muted}>
							{summary.unpriced} unidades disponibles no tienen un producto con
							precio conocido y no suman al valor.
						</p>
					)}

					<div className={styles.toolbar}>
						<div className={styles.field}>
							<label htmlFor="inv-status">Estado</label>
							<select
								id="inv-status"
								value={status}
								onChange={(e) => setStatus(e.target.value as StatusFilter)}
							>
								<option value="all">Todos</option>
								<option value="available">Disponibles</option>
								<option value="claimed">Reclamados</option>
							</select>
						</div>
						<div className={`${styles.field} ${styles.grow}`}>
							<label htmlFor="inv-search">Buscar por nombre</label>
							<input
								id="inv-search"
								type="search"
								value={search}
								placeholder="Por ejemplo: gorra"
								onChange={(e) => setSearch(e.target.value)}
							/>
						</div>
					</div>

					<p className={styles.muted} role="status">
						Mostrando {visible.length} de {mine.length} unidades suyas. Se
						revisaron {scanned} de {total} ítems de la red
						{hasMore ? "; el resumen cuenta solo lo revisado" : ""}.
					</p>

					{visible.length === 0 ? (
						<p className={styles.empty}>
							{mine.length === 0
								? hasMore
									? "Ninguna unidad suya entre las revisadas. Cargue más para seguir buscando."
									: "Todavía no registró unidades. Use «Registrar unidades»."
								: "Ninguna unidad coincide con los filtros."}
						</p>
					) : (
						<div
							className={styles.tableWrap}
							role="region"
							aria-label="Tabla de inventario, se desplaza horizontalmente"
							tabIndex={0}
						>
							<table className={styles.table}>
								<caption className={styles.srOnly}>
									Unidades registradas por su negocio
								</caption>
								<thead>
									<tr>
										<th scope="col">N.º</th>
										<th scope="col">Producto</th>
										<th scope="col">Estado</th>
										<th scope="col">Dueño</th>
									</tr>
								</thead>
								<tbody>
									{visible.map((item) => {
										const product = find(item.name, item.store)
										return (
											<tr key={item.id}>
												<th scope="row" className={styles.mono}>
													{item.id}
												</th>
												<td>
													<div className={styles.productCell}>
														{product && (
															<div className={styles.thumb} aria-hidden="true">
																<ModelThumb model={product} />
															</div>
														)}
														<span>
															{item.name}
															{product && (
																<>
																	<br />
																	<span className={styles.muted}>
																		{formatXlm(product.priceXlm)}
																	</span>
																</>
															)}
														</span>
													</div>
												</td>
												<td>
													<span
														className={`${styles.status} ${item.claimed ? styles.claimed : styles.available}`}
													>
														{item.claimed ? "Reclamado" : "Disponible"}
													</span>
												</td>
												<td className={styles.mono}>
													{item.claimed ? shortAddress(item.owner) : "—"}
												</td>
											</tr>
										)
									})}
								</tbody>
							</table>
						</div>
					)}

					{hasMore && (
						<div className={styles.more}>
							<button
								type="button"
								disabled={busy}
								onClick={() => void query.fetchNextPage()}
							>
								{busy ? "Cargando..." : "Cargar más"}
							</button>
							<button
								type="button"
								disabled={busy}
								onClick={() => void loadAll()}
							>
								Cargar todo
							</button>
						</div>
					)}
				</>
			)}
		</section>
	)
}

export default InventoryTable
