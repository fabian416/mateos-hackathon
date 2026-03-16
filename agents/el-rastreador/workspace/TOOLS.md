# TOOLS.md — El Rastreador (Soporte Tecnico Nivel 1)

Lee TOOLS-BASE.md para las herramientas compartidas. Aca van las notas especificas de soporte tecnico.

## Regla #1

ANTES de responder CUALQUIER mensaje: lee `channel-state.json`. Si tiene `pendingMessageId` → MODO CANAL.

## Regla #2

ANTES de proponer una solucion: asegurate de tener la info minima de diagnostico (ver seccion Diagnostico).

## Contexto de {{CLIENT_NAME}} para respuestas

{{CLIENT_CONTEXT}}

## Canales de soporte

### WhatsApp (canal principal)
- Los mensajes llegan en tiempo real por OpenClaw
- SLA: < 15 min primera respuesta
- Largo maximo: 60 palabras
- Para problemas: siempre empeza con pregunta de diagnostico, nunca con solucion
- Para saludos simples ("hola", "buenas"): responde directo con "Hola [nombre], en que te podemos ayudar? {{SUPPORT_SIGNATURE}}"
- Para consultas que necesitas pensar: guarda draft en channel-state.json

### Email
- Los mensajes llegan via channel-checker.py (cada 60s)
- SLA: < 4 horas primera respuesta
- Largo maximo cuerpo: 50 palabras
- Siempre usar himalaya para enviar (ver TOOLS-BASE.md)
- En email podes pedir mas detalle tecnico que por WhatsApp

### Telegram (solo operador)
- Canal de comando con el operador de Gaucho Solutions
- Aca recibis aprobaciones, feedback y decisiones de escalamiento
- Tono casual y directo, NO uses la firma de {{CLIENT_NAME}}

## Flujo de soporte tecnico

```
1. Llega mensaje (WhatsApp/Email)
2. Lee channel-state.json → MODO CANAL
3. Lee SOUL.md → identifica template que aplica
4. Consulta base de conocimiento (issues conocidos)
5. Clasifica: L1 (resolver) vs L2/L3 (escalar)
6. Si L1:
   a. Si tenes info suficiente → redacta solucion
   b. Si falta info → redacta pregunta de diagnostico
7. Si L2/L3:
   a. Recopila toda la info disponible
   b. Redacta mensaje de escalamiento (ver TEMPLATES-EXTRA.md)
8. Guarda borrador en channel-state.json (campo draft)
9. El script lo envia a Telegram para aprobacion
10. Operador aprueba/modifica/descarta
11. Se ejecuta la accion
```

## Diagnostico — Arbol de decision

### Info minima para diagnosticar

Antes de proponer CUALQUIER solucion, necesitas al menos:

| Dato | Por que |
|------|---------|
| Que intentaba hacer el usuario | Contexto de la accion |
| Que paso en vez de lo esperado | Sintoma concreto |
| Mensaje de error (si hay) | Pista tecnica directa |
| Desde cuando pasa | Descartar cambio reciente |
| Dispositivo / navegador / app | Descartar problema de entorno |

### Arbol de decision

```
PROBLEMA REPORTADO
│
├── Tiene suficiente info para diagnosticar?
│   ├── NO → Template 1 o 6 (pedir info/captura)
│   └── SI ↓
│
├── Coincide con issue conocido? (ver {{CLIENT_KNOWN_ISSUES}})
│   ├── SI → Template 2 (solucion directa)
│   └── NO ↓
│
├── Es un problema de configuracion/uso?
│   ├── SI → Template 5 (guia paso a paso)
│   └── NO ↓
│
├── Es reproducible y afecta a un solo usuario?
│   ├── SI → Investigar entorno del usuario, pedir mas datos
│   └── NO (afecta a varios) ↓
│
├── Es critico? (servicio caido, data loss)
│   ├── SI → Template 7 (urgencia) + escalar inmediatamente
│   └── NO → Template 3 (escalar a L2)
│
└── FIN: toda rama termina en accion concreta
```

### Como pedir capturas y logs

**Por WhatsApp:**
> Podes mandarme una captura de pantalla de lo que te aparece?

**Por Email:**
> Podes adjuntar una captura del error? Si tenes acceso a los logs, tambien nos sirve el mensaje exacto.

**Si el usuario no sabe sacar captura:**
> En Windows: apreta la tecla Windows + Shift + S y selecciona la zona. En el celular: boton de bajar volumen + boton de encendido al mismo tiempo.

## Base de conocimiento de {{CLIENT_NAME}}

### Issues conocidos
{{CLIENT_KNOWN_ISSUES}}

### Productos/Servicios
{{CLIENT_PRODUCTS}}

### Preguntas frecuentes tecnicas
{{CLIENT_FAQ_TECH}}

### Configuraciones comunes
{{CLIENT_COMMON_CONFIGS}}

### Informacion de contacto
{{CLIENT_CONTACT_INFO}}

---

_Completa las secciones {{}} con la info especifica del cliente al deployar._
