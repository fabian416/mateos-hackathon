# HEARTBEAT.md — El Baqueano

## Channel Check (PRIORITY)

1. Read `channel-state.json`
2. If it has a `completed` field: reply HEARTBEAT_OK. The channel-checker handles cleanup.
3. If it has `pendingMessageId`:
   - Check `channel` field:
     - If "whatsapp" and message is a simple greeting ("hola", "buenas"): draft a warm but brief greeting response. SLA is < 15 min so act fast.
     - If "email": standard flow, SLA is < 4 hours.
   - If `draft` is missing/null/empty:
     Check `receivedAt`. If < 2 min ago, reply HEARTBEAT_OK. If > 2 min, draft response as fallback:
     a. Read `SOUL.md` for templates and tone
     b. Draft response personalized with `fromName`
     c. Save draft in `channel-state.json`
     d. Reply HEARTBEAT_OK
   - If `draft` has content: waiting for operator. Reply HEARTBEAT_OK.
   - **SLA CHECK** (see below)
4. If empty `{}`: reply HEARTBEAT_OK

IMPORTANT: NEVER write to channel-state.json except to save a new draft. NEVER send proposals to Telegram yourself.

---

## SLA Monitoring

Cada heartbeat, verificá los SLAs por canal. Si se están por vencer o ya vencieron, alertá al operador.

### Reglas de SLA

| Canal | SLA primera respuesta | Alerta temprana | SLA vencido |
|---|---|---|---|
| WhatsApp | < 15 min | > 10 min sin draft | > 15 min sin respuesta enviada |
| Email | < 4 horas | > 3 horas sin draft | > 4 horas sin respuesta enviada |
| Problema grave (cualquier canal) | < 30 min | > 15 min sin acción | > 30 min sin resolución |

### Cómo calcular

1. Leé `receivedAt` de channel-state.json
2. Ejecutá `date -Iseconds` para la hora actual
3. Calculá la diferencia en minutos
4. Comparar con los umbrales de arriba

### Qué hacer cuando un SLA está en riesgo

**Alerta temprana (WhatsApp > 10 min sin draft):**
- Redactá el borrador inmediatamente como fallback
- Guardá en channel-state.json

**SLA vencido (WhatsApp > 15 min, o email > 4 horas):**
- Si no hay draft: redactá uno inmediatamente
- Alertá al operador via Telegram con este formato:

```
SLA VENCIDO — [canal]
Mensaje de: [fromName]
Recibido: [receivedAt]
Tiempo transcurrido: [X] minutos
Estado: [sin draft / draft pendiente de aprobación]
Acción sugerida: [aprobar draft actual / revisar urgente]
```

**Problema grave (> 15 min sin acción):**
- Escalar inmediatamente al operador con prioridad alta
- Incluir contexto del problema en la alerta

### Reglas de alerta

- **UNA alerta por mensaje pendiente**. No repetir cada heartbeat.
- Para trackear si ya alertaste: si el draft existe y el tiempo excede el SLA, alertar UNA vez. Si el operador no responde en 15 minutos más, recordar UNA vez más. Después no insistir.
- **No alertar por emails fuera de horario hábil** (lunes a viernes, 9:00 a 18:00 hora argentina). Los emails de fin de semana se procesan el lunes.
- **WhatsApp siempre alerta**, incluso fuera de horario, porque los clientes esperan respuesta rápida.
