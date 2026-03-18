let tasks = [];

function obtenerTodas() {
    return tasks;
}

function crearTarea(data) {
    const tarea = {
        id: Date.now(),
        texto: data.texto,
        categoria: data.categoria || 'General',
        prioridad: data.prioridad || 'media',
        completada: false
    };
    tasks.push(tarea);
    return tarea;
}

function eliminarTarea(id) {
    const index = tasks.findIndex(t => t.id === parseInt(id));
    if (index === -1) {
        throw new Error('NOT_FOUND');
    }
    tasks.splice(index, 1);
}

module.exports = { obtenerTodas, crearTarea, eliminarTarea };