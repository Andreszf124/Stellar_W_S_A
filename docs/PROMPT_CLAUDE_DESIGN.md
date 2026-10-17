# Prompt para Claude Design

Prompt para pedir el diseño móvil y de escritorio de Grano de Origen. Las pantallas
marcadas como "propuesta" no existen todavía en el código.

```
Diseña una aplicación llamada "Grano de Origen" en dos formatos: MÓVIL (390x844) y ESCRITORIO (1440x900). Entrégame prototipo navegable, flujo de navegación entre pantallas y un sistema de componentes reutilizables.

CONTEXTO
Plataforma de trazabilidad de café de Costa Rica sobre la blockchain Stellar. El productor registra cada lote (finca, cosecha, proceso), cualquier persona lo consulta con un código QR sin necesitar billetera, y el productor puede transferir el lote a un comprador. Lo registrado no se puede modificar ni borrar. Usuarios típicos: pequeños productores de café y compradores; muchos no conocen blockchain, así que el lenguaje debe ser simple, sin jerga técnica.

ROLES
1) USUARIO: cualquier persona. Sin billetera solo consulta. Con billetera conectada (productor o comprador) registra y transfiere.
2) ADMINISTRADOR: rol PROPUESTO, aún no existe. Panel de solo lectura y gestión fuera de la blockchain. No puede editar ni eliminar lotes, solo ver, resumir, exportar y anotar. Diséñalo aparte, con una insignia o sección claramente distinta.

PANTALLAS DEL USUARIO (existen hoy)
U1. Inicio: título, explicación breve del problema, tres tarjetas de acción: Registrar un lote, Consultar un lote, Transferir un lote.
U2. Barra superior (móvil: menú compacto): logo, enlaces Registrar / Consultar / Transferir, botón de conectar billetera. Pie de página.
U3. Conectar billetera: ventana de selección de billetera y estado conectado (dirección abreviada, red Testnet, saldo, desconectar).
U4. Consultar lote: campo de número de lote y botón Buscar. Estados: vacío, número inválido, cargando.
U5. Detalle de lote (página pública /lote/N, la que abre el QR): tarjeta con Número de lote, Finca, Cosecha, Proceso, Dueño actual (dirección completa), Registrado el (fecha), código QR y botón Descargar QR. Estados: cargando, lote no encontrado, error de red.
U6. Registrar lote (requiere billetera): campos Finca, Cosecha, Proceso con ayudas y errores por campo. Estados: sin billetera conectada, enviando (esperando firma), éxito (número del lote, enlace a su página y su QR), firma cancelada, error.
U7. Transferir lote (requiere billetera): campos Número de lote y Dirección del nuevo dueño. Errores: solo el dueño actual puede transferir, ya es el dueño, lote inexistente, dirección inválida (debe empezar con G y tener 56 caracteres). Estados: enviando, éxito, error.
U8. Pantalla 404 y pantalla de error general.
U9. (propuesta) Mis lotes: lista de lotes de la billetera conectada con acceso rápido a ver, descargar QR y transferir.

PANTALLAS DEL ADMINISTRADOR (propuestas)
A1. Ingreso de administrador.
A2. Panel: indicadores (lotes registrados, transferencias, productores activos, consultas por QR) y gráfico por mes.
A3. Lotes: tabla con búsqueda y filtros (finca, proceso, cosecha, dueño), paginación y exportar a CSV.
A4. Detalle de lote (admin): datos del lote, historial de transferencias, enlace al explorador de Stellar, QR imprimible, notas internas.
A5. Productores: lista de direcciones, cantidad de lotes y última actividad.
A6. Actividad reciente: registros y transferencias en orden cronológico.
A7. Reportes: exportar CSV o PDF por rango de fechas.
A8. Ajustes: red activa, identificador del contrato, plantilla de etiqueta con QR para imprimir.

ESTILO Y SISTEMA VISUAL
- Tema café, sobrio, cálido y confiable. Usa exactamente estos colores:
  fondo #FAF6F1, fondo alterno #F1E7DB, superficie #FFFDFA, borde #E2D3C2, borde fuerte #8A7360, texto #2B1D14, texto secundario #5E4A3B, primario #6B3F24, primario hover #51301B, foco #B36B00, error #8F1D1D sobre #FBEEEE, éxito #1F5C33 sobre #EDF7F0.
- Tipografía legible y humanista, jerarquía clara, tamaños cómodos en móvil.
- Íconos: SOLO SVG minimalistas de trazo (outline, 24 px, trazo 1.75). Necesito: más, buscar, transferir, ubicación (finca), calendario, proceso, usuario, alerta, check, cargando, grano de café, QR, descargar. PROHIBIDO usar emojis en cualquier parte del diseño.
- Accesibilidad: contraste AA mínimo, foco visible con el color de foco, áreas táctiles de 44 px o más, etiquetas visibles en cada campo, mensajes de error junto al campo.
- Todos los textos en español de Costa Rica, trato de "usted", frases cortas.
- Cada pantalla debe incluir sus estados: vacío, cargando, error y éxito.
- Móvil primero: en escritorio, aprovecha el espacio con rejillas y tablas; en móvil, listas de tarjetas y navegación inferior o menú compacto.

ENTREGABLES
1) Las pantallas U1 a U9 en móvil y escritorio.
2) Las pantallas A1 a A8 en móvil y escritorio (en móvil, versión reducida).
3) Flujos clicables: consultar por QR, registrar un lote, transferir un lote, y recorrido del administrador.
4) Biblioteca de componentes: botones, campos, tarjeta de lote, mensajes de estado, tabla, barra de navegación, ventana de conexión.
5) Respeta estrictamente lo que apruebe: el diseño aprobado se implementará tal cual, sin cambios creativos.
```
