# TEMPLATES-EXTRA.md — El Rastreador (Templates adicionales)

> Archivo de referencia para templates de resolucion de problemas comunes, resumen post-incidente y formato de escalamiento. Solo lee este archivo cuando necesites redactar algo relacionado.

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
> Si no te llega el mail, avisanos. {{SUPPORT_SIGNATURE}}

### App no carga / pantalla en blanco

> Hola [nombre], proba estos pasos en orden:
>
> 1. Cerra la app completamente y volvela a abrir
> 2. Si sigue igual, borra el cache (Ajustes > Apps > [app] > Borrar cache)
> 3. Si sigue, proba desde otro navegador o dispositivo
>
> Contanos en cual paso se soluciono (o si ninguno funciono). {{SUPPORT_SIGNATURE}}

### Error de pago / transaccion fallida

> Hola [nombre], veo que tuviste un problema con el pago. Necesito verificar:
>
> 1. Que metodo de pago usaste?
> 2. Te aparecio algun mensaje de error? (si tenes captura, mejor)
> 3. Se te desconto el monto de tu cuenta?
>
> Con eso lo reviso. {{SUPPORT_SIGNATURE}}

### Datos no se sincronizan

> Hola [nombre], para resolver el problema de sincronizacion:
>
> 1. Verifica que tengas conexion a internet estable
> 2. Cerra sesion y volve a iniciar
> 3. Si usas la app, asegurate de tener la ultima version
>
> Si sigue sin sincronizar despues de eso, avisanos que lo escalamos al equipo tecnico. {{SUPPORT_SIGNATURE}}

### Notificaciones no llegan

> Hola [nombre], revisemos las notificaciones:
>
> 1. En tu celular: Ajustes > Notificaciones > [app] > verificar que esten activadas
> 2. Dentro de la app: Configuracion > Notificaciones > verificar preferencias
> 3. Revisa que no tengas modo "No molestar" activado
>
> Si todo esta bien y sigue sin notificar, avisanos. {{SUPPORT_SIGNATURE}}

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
> Si te vuelve a pasar, escribinos. {{SUPPORT_SIGNATURE}}

### Template para informe interno (al operador via Telegram)

```
RESUMEN INCIDENTE
- Ticket: [ID si hay]
- Usuario: [nombre]
- Canal: [WhatsApp/Email]
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
- Tipo: [Servicio caido / Seguridad / Data breach / Otro]
- Impacto: [estimacion de usuarios afectados]
- Desde cuando: [timestamp]
- Deteccion: [reportado por usuario / detectado por monitoreo]
- Acciones tomadas: [que se hizo hasta ahora]
- REQUIERE ATENCION INMEDIATA
```

---

## Seguimiento y cierre

### Verificacion post-fix (24 hs despues)

> Hola [nombre], ayer te ayudamos con [problema]. Queriamos verificar: sigue todo bien o te volvio a pasar? {{SUPPORT_SIGNATURE}}

### Cierre por inactividad (48 hs sin respuesta del usuario)

> Hola [nombre], como no tuvimos respuesta, damos el caso por resuelto. Si te vuelve a pasar, escribinos sin problema. {{SUPPORT_SIGNATURE}}

### Encuesta de satisfaccion (si el cliente la tiene)

> Pudimos ayudarte? Tu feedback nos sirve para mejorar. {{SUPPORT_SIGNATURE}}
