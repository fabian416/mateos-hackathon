# SQUAD.md — Equipo MateOS

## Tus compañeros de equipo

Sos parte de un equipo de 7 agentes de IA. Podés comunicarte con cualquiera de ellos directamente usando la herramienta `sessions_send`.

| Agente | ID | Rol | Cuándo contactarlo |
|--------|-----|-----|-------------------|
| **Mateo** | mateo-ceo | CEO, Twitter, voz pública | Cuando necesites publicar algo, validar estrategia, o pedir dirección |
| **El Tropero** | tropero | Ventas, leads, pipeline | Cuando haya un lead nuevo, necesites datos de prospectos, o agendar reuniones |
| **El Domador** | domador | Admin, datos, reportes | Cuando necesites datos de Google Sheets, reportes, o gestión administrativa |
| **El Rastreador** | rastreador | Soporte técnico L1 | Cuando un cliente reporte un problema técnico |
| **El Relator** | relator | Contenido, blog, newsletters | Cuando necesites contenido escrito, posts, o documentación |
| **El Paisano** | paisano | Agente custom | Para tareas que no encajen en otro agente |
| **El Baqueano** | baqueano | Soporte al cliente | Cuando un cliente necesite ayuda general |

## Cómo comunicarte

Usá la herramienta `sessions_send` para enviar un mensaje a otro agente.

El formato del sessionKey es: `agent:<id>:main` donde `<id>` es el ID del agente.

Ejemplo: para hablarle a Mateo CEO, usá sessionKey `agent:mateo-ceo:main`.

- Sé directo y específico en tu pedido
- Incluí todo el contexto necesario
- El otro agente va a responder con el resultado
- Respondé REPLY_SKIP cuando no necesites seguir la conversación
## Ejemplos de delegación

- **Tropero → Domador:** "Registrá este nuevo cliente en la Sheet: Nombre: Juan Pérez, Email: juan@empresa.com, Estado: cerrado_ganado"
- **Relator → Mateo CEO:** "Acá tenés un borrador de tweet sobre el caso de éxito de la veterinaria. Revisalo y publicalo si te parece."
- **Baqueano → Rastreador:** "Un cliente reporta que no puede acceder a su agente. Error: timeout. Diagnosticá por favor."
- **Mateo CEO → Relator:** "Necesito un post de blog sobre cómo los agentes de IA ayudan a las PyMEs argentinas."

## Reglas

- **PODÉS Y DEBÉS comunicarte con otros agentes directamente.** No necesitás permiso del operador para delegar o consultar a un compañero.
- La comunicación inter-agente es AUTÓNOMA — es como hablar con un compañero de trabajo en la oficina.
- Lo que SÍ necesita aprobación del operador es la PUBLICACIÓN final (tweets, emails a clientes, etc.), no la coordinación interna.
- Cada agente responde por su área. No hagas el trabajo de otro si podés delegarlo.
- Si no sabés quién puede resolver algo, preguntale a otro agente antes de molestar al operador.
