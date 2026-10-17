# Guion de demostración (4 minutos)

Proyecto: Mascota Digital. App beta sobre Stellar Testnet, con el diseño de
Nebula Wear.

## Antes de empezar

- [ ] `cd app && npx vite` y abrir http://localhost:5173 (o el sitio publicado).
- [ ] Para la parte con Stellar real: Freighter instalado, en **Testnet**, con
      XLM de prueba (Friendbot).
- [ ] Un código de una unidad sembrada (los tiene el equipo en un CSV local)
      para el reclamo.

## Parte 1: modo demo, sin billetera (2 minutos)

Decir: "Cualquiera puede probar el flujo sin instalar nada. Es una demo: el pago
es simulado."

1. **Tienda** (`/`): el banner muestra el flujo Tienda → Pedidos → Mi avatar →
   Billetera. Mostrar los filtros (incluidos Hogar y Mascotas) y los precios en
   XLM.
2. Pulsar **Comprar y recibir NFT** en un producto. A la izquierda se ve el
   avatar probándose el producto.
3. Pagar con **XLM** (simulado), escribir nombre y dirección (las mascotas no
   piden envío). Mostrar los pasos y el recibo.
4. **Pedidos** (`/pedidos`): el pedido con método, dirección y estado de envío
   simulado.
5. **Mi avatar** (`/avatar`): el ítem llegó al instante; equiparlo, cambiar piel
   y cabello, descargar el SVG.

## Parte 2: con billetera, Stellar real (2 minutos)

Decir: "Al conectar una billetera, el pago se firma en ella y el ítem es del
contrato en Stellar."

1. Conectar la billetera con el botón de arriba a la derecha. El saldo aparece
   como chip y el banner de demo desaparece.
2. **Tienda**: ahora se ve el stock real leído del contrato. Comprar con
   **XLM**: la billetera pide la firma, el recibo trae el enlace de la
   transacción en stellar.expert.
3. **Pedidos**: el pedido queda "NFT por reclamar". Escribir el código del
   producto y pulsar **Reclamar mi NFT** (firma en la billetera). Pasa a "NFT
   reclamado".
4. **Mi avatar**: el ítem aparece en el guardarropa; equiparlo.
5. **Billetera**: saldo en XLM, dirección, contrato de ítems y "Cómo funciona en
   Stellar".

## Si algo falla

| Situación                     | Qué hacer                                                                          |
| ----------------------------- | ---------------------------------------------------------------------------------- |
| La firma tarda                | En Testnet puede tardar unos segundos. No pulsar dos veces.                        |
| La billetera no sale          | Revisar que esté en Testnet y desbloqueada.                                        |
| Sin fondos                    | Botón "+ XLM de prueba" en Billetera, o Friendbot.                                 |
| Código incorrecto al reclamar | Copiarlo de nuevo; solo sirve una vez por unidad.                                  |
| No hay stock en la tienda     | Las unidades sembradas se agotaron: registrar más con `scripts/seed-products.mjs`. |
| Todo falla                    | Pasar al modo demo (desconectar la billetera) y contar el flujo con él.            |

## Qué NO decir

- No decir que el envío es real: es simulado. La única moneda es XLM.
- No decir que el modo demo crea NFT en Stellar: son ítems locales de este
  navegador.
- No decir que hay pago retenido (escrow) ni devoluciones: el pago en XLM es
  directo.
- No decir que la app entrega el código de reclamo: lo entrega la tienda con el
  producto.
- No decir que ya está verificado con una billetera real de punta a punta ni a
  390 px.
- No presentar los ítems como inversión ni inventar cifras de ventas o usuarios.
- Decir siempre "beta" y "Testnet" (dinero de prueba).

## Datos de referencia

- Contrato `closet` en Testnet:
  `CAQQRHJIBNWHDBBETYVT5JZI5D27SWQDYJKHRNY6QTX7RT2TYVYECTUO`
- Catálogo fijo: 13 productos que se visten en el avatar, con precio en XLM, más
  6 mascotas.
