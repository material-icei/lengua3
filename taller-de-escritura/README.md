# Mi Taller de Historias

Taller interactivo para que alumnos de 3.º grado inventen y escriban su propio cuento maravilloso: crean personajes, eligen y describen un lugar, y escriben el inicio, el nudo y el desenlace.

- **Interfaz:** página estática publicada con **GitHub Pages** (`index.html`, `styles.css`, `script.js`, `config.js`).
- **Guardado:** una **API en Google Apps Script** (`apps-script/Code.gs`) que crea un Google Doc por historia en una carpeta de Drive y mantiene la hoja «Índice de producciones escritas».

Los alumnos **no necesitan cuenta de Google**: funciona en Chromebooks en modo invitado.

```
index.html        estructura de la app
styles.css        diseño
script.js         lógica (escritura, vista previa, guardado)
config.js         ← URL de Apps Script y bloqueo de la edición (único archivo a editar)
apps-script/
  Code.gs         se copia en el editor de Apps Script (no lo usa GitHub Pages)
```

---

## Paso 1 · Apps Script (backend)

1. Entrá a <https://script.google.com> con tu cuenta de docente → **Nuevo proyecto**.
2. Borrá el contenido de `Código.gs` y pegá el de **`apps-script/Code.gs`**. No hace falta ningún archivo HTML.
3. *(Opcional)* Para usar una carpeta tuya, pegá su ID en `CARPETA_ID` (está en la dirección de la carpeta: `drive.google.com/drive/folders/ESTE_ES_EL_ID`). Si no lo completás, se crea la carpeta «Mi Taller de Historias - Producciones».
4. En **Configuración del proyecto (⚙️)** elegí la zona horaria *(GMT-03:00) Argentina – Mendoza*.
5. Elegí la función **`instalar`** y tocá **▶ Ejecutar**. Aceptá los permisos: *Revisar permisos → tu cuenta → Configuración avanzada → Ir a … (no seguro) → Permitir*. Esa advertencia es normal en scripts propios.
6. **Implementar → Nueva implementación → ⚙️ Aplicación web**:
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier persona**
7. Copiá la **URL de la aplicación web** (termina en `/exec`). Si la abrís en el navegador tiene que aparecer: `"La API de Mi Taller de Historias está funcionando."`

> Cada vez que modifiques `Code.gs`: **Implementar → Gestionar implementaciones → ✏️ → Versión: Nueva versión → Implementar.** La URL no cambia.

## Paso 2 · GitHub Pages (interfaz)

1. Subí los archivos al repositorio (en la raíz: `index.html`, `styles.css`, `script.js`, `config.js`).
2. Editá **`config.js`** y pegá la URL del paso 1:
   ```js
   window.TALLER_CONFIG = {
     URL_APPS_SCRIPT: 'https://script.google.com/macros/s/AKfy…/exec'
   };
   ```
3. En el repositorio: **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: `main` / `(root)` → Save**.
4. En uno o dos minutos la app queda en `https://TU-USUARIO.github.io/NOMBRE-DEL-REPO/`. Ese es el enlace para los alumnos.

Si falta la URL en `config.js`, la pantalla de inicio muestra un aviso amarillo para el docente.

---

## Cómo se guarda

- **Nombre del archivo:** `Apellido_Nombre_y_Apellido_Nombre_3roA_Titulo` (sin tildes ni símbolos; si se repite, se agrega `_2`, `_3`…).
- Guardar varias veces la **misma** historia actualiza el mismo documento y la misma fila del índice. **Crear una copia** genera documento y fila nuevos.
- **Ver cuentos:** desde la pantalla de inicio (o la final), el alumno toca **📚 Ver cuentos**, elige su **grado y división** y ve el listado *Grado – Nombre – Título*. Al tocar un cuento, se abre para seguir editándolo, en cualquier computadora.
- No hay códigos para recordar. Cada historia tiene un identificador interno en la columna «ID de la historia (no borrar)» del índice.
- La app dice «Guardado correctamente» solo cuando Apps Script lo confirma. Si falla, el texto sigue en pantalla y se puede reintentar.
- En la carpeta también se crea `_datos_de_la_app (no borrar)` con un respaldo de cada historia (lo usa «Ver cuentos» para abrirla).

## Bloquear o desbloquear la edición (en `config.js`)

```js
PERMITIR_EDICION: true   // «Ver cuentos» abre el cuento para editarlo
PERMITIR_EDICION: false  // «Ver cuentos» lo abre solo para leer (🔒 edición bloqueada)
```

Cambiá el valor y volvé a subir `config.js` a GitHub. Pages tarda uno o dos minutos en actualizarse, y los alumnos tienen que recargar la página. Con la edición bloqueada, los alumnos pueden seguir empezando cuentos nuevos y leer los de su curso.

> Es un bloqueo de uso en el aula, no una protección de seguridad: lo controla la página y no Apps Script. Cualquier persona con el enlace puede ver los cuentos de un curso eligiendo grado y división.

## Configuración (en `Code.gs`)

| Opción | Para qué |
|---|---|
| `CARPETA_ID` | Carpeta donde se guardan todas las historias. |
| `COMPARTIR_ENLACE` | `false` (recomendado): los Docs quedan privados en tu Drive. `true`: cada Doc se comparte como «cualquiera con el enlace puede ver» y el alumno recibe el enlace. |

Para ver los enlaces a la carpeta, al índice y a la API, ejecutá `verEnlaces` en el editor y mirá el registro.
Para que otros docentes lean las producciones, compartiles la **carpeta** desde Google Drive.

## Problemas frecuentes

| Situación | Qué hacer |
|---|---|
| Aviso «falta pegar la URL… en config.js» | Completá `config.js` con la URL `/exec` y volvé a subirlo. |
| «Tu docente todavía tiene que preparar la carpeta» | Ejecutá `instalar` en Apps Script. |
| «No se pudo guardar» siempre | Revisá que la implementación tenga acceso **Cualquier persona** y que creaste una **nueva versión** tras el último cambio. Abrí la URL `/exec` para comprobar que responde. |
| «La app necesita que tu docente revise los permisos» | Ejecutá `instalar` otra vez y aceptá los permisos. |
| Cuenta institucional sin la opción «Cualquier persona» | La organización lo bloquea: pedilo al administrador o usá una cuenta que lo permita. |

**Privacidad:** solo se piden nombre, apellido, grado y división. El listado de «Ver cuentos» muestra nombre y título a quien tenga el enlace de la app: compartilo solo con tu curso. En GitHub no queda ningún dato de los alumnos: todo se guarda en tu Drive. El ID de la carpeta, si lo pegás en `Code.gs`, solo vive en Apps Script (si también subís `Code.gs` al repo, podés dejar `CARPETA_ID` sin completar: `instalar` la recuerda igual).
