# Configuración por agente

Este repositorio es independiente del agente que uses. La fuente de verdad es:

- `AGENTS.md`: instrucciones generales (estándar abierto, https://agents.md).
- `.agents/skills/<skill>/SKILL.md`: skills (estándar abierto,
  https://agentskills.io).

El resto son adaptadores para herramientas que buscan sus instrucciones en otra
ubicación.

| Herramienta                       | Instrucciones                           | Skills                                                              | MCP opcional (ya configurado)              |
| --------------------------------- | --------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------ |
| **Claude Code**                   | `CLAUDE.md` (importa `@AGENTS.md`)      | `.claude/skills/*`, enlaces simbólicos a `.agents/skills`           | `.mcp.json`                                |
| **Codex CLI**                     | `AGENTS.md`                             | `.agents/skills` (nativo), `$build-dapp`                            | `.codex/config.toml` (proyectos _trusted_) |
| **Cursor**                        | `AGENTS.md`                             | `.agents/skills` (nativo), `/build-dapp`                            | `.cursor/mcp.json`                         |
| **GitHub Copilot** (VS Code, CLI) | `AGENTS.md`                             | `.agents/skills` (nativo)                                           | `.vscode/mcp.json`, `.mcp.json`            |
| **Gemini CLI**                    | `AGENTS.md` vía `.gemini/settings.json` | `.agents/skills`                                                    | `.gemini/settings.json`                    |
| **Antigravity** (`agy`)           | `AGENTS.md`                             | `.agents/skills`                                                    | configuración manual (ver abajo)           |
| **OpenCode**                      | `AGENTS.md`                             | `.agents/skills` o `.claude/skills`                                 | configuración manual (ver abajo)           |
| **Pi, Windsurf, Aider y otros**   | `AGENTS.md`                             | Se leen bajo demanda: `AGENTS.md` indica la ruta de cada `SKILL.md` | según la herramienta                       |

## Si tu agente no encuentra las skills

Indícale de forma explícita: _"Lee AGENTS.md y luego
.agents/skills/build-dapp/SKILL.md antes de empezar."_ Las skills son archivos
Markdown comunes, por lo que cualquier modelo puede leerlas.

Para herramientas que buscan skills en otra carpeta, crea una copia
sincronizada:

```bash
node scripts/agents-sync.mjs --target .pi/skills        # ejemplo: Pi
node scripts/agents-sync.mjs --target .opencode/skills  # ejemplo: OpenCode
```

La opción `--copy` crea copias en lugar de enlaces simbólicos; en Windows
siempre se usan copias.

## Editar o agregar skills

1. Edita o crea `.agents/skills/<nombre>/SKILL.md`. En el frontmatter, `name`
   debe coincidir con el nombre de la carpeta y `description` (máximo 1024
   caracteres) debe indicar **cuándo** usarla.
2. Ejecuta `npm run agents:sync` para actualizar `.claude/skills`.
3. Ejecuta `npm run agents:check` para verificar que todo esté sincronizado.

## Servidores MCP (opcionales)

No son necesarios: las skills ya contienen la información verificada. Sirven
para consultar documentación actualizada y ninguno requiere API key.

| Servidor               | URL                                                          | Uso                                                      |
| ---------------------- | ------------------------------------------------------------ | -------------------------------------------------------- |
| `trustless-work`       | `https://docs.trustlesswork.com/trustless-work/~gitbook/mcp` | Buscar en la documentación de Trustless Work             |
| `openzeppelin-stellar` | `https://mcp.openzeppelin.com/contracts/stellar/mcp`         | Generar contratos OpenZeppelin (tokens, NFTs, governor…) |

Otros servidores útiles, que requieren inicio de sesión o tienen límites:
Stellar Raven, `https://raven.stellar.buzz/mcp` (OAuth; documentación y
ecosistema de Stellar), y Context7, `https://mcp.context7.com/mcp` (límite
anónimo bajo).

**OpenCode** (`opencode.json` en la raíz):

```json
{
	"$schema": "https://opencode.ai/config.json",
	"mcp": {
		"trustless-work": {
			"type": "remote",
			"url": "https://docs.trustlesswork.com/trustless-work/~gitbook/mcp"
		}
	}
}
```

**Antigravity** (`.agents/mcp_config.json`):

```json
{
	"mcpServers": {
		"trustless-work": {
			"serverUrl": "https://docs.trustlesswork.com/trustless-work/~gitbook/mcp"
		}
	}
}
```

## Skills oficiales del ecosistema (opcionales)

- Stellar (SDF): https://skills.stellar.org, con
  `npx skills add https://github.com/stellar/stellar-dev-skill`. Apuntan a
  versiones del SDK más nuevas que las de este repositorio.
- OpenZeppelin: `npx skills add OpenZeppelin/openzeppelin-skills`. No viene
  incluida porque su licencia es AGPL.
- Trustless Work: ya viene incluida en
  `.agents/skills/trustless-work/references/official/`.
