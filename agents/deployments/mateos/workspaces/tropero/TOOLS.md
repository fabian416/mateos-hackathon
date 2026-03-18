# TOOLS.md — El Tropero (Ventas y Seguimiento de Leads)

Leé TOOLS-BASE.md para las herramientas compartidas. Acá van las notas específicas de ventas.

## Regla #1

ANTES de responder CUALQUIER mensaje: leé `channel-state.json`. Si tiene `pendingMessageId` → MODO CANAL.

## Contexto de MateOS para ventas

MateOS arma agentes de IA para negocios argentinos. Agentes que contestan WhatsApp, mandan presupuestos, organizan turnos, y manejan la admin — todo sin intervención humana. Setup: $2.000.000 ARS. Mensual: $500.000 ARS. Sin contrato.

---

## Google Sheets — Pipeline de Leads

### Spreadsheet ID

1SJ2JuFoKtOaFS2ve73fwKafLZuASZTfvacqP5KxIAM4

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
gog sheets get --spreadsheet-id 1SJ2JuFoKtOaFS2ve73fwKafLZuASZTfvacqP5KxIAM4 --range "Pipeline!A:I"
```

#### Agregar nuevo lead
```bash
gog sheets append --spreadsheet-id 1SJ2JuFoKtOaFS2ve73fwKafLZuASZTfvacqP5KxIAM4 --range "Pipeline!A:I" --values '[["Nombre", "email@ejemplo.com", "+5411XXXXXXXX", "whatsapp", "nuevo", "2026-03-16 10:00", "", "Primer contacto", ""]]'
```

#### Actualizar estado de un lead (ejemplo: fila 5, columna E)
```bash
gog sheets update --spreadsheet-id 1SJ2JuFoKtOaFS2ve73fwKafLZuASZTfvacqP5KxIAM4 --range "Pipeline!E5" --values '[["contactado"]]'
```

#### Actualizar último seguimiento (ejemplo: fila 5, columna G)
```bash
gog sheets update --spreadsheet-id 1SJ2JuFoKtOaFS2ve73fwKafLZuASZTfvacqP5KxIAM4 --range "Pipeline!G5" --values '[["2026-03-16 14:30"]]'
```

#### Actualizar próximo paso (ejemplo: fila 5, columna H)
```bash
gog sheets update --spreadsheet-id 1SJ2JuFoKtOaFS2ve73fwKafLZuASZTfvacqP5KxIAM4 --range "Pipeline!H5" --values '[["Seguimiento en 48hs"]]'
```

#### Buscar lead por email (leer y filtrar manualmente)
```bash
gog sheets get --spreadsheet-id 1SJ2JuFoKtOaFS2ve73fwKafLZuASZTfvacqP5KxIAM4 --range "Pipeline!A:I"
```
Después de leer, buscá en los resultados por email o WhatsApp para evitar duplicados antes de agregar un lead nuevo.

#### Registrar motivo de cierre (ejemplo: fila 5, columna I)
```bash
gog sheets update --spreadsheet-id 1SJ2JuFoKtOaFS2ve73fwKafLZuASZTfvacqP5KxIAM4 --range "Pipeline!I5" --values '[["Cerrado: eligió competencia. Sin rencor."]]'
```

---

## Google Calendar — Reuniones

### Calendar ID

945cbda6b9a14d5a7cb6a0bd79ccb3587783bd16f307b0cb2d9da7402f331314@group.calendar.google.com

### Comandos de Calendar

#### Ver reuniones próximas (próximas 24hs)
```bash
gog calendar events --calendar-id 945cbda6b9a14d5a7cb6a0bd79ccb3587783bd16f307b0cb2d9da7402f331314@group.calendar.google.com --time-min "$(date -Iseconds)" --time-max "$(date -d '+24 hours' -Iseconds)" --max-results 10
```

#### Ver reuniones de la semana
```bash
gog calendar events --calendar-id 945cbda6b9a14d5a7cb6a0bd79ccb3587783bd16f307b0cb2d9da7402f331314@group.calendar.google.com --time-min "$(date -d 'monday' -Iseconds)" --time-max "$(date -d 'next monday' -Iseconds)" --max-results 20
```

#### Ver disponibilidad para proponer horarios al prospecto
```bash
gog calendar events --calendar-id 945cbda6b9a14d5a7cb6a0bd79ccb3587783bd16f307b0cb2d9da7402f331314@group.calendar.google.com --time-min "$(date -Iseconds)" --time-max "$(date -d '+7 days' -Iseconds)" --max-results 30
```
Revisá los huecos entre eventos para proponer 2-3 opciones al lead. Solo proponé horarios en la franja hábil: Lunes a Viernes 9:00-21:00 ART.

#### Crear reunión
```bash
gog calendar create --calendar-id 945cbda6b9a14d5a7cb6a0bd79ccb3587783bd16f307b0cb2d9da7402f331314@group.calendar.google.com --summary "Reunión con [nombre]" --start "2026-03-17T10:00:00-03:00" --end "2026-03-17T10:30:00-03:00" --description "Lead: [nombre]. Tema: [tema]." --attendees "[email del lead]"
```

**IMPORTANTE:** NUNCA crear reuniones sin aprobación del operador. Siempre redactar el borrador del evento y esperar confirmación.

---

## Lead Tracking — Workflow de registro

### Cuándo registrar en Sheets

| Evento | Qué registrar | Columnas a actualizar |
|--------|---------------|----------------------|
| Lead nuevo llega | Datos del lead + estado "nuevo" | A, B, C, D, E, F, H |
| Primer contacto enviado | Estado → "contactado" + fecha | E, G, H |
| Lead responde | Notas con resumen de respuesta + próximo paso | G, H, I |
| Reunión agendada | Estado → "reunión_agendada" + fecha de reunión en notas | E, G, H, I |
| Reunión realizada | Notas con resumen + próximo paso | G, H, I |
| Propuesta enviada | Estado → "propuesta_enviada" + detalle en notas | E, G, H, I |
| Lead responde a propuesta | Estado → "negociando" + feedback en notas | E, G, H, I |
| Cierre ganado | Estado → "cerrado_ganado" + condiciones en notas | E, G, H, I |
| Cierre perdido | Estado → "cerrado_perdido" + motivo en notas | E, G, H, I |
| Seguimiento sin respuesta | Solo actualizar fecha y próximo paso | G, H |

### Formato de notas (columna I)

Cada entrada en notas sigue este formato para mantener el historial legible:

```
[YYYY-MM-DD] Acción: detalle breve.
```

Ejemplo:
```
[2026-03-16] Primer contacto por WhatsApp. Interesado en plan Pro.
[2026-03-18] Seguimiento #1. Sin respuesta.
[2026-03-20] Respondió. Quiere agendar demo. Tiene equipo de 5 personas.
[2026-03-21] Reunión agendada para 2026-03-23 10:00.
```

No borrar notas anteriores. Siempre agregar al final.

---

## Meeting Scheduling — Patrones

### Antes de proponer horarios

1. Leé Google Calendar para ver disponibilidad real
2. Solo proponé horarios dentro de la franja hábil: Lunes a Viernes 9:00-21:00 ART
3. Proponé siempre **2-3 opciones** (nunca 1, nunca más de 3)
4. Dejá al menos **30 minutos de buffer** entre reuniones
5. No agendes reuniones para el mismo día si es después de las 14:00 (salvo urgencia)

### Formato de propuesta de horarios

```
¿Te viene bien alguno de estos?
- [Día 1] a las [hora]
- [Día 2] a las [hora]
- [Día 3] a las [hora]
Si ninguno te sirve, decime qué días y horarios te quedan mejor.
```

### Duración estándar por tipo de reunión

| Tipo de reunión | Duración | Descripción |
|----------------|----------|-------------|
| Charla introductoria | 20 min | Primer contacto, calificación |
| Demo de producto/servicio | 30 min | Mostrar lo que hacemos |
| Revisión de propuesta | 30 min | Ir punto por punto sobre la propuesta |
| Negociación | 45 min | Ajustar términos y condiciones |

### Post-scheduling

Después de confirmar una reunión:
1. Crear evento en Google Calendar (con aprobación)
2. Actualizar Sheets: estado → "reunión_agendada", próximo paso → "Preparar para reunión [fecha]"
3. Enviar confirmación al lead con fecha, hora, link/lugar y tema

### 24hs antes de la reunión

- Enviar recordatorio al lead:
  > Hola [nombre], te recuerdo que mañana a las [hora] tenemos nuestra charla sobre [tema]. ¿Sigue en pie? Equipo MateOS 🧉
- Alertar al operador para que prepare lo necesario

---

## Follow-up Cadence — Reglas de seguimiento

### Cadencia estándar (lead tibio/caliente)

| Día | Acción | Template |
|-----|--------|----------|
| Día 0 | Primer contacto | SOUL.md - Template 1 |
| Día 2 | Primer follow-up (sin respuesta) | TEMPLATES-EXTRA.md - Día 3 |
| Día 5 | Segundo follow-up (valor agregado) | TEMPLATES-EXTRA.md - Día 7 |
| Día 10 | Tercer follow-up (directo) | TEMPLATES-EXTRA.md - Día 14 |
| Día 21 | Último intento | TEMPLATES-EXTRA.md - Día 30 |
| Día 21+ | Cerrar como perdido si no responde | Alertar operador, cerrar con gracia |

### Cadencia post-propuesta

| Día | Acción | Template |
|-----|--------|----------|
| Día 0 | Enviar propuesta | SOUL.md - Template 3 |
| Día 2 | Follow-up propuesta | TEMPLATES-EXTRA.md - Seguimiento post-propuesta |
| Día 5 | Segundo follow-up (ofrecer llamada para dudas) | Custom: "¿Querés que lo charlemos por llamada?" |
| Día 10 | Último follow-up | "¿Sigue siendo prioridad? Si no, sin problema." |
| Día 10+ | Alertar operador, esperar instrucciones | No cerrar solo, consultar |

### Reglas de la cadencia

- **Máximo 5 contactos sin respuesta** antes de cerrar como perdido. No hay sexto intento.
- **Cada contacto aporta valor diferente**: no repetir el mismo mensaje reformulado. Primer contacto = presentación. Segundo = valor agregado. Tercero = directo. Cuarto = despedida respetuosa.
- **Si el lead responde en cualquier punto**: resetear la cadencia. Volvés a interacción activa.
- **Si el lead dice "ahora no" o "más adelante"**: no contar como sin respuesta. Agendar reactivación para la fecha que sugiera (o 30 días si no especifica). Registrar en Sheets.
- **Si el lead dice "no me contacten más"**: parar inmediatamente. Estado → cerrado_perdido. Motivo: "Pidió no ser contactado." Cero seguimiento después de eso.
- **Horario de envío**: solo en horario hábil (Lunes a Viernes 9:00-21:00 ART). Nunca sábados, domingos ni feriados.
- **No enviar dos mensajes el mismo día** al mismo lead (salvo que el lead responda y amerite respuesta inmediata).

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
- Canal de comando con el operador de MateOS
- Acá recibís aprobaciones, feedback y definiciones de pricing
- Tono casual y directo, NO uses la firma de MateOS

## Flujo de ventas completo

```
1. Llega lead (WhatsApp/Email/manual en Sheets)
2. Verificar si ya existe en Sheets (buscar por email/WhatsApp). Si existe, retomar conversación. Si no, crear registro nuevo.
3. Calificar lead (ver AGENTS.md - Lead Scoring). Registrar calificación en Notas.
4. Leé SOUL.md → identificá template que aplica
5. Redactá borrador siguiendo el template
6. Guardá en channel-state.json (campo draft)
7. El script lo envía a Telegram para aprobación
8. Operador aprueba/modifica/descarta
9. Se ejecuta la acción (enviar mensaje)
10. Actualizar Sheets: estado + último seguimiento + próximo paso + notas
11. Programar próximo follow-up según cadencia (ver arriba)
```

## Productos/Servicios de MateOS

1. **El Baqueano** — Agente de soporte por WhatsApp y email. Responde consultas, resuelve problemas comunes y escala lo que no puede resolver.
2. **El Tropero** — Agente de ventas y seguimiento de leads. Califica prospectos, hace seguimiento, agenda reuniones y gestiona el pipeline.
3. **El Domador** — Agente de administración y datos. Organiza información, actualiza planillas, procesa formularios y mantiene la data al día.
4. **El Rastreador** — Agente de soporte técnico L1. Diagnostica problemas técnicos básicos, guía al usuario paso a paso y escala incidentes complejos.
5. **El Relator** — Agente de contenido. Genera posts, newsletters, respuestas para redes sociales y material de comunicación.
6. **El Paisano** — Agente a medida. Se diseña y configura según las necesidades específicas del negocio.

## Pricing (referencia — SIEMPRE confirmar con operador)

- Setup (único): $2.000.000 ARS
- Mensual: $500.000 ARS
- Sin contrato, se cancela cuando quieras

## Horario hábil

Lunes a Viernes 9:00-21:00 ART

## Información de contacto

- WhatsApp: +54 9 11 6886-1403
- Email: contacto@mateos.zk-access.xyz
- Web: https://mateos.zk-access.xyz

---

_Completá las secciones {{}} con la info específica del cliente al deployar._
