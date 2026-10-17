# Guion de demostración (5 minutos)

Proyecto: Mascota Digital (nombre de trabajo). App beta sobre Stellar Testnet.
Equipo: Wilson, Keylin y Andrés.

Sitio: https://stellar-w-s-a.vercel.app

## Checklist previo (1 minuto)

- [ ] Freighter instalado, en red **Testnet** y con fondos. Si no tiene, usar Friendbot: `https://friendbot.stellar.org/?addr=DIRECCION` (Freighter también lo ofrece).
- [ ] Sitio abierto en una pestaña: https://stellar-w-s-a.vercel.app
- [ ] Billetera conectada en el sitio (se pide al entrar a Tienda, Reclamar, Clóset o Tareas).
- [ ] Una segunda pestaña lista en `/tienda`.
- [ ] Plan B listo: en el PC, carpeta `scaffold-stellar-agentic\app`, comando `npx vite`, abrir http://localhost:5173.
- [ ] Saber de antemano qué producto se va a registrar (sugerido: una prenda, por ejemplo "Chaqueta de mezclilla", y después un mueble, por ejemplo "Lámpara de mesa").

Nota: el ítem n.º 1 del contrato es de una prueba anterior; las 100 unidades sembradas (20 tipos x 5) son las siguientes. Para reclamar sirve el código de una unidad nueva registrada en `/tienda` (el código se muestra una sola vez) o uno de los códigos sembrados del CSV local `scripts/out/` (lo tiene el equipo; no está en el repo). Use el número que muestre la pantalla.

La interfaz con Freighter y su aspecto a 390 px y 1280 px se están ensayando: ensayar el guion completo antes de presentar.

## Guion con tiempos

### 0:00 - 0:45 Problema

Decir:
- "Compramos ropa y muebles reales, pero esa compra no deja nada en el mundo digital."
- "Las tiendas no tienen forma simple de darle al comprador una versión digital de lo que vendió."
- "Queremos que comprar un producto físico también te dé su versión digital, verificable y tuya."

### 0:45 - 1:30 Solución

Decir:
- "Cuando compra una prenda o un mueble, el comprador reclama su versión digital."
- "Ese ítem queda a su nombre en la red Stellar y lo usa en su avatar y en su hogar digital."
- "Con tareas el avatar sube de nivel."
- "Por ahora solo vestimenta y muebles."

### 1:30 - 4:15 Demostración en vivo

Paso 1, Tienda (1:30 - 2:15). Ir a **Tienda** (`/tienda`).
1. En "Producto", elegir un artículo del catálogo.
2. Pulsar **Registrar unidad**.
3. Firmar en Freighter. Dice "Esperando su firma..." mientras tanto.
4. Aparece "Unidad registrada" con el **ítem n.º** y el **código**. Pulsar **Copiar código**.

Decir: "La tienda registra una unidad. En la red solo queda la huella del código; el código se muestra una sola vez."

Paso 2, Reclamar (2:15 - 3:00). Ir a **Reclamar** (`/reclamar`).
1. En "Número del ítem", escribir el número que mostró la tienda.
2. En "Código del producto", pegar el código.
3. Pulsar **Reclamar ítem** y firmar en Freighter.
4. Aparece "Listo, el ítem n.º X ya es suyo".

Decir: "El comprador revela el código, el contrato comprueba la huella y el ítem pasa a su nombre."

Paso 3, Mi clóset (3:00 - 3:30). Ir a **Mi clóset** (`/closet`).
1. En "Sus ítems" pulsar **Equipar** en la prenda reclamada; el avatar se la pone.
2. Si se reclamó un mueble, mostrarlo en "Su hogar digital".

Decir: "Las prendas se equipan en el avatar y los muebles aparecen en el hogar."

Paso 4, Tareas (3:30 - 3:45). Ir a **Tareas** (`/tareas`).
1. Mostrar las tareas completadas y el nivel.

Decir: "Las tareas se marcan solas según lo que posee y equipa. No se hace clic para completarlas."

Paso 5, Productos (3:45 - 4:00). Ir a **Productos** (`/productos`).
1. Filtrar por categoría o por estado (Disponible / Reclamado) y mostrar que la unidad reclamada figura como Reclamado.

Decir: "Cualquiera puede ver las unidades registradas en la red y si ya fueron reclamadas."

Paso 6, Mascotas (4:00 - 4:15). Ir a **Mascotas** (`/mascotas`).
1. Elegir una de las 6 mascotas (perro, gato, conejo, zorro, panda, pájaro).

Decir: "Es una beta: la mascota se elige y se guarda en el navegador, pero la ropa todavía se equipa en el avatar humano."

Referencia de tareas (del código): reclamar el primer ítem (50 puntos), equipar una prenda o accesorio (30), reclamar un mueble (40), reunir 3 ítems (60). Un nivel cada 50 puntos.

### 4:15 - 5:00 Visión y próximos pasos

Decir:
- "Hoy está probado de punta a punta en Testnet: registrar, reclamar, equipar y subir de nivel."
- "Lo siguiente: varias tiendas aliadas, etiqueta NFC en el empaque en vez de escribir el código, mascota que se vista y suba de nivel, y una interfaz para regalar o transferir ítems."
- "Es una beta. Estamos validando con 3 a 5 tiendas piloto."
- Cierre: "Comprar algo real y tener su versión digital, a su nombre."

## Si algo falla

| Situación | Qué hacer |
| --- | --- |
| La firma tarda | En Testnet puede tardar unos segundos. Seguir hablando de lo que se está haciendo y no pulsar dos veces. |
| Freighter no sale o no firma | Revisar que esté en Testnet y desbloqueado; reintentar una vez. |
| Se perdió el código | Usar otro de los códigos sembrados del CSV local, o registrar una unidad nueva en `/tienda`. |
| Sin fondos | Friendbot: `https://friendbot.stellar.org/?addr=DIRECCION`. |
| Error al reclamar | Revisar número y código (el código distingue lo escrito; copiarlo con el botón evita errores). Un código solo sirve una vez. |
| El sitio no carga o sigue fallando | Pasar al plan B: `npx vite` en `scaffold-stellar-agentic\app` y abrir http://localhost:5173. |
| Todo falla | Contar el flujo con las pantallas y decir con franqueza que es una beta en pruebas. El contrato ya fue probado de punta a punta con un script y tiene 13 tests. |

## Qué NO decir

- No decir que hay un marketplace con varias tiendas: hoy solo existe una página `/tienda` para registrar unidades.
- No decir que hay pago retenido (escrow).
- No decir que hay panel de administrador. La base (Supabase) solo guarda un directorio de tiendas de solo lectura con 3 tiendas de EJEMPLO: no decir que son tiendas aliadas reales ni que se guarda progreso o datos de usuario.
- No decir que hay inicio de sesión con correo o Google: se usa Freighter.
- No decir que hay etiqueta NFC: hoy el reclamo es por código escrito.
- No decir que ya se pueden transferir ítems desde la interfaz (el contrato lo permite, la pantalla aún no).
- No decir que la mascota se viste o sube de nivel: las 6 mascotas solo se eligen (beta); la ropa va en el avatar humano.
- No decir que la interfaz ya fue verificada en navegador con Freighter ni a 390 px y 1280 px: se está ensayando.
- No presentar los ítems como inversión ni prometer ganancias.
- No inventar cifras de ventas, usuarios ni ingresos.
- Decir siempre "beta" y "Testnet" (dinero de prueba).

## Datos de referencia

- Contrato `closet` en Testnet: `CAQQRHJIBNWHDBBETYVT5JZI5D27SWQDYJKHRNY6QTX7RT2TYVYECTUO`
- 13 tests del contrato; probado de punta a punta contra Testnet con un script.
- Catálogo fijo de 20 tipos de producto: ropa, accesorios y muebles.
- 100 unidades de prueba sembradas (20 tipos x 5), cada una con su código; los códigos están en un CSV local del equipo.
- CI: contrato (formato, tests, clippy, wasm) y app (lint, tipos, build).
