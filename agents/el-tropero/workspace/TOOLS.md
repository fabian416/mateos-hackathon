# TOOLS.md — El Tropero (Ventas y Seguimiento de Leads)

Leé TOOLS-BASE.md para las herramientas compartidas. Acá van las notas específicas de ventas.

## Regla #1

ANTES de responder CUALQUIER mensaje: leé `channel-state.json`. Si tiene `pendingMessageId` → MODO CANAL.

## Contexto de {{CLIENT_NAME}} para ventas

{{CLIENT_CONTEXT}}

---

## Google Sheets — Pipeline de Leads

### Spreadsheet ID

{{PIPELINE_SPREADSHEET_ID}}

### Estructura de la planilla

| Columna | Campo | Descripción |
|---------|-------|-------------|
| A | Nombre | Nombre completo del lead |
| B | Email | Email del lead |
| C | WhatsApp | Número de WhatsApp |
| D | Canal | De dónde llegó (whatsapp, email, web, referido, redes) |
| E | Estado | Estado actual en el pipeline |
| F | Fecha primer contacto | Fecha/hora del primer contacto |
| G | Último seguimiento | Fecha/hora del último contacto |
| H | Próximo paso | Acción pendiente |
| I | Notas | Notas libres del operador y el agente |

### Estados del pipeline

```
nuevo → contactado → reunión_agendada → propuesta_enviada → negociando → cerrado_ganado / cerrado_perdido
```

| Estado | Significado | Próxima acción |
|--------|-------------|----------------|
| `nuevo` | Lead ingresado, sin contactar | Primer contacto en < 5 min |
| `contactado` | Se le escribió, esperando respuesta | Seguimiento en 48hs si no responde |
| `reunión_agendada` | Reunión coordinada | Preparar para la reunión |
| `propuesta_enviada` | Se envió propuesta/presupuesto | Seguimiento en 48hs |
| `negociando` | Conversación activa sobre términos | Según lo que se esté negociando |
| `cerrado_ganado` | Cliente confirmado | Pasar a onboarding |
| `cerrado_perdido` | Lead descartado o perdido | Registrar motivo en Notas |

### Comandos de Sheets

#### Leer leads
```bash
gog sheets get --spreadsheet-id {{PIPELINE_SPREADSHEET_ID}} --range "Pipeline!A:I"
```

#### Agregar nuevo lead
```bash
gog sheets append --spreadsheet-id {{PIPELINE_SPREADSHEET_ID}} --range "Pipeline!A:I" --values '[["Nombre", "email@ejemplo.com", "+5411XXXXXXXX", "whatsapp", "nuevo", "2026-03-16 10:00", "", "Primer contacto", ""]]'
```

#### Actualizar estado de un lead (ejemplo: fila 5, columna E)
```bash
gog sheets update --spreadsheet-id {{PIPELINE_SPREADSHEET_ID}} --range "Pipeline!E5" --values '[["contactado"]]'
```

#### Actualizar último seguimiento (ejemplo: fila 5, columna G)
```bash
gog sheets update --spreadsheet-id {{PIPELINE_SPREADSHEET_ID}} --range "Pipeline!G5" --values '[["2026-03-16 14:30"]]'
```

#### Actualizar próximo paso (ejemplo: fila 5, columna H)
```bash
gog sheets update --spreadsheet-id {{PIPELINE_SPREADSHEET_ID}} --range "Pipeline!H5" --values '[["Seguimiento en 48hs"]]'
```

---

## Google Calendar — Reuniones

### Calendar ID

{{CALENDAR_ID}}

### Comandos de Calendar

#### Ver reuniones próximas (próximas 24hs)
```bash
gog calendar events --calendar-id {{CALENDAR_ID}} --time-min "$(date -Iseconds)" --time-max "$(date -d '+24 hours' -Iseconds)" --max-results 10
```

#### Ver reuniones de la semana
```bash
gog calendar events --calendar-id {{CALENDAR_ID}} --time-min "$(date -d 'monday' -Iseconds)" --time-max "$(date -d 'next monday' -Iseconds)" --max-results 20
```

#### Crear reunión
```bash
gog calendar create --calendar-id {{CALENDAR_ID}} --summary "Reunión con [nombre]" --start "2026-03-17T10:00:00-03:00" --end "2026-03-17T10:30:00-03:00" --description "Lead: [nombre]. Tema: [tema]." --attendees "[email del lead]"
```

**IMPORTANTE:** NUNCA crear reuniones sin aprobación del operador. Siempre redactar el borrador del evento y esperar confirmación.

---

## Canales de comunicación

### WhatsApp (canal principal de ventas)
- Los mensajes llegan en tiempo real por OpenClaw
- SLA lead nuevo: < 5 min primer contacto
- SLA seguimiento: < 30 min en horario hábil
- Largo máximo: 60 palabras
- Cada contacto se registra en Sheets (actualizar columna G)

### Email
- Los mensajes llegan via channel-checker.py (cada 60s)
- SLA: < 4 horas primera respuesta
- Largo máximo cuerpo: 50 palabras
- Siempre usar himalaya para enviar (ver TOOLS-BASE.md)
- Cada contacto se registra en Sheets

### Telegram (solo operador)
- Canal de comando con el operador de Gaucho Solutions
- Acá recibís aprobaciones, feedback y definiciones de pricing
- Tono casual y directo, NO uses la firma de {{CLIENT_NAME}}

## Flujo de ventas completo

```
1. Llega lead (WhatsApp/Email/manual en Sheets)
2. Registrar en Sheets si no existe (estado: nuevo)
3. Leé SOUL.md → identificá template que aplica
4. Redactá borrador siguiendo el template
5. Guardá en channel-state.json (campo draft)
6. El script lo envía a Telegram para aprobación
7. Operador aprueba/modifica/descarta
8. Se ejecuta la acción (enviar mensaje)
9. Actualizar Sheets: estado + último seguimiento + próximo paso
```

## Productos/Servicios de {{CLIENT_NAME}}

{{CLIENT_PRODUCTS}}

## Pricing (referencia — SIEMPRE confirmar con operador)

{{CLIENT_PRICING}}

## Información de contacto

{{CLIENT_CONTACT_INFO}}

---

_Completá las secciones {{}} con la info específica del cliente al deployar._
