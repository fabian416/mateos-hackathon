# El Baqueano — Soporte al Cliente

> Conoce cada rincón de tu negocio. Guía a tus clientes por WhatsApp, mail o web sin perderse nunca.

## Qué hace

- Atiende consultas de clientes por WhatsApp y email
- Diagnostica problemas antes de responder
- Sigue templates de respuesta probados
- Escala al operador cuando no puede resolver
- Trabaja 24/7

## Canales

| Canal | Uso | SLA |
|-------|-----|-----|
| WhatsApp | Canal principal de soporte | < 15 min |
| Email | Canal secundario | < 4 horas |
| Telegram | Comunicación con operador | - |

## Deploy rápido

```bash
cd agents/_base
./deploy.sh --client-name mi-cliente --agent-type el-baqueano --channels telegram,whatsapp,email
```

## Personalización requerida

Después de deployar, editá estos placeholders en los archivos del workspace:

| Placeholder | Dónde | Qué poner |
|-------------|-------|-----------|
| `{{CLIENT_NAME}}` | Todos | Nombre del negocio |
| `{{BRAND_MANTRA}}` | SOUL.md | Frase que define la voz de la marca |
| `{{BRAND_EMOJI}}` | SOUL.md | Emoji de marca (ej: 🏪) |
| `{{SUPPORT_SIGNATURE}}` | SOUL.md, templates | Firma de soporte (ej: "Equipo MiEmpresa 🏪") |
| `{{CLIENT_INTRO_RESPONSE}}` | SOUL.md template 1 | Respuesta a "qué hacen" |
| `{{CLIENT_CONTEXT}}` | TOOLS.md | Contexto del negocio para respuestas |
| `{{CLIENT_PRODUCTS}}` | TOOLS.md | Productos/servicios del cliente |
| `{{CLIENT_FAQ}}` | TOOLS.md | Preguntas frecuentes |
| `{{CLIENT_CONTACT_INFO}}` | TOOLS.md | Info de contacto |
| `{{GMAIL_EMAIL}}` | TOOLS-BASE.md | Email configurado |
| `{{VOCAB_TABLE}}` | SOUL-BASE.md | Vocabulario específico del negocio |

## Trust Levels

El agente arranca en **Nivel 1** (Draft & Approve):

| Nivel | Qué puede hacer |
|-------|-----------------|
| 1 | Redacta borradores, el operador aprueba todo |
| 2 | Responde consultas simples solo, escala el resto |
| 3 | Autonomía operativa, solo escala temas complejos |
