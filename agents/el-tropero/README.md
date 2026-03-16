# El Tropero — Ventas y Seguimiento de Leads

> Arrea los leads por el pipeline sin perder ninguno. Sabe cuándo empujar y cuándo esperar. Ningún lead se le enfría.

## Qué hace

- Contacta leads nuevos en menos de 5 minutos
- Hace seguimiento cada 48hs para que ningún lead se enfríe
- Agenda reuniones con prospectos calientes
- Registra cada interacción en Google Sheets (pipeline)
- Gestiona el calendario de reuniones de ventas
- Trabaja 24/7

## Canales

| Canal | Uso | SLA |
|-------|-----|-----|
| WhatsApp | Canal principal de ventas | < 5 min (lead nuevo), < 30 min (seguimiento) |
| Email | Canal secundario | < 4 horas |
| Google Sheets | Pipeline de leads | Actualización en cada interacción |
| Google Calendar | Reuniones de ventas | Agendar < 72hs del primer contacto |
| Telegram | Comunicación con operador | - |

## Pipeline de leads

```
nuevo → contactado → reunión_agendada → propuesta_enviada → negociando → cerrado_ganado / cerrado_perdido
```

## Deploy rápido

```bash
cd agents/_base
./deploy.sh --client-name mi-cliente --agent-type el-tropero --channels telegram,whatsapp,google-sheets,google-calendar
```

## Personalización requerida

Después de deployar, editá estos placeholders en los archivos del workspace:

| Placeholder | Dónde | Qué poner |
|-------------|-------|-----------|
| `{{CLIENT_NAME}}` | Todos | Nombre del negocio |
| `{{BRAND_MANTRA}}` | SOUL.md | Frase que define la voz de la marca |
| `{{BRAND_EMOJI}}` | SOUL.md, templates | Emoji de marca (ej: 🏪) |
| `{{SUPPORT_SIGNATURE}}` | SOUL.md, templates | Firma de ventas (ej: "Equipo MiEmpresa 🏪") |
| `{{CLIENT_CONTEXT}}` | TOOLS.md | Contexto del negocio para ventas |
| `{{CLIENT_PRODUCTS}}` | TOOLS.md | Productos/servicios del cliente |
| `{{CLIENT_PRICING}}` | TOOLS.md | Tabla de precios de referencia |
| `{{CLIENT_CONTACT_INFO}}` | TOOLS.md | Info de contacto |
| `{{PIPELINE_SPREADSHEET_ID}}` | TOOLS.md, channels.json | ID del Google Spreadsheet del pipeline |
| `{{CALENDAR_ID}}` | TOOLS.md, channels.json | ID del Google Calendar de reuniones |
| `{{GMAIL_EMAIL}}` | TOOLS-BASE.md | Email configurado |
| `{{VOCAB_TABLE}}` | SOUL-BASE.md | Vocabulario específico del negocio |

## Trust Levels

El agente arranca en **Nivel 2** (Borrador + Aprobación):

| Nivel | Qué puede hacer |
|-------|-----------------|
| 1 | Solo lee y clasifica leads, no redacta |
| 2 | Redacta borradores y trackea en Sheets, el operador aprueba todo |
| 3 | Responde seguimientos simples solo, escala oportunidades nuevas |
| 4 | Autonomía operativa, solo escala pricing y cierres |
