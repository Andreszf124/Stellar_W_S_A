export interface Task {
	id: string
	title: string
	description: string
	points: number
}

export const TASKS: Task[] = [
	{
		id: "first-claim",
		title: "Reclame su primer ítem",
		description: "Use el código que vino con su compra.",
		points: 50,
	},
	{
		id: "equip",
		title: "Vista a su avatar",
		description: "Equipe una prenda o un accesorio desde su clóset.",
		points: 30,
	},
	{
		id: "decorate",
		title: "Decore su hogar",
		description: "Reclame un mueble y véalo en su hogar digital.",
		points: 40,
	},
	{
		id: "collector",
		title: "Reúna 3 ítems",
		description: "Reclame tres ítems de cualquier tienda.",
		points: 60,
	},
]

export interface Progress {
	itemCount: number
	equippedCount: number
	furnitureCount: number
}

/** Tasks are checked against what the person really owns, not clicked. */
export function completedTaskIds({
	itemCount,
	equippedCount,
	furnitureCount,
}: Progress): string[] {
	const done: string[] = []
	if (itemCount >= 1) done.push("first-claim")
	if (equippedCount >= 1) done.push("equip")
	if (furnitureCount >= 1) done.push("decorate")
	if (itemCount >= 3) done.push("collector")
	return done
}

export const pointsFor = (done: string[]) =>
	TASKS.filter((t) => done.includes(t.id)).reduce((sum, t) => sum + t.points, 0)

const POINTS_PER_LEVEL = 50

export const levelOf = (points: number) =>
	Math.floor(points / POINTS_PER_LEVEL) + 1

/** 0 to 100: how far the person is to the next level. */
export const levelProgress = (points: number) =>
	Math.round(((points % POINTS_PER_LEVEL) / POINTS_PER_LEVEL) * 100)
