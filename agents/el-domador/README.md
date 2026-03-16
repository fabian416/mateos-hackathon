# El Domador — Asistente Administrativo

> Toma las tareas salvajes del día a día y las pone en orden. Carga de datos, reportes, recordatorios y seguimiento de deadlines.

## Qué hace

- Carga y actualiza datos en Google Sheets (tareas, facturación, contactos)
- Genera resúmenes diarios y reportes semanales
- Monitorea deadlines y envía recordatorios escalonados
- Procesa facturas y documentos recibidos por email
- Consulta Google Calendar para eventos y vencimientos
- Alerta sobre tareas vencidas e inconsistencias en datos
- Todo pasa por aprobación del operador antes de salir

## Herramientas

| Herramienta | Uso | Permiso |
|-------------|-----|---------|
| Google Sheets | Gestión de tareas, facturación, contactos | Lectura/escritura autónoma |
| Google Calendar | Deadlines, eventos, recordatorios | Lectura autónoma, escritura con aprobación |
| Email (himalaya) | Recepción de facturas y documentos | Lectura autónoma, envío con aprobación |
| Telegram | Comunicación con operador | Autónomo |

## Deploy rápido

```bash
cd agents/_base
./deploy.sh --client-name mi-cliente --agent-type el-domador --channels telegram,google-sheets,google-calendar,email
```

## Personalización requerida

Después de deployar, editá estos placeholders en los archivos del workspace:

| Placeholder | Dónde | Qué poner |
|-------------|-------|-----------|
| `{{CLIENT_NAME}}` | Todos | Nombre del negocio |
| `{{BRAND_MANTRA}}` | SOUL.md | Frase que define la voz de la marca |
| `{{BRAND_EMOJI}}` | SOUL.md, templates | Emoji de marca |
| `{{SUPPORT_SIGNATURE}}` | SOUL.md, templates | Firma (ej: "Equipo MiEmpresa") |
| `{{CLIENT_CONTEXT}}` | TOOLS.md | Contexto del negocio |
| `{{SHEET_ID_TAREAS}}` | TOOLS.md, channels.json | ID de la planilla de tareas |
| `{{SHEET_ID_FACTURACION}}` | TOOLS.md, channels.json | ID de la planilla de facturación |
| `{{SHEET_ID_CONTACTOS}}` | TOOLS.md, channels.json | ID de la planilla de contactos |
| `{{CALENDAR_ID_PRINCIPAL}}` | TOOLS.md, channels.json | ID del calendario principal |
| `{{CALENDAR_ID_DEADLINES}}` | TOOLS.md, channels.json | ID del calendario de deadlines |
| `{{GMAIL_EMAIL}}` | TOOLS-BASE.md | Email configurado |
| `{{CLIENT_ORG_STRUCTURE}}` | TOOLS.md | Estructura organizativa |
| `{{CLIENT_PROVIDERS}}` | TOOLS.md | Proveedores principales |
| `{{CLIENT_ADMIN_PROCESSES}}` | TOOLS.md | Procesos administrativos recurrentes |

## Trust Levels

El agente arranca en **Nivel 2** (Draft & Approve):

| Nivel | Qué puede hacer |
|-------|-----------------|
| 1 | Redacta borradores, el operador aprueba todo |
| 2 | Lee/escribe datos y genera reportes solo, escala envíos y cambios de calendario |
| 3 | Autonomía operativa, solo escala eliminaciones y compromisos económicos |

## Cadencia de reportes

| Reporte | Frecuencia | Hora (ART) | Detalle |
|---------|-----------|------------|---------|
| Resumen diario | Todos los días | 09:00 | Tareas completadas, pendientes, alertas |
| Reporte semanal | Lunes | 09:00 | Métricas, pendientes críticas, calendario |
| Alertas | Tiempo real | — | Tareas vencidas, deadlines < 48hs |

## Cadencia de recordatorios

| Tiempo antes del deadline | Tipo |
|--------------------------|------|
| 48 horas | Recordatorio |
| 24 horas | Recordatorio urgente |
| Día del vencimiento | Alerta final |
| Vencido + 1 día | Alerta de tarea vencida |
| Vencido + 3 días | Escalamiento al operador |
