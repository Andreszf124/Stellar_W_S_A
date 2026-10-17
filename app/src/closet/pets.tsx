import { useCallback, useEffect, useState, type ReactNode } from "react"

export type PetKey = "perro" | "gato" | "conejo" | "zorro" | "panda" | "pajaro"

export interface Pet {
	key: PetKey
	name: string
	species: string
	description: string
	/** Price in XLM (Testnet), paid to the platform account. */
	priceXlm: number
	color: string
}

export const PETS: Pet[] = [
	{
		key: "perro",
		name: "Canelo",
		species: "Perro",
		description: "Leal y juguetón, siempre lo espera con la cola en alto.",
		priceXlm: 60,
		color: "#c98b4f",
	},
	{
		key: "gato",
		name: "Mishi",
		species: "Gato",
		description: "Tranquilo y curioso, le gusta dormir al sol.",
		priceXlm: 70,
		color: "#8f9aa8",
	},
	{
		key: "conejo",
		name: "Nube",
		species: "Conejo",
		description: "Suave y ágil, salta de alegría con cada tarea.",
		priceXlm: 50,
		color: "#e9d7c4",
	},
	{
		key: "zorro",
		name: "Chispa",
		species: "Zorro",
		description: "Astuto y veloz, siempre encuentra el mejor camino.",
		priceXlm: 110,
		color: "#d9672b",
	},
	{
		key: "panda",
		name: "Bambú",
		species: "Panda",
		description: "Paciente y cariñoso, disfruta cada momento con calma.",
		priceXlm: 150,
		color: "#f4f1ec",
	},
	{
		key: "pajaro",
		name: "Piquito",
		species: "Pájaro",
		description: "Alegre y cantarín, anuncia sus buenas noticias.",
		priceXlm: 40,
		color: "#3f9bb8",
	},
]

const HEX = /^#[0-9a-fA-F]{6}$/
const safe = (color: string) => (HEX.test(color) ? color : "#888888")

function shade(hex: string, pct: number) {
	const n = parseInt(hex.slice(1), 16)
	const channels = [n >> 16, (n >> 8) & 255, n & 255].map((v) =>
		Math.max(
			0,
			Math.min(255, Math.round(pct < 0 ? v * (1 + pct) : v + (255 - v) * pct)),
		),
	)
	return "#" + channels.map((v) => v.toString(16).padStart(2, "0")).join("")
}

const INK = "#3b2a22"
const PINK = "#f0b4b4"

const Eyes = ({ y = 52, gap = 12 }: { y?: number; gap?: number }) => (
	<>
		<circle cx={50 - gap} cy={y} r="3.2" fill={INK} />
		<circle cx={50 + gap} cy={y} r="3.2" fill={INK} />
		<circle cx={50 - gap + 1} cy={y - 1} r="1" fill="#fff" />
		<circle cx={50 + gap + 1} cy={y - 1} r="1" fill="#fff" />
	</>
)

const Smile = ({ y }: { y: number }) => (
	<path
		d={`M50 ${y} q-4 5 -8 2 M50 ${y} q4 5 8 2`}
		stroke={INK}
		strokeWidth="1.8"
		strokeLinecap="round"
		fill="none"
	/>
)

const drawings: Record<PetKey, (c: string) => ReactNode> = {
	perro: (c) => (
		<>
			<ellipse cx="50" cy="88" rx="24" ry="8" fill={shade(c, -0.1)} />
			<ellipse cx="22" cy="52" rx="11" ry="20" fill={shade(c, -0.3)} />
			<ellipse cx="78" cy="52" rx="11" ry="20" fill={shade(c, -0.3)} />
			<circle cx="50" cy="52" r="29" fill={c} />
			<ellipse cx="50" cy="63" rx="15" ry="11" fill={shade(c, 0.6)} />
			<Eyes y={49} gap={13} />
			<ellipse cx="50" cy="58" rx="4.5" ry="3.2" fill={INK} />
			<Smile y={61} />
			<ellipse cx="50" cy="73" rx="5" ry="3.5" fill="#e58a8a" />
		</>
	),
	gato: (c) => (
		<>
			<ellipse cx="50" cy="90" rx="24" ry="7" fill={shade(c, -0.1)} />
			<path d="M20 44 L24 14 L44 28 Z" fill={c} />
			<path d="M80 44 L76 14 L56 28 Z" fill={c} />
			<path d="M26 36 L28 22 L38 29 Z" fill={PINK} />
			<path d="M74 36 L72 22 L62 29 Z" fill={PINK} />
			<ellipse cx="50" cy="56" rx="31" ry="28" fill={c} />
			<path
				d="M50 30 v8 M42 31 l2 7 M58 31 l-2 7"
				stroke={shade(c, -0.35)}
				strokeWidth="2.5"
				strokeLinecap="round"
			/>
			<ellipse cx="38" cy="52" rx="4.4" ry="5" fill="#f2d98a" />
			<ellipse cx="62" cy="52" rx="4.4" ry="5" fill="#f2d98a" />
			<ellipse cx="38" cy="52" rx="1.6" ry="4.2" fill={INK} />
			<ellipse cx="62" cy="52" rx="1.6" ry="4.2" fill={INK} />
			<path d="M46 62 h8 l-4 4 Z" fill="#e58a8a" />
			<Smile y={66} />
			<path
				d="M16 60 h14 M16 67 l13 -3 M84 60 h-14 M84 67 l-13 -3"
				stroke={shade(c, 0.5)}
				strokeWidth="1.5"
				strokeLinecap="round"
			/>
		</>
	),
	conejo: (c) => (
		<>
			<ellipse cx="50" cy="90" rx="24" ry="7" fill={shade(c, -0.12)} />
			<ellipse cx="36" cy="26" rx="9" ry="22" fill={c} />
			<ellipse cx="64" cy="26" rx="9" ry="22" fill={c} />
			<ellipse cx="36" cy="28" rx="4.5" ry="15" fill={PINK} />
			<ellipse cx="64" cy="28" rx="4.5" ry="15" fill={PINK} />
			<circle cx="50" cy="62" r="28" fill={c} />
			<circle cx="33" cy="68" r="5" fill={PINK} opacity="0.7" />
			<circle cx="67" cy="68" r="5" fill={PINK} opacity="0.7" />
			<Eyes y={59} gap={12} />
			<path d="M46 65 h8 l-4 4 Z" fill="#e58a8a" />
			<Smile y={69} />
			<rect x="46.5" y="72" width="3" height="5" rx="1" fill="#fff" />
			<rect x="50.5" y="72" width="3" height="5" rx="1" fill="#fff" />
		</>
	),
	zorro: (c) => (
		<>
			<ellipse cx="50" cy="90" rx="24" ry="7" fill={shade(c, -0.25)} />
			<path d="M16 46 L22 12 L46 30 Z" fill={c} />
			<path d="M84 46 L78 12 L54 30 Z" fill={c} />
			<path d="M24 34 L25 21 L37 29 Z" fill={INK} />
			<path d="M76 34 L75 21 L63 29 Z" fill={INK} />
			<path
				d="M50 86 C24 84 12 62 14 44 C28 46 40 38 50 40 C60 38 72 46 86 44 C88 62 76 84 50 86 Z"
				fill={c}
			/>
			<path
				d="M50 86 C36 84 28 72 30 62 C40 66 46 60 50 62 C54 60 60 66 70 62 C72 72 64 84 50 86 Z"
				fill="#fff7ee"
			/>
			<ellipse cx="36" cy="54" rx="3.2" ry="3.6" fill={INK} />
			<ellipse cx="64" cy="54" rx="3.2" ry="3.6" fill={INK} />
			<circle cx="37" cy="53" r="1" fill="#fff" />
			<circle cx="65" cy="53" r="1" fill="#fff" />
			<ellipse cx="50" cy="72" rx="4.2" ry="3.2" fill={INK} />
			<Smile y={75} />
		</>
	),
	panda: (c) => (
		<>
			<ellipse cx="50" cy="90" rx="24" ry="7" fill={shade(c, -0.15)} />
			<circle cx="24" cy="26" r="11" fill={INK} />
			<circle cx="76" cy="26" r="11" fill={INK} />
			<circle cx="50" cy="55" r="31" fill={c} />
			<ellipse
				cx="36"
				cy="52"
				rx="8"
				ry="11"
				fill={INK}
				transform="rotate(20 36 52)"
			/>
			<ellipse
				cx="64"
				cy="52"
				rx="8"
				ry="11"
				fill={INK}
				transform="rotate(-20 64 52)"
			/>
			<circle cx="37" cy="52" r="3" fill="#fff" />
			<circle cx="63" cy="52" r="3" fill="#fff" />
			<circle cx="37.6" cy="52.4" r="1.4" fill={INK} />
			<circle cx="62.4" cy="52.4" r="1.4" fill={INK} />
			<ellipse cx="50" cy="63" rx="9" ry="7" fill={shade(c, -0.08)} />
			<ellipse cx="50" cy="61" rx="4.4" ry="3" fill={INK} />
			<Smile y={64} />
		</>
	),
	pajaro: (c) => (
		<>
			<path d="M42 20 q4 -12 12 -8 q-6 2 -6 10 Z" fill={shade(c, -0.25)} />
			<ellipse cx="50" cy="56" rx="32" ry="30" fill={c} />
			<ellipse cx="50" cy="66" rx="20" ry="18" fill={shade(c, 0.6)} />
			<path
				d="M20 54 C6 56 6 76 24 74 C26 66 24 60 20 54 Z"
				fill={shade(c, -0.2)}
			/>
			<path
				d="M80 54 C94 56 94 76 76 74 C74 66 76 60 80 54 Z"
				fill={shade(c, -0.2)}
			/>
			<path d="M43 55 L57 55 L50 66 Z" fill="#f2a93b" />
			<Eyes y={46} gap={13} />
			<path
				d="M42 86 v-4 M58 86 v-4 M36 88 h12 M52 88 h12"
				stroke="#f2a93b"
				strokeWidth="2.5"
				strokeLinecap="round"
			/>
		</>
	),
}

export const PetSvg = ({
	petKey,
	size = 160,
}: {
	petKey: PetKey
	size?: number
}) => {
	const pet = PETS.find((p) => p.key === petKey)
	if (!pet) return null
	return (
		<svg
			viewBox="0 0 100 100"
			width={size}
			height={size}
			role="img"
			aria-label={`Dibujo de ${pet.name}, ${pet.species.toLowerCase()}`}
		>
			{drawings[pet.key](safe(pet.color))}
		</svg>
	)
}

const STORAGE_KEY = "closet:pet"

const readPet = (): PetKey | null => {
	try {
		const value = localStorage.getItem(STORAGE_KEY)
		return PETS.find((p) => p.key === value)?.key ?? null
	} catch {
		return null
	}
}

export const usePet = () => {
	const [petKey, setPetKey] = useState<PetKey | null>(readPet)
	const setPet = useCallback((key: PetKey) => {
		setPetKey(key)
		try {
			localStorage.setItem(STORAGE_KEY, key)
		} catch {
			// private mode: the choice lasts only for this visit
		}
	}, [])
	return { petKey, setPet }
}

const ownedKey = (address: string) => `closet:pets:${address}`

/** Reads the saved list and keeps only known pet keys, without repeats. */
const readOwned = (address?: string): PetKey[] => {
	if (!address) return []
	try {
		const parsed: unknown = JSON.parse(
			localStorage.getItem(ownedKey(address)) ?? "[]",
		)
		if (!Array.isArray(parsed)) return []
		return PETS.map((p) => p.key).filter((key) => parsed.includes(key))
	} catch {
		return []
	}
}

/** Pets bought by this wallet, kept in this browser (localStorage). */
export const useOwnedPets = (address?: string) => {
	const [state, setState] = useState(() => ({
		address,
		owned: readOwned(address),
	}))

	// Re-read the list when the connected wallet changes.
	useEffect(() => {
		setState((prev) =>
			prev.address === address ? prev : { address, owned: readOwned(address) },
		)
	}, [address])

	const owned = state.address === address ? state.owned : readOwned(address)

	const add = useCallback(
		(key: PetKey) => {
			if (!address) return
			const next = readOwned(address)
			if (!next.includes(key)) next.push(key)
			setState({ address, owned: next })
			try {
				localStorage.setItem(ownedKey(address), JSON.stringify(next))
			} catch {
				// private mode: the purchase lasts only for this visit
			}
		},
		[address],
	)

	const isOwned = useCallback((key: PetKey) => owned.includes(key), [owned])

	return { owned, add, isOwned }
}
