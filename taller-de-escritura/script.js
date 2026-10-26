/* Mi Taller de Historias · script.js (lógica de la interfaz) */
/* ==========================================================================
   MI TALLER DE HISTORIAS · Lógica del navegador (JavaScript puro)
   --------------------------------------------------------------------------
   · El estado de la historia vive en el objeto `historia` y se copia en
     localStorage después de cada cambio (por si se cierra la pestaña).
   · Guardar en Drive es explícito (botones): se envía con fetch() a la API
     de Google Apps Script cuya URL está en config.js.
     Nunca se muestra "Guardado correctamente" sin la respuesta del servidor.
   · Todo el texto escrito por los alumnos se inserta con textContent
     (nunca como HTML).
   ========================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------------
     1. CONTENIDO FIJO (alineado con la secuencia del cuento maravilloso)
     ------------------------------------------------------------------ */
  var CLAVE_LOCAL = 'mi_taller_historias_v1';
  // Cada historia tiene un identificador interno (ej. KQ7-M2PX). El alumno no lo ve: abre sus cuentos desde «Ver cuentos».
  var ALFABETO = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  var REGEX_CODIGO = /^[ABCDEFGHJKMNPQRSTUVWXYZ2-9]{3}-[ABCDEFGHJKMNPQRSTUVWXYZ2-9]{4}$/;
  var MAX_AUTORES = 4;
  var MAX_PERSONAJES = 10;

  var INSPIRACION = [
    { emoji: '👸', nombre: 'Princesa curiosa', tipo: 'persona', idea: 'Juega en el jardín del palacio y siempre quiere descubrir secretos.' },
    { emoji: '🐸', nombre: 'Sapo que habla', tipo: 'animal', idea: 'Vive en una fuente. ¿Y si esconde un encantamiento?' },
    { emoji: '🧚', nombre: 'Hada distraída', tipo: 'fantastico', idea: 'Tiene una varita mágica, pero a veces se olvida de los hechizos.' },
    { emoji: '🐺', nombre: 'Lobo miedoso', tipo: 'animal', idea: 'Parece feroz, pero en realidad es muy tímido.' },
    { emoji: '🧒', nombre: 'Exploradora de jardines', tipo: 'persona', idea: 'Es curiosa, observadora y cuida mucho la naturaleza.' },
    { emoji: '👵', nombre: 'Abuela sabia', tipo: 'persona', idea: 'Conoce muchas plantas y siempre tiene una buena idea.' },
    { emoji: '🐉', nombre: 'Dragón amistoso', tipo: 'fantastico', idea: 'Echa chispas de colores cuando está contento.' },
    { emoji: '🐶', nombre: 'Perro detective', tipo: 'animal', idea: 'Con su nariz encuentra cualquier pista.' },
    { emoji: '👩‍🔬', nombre: 'Científica inventora', tipo: 'persona', idea: 'Arma máquinas raras en su laboratorio.' },
    { emoji: '🤖', nombre: 'Robot ayudante', tipo: 'otro', idea: 'Quiere aprender qué son las emociones.' },
    { emoji: '🧙', nombre: 'Mago aprendiz', tipo: 'fantastico', idea: 'Sus hechizos todavía salen un poco al revés.' }
  ];

  var AVATARES = [
    ['🧒', 'Niño o niña'], ['👧', 'Niña'], ['👦', 'Niño'], ['👸', 'Princesa'], ['🤴', 'Príncipe'],
    ['👵', 'Abuela'], ['👴', 'Abuelo'], ['🧙', 'Mago'], ['🧚', 'Hada'], ['🧜', 'Sirena'],
    ['🦸', 'Superhéroe'], ['👩‍🔬', 'Científica'], ['🤖', 'Robot'], ['👽', 'Extraterrestre'], ['🐸', 'Sapo'],
    ['🐺', 'Lobo'], ['🐶', 'Perro'], ['🐱', 'Gato'], ['🦊', 'Zorro'], ['🐰', 'Conejo'],
    ['🦉', 'Búho'], ['🐢', 'Tortuga'], ['🐉', 'Dragón'], ['🦄', 'Unicornio'], ['🐟', 'Pez'], ['⭐', 'Estrella']
  ];

  var TIPOS = [['persona', '🧑 Persona'], ['animal', '🐾 Animal'], ['fantastico', '✨ Ser fantástico'], ['otro', '❓ Otro']];
  var NOMBRE_TIPO = { persona: 'Persona', animal: 'Animal', fantastico: 'Ser fantástico', otro: 'Otro' };

  var LUGARES = [
    { id: 'bosque', emoji: '🌳', nombre: 'Un bosque encantado' },
    { id: 'castillo', emoji: '🏰', nombre: 'Un castillo misterioso' },
    { id: 'palacio', emoji: '⛲', nombre: 'Los jardines del palacio' },
    { id: 'patio', emoji: '🏡', nombre: 'El patio de la abuela' },
    { id: 'escuela', emoji: '🏫', nombre: 'Una escuela' },
    { id: 'isla', emoji: '🏝️', nombre: 'Una isla desierta' },
    { id: 'espacio', emoji: '🚀', nombre: 'El espacio exterior' },
    { id: 'ciudad', emoji: '🌆', nombre: 'Una ciudad futurista' },
    { id: 'mar', emoji: '🐠', nombre: 'El fondo del mar' },
    { id: 'inventado', emoji: '✨', nombre: 'Un lugar inventado', inventar: true }
  ];

  var MOMENTOS = [['dia', '☀️ De día'], ['noche', '🌙 De noche'], ['amanecer', '🌅 Al amanecer'], ['atardecer', '🌇 Al atardecer'], ['otro', '✏️ Otro']];
  var NOMBRE_MOMENTO = { dia: 'De día', noche: 'De noche', amanecer: 'Al amanecer', atardecer: 'Al atardecer', otro: 'Otro momento' };

  var OBJETOS = [
    { id: 'semilla', emoji: '🌱', nombre: 'Una semilla dorada' },
    { id: 'varita', emoji: '🪄', nombre: 'Una varita mágica' },
    { id: 'espejo', emoji: '🪞', nombre: 'Un espejo que habla' },
    { id: 'lampara', emoji: '🪔', nombre: 'Una lámpara maravillosa' },
    { id: 'pelota', emoji: '🟡', nombre: 'Una pelota de oro' },
    { id: 'llave', emoji: '🔑', nombre: 'Una llave antigua' },
    { id: 'mapa', emoji: '🗺️', nombre: 'Un mapa del tesoro' },
    { id: 'caja', emoji: '📦', nombre: 'Una caja misteriosa' },
    { id: 'bola', emoji: '🔮', nombre: 'Una bola de cristal' },
    { id: 'escoba', emoji: '🧹', nombre: 'Una escoba voladora' },
    { id: 'inventado', emoji: '✨', nombre: 'Inventar mi objeto', inventar: true },
    { id: 'ninguno', emoji: '🚫', nombre: 'Sin objeto mágico', ninguno: true }
  ];

  // [lo que se muestra, lo que se inserta]
  var CONECTORES = {
    inicio: [['Había una vez…', 'había una vez '], ['Hace mucho tiempo…', 'hace mucho tiempo, '], ['Un día…', 'un día, '], ['Cierta tarde…', 'cierta tarde, '], ['Al comienzo…', 'al comienzo, ']],
    nudo: [['De repente…', 'de repente, '], ['De pronto…', 'de pronto, '], ['Entonces…', 'entonces '], ['Mientras tanto…', 'mientras tanto, '], ['Sin embargo…', 'sin embargo, '], ['Después…', 'después, '], ['A la mañana siguiente…', 'a la mañana siguiente, ']],
    desenlace: [['Por eso…', 'por eso '], ['Al final…', 'al final, '], ['Finalmente…', 'finalmente, '], ['Desde aquel día…', 'desde aquel día, '], ['Y así fue como…', 'y así fue como ']]
  };

  var ETAPAS = [
    {
      id: 'inicio', numero: 1, nombre: 'Inicio', largo: 'Inicio o introducción', color: 'turquesa', icono: '🌅',
      explica: 'En el inicio conocemos a los personajes. Descubrimos dónde están y cuándo sucede la historia.',
      preguntas: ['¿Quiénes participan?', '¿Dónde están?', '¿Cuándo sucede?', '¿Qué están haciendo al comienzo?'],
      ayudas: [
        'Presentá a tu personaje contando cómo es. Podés usar adjetivos: curioso, valiente, amable, misterioso, antiguo, brillante, enorme.',
        'Contá dónde y cuándo pasa, por ejemplo: «Cierta tarde, en el patio de la abuela…».',
        'Muchos cuentos maravillosos empiezan con «Había una vez…» o «Hace mucho tiempo…».'
      ],
      siguiente: 'Seguir con el nudo ▶', festejo: '¡Inicio listo! Ahora… ¡algo va a suceder! ⚡'
    },
    {
      id: 'nudo', numero: 2, nombre: 'Nudo', largo: 'Nudo o conflicto', color: 'coral', icono: '⚡',
      explica: '¡Algo sucede! Tus personajes encuentran un problema, viven una aventura o deben resolver un misterio.',
      preguntas: ['¿Qué problema aparece?', '¿Qué sucede inesperadamente?', '¿Cómo reaccionan los personajes?', '¿Qué intentan hacer para resolverlo?', '¿Qué obstáculos encuentran?'],
      ayudas: [
        'En los cuentos maravillosos muchas cosas pasan de a tres: tres hadas, tres pruebas, tres intentos. ¿Tu personaje intenta algo tres veces?',
        'Si hay un objeto mágico, contá qué poder tiene y qué pasa cuando lo usan.',
        'Contá cómo se siente tu personaje: ¿preocupado, asustado, sorprendido, decidido?'
      ],
      siguiente: 'Seguir con el final ▶', festejo: '¡Qué aventura! Ahora contá cómo termina 🌈'
    },
    {
      id: 'desenlace', numero: 3, nombre: 'Final', largo: 'Final o desenlace', color: 'violeta', icono: '🌈',
      explica: 'Es hora de descubrir cómo termina la aventura. ¿Se resolvió el problema? ¿Qué aprendieron los personajes?',
      preguntas: ['¿Cómo se resuelve el problema?', '¿Qué hacen los personajes al final?', '¿Cómo termina la aventura?', '¿Qué cambia después de lo sucedido?'],
      ayudas: [
        'El final puede ser feliz, sorprendente, divertido o abierto. ¡Vos elegís!',
        'Podés contar qué aprendió tu personaje o qué cambió desde aquel día.',
        'Algunos cuentos terminan con «Y vivieron felices…». ¡También podés inventar tu propio cierre!'
      ],
      siguiente: '', festejo: ''
    }
  ];

  var AYUDAS_COMUNES = [
    'Después de un punto, la palabra siguiente empieza con mayúscula.',
    'Para no repetir tanto un nombre podés usar: «la niña», «el protagonista», «ella», «él».',
    'Para empezar un párrafo nuevo, apretá la tecla Enter.'
  ];

  var REVISION = [
    'Presenté al protagonista y el lugar.',
    'Conté qué problema o hallazgo apareció.',
    'Expliqué cómo se resolvió.',
    'Usé conectores (Un día…, De pronto…, Finalmente…).',
    'Agregué adjetivos para describir.',
    'Usé verbos en pasado (encontró, corrió, vivieron).',
    'Usé mayúscula después de cada punto.'
  ];

  var PASOS = [
    { id: 'bienvenida', nombre: 'Mis datos' },
    { id: 'personajes', nombre: 'Personajes' },
    { id: 'lugar', nombre: 'El lugar' },
    { id: 'taller', nombre: 'Escribir' },
    { id: 'final', nombre: '¡Listo!' }
  ];
  var PANTALLAS = ['bienvenida', 'cuentos', 'leer', 'personajes', 'lugar', 'taller', 'vista', 'final'];
  var PANTALLAS_SIN_BARRA = ['bienvenida', 'cuentos', 'leer'];


  /* ------------------------------------------------------------------
     2. ESTADO
     ------------------------------------------------------------------ */
  var URL_API = String((window.TALLER_CONFIG && window.TALLER_CONFIG.URL_APPS_SCRIPT) || '').trim();
  // Acepta cuentas personales (.../macros/s/ID/exec) y de Workspace (.../a/macros/dominio/s/ID/exec)
  var conectado = /^https:\/\/script\.google\.com\/(macros|a\/macros\/[^/]+)\/s\/[^/]+\/exec$/.test(URL_API);

  /**
   * Llama a la API de Apps Script. Se envía como texto plano para que el navegador
   * no haga la consulta previa CORS (Apps Script no la responde).
   * Devuelve una promesa con la respuesta JSON del servidor.
   */
  function llamarApi(pedido, msEspera) {
    var control = window.AbortController ? new AbortController() : null;
    var temporizador = setTimeout(function () { if (control) control.abort(); }, msEspera || 90000);
    return fetch(URL_API, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(pedido),
      redirect: 'follow',
      signal: control ? control.signal : undefined
    }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    }).then(function (datos) {
      clearTimeout(temporizador);
      return datos;
    }, function (err) {
      clearTimeout(temporizador);
      var e = new Error(err && err.name === 'AbortError' ? 'DEMORA' : 'RED');
      e.original = err;
      throw e;
    });
  }

  // Interruptor del docente (config.js): permite o bloquea editar los cuentos guardados.
  var EDICION_PERMITIDA = !(window.TALLER_CONFIG && window.TALLER_CONFIG.PERMITIR_EDICION === false);

  var MENSAJE_DEMORA = 'La conexión está tardando mucho. Probá otra vez en un momento. Tu texto sigue acá, no se perdió.';
  var MENSAJE_SIN_INTERNET = 'Parece que no hay internet. Revisá la conexión y probá otra vez. Tu texto sigue acá, no se perdió.';
  var MENSAJE_GENERAL = 'No se pudo guardar. Probá otra vez en un momento. Tu texto sigue acá, no se perdió.';
  var historia = null;
  var ui = {
    pantalla: 'bienvenida',
    guardando: false,
    errorGuardado: '',
    ultimoChip: '',
    editandoId: null,
    configurada: true
  };

  function nuevaHistoria(base) {
    base = base || {};
    return {
      version: 1,
      codigo: generarCodigo(),
      estado: 'borrador',
      autores: base.autores ? clonar(base.autores) : [{ nombre: '', apellido: '' }],
      grado: base.grado || '3',
      division: base.division || '',
      personajes: [],
      lugar: null,
      objeto: null,
      titulo: '',
      inicio: '',
      nudo: '',
      desenlace: '',
      etapa: 'inicio',
      pantalla: 'personajes',
      revision: 0,
      revisionGuardada: 0,
      guardadoEnDrive: false,
      ultimaFechaDrive: '',
      docUrl: ''
    };
  }

  function generarCodigo() {
    var n = new Uint32Array(7);
    (window.crypto || window.msCrypto).getRandomValues(n);
    var s = '';
    for (var i = 0; i < 7; i++) s += ALFABETO.charAt(n[i] % ALFABETO.length);
    return s.slice(0, 3) + '-' + s.slice(3);
  }

  function normalizarCodigo(c) {
    var s = String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (s.length !== 7) return '';
    var codigo = s.slice(0, 3) + '-' + s.slice(3);
    return REGEX_CODIGO.test(codigo) ? codigo : '';
  }

  function clonar(o) { return JSON.parse(JSON.stringify(o)); }
  function nuevoId() { return 'p' + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36); }

  function tieneContenido(h) {
    return !!(h && (h.titulo || h.inicio || h.nudo || h.desenlace || h.personajes.length || h.lugar));
  }
  function hayPendientes() { return historia.revision !== historia.revisionGuardada; }

  // ---- Copia local (localStorage) ----
  var temporizadorLocal = null;
  function guardarLocalPronto() {
    clearTimeout(temporizadorLocal);
    temporizadorLocal = setTimeout(guardarLocalYa, 300);
  }
  function guardarLocalYa() {
    clearTimeout(temporizadorLocal);
    try { localStorage.setItem(CLAVE_LOCAL, JSON.stringify(historia)); } catch (e) { /* almacenamiento no disponible */ }
  }
  function cargarLocal() {
    try {
      var t = localStorage.getItem(CLAVE_LOCAL);
      if (!t) return null;
      var h = JSON.parse(t);
      if (!h || h.version !== 1 || !REGEX_CODIGO.test(h.codigo)) return null;
      var base = nuevaHistoria();
      Object.keys(base).forEach(function (k) { if (!(k in h)) h[k] = base[k]; });
      if (!Array.isArray(h.autores) || !h.autores.length) h.autores = [{ nombre: '', apellido: '' }];
      if (!Array.isArray(h.personajes)) h.personajes = [];
      return h;
    } catch (e) {
      return null;
    }
  }

  /** Llamar después de cada cambio hecho por el alumno. */
  function huboCambio() {
    historia.revision++;
    guardarLocalPronto();
    actualizarEstadoGuardado();
  }


  /* ------------------------------------------------------------------
     3. AYUDANTES DE INTERFAZ
     ------------------------------------------------------------------ */
  function $(id) { return document.getElementById(id); }

  /** Crea elementos sin usar innerHTML con texto del alumno. */
  function el(etiqueta, props, hijos) {
    var n = document.createElement(etiqueta);
    if (props) {
      Object.keys(props).forEach(function (k) {
        var v = props[k];
        if (v === null || v === undefined || v === false) return;
        if (k === 'class') n.className = v;
        else if (k === 'text') n.textContent = v;
        else if (k.indexOf('on') === 0) n.addEventListener(k.slice(2), v);
        else n.setAttribute(k, v === true ? '' : v);
      });
    }
    (hijos || []).forEach(function (h) {
      if (h === null || h === undefined || h === false) return;
      n.appendChild(typeof h === 'string' ? document.createTextNode(h) : h);
    });
    return n;
  }
  function vaciar(n) { while (n.firstChild) n.removeChild(n.firstChild); }

  var temporizadorAviso = null;
  function avisar(texto) {
    var a = $('aviso-flotante');
    a.textContent = texto;
    a.hidden = false;
    clearTimeout(temporizadorAviso);
    temporizadorAviso = setTimeout(function () { a.hidden = true; }, 3600);
  }

  function celebrar() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var c = $('confeti');
    var figuras = ['⭐', '✨', '🎉', '🌟', '📚', '✏️', '🎈'];
    for (var i = 0; i < 36; i++) {
      var s = document.createElement('span');
      s.textContent = figuras[i % figuras.length];
      s.style.left = (Math.random() * 100) + 'vw';
      s.style.animationDelay = (Math.random() * 0.8) + 's';
      s.style.fontSize = (1.2 + Math.random() * 1.4) + 'rem';
      c.appendChild(s);
    }
    setTimeout(function () { vaciar(c); }, 3800);
  }

  /** Diálogo de confirmación propio (más claro para chicos que confirm()). Devuelve una promesa. */
  function confirmar(o) {
    return new Promise(function (resolver) {
      var d = $('dlg-confirmar');
      var si = $('conf-si');
      var no = $('conf-no');
      var resuelto = false;
      $('conf-icono').textContent = o.icono || '🤔';
      $('conf-titulo').textContent = o.titulo || '';
      $('conf-texto').textContent = o.texto || '';
      si.textContent = o.si || 'Sí';
      no.textContent = o.no || 'No';
      si.className = 'btn ' + (o.peligro ? 'btn-coral' : 'btn-principal');
      function terminar(valor) {
        if (resuelto) return;
        resuelto = true;
        si.onclick = null; no.onclick = null; d.onclose = null;
        if (d.open) d.close();
        resolver(valor);
      }
      si.onclick = function () { terminar(true); };
      no.onclick = function () { terminar(false); };
      d.onclose = function () { terminar(false); };
      d.showModal();
      (o.peligro ? no : si).focus();
    });
  }

  function contarPalabras(t) {
    var s = String(t || '').trim();
    return s ? s.split(/\s+/).length : 0;
  }

  function nombresAutores(lista) {
    var n = lista.filter(function (a) { return a.nombre || a.apellido; })
      .map(function (a) { return (a.nombre + ' ' + a.apellido).trim(); });
    if (n.length <= 1) return n.join('');
    return n.slice(0, -1).join(', ') + ' y ' + n[n.length - 1];
  }

  function etapaPorId(id) {
    for (var i = 0; i < ETAPAS.length; i++) if (ETAPAS[i].id === id) return ETAPAS[i];
    return ETAPAS[0];
  }


  /* ------------------------------------------------------------------
     4. NAVEGACIÓN ENTRE PANTALLAS Y BARRA DE PROGRESO
     ------------------------------------------------------------------ */
  var RENDER = {};

  function mostrar(nombre, opciones) {
    opciones = opciones || {};
    cerrarMenus();
    PANTALLAS.forEach(function (p) { $('pantalla-' + p).hidden = (p !== nombre); });
    ui.pantalla = nombre;
    if (['personajes', 'lugar', 'taller', 'final'].indexOf(nombre) !== -1) {
      historia.pantalla = nombre;
      guardarLocalPronto();
    }
    $('barra').hidden = PANTALLAS_SIN_BARRA.indexOf(nombre) !== -1;
    document.documentElement.style.setProperty('--alto-barra', ($('barra').hidden ? 0 : ($('barra').offsetHeight || 64)) + 'px');
    if (RENDER[nombre]) RENDER[nombre](opciones);
    renderPasos();
    actualizarEstadoGuardado();
    window.scrollTo(0, 0);
    if (!opciones.focoPropio) {
      var foco = document.querySelector('#pantalla-' + nombre + ' [data-foco]');
      if (foco) foco.focus({ preventScroll: true });
    }
  }

  function datosCompletos() {
    var autoresOk = historia.autores.length > 0 && historia.autores.every(function (a) { return a.nombre.trim() && a.apellido.trim(); });
    return autoresOk && !!historia.division.trim();
  }

  function pasoHecho(id) {
    switch (id) {
      case 'bienvenida': return datosCompletos();
      case 'personajes': return historia.personajes.length > 0;
      case 'lugar': return !!historia.lugar;
      case 'taller': return ETAPAS.every(function (e) { return historia[e.id].trim(); });
      case 'final': return historia.estado === 'finalizada' && historia.guardadoEnDrive && !hayPendientes();
    }
    return false;
  }

  function pasoDisponible(id) {
    switch (id) {
      case 'bienvenida': return true;
      case 'personajes': return datosCompletos();
      case 'lugar': return datosCompletos() && historia.personajes.length > 0;
      case 'taller':
      case 'final': return datosCompletos() && historia.personajes.length > 0 && !!historia.lugar;
    }
    return false;
  }

  function renderPasos() {
    var ol = $('pasos');
    vaciar(ol);
    var actual = ui.pantalla === 'vista' ? 'taller' : ui.pantalla;
    PASOS.forEach(function (p, i) {
      var hecho = pasoHecho(p.id);
      var esActual = p.id === actual;
      var btn = el('button', {
        type: 'button',
        class: 'paso' + (hecho ? ' hecho' : ''),
        'aria-current': esActual ? 'step' : null,
        disabled: !pasoDisponible(p.id) && !esActual,
        onclick: function () { if (!esActual) irAPaso(p.id); }
      }, [
        el('span', { class: 'circulo', 'aria-hidden': 'true', text: hecho ? '✓' : String(i + 1) }),
        el('span', { class: 'etiqueta-paso', text: p.nombre }),
        el('span', { class: 'solo-lectores', text: hecho ? ' (completo)' : '' })
      ]);
      ol.appendChild(el('li', null, [btn]));
    });
  }

  function irAPaso(id) {
    if (id === 'bienvenida') { mostrar('bienvenida'); return; }
    if (!pasoDisponible(id)) return;
    mostrar(id);
  }


  /* ------------------------------------------------------------------
     5. GUARDADO EN GOOGLE DRIVE
     ------------------------------------------------------------------ */
  function textoChip(estado) {
    return {
      pendiente: '✏️ Cambios pendientes',
      guardando: '⏳ Guardando…',
      ok: '✅ Guardado correctamente',
      error: '⚠️ No se pudo guardar'
    }[estado] || '';
  }

  function estadoChipActual() {
    if (ui.guardando) return 'guardando';
    if (ui.errorGuardado) return 'error';
    if (hayPendientes()) return 'pendiente';
    if (historia.guardadoEnDrive) return 'ok';
    return 'nada';
  }

  function actualizarEstadoGuardado() {
    var chip = $('chip-guardado');
    var btn = $('btn-guardar');
    var estado = estadoChipActual();
    var mostrarChip = estado !== 'nada' && (tieneContenido(historia) || historia.guardadoEnDrive);
    chip.hidden = !mostrarChip;
    if (ui.ultimoChip !== estado) {
      chip.className = 'chip-guardado chip-' + estado;
      chip.textContent = textoChip(estado);
      ui.ultimoChip = estado;
    }
    chip.title = (estado === 'ok' && historia.ultimaFechaDrive) ? 'Último guardado: ' + historia.ultimaFechaDrive : '';
    btn.disabled = ui.guardando;
    btn.textContent = estado === 'error' ? '🔄 Intentar nuevamente'
      : (historia.estado === 'finalizada' ? '💾 Guardar cambios' : '💾 Guardar borrador');
    $('btn-guardar-final').disabled = ui.guardando;
    if (ui.pantalla === 'final') renderResultadoFinal();
  }

  function armarEnvio(estado) {
    return {
      codigo: historia.codigo,
      estado: estado,
      autores: historia.autores.map(function (a) { return { nombre: a.nombre.trim(), apellido: a.apellido.trim() }; }),
      grado: historia.grado,
      division: historia.division.trim(),
      personajes: historia.personajes.map(function (p) {
        return {
          nombre: p.nombre, emoji: p.emoji, edad: p.edad, tipo: p.tipo, tipoOtro: p.tipoOtro,
          fisico: p.fisico, personalidad: p.personalidad, gusta: p.gusta, noGusta: p.noGusta,
          especial: p.especial, principal: !!p.principal
        };
      }),
      lugar: historia.lugar ? clonar(historia.lugar) : null,
      objeto: historia.objeto && historia.objeto.plantilla !== 'ninguno' ? clonar(historia.objeto) : null,
      titulo: historia.titulo,
      inicio: historia.inicio,
      nudo: historia.nudo,
      desenlace: historia.desenlace
    };
  }

  /**
   * Envía la historia a Apps Script.
   * @param {string} estado 'borrador' o 'finalizada'
   * @param {boolean} esReintento uso interno (reintento automático si el servidor está ocupado)
   */
  function guardarEnDrive(estado, esReintento) {
    if (ui.guardando && !esReintento) return;
    if (!datosCompletos()) {
      avisar('Primero completá tu nombre, apellido y división ✏️');
      mostrar('bienvenida');
      validarDatos(true);
      return;
    }
    if (!conectado) {
      ui.errorGuardado = 'La app todavía no está conectada a Google Drive. Avisale a tu docente. Tu texto sigue acá, no se perdió.';
      actualizarEstadoGuardado();
      avisar('⚠️ No se pudo guardar: la app no está conectada a Drive');
      return;
    }
    var revisionEnviada = historia.revision;
    var codigoEnviado = historia.codigo;
    var envio = armarEnvio(estado);
    ui.guardando = true;
    actualizarEstadoGuardado();

    function fallo(mensaje) {
      ui.guardando = false;
      ui.errorGuardado = mensaje || MENSAJE_GENERAL;
      actualizarEstadoGuardado();
      avisar('⚠️ No se pudo guardar. Tu texto sigue acá.');
    }

    llamarApi({ accion: 'guardar', datos: envio })
      .then(function (r) {
        if (codigoEnviado !== historia.codigo) { ui.guardando = false; actualizarEstadoGuardado(); return; } // se empezó otra historia
        if (r && r.ok) {
          ui.guardando = false;
          aplicarGuardadoExitoso(r, revisionEnviada);
          return;
        }
        if (r && r.codigo === 'OCUPADO' && !esReintento) {
          setTimeout(function () { guardarEnDrive(estado, true); }, 2500 + Math.random() * 4000);
          return;
        }
        fallo(r && r.mensaje);
      })
      .catch(function (err) {
        if (window.console) console.warn('Error al guardar:', err && (err.original || err));
        if (err && err.message === 'DEMORA') fallo(MENSAJE_DEMORA);
        else fallo(navigator.onLine === false ? MENSAJE_SIN_INTERNET : MENSAJE_GENERAL);
      });
  }

  function aplicarGuardadoExitoso(r, revisionEnviada) {
    historia.revisionGuardada = revisionEnviada;
    historia.estado = r.estado;
    historia.guardadoEnDrive = true;
    historia.ultimaFechaDrive = r.fechaTexto || '';
    historia.docUrl = r.url || '';
    ui.errorGuardado = '';
    guardarLocalYa();
    actualizarEstadoGuardado();
    renderPasos();
    avisar(r.estado === 'finalizada' ? '¡Tu historia quedó guardada en Drive! 🎉' : '¡Borrador guardado en Drive! ✅');
    if (r.estado === 'finalizada' && ui.pantalla === 'final') celebrar();
  }


  /* ------------------------------------------------------------------
     6. PANTALLA DE BIENVENIDA
     ------------------------------------------------------------------ */
  RENDER.bienvenida = function () {
    var hayHistoria = tieneContenido(historia);
    $('caja-continuar').hidden = !hayHistoria;
    $('form-datos').hidden = hayHistoria;
    if (hayHistoria) {
      $('continuar-titulo').textContent = historia.titulo ? '«' + historia.titulo + '»' : 'una historia que todavía no tiene título';
      var quien = nombresAutores(historia.autores);
      $('continuar-autores').textContent = quien ? 'Escrita por ' + quien + (historia.division ? ' · ' + historia.grado + '.º ' + historia.division : '') : '';
    }
    renderAutores();
    $('campo-grado').value = historia.grado;
    $('campo-division').value = historia.division;
    $('aviso-config').hidden = ui.configurada;
  };

  function renderAutores() {
    var cont = $('lista-autores');
    vaciar(cont);
    historia.autores.forEach(function (a, i) {
      var idN = 'autor-' + i + '-nombre';
      var idA = 'autor-' + i + '-apellido';
      var inputN = el('input', { id: idN, type: 'text', maxlength: '60', autocomplete: 'off', 'aria-describedby': idN + '-error' });
      var inputA = el('input', { id: idA, type: 'text', maxlength: '60', autocomplete: 'off', 'aria-describedby': idA + '-error' });
      inputN.value = a.nombre;
      inputA.value = a.apellido;
      inputN.addEventListener('input', function () { a.nombre = inputN.value; limpiarError(inputN); huboCambio(); });
      inputA.addEventListener('input', function () { a.apellido = inputA.value; limpiarError(inputA); huboCambio(); });
      var quitar = i > 0 ? el('button', {
        type: 'button', class: 'btn btn-claro btn-chico btn-quitar',
        'aria-label': 'Quitar al autor o autora ' + (i + 1),
        onclick: function () { historia.autores.splice(i, 1); huboCambio(); renderAutores(); $('btn-agregar-autor').focus(); }
      }, ['✕ Quitar']) : null;
      cont.appendChild(el('div', { class: 'fila-autor' }, [
        el('span', { class: 'autor-num', 'aria-hidden': 'true', text: String(i + 1) }),
        el('div', { class: 'campo' }, [
          el('label', { for: idN, text: historia.autores.length > 1 ? 'Nombre (' + (i + 1) + ')' : 'Tu nombre' }),
          inputN,
          el('p', { class: 'error', id: idN + '-error', hidden: true })
        ]),
        el('div', { class: 'campo' }, [
          el('label', { for: idA, text: historia.autores.length > 1 ? 'Apellido (' + (i + 1) + ')' : 'Tu apellido' }),
          inputA,
          el('p', { class: 'error', id: idA + '-error', hidden: true })
        ]),
        quitar
      ]));
    });
    $('btn-agregar-autor').hidden = historia.autores.length >= MAX_AUTORES;
  }

  function marcarError(input, mensaje) {
    input.setAttribute('aria-invalid', 'true');
    var p = $(input.getAttribute('aria-describedby'));
    if (p) { p.textContent = mensaje; p.hidden = false; }
  }
  function limpiarError(input) {
    input.removeAttribute('aria-invalid');
    var p = $(input.getAttribute('aria-describedby'));
    if (p) p.hidden = true;
  }

  function validarDatos(mostrarErrores) {
    var primero = null;
    historia.autores.forEach(function (a, i) {
      var n = $('autor-' + i + '-nombre');
      var ap = $('autor-' + i + '-apellido');
      if (!a.nombre.trim()) { if (mostrarErrores && n) marcarError(n, 'Escribí el nombre'); primero = primero || n; }
      if (!a.apellido.trim()) { if (mostrarErrores && ap) marcarError(ap, 'Escribí el apellido'); primero = primero || ap; }
    });
    var div = $('campo-division');
    if (!historia.division.trim()) {
      if (mostrarErrores) marcarError(div, 'Escribí tu división, por ejemplo: A');
      primero = primero || div;
    }
    if (primero && mostrarErrores) primero.focus();
    return !primero;
  }

  function iniciarBienvenida() {
    $('btn-agregar-autor').addEventListener('click', function () {
      if (historia.autores.length >= MAX_AUTORES) return;
      historia.autores.push({ nombre: '', apellido: '' });
      huboCambio();
      renderAutores();
      $('autor-' + (historia.autores.length - 1) + '-nombre').focus();
    });
    $('campo-grado').addEventListener('change', function () { historia.grado = this.value; huboCambio(); });
    $('campo-division').addEventListener('input', function () {
      var v = this.value.toUpperCase().replace(/[^A-ZÑ0-9]/g, '');
      if (v !== this.value) this.value = v;
      historia.division = v;
      limpiarError(this);
      huboCambio();
    });
    $('form-datos').addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validarDatos(true)) return;
      avisar('¡Hola, ' + historia.autores[0].nombre.trim() + '! Vamos a crear personajes ✨');
      mostrar('personajes');
    });
    $('btn-continuar').addEventListener('click', function () {
      if (!datosCompletos()) {
        $('caja-continuar').hidden = true;
        $('form-datos').hidden = false;
        validarDatos(true);
        return;
      }
      var destino = historia.pantalla && pasoDisponible(historia.pantalla) ? historia.pantalla : 'personajes';
      mostrar(destino);
    });
    $('btn-empezar-otra').addEventListener('click', function () { empezarNuevaHistoria(true); });
    $('btn-ver-cuentos').addEventListener('click', function () { mostrar('cuentos'); });
  }

  /* ------------------------------------------------------------------
     VER CUENTOS · listado por grado y división
     ------------------------------------------------------------------ */
  var cuentos = { grado: '', division: '', buscando: false, abriendo: false };

  function iniciarCuentos() {
    $('form-cuentos').addEventListener('submit', function (e) { e.preventDefault(); buscarCuentos(); });
    $('filtro-division').addEventListener('input', function () {
      var v = this.value.toUpperCase().replace(/[^A-ZÑ0-9]/g, '');
      if (v !== this.value) this.value = v;
    });
    $('filtro-grado').addEventListener('change', function () { if ($('filtro-division').value) buscarCuentos(); });
    $('btn-imprimir-leer').addEventListener('click', function () { window.print(); });
    $('btn-ver-cuentos-final').addEventListener('click', function () { mostrar('cuentos'); });
  }

  RENDER.cuentos = function () {
    $('aviso-bloqueo').hidden = EDICION_PERMITIDA;
    $('cuentos-explica').textContent = EDICION_PERMITIDA
      ? 'Elegí tu grado y tu división, y tocá un cuento para seguir escribiéndolo.'
      : 'Elegí tu grado y tu división, y tocá un cuento para leerlo.';
    // Se completan con los datos del alumno, si ya los escribió
    if (!$('filtro-division').value) {
      $('filtro-grado').value = cuentos.grado || historia.grado || '3';
      $('filtro-division').value = cuentos.division || historia.division || '';
    }
    if ($('filtro-division').value && !cuentos.buscando) buscarCuentos();
    else if (!$('filtro-division').value) $('filtro-division').focus({ preventScroll: true });
  };

  function mensajeCuentos(texto, esError) {
    var m = $('msg-cuentos');
    m.textContent = texto || '';
    m.className = 'mensaje mensaje-cuentos' + (esError ? ' es-error' : '');
  }

  function buscarCuentos() {
    var grado = $('filtro-grado').value;
    var division = $('filtro-division').value.trim();
    var lista = $('lista-cuentos');
    if (!division) {
      mensajeCuentos('Escribí tu división, por ejemplo: A', true);
      $('filtro-division').focus();
      return;
    }
    if (!conectado) {
      mensajeCuentos('La app todavía no está conectada a Google Drive. Avisale a tu docente.', true);
      return;
    }
    cuentos.grado = grado;
    cuentos.division = division;
    cuentos.buscando = true;
    $('btn-buscar-cuentos').disabled = true;
    vaciar(lista);
    mensajeCuentos('Buscando los cuentos de ' + grado + '.º ' + division + '… ⏳');
    llamarApi({ accion: 'listar', grado: grado, division: division }, 45000)
      .then(function (r) {
        cuentos.buscando = false;
        $('btn-buscar-cuentos').disabled = false;
        if (!r || !r.ok) { mensajeCuentos((r && r.mensaje) || 'No pudimos traer los cuentos. Probá otra vez.', true); return; }
        renderListaCuentos(r.cuentos || [], grado, division);
      })
      .catch(function () {
        cuentos.buscando = false;
        $('btn-buscar-cuentos').disabled = false;
        mensajeCuentos('No pudimos traer los cuentos. Revisá internet y probá otra vez.', true);
      });
  }

  function renderListaCuentos(items, grado, division) {
    var lista = $('lista-cuentos');
    vaciar(lista);
    var curso = grado + '.º ' + division;
    if (!items.length) {
      mensajeCuentos('Todavía no hay cuentos guardados de ' + curso + '. ¡Podés empezar uno nuevo desde el inicio!');
      return;
    }
    mensajeCuentos(items.length === 1 ? 'Hay 1 cuento de ' + curso + '.' : 'Hay ' + items.length + ' cuentos de ' + curso + '.');
    lista.appendChild(el('h3', { id: 'titulo-lista-cuentos', class: 'solo-lectores', text: 'Cuentos de ' + curso }));
    lista.appendChild(el('div', { class: 'encabezado-lista', 'aria-hidden': 'true' }, [
      el('span', { text: 'Grado' }), el('span', { text: 'Nombre' }), el('span', { text: 'Título' }), el('span')
    ]));
    items.forEach(function (c) {
      var titulo = c.titulo || 'Sin título';
      var accion = EDICION_PERMITIDA ? '✏️ Editar' : '📖 Leer';
      lista.appendChild(el('button', {
        type: 'button', class: 'item-cuento',
        'aria-label': (EDICION_PERMITIDA ? 'Editar' : 'Leer') + ' «' + titulo + '», de ' + c.autores + ', ' + c.grado,
        onclick: function () { abrirCuento(c.id); }
      }, [
        el('span', { class: 'ic-grado', text: c.grado }),
        el('span', { class: 'ic-nombre', text: c.autores }),
        el('span', { class: 'ic-titulo' }, [titulo, el('span', { class: 'ic-estado', text: c.estado === 'Finalizada' ? '✓ Terminado' : '✏️ En borrador' })]),
        el('span', { class: 'ic-accion', 'aria-hidden': 'true', text: accion + ' ▶' })
      ]));
    });
  }

  function abrirCuento(id) {
    if (cuentos.abriendo) return;
    cuentos.abriendo = true;
    mensajeCuentos('Abriendo el cuento… ⏳');
    llamarApi({ accion: 'recuperar', codigo: id }, 45000)
      .then(function (r) {
        cuentos.abriendo = false;
        if (!r || !r.ok) { mensajeCuentos((r && r.mensaje) || 'No pudimos abrir ese cuento. Probá otra vez.', true); return; }
        mensajeCuentos('');
        if (EDICION_PERMITIDA) aplicarHistoriaRecuperada(r);
        else mostrarSoloLectura(r.produccion);
      })
      .catch(function () {
        cuentos.abriendo = false;
        mensajeCuentos('No pudimos abrir ese cuento. Revisá internet y probá otra vez.', true);
      });
  }

  function mostrarSoloLectura(p) {
    var h = nuevaHistoria();
    ['autores', 'grado', 'division', 'personajes', 'lugar', 'objeto', 'titulo', 'inicio', 'nudo', 'desenlace'].forEach(function (k) {
      if (p[k] !== undefined && p[k] !== null) h[k] = p[k];
    });
    renderLibro(h, $('libro-leer'), false);
    mostrar('leer');
  }

  function aplicarHistoriaRecuperada(r) {
    var p = r.produccion;
    if (!EDICION_PERMITIDA) { mostrarSoloLectura(p); return; }
    function cargar() {
      var h = nuevaHistoria();
      h.codigo = p.codigo;
      h.estado = r.meta.estado;
      h.autores = p.autores;
      h.grado = p.grado;
      h.division = p.division;
      h.personajes = p.personajes.map(function (x) { x.id = nuevoId(); return x; });
      h.lugar = p.lugar;
      h.objeto = p.objeto;
      h.titulo = p.titulo;
      h.inicio = p.inicio;
      h.nudo = p.nudo;
      h.desenlace = p.desenlace;
      h.guardadoEnDrive = true;
      h.ultimaFechaDrive = r.meta.fechaTexto || '';
      h.docUrl = r.meta.url || '';
      h.pantalla = 'taller';
      historia = h;
      ui.errorGuardado = '';
      guardarLocalYa();
      avisar('¡Cuento abierto! 📖 Seguí escribiendo.');
      mostrar('taller');
    }
    if (tieneContenido(historia) && hayPendientes() && historia.codigo !== p.codigo) {
      confirmar({
        icono: '📖', peligro: true,
        titulo: '¿Cambiar de historia?',
        texto: 'La historia que está abierta tiene cambios que todavía no se guardaron en Drive. Si abrís la otra, esos cambios se pierden.',
        si: 'Sí, abrir el otro cuento', no: 'No, quedarme con esta'
      }).then(function (ok) { if (ok) cargar(); });
    } else {
      cargar();
    }
  }


  /* ------------------------------------------------------------------
     7. MÓDULO 1 · PERSONAJES
     ------------------------------------------------------------------ */
  function iniciarPersonajes() {
    var grilla = $('grilla-inspiracion');
    INSPIRACION.forEach(function (t) {
      grilla.appendChild(el('button', {
        type: 'button', class: 'tarjeta-opcion',
        'aria-label': t.nombre + '. ' + t.idea + ' Tocá para crear un personaje inspirado en esta tarjeta.',
        onclick: function () { abrirFicha(null, t); }
      }, [
        el('span', { class: 'emoji', 'aria-hidden': 'true', text: t.emoji }),
        el('span', { class: 'nombre', text: t.nombre }),
        el('span', { class: 'idea-corta', text: t.idea })
      ]));
    });
    grilla.appendChild(el('button', {
      type: 'button', class: 'tarjeta-opcion tarjeta-inventar',
      onclick: function () { abrirFicha(null, null); }
    }, [
      el('span', { class: 'emoji', 'aria-hidden': 'true', text: '✨' }),
      el('span', { class: 'nombre', text: 'Inventar mi propio personaje' }),
      el('span', { class: 'idea-corta', text: '¡Desde cero, como vos quieras!' })
    ]));

    // Selector de imagen (radios accesibles)
    var selector = $('selector-avatar');
    AVATARES.forEach(function (a, i) {
      selector.appendChild(el('label', { class: 'chip-opcion', title: a[1] }, [
        el('input', { type: 'radio', name: 'avatar', value: a[0], id: 'avatar-' + i, 'aria-label': a[1] }),
        el('span', { 'aria-hidden': 'true', text: a[0] })
      ]));
    });
    var tipos = $('chips-tipo');
    TIPOS.forEach(function (t) {
      tipos.appendChild(el('label', { class: 'chip-opcion' }, [
        el('input', { type: 'radio', name: 'tipo', value: t[0] }),
        el('span', { text: t[1] })
      ]));
    });
    tipos.addEventListener('change', function () {
      $('campo-tipo-otro').hidden = valorRadio('tipo') !== 'otro';
    });

    $('form-personaje').addEventListener('submit', function (e) { e.preventDefault(); guardarFicha(); });
    Array.prototype.forEach.call(document.querySelectorAll('#dlg-personaje [data-cerrar]'), function (b) {
      b.addEventListener('click', function () { $('dlg-personaje').close(); });
    });
    $('p-nombre').addEventListener('input', function () { limpiarError(this); });

    $('btn-agregar-personaje').addEventListener('click', function () { abrirFicha(null, null); });
    $('btn-personajes-listos').addEventListener('click', function () {
      var msg = $('msg-personajes');
      if (!historia.personajes.length) {
        msg.textContent = 'Creá al menos un personaje para seguir. ¡Podés tocar una tarjeta para inspirarte!';
        msg.hidden = false;
        return;
      }
      msg.hidden = true;
      celebrar();
      avisar(historia.personajes.length === 1 ? '¡Tu personaje está listo! ⭐' : '¡Tus personajes están listos! ⭐');
      mostrar('lugar');
    });
  }

  function valorRadio(nombre) {
    var r = document.querySelector('input[name="' + nombre + '"]:checked');
    return r ? r.value : '';
  }
  function marcarRadio(nombre, valor) {
    Array.prototype.forEach.call(document.querySelectorAll('input[name="' + nombre + '"]'), function (r) { r.checked = (r.value === valor); });
  }

  function abrirFicha(id, plantilla) {
    if (!id && historia.personajes.length >= MAX_PERSONAJES) {
      avisar('¡Ya tenés ' + MAX_PERSONAJES + ' personajes! Es un montón de protagonistas 😄');
      return;
    }
    ui.editandoId = id;
    var p = id ? historia.personajes.filter(function (x) { return x.id === id; })[0] : null;
    var idea = $('dlg-idea');
    $('dlg-personaje-titulo').textContent = p ? 'Ficha de ' + p.nombre : 'Nuevo personaje';
    if (plantilla) {
      idea.textContent = '💡 Idea: ' + plantilla.nombre + '. ' + plantilla.idea + ' Inventale un nombre y cambiá todo lo que quieras.';
      idea.hidden = false;
    } else {
      idea.hidden = true;
    }
    $('p-nombre').value = p ? p.nombre : '';
    $('p-nombre').placeholder = 'Por ejemplo: Lola, Tomi, Chispa';
    $('p-edad').value = p ? p.edad : '';
    $('p-tipo-otro').value = p ? p.tipoOtro : '';
    $('p-fisico').value = p ? p.fisico : '';
    $('p-personalidad').value = p ? p.personalidad : '';
    $('p-gusta').value = p ? p.gusta : '';
    $('p-nogusta').value = p ? p.noGusta : '';
    $('p-especial').value = p ? p.especial : '';
    marcarRadio('avatar', p ? p.emoji : (plantilla ? plantilla.emoji : '🧒'));
    marcarRadio('tipo', p ? p.tipo : (plantilla ? plantilla.tipo : 'persona'));
    $('campo-tipo-otro').hidden = valorRadio('tipo') !== 'otro';
    limpiarError($('p-nombre'));
    $('dlg-personaje').showModal();
    $('p-nombre').focus();
  }

  function guardarFicha() {
    var nombre = $('p-nombre').value.trim();
    if (!nombre) {
      marcarError($('p-nombre'), 'Escribile un nombre a tu personaje');
      $('p-nombre').focus();
      return;
    }
    var datos = {
      nombre: nombre,
      emoji: valorRadio('avatar') || '🧒',
      edad: $('p-edad').value.trim(),
      tipo: valorRadio('tipo') || 'persona',
      tipoOtro: $('p-tipo-otro').value.trim(),
      fisico: $('p-fisico').value.trim(),
      personalidad: $('p-personalidad').value.trim(),
      gusta: $('p-gusta').value.trim(),
      noGusta: $('p-nogusta').value.trim(),
      especial: $('p-especial').value.trim()
    };
    var esNuevo = !ui.editandoId;
    if (esNuevo) {
      datos.id = nuevoId();
      datos.principal = historia.personajes.length === 0;
      historia.personajes.push(datos);
    } else {
      var p = historia.personajes.filter(function (x) { return x.id === ui.editandoId; })[0];
      if (p) Object.keys(datos).forEach(function (k) { p[k] = datos[k]; });
    }
    $('dlg-personaje').close();
    huboCambio();
    renderPersonajes();
    avisar(esNuevo ? '¡' + nombre + ' ya es parte de tu historia! ⭐' : 'Ficha actualizada ✅');
  }

  function elegirPrincipal(id) {
    historia.personajes.forEach(function (p) { p.principal = (p.id === id); });
    huboCambio();
    renderPersonajes();
    var b = document.querySelector('[data-principal="' + id + '"]');
    if (b) b.focus();
  }

  function eliminarPersonaje(id) {
    var p = historia.personajes.filter(function (x) { return x.id === id; })[0];
    if (!p) return;
    confirmar({
      icono: '🗑️', peligro: true,
      titulo: '¿Borrar a ' + p.nombre + '?',
      texto: 'Se va a borrar su ficha. Lo que ya escribiste en la historia no cambia.',
      si: 'Sí, borrar', no: 'No, dejarlo'
    }).then(function (ok) {
      if (!ok) return;
      historia.personajes = historia.personajes.filter(function (x) { return x.id !== id; });
      if (historia.personajes.length && !historia.personajes.some(function (x) { return x.principal; })) historia.personajes[0].principal = true;
      huboCambio();
      renderPersonajes();
      $('btn-agregar-personaje').focus();
    });
  }

  function renderPersonajes() {
    var lista = $('lista-personajes');
    vaciar(lista);
    var n = historia.personajes.length;
    $('sin-personajes').hidden = n > 0;
    $('contador-personajes').textContent = n ? '(' + n + ')' : '';
    if (n) $('msg-personajes').hidden = true;
    historia.personajes.forEach(function (p) {
      var tipo = p.tipo === 'otro' && p.tipoOtro ? p.tipoOtro : NOMBRE_TIPO[p.tipo];
      var sub = [tipo, p.edad].filter(Boolean).join(' · ');
      var resumen = p.personalidad || p.fisico || p.gusta || '';
      lista.appendChild(el('article', { class: 'tarjeta-personaje' + (p.principal ? ' es-principal' : '') }, [
        el('div', { class: 'tp-cabecera' }, [
          el('span', { class: 'tp-avatar', 'aria-hidden': 'true', text: p.emoji || '🧒' }),
          el('div', null, [
            el('h4', { class: 'tp-nombre', text: p.nombre }),
            el('p', { class: 'tp-sub', text: sub }),
            p.principal ? el('span', { class: 'insignia', text: '⭐ Protagonista principal' }) : null
          ])
        ]),
        resumen ? el('p', { class: 'tp-texto', text: resumen }) : null,
        el('div', { class: 'tp-acciones' }, [
          el('button', { type: 'button', class: 'btn btn-claro btn-chico', onclick: function () { abrirFicha(p.id, null); } }, ['✏️ Editar ficha']),
          n > 1 ? el('button', {
            type: 'button', class: 'btn btn-claro btn-chico', 'data-principal': p.id,
            'aria-pressed': p.principal ? 'true' : 'false',
            onclick: function () { elegirPrincipal(p.id); }
          }, [p.principal ? '⭐ Es el principal' : '☆ Hacer principal']) : null,
          el('button', { type: 'button', class: 'btn btn-claro btn-chico', 'aria-label': 'Eliminar a ' + p.nombre, onclick: function () { eliminarPersonaje(p.id); } }, ['🗑️ Eliminar'])
        ])
      ]));
    });
  }
  RENDER.personajes = renderPersonajes;


  /* ------------------------------------------------------------------
     8. MÓDULO 2 · LUGAR Y OBJETO MÁGICO
     ------------------------------------------------------------------ */
  var CAMPOS_LUGAR = { 'l-nombre': 'nombre', 'l-como': 'como', 'l-colores': 'colores', 'l-sonidos': 'sonidos', 'l-clima': 'clima', 'l-sensaciones': 'sensaciones', 'l-momento-otro': 'momentoOtro' };

  function iniciarLugar() {
    Object.keys(CAMPOS_LUGAR).forEach(function (idCampo) {
      $(idCampo).addEventListener('input', function () {
        if (!historia.lugar) return;
        historia.lugar[CAMPOS_LUGAR[idCampo]] = this.value;
        huboCambio();
        renderResumenLugar();
      });
    });
    var chips = $('chips-momento');
    MOMENTOS.forEach(function (m) {
      chips.appendChild(el('label', { class: 'chip-opcion' }, [
        el('input', { type: 'radio', name: 'momento', value: m[0] }),
        el('span', { text: m[1] })
      ]));
    });
    chips.addEventListener('change', function () {
      if (!historia.lugar) return;
      historia.lugar.momento = valorRadio('momento');
      $('campo-momento-otro').hidden = historia.lugar.momento !== 'otro';
      huboCambio();
      renderResumenLugar();
    });
    $('o-nombre').addEventListener('input', function () { if (historia.objeto) { historia.objeto.nombre = this.value; huboCambio(); } });
    $('o-poder').addEventListener('input', function () { if (historia.objeto) { historia.objeto.poder = this.value; huboCambio(); } });
    $('btn-lugar-listo').addEventListener('click', function () {
      var msg = $('msg-lugar');
      if (!historia.lugar) {
        msg.textContent = 'Elegí un lugar para tu historia. ¡También podés inventar uno!';
        msg.hidden = false;
        return;
      }
      msg.hidden = true;
      celebrar();
      avisar('¡Escenario listo! Ahora, a escribir ✏️');
      mostrar('taller', { focoPropio: true, foco: historia.titulo ? 'texto' : 'titulo' });
    });
  }

  function elegirLugar(l) {
    var previo = historia.lugar;
    if (!previo) {
      historia.lugar = { plantilla: l.id, emoji: l.emoji, nombre: l.inventar ? '' : l.nombre, como: '', colores: '', sonidos: '', clima: '', sensaciones: '', momento: '', momentoOtro: '' };
    } else {
      var nombrePlantillaPrevia = (LUGARES.filter(function (x) { return x.id === previo.plantilla; })[0] || {}).nombre;
      if (!previo.nombre || previo.nombre === nombrePlantillaPrevia) previo.nombre = l.inventar ? '' : l.nombre;
      previo.plantilla = l.id;
      previo.emoji = l.emoji;
    }
    $('msg-lugar').hidden = true;
    huboCambio();
    renderLugar();
    var t = $('titulo-ficha-lugar');
    t.scrollIntoView({ behavior: 'smooth', block: 'start' });
    $('l-nombre').focus({ preventScroll: true });
  }

  function elegirObjeto(o) {
    if (o.ninguno) {
      historia.objeto = { plantilla: 'ninguno', emoji: '', nombre: '', poder: '' };
    } else {
      var previo = historia.objeto && historia.objeto.plantilla !== 'ninguno' ? historia.objeto : null;
      var poder = previo ? previo.poder : '';
      historia.objeto = { plantilla: o.id, emoji: o.emoji, nombre: o.inventar ? '' : o.nombre, poder: poder };
    }
    huboCambio();
    renderLugar();
    if (!o.ninguno) $('o-nombre').focus();
  }

  function renderLugar() {
    var grilla = $('grilla-lugares');
    vaciar(grilla);
    LUGARES.forEach(function (l) {
      var elegido = !!historia.lugar && historia.lugar.plantilla === l.id;
      grilla.appendChild(el('button', {
        type: 'button', class: 'tarjeta-opcion' + (l.inventar ? ' tarjeta-inventar' : ''),
        'aria-pressed': elegido ? 'true' : 'false',
        onclick: function () { elegirLugar(l); }
      }, [
        el('span', { class: 'emoji', 'aria-hidden': 'true', text: l.emoji }),
        el('span', { class: 'nombre', text: l.nombre })
      ]));
    });

    var ficha = $('ficha-lugar');
    ficha.hidden = !historia.lugar;
    if (historia.lugar) {
      Object.keys(CAMPOS_LUGAR).forEach(function (idCampo) {
        var v = historia.lugar[CAMPOS_LUGAR[idCampo]] || '';
        if ($(idCampo).value !== v) $(idCampo).value = v;
      });
      marcarRadio('momento', historia.lugar.momento);
      $('campo-momento-otro').hidden = historia.lugar.momento !== 'otro';
      renderResumenLugar();
    }

    var grillaO = $('grilla-objetos');
    vaciar(grillaO);
    OBJETOS.forEach(function (o) {
      var elegido = !!historia.objeto && historia.objeto.plantilla === o.id;
      grillaO.appendChild(el('button', {
        type: 'button', class: 'tarjeta-opcion' + (o.inventar ? ' tarjeta-inventar' : ''),
        'aria-pressed': elegido ? 'true' : 'false',
        onclick: function () { elegirObjeto(o); }
      }, [
        el('span', { class: 'emoji', 'aria-hidden': 'true', text: o.emoji }),
        el('span', { class: 'nombre', text: o.nombre })
      ]));
    });
    var conObjeto = !!historia.objeto && historia.objeto.plantilla !== 'ninguno';
    $('ficha-objeto').hidden = !conObjeto;
    if (conObjeto) {
      if ($('o-nombre').value !== historia.objeto.nombre) $('o-nombre').value = historia.objeto.nombre;
      if ($('o-poder').value !== historia.objeto.poder) $('o-poder').value = historia.objeto.poder;
    }
  }
  RENDER.lugar = renderLugar;

  function textoMomento(l) {
    if (!l.momento) return '';
    return l.momento === 'otro' ? (l.momentoOtro || 'Otro momento') : NOMBRE_MOMENTO[l.momento];
  }

  function lineasLugar(l) {
    return [
      ['Cómo es', l.como], ['Se ve', l.colores], ['Se escucha', l.sonidos],
      ['Clima', l.clima], ['Se siente', l.sensaciones], ['Momento', textoMomento(l)]
    ].filter(function (x) { return x[1] && String(x[1]).trim(); });
  }

  function renderResumenLugar() {
    var r = $('resumen-lugar');
    vaciar(r);
    var l = historia.lugar;
    if (!l) return;
    r.appendChild(el('h4', { text: (l.emoji || '📍') + ' ' + (l.nombre.trim() || 'Mi lugar (¡ponele un nombre!)') }));
    var lineas = lineasLugar(l);
    if (!lineas.length) {
      r.appendChild(el('p', { class: 'mini', text: 'Acá vas a ver el resumen de tu lugar a medida que lo describas.' }));
    }
    lineas.forEach(function (x) {
      r.appendChild(el('p', null, [el('strong', { text: x[0] + ': ' }), String(x[1]).trim()]));
    });
  }


  /* ------------------------------------------------------------------
     9. MÓDULO 3 · TALLER DE ESCRITURA
     ------------------------------------------------------------------ */
  function iniciarTaller() {
    var tabs = $('pestanas');
    var paneles = $('paneles-etapas');
    ETAPAS.forEach(function (e, i) {
      tabs.appendChild(el('button', {
        type: 'button', role: 'tab', id: 'tab-' + e.id, class: 'pestana c-' + e.color,
        'aria-controls': 'panel-' + e.id, 'aria-selected': 'false', tabindex: '-1',
        onclick: function () { seleccionarEtapa(e.id, true); }
      }, [
        el('span', { text: e.numero + '. ' + e.nombre + ' ' + e.icono }),
        el('span', { class: 'estado-pestana', id: 'estado-tab-' + e.id })
      ]));

      var ta = el('textarea', {
        id: 'texto-' + e.id, class: 'hoja', spellcheck: 'false',
        'aria-describedby': 'explica-' + e.id,
        placeholder: 'Escribí acá ' + (e.id === 'inicio' ? 'el inicio' : e.id === 'nudo' ? 'el nudo' : 'el final') + ' de tu historia…'
      });
      ta.addEventListener('input', function () {
        historia[e.id] = ta.value;
        huboCambio();
        actualizarContador(e.id);
        actualizarPestanas();
      });

      var conectores = el('div', { class: 'chips chips-chicos' });
      CONECTORES[e.id].forEach(function (c) {
        conectores.appendChild(el('button', {
          type: 'button', class: 'chip-texto',
          'aria-label': 'Escribir «' + c[0].replace('…', '') + '» en tu historia',
          onclick: function () { insertarEnTexto(ta, c[1], false); }
        }, [c[0]]));
      });

      var listaAyudas = el('ul');
      e.ayudas.concat(AYUDAS_COMUNES).forEach(function (a) { listaAyudas.appendChild(el('li', { text: a })); });
      var listaPreguntas = el('ul');
      e.preguntas.forEach(function (p) { listaPreguntas.appendChild(el('li', { text: p })); });

      var nav = el('div', { class: 'nav-etapas' }, [
        i > 0 ? el('button', { type: 'button', class: 'btn btn-claro', onclick: function () { seleccionarEtapa(ETAPAS[i - 1].id, true); } }, ['◀ Volver al ' + ETAPAS[i - 1].nombre.toLowerCase()]) : null,
        e.siguiente
          ? el('button', { type: 'button', class: 'btn btn-principal', onclick: function () { avanzarEtapa(i); } }, [e.siguiente])
          : el('button', { type: 'button', class: 'btn btn-principal btn-grande', onclick: terminarHistoria }, ['🎉 ¡Terminé mi historia!'])
      ]);

      paneles.appendChild(el('div', {
        id: 'panel-' + e.id, role: 'tabpanel', 'aria-labelledby': 'tab-' + e.id,
        class: 'panel-etapa c-' + e.color, hidden: true
      }, [
        el('p', { class: 'explica', id: 'explica-' + e.id }, [
          el('span', { class: 'icono-etapa', 'aria-hidden': 'true', text: e.icono }),
          el('span', { text: e.explica })
        ]),
        el('details', { class: 'preguntas', open: true }, [el('summary', { text: '🤔 Preguntas para pensar' }), listaPreguntas]),
        el('label', { class: 'etiqueta-hoja', for: 'texto-' + e.id, text: '✏️ ' + e.largo }),
        ta,
        el('p', { class: 'contador', id: 'contador-' + e.id }),
        el('div', { class: 'herramientas' }, [
          el('div', null, [el('p', { class: 'conectores-titulo', text: '🔗 Palabras para conectar ideas (tocá una para escribirla):' }), conectores]),
          el('details', { class: 'ayudas' }, [el('summary', { text: '💡 Ayudas para escribir (si las necesitás)' }), listaAyudas])
        ]),
        nav
      ]));
    });

    // Teclado en las pestañas: flechas, Inicio y Fin
    tabs.addEventListener('keydown', function (ev) {
      var orden = ETAPAS.map(function (e) { return e.id; });
      var i = orden.indexOf(historia.etapa);
      var nuevo = null;
      if (ev.key === 'ArrowRight') nuevo = orden[(i + 1) % orden.length];
      else if (ev.key === 'ArrowLeft') nuevo = orden[(i + orden.length - 1) % orden.length];
      else if (ev.key === 'Home') nuevo = orden[0];
      else if (ev.key === 'End') nuevo = orden[orden.length - 1];
      if (nuevo) { ev.preventDefault(); seleccionarEtapa(nuevo, false); $('tab-' + nuevo).focus(); }
    });

    $('campo-titulo').addEventListener('input', function () {
      historia.titulo = this.value;
      huboCambio();
    });
  }

  /** Inserta un conector o un nombre donde está el cursor, cuidando la mayúscula. */
  function insertarEnTexto(ta, frase, respetarMayusculas) {
    var ini = ta.selectionStart;
    var fin = ta.selectionEnd;
    var antes = ta.value.slice(0, ini);
    var previo = antes.replace(/[ \t]+$/, '');
    var texto = frase;
    if (!respetarMayusculas) {
      var empiezaOracion = previo === '' || /[.!?…:\n—-]$/.test(previo);
      texto = empiezaOracion ? frase.charAt(0).toUpperCase() + frase.slice(1) : frase;
    }
    if (antes !== '' && !/\s$/.test(antes)) texto = ' ' + texto;
    ta.focus();
    ta.setSelectionRange(ini, fin);
    var ok = false;
    try { ok = document.execCommand('insertText', false, texto); } catch (e) { ok = false; }
    if (!ok) {
      ta.setRangeText(texto, ini, fin, 'end');
      ta.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  function seleccionarEtapa(id, enfocarTexto) {
    historia.etapa = id;
    guardarLocalPronto();
    ETAPAS.forEach(function (e) {
      var sel = e.id === id;
      var tab = $('tab-' + e.id);
      tab.setAttribute('aria-selected', sel ? 'true' : 'false');
      tab.tabIndex = sel ? 0 : -1;
      $('panel-' + e.id).hidden = !sel;
    });
    if (enfocarTexto) {
      var ta = $('texto-' + id);
      ta.focus({ preventScroll: true });
      ta.setSelectionRange(ta.value.length, ta.value.length);
      $('pestanas').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function avanzarEtapa(i) {
    var e = ETAPAS[i];
    if (historia[e.id].trim()) avisar(e.festejo);
    seleccionarEtapa(ETAPAS[i + 1].id, true);
  }

  function actualizarContador(id) {
    var n = contarPalabras(historia[id]);
    var t;
    if (n === 0) t = '¡Tu turno! Escribí lo que imaginás ✏️';
    else if (n < 15) t = 'Llevás ' + n + (n === 1 ? ' palabra' : ' palabras') + '. ¡Muy buen comienzo! 🌱';
    else if (n < 50) t = 'Llevás ' + n + ' palabras. ¡Vas muy bien! ✨';
    else t = 'Llevás ' + n + ' palabras. ¡Qué gran escritor o escritora! 🌟';
    $('contador-' + id).textContent = t;
  }

  function actualizarPestanas() {
    ETAPAS.forEach(function (e) {
      $('estado-tab-' + e.id).textContent = historia[e.id].trim() ? '✓ Ya tiene texto' : '○ Por escribir';
    });
  }

  function renderTaller(opciones) {
    if ($('campo-titulo').value !== historia.titulo) $('campo-titulo').value = historia.titulo;
    ETAPAS.forEach(function (e) {
      var ta = $('texto-' + e.id);
      if (ta.value !== historia[e.id]) ta.value = historia[e.id];
      actualizarContador(e.id);
    });
    actualizarPestanas();
    crearBarraAcciones($('acciones-taller'), 'taller');
    renderRecordatorios();
    var etapa = opciones.etapa || historia.etapa || 'inicio';
    seleccionarEtapa(etapa, false);
    if (opciones.foco === 'titulo') {
      $('campo-titulo').focus({ preventScroll: true });
    } else if (opciones.foco === 'texto') {
      var ta = $('texto-' + etapa);
      ta.focus({ preventScroll: true });
      ta.setSelectionRange(ta.value.length, ta.value.length);
    }
  }
  RENDER.taller = renderTaller;

  function renderRecordatorios() {
    var cont = $('rec-contenido');
    vaciar(cont);
    historia.personajes.forEach(function (p) {
      var datos = [
        ['Tipo', p.tipo === 'otro' && p.tipoOtro ? p.tipoOtro : NOMBRE_TIPO[p.tipo]], ['Edad', p.edad],
        ['Cómo es', p.fisico], ['Forma de ser', p.personalidad], ['Le gusta', p.gusta],
        ['No le gusta', p.noGusta], ['Es especial porque', p.especial]
      ].filter(function (x) { return x[1]; });
      var dl = el('dl');
      datos.forEach(function (x) { dl.appendChild(el('dt', { text: x[0] })); dl.appendChild(el('dd', { text: x[1] })); });
      cont.appendChild(el('details', { class: 'rec-item' }, [
        el('summary', null, [el('span', { 'aria-hidden': 'true', text: p.emoji || '🧒' }), p.nombre + (p.principal ? ' ⭐' : '')]),
        dl
      ]));
    });
    if (historia.lugar) {
      var l = historia.lugar;
      var dlL = el('dl');
      lineasLugar(l).forEach(function (x) { dlL.appendChild(el('dt', { text: x[0] })); dlL.appendChild(el('dd', { text: x[1] })); });
      cont.appendChild(el('details', { class: 'rec-item' }, [
        el('summary', null, [el('span', { 'aria-hidden': 'true', text: l.emoji || '📍' }), l.nombre || 'Mi lugar']),
        dlL
      ]));
    }
    if (historia.objeto && historia.objeto.plantilla !== 'ninguno' && (historia.objeto.nombre || historia.objeto.poder)) {
      var o = historia.objeto;
      cont.appendChild(el('details', { class: 'rec-item' }, [
        el('summary', null, [el('span', { 'aria-hidden': 'true', text: o.emoji || '🪄' }), o.nombre || 'Objeto mágico']),
        o.poder ? el('dl', null, [el('dt', { text: 'Poder' }), el('dd', { text: o.poder })]) : null
      ]));
    }

    var nombres = $('rec-nombres');
    vaciar(nombres);
    var lista = historia.personajes.map(function (p) { return p.nombre; });
    if (historia.lugar && historia.lugar.nombre.trim()) lista.push(historia.lugar.nombre.trim());
    if (historia.objeto && historia.objeto.nombre && historia.objeto.nombre.trim()) lista.push(historia.objeto.nombre.trim());
    lista.forEach(function (n) {
      nombres.appendChild(el('button', {
        type: 'button', class: 'chip-texto', 'aria-label': 'Escribir «' + n + '» en tu historia',
        onclick: function () { insertarEnTexto($('texto-' + historia.etapa), n + ' ', true); }
      }, [n]));
    });
  }

  function terminarHistoria() {
    var faltan = ETAPAS.filter(function (e) { return !historia[e.id].trim(); });
    if (!faltan.length) {
      celebrar();
      mostrar('final');
      return;
    }
    confirmar({
      icono: '📝',
      titulo: '¡Ya casi!',
      texto: 'Todavía falta escribir: ' + faltan.map(function (e) { return 'el ' + e.nombre.toLowerCase(); }).join(' y ') + '. ¿Querés seguir escribiendo o ir al final igual?',
      si: '✏️ Seguir escribiendo', no: 'Ir al final igual'
    }).then(function (seguir) {
      if (seguir) seleccionarEtapa(faltan[0].id, true);
      else mostrar('final');
    });
  }


  /* ------------------------------------------------------------------
     10. BOTONES «SEGUIR ESCRIBIENDO» Y «VER MI HISTORIA»
     ------------------------------------------------------------------ */
  var OPCIONES_SEGUIR = [
    ['titulo', '🏷️ El título'], ['inicio', '🌅 El inicio'], ['nudo', '⚡ El nudo'], ['desenlace', '🌈 El final'],
    ['personajes', '🧙 Mis personajes'], ['lugar', '🏰 El lugar']
  ];

  function crearBarraAcciones(cont, donde) {
    vaciar(cont);
    var idMenu = 'menu-partes-' + donde;
    var menu = el('div', { id: idMenu, class: 'menu-partes', hidden: true }, [
      el('p', { class: 'menu-titulo', text: '¿Qué parte querés seguir o corregir?' })
    ]);
    var btnSeguir = el('button', {
      type: 'button', class: 'btn btn-turquesa', 'aria-expanded': 'false', 'aria-controls': idMenu
    }, ['✏️ Seguir escribiendo ▾']);
    OPCIONES_SEGUIR.forEach(function (o) {
      menu.appendChild(el('button', {
        type: 'button',
        onclick: function () {
          cerrarMenus();
          if (o[0] === 'personajes' || o[0] === 'lugar') { mostrar(o[0]); return; }
          if (o[0] === 'titulo') mostrar('taller', { focoPropio: true, foco: 'titulo' });
          else mostrar('taller', { focoPropio: true, etapa: o[0], foco: 'texto' });
        }
      }, [o[1]]));
    });
    btnSeguir.addEventListener('click', function (ev) {
      ev.stopPropagation();
      var abrir = menu.hidden;
      cerrarMenus();
      if (abrir) {
        menu.hidden = false;
        btnSeguir.setAttribute('aria-expanded', 'true');
        menu.querySelector('button').focus();
      }
    });
    menu.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') { cerrarMenus(); btnSeguir.focus(); }
    });

    var hijos = [
      el('div', { class: 'menu-seguir' }, [btnSeguir, menu]),
      el('button', {
        type: 'button', class: 'btn btn-principal', 'aria-current': donde === 'vista' ? 'page' : null,
        onclick: function () { if (donde !== 'vista') mostrar('vista'); }
      }, ['📖 Ver mi historia'])
    ];
    if (donde === 'vista') {
      hijos.push(el('button', { type: 'button', class: 'btn btn-claro', onclick: function () { window.print(); } }, ['🖨️ Imprimir o guardar como PDF']));
      hijos.push(el('button', { type: 'button', class: 'btn btn-claro', onclick: function () { mostrar('final'); } }, ['🎉 Ir al final']));
    }
    hijos.forEach(function (h) { cont.appendChild(h); });
  }

  function cerrarMenus() {
    Array.prototype.forEach.call(document.querySelectorAll('.menu-partes'), function (m) { m.hidden = true; });
    Array.prototype.forEach.call(document.querySelectorAll('[aria-controls^="menu-partes-"]'), function (b) { b.setAttribute('aria-expanded', 'false'); });
  }
  document.addEventListener('click', function (ev) {
    if (!ev.target.closest || !ev.target.closest('.menu-seguir')) cerrarMenus();
  });


  /* ------------------------------------------------------------------
     11. VER MI HISTORIA (vista tipo libro)
     ------------------------------------------------------------------ */
  function parrafosDe(texto) {
    return String(texto || '').split(/\n+/).map(function (s) { return s.trim(); }).filter(Boolean);
  }

  RENDER.vista = function () {
    crearBarraAcciones($('acciones-vista'), 'vista');
    renderLibro(historia, $('libro'), true);

    var lista = $('lista-revision');
    if (!lista.firstChild) {
      REVISION.forEach(function (r, i) {
        lista.appendChild(el('li', null, [el('label', null, [el('input', { type: 'checkbox', id: 'rev-' + i }), r])]));
      });
    }
  };

  /** Dibuja la historia `historia` como libro. Con editable=false no muestra los botones de corregir. */
  function renderLibro(historia, libro, editable) {
    vaciar(libro);

    libro.appendChild(el('header', { class: 'portada' }, [
      el('div', { class: 'adorno', 'aria-hidden': 'true', text: '⭐📖⭐' }),
      el('h3', { class: 'libro-titulo', text: historia.titulo.trim() || 'Mi historia (todavía sin título)' }),
      el('p', null, ['Escrita por ', el('strong', { text: nombresAutores(historia.autores) || '—' })]),
      el('p', { text: historia.grado + '.º ' + historia.division })
    ]));

    if (historia.personajes.length) {
      var fichas = el('div', { class: 'libro-fichas' });
      historia.personajes.forEach(function (p) {
        var tipo = p.tipo === 'otro' && p.tipoOtro ? p.tipoOtro : NOMBRE_TIPO[p.tipo];
        fichas.appendChild(el('div', { class: 'libro-ficha' }, [
          el('h4', { text: (p.emoji || '🧒') + ' ' + p.nombre + (p.principal ? ' ⭐' : '') }),
          el('p', { text: [tipo, p.edad].filter(Boolean).join(' · ') }),
          p.fisico ? el('p', { text: 'Cómo es: ' + p.fisico }) : null,
          p.personalidad ? el('p', { text: 'Forma de ser: ' + p.personalidad }) : null,
          p.especial ? el('p', { text: 'Es especial porque: ' + p.especial }) : null
        ]));
      });
      libro.appendChild(el('section', { class: 'libro-seccion' }, [el('h3', { text: '🧙 Los personajes' }), fichas]));
    }

    if (historia.lugar) {
      var l = historia.lugar;
      var fichaLugar = el('div', { class: 'libro-ficha' }, [el('h4', { text: (l.emoji || '📍') + ' ' + (l.nombre.trim() || 'Un lugar sin nombre') })]);
      lineasLugar(l).forEach(function (x) { fichaLugar.appendChild(el('p', { text: x[0] + ': ' + x[1] })); });
      if (historia.objeto && historia.objeto.plantilla !== 'ninguno' && (historia.objeto.nombre || historia.objeto.poder)) {
        fichaLugar.appendChild(el('p', null, [el('strong', { text: (historia.objeto.emoji || '🪄') + ' Objeto mágico: ' }), (historia.objeto.nombre || '') + (historia.objeto.poder ? ' — ' + historia.objeto.poder : '')]));
      }
      libro.appendChild(el('section', { class: 'libro-seccion' }, [el('h3', { text: '🏰 El lugar' }), fichaLugar]));
    }

    ETAPAS.forEach(function (e) {
      var parrafos = parrafosDe(historia[e.id]);
      var texto = el('div', { class: 'texto-cuento' });
      if (parrafos.length) parrafos.forEach(function (t) { texto.appendChild(el('p', { text: t })); });
      else texto.appendChild(el('p', { class: 'texto-vacio', text: editable ? 'Esta parte todavía está esperando tus palabras ✏️' : 'Esta parte todavía no está escrita.' }));
      libro.appendChild(el('section', { class: 'capitulo' }, [
        el('div', { class: 'capitulo-cabecera' }, [
          el('h3', { class: 'cinta c-' + e.color, text: e.numero + '. ' + e.largo }),
          editable ? el('button', {
            type: 'button', class: 'btn btn-claro btn-chico no-imprimir',
            onclick: function () { mostrar('taller', { focoPropio: true, etapa: e.id, foco: 'texto' }); }
          }, ['✏️ Corregir esta parte']) : null
        ]),
        texto
      ]));
    });

    if (ETAPAS.every(function (e) { return historia[e.id].trim(); })) {
      libro.appendChild(el('p', { class: 'fin', text: '✨ Fin ✨' }));
    }
  }


  /* ------------------------------------------------------------------
     12. PANTALLA FINAL
     ------------------------------------------------------------------ */
  RENDER.final = function () {
    crearBarraAcciones($('acciones-final'), 'final');
    $('final-titulo').textContent = historia.titulo.trim() ? '«' + historia.titulo.trim() + '»' : '';
    renderResultadoFinal();
  };

  function renderResultadoFinal() {
    var caja = $('resultado-guardado');
    vaciar(caja);
    var btn = $('btn-guardar-final');
    var finalizadaYGuardada = historia.guardadoEnDrive && historia.estado === 'finalizada' && !hayPendientes();
    btn.textContent = finalizadaYGuardada ? '☁️ Guardar otra vez en Google Drive' : '☁️ Guardar en Google Drive';
    btn.classList.toggle('pulso', !finalizadaYGuardada && !ui.guardando);
    $('btn-copia').hidden = !historia.guardadoEnDrive;

    if (ui.guardando) {
      caja.className = 'resultado-guardado r-pendiente';
      caja.appendChild(el('p', { text: '⏳ Guardando tu historia en Google Drive…' }));
      return;
    }
    if (ui.errorGuardado) {
      caja.className = 'resultado-guardado r-error';
      caja.appendChild(el('p', null, [el('strong', { text: '⚠️ ¡Uy! ' }), ui.errorGuardado]));
      caja.appendChild(el('button', { type: 'button', class: 'btn btn-coral', onclick: function () { guardarEnDrive('finalizada'); } }, ['🔄 Intentar nuevamente']));
      return;
    }
    if (finalizadaYGuardada) {
      caja.className = 'resultado-guardado r-ok';
      caja.appendChild(el('p', null, [el('strong', { text: '✅ ¡Tu historia quedó guardada en Google Drive!' })]));
      if (historia.ultimaFechaDrive) caja.appendChild(el('p', { class: 'mini', text: 'Guardada el ' + historia.ultimaFechaDrive }));
      if (historia.docUrl) {
        caja.appendChild(el('p', null, [el('a', { href: historia.docUrl, target: '_blank', rel: 'noopener', class: 'btn btn-principal' }, ['📄 Abrir mi historia en Google Docs'])]));
      } else {
        caja.appendChild(el('p', { text: 'Tu docente ya la puede leer en su carpeta.' }));
      }
      if (EDICION_PERMITIDA) {
        caja.appendChild(el('p', { class: 'mini', text: 'Para seguirla otro día: en la pantalla de inicio tocá «📚 Ver cuentos», elegí tu grado y buscá tu cuento.' }));
      }
      return;
    }
    caja.className = 'resultado-guardado r-pendiente';
    caja.appendChild(el('p', { text: '☁️ Tocá «Guardar en Google Drive» para que tu historia llegue a la carpeta de tu docente.' }));
    if (historia.guardadoEnDrive) {
      caja.appendChild(el('p', { class: 'mini', text: 'Hay cambios nuevos desde el último guardado (' + (historia.ultimaFechaDrive || 'antes') + ').' }));
    }
  }

  function iniciarFinal() {
    $('btn-guardar-final').addEventListener('click', function () { guardarEnDrive('finalizada'); });
    $('btn-nueva').addEventListener('click', function () { empezarNuevaHistoria(false); });
    $('btn-copia').addEventListener('click', crearCopia);
  }

  function empezarNuevaHistoria(desdeBienvenida) {
    var conCambios = tieneContenido(historia) && hayPendientes();
    var texto = conCambios
      ? 'Tu historia tiene cambios que todavía no se guardaron en Google Drive. Si empezás una nueva, esos cambios se van a perder.'
      : (historia.guardadoEnDrive
        ? 'Tu historia actual ya está guardada en Drive. Podés volver a abrirla desde «Ver cuentos».'
        : 'Vas a empezar una historia nueva desde cero.');
    confirmar({
      icono: '✨', peligro: conCambios,
      titulo: '¿Empezar una historia nueva?',
      texto: texto,
      si: 'Sí, empezar una nueva', no: 'No, volver'
    }).then(function (ok) {
      if (!ok) return;
      var base = desdeBienvenida ? {} : { autores: historia.autores, grado: historia.grado, division: historia.division };
      historia = nuevaHistoria(base);
      ui.errorGuardado = '';
      ui.ultimoChip = '';
      guardarLocalYa();
      if (desdeBienvenida || !datosCompletos()) {
        mostrar('bienvenida');
      } else {
        avisar('¡Una historia nueva! Empezá por los personajes ✨');
        mostrar('personajes');
      }
    });
  }

  function crearCopia() {
    confirmar({
      icono: '📄',
      titulo: '¿Crear una copia?',
      texto: 'Se va a guardar una copia nueva en Drive. La historia original queda guardada como estaba la última vez que la guardaste. Vas a seguir trabajando en la copia.',
      si: 'Sí, crear una copia', no: 'No, volver'
    }).then(function (ok) {
      if (!ok) return;
      var copia = clonar(historia);
      copia.codigo = generarCodigo();
      copia.estado = 'borrador';
      copia.revision = 1;
      copia.revisionGuardada = 0;
      copia.guardadoEnDrive = false;
      copia.ultimaFechaDrive = '';
      copia.docUrl = '';
      historia = copia;
      ui.errorGuardado = '';
      guardarLocalYa();
      RENDER.final();
      actualizarEstadoGuardado();
      guardarEnDrive('borrador');
    });
  }


  /* ------------------------------------------------------------------
     13. ARRANQUE
     ------------------------------------------------------------------ */
  function iniciar() {
    historia = cargarLocal() || nuevaHistoria();
    iniciarBienvenida();
    iniciarPersonajes();
    iniciarLugar();
    iniciarTaller();
    iniciarFinal();
    iniciarCuentos();

    Array.prototype.forEach.call(document.querySelectorAll('[data-ir]'), function (b) {
      b.addEventListener('click', function () { mostrar(b.getAttribute('data-ir')); });
    });
    $('btn-guardar').addEventListener('click', function () { guardarEnDrive(historia.estado); });

    // Aviso antes de salir si hay cambios sin guardar en Drive
    window.addEventListener('beforeunload', function (ev) {
      guardarLocalYa();
      if (tieneContenido(historia) && hayPendientes()) {
        ev.preventDefault();
        ev.returnValue = '';
        return '';
      }
    });

    if (conectado) {
      llamarApi({ accion: 'estado' }, 30000).then(function (r) {
        ui.configurada = !!(r && r.configurada);
        if (ui.pantalla === 'bienvenida') $('aviso-config').hidden = ui.configurada;
      }).catch(function () { /* si falla, el aviso aparece al intentar guardar */ });
    } else {
      ui.configurada = false;
      $('aviso-config-texto').textContent = 'falta pegar la URL de la aplicación web de Apps Script en el archivo config.js del repositorio. Los alumnos pueden escribir, pero no van a poder guardar en Drive.';
    }

    // La altura de la barra superior cambia según el ancho: se usa para ubicar los elementos fijos.
    var barra = $('barra');
    function medirBarra() { document.documentElement.style.setProperty('--alto-barra', (barra.hidden ? 0 : barra.offsetHeight) + 'px'); }
    if (window.ResizeObserver) new ResizeObserver(medirBarra).observe(barra);
    window.addEventListener('resize', medirBarra);

    mostrar('bienvenida');
  }

  iniciar();
})();
