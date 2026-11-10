/* =====================================================================
   codigo.gs — Servicio de Google Apps Script que corrige y guarda los
   resultados en Google Sheets. Pegar COMPLETO en un proyecto de Apps
   Script vinculado a la planilla (Extensiones › Apps Script).
   Contiene: 1) CONFIG y BANCO (editables), 2) corrección, 3) servicio web.
   ===================================================================== */

/* =====================================================================
   BANCO DE DESAFÍOS Y CONFIGURACIÓN — "El misterio del Bosque Encantado"
   ---------------------------------------------------------------------
   Este es el ÚNICO archivo que la docente necesita editar para cambiar
   textos, preguntas, respuestas, puntajes, intentos o mensajes.

   • En Google Apps Script este archivo se llama  Banco.gs  y vive SOLO
     en el servidor: las soluciones nunca llegan a la computadora del
     alumno (se envía una copia sin el campo "solucion").
   • Cada desafío tiene:
       id          identificador único (no cambiarlo una vez aplicado)
       tipo        opcion | multiple | asignar | ordenar | completar |
                   marcar | colorear | abierta | escritura
       consigna    texto que lee el alumno
       puntos      puntaje máximo
       contenidos  claves de CONFIG.CONTENIDOS que evalúa
       espacio     "Prácticas del Lenguaje", "Ciencias Naturales" o "Integrado"
       comprension "Literal", "Inferencial", "Opinión" o "" (si no aplica)
       habilidad   aprendizaje esperado
       criterio    criterio de corrección (va a la planilla)
       solucion    respuesta correcta (solo servidor)
   ===================================================================== */

var CONFIG = {
  TITULO: 'El misterio del Bosque Encantado',
  SUBTITULO: 'Misión rescate',
  INTENTOS_MAX: 2,               // intentos por desafío (el 1.º es el que se califica)
  DURACION_ESTIMADA_MIN: 50,
  DIVISIONES: ['3.º A', '3.º B', '3.º C'],
  NUMERO_LISTA_MAX: 40,
  UMBRAL_ACOMPANAMIENTO: 0.6,    // por debajo de este logro se sugiere acompañamiento
  // Clave del modo prueba docente. En Apps Script se puede cambiar también desde
  // Proyecto > Configuración > Propiedades de la secuencia de comandos (CLAVE_DOCENTE).
  CLAVE_DOCENTE: 'bosque2026',
  ICONOS_CLAVE: ['🦉', '🌵', '🐝', '🦊', '🌻', '🐸'],
  CONTENIDOS: {
    ENC: 'Nota de enciclopedia',
    LEY: 'Leyenda',
    CUE: 'Cuento maravilloso',
    EST: 'Estructura narrativa',
    CLA: 'Clases de palabras',
    CON: 'Concordancia',
    TIE: 'Tiempos verbales',
    ORA: 'Tipos de oraciones',
    LIT: 'Comprensión literal',
    INF: 'Comprensión inferencial',
    OPI: 'Opinión personal',
    CN:  'Ciencias Naturales'
  },
  MENSAJES: {
    correcto: ['¡Excelente, explorador!', '¡Lo lograste! El bosque brilla un poquito más.', '¡Muy bien! Encontraste la pista.', '¡Genial! Sigamos.'],
    reintento: ['Casi… Mirá otra vez con atención y probá de nuevo.', 'Todavía no. ¡Releé la pista y volvé a intentar!'],
    agotado: ['Lumi guardó tu respuesta en su farolito. ¡Seguimos la aventura!', 'Tu respuesta quedó guardada. ¡Vamos al próximo desafío!'],
    abierta: ['¡Gracias por contarme lo que pensás! Tu seño va a leer tu respuesta.'],
    sinConexion: ['Se cortó la conexión, pero Lumi guardó tu respuesta. Se enviará sola cuando vuelva internet.']
  }
};

var BANCO = {
  personajeGuia: {
    nombre: 'Lumi',
    descripcion: 'una luciérnaga exploradora que lleva un farolito de luz en su pancita'
  },
  prologo: [
    '¡Hola! Soy Lumi, una luciérnaga exploradora. ¡Qué suerte que llegaste!',
    'Anoche pasó la Niebla Dormilona por el Bosque Encantado. Bostezó tan fuerte que desordenó todo: escondió los libros, apagó el Árbol Luminoso y paró el reloj del bosque.',
    'Ahora los animales y las plantas no encuentran su camino. Para despertar al bosque tenemos que juntar cinco tesoros y abrir el Gran Portal de la Naturaleza.',
    'Vas a usar todo lo que aprendiste este año. Si tenés dudas, tocá el botón 🔊 para escuchar o ❓ para pedir ayuda. ¿Vamos?'
  ],
  final: [
    '¡Lo lograste! El Gran Portal se abrió y una luz cálida recorrió todo el bosque.',
    'El cardón guarda su agua, las luciérnagas brillan, las semillas crecen hacia el sol y las abejas vuelven a visitar las flores.',
    'La Niebla Dormilona se despertó de buen humor y prometió no volver a desordenar nada. ¡Gracias, explorador!'
  ],

  misiones: [
    /* =========================== MISIÓN 1 =========================== */
    {
      id: 'M1',
      nombre: 'El archivo secreto del bosque',
      eje: 'Nota de enciclopedia',
      lugar: 'La biblioteca del tronco hueco',
      escena: 'archivo',
      personaje: { nombre: 'Don Ramiro', quien: 'el búho bibliotecario', emoji: '🦉' },
      objeto: { emoji: '🔍', nombre: 'Lupa del Archivo' },
      intro: [
        'Don Ramiro: ¡Uh, qué lío! La Niebla Dormilona mezcló todas las páginas de mi enciclopedia.',
        'Lumi: Encontramos una página sobre el cardón, un cactus del norte argentino. Leela con atención: guarda un código secreto.'
      ],
      lectura: {
        tipo: 'enciclopedia',
        titulo: 'El cardón',
        bloques: [
          { zona: 'z-sub1', subtitulo: '¿Cómo es?', texto: 'El cardón es un cactus muy alto que vive en los cerros secos y soleados del norte de la Argentina, como los de Jujuy y Salta. Puede ser más alto que una casa y tiene brazos que crecen hacia arriba.' },
          { subtitulo: 'Un guardián del agua', texto: 'Su **tallo** es grueso y guarda agua en su interior. Sus **raíces** son largas y están cerca de la superficie: así absorben rápido el agua cuando llueve. Las **espinas** son hojas transformadas. Como son finitas, el cardón pierde muy poca agua. Además, lo protegen de los animales que quieren comerlo.' },
          { subtitulo: 'Amigos del cardón', texto: 'El cardón da flores blancas y grandes. Algunos insectos, aves y murciélagos se alimentan de su néctar y llevan el polen de una flor a otra.' }
        ],
        epigrafe: 'Cardones en los cerros de Jujuy.',
        datos: ['Crece muy despacio: tarda muchos años en crecer apenas un metro.', 'Algunos cardones viven más de cien años.'],
        fuente: 'Fuente: Enciclopedia de los Seres Vivos del Bosque Encantado, tomo 2.'
      },
      desafios: [
        {
          id: 'M1D1', tipo: 'asignar', vista: 'zonas', puntos: 2,
          consigna: 'Don Ramiro perdió los carteles de su página. Llevá cada cartel al número que corresponde.',
          ayuda: 'Tocá un cartel y después tocá el número de la página. También podés arrastrarlo.',
          contenidos: ['ENC'], espacio: 'Prácticas del Lenguaje', comprension: '',
          habilidad: 'Identifica los elementos paratextuales de una nota de enciclopedia.',
          criterio: 'Un acierto por cartel ubicado correctamente (5). Puntaje proporcional.',
          bins: [
            { id: 'z1', texto: '1' }, { id: 'z2', texto: '2' }, { id: 'z3', texto: '3' }, { id: 'z4', texto: '4' }, { id: 'z5', texto: '5' }
          ],
          chips: [
            { id: 'e', texto: 'Epígrafe' }, { id: 'a', texto: 'Título' }, { id: 'd', texto: 'Fuente' }, { id: 'b', texto: 'Subtítulo' }, { id: 'c', texto: 'Datos curiosos' }
          ],
          solucion: { a: 'z1', b: 'z2', e: 'z3', c: 'z4', d: 'z5' }
        },
        {
          id: 'M1D2', tipo: 'opcion', puntos: 1,
          consigna: '¿Para qué se escribió esta nota de enciclopedia?',
          contenidos: ['ENC'], espacio: 'Prácticas del Lenguaje', comprension: '',
          habilidad: 'Reconoce la finalidad informativa de la nota de enciclopedia.',
          criterio: 'Correcta: informar cómo es y cómo vive el cardón.',
          opciones: [
            { id: 'a', texto: 'Para contar una aventura inventada de un cactus.' },
            { id: 'b', texto: 'Para informar cómo es y cómo vive el cardón.' },
            { id: 'c', texto: 'Para explicar con magia por qué existen los cactus.' },
            { id: 'd', texto: 'Para dar instrucciones de cómo plantar un cactus.' }
          ],
          solucion: 'b'
        },
        {
          id: 'M1D3', tipo: 'completar', puntos: 2,
          consigna: 'Completá las oraciones con la información de la nota.',
          ayuda: 'En cada espacio, tocá la palabra que corresponde. Podés tocar 📖 para releer.',
          contenidos: ['ENC', 'LIT', 'CN'], espacio: 'Integrado', comprension: 'Literal',
          habilidad: 'Recupera información explícita de un texto informativo.',
          criterio: 'Un acierto por espacio (3). Puntaje proporcional.',
          oraciones: [
            { antes: 'El cardón guarda agua en su', opciones: ['flor', 'tallo', 'espina'], despues: '.' },
            { antes: 'Sus espinas son', opciones: ['raíces', 'ramas', 'hojas'], despues: 'transformadas.' },
            { antes: 'Vive en cerros', opciones: ['secos', 'helados', 'húmedos'], despues: 'y soleados.' }
          ],
          solucion: ['tallo', 'hojas', 'secos']
        },
        {
          id: 'M1D4', tipo: 'opcion', puntos: 1,
          consigna: 'En los cerros del norte llueve muy poco. Si el cardón tuviera hojas grandes y finitas en lugar de espinas, ¿qué le pasaría?',
          contenidos: ['INF', 'CN'], espacio: 'Integrado', comprension: 'Inferencial',
          habilidad: 'Infiere la función de una adaptación a partir de pistas del texto.',
          criterio: 'Correcta: perdería más agua y le costaría sobrevivir.',
          opciones: [
            { id: 'a', texto: 'Crecería más rápido porque tendría más sombra.' },
            { id: 'b', texto: 'No le pasaría nada, porque las hojas no pierden agua.' },
            { id: 'c', texto: 'Perdería más agua y le costaría sobrevivir.' },
            { id: 'd', texto: 'Ningún animal podría acercarse a él.' }
          ],
          solucion: 'c'
        },
        {
          id: 'M1D5', tipo: 'asignar', vista: 'unir', puntos: 2,
          consigna: 'Uní cada parte del cardón con la manera en que lo ayuda a vivir.',
          ayuda: 'Tocá una tarjeta de la derecha y después el espacio vacío al lado de la parte del cardón.',
          contenidos: ['ENC', 'CN'], espacio: 'Ciencias Naturales', comprension: 'Literal',
          habilidad: 'Relaciona estructuras de una planta con su adaptación al ambiente seco.',
          criterio: 'Un acierto por par (4). Puntaje proporcional.',
          bins: [
            { id: 'p1', texto: '🌵 Tallo grueso' }, { id: 'p2', texto: '📍 Espinas' }, { id: 'p3', texto: '🟫 Raíces cerca de la superficie' }, { id: 'p4', texto: '🌼 Flores con néctar' }
          ],
          chips: [
            { id: 'r', texto: 'Absorben rápido el agua de la lluvia.' },
            { id: 'q', texto: 'Atraen animales que llevan el polen.' },
            { id: 't', texto: 'Guarda agua para los días sin lluvia.' },
            { id: 's', texto: 'Pierde poca agua y lo protegen de los animales.' }
          ],
          solucion: { t: 'p1', s: 'p2', r: 'p3', q: 'p4' }
        }
      ],
      cierre: {
        tipo: 'codigo', palabra: 'SAVIA',
        texto: 'Cada desafío encendió una letra escondida. Escribí la palabra secreta para abrir el archivo.',
        dato: 'La savia es el líquido que circula por dentro de las plantas y lleva agua y alimento a todas sus partes.'
      }
    },

    /* =========================== MISIÓN 2 =========================== */
    {
      id: 'M2',
      nombre: 'La leyenda del árbol luminoso',
      eje: 'Leyenda y comprensión lectora',
      lugar: 'El claro del Árbol Luminoso',
      escena: 'claro',
      personaje: { nombre: 'Abuela Tortuga', quien: 'la que guarda las historias del bosque', emoji: '🐢' },
      objeto: { emoji: '🍃', nombre: 'Hoja Luminosa' },
      intro: [
        'Abuela Tortuga: El Árbol Luminoso se apagó y nadie recuerda su historia. Yo la guardo en mi caparazón… pero la niebla borró algunas partes.',
        'Lumi: ¡Es la leyenda de cómo nacieron las luciérnagas, como yo! Leela y ayudanos a reconstruirla.'
      ],
      lectura: {
        tipo: 'libro',
        titulo: 'La leyenda del árbol luminoso',
        paginas: [
          { ilustracion: 'noche', parrafos: ['Hace muchísimo tiempo, cuando el bosque todavía no tenía nombre, las noches eran tan oscuras que los animales pequeños se perdían al volver a sus nidos.', 'En el centro del bosque vivía el Abuelo Algarrobo, un árbol viejo y sabio que escuchaba los lamentos de todos.'] },
          { ilustracion: 'subida', parrafos: ['Una noche, un escarabajo pequeño llamado Tiluz dijo: —Yo voy a buscar luz para todos.', 'Trepó por el tronco del Abuelo Algarrobo hasta la rama más alta, para hablar con la Luna. El viento soplaba fuerte y la subida era larga, pero Tiluz no se rindió.'] },
          { ilustracion: 'luna', parrafos: ['La Luna, emocionada por su valentía, le regaló una chispa de plata. —Guardala en tu pancita y compartila con quien la necesite —le dijo.', 'Desde entonces, Tiluz y sus hijos iluminan las noches de verano. Así nacieron las luciérnagas, y por eso todavía hoy brillan entre los árboles.'] }
        ]
      },
      desafios: [
        {
          id: 'M2D1', tipo: 'multiple', puntos: 2,
          consigna: 'Marcá TODAS las características de la leyenda que aparecen en esta historia.',
          ayuda: 'Puede haber más de una correcta. Tocá las tarjetas que elegís y después "Comprobar".',
          contenidos: ['LEY'], espacio: 'Prácticas del Lenguaje', comprension: '',
          habilidad: 'Reconoce las características de la leyenda.',
          criterio: '3 características correctas. Puntaje = (correctas marcadas − incorrectas marcadas) / 3, mínimo 0.',
          opciones: [
            { id: 'a', texto: 'Explica de forma imaginaria el origen de algo de la naturaleza.' },
            { id: 'b', texto: 'Tiene título, subtítulos y fuente, como una enciclopedia.' },
            { id: 'c', texto: 'Ocurre hace mucho tiempo, en un lugar de la naturaleza.' },
            { id: 'd', texto: 'Da información comprobada por científicos.' },
            { id: 'e', texto: 'Tiene elementos fantásticos, como una Luna que habla.' },
            { id: 'f', texto: 'Tiene instrucciones para hacer algo paso a paso.' }
          ],
          solucion: ['a', 'c', 'e']
        },
        {
          id: 'M2D2', tipo: 'asignar', vista: 'clasificar', puntos: 2,
          consigna: '¿Lo cuenta la LEYENDA o lo explica la CIENCIA? Llevá cada tarjeta al cofre que corresponde.',
          ayuda: 'La leyenda inventa una explicación. La ciencia da información comprobada.',
          contenidos: ['LEY', 'CN'], espacio: 'Integrado', comprension: 'Inferencial',
          habilidad: 'Diferencia explicaciones fantásticas de información científica.',
          criterio: 'Un acierto por tarjeta (6). Puntaje proporcional.',
          bins: [ { id: 'L', texto: '✨ Lo cuenta la leyenda' }, { id: 'C', texto: '🔬 Lo explica la ciencia' } ],
          chips: [
            { id: 'a', texto: 'Las luciérnagas son un tipo de escarabajo.' },
            { id: 'b', texto: 'La Luna le regaló una chispa de plata a Tiluz.' },
            { id: 'c', texto: 'Las luciérnagas usan su luz para comunicarse entre ellas.' },
            { id: 'd', texto: 'Un árbol sabio escuchaba los lamentos de los animales.' },
            { id: 'e', texto: 'La luz se produce dentro de su cuerpo, en la parte de atrás.' },
            { id: 'f', texto: 'Tiluz guardó la luz en su pancita para compartirla.' }
          ],
          solucion: { a: 'C', b: 'L', c: 'C', d: 'L', e: 'C', f: 'L' }
        },
        {
          id: 'M2D3', tipo: 'multiple', vista: 'escena', puntos: 2,
          consigna: 'Buscá en la ilustración a los TRES personajes de la leyenda y tocalos.',
          ayuda: 'Tocá cada personaje en el dibujo. Si te equivocás, tocalo otra vez para desmarcarlo.',
          contenidos: ['LEY', 'LIT'], espacio: 'Prácticas del Lenguaje', comprension: 'Literal',
          habilidad: 'Identifica a los personajes de una narración.',
          criterio: '3 personajes. Puntaje = (correctos − incorrectos) / 3, mínimo 0.',
          opciones: [
            { id: 'a', texto: 'el zorro' }, { id: 'b', texto: 'la Luna' }, { id: 'c', texto: 'el búho' },
            { id: 'd', texto: 'el Abuelo Algarrobo' }, { id: 'e', texto: 'el sol' }, { id: 'f', texto: 'el escarabajo Tiluz' }
          ],
          solucion: ['b', 'd', 'f']
        },
        {
          id: 'M2D4', tipo: 'ordenar', puntos: 2,
          consigna: 'La niebla mezcló las partes de la leyenda. Ordenalas del 1 al 4.',
          ayuda: 'Tocá una tarjeta y después el lugar con el número. También podés arrastrarla.',
          contenidos: ['LEY', 'LIT', 'EST'], espacio: 'Prácticas del Lenguaje', comprension: 'Literal',
          habilidad: 'Ordena los acontecimientos principales de una narración.',
          criterio: 'Un acierto por tarjeta en su lugar (4). Puntaje proporcional.',
          rotulos: ['1', '2', '3', '4'],
          chips: [
            { id: 'c', texto: 'La Luna le regaló una chispa de plata.' },
            { id: 'a', texto: 'Las noches eran muy oscuras y los animales se perdían.' },
            { id: 'd', texto: 'Desde entonces, las luciérnagas iluminan las noches.' },
            { id: 'b', texto: 'Tiluz trepó hasta la rama más alta para hablar con la Luna.' }
          ],
          solucion: ['a', 'b', 'c', 'd']
        },
        {
          id: 'M2D5', tipo: 'opcion', puntos: 1,
          consigna: 'Pista: "El viento soplaba fuerte, pero Tiluz no se rindió" y él quiso buscar luz "para todos". ¿Cómo es Tiluz?',
          contenidos: ['LEY', 'INF'], espacio: 'Prácticas del Lenguaje', comprension: 'Inferencial',
          habilidad: 'Infiere características de un personaje a partir de sus acciones.',
          criterio: 'Correcta: valiente y generoso.',
          opciones: [
            { id: 'a', texto: 'Miedoso y distraído.' },
            { id: 'b', texto: 'Egoísta y perezoso.' },
            { id: 'c', texto: 'Valiente y generoso.' },
            { id: 'd', texto: 'Gruñón y mentiroso.' }
          ],
          solucion: 'c'
        },
        {
          id: 'M2D6', tipo: 'abierta', puntos: 2, minCaracteres: 25,
          consigna: '¿Te parece que Tiluz hizo bien en arriesgarse para ayudar a los demás? ¿Por qué? Usá algo que pasó en la leyenda para explicar lo que pensás.',
          ayuda: 'No hay una única respuesta correcta. Contá qué pensás y explicá por qué, con algo de la historia.',
          contenidos: ['OPI', 'LEY'], espacio: 'Prácticas del Lenguaje', comprension: 'Opinión',
          habilidad: 'Formula una opinión personal y la justifica con información del texto.',
          criterio: '2 = postura clara y justificación relacionada con hechos de la leyenda (la oscuridad, la subida, el viento, el regalo de la Luna, la luz compartida). 1 = postura con justificación general o poco relacionada con el texto. 0 = sin postura, sin justificación o respuesta ajena al texto. Se acepta cualquier postura bien justificada.'
        }
      ],
      cierre: {
        tipo: 'encender',
        texto: '¡Reconstruiste la leyenda! Tocá el Árbol Luminoso para devolverle su luz.',
        dato: 'Dato científico: la luz de las luciérnagas se llama bioluminiscencia. La producen dentro de su cuerpo y casi no da calor.'
      }
    },

    /* =========================== MISIÓN 3 =========================== */
    {
      id: 'M3',
      nombre: 'El castillo de las semillas mágicas',
      eje: 'Cuento maravilloso y estructura narrativa',
      lugar: 'El castillo de las semillas',
      escena: 'castillo',
      personaje: { nombre: 'Hada Rocío', quien: 'el hada jardinera del castillo', emoji: '🧚' },
      objeto: { emoji: '🌰', nombre: 'Semilla Mágica' },
      intro: [
        'Hada Rocío: ¡Bienvenidos al castillo! En nuestra biblioteca hay un cuento maravilloso sobre una semilla extraordinaria.',
        'Lumi: Si lo entendemos bien, el hada nos va a regalar una semilla mágica para el portal. ¡A leer!'
      ],
      lectura: {
        tipo: 'libro',
        titulo: 'La semilla dorada',
        paginas: [
          { ilustracion: 'regalo', parrafos: ['Había una vez, en un reino rodeado de bosques, una niña llamada Clara que cuidaba el jardín del castillo.', 'Un día, un hada diminuta se posó en su mano y le regaló una semilla dorada. —Es mágica: crecerá si la cuidás con paciencia —le dijo.'] },
          { ilustracion: 'robo', parrafos: ['Pero esa misma noche, un duende travieso entró al jardín, robó la semilla y la escondió en lo alto de una torre encantada.', 'La puerta de la torre solo se abría si alguien adivinaba una adivinanza. Clara se puso muy triste, pero decidió ir a buscarla.'] },
          { ilustracion: 'puerta', parrafos: ['Clara subió cien escalones. Entonces la puerta habló: —Tengo raíces que no se ven, crezco hacia la luz y doy sombra también. ¿Quién soy?', 'Clara pensó un ratito y respondió: —¡Un árbol! La puerta se abrió y allí estaba la semilla dorada.'] },
          { ilustracion: 'arbol', parrafos: ['Clara plantó la semilla junto a la ventana más soleada del castillo. Cada mañana, el arbolito se inclinaba hacia la ventana, buscando el sol.', 'Al poco tiempo creció un árbol de hojas doradas que daba frutos para todo el reino. Y el duende, arrepentido, ayudó a regarlo.'] }
        ]
      },
      desafios: [
        {
          id: 'M3D1', tipo: 'multiple', puntos: 2,
          consigna: 'Marcá TODOS los elementos mágicos o fantásticos del cuento.',
          ayuda: 'Pensá: ¿esto podría pasar en la vida real? Si no, es mágico. Puede haber más de una correcta.',
          contenidos: ['CUE'], espacio: 'Prácticas del Lenguaje', comprension: 'Literal',
          habilidad: 'Identifica elementos maravillosos en un cuento.',
          criterio: '4 elementos mágicos. Puntaje = (correctos − incorrectos) / 4, mínimo 0.',
          opciones: [
            { id: 'a', texto: 'Un hada diminuta que regala una semilla.' },
            { id: 'b', texto: 'Clara cuida el jardín del castillo.' },
            { id: 'c', texto: 'Una puerta que habla y dice una adivinanza.' },
            { id: 'd', texto: 'Una torre con muchos escalones.' },
            { id: 'e', texto: 'Un duende travieso.' },
            { id: 'f', texto: 'Un arbolito que se inclina hacia el sol.' },
            { id: 'g', texto: 'Un árbol de hojas doradas.' }
          ],
          solucion: ['a', 'c', 'e', 'g']
        },
        {
          id: 'M3D2', tipo: 'opcion', puntos: 1,
          consigna: '¿Cuál es el problema (conflicto) del cuento?',
          contenidos: ['CUE', 'EST'], espacio: 'Prácticas del Lenguaje', comprension: 'Literal',
          habilidad: 'Reconoce el conflicto principal de una narración.',
          criterio: 'Correcta: el duende roba la semilla y la esconde en la torre.',
          opciones: [
            { id: 'a', texto: 'Clara no sabe regar el jardín.' },
            { id: 'b', texto: 'Un duende travieso roba la semilla y la esconde en una torre.' },
            { id: 'c', texto: 'El hada se pierde en el bosque.' },
            { id: 'd', texto: 'El árbol da demasiados frutos.' }
          ],
          solucion: 'b'
        },
        {
          id: 'M3D3', tipo: 'ordenar', puntos: 3,
          consigna: 'Armá el camino del cuento: ordená las tarjetas en el inicio, el desarrollo y el final.',
          ayuda: 'Tocá una tarjeta y después un lugar vacío del camino. También podés arrastrarla.',
          contenidos: ['EST', 'CUE'], espacio: 'Prácticas del Lenguaje', comprension: 'Literal',
          habilidad: 'Ordena la secuencia narrativa y reconoce inicio, desarrollo y final.',
          criterio: 'Un acierto por tarjeta en su lugar (5). Puntaje proporcional.',
          rotulos: ['1 · Inicio', '2 · Desarrollo', '3 · Desarrollo', '4 · Desarrollo', '5 · Final'],
          chips: [
            { id: 'd', texto: '🚪 Clara adivina la adivinanza y la puerta se abre.', },
            { id: 'b', texto: '🧝 Un duende roba la semilla y la esconde.' },
            { id: 'e', texto: '🌳 Nace un árbol dorado con frutos para todo el reino.' },
            { id: 'a', texto: '🧚 Un hada le regala a Clara una semilla dorada.' },
            { id: 'c', texto: '🪜 Clara sube los cien escalones de la torre.' }
          ],
          solucion: ['a', 'b', 'c', 'd', 'e']
        },
        {
          id: 'M3D4', tipo: 'opcion', puntos: 1,
          consigna: '¿Cómo se resuelve el problema del cuento?',
          contenidos: ['CUE', 'EST'], espacio: 'Prácticas del Lenguaje', comprension: 'Literal',
          habilidad: 'Identifica cómo se resuelve el conflicto.',
          criterio: 'Correcta: Clara adivina la adivinanza y recupera la semilla.',
          opciones: [
            { id: 'a', texto: 'El hada vuelve y castiga al duende.' },
            { id: 'b', texto: 'Clara compra otra semilla en el mercado.' },
            { id: 'c', texto: 'El duende devuelve la semilla porque se aburre.' },
            { id: 'd', texto: 'Clara adivina la adivinanza y recupera la semilla.' }
          ],
          solucion: 'd'
        },
        {
          id: 'M3D5', tipo: 'asignar', vista: 'clasificar', puntos: 2,
          consigna: '¿Es del CUENTO MARAVILLOSO o de la LEYENDA? Llevá cada tarjeta a su libro.',
          ayuda: 'Acordate: "La semilla dorada" es un cuento maravilloso y "El árbol luminoso" es una leyenda.',
          contenidos: ['CUE', 'LEY'], espacio: 'Prácticas del Lenguaje', comprension: '',
          habilidad: 'Diferencia el cuento maravilloso de la leyenda.',
          criterio: 'Un acierto por tarjeta (4). Puntaje proporcional.',
          bins: [ { id: 'C', texto: '🏰 Cuento maravilloso' }, { id: 'L', texto: '🌙 Leyenda' } ],
          chips: [
            { id: 'a', texto: 'Explica de forma imaginaria por qué pasa algo en la naturaleza.' },
            { id: 'b', texto: 'Empieza con "Había una vez".' },
            { id: 'c', texto: 'Cuenta cómo nacieron las luciérnagas.' },
            { id: 'd', texto: 'Ocurre en un reino con castillo, hadas y duendes.' }
          ],
          solucion: { a: 'L', b: 'C', c: 'L', d: 'C' }
        },
        {
          id: 'M3D6', tipo: 'opcion', puntos: 1,
          consigna: 'En el cuento, "el arbolito se inclinaba hacia la ventana, buscando el sol". En la vida real, ¿puede pasar esto?',
          contenidos: ['CN', 'INF'], espacio: 'Ciencias Naturales', comprension: 'Inferencial',
          habilidad: 'Reconoce la respuesta de las plantas al estímulo de la luz.',
          criterio: 'Correcta: sí, las plantas crecen hacia la luz porque la necesitan para fabricar su alimento.',
          opciones: [
            { id: 'a', texto: 'No, solo puede pasar por arte de magia.' },
            { id: 'b', texto: 'Sí, porque las plantas quieren mirar por la ventana.' },
            { id: 'c', texto: 'Sí, las plantas crecen hacia la luz porque la necesitan para fabricar su alimento.' },
            { id: 'd', texto: 'No, las plantas siempre crecen hacia abajo.' }
          ],
          solucion: 'c'
        }
      ],
      cierre: {
        tipo: 'brotar',
        texto: '¡El hada te regala la Semilla Mágica! Tocala varias veces para ayudarla a brotar.',
        dato: 'Las plantas reciben la luz del sol con sus hojas y la usan para fabricar su propio alimento.'
      }
    },

    /* =========================== MISIÓN 4 =========================== */
    {
      id: 'M4',
      nombre: 'El laboratorio de las palabras',
      eje: 'Clases de palabras y concordancia',
      lugar: 'El laboratorio de la hormiga Tina',
      escena: 'laboratorio',
      personaje: { nombre: 'Tina', quien: 'la hormiga inventora', emoji: '🐜' },
      objeto: { emoji: '⚙️', nombre: 'Engranaje de las Palabras' },
      intro: [
        'Tina: ¡Mi máquina Clasificadora de Palabras se trabó! La niebla mezcló sustantivos, adjetivos y verbos.',
        'Lumi: Si la reparamos, Tina nos va a dar su engranaje de oro. ¡Manos a la obra!'
      ],
      lectura: null,
      desafios: [
        {
          id: 'M4D1', tipo: 'asignar', vista: 'clasificar', puntos: 3,
          consigna: 'Cargá la máquina: llevá cada palabra al compartimento que corresponde.',
          ayuda: 'Sustantivo común: nombra cualquier cosa (nido). Sustantivo propio: un nombre particular, con mayúscula (Lumi). Adjetivo: dice cómo es. Verbo: una acción.',
          contenidos: ['CLA'], espacio: 'Prácticas del Lenguaje', comprension: '',
          habilidad: 'Clasifica sustantivos comunes y propios, adjetivos y verbos.',
          criterio: 'Un acierto por palabra (12). Puntaje proporcional.',
          bins: [
            { id: 'SC', texto: 'Sustantivos comunes' }, { id: 'SP', texto: 'Sustantivos propios' }, { id: 'AD', texto: 'Adjetivos' }, { id: 'VB', texto: 'Verbos' }
          ],
          chips: [
            { id: 'a', texto: 'colibrí' }, { id: 'b', texto: 'florece' }, { id: 'c', texto: 'Paraná' }, { id: 'd', texto: 'verde' },
            { id: 'e', texto: 'nido' }, { id: 'f', texto: 'Lumi' }, { id: 'g', texto: 'corre' }, { id: 'h', texto: 'pequeña' },
            { id: 'i', texto: 'Misiones' }, { id: 'j', texto: 'raíz' }, { id: 'k', texto: 'brillante' }, { id: 'l', texto: 'vuela' }
          ],
          solucion: { a: 'SC', e: 'SC', j: 'SC', c: 'SP', f: 'SP', i: 'SP', d: 'AD', h: 'AD', k: 'AD', b: 'VB', g: 'VB', l: 'VB' }
        },
        {
          id: 'M4D2', tipo: 'marcar', puntos: 2,
          consigna: 'Tocá todos los SUSTANTIVOS PROPIOS de esta oración.',
          ayuda: 'Los sustantivos propios son nombres particulares de personas, animales o lugares.',
          contenidos: ['CLA'], espacio: 'Prácticas del Lenguaje', comprension: '',
          habilidad: 'Identifica sustantivos propios dentro de una oración.',
          criterio: '4 sustantivos propios. Puntaje = (correctos − incorrectos) / 4, mínimo 0.',
          texto: 'Lumi y el búho Ramiro volaron sobre el río Uruguay hasta la selva de Misiones.',
          solucion: [0, 4, 9, 14]
        },
        {
          id: 'M4D3', tipo: 'marcar', puntos: 2,
          consigna: 'Tocá todos los VERBOS (las acciones) de este texto.',
          ayuda: 'Preguntate: ¿qué hace el picaflor? Las palabras que responden son verbos.',
          contenidos: ['CLA', 'CN'], espacio: 'Integrado', comprension: '',
          habilidad: 'Identifica verbos dentro de un texto y reconoce su función (nombrar acciones).',
          criterio: '3 verbos. Puntaje = (correctos − incorrectos) / 3, mínimo 0.',
          texto: 'El picaflor busca flores. Con su pico largo toma el néctar y lleva el polen a otra flor.',
          solucion: [2, 8, 12]
        },
        {
          id: 'M4D4', tipo: 'completar', puntos: 2,
          consigna: 'Completá cada oración con la palabra que corresponde.',
          ayuda: 'Fijate qué clase de palabra pide cada espacio y que la oración tenga sentido.',
          contenidos: ['CLA', 'CN'], espacio: 'Integrado', comprension: '',
          habilidad: 'Selecciona la clase de palabra adecuada para completar oraciones.',
          criterio: 'Un acierto por espacio (3). Puntaje proporcional.',
          oraciones: [
            { antes: 'La lechuza tiene ojos', opciones: ['grandes', 'vuela', 'Tucumán'], despues: 'para ver de noche. (adjetivo)' },
            { antes: 'Las abejas', opciones: ['dulces', 'fabrican', 'colmena'], despues: 'miel en la colmena. (verbo)' },
            { antes: 'El', opciones: ['suave', 'duerme', 'zorro'], despues: 'descansa en su cueva. (sustantivo común)' }
          ],
          solucion: ['grandes', 'fabrican', 'zorro']
        },
        {
          id: 'M4D5', tipo: 'completar', puntos: 3,
          consigna: 'Elegí el adjetivo que concuerda con el sustantivo (masculino o femenino, uno o varios).',
          ayuda: 'Mirá la palabra subrayada: ¿es femenina o masculina? ¿Es una o son varias?',
          contenidos: ['CON'], espacio: 'Prácticas del Lenguaje', comprension: '',
          habilidad: 'Reconoce la concordancia de género y número entre sustantivo y adjetivo.',
          criterio: 'Un acierto por espacio (4). Puntaje proporcional.',
          oraciones: [
            { antes: 'Las _hojas_', opciones: ['seco', 'seca', 'secos', 'secas'], despues: 'caen del árbol.' },
            { antes: 'Los _murciélagos_ son animales', opciones: ['nocturno', 'nocturna', 'nocturnos', 'nocturnas'], despues: '.' },
            { antes: 'La _flor_', opciones: ['blanco', 'blanca', 'blancos', 'blancas'], despues: 'del cardón es grande.' },
            { antes: 'El _tallo_ del cactus es', opciones: ['grueso', 'gruesa', 'gruesos', 'gruesas'], despues: '.' }
          ],
          solucion: ['secas', 'nocturnos', 'blanca', 'grueso']
        },
        {
          id: 'M4D6', tipo: 'opcion', puntos: 1,
          consigna: 'La máquina imprimió cuatro carteles. ¿Cuál está bien escrito?',
          contenidos: ['CON'], espacio: 'Prácticas del Lenguaje', comprension: '',
          habilidad: 'Detecta errores de concordancia en una oración.',
          criterio: 'Correcta: Los colibríes pequeños vuelan rápido.',
          opciones: [
            { id: 'a', texto: 'Los colibrí pequeños vuelan rápido.' },
            { id: 'b', texto: 'El colibríes pequeño vuela rápido.' },
            { id: 'c', texto: 'Los colibríes pequeños vuelan rápido.' },
            { id: 'd', texto: 'Los colibríes pequeña vuelan rápido.' }
          ],
          solucion: 'c'
        }
      ],
      cierre: {
        tipo: 'maquina',
        texto: '¡La Clasificadora funciona! Tocá la palanca para encenderla y recibir el engranaje.',
        dato: 'Los picaflores, mientras toman néctar, llevan polen de una flor a otra: así ayudan a las plantas a formar semillas.'
      }
    },

    /* =========================== MISIÓN 5 =========================== */
    {
      id: 'M5',
      nombre: 'El reloj del tiempo y los mensajes secretos',
      eje: 'Tiempos verbales y tipos de oraciones',
      lugar: 'La torre del reloj',
      escena: 'reloj',
      personaje: { nombre: 'Doña Ramona', quien: 'la lechuza que cuida el reloj', emoji: '🦉' },
      objeto: { emoji: '🕰️', nombre: 'Aguja del Tiempo' },
      intro: [
        'Doña Ramona: ¡Buenas noches! Las lechuzas despertamos cuando oscurece. Pero el reloj del bosque se detuvo y ya no sabemos qué pasó ayer, qué pasa hoy y qué pasará mañana.',
        'Lumi: Además, la niebla dejó mensajes secretos. ¡Reparemos el reloj y descifremos los mensajes!'
      ],
      lectura: null,
      desafios: [
        {
          id: 'M5D1', tipo: 'asignar', vista: 'reloj', puntos: 2,
          consigna: 'Arreglá el reloj: llevá cada oración a PASADO, PRESENTE o FUTURO según cuándo ocurre la acción.',
          ayuda: 'Pasado: ya ocurrió (ayer). Presente: ocurre ahora. Futuro: ocurrirá (mañana).',
          contenidos: ['TIE', 'CN'], espacio: 'Integrado', comprension: '',
          habilidad: 'Reconoce acciones en pasado, presente y futuro.',
          criterio: 'Un acierto por oración (6). Puntaje proporcional.',
          bins: [ { id: 'PA', texto: '⏪ Pasado' }, { id: 'PR', texto: '⏺️ Presente' }, { id: 'FU', texto: '⏩ Futuro' } ],
          chips: [
            { id: 'a', texto: 'Anoche la lechuza cazó un ratón.' },
            { id: 'b', texto: 'Mañana las abejas visitarán las flores.' },
            { id: 'c', texto: 'Ahora el murciélago duerme cabeza abajo.' },
            { id: 'd', texto: 'Con la lluvia, las semillas germinarán.' },
            { id: 'e', texto: 'El año pasado los horneros armaron su nido.' },
            { id: 'f', texto: 'Hoy el sapo atrapa insectos con su lengua.' }
          ],
          solucion: { a: 'PA', e: 'PA', c: 'PR', f: 'PR', b: 'FU', d: 'FU' }
        },
        {
          id: 'M5D2', tipo: 'completar', puntos: 2,
          consigna: 'Elegí la forma del verbo que corresponde a cada momento.',
          ayuda: 'Las palabras "ayer", "ahora" y "mañana" son pistas del tiempo.',
          contenidos: ['TIE'], espacio: 'Prácticas del Lenguaje', comprension: '',
          habilidad: 'Selecciona formas verbales apropiadas según el tiempo.',
          criterio: 'Un acierto por espacio (3). Puntaje proporcional.',
          oraciones: [
            { antes: 'Ayer el zorro', opciones: ['busca', 'buscó', 'buscará'], despues: 'comida en el bosque.' },
            { antes: 'Ahora la tortuga', opciones: ['camina', 'caminó', 'caminará'], despues: 'despacio hacia el río.' },
            { antes: 'Mañana la planta', opciones: ['abrió', 'abre', 'abrirá'], despues: 'sus flores.' }
          ],
          solucion: ['buscó', 'camina', 'abrirá']
        },
        {
          id: 'M5D3', tipo: 'asignar', vista: 'clasificar', puntos: 3,
          consigna: 'Descifrá los mensajes secretos: ¿qué tipo de oración es cada uno?',
          ayuda: 'Enunciativa: cuenta o informa. Interrogativa: pregunta (¿?). Exclamativa: expresa una emoción (¡!). Imperativa: da una orden o un pedido.',
          contenidos: ['ORA', 'CN'], espacio: 'Integrado', comprension: '',
          habilidad: 'Identifica oraciones enunciativas, interrogativas, exclamativas e imperativas.',
          criterio: 'Un acierto por mensaje (8). Puntaje proporcional.',
          bins: [ { id: 'EN', texto: 'Enunciativa' }, { id: 'IN', texto: 'Interrogativa' }, { id: 'EX', texto: 'Exclamativa' }, { id: 'IM', texto: 'Imperativa' } ],
          chips: [
            { id: 'a', texto: 'Los murciélagos duermen de día.' },
            { id: 'b', texto: '¿Por qué brillan las luciérnagas?' },
            { id: 'c', texto: '¡Qué hermoso es el bosque de noche!' },
            { id: 'd', texto: 'Cuidá las plantas del bosque.' },
            { id: 'e', texto: '¿Dónde viven los pumas?' },
            { id: 'f', texto: 'No arranques las flores.' },
            { id: 'g', texto: '¡Cuánto vuela el cóndor!' },
            { id: 'h', texto: 'El cactus guarda agua en su tallo.' }
          ],
          solucion: { a: 'EN', h: 'EN', b: 'IN', e: 'IN', c: 'EX', g: 'EX', d: 'IM', f: 'IM' }
        },
        {
          id: 'M5D4', tipo: 'asignar', vista: 'unir', puntos: 2,
          consigna: '¿Para qué escribió la niebla cada mensaje? Uní cada mensaje con su intención.',
          ayuda: 'Pensá qué quiere lograr quien escribe: ¿preguntar, ordenar, informar o mostrar una emoción?',
          contenidos: ['ORA'], espacio: 'Prácticas del Lenguaje', comprension: 'Inferencial',
          habilidad: 'Reconoce la intención comunicativa de distintos mensajes.',
          criterio: 'Un acierto por par (4). Puntaje proporcional.',
          bins: [
            { id: 'm1', texto: '“Regá el arbolito todas las mañanas.”' },
            { id: 'm2', texto: '“¿Quién apagó la luz del árbol?”' },
            { id: 'm3', texto: '“¡Qué alegría, volvió la luz!”' },
            { id: 'm4', texto: '“La lechuza caza de noche.”' }
          ],
          chips: [
            { id: 'x', texto: 'Mostrar una emoción.' },
            { id: 'w', texto: 'Hacer una pregunta.' },
            { id: 'z', texto: 'Informar algo.' },
            { id: 'y', texto: 'Dar una orden o un consejo.' }
          ],
          solucion: { y: 'm1', w: 'm2', x: 'm3', z: 'm4' }
        },
        {
          id: 'M5D5', tipo: 'escritura', puntos: 1, minCaracteres: 10,
          consigna: 'Escribí una oración INTERROGATIVA para preguntarle algo a Doña Ramona sobre su vida en el bosque.',
          ayuda: 'Una oración interrogativa pregunta algo. Acordate de abrir con ¿ y cerrar con ? y de empezar con mayúscula.',
          contenidos: ['ORA'], espacio: 'Prácticas del Lenguaje', comprension: '',
          habilidad: 'Produce una oración interrogativa con la puntuación correspondiente.',
          criterio: 'Automático: 1 punto si empieza con ¿, termina con ? y tiene al menos 3 palabras. La respuesta queda registrada para que la docente revise mayúscula y sentido.',
          solucion: { empieza: '¿', termina: '?', minPalabras: 3 }
        }
      ],
      cierre: {
        tipo: 'reloj',
        texto: '¡El reloj volvió a andar! Tocá el reloj para ponerlo en hora y recibir la Aguja del Tiempo.',
        dato: 'Las lechuzas son animales nocturnos: sus ojos grandes y su oído muy fino las ayudan a cazar en la oscuridad.'
      }
    },

    /* =========================== MISIÓN 6 =========================== */
    {
      id: 'M6',
      nombre: 'El gran portal de la naturaleza',
      eje: 'Integración final',
      lugar: 'El Gran Portal',
      escena: 'portal',
      personaje: { nombre: 'Lumi', quien: 'tu guía', emoji: '✨' },
      objeto: { emoji: '🌈', nombre: 'Luz del Portal' },
      intro: [
        'Lumi: ¡Llegamos al Gran Portal! Sobre la piedra hay una nota escrita por los guardianes del bosque.',
        'Lumi: Para abrirlo, tenemos que usar todo lo que aprendimos de las palabras y de los seres vivos.'
      ],
      lectura: {
        tipo: 'nota',
        titulo: 'Socios del bosque',
        parrafos: [
          'Las abejas visitan las flores para alimentarse de su néctar. Mientras lo hacen, el polen se pega a los pelitos de su cuerpo y viaja de una flor a otra. Este viaje se llama **polinización**. Gracias a él, muchas plantas pueden formar frutos y semillas.',
          'Las flores también responden a la luz. Algunas se cierran cuando oscurece y se vuelven a abrir con el sol de la mañana. Otras, en cambio, se abren de noche y las visitan polillas y murciélagos.'
        ],
        epigrafe: 'Una abeja con polen en las patas.',
        fuente: 'Fuente: Cuaderno de los Guardianes del Bosque.'
      },
      desafios: [
        {
          id: 'M6D1', tipo: 'opcion', puntos: 1,
          consigna: 'Según la nota, ¿qué es la polinización?',
          contenidos: ['LIT', 'CN', 'ENC'], espacio: 'Integrado', comprension: 'Literal',
          habilidad: 'Recupera información explícita de una nota informativa.',
          criterio: 'Correcta: el viaje del polen de una flor a otra.',
          opciones: [
            { id: 'a', texto: 'Cuando la abeja fabrica una flor nueva.' },
            { id: 'b', texto: 'El viaje del polen de una flor a otra.' },
            { id: 'c', texto: 'Cuando las flores se cierran de noche.' },
            { id: 'd', texto: 'La comida preferida de los murciélagos.' }
          ],
          solucion: 'b'
        },
        {
          id: 'M6D2', tipo: 'opcion', puntos: 1,
          consigna: 'Si en un jardín desaparecieran todas las abejas, ¿qué les pasaría a las plantas que ellas visitan?',
          contenidos: ['INF', 'CN'], espacio: 'Integrado', comprension: 'Inferencial',
          habilidad: 'Infiere consecuencias de las interacciones entre seres vivos.',
          criterio: 'Correcta: formarían menos frutos y semillas.',
          opciones: [
            { id: 'a', texto: 'Tendrían muchas más flores.' },
            { id: 'b', texto: 'No les pasaría nada.' },
            { id: 'c', texto: 'Se convertirían en cactus.' },
            { id: 'd', texto: 'Formarían menos frutos y semillas.' }
          ],
          solucion: 'd'
        },
        {
          id: 'M6D3', tipo: 'opcion', puntos: 1,
          consigna: 'Una flor está cerrada de noche y se abre a la mañana. ¿A qué estímulo está respondiendo?',
          contenidos: ['INF', 'CN'], espacio: 'Ciencias Naturales', comprension: 'Inferencial',
          habilidad: 'Reconoce la respuesta de una planta a un estímulo del ambiente.',
          criterio: 'Correcta: a la luz del sol.',
          opciones: [
            { id: 'a', texto: 'Al ruido de los pájaros.' },
            { id: 'b', texto: 'A la luz del sol.' },
            { id: 'c', texto: 'Al color de las abejas.' },
            { id: 'd', texto: 'Al olor de la tierra.' }
          ],
          solucion: 'b'
        },
        {
          id: 'M6D4', tipo: 'asignar', vista: 'clasificar', puntos: 2,
          consigna: '¿Cómo se relacionan estos seres vivos? Llevá cada pareja a la piedra del portal que corresponde.',
          ayuda: 'Pensá: ¿se ayudan los dos?, ¿uno come al otro? o ¿uno le da casa al otro?',
          contenidos: ['CN'], espacio: 'Ciencias Naturales', comprension: '',
          habilidad: 'Reconoce interacciones entre seres vivos.',
          criterio: 'Un acierto por pareja (6). Puntaje proporcional.',
          bins: [ { id: 'AY', texto: '🤝 Se ayudan los dos' }, { id: 'AL', texto: '🍽️ Uno se alimenta del otro' }, { id: 'RE', texto: '🏠 Uno le da refugio al otro' } ],
          chips: [
            { id: 'a', texto: '🐝 La abeja y la flor' },
            { id: 'b', texto: '🦉 La lechuza y el ratón' },
            { id: 'c', texto: '🐦 El hornero y la rama del árbol donde hace su nido' },
            { id: 'd', texto: '🐦 El picaflor y la flor' },
            { id: 'e', texto: '🐸 El sapo y el mosquito' },
            { id: 'f', texto: '🐦 El carpintero y el hueco del tronco donde vive' }
          ],
          solucion: { a: 'AY', d: 'AY', b: 'AL', e: 'AL', c: 'RE', f: 'RE' }
        },
        {
          id: 'M6D5', tipo: 'colorear', puntos: 3,
          consigna: 'Como en tu cuaderno: elegí un lápiz y pintá los SUSTANTIVOS de azul, los ADJETIVOS de verde y los VERBOS de rojo.',
          ayuda: 'Primero tocá un lápiz y después las palabras. "Las" no se pinta. Para borrar, tocá la goma.',
          contenidos: ['CLA', 'CN'], espacio: 'Integrado', comprension: '',
          habilidad: 'Identifica categorías gramaticales dentro de un texto.',
          criterio: '5 palabras a pintar. Puntaje = (bien pintadas − palabras pintadas que no correspondían) / 5, mínimo 0.',
          categorias: [ { id: 'S', texto: 'Sustantivo', color: 'azul' }, { id: 'A', texto: 'Adjetivo', color: 'verde' }, { id: 'V', texto: 'Verbo', color: 'rojo' } ],
          texto: 'Las abejas pequeñas visitan flores amarillas.',
          solucion: { 1: 'S', 2: 'A', 3: 'V', 4: 'S', 5: 'A' }
        },
        {
          id: 'M6D6', tipo: 'abierta', puntos: 2, minCaracteres: 25,
          consigna: 'Lumi quiere poner un cartel en el bosque. ¿Te parece importante cuidar a las abejas? ¿Por qué? Usá información de la nota para explicar lo que pensás.',
          ayuda: 'Contá qué pensás y explicalo con algo que leíste en "Socios del bosque".',
          contenidos: ['OPI', 'CN'], espacio: 'Integrado', comprension: 'Opinión',
          habilidad: 'Formula una opinión personal y la justifica con información de un texto informativo.',
          criterio: '2 = postura clara y justificación con información de la nota (polinización, el polen viaja, frutos y semillas, alimento). 1 = postura con justificación general sin datos del texto. 0 = sin postura, sin justificación o respuesta ajena. Se acepta cualquier postura bien justificada.'
        }
      ],
      cierre: { tipo: 'portal', texto: 'Colocá los cinco tesoros en el Gran Portal para abrirlo.' }
    }
  ]
};


/* =====================================================================
   CORRECCIÓN Y NÚCLEO DE EVALUACIÓN (compartido)
   En Apps Script este archivo es  Correccion.gs  y se ejecuta en el
   servidor. En la versión de demostración se ejecuta en el navegador.
   No depende de Google: trabaja sobre objetos JavaScript simples.
   ===================================================================== */

var Correccion = (function () {

  function todosLosDesafios() {
    var lista = [];
    BANCO.misiones.forEach(function (m, mi) {
      m.desafios.forEach(function (d, di) { lista.push({ mision: m, desafio: d, mi: mi, di: di }); });
    });
    return lista;
  }

  function buscar(desafioId) {
    var l = todosLosDesafios();
    for (var i = 0; i < l.length; i++) if (l[i].desafio.id === desafioId) return l[i];
    return null;
  }

  function tokens(texto) {
    return String(texto).split(/\s+/).filter(function (t) { return t.length; });
  }
  function limpiar(t) { return String(t).replace(/^[¿¡"“(]+|[.,;:!?"”)]+$/g, ''); }
  function esCorregibleAuto(d) { return d.tipo !== 'abierta'; }

  /* ---------- Validación de forma (servidor) ---------- */
  function validar(d, r) {
    var ids, k;
    switch (d.tipo) {
      case 'opcion':
        if (typeof r !== 'string') return 'Respuesta inválida';
        if (!d.opciones.some(function (o) { return o.id === r; })) return 'Opción inexistente';
        return null;
      case 'multiple':
        if (!Array.isArray(r) || !r.length) return 'Elegí al menos una opción';
        ids = d.opciones.map(function (o) { return o.id; });
        for (k = 0; k < r.length; k++) if (ids.indexOf(r[k]) < 0) return 'Opción inexistente';
        return null;
      case 'asignar':
      case 'ordenar':
        if (!r || typeof r !== 'object' || Array.isArray(r)) return 'Respuesta inválida';
        var chipIds = d.chips.map(function (c) { return c.id; });
        var binIds = d.tipo === 'ordenar' ? d.rotulos.map(function (x, i) { return String(i); }) : d.bins.map(function (b) { return b.id; });
        for (k = 0; k < chipIds.length; k++) {
          if (!(chipIds[k] in r)) return 'Faltan tarjetas por ubicar';
          if (binIds.indexOf(String(r[chipIds[k]])) < 0) return 'Lugar inexistente';
        }
        return null;
      case 'completar':
        if (!Array.isArray(r) || r.length !== d.oraciones.length) return 'Faltan espacios por completar';
        for (k = 0; k < r.length; k++) if (d.oraciones[k].opciones.indexOf(r[k]) < 0) return 'Faltan espacios por completar';
        return null;
      case 'marcar':
        if (!Array.isArray(r) || !r.length) return 'Tocá al menos una palabra';
        var n = tokens(d.texto).length;
        for (k = 0; k < r.length; k++) if (typeof r[k] !== 'number' || r[k] < 0 || r[k] >= n) return 'Palabra inexistente';
        return null;
      case 'colorear':
        if (!r || typeof r !== 'object' || Array.isArray(r) || !Object.keys(r).length) return 'Pintá al menos una palabra';
        var nt = tokens(d.texto).length, cats = d.categorias.map(function (c) { return c.id; });
        for (k in r) { if (+k < 0 || +k >= nt || cats.indexOf(r[k]) < 0) return 'Respuesta inválida'; }
        return null;
      case 'abierta':
      case 'escritura':
        if (typeof r !== 'string') return 'Respuesta inválida';
        if (r.trim().length < (d.minCaracteres || 1)) return 'Escribí un poco más';
        if (r.length > 1500) return 'La respuesta es demasiado larga';
        return null;
    }
    return 'Tipo de desafío desconocido';
  }

  /* ---------- Corrección ---------- */
  // Devuelve { proporcion (0..1 o null si requiere docente), aciertos, total, sobran }
  function corregir(d, r) {
    var s = d.solucion, ac = 0, tot = 0, sobran = 0, k;
    switch (d.tipo) {
      case 'opcion':
        return { proporcion: r === s ? 1 : 0, aciertos: r === s ? 1 : 0, total: 1, sobran: 0 };
      case 'multiple':
      case 'marcar':
        tot = s.length;
        var uniq = r.filter(function (x, i) { return r.indexOf(x) === i; });
        uniq.forEach(function (x) { if (s.indexOf(x) >= 0) ac++; else sobran++; });
        return { proporcion: Math.max(0, ac - sobran) / tot, aciertos: ac, total: tot, sobran: sobran };
      case 'asignar':
        for (k in s) { tot++; if (r[k] === s[k]) ac++; }
        return { proporcion: ac / tot, aciertos: ac, total: tot, sobran: 0 };
      case 'ordenar':
        tot = s.length;
        s.forEach(function (id, pos) { if (String(r[id]) === String(pos)) ac++; });
        return { proporcion: ac / tot, aciertos: ac, total: tot, sobran: 0 };
      case 'completar':
        tot = s.length;
        s.forEach(function (v, i) { if (r[i] === v) ac++; });
        return { proporcion: ac / tot, aciertos: ac, total: tot, sobran: 0 };
      case 'colorear':
        for (k in s) { tot++; if (r[k] === s[k]) ac++; }
        for (k in r) { if (!(k in s)) sobran++; }
        return { proporcion: Math.max(0, ac - sobran) / tot, aciertos: ac, total: tot, sobran: sobran };
      case 'escritura':
        var t = r.trim(), ok = t.indexOf(s.empieza) === 0 && t.slice(-s.termina.length) === s.termina &&
          tokens(t.replace(/[¿?¡!]/g, ' ')).length >= s.minPalabras;
        return { proporcion: ok ? 1 : 0, aciertos: ok ? 1 : 0, total: 1, sobran: 0 };
      case 'abierta':
        return { proporcion: null, aciertos: 0, total: 0, sobran: 0 };
    }
    return { proporcion: 0, aciertos: 0, total: 1, sobran: 0 };
  }

  function redondear(x) { return Math.round(x * 100) / 100; }

  /* ---------- Textos legibles para la planilla ---------- */
  function txtChip(d, id) { for (var i = 0; i < d.chips.length; i++) if (d.chips[i].id === id) return d.chips[i].texto; return id; }
  function txtBin(d, id) { for (var i = 0; i < d.bins.length; i++) if (d.bins[i].id === id) return d.bins[i].texto; return id; }
  function txtOp(d, id) { for (var i = 0; i < d.opciones.length; i++) if (d.opciones[i].id === id) return d.opciones[i].texto; return id; }

  function textoRespuesta(d, r) {
    if (r === null || r === undefined) return '';
    var tk, out, k;
    switch (d.tipo) {
      case 'opcion': return txtOp(d, r);
      case 'multiple': return r.map(function (x) { return txtOp(d, x); }).join(' | ');
      case 'asignar':
        out = [];
        d.chips.forEach(function (c) { if (c.id in r) out.push(c.texto + ' → ' + txtBin(d, r[c.id])); });
        return out.join(' | ');
      case 'ordenar':
        out = [];
        d.chips.forEach(function (c) { if (c.id in r) out[+r[c.id]] = (+r[c.id] + 1) + '. ' + c.texto; });
        return out.filter(Boolean).join(' | ');
      case 'completar': return r.join(' / ');
      case 'marcar': tk = tokens(d.texto); return r.slice().sort(function (a, b) { return a - b; }).map(function (i) { return limpiar(tk[i]); }).join(', ');
      case 'colorear':
        tk = tokens(d.texto); out = [];
        for (k in r) out.push(limpiar(tk[+k]) + ' = ' + catTexto(d, r[k]));
        return out.join(', ');
      default: return String(r);
    }
  }
  function catTexto(d, id) { for (var i = 0; i < d.categorias.length; i++) if (d.categorias[i].id === id) return d.categorias[i].texto; return id; }

  function textoEsperado(d) {
    var s = d.solucion, out = [], k, tk;
    switch (d.tipo) {
      case 'opcion': return txtOp(d, s);
      case 'multiple': return s.map(function (x) { return txtOp(d, x); }).join(' | ');
      case 'asignar': for (k in s) out.push(txtChip(d, k) + ' → ' + txtBin(d, s[k])); return out.join(' | ');
      case 'ordenar': return s.map(function (id, i) { return (i + 1) + '. ' + txtChip(d, id); }).join(' | ');
      case 'completar': return s.join(' / ');
      case 'marcar': tk = tokens(d.texto); return s.map(function (i) { return limpiar(tk[i]); }).join(', ');
      case 'colorear': tk = tokens(d.texto); for (k in s) out.push(limpiar(tk[+k]) + ' = ' + catTexto(d, s[k])); return out.join(', ');
      case 'escritura': return d.criterio;
      case 'abierta': return 'Revisión docente: ' + d.criterio;
    }
    return '';
  }

  /* ---------- Banco sin soluciones (lo que recibe el alumno) ---------- */
  function bancoPublico() {
    var copia = JSON.parse(JSON.stringify(BANCO));
    copia.misiones.forEach(function (m) {
      m.desafios.forEach(function (d) { delete d.solucion; delete d.criterio; });
    });
    return {
      banco: copia,
      config: {
        TITULO: CONFIG.TITULO, SUBTITULO: CONFIG.SUBTITULO, INTENTOS_MAX: CONFIG.INTENTOS_MAX,
        DIVISIONES: CONFIG.DIVISIONES, NUMERO_LISTA_MAX: CONFIG.NUMERO_LISTA_MAX,
        ICONOS_CLAVE: CONFIG.ICONOS_CLAVE, MENSAJES: CONFIG.MENSAJES
      }
    };
  }

  /* ---------- Estado del alumno ---------- */
  function normalizar(s) {
    return String(s || '').trim().replace(/\s+/g, ' ').slice(0, 60);
  }
  function clave(s) {
    return normalizar(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }
  function idAlumno(division, numero) {
    return String(division).replace(/[^0-9A-Za-z]/g, '') + '-' + ('0' + numero).slice(-2);
  }

  function validarDatos(dat) {
    if (!dat) return 'Faltan datos';
    if (normalizar(dat.nombre).length < 2) return 'Escribí tu nombre';
    if (normalizar(dat.apellido).length < 2) return 'Escribí tu apellido';
    if (CONFIG.DIVISIONES.indexOf(dat.division) < 0) return 'Elegí tu grado y división';
    var n = parseInt(dat.numero, 10);
    if (!(n >= 1 && n <= CONFIG.NUMERO_LISTA_MAX)) return 'Elegí tu número de lista';
    if (!Array.isArray(dat.clave) || dat.clave.length !== 3) return 'Elegí tus 3 dibujos secretos';
    for (var i = 0; i < 3; i++) if (CONFIG.ICONOS_CLAVE.indexOf(dat.clave[i]) < 0) return 'Elegí tus 3 dibujos secretos';
    return null;
  }

  function nuevoEstado(dat, token, ahora, prueba) {
    return {
      v: 1,
      id: (prueba ? 'PRUEBA-' : '') + idAlumno(dat.division, dat.numero),
      token: token,
      nombre: normalizar(dat.nombre), apellido: normalizar(dat.apellido),
      division: dat.division, numero: parseInt(dat.numero, 10),
      clave: dat.clave.join(''),
      prueba: !!prueba,
      inicio: ahora, ultima: ahora, fin: null,
      estado: 'En curso',
      desafios: {},
      cierres: {}
    };
  }

  function mismaPersona(est, dat) {
    return clave(est.nombre) === clave(dat.nombre) && clave(est.apellido) === clave(dat.apellido);
  }

  /* Procesa un intento. Devuelve { publico, cambio, registro } */
  function procesar(est, desafioId, resp, intentoId, tiempoMs, ahora) {
    var ref = buscar(desafioId);
    if (!ref) return { publico: { ok: false, error: 'Desafío inexistente' } };
    var d = ref.desafio;
    var e = est.desafios[desafioId];
    if (e && e.ids && e.ids[intentoId]) {
      var prev = JSON.parse(JSON.stringify(e.ids[intentoId])); prev.repetido = true;
      return { publico: prev, cambio: false };
    }
    if (e && e.cerrado) {
      return { publico: { ok: true, cerrado: true, yaCerrado: true, superado: !!e.superado, intento: e.intentos, pendiente: d.tipo === 'abierta' && e.docente == null }, cambio: false };
    }
    var err = validar(d, resp);
    if (err) return { publico: { ok: false, error: err, validacion: true } };

    if (!e) e = est.desafios[desafioId] = { intentos: 0, ids: {}, tiempoMs: 0, superado: false, cerrado: false, docente: null };
    var c = corregir(d, resp);
    e.intentos++;
    e.tiempoMs += Math.max(0, Math.min(+tiempoMs || 0, 30 * 60 * 1000));
    var correcto = c.proporcion === 1;
    var puntaje = c.proporcion === null ? null : redondear(c.proporcion * d.puntos);
    if (e.intentos === 1) e.primero = { resp: resp, puntaje: puntaje, correcto: correcto, fecha: ahora, aciertos: c.aciertos, total: c.total };
    e.ultimo = { resp: resp, puntaje: puntaje, correcto: correcto, fecha: ahora };
    if (correcto) e.superado = true;
    var max = d.tipo === 'abierta' ? 1 : CONFIG.INTENTOS_MAX;
    if (correcto || e.intentos >= max) e.cerrado = true;
    est.ultima = ahora;

    var tipoMsg = d.tipo === 'abierta' ? 'abierta' : correcto ? 'correcto' : e.cerrado ? 'agotado' : 'reintento';
    var pub = {
      ok: true, correcto: correcto, aciertos: c.aciertos, total: c.total, sobran: c.sobran,
      intento: e.intentos, cerrado: e.cerrado, superado: e.superado,
      pendiente: d.tipo === 'abierta', mensaje: tipoMsg
    };
    e.ids[intentoId] = pub;
    return { publico: pub, cambio: true, ref: ref, entrada: e };
  }

  function registrarCierre(est, misionId, ahora) {
    est.cierres[misionId] = ahora;
    est.ultima = ahora;
    if (misionId === BANCO.misiones[BANCO.misiones.length - 1].id) { est.estado = 'Finalizado'; est.fin = ahora; }
  }

  function puntajeDe(d, e) {
    if (!e || !e.primero) return null;
    if (e.docente != null) return e.docente;          // la valoración docente prevalece
    if (d.tipo === 'abierta') return null;            // pendiente de revisión
    return e.primero.puntaje;
  }

  /* Resumen de logro (para la docente; nunca se muestra al alumno) */
  function resumen(est) {
    var porMision = {}, porCont = {}, tot = { p: 0, m: 0 }, intentos = 0, tiempo = 0, pendientes = 0, hechos = 0, superados = 0, n = 0;
    Object.keys(CONFIG.CONTENIDOS).forEach(function (k) { porCont[k] = { p: 0, m: 0 }; });
    BANCO.misiones.forEach(function (m) {
      porMision[m.id] = { p: 0, m: 0, hechos: 0, total: m.desafios.length };
      m.desafios.forEach(function (d) {
        n++;
        var e = est.desafios[d.id];
        if (!e || !e.primero) return;
        hechos++; porMision[m.id].hechos++;
        intentos += e.intentos; tiempo += e.tiempoMs;
        if (e.superado) superados++;
        var p = puntajeDe(d, e);
        if (p === null) { pendientes++; return; }
        porMision[m.id].p += p; porMision[m.id].m += d.puntos;
        tot.p += p; tot.m += d.puntos;
        d.contenidos.forEach(function (k) { if (porCont[k]) { porCont[k].p += p; porCont[k].m += d.puntos; } });
      });
    });
    function pct(o) { return o.m ? o.p / o.m : null; }
    var res = { mision: {}, contenido: {}, global: pct(tot), puntos: redondear(tot.p), puntosMax: tot.m,
      intentos: intentos, tiempoMs: tiempo, pendientes: pendientes, hechos: hechos, superados: superados, total: n };
    for (var k in porMision) res.mision[k] = pct(porMision[k]);
    for (k in porCont) res.contenido[k] = pct(porCont[k]);
    return res;
  }

  /* Lo único que ve el alumno: avance, sin puntajes */
  function estadoPublico(est) {
    var ds = {};
    for (var k in est.desafios) {
      var e = est.desafios[k];
      ds[k] = { intentos: e.intentos, cerrado: e.cerrado, superado: e.superado };
    }
    return { id: est.id, nombre: est.nombre, apellido: est.apellido, division: est.division, prueba: est.prueba,
      desafios: ds, cierres: est.cierres, estado: est.estado, inicio: est.inicio };
  }

  function puntajeMaximoTotal() {
    var t = 0; todosLosDesafios().forEach(function (x) { t += x.desafio.puntos; }); return t;
  }

  return {
    todos: todosLosDesafios, buscar: buscar, tokens: tokens, limpiar: limpiar, validar: validar, corregir: corregir,
    textoRespuesta: textoRespuesta, textoEsperado: textoEsperado, bancoPublico: bancoPublico,
    validarDatos: validarDatos, nuevoEstado: nuevoEstado, mismaPersona: mismaPersona, idAlumno: idAlumno,
    procesar: procesar, registrarCierre: registrarCierre, resumen: resumen, estadoPublico: estadoPublico,
    puntajeDe: puntajeDe, esCorregibleAuto: esCorregibleAuto, puntajeMaximoTotal: puntajeMaximoTotal, normalizar: normalizar
  };
})();


/* =====================================================================
   SERVICIO WEB Y PLANILLA
   ===================================================================== */

var HOJAS = {
  RESUMEN: 'Resumen general',
  RESP: 'Respuestas individuales',
  ANALISIS: 'Análisis por contenidos',
  REVISION: 'Revisión docente',
  INTENTOS: 'Registro de intentos',
  PRUEBAS: 'Pruebas docentes',
  SESIONES: '_Sesiones'
};
var LIBRO_FORZADO = null;

/* ------------------------------------------------------------------ */
/*  Web App                                                           */
/* ------------------------------------------------------------------ */
/*  La app (index.html, style.css, script.js) vive en GitHub Pages y se
    comunica con este servicio por HTTPS:
      GET  ?accion=banco          → preguntas SIN soluciones
      POST {accion, datos}        → registrar | reanudar | responder | cierre
    El cuerpo del POST se envía como text/plain para evitar el "preflight"
    CORS; Apps Script responde con JSON accesible desde cualquier origen.   */
function doGet(e) {
  var accion = e && e.parameter && e.parameter.accion;
  if (accion === 'banco') return json(Correccion.bancoPublico());
  if (accion === 'ping') return json({ ok: true, hora: new Date().toISOString() });
  return json({ ok: true, servicio: 'Sala de escape · Bosque Encantado', uso: 'GET ?accion=banco · POST {accion, datos}' });
}
function doPost(e) {
  var pedido;
  try { pedido = JSON.parse(e.postData.contents); } catch (err) { return json({ ok: false, error: 'Pedido inválido.' }); }
  var rutas = { registrar: apiRegistrar, reanudar: apiReanudar, responder: apiResponder, cierre: apiCierre };
  var fn = rutas[pedido && pedido.accion];
  if (!fn) return json({ ok: false, error: 'Acción desconocida.' });
  try { return json(fn(pedido.datos || {})); }
  catch (err) { console.error(err && err.stack || err); return json({ ok: false, error: 'Ocurrió un problema en el servidor. Probá otra vez.' }); }
}
function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/* ------------------------------------------------------------------ */
/*  Menú de la planilla                                                */
/* ------------------------------------------------------------------ */
function onOpen() {
  SpreadsheetApp.getUi().createMenu('🌳 Sala de escape')
    .addItem('1) Configurar planilla (una sola vez)', 'configurarPlanilla')
    .addItem('Recalcular todos los resultados', 'recalcularTodo')
    .addItem('Cambiar clave del modo prueba', 'cambiarClaveDocente')
    .addItem('Ver enlace de la aplicación', 'mostrarEnlace')
    .addSeparator()
    .addItem('Borrar pruebas docentes', 'borrarPruebas')
    .addToUi();
}

function libro() {
  if (LIBRO_FORZADO) return LIBRO_FORZADO;
  var id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (id) return SpreadsheetApp.openById(id);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('Primero ejecutá "Configurar planilla" desde el menú de la planilla.');
  return ss;
}
function hoja(nombre) {
  var h = libro().getSheetByName(nombre);
  if (!h) throw new Error('Falta la hoja "' + nombre + '". Ejecutá "Configurar planilla".');
  return h;
}
function claveDocente() {
  return PropertiesService.getScriptProperties().getProperty('CLAVE_DOCENTE') || CONFIG.CLAVE_DOCENTE;
}

/* ------------------------------------------------------------------ */
/*  Encabezados                                                        */
/* ------------------------------------------------------------------ */
function encResumen() {
  var h = ['ID', 'Nombre', 'Apellido', 'División', 'N.º lista', 'Inicio', 'Última actividad', 'Estado', 'Desafíos realizados'];
  BANCO.misiones.forEach(function (m, i) { h.push('Misión ' + (i + 1) + ' · ' + m.eje); });
  Object.keys(CONFIG.CONTENIDOS).forEach(function (k) { h.push(CONFIG.CONTENIDOS[k]); });
  return h.concat(['Logro global (corregido)', 'Puntos obtenidos', 'Puntos corregidos (máx.)', 'Total de intentos', 'Tiempo total (min)', 'Abiertas pendientes de revisión', 'Dibujos secretos', 'Fin']);
}
var ENC_RESP = ['ID', 'Nombre', 'División', 'Misión', 'Desafío', 'Pregunta', 'Contenido', 'Habilidad', 'Espacio curricular', 'Tipo de comprensión',
  'Respuesta (1.er intento)', 'Respuesta (último intento)', 'Respuesta esperada / criterio', 'Correcto en 1.er intento', 'N.º de intentos',
  'Puntaje obtenido', 'Puntaje máximo', 'Tiempo (s)', 'Estado', 'Fecha y hora (1.er intento)', 'Última actualización', 'Clave'];
var ENC_REV = ['ID', 'Nombre', 'División', 'Desafío', 'Consigna', 'Respuesta del alumno', 'Criterio de corrección', 'Puntaje automático', 'Puntaje máximo',
  'PUNTAJE DOCENTE (completar)', 'Comentario docente', 'Estado', 'Fecha', 'Clave'];
var ENC_INT = ['Fecha y hora', 'ID', 'Desafío', 'Intento', 'Respuesta', 'Correcto', 'Aciertos', 'Total', 'Tiempo (s)', 'Id de envío'];
var ENC_PRU = ['Fecha y hora', 'Sesión de prueba', 'Desafío', 'Intento', 'Respuesta', 'Esperada', 'Correcto', 'Puntaje', 'Máximo'];
var ENC_SES = ['ID', 'Token', 'Estado (JSON)', 'Actualizado'];

function col(n) { var s = ''; while (n > 0) { var m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); } return s; }
function idx(enc, nombre) { return enc.indexOf(nombre) + 1; }

/* ------------------------------------------------------------------ */
/*  Configuración inicial                                              */
/* ------------------------------------------------------------------ */
function configurarPlanilla() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var props = PropertiesService.getScriptProperties();
  props.setProperty('SPREADSHEET_ID', ss.getId());
  if (!props.getProperty('CLAVE_DOCENTE')) props.setProperty('CLAVE_DOCENTE', CONFIG.CLAVE_DOCENTE);

  var crear = function (nombre, enc, color) {
    var h = ss.getSheetByName(nombre) || ss.insertSheet(nombre);
    h.getRange(1, 1, 1, enc.length).setValues([enc]).setFontWeight('bold').setBackground(color).setWrap(true).setVerticalAlignment('middle');
    h.setFrozenRows(1);
    return h;
  };
  var r = crear(HOJAS.RESUMEN, encResumen(), '#d9ead3');
  var enc = encResumen();
  var pIni = idx(enc, 'Misión 1 · ' + BANCO.misiones[0].eje), pFin = idx(enc, 'Logro global (corregido)');
  r.getRange(2, pIni, 999, pFin - pIni + 1).setNumberFormat('0%');
  r.setFrozenColumns(3); r.setRowHeight(1, 60);
  var rangoGlobal = r.getRange(2, pFin, 999, 1);
  r.setConditionalFormatRules([
    SpreadsheetApp.newConditionalFormatRule().whenNumberLessThan(CONFIG.UMBRAL_ACOMPANAMIENTO).setBackground('#f4cccc').setRanges([rangoGlobal]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenNumberGreaterThanOrEqualTo(0.8).setBackground('#d9ead3').setRanges([rangoGlobal]).build()
  ]);
  r.getRange(1, idx(enc, 'Dibujos secretos')).setNote('Si un alumno olvida sus dibujos, consultá aquí cuáles eligió.');

  var rs = crear(HOJAS.RESP, ENC_RESP, '#cfe2f3');
  rs.hideColumns(ENC_RESP.length);
  var rv = crear(HOJAS.REVISION, ENC_REV, '#fff2cc');
  rv.getRange(1, idx(ENC_REV, 'PUNTAJE DOCENTE (completar)')).setBackground('#f6b26b')
    .setNote('Escribí el puntaje (0 a puntaje máximo). Al hacerlo se actualizan solos el Resumen y las Respuestas.');
  rv.hideColumns(ENC_REV.length);
  rv.setColumnWidth(idx(ENC_REV, 'Respuesta del alumno'), 380); rv.setColumnWidth(idx(ENC_REV, 'Criterio de corrección'), 380);
  crear(HOJAS.INTENTOS, ENC_INT, '#ead1dc');
  crear(HOJAS.PRUEBAS, ENC_PRU, '#d9d2e9');
  var se = crear(HOJAS.SESIONES, ENC_SES, '#eeeeee');
  se.hideSheet();
  se.protect().setDescription('Datos internos de la sala de escape: no editar').setWarningOnly(true);
  rs.protect().setDescription('Se completa automáticamente').setWarningOnly(true);
  r.protect().setDescription('Se completa automáticamente').setWarningOnly(true);

  armarAnalisis(ss);
  var h1 = ss.getSheetByName('Hoja 1') || ss.getSheetByName('Sheet1');
  if (h1 && h1.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(h1);

  // Disparador instalable para la revisión docente
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === 'alEditar') ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('alEditar').forSpreadsheet(ss).onEdit().create();

  SpreadsheetApp.getUi().alert('¡Listo! La planilla quedó configurada.\n\nAhora implementá el servicio: Implementar › Nueva implementación › Aplicación web (Ejecutar como: Yo · Acceso: Cualquier usuario) y pegá la URL /exec en URL_SERVIDOR, al principio de script.js.\nClave del modo prueba: ' + claveDocente());
}

function armarAnalisis(ss) {
  var a = ss.getSheetByName(HOJAS.ANALISIS) || ss.insertSheet(HOJAS.ANALISIS);
  a.clear();
  var enc = encResumen(), R = "'" + HOJAS.RESUMEN + "'!", P = "'" + HOJAS.RESP + "'!";
  var cDiv = col(idx(enc, 'División')), cGlob = col(idx(enc, 'Logro global (corregido)')), cEst = col(idx(enc, 'Estado'));
  var divs = CONFIG.DIVISIONES;
  var fila = 1;
  var titulo = function (t) { a.getRange(fila, 1).setValue(t).setFontWeight('bold').setFontSize(13).setBackground('#d9ead3'); fila++; };

  titulo('1. Logro promedio por contenido (se actualiza solo)');
  a.getRange(fila, 1, 1, 3 + divs.length).setValues([['Contenido', 'Todos', 'Alumnos con dato'].concat(divs)]).setFontWeight('bold');
  fila++;
  var iniCont = fila;
  Object.keys(CONFIG.CONTENIDOS).forEach(function (k) {
    var c = col(idx(enc, CONFIG.CONTENIDOS[k])), rng = R + c + '2:' + c;
    var f = ['=IFERROR(AVERAGE(' + rng + '),"")', '=COUNT(' + rng + ')'];
    divs.forEach(function (d) { f.push('=IFERROR(AVERAGEIF(' + R + cDiv + '2:' + cDiv + ',"' + d + '",' + rng + '),"")'); });
    a.getRange(fila, 1).setValue(CONFIG.CONTENIDOS[k]);
    a.getRange(fila, 2, 1, f.length).setFormulas([f]);
    fila++;
  });
  a.getRange(iniCont, 2, fila - iniCont, 1).setNumberFormat('0%');
  a.getRange(iniCont, 4, fila - iniCont, divs.length).setNumberFormat('0%');
  var finCont = fila - 1;
  fila++;

  titulo('2. Contenidos ordenados de mayor a menor dificultad');
  a.getRange(fila, 1).setFormula('=IFERROR(SORT(FILTER(A' + iniCont + ':B' + finCont + ',B' + iniCont + ':B' + finCont + '<>""),2,TRUE),"Sin datos aún")');
  a.getRange(fila, 2, Object.keys(CONFIG.CONTENIDOS).length, 1).setNumberFormat('0%');
  fila += Object.keys(CONFIG.CONTENIDOS).length + 1;

  titulo('3. Logro promedio por misión');
  a.getRange(fila, 1, 1, 2 + divs.length).setValues([['Misión', 'Todos'].concat(divs)]).setFontWeight('bold'); fila++;
  var iniM = fila;
  BANCO.misiones.forEach(function (m, i) {
    var c = col(idx(enc, 'Misión ' + (i + 1) + ' · ' + m.eje)), rng = R + c + '2:' + c;
    var f = ['=IFERROR(AVERAGE(' + rng + '),"")'];
    divs.forEach(function (d) { f.push('=IFERROR(AVERAGEIF(' + R + cDiv + '2:' + cDiv + ',"' + d + '",' + rng + '),"")'); });
    a.getRange(fila, 1).setValue((i + 1) + '. ' + m.nombre);
    a.getRange(fila, 2, 1, f.length).setFormulas([f]); fila++;
  });
  a.getRange(iniM, 2, fila - iniM, 1 + divs.length).setNumberFormat('0%');
  fila++;

  titulo('4. Resultados por división');
  a.getRange(fila, 1, 1, 4).setValues([['División', 'Alumnos', 'Finalizados', 'Logro global promedio']]).setFontWeight('bold'); fila++;
  var iniD = fila;
  divs.forEach(function (d) {
    a.getRange(fila, 1, 1, 4).setValues([[d,
      '=COUNTIF(' + R + cDiv + '2:' + cDiv + ',"' + d + '")',
      '=COUNTIFS(' + R + cDiv + '2:' + cDiv + ',"' + d + '",' + R + cEst + '2:' + cEst + ',"Finalizado")',
      '=IFERROR(AVERAGEIF(' + R + cDiv + '2:' + cDiv + ',"' + d + '",' + R + cGlob + '2:' + cGlob + '),"")']]);
    fila++;
  });
  a.getRange(iniD, 4, divs.length, 1).setNumberFormat('0%');
  fila++;

  titulo('5. Estudiantes que necesitan acompañamiento (logro global menor a ' + Math.round(CONFIG.UMBRAL_ACOMPANAMIENTO * 100) + '%)');
  a.getRange(fila, 1, 1, 5).setValues([['ID', 'Nombre', 'Apellido', 'División', 'Logro global']]).setFontWeight('bold'); fila++;
  var cond = R + cGlob + '2:' + cGlob + '<' + CONFIG.UMBRAL_ACOMPANAMIENTO + ',' + R + cGlob + '2:' + cGlob + '<>""';
  a.getRange(fila, 1).setFormula('=IFERROR(FILTER(' + R + 'A2:D,' + cond + '),"Nadie por ahora")');
  a.getRange(fila, 5).setFormula('=IFERROR(FILTER(' + R + cGlob + '2:' + cGlob + ',' + cond + '),"")');
  a.getRange(fila, 5, 45, 1).setNumberFormat('0%');
  fila += 46;

  titulo('6. Preguntas con más errores en el primer intento');
  a.getRange(fila, 1, 1, 3).setValues([['Desafío', 'Pregunta', 'Cantidad de errores']]).setFontWeight('bold'); fila++;
  var cE = col(idx(ENC_RESP, 'Desafío')), cP = col(idx(ENC_RESP, 'Pregunta')), cC = col(idx(ENC_RESP, 'Correcto en 1.er intento'));
  a.getRange(fila, 1).setFormula('=IFERROR(QUERY(' + P + 'A2:' + col(ENC_RESP.length) + ',"select ' + cE + ', ' + cP + ', count(A) where ' + cC + " = 'NO' group by " + cE + ', ' + cP + " order by count(A) desc limit 15 label count(A) ''\",0),\"Sin errores registrados\")");
  a.setColumnWidth(1, 260); a.setColumnWidth(2, 420);
  a.protect().setDescription('Fórmulas automáticas').setWarningOnly(true);
}

function cambiarClaveDocente() {
  var ui = SpreadsheetApp.getUi();
  var r = ui.prompt('Nueva clave del modo prueba', 'Escribí la nueva clave (la actual es: ' + claveDocente() + ')', ui.ButtonSet.OK_CANCEL);
  if (r.getSelectedButton() === ui.Button.OK && r.getResponseText().trim()) {
    PropertiesService.getScriptProperties().setProperty('CLAVE_DOCENTE', r.getResponseText().trim());
    ui.alert('Clave actualizada.');
  }
}
function mostrarEnlace() {
  var url = ScriptApp.getService().getUrl();
  SpreadsheetApp.getUi().alert(url ? 'URL del servicio (pegala en URL_SERVIDOR, al principio de script.js):\n' + url : 'Todavía no implementaste el servicio (Implementar › Nueva implementación › Aplicación web).');
}

/* ------------------------------------------------------------------ */
/*  Sesiones (hoja oculta _Sesiones)                                   */
/* ------------------------------------------------------------------ */
function buscarFila(h, columna, valor) {
  if (h.getLastRow() < 2) return 0;
  var c = h.getRange(2, columna, h.getLastRow() - 1, 1).createTextFinder(String(valor)).matchEntireCell(true).matchCase(true).findNext();
  return c ? c.getRow() : 0;
}
function cargarPorToken(token) {
  if (typeof token !== 'string' || token.length < 16 || token.length > 64) return null;
  var h = hoja(HOJAS.SESIONES), f = buscarFila(h, 2, token);
  if (!f) return null;
  return { fila: f, est: JSON.parse(h.getRange(f, 3).getValue()) };
}
function cargarPorId(id) {
  var h = hoja(HOJAS.SESIONES), f = buscarFila(h, 1, id);
  if (!f) return null;
  return { fila: f, est: JSON.parse(h.getRange(f, 3).getValue()) };
}
function guardarSesion(s) {
  var h = hoja(HOJAS.SESIONES), v = [[s.est.id, s.est.token, JSON.stringify(s.est), new Date()]];
  if (s.fila) h.getRange(s.fila, 1, 1, 4).setValues(v);
  else { h.appendRow(v[0]); s.fila = h.getLastRow(); }
}
function nuevoToken() { return Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '').slice(0, 8); }
function ahoraISO() { return new Date().toISOString(); }
function conCandado(fn) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) return { ok: false, error: 'El bosque está muy ocupado. Esperá un momento y probá de nuevo.', ocupado: true };
  try { var r = fn(); SpreadsheetApp.flush(); return r; }
  catch (err) { console.error(err && err.stack || err); return { ok: false, error: 'Ocurrió un problema al guardar. Probá otra vez.' , tecnico: String(err) }; }
  finally { lock.releaseLock(); }
}

/* ------------------------------------------------------------------ */
/*  API para el juego (google.script.run)                              */
/* ------------------------------------------------------------------ */
function apiRegistrar(dat) {
  return conCandado(function () {
    dat = dat || {};
    if (dat.prueba) {
      if (String(dat.claveDocente || '') !== claveDocente()) return { ok: false, error: 'Clave docente incorrecta.' };
      var tkp = nuevoToken();
      var ep = Correccion.nuevoEstado({ nombre: 'Prueba', apellido: 'Docente', division: CONFIG.DIVISIONES[0], numero: 1, clave: CONFIG.ICONOS_CLAVE.slice(0, 3) }, tkp, ahoraISO(), true);
      ep.id = 'PRUEBA-' + tkp.slice(0, 6);
      guardarSesion({ est: ep });
      return { ok: true, token: tkp, estado: Correccion.estadoPublico(ep), nuevo: true };
    }
    var err = Correccion.validarDatos(dat);
    if (err) return { ok: false, error: err };
    var id = Correccion.idAlumno(dat.division, dat.numero);
    var cache = CacheService.getScriptCache(), kf = 'fallos_' + id, fallos = +(cache.get(kf) || 0);
    var ex = cargarPorId(id);
    if (ex) {
      if (fallos >= 6) return { ok: false, error: 'Hubo muchos intentos con datos distintos. Pedile ayuda a tu seño.' };
      if (!Correccion.mismaPersona(ex.est, dat)) { cache.put(kf, String(fallos + 1), 600); return { ok: false, error: 'Ese número de lista ya lo está usando otro explorador de ' + dat.division + '. Revisá tu número o avisale a tu seño.' }; }
      if (ex.est.clave !== dat.clave.join('')) { cache.put(kf, String(fallos + 1), 600); return { ok: false, error: 'Los dibujos secretos no coinciden. Probá otra vez o pedile ayuda a tu seño.' }; }
      return { ok: true, token: ex.est.token, estado: Correccion.estadoPublico(ex.est), nuevo: false };
    }
    var tk = nuevoToken();
    var est = Correccion.nuevoEstado(dat, tk, ahoraISO(), false);
    var s = { est: est };
    guardarSesion(s);
    escribirResumen(est);
    return { ok: true, token: tk, estado: Correccion.estadoPublico(est), nuevo: true };
  });
}

function apiReanudar(p) {
  try {
    var s = cargarPorToken(p && p.token);
    return s ? { ok: true, estado: Correccion.estadoPublico(s.est) } : { ok: false };
  } catch (e) { return { ok: false }; }
}

function apiResponder(p) {
  p = p || {};
  if (typeof p.intentoId !== 'string' || p.intentoId.length > 40) return { ok: false, error: 'Envío inválido.', validacion: true };
  if (JSON.stringify(p.respuesta || '').length > 4000) return { ok: false, error: 'La respuesta es demasiado larga.', validacion: true };
  return conCandado(function () {
    var s = cargarPorToken(p.token);
    if (!s) return { ok: false, error: 'Tu sesión no existe. Volvé a entrar con tus datos.' };
    var est = s.est, ahora = ahoraISO();
    var r = Correccion.procesar(est, String(p.desafioId), p.respuesta, p.intentoId, p.tiempoMs, ahora);
    if (!r.cambio) return r.publico;
    guardarSesion(s);
    var d = r.ref.desafio, e = r.entrada;
    if (est.prueba) {
      hoja(HOJAS.PRUEBAS).appendRow([new Date(), est.id, d.id, e.intentos, Correccion.textoRespuesta(d, p.respuesta), Correccion.textoEsperado(d), d.tipo === 'abierta' ? 'REVISIÓN' : (r.publico.correcto ? 'SÍ' : 'NO'), e.ultimo.puntaje === null ? 'revisión docente' : e.ultimo.puntaje, d.puntos]);
      var pub = JSON.parse(JSON.stringify(r.publico));
      pub.esperado = Correccion.textoEsperado(d); pub.puntaje = e.primero.puntaje === null ? 'revisión docente' : e.primero.puntaje;
      return pub;
    }
    hoja(HOJAS.INTENTOS).appendRow([new Date(), est.id, d.id, e.intentos, Correccion.textoRespuesta(d, p.respuesta), d.tipo === 'abierta' ? 'REVISIÓN' : (r.publico.correcto ? 'SÍ' : 'NO'), r.publico.aciertos, r.publico.total, Math.round((+p.tiempoMs || 0) / 1000), p.intentoId]);
    escribirRespuesta(est, r.ref);
    if ((d.tipo === 'abierta' || d.tipo === 'escritura') && e.intentos === 1) escribirRevision(est, r.ref);
    escribirResumen(est);
    return r.publico;
  });
}

function apiCierre(p) {
  p = p || {};
  return conCandado(function () {
    var s = cargarPorToken(p.token);
    if (!s) return { ok: false, error: 'Sesión inexistente.' };
    var m = BANCO.misiones.filter(function (x) { return x.id === p.misionId; })[0];
    if (!m) return { ok: false, error: 'Misión inexistente.' };
    var completa = m.desafios.every(function (d) { var e = s.est.desafios[d.id]; return e && e.cerrado; });
    if (!completa) return { ok: false, error: 'La misión todavía no está completa.' };
    if (!s.est.cierres[m.id]) { Correccion.registrarCierre(s.est, m.id, ahoraISO()); guardarSesion(s); if (!s.est.prueba) escribirResumen(s.est); }
    return { ok: true };
  });
}

/* ------------------------------------------------------------------ */
/*  Escritura en la planilla                                           */
/* ------------------------------------------------------------------ */
function fechaLocal(iso) { return iso ? new Date(iso) : ''; }
function vacio(x) { return x === null || x === undefined ? '' : x; }

function filaResumen(est) {
  var r = Correccion.resumen(est);
  var fila = [est.id, est.nombre, est.apellido, est.division, est.numero, fechaLocal(est.inicio), fechaLocal(est.ultima), est.estado, r.hechos + ' de ' + r.total];
  BANCO.misiones.forEach(function (m) { fila.push(vacio(r.mision[m.id])); });
  Object.keys(CONFIG.CONTENIDOS).forEach(function (k) { fila.push(vacio(r.contenido[k])); });
  fila.push(vacio(r.global), r.puntos, r.puntosMax, r.intentos, Math.round(r.tiempoMs / 6000) / 10, r.pendientes, est.clave, fechaLocal(est.fin));
  return fila;
}
function escribirResumen(est) {
  if (est.prueba) return;
  var h = hoja(HOJAS.RESUMEN), f = buscarFila(h, 1, est.id), v = [filaResumen(est)];
  if (f) h.getRange(f, 1, 1, v[0].length).setValues(v); else h.appendRow(v[0]);
}
function filaRespuesta(est, ref) {
  var d = ref.desafio, m = ref.mision, e = est.desafios[d.id], pts = Correccion.puntajeDe(d, e);
  var correcto = d.tipo === 'abierta' ? 'REVISIÓN' : (e.primero.correcto ? 'SÍ' : 'NO');
  var estado = pts === null ? 'Pendiente de revisión docente' : (e.docente != null ? 'Revisado por la docente' : 'Corregido automáticamente');
  return [est.id, est.nombre + ' ' + est.apellido, est.division, m.id + ' · ' + m.nombre, d.id, d.consigna,
    d.contenidos.map(function (k) { return CONFIG.CONTENIDOS[k]; }).join(', '), d.habilidad, d.espacio, d.comprension || '—',
    Correccion.textoRespuesta(d, e.primero.resp), Correccion.textoRespuesta(d, e.ultimo.resp), Correccion.textoEsperado(d) + (d.tipo === 'abierta' ? '' : '  ·  Criterio: ' + d.criterio),
    correcto, e.intentos, pts === null ? '' : pts, d.puntos, Math.round(e.tiempoMs / 1000), estado, fechaLocal(e.primero.fecha), fechaLocal(e.ultimo.fecha), est.id + '|' + d.id];
}
function escribirRespuesta(est, ref) {
  var h = hoja(HOJAS.RESP), clave = est.id + '|' + ref.desafio.id, f = buscarFila(h, ENC_RESP.length, clave), v = [filaRespuesta(est, ref)];
  if (f) h.getRange(f, 1, 1, v[0].length).setValues(v); else h.appendRow(v[0]);
}
function escribirRevision(est, ref) {
  var h = hoja(HOJAS.REVISION), d = ref.desafio, e = est.desafios[d.id], clave = est.id + '|' + d.id;
  if (buscarFila(h, ENC_REV.length, clave)) return;
  h.appendRow([est.id, est.nombre + ' ' + est.apellido, est.division, d.id, d.consigna, e.primero.resp, d.criterio,
    d.tipo === 'abierta' ? '(requiere docente)' : e.primero.puntaje, d.puntos, '', '', d.tipo === 'abierta' ? 'Pendiente' : 'Corregido automáticamente (podés modificar)', new Date(), clave]);
  var f = h.getLastRow();
  h.getRange(f, idx(ENC_REV, 'PUNTAJE DOCENTE (completar)')).setDataValidation(
    SpreadsheetApp.newDataValidation().requireNumberBetween(0, d.puntos).setAllowInvalid(false).setHelpText('Puntaje entre 0 y ' + d.puntos).build());
  h.getRange(f, 1, 1, ENC_REV.length).setWrap(true).setVerticalAlignment('top');
}

/* ------------------------------------------------------------------ */
/*  Revisión docente (disparador instalable al editar)                 */
/* ------------------------------------------------------------------ */
function alEditar(e) {
  if (!e || !e.range) return;
  var h = e.range.getSheet();
  if (h.getName() !== HOJAS.REVISION) return;
  var cP = idx(ENC_REV, 'PUNTAJE DOCENTE (completar)');
  if (e.range.getColumn() > cP || e.range.getLastColumn() < cP || e.range.getRow() < 2) return;
  LIBRO_FORZADO = e.source;
  var lock = LockService.getScriptLock(); lock.waitLock(30000);
  try {
    for (var f = Math.max(2, e.range.getRow()); f <= e.range.getLastRow(); f++) aplicarValoracion(h, f, cP);
    SpreadsheetApp.flush();
  } finally { lock.releaseLock(); LIBRO_FORZADO = null; }
}
function aplicarValoracion(h, f, cP) {
  var clave = String(h.getRange(f, ENC_REV.length).getValue()); if (!clave) return;
  var partes = clave.split('|'), s = cargarPorId(partes[0]); if (!s) return;
  var ref = Correccion.buscar(partes[1]); if (!ref) return;
  var e = s.est.desafios[ref.desafio.id]; if (!e) return;
  var v = h.getRange(f, cP).getValue(), cE = idx(ENC_REV, 'Estado');
  if (v === '' || v === null) { e.docente = null; h.getRange(f, cE).setValue(ref.desafio.tipo === 'abierta' ? 'Pendiente' : 'Corregido automáticamente (podés modificar)'); }
  else {
    var n = Number(v);
    if (isNaN(n) || n < 0 || n > ref.desafio.puntos) { h.getRange(f, cE).setValue('⚠ Puntaje fuera de rango (0 a ' + ref.desafio.puntos + ')'); return; }
    e.docente = n; h.getRange(f, cE).setValue('Revisado');
  }
  guardarSesion(s);
  escribirRespuesta(s.est, ref);
  escribirResumen(s.est);
}

/* ------------------------------------------------------------------ */
/*  Utilidades docentes                                                */
/* ------------------------------------------------------------------ */
function recalcularTodo() {
  var h = hoja(HOJAS.SESIONES); if (h.getLastRow() < 2) return;
  var datos = h.getRange(2, 1, h.getLastRow() - 1, 3).getValues();
  datos.forEach(function (fila) {
    if (!fila[2]) return;
    var est = JSON.parse(fila[2]); if (est.prueba) return;
    escribirResumen(est);
    Correccion.todos().forEach(function (ref) { var e = est.desafios[ref.desafio.id]; if (e && e.primero) escribirRespuesta(est, ref); });
  });
  armarAnalisis(libro());
  try { SpreadsheetApp.getUi().alert('Resultados recalculados.'); } catch (e) { }
}
function borrarPruebas() {
  var p = hoja(HOJAS.PRUEBAS); if (p.getLastRow() > 1) p.deleteRows(2, p.getLastRow() - 1);
  var h = hoja(HOJAS.SESIONES);
  for (var f = h.getLastRow(); f >= 2; f--) if (String(h.getRange(f, 1).getValue()).indexOf('PRUEBA-') === 0) h.deleteRow(f);
  try { SpreadsheetApp.getUi().alert('Pruebas docentes borradas.'); } catch (e) { }
}
