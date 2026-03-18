const taskService = require('../services/task.service');

function obtenerTareas(req, res) {
    const tareas = taskService.obtenerTodas();
    res.status(200).json(tareas);
}

function crearTarea(req, res) {
    const { texto, categoria, prioridad } = req.body;

    if (!texto || typeof texto !== 'string' || texto.trim().length < 1) {
        return res.status(400).json({ error: 'El texto de la tarea es obligatorio.' });
    }

    const tarea = taskService.crearTarea({ texto, categoria, prioridad });
    res.status(201).json(tarea);
}

function eliminarTarea(req, res, next) {
    try {
        taskService.eliminarTarea(req.params.id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
}

module.exports = { obtenerTareas, crearTarea, eliminarTarea };