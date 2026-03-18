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

## Configuracion Actual por Tipo de Agente

| Agente | Modelo Principal | Modelo para Heartbeats | Notas |
|--------|-----------------|----------------------|-------|
| El Baqueano (Asistente Ejecutivo) | Haiku | Haiku | La mayoria de sus tareas son rutinarias. Escala a Sonnet solo para resumen semanal. |
| CEO Agent (Estrategia) | Sonnet | N/A (no tiene heartbeat) | Sus tareas requieren razonamiento. Escala a Opus para planificacion trimestral. |
| {{AGENT_NAME}} | {{PRIMARY_MODEL}} | {{HEARTBEAT_MODEL}} | {{COST_NOTES}} |

---

## Metricas a Monitorear

### Costo por Dia
- **Target:** Menos de ${{DAILY_TARGET}} USD por agente por dia.
- **Alerta:** Si un agente supera 2x el target por 3 dias consecutivos, revisar.
- **Accion:** Analizar si se puede bajar modelo o reducir frecuencia.

### Costo por Mensaje
- **Target:** Lo mas bajo posible sin sacrificar calidad.
- **Benchmark:** Haiku ~$0.001/msg, Sonnet ~$0.01/msg, Opus ~$0.05/msg (aproximado, depende del largo).
- **Accion:** Si el costo por mensaje sube sin que cambie la complejidad, algo anda mal.

### Heartbeats Vacios
- **Definicion:** Un heartbeat que se ejecuta y no encuentra nada nuevo que reportar.
- **Target:** Menos del 50% de heartbeats deberian ser vacios.
- **Si supera 50%:** Reducir frecuencia del heartbeat. No tiene sentido pagar por chequear nada.

---

## Frecuencia de Heartbeats

| Frecuencia | Usar cuando... | Costo estimado (Haiku) |
|------------|---------------|----------------------|
| Cada 5 min | Canales de alta urgencia (soporte critico) | ~$4/dia |
| Cada 15 min | Canales activos con expectativa de respuesta rapida | ~$1.50/dia |
| Cada 30 min | Canales normales de trabajo | ~$0.75/dia |
| Cada 1 hora | Monitoreo general, canales de bajo trafico | ~$0.40/dia |
| Cada 4 horas | Revision periodica, canales informativos | ~$0.10/dia |
| 1x por dia | Reportes diarios, resumen nocturno | ~$0.02/dia |

**Recomendacion por defecto:** Cada 30 minutos para agentes operativos. Cada 4 horas para agentes de monitoreo.

---

## Regla General

> **Si una tarea se ejecuta mas de 2 veces por dia, usa el modelo mas barato posible.**

La logica es simple:
- Las tareas frecuentes son las que mas cuestan en volumen.
- Si una tarea se repite mucho, probablemente es lo suficientemente simple para un modelo chico.
- Si un modelo chico no puede hacerla bien, la tarea esta mal definida. Simplificala antes de tirarle un modelo mas caro.

---

## Estrategia de Escalamiento de Modelo

Cuando un agente necesita un modelo mas potente para una tarea puntual:

1. **Default:** Usar el modelo asignado al agente.
2. **Escalamiento puntual:** Si la tarea lo requiere, usar un modelo superior para esa tarea especifica y volver al default.
3. **Escalamiento permanente:** Si el agente necesita escalar modelo mas de 3 veces por semana para la misma tarea, cambiar el modelo asignado a esa tarea.

**Nunca escalar el modelo default del agente entero.** Siempre escalar por tarea.

---

## Optimizaciones Futuras

- [ ] Implementar routing automatico: que el sistema decida que modelo usar segun la complejidad detectada del input.
- [ ] Cache de respuestas para preguntas frecuentes (evitar pagar por lo mismo dos veces).
- [ ] Metricas automaticas de costo por agente por dia con alertas.
- [ ] Batch processing para tareas no urgentes (mas barato en la mayoria de los providers).
