/* =====================================================================
   SALA DE ESCAPE «EL MISTERIO DEL BOSQUE ENCANTADO» — script.js
   Lógica de la aplicación (se publica en GitHub Pages).

   ►►► CONFIGURACIÓN: pegá acá la URL del servicio de Google Apps Script
       (la que termina en /exec, ver README.md, paso 8).              ◄◄◄
   ===================================================================== */
var URL_SERVIDOR = 'https://script.google.com/macros/s/AKfycbzzgeK6n2ZJBJISnimsbG7KA2clskHUNnAAOlux18gtc-osweZnvqxhnrEvjXfHVK-k1Q/exec';

/* ---------------------------------------------------------------------
   Comunicación con el servicio (Apps Script).
   El cuerpo va como text/plain para evitar el "preflight" CORS.
   Las preguntas llegan SIN soluciones: la corrección ocurre en el servidor.
   --------------------------------------------------------------------- */
window.MODO_APP = 'web';
window.MODO_PRUEBA_VISIBLE = /(^|[?&])modo=prueba(&|$)/.test(location.search.slice(1));

function servidorConfigurado() { return /^https:\/\/script\.google(usercontent)?\.com\//.test(URL_SERVIDOR) || /^http:\/\/localhost/.test(URL_SERVIDOR); }

function llamarServidor(accion, datos) {
  var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
  var t = setTimeout(function () { if (ctrl) ctrl.abort(); }, 30000);
  return fetch(URL_SERVIDOR, {
    method: 'POST', redirect: 'follow', signal: ctrl ? ctrl.signal : undefined,
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ accion: accion, datos: datos })
  }).then(function (r) {
    clearTimeout(t);
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  }, function (e) { clearTimeout(t); throw e; });
}

function pantallaCarga(html) {
  document.getElementById('stage').innerHTML =
    '<div class="capa portada" style="background:linear-gradient(#173a5e,#2b6a4f)">' + html + '</div>';
}

function escalarEscenario() {
  var e = Math.min(window.innerWidth / 1366, window.innerHeight / 768);
  document.getElementById('stage').style.transform = 'translate(-50%,-50%) scale(' + e + ')';
}
window.addEventListener('resize', escalarEscenario);

function arrancar() {
  escalarEscenario();
  if (!servidorConfigurado()) {
    pantallaCarga('<h1 style="font-size:52px">Falta configurar el servicio</h1><p class="intro">Docente: abrí <b>script.js</b> y pegá en <b>URL_SERVIDOR</b> la URL de la aplicación web de Google Apps Script (termina en <b>/exec</b>). Los pasos están en el README.md.</p>');
    return;
  }
  pantallaCarga('<div class="titila" style="font-size:90px">✨</div><h1 style="font-size:52px">Despertando el bosque…</h1>');
  var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
  setTimeout(function () { if (ctrl) ctrl.abort(); }, 30000);
  fetch(URL_SERVIDOR + (URL_SERVIDOR.indexOf('?') < 0 ? '?' : '&') + 'accion=banco', { redirect: 'follow', signal: ctrl ? ctrl.signal : undefined })
    .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(function (datos) {
      if (!datos || !datos.banco) throw new Error('respuesta inválida');
      window.DATOS_PUBLICOS = datos;
      document.getElementById('stage').innerHTML = '';
      iniciarApp();
    })
    .catch(function () {
      pantallaCarga('<h1 style="font-size:52px">No pudimos llegar al bosque</h1><p class="intro">Revisá la conexión a internet y volvé a intentar. Si el problema sigue, avisale a tu seño.</p><button class="btn gigante" onclick="arrancar()">🔄 Reintentar</button>');
    });
}


/* ===================== ILUSTRACIONES ===================== */
/* =====================================================================
   ILUSTRACIONES ORIGINALES (SVG generado por código)
   ===================================================================== */
var ILU = (function () {

  function lumi(opts) {
    opts = opts || {};
    var id = 'l' + Math.random().toString(36).slice(2, 7);
    return '<svg class="lumi-svg ' + (opts.clase || '') + '" viewBox="0 0 140 140" aria-hidden="true">' +
      '<defs><radialGradient id="' + id + 'g" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#fffbd1"/><stop offset=".45" stop-color="#ffe45c"/><stop offset="1" stop-color="#ffe45c" stop-opacity="0"/></radialGradient></defs>' +
      '<circle class="lumi-halo" cx="70" cy="104" r="36" fill="url(#' + id + 'g)"/>' +
      '<g class="lumi-alas"><ellipse cx="40" cy="62" rx="24" ry="13" transform="rotate(-30 40 62)" fill="#d8f1ff" stroke="#7fb8d8" stroke-width="2" opacity=".9"/>' +
      '<ellipse cx="100" cy="62" rx="24" ry="13" transform="rotate(30 100 62)" fill="#d8f1ff" stroke="#7fb8d8" stroke-width="2" opacity=".9"/></g>' +
      '<ellipse cx="70" cy="100" rx="21" ry="20" fill="#ffe45c" stroke="#c99a00" stroke-width="2.5"/>' +
      '<path d="M54 96 q16 7 32 0" stroke="#e0b400" stroke-width="2.5" fill="none"/>' +
      '<ellipse cx="70" cy="76" rx="22" ry="16" fill="#3b3157"/>' +
      '<path d="M50 78 q-10 10 -14 20 M90 78 q10 10 14 20" stroke="#3b3157" stroke-width="4" stroke-linecap="round" fill="none"/>' +
      '<circle cx="70" cy="50" r="27" fill="#f2733f" stroke="#c4502a" stroke-width="2.5"/>' +
      '<path d="M58 26 q-8 -16 -18 -14 M82 26 q8 -16 18 -14" stroke="#3b3157" stroke-width="3" fill="none" stroke-linecap="round"/>' +
      '<circle cx="40" cy="12" r="5" fill="#ffe45c" stroke="#3b3157" stroke-width="2"/><circle cx="100" cy="12" r="5" fill="#ffe45c" stroke="#3b3157" stroke-width="2"/>' +
      '<path d="M44 38 q26 -22 52 0 l-2 6 q-24 -8 -48 0z" fill="#2f8f5b" stroke="#1d5c3a" stroke-width="2"/>' +
      '<circle cx="60" cy="52" r="9" fill="#fff"/><circle cx="80" cy="52" r="9" fill="#fff"/>' +
      '<circle class="lumi-ojo" cx="61" cy="53" r="5" fill="#1b1730"/><circle class="lumi-ojo" cx="81" cy="53" r="5" fill="#1b1730"/>' +
      '<circle cx="63" cy="51" r="1.8" fill="#fff"/><circle cx="83" cy="51" r="1.8" fill="#fff"/>' +
      '<circle cx="52" cy="63" r="4" fill="#ff9fb0" opacity=".8"/><circle cx="88" cy="63" r="4" fill="#ff9fb0" opacity=".8"/>' +
      '<path d="M63 64 q7 7 14 0" stroke="#1b1730" stroke-width="3" fill="none" stroke-linecap="round"/>' +
      '</svg>';
  }

  function arbolito(x, y, s, c1, c2) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')">' +
      '<rect x="-6" y="-10" width="12" height="40" rx="3" fill="#6b4a2f"/>' +
      '<path d="M0 -90 L-38 -20 L38 -20 Z" fill="' + c1 + '"/><path d="M0 -70 L-44 0 L44 0 Z" fill="' + c2 + '"/></g>';
  }
  function bosque(paleta) {
    var p = paleta || {};
    var cielo1 = p.cielo1 || '#9fe0f5', cielo2 = p.cielo2 || '#e9fbff';
    var s = '<svg class="fondo-svg" viewBox="0 0 1366 768" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
      '<defs><linearGradient id="cielo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + cielo1 + '"/><stop offset="1" stop-color="' + cielo2 + '"/></linearGradient></defs>' +
      '<rect width="1366" height="768" fill="url(#cielo)"/>';
    if (p.noche) {
      for (var i = 0; i < 40; i++) { s += '<circle cx="' + ((i * 197) % 1366) + '" cy="' + ((i * 89) % 330) + '" r="' + (1 + i % 3) + '" fill="#fffbe0" opacity=".8"/>'; }
      s += '<circle cx="1180" cy="110" r="46" fill="#fff6c9"/><circle cx="1200" cy="96" r="44" fill="' + cielo1 + '"/>';
    } else {
      s += '<circle cx="1180" cy="110" r="52" fill="#fff3a6" opacity=".9"/>';
      s += '<g fill="#fff" opacity=".85"><ellipse cx="260" cy="120" rx="80" ry="26"/><ellipse cx="320" cy="100" rx="50" ry="26"/><ellipse cx="760" cy="80" rx="70" ry="20"/></g>';
    }
    s += '<path d="M0 470 Q200 380 420 450 T860 430 T1366 440 V768 H0Z" fill="' + (p.colina1 || '#7cc98a') + '"/>';
    s += '<path d="M0 560 Q300 480 640 540 T1366 520 V768 H0Z" fill="' + (p.colina2 || '#4fae6a') + '"/>';
    var arb = [[60, 520, 1.6], [180, 500, 1.2], [1240, 510, 1.5], [1320, 540, 1.1], [980, 470, 0.9], [420, 470, .8]];
    arb.forEach(function (a) { s += arbolito(a[0], a[1], a[2], p.arbol1 || '#2f8f5b', p.arbol2 || '#237548'); });
    s += '<path d="M0 680 Q400 620 800 680 T1366 660 V768 H0Z" fill="' + (p.colina3 || '#3c9157') + '"/>';
    if (p.luciernagas) { for (var j = 0; j < 14; j++) s += '<circle class="titila" style="animation-delay:' + (j * .37).toFixed(2) + 's" cx="' + (90 + (j * 151) % 1200) + '" cy="' + (380 + (j * 67) % 260) + '" r="5" fill="#ffe45c"/>'; }
    return s + '</svg>';
  }

  var PALETAS = {
    portada: { cielo1: '#173a5e', cielo2: '#3f7f8f', noche: true, colina1: '#2b6a4f', colina2: '#215a41', colina3: '#18452f', arbol1: '#1e5c3f', arbol2: '#164a33', luciernagas: true },
    mapa: { cielo1: '#a6e3f2', cielo2: '#effbff', colina1: '#94d69a', colina2: '#6cc07d', colina3: '#57ad6a' },
    archivo: { cielo1: '#b9e3c6', cielo2: '#f3fbf1' },
    claro: { cielo1: '#1d3557', cielo2: '#457b9d', noche: true, colina1: '#2d6a4f', colina2: '#245a43', colina3: '#1b4734', arbol1: '#1f5d42', arbol2: '#184c36', luciernagas: true },
    castillo: { cielo1: '#ffd9e8', cielo2: '#fff6e8', colina1: '#a8d98a', colina2: '#86c46c', colina3: '#6cb05a' },
    laboratorio: { cielo1: '#d6ecff', cielo2: '#f7fbff', colina1: '#9bd5a5', colina2: '#77c08a', colina3: '#5aa974' },
    reloj: { cielo1: '#2b2d5c', cielo2: '#6c5a9e', noche: true, colina1: '#3b6e5a', colina2: '#2f5b4a', colina3: '#244a3c', arbol1: '#23563f', arbol2: '#1b4532' },
    portal: { cielo1: '#ffcf9e', cielo2: '#fff1d6', colina1: '#8ccf8f', colina2: '#67b874', colina3: '#4ea561', luciernagas: true }
  };

  /* --------- Lugares (se usan en el mapa y en las escenas) --------- */
  function lugar(tipo, estado) {
    var on = estado === 'on';
    var v = '<svg class="lugar-svg" viewBox="0 0 200 200" aria-hidden="true">';
    switch (tipo) {
      case 'archivo':
        v += '<ellipse cx="100" cy="188" rx="80" ry="10" fill="#000" opacity=".12"/>' +
          '<path d="M38 188 C44 120 30 70 50 30 Q100 0 150 30 C170 70 156 120 162 188Z" fill="#8a5a36" stroke="#5e3b20" stroke-width="4"/>' +
          '<path d="M60 60 q10 40 0 110 M140 60 q-10 40 0 110" stroke="#6e4527" stroke-width="3" fill="none"/>' +
          '<path d="M76 188 v-60 a24 24 0 0 1 48 0 v60z" fill="#4a2c16"/><circle cx="116" cy="160" r="3.5" fill="#ffd166"/>' +
          '<circle cx="100" cy="72" r="20" fill="#fff3c4" stroke="#5e3b20" stroke-width="4"/>' +
          '<rect x="88" y="66" width="6" height="14" fill="#e85d5d"/><rect x="95" y="64" width="6" height="16" fill="#4d96ff"/><rect x="102" y="67" width="6" height="13" fill="#2f8f5b"/>' +
          '<path d="M30 40 q20 -30 70 -32 q50 2 70 32 q-40 -12 -70 -10 q-30 -2 -70 10z" fill="#3c9157"/>';
        break;
      case 'claro':
        v += '<ellipse cx="100" cy="188" rx="80" ry="10" fill="#000" opacity=".15"/>' +
          '<path d="M88 188 q4 -50 -6 -90 l14 0 q-2 30 8 40 q10 -20 6 -40 l14 0 q-10 50 -4 90z" fill="#7a4e2d"/>' +
          '<g fill="' + (on ? '#57c27a' : '#7d8f8a') + '"><circle cx="100" cy="70" r="46"/><circle cx="58" cy="88" r="32"/><circle cx="142" cy="88" r="32"/><circle cx="76" cy="46" r="28"/><circle cx="126" cy="46" r="28"/></g>' +
          (on ? '<g fill="#ffe45c"><circle class="titila" cx="70" cy="60" r="5"/><circle class="titila" style="animation-delay:.4s" cx="120" cy="50" r="5"/><circle class="titila" style="animation-delay:.8s" cx="100" cy="90" r="5"/><circle class="titila" style="animation-delay:1.2s" cx="145" cy="85" r="5"/><circle class="titila" style="animation-delay:.6s" cx="55" cy="95" r="5"/><circle class="titila" style="animation-delay:1s" cx="95" cy="35" r="5"/></g>' : '');
        break;
      case 'castillo':
        v += '<ellipse cx="100" cy="188" rx="86" ry="10" fill="#000" opacity=".12"/>' +
          '<rect x="40" y="90" width="120" height="98" fill="#f2e3d0" stroke="#a4876a" stroke-width="3"/>' +
          '<rect x="24" y="60" width="36" height="128" fill="#f7ead8" stroke="#a4876a" stroke-width="3"/><rect x="140" y="60" width="36" height="128" fill="#f7ead8" stroke="#a4876a" stroke-width="3"/>' +
          '<path d="M20 62 L42 20 L64 62Z M136 62 L158 20 L180 62Z" fill="#e86a92" stroke="#b44a6e" stroke-width="3"/>' +
          '<rect x="80" y="40" width="40" height="52" fill="#f7ead8" stroke="#a4876a" stroke-width="3"/><path d="M76 42 L100 4 L124 42Z" fill="#9b6dd6" stroke="#6f47a8" stroke-width="3"/>' +
          '<path d="M80 188 v-40 a20 20 0 0 1 40 0 v40z" fill="#8a5a36"/>' +
          '<rect x="36" y="90" width="12" height="18" rx="6" fill="#6aa9e0"/><rect x="152" y="90" width="12" height="18" rx="6" fill="#6aa9e0"/><rect x="94" y="56" width="12" height="18" rx="6" fill="#6aa9e0"/>' +
          '<path d="M100 4 v-2 l16 6 -16 6" fill="#ffd166"/>';
        break;
      case 'laboratorio':
        v += '<ellipse cx="100" cy="188" rx="80" ry="10" fill="#000" opacity=".12"/>' +
          '<rect x="60" y="100" width="80" height="88" rx="14" fill="#f4ead9" stroke="#b39c7d" stroke-width="3"/>' +
          '<path d="M20 110 Q100 10 180 110Z" fill="#e85d5d" stroke="#b33f3f" stroke-width="3"/>' +
          '<g fill="#fff"><circle cx="70" cy="80" r="10"/><circle cx="110" cy="58" r="12"/><circle cx="145" cy="90" r="8"/></g>' +
          '<circle cx="100" cy="140" r="16" fill="#9ad3ff" stroke="#b39c7d" stroke-width="3"/>' +
          '<g class="gira" style="transform-origin:160px 160px"><circle cx="160" cy="160" r="16" fill="#ffd166" stroke="#c99a00" stroke-width="3"/><circle cx="160" cy="160" r="5" fill="#c99a00"/></g>' +
          '<path d="M40 188 l10 -40 h12 l10 40z" fill="#7ad3a1" stroke="#3f9e6c" stroke-width="3"/>';
        break;
      case 'reloj':
        v += '<ellipse cx="100" cy="190" rx="60" ry="8" fill="#000" opacity=".15"/>' +
          '<rect x="58" y="60" width="84" height="130" fill="#b7a9c9" stroke="#6e5f86" stroke-width="3"/>' +
          '<path d="M50 62 L100 10 L150 62Z" fill="#5c4a8a" stroke="#3d2f63" stroke-width="3"/>' +
          '<circle cx="100" cy="98" r="28" fill="#fffbe8" stroke="#6e5f86" stroke-width="4"/>' +
          '<g class="' + (on ? 'gira' : '') + '" style="transform-origin:100px 98px"><path d="M100 98 V78" stroke="#3d2f63" stroke-width="4" stroke-linecap="round"/></g><path d="M100 98 L114 104" stroke="#3d2f63" stroke-width="4" stroke-linecap="round"/>' +
          '<path d="M86 190 v-36 a14 14 0 0 1 28 0 v36z" fill="#4a3a6a"/>';
        break;
      case 'portal':
        v += '<ellipse cx="100" cy="190" rx="86" ry="9" fill="#000" opacity=".12"/>' +
          '<path d="M30 190 V90 a70 70 0 0 1 140 0 V190 h-30 V92 a40 40 0 0 0 -80 0 V190z" fill="#a9b4bd" stroke="#6c7a86" stroke-width="4"/>' +
          '<path d="M60 190 V92 a40 40 0 0 1 80 0 V190z" fill="' + (on ? '#ffe9a8' : '#4f5f6e') + '"/>' +
          (on ? '<path class="titila" d="M60 190 V92 a40 40 0 0 1 80 0 V190z" fill="#fff" opacity=".5"/>' : '') +
          '<g fill="#6c7a86"><circle cx="46" cy="110" r="5"/><circle cx="154" cy="110" r="5"/><circle cx="100" cy="30" r="6"/><circle cx="60" cy="52" r="5"/><circle cx="140" cy="52" r="5"/></g>';
        break;
    }
    return v + '</svg>';
  }

  function cardon(conFlor) {
    return '<svg class="ilu-cardon" viewBox="0 0 300 220" aria-hidden="true">' +
      '<rect width="300" height="220" fill="#bfe8f7"/><circle cx="250" cy="40" r="22" fill="#fff3a6"/>' +
      '<path d="M0 150 Q60 90 120 130 T240 110 T300 120 V220 H0Z" fill="#d98a56"/><path d="M0 170 Q90 130 170 165 T300 150 V220 H0Z" fill="#c46b3f"/>' +
      '<path d="M0 190 Q150 170 300 190 V220 H0Z" fill="#e7b47a"/>' +
      '<g fill="#3f9a5c" stroke="#256b3d" stroke-width="3">' +
      '<rect x="128" y="40" width="40" height="160" rx="20"/>' +
      '<path d="M128 130 h-30 a14 14 0 0 1 -14 -14 v-40 a14 14 0 0 1 28 0 v26 h16z"/>' +
      '<path d="M168 110 h26 a14 14 0 0 0 14 -14 v-34 a14 14 0 0 0 -28 0 v20 h-12z"/></g>' +
      '<g stroke="#2c7a46" stroke-width="2"><path d="M140 48 v148 M148 42 v156 M156 48 v148"/></g>' +
      '<g fill="#fff8d6">' + [60, 80, 100, 120, 140, 160, 180].map(function (y) { return '<circle cx="129" cy="' + y + '" r="1.6"/><circle cx="167" cy="' + y + '" r="1.6"/>'; }).join('') + '</g>' +
      (conFlor !== false ? '<g transform="translate(148 38)"><circle r="9" fill="#fff"/><circle r="3.5" fill="#ffd166"/></g><g transform="translate(194 52)"><circle r="7" fill="#fff"/><circle r="3" fill="#ffd166"/></g>' : '') +
      '<g transform="translate(40 160)"><rect x="-6" y="-30" width="12" height="40" rx="6" fill="#3f9a5c" stroke="#256b3d" stroke-width="2"/></g>' +
      '<g transform="translate(250 168)"><rect x="-5" y="-22" width="10" height="30" rx="5" fill="#3f9a5c" stroke="#256b3d" stroke-width="2"/></g>' +
      '</svg>';
  }

  function abeja() {
    return '<svg class="ilu-abeja" viewBox="0 0 260 200" aria-hidden="true"><rect width="260" height="200" fill="#e8f7ff"/>' +
      '<g transform="translate(70 130)"><circle r="34" fill="#ff9ec2"/><circle r="34" fill="none" stroke="#e8679a" stroke-width="3"/>' +
      [0, 60, 120, 180, 240, 300].map(function (a) { return '<ellipse rx="16" ry="26" cx="0" cy="-30" transform="rotate(' + a + ')" fill="#ffc2da" stroke="#e8679a" stroke-width="2"/>'; }).join('') +
      '<circle r="14" fill="#ffd166" stroke="#c99a00" stroke-width="2"/></g>' +
      '<path d="M70 164 v36" stroke="#3f9a5c" stroke-width="6"/>' +
      '<g transform="translate(160 80) rotate(-15)">' +
      '<ellipse cx="-6" cy="-26" rx="20" ry="14" fill="#e7f7ff" stroke="#8cc4e0" stroke-width="2" transform="rotate(-30)"/><ellipse cx="14" cy="-26" rx="20" ry="14" fill="#e7f7ff" stroke="#8cc4e0" stroke-width="2" transform="rotate(20)"/>' +
      '<ellipse rx="40" ry="26" fill="#ffd166" stroke="#3a2e1f" stroke-width="3"/>' +
      '<path d="M-14 -24 v48 M4 -26 v52 M22 -22 v44" stroke="#3a2e1f" stroke-width="8"/>' +
      '<circle cx="-42" cy="-4" r="16" fill="#3a2e1f"/><circle cx="-47" cy="-8" r="4" fill="#fff"/>' +
      '<path d="M-48 -18 q-8 -16 -18 -14 M-40 -20 q-2 -18 -12 -22" stroke="#3a2e1f" stroke-width="3" fill="none"/>' +
      '<g fill="#ffb000"><circle cx="-10" cy="30" r="7"/><circle cx="14" cy="30" r="7"/></g>' +
      '<path d="M40 0 l12 4 -12 4" fill="#3a2e1f"/></g>' +
      '<g fill="#ffd166"><circle cx="110" cy="120" r="3"/><circle cx="122" cy="110" r="2.5"/><circle cx="100" cy="108" r="2"/></g></svg>';
  }

  /* --------- Ilustraciones de los libros --------- */
  function pagina(nombre) {
    var noche = '<rect width="400" height="400" fill="#1f2f57"/>' + [20, 90, 160, 230, 300, 360].map(function (x, i) { return '<circle cx="' + x + '" cy="' + (30 + (i * 37) % 120) + '" r="2" fill="#fff"/>'; }).join('') +
      '<path d="M0 300 Q200 250 400 300 V400 H0Z" fill="#1d4a37"/>';
    var dia = '<rect width="400" height="400" fill="#dff4ff"/><path d="M0 300 Q200 260 400 300 V400 H0Z" fill="#8ccf8f"/>';
    var emo = function (e, x, y, s, extra) { return '<text x="' + x + '" y="' + y + '" font-size="' + s + '" text-anchor="middle" ' + (extra || '') + '>' + e + '</text>'; };
    var abuelo = function (x, y, s, luz) {
      return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><path d="M-14 0 q4 -60 -8 -100 h44 q-12 40 -8 100z" fill="#7a4e2d"/>' +
        '<g fill="' + (luz ? '#4fae6a' : '#2f6a52') + '"><circle cx="0" cy="-130" r="58"/><circle cx="-50" cy="-104" r="38"/><circle cx="50" cy="-104" r="38"/></g>' +
        '<circle cx="-8" cy="-60" r="5" fill="#2b1a0e"/><circle cx="14" cy="-60" r="5" fill="#2b1a0e"/><path d="M-6 -44 q10 8 20 0" stroke="#2b1a0e" stroke-width="3" fill="none"/></g>';
    };
    var c = '';
    switch (nombre) {
      case 'noche': c = noche + abuelo(200, 330, 1.1) + emo('🐭', 70, 350, 42) + emo('🐇', 330, 355, 46) + emo('🦔', 120, 380, 34) + '<path d="M40 300 q20 -20 40 0" stroke="#bfc9e8" stroke-width="3" fill="none" stroke-dasharray="4 6"/>'; break;
      case 'subida': c = noche + abuelo(200, 360, 1.25) + emo('🪲', 228, 175, 40) + '<g stroke="#bfe0ff" stroke-width="4" fill="none" stroke-linecap="round"><path d="M300 120 q30 -10 60 0"/><path d="M290 150 q40 -12 80 0"/><path d="M310 180 q24 -8 50 0"/></g>' + '<circle cx="340" cy="60" r="28" fill="#fff6c9"/>'; break;
      case 'luna': c = noche + '<circle cx="250" cy="110" r="70" fill="#fff6c9"/><circle cx="230" cy="100" r="6" fill="#b9a95c"/><circle cx="262" cy="100" r="6" fill="#b9a95c"/><path d="M230 130 q16 12 32 0" stroke="#b9a95c" stroke-width="4" fill="none"/>' +
        emo('🪲', 150, 230, 46) + '<g class="titila"><circle cx="190" cy="185" r="9" fill="#ffe45c"/></g>' + [[60, 300], [110, 330], [300, 320], [350, 290], [200, 350]].map(function (p, i) { return '<circle class="titila" style="animation-delay:' + i * .3 + 's" cx="' + p[0] + '" cy="' + p[1] + '" r="6" fill="#ffe45c"/>'; }).join(''); break;
      case 'regalo': c = dia + lugar('castillo').replace('<svg class="lugar-svg" viewBox="0 0 200 200" aria-hidden="true">', '<g transform="translate(220 120) scale(.85)">').replace('</svg>', '</g>') + emo('👧', 110, 320, 90) + emo('🧚', 170, 200, 54) + '<circle class="titila" cx="150" cy="250" r="10" fill="#ffd166" stroke="#c99a00" stroke-width="3"/>' + emo('🌷', 40, 380, 36) + emo('🌼', 340, 385, 36); break;
      case 'robo': c = noche + '<rect x="230" y="70" width="90" height="260" fill="#8d86a8" stroke="#5c5478" stroke-width="4"/><path d="M220 72 L275 10 L330 72Z" fill="#5c4a8a"/><rect x="262" y="110" width="26" height="36" rx="13" fill="#ffd166"/>' + emo('🧝', 120, 330, 80) + '<circle cx="162" cy="268" r="10" fill="#ffd166" stroke="#c99a00" stroke-width="3"/>' + emo('🌙', 70, 80, 50); break;
      case 'puerta': c = '<rect width="400" height="400" fill="#efe2cc"/>' + [0, 1, 2, 3, 4, 5].map(function (i) { return '<rect x="' + (20 + i * 30) + '" y="' + (370 - i * 40) + '" width="60" height="16" fill="#c9b190"/>'; }).join('') +
        '<path d="M220 380 V150 a80 80 0 0 1 160 0 V380z" fill="#9a6a3f" stroke="#5e3b20" stroke-width="6"/><circle cx="270" cy="200" r="10" fill="#2b1a0e"/><circle cx="330" cy="200" r="10" fill="#2b1a0e"/><path d="M270 250 q30 24 60 0" stroke="#2b1a0e" stroke-width="6" fill="none"/>' +
        emo('👧', 120, 250, 80) + '<text x="300" y="110" font-size="44" text-anchor="middle">❓</text>'; break;
      case 'arbol': c = dia + '<rect x="40" y="40" width="160" height="200" fill="#bfe8ff" stroke="#a4876a" stroke-width="10"/><circle cx="150" cy="90" r="26" fill="#fff3a6"/>' +
        '<path d="M120 380 q-6 -80 40 -150" stroke="#7a4e2d" stroke-width="18" fill="none"/><g fill="#ffd166" stroke="#d9a400" stroke-width="3"><circle cx="160" cy="220" r="40"/><circle cx="120" cy="250" r="30"/><circle cx="200" cy="250" r="28"/></g>' +
        emo('🍎', 150, 230, 26) + emo('🍐', 205, 260, 24) + emo('👧', 300, 370, 70) + emo('🧝', 350, 390, 46); break;
    }
    return '<svg class="pag-ilu" viewBox="0 0 400 400" aria-hidden="true">' + c + '</svg>';
  }

  function arbolConCara() {
    return '<svg viewBox="0 0 200 220" aria-hidden="true"><path d="M86 220 q6 -70 -8 -110 h44 q-14 40 -8 110z" fill="#7a4e2d"/>' +
      '<g fill="#3f8f5e"><circle cx="100" cy="80" r="62"/><circle cx="44" cy="108" r="40"/><circle cx="156" cy="108" r="40"/></g>' +
      '<circle cx="90" cy="150" r="5" fill="#2b1a0e"/><circle cx="112" cy="150" r="5" fill="#2b1a0e"/><path d="M92 166 q10 8 20 0" stroke="#2b1a0e" stroke-width="3" fill="none"/>' +
      '<path d="M84 140 q8 -6 14 0 M104 140 q8 -6 14 0" stroke="#2b1a0e" stroke-width="3" fill="none"/></svg>';
  }

  return { lumi: lumi, bosque: function (n) { return bosque(PALETAS[n] || PALETAS.mapa); }, lugar: lugar, cardon: cardon, abeja: abeja, pagina: pagina, arbolConCara: arbolConCara };
})();


/* ===================== JUEGO ===================== */
function iniciarApp() {
/* =====================================================================
   SALA DE ESCAPE — LÓGICA DEL JUEGO (cliente)
   Recibe el banco SIN soluciones (window.DATOS_PUBLICOS) y habla con el
   servidor (Apps Script) o con el servidor local de demostración.
   ===================================================================== */
(function () {
  'use strict';
  var DP = window.DATOS_PUBLICOS, B = DP.banco, CFG = DP.config;
  var MIS = B.misiones;
  var $stage = document.getElementById('stage');

  /* ---------------- Utilidades ---------------- */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function fmt(s) { return esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/_(.+?)_/g, '<span class="subr">$1</span>'); }
  function plano(s) { return String(s).replace(/\*\*|_/g, ''); }
  function el(html) { var d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstChild; }
  function q(sel, root) { return (root || $stage).querySelector(sel); }
  function qa(sel, root) { return Array.prototype.slice.call((root || $stage).querySelectorAll(sel)); }
  function azar(a) { return a[Math.floor(Math.random() * a.length)]; }
  function barajar(a, semilla) {
    var r = a.slice(), s = 0; for (var k = 0; k < String(semilla).length; k++) s = (s * 31 + String(semilla).charCodeAt(k)) >>> 0;
    for (var i = r.length - 1; i > 0; i--) { s = (s * 1103515245 + 12345) >>> 0; var j = s % (i + 1); var t = r[i]; r[i] = r[j]; r[j] = t; }
    return r;
  }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 10); }
  var Almacen = {
    get: function (k) { try { var v = localStorage.getItem('bosque_' + k); return v ? JSON.parse(v) : null; } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem('bosque_' + k, JSON.stringify(v)); } catch (e) { } },
    del: function (k) { try { localStorage.removeItem('bosque_' + k); } catch (e) { } }
  };

  /* ---------------- Escala sin scroll ---------------- */
  var escala = 1;
  function ajustar() {
    var w = window.innerWidth, h = window.innerHeight;
    escala = Math.min(w / 1366, h / 768);
    $stage.style.transform = 'translate(-50%,-50%) scale(' + escala + ')';
  }
  // Nunca permitir desplazamiento (ni siquiera por foco del teclado)
  ['scroll'].forEach(function (ev) {
    document.getElementById('marco').addEventListener(ev, function () { this.scrollTop = 0; this.scrollLeft = 0; });
    window.addEventListener(ev, function () { if (window.scrollX || window.scrollY) window.scrollTo(0, 0); });
  });
  window.addEventListener('resize', ajustar); ajustar();

  /* ---------------- Sonido (opcional) y voz ---------------- */
  var Sonido = {
    on: Almacen.get('sonido') === true, ctx: null,
    tono: function (notas, dur) {
      if (!this.on) return;
      try {
        this.ctx = this.ctx || new (window.AudioContext || window.webkitAudioContext)();
        var c = this.ctx, t = c.currentTime;
        notas.forEach(function (f, i) {
          var o = c.createOscillator(), g = c.createGain();
          o.type = 'sine'; o.frequency.value = f; o.connect(g); g.connect(c.destination);
          var t0 = t + i * (dur || .12);
          g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(.12, t0 + .02); g.gain.exponentialRampToValueAtTime(.001, t0 + .35);
          o.start(t0); o.stop(t0 + .4);
        });
      } catch (e) { }
    },
    clic: function () { this.tono([660], .05); },
    bien: function () { this.tono([523, 659, 784]); },
    casi: function () { this.tono([440, 392]); },
    premio: function () { this.tono([523, 659, 784, 1047], .14); }
  };
  var Voz = {
    voz: null,
    elegir: function () {
      if (!('speechSynthesis' in window)) return;
      var vs = speechSynthesis.getVoices(), pref = ['es-AR', 'es-419', 'es-US', 'es-MX', 'es-ES'];
      for (var i = 0; i < pref.length; i++) for (var j = 0; j < vs.length; j++) if (vs[j].lang === pref[i]) { this.voz = vs[j]; return; }
      for (j = 0; j < vs.length; j++) if (/^es/.test(vs[j].lang)) { this.voz = vs[j]; return; }
    },
    decir: function (t) {
      if (!('speechSynthesis' in window)) { avisar('Esta computadora no puede leer en voz alta. Pedile ayuda a tu seño.'); return; }
      speechSynthesis.cancel();
      if (!this.voz) this.elegir();
      var u = new SpeechSynthesisUtterance(plano(t)); u.lang = 'es-AR'; u.rate = .9; if (this.voz) u.voice = this.voz;
      speechSynthesis.speak(u);
    },
    callar: function () { if ('speechSynthesis' in window) speechSynthesis.cancel(); }
  };
  if ('speechSynthesis' in window) speechSynthesis.onvoiceschanged = function () { Voz.elegir(); };

  /* ---------------- Comunicación con el servidor ---------------- */
  var Servidor = window.BackendLocal || {
    llamar: function (accion, datos) { return llamarServidor(accion, datos); },
    registrar: function (d) { return this.llamar('registrar', d); },
    reanudar: function (p) { return this.llamar('reanudar', p); },
    responder: function (p) { return this.llamar('responder', p); },
    cierre: function (p) { return this.llamar('cierre', p); }
  };

  // Cola de envíos pendientes (por cortes de conexión)
  var Cola = {
    clave: function () { return 'cola_' + (S.token || ''); },
    leer: function () { return Almacen.get(this.clave()) || []; },
    poner: function (it) { var c = this.leer(); c.push(it); Almacen.set(this.clave(), c); },
    vaciando: false,
    vaciar: function () {
      var self = this; if (self.vaciando || !S.token) return Promise.resolve();
      var c = self.leer(); if (!c.length) return Promise.resolve();
      self.vaciando = true;
      var sig = function () {
        var cola = self.leer(); if (!cola.length) { self.vaciando = false; pintarHud(); return; }
        var it = cola[0];
        var p = it.tipo === 'cierre' ? Servidor.cierre(it.datos) : Servidor.responder(it.datos);
        return p.then(function (r) {
          if (r && r.ok === false && !r.validacion && !r.error) throw new Error('reintentar');
          var resto = self.leer(); resto.shift(); Almacen.set(self.clave(), resto);
          if (r && r.ok && it.tipo !== 'cierre') S.estado.desafios[it.datos.desafioId] = { intentos: r.intento, cerrado: true, superado: !!r.superado };
          return sig();
        }).catch(function () { self.vaciando = false; });
      };
      return sig();
    }
  };
  setInterval(function () { Cola.vaciar(); }, 8000);
  window.addEventListener('online', function () { Cola.vaciar(); });

  /* ---------------- Estado de la sesión ---------------- */
  var S = { token: null, estado: null, prueba: false, mi: 0 };
  function infoDesafio(id) { return S.estado && S.estado.desafios[id]; }
  function misionCompleta(m) { return m.desafios.every(function (d) { var e = infoDesafio(d.id); return e && e.cerrado; }); }
  function misionCerrada(m) { return S.estado && S.estado.cierres && !!S.estado.cierres[m.id]; }
  function misionActual() { for (var i = 0; i < MIS.length; i++) if (!misionCerrada(MIS[i])) return i; return MIS.length; }
  function estrellas() { var n = 0; for (var k in S.estado.desafios) if (S.estado.desafios[k].superado) n++; return n; }

  /* ---------------- HUD ---------------- */
  function pintarHud(titulo) {
    var h = q('.hud');
    if (!S.estado) { if (h) h.remove(); return; }
    if (!h) { h = el('<div class="hud"></div>'); $stage.appendChild(h); }
    if (titulo !== undefined) h.dataset.titulo = titulo;
    var actual = misionActual();
    var ruta = MIS.map(function (m, i) { return '<span class="' + (misionCerrada(m) ? 'hecha' : i === actual ? 'actual' : '') + '" title="' + esc(m.nombre) + '"></span>'; }).join('');
    var moch = MIS.slice(0, 5).map(function (m) { return '<div class="slot ' + (misionCerrada(m) ? 'lleno' : '') + '" title="' + esc(m.objeto.nombre) + '">' + (misionCerrada(m) ? m.objeto.emoji : '') + '</div>'; }).join('');
    var pend = Cola.leer().length;
    h.innerHTML = '<div class="marca">' + ILU.lumi() + '<span>Bosque Encantado</span></div>' +
      '<div class="mision-actual">' + (h.dataset.titulo || '') + '</div>' +
      (pend ? '<div class="nota-chica" title="Respuestas esperando conexión">📡 ' + pend + '</div>' : '') +
      '<div class="ruta" aria-label="Recorrido">' + ruta + '</div>' +
      '<div class="mochila" aria-label="Tesoros">' + moch + '</div>' +
      '<div class="estrellas" aria-label="Estrellas">⭐ ' + estrellas() + '</div>' +
      '<div class="explorador">' + esc(S.estado.nombre) + '</div>' +
      '<button class="ico ' + (Sonido.on ? 'activo' : '') + '" data-a="sonido" title="Sonido" aria-label="Activar o desactivar sonido">' + (Sonido.on ? '🔔' : '🔕') + '</button>';
    h.querySelector('[data-a=sonido]').onclick = function () { Sonido.on = !Sonido.on; Almacen.set('sonido', Sonido.on); Sonido.clic(); pintarHud(); };
    var bp = q('.banda-prueba');
    if (S.prueba && !bp) $stage.appendChild(el('<div class="banda-prueba">MODO PRUEBA DOCENTE · no se guarda en los resultados</div>'));
  }

  /* ---------------- Pantallas ---------------- */
  function limpiar(fondo) {
    Voz.callar();
    qa('#stage > :not(.hud):not(.banda-prueba)').forEach(function (n) { n.remove(); });
    if (fondo) $stage.appendChild(el('<div class="fondo">' + ILU.bosque(fondo) + '</div>'));
    var c = el('<div class="capa entra"></div>'); $stage.appendChild(c); return c;
  }
  function modal(html, opciones) {
    opciones = opciones || {};
    var m = el('<div class="modal" role="dialog" aria-modal="true"><div class="caja ' + (opciones.clase || '') + '">' +
      (opciones.sinCerrar ? '' : '<button class="ico cerrar" aria-label="Cerrar">✖</button>') + html + '</div></div>');
    $stage.appendChild(m);
    var cerrar = function () { Voz.callar(); m.remove(); if (opciones.alCerrar) opciones.alCerrar(); };
    if (!opciones.sinCerrar) m.querySelector('.cerrar').onclick = cerrar;
    var f = m.querySelector('button, input'); if (f) f.focus();
    return { nodo: m, cerrar: cerrar };
  }
  function avisar(t) { modal('<h2>Aviso</h2><p style="font-size:24px">' + esc(t) + '</p>'); }
  function confeti() {
    var c = el('<div class="confeti"></div>'), cols = ['#ffc93c', '#2f8f5b', '#f2733f', '#4d96ff', '#e86a92'];
    for (var i = 0; i < 40; i++) { var p = document.createElement('i'); p.style.left = (Math.random() * 100) + '%'; p.style.background = azar(cols); p.style.animationDelay = (Math.random() * .8) + 's'; c.appendChild(p); }
    $stage.appendChild(c); setTimeout(function () { c.remove(); }, 3600);
  }

  /* ===== Portada ===== */
  function portada() {
    S.estado = null; pintarHud();
    var c = limpiar('portada');
    c.className += ' portada';
    var tk = Almacen.get('token');
    c.innerHTML = ILU.lumi() +
      '<h1>' + esc(CFG.TITULO) + '</h1><div class="sub">' + esc(CFG.SUBTITULO) + '</div>' +
      '<p class="intro">Un extraño hechizo cerró los caminos del bosque y escondió sus secretos. ¿Te animás a ser explorador o exploradora y ayudar a Lumi a devolverle el equilibrio?</p>' +
      '<button class="btn gigante" data-a="comenzar">🌿 COMENZAR AVENTURA</button>' +
      '<div class="continuar"></div>' +
      '<div class="pie-izq"><button class="ico" data-a="voz" aria-label="Escuchar la presentación">🔊</button></div>' +
      '<div class="pie"></div>';
    q('[data-a=comenzar]', c).onclick = function () { Sonido.clic(); registro(); };
    q('[data-a=voz]', c).onclick = function () { Voz.decir(CFG.TITULO + '. ' + q('.intro', c).textContent); };
    var pie = q('.pie', c);
    if (window.MODO_PRUEBA_VISIBLE) {
      var bp = el('<button class="btn blanco chico">🧪 Modo prueba docente</button>'); pie.appendChild(bp);
      bp.onclick = modoPrueba;
    }
    if (Servidor.panelDocente) {
      var bd = el('<button class="btn blanco chico">👩‍🏫 Panel docente (demo)</button>'); pie.appendChild(bd);
      bd.onclick = function () { pedirClave(function (k) { Servidor.panelDocente(k, $stage); }); };
    }
    if (tk) {
      Servidor.reanudar({ token: tk }).then(function (r) {
        if (!r || !r.ok) { Almacen.del('token'); return; }
        var cont = q('.continuar', c);
        cont.innerHTML = '<button class="btn verde">▶ Continuar como ' + esc(r.estado.nombre) + '</button>';
        cont.firstChild.onclick = function () { entrar(tk, r.estado, false); };
      }).catch(function () { });
    }
  }

  function pedirClave(cb) {
    var m = modal('<h2>Clave docente</h2><div class="campo"><input type="password" autocomplete="off" aria-label="Clave docente"></div><div class="msg-error"></div><p style="text-align:right"><button class="btn verde">Entrar</button></p>');
    var go = function () { var v = q('input', m.nodo).value; m.cerrar(); cb(v); };
    q('.btn', m.nodo).onclick = go;
    q('input', m.nodo).onkeydown = function (e) { if (e.key === 'Enter') go(); };
  }
  function modoPrueba() {
    pedirClave(function (k) {
      Servidor.registrar({ nombre: 'Prueba', apellido: 'Docente', division: CFG.DIVISIONES[0], prueba: true, claveDocente: k })
        .then(function (r) { if (!r.ok) return avisar(r.error); entrar(r.token, r.estado, true, true); })
        .catch(function () { avisar('No se pudo conectar con el servidor.'); });
    });
  }

  /* ===== Registro: solo nombre, apellido y grado ===== */
  function registro() {
    var c = limpiar('mapa');
    var grados = CFG.DIVISIONES.map(function (d) { return '<button type="button" class="grado" data-g="' + esc(d) + '" role="radio" aria-checked="false">' + esc(d) + '</button>'; }).join('');
    c.innerHTML = '<form class="panel registro" autocomplete="off" novalidate>' +
      '<h2>' + ILU.lumi() + 'Tu pasaporte de explorador</h2>' +
      '<div class="campo"><label for="f-nom">Nombre</label><input id="f-nom" maxlength="40"></div>' +
      '<div class="campo"><label for="f-ape">Apellido</label><input id="f-ape" maxlength="40"></div>' +
      '<div class="campo" style="grid-column:1/-1"><label id="l-gr">Grado</label><div class="grados" role="radiogroup" aria-labelledby="l-gr">' + grados + '</div></div>' +
      '<p class="nota-chica" style="grid-column:1/-1;margin:0">⏰ La aventura se completa en esta clase. Escribí tu nombre y apellido como siempre, así tu seño te encuentra.</p>' +
      '<div class="acciones"><button type="button" class="btn blanco" data-a="volver">◀ Volver</button><div class="msg-error" role="alert"></div><button type="submit" class="btn verde">¡Listo! ▶</button></div>' +
      '</form>';
    var grado = null;
    qa('[data-g]', c).forEach(function (b) { b.onclick = function () { qa('[data-g]', c).forEach(function (x) { x.classList.toggle('sel', x === b); x.setAttribute('aria-checked', x === b); }); grado = b.dataset.g; Sonido.clic(); }; });
    q('[data-a=volver]', c).onclick = portada;
    q('form', c).onsubmit = function (ev) {
      ev.preventDefault();
      var d = { nombre: q('#f-nom', c).value, apellido: q('#f-ape', c).value, division: grado };
      var err = d.nombre.trim().length < 2 ? 'Escribí tu nombre.' : d.apellido.trim().length < 2 ? 'Escribí tu apellido.' : !grado ? 'Tocá tu grado.' : '';
      var me = q('.msg-error', c);
      if (err) { me.textContent = err; return; }
      me.textContent = 'Abriendo tu pasaporte…';
      var btn = q('[type=submit]', c); btn.disabled = true;
      Servidor.registrar(d).then(function (r) {
        btn.disabled = false;
        if (!r.ok) { me.textContent = r.error; return; }
        entrar(r.token, r.estado, r.nuevo);
      }).catch(function () { btn.disabled = false; me.textContent = 'No hay conexión con el bosque. Probá de nuevo en un ratito.'; });
    };
    q('#f-nom', c).focus();
  }

  function entrar(token, estado, nuevo, prueba) {
    S.token = token; S.estado = estado; S.prueba = !!(prueba || estado.prueba);
    if (!S.prueba) Almacen.set('token', token);
    Cola.vaciar();
    pintarHud('');
    if (nuevo) dialogo(B.prologo.map(function (t) { return 'Lumi: ' + t; }), 'portada', null, mapa);
    else mapa();
  }

  /* ===== Diálogo ===== */
  function dialogo(lineas, fondo, lugar, alFinal, cartel) {
    var c = limpiar(fondo), i = 0;
    c.innerHTML = (lugar ? '<div class="lugar-grande">' + ILU.lugar(lugar, 'off') + '</div>' : '') +
      (cartel ? '<div class="cartel-mision">' + esc(cartel) + '</div>' : '') +
      '<div class="dialogo"><div class="retrato"></div><div class="globo"><div><div class="quien"></div><div class="dice"></div></div>' +
      '<div class="acc"><button class="ico" data-a="voz" aria-label="Escuchar">🔊</button><button class="btn verde" data-a="sig">Siguiente ▶</button></div></div></div>';
    var mostrar = function () {
      var l = lineas[i], m = l.match(/^([^:]{2,30}):\s*(.*)$/), quien = m ? m[1] : 'Lumi', txt = m ? m[2] : l;
      var pj = null; MIS.forEach(function (mi) { if (mi.personaje.nombre === quien) pj = mi.personaje; });
      q('.retrato', c).innerHTML = quien === 'Lumi' || !pj ? ILU.lumi() : pj.emoji;
      q('.quien', c).textContent = quien;
      q('.dice', c).innerHTML = fmt(txt);
      q('[data-a=sig]', c).innerHTML = i === lineas.length - 1 ? '¡Vamos! ▶' : 'Siguiente ▶';
      q('[data-a=voz]', c).onclick = function () { Voz.decir(txt); };
    };
    q('[data-a=sig]', c).onclick = function () { Sonido.clic(); Voz.callar(); i++; if (i < lineas.length) mostrar(); else alFinal(); };
    mostrar(); q('[data-a=sig]', c).focus();
  }

  /* ===== Mapa ===== */
  var POS = [[90, 470], [330, 330], [560, 470], [790, 300], [1010, 450], [1160, 190]];
  function mapa() {
    pintarHud('<b>Mapa del Bosque Encantado</b>');
    var c = limpiar('mapa'), act = misionActual();
    if (act >= MIS.length) return final();
    var path = 'M' + POS.map(function (p) { return (p[0] + 95) + ' ' + (p[1] + 80); }).join(' L');
    var html = '<svg class="camino" viewBox="0 0 1366 768" aria-hidden="true"><path d="' + path + '" stroke="#f3e2b8" stroke-width="34" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="' + path + '" stroke="#d9c08a" stroke-width="6" fill="none" stroke-dasharray="4 22" stroke-linecap="round"/></svg>' +
      '<div class="mapa-titulo"><h2>Misión ' + (act + 1) + ': ' + esc(MIS[act].nombre) + '</h2>Tocá el lugar que brilla para entrar.</div>';
    MIS.forEach(function (m, i) {
      var hecha = misionCerrada(m), habil = i === act || (S.prueba && i <= MIS.length - 1);
      html += '<button class="parada ' + (i === act ? 'actual' : '') + '" style="left:' + POS[i][0] + 'px;top:' + POS[i][1] + 'px" data-i="' + i + '" ' + (habil ? '' : 'disabled') + ' aria-label="Misión ' + (i + 1) + ': ' + esc(m.nombre) + (hecha ? ' (completada)' : '') + '">' +
        '<span class="num">' + (hecha ? '✓' : i + 1) + '</span>' + ILU.lugar(m.escena, hecha ? 'on' : 'off') + (hecha && i < 5 ? '<span class="obj">' + m.objeto.emoji + '</span>' : '') +
        '<span class="nom">' + esc(m.nombre) + '</span></button>';
    });
    html += '<div class="mapa-lumi" style="left:' + Math.min(POS[act][0] + 120, 1366 - 230) + 'px;top:' + Math.max(POS[act][1] - 50, 80) + 'px">' + ILU.lumi() + '</div>';
    c.innerHTML = html;
    qa('.parada', c).forEach(function (b) { b.onclick = function () { Sonido.clic(); abrirMision(+b.dataset.i); }; });
    var a = q('.parada.actual', c); if (a) a.focus();
  }

  /* ===== Misión ===== */
  function abrirMision(i) {
    S.mi = i; var m = MIS[i];
    var empezada = m.desafios.some(function (d) { return infoDesafio(d.id); });
    pintarHud('Misión ' + (i + 1) + ': <b>' + esc(m.nombre) + '</b>');
    var seguir = function () { if (m.lectura) lectura(m, function () { siguienteDesafio(m); }); else siguienteDesafio(m); };
    if (misionCompleta(m)) return cierre(m);
    if (empezada) dialogo(['Lumi: ¡Seguimos donde habíamos dejado! Si querés, podés releer el texto con el botón 📖.'], m.escena, m.escena, function () { siguienteDesafio(m); }, 'Misión ' + (i + 1));
    else dialogo(m.intro, m.escena, m.escena, seguir, 'Misión ' + (i + 1) + ' · ' + m.nombre);
  }
  function siguienteDesafio(m) {
    for (var k = 0; k < m.desafios.length; k++) { var e = infoDesafio(m.desafios[k].id); if (!e || !e.cerrado) return desafio(m, k); }
    cierre(m);
  }

  /* ===== Lectura ===== */
  function htmlEnciclo(L, zonas, mini) {
    var slot = function (z) { return zonas && zonas[z] ? zonas[z] : ''; };
    var bloques = L.bloques.map(function (b, i) { return '<h3>' + (i === 0 ? slot('z2') : '') + esc(b.subtitulo) + '</h3><p>' + fmt(b.texto) + '</p>'; });
    return '<div class="enciclo ' + (mini ? 'mini' : '') + '">' +
      '<div class="hoja"><h2 class="tit titulo-fuente">' + slot('z1') + esc(L.titulo) + '</h2>' + bloques[0] +
      '<div class="fig">' + ILU.cardon() + '<div class="epi">' + slot('z3') + esc(L.epigrafe) + '</div></div></div>' +
      '<div class="hoja">' + bloques.slice(1).join('') +
      '<div class="datos"><div class="dt">' + slot('z4') + '¿Sabías que…?</div><ul>' + L.datos.map(function (d) { return '<li>' + esc(d) + '</li>'; }).join('') + '</ul></div>' +
      '<div class="fuente">' + slot('z5') + esc(L.fuente) + '</div></div></div>';
  }
  function htmlNota(L) {
    return '<div class="nota"><div class="tx"><h2 class="titulo-fuente">' + esc(L.titulo) + '</h2>' + L.parrafos.map(function (p) { return '<p>' + fmt(p) + '</p>'; }).join('') +
      '<div class="fuente">' + esc(L.fuente) + '</div></div><div class="fig">' + ILU.abeja() + '<div class="epi">' + esc(L.epigrafe) + '</div></div></div>';
  }
  function textoLectura(L, p) {
    if (L.tipo === 'enciclopedia') return L.titulo + '. ' + L.bloques.map(function (b) { return b.subtitulo + '. ' + b.texto; }).join(' ') + ' Epígrafe: ' + L.epigrafe + '. ¿Sabías que? ' + L.datos.join(' ') + ' ' + L.fuente;
    if (L.tipo === 'nota') return L.titulo + '. ' + L.parrafos.join(' ') + ' Epígrafe: ' + L.epigrafe;
    return (p === 0 ? L.titulo + '. ' : '') + L.paginas[p].parrafos.join(' ');
  }
  // Dibuja la lectura en "cont" y devuelve control de páginas
  function montarLectura(cont, L, alTerminar, enModal) {
    var p = 0, n = L.tipo === 'libro' ? L.paginas.length : 1;
    var pintar = function () {
      var cuerpo;
      if (L.tipo === 'enciclopedia') cuerpo = htmlEnciclo(L);
      else if (L.tipo === 'nota') cuerpo = htmlNota(L);
      else { var pg = L.paginas[p]; cuerpo = '<div class="libro"><div class="ilu">' + ILU.pagina(pg.ilustracion) + '</div><div class="tx">' + (p === 0 ? '<h2 class="titulo-fuente">' + esc(L.titulo) + '</h2>' : '') + pg.parrafos.map(function (t) { return '<p>' + fmt(t) + '</p>'; }).join('') + '</div></div>'; }
      cont.innerHTML = cuerpo + '<div class="nav-lectura"><div style="display:flex;gap:10px"><button class="btn blanco chico" data-a="ant" ' + (p === 0 ? 'disabled' : '') + '>◀ Anterior</button><button class="ico" data-a="voz" aria-label="Escuchar esta página">🔊</button></div>' +
        (n > 1 ? '<span class="pag">Página ' + (p + 1) + ' de ' + n + '</span>' : '<span></span>') +
        (p < n - 1 ? '<button class="btn verde chico" data-a="sig">Siguiente ▶</button>' : '<button class="btn chico" data-a="fin">' + (enModal ? 'Cerrar' : '¡Ya leí! A los desafíos ▶') + '</button>') + '</div>';
      q('[data-a=voz]', cont).onclick = function () { Voz.decir(textoLectura(L, p)); };
      q('[data-a=ant]', cont).onclick = function () { Voz.callar(); p--; pintar(); };
      var s = q('[data-a=sig]', cont); if (s) { s.onclick = function () { Voz.callar(); Sonido.clic(); p++; pintar(); }; s.focus(); }
      var f = q('[data-a=fin]', cont); if (f) { f.onclick = function () { Voz.callar(); alTerminar(); }; if (!s) f.focus(); }
    };
    pintar();
  }
  function lectura(m, luego) {
    var c = limpiar(m.escena);
    var box = el('<div class="lectura"></div>'); c.appendChild(box);
    montarLectura(box, m.lectura, luego, false);
  }
  function releer(m) {
    var mm = modal('<div class="cont-lec" style="flex:1;display:flex;flex-direction:column;gap:10px;min-height:0"></div>', { clase: 'lectura-modal' });
    montarLectura(q('.cont-lec', mm.nodo), m.lectura, mm.cerrar, true);
  }

  /* ===== Ayudas por tipo ===== */
  var AYUDAS = {
    opcion: ['Leé la pregunta (o tocá 🔊 para escucharla).', 'Tocá UNA respuesta.', 'Tocá "Comprobar".'],
    multiple: ['Puede haber varias respuestas correctas.', 'Tocá todas las que elegís. Para desmarcar, volvé a tocar.', 'Tocá "Comprobar".'],
    asignar: ['Tocá una tarjeta: se pone azul.', 'Después tocá el lugar donde va.', 'También podés arrastrarla con el mouse o el dedo.', 'Para sacarla, tocala y tocá el recuadro de tarjetas.'],
    ordenar: ['Tocá una tarjeta y después el lugar con el número.', 'También podés arrastrarla.', 'Para cambiarla, tocala y tocá otro lugar.'],
    completar: ['En cada espacio hay varias palabras.', 'Tocá la que completa bien la oración.'],
    marcar: ['Tocá las palabras que pide la consigna: se pintan de amarillo.', 'Para desmarcar, tocá otra vez.'],
    colorear: ['Primero tocá un lápiz.', 'Después tocá las palabras para pintarlas.', 'Con la goma podés borrar.'],
    abierta: ['Escribí lo que pensás con tus palabras.', 'Explicá por qué, con algo del texto.', 'Cuando termines, tocá "Enviar".'],
    escritura: ['Escribí tu oración.', 'Revisá la mayúscula y los signos.', 'Tocá "Comprobar".']
  };

  /* ===== Componentes de respuesta ===== */
  var R = {};

  R.opcion = function (d, w) {
    var sel = null, ops = barajar(d.opciones, d.id + S.token);
    w.innerHTML = '<div class="opciones" role="radiogroup">' + ops.map(function (o, i) { return '<button class="op" role="radio" aria-checked="false" data-id="' + o.id + '"><span class="letra">' + 'ABCD'[i] + '</span><span>' + fmt(o.texto) + '</span></button>'; }).join('') + '</div>';
    qa('.op', w).forEach(function (b) { b.onclick = function () { qa('.op', w).forEach(function (x) { x.classList.remove('sel'); x.setAttribute('aria-checked', 'false'); }); b.classList.add('sel'); b.setAttribute('aria-checked', 'true'); sel = b.dataset.id; Sonido.clic(); }; });
    return { valor: function () { return sel; }, falta: function () { return sel ? '' : 'Tocá una respuesta antes de comprobar.'; } };
  };

  R.multiple = function (d, w) {
    var sel = {};
    if (d.vista === 'escena') return R.escena(d, w, sel);
    var ops = barajar(d.opciones, d.id + S.token);
    w.innerHTML = '<div class="opciones multi">' + ops.map(function (o) { return '<button class="op" aria-pressed="false" data-id="' + o.id + '"><span class="check">✓</span><span>' + fmt(o.texto) + '</span></button>'; }).join('') + '</div>';
    qa('.op', w).forEach(function (b) { b.onclick = function () { var id = b.dataset.id; sel[id] = !sel[id]; b.classList.toggle('sel', sel[id]); b.setAttribute('aria-pressed', sel[id]); Sonido.clic(); }; });
    var val = function () { return Object.keys(sel).filter(function (k) { return sel[k]; }); };
    return { valor: val, falta: function () { return val().length ? '' : 'Tocá al menos una tarjeta.'; } };
  };
  R.escena = function (d, w, sel) {
    var dib = { a: '🦊', b: '🌛', c: '🦉', d: ILU.arbolConCara(), e: '☀️', f: '🪲' };
    var pos = { a: [6, 52], b: [80, 4], c: [82, 52], d: [38, 6], e: [8, 4], f: [62, 64] };
    var estrellas = ''; for (var i = 0; i < 25; i++) estrellas += '<i style="position:absolute;left:' + ((i * 37) % 100) + '%;top:' + ((i * 23) % 55) + '%;width:4px;height:4px;border-radius:50%;background:#fff;opacity:.7"></i>';
    w.innerHTML = '<div class="escena"><div class="estrellitas">' + estrellas + '</div>' + d.opciones.map(function (o) {
      return '<button class="pj" aria-pressed="false" aria-label="' + esc(o.texto) + '" data-id="' + o.id + '" style="left:' + pos[o.id][0] + '%;top:' + pos[o.id][1] + '%">' + dib[o.id] + '</button>';
    }).join('') + '</div>';
    qa('.pj', w).forEach(function (b) { b.onclick = function () { var id = b.dataset.id; sel[id] = !sel[id]; b.classList.toggle('sel', sel[id]); b.setAttribute('aria-pressed', sel[id]); Sonido.clic(); }; });
    var val = function () { return Object.keys(sel).filter(function (k) { return sel[k]; }); };
    return { valor: val, falta: function () { return val().length ? '' : 'Tocá al menos un personaje.'; } };
  };

  /* --- Asignador genérico (arrastrar y soltar + alternativa por clics) --- */
  function Asignador(raiz, cfg) {
    // cfg: chips[{id,html,clase}], cap(binId) -> 1 | Infinity, pintar(estado) dibuja y devuelve nodos
    var asig = {}, sel = null, self = this;
    cfg.chips.forEach(function (c) { asig[c.id] = null; });
    function chipHtml(c) { return '<button type="button" class="chip ' + (c.clase || '') + (sel === c.id ? ' sel' : '') + '" data-chip="' + c.id + '" aria-pressed="' + (sel === c.id) + '">' + c.html + '</button>'; }
    function mover(chip, bin) {
      if (bin !== null && cfg.cap(bin) === 1) {
        for (var k in asig) if (asig[k] === bin && k !== chip) asig[k] = asig[chip]; // intercambio
      }
      asig[chip] = bin; sel = null; Sonido.clic(); pintar();
    }
    function pintar() {
      var enPozo = cfg.chips.filter(function (c) { return asig[c.id] === null; }).map(chipHtml).join('');
      var porBin = {}; cfg.chips.forEach(function (c) { if (asig[c.id] !== null) (porBin[asig[c.id]] = porBin[asig[c.id]] || []).push(chipHtml(c)); });
      cfg.pintar(raiz, enPozo, porBin, !!sel);
      raiz.querySelector('.asig').classList.toggle('selecting', !!sel);
      var pozo = raiz.querySelector('.pozo'); pozo.classList.toggle('vacio', !enPozo);
      qa('[data-chip]', raiz).forEach(function (b) {
        b.onclick = function (ev) {
          ev.stopPropagation();
          if (b.dataset.drag === '1') { b.dataset.drag = ''; return; }
          if (sel && sel !== b.dataset.chip) {
            var destino = asig[b.dataset.chip];
            if (destino !== null) { mover(sel, destino); return; }
          }
          sel = sel === b.dataset.chip ? null : b.dataset.chip; Sonido.clic(); pintar();
        };
        arrastrable(b);
      });
      qa('[data-bin]', raiz).forEach(function (t) { t.onclick = function () { if (sel) mover(sel, t.dataset.bin); }; });
      pozo.onclick = function () { if (sel) mover(sel, null); };
    }
    function arrastrable(b) {
      b.onpointerdown = function (ev) {
        if (ev.button !== 0 && ev.pointerType === 'mouse') return;
        var x0 = ev.clientX, y0 = ev.clientY, fant = null, id = b.dataset.chip;
        var mov = function (e) {
          if (!fant && Math.abs(e.clientX - x0) + Math.abs(e.clientY - y0) > 8) {
            var r = b.getBoundingClientRect();
            fant = b.cloneNode(true); fant.classList.add('fantasma'); fant.style.width = (r.width / escala) + 'px';
            fant.style.transform = 'scale(' + escala + ')'; document.body.appendChild(fant); b.classList.add('arrastrando');
          }
          if (fant) { fant.style.left = (e.clientX - 20) + 'px'; fant.style.top = (e.clientY - 20) + 'px'; }
        };
        var fin = function (e) {
          document.removeEventListener('pointermove', mov); document.removeEventListener('pointerup', fin); document.removeEventListener('pointercancel', fin);
          if (!fant) return;
          fant.remove(); b.classList.remove('arrastrando'); b.dataset.drag = '1';
          setTimeout(function () { b.dataset.drag = ''; }, 50);
          var bajo = document.elementFromPoint(e.clientX, e.clientY);
          var bin = bajo && bajo.closest('[data-bin]'), pozo = bajo && bajo.closest('.pozo');
          if (bin && raiz.contains(bin)) mover(id, bin.dataset.bin);
          else if (pozo && raiz.contains(pozo)) mover(id, null);
          else pintar();
        };
        document.addEventListener('pointermove', mov); document.addEventListener('pointerup', fin); document.addEventListener('pointercancel', fin);
      };
    }
    pintar();
    self.valor = function () { var r = {}; for (var k in asig) if (asig[k] !== null) r[k] = asig[k]; return r; };
    self.faltan = function () { var n = 0; for (var k in asig) if (asig[k] === null) n++; return n; };
  }

  R.asignar = function (d, w) {
    var chips = barajar(d.chips, d.id + S.token).map(function (c) { return { id: c.id, html: fmt(c.texto), clase: c.texto.length < 14 ? 'palabra' : '' }; });
    var largo = d.chips.some(function (c) { return c.texto.length > 24; });
    var bins = d.bins, vista = d.vista;
    var a = new Asignador(w, {
      chips: chips,
      cap: function () { return vista === 'clasificar' || vista === 'reloj' ? Infinity : 1; },
      pintar: function (raiz, pozo, porBin) {
        var h;
        if (vista === 'zonas') {
          var zonas = {}; bins.forEach(function (b) { zonas[b.id] = '<span class="zona-slot ' + (porBin[b.id] ? 'lleno' : '') + '" data-bin="' + b.id + '" role="button" tabindex="0" aria-label="Lugar ' + b.texto + '">' + (porBin[b.id] ? porBin[b.id].join('') : b.texto) + '</span>'; });
          h = '<div class="asig"><div style="flex:1;display:flex;min-width:0">' + htmlEnciclo(MIS[S.mi].lectura, zonas, true) + '</div><div class="pozo" style="flex:0 0 210px;flex-direction:column;align-content:stretch">' + pozo + '</div></div>';
        } else if (vista === 'unir') {
          h = '<div class="asig"><div class="unir">' + bins.map(function (b) { return '<div class="fila-unir"><div class="izq">' + fmt(b.texto) + '</div><div class="slot1" data-bin="' + b.id + '" role="button" tabindex="0" aria-label="Espacio para ' + esc(b.texto) + '">' + (porBin[b.id] ? porBin[b.id].join('') : '<span class="ph">Tocá aquí para ubicar</span>') + '</div></div>'; }).join('') + '</div><div class="pozo" style="flex:1;flex-direction:column;align-content:stretch;justify-content:center">' + pozo + '</div></div>';
        } else {
          var lado = largo;
          var binsH = '<div class="bins" style="' + (lado && bins.length > 3 ? 'display:grid;grid-template-columns:1fr 1fr;' : '') + '">' + bins.map(function (b, i) { return '<div class="bin c' + i + '" data-bin="' + b.id + '" role="button" tabindex="0" aria-label="' + esc(b.texto) + '"><div class="cab">' + fmt(b.texto) + '</div><div class="cont">' + (porBin[b.id] || []).join('') + '</div></div>'; }).join('') + '</div>';
          if (vista === 'reloj') binsH = '<div style="flex:1;display:flex;flex-direction:column;gap:8px;min-width:0"><div style="text-align:center;font-size:44px;line-height:1">🕰️</div>' + binsH + '</div>';
          h = lado ? '<div class="asig"><div class="pozo lado" style="flex:0 0 38%;flex-direction:column;flex-wrap:nowrap">' + pozo + '</div>' + binsH + '</div>'
            : '<div class="asig col"><div class="pozo" style="justify-content:center">' + pozo + '</div>' + binsH + '</div>';
        }
        raiz.innerHTML = h;
        qa('[data-bin][tabindex]', raiz).forEach(function (t) { t.onkeydown = function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); t.click(); } }; });
      }
    });
    return { valor: a.valor, falta: function () { var n = a.faltan(); return n ? 'Te falta ubicar ' + n + (n === 1 ? ' tarjeta.' : ' tarjetas.') : ''; } };
  };

  R.ordenar = function (d, w) {
    var chips = barajar(d.chips, d.id + S.token).map(function (c) { return { id: c.id, html: fmt(c.texto) }; });
    var a = new Asignador(w, {
      chips: chips, cap: function () { return 1; },
      pintar: function (raiz, pozo, porBin) {
        raiz.innerHTML = '<div class="asig col"><div class="pozo" style="justify-content:center;flex:none">' + pozo + '</div><div class="ordenar-slots">' +
          d.rotulos.map(function (r, i) { return (i ? '<span class="flecha">➜</span>' : '') + '<div class="slot-o"><div class="rot">' + esc(r) + '</div><div class="slot1" data-bin="' + i + '" role="button" tabindex="0" aria-label="Lugar ' + esc(r) + '">' + (porBin[i] ? porBin[i].join('') : '<span class="ph">…</span>') + '</div></div>'; }).join('') + '</div></div>';
        qa('[data-bin][tabindex]', raiz).forEach(function (t) { t.onkeydown = function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); t.click(); } }; });
      }
    });
    return { valor: function () { var v = a.valor(), r = {}; for (var k in v) r[k] = +v[k]; return r; }, falta: function () { var n = a.faltan(); return n ? 'Te falta ubicar ' + n + (n === 1 ? ' tarjeta.' : ' tarjetas.') : ''; } };
  };

  R.completar = function (d, w) {
    var sel = d.oraciones.map(function () { return null; });
    w.innerHTML = '<div class="completar">' + d.oraciones.map(function (o, i) {
      var ops = barajar(o.opciones, d.id + i + S.token);
      return '<div class="oracion"><span>' + fmt(o.antes) + '</span><span class="hueco" role="radiogroup" aria-label="Espacio ' + (i + 1) + '">' + ops.map(function (op) { return '<button data-i="' + i + '" data-v="' + esc(op) + '" role="radio" aria-checked="false">' + esc(op) + '</button>'; }).join('') + '</span><span>' + fmt(o.despues) + '</span></div>';
    }).join('') + '</div>';
    qa('.hueco button', w).forEach(function (b) {
      b.onclick = function () { var i = +b.dataset.i; sel[i] = b.dataset.v; qa('.hueco button[data-i="' + i + '"]', w).forEach(function (x) { x.classList.toggle('sel', x === b); x.setAttribute('aria-checked', x === b); }); b.parentNode.classList.add('lleno'); Sonido.clic(); };
    });
    return { valor: function () { return sel; }, falta: function () { var n = sel.filter(function (x) { return x === null; }).length; return n ? 'Te falta completar ' + n + (n === 1 ? ' espacio.' : ' espacios.') : ''; } };
  };

  function tokens(t) { return String(t).split(/\s+/).filter(Boolean); }
  R.marcar = function (d, w) {
    var sel = {};
    w.innerHTML = '<div class="texto-marcar">' + tokens(d.texto).map(function (t, i) { return '<button class="tok" data-i="' + i + '" aria-pressed="false">' + esc(t) + '</button>'; }).join('') + '</div>';
    qa('.tok', w).forEach(function (b) { b.onclick = function () { var i = b.dataset.i; sel[i] = !sel[i]; b.classList.toggle('sel', sel[i]); b.setAttribute('aria-pressed', sel[i]); Sonido.clic(); }; });
    var val = function () { return Object.keys(sel).filter(function (k) { return sel[k]; }).map(Number); };
    return { valor: val, falta: function () { return val().length ? '' : 'Tocá al menos una palabra.'; } };
  };

  R.colorear = function (d, w) {
    var pint = {}, lapiz = d.categorias[0].id, color = {}; d.categorias.forEach(function (c) { color[c.id] = c.color; });
    var hex = { azul: '#2f6fd6', verde: '#2f8f5b', rojo: '#d64545' };
    w.innerHTML = '<div class="lapices" role="radiogroup" aria-label="Lápices">' + d.categorias.map(function (c) { return '<button class="lapiz" data-c="' + c.id + '" role="radio"><span class="pt" style="background:' + hex[c.color] + '"></span>' + esc(c.texto) + ' (' + c.color + ')</button>'; }).join('') + '<button class="lapiz" data-c="" role="radio">🧽 Goma</button></div>' +
      '<div class="texto-marcar">' + tokens(d.texto).map(function (t, i) { return '<button class="tok" data-i="' + i + '">' + esc(t) + '</button>'; }).join('') + '</div>';
    var marcarLapiz = function () { qa('.lapiz', w).forEach(function (b) { var on = b.dataset.c === lapiz; b.classList.toggle('sel', on); b.setAttribute('aria-checked', on); }); };
    qa('.lapiz', w).forEach(function (b) { b.onclick = function () { lapiz = b.dataset.c; marcarLapiz(); Sonido.clic(); }; });
    qa('.tok', w).forEach(function (b) {
      b.onclick = function () {
        var i = b.dataset.i; b.className = 'tok';
        if (lapiz) { pint[i] = lapiz; b.classList.add('c-' + color[lapiz]); b.setAttribute('aria-label', b.textContent + ': ' + color[lapiz]); } else { delete pint[i]; b.removeAttribute('aria-label'); }
        Sonido.clic();
      };
    });
    marcarLapiz();
    return { valor: function () { return pint; }, falta: function () { return Object.keys(pint).length ? '' : 'Pintá al menos una palabra.'; } };
  };

  R.abierta = function (d, w) {
    var borrador = Almacen.get('borrador_' + S.token + '_' + d.id) || '';
    w.innerHTML = '<div class="escribir"><textarea maxlength="1200" aria-label="Tu respuesta" placeholder="Escribí acá tu respuesta…"></textarea><div class="cuenta"></div></div>';
    var ta = q('textarea', w), cu = q('.cuenta', w);
    ta.value = borrador;
    var act = function () { var falta = (d.minCaracteres || 1) - ta.value.trim().length; cu.textContent = falta > 0 ? 'Escribí un poquito más…' : '¡Muy bien! Cuando termines, revisá y enviá.'; Almacen.set('borrador_' + S.token + '_' + d.id, ta.value); };
    ta.oninput = act; act(); setTimeout(function () { ta.focus(); }, 50);
    return { valor: function () { return ta.value; }, falta: function () { return ta.value.trim().length < (d.minCaracteres || 1) ? 'Escribí un poco más para explicar lo que pensás.' : ''; } };
  };
  R.escritura = R.abierta;

  /* ===== Pantalla de desafío ===== */
  function desafio(m, k) {
    var d = m.desafios[k];
    pintarHud('Misión ' + (S.mi + 1) + ': <b>' + esc(m.nombre) + '</b>');
    var c = limpiar(m.escena);
    c.innerHTML = '<div class="desafio">' +
      '<div class="consigna"><div class="etq">Desafío<b>' + (k + 1) + ' de ' + m.desafios.length + '</b></div><div class="txt">' + fmt(d.consigna) + '</div>' +
      '<div class="herr"><button class="ico" data-a="voz" title="Escuchar la consigna" aria-label="Escuchar la consigna">🔊</button>' +
      '<button class="ico" data-a="ayuda" title="¿Cómo se juega?" aria-label="Ayuda">❓</button>' +
      (m.lectura ? '<button class="ico" data-a="leer" title="Releer el texto" aria-label="Releer el texto">📖</button>' : '') + '</div></div>' +
      '<div class="trabajo"></div>' +
      '<div class="pie-desafio"><div class="mini-lumi">' + ILU.lumi() + '</div><div class="burbuja" aria-live="polite"></div><button class="btn verde" data-a="comprobar">' + (d.tipo === 'abierta' ? 'Enviar ✉️' : 'Comprobar ✔') + '</button></div></div>';
    var w = q('.trabajo', c), burb = q('.burbuja', c), btn = q('[data-a=comprobar]', c);
    var comp = R[d.tipo](d, w);
    var info = infoDesafio(d.id);
    var decir = function (t, clase) { burb.className = 'burbuja ' + (clase || ''); burb.innerHTML = t; };
    decir(info && info.intentos ? '¡Tenés otra oportunidad! Revisá con calma.' : esc(d.ayuda || 'Leé la consigna con atención. Si querés, tocá 🔊 para escucharla.'));
    q('[data-a=voz]', c).onclick = function () { Voz.decir(d.consigna); };
    q('[data-a=ayuda]', c).onclick = function () {
      var pasos = (AYUDAS[d.vista === 'escena' ? 'multiple' : d.tipo] || []).slice(); if (d.ayuda) pasos.unshift(d.ayuda);
      var mm = modal('<h2>¿Cómo se juega?</h2><ol class="ayuda-lista">' + pasos.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ol><p style="text-align:right;margin-bottom:0"><button class="ico" data-a="v">🔊</button> <button class="btn verde chico" data-a="ok">¡Entendí!</button></p>');
      q('[data-a=v]', mm.nodo).onclick = function () { Voz.decir(pasos.join('. ')); };
      q('[data-a=ok]', mm.nodo).onclick = mm.cerrar;
    };
    if (m.lectura) q('[data-a=leer]', c).onclick = function () { releer(m); };
    var t0 = Date.now(), enviando = false;

    btn.onclick = function () {
      if (btn.dataset.estado === 'seguir') { Sonido.clic(); return siguienteDesafio(m); }
      if (enviando) return;
      var f = comp.falta(); if (f) { decir(esc(f), 'info'); Sonido.casi(); return; }
      enviando = true; btn.disabled = true; decir('Lumi está revisando tu respuesta… ✨', 'info');
      var datos = { token: S.token, desafioId: d.id, respuesta: comp.valor(), intentoId: uid(), tiempoMs: Date.now() - t0 };
      t0 = Date.now();
      if (d.tipo === 'abierta') Almacen.del('borrador_' + S.token + '_' + d.id);
      var conCola = function () {
        Cola.poner({ tipo: 'resp', datos: datos });
        S.estado.desafios[d.id] = { intentos: ((info && info.intentos) || 0) + 1, cerrado: true, superado: false };
        terminar({ ok: true, offline: true, cerrado: true });
      };
      Servidor.responder(datos).then(function (r) {
        if (!r || (!r.ok && !r.validacion && !r.error)) return conCola();
        terminar(r);
      }).catch(conCola);
    };
    function terminar(r) {
      enviando = false; btn.disabled = false;
      if (!r.ok) { decir(esc(r.error || 'Algo salió mal. Probá otra vez.'), 'info'); if (r.vencida) { btn.disabled = true; w.style.pointerEvents = 'none'; Almacen.del('token'); } else if (r.error && /sesi/i.test(r.error)) portada(); return; }
      if (!r.offline && !r.yaCerrado) S.estado.desafios[d.id] = { intentos: r.intento, cerrado: r.cerrado, superado: r.superado };
      if (r.yaCerrado) S.estado.desafios[d.id] = { intentos: r.intento, cerrado: true, superado: r.superado };
      var M = CFG.MENSAJES, extra = r.esperado ? '<br><small><b>Respuesta esperada (solo modo prueba):</b> ' + esc(r.esperado) + ' · Puntaje 1.er intento: ' + r.puntaje + '/' + d.puntos + '</small>' : '';
      if (r.offline) { decir(esc(azar(M.sinConexion)), 'info'); }
      else if (r.mensaje === 'abierta') { decir(esc(azar(M.abierta)) + extra, 'ok'); Sonido.bien(); }
      else if (r.correcto) { decir('⭐ ' + esc(azar(M.correcto)) + extra, 'ok'); Sonido.bien(); }
      else if (!r.cerrado) {
        var det = r.total > 1 ? ' Tenés ' + r.aciertos + ' de ' + r.total + ' bien' + (r.sobran ? ', y marcaste algo que no va' : '') + '.' : '';
        decir(esc(azar(M.reintento) + det) + extra, 'mal'); Sonido.casi();
        var tr = q('.trabajo', c); tr.classList.remove('temblor'); void tr.offsetWidth; tr.classList.add('temblor');
        btn.innerHTML = 'Comprobar otra vez ✔';
        pintarHud(); return;
      } else { decir(esc(azar(M.agotado)) + extra, 'info'); }
      w.style.pointerEvents = 'none'; w.style.opacity = '.85';
      btn.dataset.estado = 'seguir'; btn.innerHTML = 'Continuar ▶'; btn.focus();
      pintarHud();
    }
  }

  /* ===== Cierre de misión (mini-juego + recompensa) ===== */
  function cierre(m) {
    var c = limpiar(m.escena), cz = m.cierre;
    if (cz.tipo === 'portal') return portalFinal(m);
    c.innerHTML = '<div class="recompensa capa" style="position:absolute"><div class="panel minijuego" style="max-width:1000px"><h2 style="color:var(--verde-o);text-shadow:none;font-size:36px">' + esc(cz.texto) + '</h2><div class="juego"></div><div class="msg-error" aria-live="polite"></div></div></div>';
    var j = q('.juego', c), listo = function () { recompensa(m); };
    if (cz.tipo === 'codigo') {
      j.innerHTML = '<div class="letras">' + cz.palabra.split('').map(function (l, i) { return '<div class="letra-c" style="animation-delay:' + i * .25 + 's">' + l + '</div>'; }).join('') + '</div>' +
        '<div class="letras">' + cz.palabra.split('').map(function (l, i) { return '<input maxlength="1" aria-label="Letra ' + (i + 1) + '">'; }).join('') + '</div><button class="btn verde">Abrir el archivo 🔓</button>';
      var ins = qa('input', j);
      ins.forEach(function (inp, i) { inp.oninput = function () { if (inp.value && ins[i + 1]) ins[i + 1].focus(); }; inp.onkeydown = function (e) { if (e.key === 'Backspace' && !inp.value && ins[i - 1]) ins[i - 1].focus(); if (e.key === 'Enter') q('.btn', j).click(); }; });
      ins[0].focus();
      q('.btn', j).onclick = function () {
        var v = ins.map(function (x) { return x.value; }).join('').toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
        if (v === cz.palabra) listo(); else { q('.msg-error', c).textContent = 'Mirá las letras que brillan arriba y copialas en orden.'; j.classList.remove('temblor'); void j.offsetWidth; j.classList.add('temblor'); Sonido.casi(); }
      };
    } else if (cz.tipo === 'brotar') {
      var etapas = ['🌰', '🌱', '🌿', '🌳'], n = 0;
      j.innerHTML = '<button class="tocable semilla" aria-label="Tocar la semilla">🌰</button>';
      q('.tocable', j).onclick = function () { n++; Sonido.clic(); this.textContent = etapas[Math.min(n, 3)]; this.classList.remove('temblor'); void this.offsetWidth; this.classList.add('temblor'); if (n >= 3) setTimeout(listo, 700); };
      q('.tocable', j).focus();
    } else {
      var lug = cz.tipo === 'encender' ? 'claro' : cz.tipo === 'maquina' ? 'laboratorio' : 'reloj';
      j.innerHTML = '<button class="tocable" aria-label="Tocar">' + ILU.lugar(lug, 'off') + '</button>';
      q('.tocable', j).onclick = function () { Sonido.premio(); this.innerHTML = ILU.lugar(lug, 'on'); this.onclick = null; setTimeout(listo, 1200); };
      q('.tocable', j).focus();
    }
  }
  function registrarCierre(m) {
    S.estado.cierres = S.estado.cierres || {}; S.estado.cierres[m.id] = new Date().toISOString();
    var datos = { token: S.token, misionId: m.id };
    Servidor.cierre(datos).then(function (r) { if (!r || !r.ok) Cola.poner({ tipo: 'cierre', datos: datos }); }).catch(function () { Cola.poner({ tipo: 'cierre', datos: datos }); pintarHud(); });
  }
  function recompensa(m) {
    registrarCierre(m); Sonido.premio(); confeti();
    var c = limpiar(m.escena);
    c.innerHTML = '<div class="recompensa capa" style="position:absolute;background:rgba(10,40,25,.35)"><div class="objeto-grande">' + m.objeto.emoji + '</div><h2>¡Conseguiste: ' + esc(m.objeto.nombre) + '!</h2>' +
      (m.cierre.dato ? '<div class="panel dato">💡 ' + esc(m.cierre.dato) + ' <button class="ico" data-a="voz" aria-label="Escuchar">🔊</button></div>' : '') +
      '<button class="btn gigante" data-a="mapa">Volver al mapa 🗺️</button></div>';
    pintarHud();
    var v = q('[data-a=voz]', c); if (v) v.onclick = function () { Voz.decir(m.cierre.dato); };
    q('[data-a=mapa]', c).onclick = function () { Sonido.clic(); mapa(); };
    q('[data-a=mapa]', c).focus();
  }

  function portalFinal(m) {
    var c = limpiar('portal');
    var pos = [[17, 206], [69, 59], [164, -4], [259, 59], [311, 206]];
    var chips = barajar(MIS.slice(0, 5), 'portal' + S.token).map(function (mm) { return { id: mm.id, html: mm.objeto.emoji + '<span style="font-size:15px;display:block">' + esc(mm.objeto.nombre) + '</span>' }; });
    c.innerHTML = '<div class="desafio"><div class="consigna"><div class="txt">' + esc(m.cierre.texto) + ' Cada tesoro va en la piedra de su misión (1 a 5).</div><div class="herr"><button class="ico" data-a="voz" aria-label="Escuchar">🔊</button></div></div><div class="trabajo" style="background:transparent;box-shadow:none"></div><div class="pie-desafio"><div class="mini-lumi">' + ILU.lumi() + '</div><div class="burbuja">Cada tesoro tiene su lugar: seguí el orden del recorrido.</div><button class="btn verde" data-a="abrir">Abrir el portal 🌈</button></div></div>';
    q('[data-a=voz]', c).onclick = function () { Voz.decir(m.cierre.texto); };
    var w = q('.trabajo', c);
    var a = new Asignador(w, {
      chips: chips, cap: function () { return 1; },
      pintar: function (raiz, pozo, porBin) {
        raiz.innerHTML = '<div class="asig"><div class="pozo" style="flex:0 0 330px;justify-content:center;align-content:center">' + pozo + '</div><div style="flex:1;display:flex;justify-content:center;align-items:center"><div class="portal-armado">' + ILU.lugar('portal', 'off') +
          MIS.slice(0, 5).map(function (mm, i) { return '<div class="slot1" data-bin="' + mm.id + '" role="button" tabindex="0" aria-label="Piedra ' + (i + 1) + ': ' + esc(mm.nombre) + '" style="left:' + pos[i][0] + 'px;top:' + pos[i][1] + 'px">' + (porBin[mm.id] ? porBin[mm.id].join('') : '<span class="ph" style="padding:0;font-size:30px;font-family:Baloo 2;font-weight:800">' + (i + 1) + '</span>') + '</div>'; }).join('') + '</div></div></div>';
        qa('.chip', raiz).forEach(function (ch) { ch.style.fontSize = '34px'; ch.style.padding = '4px 10px'; });
        qa('[data-bin][tabindex]', raiz).forEach(function (t) { t.onkeydown = function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); t.click(); } }; });
      }
    });
    q('[data-a=abrir]', c).onclick = function () {
      var v = a.valor(), ok = MIS.slice(0, 5).every(function (mm) { return v[mm.id] === mm.id; });
      if (a.faltan()) { q('.burbuja', c).textContent = 'Todavía faltan tesoros en el portal.'; return; }
      if (!ok) { q('.burbuja', c).textContent = 'Algún tesoro está en otra piedra. Pista: 1 lupa, 2 hoja, 3 semilla, 4 engranaje, 5 aguja del reloj.'; Sonido.casi(); return; }
      registrarCierre(m); Sonido.premio(); confeti();
      dialogo(B.final.map(function (t) { return 'Lumi: ' + t; }), 'portal', 'portal', diploma);
      var lg = q('.lugar-grande'); if (lg) lg.innerHTML = ILU.lugar('portal', 'on');
    };
  }

  function final() { dialogo(B.final.map(function (t) { return 'Lumi: ' + t; }), 'portal', 'portal', diploma); var lg = q('.lugar-grande'); if (lg) lg.innerHTML = ILU.lugar('portal', 'on'); }

  function diploma() {
    pintarHud('<b>¡Misión cumplida!</b>');
    var c = limpiar('portada'), hoy = new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
    c.innerHTML = '<div class="diploma"><h1>Diploma de Exploración</h1><div class="otorga">El Bosque Encantado reconoce a</div>' +
      '<div class="nombre">' + esc(S.estado.nombre + ' ' + S.estado.apellido) + '</div>' +
      '<div class="texto">de ' + esc(S.estado.division) + ', por resolver el misterio, despertar al bosque y devolverle su equilibrio usando todo lo que aprendió en Prácticas del Lenguaje y Ciencias Naturales.</div>' +
      '<div class="tesoros">' + MIS.slice(0, 5).map(function (m) { return m.objeto.emoji; }).join('') + '</div>' +
      '<div class="firmas"><div>' + esc(hoy) + '</div><div style="text-align:center">' + ILU.lumi() + '<br>Lumi, guía del bosque</div><div class="no-print" style="display:flex;gap:10px">' + (window.MODO_APP !== 'local' ? '<button class="btn blanco chico" data-a="imp">🖨️ Imprimir</button>' : '') + '<button class="btn chico" data-a="salir">Terminar</button></div></div></div>';
    confeti();
    var imp = q('[data-a=imp]', c); if (imp) imp.onclick = function () { try { window.print(); } catch (e) { } };
    q('[data-a=salir]', c).onclick = function () {
      var mm = modal('<h2>¡Gracias por jugar!</h2><p style="font-size:24px">Tu aventura quedó guardada. Ya podés avisarle a tu seño que terminaste.</p><p style="text-align:right"><button class="btn verde">Volver al inicio</button></p>');
      q('.btn', mm.nodo).onclick = function () { mm.cerrar(); Almacen.del('token'); S.token = null; portada(); };
    };
  }

  // Avisar antes de cerrar si hay respuestas sin enviar
  window.addEventListener('beforeunload', function (e) { if (S.token && Cola.leer().length) { e.preventDefault(); e.returnValue = ''; } });

  window.JUEGO = { S: S, portada: portada, mapa: mapa, abrirMision: abrirMision, diploma: diploma };
  portada();
})();

}

arrancar();
