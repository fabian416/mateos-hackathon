# TOOLS.md — El Baqueano (Soporte al Cliente)

Leé TOOLS-BASE.md para las herramientas compartidas. Acá van las notas específicas de soporte.

## Regla #1

ANTES de responder CUALQUIER mensaje: leé `channel-state.json`. Si tiene `pendingMessageId` → MODO CANAL.

## Contexto de {{CLIENT_NAME}} para respuestas

{{CLIENT_CONTEXT}}

## Canales de soporte

### WhatsApp (canal principal)
- Los mensajes llegan en tiempo real por OpenClaw
- SLA: < 15 min primera respuesta
- Largo máximo: 60 palabras
- Para saludos simples ("hola", "buenas"): respondé directo con "Hola [nombre], ¿en qué te podemos ayudar? {{SUPPORT_SIGNATURE}}"
- Para consultas que necesitás pensar: guardá draft en channel-state.json

### Email
- Los mensajes llegan via channel-checker.py (cada 60s)
- SLA: < 4 horas primera respuesta
- Largo máximo cuerpo: 50 palabras
- Siempre usar himalaya para enviar (ver TOOLS-BASE.md)

### Telegram (solo operador)
- Canal de comando con el operador de Gaucho Solutions
- Acá recibís aprobaciones y feedback
- Tono casual y directo, NO uses la firma de {{CLIENT_NAME}}

## Flujo de soporte

```
1. Llega mensaje (WhatsApp/Email)
2. Leé SOUL.md → identificá template que aplica
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

---

_Completá las secciones {{}} con la info específica del cliente al deployar._
