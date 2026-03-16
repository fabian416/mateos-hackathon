# Escalera de Confianza (Trust Ladder)

> Basado en el playbook de Felix Craft. Define cuanta autonomia tiene cada agente
> y como se sube o baja de nivel.

---

## Los 4 Niveles

### Nivel 1: Solo Lectura (Read-Only)

El agente puede observar, analizar y reportar, pero **no puede ejecutar ninguna accion**.
Todo lo que produce es informativo.

**Usa este nivel cuando:**
- El agente es nuevo y no fue probado todavia.
- Se esta evaluando si el agente sirve para la tarea.
- El dominio es sensible y no se tolera ningun error.

**El agente puede:**
- Leer datos y archivos.
- Generar reportes y analisis.
- Hacer recomendaciones.

**El agente NO puede:**
- Enviar mensajes a nadie.
- Modificar archivos o datos.
- Ejecutar acciones en ningun sistema.

---

### Nivel 2: Borrador + Aprobacion (Draft & Approve) -- DEFAULT

El agente prepara borradores y propuestas, pero **necesita aprobacion explicita
del operador antes de ejecutar**. Este es el nivel por defecto para todo agente nuevo
que ya paso la fase de evaluacion.

**Usa este nivel cuando:**
- El agente demostro que entiende el contexto.
- Las tareas tienen impacto moderado (mensajes a clientes, publicaciones, etc.).
- Queres mantener control pero no queres hacer todo vos.

**El agente puede:**
- Todo lo del Nivel 1.
- Redactar borradores de mensajes, contenido, respuestas.
- Proponer acciones con justificacion.
- Ejecutar la accion **solo despues de recibir OK del operador**.

**El agente NO puede:**
- Publicar, enviar o ejecutar nada sin aprobacion.
- Tomar decisiones que comprometan recursos (plata, reputacion).

---

### Nivel 3: Actuar Dentro de Limites (Act Within Bounds)

El agente puede ejecutar acciones **dentro de limites predefinidos** sin pedir
permiso cada vez. Solo escala si se sale del rango permitido.

**Usa este nivel cuando:**
- El agente tiene track record probado (minimo 2 semanas sin errores graves).
- Las tareas son repetitivas y los limites son claros.
- El costo de un error dentro de los limites es bajo y reversible.

**El agente puede:**
- Todo lo del Nivel 2.
- Ejecutar acciones dentro de los limites definidos (ej: responder consultas tipo X, publicar contenido pre-aprobado).
- Tomar decisiones operativas menores.

**El agente NO puede:**
- Salirse de los limites definidos sin escalar.
- Comprometer mas de ${{MAX_AUTONOMOUS_SPEND}} sin aprobacion.
- Cambiar estrategia o tono sin consultar.

**Limites tipicos que se definen:**
- Tipos de mensaje que puede enviar solo.
- Monto maximo de gasto autonomo.
- Horarios en los que puede actuar.
- Canales en los que puede publicar.

---

### Nivel 4: Autonomia Total (Full Autonomy) -- RARO

El agente opera con autonomia completa. Solo reporta resultados.
**Esto es raro y requiere confianza excepcional.**

**Usa este nivel cuando:**
- El agente lleva meses funcionando sin problemas.
- El dominio es de bajo riesgo.
- El operador quiere desligarse completamente de esa tarea.

**El agente puede:**
- Todo lo anterior.
- Tomar decisiones estrategicas dentro de su scope.
- Actuar sin limites predefinidos.

**El agente debe:**
- Reportar resultados periodicamente (minimo semanal).
- Escalar situaciones genuinamente nuevas o de alto impacto.
- Auto-limitarse si detecta incertidumbre alta.

---

## Reglas de Escalamiento (Subir de Nivel)

Para subir un agente de nivel, deben cumplirse **todas** estas condiciones:

| De -> A | Requisitos |
|---------|-----------|
| 1 -> 2 | El agente demostro comprension del contexto en al menos 5 interacciones. El operador esta conforme con la calidad. |
| 2 -> 3 | Minimo 2 semanas en Nivel 2 sin errores graves. Los limites del Nivel 3 estan documentados. El operador aprobo el cambio explicitamente. |
| 3 -> 4 | Minimo 1 mes en Nivel 3 sin salirse de limites. El dominio es de bajo riesgo. El operador aprobo el cambio explicitamente y entiende las implicaciones. |

**Quien decide:** Solo el operador puede subir de nivel. El agente puede sugerir
que esta listo, pero nunca auto-promoverse.

---

## Reglas de Des-escalamiento (Bajar de Nivel)

Un agente baja de nivel **inmediatamente** si:

- Comete un error que impacta al cliente o genera costo no autorizado.
- Actua fuera de sus limites definidos.
- El operador pierde confianza por cualquier motivo (no hace falta justificar).
- Hay un cambio de contexto importante (nuevo cliente, nuevo dominio, etc.).

**Regla de oro:** Bajar de nivel es barato y rapido. Subir es caro y lento. Ante la duda, bajar.

---

## Ejemplo: El Baqueano en Cada Nivel

| Aspecto | Nivel 1 | Nivel 2 (Default) | Nivel 3 | Nivel 4 |
|---------|---------|-------------------|---------|---------|
| **Heartbeat** | Reporta novedades | Reporta + sugiere acciones | Reporta + ejecuta rutinas | Maneja el sistema completo |
| **Mensajes a clientes** | No envia | Redacta borrador, espera OK | Envia respuestas tipo FAQ solo | Responde todo solo |
| **Contenido** | Analiza tendencias | Propone calendario + borradores | Publica contenido pre-aprobado | Crea y publica sin supervision |
| **Gastos** | No tiene acceso | Propone presupuesto | Gasta hasta $X/dia | Maneja presupuesto completo |
| **Decisiones estrategicas** | Observa y reporta | Propone con fundamento | Ejecuta dentro de playbook | Decide y ejecuta |

---

## Registro de Cambios de Nivel

| Fecha | Agente | De | A | Motivo | Aprobado por |
|-------|--------|-----|---|--------|-------------|
| {{DATE}} | {{AGENT}} | {{FROM}} | {{TO}} | {{REASON}} | {{APPROVER}} |
