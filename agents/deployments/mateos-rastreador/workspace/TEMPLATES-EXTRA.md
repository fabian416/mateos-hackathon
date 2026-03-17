# TEMPLATES-EXTRA.md — El Rastreador (Templates adicionales)

> Archivo de referencia para templates de troubleshooting por categoria, resolucion de problemas comunes, resumen post-incidente y formato de escalamiento. Solo lee este archivo cuando necesites redactar algo relacionado.

---

## Troubleshooting por categoria

### Categoria: Conectividad

**Sintomas tipicos:** "no carga", "se queda en blanco", "dice sin conexion", "no se conecta", "tarda mucho"

#### Pregunta de triage

> Hola [nombre], necesito saber un par de cosas:
> 1. Te pasa solo con [app/sitio de MateOS] o con otras paginas tambien?
> 2. Estas por wifi o datos?
>
> Equipo MateOS 🧉

#### Diagnostico rapido

- Si tambien falla con otras paginas → problema de red del usuario, no nuestro. Guiar a verificar conexion.
- Si solo falla con MateOS → verificar si hay incidentes activos. Si no, pedir mas datos.
- Si es intermitente → pedir que pruebe en otra red (wifi ↔ datos) para descartar.

#### Solucion L1 (si es del lado del usuario)

> Proba esto:
> 1. Cambia de red (si estas en wifi, proba con datos o al reves)
> 2. Si tenes VPN, desactivala
> 3. Proba abrir desde otro navegador
>
> Avisa si con alguno de esos pasos anda. Equipo MateOS 🧉

#### Escalar si

- El usuario ya probo cambiar de red y sigue fallando
- Hay mas de un reporte similar en la ultima hora
- El error incluye codigos 502, 503, 504 o "DNS resolution failed"

---

### Categoria: Autenticacion

**Sintomas tipicos:** "no puedo entrar", "me dice contrasena incorrecta", "se cierra la sesion", "no me deja logear", "me pide verificacion"

#### Pregunta de triage

> Hola [nombre], que te aparece cuando intentas entrar? Si podes mandar captura del error, mejor. Tambien decime: antes podias entrar sin problema o es la primera vez? Equipo MateOS 🧉

#### Diagnostico rapido

- "Contrasena incorrecta" → puede ser typo, caps lock, o que realmente la olvido
- "Sesion expirada" / "Token invalido" → cerrar sesion, limpiar cache, volver a entrar
- "Cuenta bloqueada" → demasiados intentos. Necesita reset.
- "Verificacion" / "2FA" → si no le llega el codigo, verificar telefono/mail. Si lo perdio, escalar.
- "No existe esa cuenta" → verificar email correcto, puede haber usado otro

#### Solucion L1: Password reset

> Para recuperar tu acceso:
> 1. Anda a [URL de recuperacion]
> 2. Pone tu email y dale a "Recuperar contrasena"
> 3. Revisa tu bandeja (y spam) — te llega un mail en menos de 5 min
> 4. Segui el link y crea una contrasena nueva
>
> Si no te llega el mail, avisanos. Equipo MateOS 🧉

#### Solucion L1: Sesion expirada

> Proba cerrar sesion, limpiar el cache del navegador, y volver a entrar. Si usas la app, cerra y abrila de nuevo. Equipo MateOS 🧉

#### Escalar si

- El usuario hizo password reset y sigue sin poder entrar
- La cuenta esta bloqueada y no se puede desbloquear desde la UI
- El usuario perdio acceso al mail o telefono de recuperacion
- Hay indicios de acceso no autorizado (sesiones que no reconoce, cambios que no hizo) → LUZ ROJA

---

### Categoria: Performance

**Sintomas tipicos:** "esta lento", "tarda mucho", "se cuelga", "se traba", "va a los pedos"

#### Pregunta de triage

> Hola [nombre], cuando decis que esta lento: es todo o alguna parte en particular? (por ej: la carga inicial, una accion especifica, etc.) Y desde cuando te pasa? Equipo MateOS 🧉

#### Diagnostico rapido

- Lento en todo → puede ser internet del usuario o el servidor. Pedir que pruebe otra pagina.
- Lento en una accion especifica → posible bug de performance. Anotar que accion.
- Lento desde siempre → puede ser el dispositivo del usuario (viejo, poca RAM)
- Lento desde una fecha → buscar si hubo cambios/deploys en esa fecha. Si no sabes, escalar.
- Se cuelga completamente → diferente a lento. Pedir datos del dispositivo y version.

#### Solucion L1 (descarte de entorno del usuario)

> Probemos descartar que sea tu dispositivo:
> 1. Cerra otras pestanias y apps que no estes usando
> 2. Proba en modo incognito del navegador (Ctrl+Shift+N)
> 3. Si usas la app, verifica que tengas la ultima version
>
> Si en incognito anda bien, el problema es una extension o el cache. Equipo MateOS 🧉

#### Escalar si

- El usuario descarto su entorno y sigue lento
- Es una accion especifica que antes era rapida (regresion)
- Multiples usuarios reportan lentitud al mismo tiempo
- Se cuelga completamente (crash, no lentitud)

---

### Categoria: Datos / Informacion incorrecta

**Sintomas tipicos:** "no me aparece", "los datos estan mal", "falta informacion", "veo numeros distintos", "se borro algo", "no se guardo"

#### Pregunta de triage

> Hola [nombre], que datos esperabas ver y que te aparece? Si podes mandar captura de lo que ves (y de lo que deberia verse, si lo tenes) me ayuda mucho a rastrear el problema. Equipo MateOS 🧉

#### Diagnostico rapido

- "No me aparece X" → puede ser filtro activo, busqueda incorrecta, o dato que no se sincronizo
- "Los datos estan mal" → puede ser cache viejo (probar refresh forzado), o un bug real
- "Se borro algo" → ATENCION. Si hay data loss potencial, es LUZ ROJA. Recopilar que se borro y cuando.
- "No se guardo" → puede haber dado error al guardar sin notarlo. Pedir que reintente.
- "Veo datos de otra persona" → LUZ ROJA INMEDIATA. No investigar, escalar.

#### Solucion L1 (datos no actualizados / cache)

> Proba hacer un refresh forzado: en PC es Ctrl+Shift+R, en la app cerra y volve a abrir. Si siguen los datos viejos, cerra sesion, limpia cache y volve a entrar. Equipo MateOS 🧉

#### Solucion L1 (dato no se guardo)

> Intenta cargar la informacion de nuevo. Si al guardar te aparece algun error, mandame captura del mensaje. Equipo MateOS 🧉

#### Escalar si

- Los datos incorrectos persisten despues de limpiar cache
- Se confirma data loss (algo que existia ya no esta)
- El usuario ve datos de otro usuario → LUZ ROJA
- Los numeros no coinciden entre pantallas o reportes → puede ser bug de calculo
- Multiples usuarios ven datos inconsistentes

---

### Categoria: Pagos / Transacciones

**Sintomas tipicos:** "el pago no paso", "me cobraron dos veces", "no me llego el comprobante", "la transaccion fallo", "quiero reembolso"

#### Pregunta de triage

> Hola [nombre], necesito verificar:
> 1. Que metodo de pago usaste?
> 2. Te aparecio algun mensaje de error?
> 3. Se te desconto el monto de tu cuenta bancaria?
>
> Con eso lo reviso. Equipo MateOS 🧉

#### Diagnostico rapido

- Pago fallo sin descuento → reintentar, verificar datos de tarjeta, probar otro metodo
- Pago fallo CON descuento → LUZ ROJA. El dinero salio pero no se registro. Escalar.
- Cobro doble → LUZ ROJA. Escalar con datos exactos (montos, fechas, comprobantes).
- No llego comprobante → verificar email/spam. Si sigue sin aparecer, puede ser que no se genero.
- Reembolso → El Rastreador NO procesa reembolsos. Recopilar info y escalar.

#### Solucion L1 (pago fallo sin descuento)

> Proba de nuevo verificando que los datos de la tarjeta esten correctos. Si te sigue fallando, proba con otro metodo de pago si es posible. Equipo MateOS 🧉

#### Escalar si

- Se desconto dinero pero la transaccion no aparece en el sistema
- Cobro doble o monto incorrecto
- Pedido de reembolso (siempre escalar, nunca prometer)
- Error recurrente con multiples metodos de pago

---

### Categoria: Integraciones / API

**Sintomas tipicos:** "no se conecta con [servicio]", "la sincronizacion no funciona", "la API da error"

#### Pregunta de triage

> Hola [nombre], con que servicio se deberia conectar y que error te aparece? Desde cuando dejo de funcionar? Equipo MateOS 🧉

#### Diagnostico rapido

- "Antes andaba y ahora no" → posible cambio de credenciales/permisos, o caida del servicio externo
- "Nunca funciono" → posible problema de configuracion inicial. Verificar pasos de setup.
- Error con codigo HTTP → ver tabla de patrones de error en TOOLS.md

#### Solucion L1 (reconexion basica)

> Proba desconectar la integracion y volver a conectarla. En general: anda a Configuracion > Integraciones > [servicio] > Desconectar, y despues conectala de nuevo. Equipo MateOS 🧉

#### Escalar si

- La reconexion no funciona
- El error menciona permisos o tokens (puede necesitar regenerar credenciales)
- El servicio externo esta caido (verificar su status page)
- Es una integracion custom o API directa → siempre L2

---

## Resolucion de problemas comunes

### Password reset / No puedo acceder

> Hola [nombre], para recuperar tu acceso:
>
> 1. Anda a [URL de recuperacion]
> 2. Pone tu email y dale a "Recuperar contrasena"
> 3. Revisa tu bandeja (y spam) — te llega un mail en menos de 5 min
> 4. Segui el link y crea una contrasena nueva
>
> Si no te llega el mail, avisanos. Equipo MateOS 🧉

### App no carga / pantalla en blanco

> Hola [nombre], proba estos pasos en orden:
>
> 1. Cerra la app completamente y volvela a abrir
> 2. Si sigue igual, borra el cache (Ajustes > Apps > [app] > Borrar cache)
> 3. Si sigue, proba desde otro navegador o dispositivo
>
> Contanos en cual paso se soluciono (o si ninguno funciono). Equipo MateOS 🧉

### Error de pago / transaccion fallida

> Hola [nombre], veo que tuviste un problema con el pago. Necesito verificar:
>
> 1. Que metodo de pago usaste?
> 2. Te aparecio algun mensaje de error? (si tenes captura, mejor)
> 3. Se te desconto el monto de tu cuenta?
>
> Con eso lo reviso. Equipo MateOS 🧉

### Datos no se sincronizan

> Hola [nombre], para resolver el problema de sincronizacion:
>
> 1. Verifica que tengas conexion a internet estable
> 2. Cerra sesion y volve a iniciar
> 3. Si usas la app, asegurate de tener la ultima version
>
> Si sigue sin sincronizar despues de eso, avisanos que lo escalamos al equipo tecnico. Equipo MateOS 🧉

### Notificaciones no llegan

> Hola [nombre], revisemos las notificaciones:
>
> 1. En tu celular: Ajustes > Notificaciones > [app] > verificar que esten activadas
> 2. Dentro de la app: Configuracion > Notificaciones > verificar preferencias
> 3. Revisa que no tengas modo "No molestar" activado
>
> Si todo esta bien y sigue sin notificar, avisanos. Equipo MateOS 🧉

---

## Resumen post-incidente

### Template para informar al usuario despues de resolver

> Hola [nombre], te cuento como quedo:
>
> **Problema:** [descripcion breve del problema]
> **Causa:** [que lo causaba]
> **Solucion:** [que se hizo]
> **Estado:** Resuelto
>
> Si te vuelve a pasar, escribinos. Equipo MateOS 🧉

### Template para informe interno (al operador via Telegram)

```
RESUMEN INCIDENTE
- Ticket: [ID si hay]
- Usuario: [nombre]
- Canal: [WhatsApp/Email]
- Categoria: [Conectividad/Autenticacion/Performance/Datos/Pagos/Integracion/Otro]
- Problema: [descripcion]
- Diagnostico: [que se encontro]
- Resolucion: [que se hizo]
- Nivel: [L1/L2/L3]
- Tiempo de resolucion: [X min/horas]
- Recurrente: [Si/No — si es si, sugerir accion preventiva]
```

---

## Formato de escalamiento

### Escalar a L2 (Tecnico)

Cuando escales a L2, SIEMPRE incluir:

```
ESCALAMIENTO A L2
- Usuario: [nombre]
- Canal: [WhatsApp/Email]
- Categoria: [Conectividad/Autenticacion/Performance/Datos/Pagos/Integracion]
- Problema reportado: [lo que dijo el usuario]
- Info recopilada:
  - Dispositivo/Navegador: [dato]
  - Desde cuando: [dato]
  - Error exacto: [dato o captura]
  - Pasos para reproducir: [si los tenes]
- Diagnostico L1: [que descartaste, que sospechas]
- Intentos de solucion: [que se probo y no funciono]
- Prioridad: [Alta/Media/Baja]
```

### Escalar a L3 (Desarrollo)

```
ESCALAMIENTO A L3
- Todo lo de L2, mas:
- Componente afectado: [modulo/servicio/API]
- Reproducible: [Si/No — pasos exactos]
- Impacto: [cuantos usuarios, que funcionalidad]
- Logs relevantes: [si hay]
- Workaround disponible: [Si/No — cual]
```

### Escalar por Crisis

```
ALERTA CRISIS
- Tipo: [Servicio caido / Seguridad / Data breach / Data loss / Cobro duplicado / Otro]
- Categoria: [del triage de AGENTS.md]
- Impacto: [estimacion de usuarios afectados]
- Desde cuando: [timestamp]
- Deteccion: [reportado por usuario / detectado por monitoreo / alerta automatica]
- Acciones tomadas: [que se hizo hasta ahora]
- REQUIERE ATENCION INMEDIATA
```

---

## Seguimiento y cierre

### Verificacion post-fix (24 hs despues)

> Hola [nombre], ayer te ayudamos con [problema]. Queriamos verificar: sigue todo bien o te volvio a pasar? Equipo MateOS 🧉

### Cierre por inactividad (48 hs sin respuesta del usuario)

> Hola [nombre], como no tuvimos respuesta, damos el caso por resuelto. Si te vuelve a pasar, escribinos sin problema. Equipo MateOS 🧉

### Encuesta de satisfaccion (si el cliente la tiene)

> Pudimos ayudarte? Tu feedback nos sirve para mejorar. Equipo MateOS 🧉
