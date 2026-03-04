const inputTarea = document.getElementById('inputTarea');
const inputCategoria = document.getElementById('inputCategoria');
const selectPrioridad = document.getElementById('selectPrioridad');
const btnAnadir = document.getElementById('btnAnadir');
const inputBusqueda = document.getElementById('inputBusqueda');

let tareas = [];

inputTarea.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        btnAnadir.click();
    }
});

function guardarEnStorage() {
    localStorage.setItem('tareas', JSON.stringify(tareas));
}

function actualizarContadores() {
    ['alta', 'media', 'baja'].forEach(function(prioridad) {
        const seccion = document.getElementById('seccion-' + prioridad);
        const cantidad = seccion.querySelectorAll('.tarea').length;
        seccion.querySelector('h2').textContent = 'Prioridad ' + prioridad + ' (' + cantidad + ')';
    });
}

function crearTareaElemento(t) {
    const tarea = document.createElement('div');
    tarea.classList.add('tarea');
    tarea.dataset.categoria = t.categoria;
    tarea.dataset.prioridad = t.prioridad;

    if (t.completada) tarea.classList.add('completada');

    tarea.innerHTML = `
        <div class="nombre">${t.texto}</div>
        <div class="categoria">Categoría: ${t.categoria}</div>
        <span class="badge ${t.prioridad}">${t.prioridad}</span>
        <button class="btnEliminar">✕</button>`;

    tarea.querySelector('.nombre').addEventListener('click', function() {
        tarea.classList.toggle('completada');
        const index = tareas.findIndex(x => x.id === t.id);
        tareas[index].completada = !tareas[index].completada;
        guardarEnStorage();
    });

    tarea.querySelector('.btnEliminar').addEventListener('click', function() {
        tareas = tareas.filter(x => x.id !== t.id);
        guardarEnStorage();
        tarea.remove();
        actualizarContadores();
    });

    return tarea;
}

btnAnadir.addEventListener('click', function() {
    const texto = inputTarea.value.trim();
    const categoria = inputCategoria.value.trim() || 'General';
    if (texto === '') return;

    const t = { id: Date.now(), texto, categoria, prioridad: selectPrioridad.value, completada: false };
    tareas.push(t);
    guardarEnStorage();

    const tarea = crearTareaElemento(t);
    document.getElementById('seccion-' + t.prioridad).appendChild(tarea);
    actualizarContadores();

    inputTarea.value = '';
    inputCategoria.value = '';
});

inputBusqueda.addEventListener('input', function() {
    const busqueda = inputBusqueda.value.toLowerCase().trim();
    document.querySelectorAll('.tarea').forEach(function(tarea) {
        const nombre = tarea.querySelector('.nombre').textContent.toLowerCase();
        tarea.style.display = nombre.includes(busqueda) ? 'flex' : 'none';
    });
});

const enlaces = document.querySelectorAll('aside nav a');
enlaces.forEach(function(enlace) {
    enlace.addEventListener('click', function(e) {
        e.preventDefault();
        enlaces.forEach(a => a.classList.remove('active'));
        enlace.classList.add('active');

        const filtro = enlace.dataset.filtro;
        document.querySelectorAll('.tarea').forEach(function(tarea) {
            if (filtro === 'todas') {
                tarea.style.display = 'flex';
            } else {
                tarea.style.display = tarea.dataset.prioridad === filtro ? 'flex' : 'none';
            }
        });
    });
});

function cargarTareas() {
    const guardadas = localStorage.getItem('tareas');
    if (guardadas) {
        tareas = JSON.parse(guardadas);
        tareas.forEach(function(t) {
            const tarea = crearTareaElemento(t);
            document.getElementById('seccion-' + t.prioridad).appendChild(tarea);
        });
    } else {
        const ejemplos = [
            { id: 1, texto: 'Hacer ejercicio', categoria: 'Personal', prioridad: 'alta', completada: false },
            { id: 2, texto: 'Estudiar', categoria: 'Estudios', prioridad: 'alta', completada: false },
            { id: 3, texto: 'Revisar gastos', categoria: 'Personal', prioridad: 'media', completada: false },
            { id: 4, texto: 'Jugar videojuegos', categoria: 'Videojuegos', prioridad: 'baja', completada: false }
        ];
        tareas = ejemplos;
        guardarEnStorage();
        tareas.forEach(function(t) {
            const tarea = crearTareaElemento(t);
            document.getElementById('seccion-' + t.prioridad).appendChild(tarea);
        });
    }
    actualizarContadores();
}

cargarTareas();