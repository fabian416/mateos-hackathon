# Estrategia de Costos

> Principio rector: **usar el modelo mas barato que haga bien el laburo.**
> No tiene sentido quemar Opus en un heartbeat que solo chequea si hay mensajes nuevos.

---

## Asignacion de Modelos por Tarea

| Tarea | Modelo Recomendado | Justificacion |
|-------|--------------------|---------------|
| Heartbeats (chequeos periodicos) | Haiku | Es lectura + reporte basico. No necesita razonamiento complejo. |
| Templates y respuestas estandar | Haiku | Rellenar plantillas con datos es mecanico. |
| Creacion de contenido | Sonnet | Necesita creatividad y buen manejo del tono, pero no razonamiento profundo. |
| Razonamiento complejo / estrategia | Opus | Analisis multi-variable, decisiones con trade-offs, planificacion. |
| Extraccion nocturna de datos | Sonnet | Parsing estructurado con algo de interpretacion. Haiku a veces se pierde. |
| Clasificacion y tagging | Haiku | Categorizar cosas es simple y repetitivo. |
| Resumen de conversaciones | Sonnet | Necesita captar matices y priorizar informacion. |

---

## Configuracion Actual

| Agente | Modelo Principal | Modelo para Heartbeats | Notas |
|--------|-----------------|----------------------|-------|
| El Relator | google/gemini-2.5-flash | google/gemini-2.5-flash | Contenido creativo se beneficia de Flash. Heartbeats simples. |

---

## Metricas a Monitorear

### Costo por Dia
- **Target:** Menos de $0.50 USD por agente por dia.
- **Alerta:** Si un agente supera 2x el target por 3 dias consecutivos, revisar.
- **Accion:** Analizar si se puede bajar modelo o reducir frecuencia.

### Heartbeats Vacios
- **Definicion:** Un heartbeat que se ejecuta y no encuentra nada nuevo que reportar.
- **Target:** Menos del 50% de heartbeats deberian ser vacios.
- **Si supera 50%:** Reducir frecuencia del heartbeat.

---

## Regla General

> **Si una tarea se ejecuta mas de 2 veces por dia, usa el modelo mas barato posible.**
