# TaskFlow

Aplicación web de gestión de tareas desarrollada como proyecto del bootcamp. Permite crear, organizar y hacer seguimiento de tareas con sistema de prioridades, filtros y persistencia de datos.

🔗 **Demo en producción:** [taskflow-project.vercel.app](https://taskflow-project.vercel.app) <!-- Actualiza con tu URL real -->

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
- **Persistencia** — los datos se mantienen al recargar la página

---

## Tecnologías

- HTML5 semántico
- CSS3 + Tailwind CSS (CDN)
- JavaScript vanilla (sin frameworks)
- LocalStorage para persistencia de datos

---

## Estructura del proyecto

```
taskflow-project/
├── index.html       # Estructura de la interfaz
├── style.css        # Estilos personalizados y dark mode
├── app.js           # Lógica de la aplicación
├── docs/
│   └── ai/          # Documentación sobre uso de IA en el desarrollo
└── README.md
```

---

## Ejemplos de uso

**Añadir una tarea:**
1. Escribe el nombre en el campo "Nueva tarea"
2. Opcionalmente añade una categoría (por defecto se asigna "General")
3. Selecciona la prioridad (alta, media, baja)
4. Pulsa "Añadir" o presiona Enter

**Editar el nombre de una tarea:**
1. Pulsa el botón 🖊️ que aparece junto al nombre
2. Edita el texto directamente sobre la tarea
3. Pulsa Enter o haz click fuera para guardar — Escape para cancelar

**Completar todas las tareas:**
- Pulsa "Completar todas" para marcarlas todas de golpe
- El botón cambia a "Desmarcar todas" para revertir la acción

**Mover una tarea de prioridad:**
- Arrastra cualquier tarea y suéltala en otra sección

**Filtrar tareas:**
- Usa el selector de prioridad para ver solo tareas de un nivel
- Usa el selector de estado para ver solo pendientes o completadas

---

## Pruebas manuales realizadas

| Caso | Resultado |
|------|-----------|
| Añadir tarea sin título | No se añade |
| Añadir tarea duplicada | Muestra alerta |
| Marcar tarea como completada | Se tacha y actualiza el progreso |
| Editar nombre de una tarea | Se guarda correctamente |
| Completar todas y desmarcar todas | Alterna correctamente |
| Eliminar tarea individual | Se elimina del DOM y del storage |
| Eliminar todas las tareas | Pide confirmación antes de borrar |
| Recargar la página | Los datos persisten |
| Activar modo oscuro y recargar | La preferencia se mantiene |
| Drag & drop entre secciones | Cambia la prioridad correctamente |

---

## Desarrollo

Este proyecto fue desarrollado de forma iterativa a lo largo del bootcamp, incorporando progresivamente nuevas funcionalidades. Se utilizaron herramientas de IA (Claude y ChatGPT) como apoyo en el desarrollo, documentado en la carpeta `docs/ai/`.