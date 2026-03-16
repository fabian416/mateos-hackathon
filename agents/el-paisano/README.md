# El Paisano — Agente Custom

> Lo definimos juntos. Este es el template en blanco para armar el agente que necesites.

## Qué es

El Paisano es el template base de Gaucho Solutions para agentes personalizados. No viene con un rol predefinido -- vos definís qué hace, cómo habla, y qué herramientas usa.

Ejemplos de lo que podés armar:
- Agente de agendamiento de turnos
- Agente de cobranzas
- Agente de ventas por WhatsApp
- Agente de seguimiento de pedidos
- Agente de encuestas y feedback
- Lo que se te ocurra

## Cómo usarlo

### Paso 1 -- Copiar el template

```bash
cd agents/_base
./deploy.sh --client-name mi-cliente --agent-type el-paisano --channels telegram
```

Esto crea una copia del template en `deployments/mi-cliente/` con todos los archivos listos para completar.

### Paso 2 -- Completar los placeholders

Abrí cada archivo del workspace y reemplazá los `{{placeholders}}` con la info del agente:

| Archivo | Qué completar |
|---------|---------------|
| `IDENTITY.md` | Nombre, rol, scope, modelo, canales |
| `SOUL.md` | Personalidad, templates de respuesta, escalamiento, SLAs |
| `AGENTS.md` | Reglas específicas, tabla de autonomía |
| `TOOLS.md` | Integraciones activas, contexto del cliente, knowledge base |
| `HEARTBEAT.md` | Tareas periódicas (si aplica) |

### Paso 3 -- Definir las reglas

Revisá estos puntos clave:

- **Tabla de autonomía** (AGENTS.md): qué puede hacer solo, qué necesita aprobación, qué está bloqueado
- **Templates** (SOUL.md): respuestas predefinidas para los escenarios más comunes
- **Escalamiento** (SOUL.md): cuándo y a quién escala
- **SLAs** (SOUL.md): tiempos de respuesta por canal

### Paso 4 -- Activar canales

Editá `config/channels.json` y activá solo los canales que necesite el agente. Todos son opcionales excepto Telegram.

### Paso 5 -- Deploy

```bash
cd agents/_base
./deploy.sh --client-name mi-cliente --agent-type el-paisano --channels telegram,whatsapp
```

## Placeholders -- Referencia completa

### IDENTITY.md
| Placeholder | Qué poner | Ejemplo |
|-------------|-----------|---------|
| `{{AGENT_CUSTOM_NAME}}` | Nombre del agente | "El Pulpero" |
| `{{AGENT_ROL_DESCRIPTION}}` | Rol en una frase | "Agente de turnos" |
| `{{AGENT_SCOPE}}` | Qué puede y no puede hacer | "Agendar y cancelar turnos..." |
| `{{AGENT_MODEL}}` | Modelo de IA | "anthropic/claude-haiku-4-5" |
| `{{AGENT_CHANNELS}}` | Canales habilitados | "WhatsApp, Telegram" |
| `{{DEPLOY_DATE}}` | Fecha de deploy | "2026-03-16" |

### SOUL.md
| Placeholder | Qué poner | Ejemplo |
|-------------|-----------|---------|
| `{{AGENT_CUSTOM_NAME}}` | Nombre del agente | "El Pulpero" |
| `{{AGENT_ROL_DESCRIPTION}}` | Rol en una frase | "de agendamiento de turnos" |
| `{{CLIENT_NAME}}` | Nombre del negocio | "Clínica del Sol" |
| `{{BRAND_MANTRA}}` | Voz de la marca | "Rápido, claro, sin vueltas." |
| `{{AGENT_PERSONALITY}}` | Lista de rasgos | Ver comentarios en el archivo |
| `{{AGENT_GOLDEN_RULE}}` | Frase resumen del tono | "Soná como el mejor empleado." |
| `{{AGENT_TEMPLATES}}` | Templates de respuesta | Ver comentarios en el archivo |
| `{{AGENT_ESCALATION}}` | Tabla de escalamiento | Ver comentarios en el archivo |
| `{{AGENT_SLAS}}` | Tiempos de respuesta | "WhatsApp: < 15 min" |

### AGENTS.md
| Placeholder | Qué poner | Ejemplo |
|-------------|-----------|---------|
| `{{AGENT_CUSTOM_RULES}}` | Reglas específicas | "NUNCA des info médica" |
| `{{AGENT_ACTION_N}}` | Acción en tabla de autonomía | "Confirmar turno" |
| `{{AGENT_PERMISSION_N}}` | Permiso de la acción | "Autónomo" |

### TOOLS.md
| Placeholder | Qué poner | Ejemplo |
|-------------|-----------|---------|
| `{{CLIENT_NAME}}` | Nombre del negocio | "Clínica del Sol" |
| `{{CLIENT_CONTEXT}}` | Descripción del negocio | "Clínica odontológica..." |
| `{{WHATSAPP_STATUS}}` | ACTIVO / INACTIVO / NO APLICA | "ACTIVO" |
| `{{EMAIL_STATUS}}` | ACTIVO / INACTIVO / NO APLICA | "INACTIVO" |
| `{{SHEETS_STATUS}}` | ACTIVO / INACTIVO / NO APLICA | "NO APLICA" |
| `{{CALENDAR_STATUS}}` | ACTIVO / INACTIVO / NO APLICA | "ACTIVO" |
| `{{TWITTER_STATUS}}` | ACTIVO / INACTIVO / NO APLICA | "NO APLICA" |
| `{{GMAIL_EMAIL}}` | Email configurado | "turnos@clinica.com" |
| `{{SHEETS_ID}}` | ID de la planilla | "1abc..." |
| `{{CALENDAR_ID}}` | ID del calendario | "primary" |
| `{{TWITTER_HANDLE}}` | Cuenta de Twitter | "@clinicadelsol" |
| `{{AGENT_CUSTOM_TOOLS}}` | Herramientas extra | Ver comentarios en el archivo |
| `{{CLIENT_PRODUCTS}}` | Productos/servicios | "Ortodoncia, limpieza..." |
| `{{CLIENT_FAQ}}` | Preguntas frecuentes | "P: Cuánto sale...? R: ..." |
| `{{CLIENT_CONTACT_INFO}}` | Datos de contacto | "Tel: 11-xxxx, Dir: ..." |

### HEARTBEAT.md
| Placeholder | Qué poner | Ejemplo |
|-------------|-----------|---------|
| `{{AGENT_HEARTBEAT_TASKS}}` | Tareas periódicas | "Revisá el calendario..." |

## Canales disponibles

| Canal | Para qué sirve | Notas |
|-------|----------------|-------|
| Telegram | Comunicación con operador | Siempre activo, obligatorio |
| WhatsApp | Atención a clientes | Tiempo real via OpenClaw |
| Email | Atención a clientes | Via himalaya, cada 60s |
| Google Sheets | Datos y registros | Lectura/escritura via API |
| Google Calendar | Turnos y eventos | Gestión de disponibilidad |
| Twitter/X | Contenido y engagement | Publicación y monitoreo |

## Trust Level

El Paisano arranca en **Trust Level 2** (Borrador + Aprobación):

| Nivel | Qué puede hacer |
|-------|-----------------|
| 1 | Redacta borradores, el operador aprueba todo |
| 2 | Autonomía en tareas simples, aprobación para el resto |
| 3 | Autonomía operativa, solo escala temas complejos |

El nivel se puede ajustar en AGENTS.md según las necesidades del cliente.

---

_El Paisano -- porque cada campo es distinto, y el que lo trabaja sabe cómo._
