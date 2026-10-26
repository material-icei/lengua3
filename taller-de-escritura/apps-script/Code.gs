/**
 * ==========================================================================
 *  MI TALLER DE HISTORIAS · Backend / API (Code.gs)
 * ==========================================================================
 *  La interfaz de los alumnos está publicada en GitHub Pages (index.html,
 *  styles.css, script.js, config.js). Este archivo es la API que esa página
 *  llama con fetch(): guarda cada historia como Google Doc en UNA carpeta de
 *  Drive y mantiene el "Índice de producciones escritas" (Google Sheets).
 *
 *  Despliegue (ver README.md):
 *    1. Ejecutá instalar() una vez desde el editor y aceptá los permisos.
 *    2. Implementar > Nueva implementación > Aplicación web
 *         · Ejecutar como ............ Yo (la cuenta del docente)
 *         · Quién tiene acceso ....... Cualquier persona
 *    3. Copiá la URL que termina en /exec y pegala en config.js (GitHub).
 *
 *  API (POST con cuerpo JSON enviado como texto plano, evita el bloqueo CORS):
 *    { "accion": "estado" }                           → { ok, configurada }
 *    { "accion": "guardar",   "datos": {...} }        → { ok, codigo, estado, ... }
 *    { "accion": "listar", "grado": "3", "division": "A" } → { ok, cuentos: [{ id, grado, autores, titulo, estado }] }
 *    { "accion": "recuperar", "codigo": "KQ7-M2PX" }  → { ok, produccion, meta }
 *
 *  Seguridad:
 *    · Solo existen esas tres acciones; las funciones terminadas en "_" son internas.
 *    · Cada historia tiene un identificador interno aleatorio (ej.: KQ7-M2PX).
 *      El alumno no lo ve: elige su cuento desde «Ver cuentos» (grado y división).
 *    · El bloqueo de la edición se configura en config.js (PERMITIR_EDICION).
 *    · En GitHub no hay claves ni IDs: el ID de la carpeta vive solo acá.
 * ==========================================================================
 */

// --------------------------------------------------------------------------
// 1. CONFIGURACIÓN  ·  Completá CARPETA_ID (o dejá que instalar() cree la carpeta)
// --------------------------------------------------------------------------
const CARPETA_SIN_CONFIGURAR = 'PEGAR_AQUI_EL_ID_DE_LA_CARPETA';

const CONFIG = Object.freeze({
  // ID de la carpeta de Drive donde se guardan TODAS las historias.
  // Está en la dirección de la carpeta: https://drive.google.com/drive/folders/ESTE_ES_EL_ID
  // Si lo dejás sin completar, instalar() crea una carpeta nueva y la recuerda.
  CARPETA_ID: CARPETA_SIN_CONFIGURAR,

  NOMBRE_INDICE: 'Índice de producciones escritas',   // nombre de la hoja de cálculo
  NOMBRE_PESTANA: 'Índice',                            // pestaña dentro de la hoja
  NOMBRE_CARPETA_DATOS: '_datos_de_la_app (no borrar)', // copias de respaldo para recuperar borradores
  NOMBRE_CARPETA_NUEVA: 'Mi Taller de Historias - Producciones', // la crea instalar() si no hay carpeta
  TITULO_APP: 'Mi Taller de Historias',
  ZONA_HORARIA: 'America/Argentina/Mendoza',

  // Límites de seguridad para los datos que llegan del navegador
  MAX_AUTORES: 4,
  MAX_PERSONAJES: 10,
  MAX_TEXTO_ETAPA: 15000,
  MAX_CAMPO_LARGO: 600,
  MAX_TAMANO_ENVIO: 300000,
  ESPERA_BLOQUEO_MS: 25000,

  // true: cada documento se comparte como "cualquier persona con el enlace puede ver"
  // y el alumno recibe el enlace. false (recomendado): los documentos quedan privados.
  COMPARTIR_ENLACE: false
});

// Columnas del índice (no cambies el orden sin actualizar COL)
const COLUMNAS = [
  'Fecha de creación',
  'Última actualización',
  'Autor/es',
  'Grado y división',
  'Título',
  'Nombre del archivo',
  'Enlace al documento',
  'Estado',
  'ID de la historia (no borrar)',
  'ID del documento (técnico)'
];
const COL = { CREADO: 1, ACTUALIZADO: 2, AUTORES: 3, GRADO: 4, TITULO: 5, ARCHIVO: 6, ENLACE: 7, ESTADO: 8, CODIGO: 9, DOC_ID: 10 };

// Identificador interno de cada historia: 3 + 4 caracteres sin letras confusas (sin I, L, O, 0, 1)
const REGEX_CODIGO = /^[ABCDEFGHJKMNPQRSTUVWXYZ2-9]{3}-[ABCDEFGHJKMNPQRSTUVWXYZ2-9]{4}$/;

const TIPOS_PERSONAJE = { persona: 'Persona', animal: 'Animal', fantastico: 'Ser fantástico', otro: 'Otro' };
const MOMENTOS = { dia: 'De día', noche: 'De noche', amanecer: 'Al amanecer', atardecer: 'Al atardecer', otro: 'Otro momento' };
const ORDINAL_GRADO = { '1': '1ro', '2': '2do', '3': '3ro', '4': '4to', '5': '5to', '6': '6to', '7': '7mo' };

// Mensajes que ve el alumno (siempre aclaran que el texto no se perdió)
const MENSAJES = {
  SIN_CONFIG: 'Tu docente todavía tiene que preparar la carpeta donde se guardan las historias. Avisale, por favor. Tu texto sigue acá, no se perdió.',
  CARPETA_INACCESIBLE: 'No pudimos abrir la carpeta de las historias. Avisale a tu docente. Tu texto sigue acá, no se perdió.',
  OCUPADO: 'Muchos compañeros están guardando al mismo tiempo. Esperá un ratito y probá otra vez. Tu texto sigue acá.',
  PERMISOS: 'La app necesita que tu docente revise los permisos. Tu texto sigue acá, no se perdió.',
  FALTAN_AUTORES: 'Faltan los nombres de quienes escriben. Volvé a la primera pantalla y completalos.',
  FALTA_GRADO: 'Falta el grado o la división. Volvé a la primera pantalla y completalos.',
  DATOS_INVALIDOS: 'Algo de la historia no se pudo leer. Probá guardar otra vez.',
  CODIGO_INVALIDO: 'No pudimos abrir ese cuento. Volvé a la lista y probá otra vez.',
  NO_ENCONTRADA: 'No encontramos ese cuento. Puede que lo hayan borrado. Preguntale a tu docente.',
  GENERAL: 'No se pudo guardar. Probá otra vez en un momento. Tu texto sigue acá, no se perdió.'
};



// --------------------------------------------------------------------------
// 2. API WEB (la llama script.js desde GitHub Pages)
// --------------------------------------------------------------------------

/** Recibe { accion, ... } y responde JSON. */
function doPost(e) {
  let pedido = {};
  try {
    pedido = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  } catch (err) {
    return responderJson_({ ok: false, codigo: 'DATOS_INVALIDOS', mensaje: MENSAJES.DATOS_INVALIDOS });
  }
  switch (pedido && pedido.accion) {
    case 'estado': return responderJson_(estadoPublico());
    case 'guardar': return responderJson_(guardarProduccion(pedido.datos));
    case 'listar': return responderJson_(listarProducciones(pedido.grado, pedido.division));
    case 'recuperar': return responderJson_(recuperarProduccion(pedido.codigo));
    default: return responderJson_({ ok: false, codigo: 'ACCION_INVALIDA', mensaje: 'Acción no reconocida.' });
  }
}

/** Abrir la URL /exec en el navegador sirve para comprobar que la API funciona. */
function doGet() {
  return responderJson_({
    ok: true,
    app: CONFIG.TITULO_APP,
    configurada: !!obtenerCarpetaId_(),
    mensaje: 'La API de Mi Taller de Historias está funcionando.'
  });
}

function responderJson_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}


// --------------------------------------------------------------------------
// 3. ACCIONES DE LA API
// --------------------------------------------------------------------------

/** Indica si la carpeta está configurada (para mostrar un aviso en la bienvenida). */
function estadoPublico() {
  try {
    return { ok: true, configurada: !!obtenerCarpetaId_() };
  } catch (err) {
    return { ok: true, configurada: false };
  }
}

/**
 * Guarda (crea o actualiza) una historia.
 * Si el código ya existe en el índice, actualiza ESE documento; si no, crea uno nuevo.
 * @param {Object} datosCrudos historia enviada desde el navegador
 * @return {Object} { ok, codigo, estado, nombreArchivo, fechaTexto, url, compartido, nuevo } o { ok:false, codigo, mensaje }
 */
function guardarProduccion(datosCrudos) {
  try {
    const d = validarProduccion_(datosCrudos);
    const carpeta = obtenerCarpeta_();
    const ahora = new Date();
    const fechaTexto = formatearFecha_(ahora, "dd/MM/yyyy 'a las' HH:mm");

    // a) Abrir el índice (con bloqueo solo si hay que crearlo).
    const indice = obtenerIndiceSeguro_(carpeta);

    // b) ¿Esta historia ya tiene documento? (lectura rápida sin bloqueo)
    const filaPrevia = buscarFila_(indice.hoja, d.codigo);
    let doc = filaPrevia ? abrirDocSiExiste_(filaPrevia.docId) : null;
    let creadoAhora = false;
    if (!doc) {
      doc = DocumentApp.create('Historia en preparación ' + d.codigo);
      DriveApp.getFileById(doc.getId()).moveTo(carpeta);
      creadoAhora = true;
    }

    // c) Escribir el contenido completo del documento (fuera del bloqueo: es lo más lento).
    escribirDocumento_(doc, d, { estado: d.estado, fechaTexto: fechaTexto });
    doc.saveAndClose();

    // d) Sección crítica corta: nombre único + índice + respaldo.
    const bloqueo = LockService.getScriptLock();
    if (!bloqueo.tryLock(CONFIG.ESPERA_BLOQUEO_MS)) throw errorApp_('OCUPADO', 'No se obtuvo el bloqueo');
    let resultado;
    try {
      const fila = buscarFila_(indice.hoja, d.codigo);

      // Caso raro: dos guardados simultáneos de la MISMA historia crearon dos documentos.
      if (fila && creadoAhora && fila.docId && fila.docId !== doc.getId()) {
        const existente = abrirDocSiExiste_(fila.docId);
        if (existente) {
          DriveApp.getFileById(doc.getId()).setTrashed(true);
          escribirDocumento_(existente, d, { estado: d.estado, fechaTexto: fechaTexto });
          existente.saveAndClose();
          doc = existente;
          creadoAhora = false;
        }
      }

      const archivo = DriveApp.getFileById(doc.getId());
      const nombreArchivo = elegirNombreUnico_(carpeta, nombreBaseArchivo_(d), archivo);
      if (archivo.getName() !== nombreArchivo) archivo.setName(nombreArchivo);
      const url = urlDoc_(doc.getId());

      escribirFilaIndice_(indice.hoja, fila ? fila.numero : -1, {
        creado: (fila && fila.creado instanceof Date) ? fila.creado : ahora,
        actualizado: ahora,
        autores: nombresAutores_(d.autores),
        grado: gradoTexto_(d),
        titulo: d.titulo || 'Sin título',
        nombreArchivo: nombreArchivo,
        url: url,
        estado: d.estado === 'finalizada' ? 'Finalizada' : 'Borrador',
        codigo: d.codigo,
        docId: doc.getId()
      });
      ordenarIndice_(indice.hoja);

      const compartir = CONFIG.COMPARTIR_ENLACE === true;
      let compartido = false;
      if (compartir) {
        try {
          archivo.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
          compartido = true;
        } catch (eCompartir) {
          console.warn('No se pudo compartir con enlace (puede estar bloqueado por la organización): ' + eCompartir);
        }
      }

      guardarRespaldo_(carpeta, d, {
        estado: d.estado,
        creado: ((fila && fila.creado instanceof Date) ? fila.creado : ahora).toISOString(),
        actualizado: ahora.toISOString(),
        fechaTexto: fechaTexto,
        docId: doc.getId(),
        nombreArchivo: nombreArchivo,
        compartido: compartido
      });

      resultado = {
        ok: true,
        codigo: d.codigo,
        estado: d.estado,
        nombreArchivo: nombreArchivo,
        fechaTexto: fechaTexto,
        url: compartido ? url : '',
        compartido: compartido,
        nuevo: !fila
      };
    } finally {
      bloqueo.releaseLock();
    }
    return resultado;
  } catch (err) {
    return respuestaError_(err);
  }
}

/**
 * Lista los cuentos de un grado y división (para la pantalla «Ver cuentos»).
 * Devuelve solo lo necesario para el listado: grado, autores, título y estado.
 */
function listarProducciones(gradoCrudo, divisionCrudo) {
  try {
    const grado = String(gradoCrudo || '');
    const division = linea_(divisionCrudo, 3).toUpperCase();
    if (!ORDINAL_GRADO[grado] || !/^[A-ZÑ0-9]{1,3}$/.test(division)) {
      return { ok: false, codigo: 'FALTA_GRADO', mensaje: 'Elegí tu grado y escribí tu división, por ejemplo: A.' };
    }
    const curso = gradoTexto_({ grado: grado, division: division });
    const carpeta = obtenerCarpeta_();
    const indice = obtenerIndiceSeguro_(carpeta);
    const n = indice.hoja.getLastRow() - 1;
    if (n < 1) return { ok: true, cuentos: [] };
    const filas = indice.hoja.getRange(2, 1, n, COLUMNAS.length).getValues();
    const cuentos = filas
      .filter(function (f) { return f[COL.CODIGO - 1] && String(f[COL.GRADO - 1]).trim().toUpperCase() === curso.toUpperCase(); })
      .map(function (f) {
        return {
          id: String(f[COL.CODIGO - 1]),
          grado: String(f[COL.GRADO - 1]),
          autores: String(f[COL.AUTORES - 1] || ''),
          titulo: String(f[COL.TITULO - 1] || ''),
          estado: String(f[COL.ESTADO - 1] || '')
        };
      })
      .sort(function (a, b) { return a.autores.localeCompare(b.autores, 'es') || a.titulo.localeCompare(b.titulo, 'es'); })
      .slice(0, 400);
    return { ok: true, cuentos: cuentos };
  } catch (err) {
    const r = respuestaError_(err);
    if (r.codigo === 'GENERAL') r.mensaje = 'No pudimos traer los cuentos ahora. Probá otra vez en un momento.';
    return r;
  }
}

/**
 * Devuelve una historia guardada a partir de su identificador.
 * La pide la app al tocar un cuento en «Ver cuentos».
 */
function recuperarProduccion(codigoCrudo) {
  try {
    const codigo = normalizarCodigo_(codigoCrudo);
    if (!codigo) return { ok: false, codigo: 'CODIGO_INVALIDO', mensaje: MENSAJES.CODIGO_INVALIDO };
    const carpeta = obtenerCarpeta_();
    const carpetaDatos = carpetaDatos_(carpeta, false);
    const archivo = carpetaDatos ? buscarArchivoPorNombre_(carpetaDatos, codigo + '.json') : null;
    if (!archivo) return { ok: false, codigo: 'NO_ENCONTRADA', mensaje: MENSAJES.NO_ENCONTRADA };

    const guardado = JSON.parse(archivo.getBlob().getDataAsString('UTF-8'));
    const produccion = validarProduccion_(guardado.produccion); // se vuelve a limpiar por seguridad
    const meta = guardado.meta || {};
    return {
      ok: true,
      produccion: produccion,
      meta: {
        estado: meta.estado === 'finalizada' ? 'finalizada' : 'borrador',
        fechaTexto: meta.fechaTexto || '',
        url: meta.compartido && meta.docId ? urlDoc_(meta.docId) : ''
      }
    };
  } catch (err) {
    const r = respuestaError_(err);
    if (r.codigo === 'GENERAL') r.mensaje = 'No pudimos buscar tu historia ahora. Probá otra vez en un momento.';
    return r;
  }
}



// --------------------------------------------------------------------------
// 4. INSTALACIÓN (ejecutar UNA vez desde el editor de Apps Script)
// --------------------------------------------------------------------------

/**
 * Ejecutá esta función desde el editor (botón ▶ Ejecutar) la primera vez:
 *  · pide los permisos necesarios,
 *  · usa la carpeta configurada o crea una nueva si no hay ninguna,
 *  · crea el índice y la carpeta de respaldo.
 * Revisá el "Registro de ejecución" para ver los enlaces.
 */
function instalar() {
  let carpeta;
  const id = obtenerCarpetaId_();
  if (id) {
    carpeta = DriveApp.getFolderById(id);
    console.log('Carpeta configurada: ' + carpeta.getName() + ' → ' + carpeta.getUrl());
  } else {
    carpeta = DriveApp.createFolder(CONFIG.NOMBRE_CARPETA_NUEVA);
    props_().setProperty('CARPETA_ID', carpeta.getId());
    console.log('No había carpeta configurada. Se creó: ' + carpeta.getName() + ' → ' + carpeta.getUrl());
  }
  const indice = conBloqueo_(function () {
    const i = obtenerIndice_(carpeta);
    carpetaDatos_(carpeta, true);
    return i;
  });
  // Uso mínimo de DocumentApp para que el permiso de Documentos se pida ahora y no al primer guardado.
  const prueba = DocumentApp.create('Prueba de permisos (va a la papelera)');
  DriveApp.getFileById(prueba.getId()).setTrashed(true);

  console.log('Índice de producciones: ' + indice.ss.getUrl());
  console.log('¡Listo! Ahora: Implementar > Nueva implementación > Aplicación web, y pegá la URL /exec en config.js.');
}

/** Muestra en el registro los enlaces a la carpeta, el índice y la API. */
function verEnlaces() {
  const id = obtenerCarpetaId_();
  console.log('Carpeta: ' + (id ? DriveApp.getFolderById(id).getUrl() : '(sin configurar)'));
  const idx = props_().getProperty('INDICE_ID');
  console.log('Índice: ' + (idx ? SpreadsheetApp.openById(idx).getUrl() : '(todavía no creado)'));
  try { console.log('API (pegar en config.js): ' + ScriptApp.getService().getUrl()); } catch (e) { console.log('API: (todavía sin implementar)'); }
}


// --------------------------------------------------------------------------
// 5. AYUDANTES · configuración, permisos y errores
// --------------------------------------------------------------------------

function props_() {
  return PropertiesService.getScriptProperties();
}

function obtenerCarpetaId_() {
  const guardada = props_().getProperty('CARPETA_ID');
  if (guardada) return guardada;
  if (CONFIG.CARPETA_ID && CONFIG.CARPETA_ID !== CARPETA_SIN_CONFIGURAR) return CONFIG.CARPETA_ID;
  return '';
}

function obtenerCarpeta_() {
  const id = obtenerCarpetaId_();
  if (!id) throw errorApp_('SIN_CONFIG', 'Carpeta sin configurar');
  try {
    const carpeta = DriveApp.getFolderById(id);
    if (carpeta.isTrashed()) throw new Error('Carpeta en la papelera');
    return carpeta;
  } catch (e) {
    throw errorApp_('CARPETA_INACCESIBLE', 'No se puede abrir la carpeta ' + id + ': ' + e);
  }
}

function errorApp_(codigo, detalle) {
  const e = new Error(detalle || codigo);
  e.codigoApp = codigo;
  return e;
}

function respuestaError_(err) {
  console.error((err && err.stack) || err);
  let codigo = err && err.codigoApp;
  if (!codigo) {
    const t = String((err && err.message) || err || '');
    if (/autoriz|authoriz|permission|permiso|access denied|acceso denegado/i.test(t)) codigo = 'PERMISOS';
    else if (/lock|bloqueo|too many|demasiad|timed out|tiempo de espera/i.test(t)) codigo = 'OCUPADO';
    else codigo = 'GENERAL';
  }
  return { ok: false, codigo: codigo, mensaje: MENSAJES[codigo] || MENSAJES.GENERAL };
}

/** Ejecuta fn con el bloqueo del script (evita que dos guardados choquen). */
function conBloqueo_(fn) {
  const bloqueo = LockService.getScriptLock();
  if (!bloqueo.tryLock(CONFIG.ESPERA_BLOQUEO_MS)) throw errorApp_('OCUPADO', 'No se obtuvo el bloqueo');
  try {
    return fn();
  } finally {
    bloqueo.releaseLock();
  }
}

function formatearFecha_(fecha, patron) {
  return Utilities.formatDate(fecha, CONFIG.ZONA_HORARIA, patron);
}

function urlDoc_(id) {
  return 'https://docs.google.com/document/d/' + id + '/edit';
}


// --------------------------------------------------------------------------
// 6. VALIDACIÓN DE LOS DATOS QUE LLEGAN DEL NAVEGADOR
// --------------------------------------------------------------------------

function texto_(v, max) {
  if (v === null || v === undefined) return '';
  let s = String(v).replace(/\r\n?/g, '\n').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
  if (s.length > max) s = s.slice(0, max);
  return s.trim();
}

function linea_(v, max) {
  return texto_(v, max).replace(/\s+/g, ' ');
}

function normalizarCodigo_(c) {
  const s = String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (s.length !== 7) return '';
  const codigo = s.slice(0, 3) + '-' + s.slice(3);
  return REGEX_CODIGO.test(codigo) ? codigo : '';
}

function validarProduccion_(raw) {
  if (!raw || typeof raw !== 'object') throw errorApp_('DATOS_INVALIDOS', 'Sin datos');
  if (JSON.stringify(raw).length > CONFIG.MAX_TAMANO_ENVIO) throw errorApp_('DATOS_INVALIDOS', 'Envío demasiado grande');

  const codigo = normalizarCodigo_(raw.codigo);
  if (!codigo) throw errorApp_('DATOS_INVALIDOS', 'Código inválido');

  const autores = (Array.isArray(raw.autores) ? raw.autores : [])
    .slice(0, CONFIG.MAX_AUTORES)
    .map(function (a) { return { nombre: linea_(a && a.nombre, 60), apellido: linea_(a && a.apellido, 60) }; })
    .filter(function (a) { return a.nombre || a.apellido; });
  if (!autores.length || autores.some(function (a) { return !a.nombre || !a.apellido; })) {
    throw errorApp_('FALTAN_AUTORES', 'Autores incompletos');
  }

  const grado = String(raw.grado || '');
  const division = linea_(raw.division, 3).toUpperCase();
  if (!ORDINAL_GRADO[grado] || !/^[A-ZÑ0-9]{1,3}$/.test(division)) throw errorApp_('FALTA_GRADO', 'Grado inválido');

  let hayPrincipal = false;
  const personajes = (Array.isArray(raw.personajes) ? raw.personajes : [])
    .slice(0, CONFIG.MAX_PERSONAJES)
    .map(function (p) {
      p = p || {};
      const principal = !!p.principal && !hayPrincipal;
      if (principal) hayPrincipal = true;
      return {
        nombre: linea_(p.nombre, 60) || 'Personaje sin nombre',
        emoji: linea_(p.emoji, 16),
        edad: linea_(p.edad, 40),
        tipo: TIPOS_PERSONAJE[p.tipo] ? p.tipo : 'otro',
        tipoOtro: linea_(p.tipoOtro, 60),
        fisico: texto_(p.fisico, CONFIG.MAX_CAMPO_LARGO),
        personalidad: texto_(p.personalidad, CONFIG.MAX_CAMPO_LARGO),
        gusta: texto_(p.gusta, CONFIG.MAX_CAMPO_LARGO),
        noGusta: texto_(p.noGusta, CONFIG.MAX_CAMPO_LARGO),
        especial: texto_(p.especial, CONFIG.MAX_CAMPO_LARGO),
        principal: principal
      };
    });
  if (personajes.length && !hayPrincipal) personajes[0].principal = true;

  let lugar = null;
  if (raw.lugar && typeof raw.lugar === 'object') {
    const l = raw.lugar;
    lugar = {
      plantilla: linea_(l.plantilla, 30),
      emoji: linea_(l.emoji, 16),
      nombre: linea_(l.nombre, 80),
      como: texto_(l.como, CONFIG.MAX_CAMPO_LARGO),
      colores: texto_(l.colores, CONFIG.MAX_CAMPO_LARGO),
      sonidos: texto_(l.sonidos, CONFIG.MAX_CAMPO_LARGO),
      clima: texto_(l.clima, CONFIG.MAX_CAMPO_LARGO),
      sensaciones: texto_(l.sensaciones, CONFIG.MAX_CAMPO_LARGO),
      momento: MOMENTOS[l.momento] ? l.momento : '',
      momentoOtro: linea_(l.momentoOtro, 80)
    };
  }

  let objeto = null;
  if (raw.objeto && typeof raw.objeto === 'object' && raw.objeto.plantilla !== 'ninguno') {
    objeto = {
      plantilla: linea_(raw.objeto.plantilla, 30),
      emoji: linea_(raw.objeto.emoji, 16),
      nombre: linea_(raw.objeto.nombre, 80),
      poder: texto_(raw.objeto.poder, CONFIG.MAX_CAMPO_LARGO)
    };
    if (!objeto.nombre && !objeto.poder) objeto = null;
  }

  return {
    codigo: codigo,
    estado: raw.estado === 'finalizada' ? 'finalizada' : 'borrador',
    autores: autores,
    grado: grado,
    division: division,
    personajes: personajes,
    lugar: lugar,
    objeto: objeto,
    titulo: linea_(raw.titulo, 120),
    inicio: texto_(raw.inicio, CONFIG.MAX_TEXTO_ETAPA),
    nudo: texto_(raw.nudo, CONFIG.MAX_TEXTO_ETAPA),
    desenlace: texto_(raw.desenlace, CONFIG.MAX_TEXTO_ETAPA)
  };
}

function nombresAutores_(autores) {
  const n = autores.map(function (a) { return a.nombre + ' ' + a.apellido; });
  if (n.length <= 1) return n.join('');
  return n.slice(0, -1).join(', ') + ' y ' + n[n.length - 1];
}

function gradoTexto_(d) {
  return d.grado + '.º ' + d.division;
}


// --------------------------------------------------------------------------
// 7. NOMBRES DE ARCHIVO
// --------------------------------------------------------------------------

/** Quita tildes, ñ y símbolos; une palabras con "_". */
function limpiarParaArchivo_(s, capitalizarCadaPalabra) {
  const t = String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]+/g, ' ').trim();
  if (!t) return '';
  let palabras = t.split(/\s+/);
  if (capitalizarCadaPalabra) {
    palabras = palabras.map(function (w) { return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(); });
  } else {
    palabras[0] = palabras[0].charAt(0).toUpperCase() + palabras[0].slice(1);
  }
  return palabras.join('_');
}

/** Ej.: Perez_Ana_y_Gomez_Lucas_3roA_El_misterio_del_bosque */
function nombreBaseArchivo_(d) {
  const autores = d.autores
    .map(function (a) { return [limpiarParaArchivo_(a.apellido, true), limpiarParaArchivo_(a.nombre, true)].filter(String).join('_'); })
    .filter(String)
    .join('_y_') || 'Autor';
  const grado = ORDINAL_GRADO[d.grado] + limpiarParaArchivo_(d.division, true).replace(/_/g, '').toUpperCase();
  let titulo = limpiarParaArchivo_(d.titulo, false) || 'Sin_titulo';
  if (titulo.length > 60) titulo = titulo.slice(0, 60).replace(/_+$/, '');
  return (autores + '_' + grado + '_' + titulo).slice(0, 180);
}

/** Devuelve un nombre que no pise ningún otro archivo de la carpeta (agrega _2, _3…). */
function elegirNombreUnico_(carpeta, base, archivoPropio) {
  const idPropio = archivoPropio.getId();
  const actual = archivoPropio.getName();
  const reBase = new RegExp('^' + base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(_\\d+)?$');
  if (reBase.test(actual) && !existeOtroConNombre_(carpeta, actual, idPropio)) return actual; // conserva su número
  let candidato = base;
  let n = 2;
  while (existeOtroConNombre_(carpeta, candidato, idPropio)) {
    candidato = base + '_' + n;
    n++;
    if (n > 300) { candidato = base + '_' + Utilities.getUuid().slice(0, 8); break; }
  }
  return candidato;
}

function existeOtroConNombre_(carpeta, nombre, idPropio) {
  const it = carpeta.getFilesByName(nombre);
  while (it.hasNext()) {
    const f = it.next();
    if (f.getId() !== idPropio && !f.isTrashed()) return true;
  }
  return false;
}


// --------------------------------------------------------------------------
// 8. GOOGLE DOCS · contenido de cada historia
// --------------------------------------------------------------------------

function abrirDocSiExiste_(id) {
  if (!id) return null;
  try {
    if (DriveApp.getFileById(id).isTrashed()) return null;
    return DocumentApp.openById(id);
  } catch (e) {
    return null; // el docente lo borró o no es accesible: se crea uno nuevo
  }
}

function escribirDocumento_(doc, d, meta) {
  const body = doc.getBody();
  body.clear();

  // 1. Título
  const titulo = body.getParagraphs()[0];
  titulo.setText(d.titulo || 'Historia sin título');
  titulo.setHeading(DocumentApp.ParagraphHeading.TITLE).setAlignment(DocumentApp.HorizontalAlignment.CENTER);

  // 2-4. Autores, grado, fecha
  parrafoCentrado_(body, 'Escrito por: ' + nombresAutores_(d.autores));
  parrafoCentrado_(body, 'Grado y división: ' + gradoTexto_(d));
  parrafoCentrado_(body, 'Guardado el ' + meta.fechaTexto);
  parrafoCentrado_(body, 'Estado: ' + (meta.estado === 'finalizada' ? 'Finalizada' : 'Borrador'), '#666666');
  body.appendHorizontalRule();

  // 5. Fichas de los personajes
  titulo1_(body, 'Fichas de los personajes');
  if (!d.personajes.length) parrafoVacio_(body, 'No se cargaron personajes.');
  d.personajes.forEach(function (p) {
    titulo2_(body, (p.emoji ? p.emoji + ' ' : '') + p.nombre + (p.principal ? ' (protagonista principal)' : ''));
    const tipo = TIPOS_PERSONAJE[p.tipo] + (p.tipo === 'otro' && p.tipoOtro ? ': ' + p.tipoOtro : '');
    itemDato_(body, 'Tipo de personaje', tipo);
    itemDato_(body, 'Edad', p.edad);
    itemDato_(body, 'Características físicas', p.fisico);
    itemDato_(body, 'Forma de ser', p.personalidad);
    itemDato_(body, 'Le gusta', p.gusta);
    itemDato_(body, 'No le gusta', p.noGusta);
    itemDato_(body, 'Talento o característica especial', p.especial);
  });

  // 6. Descripción del lugar (+ objeto mágico o hallazgo)
  titulo1_(body, 'Descripción del lugar');
  if (!d.lugar) {
    parrafoVacio_(body, 'No se eligió un lugar.');
  } else {
    const l = d.lugar;
    titulo2_(body, (l.emoji ? l.emoji + ' ' : '') + (l.nombre || 'Lugar sin nombre'));
    const momento = l.momento === 'otro' ? (l.momentoOtro || MOMENTOS.otro) : (MOMENTOS[l.momento] || '');
    itemDato_(body, '¿Cómo es?', l.como);
    itemDato_(body, 'Colores, formas y cosas que se ven', l.colores);
    itemDato_(body, 'Sonidos', l.sonidos);
    itemDato_(body, 'Clima', l.clima);
    itemDato_(body, 'Sensaciones', l.sensaciones);
    itemDato_(body, 'Momento en que sucede', momento);
  }
  if (d.objeto) {
    titulo2_(body, 'Objeto mágico o hallazgo: ' + (d.objeto.emoji ? d.objeto.emoji + ' ' : '') + (d.objeto.nombre || 'sin nombre'));
    itemDato_(body, 'Poder o característica especial', d.objeto.poder);
  }

  // 7-9. La historia
  titulo1_(body, 'Inicio o introducción');
  textoHistoria_(body, d.inicio);
  titulo1_(body, 'Nudo o conflicto');
  textoHistoria_(body, d.nudo);
  titulo1_(body, 'Final o desenlace');
  textoHistoria_(body, d.desenlace);
}

// Cada párrafo agregado se "resetea" porque Docs hereda el estilo del párrafo anterior.
function normal_(p) {
  p.setHeading(DocumentApp.ParagraphHeading.NORMAL).setAlignment(DocumentApp.HorizontalAlignment.LEFT);
  return p;
}

function titulo1_(body, t) {
  body.appendParagraph(t).setHeading(DocumentApp.ParagraphHeading.HEADING1).setAlignment(DocumentApp.HorizontalAlignment.LEFT);
}

function titulo2_(body, t) {
  body.appendParagraph(t).setHeading(DocumentApp.ParagraphHeading.HEADING2).setAlignment(DocumentApp.HorizontalAlignment.LEFT);
}

function parrafoCentrado_(body, t, color) {
  const p = normal_(body.appendParagraph(t)).setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  p.editAsText().setBold(false).setItalic(false).setForegroundColor(color || '#22304a');
}

function parrafoVacio_(body, t) {
  const p = normal_(body.appendParagraph(t));
  p.editAsText().setBold(false).setItalic(true).setForegroundColor('#888888');
}

function itemDato_(body, etiqueta, valor) {
  if (!valor) return;
  const li = body.appendListItem('');
  li.setHeading(DocumentApp.ParagraphHeading.NORMAL).setGlyphType(DocumentApp.GlyphType.BULLET);
  li.appendText(etiqueta + ': ').setBold(true).setItalic(false).setForegroundColor('#22304a');
  li.appendText(valor.replace(/\n+/g, ' ')).setBold(false).setItalic(false).setForegroundColor('#22304a');
}

function textoHistoria_(body, texto) {
  const parrafos = String(texto || '').split(/\n+/).map(function (s) { return s.trim(); }).filter(String);
  if (!parrafos.length) { parrafoVacio_(body, 'Esta parte todavía no está escrita.'); return; }
  parrafos.forEach(function (t) {
    const p = normal_(body.appendParagraph(t));
    p.setIndentFirstLine(28).setLineSpacing(1.5).setSpacingAfter(6);
    p.editAsText().setBold(false).setItalic(false).setFontSize(13).setForegroundColor('#22304a');
  });
}


// --------------------------------------------------------------------------
// 9. ÍNDICE DE PRODUCCIONES (Google Sheets)
// --------------------------------------------------------------------------

/** Abre el índice sin bloqueo si ya existe; si hay que crearlo, lo hace con bloqueo. */
function obtenerIndiceSeguro_(carpeta) {
  const id = props_().getProperty('INDICE_ID');
  if (id) {
    try {
      if (!DriveApp.getFileById(id).isTrashed()) {
        const ss = SpreadsheetApp.openById(id);
        const hoja = ss.getSheetByName(CONFIG.NOMBRE_PESTANA);
        if (hoja && hoja.getRange(1, 1).getValue() === COLUMNAS[0]) return { ss: ss, hoja: hoja };
      }
    } catch (e) { /* se recrea abajo */ }
  }
  return conBloqueo_(function () { return obtenerIndice_(carpeta); });
}

/** Busca o crea "Índice de producciones escritas" en la carpeta (llamar con bloqueo). */
function obtenerIndice_(carpeta) {
  const p = props_();
  let ss = null;
  const id = p.getProperty('INDICE_ID');
  if (id) {
    try {
      if (!DriveApp.getFileById(id).isTrashed()) ss = SpreadsheetApp.openById(id);
    } catch (e) { ss = null; }
  }
  if (!ss) {
    const it = carpeta.getFilesByName(CONFIG.NOMBRE_INDICE);
    while (it.hasNext() && !ss) {
      const f = it.next();
      if (!f.isTrashed() && f.getMimeType() === MimeType.GOOGLE_SHEETS) ss = SpreadsheetApp.openById(f.getId());
    }
  }
  if (!ss) {
    ss = SpreadsheetApp.create(CONFIG.NOMBRE_INDICE);
    ss.setSpreadsheetTimeZone(CONFIG.ZONA_HORARIA);
    DriveApp.getFileById(ss.getId()).moveTo(carpeta);
  }
  p.setProperty('INDICE_ID', ss.getId());
  return { ss: ss, hoja: prepararHoja_(ss) };
}

/** Crea la pestaña, los encabezados, el formato y el filtro si no existen. */
function prepararHoja_(ss) {
  let hoja = ss.getSheetByName(CONFIG.NOMBRE_PESTANA);
  if (!hoja) {
    const hojas = ss.getSheets();
    if (hojas.length === 1 && hojas[0].getLastRow() === 0) {
      hoja = hojas[0].setName(CONFIG.NOMBRE_PESTANA);
    } else {
      hoja = ss.insertSheet(CONFIG.NOMBRE_PESTANA, 0);
    }
  }
  if (hoja.getRange(1, 1).getValue() !== COLUMNAS[0]) {
    if (hoja.getLastRow() > 0) hoja.insertRowBefore(1);
    hoja.getRange(1, 1, 1, COLUMNAS.length).setValues([COLUMNAS])
      .setFontWeight('bold').setFontColor('#ffffff').setBackground('#6b4fd1').setWrap(true).setVerticalAlignment('middle');
    hoja.getRange(1, COL.DOC_ID).setBackground('#9aa3b5');
    hoja.setFrozenRows(1);
    hoja.setRowHeight(1, 36);
    const anchos = [130, 130, 220, 90, 240, 320, 120, 100, 120, 200];
    anchos.forEach(function (w, i) { hoja.setColumnWidth(i + 1, w); });
  }
  if (!hoja.getFilter()) {
    try { hoja.getRange(1, 1, hoja.getMaxRows(), COLUMNAS.length).createFilter(); } catch (e) { /* sin filtro, no es grave */ }
  }
  return hoja;
}

/** Devuelve { numero, creado, docId } de la fila con ese código, o null. */
function buscarFila_(hoja, codigo) {
  const ultima = hoja.getLastRow();
  if (ultima < 2) return null;
  const celda = hoja.getRange(2, COL.CODIGO, ultima - 1, 1).createTextFinder(codigo).matchEntireCell(true).findNext();
  if (!celda) return null;
  const numero = celda.getRow();
  const valores = hoja.getRange(numero, 1, 1, COLUMNAS.length).getValues()[0];
  return { numero: numero, creado: valores[COL.CREADO - 1], docId: String(valores[COL.DOC_ID - 1] || '') };
}

function escribirFilaIndice_(hoja, numero, f) {
  if (numero < 2) numero = Math.max(hoja.getLastRow(), 1) + 1;
  hoja.getRange(numero, 1, 1, COLUMNAS.length).setValues([[
    f.creado, f.actualizado, f.autores, f.grado, f.titulo, f.nombreArchivo, 'Abrir historia', f.estado, f.codigo, f.docId
  ]]);
  hoja.getRange(numero, COL.CREADO, 1, 2).setNumberFormat('dd/MM/yyyy HH:mm');
  hoja.getRange(numero, COL.ENLACE).setRichTextValue(
    SpreadsheetApp.newRichTextValue().setText('Abrir historia').setLinkUrl(f.url).build()
  );
  hoja.getRange(numero, COL.DOC_ID).setFontColor('#9aa3b5');
}

/** Más recientes primero. */
function ordenarIndice_(hoja) {
  const ultima = hoja.getLastRow();
  if (ultima > 2) hoja.getRange(2, 1, ultima - 1, COLUMNAS.length).sort({ column: COL.CREADO, ascending: false });
}


// --------------------------------------------------------------------------
// 10. RESPALDO PARA RECUPERAR BORRADORES (un .json por historia)
// --------------------------------------------------------------------------

function carpetaDatos_(carpeta, crearSiFalta) {
  const it = carpeta.getFoldersByName(CONFIG.NOMBRE_CARPETA_DATOS);
  while (it.hasNext()) {
    const f = it.next();
    if (!f.isTrashed()) return f;
  }
  return crearSiFalta ? carpeta.createFolder(CONFIG.NOMBRE_CARPETA_DATOS) : null;
}

function buscarArchivoPorNombre_(carpeta, nombre) {
  const it = carpeta.getFilesByName(nombre);
  while (it.hasNext()) {
    const f = it.next();
    if (!f.isTrashed()) return f;
  }
  return null;
}

function guardarRespaldo_(carpeta, d, meta) {
  const carpetaD = carpetaDatos_(carpeta, true);
  const nombre = d.codigo + '.json';
  const contenido = JSON.stringify({ version: 1, produccion: d, meta: meta });
  const existente = buscarArchivoPorNombre_(carpetaD, nombre);
  if (existente) existente.setContent(contenido);
  else carpetaD.createFile(nombre, contenido, MimeType.PLAIN_TEXT);
}
