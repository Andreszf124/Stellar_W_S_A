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
	/** Price in XLM, the reference currency. It lives in the app, not in the contract. */
	priceXlm: number
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
		priceXlm: 60,
		desc: "Gorra de algodón con visera curva y logo bordado.",
	},
	{
		key: "beanie",
		name: "Gorro de lana",
		category: "Clothing",
		slot: "hat",
		color: "#14b8a6",
		priceXlm: 50,
		desc: "Gorro suave de lana con pompón.",
	},
	{
		key: "shades",
		name: "Lentes de sol",
		category: "Accessory",
		slot: "eyes",
		color: "#0b1020",
		priceXlm: 110,
		desc: "Lentes polarizados con montura mate.",
	},
	{
		key: "round",
		name: "Lentes redondos",
		category: "Accessory",
		slot: "eyes",
		color: "#f59e0b",
		priceXlm: 150,
		desc: "Montura ligera de titanio con cristales claros.",
	},
	{
		key: "tee",
		name: "Camiseta de estrella",
		category: "Clothing",
		slot: "top",
		color: "#1e293b",
		priceXlm: 70,
		desc: "Camiseta diaria de cuello redondo con una estrella dorada.",
	},
	{
		key: "hoodie",
		name: "Sudadera con capucha",
		category: "Clothing",
		slot: "top",
		color: "#7c3aed",
		priceXlm: 170,
		desc: "Sudadera gruesa de algodón orgánico con bolsillo canguro.",
	},
	{
		key: "jacket",
		name: "Chaqueta de mezclilla",
		category: "Clothing",
		slot: "top",
		color: "#2563eb",
		priceXlm: 220,
		desc: "Chaqueta clásica de mezclilla lavada a la piedra.",
	},
	{
		key: "sneakers",
		name: "Tenis deportivos",
		category: "Clothing",
		slot: "feet",
		color: "#ec4899",
		priceXlm: 275,
		desc: "Tenis acolchados para correr, con materiales reciclados.",
	},
	{
		key: "boots",
		name: "Botas de cuero",
		category: "Clothing",
		slot: "feet",
		color: "#92400e",
		priceXlm: 310,
		desc: "Botas de cuero resistentes al agua con suela antideslizante.",
	},
	{
		key: "headphones",
		name: "Audífonos",
		category: "Accessory",
		slot: "ears",
		color: "#06b6d4",
		priceXlm: 370,
		desc: "Audífonos inalámbricos con cancelación de ruido.",
	},
	{
		key: "chain",
		name: "Cadena con estrella",
		category: "Accessory",
		slot: "neck",
		color: "#facc15",
		priceXlm: 200,
		desc: "Cadena bañada en oro con un dije de estrella.",
	},
	{
		key: "lamp",
		name: "Lámpara de mesa",
		category: "Furniture",
		slot: "furniture",
		color: "#f59e0b",
		priceXlm: 90,
		desc: "Lámpara de mesa de luz cálida para cualquier rincón.",
	},
	{
		key: "chair",
		name: "Silla de madera",
		category: "Furniture",
		slot: "furniture",
		color: "#92400e",
		priceXlm: 180,
		desc: "Silla de madera maciza con acabado natural.",
	},
	{
		key: "rug",
		name: "Tapete tejido",
		category: "Furniture",
		slot: "furniture",
		color: "#14b8a6",
		priceXlm: 135,
		desc: "Tapete tejido a mano que da calor a la sala.",
	},
	{
		key: "pants",
		name: "Pantalón de mezclilla",
		category: "Clothing",
		slot: "legs",
		color: "#2563eb",
		priceXlm: 155,
		desc: "Pantalón de mezclilla de corte recto y uso diario.",
	},
	{
		key: "scarf",
		name: "Bufanda de lana",
		category: "Accessory",
		slot: "neck",
		color: "#dc2626",
		priceXlm: 65,
		desc: "Bufanda larga de lana para los días fríos.",
	},
	{
		key: "table",
		name: "Mesa de centro",
		category: "Furniture",
		slot: "furniture",
		color: "#a16207",
		priceXlm: 240,
		desc: "Mesa de centro de madera para la sala.",
	},
	{
		key: "plant",
		name: "Planta decorativa",
		category: "Furniture",
		slot: "furniture",
		color: "#16a34a",
		priceXlm: 55,
		desc: "Planta decorativa en maceta que no necesita riego.",
	},
	{
		key: "frame",
		name: "Cuadro de pared",
		category: "Furniture",
		slot: "furniture",
		color: "#7c3aed",
		priceXlm: 100,
		desc: "Cuadro con marco para decorar la pared.",
	},
	{
		key: "clock",
		name: "Reloj de pared",
		category: "Furniture",
		slot: "furniture",
		color: "#0f766e",
		priceXlm: 95,
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

/**
 * A product a business sells. The built-in `MODELS` have no `store` and any
 * business can register units of them. A custom product is made by one
 * business (`store` = its address) from a base design: it keeps the base
 * `key`, `slot` and `category` and sets its own name, color, price and text.
 */
export interface Product extends Model {
	store?: string
}

/**
 * Finds the product an on-chain item name refers to. A custom product of the
 * same store wins, then any custom product with that name, then the built-in
 * models.
 */
export function lookupProduct(
	products: Product[],
	name: string,
	store?: string,
): Product | undefined {
	return (
		products.find((p) => p.store && p.name === name && p.store === store) ??
		products.find((p) => p.store && p.name === name) ??
		products.find((p) => !p.store && p.name === name)
	)
}
