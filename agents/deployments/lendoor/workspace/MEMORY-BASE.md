# Sistema de Memoria del Agente

> Basado en el playbook "How to Hire an AI" - sistema de 3 capas para que el agente
> mantenga contexto entre sesiones y aprenda del operador con el tiempo.

---

## Arquitectura de 3 Capas

### Layer 1: MEMORY.md (Conocimiento Tacito)

Archivo unico y persistente que el agente lee al inicio de cada sesion.
Contiene preferencias, patrones y lecciones destiladas. Se actualiza solo cuando
hay algo nuevo que vale la pena recordar a largo plazo.

**Ubicacion:** `workspace/MEMORY.md`

**Cuando actualizar:** Al final de cada sesion donde se aprendio algo nuevo,
o cuando el operador da feedback explicito.

### Layer 2: Notas Diarias (Log Cronologico)

Un archivo por dia con el registro de lo que paso. Sirve como memoria de
corto/mediano plazo y como fuente para destilar patrones a Layer 1.

**Ubicacion:** `workspace/memory/YYYY-MM-DD.md`

**Formato de cada entrada:**
```markdown
## HH:MM - Titulo breve

- Que paso
- Que decidio el agente
- Resultado
- Feedback del operador (si hubo)
```

### Layer 3: Knowledge Graph (Futuro - Sistema PARA)

Estructura organizada por Proyectos, Areas, Recursos y Archivo (PARA).
Se implementara cuando la cantidad de conocimiento acumulado lo justifique.

**Estado:** Pendiente de implementacion.

---

## Reglas de Decaimiento de Memoria

| Categoria | Rango | Comportamiento |
|-----------|-------|----------------|
| **Hot (caliente)** | 0-7 dias | Se lee automaticamente al inicio de sesion. Contexto activo. |
| **Warm (tibia)** | 8-30 dias | Se consulta solo si es relevante al tema actual. |
| **Cold (fria)** | 30+ dias | No se carga automaticamente. Solo se busca si se necesita algo especifico. |

**Regla clave:** Si algo de warm o cold se vuelve relevante de nuevo, se promueve
a hot actualizando MEMORY.md.

---

## Rutina de Inicio de Sesion

Al arrancar cada sesion, el agente debe:

1. Leer `workspace/MEMORY.md` completo.
2. Leer las notas de los ultimos 3 dias (`workspace/memory/`).
3. Identificar tareas pendientes o contexto relevante.
4. Si hay algo que no cuadra o falta contexto, preguntar al operador.

---

## Plantilla de MEMORY.md

```markdown
# Memoria Persistente de el-baqueano-lendoor

> Ultima actualizacion: {{LAST_UPDATED}}

## Preferencias del Operador

<!-- Como le gusta que le hablen, que formato prefiere, que cosas evitar. -->
- {{PREFERENCE_1}}
- {{PREFERENCE_2}}

## Patrones Aprendidos

<!-- Cosas que se repiten y el agente ya deberia saber manejar solo. -->
- {{PATTERN_1}}
- {{PATTERN_2}}

## Lecciones

<!-- Errores cometidos y que se aprendio. No repetir los mismos errores. -->
- {{LESSON_1}}
- {{LESSON_2}}

## Contexto Durable

<!-- Informacion de fondo que no cambia seguido pero es importante tener presente. -->
- {{CONTEXT_1}}
- {{CONTEXT_2}}
```

---

## Notas para la Implementacion

- La Layer 1 no deberia superar las 200 lineas. Si crece mucho, hay que destilar y archivar.
- Las notas diarias se pueden comprimir despues de 30 dias (resumen de la semana).
- Nunca borrar informacion, solo archivar. La memoria es append-only salvo destilacion.
- El operador puede pedir "olvidate de X" y eso se respeta sacandolo de MEMORY.md.
