# Grano de Origen

Trazabilidad de café costarricense en Stellar. El productor registra un lote
(finca, cosecha y proceso) en un contrato Soroban, cualquiera consulta su origen
escaneando un QR y el lote se transfiere on-chain al comprador.

Proyecto del reto "Grano de Origen" del TicoChallenge (Universidad Fidélitas),
creado sobre [Scaffold Stellar](https://github.com/stellar-scaffold/cli).

- Contrato en Testnet: `CDTZKQAOMBPHRD7YK73ETWPJYDTVDM66DRBKQT375RHQSO7I7JZA6SI3`
- Explorador: `https://lab.stellar.org/r/testnet/contract/CDTZKQAOMBPHRD7YK73ETWPJYDTVDM66DRBKQT375RHQSO7I7JZA6SI3`
- Frontend desplegado: `<URL_FRONTEND>`
- Guion de la demo: [docs/DEMO.md](docs/DEMO.md)

## Problema y usuario

El café de especialidad se vende por su origen, pero la información de finca,
cosecha y proceso viaja en papeles, mensajes o la palabra del vendedor. El
comprador no puede verificarla y el productor no puede probar de dónde viene su
grano ni cuándo cambió de manos.

- **Usuario principal:** el pequeño y mediano productor de café (Tarrazú,
  Naranjo, Tres Ríos y otras regiones) que quiere demostrar el origen de su lote.
- **Usuarios secundarios:** compradores (tostadores, exportadores) que reciben
  el lote, y el consumidor final que escanea el QR.

## Qué hace

1. **Registrar un lote:** el productor conecta su wallet y guarda finca,
   cosecha y proceso. El contrato asigna un id y la fecha de creación.
2. **Consulta pública por QR:** el QR apunta a la página del lote. La lectura
   no requiere wallet ni fondos.
3. **Transferir el lote:** el dueño actual lo cede a la dirección del comprador;
   solo el dueño puede hacerlo.

## Cómo usa Stellar

- **Soroban:** el contrato inteligente es la única fuente de verdad. Expone
  `register_lot`, `get_lot`, `transfer_lot` y `lot_count`.
- **Scaffold Stellar:** compila el contrato, lo despliega según `scaffold.yml`,
  genera el cliente TypeScript en `app-lib/clients` y recarga el frontend
  (`stellar scaffold watch --build-clients`).
- **Wallet:** productor y comprador firman registro y transferencia con su
  wallet (Stellar Wallets Kit, dependencia ya presente en `app-lib`). Las
  lecturas son simulaciones sin firma.
- **Testnet:** el contrato y las cuentas de la demo viven en Testnet; las
  cuentas se fondean con Friendbot.

## Arquitectura

No hay backend propio: el contrato es el único backend.

```
contracts/grano-de-origen/src/
  types.rs     estructura Lot y claves de datos
  error.rs     errores del contrato (LotNotFound, NotOwner, ...)
  storage.rs   lectura y escritura del estado
  lib.rs       funciones públicas del contrato

app/src/
  services/    lotService: adaptador entre la UI y el cliente generado
  pages/       pantallas (registro, consulta del lote, transferencia)
  components/  piezas de UI reutilizables
  providers/   wallet y notificaciones
```

La UI depende solo de la interfaz `LotService`; el cliente generado
(`@stellar-scaffold/app-lib/clients`) se usa únicamente desde `services/`.

## Requisitos (Windows)

- **Rust** con el target `wasm32v1-none`. `rust-toolchain.toml` fija el canal
  1.93.0 y ese target; `rustup` los instala al compilar.
- **Stellar CLI** (`cargo install --locked stellar-cli`) y el plugin
  **Stellar Scaffold CLI** (`cargo install --locked stellar-scaffold-cli`).
  `npm start` verifica ambos y muestra cómo instalarlos si faltan.
- **Docker Desktop**, solo para la red `local` (contenedor Stellar Quickstart).
  Para Testnet no se necesita.
- **Node.js** v22 o superior y npm.
- **Git Bash** y **Strawberry Perl**: algunas dependencias Rust compilan OpenSSL
  desde fuente en Windows y necesitan `perl` y un shell POSIX en el PATH.
  Compila desde Git Bash.

## Correr en local

```bash
git clone https://github.com/EZunigaF/grano-de-origen.git
cd grano-de-origen
cp app/.env.example .env        # ver "Variables de entorno"
cp .env app/.env
npm install
cd app
npx vite
```

`npx vite` solo levanta la interfaz y usa el contrato ya desplegado en Testnet
(ver el ID arriba). El cliente del contrato se genera con el build de Scaffold
(ver "Despliegue a Testnet") y no se versiona; un clon nuevo debe generarlo
antes de que la app compile.

Evita `npm run dev` salvo que quieras desarrollar el contrato: ejecuta
`stellar scaffold watch --build-clients`, que compila y puede desplegar de nuevo
el contrato, lo que cambiaría su ID. Con `STELLAR_NETWORK=local` necesita Docker
Desktop encendido. Otros scripts (en `app/`): `npm run build`, `npm run lint`,
`npm run typecheck`.

## Despliegue a Testnet

`scaffold.yml` define la red `testnet` con la cuenta `testnet-user` (fondeada con
Friendbot en el primer build) y `allow-deploy: true`, y declara el contrato
`grano-de-origen` en las redes `local` y `testnet`.

1. Fijar `STELLAR_NETWORK=testnet` y los `PUBLIC_STELLAR_*` de Testnet en `.env`
   (raíz y `app/`).
2. Compilar, desplegar y generar el cliente (comando probado):

```bash
stellar-scaffold build --package grano-de-origen --build-clients --network testnet
```

   Crea y fondea `testnet-user` si no existe, y su clave queda en `.config/`
   (ignorado por git). El primer despliegue produjo el ID de arriba. Repetir el
   comando no está probado y podría crear otra instancia con otro ID.
3. Si el ID cambia, actualizarlo en este README y en `docs/DEMO.md`.
4. Cargar lotes de ejemplo:

```bash
export GRANO_CONTRACT_ID=CDTZKQAOMBPHRD7YK73ETWPJYDTVDM66DRBKQT375RHQSO7I7JZA6SI3
export GRANO_SOURCE=testnet-user
node scripts/seed-lots.mjs --dry-run   # revisar los comandos
node scripts/seed-lots.mjs
```

El script invoca `register_lot` con `stellar contract invoke` para tres lotes
(Tarrazú, Naranjo, Tres Ríos). Ya se ejecutó una vez contra el contrato de
arriba: los lotes 1 a 3 son de ejemplo. El lote 4 es una prueba de integración. Los lotes quedan a nombre de `testnet-user`, así
que desde el navegador solo se pueden transferir los lotes que registres con tu
propia billetera.

## Variables de entorno

La plantilla es `app/.env.example`. El Stellar CLI lee el `.env` de la raíz y
Vite el de `app/`, así que debe existir una copia en ambas carpetas. Solo
contiene configuración pública de red, sin secretos:

| Variable                            | Uso                                                |
| ----------------------------------- | -------------------------------------------------- |
| `STELLAR_NETWORK`                   | Red de `scaffold.yml` a construir y desplegar      |
| `XDG_CONFIG_HOME`                   | Carpeta de identidades del Stellar CLI (`.config`) |
| `PUBLIC_STELLAR_NETWORK`            | Red usada por el frontend                          |
| `PUBLIC_STELLAR_NETWORK_PASSPHRASE` | Passphrase de la red                               |
| `PUBLIC_STELLAR_RPC_URL`            | RPC de Soroban                                     |
| `PUBLIC_STELLAR_HORIZON_URL`        | Horizon                                            |

Para Testnet, descomenta el bloque `TESTNET` del archivo. Nunca subas `.env` ni
claves secretas: `.gitignore` excluye `.env`, `.env.*` (salvo `.env.example`) y
`.config`.

## Equipo

- **Wilson:** contrato Soroban.
- **Keylin:** frontend.
- **Andrès:** producto y pitch.

## Créditos y licencia

Creado a partir de la plantilla de
[Scaffold Stellar](https://github.com/stellar-scaffold/cli) (The Aha Company),
licenciada bajo Apache-2.0. Este repositorio conserva el archivo
[LICENSE](LICENSE) y se distribuye bajo la misma licencia.
