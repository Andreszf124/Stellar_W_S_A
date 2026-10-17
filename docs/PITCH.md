# Pitch de Grano de Origen

Material para la demo del TicoChallenge. Lo que dice "existe hoy" está construido y
verificado. Lo que dice "visión" todavía no está construido.

## 1. El problema

Los pequeños productores de café no tienen cómo demostrar el origen y el recorrido de
su grano. Sin ese historial, les cuesta acceder a mejores precios y a crédito (texto
del TicoChallenge, reto 02).

Frase para el pitch: "Hoy un comprador no puede comprobar de qué finca viene un café,
cuándo se cosechó ni cómo se procesó, y el productor no tiene cómo demostrarlo."

Pendiente de completar por el equipo: una o dos cifras reales del sector (por ejemplo,
de ICAFE o de una cooperativa) con su fuente. No usar números sin fuente.

## 2. El reto y el usuario

- Reto elegido: **Grano de Origen** (tokenización de activos reales).
- Usuarios:
  - Productor: registra sus lotes y los entrega a un comprador.
  - Comprador o tostador: verifica el origen antes de comprar.
  - Consumidor final: escanea un QR y ve de dónde viene su café.
- Una persona de ejemplo para contar en la demo (inventada, decirlo así): "Una
  productora de Tarrazú que vende su cosecha a un tostador y quiere que su finca
  quede registrada con su nombre."

## 3. La solución (existe hoy)

1. El productor conecta su billetera y registra un lote: finca, cosecha y proceso.
2. El lote queda grabado en Stellar y nadie puede cambiarlo ni borrarlo.
3. Cualquiera consulta el lote por número o por QR, sin cuenta ni billetera.
4. El productor transfiere el lote al comprador, y queda el nuevo dueño.

Contrato desplegado en Testnet:
`CDTZKQAOMBPHRD7YK73ETWPJYDTVDM66DRBKQT375RHQSO7I7JZA6SI3`

## 4. La visión de crecimiento (no existe todavía)

**Marketplace de productos físicos de emprendedores y artistas, con una mascota digital.**

- Cada compra genera un NFT: la mascota digital del comprador.
- Mientras llega el pedido, la mascota "crece" con los hitos del envío (preparación,
  despacho, entrega) y le va contando la historia del negocio: la finca, el taller o
  el artista.
- Una etiqueta NFC en el empaque abre, al tocarla con el teléfono, la página del lote
  o del NFT y verifica que el producto es auténtico.
- El pago puede quedar retenido hasta que se confirme la entrega (escrow).
- El café es el primer producto. El mismo modelo sirve para cualquier producto físico
  con origen que contar.

Hipótesis de negocio (a validar, no confirmadas): comisión por venta, venta de etiquetas
NFC y plan para emprendedores.

## 5. Cómo respondemos a cada criterio de evaluación

| Criterio | Peso | Evidencia que tenemos | Brecha | Qué hacer |
|---|---|---|---|---|
| Integración con Scaffold Stellar | 30% | Proyecto creado con `stellar scaffold init`; contrato registrado en `scaffold.yml`; despliegue y cliente TypeScript generados con `stellar-scaffold build --build-clients`; cliente versionado para que un clon compile; conexión de billetera con el kit de Scaffold; CI con tests, clippy y wasm | No usamos los eventos en vivo, aunque el contrato ya emite `LotRegistered` y `LotTransferred` y `app-lib` trae `subscribeToEvents` | Mostrar un feed de lotes en vivo con los eventos. Es pequeño y se nota |
| Problema real y usuario claro | 25% | Problema tomado del reto; tres usuarios definidos | Faltan cifras con fuente y una voz real de productor | Una cifra con fuente y, si se puede, una frase de un productor o cooperativa |
| Demostración funcional | 25% | Contrato en Testnet, 3 lotes de ejemplo, flujo probado de punta a punta contra la red con un script | **Nunca se probó en el navegador con una billetera real.** El QR usa la dirección de la página, así que desde `localhost` un celular no lo abre | Probar con Freighter. Publicar la web (por ejemplo en Vercel) para que el QR funcione en celulares |
| Pitch y próximos pasos | 20% | Guion de 5 minutos en `docs/DEMO.md`; visión del marketplace | Falta ensayar con cronómetro | Ensayar dos veces y mostrar el roadmap de abajo |

## 6. Próximos pasos (para la diapositiva final)

Corto plazo:
- Publicar la web para que los QR funcionen desde cualquier celular.
- Entrar sin billetera, con correo o Google (por ejemplo, con Cavos).
- Historial de transferencias y página "Mis lotes".

Mediano plazo:
- Pago retenido hasta la entrega con escrow (por ejemplo, con Trustless Work).
- Mascota digital ligada al estado del pedido.
- Etiqueta NFC en el empaque.
- Panel de administrador con reportes.

Largo plazo:
- Abrir el marketplace a otros emprendedores y artistas.
- Pagos con stablecoin y paso a mainnet.

## 7. Lo que no hay que decir

- No decir que hay un marketplace, una mascota o NFC: es visión.
- No decir que la app se probó con billetera real hasta que se pruebe.
- No dar cifras de mercado sin fuente.
