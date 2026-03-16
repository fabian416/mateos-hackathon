# Perfil del Operador

## Datos Basicos

| Campo | Valor |
|-------|-------|
| **Nombre** | {{OPERATOR_NAME}} |
| **Rol** | Operador de Gaucho Solutions |
| **Zona horaria** | {{OPERATOR_TIMEZONE}} (default: ART / UTC-3) |
| **Horario activo** | {{OPERATOR_HOURS}} (default: 9:00 - 21:00 ART) |

---

## Preferencias de Comunicacion

### Idioma
- Espanol argentino. Tuteo, no voseo formal. Directo y sin vueltas.
- <!-- {{LANGUAGE_NOTES}} -->

### Largo de Mensajes
- Preferencia: {{MESSAGE_LENGTH}} (corto / medio / largo)
- Para updates de rutina: corto, al grano.
- Para analisis o propuestas: medio, con contexto suficiente para decidir.
- <!-- {{LENGTH_NOTES}} -->

### Formato de Aprobaciones
- El operador aprueba via: {{APPROVAL_CHANNEL}} (default: Telegram)
- Formato esperado: respuesta directa al mensaje del agente.
- Si no hay respuesta en {{APPROVAL_TIMEOUT}} (default: 4 horas), el agente recuerda una vez.
- Despues de 2 recordatorios sin respuesta, espera hasta el proximo dia habil.
- <!-- {{APPROVAL_NOTES}} -->

### Cosas que Molestan
- <!-- Lista de cosas que el operador NO quiere que haga el agente. -->
- {{ANNOYANCE_1}}
- {{ANNOYANCE_2}}
- {{ANNOYANCE_3}}

---

## Estilo de Trabajo

- **Velocidad de respuesta:** {{RESPONSE_SPEED}} (default: responde rapido, espera lo mismo)
- **Proactividad:** Prefiere que el agente sea proactivo y proponga cosas, no que espere instrucciones.
- **Feedback:** Directo y sin filtro. Si algo esta mal, lo dice. Espera lo mismo del agente.
- **Toma de decisiones:** {{DECISION_STYLE}} (default: rapido, con data suficiente)
- <!-- {{WORK_STYLE_NOTES}} -->

---

## Trust Levels por Agente

| Agente | Nivel Actual | Fecha Ultimo Cambio | Notas |
|--------|-------------|---------------------|-------|
| {{AGENT_1_NAME}} | {{AGENT_1_LEVEL}} | {{AGENT_1_DATE}} | {{AGENT_1_NOTES}} |
| {{AGENT_2_NAME}} | {{AGENT_2_LEVEL}} | {{AGENT_2_DATE}} | {{AGENT_2_NOTES}} |
| {{AGENT_3_NAME}} | {{AGENT_3_LEVEL}} | {{AGENT_3_DATE}} | {{AGENT_3_NOTES}} |

> Referencia completa de niveles en TRUST-LADDER.md

---

## Contexto Clave

<!-- Informacion de fondo sobre el operador que los agentes necesitan saber. -->
<!-- Puede incluir: proyectos actuales, prioridades, restricciones, etc. -->

- {{KEY_CONTEXT_1}}
- {{KEY_CONTEXT_2}}
- {{KEY_CONTEXT_3}}
