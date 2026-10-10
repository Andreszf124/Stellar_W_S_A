# Guía del taller: de idea a dApp con prompts

Guía para quien presenta. Formato sugerido: **75 min** (charla 25 + demo 15 +
manos a la obra 30 + cierre 5). Si hay 45 min: charla 15, demo 15, el resto
queda de tarea con el repo.

---

## La noche antes (checklist del presentador)

- [ ] `npm run setup:tools && npm install && npm run doctor` sin ❌.
- [ ] API key de Trustless Work en `app/.env` y **`npm run tw:smoke` en verde**
      (prueba real de deploy → fund → approve → release en testnet). Si falla,
      ahí mismo ves el error exacto.
- [ ] **Cavos**: creá UNA app en https://cavos.xyz/dashboard, agregá
      `http://localhost:5173` en _allowed web origins_ (y en _Callback URLs_ si
      vas a usar Google). Como todos corren en `localhost:5173`, podés compartir
      ese App ID con la sala (es público por diseño) y se ahorran ese paso.
      Probá **Sign in** con tu correo → Friendbot → trustline → un escrow.
- [ ] `npm start`, conectar Freighter (Testnet), completar el checklist del
      Escrow Studio y hacer un ciclo completo con la UI: crear → fondear → _Mark
      done_ → _Approve_ → _Release_ → reseña.
- [ ] Tener 2 cuentas en Freighter (cliente y freelancer) por si querés mostrar
      roles separados.
- [ ] Publicar el repo (GitHub) y tener el link + QR listos. Marcarlo como
      _template repository_ en Settings para que puedan usar "Use this
      template".
- [ ] Pedir a los asistentes **antes** del taller: Node 22+, Rust (rustup),
      Freighter instalado, un agente de código instalado. Mandarles el link al
      README.
- [ ] Plan B de demo: una rama `demo/gig-board` con el resultado esperado del
      prompt en vivo (generala hoy corriendo el prompt de la demo vos mismo).

---

## 1. Charla (25 min)

### 1.1 Por qué Stellar (3 min)

- Red pública rápida (≈5 s por transacción, final, sin reorganizaciones) y
  barata (fracciones de centavo).
- Pensada para pagos: los activos (USDC, EURC…) son nativos de la red, no un
  contrato cualquiera.
- **Soroban** = los smart contracts de Stellar, en Rust, compilados a
  WebAssembly.
- Testnet con plata gratis (Friendbot) → ideal para aprender sin miedo.

### 1.2 Tres conceptos que confunden a todo el mundo (4 min)

- **Cuenta y wallet**: tu dirección `G…` es pública; la llave secreta `S…` la
  guarda la wallet (Freighter) y _nunca_ sale de ahí. La app pide firmar, no
  pide la llave.
- **Wallets sin wallet (Cavos)**: para usuarios normales, instalar una extensión
  es el punto donde se van. Con Cavos entran con correo o Google y obtienen una
  cuenta `G…` normal; la llave vive en un iframe aislado (no en tu página ni en
  Cavos) y firma con un modal propio. En el repo es un botón: **Sign in**.
- **Trustline**: para recibir un token que no sea XLM, tu cuenta tiene que
  "aceptarlo" primero. Por eso el checklist tiene el paso _Add trustline_.
- **Fees y reserva**: cada operación cuesta un poquito de XLM y las cuentas
  guardan un mínimo.

### 1.3 Scaffold Stellar (5 min)

- Problema: en web3 lo difícil es el pegamento entre contrato y frontend (ABIs,
  despliegues, IDs).
- Scaffold: guardás el `.rs` → compila → despliega a testnet → **genera un
  cliente TypeScript tipado** → lo importás en React con
  `import { reputation } from "@stellar-scaffold/app-lib/clients"`.
- Mostrar `environments.toml` (qué contratos se despliegan) y
  `contracts/reputation/src/lib.rs` (20 segundos: `require_auth`, storage,
  evento).

### 1.4 Escrows con Trustless Work (6 min)

- Escrow = un tercero neutral que guarda la plata y la suelta cuando se cumplen
  condiciones. Aquí el tercero es un contrato: nadie puede "salir corriendo" con
  la plata.
- Trustless Work despliega **un contrato por trato** vía API: no tenés que
  escribir ni auditar la lógica de escrow.
- **Roles**: approver (aprueba), service provider (entrega), release signer
  (libera), dispute resolver (arbitra), platform (cobra comisión), receiver
  (recibe).
- **Single-release** (un pago al final: compras, depósitos) vs **multi-release**
  (pago por hito: freelance, bounties, grants).
- El patrón de todas las acciones: la API arma la transacción → la wallet firma
  → se envía. En el repo eso es una sola función: `useEscrowTx().run(...)`.

### 1.5 El enfoque "AI-pilled" (7 min)

- Los modelos se saben Ethereum de memoria, pero de Stellar/Soroban saben menos
  y con versiones viejas → alucinan APIs. La solución no es "promptear mejor",
  es **darles contexto verificado**.
- **`AGENTS.md`**: el README para agentes. Lo leen Codex, Cursor, Copilot,
  OpenCode, Gemini/Antigravity… (Claude Code lo importa desde `CLAUDE.md`).
- **Skills** (`.agents/skills/*/SKILL.md`, estándar abierto): paquetes de
  conocimiento que el agente carga solo cuando los necesita. Mostrar la tabla de
  skills y abrir `trustless-work/SKILL.md`: "estos son hechos verificados hoy:
  nombres exactos de roles, tipos, errores reales".
- Agnóstico: una sola fuente en `.agents/skills`, mirrors para Claude Code, y si
  tu agente no soporta skills igual las lee porque `AGENTS.md` le dice dónde
  están.
- Loop de verificación: el agente corre `npm run check` (tests + tipos + lint)
  después de cada paso.

---

## 2. Demo en vivo (15 min)

Preparado: app corriendo (`npm start`), Freighter en Testnet con USDC, agente
abierto en el repo.

1. **Escrow Studio a mano (4 min)**: **Sign in** con correo (Cavos, sin
   extensión) → Friendbot → trustline → swap. Crear un escrow multi-release de 2
   hitos, fondear, _Mark done_, _Approve_, _Release_. Abrir el link del viewer
   de Trustless Work y el explorer.
2. **Prompt en vivo (9 min)**:
   ```text
   /build-dapp Quiero una bolsa de chambas: un cliente publica un trabajo con título, descripción
   y presupuesto en USDC; un freelancer se postula; el cliente lo contrata y eso crea un escrow
   multi-release con un hito por entregable. Mostrá las chambas abiertas y las mías.
   ```
   Mientras el agente trabaja, narrá lo que hace: lee la skill, propone roles,
   escribe tests del contrato, lo registra en `environments.toml`, Scaffold lo
   despliega solo, crea la página.
3. **Cierre de demo (2 min)**: abrir la página nueva, publicar una chamba,
   contratar. Si el agente se traba: `git checkout demo/gig-board` (plan B) y
   seguís.

---

## 3. Manos a la obra (30 min)

1. Fork / "Use this template" → clonar → `npm run setup:tools` → `npm install` →
   `npm run doctor`.
2. API key de Trustless Work (pasos en el README) + el App ID de Cavos que
   compartís en pantalla (`PUBLIC_CAVOS_APP_ID`) → `npm start`.
3. Checklist del Escrow Studio con su wallet (Friendbot → trustline → swap a
   USDC).
4. Elegir una idea (abajo) y arrancar con `/build-dapp` (o "lee AGENTS.md y la
   skill build-dapp").

Tip para la sala: si 30 personas usan la misma IP, Friendbot o la API pueden
limitar. El swap XLM→USDC del checklist evita depender del faucet de Circle.

### Ideas para la sala (con dificultad)

| Idea                               | Escrow                          | Dificultad |
| ---------------------------------- | ------------------------------- | ---------- |
| Depósito de alquiler               | single-release                  | ⭐         |
| Clases prepagadas (10 hitos)       | multi-release                   | ⭐         |
| Bolsa de chambas con reputación    | multi + contrato                | ⭐⭐       |
| Bounties de hackathon con jueces   | multi-release, varios receivers | ⭐⭐       |
| Vaquita para viaje grupal          | multi-release, varios funders   | ⭐⭐       |
| Crowdfunding con NFT de recompensa | multi + NFT                     | ⭐⭐⭐     |

Más en `.agents/skills/build-dapp/references/ideas.md`.

---

## 4. Cierre (5 min)

- Lo que se llevan: un repo propio con escrows funcionando + un flujo para
  seguir construyendo con cualquier agente.
- Siguientes pasos: desplegar el frontend (`npm run build` → Vercel/Netlify),
  probar con dos wallets reales, leer la skill `soroban-contracts` antes de
  pensar en mainnet.
- Links: developers.stellar.org · docs.trustlesswork.com · stellarscaffold.org

---

## Preguntas frecuentes (para tener la respuesta a mano)

**¿Esto es plata real?** No: testnet. USDC de prueba, XLM de Friendbot.

**¿Puedo usar mi propio token en vez de USDC?** Trustless Work V1 trabaja con
trustlines clásicas (USDC/EURC). Para un token propio necesitarías otro flujo:
mejor no en el taller.

**¿Dónde se guardan los datos de mi app?** Lo del dinero en el escrow; lo
público y compartido (publicaciones, perfiles, reseñas) en tu contrato Soroban;
archivos grandes fuera de la cadena.

**¿Qué pasa si hay disputa?** Cualquier rol (menos el resolver) la abre; el
_dispute resolver_ reparte el saldo entre las partes. En la UI es el slider de
"% to provider".

**¿El agente puede firmar por mí?** No, y no debería. La wallet firma. Las
skills le prohíben pedir llaves secretas.

**¿Por qué no usamos `stellar scaffold init`?** El template oficial cambió de
formato el 1 de octubre y la versión publicada del CLI todavía no lo soporta.
Este repo ya viene generado con la combinación que funciona.

**Mi `npm start` muestra errores de `app-lib/clients` al inicio.** Normal en el
primer arranque: esperá a que los logs "stellar" digan _Successfully generated
client_.
