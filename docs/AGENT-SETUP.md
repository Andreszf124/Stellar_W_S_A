# Setup por agente

Este repo es **agent-agnostic**. La fuente de verdad es:

- `AGENTS.md`: instrucciones generales (estándar abierto https://agents.md).
- `.agents/skills/<skill>/SKILL.md`: skills (estándar abierto
  https://agentskills.io).

Todo lo demás son adaptadores finos para herramientas que buscan en otro lado.

| Herramienta                       | Instrucciones                           | Skills                                                            | MCP opcional (ya configurado)              |
| --------------------------------- | --------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------ |
| **Claude Code**                   | `CLAUDE.md` (importa `@AGENTS.md`)      | `.claude/skills/*` → symlinks a `.agents/skills`                  | `.mcp.json`                                |
| **Codex CLI**                     | `AGENTS.md`                             | `.agents/skills` (nativo) · `$build-dapp`                         | `.codex/config.toml` (proyectos _trusted_) |
| **Cursor**                        | `AGENTS.md`                             | `.agents/skills` (nativo) · `/build-dapp`                         | `.cursor/mcp.json`                         |
| **GitHub Copilot** (VS Code, CLI) | `AGENTS.md`                             | `.agents/skills` (nativo)                                         | `.vscode/mcp.json`, `.mcp.json`            |
| **Gemini CLI**                    | `AGENTS.md` vía `.gemini/settings.json` | `.agents/skills`                                                  | `.gemini/settings.json`                    |
| **Antigravity** (`agy`)           | `AGENTS.md`                             | `.agents/skills`                                                  | agregalo manualmente (abajo)               |
| **OpenCode**                      | `AGENTS.md`                             | `.agents/skills` / `.claude/skills`                               | agregalo manualmente (abajo)               |
| **Pi, Windsurf, Aider, otros**    | `AGENTS.md`                             | Leídas bajo demanda: `AGENTS.md` lista la ruta de cada `SKILL.md` | según la herramienta                       |

### Si tu agente no "ve" las skills

Decile literalmente: _"Lee AGENTS.md y luego .agents/skills/build-dapp/SKILL.md
antes de empezar."_ Las skills son Markdown normal: cualquier modelo las puede
leer.

Para herramientas que buscan skills en otra carpeta, creá un mirror:

```bash
node scripts/agents-sync.mjs --target .pi/skills        # ejemplo: Pi
node scripts/agents-sync.mjs --target .opencode/skills  # ejemplo: OpenCode
```

(`--copy` copia en vez de crear symlinks; en Windows copia siempre.)

### Editar o agregar skills

1. Editá/creá `.agents/skills/<nombre>/SKILL.md` (frontmatter `name` = nombre de
   la carpeta, `description` ≤ 1024 caracteres que diga **cuándo** usarla).
2. `npm run agents:sync` (actualiza `.claude/skills`).
3. `npm run agents:check` verifica que todo esté sincronizado.

## Servidores MCP (opcionales)

No hacen falta: las skills traen la información verificada. Sirven para buscar
documentación viva. Ninguno pide API key.

| Servidor               | URL                                                          | Para qué                                                 |
| ---------------------- | ------------------------------------------------------------ | -------------------------------------------------------- |
| `trustless-work`       | `https://docs.trustlesswork.com/trustless-work/~gitbook/mcp` | Buscar en la doc de Trustless Work                       |
| `openzeppelin-stellar` | `https://mcp.openzeppelin.com/contracts/stellar/mcp`         | Generar contratos OpenZeppelin (tokens, NFTs, governor…) |

Otros útiles (requieren login o tienen límites): Stellar Raven
`https://raven.stellar.buzz/mcp` (OAuth, docs + ecosistema Stellar), Context7
`https://mcp.context7.com/mcp` (límite anónimo bajo).

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

- Stellar (SDF): https://skills.stellar.org ·
  `npx skills add https://github.com/stellar/stellar-dev-skill` (ojo: apuntan a
  versiones más nuevas del SDK que este repo).
- OpenZeppelin (AGPL, por eso no viene incluida):
  `npx skills add OpenZeppelin/openzeppelin-skills`.
- Trustless Work: ya viene incluida en
  `.agents/skills/trustless-work/references/official/`.
