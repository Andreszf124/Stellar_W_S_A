export type Slot =
	| "hat"
	| "eyes"
	| "ears"
	| "neck"
	| "top"
	| "feet"
	| "furniture"

export type CategoryTag = "Clothing" | "Accessory" | "Furniture"

export interface Model {
	/** Drawing key used by the avatar and room artwork. */
	key: string
	/** Exact name saved on-chain for the item. */
	name: string
	category: CategoryTag
	slot: Slot
	color: string
}

/**
 * The contract stores only an item's name and category, so the artwork is
 * found by matching the on-chain name against this fixed list. Stores pick a
 * model from it when they register a unit.
 */
export const MODELS: Model[] = [
	{
		key: "cap",
		name: "Gorra clásica",
		category: "Clothing",
		slot: "hat",
		color: "#ef4444",
	},
	{
		key: "beanie",
		name: "Gorro de lana",
		category: "Clothing",
		slot: "hat",
		color: "#14b8a6",
	},
	{
		key: "shades",
		name: "Lentes de sol",
		category: "Accessory",
		slot: "eyes",
		color: "#0b1020",
	},
	{
		key: "round",
		name: "Lentes redondos",
		category: "Accessory",
		slot: "eyes",
		color: "#f59e0b",
	},
	{
		key: "tee",
		name: "Camiseta de estrella",
		category: "Clothing",
		slot: "top",
		color: "#1e293b",
	},
	{
		key: "hoodie",
		name: "Sudadera con capucha",
		category: "Clothing",
		slot: "top",
		color: "#7c3aed",
	},
	{
		key: "jacket",
		name: "Chaqueta de mezclilla",
		category: "Clothing",
		slot: "top",
		color: "#2563eb",
	},
	{
		key: "sneakers",
		name: "Tenis deportivos",
		category: "Clothing",
		slot: "feet",
		color: "#ec4899",
	},
	{
		key: "boots",
		name: "Botas de cuero",
		category: "Clothing",
		slot: "feet",
		color: "#92400e",
	},
	{
		key: "headphones",
		name: "Audífonos",
		category: "Accessory",
		slot: "ears",
		color: "#06b6d4",
	},
	{
		key: "chain",
		name: "Cadena con estrella",
		category: "Accessory",
		slot: "neck",
		color: "#facc15",
	},
	{
		key: "lamp",
		name: "Lámpara de mesa",
		category: "Furniture",
		slot: "furniture",
		color: "#f59e0b",
	},
	{
		key: "chair",
		name: "Silla de madera",
		category: "Furniture",
		slot: "furniture",
		color: "#92400e",
	},
	{
		key: "rug",
		name: "Tapete tejido",
		category: "Furniture",
		slot: "furniture",
		color: "#14b8a6",
	},
]

export const findModel = (name: string) => MODELS.find((m) => m.name === name)

export const CATEGORY_LABEL: Record<CategoryTag, string> = {
	Clothing: "Ropa",
	Accessory: "Accesorio",
	Furniture: "Mueble",
}
