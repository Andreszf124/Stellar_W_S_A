# Scaffold Stellar × Trustless Work: prompt-to-dApp starter

Starter para construir dApps en **Stellar** _a punta de prompts_ 🤖✨

- **[Scaffold Stellar](https://developers.stellar.org/docs/tools/scaffold-stellar)**:
  contratos Soroban (Rust) + app React. Cada vez que guardás un contrato, se
  compila, se despliega en testnet y te genera un cliente TypeScript tipado.
- **[Trustless Work](https://docs.trustlesswork.com)**: escrows (fideicomisos)
  listos para usar. La plata (USDC) queda en un contrato y solo se libera cuando
  se aprueban los hitos.
- **Skills para agentes**: instrucciones verificadas en `.agents/skills/` +
  `AGENTS.md`, para que _cualquier_ agente (Claude Code, Codex, Cursor,
  OpenCode, Copilot, Gemini/Antigravity, Pi…) sepa construir sobre este repo sin
  alucinar APIs.

Todo corre en **testnet**: plata de mentira, cero riesgo.

```
┌──────────── tu idea ────────────┐
│ "Quiero una app donde…"         │   →  agente + skills  →  contrato Soroban + escrows + UI
└─────────────────────────────────┘
```

## Qué trae

|                                   |                                                                                                                                                                |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🏦 **Escrow Studio** (`/escrows`) | Crear, fondear, marcar hitos, aprobar, liberar, disputar y resolver escrows. Con checklist de setup (wallet → XLM → trustline USDC → USDC de prueba → API key) |
| ⭐ **Contrato `reputation`**      | Contrato Soroban propio: reseñas on-chain ligadas a cada escrow. Ejemplo de storage, auth, errores, eventos y tests                                            |
| 🧠 **5 skills**                   | `build-dapp`, `trustless-work`, `scaffold-stellar`, `soroban-contracts`, `stellar-basics`                                                                      |
| 🩺 **Scripts**                    | `setup:tools` (instala CLIs sin compilar), `doctor` (diagnóstico), `tw:smoke` (prueba E2E de escrows), `check` (tests + tipos + lint)                          |

## Setup (15 min)

**Necesitás:** Node 22+, [Rust con rustup](https://rustup.rs), git, el navegador
con [Freighter](https://freighter.app) (wallet) y algún agente de código.

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

**5. API key de Trustless Work** (gratis, 2 min):

1. Entrá a https://dapp.trustlesswork.com y conectá tu wallet.
2. Tocá tu dirección (abajo a la izquierda) → **Settings**, y llená el perfil
   (el campo _Use case_ es obligatorio).
3. **API Keys** → pestaña **Testnet** → _Request API Key_. Copiala (se muestra
   una sola vez).
4. Pegala en `app/.env`: `PUBLIC_TRUSTLESS_WORK_API_KEY="..."`

```bash
# 6. ¡A correr! Compila y despliega los contratos en testnet + levanta la app
npm start
```

Abrí http://localhost:5173. La primera vez tarda 1-2 min mientras despliega el
contrato (si Vite muestra errores de `app-lib/clients` al inicio, esperá a que
termine).

**7. Wallet:** en Freighter cambiá la red a **Testnet**, conectate en la app, y
en **Escrow Studio** seguí el checklist: Friendbot → _Add trustline_ → _Swap 100
XLM → USDC_.

> ¿Windows? Usá WSL2 (recomendado) o Git Bash. Si las skills en `.claude/skills`
> aparecen como archivos de texto, corré `npm run agents:sync`.

## Construir con prompts

Abrí el repo con tu agente y contale tu idea. El agente lee `AGENTS.md` y las
skills.

```text
/build-dapp Quiero una bolsa de chambas: clientes publican trabajos, freelancers aplican
y el pago va en un escrow con un hito por entregable. Al final se dejan reseñas.
```

| Agente                               | Cómo lo usa                                                                                               |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| Claude Code                          | Lee `CLAUDE.md` → `AGENTS.md`. Skills en `/build-dapp`, `/trustless-work`… (symlinks en `.claude/skills`) |
| Codex CLI                            | Lee `AGENTS.md` y `.agents/skills` nativamente (`$build-dapp`)                                            |
| Cursor                               | Lee `AGENTS.md` y `.agents/skills` (`/build-dapp`)                                                        |
| GitHub Copilot (VS Code/CLI)         | Lee `AGENTS.md` y `.agents/skills`                                                                        |
| Gemini CLI / Antigravity             | `.gemini/settings.json` carga `AGENTS.md`; skills en `.agents/skills`                                     |
| OpenCode, Pi, Windsurf, Aider, otros | Leen `AGENTS.md`, que indexa las skills: el agente abre el `SKILL.md` que necesita                        |

Detalles por herramienta y servidores MCP opcionales:
[`docs/AGENT-SETUP.md`](docs/AGENT-SETUP.md).

**Más prompts para probar:**

- _"Hacé una app de depósitos de alquiler: el inquilino deposita en un escrow
  single-release y el dueño aprueba la devolución."_
- _"Creá una página de bounties de hackathon: cada premio es un hito con su
  ganador, los jueces aprueban y liberan."_
- _"Agregá un contrato Soroban de perfiles públicos (nombre, skills, links) y
  mostrá la reputación junto a cada escrow."_
- _"Explicame qué pasa on-chain cuando le doy Fund a un escrow."_
- _"Revisá mi contrato con el checklist de seguridad antes de presentarlo."_

Ideas con roles ya mapeados:
[`.agents/skills/build-dapp/references/ideas.md`](.agents/skills/build-dapp/references/ideas.md).

## Comandos

| Comando                   | Qué hace                                               |
| ------------------------- | ------------------------------------------------------ |
| `npm start`               | Dev loop: contratos → testnet → clientes TS + Vite     |
| `npm run doctor`          | Revisa herramientas, `.env`, red y API key             |
| `npm run check`           | `cargo test` + typecheck + lint                        |
| `npm run contracts:build` | Build + deploy + clientes una sola vez                 |
| `npm run tw:smoke`        | Prueba real de escrow de punta a punta (sin navegador) |
| `npm run build`           | Build de producción del frontend (`app/dist`)          |
| `npm run agents:sync`     | Re-sincroniza las skills hacia `.claude/skills`        |

## Estructura

```
AGENTS.md                 instrucciones para cualquier agente (CLAUDE.md lo importa)
.agents/skills/           skills (fuente de verdad) ─ symlinks en .claude/skills
contracts/reputation/     contrato Soroban de ejemplo + tests
environments.toml         qué contratos se despliegan y dónde (development = testnet)
app/src/pages/            Home, Escrows (Escrow Studio), Debug (contratos desplegados)
app/src/trustless/        integración Trustless Work (config, hooks, componentes)
app-lib/                  red, wallet, friendbot, eventos · clients/ = generado (no editar)
scripts/                  setup-tools, doctor, tw-smoke, agents-sync
docs/                     guía del taller y setup por agente
```

## Problemas comunes

Ver
[`.agents/skills/scaffold-stellar/references/troubleshooting.md`](.agents/skills/scaffold-stellar/references/troubleshooting.md),
o simplemente pegale el error a tu agente 😉.

## Versiones fijadas (y por qué)

- `stellar-scaffold-cli` **0.0.27** con config **v1** (`environments.toml`). El
  template oficial migró a config v2 el 1 de octubre de 2026, pero esa versión
  del CLI todavía no está publicada, así que `stellar scaffold init` falla hoy.
  Este repo ya viene generado, no hace falta `init`.
- `@trustless-work/escrow` **3.0.5** (API V1, estable). La V2 está en beta.
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
(Apache-2.0) en `.agents/skills/trustless-work/references/official/`. Este repo:
Apache-2.0.
