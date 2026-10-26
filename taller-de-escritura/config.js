/* ==========================================================================
   Mi Taller de Historias · config.js
   --------------------------------------------------------------------------
   Pegá acá la URL de la aplicación web de Google Apps Script
   (Implementar > Gestionar implementaciones > URL que termina en /exec).

   Esta URL no es una contraseña: es la dirección pública de la API.
   El ID de la carpeta de Drive NO va acá; queda guardado en Code.gs.
   ========================================================================== */
window.TALLER_CONFIG = {
  URL_APPS_SCRIPT: 'https://script.google.com/macros/s/AKfycbwqpH7udmZnso-v1WnMo3Nwy8myUrhr7YHSWqLeOC2MdyUV8JE857DL-c6T3diQiBpCNQ/exec',

  // ¿Se pueden abrir los cuentos guardados para seguir editándolos?
  //   true  → «Ver cuentos» abre el cuento elegido para editarlo.
  //   false → «Ver cuentos» lo abre solo para leer (edición bloqueada).
  // Después de cambiarlo, subí este archivo a GitHub otra vez.
  PERMITIR_EDICION: true
};
