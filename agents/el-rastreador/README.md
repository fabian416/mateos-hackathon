# El Rastreador — Soporte Tecnico Nivel 1

> Lee las huellas del problema y lo resuelve. Diagnostica, guia paso a paso y escala lo que no puede resolver.

## Que hace

- Diagnostica problemas tecnicos de clientes por WhatsApp y email
- Recopila informacion antes de proponer soluciones (nunca asume)
- Aplica soluciones conocidas con guias paso a paso
- Escala a L2 (tecnico) o L3 (desarrollo) cuando no puede resolver
- Redacta borradores para aprobacion del operador
- Trabaja 24/7

## Principio central

> Diagnostico ANTES de solucion. Primero entende que pasa, despues arregla.

## Canales

| Canal | Uso | SLA |
|-------|-----|-----|
| WhatsApp | Canal principal de soporte | < 15 min |
| Email | Canal secundario | < 4 horas |
| Telegram | Comunicacion con operador | - |

## Matriz de escalamiento

| Nivel | Quien resuelve | Tiempo max |
|-------|---------------|------------|
| L1 — El Rastreador | Agente | < 15 min |
| L2 — Tecnico | Tecnico especializado | < 2 horas |
| L3 — Desarrollo | Equipo de desarrollo | < 4 horas |
| Crisis | Operador + direccion | Inmediato |

## Deploy rapido

```bash
cd agents/_base
./deploy.sh --client-name mi-cliente --agent-type el-rastreador --channels telegram,whatsapp,email
```

## Personalizacion requerida

Despues de deployar, edita estos placeholders en los archivos del workspace:

| Placeholder | Donde | Que poner |
|-------------|-------|-----------|
| `{{CLIENT_NAME}}` | Todos | Nombre del negocio |
| `{{BRAND_MANTRA}}` | SOUL.md | Frase que define la voz de la marca |
| `{{BRAND_EMOJI}}` | SOUL.md | Emoji de marca |
| `{{SUPPORT_SIGNATURE}}` | SOUL.md, templates | Firma de soporte (ej: "Equipo MiEmpresa") |
| `{{CLIENT_CONTEXT}}` | TOOLS.md | Contexto del negocio para respuestas |
| `{{CLIENT_KNOWN_ISSUES}}` | TOOLS.md | Lista de problemas conocidos con soluciones |
| `{{CLIENT_PRODUCTS}}` | TOOLS.md | Productos/servicios del cliente |
| `{{CLIENT_FAQ_TECH}}` | TOOLS.md | Preguntas frecuentes tecnicas |
| `{{CLIENT_COMMON_CONFIGS}}` | TOOLS.md | Configuraciones comunes del sistema |
| `{{CLIENT_CONTACT_INFO}}` | TOOLS.md | Info de contacto |
| `{{GMAIL_EMAIL}}` | TOOLS-BASE.md | Email configurado |

## Trust Level

El agente arranca en **Nivel 2** (Borrador + Aprobacion):

| Nivel | Que puede hacer |
|-------|-----------------|
| 1 | Redacta borradores, el operador aprueba todo |
| 2 | Diagnostica, clasifica y redacta — operador aprueba envios y escalamientos |
| 3 | Autonomia operativa, solo escala temas complejos |

## Diferencia con El Baqueano

El Baqueano es soporte **general** al cliente (consultas, info, reclamos). El Rastreador es soporte **tecnico** nivel 1: diagnostica problemas, sigue arboles de decision, aplica soluciones conocidas y escala con toda la info recopilada.
