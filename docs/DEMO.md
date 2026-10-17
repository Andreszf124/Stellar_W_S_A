# Guion de demo (5:00)

Los marcadores `<...>` se completan tras el despliegue.

| Tiempo      | Parte            | Habla  | Duración |
| ----------- | ---------------- | ------ | -------- |
| 0:00 - 1:00 | Problema         | Andrès | 1:00     |
| 1:00 - 1:30 | Usuario          | Andrès | 0:30     |
| 1:30 - 4:00 | Solución en vivo | Keylin | 2:30     |
| 4:00 - 5:00 | Uso de Stellar   | Wilson | 1:00     |

## Checklist previo (30 min antes)

- [ ] Wallet del productor con fondos de Testnet (Friendbot) y red en Testnet.
- [ ] Segunda wallet (comprador) con su dirección copiada y a mano.
- [ ] Contrato desplegado y su ID anotado: `CDTZKQAOMBPHRD7YK73ETWPJYDTVDM66DRBKQT375RHQSO7I7JZA6SI3`.
- [ ] 3 lotes cargados (`node scripts/seed-lots.mjs`) y `lot_count` = 3 verificado.
- [ ] QR de un lote en pantalla o impreso, probado con un celular.
- [ ] Pestaña del explorador de Testnet abierta en el contrato (`https://lab.stellar.org/r/testnet/contract/CDTZKQAOMBPHRD7YK73ETWPJYDTVDM66DRBKQT375RHQSO7I7JZA6SI3`).
- [ ] Frontend corriendo (`<URL_FRONTEND>` o `npm run dev`) con `.env` en Testnet.
- [ ] Wi-Fi probado y hotspot del celular como respaldo.
- [ ] Plan B: video de la demo completa (máx. 2:30) listo en pantalla completa,
      más capturas del explorador por si falla la red.
- [ ] Ensayo cronometrado al menos dos veces.

## 0:00 - 1:00 Problema (Andrès)

- El café costarricense se paga por su origen, pero el origen se cuenta, no se prueba.
- La información de finca, cosecha y proceso vive en papeles y chats: el
  comprador confía a ciegas y el productor no puede demostrar su trabajo.
- Cuando un lote cambia de manos, nadie puede verificar quién lo tuvo ni cuándo.

## 1:00 - 1:30 Usuario (Andrès)

- Productor de Tarrazú con pocas hectáreas, un celular y poco tiempo para trámites.
- Quiere que el comprador vea su finca y su proceso sin intermediarios.
- Segundo usuario: el tostador que necesita confiar en el lote que compra.

## 1:30 - 4:00 Solución en vivo (Keylin)

Wilson apoya con la wallet del comprador si hace falta.

1. (0:30) Conectar la wallet y registrar un lote nuevo: finca, cosecha, proceso.
   Mostrar la firma y el id asignado.
2. (0:45) Abrir la consulta pública del lote desde el QR con el celular, sin wallet.
3. (0:45) Transferir el lote a la dirección del comprador. Mostrar que el dueño
   cambia y que otra cuenta no puede transferirlo (error `NotOwner`).
4. (0:30) Volver a la lista y mostrar el contador de lotes actualizado.

Si algo falla: decirlo en una frase y pasar al video del plan B.

## 4:00 - 5:00 Uso de Stellar (Wilson)

- Mostrar la pestaña del explorador: la transacción de registro y la de transferencia.
- Contrato Soroban en Rust con cuatro funciones; el dueño autoriza cada cambio
  con su firma.
- Scaffold Stellar compiló, desplegó y generó el cliente TypeScript; el frontend
  lo consume sin backend propio.
- Hoy en Testnet. Próximos pasos: Mainnet, evidencias del lote (hash de fotos y
  certificaciones), historial de dueños y piloto con una cooperativa.

## Frases clave por criterio de evaluación

**Integración con Scaffold Stellar (30%)**

- "El contrato es nuestro único backend: Scaffold lo compila, lo despliega y
  genera el cliente que usa la interfaz."
- "Todo el flujo, de la wallet a la transacción, corre en Testnet y se verifica
  en el explorador ahora mismo."

**Problema real y usuario claro (25%)**

- "El productor vende origen, pero hoy no puede demostrarlo."
- "Cualquiera con un celular verifica el lote en segundos, sin instalar nada."

**Demo funcional (25%)**

- "Esto no es un mock: cada paso es una transacción en Testnet."
- "Registramos, consultamos por QR y transferimos: el ciclo completo del lote."

**Pitch y próximos pasos (20%)**

- "Empezamos con tres datos y una transferencia porque es lo mínimo que genera
  confianza."
- "Siguiente: historial completo de dueños, evidencias del lote y un piloto con
  una cooperativa de Tarrazú."
