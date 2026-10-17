// SVG artwork for the avatar and the digital home, ported from the first
// prototype (Fase 1). Everything here is built from the fixed catalog in
// catalog.ts and colors are checked as hex, so the strings are safe to inject.
import { type Slot } from "./catalog"

export interface Wear {
	slot: Slot
	key: string
	color: string
}

export interface Furnishing {
	key: string
	color: string
}

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

function star(cx: number, cy: number, outer: number, inner: number) {
	const points: string[] = []
	for (let i = 0; i < 10; i++) {
		const angle = -Math.PI / 2 + (i * Math.PI) / 5
		const radius = i % 2 ? inner : outer
		points.push(
			`${(cx + radius * Math.cos(angle)).toFixed(1)},${(cy + radius * Math.sin(angle)).toFixed(1)}`,
		)
	}
	return points.join(" ")
}

/** Draws something twice, 32px apart (left and right shoe). */
const pair = (draw: (dx: number) => string) => draw(0) + draw(32)

const sleeves = (c: string, h: number) =>
	`<rect x="46" y="112" width="18" height="${h}" rx="9" fill="${c}"/><rect x="136" y="112" width="18" height="${h}" rx="9" fill="${c}"/>`
const torso = (c: string) =>
	`<rect x="62" y="106" width="76" height="86" rx="20" fill="${c}"/>`

const WEARABLES: Record<string, (c: string) => string> = {
	cap: (c) => `
		<path d="M65 62 C65 27 135 27 135 62 Z" fill="${c}"/>
		<path d="M100 58 H156 Q163 63 156 68 H66 Q63 63 66 58 Z" fill="${shade(c, -0.3)}"/>
		<circle cx="100" cy="31" r="3.5" fill="${shade(c, -0.3)}"/>
		<circle cx="100" cy="46" r="6" fill="none" stroke="#fff" stroke-width="2" opacity=".85"/>`,
	beanie: (c) => `
		<path d="M64 60 C62 16 138 16 136 60 Z" fill="${c}"/>
		<path d="M80 26 V56 M92 22 V56 M108 22 V56 M120 26 V56" stroke="${shade(c, -0.15)}" stroke-width="3"/>
		<rect x="61" y="51" width="78" height="14" rx="6" fill="${shade(c, -0.3)}"/>
		<circle cx="100" cy="19" r="8" fill="${shade(c, 0.35)}"/>`,
	shades: (c) => `
		<path d="M77 67 L66 63 M123 67 L134 63" stroke="${c}" stroke-width="2.5" stroke-linecap="round"/>
		<rect x="76" y="62" width="22" height="14" rx="5" fill="${c}"/>
		<rect x="102" y="62" width="22" height="14" rx="5" fill="${c}"/>
		<path d="M98 67 H102" stroke="${c}" stroke-width="3"/>
		<path d="M80 66 L86 66 M106 66 L112 66" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".5"/>`,
	round: (c) => `
		<path d="M79 69 L66 65 M121 69 L134 65" stroke="${c}" stroke-width="2.5" stroke-linecap="round"/>
		<circle cx="88" cy="70" r="10" fill="#e0f2fe" fill-opacity=".25" stroke="${c}" stroke-width="2.5"/>
		<circle cx="112" cy="70" r="10" fill="#e0f2fe" fill-opacity=".25" stroke="${c}" stroke-width="2.5"/>
		<path d="M98 69 Q100 66 102 69" stroke="${c}" stroke-width="2.5" fill="none"/>`,
	hoodie: (c) => `
		${sleeves(c, 70)}${torso(c)}
		<path d="M74 108 Q100 136 126 108" stroke="${shade(c, -0.3)}" stroke-width="7" fill="none" stroke-linecap="round"/>
		<path d="M93 122 V140 M107 122 V140" stroke="#f8fafc" stroke-width="2" stroke-linecap="round"/>
		<rect x="76" y="158" width="48" height="22" rx="9" fill="${shade(c, -0.2)}"/>`,
	jacket: (c) => `
		${sleeves(c, 70)}${torso(c)}
		<rect x="91" y="106" width="18" height="86" fill="#f1f5f9"/>
		<path d="M91 106 L80 130 L91 138 Z M109 106 L120 130 L109 138 Z" fill="${shade(c, -0.3)}"/>
		<rect x="70" y="146" width="16" height="12" rx="3" fill="${shade(c, -0.2)}"/>
		<rect x="114" y="146" width="16" height="12" rx="3" fill="${shade(c, -0.2)}"/>
		<path d="M62 180 H91 M109 180 H138" stroke="${shade(c, 0.25)}" stroke-width="2" stroke-dasharray="3 3"/>`,
	tee: (c) => `
		${sleeves(c, 28)}${torso(c)}
		<path d="M86 107 Q100 118 114 107" stroke="${shade(c, 0.25)}" stroke-width="3" fill="none"/>
		<polygon points="${star(100, 146, 15, 6.5)}" fill="#facc15"/>`,
	sneakers: (c) =>
		pair(
			(dx) => `
		<ellipse cx="${84 + dx}" cy="243" rx="16" ry="8" fill="#f8fafc"/>
		<rect x="${68 + dx}" y="246" width="32" height="5" rx="2.5" fill="${c}"/>
		<path d="M${73 + dx} 242 Q${84 + dx} 235 ${96 + dx} 241" stroke="${c}" stroke-width="3" fill="none" stroke-linecap="round"/>`,
		),
	boots: (c) =>
		pair(
			(dx) => `
		<rect x="${72 + dx}" y="220" width="24" height="26" rx="5" fill="${c}"/>
		<rect x="${68 + dx}" y="242" width="32" height="9" rx="4" fill="${shade(c, -0.4)}"/>
		<path d="M${76 + dx} 228 H${92 + dx}" stroke="${shade(c, 0.3)}" stroke-width="2"/>`,
		),
	headphones: (c) => `
		<path d="M63 70 C63 18 137 18 137 70" stroke="${c}" stroke-width="6" fill="none" stroke-linecap="round"/>
		<rect x="55" y="57" width="15" height="27" rx="6" fill="${shade(c, -0.35)}"/>
		<rect x="130" y="57" width="15" height="27" rx="6" fill="${shade(c, -0.35)}"/>`,
	chain: (c) => `
		<path d="M82 106 Q100 140 118 106" stroke="${c}" stroke-width="3" fill="none" stroke-dasharray="4 1.5"/>
		<polygon points="${star(100, 128, 7, 3)}" fill="${c}"/>`,
	pants: (c) =>
		pair(
			(dx) => `
		<rect x="${72 + dx}" y="184" width="24" height="58" rx="8" fill="${c}"/>
		<path d="M${84 + dx} 192 V238" stroke="${shade(c, 0.35)}" stroke-width="1.5" stroke-dasharray="3 2"/>`,
		),
	scarf: (c) => `
		<rect x="86" y="96" width="28" height="14" rx="7" fill="${c}"/>
		<path d="M86 102 H114" stroke="${shade(c, -0.3)}" stroke-width="2"/>
		<path d="M104 108 L116 108 L118 140 L106 140 Z" fill="${shade(c, -0.3)}"/>
		<path d="M107 130 H117" stroke="${shade(c, 0.35)}" stroke-width="2"/>`,
}

const FURNITURE: Record<string, (c: string) => string> = {
	rug: (c) => `
		<ellipse cx="200" cy="214" rx="130" ry="18" fill="${c}"/>
		<ellipse cx="200" cy="214" rx="100" ry="12" fill="none" stroke="#fff" stroke-width="3" opacity=".6"/>
		<ellipse cx="200" cy="214" rx="64" ry="7" fill="none" stroke="#fff" stroke-width="3" opacity=".4"/>`,
	lamp: (c) => `
		<ellipse cx="70" cy="196" rx="20" ry="6" fill="${shade(c, -0.4)}"/>
		<rect x="67" y="120" width="6" height="76" fill="${shade(c, -0.4)}"/>
		<path d="M45 124 L95 124 L84 84 L56 84 Z" fill="${c}"/>
		<ellipse cx="70" cy="126" rx="32" ry="10" fill="${c}" opacity=".18"/>`,
	chair: (c) => `
		<rect x="236" y="150" width="64" height="12" rx="3" fill="${c}"/>
		<rect x="238" y="104" width="10" height="50" rx="3" fill="${shade(c, -0.2)}"/>
		<rect x="238" y="104" width="62" height="12" rx="3" fill="${shade(c, -0.2)}"/>
		<rect x="240" y="162" width="8" height="38" fill="${shade(c, -0.35)}"/>
		<rect x="288" y="162" width="8" height="38" fill="${shade(c, -0.35)}"/>`,
	table: (c) => `
		<rect x="116" y="162" width="108" height="10" rx="3" fill="${c}"/>
		<rect x="122" y="172" width="8" height="28" fill="${shade(c, -0.35)}"/>
		<rect x="210" y="172" width="8" height="28" fill="${shade(c, -0.35)}"/>`,
	plant: (c) => `
		<path d="M350 170 C330 150 328 130 338 120 C350 130 354 150 350 170 Z" fill="${c}"/>
		<path d="M350 170 C360 145 372 135 380 134 C378 150 368 164 350 170 Z" fill="${shade(c, -0.25)}"/>
		<path d="M350 170 C346 150 348 135 352 124 C360 138 358 155 350 170 Z" fill="${shade(c, 0.2)}"/>
		<path d="M334 170 H366 L362 200 H338 Z" fill="#b45309"/>
		<rect x="332" y="168" width="36" height="6" rx="2" fill="#92400e"/>`,
	frame: (c) => `
		<rect x="300" y="40" width="60" height="44" rx="2" fill="${c}"/>
		<rect x="306" y="46" width="48" height="32" fill="#f8fafc"/>
		<circle cx="320" cy="56" r="5" fill="#facc15"/>
		<path d="M306 78 L322 62 L334 72 L342 64 L354 78 Z" fill="${shade(c, 0.2)}"/>`,
	clock: (c) => `
		<circle cx="105" cy="58" r="20" fill="${c}"/>
		<circle cx="105" cy="58" r="16" fill="#f8fafc"/>
		<path d="M105 46 V58 L113 63" stroke="#1f2937" stroke-width="2" fill="none" stroke-linecap="round"/>
		<circle cx="105" cy="58" r="2" fill="#1f2937"/>`,
}

/** Skin tone and hair color of the avatar, both as `#rrggbb`. */
export interface Look {
	skin: string
	hair: string
}

export const SKIN_TONES = [
	"#f5d0b5",
	"#e0ac69",
	"#c68642",
	"#8d5524",
	"#5c3a21",
]
export const HAIR_COLORS = [
	"#1f1611",
	"#3b2a20",
	"#a0522d",
	"#e6c27a",
	"#9ca3af",
]

export const DEFAULT_LOOK: Look = { skin: "#e0ac69", hair: "#3b2a20" }

const SHIRT = "#e5e7eb"
const PANTS = "#374151"
const INK = "#1f2937"

/** The avatar wearing the given items, as an SVG string. */
export function avatarSvg(wear: Wear[], look: Look = DEFAULT_LOOK) {
	// The colors are injected into the SVG, so they are checked as hex first.
	const SKIN = safe(look.skin)
	const HAIR = safe(look.hair)
	const bySlot = new Map<string, Wear>()
	wear.forEach((w) => bySlot.set(w.slot, w))
	const draw = (slot: string) => {
		const w = bySlot.get(slot)
		return w ? (WEARABLES[w.key]?.(safe(w.color)) ?? "") : ""
	}

	const parts: string[] = []
	parts.push(
		bySlot.has("legs")
			? draw("legs")
			: pair(
					(dx) =>
						`<rect x="${72 + dx}" y="184" width="24" height="58" rx="8" fill="${PANTS}"/>`,
				),
	)
	parts.push(
		bySlot.has("feet")
			? draw("feet")
			: pair(
					(dx) =>
						`<ellipse cx="${84 + dx}" cy="244" rx="15" ry="7" fill="${INK}"/>`,
				),
	)
	parts.push(
		`<rect x="92" y="96" width="16" height="16" rx="4" fill="${SKIN}"/>`,
	)
	parts.push(
		`<rect x="46" y="116" width="18" height="64" rx="9" fill="${SKIN}"/><rect x="136" y="116" width="18" height="64" rx="9" fill="${SKIN}"/>`,
	)
	parts.push(
		bySlot.has("top") ? draw("top") : sleeves(SHIRT, 26) + torso(SHIRT),
	)
	parts.push(
		`<circle cx="55" cy="185" r="9" fill="${SKIN}"/><circle cx="145" cy="185" r="9" fill="${SKIN}"/>`,
	)
	parts.push(draw("neck"))
	parts.push(
		`<circle cx="66" cy="72" r="6" fill="${SKIN}"/><circle cx="134" cy="72" r="6" fill="${SKIN}"/>`,
	)
	parts.push(`<circle cx="100" cy="68" r="34" fill="${SKIN}"/>`)
	parts.push(
		`<path d="M66 66 C62 28 138 28 134 66 C128 50 114 42 100 44 C86 42 72 50 66 66 Z" fill="${HAIR}"/>`,
	)
	parts.push(
		`<circle cx="88" cy="70" r="3.5" fill="${INK}"/><circle cx="112" cy="70" r="3.5" fill="${INK}"/>`,
	)
	parts.push(
		`<path d="M89 84 Q100 93 111 84" stroke="${INK}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`,
	)
	parts.push(
		`<circle cx="80" cy="81" r="4" fill="#f87171" opacity=".25"/><circle cx="120" cy="81" r="4" fill="#f87171" opacity=".25"/>`,
	)
	// Glasses first, so hats and headphones sit on top of the glasses arms.
	;["eyes", "hat", "ears"].forEach((slot) => parts.push(draw(slot)))

	return `<svg viewBox="0 0 200 262" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Su avatar">${parts.join("")}</svg>`
}

/** The digital home with the owned furniture, as an SVG string. */
export function roomSvg(items: Furnishing[]) {
	const furniture = ["frame", "clock", "rug", "table", "lamp", "chair", "plant"]
		.map((key) => {
			const item = items.find((i) => i.key === key)
			return item ? (FURNITURE[key]?.(safe(item.color)) ?? "") : ""
		})
		.join("")

	return `<svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Su hogar digital">
		<rect width="400" height="190" fill="#eef0ff"/>
		<rect y="190" width="400" height="50" fill="#d9c7a8"/>
		<rect x="150" y="36" width="100" height="84" rx="4" fill="#bfe3ff" stroke="#8a7360" stroke-width="5"/>
		<path d="M200 36 V120 M150 78 H250" stroke="#8a7360" stroke-width="4"/>
		${furniture}
	</svg>`
}
