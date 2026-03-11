const inputTarea     = document.getElementById('inputTarea');
const inputCategoria = document.getElementById('inputCategoria');
const selectPrioridad = document.getElementById('selectPrioridad');
const btnAnadir      = document.getElementById('btnAnadir');
const inputBusqueda  = document.getElementById('inputBusqueda');
const btnTema        = document.getElementById('btnTema');
const filtroPrioridad = document.getElementById('filtroPrioridad');
const filtroEstado   = document.getElementById('filtroEstado');

let tareas = [];
let tareaArrastrada = null;

// Guarda la lista de tareas en el localStorage
function guardarEnStorage() {
    localStorage.setItem('tareas', JSON.stringify(tareas));
}

// Actualiza la barra de progreso según tareas completadas
function actualizarProgreso() {
    const total = tareas.length;
    const completadas = tareas.filter(t => t.completada).length;
    const porcentaje = total === 0 ? 0 : Math.round((completadas / total) * 100);

    document.getElementById('barraProgreso').style.width = porcentaje + '%';
    document.getElementById('porcentajeTexto').textContent = porcentaje + '%';
    document.getElementById('progresoTextoDetalle').textContent = completadas + ' de ' + total + ' tareas';

    // Cambia el color según el progreso
    const barra = document.getElementById('barraProgreso');
    if (porcentaje === 100) {
        barra.style.backgroundColor = '#2ed573';
    } else if (porcentaje >= 50) {
        barra.style.backgroundColor = '#ffa502';
    } else {
        barra.style.backgroundColor = '#7a9cff';
    }
}

// Actualiza los contadores de tareas por prioridad en cada sección
function actualizarContadores() {
    ['alta', 'media', 'baja'].forEach(prioridad => {
        const seccion = document.getElementById('seccion-' + prioridad);
        const prioridadActual = filtroPrioridad.value;
        const estadoActual = filtroEstado.value;

        const cantidad = tareas.filter(t => {
            const coincidePrioridad = prioridadActual === 'todas' || t.prioridad === prioridadActual;
            const coincideEstado = estadoActual === 'todas' ||
                (estadoActual === 'pendientes' && !t.completada) ||
                (estadoActual === 'completadas' && t.completada);
            return t.prioridad === prioridad && coincidePrioridad && coincideEstado;
        }).length;

        seccion.querySelector('h2').textContent = `Prioridad ${prioridad} (${cantidad})`;
    });
}

// Aplica los filtros activos a todas las tareas del DOM
function aplicarFiltros() {
    const prioridadActual = filtroPrioridad.value;
    const estadoActual = filtroEstado.value;

    document.querySelectorAll('.tarea').forEach(function(tarea) {
        const coincidePrioridad = prioridadActual === 'todas' || tarea.dataset.prioridad === prioridadActual;
        const esCompletada = tarea.classList.contains('completada');
        const coincideEstado = estadoActual === 'todas' ||
            (estadoActual === 'pendientes' && !esCompletada) ||
            (estadoActual === 'completadas' && esCompletada);

        tarea.style.display = coincidePrioridad && coincideEstado ? 'flex' : 'none';
    });

    actualizarContadores();
}

// Crea y devuelve el elemento visual de una tarea con sus eventos asociados
function crearTareaElemento(t) {
    const tarea = document.createElement('div');
    tarea.classList.add('tarea');
    tarea.draggable = true;
    tarea.dataset.id = t.id;
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
        aplicarFiltros();
        actualizarProgreso();
    });

    tarea.querySelector('.btnEliminar').addEventListener('click', function() {
        tareas = tareas.filter(x => x.id !== t.id);
        guardarEnStorage();
        tarea.remove();
        actualizarContadores();
        actualizarProgreso();
    });

    tarea.addEventListener('dragstart', function(e) {
        tareaArrastrada = tarea;
        e.dataTransfer.effectAllowed = 'move';
        setTimeout(() => tarea.style.opacity = '0.4', 0);
    });

    tarea.addEventListener('dragend', function() {
        tarea.style.opacity = '1';
        tareaArrastrada = null;
        document.querySelectorAll('section').forEach(s => s.classList.remove('drag-over'));
    });

    return tarea;
}

// Configura las secciones para recibir tareas arrastradas
function configurarDropZones() {
    document.querySelectorAll('section[id^="seccion-"]').forEach(seccion => {
        seccion.addEventListener('dragover', function(e) {
            e.preventDefault();
            seccion.classList.add('drag-over');
        });

        seccion.addEventListener('dragleave', function() {
            seccion.classList.remove('drag-over');
        });

        seccion.addEventListener('drop', function(e) {
            e.preventDefault();
            seccion.classList.remove('drag-over');

            if (!tareaArrastrada) return;

            const nuevaPrioridad = seccion.id.replace('seccion-', '');
            const id = parseInt(tareaArrastrada.dataset.id);
            const index = tareas.findIndex(x => x.id === id);

            if (index === -1) return;

            tareas[index].prioridad = nuevaPrioridad;
            tareaArrastrada.dataset.prioridad = nuevaPrioridad;

            const badge = tareaArrastrada.querySelector('.badge');
            badge.className = `badge ${nuevaPrioridad}`;
            badge.textContent = nuevaPrioridad;

            seccion.appendChild(tareaArrastrada);
            guardarEnStorage();
            aplicarFiltros();
        });
    });
}

btnAnadir.addEventListener('click', function() {
    const texto = inputTarea.value.trim();
    const categoria = inputCategoria.value.trim() || 'General';
    if (texto === '') return;

    const tareaDuplicada = tareas.some(
        t => t.texto.toLowerCase() === texto.toLowerCase() && t.categoria.toLowerCase() === categoria.toLowerCase()
    );
    if (tareaDuplicada) {
        alert('Ya existe una tarea con el mismo nombre y categoría.');
        return;
    }

    const t = { id: Date.now(), texto, categoria, prioridad: selectPrioridad.value, completada: false };
    tareas.push(t);
    guardarEnStorage();

    const tarea = crearTareaElemento(t);
    document.getElementById('seccion-' + t.prioridad).appendChild(tarea);
    aplicarFiltros();
    actualizarProgreso();

    inputTarea.value = '';
    inputCategoria.value = '';
});

inputTarea.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') btnAnadir.click();
});

inputBusqueda.addEventListener('input', function() {
    const busqueda = inputBusqueda.value.toLowerCase().trim();
    document.querySelectorAll('.tarea').forEach(function(tarea) {
        const nombre = tarea.querySelector('.nombre').textContent.toLowerCase();
        tarea.style.display = nombre.includes(busqueda) ? 'flex' : 'none';
    });
});

filtroPrioridad.addEventListener('change', aplicarFiltros);
filtroEstado.addEventListener('change', aplicarFiltros);

document.getElementById('btnEliminarTodo').addEventListener('click', function() {
    if (tareas.length === 0) return;
    if (!confirm('¿Seguro que quieres eliminar todas las tareas?')) return;
    tareas = [];
    guardarEnStorage();
    document.querySelectorAll('.tarea').forEach(t => t.remove());
    actualizarContadores();
    actualizarProgreso();
});

// Aplica el tema claro u oscuro y lo guarda en el localStorage
function aplicarTema(oscuro) {
    document.documentElement.classList.toggle('dark', oscuro);
    btnTema.textContent = oscuro ? '🌙' : '☀️';
    localStorage.setItem('tema', oscuro ? 'dark' : 'light');
}

aplicarTema(localStorage.getItem('tema') === 'dark');

btnTema.addEventListener('click', function() {
    aplicarTema(!document.documentElement.classList.contains('dark'));
});

// Carga las tareas desde el localStorage y las pinta en la interfaz
function cargarTareas() {
    const guardadas = localStorage.getItem('tareas');
    tareas = guardadas ? JSON.parse(guardadas) : [];
    tareas.forEach(function(t) {
        document.getElementById('seccion-' + t.prioridad).appendChild(crearTareaElemento(t));
    });
    aplicarFiltros();
    actualizarProgreso();
    configurarDropZones();
}

cargarTareas();