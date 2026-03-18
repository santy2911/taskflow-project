# TaskFlow

Aplicación web de gestión de tareas desarrollada como proyecto del bootcamp. Permite crear, organizar y hacer seguimiento de tareas con sistema de prioridades, filtros y persistencia de datos.

🔗 **Demo en producción:** [https://taskflow-project-u6w6.vercel.app/]

---

## Funcionalidades

- **Añadir tareas** con nombre, categoría y prioridad (alta, media, baja)
- **Marcar como completadas** haciendo click sobre el nombre de la tarea
- **Editar el nombre** de una tarea pulsando el botón 🖊️ — edición en línea sin cambiar el layout
- **Eliminar tareas** individualmente o todas a la vez
- **Completar todas / Desmarcar todas** con un solo botón que alterna entre ambos estados
- **Filtrar** por prioridad y por estado (todas, pendientes, completadas)
- **Buscar** tareas por texto en tiempo real
- **Barra de progreso** que muestra el porcentaje de tareas completadas en tiempo real
- **Drag & drop** para mover tareas entre secciones de prioridad
- **Modo oscuro** con preferencia guardada en localStorage
- **API REST** con servidor Node.js + Express para gestionar las tareas

---

## Tecnologías

**Frontend**
- HTML5 semántico
- CSS3 + Tailwind CSS (CDN)
- JavaScript vanilla (sin frameworks)
- Fetch API para comunicación con el servidor

**Backend**
- Node.js
- Express.js

---

## Estructura del proyecto

```
taskflow-project/
├── index.html              # Estructura de la interfaz
├── style.css               # Estilos personalizados y dark mode
├── app.js                  # Lógica del frontend y comunicación con la API
├── src/
│   └── api/
│       └── client.js       # Funciones de comunicación con el servidor
├── server/
│   ├── .env                # Variables de entorno
│   ├── .gitignore
│   ├── package.json
│   └── src/
│       ├── index.js        # Punto de entrada del servidor
│       ├── config/
│       │   └── env.js      # Validación de variables de entorno
│       ├── controllers/
│       │   └── task.controller.js  # Lógica de las peticiones HTTP
│       ├── routes/
│       │   └── task.routes.js      # Definición de endpoints
│       └── services/
│           └── task.service.js     # Lógica de negocio pura
├── docs/
│   └── ai/                 # Documentación sobre uso de IA en el desarrollo
└── README.md
```

---

## Arquitectura del backend

El servidor sigue una arquitectura por capas que separa las responsabilidades:

**Rutas** (`task.routes.js`) — Escuchan la URL y el HTTP y los dirigen al controlador correspondiente. No contienen ninguna lógica.

**Controladores** (`task.controller.js`) — Reciben los datos de la petición, los validan y llaman al servicio. Devuelven la respuesta HTTP con el código correcto.

**Servicios** (`task.service.js`) — Contienen la lógica pura de la aplicación. No saben nada de HTTP ni de Express, solo trabajan con los datos.

**Middlewares utilizados:**
- `express.json()` — convierte el cuerpo de las peticiones de texto JSON a objeto JavaScript, disponible en `req.body`
- `cors()` — permite que el frontend en un puerto distinto pueda hacer peticiones al servidor sin ser bloqueado por el navegador
- Manejador global de errores `(err, req, res, next)` — captura cualquier error no controlado y devuelve una respuesta limpia sin filtrar detalles técnicos

---

## API REST — Endpoints

Base URL: `http://localhost:3000/api/v1/tasks`

| Método | Endpoint | Descripción | Código de éxito |
|--------|----------|-------------|-----------------|
| GET | `/` | Obtener todas las tareas | 200 |
| POST | `/` | Crear una nueva tarea | 201 |
| DELETE | `/:id` | Eliminar una tarea por ID | 204 |

**Ejemplo — Crear una tarea:**
```json
POST /api/v1/tasks
Content-Type: application/json

{
  "texto": "Estudiar",
  "categoria": "Estudios",
  "prioridad": "alta"
}
```

**Respuesta:**
```json
{
  "id": 1234567890,
  "texto": "Estudiar",
  "categoria": "Estudios",
  "prioridad": "alta",
  "completada": false
}
```

**Ejemplo — Eliminar una tarea:**
```
DELETE /api/v1/tasks/1234567890
→ 204 No Content
```

**Errores posibles:**
- `400` — Datos incorrectos (por ejemplo, texto vacío)
- `404` — Tarea no encontrada
- `500` — Error interno del servidor

---

## Pruebas manuales realizadas

| Caso | Resultado |
|------|-----------|
| Añadir tarea sin título | No se añade |
| Añadir tarea duplicada | Muestra alerta |
| Marcar tarea como completada | Se tacha y actualiza el progreso |
| Editar nombre de una tarea | Se guarda correctamente |
| Completar todas y desmarcar todas | Alterna correctamente |
| Eliminar tarea individual | Se elimina del servidor y del DOM |
| Eliminar todas las tareas | Pide confirmación antes de borrar |
| Activar modo oscuro y recargar | La preferencia se mantiene |
| Drag & drop entre secciones | Cambia la prioridad correctamente |
| POST sin texto al servidor | Devuelve error 400 |
| DELETE de tarea inexistente | Devuelve error 404 |
| Frontend con servidor apagado | Muestra mensaje de error en pantalla |

---

## Desarrollo

Este proyecto fue desarrollado de forma iterativa a lo largo del bootcamp, incorporando progresivamente nuevas funcionalidades. Se utilizaron herramientas de IA (Claude y ChatGPT) como apoyo en el desarrollo, documentado en la carpeta `docs/ai/`.