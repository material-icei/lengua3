# El misterio del Bosque Encantado: misión rescate

Esta es la sala de escape de la evaluación integradora de fin de año de **3.º grado** (Prácticas del Lenguaje y Ciencias Naturales). La app es una página web estática que se publica con **GitHub Pages**. Las respuestas las corrige y las guarda un servicio de **Google Apps Script** en una planilla de **Google Sheets** de la docente.

📘 **Guía docente completa** (narrativa, matriz de evaluación, textos, respuestas correctas, rúbricas y pruebas): https://claude.ai/artifact/K3et2owbxNBTmtQDEfvS8H

---

## Archivos del repositorio

| Archivo | Qué contiene | Dónde se usa |
|---|---|---|
| `index.html` | Estructura de la app (escenario de 1366 × 768 que se adapta a la pantalla, sin scroll) | GitHub Pages |
| `style.css` | Diseño visual: colores, tipografía, botones, animaciones | GitHub Pages |
| `script.js` | Lógica del juego: pantallas, mapa, desafíos, ilustraciones y comunicación con el servicio. **Acá se pega la URL del servicio.** | GitHub Pages |
| `codigo.gs` | Servicio que entrega las preguntas **sin soluciones**, corrige cada respuesta y guarda todo en la planilla. Incluye el banco de preguntas editable. | Google Apps Script |
| `README.md` | Este instructivo | — |

### Cómo se comunican

```
Chromebook del alumno                 Google Apps Script (codigo.gs)            Google Sheets
index.html + style.css + script.js
   │  GET  ?accion=banco      ───────► entrega preguntas sin soluciones
   │  POST {accion, datos}    ───────► registra, corrige y guarda ─────────────► planilla de la docente
   ◄──────────────────────────────────  responde solo "bien / reintentar / seguimos"
```

Las soluciones y los puntajes **nunca** llegan al navegador del alumno.

---

## Instalación

### Paso 1 · Planilla y servicio (Google Apps Script)

1. En Google Drive, creá una **hoja de cálculo nueva**, por ejemplo «Sala de escape 3.º — Resultados». No la compartas con los alumnos.
2. En la planilla, andá a **Extensiones › Apps Script**.
3. Borrá el contenido de `Código.gs`, pegá **todo** el contenido de `codigo.gs` y guardá (💾).
4. En **Configuración del proyecto ⚙**, elegí la zona horaria **(GMT-03:00) Buenos Aires**.
5. Volvé a la planilla y recargala. Aparece el menú **🌳 Sala de escape**. Elegí **1) Configurar planilla** y aceptá los permisos.
   - Si aparece «Google no verificó esta app», tocá **Configuración avanzada › Ir a …**: es tu propio script.
   - Esto crea las hojas, las fórmulas de análisis y el disparador de la revisión docente.
6. En el editor de Apps Script, andá a **Implementar › Nueva implementación › ⚙ › Aplicación web** y completá:
   - **Ejecutar como:** *Yo*. El servicio escribe en tu planilla y los alumnos no necesitan acceso a ella.
   - **Quién tiene acceso:** ***Cualquier usuario***. Es obligatorio: la página de GitHub se comunica con el servicio sin iniciar sesión en Google, así que con «solo mi dominio» la conexión falla.
7. Tocá **Implementar**, autorizá y **copiá la URL que termina en `/exec`**. También la ves en **🌳 Sala de escape › Ver enlace de la aplicación**.

> Si tu escuela no permite la opción «Cualquier usuario», el administrador de Google Workspace tiene que habilitar que las aplicaciones web se compartan fuera del dominio.

### Paso 2 · Pegar la URL en `script.js`

Abrí `script.js`. En la línea 8 vas a ver:

```js
var URL_SERVIDOR = 'PEGAR_AQUI_LA_URL_DEL_SERVICIO/exec';
```

Reemplazá el texto entre comillas por tu URL. Por ejemplo:

```js
var URL_SERVIDOR = 'https://script.google.com/macros/s/AKfycb.../exec';
```

Guardá el archivo (o editalo directamente en GitHub con el ícono ✏️ y tocá **Commit changes**).

### Paso 3 · Publicar en GitHub Pages

1. Subí `index.html`, `style.css`, `script.js` y `README.md` a la raíz del repositorio (**Add file › Upload files**).
2. En el repositorio, andá a **Settings › Pages**.
3. En **Build and deployment › Source**, elegí **Deploy from a branch**. Después elegí **Branch: main** y la carpeta **/ (root)** y tocá **Save**.
4. En uno o dos minutos aparece la dirección de la app, del estilo `https://<usuario>.github.io/<repositorio>/`. Ese es el **enlace para los alumnos**: compartilo por Classroom.

### Paso 4 · Probar antes de la clase

Abrí el enlace de GitHub Pages con `?modo=prueba` al final, por ejemplo `https://<usuario>.github.io/<repositorio>/?modo=prueba`:

- En la portada aparece **🧪 Modo prueba docente**. La clave inicial es `bosque2026`; cambiala desde **🌳 Sala de escape › Cambiar clave del modo prueba**.
- En este modo todas las misiones están abiertas y, después de cada respuesta, ves la respuesta esperada y el puntaje.
- Lo que respondas va solo a la hoja **Pruebas docentes**. Para limpiarla, usá **🌳 Sala de escape › Borrar pruebas docentes**.

Si la portada dice **«Falta configurar el servicio»**, la URL de `script.js` no está pegada o está mal escrita. Si dice **«No pudimos llegar al bosque»**, revisá que la implementación tenga acceso **Cualquier usuario** y que la URL termine en `/exec`.

---

## ⚠️ Importante: `codigo.gs` tiene las respuestas correctas

`codigo.gs` incluye el banco de preguntas **con las soluciones**. Si el repositorio es **público**, cualquiera puede leerlo en GitHub. Tenés dos opciones:

- **Recomendada:** no subas `codigo.gs` al repositorio público; guardalo solo en Apps Script o en tu Drive. La app funciona igual, porque las soluciones solo las usa el servicio.
- Usar un repositorio **privado**. Para publicar GitHub Pages desde un repositorio privado hace falta una cuenta GitHub Pro, Team o Education.

`index.html`, `style.css` y `script.js` **no contienen respuestas** y pueden ser públicos sin problema.

---

## Cambiar preguntas, textos, puntajes o intentos

Todo está al principio de **`codigo.gs`**, en `CONFIG` y `BANCO`. `script.js` **no se toca**: recibe las preguntas del servicio cada vez que se abre.

| Qué cambiar | Dónde (en `codigo.gs`) |
|---|---|
| Intentos por desafío | `CONFIG.INTENTOS_MAX` (hoy 2; solo se califica el primero) |
| Divisiones | `CONFIG.DIVISIONES` |
| Número de lista máximo | `CONFIG.NUMERO_LISTA_MAX` |
| Umbral de acompañamiento | `CONFIG.UMBRAL_ACOMPANAMIENTO` (0.6 = 60 %) |
| Mensajes de Lumi | `CONFIG.MENSAJES` |
| Nombres de misiones, diálogos y textos de lectura | `BANCO.misiones[n].nombre`, `.intro`, `.lectura` |
| Preguntas, opciones y respuestas | `consigna`, `opciones` / `chips` / `oraciones` y `solucion` de cada desafío |
| Puntajes y criterios | `puntos`, `criterio`, `contenidos`, `habilidad`, `comprension` |

Después de editar:

1. Guardá.
2. Andá a **Implementar › Gestionar implementaciones › ✏️ › Versión: Nueva versión › Implementar**. La URL no cambia.
3. Si cambiaste puntajes con resultados ya cargados, usá **🌳 Sala de escape › Recalcular todos los resultados**.

Algunas reglas para editar:
- No cambies los `id` de los desafíos una vez que los alumnos empezaron.
- `**palabra**` se ve resaltada y `_palabra_`, subrayada.
- En los desafíos `marcar` y `colorear`, la solución indica la posición de cada palabra contando desde 0.

---

## La planilla de resultados

| Hoja | Contenido |
|---|---|
| **Resumen general** | Una fila por alumno: estado, % por misión, % por contenido, logro global, intentos, tiempo, abiertas pendientes y dibujos secretos |
| **Respuestas individuales** | Una fila por alumno y desafío: 1.er y último intento, respuesta esperada, si acertó en el 1.er intento, intentos, puntaje y tiempo |
| **Análisis por contenidos** | Fórmulas automáticas: logro por contenido y por división, contenidos más difíciles, alumnos que necesitan acompañamiento y preguntas con más errores |
| **Revisión docente** | Respuestas abiertas: escribí 0, 1 o 2 en la columna naranja **PUNTAJE DOCENTE** y se actualiza todo solo |
| **Registro de intentos** | Respaldo de cada envío |
| **Pruebas docentes** | Lo respondido en modo prueba |
| `_Sesiones` (oculta) | Estado interno de cada alumno. **No editar.** |

El alumno **nunca** ve puntajes ni porcentajes: solo estrellas, tesoros y un diploma con su nombre.

---

## El día de la evaluación

- Cada alumno escribe su nombre, apellido, división y número de lista y elige **3 dibujos secretos**.
- Si se cierra la pestaña, el alumno vuelve al enlace, toca **Continuar** y toca sus dibujos: el juego sigue donde estaba.
- Si un alumno olvidó sus dibujos, están en la columna **Dibujos secretos** del Resumen.
- Si se corta internet, Lumi guarda la respuesta y la reenvía sola. Mientras haya respuestas pendientes, en la barra superior aparece 📡 con un número. No cierren la pestaña hasta que desaparezca.

---

## Seguridad: qué está implementado y qué no

**Implementado**

- Las soluciones están solo en el servidor.
- El servidor corrige, valida cada dato y guarda el primer intento sin sobrescribirlo. Los envíos duplicados no suman intentos.
- Cada sesión tiene una clave aleatoria. Con 6 intentos fallidos de dibujos, esa identidad se bloquea 10 minutos.
- Los envíos simultáneos se guardan de a uno (`LockService`).
- La planilla es privada.

**Límites**

- El acceso «Cualquier usuario» significa que cualquiera con la URL del servicio puede registrarse.
- Los dibujos no son una contraseña fuerte: conviene supervisar el momento en que los eligen.
- No se usa el correo de los alumnos.
- Google limita las ejecuciones simultáneas por cuenta. Si hay demoras, las respuestas se reenvían solas.

---

## Problemas frecuentes

| Síntoma | Qué hacer |
|---|---|
| «Falta configurar el servicio» | Pegá la URL `/exec` en `URL_SERVIDOR` (`script.js`, línea 8) |
| «No pudimos llegar al bosque» | Verificá que el acceso sea **Cualquier usuario**, que la URL termine en `/exec` y que haya internet |
| Los cambios en las preguntas no aparecen | **Gestionar implementaciones › Nueva versión** |
| Los cambios en `style.css` o `script.js` no aparecen | Esperá 1 o 2 minutos a que GitHub Pages publique y recargá con Ctrl + Shift + R |
| No aparece el menú «🌳 Sala de escape» | Guardá el código y recargá la planilla |
| El puntaje docente no actualiza el Resumen | Volvé a ejecutar **Configurar planilla**, que recrea el disparador `alEditar` |
| Las fórmulas del Análisis dan error | **Archivo › Configuración › Configuración regional: Argentina**, y después **Recalcular todos los resultados** |
| 🔊 no lee en voz alta | Instalá una voz en español en la Chromebook |
