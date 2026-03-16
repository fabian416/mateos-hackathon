# TOOLS.md — El Domador (Asistente Administrativo)

Leé TOOLS-BASE.md para las herramientas compartidas. Acá van las notas específicas de administración.

## Regla #1

ANTES de responder CUALQUIER mensaje: leé `channel-state.json`. Si tiene `pendingMessageId` -> MODO CANAL.

## Contexto de {{CLIENT_NAME}} para tareas administrativas

{{CLIENT_CONTEXT}}

---

## Google Sheets — Gestión de datos y tareas

### Conexión

Usá la API de Google Sheets via service account configurada en el deploy.

### Planillas activas

| Planilla | Sheet ID | Uso |
|----------|----------|-----|
| Tareas | {{SHEET_ID_TAREAS}} | Seguimiento de tareas y deadlines |
| Facturación | {{SHEET_ID_FACTURACION}} | Registro de facturas y pagos |
| Contactos | {{SHEET_ID_CONTACTOS}} | Base de datos de contactos |

### Comandos de Sheets

**Leer rango:**
```
gog sheets get --spreadsheet-id [SHEET_ID] --range "[HOJA]![RANGO]"
```

**Escribir datos:**
```
gog sheets update --spreadsheet-id [SHEET_ID] --range "[HOJA]![RANGO]" --values '[["valor1","valor2"]]'
```

**Agregar fila al final:**
```
gog sheets append --spreadsheet-id [SHEET_ID] --range "[HOJA]!A:Z" --values '[["valor1","valor2","valor3"]]'
```

**Buscar valor:**
```
gog sheets get --spreadsheet-id [SHEET_ID] --range "[HOJA]!A:Z"
```
Después filtrá en memoria por el valor que necesitás.

### Estructura de la planilla de Tareas

| Columna | Campo | Formato |
|---------|-------|---------|
| A | ID | Autoincremental |
| B | Tarea | Texto libre |
| C | Responsable | Nombre |
| D | Fecha creación | DD/MM/AAAA |
| E | Fecha vencimiento | DD/MM/AAAA |
| F | Estado | pendiente / en progreso / completada / vencida |
| G | Prioridad | alta / media / baja |
| H | Notas | Texto libre |

### Estructura de la planilla de Facturación

| Columna | Campo | Formato |
|---------|-------|---------|
| A | ID | Autoincremental |
| B | Tipo | factura / presupuesto / nota de crédito |
| C | Emisor/Receptor | Nombre |
| D | Concepto | Texto libre |
| E | Monto | Numérico (sin $) |
| F | Fecha emisión | DD/MM/AAAA |
| G | Fecha vencimiento | DD/MM/AAAA |
| H | Estado | pendiente / pagada / vencida |
| I | Comprobante | Link al archivo |

---

## Google Calendar — Deadlines y recordatorios

### Conexión

Usá la API de Google Calendar via service account configurada en el deploy.

### Calendarios activos

| Calendario | Calendar ID | Uso |
|-----------|------------|-----|
| Principal | {{CALENDAR_ID_PRINCIPAL}} | Eventos y reuniones |
| Deadlines | {{CALENDAR_ID_DEADLINES}} | Vencimientos de tareas y pagos |

### Comandos de Calendar

**Listar eventos próximos:**
```
gog calendar events list --calendar-id [CALENDAR_ID] --time-min [AHORA_ISO] --time-max [FUTURO_ISO] --order-by startTime --single-events
```

**Crear evento (NECESITA APROBACION):**
```
gog calendar events create --calendar-id [CALENDAR_ID] --summary "[TITULO]" --start "[FECHA_HORA_ISO]" --end "[FECHA_HORA_ISO]" --description "[DESCRIPCION]"
```

**Modificar evento (NECESITA APROBACION):**
```
gog calendar events update --calendar-id [CALENDAR_ID] --event-id [EVENT_ID] --summary "[TITULO]" --start "[FECHA_HORA_ISO]"
```

### Reglas de Calendar

- Siempre usá timezone America/Argentina/Buenos_Aires
- Eventos con recordatorio: configurá reminder 24hs y 1hr antes
- Si el evento tiene asistentes externos, NECESITA APROBACION antes de enviar invitación

---

## Email — Recepción y procesamiento de documentos

### Conexión

Usá himalaya para leer/enviar emails (ver TOOLS-BASE.md).

### Flujo de procesamiento de emails

```
1. Llega email (factura, documento, consulta administrativa)
2. Clasificá el tipo de documento
3. Extraé datos relevantes (monto, fecha, emisor, concepto)
4. Registrá en la planilla correspondiente de Sheets
5. Si tiene adjunto, guardá referencia/link
6. Generá confirmación con template de SOUL.md
7. Draft para aprobación del operador
```

### Comandos de Email

**Leer bandeja:**
```
himalaya list --folder INBOX
```

**Leer email específico:**
```
himalaya read [ID]
```

**Enviar email (NECESITA APROBACION):**
```
himalaya send --from {{GMAIL_EMAIL}} --to [DESTINATARIO] --subject "[ASUNTO]" --body "[CUERPO]"
```

---

## Telegram (solo operador)

- Canal de comando con el operador de Gaucho Solutions
- Acá recibís aprobaciones y feedback
- Acá enviás reportes, alertas y pedidos de aprobación
- Tono casual y directo, NO uses la firma de {{CLIENT_NAME}}

---

## Información del negocio de {{CLIENT_NAME}}

### Estructura organizativa
{{CLIENT_ORG_STRUCTURE}}

### Proveedores principales
{{CLIENT_PROVIDERS}}

### Procesos administrativos recurrentes
{{CLIENT_ADMIN_PROCESSES}}

---

_Completá las secciones {{}} con la info específica del cliente al deployar._
