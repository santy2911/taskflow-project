const inputTarea = document.getElementById('inputTarea');
const selectCategoria = document.getElementById('selectCategoria');
const selectPrioridad = document.getElementById('selectPrioridad');
const btnAnadir = document.getElementById('btnAnadir');
const inputBusqueda = document.getElementById('inputBusqueda');

btnAnadir.addEventListener('click', function() {
    const texto = inputTarea.value.trim();
    
    if (texto === '') return;
    
    const tarea = document.createElement('div');
    tarea.classList.add('tarea');
    tarea.innerHTML = `
        <div class="nombre">${texto}</div>
        <div class="categoria">Categoría: ${selectCategoria.value}</div>
        <span class="badge ${selectPrioridad.value}">${selectPrioridad.value}</span>
        <button class="btnEliminar">✕</button>`;
    
    document.getElementById('seccion-' + selectPrioridad.value).appendChild(tarea);
    
    inputTarea.value = '';
});