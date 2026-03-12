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

/**
 * Guarda el array de tareas en el localStorage como JSON.
 * Se llama cada vez que se añade, elimina o modifica una tarea.
 */
function guardarEnStorage() {
    localStorage.setItem('tareas', JSON.stringify(tareas));
}

/**
 * Actualiza la barra de progreso del aside según el número de tareas completadas.
 * Cambia el color de la barra según el porcentaje:
 * - Azul: menos del 50%
 * - Naranja: 50% o más
 * - Verde: 100%
 */
function actualizarProgreso() {
    const total = tareas.length;
    const completadas = tareas.filter(t => t.completada).length;
    const porcentaje = total === 0 ? 0 : Math.round((completadas / total) * 100);

    document.getElementById('barraProgreso').style.width = porcentaje + '%';
    document.getElementById('porcentajeTexto').textContent = porcentaje + '%';
    document.getElementById('progresoTextoDetalle').textContent = completadas + ' de ' + total + ' tareas';

    const barra = document.getElementById('barraProgreso');
    if (porcentaje === 100) {
        barra.style.backgroundColor = '#2ed573';
    } else if (porcentaje >= 50) {
        barra.style.backgroundColor = '#ffa502';
    } else {
        barra.style.backgroundColor = '#7a9cff';
    }
}

/**
 * Actualiza el contador de tareas visibles en el encabezado de cada sección.
 * Tiene en cuenta los filtros activos de prioridad y estado.
 */
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

/**
 * Recorre todos los elementos .tarea del DOM y muestra u oculta cada uno
 * según los filtros activos de prioridad y estado.
 * Al terminar llama a actualizarContadores para sincronizar los títulos de sección.
 */
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

/**
 * Crea y devuelve el elemento HTML de una tarea con todos sus eventos asignados.
 * Incluye: marcar como completada, editar nombre en línea, eliminar, drag & drop.
 *
 * @param {Object} t - Objeto tarea.
 * @param {number} t.id - Identificador único generado con Date.now().
 * @param {string} t.texto - Nombre de la tarea.
 * @param {string} t.categoria - Categoría de la tarea.
 * @param {string} t.prioridad - Prioridad: 'alta', 'media' o 'baja'.
 * @param {boolean} t.completada - Estado de la tarea.
 * @returns {HTMLElement} El elemento div de la tarea listo para insertar en el DOM.
 */
function crearTareaElemento(t) {
    const tarea = document.createElement('div');
    tarea.classList.add('tarea');
    tarea.draggable = true;
    tarea.dataset.id = t.id;
    tarea.dataset.categoria = t.categoria;
    tarea.dataset.prioridad = t.prioridad;

    if (t.completada) tarea.classList.add('completada');

    // Orden: nombre | lápiz | categoría | badge | X
    tarea.innerHTML = `
        <div class="nombre">${t.texto}</div>
        <button class="btnEditar" title="Editar tarea" aria-label="Editar tarea">🖊️</button>
        <div class="categoria">Categoría: ${t.categoria}</div>
        <span class="badge ${t.prioridad}">${t.prioridad}</span>
        <button class="btnEliminar" aria-label="Eliminar tarea">✕</button>`;

    // Click en el nombre: marca/desmarca como completada
    tarea.querySelector('.nombre').addEventListener('click', function() {
        tarea.classList.toggle('completada');
        const index = tareas.findIndex(x => x.id === t.id);
        tareas[index].completada = !tareas[index].completada;
        guardarEnStorage();
        aplicarFiltros();
        actualizarProgreso();
    });

    // Botón lápiz: activa edición en línea sin cambiar el layout
    tarea.querySelector('.btnEditar').addEventListener('click', function() {
        const nombreDiv = tarea.querySelector('.nombre');
        if (nombreDiv.contentEditable === 'true') return;

        nombreDiv.contentEditable = 'true';
        nombreDiv.classList.add('editando');
        nombreDiv.focus();

        const range = document.createRange();
        range.selectNodeContents(nombreDiv);
        range.collapse(false);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);

        function guardarEdicion() {
            const nuevoTexto = nombreDiv.textContent.trim();
            nombreDiv.contentEditable = 'false';
            nombreDiv.classList.remove('editando');
            if (nuevoTexto) {
                const index = tareas.findIndex(x => x.id === t.id);
                tareas[index].texto = nuevoTexto;
                t.texto = nuevoTexto;
                nombreDiv.textContent = nuevoTexto;
                guardarEnStorage();
            } else {
                nombreDiv.textContent = t.texto;
            }
        }

        nombreDiv.addEventListener('blur', guardarEdicion, { once: true });
        nombreDiv.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') { e.preventDefault(); nombreDiv.blur(); }
            if (e.key === 'Escape') {
                nombreDiv.textContent = t.texto;
                nombreDiv.contentEditable = 'false';
                nombreDiv.classList.remove('editando');
            }
        });
    });

    // Botón X: elimina la tarea
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

/**
 * Añade los eventos dragover, dragleave y drop a cada sección de prioridad.
 * Al soltar una tarea en una sección distinta, actualiza su prioridad en el array
 * y en el DOM (badge y dataset), y guarda los cambios.
 */
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

/**
 * Valida el formulario, crea una nueva tarea y la añade al DOM y al array.
 * Evita añadir tareas duplicadas (mismo nombre y categoría).
 * Limpia los campos del formulario al terminar.
 */
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

// Permite añadir tareas pulsando Enter desde el input de nombre
inputTarea.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') btnAnadir.click();
});

// Filtra las tareas visibles en tiempo real según el texto escrito
inputBusqueda.addEventListener('input', function() {
    const busqueda = inputBusqueda.value.toLowerCase().trim();
    document.querySelectorAll('.tarea').forEach(function(tarea) {
        const nombre = tarea.querySelector('.nombre').textContent.toLowerCase();
        tarea.style.display = nombre.includes(busqueda) ? 'flex' : 'none';
    });
});

filtroPrioridad.addEventListener('change', aplicarFiltros);
filtroEstado.addEventListener('change', aplicarFiltros);

/**
 * Alterna entre completar todas y desmarcar todas las tareas.
 * Si todas están completadas las desmarca y vuelve a "Completar todas".
 * Si alguna está pendiente las completa todas y cambia a "Desmarcar todas".
 */
document.getElementById('btnCompletarTodo').addEventListener('click', function() {
    if (tareas.length === 0) return;
    const btn = document.getElementById('btnCompletarTodo');
    const todasCompletadas = tareas.every(t => t.completada);

    tareas.forEach(t => t.completada = !todasCompletadas);
    guardarEnStorage();
    document.querySelectorAll('.tarea').forEach(t => {
        t.classList.toggle('completada', !todasCompletadas);
    });
    btn.textContent = todasCompletadas ? 'Completar todas' : 'Desmarcar todas';
    aplicarFiltros();
    actualizarProgreso();
});

// Elimina todas las tareas del DOM, del array y del localStorage tras confirmación
document.getElementById('btnEliminarTodo').addEventListener('click', function() {
    if (tareas.length === 0) return;
    if (!confirm('¿Seguro que quieres eliminar todas las tareas?')) return;
    tareas = [];
    guardarEnStorage();
    document.querySelectorAll('.tarea').forEach(t => t.remove());
    actualizarContadores();
    actualizarProgreso();
});

/**
 * Aplica el tema claro u oscuro añadiendo o quitando la clase 'dark' en el html.
 * Actualiza el icono del botón y guarda la preferencia en localStorage.
 *
 * @param {boolean} oscuro - true para activar el modo oscuro, false para el claro.
 */
function aplicarTema(oscuro) {
    document.documentElement.classList.toggle('dark', oscuro);
    btnTema.textContent = oscuro ? '🌙' : '☀️';
    localStorage.setItem('tema', oscuro ? 'dark' : 'light');
}

aplicarTema(localStorage.getItem('tema') === 'dark');

btnTema.addEventListener('click', function() {
    aplicarTema(!document.documentElement.classList.contains('dark'));
});

/**
 * Lee las tareas guardadas en localStorage y las renderiza en el DOM.
 * Si no hay datos previos inicializa el array vacío.
 * Al terminar aplica los filtros, actualiza el progreso y configura el drag & drop.
 */
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