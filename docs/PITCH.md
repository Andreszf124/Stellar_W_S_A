# Pitch: Mascota Digital

Nombre de trabajo. Beta en Stellar Testnet. Equipo: Wilson, Keylin y Andrés.

## El problema y por qué importa

Una persona compra una camiseta o una lámpara en una tienda y la transacción termina ahí. La tienda no tiene un vínculo digital con lo que vendió, y el comprador no recibe nada que pueda usar en su mundo digital. Además, un código o un recibo en papel no prueban quién es el dueño de algo ni se pueden verificar por terceros.

Importa porque la compra física ya ocurre; falta una capa que la conecte con experiencias digitales sin que el comprador tenga que hacer algo complicado.

## El usuario

- Comprador: quien compra ropa o muebles y quiere su versión digital para su avatar y su hogar digital.
- Tienda: quien vende productos físicos y quiere ofrecer algo extra con cada venta.

## La solución

Al comprar una prenda, un accesorio o un mueble en una tienda, el comprador reclama la versión digital como ítem en la red Stellar. Con ese ítem viste a su avatar y decora su hogar digital. Con tareas, el avatar mejora y sube de nivel. Por ahora solo vestimenta y muebles, sin comida.

Flujo que funciona hoy:
1. La tienda registra una unidad y recibe un código de un solo uso.
2. El comprador ingresa el número del ítem y el código para reclamarlo.
3. El ítem queda a su nombre.
4. En Mi clóset equipa prendas y ve su hogar con muebles.
5. Las tareas se marcan solas según lo que posee y equipa; el nivel sube por puntos.

## Cómo se usa Stellar

- Propiedad verificable: el contrato `closet` guarda quién es el dueño de cada ítem; cualquiera puede consultarlo. El contrato también permite transferir un ítem (la interfaz para hacerlo aún no existe).
- Huella del código: en la red solo se guarda el sha256 del código de un solo uso. Al reclamar, el comprador revela el código y el contrato comprueba que coincida. Leer la red no basta para reclamar un ítem.
- Contrato en Testnet: `CAQQRHJIBNWHDBBETYVT5JZI5D27SWQDYJKHRNY6QTX7RT2TYVYECTUO`. Tiene 13 tests y fue probado de punta a punta contra Testnet con un script.
- Cada registro y cada reclamo los firma la persona con su billetera (Freighter).

## Modelo de negocio (hipótesis a validar)

Nada de esto está validado ni tiene cifras. Son opciones a probar con tiendas piloto:

- Comisión por venta a la tienda.
- Plan mensual para tiendas.
- Ítems digitales especiales o colecciones limitadas.
- Regalías en la reventa entre usuarios.
- Marcas que patrocinan tareas o colecciones.
- Venta de etiquetas NFC o QR.

Referencia verificable: Trustless Work cobra 0,3% por liberar un pago (dato de las notas del taller). Sirve solo como punto de comparación de cómo se cobra en esta red; no es nuestro modelo.

## Riesgos

- Arranque de dos lados: sin tiendas no hay ítems, y sin compradores las tiendas no se interesan. Mitigación a probar: piloto con 3 a 5 tiendas.
- Legal en Costa Rica: protección de datos (Ley 8968), derechos del consumidor (Ley 7472) y facturación digital. Hay que validarlo con un abogado.
- Menores de edad: el público de avatares y mascotas puede incluirlos; requiere criterio propio.
- No presentar los ítems como inversión: son artículos de uso, no un producto financiero.
- Es una beta en Testnet: el dinero es de prueba y la interfaz se sigue ensayando con la billetera.

## Próximos pasos

Corto plazo:
- Ensayar la interfaz de punta a punta con Freighter y pulir lo que falle.
- Conseguir 3 a 5 tiendas piloto.
- Interfaz para transferir ítems (el contrato ya lo permite).

Mediano plazo:
- Marketplace con varias tiendas aliadas.
- Etiqueta NFC en el empaque para reclamar sin escribir el código.
- Mascota con arte animal en lugar del avatar humanoide.
- Inicio de sesión con correo o Google para quien no tiene billetera.
- Base de datos y panel de administrador.

Largo plazo:
- Pago retenido con escrow ligado a la entrega del producto.
- Colecciones limitadas y tareas patrocinadas por marcas.
- Validar el modelo de negocio y el marco legal antes de abrir a más público.

## Existe hoy / Aún no

| Existe hoy | Aún no |
| --- | --- |
| Contrato `closet` en Testnet (13 tests) | Marketplace con varias tiendas aliadas |
| Página Tienda: registrar una unidad y obtener código de un solo uso | Pago retenido con escrow |
| Solo la huella sha256 del código queda en la red | Panel de administrador |
| Reclamar un ítem con número y código | Base de datos |
| Ítem a nombre del comprador | Inicio de sesión con correo o Google |
| Mi clóset: equipar prendas y accesorios en el avatar | Mascota con arte animal (hoy avatar humanoide) |
| Hogar digital con muebles | Interfaz para transferir ítems (el contrato sí lo permite) |
| Tareas que se marcan solas y nivel por puntos | Etiqueta NFC en el empaque (hoy el reclamo es por código escrito) |
| Catálogo fijo de 13 productos (ropa, accesorios, muebles) | Comida u otras categorías |
| Prueba de punta a punta contra Testnet con un script | Prueba de la interfaz con Freighter terminada (se está ensayando) |
