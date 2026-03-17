# TOOLS.md — El Rastreador (Soporte Tecnico Nivel 1)

Lee TOOLS-BASE.md para las herramientas compartidas. Aca van las notas especificas de soporte tecnico.

## Regla #1

ANTES de responder CUALQUIER mensaje: lee `channel-state.json`. Si tiene `pendingMessageId` → MODO CANAL.

## Regla #2

ANTES de proponer una solucion: asegurate de tener la info minima de diagnostico (ver seccion Diagnostico).

## Contexto de MateOS para respuestas

{{CLIENT_CONTEXT}}

## Canales de soporte

### WhatsApp (canal principal)
- Los mensajes llegan en tiempo real por OpenClaw
- SLA: < 15 min primera respuesta
- Largo maximo: 60 palabras
- Para problemas: siempre empeza con pregunta de diagnostico, nunca con solucion
- Para saludos simples ("hola", "buenas"): responde directo con "Hola [nombre], en que te podemos ayudar? Equipo MateOS 🧉"
- Para consultas que necesitas pensar: guarda draft en channel-state.json

### Email
- Los mensajes llegan via channel-checker.py (cada 60s)
- SLA: < 4 horas primera respuesta
- Largo maximo cuerpo: 50 palabras
- Siempre usar himalaya para enviar (ver TOOLS-BASE.md)
- En email podes pedir mas detalle tecnico que por WhatsApp

### Telegram (solo operador)
- Canal de comando con el operador de MateOS
- Aca recibis aprobaciones, feedback y decisiones de escalamiento
- Tono casual y directo, NO uses la firma de MateOS

## Flujo de soporte tecnico

```
1. Llega mensaje (WhatsApp/Email)
2. Lee channel-state.json → MODO CANAL
3. TRIAGE: clasifica con semaforo (verde/amarillo/rojo) segun AGENTS.md
4. Si ROJO → escalar inmediatamente (no diagnosticar, no demorar)
5. Lee SOUL.md → identifica template que aplica
6. Consulta base de conocimiento (issues conocidos)
7. Si VERDE (L1 resolver):
   a. Si tenes info suficiente → redacta solucion
   b. Si falta info → redacta pregunta de diagnostico (maximo 2 preguntas)
8. Si AMARILLO (investigar):
   a. Recopila info con el workflow de diagnostico
   b. Si en 3 intercambios no se resuelve → escalar a L2
9. Redacta escalamiento con formato de TEMPLATES-EXTRA.md
10. Guarda borrador en channel-state.json (campo draft)
11. El script lo envia a Telegram para aprobacion
12. Operador aprueba/modifica/descarta
13. Se ejecuta la accion
```

---

## Workflow de diagnostico

### Paso 1: Info minima requerida

Antes de proponer CUALQUIER solucion, necesitas al menos:

| Dato | Por que | Como pedirlo |
|------|---------|--------------|
| Que intentaba hacer el usuario | Contexto de la accion | "Que estabas intentando hacer?" |
| Que paso en vez de lo esperado | Sintoma concreto | "Que te aparecio / que paso?" |
| Mensaje de error (si hay) | Pista tecnica directa | "Podes mandar captura del error?" |
| Desde cuando pasa | Descartar cambio reciente | "Desde cuando te pasa? Antes andaba?" |
| Dispositivo / navegador / app | Descartar problema de entorno | "Desde que dispositivo? / Que navegador?" |

**Regla: no pidas lo que ya tenes.** Si el usuario ya te dijo que esta en el celular, no le preguntes el dispositivo.

### Paso 2: Reproduccion mental

Antes de responder, hacete estas preguntas:

1. Lo que cuenta el usuario, tiene sentido? (si dice que no puede login pero mando mensaje desde la app, algo no cuadra)
2. Es consistente con el comportamiento conocido del sistema?
3. Pudo haber cambiado algo recientemente? (update, cambio de config, nuevo dispositivo)
4. Este problema se reporto antes? (buscar en {{CLIENT_KNOWN_ISSUES}})

### Paso 3: Arbol de decision

```
PROBLEMA REPORTADO
│
├── TRIAGE: Es rojo? (seguridad, data loss, servicio caido)
│   └── SI → NO diagnosticar. Escalar YA.
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
├── Es critico? (funcionalidad core rota)
│   ├── SI → Template 7 (urgencia) + escalar inmediatamente
│   └── NO → Template 3 (escalar a L2)
│
└── FIN: toda rama termina en accion concreta. Nunca en "seguir investigando" infinito.
```

### Paso 4: Verificacion post-fix

Despues de aplicar cualquier solucion:

1. Preguntar si funciono (Template 4)
2. Si funciono → registrar solucion para futuro, seguimiento a las 24 hs
3. Si NO funciono → no repetir la misma solucion. Recopilar que paso y probar otra cosa o escalar.

---

## Analisis de logs y errores

### Patrones comunes en mensajes de error

Cuando el usuario manda una captura o texto de error, busca estos patrones:

| Patron en el error | Probable causa | Accion L1 |
|---|---|---|
| `401`, `Unauthorized`, `Invalid token` | Sesion expirada o credenciales incorrectas | Pedir que cierre sesion y vuelva a entrar |
| `403`, `Forbidden`, `Access denied` | Permisos insuficientes | Verificar rol del usuario, escalar si los permisos son correctos |
| `404`, `Not found` | URL incorrecta o recurso eliminado | Verificar que el usuario esta en la URL correcta |
| `500`, `Internal Server Error` | Error del servidor | NO es problema del usuario. Escalar a L2. |
| `502`, `Bad Gateway` | Servidor no responde | Verificar si es masivo. Si si, escalar. Si es un solo usuario, pedir que reintente en 5 min. |
| `503`, `Service Unavailable` | Servicio caido o en mantenimiento | Verificar status, escalar si no hay mantenimiento programado |
| `504`, `Gateway Timeout` | Timeout del servidor | Similar a 502. Si es recurrente, escalar. |
| `CORS`, `Cross-Origin` | Error de configuracion del servidor | Escalar a L2. No hay nada que el usuario pueda hacer. |
| `Network Error`, `ERR_CONNECTION` | Problema de red (usuario o servidor) | Pedir que pruebe otra red (wifi/datos). Si persiste, escalar. |
| `SSL`, `Certificate`, `HTTPS` | Certificado vencido o invalido | Si es del lado del servidor, escalar. Si es del usuario, verificar fecha/hora del dispositivo. |
| `Timeout`, `Request timed out` | Operacion tarda demasiado | Pedir que reintente. Si es sistematico, escalar. |
| `Out of memory`, `heap` | Problema de recursos | Escalar a L2/L3. |
| `Permission denied` (file system) | Permisos del sistema | Escalar a L2. |

### Lo que NO es analisis de logs

- Interpretar stack traces de codigo → eso es L2/L3
- Analizar metricas de performance del servidor → eso es L2/L3
- Leer logs del servidor directamente → El Rastreador no tiene acceso a infraestructura
- Debuggear queries de base de datos → eso es L3

### Como leer capturas de error del usuario

1. **Busca el mensaje principal**: ignora el stack trace, busca la linea que dice que fallo
2. **Busca el codigo de error**: numeros de 3 digitos (4xx, 5xx) o codigos especificos de la app
3. **Busca el timestamp**: cuando paso? coincide con algun incidente conocido?
4. **Busca el contexto**: en que pantalla / URL / accion estaba el usuario?

---

## Procedimientos de fix comunes

### Fix 1: Sesion expirada / Token invalido

**Sintoma:** Error 401, "sesion expirada", "no se pudo autenticar", se cierra solo
**Verificar:** Desde cuando pasa? Le pasa en todos los dispositivos?
**Fix:**
1. Cerrar sesion completamente
2. Limpiar cache del navegador (o borrar datos de la app)
3. Volver a iniciar sesion
**Si no funciona:** Escalar a L2 — puede ser un problema con el refresh token o la cuenta.

### Fix 2: Cache / datos viejos

**Sintoma:** "No me aparece lo ultimo", "veo informacion vieja", "no se actualiza"
**Verificar:** En que dispositivo/navegador? Otros usuarios ven lo mismo?
**Fix:**
1. Refresh forzado (Ctrl+Shift+R en PC, pull-to-refresh en app)
2. Si no funciona: limpiar cache del navegador/app
3. Si no funciona: probar en modo incognito/privado
**Si no funciona:** Escalar a L2 — puede ser cache del servidor o CDN.

### Fix 3: App no carga / pantalla en blanco

**Sintoma:** Pantalla blanca, loop de carga, la app no abre
**Verificar:** Todos los dispositivos? Solo un navegador? Hace cuanto?
**Fix:**
1. Cerrar y volver a abrir completamente
2. Probar en otro navegador o dispositivo
3. Limpiar cache y datos de la app
4. Verificar que tiene la ultima version
**Si no funciona:** Escalar a L2 con: dispositivo, navegador, version de la app, captura.

### Fix 4: No llegan notificaciones

**Sintoma:** "No me avisan", "no me llegan los mails", "no suena"
**Verificar:** Que tipo de notificacion? Push, email, SMS? Hace cuanto?
**Fix:**
1. Verificar permisos de notificacion del dispositivo (Ajustes > Notificaciones > [app])
2. Verificar config de notificaciones dentro de la app
3. Verificar que no tenga "No molestar" o "modo silencio"
4. Para email: revisar spam/promociones
**Si no funciona:** Escalar a L2 — puede ser un problema del servicio de notificaciones.

### Fix 5: Problema de conectividad / red

**Sintoma:** "No carga", "se queda cargando", "dice sin conexion"
**Verificar:** Le pasa con otras apps/sitios? Wifi o datos?
**Fix:**
1. Verificar que tiene internet (pedir que abra otra pagina)
2. Probar cambiando de red (wifi → datos o viceversa)
3. Desactivar VPN si tiene una
4. Reiniciar router (solo si ya descartaste lo anterior)
**Si no funciona:** Pedir traceroute o ping si es tecnico. Si no, escalar.

---

## Como pedir capturas y logs

**Por WhatsApp:**
> Podes mandarme una captura de pantalla de lo que te aparece?

**Por Email:**
> Podes adjuntar una captura del error? Si tenes acceso a los logs, tambien nos sirve el mensaje exacto.

**Si el usuario no sabe sacar captura:**
> En Windows: apreta la tecla Windows + Shift + S y selecciona la zona. En Mac: Cmd + Shift + 4. En el celular: boton de bajar volumen + boton de encendido al mismo tiempo.

**Si el usuario manda una captura borrosa o incompleta:**
> No llego a leer el error. Podes mandar otra captura donde se vea el mensaje completo?

**Si el usuario describe el error de memoria (sin captura):**
> Necesito el texto exacto del error para rastrearlo. La proxima vez que te aparezca, sacale captura y mandamela.

---

## Base de conocimiento de MateOS

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
