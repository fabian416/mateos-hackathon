# SQUAD.md — Mapa del Squad MateOS

## Tu equipo

Sos parte de un squad de agentes especializados. Cada uno tiene su rol y sus herramientas. Cuando una tarea NO es tu especialidad, **delegá** al agente correcto.

## Agentes disponibles

| Agente | Rol | sessionKey | Cuándo delegar |
|--------|-----|-----------|----------------|
| **tropero** | Ventas y Leads | `agent:tropero:main` | Lead nuevo, seguimiento comercial, cerrar deal |
| **domador** | Admin y Datos | `agent:domador:main` | Agendar reunión, actualizar planilla, reporte, tarea admin |
| **rastreador** | Soporte Técnico L1 | `agent:rastreador:main` | Problema técnico, diagnóstico, error conocido, escalar a L2/L3 |
| **relator** | Contenido y Marketing | `agent:relator:main` | Crear post, artículo, newsletter, contenido de marca, copy |
| **baqueano** | Soporte al Cliente | `agent:baqueano:main` | Responder cliente, email de soporte, WhatsApp entrante |
| **mateo-ceo** | CEO y Voz Pública | `agent:mateo-ceo:main` | Contenido de marca, tweets, estrategia de comunicación |

## Cómo delegar

Usá la herramienta `sessions_send` de OpenClaw:

```
# Delegar tarea a un agente específico
sessions_send(sessionKey="agent:tropero:main", message="Contactar lead nuevo: Juan Pérez, tel +5491155551234, interesado en plan premium")

# Delegar con contexto detallado
sessions_send(sessionKey="agent:domador:main", message="Agendar onboarding para nuevo cliente. Nombre: Juan Pérez, plan: premium, email: juan@empresa.com")

# Delegación urgente (incluí la urgencia en el mensaje)
sessions_send(sessionKey="agent:rastreador:main", message="URGENTE: Cliente no puede loguearse, error 403, necesita resolución inmediata")
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
2. **Un mensaje, una tarea** — no mandes múltiples tareas en un solo mensaje
3. **No cadenas infinitas** — si A delega a B y B necesita delegar de vuelta a A, escalá al operador
4. **Urgencia** — incluí "URGENTE" en el mensaje solo para cosas que no pueden esperar

## Flujo típico: Lead → Venta → Onboarding

```
1. Baqueano recibe consulta de compra por WhatsApp
   → sessions_send(sessionKey="agent:tropero:main", message="Lead calificado por WhatsApp. Nombre: ..., interés: ...")

2. Tropero contacta, cierra deal
   → sessions_send(sessionKey="agent:domador:main", message="Agendar onboarding para nuevo cliente. Nombre: ..., plan: premium")

3. Domador agenda en Calendar + actualiza Sheet
   → sessions_send(sessionKey="agent:relator:main", message="Nuevo cliente cerrado, crear caso de éxito. Cliente: ..., plan: ...")

4. Relator genera draft de post → aprobación del operador via Telegram
```
