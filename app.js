const inputTarea = document.getElementById('inputTarea');
const selectCategoria = document.getElementById('selectCategoria');
const selectPrioridad = document.getElementById('selectPrioridad');
const btnAnadir = document.getElementById('btnAnadir');
const inputBusqueda = document.getElementById('inputBusqueda');

let tareas = [];

function guardarEnStorage() {
    localStorage.setItem('tareas', JSON.stringify(tareas));
}

function crearTareaElemento(t) {
    const tarea = document.createElement('div');
    tarea.classList.add('tarea');
    tarea.dataset.categoria = t.categoria;
    tarea.innerHTML = `
        <div class="nombre">${t.texto}</div>
        <div class="categoria">Categoría: ${t.categoria}</div>
        <span class="badge ${t.prioridad}">${t.prioridad}</span>
        <button class="btnEliminar">✕</button>`;

    tarea.querySelector('.btnEliminar').addEventListener('click', function() {
        tareas = tareas.filter(x => x.id !== t.id);
        guardarEnStorage();
        tarea.remove();
    });

    return tarea;
}

btnAnadir.addEventListener('click', function() {
    const texto = inputTarea.value.trim();
    if (texto === '') return;

    const t = { id: Date.now(), texto, categoria: selectCategoria.value, prioridad: selectPrioridad.value };
    tareas.push(t);
    guardarEnStorage();

    const tarea = crearTareaElemento(t);
    document.getElementById('seccion-' + t.prioridad).appendChild(tarea);

    inputTarea.value = '';
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

        const filtro = enlace.textContent.toLowerCase();
        document.querySelectorAll('.tarea').forEach(function(tarea) {
            tarea.style.display = (filtro === 'todas' || tarea.dataset.categoria.toLowerCase() === filtro) ? 'flex' : 'none';
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
    }
}

cargarTareas();