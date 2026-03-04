const inputTarea = document.getElementById('inputTarea');
const inputCategoria = document.getElementById('inputCategoria');
const selectPrioridad = document.getElementById('selectPrioridad');
const btnAnadir = document.getElementById('btnAnadir');
const inputBusqueda = document.getElementById('inputBusqueda');

let tareas = [];
let filtroActivo = 'todas';

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

function aplicarFiltros() {
    const busqueda = inputBusqueda.value.toLowerCase().trim();
    document.querySelectorAll('.tarea').forEach(function(tarea) {
        const nombre = tarea.querySelector('.nombre').textContent.toLowerCase();
        const coincideBusqueda = nombre.includes(busqueda);
        const coincideFiltro = filtroActivo === 'todas' || tarea.dataset.prioridad === filtroActivo;
        tarea.style.display = coincideBusqueda && coincideFiltro ? 'flex' : 'none';
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
    aplicarFiltros();
});

const enlaces = document.querySelectorAll('aside nav a');
enlaces.forEach(function(enlace) {
    enlace.addEventListener('click', function(e) {
        e.preventDefault();
        enlaces.forEach(a => a.classList.remove('active'));
        enlace.classList.add('active');
        filtroActivo = enlace.dataset.filtro;
        aplicarFiltros();
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
    actualizarContadores();
}

cargarTareas();