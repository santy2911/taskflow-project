# Herramientas del ecosistema backend

Documentación sobre herramientas habituales en el desarrollo de APIs y backends

---

## Axios

Axios es una librería de JavaScript para hacer peticiones HTTP, tanto en el navegador como en Node.js. Es una alternativa a la API nativa `fetch` con algunas ventajas:

- Convierte automáticamente las respuestas a JSON sin necesidad de llamar a `.json()`
- Maneja errores de forma más clara — si el servidor devuelve un 400 o 500, Axios lanza un error directamente en vez de que tengas que comprobarlo manualmente
- Permite configurar cabeceras globales, interceptores y timeouts de forma sencilla
- Es más legible en proyectos grandes donde hay muchas peticiones

**Ejemplo con fetch:**
```javascript
const res = await fetch('/api/tasks');
if (!res.ok) throw new Error('Error');
const data = await res.json();
```

**Ejemplo con Axios:**
```javascript
const { data } = await axios.get('/api/tasks');
```

Se usa principalmente en proyectos medianos y grandes donde la gestión de peticiones se vuelve compleja.

---

## Postman

Postman es una herramienta visual para probar APIs REST sin necesidad de escribir código. Permite:

- Hacer peticiones GET, POST, PUT, PATCH y DELETE a cualquier endpoint
- Guardar colecciones de peticiones organizadas por proyecto
- Añadir cabeceras, cuerpos JSON y parámetros de forma visual
- Documentar automáticamente los endpoints de una API
- Simular respuestas del servidor para probar el frontend sin backend real

Es la herramienta estándar en equipos de desarrollo para verificar que una API funciona correctamente antes de conectar el frontend. En este proyecto se usó Thunder Client, que es una versión más ligera integrada en VS Code.

---

## Sentry

Sentry es una plataforma de monitorización de errores en tiempo real. Cuando una aplicación está en producción y falla, Sentry captura el error automáticamente y lo envía a un panel donde puedes ver:

- Qué error ocurrió y en qué línea del código
- Cuántas veces ha ocurrido y cuántos usuarios se han visto afectados
- El stack trace completo para poder reproducirlo y arreglarlo

Sin Sentry, los errores en producción solo aparecen en la consola del servidor — que nadie está mirando continuamente. Con Sentry recibes una notificación en el momento en que algo falla.

Se usa en prácticamente cualquier aplicación en producción que tenga usuarios reales.

---

## Swagger

Swagger es una herramienta para documentar APIs REST de forma automática y estandarizada. Genera una página web interactiva donde cualquier desarrollador puede ver todos los endpoints disponibles, qué parámetros aceptan, qué respuestas devuelven y probarlos directamente desde el navegador.

Sigue el estándar OpenAPI, que es el formato más utilizado en la industria para describir APIs.

Se usa cuando una API va a ser consumida por otros equipos o desarrolladores externos, ya que evita tener que escribir documentación manualmente y mantenerla actualizada. En proyectos grandes es prácticamente obligatorio.