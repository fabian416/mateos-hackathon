# TEMPLATES-EXTRA.md — El Domador (Templates adicionales)

> Archivo de referencia para templates de reportes extendidos, cadencia de recordatorios y formatos especiales. Solo leé este archivo cuando necesites redactar algo relacionado.

---

## Resumen diario — Template extendido

### Formato completo (para semanas con mucha actividad)

> **Resumen diario — {{CLIENT_NAME}}** {{BRAND_EMOJI}}
>
> **Fecha:** [DD/MM/AAAA]
>
> ---
>
> **Tareas completadas hoy:** [N]
> | Tarea | Responsable | Prioridad |
> |-------|------------|-----------|
> | [tarea] | [nombre] | [prioridad] |
>
> **Tareas en progreso:** [N]
> | Tarea | Responsable | Vencimiento | % avance |
> |-------|------------|-------------|----------|
> | [tarea] | [nombre] | [fecha] | [%] |
>
> **Tareas vencidas sin resolver:** [N]
> | Tarea | Responsable | Venció el | Días de atraso |
> |-------|------------|-----------|----------------|
> | [tarea] | [nombre] | [fecha] | [N] |
>
> **Facturación del día:**
> - Facturas registradas: [N] por $[monto total]
> - Pagos pendientes próximos: [N] por $[monto total]
>
> **Eventos de mañana:**
> - [evento] — [hora]
>
> {{SUPPORT_SIGNATURE}}

### Formato corto (para días tranquilos)

> **Resumen diario — {{CLIENT_NAME}}** {{BRAND_EMOJI}}
> [DD/MM/AAAA]
>
> Completadas: [N] | Pendientes: [N] | Vencidas: [N]
> Sin alertas.
>
> {{SUPPORT_SIGNATURE}}

---

## Reporte semanal — Template extendido

> **Reporte semanal — {{CLIENT_NAME}}** {{BRAND_EMOJI}}
>
> **Semana:** [DD/MM] al [DD/MM]
>
> ---
>
> **Resumen ejecutivo:**
> [2-3 líneas con lo más relevante de la semana]
>
> **Métricas:**
> | Métrica | Esta semana | Semana anterior | Tendencia |
> |---------|------------|----------------|-----------|
> | Tareas completadas | [N] | [N] | [+/-] |
> | Tareas creadas | [N] | [N] | [+/-] |
> | Tareas vencidas | [N] | [N] | [+/-] |
> | Facturas procesadas | [N] | [N] | [+/-] |
> | Monto facturado | $[X] | $[X] | [+/-] |
>
> **Tareas pendientes críticas:**
> | Tarea | Responsable | Vencimiento | Estado |
> |-------|------------|-------------|--------|
> | [tarea] | [nombre] | [fecha] | [estado] |
>
> **Calendario semana entrante:**
> | Día | Evento | Hora |
> |-----|--------|------|
> | [día] | [evento] | [hora] |
>
> **Observaciones:**
> - [observación relevante si hay]
>
> {{SUPPORT_SIGNATURE}}

---

## Cadencia de recordatorios

### Reglas de escalamiento temporal

| Tiempo antes del deadline | Acción | Canal |
|--------------------------|--------|-------|
| 7 días | Mención en reporte semanal | Telegram (reporte) |
| 48 horas | Recordatorio individual | Telegram (alerta) |
| 24 horas | Recordatorio urgente | Telegram (alerta) |
| Día del vencimiento (09:00) | Alerta final | Telegram (alerta) |
| Vencido + 1 día | Alerta de tarea vencida | Telegram (alerta urgente) |
| Vencido + 3 días | Escalamiento al operador | Telegram (escalamiento) |

### Template de recordatorio escalonado

**48 horas antes:**
> Recordatorio: "[tarea]" vence el [fecha]. Estado: [estado]. {{BRAND_EMOJI}}

**24 horas antes:**
> Mañana vence "[tarea]". Estado actual: [estado]. [Acción sugerida]. {{BRAND_EMOJI}}

**Día del vencimiento:**
> HOY vence "[tarea]". Estado: [estado]. Necesita atención hoy. {{BRAND_EMOJI}}

**Vencida:**
> VENCIDA: "[tarea]" venció ayer ([fecha]). Responsable: [nombre]. Requiere resolución. {{BRAND_EMOJI}}

---

## Formato de carga masiva de datos

### Cuando el operador pasa varios datos juntos

1. Parseá todos los registros del mensaje
2. Validá formato y completitud de cada uno
3. Si hay datos faltantes, preguntá antes de cargar
4. Cargá todo en la planilla correspondiente
5. Respondé con resumen:

> Carga masiva completada {{BRAND_EMOJI}}
>
> - **Planilla:** [nombre]
> - **Registros cargados:** [N] de [N total]
> - **Errores/omisiones:** [detalle o "ninguno"]
>
> {{SUPPORT_SIGNATURE}}

---

## Conciliación de datos

### Template para reporte de inconsistencias

> **Alerta: inconsistencia detectada** {{BRAND_EMOJI}}
>
> **Planilla:** [nombre]
> **Fila(s):** [números]
> **Problema:** [descripción]
> **Dato actual:** [valor]
> **Dato esperado:** [valor]
>
> No modifiqué nada. Esperando tu indicación.
>
> {{SUPPORT_SIGNATURE}}
