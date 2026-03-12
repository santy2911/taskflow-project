# Experimentos con IA

En este documento voy a comparar la resolución de problemas de programación con y sin ayuda de la IA, analizando tiempo, calidad del código y comprensión del problema.


## Primera pregunta: Elige tres pequeños problemas de programación

### 1º Ejercicio: Función que reciba un array de números y devuelva solo los pares


#### Mi respuesta: 

function numerosPares(numeros) {
    let pares = [];

    for( let i=0; i< numeros.length; i++ ) {
        if( numeros[i] %2 == 0 ) {
            pares.push(numeros[i] );
        }
    }
    return pares;
}





#### Respuesta de la IA:

function numerosPares(numeros) {
    return numeros.filter(n => n % 2 === 0);
}










### 2º Ejercicio: Función que cuente cuántas veces aparece una letra en un texto


#### Mi respuesta:

function contarLetras( texto, letra ) {
    let contador = 0;

    for ( let i = 0 ; i< texto.length; i++ ) {
        if ( texto [i] == letra ) {
            contador++;
        }
      }
        
      return contador;
 
}

let frase = "hola, ¿qué tal estas?"
let resultado = contarLetras(frase, "a")





#### Respuesta de la IA:

function contarLetras(texto, letra) {
    return texto.toLowerCase().split(letra.toLowerCase()).length - 1;
}










### 3º Ejercicio: Función que devuelva las tareas ordenadas por fecha de creación


#### Mi respuesta 

let tareas = [
    { nombre: "Estudiar", fecha: "2026-03-11" },
    { nombre: "Hacer ejercicio", fecha: "2026-03-10" },
    { nombre: "Jugar videojuegos", fecha: "2026-03-09" },
];

function ordenarTareas(tareas) {
    tareas.sort(function(a, b) {
        if (a.fecha > b.fecha) {
            return 1;
        } else {
            return -1;
        }
    });
    return tareas;
}





#### Respuesta de la IA:

function ordenarTareas(tareas) {
    return [...tareas].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
}



## Segunda pregunta: Compara tiempo invertido, calidad del código y comprensión del problema

### Ejercicio 1 — números pares:
Sin IA: 5-10 min, bucle for clásico
Con IA: segundos, usa filter para quedarse solo con los números divisibles entre 2

### Ejercicio 2 — contar letras:
Sin IA: 5-10 min, bucle for contando manualmente
Con IA: segundos, usa split para dividir el texto por la letra y contar las partes

### Ejercicio 3 — ordenar por fecha:
Sin IA: 5-10 min, comparación con if/else
Con IA: segundos, usa new Date() para comparar fechas reales y spread para no modificar el array original










## Tercera pregunta:Repite el experimento con tres tareas relacionadas con tu proyecto

### Ejercicio 1: barra de progreso


#### Mi codigo:
function calcularProgreso(tareas) {
    const completadas = tareas.filter(t => t.completada === true).length;
    const total = tareas.length;
    return Math.round((completadas / total) * 100);
}





#### El codigo de la IA

function calcularProgreso(tareas) {
    if (!tareas.length) return 0;
    return Math.round((tareas.filter(t => t.completada).length / tareas.length) * 100);
}










### Ejercicio 2: Mensaje al eliminar todas las tareas


#### Mi codigo:

function eliminarTodasLasTareas() {
    if (confirm("¿Borrar todas las tareas?")) {
        tareas = [];
        guardarEnStorage();
        document.querySelectorAll('.tarea').forEach(t => t.remove());
        actualizarContadores();
    }
}





#### El codigo de la IA:

function eliminarTodasLasTareas() {
    if (!tareas.length) return;
    if (confirm("¿Borrar todas las tareas?")) {
        tareas = [];
        guardarEnStorage();
        document.querySelectorAll('.tarea').forEach(t => t.remove());
        actualizarContadores();
    }
}










### Ejercicio 3: filtrar por estado


#### Mi codigo:

function filtrarPorEstado(estado) {
    document.querySelectorAll('.tarea').forEach(function(tarea) {
        if (estado === 'todas') {
            tarea.style.display = 'flex';
        } else if (estado === 'pendientes') {
            tarea.style.display = tarea.classList.contains('completada') ? 'none' : 'flex';
        } else if (estado === 'completadas') {
            tarea.style.display = tarea.classList.contains('completada') ? 'flex' : 'none';
        }
    });
}





#### El codigo de la IA:

function filtrarPorEstado(estado) {
    document.querySelectorAll('.tarea').forEach(tarea => {
        const completada = tarea.classList.contains('completada');
        tarea.style.display =
            estado === 'todas' ||
            (estado === 'pendientes' && !completada) ||
            (estado === 'completadas' && completada) ? 'flex' : 'none';
    });
}











#### Cuarta pregunta: Compara tiempo invertido, calidad del código y comprensión del problema (ejercicios TaskFlow)

##### Ejercicio 1 — barra de progreso:
Sin IA: 5-10 min, filtra las completadas y calcula el porcentaje manualmente
Con IA: segundos, misma lógica pero añade comprobación para evitar dividir entre 0

##### Ejercicio 2 — eliminar todas las tareas:
Sin IA: 5-10 min, confirm y limpia el array y el DOM
Con IA: segundos, igual pero añade comprobación si no hay tareas antes de mostrar el confirm

##### Ejercicio 3 — filtrar por estado:
Sin IA: 10-15 min, if/else para cada estado
Con IA: segundos, agrupa todo en una sola expresión con arrow function


