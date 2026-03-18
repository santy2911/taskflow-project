const express = require('express');
const cors = require('cors');
const taskRoutes = require('./routes/task.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/v1/tasks', taskRoutes);

app.use((err, req, res, next) => {
    if (err.message === 'NOT_FOUND') {
        return res.status(404).json({ error: 'Tarea no encontrada.' });
    }
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor.' });
});

module.exports = app;