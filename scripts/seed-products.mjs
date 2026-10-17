// Seeds the deployed `closet` contract (Testnet) with 20 product types x 5 units.
// Each unit gets its own one-time claim code. Codes are secrets: they are only
// written to scripts/out/ (gitignored) and never printed in full.
//
// Env: PROJECT_ROOT, TEST_SECRET, CONTRACT_ID (the secret is never printed).
// Flags: --dry-run (print plan, no network), --max N (register at most N now).
// Resumable: progress lives in scripts/out/seed-progress.json.
import { createHash, randomInt } from "node:crypto"
import fs from "node:fs"
import path from "node:path"
import { pathToFileURL } from "node:url"

const UNITS_PER_TYPE = 5
const MAX_RETRIES = 3
const PASSPHRASE = "Test SDF Network ; September 2015"
const RPC_URL = "https://soroban-testnet.stellar.org"
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
const CODE_GROUPS = 3
const CODE_GROUP_LEN = 4

const PRODUCT_TYPES = [
	...[
		"Gorra clásica",
		"Gorro de lana",
		"Camiseta de estrella",
		"Sudadera con capucha",
		"Chaqueta de mezclilla",
		"Tenis deportivos",
		"Botas de cuero",
		"Pantalón de mezclilla",
	].map((name) => ({ name, category: "Clothing" })),
	...[
		"Lentes de sol",
		"Lentes redondos",
		"Audífonos",
		"Cadena con estrella",
		"Bufanda de lana",
	].map((name) => ({ name, category: "Accessory" })),
	...[
		"Lámpara de mesa",
		"Silla de madera",
		"Tapete tejido",
		"Mesa de centro",
		"Planta decorativa",
		"Cuadro de pared",
		"Reloj de pared",
	].map((name) => ({ name, category: "Furniture" })),
]

const args = process.argv.slice(2)
const dryRun = args.includes("--dry-run")
const maxIdx = args.indexOf("--max")
const maxThisRun = maxIdx >= 0 ? Number(args[maxIdx + 1]) : Infinity
if (maxIdx >= 0 && !(Number.isInteger(maxThisRun) && maxThisRun > 0)) {
	throw new Error("--max requires a positive integer")
}

// Plan in rounds: unit 1 of every type, then unit 2 of every type, ...
const plan = []
for (let round = 1; round <= UNITS_PER_TYPE; round++) {
	for (const t of PRODUCT_TYPES) plan.push({ ...t, round })
}

const ROOT = process.env.PROJECT_ROOT
const OUT_DIR = path.join(ROOT ?? process.cwd(), "scripts", "out")
const PROGRESS_FILE = path.join(OUT_DIR, "seed-progress.json")
const CSV_FILE = path.join(OUT_DIR, "unidades.csv")

const loadProgress = () =>
	fs.existsSync(PROGRESS_FILE)
		? JSON.parse(fs.readFileSync(PROGRESS_FILE, "utf8"))
		: { units: [] }
const saveProgress = (p) => {
	fs.mkdirSync(OUT_DIR, { recursive: true })
	fs.writeFileSync(PROGRESS_FILE, JSON.stringify(p, null, 2))
}
const writeCsv = (units) => {
	const esc = (v) => `"${String(v).replace(/"/g, '""')}"`
	const rows = units.map((u) =>
		[u.id, u.name, u.category, u.code].map(esc).join(","),
	)
	fs.writeFileSync(
		CSV_FILE,
		["id,producto,categoria,codigo", ...rows].join("\n") + "\n",
	)
}

const generateCode = () =>
	Array.from({ length: CODE_GROUPS }, () =>
		Array.from(
			{ length: CODE_GROUP_LEN },
			() => CODE_ALPHABET[randomInt(CODE_ALPHABET.length)],
		).join(""),
	).join("-")
const normalize = (c) => c.trim().toUpperCase().replace(/\s+/g, "")
const hashOf = (c) => createHash("sha256").update(normalize(c), "utf8").digest()
const mask = (c) => `${c.slice(0, 2)}**-****-****`

const progress = loadProgress()
const done = progress.units.length
const remaining = plan.slice(done)
const batch = remaining.slice(
	0,
	Number.isFinite(maxThisRun) ? maxThisRun : undefined,
)

console.log(
	`Plan: ${plan.length} units (${PRODUCT_TYPES.length} types x ${UNITS_PER_TYPE}). ` +
		`Done: ${done}. This run: ${batch.length}.`,
)

if (dryRun) {
	for (const [i, u] of batch.entries()) {
		console.log(`#${done + i + 1} ronda ${u.round} ${u.category} ${u.name}`)
	}
	console.log("Dry run: no network calls, nothing written.")
	process.exit(0)
}

const SECRET = process.env.TEST_SECRET
const CONTRACT_ID = process.env.CONTRACT_ID
const missing = ["PROJECT_ROOT", "TEST_SECRET", "CONTRACT_ID"].filter(
	(k) => !process.env[k],
)
if (missing.length) {
	throw new Error(`Missing env vars: ${missing.join(", ")}`)
}

const { Client, Keypair, contract } = await import(
	pathToFileURL(path.join(ROOT, "app-lib/clients/closet/dist/index.js")).href
)
const store = Keypair.fromSecret(SECRET)
const client = new Client({
	contractId: CONTRACT_ID,
	networkPassphrase: PASSPHRASE,
	rpcUrl: RPC_URL,
	publicKey: store.publicKey(),
	...contract.basicNodeSigner(store, PASSPHRASE),
})

const getCount = async () => Number((await client.item_count()).result)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

if (progress.baseCount === undefined) {
	progress.baseCount = await getCount()
	saveProgress(progress)
}
console.log(`item_count inicial (base de esta siembra): ${progress.baseCount}`)

let registered = 0
for (const [i, unit] of batch.entries()) {
	const code = generateCode()
	let id
	for (let attempt = 1; attempt <= MAX_RETRIES && id === undefined; attempt++) {
		const countBefore = await getCount()
		try {
			const tx = await client.register_item({
				store: store.publicKey(),
				name: unit.name,
				category: { tag: unit.category, values: undefined },
				claim_hash: hashOf(code),
			})
			const { result } = await tx.signAndSend()
			id = Number(result.unwrap())
		} catch (e) {
			const msg = String(e.message).split("\n")[0].slice(0, 160)
			console.log(`  intento ${attempt}/${MAX_RETRIES} fallo: ${msg}`)
			await sleep(2000 * attempt)
			// The tx may have landed even though the call errored: detect it.
			if ((await getCount()) === countBefore + 1) {
				const item = (
					await client.get_item({ id: countBefore + 1 })
				).result.unwrap()
				if (item.name === unit.name) id = countBefore + 1
			}
		}
	}
	if (id === undefined) {
		console.error(
			`No se pudo registrar "${unit.name}" tras ${MAX_RETRIES} intentos. Relanza para reanudar.`,
		)
		process.exit(1)
	}
	progress.units.push({ id, name: unit.name, category: unit.category, code })
	saveProgress(progress)
	registered++
	console.log(
		`[${done + i + 1}/${plan.length}] id=${id} ${unit.name} codigo=${mask(code)}`,
	)
}

if (progress.units.length === plan.length) {
	writeCsv(progress.units)
	console.log(`Completo. CSV: ${CSV_FILE}`)
} else {
	console.log(
		`Parcial: ${progress.units.length}/${plan.length}. Relanza para continuar.`,
	)
}
console.log(
	`Registradas en esta ejecucion: ${registered}. item_count actual: ${await getCount()}`,
)
