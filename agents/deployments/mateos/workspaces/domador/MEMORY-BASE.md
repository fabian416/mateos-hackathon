# Sistema de Memoria del Agente

> Basado en el playbook "How to Hire an AI" de Felix Craft / The Masinov Company.
> Sistema de 3 capas para que el agente mantenga contexto entre sesiones y aprenda del operador con el tiempo.

---

## Arquitectura de 3 Capas

### Layer 1: MEMORY.md (Conocimiento Tácito)

Archivo único y persistente que el agente lee al inicio de cada sesión.
Contiene preferencias, patrones y lecciones destiladas. Es la **memoria de largo plazo** del agente — lo que "sabe sin que se lo digan".

**Ubicación:** `workspace/MEMORY.md`

**Cuándo actualizar:** Al final de cada sesión donde se aprendió algo nuevo,
o cuando el operador da feedback explícito.

**Qué va acá:**
- Preferencias del operador que se repiten ("no me mandes mensajes largos", "los lunes revisamos métricas")
- Patrones del negocio del cliente ("los viernes hay más consultas", "el producto X siempre genera dudas sobre Y")
- Lecciones aprendidas de errores ("la última vez que asumí Z, fue incorrecto — siempre preguntar")
- Contexto durable que no cambia seguido pero es importante

**Qué NO va acá:**
- Datos de un caso puntual (eso va en notas diarias)
- Información que caduca en menos de una semana
- Textos largos — cada entrada debe ser una línea o dos máximo

### Layer 2: Notas Diarias (Log Cronológico)

Un archivo por día con el registro de lo que pasó. Sirve como memoria de
corto/mediano plazo y como fuente para destilar patrones a Layer 1.

**Ubicación:** `workspace/memory/YYYY-MM-DD.md`

**Formato de cada entrada:**
```markdown
## HH:MM - Titulo breve

- Qué pasó
- Qué decidió el agente
- Resultado
- Feedback del operador (si hubo)
```

### Layer 3: Knowledge Graph (Futuro — Sistema PARA)

Estructura organizada por Proyectos, Áreas, Recursos y Archivo (PARA).
Se implementará cuando la cantidad de conocimiento acumulado lo justifique.

**Estado:** Pendiente de implementación.

---

## Reglas de Decaimiento de Memoria

La memoria no es infinita. Para no sobrecargar el contexto del agente, cada capa de notas diarias tiene una "temperatura" que determina si se carga o no.

| Categoría | Rango | Comportamiento |
|-----------|-------|----------------|
| **Hot (caliente)** | 0-7 días | Se lee automáticamente al inicio de sesión. Contexto activo. El agente las tiene siempre presentes. |
| **Warm (tibia)** | 8-30 días | NO se carga automáticamente. Se consulta solo si el tema actual requiere contexto de esos días. El agente busca en estas notas si algo no le cierra. |
| **Cold (fría)** | 30+ días | NO se carga. Solo se busca si se necesita algo muy específico y el operador lo pide. Candidata a compresión o archivo. |

### Reglas de transición

- **Hot → Warm (día 8):** La nota deja de cargarse automáticamente. Si contenía algo importante y recurrente, debe haberse destilado a MEMORY.md antes de este punto.
- **Warm → Cold (día 31):** La nota se puede comprimir a un resumen semanal. Los datos puntuales se pierden salvo que estén en MEMORY.md.
- **Cold → Archivo:** Después de 90 días, las notas diarias se pueden archivar (mover a `workspace/memory/archive/`). Nunca borrar.
- **Promoción:** Si algo de warm o cold se vuelve relevante de nuevo, se promueve a hot actualizando MEMORY.md con la lección o el patrón.

### Qué destilar a MEMORY.md (Layer 1)

Al final de cada semana (o cuando el volumen lo justifique), revisá las notas hot y preguntate:

1. ¿Se repitió algo 3+ veces? → Pattern para MEMORY.md
2. ¿El operador corrigió algo? → Lección para MEMORY.md
3. ¿Hay contexto que voy a necesitar en 2 semanas? → Contexto durable para MEMORY.md
4. ¿Algo cambió permanentemente? (nueva política, nuevo producto, etc.) → Actualizar MEMORY.md

---

## Rutina de Inicio de Sesión

Al arrancar cada sesión, el agente debe:

1. Leer `workspace/MEMORY.md` completo.
2. Leer las notas de los últimos 7 días (`workspace/memory/`) — toda la capa hot.
3. Identificar tareas pendientes o contexto relevante.
4. Si hay algo que no cuadra o falta contexto, preguntar al operador.

---

## Plantilla de MEMORY.md

```markdown
# Memoria Persistente de El Domador — MateOS

> Ultima actualizacion: 2026-03-17

## Preferencias del Operador

<!-- Como le gusta que le hablen, que formato prefiere, que cosas evitar. -->
-

## Patrones Aprendidos

<!-- Cosas que se repiten y el agente ya deberia saber manejar solo. -->
-

## Lecciones

<!-- Errores cometidos y que se aprendio. No repetir los mismos errores. -->
-

## Contexto Durable

<!-- Informacion de fondo que no cambia seguido pero es importante tener presente. -->
- MateOS arma agentes de IA para negocios argentinos. El Domador maneja la admin interna: tracking de clientes en Google Sheets, reportes de facturación, seguimiento de deadlines.
```

---

## Notas para la Implementación

- La Layer 1 no debería superar las 200 líneas. Si crece mucho, hay que destilar y archivar.
- Las notas diarias se pueden comprimir después de 30 días (resumen de la semana).
- Nunca borrar información, solo archivar. La memoria es append-only salvo destilación.
- El operador puede pedir "olvidate de X" y eso se respeta sacándolo de MEMORY.md.
- La sesión de inicio carga MEMORY.md + 7 días de notas. Si eso supera el 20% del contexto disponible del modelo, hay que destilar más agresivamente.
