# Flujo de trabajo con Cursor

En este documento documento voy a usar Cursor como IDE asistido por IA, ejemplos de mejoras de código y uso del chat.


## Primera pregunta: Utiliza el chat contextual para pedir explicaciones de partes del código

Lo que he pedido: Explicame que hace esta funcion: crearTareaElemento


La respuesta de Cursor:

Explicación de crearTareaElemento
La función crearTareaElemento recibe un objeto tarea t (con campos como id, texto, categoria, prioridad, completada) y hace lo siguiente paso a paso:

Crea el contenedor visual de la tarea

Crea un div nuevo (const tarea = document.createElement('div');).
Le añade la clase tarea.
Guarda en data-attributes la categoría y prioridad de la tarea:
tarea.dataset.categoria = t.categoria;
tarea.dataset.prioridad = t.prioridad;
Si la tarea viene marcada como completada (t.completada), le añade la clase completada para que se vea distinta.
Rellena el HTML interno

Usa innerHTML para poner:
El nombre/texto de la tarea.
La categoría.
Una “badge” con la prioridad (alta, media, baja) y su clase CSS correspondiente.
Un botón de eliminar (btnEliminar).
Añade la lógica de completar / descompletar

Al hacer clic sobre el nombre (.nombre):
Alterna la clase completada en el div de la tarea (se ve tachada o diferente).
Busca la tarea correspondiente en el array global tareas usando el id.
Cambia el valor de completada en el array.
Llama a guardarEnStorage() para actualizar localStorage.
Añade la lógica de eliminar tarea

Al hacer clic en el botón .btnEliminar:
Filtra el array tareas quitando la tarea con el id actual.
Vuelve a guardar el array en localStorage.
Elimina el elemento div de la tarea del DOM (tarea.remove()).
Llama a actualizarContadores() para recalcular cuántas tareas hay por prioridad.
Devuelve el elemento DOM

return tarea; devuelve el div listo para insertarlo en la sección correspondiente (seccion-alta, seccion-media, etc.).
En resumen: crearTareaElemento transforma un objeto de datos de tarea en un elemento HTML interactivo, con eventos para marcarla como completada, eliminarla y mantener sincronizado el estado con el localStorage y los contadores.









## Segunda pregunta: Utiliza la edición inline para modificar funciones existentes

Lo que he pedido: Simplifica esta funcion:

function actualizarContadores() {
    ['alta', 'media', 'baja'].forEach(function(prioridad) {
        const seccion = document.getElementById('seccion-' + prioridad);
        const cantidad = seccion.querySelectorAll('.tarea').length;
        seccion.querySelector('h2').textContent = 'Prioridad ' + prioridad + ' (' + cantidad + ')';
    });
}


La respuesta de Cursor: 

function actualizarContadores() {
    ['alta', 'media', 'baja'].forEach(prioridad => {
        const seccion = document.getElementById('seccion-' + prioridad);
        seccion.querySelector('h2').textContent = `Prioridad ${prioridad} (${seccion.querySelectorAll('.tarea').length})`;
    });
}










## Tercera pregunta: Prueba Composer para generar cambios que afecten a varios archivos

Lo que he pedido: Añade comentarios simples encima de cada función del app.js explicando qué hace


La respuesta de Cursor: Comentarios añadidos
He añadido comentarios sencillos encima de todas las funciones definidas en app.js:

guardarEnStorage: explica que guarda la lista de tareas en localStorage.
actualizarContadores: indica que actualiza los contadores por prioridad.
crearTareaElemento: indica que crea el elemento visual de la tarea y sus eventos.
aplicarTema: indica que aplica el tema claro/oscuro y lo guarda en localStorage.
cargarTareas: indica que carga las tareas guardadas y las pinta en la interfaz.










## Cuarta pregunta: Anota los atajos de teclado que uses con más frecuencia

Los atajos que he usado:

Ctrl + Shift + L — abrir chat
Ctrl + K — edición inline
Ctrl + Shift + I — Composer
Ctrl + J — terminal
Ctrl + P — buscar archivos










## Refactorizaciones

1º Lo que he pedido: Simplifica esta función

function cargarTareas() {
    const guardadas = localStorage.getItem('tareas');

    tareas = guardadas ? JSON.parse(guardadas) : [];


    tareas.forEach(function(t) {
        document.getElementById('seccion-' + t.prioridad).appendChild(crearTareaElemento(t));
    });

    actualizarContadores();
}


La respuesta de Cursor:

function cargarTareas() {
    const guardadas = localStorage.getItem('tareas');

    tareas = guardadas ? JSON.parse(guardadas) : [];


    tareas.forEach(function(t) {
        document.getElementById('seccion-' + t.prioridad).appendChild(crearTareaElemento(t));
    });

    actualizarContadores();
}





La respuesta de Cursor en este caso Cursor ha considerado que la función ya estaba simplificada y no ha propuesto cambios.



2º Lo que he pedido: En btnAnadir.addEventListener, Añade validación para que no se puedan añadir tareas duplicadas

Como estaba al principio:

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


La respuesta de Cursor:

btnAnadir.addEventListener('click', function() {
    const texto = inputTarea.value.trim();
    const categoria = inputCategoria.value.trim() || 'General';
    if (texto === '') return;

    // Validar que no exista ya una tarea con el mismo texto y categoría
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
    actualizarContadores();

    inputTarea.value = '';
    inputCategoria.value = '';
});





3º Lo que he pedido: Mejora esta función

inputBusqueda.addEventListener('input', function() {
    const busqueda = inputBusqueda.value.toLowerCase().trim();
    document.querySelectorAll('.tarea').forEach(function(tarea) {
        const nombre = tarea.querySelector('.nombre').textContent.toLowerCase();
        tarea.style.display = nombre.includes(busqueda) ? 'flex' : 'none';
    });
});


La respuesta de Cursor:

inputBusqueda.addEventListener('input', function() {
    const busqueda = inputBusqueda.value.toLowerCase().trim();
    const tareas = document.querySelectorAll('.tarea');
    if (busqueda === "") {
        tareas.forEach(t => t.style.display = 'flex');
        return;
    }
    tareas.forEach(function(tarea) {
        const nombre = tarea.querySelector('.nombre').textContent.toLowerCase();
        const categoria = tarea.querySelector('.categoria') ? tarea.querySelector('.categoria').textContent.toLowerCase() : "";
        if (nombre.includes(busqueda) || categoria.includes(busqueda)) {
            tarea.style.display = 'flex';
        } else {
            tarea.style.display = 'none';
        }
    });
});










## Servidores MCP

Primera pregunta: Realiza al menos cinco consultas distintas utilizando el servidor MCP

1º Lo que he pedido: Lista los archivos de mi repositorio taskflow-project de GitHub


La respuesta de Cursor:

Archivos de tu repositorio taskflow-project
Estos son los archivos actualmente versionados en Git en tu repo:

README.md
app.js
index.html
style.css
docs/ai/ai-comparison.md
docs/ai/cursor-workflow.md
docs/ai/experiments.md
docs/ai/prompt-engineering.md
docs/ai/reflection.md





2º Lo que he pedido: Muéstrame los últimos tres commits de mi repositorio taskflow-project


La respuesta de Cursor:

8abb02d – Paso 4: mejora nombres de variables y refactorizaciones con Cursor (HEAD -> master, origin/master)
97227f3 – Primer contacto con Cursor
92084eb – Paso 2: comparativa ChatGPT vs Claude





3º Lo que he pedido: Cuántos archivos tiene mi repositorio taskflow-project


La respuesta de Cursor:

Tu repositorio taskflow-project tiene 11 archivos en total (contando todos los archivos dentro de la carpeta del proyecto)





4º Lo que he pedido: Muéstrame el contenido del archivo app.js de mi repositorio


La respuesta de Cursor:

Aquí tienes el contenido completo de app.js:

const inputTarea     = document.getElementById('inputTarea');
const inputCategoria = document.getElementById('inputCategoria');
const selectPrioridad = document.getElementById('selectPrioridad');
const btnAnadir      = document.getElementById('btnAnadir');
const inputBusqueda  = document.getElementById('inputBusqueda');
const btnTema        = document.getElementById('btnTema');
let tareas = [];
// Guarda la lista de tareas en el localStorage
function guardarEnStorage() {
    localStorage.setItem('tareas', JSON.stringify(tareas));
}
// Actualiza los contadores de tareas por prioridad en cada sección
function actualizarContadores() {
    ['alta', 'media', 'baja'].forEach(prioridad => {
        const seccion = document.getElementById('seccion-' + prioridad);
        seccion.querySelector('h2').textContent = `Prioridad ${prioridad} (${seccion.querySelectorAll('.tarea').length})`;
    });
}
// Crea y devuelve el elemento visual de una tarea con sus eventos asociados
function crearTareaElemento(tarea) {
    const tareaElemento = document.createElement('div');
    tareaElemento.classList.add('tarea');
    tareaElemento.dataset.categoria = tarea.categoria;
    tareaElemento.dataset.prioridad = tarea.prioridad;
    if (tarea.completada) tareaElemento.classList.add('completada');
    tareaElemento.innerHTML = `
        <div class="nombre">${tarea.texto}</div>
        <div class="categoria">Categoría: ${tarea.categoria}</div>
        <span class="badge ${tarea.prioridad}">${tarea.prioridad}</span>
        <button class="btnEliminar">✕</button>`;
    tareaElemento.querySelector('.nombre').addEventListener('click', function() {
        tareaElemento.classList.toggle('completada');
        const index = tareas.findIndex(x => x.id === tarea.id);
        tareas[index].completada = !tareas[index].completada;
        guardarEnStorage();
    });
    tareaElemento.querySelector('.btnEliminar').addEventListener('click', function() {
        tareas = tareas.filter(x => x.id !== tarea.id);
        guardarEnStorage();
        tareaElemento.remove();
        actualizarContadores();
    });
    return tareaElemento;
}
btnAnadir.addEventListener('click', function() {
    const texto = inputTarea.value.trim();
    const categoria = inputCategoria.value.trim() || 'General';
    if (texto === '') return;
    // Validar que no exista ya una tarea con el mismo texto y categoría
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
    actualizarContadores();
    inputTarea.value = '';
    inputCategoria.value = '';
});
inputTarea.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') btnAnadir.click();
});
inputBusqueda.addEventListener('input', function() {
    const busqueda = inputBusqueda.value.toLowerCase().trim();
    const tareas = document.querySelectorAll('.tarea');
    if (busqueda === "") {
        tareas.forEach(t => t.style.display = 'flex');
        return;
    }
    tareas.forEach(function(tarea) {
        const nombre = tarea.querySelector('.nombre').textContent.toLowerCase();
        const categoria = tarea.querySelector('.categoria') ? tarea.querySelector('.categoria').textContent.toLowerCase() : "";
        if (nombre.includes(busqueda) || categoria.includes(busqueda)) {
            tarea.style.display = 'flex';
        } else {
            tarea.style.display = 'none';
        }
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
            tarea.style.display = (filtro === 'todas' || tarea.dataset.prioridad === filtro) ? 'flex' : 'none';
        });
    });
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
    tareas = JSON.parse(localStorage.getItem('tareas') || '[]');
    tareas.forEach(t =>
        document.getElementById('seccion-' + t.prioridad).appendChild(crearTareaElemento(t))
    );
    actualizarContadores();
}
cargarTareas();





5º Lo que he pedido: Muéstrame el contenido del archivo style.css de mi repositorio


La respuesta de Cursor:

.tarea {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 16px 20px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: background 0.2s ease, border-color 0.2s ease;
  animation: entrar 0.3s ease;
}

.tarea:hover { background: #f3f4f6; border-color: #7a9cff; border-width: 2px; }
.tarea:focus-within { border-color: #7a9cff; border-width: 2px; }

.nombre { flex: 1; font-size: 1rem; cursor: pointer; color: #1f2937; }

.categoria { font-size: 0.8rem; color: #6b7280; }

.badge { font-size: 0.75rem; font-weight: bold; padding: 4px 12px; border-radius: 20px; }
.alta  { background: #ff47571a; color: #ff4757; border: 1px solid #ff4757; }
.media { background: #ffa5021a; color: #ffa502; border: 1px solid #ffa502; }
.baja  { background: #2ed5731a; color: #2ed573; border: 1px solid #2ed573; }

.btnEliminar { background: transparent; border: none; color: #6b7280; cursor: pointer; font-size: 1rem; padding: 4px 8px; border-radius: 4px; transition: color 0.2s ease, background 0.2s ease, transform 0.15s ease; }
.btnEliminar:hover { color: #ff4757; background: #ff47571a; transform: scale(1.15); }
.btnEliminar:focus { outline: 2px solid #ff4757; outline-offset: 2px; }

.tarea.completada { opacity: 0.6; }
.tarea.completada .nombre { text-decoration: line-through; color: #9ca3af; }

.active { background: #e0e7ff !important; color: #7a9cff !important; }

.dark .tarea { background: #243656; border-color: #2a4a7f; }
.dark .tarea:hover { background: #1e2a4a; border-color: #7a9cff; }
.dark .nombre { color: #ffffff; }
.dark .categoria { color: #aaaaaa; }
.dark .btnEliminar { color: #aaaaaa; }
.dark .active { background: #0f3460 !important; color: #7a9cff !important; }

@keyframes entrar { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

@media (max-width: 768px) {
  body > div { flex-direction: column; padding: 0 16px; }
  aside { width: auto !important; margin: 16px 0 !important; }
  aside nav { flex-direction: row; flex-wrap: wrap; gap: 6px; }
  main { padding: 16px 0; }
}










### Proceso de instalación de MCP

1. En Cursor ir a Settings --> Tools & MCP --> Add Custom MCP
2. Te crea un archivo mcp.json en la carpeta de usuario
3. Luego ir a GitHub y generar un token personal con permisos de repo
4. Pegar el token en el mcp.json junto con la configuración del servidor de GitHub
5. Guardar y verificar que el servidor aparece en Settings


### Casos de uso de MCP en proyectos reales

- Pedirle a la IA que analice código directamente desde GitHub
- Ver los archivos y commits del repositorio sin salir de Cursor
