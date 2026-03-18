const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

const inputTarea = $('#inputTarea');
const inputCategoria = $('#inputCategoria');
const selectPrioridad = $('#selectPrioridad');
const btnAnadir = $('#btnAnadir');
const inputBusqueda = $('#inputBusqueda');
const btnTema = $('#btnTema');
const filtroPrioridad = $('#filtroPrioridad');
const filtroEstado = $('#filtroEstado');

const main = $('main');
const msgErrorGenerico = 'Error, inténtalo de nuevo.';

let tareas = [];
let tareaArrastrada = null;

// ==========================================
// CAPA DE RED — comunicación con el servidor
// ==========================================

const API_URL = 'https://taskflow-project-u6w6.vercel.app/api/v1/tasks';


async function obtenerTareasAPI() {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Error al obtener las tareas');
    return await res.json();
}

/**
 * Crea una nueva tarea en el servidor.
 * @param {Object} datos - Datos de la tarea.
 * @returns {Object} La tarea creada.
 */
async function crearTareaAPI(datos) {
    const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
    });
    if (!res.ok) throw new Error('Error al crear la tarea');
    return await res.json();
}

/**
 * Elimina una tarea del servidor por su id.
 * @param {number} id - ID de la tarea a eliminar.
 */
async function eliminarTareaAPI(id) {
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar la tarea');
}

// ==========================================
// UI — mostrar estados de carga y error
// ==========================================

function getOrCreate(id, create) {
    return document.getElementById(id) ?? create();
}

/**
 * Muestra u oculta el indicador de carga en el main.
 * @param {boolean} visible - true para mostrar, false para ocultar.
 */
function mostrarCargando(visible) {
    if (visible) {
        getOrCreate('indicadorCarga', () => {
            const indicador = document.createElement('p');
            indicador.id = 'indicadorCarga';
            indicador.textContent = 'Cargando tareas...';
            indicador.style.cssText = 'text-align:center; color:#7a9cff; padding:20px;';
            main.prepend(indicador);
            return indicador;
        });
    } else {
        document.getElementById('indicadorCarga')?.remove();
    }
}

/**
 * Muestra un mensaje de error temporal en el main.
 * @param {string} mensaje - Texto del error a mostrar.
 */
function mostrarError(mensaje) {
    const errorDiv = getOrCreate('errorRed', () => {
        const div = document.createElement('p');
        div.id = 'errorRed';
        div.style.cssText = 'text-align:center; color:#ff4757; padding:10px;';
        main.prepend(div);
        return div;
    });
    errorDiv.textContent = mensaje;
    setTimeout(() => errorDiv.remove(), 4000);
}

// ==========================================
// PROGRESO Y CONTADORES
// ==========================================

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

    const barra = document.getElementById('barraProgreso');
    barra.style.width = `${porcentaje}%`;
    document.getElementById('porcentajeTexto').textContent = `${porcentaje}%`;
    document.getElementById('progresoTextoDetalle').textContent = `${completadas} de ${total} tareas`;

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
    const prioridadActual = filtroPrioridad.value;
    const estadoActual = filtroEstado.value;
    const coincideEstado = (completada) =>
        estadoActual === 'todas' ||
        (estadoActual === 'pendientes' && !completada) ||
        (estadoActual === 'completadas' && completada);

    ['alta', 'media', 'baja'].forEach(prioridad => {
        const seccion = document.getElementById(`seccion-${prioridad}`);
        const cantidad = tareas.filter(t =>
            t.prioridad === prioridad &&
            (prioridadActual === 'todas' || t.prioridad === prioridadActual) &&
            coincideEstado(t.completada)
        ).length;

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
    const coincideEstado = (completada) =>
        estadoActual === 'todas' ||
        (estadoActual === 'pendientes' && !completada) ||
        (estadoActual === 'completadas' && completada);

    $$('.tarea').forEach((tarea) => {
        const coincidePrioridad = prioridadActual === 'todas' || tarea.dataset.prioridad === prioridadActual;
        const esCompletada = tarea.classList.contains('completada');
        tarea.style.display = coincidePrioridad && coincideEstado(esCompletada) ? 'flex' : 'none';
    });

    actualizarContadores();
}

// ==========================================
// DOM — creación y eventos de tareas
// ==========================================

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

    // Orden: handle | nombre | lápiz | categoría | badge | X
    tarea.innerHTML = `
        <span class="dragHandle" title="Arrastrar tarea" aria-label="Arrastrar tarea">⠿</span>
        <div class="nombre">${t.texto}</div>
        <button class="btnEditar" title="Editar tarea" aria-label="Editar tarea">🖊️</button>
        <div class="categoria">Categoría: ${t.categoria}</div>
        <span class="badge ${t.prioridad}">${t.prioridad}</span>
        <button class="btnEliminar" aria-label="Eliminar tarea">✕</button>`;

    const $t = (selector) => tarea.querySelector(selector);

    // Click en el nombre: marca/desmarca como completada
    $t('.nombre').addEventListener('click', () => {
        tarea.classList.toggle('completada');
        const tareaData = tareas.find(x => x.id === t.id);
        if (tareaData) tareaData.completada = !tareaData.completada;
        aplicarFiltros();
        actualizarProgreso();
    });

    // Botón lápiz: activa edición en línea sin cambiar el layout
    $t('.btnEditar').addEventListener('click', () => {
        const nombreDiv = $t('.nombre');
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
                const tareaData = tareas.find(x => x.id === t.id);
                if (tareaData) tareaData.texto = nuevoTexto;
                t.texto = nuevoTexto;
                nombreDiv.textContent = nuevoTexto;
            } else {
                nombreDiv.textContent = t.texto;
            }
        }

        nombreDiv.addEventListener('blur', guardarEdicion, { once: true });
        nombreDiv.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); nombreDiv.blur(); }
            if (e.key === 'Escape') {
                nombreDiv.textContent = t.texto;
                nombreDiv.contentEditable = 'false';
                nombreDiv.classList.remove('editando');
            }
        });
    });

    // Botón X: elimina la tarea del servidor y del DOM
    $t('.btnEliminar').addEventListener('click', async () => {
        try {
            await eliminarTareaAPI(t.id);
            tareas = tareas.filter(x => x.id !== t.id);
            tarea.remove();
            actualizarContadores();
            actualizarProgreso();
        } catch (error) {
            mostrarError(msgErrorGenerico);
        }
    });

    tarea.addEventListener('dragstart', (e) => {
        tareaArrastrada = tarea;
        e.dataTransfer.effectAllowed = 'move';
        setTimeout(() => tarea.style.opacity = '0.4', 0);
    });

    tarea.addEventListener('dragend', () => {
        tarea.style.opacity = '1';
        tareaArrastrada = null;
        $$('section').forEach(s => s.classList.remove('drag-over'));
    });

    return tarea;
}

/**
 * Añade los eventos dragover, dragleave y drop a cada sección de prioridad.
 * Al soltar una tarea en una sección distinta, actualiza su prioridad en el array
 * y en el DOM (badge y dataset), y guarda los cambios.
 */
function configurarDropZones() {
    $$('section[id^="seccion-"]').forEach(seccion => {
        seccion.addEventListener('dragover', (e) => {
            e.preventDefault();
            seccion.classList.add('drag-over');
        });

        seccion.addEventListener('dragleave', () => {
            seccion.classList.remove('drag-over');
        });

        seccion.addEventListener('drop', (e) => {
            e.preventDefault();
            seccion.classList.remove('drag-over');

            if (!tareaArrastrada) return;

            const nuevaPrioridad = seccion.id.replace('seccion-', '');
            const id = parseInt(tareaArrastrada.dataset.id, 10);
            const index = tareas.findIndex(x => x.id === id);

            if (index === -1) return;

            tareas[index].prioridad = nuevaPrioridad;
            tareaArrastrada.dataset.prioridad = nuevaPrioridad;

            const badge = tareaArrastrada.querySelector('.badge');
            badge.className = `badge ${nuevaPrioridad}`;
            badge.textContent = nuevaPrioridad;

            seccion.appendChild(tareaArrastrada);
            aplicarFiltros();
        });
    });
}

// ==========================================
// EVENTOS GLOBALES
// ==========================================

/**
 * Valida el formulario, crea una nueva tarea en el servidor y la añade al DOM.
 * Evita añadir tareas duplicadas (mismo nombre y categoría).
 * Limpia los campos del formulario al terminar.
 */
btnAnadir.addEventListener('click', async function() {
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

    try {
        const t = await crearTareaAPI({ texto, categoria, prioridad: selectPrioridad.value });
        tareas.push(t);

        const tarea = crearTareaElemento(t);
        document.getElementById(`seccion-${t.prioridad}`).appendChild(tarea);
        aplicarFiltros();
        actualizarProgreso();

        inputTarea.value = '';
        inputCategoria.value = '';
    } catch (error) {
        mostrarError(msgErrorGenerico);
    }
});

// Permite añadir tareas pulsando Enter desde el input de nombre
inputTarea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') btnAnadir.click();
});

// Filtra las tareas visibles en tiempo real según el texto escrito
inputBusqueda.addEventListener('input', () => {
    const busqueda = inputBusqueda.value.toLowerCase().trim();
    $$('.tarea').forEach((tarea) => {
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
    $$('.tarea').forEach(t => {
        t.classList.toggle('completada', !todasCompletadas);
    });
    btn.textContent = todasCompletadas ? 'Completar todas' : 'Desmarcar todas';
    aplicarFiltros();
    actualizarProgreso();
});

// Elimina todas las tareas del servidor, del DOM y del array tras confirmación
document.getElementById('btnEliminarTodo').addEventListener('click', async function() {
    if (tareas.length === 0) return;
    if (!confirm('¿Seguro que quieres eliminar todas las tareas?')) return;

    try {
        await Promise.all(tareas.map(t => eliminarTareaAPI(t.id)));
        tareas = [];
        $$('.tarea').forEach(t => t.remove());
        actualizarContadores();
        actualizarProgreso();
    } catch (error) {
        mostrarError(msgErrorGenerico);
    }
});

/**
 * Aplica el tema claro u oscuro añadiendo o quitando la clase 'dark' en el html.
 * Actualiza el icono del botón y guarda la preferencia en localStorage.
 * El tema sí se sigue guardando en localStorage porque es preferencia visual, no datos.
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

// ==========================================
// ARRANQUE — carga inicial desde el servidor
// ==========================================

/**
 * Carga las tareas desde el servidor y las renderiza en el DOM.
 * Muestra un indicador de carga mientras espera la respuesta.
 * Si el servidor no responde muestra un mensaje de error.
 */
async function cargarTareas() {
    mostrarCargando(true);
    try {
        tareas = await obtenerTareasAPI();
        tareas.forEach(t => document.getElementById(`seccion-${t.prioridad}`).appendChild(crearTareaElemento(t)));
        aplicarFiltros();
        actualizarProgreso();
        configurarDropZones();
    } catch (error) {
        mostrarError(msgErrorGenerico);
    } finally {
        mostrarCargando(false);
    }
}

cargarTareas();