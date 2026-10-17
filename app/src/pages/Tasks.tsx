import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { MODELS } from "../closet/catalog"
import styles from "../closet/closet.module.css"
import { ModelThumb, WalletRequired } from "../closet/components"
import {
	describeRequirement,
	missionProgress,
	type Mission,
} from "../closet/missions"
import missionStyles from "../closet/missions.module.css"
import { formatXlm } from "../closet/money"
import { TASKS } from "../closet/tasks"
import { useBusinesses } from "../closet/useBusinesses"
import { useCloset } from "../closet/useCloset"
import { useMissions, useUserProgress } from "../closet/useMissions"
import { useProducts } from "../closet/useProducts"
import { useWallet } from "../hooks/useWallet"

const MIGRATION =
	"supabase/migrations/20261017120000_products_missions_profiles.sql"

type Filter = "all" | "active" | "done"

const FILTERS: { id: Filter; label: string }[] = [
	{ id: "all", label: "Todas" },
	{ id: "active", label: "En curso" },
	{ id: "done", label: "Completadas" },
]

const PlatformTasks = ({ address }: { address: string }) => {
	const { done, points, level, progress, isLoading } = useCloset(address)

	return (
		<>
			<section className={styles.panel} aria-labelledby="level-title">
				<h2 id="level-title">Nivel {level}</h2>
				<div
					className={styles.bar}
					role="progressbar"
					aria-label="Avance al siguiente nivel"
					aria-valuemin={0}
					aria-valuemax={100}
					aria-valuenow={progress}
				>
					<div className={styles.barFill} style={{ width: `${progress}%` }} />
				</div>
				<p className={styles.muted}>{points} puntos en total</p>
			</section>

			{isLoading && <p role="status">Revisando su progreso...</p>}
			<ul className={styles.tasks} style={{ marginTop: "0.75rem" }}>
				{TASKS.map((task) => {
					const complete = done.includes(task.id)
					return (
						<li
							key={task.id}
							className={`${styles.task} ${complete ? styles.taskDone : ""}`}
						>
							<div>
								<h3>{task.title}</h3>
								<p>{task.description}</p>
							</div>
							<span className={styles.points}>
								{complete ? "Completada" : `+${task.points} puntos`}
							</span>
						</li>
					)
				})}
			</ul>
		</>
	)
}

const BusinessMissions = ({ address }: { address?: string }) => {
	const { missions, isLoading, error, missingTable } = useMissions()
	const { progress } = useUserProgress(address)
	const { byWallet, nameOf } = useBusinesses()
	const { find } = useProducts()
	const [filter, setFilter] = useState<Filter>("all")

	const rows = useMemo(
		() =>
			missions.map((mission) => ({
				mission,
				progress: missionProgress(mission, progress),
			})),
		[missions, progress],
	)

	const visible = rows.filter((r) =>
		filter === "all"
			? true
			: filter === "done"
				? r.progress.done
				: !r.progress.done,
	)

	const groups = new Map<string, typeof visible>()
	for (const row of visible) {
		const list = groups.get(row.mission.store) ?? []
		list.push(row)
		groups.set(row.mission.store, list)
	}
	const ordered = [...groups.entries()]
		.map(([store, list]) => ({ store, name: nameOf(store), list }))
		.sort((a, b) => a.name.localeCompare(b.name, "es"))

	const rewardOf = (m: Mission) =>
		find(m.rewardProduct, m.store) ??
		MODELS.find((model) => model.name === m.rewardProduct)

	return (
		<section className={missionStyles.section} aria-labelledby="missions-title">
			<h2 id="missions-title">Misiones de los negocios</h2>
			<p className={missionStyles.sectionLead}>
				Cada negocio crea misiones para desbloquear uno de sus productos. El
				bloqueo se comprueba en esta aplicación, no en la red. Su progreso se
				lee de lo que usted realmente posee en la red y de lo que tiene puesto,
				que se guarda en este navegador.
			</p>

			{!address && (
				<p className={styles.notice} role="status">
					Conecte su billetera con el botón de la parte superior para ver su
					progreso. Mientras tanto se muestra en 0.
				</p>
			)}

			{missingTable ? (
				<p className={`${styles.notice} ${styles.error}`} role="alert">
					Las misiones de los negocios aún no están activadas: falta aplicar la
					migración de Supabase ({MIGRATION}).
				</p>
			) : error ? (
				<p className={`${styles.notice} ${styles.error}`} role="alert">
					No pudimos cargar las misiones. Intente de nuevo más tarde.
				</p>
			) : isLoading ? (
				<p role="status">Cargando misiones...</p>
			) : missions.length === 0 ? (
				<p className={styles.notice} role="status">
					Todavía no hay misiones. Si tiene un negocio, puede crearlas desde{" "}
					<Link to="/tienda">Mi negocio</Link> para que sus clientes desbloqueen
					productos específicos.
				</p>
			) : (
				<>
					<div
						className={missionStyles.filters}
						role="group"
						aria-label="Filtrar misiones"
					>
						{FILTERS.map((f) => (
							<button
								key={f.id}
								type="button"
								aria-pressed={filter === f.id}
								className={`${missionStyles.filter} ${
									filter === f.id ? missionStyles.filterActive : ""
								}`}
								onClick={() => setFilter(f.id)}
							>
								{f.label}
							</button>
						))}
					</div>

					{ordered.length === 0 && (
						<p className={styles.notice} role="status">
							No hay misiones en este filtro.
						</p>
					)}

					{ordered.map(({ store, name, list }) => {
						const profile = byWallet(store)
						const titleId = `missions-store-${store}`
						return (
							<section
								key={store}
								className={missionStyles.group}
								aria-labelledby={titleId}
							>
								<h3 id={titleId} className={missionStyles.groupTitle}>
									{profile ? (
										<Link to={`/tiendas/${profile.ref}`}>{name}</Link>
									) : (
										name
									)}
								</h3>
								<ul className={missionStyles.list}>
									{list.map(({ mission, progress: p }) => {
										const reward = rewardOf(mission)
										const pct = Math.round((p.current / p.target) * 100)
										return (
											<li
												key={mission.id}
												className={`${missionStyles.card} ${
													p.done ? missionStyles.cardDone : ""
												}`}
											>
												<h4>{mission.title}</h4>
												{mission.description && (
													<p className={missionStyles.desc}>
														{mission.description}
													</p>
												)}
												<p className={missionStyles.req}>
													{describeRequirement(mission)}
												</p>
												<div className={missionStyles.barRow}>
													<div
														className={styles.bar}
														role="progressbar"
														aria-label={`Avance de la misión ${mission.title}`}
														aria-valuemin={0}
														aria-valuemax={p.target}
														aria-valuenow={p.current}
														aria-valuetext={`${p.current} de ${p.target}`}
													>
														<div
															className={styles.barFill}
															style={{ width: `${pct}%` }}
														/>
													</div>
													<span className={missionStyles.count}>
														{p.current} de {p.target}
													</span>
												</div>
												<div className={missionStyles.reward}>
													{reward && (
														<div
															className={missionStyles.thumb}
															aria-hidden="true"
														>
															<ModelThumb model={reward} />
														</div>
													)}
													<div className={missionStyles.rewardInfo}>
														<span className={missionStyles.rewardName}>
															Premio: {reward?.name ?? mission.rewardProduct}
														</span>
														{reward && (
															<span className={missionStyles.price}>
																{formatXlm(reward.priceXlm)}
															</span>
														)}
														{p.done ? (
															<>
																<span className={missionStyles.badgeUnlocked}>
																	Desbloqueado
																</span>
																<Link
																	to="/comprar"
																	className={missionStyles.buy}
																>
																	Ir a comprarlo
																</Link>
															</>
														) : (
															<span className={missionStyles.badgeLocked}>
																Bloqueado hasta completar la misión
															</span>
														)}
													</div>
												</div>
											</li>
										)
									})}
								</ul>
							</section>
						)
					})}
				</>
			)}
		</section>
	)
}

const Tasks = () => {
	const { address } = useWallet()
	return (
		<div className={styles.page}>
			<h1>Misiones</h1>
			<p className={styles.lead}>
				Cumpla tareas para subir de nivel y misiones de los negocios para
				desbloquear sus productos. Todo se marca solo según lo que usted tiene y
				hace en la aplicación.
			</p>

			<h2>Tareas de la plataforma</h2>
			<WalletRequired>
				{(addr) => <PlatformTasks key={addr} address={addr} />}
			</WalletRequired>

			<BusinessMissions
				key={address ?? "anon"}
				address={address ?? undefined}
			/>
		</div>
	)
}

export default Tasks
