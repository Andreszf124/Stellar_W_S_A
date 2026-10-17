# Mascota Digital

Cuando alguien compra ropa o muebles físicos en una tienda, reclama la versión digital (prenda, accesorio o mueble) como un ítem en la red Stellar. Con esos ítems viste a su avatar y decora su hogar digital, y con tareas sube de nivel.

El marketplace es solo de vestimenta y muebles. Por ahora no hay comida.

- Repositorio: https://github.com/Andreszf124/Stellar_W_S_A (rama `mascota`)
- Sitio: https://stellar-w-s-a.vercel.app
- Red: Stellar Testnet (dinero de prueba, sin valor real)
- Equipo: Wilson, Keylin y Andrés

Es una versión beta. Lea la sección "Estado actual" para saber qué funciona y qué falta.

## Cómo funciona

1. La tienda registra una unidad de un producto. La app genera un código de un solo uso (por ejemplo `K7QM-2XWD-9PTA`) y en la red solo se guarda su huella sha256. El código nunca se guarda en la red.
2. La tienda entrega al comprador el número del ítem y el código, junto con el producto físico.
3. El comprador reclama revelando el código. Si coincide con la huella, el ítem queda a su nombre. Un ítem solo se puede reclamar una vez.
4. En su clóset ve los ítems que posee. Equipa prendas y accesorios a su avatar, y los muebles aparecen en su hogar digital.
5. Las tareas se marcan solas según lo que el usuario posee y lo que tiene equipado. Cada 50 puntos sube un nivel.

Tareas actuales: reclamar el primer ítem (50 puntos), equipar una prenda o accesorio (30), reclamar un mueble (40) y reunir 3 ítems (60).

Qué se guarda y dónde:

| Dato | Dónde |
| --- | --- |
| Ítems, dueño, categoría, huella del código | Contrato `closet` en Testnet |
| Qué tiene equipado el avatar | `localStorage` del navegador (no viaja entre dispositivos) |
| Puntos y nivel | Se calculan al momento con lo que el usuario posee y equipa |
| Arte de cada modelo | Catálogo fijo en `app/src/closet/catalog.ts` |

El catálogo de modelos es fijo porque el contrato guarda solo el nombre y la categoría del ítem. La app busca el dibujo comparando ese nombre con la lista (14 modelos: ropa, accesorios y muebles).

## Estado actual

| Existe hoy | Aún no |
| --- | --- |
| Contrato `closet` desplegado en Testnet | Marketplace con varias tiendas aliadas (solo existe la página `/tienda` para registrar unidades) |
| Registro de unidades con huella del código | Pago retenido con escrow (la plantilla trae Escrow Studio, pero requiere una clave de Trustless Work y no se usa) |
| Reclamo con código de un solo uso | Panel de administrador |
| Clóset, avatar humanoide y hogar digital | Base de datos (Supabase) |
| Equipar y quitar prendas | Inicio de sesión con correo (Cavos) |
| Tareas, puntos y niveles automáticos | Arte de mascota animal (hoy es un avatar humanoide) |
| Conexión con la billetera Freighter | Interfaz para transferir ítems (el contrato ya lo soporta) |

El contrato `reputation` (ID `CB5VHRXKO6CPFKSELKIHN3JJXMLQUDRCEBKDCCVRMZW7A534YLYIRK45`) viene de la plantilla y está desplegado, pero no forma parte del flujo de la mascota.

## Contrato `closet`

Código en `contracts/closet/`. Desplegado en Testnet:

```
CAQQRHJIBNWHDBBETYVT5JZI5D27SWQDYJKHRNY6QTX7RT2TYVYECTUO
```

| Función | Quién firma | Qué hace |
| --- | --- | --- |
| `register_item(store, name, category, claim_hash)` | La tienda | Registra una unidad y devuelve su número (empieza en 1). El nombre no puede estar vacío. |
| `claim_item(id, code, claimer)` | El comprador | Verifica que el sha256 del código coincida con la huella y asigna el ítem al comprador. |
| `transfer_item(id, new_owner)` | El dueño actual | Pasa un ítem ya reclamado a otra dirección. |
| `get_item(id)` | Nadie (lectura) | Devuelve el ítem. |
| `items_of(owner)` | Nadie (lectura) | Números de los ítems reclamados por una dirección. |
| `item_count()` | Nadie (lectura) | Total de unidades registradas. |

Categorías: `Clothing`, `Accessory`, `Furniture`.

Errores: `ItemNotFound` (1), `EmptyField` (2), `AlreadyClaimed` (3), `InvalidCode` (4), `NotClaimed` (5), `SameOwner` (6).

El ítem n.º 1 es de una prueba de integración, no de un producto real.

## Cómo probar la demo

Necesita la extensión Freighter instalada, configurada en Testnet y con una cuenta con XLM de prueba (se obtiene con Friendbot desde el propio Freighter o desde Stellar Lab). La app no maneja claves: toda firma pasa por Freighter.

1. Abra el sitio y conecte Freighter con el botón de la esquina superior derecha.
2. **Tienda** (`/tienda`): elija un producto del catálogo y pulse "Registrar unidad". Firme en Freighter. La pantalla muestra el número del ítem y el código. Cópielo: no se vuelve a mostrar.
3. **Reclamar** (`/reclamar`): escriba el número y el código y pulse "Reclamar ítem". Firme en Freighter. Para ver el reclamo como otro comprador, cambie de cuenta en Freighter antes de reclamar.
4. **Mi clóset** (`/closet`): el ítem aparece en la lista. Pulse "Equipar" en una prenda o accesorio para verlo en el avatar. Un mueble aparece solo en el hogar digital.
5. **Tareas** (`/tareas`): las tareas completadas se marcan solas y suben el nivel.

Casos que la app informa con un mensaje: código incorrecto, ítem ya reclamado y firma cancelada en la billetera.

## Arquitectura breve

```
contracts/closet/       Contrato Soroban (Rust): lib.rs, types.rs, error.rs, storage.rs, test.rs
contracts/reputation/   Contrato de la plantilla (no se usa en el flujo)
app/src/closet/         Catálogo, tareas, servicio del contrato, hook useCloset, avatar y hogar
app/src/pages/          Home, Closet, Claim, Tasks, Store (más Escrows y Debug de la plantilla)
app-lib/                Utilidades de red y billetera (Scaffold Stellar)
app-lib/clients/        Clientes TypeScript generados de los contratos, versionados en el repo
environments.toml       Contratos por entorno (desarrollo y staging apuntan a Testnet)
```

Rutas de la app:

| Ruta | Página |
| --- | --- |
| `/` | Inicio |
| `/closet` | Mi clóset y hogar |
| `/reclamar` | Reclamar un ítem |
| `/tareas` | Tareas y nivel |
| `/tienda` | Registrar unidades |
| `/escrows`, `/debug` | De la plantilla (Escrow Studio y explorador de contratos) |

App: React y Vite con Scaffold Stellar. Los clientes generados del contrato están en `app-lib/clients` y `app/.env.production` trae los valores públicos de Testnet (sin secretos). Por eso un clon compila y Vercel construye sin configurar nada.

## Cómo correrlo

Requisitos: Node 22 o superior, Rust (la versión se fija en `rust-toolchain.toml`) y Stellar CLI.

```bash
npm install --ignore-scripts
cd app
npx vite
```

Abra http://localhost:5173. Se usa `--ignore-scripts` porque un paquete de billeteras exige yarn en sus scripts de instalación.

Advertencias:

- `npm start` ejecuta `stellar scaffold watch --build-clients`, que compila y puede volver a desplegar los contratos en Testnet. Para solo ver la interfaz use `npx vite`.
- `npm run contracts:build` despliega los contratos en Testnet y regenera los clientes. Un despliegue nuevo cambia el ID del contrato y los ítems ya registrados no se trasladan.

## Pruebas

```bash
npm run contracts:test   # cargo test de los contratos
npm run typecheck
npm run lint
```

Verificado hasta ahora:

- Tests del contrato `closet`: 13 de 13 pasan.
- Prueba real contra Testnet: registrar una unidad, reclamo correcto, código incorrecto y reclamo doble.
- Typecheck, lint y build de la app.
- Un clon limpio del repositorio compila.

Pendiente de verificar: la interfaz en un navegador con Freighter (se está probando) y el aspecto visual.

## Créditos y licencia

Basado en [bitfalt/scaffold-stellar-agentic](https://github.com/bitfalt/scaffold-stellar-agentic) y en Scaffold Stellar de The Aha Company, licenciado bajo Apache License 2.0. Consulte los archivos [NOTICE](NOTICE) y [LICENSE](LICENSE) para las atribuciones y los términos completos.
