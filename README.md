# Mascota Digital

Cuando alguien compra ropa o muebles físicos en un negocio, paga en XLM y reclama la versión digital (prenda, accesorio o mueble) como un ítem en la red Stellar. Con esos ítems viste a su avatar y decora su hogar digital, y con misiones desbloquea más productos.

El marketplace es solo de vestimenta y muebles. Por ahora no hay comida.

- Repositorio: https://github.com/Andreszf124/Stellar_W_S_A (rama `mascota`)
- Sitio: https://stellar-w-s-a.vercel.app
- Red: Stellar Testnet (XLM de prueba, sin valor real). Todos los precios están en XLM.
- Equipo: Wilson, Keylin y Andrés

Es una versión beta. Lea la sección "Estado actual" para saber qué funciona y qué falta.

## Cómo funciona

1. El negocio registra una unidad de un producto en `/tienda` ("Mi negocio"). La app genera un código de un solo uso (por ejemplo `K7QM-2XWD-9PTA`) y en la red solo se guarda su huella sha256. El código nunca se guarda en la red.
2. El comprador paga en XLM desde `/comprar` y firma en su billetera. La app nunca ve sus claves. Cada compra queda en `/pedidos`.
3. El negocio entrega al comprador el número del ítem y el código, junto con el producto físico. El código lo entrega el negocio: la app no lo envía.
4. El comprador reclama revelando el código en `/reclamar`. Si coincide con la huella, el ítem queda a su nombre. Un ítem solo se puede reclamar una vez.
5. En `/closet` ve los ítems que posee y equipa prendas y accesorios a su avatar. Los muebles aparecen en su hogar digital (`/hogar`).
6. Cada negocio puede crear productos propios, un perfil con su historia y misiones. Una misión desbloquea un producto específico del negocio cuando el usuario cumple un requisito (por ejemplo, reclamar 3 ítems de ese negocio). El avance se ve en `/tareas` (Misiones).
7. Las mascotas (`/mascotas`) llevan precio en XLM y se pagan a la cuenta de la plataforma.

Qué se guarda y dónde:

| Dato | Dónde |
| --- | --- |
| Ítems, dueño, categoría, huella del código | Contrato `closet` en Testnet |
| Pagos en XLM | Red Stellar (Testnet), pago directo firmado por el comprador |
| Productos propios de cada negocio | Tabla `products` de Supabase |
| Misiones de cada negocio | Tabla `missions` de Supabase |
| Perfil de cada negocio (historia, ciudad, etc.) | Tabla `business_profiles` de Supabase |
| Directorio de negocios de ejemplo (3) | Tabla `stores` de Supabase |
| Qué tiene equipado el avatar | `localStorage` del navegador (no viaja entre dispositivos) |
| Avance de las misiones | Se calcula al momento con lo que el usuario posee y equipa |
| Arte de cada modelo base y su precio en XLM | Catálogo fijo en `app/src/closet/catalog.ts` |
| Mascota elegida | `localStorage` del navegador |

El contrato guarda solo el nombre y la categoría del ítem. La app busca el dibujo y el precio comparando ese nombre con el catálogo base (20 tipos de producto: 8 de ropa, 5 accesorios y 7 muebles) y con los productos que crearon los negocios en Supabase.

### Base de datos (Supabase)

La migración `supabase/migrations/20261017120000_products_missions_profiles.sql` crea las tablas `business_profiles`, `products` y `missions` y agrega la columna `story` a `stores`. Para aplicarla:

1. Abra su proyecto en Supabase.
2. Vaya a **SQL Editor** > **New query**.
3. Pegue todo el contenido del archivo y pulse **Run**. Se puede correr varias veces sin daño.

Hasta que se aplique, la app sigue funcionando con el catálogo base y avisa que faltan las tablas de productos, misiones y perfiles.

### Limitaciones (leer antes de usar)

- **El bloqueo por misiones se verifica en la app, no en la red.** El contrato `closet` no sabe de misiones: la pantalla no deja comprar un producto bloqueado, pero quien hable directo con la red puede saltárselo.
- **El panel de negocio (`/tienda`) también se verifica solo en la app.** No hay inicio de sesión: la app confía en la dirección de la billetera conectada.
- **Las altas en Supabase son abiertas.** Con la clave pública cualquiera puede crear un producto, una misión o un perfil a nombre de otra dirección Stellar (no hay políticas de actualizar ni borrar). Por eso solo sirve para una demo en Testnet. Para producción hay que firmar cada alta con la billetera y validarla en un servidor.
- **El código de reclamo lo entrega el negocio.** La app lo muestra una sola vez al registrar la unidad; si se pierde, hay que registrar otra unidad.
- El pago en XLM es un pago directo: no hay pago retenido (escrow) ni devoluciones.

## Estado actual

| Existe hoy | Aún no |
| --- | --- |
| Contrato `closet` desplegado en Testnet | Verificación de misiones y de dueño de negocio en la red (hoy solo en la app) |
| Registro de unidades con huella del código | Inicio de sesión: las altas en Supabase son abiertas (solo demo) |
| Compra en XLM con pedidos y billetera | Pago retenido con escrow (la plantilla trae Escrow Studio, pero requiere una clave de Trustless Work y no se usa) |
| Reclamo con código de un solo uso | Entrega automática del código al comprador |
| Clóset, avatar humanoide y hogar digital | Inicio de sesión con correo (Cavos) |
| Productos, perfil con historia y misiones por negocio (Supabase) | Mascota que se vista o suba de nivel por separado (hoy la ropa va en el avatar humano) |
| Mascotas con precio en XLM | Interfaz para transferir ítems (el contrato ya lo soporta) |
| Catálogo base de 20 tipos de producto con precio en XLM | Etiqueta NFC en el empaque |
| 100 unidades de prueba sembradas en Testnet (20 tipos x 5) | |
| Lista de negocios y perfil de cada uno | |
| Portada con cifras en vivo, catálogo, sección para negocios y preguntas frecuentes | |
| Diseño visual nuevo (paleta cálida, contrastes AA medidos) | |
| CI: contrato (formato, tests, clippy, wasm) y app (lint, tipos, build) | |

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

El ítem n.º 1 es de una prueba de integración, no de un producto real. Los ítems siguientes son 100 unidades de prueba sembradas con `scripts/seed-products.mjs`: 20 tipos de producto x 5 unidades, cada una con su propio código de un solo uso. Los códigos no están en el repositorio: quedan en un CSV local en `scripts/out/` (ignorado por git) y los tiene el equipo.

## Mascotas, productos y negocios (beta)

- `/mascotas`: 6 mascotas para elegir (perro, gato, conejo, zorro, panda y pájaro), cada una con su precio en XLM que se paga a la cuenta de la plataforma. Es una beta: la ropa y los accesorios se siguen equipando en el avatar humano; las mascotas todavía no se visten ni suben de nivel por separado.
- `/productos`: explora las unidades registradas en el contrato, con filtros por categoría, estado (Disponible o Reclamado) y búsqueda por nombre. Ya no está en el menú, pero la ruta sigue.
- `/tiendas` y `/tiendas/:ref`: lista de negocios y el perfil de cada uno (historia, ciudad, productos y misiones). El directorio trae 3 negocios de EJEMPLO; los demás los crean los propios negocios desde Mi negocio.
- `/tienda` (Mi negocio): registrar unidades y crear productos, el perfil con historia y misiones.

## Cómo probar la demo

Necesita la extensión Freighter instalada, configurada en Testnet y con una cuenta con XLM de prueba (se obtiene con Friendbot desde el propio Freighter o desde Stellar Lab). La app no maneja claves: toda firma pasa por Freighter.

1. Abra el sitio y conecte Freighter con el botón de la esquina superior derecha.
2. **Mi negocio** (`/tienda`): elija un producto y pulse "Registrar unidad". Firme en Freighter. La pantalla muestra el número del ítem y el código. Cópielo: no se vuelve a mostrar. Aquí también puede crear productos, su perfil y misiones.
3. **Comprar** (`/comprar`): elija un producto, pague en XLM y firme. Revise el pago en **Pedidos** (`/pedidos`) y su saldo en **Billetera** (`/billetera`).
4. **Reclamar** (`/reclamar`): escriba el número y el código y pulse "Reclamar ítem". Firme en Freighter. Para ver el reclamo como otro comprador, cambie de cuenta en Freighter antes de reclamar.
5. **Mi clóset** (`/closet`) y **Mi hogar** (`/hogar`): el ítem aparece en la lista. Pulse "Equipar" en una prenda o accesorio para verlo en el avatar. Un mueble aparece en el hogar digital.
6. **Misiones** (`/tareas`): vea el avance y los productos que se desbloquean.
7. **Negocios** (`/tiendas`) y **Mascotas** (`/mascotas`): explore los negocios y sus perfiles, y elija una mascota.

Para reclamar puede usar el código de una unidad que usted registre en `/tienda`, o uno de los códigos sembrados (los tiene el equipo).

Casos que la app informa con un mensaje: código incorrecto, ítem ya reclamado y firma cancelada en la billetera.

## Arquitectura breve

```
contracts/closet/       Contrato Soroban (Rust): lib.rs, types.rs, error.rs, storage.rs, test.rs
contracts/reputation/   Contrato de la plantilla (no se usa en el flujo)
supabase/migrations/    SQL de las tablas (negocios, productos, misiones)
app/src/closet/         Catálogo y precios (catalog, money), pagos (payment, PayDialog, orders), productos, misiones y negocios (useProducts, useMissions, useBusinesses), servicio del contrato, avatar y hogar
app/src/lib/supabase.ts Cliente y tipos de Supabase
app/src/pages/          Home, Shop, Orders, Wallet, Closet, Hogar, Pets, Tasks, Claim, Stores, StoreProfile, Store, Explore (más Escrows y Debug de la plantilla)
app-lib/                Utilidades de red y billetera (Scaffold Stellar)
app-lib/clients/        Clientes TypeScript generados de los contratos, versionados en el repo
environments.toml       Contratos por entorno (desarrollo y staging apuntan a Testnet)
```

Rutas de la app:

| Ruta | Página | En el menú |
| --- | --- | --- |
| `/` | Inicio (cifras en vivo, catálogo con precios en XLM, negocios, preguntas frecuentes) | Logo |
| `/comprar` | Comprar con XLM | Sí |
| `/closet` | Mi clóset y avatar | Sí |
| `/hogar` | Mi hogar digital | Sí |
| `/mascotas` | Elegir y pagar una mascota (beta) | Sí |
| `/tareas` | Misiones y nivel | Sí |
| `/reclamar` | Reclamar un ítem con su código | Sí |
| `/tiendas` | Lista de negocios | Sí (Negocios) |
| `/tiendas/:ref` | Perfil de un negocio (`ref` = dirección o id del directorio) | No |
| `/tienda` | Mi negocio: registrar unidades, productos, perfil y misiones | Sí |
| `/pedidos` | Mis pedidos | Sí (cuenta) |
| `/billetera` | Mi billetera | Sí (cuenta) |
| `/productos` | Explorar unidades registradas | No |
| `/escrows`, `/debug` | De la plantilla (Escrow Studio y explorador de contratos) | No |

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

CI en GitHub: contrato (formato, tests, clippy, wasm) y app (lint, tipos, build).

Sin verificar por nadie: la interfaz en un navegador con Freighter, el flujo de compra en XLM, las misiones y el panel de negocio de punta a punta, y cómo se ve a 360 px, 390 px y 1280 px. Se está ensayando.

## Créditos y licencia

Basado en [bitfalt/scaffold-stellar-agentic](https://github.com/bitfalt/scaffold-stellar-agentic) y en Scaffold Stellar de The Aha Company, licenciado bajo Apache License 2.0. Consulte los archivos [NOTICE](NOTICE) y [LICENSE](LICENSE) para las atribuciones y los términos completos.
