# Prompt Engineering

En este documento voy a guardar los prompts que he usado para generar código, refactorizar funciones y documentar el proyecto


## Primera pregunta: Experimenta con prompts donde definas un rol (por ejemplo 'actúa como un desarrollador senior')

Lo que he pedido: Actúa como un desarrollador senior revisando este código. Revisa estas funciónes y dime qué mejorarías y por qué:
(Aqui le pase el codigo de app.js)

**Por qué funciona este prompt:** Definir un rol hace que la IA sea más crítico y profesional, así da respuestas más detalladas y con criterios reales.


### La respuesta de la IA: 

Code Review — app.js (TaskFlow)
En general el código está bastante limpio para ser un proyecto de estudiante. Se entiende bien, tiene comentarios útiles y la lógica fluye de forma natural. Pero hay cosas que mejoraría:

🟡 Mejoras importantes
1. crearTareaElemento — XSS con innerHTML
js// ❌ Tu código
tarea.innerHTML = `
    <div class="nombre">${t.texto}</div>
    ...`;
```

Estás metiendo directamente input del usuario en `innerHTML`. Si alguien escribe esto como tarea:
```
<img src=x onerror="alert('hackeado')">
…se ejecuta. Esto se llama XSS (Cross-Site Scripting).
js// ✅ Mejor
const nombre = document.createElement('div');
nombre.classList.add('nombre');
nombre.textContent = t.texto; // textContent escapa el HTML automáticamente
tarea.appendChild(nombre);
O mínimo, sanitiza el texto antes de usarlo en innerHTML.

2. El toggle de completada tiene un bug potencial
js// ❌ Tu código
tarea.classList.toggle('completada');
const index = tareas.findIndex(x => x.id === t.id);
tareas[index].completada = !tareas[index].completada;
El problema es que el DOM y el array van separados. Si por alguna razón findIndex devuelve -1 (tarea no encontrada), estás haciendo tareas[-1].completada y peta silenciosamente. Más robusto:
js// ✅ Mejor
const index = tareas.findIndex(x => x.id === t.id);
if (index === -1) return;
tareas[index].completada = !tareas[index].completada;
tarea.classList.toggle('completada', tareas[index].completada);
// El segundo argumento de toggle fuerza el estado en vez de depender del DOM

3. actualizarContadores cuenta del DOM en vez del array
js// ❌ Tu código
seccion.querySelectorAll('.tarea').length
Si hay tareas ocultas por filtro o búsqueda, las sigue contando porque siguen en el DOM. El contador miente. Lo correcto es contar desde la fuente de verdad, que es tu array:
js// ✅ Mejor
const count = tareas.filter(t => t.prioridad === prioridad).length;

🟠 Detalles menores
4. El filtro y la búsqueda no se combinan
Si filtras por "Alta" y luego buscas "comprar", la búsqueda ignora el filtro activo y muestra tareas de cualquier prioridad. Habría que cruzar ambos estados al renderizar.
5. cargarTareas sin manejo de errores en el JSON
js// ❌ Puede petar si el JSON en localStorage está corrupto
tareas = guardadas ? JSON.parse(guardadas) : [];

// ✅ Mejor
try {
    tareas = guardadas ? JSON.parse(guardadas) : [];
} catch {
    tareas = [];
    localStorage.removeItem('tareas');
}
Raro que pase, pero si alguien modifica manualmente el localStorage y deja JSON roto, tu app se rompe entera al cargar.

✅ Lo que está bien

Los comentarios sobre cada función son claros y útiles.
Separar crearTareaElemento como función reutilizable es buen diseño.
Usar Date.now() como ID es sencillo y funciona bien para este caso.
guardarEnStorage centralizado evita duplicar lógica.
El código es consistente en estilo y fácil de leer.


El punto más crítico es el XSS con innerHTML — los demás son mejoras de robustez. Para el nivel del proyecto está muy bien, pero ese es el que arreglaría ya.










## Segunda pregunta: Experimenta con prompts con ejemplos (few-shot prompting)

Lo que he pedido: Quiero que generes comentarios para funciones de JavaScript. Te pongo un ejemplo de cómo quiero que sean:
Función: function sumar(a, b) { return a + b; } Comentario: // Recibe dos números y devuelve su suma
Ahora hazlo con estas funciones de mi proyecto:
(Aqui le pase el codigo de app.js)

**Por qué funciona este prompt:** Dar un ejemplo en concreto le muestra a la IA exactamente el formato y estilo que esperas, sin tener que describirlo con palabras.


### La respuesta de la IA:

Aquí tienes tu app.js con los comentarios al estilo que pediste — una línea, directo al grano, encima de cada función y bloque lógico relevante:Archivo creado, leyó un archivoArchivo creado, leyó un archivoUn par de cosas a notar sobre los comentarios:

Funciones declaradas (function guardarEnStorage) → el comentario va encima de la función.

Event listeners (btnAnadir.addEventListener) → el comentario va encima del listener, porque el listener es la lógica, no el elemento. Además añadí comentarios internos en crearTareaElemento porque esa función tiene dos sub-comportamientos distintos (click en nombre vs click en eliminar) que merecen explicarse por separado.

Líneas sueltas importantes como aplicarTema(localStorage.getItem(...)) o cargarTareas() también tienen comentario, porque sin contexto no queda claro por qué se llaman ahí.


El codigo:

// Obtiene referencias a los elementos del DOM que se usan en toda la app
const inputTarea      = document.getElementById('inputTarea');
const inputCategoria  = document.getElementById('inputCategoria');
const selectPrioridad = document.getElementById('selectPrioridad');
const btnAnadir       = document.getElementById('btnAnadir');
const inputBusqueda   = document.getElementById('inputBusqueda');
const btnTema         = document.getElementById('btnTema');

// Array en memoria que contiene todas las tareas de la sesión actual
let tareas = [];

// Serializa el array de tareas a JSON y lo persiste en localStorage
function guardarEnStorage() {
    localStorage.setItem('tareas', JSON.stringify(tareas));
}

// Recorre cada sección de prioridad y actualiza su contador con el número de tareas visibles
function actualizarContadores() {
    ['alta', 'media', 'baja'].forEach(prioridad => {
        const seccion = document.getElementById('seccion-' + prioridad);
        seccion.querySelector('h2').textContent = `Prioridad ${prioridad} (${seccion.querySelectorAll('.tarea').length})`;
    });
}

// Recibe un objeto tarea y devuelve un elemento div listo para insertar en el DOM
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

    // Al hacer click en el nombre, alterna el estado completada de la tarea y lo guarda
    tarea.querySelector('.nombre').addEventListener('click', function() {
        tarea.classList.toggle('completada');
        const index = tareas.findIndex(x => x.id === t.id);
        tareas[index].completada = !tareas[index].completada;
        guardarEnStorage();
    });

    // Al hacer click en ✕, elimina la tarea del array, del DOM y actualiza los contadores
    tarea.querySelector('.btnEliminar').addEventListener('click', function() {
        tareas = tareas.filter(x => x.id !== t.id);
        guardarEnStorage();
        tarea.remove();
        actualizarContadores();
    });

    return tarea;
}

// Lee los inputs, crea una tarea nueva, la guarda y la renderiza en su sección correspondiente
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

// Permite añadir una tarea pulsando Enter en lugar de hacer click en el botón
inputTarea.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') btnAnadir.click();
});

// Filtra las tareas visibles en tiempo real según el texto introducido en el buscador
inputBusqueda.addEventListener('input', function() {
    const busqueda = inputBusqueda.value.toLowerCase().trim();
    document.querySelectorAll('.tarea').forEach(function(tarea) {
        const nombre = tarea.querySelector('.nombre').textContent.toLowerCase();
        tarea.style.display = nombre.includes(busqueda) ? 'flex' : 'none';
    });
});

// Marca el filtro seleccionado como activo y oculta las tareas que no coincidan con la prioridad
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

// Recibe un booleano y aplica el tema oscuro o claro al documento, guardando la preferencia
function aplicarTema(oscuro) {
    document.documentElement.classList.toggle('dark', oscuro);
    btnTema.textContent = oscuro ? '🌙' : '☀️';
    localStorage.setItem('tema', oscuro ? 'dark' : 'light');
}

// Recupera el tema guardado en localStorage y lo aplica al cargar la página
aplicarTema(localStorage.getItem('tema') === 'dark');

// Al hacer click en el botón de tema, invierte el tema activo en ese momento
btnTema.addEventListener('click', function() {
    aplicarTema(!document.documentElement.classList.contains('dark'));
});

// Lee las tareas guardadas en localStorage, las carga en el array y las renderiza en el DOM
function cargarTareas() {
    const guardadas = localStorage.getItem('tareas');
    tareas = guardadas ? JSON.parse(guardadas) : [];

    tareas.forEach(function(t) {
        document.getElementById('seccion-' + t.prioridad).appendChild(crearTareaElemento(t));
    });

    actualizarContadores();
}

// Punto de entrada: ejecuta la carga de tareas al iniciar la app
cargarTareas();










## Tercera pregunta: Experimenta pidiendo razonamiento paso a paso

Lo que he pedido: Explícame paso a paso qué ocurre exactamente cuando el usuario hace clic en el botón de modo claro/oscuro en TaskFlow, desde que se dispara el evento hasta que cambia el tema en pantalla

**Por qué funciona este prompt:** Pedir razonamiento paso a paso hace que la IA no se salte detalles y explica cada parte del proceso en orden.


### La respuesta de la IA: 

Buena pregunta, y es un buen ejercicio para entender cómo fluye la ejecución. Vamos paso a paso:

1. El usuario hace click → se dispara el evento
jsbtnTema.addEventListener('click', function() {
    aplicarTema(!document.documentElement.classList.contains('dark'));
});
El navegador detecta el click en btnTema y ejecuta esta función. Lo primero que hace es evaluar la condición:
jsdocument.documentElement.classList.contains('dark')
document.documentElement es el elemento <html> — el raíz de toda la página. .classList.contains('dark') devuelve true si tiene la clase dark, o false si no la tiene. El ! lo invierte. Es decir:

Si ahora está en modo oscuro → pasa false a aplicarTema (queremos pasar al claro)
Si ahora está en modo claro → pasa true a aplicarTema (queremos pasar al oscuro)


2. Se ejecuta aplicarTema(oscuro)
jsfunction aplicarTema(oscuro) {
    document.documentElement.classList.toggle('dark', oscuro);
    btnTema.textContent = oscuro ? '🌙' : '☀️';
    localStorage.setItem('tema', oscuro ? 'dark' : 'light');
}
Esta función hace tres cosas en orden:
2a. Añade o quita la clase dark del <html>
jsdocument.documentElement.classList.toggle('dark', oscuro);
toggle con un segundo argumento booleano funciona así: si oscuro es true, añade la clase; si es false, la quita. Esa clase dark en el <html> es la que Tailwind usa para activar todos los estilos dark:.
2b. Cambia el icono del botón
jsbtnTema.textContent = oscuro ? '🌙' : '☀️';
Si vamos a modo oscuro muestra 🌙, si vamos a modo claro muestra ☀️.
2c. Persiste la preferencia en localStorage
jslocalStorage.setItem('tema', oscuro ? 'dark' : 'light');
Guarda el string 'dark' o 'light' para recordarlo cuando el usuario recargue la página.

3. El navegador repinta la página automáticamente
En cuanto la clase dark se añade o quita del <html>, el navegador detecta el cambio en el DOM y aplica los estilos correspondientes. Esto ocurre en dos capas:
Capa Tailwind — todas las clases con prefijo dark: en el HTML se activan o desactivan. Por ejemplo:
html<body class="bg-gray-100 dark:bg-[#1a1a2e]">
Con dark en el <html> → fondo #1a1a2e. Sin ella → fondo gris claro.
Capa CSS manual — las reglas en style.css que usan el selector .dark también entran en juego:
css.dark .tarea { background: #243656; border-color: #2a4a7f; }
.dark .active { background: #0f3460 !important; color: #7a9cff !important; }
Estas se aplican porque .dark ahora existe en el ancestro <html>.

4. En la próxima carga de página, se restaura el tema
jsaplicarTema(localStorage.getItem('tema') === 'dark');
```

Esta línea se ejecuta **una sola vez al cargar el script**. Lee el valor guardado en localStorage y llama directamente a `aplicarTema` — sin esperar ningún click. Si el valor guardado es `'dark'`, pasa `true`; si es `'light'` o no existe nada, pasa `false`.

---

## El flujo completo resumido
```
Click en btnTema
    │
    ▼
¿Tiene <html> la clase "dark"? → invierte el booleano
    │
    ▼
aplicarTema(booleano)
    ├── toggle 'dark' en <html>          → activa/desactiva selectores Tailwind y CSS
    ├── cambia textContent del botón     → 🌙 o ☀️
    └── guarda en localStorage           → persiste entre recargas
Lo elegante de este diseño es que toda la lógica del tema vive en una sola función. El click solo calcula el nuevo estado y delega — aplicarTema es la única que toca el DOM y el storage. Eso hace que sea fácil de mantener y reutilizar.










## Cuarta pregunta: Experimenta usando restricciones claras en la respuesta

Lo que he pedido: Revisa el código de index.html y dime qué mejorarías. Responde únicamente con un máximo de 5 puntos, cada uno en una sola frase, sin ejemplos de código y ordenados de más a menos importante

**Por qué funciona este prompt:** Las restricciones claras evitan respuestas largas, forzando a la IA a priorizar y ser concisa.


### La respuesta de la IA: 

Code Review — index.html

Accesibilidad: Los botones y enlaces de filtro carecen de atributos aria-label o roles semánticos, lo que los hace inaccesibles para lectores de pantalla.

Seguridad CSP: No hay ninguna Content Security Policy definida en un <meta> tag, dejando la app expuesta a inyecciones de scripts externos.

Separación de responsabilidades: La configuración de Tailwind está hardcodeada en el HTML con un <script> inline; debería vivir en un archivo de configuración externo.

SEO/Meta: Faltan etiquetas <meta name="description"> y lang correctamente aprovechado — el lang="es" está bien, pero no hay ningún meta de descripción ni og:title para compartir.

style.css referenciado pero no adjunto: Se enlaza un href="style.css" que no existe en el repo, lo que genera una petición 404 en cada carga.










## Quinta pregunta: Guarda al menos diez prompts útiles. Explica por qué cada prompt funciona bien

Los cuatro prompts de antes mas estos:

5º Analiza el flujo completo de datos en TaskFlow: desde que el usuario añade una tarea hasta que se persiste en localStorage y se renderiza en el DOM
**Por qué funciona este prompt:** Pedir que analice un flujo completo obliga a la IA a conectar todas las partes del código en lugar de explicarlas por separado, dando una visión global más útil

6º Actúa como un experto en UX y dime qué problemas de usabilidad tiene TaskFlow y cómo los solucionarías
**Por qué funciona este prompt:** Definir el rol de experto en UX cambia el enfoque de la IA hacia la experiencia del usuario en lugar del código, obteniendo un tipo de feedback diferente y complementario

7º¿Cómo refactorizaría TaskFlow si quisiera añadir múltiples usuarios con sus propias listas de tareas? Dame solo la estructura, sin código
**Por qué funciona este prompt:** Pedir solo la estructura sin código fuerza a la IA a pensar en el diseño y la arquitectura en lugar de generar código que quizás no necesitas, siendo más útil para planificar.

8º Explícame qué pasaría si dos usuarios abrieran TaskFlow en el mismo navegador a la vez y cómo afectaría al localStorage
**Por qué funciona este prompt:** Es un prompt muy concreto que obliga a la IA a razonar sobre un escenario específico, lo que genera respuestas más precisas que preguntas genéricas

9º ¿Qué pruebas o tests básicos haría para comprobar que TaskFlow funciona correctamente?
**Por qué funciona este prompt:** Preguntar por tests obliga a la IA a pensar en qué puede fallar en el código, lo que a veces detecta problemas que no habías visto revisando el código directamente

10º Si TaskFlow creciera y tuviera 1000 tareas, ¿qué partes del código podrían volverse lentas y cómo lo optimizarías?
**Por qué funciona este prompt:** Plantear un caso extremo como 1000 tareas obliga a la IA a identificar qué partes del código serían un problema real si la app creciera, algo que con pocos datos no se nota
