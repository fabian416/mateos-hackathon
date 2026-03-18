# SQUAD.md — Mapa del Squad MateOS

## Tu equipo

Sos parte de un squad de agentes especializados. Cada uno tiene su rol y sus herramientas. Cuando una tarea NO es tu especialidad, **delegá** al agente correcto.

## Agentes disponibles

| Agente | Rol | Capabilities | Cuándo delegar |
|--------|-----|-------------|----------------|
| **tropero** | Ventas y Leads | sales, leads, pipeline, follow_up, meetings | Lead nuevo, seguimiento comercial, cerrar deal |
| **domador** | Admin y Datos | sheets, calendar, tasks, reports, data_entry, scheduling | Agendar reunión, actualizar planilla, reporte, tarea admin |
| **rastreador** | Soporte Técnico L1 | tech_support, diagnostics, troubleshooting, known_issues | Problema técnico, diagnóstico, error conocido |
| **relator** | Contenido y Marketing | content, articles, social_media, newsletter, editorial | Crear post, artículo, newsletter, contenido de marca |
| **baqueano** | Soporte al Cliente | customer_support, email, whatsapp, client_communication | Responder cliente, email de soporte, WhatsApp entrante |

## Cómo delegar

Usá el script `delegate.py`:

```bash
# Delegar tarea a un agente específico
python3 ~/delegate.py route <agente> "<descripción de la tarea>"

# Con contexto adicional (JSON)
python3 ~/delegate.py route tropero "Contactar lead nuevo" --context '{"nombre":"Juan Pérez","tel":"+5491155551234","interés":"plan premium"}'

# Con prioridad urgente
python3 ~/delegate.py route rastreador "Cliente no puede loguearse" --priority urgent

# Con ID de tarea custom
python3 ~/delegate.py route domador "Agendar onboarding" --task-id "lead-123-onboarding"
```

## Otros comandos útiles

```bash
# Ver qué agentes hay disponibles
python3 ~/delegate.py agents

# Ver historial de delegaciones
python3 ~/delegate.py tasks
python3 ~/delegate.py tasks --sender tropero
python3 ~/delegate.py tasks --target domador --status delivered

# Reportar resultado de una tarea que te delegaron
python3 ~/delegate.py update <task_id> --status completed --result "Reunión agendada para mañana 10am"
```

## Cuándo delegar vs. cuándo hacer vos

**DELEGÁ** cuando:
- La tarea requiere herramientas que vos no tenés (ej: Google Calendar → domador)
- La tarea es del dominio de otro agente (ej: problema técnico → rastreador)
- Necesitás que otro agente haga seguimiento posterior (ej: follow-up de venta → tropero)

**HACÉ VOS** cuando:
- La tarea está dentro de tu scope y capabilities
- Es algo simple que podés resolver sin escalar
- Ya tenés toda la info necesaria

## Reglas de delegación

1. **Siempre incluí contexto suficiente** — el agente receptor no tiene tu conversación
2. **Un mensaje, una tarea** — no mandes múltiples tareas en un solo route
3. **Reportá resultados** — cuando completés una tarea delegada, usá `delegate.py update`
4. **No cadenas infinitas** — si A delega a B y B necesita delegar de vuelta a A, escalá al operador
5. **Prioridad urgent** — solo para cosas que no pueden esperar (lead caliente, sistema caído)

## Flujo típico: Lead → Venta → Onboarding

```
1. Baqueano recibe consulta de compra por WhatsApp
   → delegate tropero "Lead calificado por WhatsApp" --context '{"nombre":"...","interés":"..."}'

2. Tropero contacta, cierra deal
   → delegate domador "Agendar onboarding para nuevo cliente" --context '{"nombre":"...","plan":"premium"}'

3. Domador agenda en Calendar + actualiza Sheet
   → delegate relator "Nuevo cliente cerrado, crear caso de éxito" --context '{"cliente":"...","plan":"..."}'

4. Relator genera draft de post → aprobación del operador via Telegram
```
