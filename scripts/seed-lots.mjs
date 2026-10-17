// Carga 3 lotes de ejemplo de cafe costarricense en el contrato desplegado.
//
// Por que Node (.mjs) y no PowerShell: el proyecto ya exige Node, el script
// corre igual en Git Bash, PowerShell y CI, y spawnSync con arreglo de
// argumentos evita problemas de comillas con tildes y espacios en Windows.
//
// Uso:
//   GRANO_CONTRACT_ID=<CONTRACT_ID_TESTNET> GRANO_SOURCE=<identidad> \
//     node scripts/seed-lots.mjs [--dry-run]
//   node scripts/seed-lots.mjs --contract-id <ID> --source <identidad> [--network testnet]
//
// Variables: GRANO_CONTRACT_ID, GRANO_SOURCE (nombre de identidad del Stellar
// CLI, nunca una clave secreta), GRANO_NETWORK (por defecto "testnet").
// El dueno de cada lote es la direccion publica de esa identidad.
//
// Supuesto: register_lot recibe --owner, --farm, --harvest y --process.
// Confirmalo con: stellar contract invoke --id <ID> --source-account <identidad> \
//   --network testnet -- register_lot --help

import { spawnSync } from "node:child_process"

const LOTS = [
	{
		farm: "Finca La Esperanza, Tarrazú",
		harvest: "Cosecha 2025/2026",
		process: "Lavado",
	},
	{
		farm: "Finca El Mirador, Naranjo",
		harvest: "Cosecha 2025/2026",
		process: "Honey",
	},
	{
		farm: "Finca Los Cedros, Tres Ríos",
		harvest: "Cosecha 2024/2025",
		process: "Natural",
	},
]

function parseArgs(argv) {
	const out = { dryRun: false }
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i]
		if (a === "--dry-run") out.dryRun = true
		else if (a === "--contract-id") out.contractId = argv[++i]
		else if (a === "--source") out.source = argv[++i]
		else if (a === "--network") out.network = argv[++i]
		else fail(`Argumento desconocido: ${a}`)
	}
	return out
}

function fail(msg) {
	console.error(`Error: ${msg}`)
	process.exit(1)
}

const args = parseArgs(process.argv.slice(2))
const contractId = args.contractId ?? process.env.GRANO_CONTRACT_ID
const source = args.source ?? process.env.GRANO_SOURCE
const network = args.network ?? process.env.GRANO_NETWORK ?? "testnet"

const missing = []
if (!contractId) missing.push("GRANO_CONTRACT_ID (o --contract-id)")
if (!source) missing.push("GRANO_SOURCE (o --source), nombre de identidad del Stellar CLI")
if (missing.length > 0) {
	fail(
		`Faltan datos requeridos:\n  - ${missing.join("\n  - ")}\n` +
			"Ejemplo: GRANO_CONTRACT_ID=<CONTRACT_ID_TESTNET> GRANO_SOURCE=<identidad> node scripts/seed-lots.mjs",
	)
}
if (!/^C[A-Z2-7]{55}$/.test(contractId)) {
	fail(
		`El ID de contrato no tiene formato valido (C + 55 caracteres): "${contractId}". ` +
			"No uses el marcador <CONTRACT_ID_TESTNET>, usa el ID real del despliegue.",
	)
}

function stellar(cliArgs) {
	const r = spawnSync("stellar", cliArgs, { encoding: "utf8" })
	if (r.error) {
		fail(
			`No se pudo ejecutar "stellar" (${r.error.message}). Instala el Stellar CLI y verifica el PATH.`,
		)
	}
	return r
}

let owner
if (args.dryRun) {
	owner = "<DIRECCION_PUBLICA_DE_LA_IDENTIDAD>"
} else {
	const r = stellar(["keys", "address", source])
	if (r.status !== 0) {
		fail(`No se encontro la identidad "${source}": ${r.stderr.trim()}`)
	}
	owner = r.stdout.trim()
}

console.log(
	`Contrato ${contractId} en ${network}, firmante ${source}${args.dryRun ? " (dry-run)" : ""}`,
)

let failures = 0
for (const [i, lot] of LOTS.entries()) {
	const cliArgs = [
		"contract", "invoke",
		"--id", contractId,
		"--source-account", source,
		"--network", network,
		"--",
		"register_lot",
		"--owner", owner,
		"--farm", lot.farm,
		"--harvest", lot.harvest,
		"--process", lot.process,
	]
	console.log(`\n[${i + 1}/${LOTS.length}] ${lot.farm} | ${lot.harvest} | ${lot.process}`)
	if (args.dryRun) {
		console.log(`  stellar ${cliArgs.map((a) => JSON.stringify(a)).join(" ")}`)
		continue
	}
	const r = stellar(cliArgs)
	if (r.status === 0) {
		console.log(`  OK, id de lote: ${r.stdout.trim()}`)
	} else {
		failures++
		console.error(`  FALLO: ${r.stderr.trim()}`)
	}
}

if (failures > 0) fail(`${failures} lote(s) no se pudieron registrar.`)
console.log("\nListo. Verifica con: lot_count y get_lot en el explorador o el CLI.")
