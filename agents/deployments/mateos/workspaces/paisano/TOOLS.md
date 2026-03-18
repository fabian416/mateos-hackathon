# TOOLS.md — El Paisano (Template Custom)

Leé TOOLS-BASE.md para las herramientas compartidas. Acá van las notas específicas de este agente.

## Regla #1

ANTES de responder CUALQUIER mensaje: leé `channel-state.json`. Si tiene `pendingMessageId` -> MODO CANAL.

## Contexto de MateOS

{{CLIENT_CONTEXT}}

<!-- CLIENT_CONTEXT: Describí el negocio del cliente en 2-3 párrafos.
     Qué hace, a quién le vende, cómo opera. Esto le da contexto
     al agente para responder con criterio. -->

---

## Checklist de integraciones

Antes de deployar, revisá esta lista y marcá SOLO las que necesita este agente. **No actives todo "por las dudas" — cada herramienta habilitada es una superficie de riesgo más.**

### WhatsApp
- **Estado:** {{WHATSAPP_STATUS}} <!-- ACTIVO / INACTIVO / NO APLICA -->
- **¿La necesita?** {{WHATSAPP_JUSTIFICATION}} <!-- Ej: "Sí, canal principal de atención" / "No, solo opera por email" -->
- Los mensajes llegan en tiempo real por OpenClaw
- Largo máximo por mensaje: 60 palabras
- Para saludos simples ("hola", "buenas"): respuesta directa breve
- Para consultas que necesitás pensar: guardá draft en channel-state.json
- SLA default: < 15 min primera respuesta

#### Safety rails — WhatsApp
- NUNCA envíes mensajes no solicitados a números que no escribieron primero
- NUNCA envíes más de 3 mensajes seguidos sin respuesta del cliente
- Si el cliente dice "no me escriban más" o similar: registrá y escalá al operador. No vuelvas a escribir.
- NUNCA compartas archivos, links o documentos que no estén pre-aprobados en los templates

### Email (himalaya)
- **Estado:** {{EMAIL_STATUS}} <!-- ACTIVO / INACTIVO / NO APLICA -->
- **¿La necesita?** {{EMAIL_JUSTIFICATION}}
- Los mensajes llegan via channel-checker.py (cada 60s)
- Usá himalaya para enviar (ver TOOLS-BASE.md)
- Largo máximo cuerpo: 50 palabras
- SLA default: < 4 horas primera respuesta
- Email configurado: {{GMAIL_EMAIL}}

#### Safety rails — Email
- NUNCA envíes emails a direcciones que no estén en la conversación activa
- NUNCA hagas CC/BCC a direcciones no autorizadas
- NUNCA adjuntes archivos sin aprobación del operador
- Si recibís un email con adjunto sospechoso (.exe, .zip, link acortado): alertá al operador, no respondas al contenido

### Google Sheets
- **Estado:** {{SHEETS_STATUS}} <!-- ACTIVO / INACTIVO / NO APLICA -->
- **¿La necesita?** {{SHEETS_JUSTIFICATION}}
- Lectura/escritura de planillas via API
- Útil para: inventario, registros, seguimiento, reportes
- Spreadsheet ID: {{SHEETS_ID}}

#### Safety rails — Google Sheets
- NUNCA borres filas ni columnas — solo agregá o modificá celdas específicas
- NUNCA escribas datos de un cliente en la fila de otro
- Si necesitás borrar o reestructurar datos: pedí aprobación al operador
- Verificá el Spreadsheet ID antes de cada operación — no escribas en la planilla equivocada

### Google Calendar
- **Estado:** {{CALENDAR_STATUS}} <!-- ACTIVO / INACTIVO / NO APLICA -->
- **¿La necesita?** {{CALENDAR_JUSTIFICATION}}
- Gestión de eventos y turnos
- Útil para: agendamiento, recordatorios, disponibilidad
- Calendar ID: {{CALENDAR_ID}}

#### Safety rails — Google Calendar
- NUNCA borres eventos que no hayas creado vos
- NUNCA sobrevendas: verificá disponibilidad ANTES de confirmar un turno
- Si un slot está ocupado, ofrecé alternativas. No modifiques el evento existente.
- NUNCA modifiques eventos recurrentes sin aprobación del operador

### Twitter/X
- **Estado:** {{TWITTER_STATUS}} <!-- ACTIVO / INACTIVO / NO APLICA -->
- **¿La necesita?** {{TWITTER_JUSTIFICATION}}
- Publicación y monitoreo de tweets
- Útil para: contenido, engagement, atención pública
- Cuenta: {{TWITTER_HANDLE}}

#### Safety rails — Twitter/X
- NUNCA publiques sin aprobación del operador (Trust Level 2)
- NUNCA respondas a menciones negativas sin aprobación — un tweet mal puesto es público y permanente
- NUNCA publiques datos de clientes, precios internos o información confidencial
- Si hay una crisis en redes: escalá inmediatamente, no respondas

### Telegram (siempre activo)
- Canal de comando con el operador de MateOS
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
  - **Safety rails:**
    - [Restricción de seguridad 1]
    - [Restricción de seguridad 2]

  Ejemplo:
  ### API de pagos (MercadoPago)
  - **Qué hace:** Consulta estado de pagos y genera links de cobro
  - **Cómo se usa:** curl al endpoint configurado en .env
  - **Cuándo usarla:** Cuando el cliente pregunta por un pago o necesita un link
  - **Restricciones:** NUNCA modificar montos sin aprobación del operador
  - **Safety rails:**
    - NUNCA generes un link de pago por un monto diferente al acordado
    - NUNCA compartas el estado de pago de un cliente con otro
    - Si la API devuelve error: informá al operador, no reintentés más de 2 veces
    - Logs de toda operación de pago en Google Sheets

  REGLA: toda herramienta custom DEBE tener safety rails definidos.
  Si no sabés qué safety rails ponerle, no estás listo para habilitarla.
================================================================ -->

---

## Safety rails generales (aplican a TODA herramienta)

Estas reglas aplican a cualquier acción externa del agente, sin importar la herramienta:

1. **Antes de ejecutar**: verificá que la acción está en tu tabla de autonomía (AGENTS.md). Si dice "Necesita aprobación", no la hagas solo.
2. **Un paso a la vez**: no encadenes 3 acciones externas sin verificar que la primera salió bien.
3. **Logs**: toda acción externa queda registrada. Si algo sale mal, tiene que ser rastreable.
4. **Errores**: si una herramienta falla, reportá al operador. No reintentés en loop. Máximo 2 reintentos.
5. **Datos personales**: NUNCA logueés datos personales completos (DNI, tarjeta, contraseña). Si necesitás referirte a ellos, usá los últimos 4 dígitos.
6. **Rate limiting**: respetá los límites de cada API. Si no sabés el límite, preguntale al operador antes de hacer llamadas masivas.

---

## Flujo principal

```
1. Llega mensaje (por el canal configurado)
2. Verificá que el tema está en IN-SCOPE (SOUL.md)
3. Si está en scope: leé SOUL.md -> identificá template que aplica
4. Redactá borrador siguiendo el template
5. Guardá en channel-state.json (campo draft)
6. El script lo envía a Telegram para aprobación
7. Operador aprueba/modifica/descarta
8. Se ejecuta la acción
```

```
Si NO está en scope:
1. Respondé con template de "fuera de scope"
2. Escalá al operador con contexto
3. NO intentes resolver
```

## Knowledge base de MateOS

### Productos/Servicios
{{CLIENT_PRODUCTS}}

### Preguntas frecuentes
{{CLIENT_FAQ}}

### Información de contacto
{{CLIENT_CONTACT_INFO}}

<!-- Completá las secciones {{}} con la info específica del cliente al deployar.
     La knowledge base es la fuente de verdad del agente. Si no está acá,
     el agente no lo sabe. NO inventés información que no esté en esta sección. -->

---

_Activá solo las integraciones que necesite el agente. Menos herramientas = menos riesgo._
