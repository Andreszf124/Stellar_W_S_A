export type Slot =
	| "hat"
	| "eyes"
	| "ears"
	| "neck"
	| "top"
	| "legs"
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
	/** Reference price in US dollars. It lives in the app, not in the contract. */
	priceUsd: number
	/** One short sentence for the shop card. */
	desc: string
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
		priceUsd: 24,
		desc: "Gorra de algodón con visera curva y logo bordado.",
	},
	{
		key: "beanie",
		name: "Gorro de lana",
		category: "Clothing",
		slot: "hat",
		color: "#14b8a6",
		priceUsd: 19,
		desc: "Gorro suave de lana con pompón.",
	},
	{
		key: "shades",
		name: "Lentes de sol",
		category: "Accessory",
		slot: "eyes",
		color: "#0b1020",
		priceUsd: 45,
		desc: "Lentes polarizados con montura mate.",
	},
	{
		key: "round",
		name: "Lentes redondos",
		category: "Accessory",
		slot: "eyes",
		color: "#f59e0b",
		priceUsd: 59,
		desc: "Montura ligera de titanio con cristales claros.",
	},
	{
		key: "tee",
		name: "Camiseta de estrella",
		category: "Clothing",
		slot: "top",
		color: "#1e293b",
		priceUsd: 29,
		desc: "Camiseta diaria de cuello redondo con una estrella dorada.",
	},
	{
		key: "hoodie",
		name: "Sudadera con capucha",
		category: "Clothing",
		slot: "top",
		color: "#7c3aed",
		priceUsd: 68,
		desc: "Sudadera gruesa de algodón orgánico con bolsillo canguro.",
	},
	{
		key: "jacket",
		name: "Chaqueta de mezclilla",
		category: "Clothing",
		slot: "top",
		color: "#2563eb",
		priceUsd: 89,
		desc: "Chaqueta clásica de mezclilla lavada a la piedra.",
	},
	{
		key: "sneakers",
		name: "Tenis deportivos",
		category: "Clothing",
		slot: "feet",
		color: "#ec4899",
		priceUsd: 110,
		desc: "Tenis acolchados para correr, con materiales reciclados.",
	},
	{
		key: "boots",
		name: "Botas de cuero",
		category: "Clothing",
		slot: "feet",
		color: "#92400e",
		priceUsd: 125,
		desc: "Botas de cuero resistentes al agua con suela antideslizante.",
	},
	{
		key: "headphones",
		name: "Audífonos",
		category: "Accessory",
		slot: "ears",
		color: "#06b6d4",
		priceUsd: 149,
		desc: "Audífonos inalámbricos con cancelación de ruido.",
	},
	{
		key: "chain",
		name: "Cadena con estrella",
		category: "Accessory",
		slot: "neck",
		color: "#facc15",
		priceUsd: 79,
		desc: "Cadena bañada en oro con un dije de estrella.",
	},
	{
		key: "lamp",
		name: "Lámpara de mesa",
		category: "Furniture",
		slot: "furniture",
		color: "#f59e0b",
		priceUsd: 35,
		desc: "Lámpara de mesa de luz cálida para cualquier rincón.",
	},
	{
		key: "chair",
		name: "Silla de madera",
		category: "Furniture",
		slot: "furniture",
		color: "#92400e",
		priceUsd: 72,
		desc: "Silla de madera maciza con acabado natural.",
	},
	{
		key: "rug",
		name: "Tapete tejido",
		category: "Furniture",
		slot: "furniture",
		color: "#14b8a6",
		priceUsd: 54,
		desc: "Tapete tejido a mano que da calor a la sala.",
	},
	{
		key: "pants",
		name: "Pantalón de mezclilla",
		category: "Clothing",
		slot: "legs",
		color: "#2563eb",
		priceUsd: 62,
		desc: "Pantalón de mezclilla de corte recto y uso diario.",
	},
	{
		key: "scarf",
		name: "Bufanda de lana",
		category: "Accessory",
		slot: "neck",
		color: "#dc2626",
		priceUsd: 26,
		desc: "Bufanda larga de lana para los días fríos.",
	},
	{
		key: "table",
		name: "Mesa de centro",
		category: "Furniture",
		slot: "furniture",
		color: "#a16207",
		priceUsd: 96,
		desc: "Mesa de centro de madera para la sala.",
	},
	{
		key: "plant",
		name: "Planta decorativa",
		category: "Furniture",
		slot: "furniture",
		color: "#16a34a",
		priceUsd: 22,
		desc: "Planta decorativa en maceta que no necesita riego.",
	},
	{
		key: "frame",
		name: "Cuadro de pared",
		category: "Furniture",
		slot: "furniture",
		color: "#7c3aed",
		priceUsd: 41,
		desc: "Cuadro con marco para decorar la pared.",
	},
	{
		key: "clock",
		name: "Reloj de pared",
		category: "Furniture",
		slot: "furniture",
		color: "#0f766e",
		priceUsd: 38,
		desc: "Reloj de pared de estilo sencillo y silencioso.",
	},
]

export const findModel = (name: string) => MODELS.find((m) => m.name === name)

export const CATEGORY_LABEL: Record<CategoryTag, string> = {
	Clothing: "Ropa",
	Accessory: "Accesorio",
	Furniture: "Mueble",
}

/** Where each slot sits on the avatar, in the order the closet lists them. */
export const SLOT_LABEL: Record<Slot, string> = {
	hat: "Cabeza",
	eyes: "Ojos",
	ears: "Orejas",
	neck: "Cuello",
	top: "Cuerpo",
	legs: "Piernas",
	feet: "Pies",
	furniture: "Hogar",
}

export const SLOT_ORDER = Object.keys(SLOT_LABEL) as Slot[]
