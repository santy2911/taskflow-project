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

