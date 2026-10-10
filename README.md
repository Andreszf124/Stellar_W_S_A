# Scaffold Stellar × Trustless Work × Cavos: de idea a dApp con prompts

Starter para construir dApps en **Stellar** _a punta de prompts_ 🤖✨ con tres
piezas que ya vienen conectadas:

- 🏗️
  **[Scaffold Stellar](https://developers.stellar.org/docs/tools/scaffold-stellar)**:
  contratos Soroban (Rust) + app React. Cada vez que guardás un contrato, se
  compila, se despliega en testnet y te genera un cliente TypeScript tipado.
- 🏦 **[Trustless Work](https://docs.trustlesswork.com)**: escrows
  (fideicomisos) listos para usar. La plata (USDC) queda en un contrato y solo
  se libera cuando se aprueban los hitos.
- 🔐 **[Cavos](https://docs.cavos.xyz)**: wallets embebidas. Tus usuarios entran
  con su **correo o Google** y ya tienen una cuenta Stellar: sin instalar
  extensiones, sin frases semilla. La llave es del usuario (self-custodial) y
  vive en un iframe aislado, no en tu página ni en los servidores de Cavos.

Y encima, **skills para agentes**: instrucciones verificadas en
`.agents/skills/` + `AGENTS.md`, para que _cualquier_ agente (Claude Code,
Codex, Cursor, OpenCode, Copilot, Gemini/Antigravity, Pi…) sepa construir sobre
estas tres piezas sin alucinar APIs.

Todo corre en **testnet**: plata de mentira, cero riesgo.

```
┌──────────── tu idea ────────────┐
│ "Quiero una app donde…"         │  →  agente + skills  →  login con correo (Cavos)
└─────────────────────────────────┘                          + escrows (Trustless Work)
                                                             + contrato Soroban (Scaffold) + UI
```

## Cómo encaja todo

```
 Usuario
   │  "Sign in" (correo / Google)          "Use a wallet" (Freighter, xBull…)
   ▼            │                                        │
 ┌──────────────┴──────── useWallet() ───────────────────┴──────────┐
 │  una sola API para firmar: signTransaction(xdr)                  │
 │  Cavos firma con su wallet embebida · Stellar Wallets Kit con la │
 │  extensión. El resto de la app no sabe ni le importa cuál es.    │
 └──────────────┬───────────────────────────────────┬───────────────┘
                ▼                                   ▼
   Trustless Work (escrows)              Tus contratos Soroban (Scaffold)
   la API arma la transacción →          el cliente TS generado arma la
   el usuario firma → la API la envía    transacción → el usuario firma
```

Por eso todo funciona igual con cualquiera de las dos formas de entrar: crear y
fondear escrows, aprobar hitos, dejar reseñas on-chain, agregar la trustline de
USDC.

## Qué trae

|                                   |                                                                                                                                                                                  |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🔐 **Login sin wallet (Cavos)**   | Botón **Sign in** con correo o Google: crea la cuenta Stellar del usuario. También **Use a wallet** para quien ya tiene Freighter & co. Todo el código usa un solo `useWallet()` |
| 🏦 **Escrow Studio** (`/escrows`) | Crear, fondear, marcar hitos, aprobar, liberar, disputar y resolver escrows. Con checklist de setup (entrar → XLM → trustline USDC → USDC de prueba → API key)                   |
| ⭐ **Contrato `reputation`**      | Contrato Soroban propio: reseñas on-chain ligadas a cada escrow. Ejemplo de storage, auth, errores, eventos y tests                                                              |
| 🧠 **6 skills**                   | `build-dapp`, `trustless-work`, `cavos`, `scaffold-stellar`, `soroban-contracts`, `stellar-basics`                                                                               |
| 🩺 **Scripts**                    | `setup:tools` (instala CLIs sin compilar), `doctor` (diagnóstico), `tw:smoke` (prueba E2E de escrows), `check` (tests + tipos + lint)                                            |

## Setup (15 min)

**Necesitás:** Node 22+, [Rust con rustup](https://rustup.rs), git y algún
agente de código. Wallet: ninguna si usás el login con correo/Google (Cavos), o
[Freighter](https://freighter.app) si preferís una extensión.

**1.** En GitHub tocá **Use this template → Create a new repository** (o hacé
fork) y clonalo:

```bash
git clone https://github.com/<tu-usuario>/<tu-repo>.git
cd <tu-repo>

# 2. Herramientas de Stellar (binarios precompilados, ~1 min) + target wasm de Rust
npm run setup:tools

# 3. Dependencias
npm install

# 4. Diagnóstico: crea app/.env y te dice qué falta
npm run doctor
```

**5. Tus dos claves en `app/.env`** (gratis, ~5 min):

**a) Trustless Work** (para los escrows):

1. Entrá a https://dapp.trustlesswork.com y conectá una wallet.
2. Tocá tu dirección (abajo a la izquierda) → **Settings**, y llená el perfil
   (el campo _Use case_ es obligatorio).
3. **API Keys** → pestaña **Testnet** → _Request API Key_. Copiala (se muestra
   una sola vez).
4. `PUBLIC_TRUSTLESS_WORK_API_KEY="..."`

**b) Cavos** (para el login con correo/Google):

1. https://cavos.xyz/dashboard → creá una app y copiá su **App ID**.
2. En la app → **Settings → allowed web origins**: agregá
   `http://localhost:5173`. Para entrar con Google, agregá también
   `http://localhost:5173` en **Callback URLs** (con correo no hace falta).
3. `PUBLIC_CAVOS_APP_ID="..."`

> **En el taller:** quien presenta comparte un App ID de Cavos en pantalla. Como
> todos corren en `http://localhost:5173`, sirve para toda la sala y te saltás
> el paso b. El App ID es público por diseño, no es un secreto.
>
> Sin App ID de Cavos, la app igual funciona: solo ofrece wallets de extensión.

```bash
# 6. ¡A correr! Compila y despliega los contratos en testnet + levanta la app
npm start
```

Abrí http://localhost:5173. La primera vez tarda 1-2 min mientras despliega el
contrato (si Vite muestra errores de `app-lib/clients` al inicio, esperá a que
termine).

**7. Entrá y prepará tu cuenta:** tocá **Sign in** (correo o Google, con Cavos)
o **Use a wallet** (Freighter en **Testnet**). En **Escrow Studio** seguí el
checklist: Friendbot → _Add trustline_ → _Swap 100 XLM → USDC_.

> Con Cavos, hacé **Friendbot primero**: tu cuenta nueva necesita un poco de XLM
> de prueba para pagar comisiones. En las acciones de escrow, Cavos te muestra
> su propia ventanita de aprobación (no hay extensión que instalar).

> ¿Windows? Usá WSL2 (recomendado) o Git Bash. Si las skills en `.claude/skills`
> aparecen como archivos de texto, corré `npm run agents:sync`.

## Construir con prompts

Abrí el repo con tu agente y contale tu idea. El agente lee `AGENTS.md` y las
skills.

```text
/build-dapp Quiero una bolsa de chambas: clientes publican trabajos, freelancers aplican
y el pago va en un escrow con un hito por entregable. Que la gente entre con su correo,
sin wallet. Al final se dejan reseñas.
```

| Agente                               | Cómo lo usa                                                                                                         |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| Claude Code                          | Lee `CLAUDE.md` → `AGENTS.md`. Skills en `/build-dapp`, `/cavos`, `/trustless-work`… (symlinks en `.claude/skills`) |
| Codex CLI                            | Lee `AGENTS.md` y `.agents/skills` nativamente (`$build-dapp`)                                                      |
| Cursor                               | Lee `AGENTS.md` y `.agents/skills` (`/build-dapp`)                                                                  |
| GitHub Copilot (VS Code/CLI)         | Lee `AGENTS.md` y `.agents/skills`                                                                                  |
| Gemini CLI / Antigravity             | `.gemini/settings.json` carga `AGENTS.md`; skills en `.agents/skills`                                               |
| OpenCode, Pi, Windsurf, Aider, otros | Leen `AGENTS.md`, que indexa las skills: el agente abre el `SKILL.md` que necesita                                  |

Detalles por herramienta y servidores MCP opcionales:
[`docs/AGENT-SETUP.md`](docs/AGENT-SETUP.md).

**Más prompts para probar:**

- _"Quiero una app para vender distintos artículos usando escrows. Los
  compradores entran con su correo."_
- _"Hacé una app de depósitos de alquiler: el inquilino deposita en un escrow
  single-release y el dueño aprueba la devolución."_
- _"Creá una página de bounties de hackathon: cada premio es un hito con su
  ganador, los jueces aprueban y liberan."_
- _"Después del primer escrow, ofrecele al usuario agregar un passkey para poder
  entrar desde otro dispositivo."_
- _"Agregá un contrato Soroban de perfiles públicos (nombre, skills, links) y
  mostrá la reputación junto a cada escrow."_
- _"Explicame qué pasa on-chain cuando le doy Fund a un escrow."_
- _"Revisá mi contrato con el checklist de seguridad antes de presentarlo."_

Ideas con roles ya mapeados:
[`.agents/skills/build-dapp/references/ideas.md`](.agents/skills/build-dapp/references/ideas.md).

## Comandos

| Comando                   | Qué hace                                                            |
| ------------------------- | ------------------------------------------------------------------- |
| `npm start`               | Dev loop: contratos → testnet → clientes TS + Vite                  |
| `npm run doctor`          | Revisa herramientas, `.env`, red, API key de Trustless Work y Cavos |
| `npm run check`           | `cargo test` + typecheck + lint                                     |
| `npm run contracts:build` | Build + deploy + clientes una sola vez                              |
| `npm run tw:smoke`        | Prueba real de escrow de punta a punta (sin navegador)              |
| `npm run build`           | Build de producción del frontend (`app/dist`)                       |
| `npm run agents:sync`     | Re-sincroniza las skills hacia `.claude/skills`                     |

## Estructura

```
AGENTS.md                 instrucciones para cualquier agente (CLAUDE.md lo importa)
.agents/skills/           skills (fuente de verdad) ─ symlinks en .claude/skills
contracts/reputation/     contrato Soroban de ejemplo + tests
environments.toml         qué contratos se despliegan y dónde (development = testnet)
app/src/pages/            Home, Escrows (Escrow Studio), Debug (contratos desplegados)
app/src/cavos/            integración Cavos: login con correo/Google, wallet embebida
app/src/providers/        WalletProvider: un solo useWallet() para Cavos y extensiones
app/src/trustless/        integración Trustless Work (config, hooks, componentes)
app-lib/                  red, wallet kit, friendbot, eventos · clients/ = generado (no editar)
scripts/                  setup-tools, doctor, tw-smoke, agents-sync
docs/                     guía del taller y setup por agente
```

## Problemas comunes

Ver
[`.agents/skills/scaffold-stellar/references/troubleshooting.md`](.agents/skills/scaffold-stellar/references/troubleshooting.md)
y la sección de Cavos en
[`.agents/skills/cavos/SKILL.md`](.agents/skills/cavos/SKILL.md), o simplemente
pegale el error a tu agente 😉.

## Versiones fijadas (y por qué)

- `stellar-scaffold-cli` **0.0.27** con config **v1** (`environments.toml`). El
  template oficial migró a config v2 el 1 de octubre de 2026, pero esa versión
  del CLI todavía no está publicada, así que `stellar scaffold init` falla hoy.
  Este repo ya viene generado, no hace falta `init`.
- `@trustless-work/escrow` **3.0.5** (API V1, estable). La V2 está en beta.
- `@cavos/kit` **0.2.5** (wallets embebidas en Stellar testnet/mainnet).
- `soroban-sdk` **26.1**, OpenZeppelin `stellar-*` **0.7.2**.

## ¿Construiste algo?

Compartilo en
[Discussions → Show and tell](https://github.com/bitfalt/scaffold-stellar-agentic/discussions/categories/show-and-tell)
con el link a tu repo y una captura. 🙌

## Créditos y licencias

Basado en el template oficial de
[Scaffold Stellar](https://github.com/stellar-scaffold/ui) (Apache-2.0). Incluye
la
[skill oficial de Trustless Work](https://github.com/Trustless-Work/trustlesswork-skill)
(Apache-2.0) en `.agents/skills/trustless-work/references/official/`. Usa
[`@cavos/kit`](https://docs.cavos.xyz) (MIT) y
[`@trustless-work/escrow`](https://www.npmjs.com/package/@trustless-work/escrow).
Este repo: Apache-2.0.
