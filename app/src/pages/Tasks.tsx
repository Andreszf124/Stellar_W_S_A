import styles from "../closet/closet.module.css"
import { WalletRequired } from "../closet/components"
import { TASKS } from "../closet/tasks"
import { useCloset } from "../closet/useCloset"

const TasksView = ({ address }: { address: string }) => {
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
			<ul className={styles.tasks}>
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

const Tasks = () => (
	<div className={styles.page}>
		<h1>Tareas</h1>
		<p className={styles.lead}>
			Cumpla tareas para subir de nivel. Se marcan solas según lo que usted
			tiene y hace en la aplicación.
		</p>
		<WalletRequired>
			{(address) => <TasksView key={address} address={address} />}
		</WalletRequired>
	</div>
)

export default Tasks
