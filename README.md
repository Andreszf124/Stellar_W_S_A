# Mascota Digital

Tienda donde cada producto físico que se compra trae un ítem NFT en la red Stellar, con el que se viste un avatar. El diseño y las vistas vienen del prototipo "Nebula Wear" (`StellarAvatarStore`); la parte de Stellar usa billetera real y un contrato Soroban.

- Repositorio: https://github.com/Andreszf124/Stellar_W_S_A
- Red: Stellar Testnet (XLM de prueba, sin valor real)
- Equipo: Wilson, Keylin y Andrés

Es una versión beta. Lea "Limitaciones" antes de usarla.

## Cuatro vistas

| Ruta | Vista | Qué hace |
| --- | --- | --- |
| `/` | Tienda | Hero con su avatar, filtros (Gorros, Lentes, Prendas, Calzado, Accesorios, Hogar y Mascotas) y precios en XLM (Stellar Lumens). |
| `/avatar` | Mi avatar | Estudio: color de piel y cabello, guardarropa de ítems NFT por zona del cuerpo, su hogar con los accesorios de hogar, su mascota, equipar o quitar, descargar el SVG y actualizar desde la red. |
| `/pedidos` | Pedidos | Cada pedido con método de pago, dirección de envío, estado de envío (simulado) y estado del NFT; si hay billetera, aquí se reclama el NFT con el código del producto. |
| `/billetera` | Billetera | Saldo en XLM, dirección, cargar XLM de prueba, contrato de ítems y la explicación "Cómo funciona en Stellar". |

`/escrows` y `/debug` son de la plantilla y no están en el menú.

## Dos modos

**Modo demo (sin billetera).** Cualquiera puede recorrer todo el flujo sin conectar nada: comprar, ver el pedido y equipar el ítem. El pago es simulado, no se firma ni se mueve XLM, y el "NFT" es un ítem de prueba guardado solo en este navegador. Un banner muestra el flujo (Tienda → Pedidos → Mi avatar → Billetera). En Billetera hay un botón para reiniciar la demo.

**Con billetera (Stellar real).** Al conectar una billetera (Freighter, xBull, Lobstr o la billetera con correo de Cavos) la tienda lee las unidades disponibles del contrato `closet`, el pago en XLM se firma en la billetera y el NFT se reclama con el código.

## Cómo funciona con billetera

1. Una tienda registra una unidad en el contrato `closet` con la huella (sha256) de un código de un solo uso. El código nunca va a la red.
2. El comprador elige un producto y paga en **XLM** (Stellar Lumens), un pago directo firmado por su billetera con comisión menor a 0.00001 XLM. USDC en Stellar aparece como "próximamente". La única moneda es XLM.
3. Indica nombre y dirección de envío (se guardan solo en este navegador).
4. La tienda entrega el código junto con el producto. En Pedidos, el comprador lo escribe y firma el reclamo; el contrato comprueba la huella y el ítem queda a su nombre.
5. En Mi avatar ve el ítem y lo equipa.

La app nunca ve una llave secreta: toda firma pasa por `useWallet().signTransaction`.

| Dato | Dónde |
| --- | --- |
| Unidades, dueño, categoría, huella del código | Contrato `closet` en Testnet |
| Pagos en XLM | Red Stellar (Testnet) |
| Pedidos, dirección de envío, ropa equipada, color de piel y cabello | `localStorage` del navegador |
| Ítems y pedidos del modo demo | `localStorage` del navegador |
| Productos (ropa, accesorios y hogar), mascotas, precios en XLM y dibujos | Catálogo fijo en `app/src/closet/catalog.ts` y `pets.tsx` |

## Contrato `closet`

Código en `contracts/closet/`. Desplegado en Testnet: `CAQQRHJIBNWHDBBETYVT5JZI5D27SWQDYJKHRNY6QTX7RT2TYVYECTUO`.

| Función | Quién firma | Qué hace |
| --- | --- | --- |
| `register_item(store, name, category, claim_hash)` | La tienda | Registra una unidad y devuelve su número. |
| `claim_item(id, code, claimer)` | El comprador | Verifica la huella y asigna el ítem al comprador. |
| `transfer_item(id, new_owner)` | El dueño | Pasa un ítem reclamado a otra dirección (sin pantalla todavía). |
| `get_item`, `items_of`, `item_count` | Nadie (lectura) | Lecturas. |

Errores: `ItemNotFound` (1), `EmptyField` (2), `AlreadyClaimed` (3), `InvalidCode` (4), `NotClaimed` (5), `SameOwner` (6). Hay 100 unidades de prueba sembradas con `scripts/seed-products.mjs` (cada una con su código en un CSV local del equipo, fuera del repositorio).

## Limitaciones (leer antes de usar)

- **La interfaz ya no tiene pantalla para que una tienda registre unidades.** Se pueden registrar con `scripts/seed-products.mjs` o llamando al contrato; las unidades sembradas son las que se ven en la tienda.
- **El envío es simulado.** El estado se calcula con el tiempo desde el pedido. Las mascotas no se envían: se pagan en XLM a la cuenta de la plataforma (`PUBLIC_PLATFORM_ADDRESS`) y se guardan en este navegador.
- **El modo demo no toca la red.** Sus ítems no son NFT reales.
- **Todos los precios están en XLM.** No hay tipo de cambio ni tarjeta.
- El pago en XLM es directo: no hay pago retenido (escrow) ni devoluciones.
- El prototipo original (`StellarAvatarStore`) minaba un activo por compra con llaves guardadas en el navegador. Aquí no se hace: contradice la regla de no manejar llaves.
- Sin verificar por nadie: el flujo con una billetera real de punta a punta y el aspecto a 390 px.

## Estructura

```
contracts/closet/        Contrato Soroban (Rust) y sus tests
app/src/nebula.css       Estilos de las cuatro vistas (de StellarAvatarStore/css/styles.css)
app/src/pages/           Shop, AvatarStudio, Orders, Wallet (más Escrows y Debug de la plantilla)
app/src/closet/          Catálogo y precios (catalog, pets, money, Price), pago (PayDialog, payment,
                         ProductCheckout, orders), modo demo (demo), contrato (closetService), avatar (avatarArt)
app-lib/                 Red y billetera (Scaffold Stellar); styles.css trae los colores
app-lib/clients/         Clientes TypeScript generados del contrato, versionados en el repo
```

## Cómo correrlo

Requisitos: Node 22 o superior, Rust (versión en `rust-toolchain.toml`) y Stellar CLI.

```bash
npm install --ignore-scripts
cd app
npx vite
```

Abra http://localhost:5173. `npm start` también compila y puede volver a desplegar contratos en Testnet; para solo ver la interfaz use `npx vite`.

## Pruebas

```bash
npm run contracts:test   # cargo test del contrato
npm run typecheck
npm run lint
npm run build
```

## Créditos y licencia

Basado en [bitfalt/scaffold-stellar-agentic](https://github.com/bitfalt/scaffold-stellar-agentic) y en Scaffold Stellar de The Aha Company, licenciado bajo Apache License 2.0. Vea [NOTICE](NOTICE) y [LICENSE](LICENSE).
