const API_URL = 'http://localhost:3000/api/v1/tasks';

async function obtenerTareas() {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Error al obtener las tareas');
    return await res.json();
}

async function crearTarea(datos) {
    const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
    });
    if (!res.ok) throw new Error('Error al crear la tarea');
    return await res.json();
}

async function eliminarTarea(id) {
    const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
    });
    if (!res.ok) throw new Error('Error al eliminar la tarea');
}
