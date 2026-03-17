# El Relator — Agente de Contenido y Comunicación

Cuenta la historia de tu marca todos los días. Artículos, posteos, newsletters y documentación.

## Deploy

```bash
./agents/_base/deploy.sh --client-name mi-empresa --agent-type el-relator --channels telegram
```

## Configuración

1. Completar `{{placeholders}}` en los archivos del workspace
2. Agregar credenciales en `.env`
3. Configurar Google Sheets para calendario editorial (opcional)
4. Configurar Twitter para publicación directa (opcional)

## Canales

- **Telegram** (requerido): comunicación con operador, aprobación de contenido
- **Twitter** (opcional): publicación de posts aprobados
- **Email** (opcional): envío de newsletters
- **Google Sheets** (opcional): tracking de calendario editorial
- **Google Calendar** (opcional): programación de publicaciones

## Trust Level

Nivel 2 (Draft & Approve) — todo contenido necesita aprobación del operador antes de publicarse.
