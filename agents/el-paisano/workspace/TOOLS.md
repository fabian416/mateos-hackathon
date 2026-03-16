# TOOLS.md — El Paisano (Template Custom)

Leé TOOLS-BASE.md para las herramientas compartidas. Acá van las notas específicas de este agente.

## Regla #1

ANTES de responder CUALQUIER mensaje: leé `channel-state.json`. Si tiene `pendingMessageId` -> MODO CANAL.

## Contexto de {{CLIENT_NAME}}

{{CLIENT_CONTEXT}}

<!-- CLIENT_CONTEXT: Describí el negocio del cliente en 2-3 párrafos.
     Qué hace, a quién le vende, cómo opera. Esto le da contexto
     al agente para responder con criterio. -->

---

## Integraciones disponibles

Estas son las herramientas que puede usar cualquier agente de Gaucho Solutions. Activá solo las que necesite este agente.

### WhatsApp
- **Estado:** {{WHATSAPP_STATUS}} <!-- ACTIVO / INACTIVO / NO APLICA -->
- Los mensajes llegan en tiempo real por OpenClaw
- Largo máximo por mensaje: 60 palabras
- Para saludos simples ("hola", "buenas"): respuesta directa breve
- Para consultas que necesitás pensar: guardá draft en channel-state.json
- SLA default: < 15 min primera respuesta

### Email (himalaya)
- **Estado:** {{EMAIL_STATUS}} <!-- ACTIVO / INACTIVO / NO APLICA -->
- Los mensajes llegan via channel-checker.py (cada 60s)
- Usá himalaya para enviar (ver TOOLS-BASE.md)
- Largo máximo cuerpo: 50 palabras
- SLA default: < 4 horas primera respuesta
- Email configurado: {{GMAIL_EMAIL}}

### Google Sheets
- **Estado:** {{SHEETS_STATUS}} <!-- ACTIVO / INACTIVO / NO APLICA -->
- Lectura/escritura de planillas via API
- Útil para: inventario, registros, seguimiento, reportes
- Spreadsheet ID: {{SHEETS_ID}}

### Google Calendar
- **Estado:** {{CALENDAR_STATUS}} <!-- ACTIVO / INACTIVO / NO APLICA -->
- Gestión de eventos y turnos
- Útil para: agendamiento, recordatorios, disponibilidad
- Calendar ID: {{CALENDAR_ID}}

### Twitter/X
- **Estado:** {{TWITTER_STATUS}} <!-- ACTIVO / INACTIVO / NO APLICA -->
- Publicación y monitoreo de tweets
- Útil para: contenido, engagement, atención pública
- Cuenta: {{TWITTER_HANDLE}}

### Telegram (siempre activo)
- Canal de comando con el operador de Gaucho Solutions
- Acá recibís aprobaciones y feedback
- Tono casual y directo, NO uses la firma del cliente

---

## Herramientas custom

{{AGENT_CUSTOM_TOOLS}}

<!-- ================================================================
  AGENT_CUSTOM_TOOLS: Si el agente necesita herramientas que no están
  en la lista de arriba, definílas acá.

  Formato sugerido:

  ### Nombre de la herramienta
  - **Qué hace:** descripción breve
  - **Cómo se usa:** comando o endpoint
  - **Cuándo usarla:** en qué situaciones
  - **Restricciones:** qué NO hacer con esta herramienta

  Ejemplo:
  ### API de pagos (MercadoPago)
  - **Qué hace:** Consulta estado de pagos y genera links de cobro
  - **Cómo se usa:** curl al endpoint configurado en .env
  - **Cuándo usarla:** Cuando el cliente pregunta por un pago o necesita un link
  - **Restricciones:** NUNCA modificar montos sin aprobación del operador
================================================================ -->

---

## Flujo principal

```
1. Llega mensaje (por el canal configurado)
2. Leé SOUL.md -> identificá template que aplica
3. Redactá borrador siguiendo el template
4. Guardá en channel-state.json (campo draft)
5. El script lo envía a Telegram para aprobación
6. Operador aprueba/modifica/descarta
7. Se ejecuta la acción
```

## Knowledge base de {{CLIENT_NAME}}

### Productos/Servicios
{{CLIENT_PRODUCTS}}

### Preguntas frecuentes
{{CLIENT_FAQ}}

### Información de contacto
{{CLIENT_CONTACT_INFO}}

<!-- Completá las secciones {{}} con la info específica del cliente al deployar. -->

---

_Activá solo las integraciones que necesite el agente. Menos herramientas = menos riesgo._
