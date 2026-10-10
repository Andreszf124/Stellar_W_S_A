# Scaffold Stellar × Trustless Work × Cavos

**De idea a dApp en Stellar, a punta de prompts.** 🤖✨

Este starter junta tres piezas que ya vienen conectadas entre sí, más instrucciones para que tu agente de código sepa usarlas:

- 🏗️ **[Scaffold Stellar](https://developers.stellar.org/docs/tools/scaffold-stellar)**: contratos Soroban (Rust) + app React. Cada vez que guardás un contrato, se compila, se despliega en testnet y te genera un cliente TypeScript tipado.
- 🏦 **[Trustless Work](https://docs.trustlesswork.com)**: escrows (fideicomisos) listos para usar, para cuando la plata tiene que esperar una condición. La plata (USDC) queda guardada en un contrato y solo se libera cuando se aprueban los hitos.
- 🔐 **[Cavos](https://docs.cavos.xyz)**: wallets embebidas. Tus usuarios entran con su **correo o Google** y ya tienen una cuenta Stellar, sin instalar extensiones ni anotar frases semilla. La llave es del usuario y vive en un espacio aislado: ni tu página ni los servidores de Cavos pueden leerla.
- 🧠 **Skills para agentes**: instrucciones verificadas en `AGENTS.md` y `.agents/skills/` para que cualquier agente (Claude Code, Codex, Cursor, OpenCode, Copilot, Gemini, Pi…) construya sobre estas piezas sin inventarse APIs.

**No toda app necesita las tres piezas.** Una app de votaciones, por ejemplo, es solo un contrato Soroban con login por correo: no tiene escrows. Tu agente elige las piezas según tu idea.

Todo corre en **testnet**: es plata de prueba, no hay nada que perder.

## Cómo encaja todo

```
                     Tu usuario
                         │
           ┌─────────────┴─────────────┐
           ▼                           ▼
       "Sign in"                 "Use a wallet"
    correo o Google            Freighter, xBull…
        (Cavos)              (Stellar Wallets Kit)
           │                           │
           └─────────────┬─────────────┘
                         ▼
                    useWallet()
        una sola forma de firmar en toda la app
                         │
           ┌─────────────┴─────────────┐
           ▼                           ▼
     Trustless Work           Tus contratos Soroban
       (escrows)               (Scaffold Stellar)
```

Tu app puede usar tus propios contratos, escrows o ambos. Como toda la app firma a través de `useWallet()`, todo funciona igual, ya sea que entres con correo o con una extensión: votar en un contrato, crear y fondear escrows, dejar reseñas on-chain o agregar la trustline de USDC.

## Qué trae

| Pieza | Qué hace |
| --- | --- |
| 🔐 **Login sin wallet** | Botón **Sign in** (correo o Google con Cavos) que le crea la cuenta Stellar al usuario, y **Use a wallet** para quien ya usa Freighter u otra extensión. |
| 🏦 **Escrow Studio** (`/escrows`) | Crear, fondear, marcar hitos, aprobar, liberar, disputar y resolver escrows, con un checklist que te guía para preparar tu cuenta. |
| ⭐ **Contrato `reputation`** | Contrato Soroban propio con reseñas on-chain ligadas a cada escrow. Sirve de ejemplo de storage, permisos, errores, eventos y tests. |
| 🧠 **6 skills** | `build-dapp`, `trustless-work`, `cavos`, `scaffold-stellar`, `soroban-contracts`, `stellar-basics`. |
| 🩺 **Scripts** | `setup:tools` (instala las herramientas sin compilar), `doctor` (diagnóstico), `check` (tests + tipos + lint), `tw:smoke` (prueba de escrows de punta a punta). |

## Empezar (15 min)

### Lo que necesitás

- [Node.js](https://nodejs.org) 22 o más nuevo
- [Rust con rustup](https://rustup.rs)
- git
- Un agente de código (Claude Code, Codex, Cursor, OpenCode, Copilot…)
- Wallet: ninguna si entrás con correo o Google, o [Freighter](https://freighter.app) si preferís una extensión

### 1. Creá tu copia

En GitHub tocá **Use this template → Create a new repository** (o hacé un fork) y cloná tu copia:

```bash
git clone https://github.com/<tu-usuario>/<tu-repo>.git
cd <tu-repo>
```

### 2. Instalá las herramientas

```bash
npm run setup:tools   # Stellar CLI + plugin de Scaffold (binarios listos, ~1 min)
npm install           # dependencias del proyecto
npm run doctor        # crea app/.env y te dice qué falta
```

### 3. Conseguí tus claves (gratis, ~5 min)

Las dos van en el archivo `app/.env` y dependen de lo que use tu app.

**Trustless Work** (solo si tu app usa escrows, y para probar el Escrow Studio):

1. Entrá a [dapp.trustlesswork.com](https://dapp.trustlesswork.com) y conectá una wallet.
2. Tocá tu dirección (abajo a la izquierda) → **Settings** y llená tu perfil. El campo _Use case_ es obligatorio.
3. Andá a **API Keys** → pestaña **Testnet** → **Request API Key** y copiala, porque se muestra una sola vez.
4. Pegala en `app/.env` como `PUBLIC_TRUSTLESS_WORK_API_KEY="..."`.

**Cavos** (para que tus usuarios entren con correo o Google):

1. En el [dashboard de Cavos](https://cavos.xyz/dashboard) creá una app y copiá su **App ID**.
2. En **Settings → allowed web origins** agregá `http://localhost:5173`. Si querés login con Google, agregalo también en **Callback URLs**.
3. Pegalo en `app/.env` como `PUBLIC_CAVOS_APP_ID="..."`.

> El App ID de Cavos es público por diseño, no es un secreto: si alguien ya te compartió uno, podés usarlo y saltarte estos pasos. Sin App ID la app igual funciona, pero solo con wallets de extensión.

### 4. Levantá la app

```bash
npm start
```

Abrí [localhost:5173](http://localhost:5173). La primera vez tarda 1 o 2 minutos mientras se despliega el contrato en testnet. Si al inicio ves errores de `app-lib/clients`, esperá a que termine.

### 5. Entrá y prepará tu cuenta

Tocá **Sign in** (correo o Google) o **Use a wallet** (Freighter en **Testnet**) y después **Fund Account** para recibir XLM de prueba con Friendbot. Con eso ya podés usar cualquier contrato.

Para probar escrows, andá a **Escrow Studio** y seguí el checklist: **Add trustline** → **Swap 100 XLM → USDC**.

> **Si entraste con Cavos, hacé Friendbot primero:** tu cuenta nueva necesita un poco de XLM de prueba para pagar las comisiones. Cuando firmes acciones en contratos o escrows, Cavos te va a mostrar su propia ventana para aprobarlas.

> **¿Windows?** Usá WSL2 (recomendado) o Git Bash. Si las skills de `.claude/skills` aparecen como archivos de texto, corré `npm run agents:sync`.

## Construir con prompts

Abrí el repo con tu agente y contale tu idea. El agente lee `AGENTS.md` y las skills, elige solo las piezas que tu idea necesita, propone un plan y lo construye paso a paso. Antes de empezar te va a preguntar qué datos conviene guardar on-chain y cuáles no, explicándote las ventajas y desventajas de cada opción (por ejemplo: on-chain nadie puede alterarlo, pero es público para siempre).

```text
/build-dapp Quiero una bolsa de chambas: los clientes publican trabajos, los freelancers
aplican y el pago va en un escrow con un hito por entregable. Que la gente entre con su
correo, sin wallet. Al final se dejan reseñas.
```

| Agente | Cómo usa este repo |
| --- | --- |
| Claude Code | Lee `CLAUDE.md` (que importa `AGENTS.md`). Las skills aparecen como `/build-dapp`, `/cavos`, `/trustless-work`… |
| Codex CLI | Lee `AGENTS.md` y `.agents/skills` (usá `$build-dapp`) |
| Cursor | Lee `AGENTS.md` y `.agents/skills` (usá `/build-dapp`) |
| GitHub Copilot | Lee `AGENTS.md` y `.agents/skills` |
| Gemini CLI / Antigravity | Carga `AGENTS.md` (vía `.gemini/settings.json`) y `.agents/skills` |
| OpenCode, Pi, Windsurf, Aider y otros | Leen `AGENTS.md`, que les indica qué `SKILL.md` abrir para cada tarea |

Más detalles por herramienta y servidores MCP opcionales en [`docs/AGENT-SETUP.md`](docs/AGENT-SETUP.md).

**Más ideas para pedirle:**

- _"Quiero una app de votaciones para mi comunidad: cualquiera crea una encuesta y cada persona vota una vez."_ (sin escrows)
- _"Hacé un libro de visitas para mi evento donde la gente entre con su correo y deje un mensaje."_ (sin escrows)
- _"Quiero una app para vender distintos artículos usando escrows. Los compradores entran con su correo."_
- _"Hacé una app de depósitos de alquiler: el inquilino deposita en un escrow y el dueño aprueba la devolución al final del contrato."_
- _"Creá una página de bounties de hackathon: cada premio es un hito con su ganador; los jueces aprueban y liberan."_
- _"Después del primer escrow, ofrecele al usuario agregar un passkey para que pueda entrar desde otro dispositivo."_
- _"Agregá un contrato Soroban de perfiles públicos (nombre, skills, links) y mostrá la reputación junto a cada escrow."_
- _"Explicame qué pasa on-chain cuando le doy Fund a un escrow."_
- _"Revisá mi contrato con el checklist de seguridad."_

Hay más ideas, con y sin escrows, en [`ideas.md`](.agents/skills/build-dapp/references/ideas.md).

## Comandos

| Comando | Qué hace |
| --- | --- |
| `npm start` | Modo desarrollo: compila y despliega los contratos en testnet, genera sus clientes y levanta la app |
| `npm run doctor` | Revisa herramientas, `app/.env`, la red y tus claves de Trustless Work y Cavos |
| `npm run check` | Tests de los contratos + formato + revisión de tipos + lint |
| `npm run contracts:build` | Compila, despliega y genera los clientes una sola vez |
| `npm run tw:smoke` | Prueba real de un escrow de punta a punta, sin navegador |
| `npm run build` | Build de producción de la app (`app/dist`) |
| `npm run agents:sync` | Vuelve a sincronizar las skills hacia `.claude/skills` |

## Estructura

```
AGENTS.md               instrucciones para cualquier agente (CLAUDE.md lo importa)
.agents/skills/         las skills (fuente de verdad; .claude/skills apunta acá)
contracts/reputation/   contrato Soroban de ejemplo + tests
environments.toml       qué contratos se despliegan y dónde (development = testnet)
app/src/pages/          páginas: Home, Escrows (Escrow Studio), contratos desplegados
app/src/cavos/          login con correo/Google y wallet embebida (Cavos)
app/src/providers/      WalletProvider: un solo useWallet() para Cavos y extensiones
app/src/trustless/      escrows de Trustless Work (configuración, hooks, componentes)
app-lib/                red, wallets de extensión, friendbot, eventos
app-lib/clients/        clientes generados de tus contratos (no se editan)
scripts/                setup-tools, doctor, tw-smoke, agents-sync
docs/AGENT-SETUP.md     setup por agente y servidores MCP opcionales
```

## Si algo falla

Corré `npm run doctor`, revisá la [guía de problemas comunes](.agents/skills/scaffold-stellar/references/troubleshooting.md) y la [skill de Cavos](.agents/skills/cavos/SKILL.md), o simplemente pegale el error a tu agente. 😉

## Versiones

- `stellar-scaffold-cli` **0.0.27** con la configuración **v1** (`environments.toml`). El template oficial de Scaffold ya usa un formato nuevo (v2) que esta versión del CLI no soporta, así que este repo viene generado: no hace falta correr `stellar scaffold init`.
- `@trustless-work/escrow` **3.0.5** (API V1, la estable).
- `@cavos/kit` **0.2.5**.
- `soroban-sdk` **26.1** y OpenZeppelin `stellar-*` **0.7.2**.

## ¿Construiste algo?

Compartilo en [Discussions → Show and tell](https://github.com/bitfalt/scaffold-stellar-agentic/discussions/categories/show-and-tell) con el link a tu repo y una captura. 🙌

## Créditos y licencias

Basado en el template oficial de [Scaffold Stellar](https://github.com/stellar-scaffold/ui) (Apache-2.0). Incluye la [skill oficial de Trustless Work](https://github.com/Trustless-Work/trustlesswork-skill) (Apache-2.0) en `.agents/skills/trustless-work/references/official/`. Usa [`@cavos/kit`](https://docs.cavos.xyz) (MIT) y [`@trustless-work/escrow`](https://www.npmjs.com/package/@trustless-work/escrow). Este repo se distribuye bajo Apache-2.0.
