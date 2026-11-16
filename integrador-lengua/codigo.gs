/* =====================================================================
   codigo.gs — Servicio de Google Apps Script que corrige y guarda los
   resultados en Google Sheets. Pegar COMPLETO en un proyecto de Apps
   Script vinculado a la planilla (Extensiones › Apps Script).
   Contiene: 1) CONFIG y BANCO (editables), 2) corrección, 3) servicio web.
   ===================================================================== */

/* =====================================================================
   BANCO DE DESAFÍOS Y CONFIGURACIÓN
   «El misterio de la hamburguesa perdida: misión energía»
   Integrador: Prácticas del Lenguaje (2.º período) + proyecto
   «Del plato a la energía» (cuerpo y alimentación) + Ambiente.
   ---------------------------------------------------------------------
   Es la ÚNICA parte que la docente necesita editar. Vive solo en el
   servidor: al alumno le llega una copia SIN el campo "solucion".
   Cada desafío tiene:
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
  TITULO: 'El misterio de la hamburguesa perdida',
  SUBTITULO: 'Misión energía',
  MARCA: 'Misión energía',
  INTRO: 'En el gran picnic del Bosque Encantado desapareció una hamburguesa. ¿Alguien se la llevó? ¿Desapareció… o se transformó? ¿Te animás a ser detective y ayudar a Lumi a resolver el misterio?',
  DIPLOMA: 'por resolver el misterio de la hamburguesa perdida y descubrir cómo nuestro cuerpo transforma los alimentos en energía, usando todo lo que aprendió en Prácticas del Lenguaje y Ciencias Naturales.',
  // EVALUACIÓN INTEGRAL: un solo intento por consigna y sin mostrar si la respuesta es correcta.
  INTENTOS_MAX: 1,
  MOSTRAR_RESULTADO: false,      // false = el alumno nunca ve aciertos ni errores (solo la docente, en la planilla)
  DURACION_ESTIMADA_MIN: 55,
  DIVISIONES: ['3º A', '3º B'],
  // El integrador se resuelve en una sola clase: pasado este tiempo desde que el
  // alumno empezó, el servidor ya no acepta respuestas y lo marca "Sin terminar".
  HORAS_PARA_TERMINAR: 3,
  UMBRAL_ACOMPANAMIENTO: 0.6,    // por debajo de este logro se sugiere acompañamiento
  // Clave del modo prueba docente (se puede cambiar desde el menú de la planilla).
  CLAVE_DOCENTE: 'energia2026',
  CONTENIDOS: {
    INS: 'Texto instructivo',
    LEY: 'Leyenda',
    ORA: 'Tipos de oraciones',
    VER: 'Verbos y tiempos verbales',
    SUS: 'Clases de palabras, artículos y concordancia',
    NAR: 'Narración: inicio, desarrollo y final',
    LIT: 'Comprensión literal',
    INF: 'Comprensión inferencial',
    OPI: 'Opinión personal',
    NUT: 'Alimentación y nutrientes',
    SIS: 'Sistemas digestivo y respiratorio',
    HAB: 'Hábitos saludables y cuidado del agua',
    PRO: 'Sustantivos propios y comunes'
  },
  MENSAJES: {
    guardado: ['Respuesta guardada. ¡Sigamos investigando!', 'Lumi anotó tu respuesta en su libreta. ¡Vamos a la próxima pista!', 'Listo, quedó guardada. ¡Seguimos!'],
    correcto: ['¡Excelente, detective!', '¡Lo lograste! Encontraste una pista.', '¡Muy bien! El misterio se aclara un poco más.', '¡Genial! Sigamos investigando.'],
    reintento: ['Casi… Mirá otra vez con atención y probá de nuevo.', 'Todavía no. ¡Releé la pista y volvé a intentar!'],
    agotado: ['Lumi guardó tu respuesta en su libreta de detective. ¡Seguimos!', 'Tu respuesta quedó guardada. ¡Vamos a la próxima pista!'],
    abierta: ['¡Gracias por contarme lo que pensás! Tu seño va a leer tu respuesta.'],
    sinConexion: ['Se cortó la conexión, pero Lumi guardó tu respuesta. Se enviará sola cuando vuelva internet.']
  }
};

var BANCO = {
  personajeGuia: { nombre: 'Lumi', descripcion: 'una luciérnaga detective con un farolito en la pancita' },
  prologo: [
    '¡Hola! Soy Lumi. Anoche hicimos un gran picnic en el Bosque Encantado y… ¡desapareció la hamburguesa de Don Ramiro, el búho!',
    'Algunos dicen que alguien se la robó. Otros dicen que se esfumó. Yo creo que hay que investigar: ¿la hamburguesa desapareció o se transformó en otra cosa?',
    'Vamos a recorrer seis estaciones del bosque y juntar cinco pistas. Con ellas vamos a abrir el Laboratorio de la Energía, donde se resuelve el misterio.',
    'Tenemos esta clase para resolverlo, así que trabajá con calma pero sin parar. Si tenés dudas, tocá 🔊 para escuchar o ❓ para pedir ayuda. ¿Vamos?'
  ],
  final: [
    '¡Misterio resuelto! La hamburguesa no desapareció: Don Ramiro se la comió en el picnic, ¡y después se olvidó!',
    'Su sistema digestivo la transformó en nutrientes. La sangre llevó esos nutrientes, junto con el oxígeno que entra por los pulmones, a todo su cuerpo.',
    'Así obtuvo la energía para volar toda la noche. ¡Los alimentos no se pierden: se transforman en energía para vivir, jugar y crecer! Gracias, detective.'
  ],

  misiones: [
    /* =========================== MISIÓN 1 =========================== */
    {
      id: 'M1',
      nombre: 'La cocina del cuerpo',
      eje: 'Texto instructivo y alimentación',
      lugar: 'La cocina del picnic',
      escena: 'cocina',
      personaje: { nombre: 'Doña Coneja', quien: 'la cocinera del picnic', emoji: '🐰' },
      objeto: { emoji: '🍽️', nombre: 'Plato Equilibrado' },
      intro: [
        'Doña Coneja: ¡Qué lío! Para el picnic preparé brochetas de frutas siguiendo una receta, y alguien desordenó mi recetario.',
        'Lumi: Las recetas son textos instructivos. Leela con atención: además de enseñarnos a cocinar, nos da pistas sobre lo que comemos.'
      ],
      lectura: {
        tipo: 'receta',
        titulo: 'Brochetas de frutas con yogur',
        porciones: 'Para 4 personas',
        ingredientes: ['1 banana', '2 mandarinas', '10 frutillas', '1 manzana', '1 pote de yogur natural (200 g)', '1 cucharada de avena'],
        utensilios: ['Tabla y cuchillo sin punta (con ayuda de un adulto)', 'Palitos de brochette', 'Un bol'],
        pasos: [
          '**Lavar** las manos y las frutas.',
          '**Pelar** la banana y las mandarinas.',
          '**Cortar** las frutas en trozos, con ayuda de un adulto.',
          '**Pinchar** los trozos en los palitos, alternando colores.',
          '**Mezclar** el yogur con la avena en el bol.',
          '**Servir** las brochetas con el yogur para mojar.'
        ]
      },
      desafios: [
        {
          id: 'M1D1', tipo: 'asignar', vista: 'zonas', puntos: 2,
          consigna: 'Doña Coneja perdió los carteles de su receta. Llevá cada cartel al número que corresponde.',
          contenidos: ['INS'], espacio: 'Prácticas del Lenguaje', comprension: '',
          habilidad: 'Reconoce las partes de un texto instructivo (receta).',
          criterio: 'Un acierto por cartel ubicado correctamente (5). Puntaje proporcional.',
          bins: [ { id: 'z1', texto: '1' }, { id: 'z2', texto: '2' }, { id: 'z3', texto: '3' }, { id: 'z4', texto: '4' }, { id: 'z5', texto: '5' } ],
          chips: [ { id: 'e', texto: 'Porciones' }, { id: 'a', texto: 'Título' }, { id: 'd', texto: 'Preparación' }, { id: 'b', texto: 'Ingredientes' }, { id: 'c', texto: 'Utensilios' } ],
          solucion: { a: 'z1', e: 'z2', b: 'z3', c: 'z4', d: 'z5' }
        },
        {
          id: 'M1D2', tipo: 'opcion', puntos: 1,
          consigna: '¿Para qué sirve un texto instructivo como esta receta?',
          contenidos: ['INS'], espacio: 'Prácticas del Lenguaje', comprension: '',
          habilidad: 'Reconoce la finalidad del texto instructivo.',
          criterio: 'Correcta: para explicar paso a paso cómo hacer algo.',
          opciones: [
            { id: 'a', texto: 'Para contar una historia inventada sobre frutas.' },
            { id: 'b', texto: 'Para explicar el origen de las frutas.' },
            { id: 'c', texto: 'Para explicar paso a paso cómo hacer algo.' },
            { id: 'd', texto: 'Para expresar una emoción.' }
          ],
          solucion: 'c'
        },
        {
          id: 'M1D3', tipo: 'ordenar', puntos: 2,
          consigna: 'Alguien mezcló los pasos de otra receta: «Ensalada de frutas». Ordenalos del 1 al 4.',
          contenidos: ['INS', 'INF'], espacio: 'Prácticas del Lenguaje', comprension: 'Inferencial',
          habilidad: 'Ordena los pasos de un texto instructivo según una secuencia lógica.',
          criterio: 'Un acierto por tarjeta en su lugar (4). Puntaje proporcional.',
          rotulos: ['1', '2', '3', '4'],
          chips: [
            { id: 'c', texto: 'Cortar las frutas en cubitos.' },
            { id: 'a', texto: 'Lavarse las manos.' },
            { id: 'd', texto: 'Mezclar todo en un bol y servir.' },
            { id: 'b', texto: 'Lavar y pelar las frutas.' }
          ],
          solucion: ['a', 'b', 'c', 'd']
        },
        {
          id: 'M1D4', tipo: 'multiple', vista: 'escena', puntos: 2,
          consigna: 'En la mesa del picnic, tocá TODOS los alimentos que aportan PROTEÍNAS.',
          contenidos: ['NUT'], espacio: 'Ciencias Naturales', comprension: '',
          habilidad: 'Identifica alimentos fuente de proteínas.',
          criterio: '4 alimentos con proteínas (huevo, pescado, pollo, leche). Puntaje = (correctos − incorrectos) / 4, mínimo 0.',
          fondo: 'mesa',
          opciones: [
            { id: 'a', texto: 'pan', dibujo: '🍞', x: 6, y: 18 },
            { id: 'b', texto: 'huevo', dibujo: '🥚', x: 22, y: 56 },
            { id: 'c', texto: 'manzana', dibujo: '🍎', x: 36, y: 14 },
            { id: 'd', texto: 'pescado', dibujo: '🐟', x: 50, y: 52 },
            { id: 'e', texto: 'palta', dibujo: '🥑', x: 64, y: 14 },
            { id: 'f', texto: 'pollo', dibujo: '🍗', x: 76, y: 54 },
            { id: 'g', texto: 'vaso de leche', dibujo: '🥛', x: 88, y: 14 },
            { id: 'h', texto: 'arroz', dibujo: '🍚', x: 6, y: 58 }
          ],
          solucion: ['b', 'd', 'f', 'g']
        },
        {
          id: 'M1D5', tipo: 'asignar', vista: 'clasificar', puntos: 3,
          consigna: 'Ordená la despensa: llevá cada alimento al frasco del nutriente que aporta principalmente.',
          contenidos: ['NUT'], espacio: 'Ciencias Naturales', comprension: '',
          habilidad: 'Clasifica alimentos según el nutriente que aportan principalmente.',
          criterio: 'Un acierto por alimento (8). Puntaje proporcional.',
          bins: [ { id: 'PR', texto: 'Proteínas' }, { id: 'HC', texto: 'Hidratos de carbono' }, { id: 'GR', texto: 'Grasas' }, { id: 'VM', texto: 'Vitaminas y minerales' } ],
          chips: [
            { id: 'a', texto: '🍝 fideos' }, { id: 'b', texto: '🫒 aceite' }, { id: 'c', texto: '🍊 naranja' }, { id: 'd', texto: '🥚 huevo' },
            { id: 'e', texto: '🍞 pan' }, { id: 'f', texto: '🥕 zanahoria' }, { id: 'g', texto: '🥜 maní' }, { id: 'h', texto: '🍲 lentejas' }
          ],
          solucion: { d: 'PR', h: 'PR', a: 'HC', e: 'HC', b: 'GR', g: 'GR', c: 'VM', f: 'VM' }
        },
        {
          id: 'M1D6', tipo: 'opcion', puntos: 1,
          consigna: 'Un chico va a correr una carrera en el recreo. ¿Qué nutrientes le dan principalmente la energía que necesita?',
          contenidos: ['NUT', 'INF'], espacio: 'Integrado', comprension: 'Inferencial',
          habilidad: 'Relaciona los hidratos de carbono con el aporte de energía.',
          criterio: 'Correcta: los hidratos de carbono, como los de la avena, el pan o los fideos.',
          opciones: [
            { id: 'a', texto: 'Los hidratos de carbono, como los de la avena, el pan o los fideos.' },
            { id: 'b', texto: 'El agua con gas.' },
            { id: 'c', texto: 'Las golosinas, porque son dulces.' },
            { id: 'd', texto: 'Ningún alimento da energía.' }
          ],
          solucion: 'a'
        },
        {
          id: 'M1D7', tipo: 'asignar', vista: 'clasificar', puntos: 2,
          consigna: 'Doña Coneja hizo una lista para el picnic. Llevá cada sustantivo a su canasta: PROPIO o COMÚN.',
          contenidos: ['PRO'], espacio: 'Prácticas del Lenguaje', comprension: '',
          habilidad: 'Diferencia sustantivos propios y comunes.',
          criterio: 'Un acierto por sustantivo (8). Puntaje proporcional.',
          bins: [ { id: 'P', texto: 'Sustantivo propio' }, { id: 'C', texto: 'Sustantivo común' } ],
          chips: [
            { id: 'a', texto: 'banana' }, { id: 'b', texto: 'Lumi' }, { id: 'c', texto: 'yogur' }, { id: 'd', texto: 'Mendoza' },
            { id: 'e', texto: 'cuchillo' }, { id: 'f', texto: 'Argentina' }, { id: 'g', texto: 'bol' }, { id: 'h', texto: 'Ramiro' }
          ],
          solucion: { b: 'P', d: 'P', f: 'P', h: 'P', a: 'C', c: 'C', e: 'C', g: 'C' }
        }
      ],
      cierre: {
        tipo: 'codigo', palabra: 'PLATO',
        texto: 'Cada desafío encendió una letra. Escribí la palabra secreta para abrir el recetario.'
      }
    },

    /* =========================== MISIÓN 2 =========================== */
    {
      id: 'M2',
      nombre: 'La leyenda del monte',
      eje: 'Leyenda y tipos de oraciones',
      lugar: 'El claro del Viejo Quebracho',
      escena: 'claro',
      personaje: { nombre: 'Abuela Tortuga', quien: 'la que guarda las historias del bosque', emoji: '🐢' },
      objeto: { emoji: '📜', nombre: 'Pergamino de la Leyenda' },
      intro: [
        'Abuela Tortuga: En el picnic, el oso hormiguero no probó la hamburguesa. ¿Saben por qué? Hay una leyenda que lo explica.',
        'Lumi: ¡Una leyenda! Leela con atención y fijate en cómo hablan los personajes: preguntan, piden, cuentan y se emocionan.'
      ],
      lectura: {
        tipo: 'libro',
        titulo: 'La lengua del oso hormiguero',
        paginas: [
          { ilustracion: 'hormiguero1', parrafos: ['Hace mucho tiempo, cuando los animales del monte recién aprendían a buscar su comida, el oso hormiguero no tenía dientes.', 'Los demás animales masticaban frutos, semillas y raíces, pero él solo podía mirar. —¿Qué voy a comer yo? —se preguntaba triste.'] },
          { ilustracion: 'hormiguero2', parrafos: ['Una noche fue a ver al Viejo Quebracho, el árbol más sabio del monte. —¡Ayudame, por favor! Tengo hambre y no puedo masticar —le pidió.', 'El árbol movió sus ramas y le contestó: —Mañana, cuando salga el sol, buscá el hormiguero más grande. Allí vas a encontrar tu comida.'] },
          { ilustracion: 'hormiguero3', parrafos: ['Al amanecer, el oso hormiguero encontró un montículo de tierra lleno de hormigas. Estiró el hocico, sacó la lengua… ¡y la lengua siguió creciendo! Se hizo larga, finita y pegajosa, y las hormigas quedaron pegadas en ella. —¡Qué rico! —exclamó feliz.', 'Desde entonces, los osos hormigueros tienen una lengua larguísima y comen hormigas y termitas sin necesidad de dientes. Y cada vez que pasan cerca de un quebracho, mueven la cola para darle las gracias.'] }
        ]
      },
      desafios: [
        {
          id: 'M2D1', tipo: 'multiple', puntos: 2,
          consigna: 'Marcá TODAS las características de la leyenda que aparecen en esta historia.',
          contenidos: ['LEY'], espacio: 'Prácticas del Lenguaje', comprension: '',
          habilidad: 'Reconoce las características de la leyenda.',
          criterio: '3 características correctas. Puntaje = (correctas − incorrectas) / 3, mínimo 0.',
          opciones: [
            { id: 'a', texto: 'Explica de forma imaginaria el origen de algo de la naturaleza.' },
            { id: 'b', texto: 'Tiene ingredientes y pasos para seguir.' },
            { id: 'c', texto: 'Ocurre hace mucho tiempo, en un lugar de la naturaleza (el monte).' },
            { id: 'd', texto: 'Da información comprobada por científicos.' },
            { id: 'e', texto: 'Tiene elementos fantásticos, como un árbol que habla.' },
            { id: 'f', texto: 'Empieza con "Había una vez" y ocurre en un castillo.' }
          ],
          solucion: ['a', 'c', 'e']
        },
        {
          id: 'M2D2', tipo: 'asignar', vista: 'clasificar', puntos: 3,
          consigna: 'Clasificá las oraciones de la leyenda según su tipo.',
          contenidos: ['ORA', 'LEY'], espacio: 'Prácticas del Lenguaje', comprension: '',
          habilidad: 'Identifica oraciones enunciativas, interrogativas, exclamativas e imperativas.',
          criterio: 'Un acierto por oración (8). Puntaje proporcional.',
          bins: [ { id: 'EN', texto: 'Enunciativa' }, { id: 'IN', texto: 'Interrogativa' }, { id: 'EX', texto: 'Exclamativa' }, { id: 'IM', texto: 'Imperativa' } ],
          chips: [
            { id: 'a', texto: 'El oso hormiguero no tenía dientes.' },
            { id: 'b', texto: '¿Qué voy a comer yo?' },
            { id: 'c', texto: '¡Qué rico!' },
            { id: 'd', texto: 'Buscá el hormiguero más grande.' },
            { id: 'e', texto: '¿Dónde está el hormiguero?' },
            { id: 'f', texto: 'No te pongas triste.' },
            { id: 'g', texto: '¡Qué lengua tan larga!' },
            { id: 'h', texto: 'Las hormigas quedaron pegadas en la lengua.' }
          ],
          solucion: { a: 'EN', h: 'EN', b: 'IN', e: 'IN', c: 'EX', g: 'EX', d: 'IM', f: 'IM' }
        },
        {
          id: 'M2D3', tipo: 'completar', puntos: 2,
          consigna: 'Elegí la oración que corresponde a cada situación.',
          contenidos: ['ORA'], espacio: 'Prácticas del Lenguaje', comprension: 'Inferencial',
          habilidad: 'Selecciona el tipo de oración adecuado según la intención comunicativa.',
          criterio: 'Un acierto por situación (3). Puntaje proporcional.',
          oraciones: [
            { antes: 'El oso hormiguero quiere SABER dónde hay hormigas. Dice:', opciones: ['¿Dónde hay hormigas?', '¡Qué hormigas!', 'Hay hormigas.'], despues: '' },
            { antes: 'El quebracho le da un CONSEJO. Dice:', opciones: ['¿Buscaste el hormiguero?', 'Buscá el hormiguero más grande.', '¡Qué hormiguero!'], despues: '' },
            { antes: 'El oso hormiguero está MUY CONTENTO. Dice:', opciones: ['Comí hormigas.', '¿Comí hormigas?', '¡Qué feliz estoy!'], despues: '' }
          ],
          solucion: ['¿Dónde hay hormigas?', 'Buscá el hormiguero más grande.', '¡Qué feliz estoy!']
        },
        {
          id: 'M2D4', tipo: 'ordenar', puntos: 2,
          consigna: 'Ordená los hechos de la leyenda del 1 al 4.',
          contenidos: ['LEY', 'LIT'], espacio: 'Prácticas del Lenguaje', comprension: 'Literal',
          habilidad: 'Ordena los acontecimientos principales de una narración.',
          criterio: 'Un acierto por tarjeta en su lugar (4). Puntaje proporcional.',
          rotulos: ['1', '2', '3', '4'],
          chips: [
            { id: 'c', texto: 'Encontró un hormiguero y su lengua creció.' },
            { id: 'a', texto: 'El oso hormiguero no tenía dientes y no podía masticar.' },
            { id: 'd', texto: 'Desde entonces, los osos hormigueros comen hormigas.' },
            { id: 'b', texto: 'Le pidió ayuda al Viejo Quebracho.' }
          ],
          solucion: ['a', 'b', 'c', 'd']
        },
        {
          id: 'M2D5', tipo: 'opcion', puntos: 1,
          consigna: '¿Por qué los osos hormigueros mueven la cola cuando pasan cerca de un quebracho?',
          contenidos: ['LEY', 'INF'], espacio: 'Prácticas del Lenguaje', comprension: 'Inferencial',
          habilidad: 'Infiere la intención de una acción de los personajes.',
          criterio: 'Correcta: para agradecerle al quebracho la ayuda que le dio.',
          opciones: [
            { id: 'a', texto: 'Porque tienen frío.' },
            { id: 'b', texto: 'Para agradecerle al quebracho la ayuda que le dio.' },
            { id: 'c', texto: 'Para espantar a las hormigas.' },
            { id: 'd', texto: 'Porque quieren trepar al árbol.' }
          ],
          solucion: 'b'
        },
        {
          id: 'M2D7', tipo: 'colorear', puntos: 2,
          consigna: 'Pintá de VERDE los sustantivos PROPIOS y de AZUL los sustantivos COMUNES.',
          contenidos: ['PRO', 'LEY'], espacio: 'Prácticas del Lenguaje', comprension: '',
          habilidad: 'Identifica sustantivos propios y comunes dentro de una oración.',
          criterio: '6 sustantivos a pintar. Puntaje = (bien pintados − pintados de más) / 6, mínimo 0.',
          categorias: [ { id: 'P', texto: 'Propio', color: 'verde' }, { id: 'C', texto: 'Común', color: 'azul' } ],
          texto: 'Lumi y Tina leyeron una leyenda del Chaco en la biblioteca de Salta.',
          solucion: { 0: 'P', 2: 'P', 5: 'C', 7: 'P', 10: 'C', 12: 'P' }
        },
        {
          id: 'M2D6', tipo: 'abierta', puntos: 2, minCaracteres: 25,
          consigna: 'El oso hormiguero le pidió ayuda al Viejo Quebracho. ¿Te parece importante pedir ayuda cuando algo nos cuesta? ¿Por qué? Usá algo que pasó en la leyenda para explicar lo que pensás.',
          contenidos: ['OPI', 'LEY'], espacio: 'Prácticas del Lenguaje', comprension: 'Opinión',
          habilidad: 'Formula una opinión personal y la justifica con información del texto.',
          criterio: '2 = postura clara y justificación relacionada con hechos de la leyenda (no podía masticar, tenía hambre, el quebracho le aconsejó, encontró su comida). 1 = postura con justificación general o poco relacionada con el texto. 0 = sin postura, sin justificación o respuesta ajena al texto. Se acepta cualquier postura bien justificada.'
        }
      ],
      cierre: {
        tipo: 'tocar', lugar: 'claro',
        texto: '¡Recuperaste la leyenda! Tocá el Viejo Quebracho para que vuelva a brillar.'
      }
    },

    /* =========================== MISIÓN 3 =========================== */
    {
      id: 'M3',
      nombre: 'El viaje del alimento',
      eje: 'Sistema digestivo y verbos',
      lugar: 'El túnel del viaje',
      escena: 'tunel',
      personaje: { nombre: 'Doctora Jirafa', quien: 'la médica del bosque', emoji: '🦒' },
      objeto: { emoji: '🗺️', nombre: 'Mapa del Viaje del Alimento' },
      intro: [
        'Doctora Jirafa: ¡Bienvenidos al túnel del viaje! Acá descubrimos qué le pasa a la comida después de que la tragamos.',
        'Lumi: Si la hamburguesa hizo este viaje, tal vez no desapareció… ¡Leamos la pista!'
      ],
      lectura: {
        tipo: 'nota', figura: 'digestivo',
        titulo: 'El viaje del alimento',
        parrafos: [
          'Cuando comemos, el alimento hace un largo viaje por el **sistema digestivo**. En la **boca**, los dientes lo cortan y lo trituran, y la saliva lo humedece. Al tragar, pasa por la **faringe** y baja por el **esófago**, un tubo que lo lleva hasta el **estómago**. Allí se mezcla con los jugos gástricos y se convierte en una pasta.',
          'Después llega al **intestino delgado**, que es muy largo. Con ayuda del hígado y del páncreas, el alimento se termina de deshacer y los **nutrientes** pasan a la sangre, que los lleva a todo el cuerpo. Lo que no se aprovecha sigue al **intestino grueso**, donde se absorbe el agua, y los restos salen del cuerpo por el **ano**.'
        ],
        epigrafe: 'El sistema digestivo.',
        fuente: 'Fuente: Libreta de la Doctora Jirafa.'
      },
      desafios: [
        {
          id: 'M3D1', tipo: 'ordenar', puntos: 3,
          consigna: 'Armá el recorrido de la hamburguesa por el sistema digestivo: ordená los órganos del 1 al 6.',
          contenidos: ['SIS', 'LIT'], espacio: 'Ciencias Naturales', comprension: 'Literal',
          habilidad: 'Ordena el recorrido del alimento por los órganos del sistema digestivo.',
          criterio: 'Un acierto por órgano en su lugar (6). Puntaje proporcional.',
          rotulos: ['1', '2', '3', '4', '5', '6'],
          chips: [
            { id: 'd', texto: 'Intestino delgado' }, { id: 'a', texto: 'Boca' }, { id: 'f', texto: 'Ano' },
            { id: 'c', texto: 'Estómago' }, { id: 'e', texto: 'Intestino grueso' }, { id: 'b', texto: 'Esófago' }
          ],
          solucion: ['a', 'b', 'c', 'd', 'e', 'f']
        },
        {
          id: 'M3D2', tipo: 'asignar', vista: 'unir', puntos: 2,
          consigna: 'Uní cada órgano con lo que hace.',
          contenidos: ['SIS', 'LIT'], espacio: 'Ciencias Naturales', comprension: 'Literal',
          habilidad: 'Relaciona órganos del sistema digestivo con su función.',
          criterio: 'Un acierto por par (4). Puntaje proporcional.',
          bins: [ { id: 'p1', texto: '👄 Boca' }, { id: 'p2', texto: '🟠 Estómago' }, { id: 'p3', texto: '〰️ Intestino delgado' }, { id: 'p4', texto: '🌀 Intestino grueso' } ],
          chips: [
            { id: 'r', texto: 'Los nutrientes pasan a la sangre.' },
            { id: 'q', texto: 'Mezcla el alimento con jugos gástricos.' },
            { id: 't', texto: 'Absorbe el agua de los restos.' },
            { id: 's', texto: 'Los dientes trituran y la saliva humedece.' }
          ],
          solucion: { s: 'p1', q: 'p2', r: 'p3', t: 'p4' }
        },
        {
          id: 'M3D3', tipo: 'opcion', puntos: 1,
          consigna: 'Ahora pensá en el misterio: ¿por qué podemos decir que la hamburguesa «no desapareció, sino que se transformó»?',
          contenidos: ['SIS', 'NUT', 'INF'], espacio: 'Ciencias Naturales', comprension: 'Inferencial',
          habilidad: 'Comprende que la digestión transforma los alimentos en nutrientes que el cuerpo aprovecha.',
          criterio: 'Correcta: porque el cuerpo la deshizo y aprovechó sus nutrientes.',
          opciones: [
            { id: 'a', texto: 'Porque se quedó guardada entera en el estómago.' },
            { id: 'b', texto: 'Porque el cuerpo la deshizo y aprovechó sus nutrientes.' },
            { id: 'c', texto: 'Porque se convirtió en una piedra.' },
            { id: 'd', texto: 'Porque salió por la nariz.' }
          ],
          solucion: 'b'
        },
        {
          id: 'M3D4', tipo: 'asignar', vista: 'clasificar', puntos: 2,
          consigna: 'Estos verbos están en infinitivo. Llevá cada uno al frasco de su terminación: -AR, -ER o -IR.',
          contenidos: ['VER'], espacio: 'Prácticas del Lenguaje', comprension: '',
          habilidad: 'Clasifica verbos en infinitivo según su terminación (-ar, -er, -ir).',
          criterio: 'Un acierto por verbo (8). Puntaje proporcional.',
          bins: [ { id: 'AR', texto: '-AR' }, { id: 'ER', texto: '-ER' }, { id: 'IR', texto: '-IR' } ],
          chips: [
            { id: 'a', texto: 'masticar' }, { id: 'b', texto: 'comer' }, { id: 'c', texto: 'digerir' }, { id: 'd', texto: 'tragar' },
            { id: 'e', texto: 'beber' }, { id: 'f', texto: 'salir' }, { id: 'g', texto: 'mezclar' }, { id: 'h', texto: 'absorber' }
          ],
          solucion: { a: 'AR', d: 'AR', g: 'AR', b: 'ER', e: 'ER', h: 'ER', c: 'IR', f: 'IR' }
        },
        {
          id: 'M3D5', tipo: 'asignar', vista: 'clasificar', puntos: 2,
          consigna: '¿El verbo de cada oración está en INFINITIVO o CONJUGADO?',
          contenidos: ['VER'], espacio: 'Prácticas del Lenguaje', comprension: '',
          habilidad: 'Distingue verbos en infinitivo y verbos conjugados.',
          criterio: 'Un acierto por oración (6). Puntaje proporcional.',
          bins: [ { id: 'INF', texto: 'Infinitivo' }, { id: 'CON', texto: 'Conjugado' } ],
          chips: [
            { id: 'a', texto: 'Masticar bien la comida.' },
            { id: 'b', texto: 'Lumi tragó el agua despacio.' },
            { id: 'c', texto: 'Mezclar los ingredientes.' },
            { id: 'd', texto: 'El estómago mezcla los alimentos.' },
            { id: 'e', texto: 'Beber agua todos los días.' },
            { id: 'f', texto: 'Los chicos bebieron jugo de naranja.' }
          ],
          solucion: { a: 'INF', c: 'INF', e: 'INF', b: 'CON', d: 'CON', f: 'CON' }
        },
        {
          id: 'M3D6', tipo: 'asignar', vista: 'reloj', puntos: 2,
          consigna: 'Llevá cada oración al reloj: ¿la acción ocurrió en el PASADO, ocurre en el PRESENTE u ocurrirá en el FUTURO?',
          contenidos: ['VER'], espacio: 'Prácticas del Lenguaje', comprension: '',
          habilidad: 'Reconoce los tiempos verbales pasado, presente y futuro.',
          criterio: 'Un acierto por oración (6). Puntaje proporcional.',
          bins: [ { id: 'PA', texto: '⏪ Pasado' }, { id: 'PR', texto: '⏺️ Presente' }, { id: 'FU', texto: '⏩ Futuro' } ],
          chips: [
            { id: 'a', texto: 'Ayer Don Ramiro comió una hamburguesa.' },
            { id: 'b', texto: 'Mañana desayunaré frutas con yogur.' },
            { id: 'c', texto: 'Ahora el estómago mezcla el almuerzo.' },
            { id: 'd', texto: 'El sábado cocinaremos una ensalada.' },
            { id: 'e', texto: 'Anoche bebimos mucha agua.' },
            { id: 'f', texto: 'Hoy el intestino absorbe los nutrientes.' }
          ],
          solucion: { a: 'PA', e: 'PA', c: 'PR', f: 'PR', b: 'FU', d: 'FU' }
        },
        {
          id: 'M3D7', tipo: 'asignar', vista: 'unir', puntos: 2,
          consigna: 'Uní cada sustantivo COMÚN con un sustantivo PROPIO que nombre a uno de ellos.',
          contenidos: ['PRO'], espacio: 'Prácticas del Lenguaje', comprension: '',
          habilidad: 'Relaciona sustantivos comunes con sustantivos propios.',
          criterio: 'Un acierto por par (4). Puntaje proporcional.',
          bins: [ { id: 'p1', texto: 'río' }, { id: 'p2', texto: 'ciudad' }, { id: 'p3', texto: 'doctora' }, { id: 'p4', texto: 'país' } ],
          chips: [ { id: 'r', texto: 'Rosario' }, { id: 't', texto: 'Argentina' }, { id: 'q', texto: 'Paraná' }, { id: 's', texto: 'Jirafa' } ],
          solucion: { q: 'p1', r: 'p2', s: 'p3', t: 'p4' }
        }
      ],
      cierre: {
        tipo: 'tocar', lugar: 'tunel',
        texto: '¡Completaste el viaje! Tocá el túnel para iluminar el recorrido del alimento.'
      }
    },

    /* =========================== MISIÓN 4 =========================== */
    {
      id: 'M4',
      nombre: 'La fábrica del aire',
      eje: 'Sistema respiratorio, sustantivos y adjetivos',
      lugar: 'La fábrica de Tina',
      escena: 'laboratorio',
      personaje: { nombre: 'Tina', quien: 'la hormiga inventora', emoji: '🐜' },
      objeto: { emoji: '💨', nombre: 'Soplo de Aire Puro' },
      intro: [
        'Tina: ¡Hola! En mi fábrica estudiamos el aire. Sin aire, la comida no alcanza para darnos energía.',
        'Lumi: ¿Cómo? ¿La energía necesita aire y alimentos? ¡Leamos la pista de Tina!'
      ],
      lectura: {
        tipo: 'nota', figura: 'respiratorio',
        titulo: 'La fábrica del aire',
        parrafos: [
          'El aire entra por la **nariz**, que lo calienta, lo humedece y lo limpia. Después pasa por la **faringe** y la **laringe**, donde están las cuerdas vocales que nos permiten hablar. Luego baja por la **tráquea**, que se divide en dos **bronquios**, uno para cada **pulmón**.',
          'Dentro de los pulmones hay millones de bolsitas llamadas **alvéolos**. Allí el oxígeno del aire pasa a la sangre, y el dióxido de carbono sale de la sangre para que lo eliminemos al exhalar.',
          'La sangre lleva el oxígeno y los nutrientes de los alimentos a todas las partes del cuerpo. Con los dos juntos, el cuerpo obtiene la **energía** que necesita para jugar, aprender y crecer.'
        ],
        epigrafe: 'El sistema respiratorio.',
        fuente: 'Fuente: Cuaderno de inventos de Tina.'
      },
      desafios: [
        {
          id: 'M4D1', tipo: 'colorear', puntos: 2,
          consigna: 'Pintá de ROJO los órganos de la DIGESTIÓN y de VERDE los de la RESPIRACIÓN.',
          contenidos: ['SIS'], espacio: 'Ciencias Naturales', comprension: '',
          habilidad: 'Distingue órganos del sistema digestivo y del sistema respiratorio.',
          criterio: '8 órganos a pintar. Puntaje = (bien pintados − pintados de más) / 8, mínimo 0.',
          categorias: [ { id: 'D', texto: 'Digestión', color: 'rojo' }, { id: 'R', texto: 'Respiración', color: 'verde' } ],
          texto: 'estómago pulmones esófago tráquea nariz intestino bronquios hígado',
          solucion: { 0: 'D', 1: 'R', 2: 'D', 3: 'R', 4: 'R', 5: 'D', 6: 'R', 7: 'D' }
        },
        {
          id: 'M4D2', tipo: 'ordenar', puntos: 2,
          consigna: 'Ordená el camino que hace el aire cuando respiramos.',
          contenidos: ['SIS', 'LIT'], espacio: 'Ciencias Naturales', comprension: 'Literal',
          habilidad: 'Ordena el recorrido del aire por el sistema respiratorio.',
          criterio: 'Un acierto por órgano en su lugar (5). Puntaje proporcional.',
          rotulos: ['1', '2', '3', '4', '5'],
          chips: [
            { id: 'c', texto: 'Tráquea' }, { id: 'e', texto: 'Pulmones (alvéolos)' }, { id: 'a', texto: 'Nariz' },
            { id: 'd', texto: 'Bronquios' }, { id: 'b', texto: 'Faringe y laringe' }
          ],
          solucion: ['a', 'b', 'c', 'd', 'e']
        },
        {
          id: 'M4D3', tipo: 'opcion', puntos: 1,
          consigna: 'Según la nota, ¿qué pasa en los alvéolos?',
          contenidos: ['SIS', 'LIT'], espacio: 'Ciencias Naturales', comprension: 'Literal',
          habilidad: 'Recupera información explícita sobre el intercambio de gases.',
          criterio: 'Correcta: el oxígeno pasa a la sangre y sale el dióxido de carbono.',
          opciones: [
            { id: 'a', texto: 'Se mastican los alimentos.' },
            { id: 'b', texto: 'El oxígeno pasa a la sangre y sale el dióxido de carbono.' },
            { id: 'c', texto: 'Se fabrican las cuerdas vocales.' },
            { id: 'd', texto: 'Se guarda la comida para después.' }
          ],
          solucion: 'b'
        },
        {
          id: 'M4D4', tipo: 'opcion', puntos: 1,
          consigna: 'Para que nuestro cuerpo obtenga energía, ¿qué tiene que llevar la sangre a todas sus partes?',
          contenidos: ['SIS', 'NUT', 'INF'], espacio: 'Ciencias Naturales', comprension: 'Inferencial',
          habilidad: 'Relaciona la nutrición y la respiración con la obtención de energía.',
          criterio: 'Correcta: el oxígeno del aire y los nutrientes de los alimentos.',
          opciones: [
            { id: 'a', texto: 'Solo el agua que tomamos.' },
            { id: 'b', texto: 'Solo los alimentos enteros, sin digerir.' },
            { id: 'c', texto: 'El oxígeno del aire y los nutrientes de los alimentos.' },
            { id: 'd', texto: 'El dióxido de carbono que exhalamos.' }
          ],
          solucion: 'c'
        },
        {
          id: 'M4D5', tipo: 'completar', puntos: 2,
          consigna: 'Elegí el artículo que corresponde a cada sustantivo (masculino o femenino, uno o varios).',
          contenidos: ['SUS'], espacio: 'Prácticas del Lenguaje', comprension: '',
          habilidad: 'Concuerda el artículo con el género y el número del sustantivo.',
          criterio: 'Un acierto por espacio (4). Puntaje proporcional.',
          oraciones: [
            { antes: '', opciones: ['El', 'La', 'Los', 'Las'], despues: 'pulmones' },
            { antes: '', opciones: ['El', 'La', 'Los', 'Las'], despues: 'tráquea' },
            { antes: '', opciones: ['El', 'La', 'Los', 'Las'], despues: 'alimentos' },
            { antes: '', opciones: ['El', 'La', 'Los', 'Las'], despues: 'bolsitas de aire' }
          ],
          solucion: ['Los', 'La', 'Los', 'Las']
        },
        {
          id: 'M4D6', tipo: 'completar', puntos: 2,
          consigna: 'Corregí los carteles de la fábrica: elegí el adjetivo que concuerda con el sustantivo.',
          contenidos: ['SUS'], espacio: 'Prácticas del Lenguaje', comprension: '',
          habilidad: 'Reconoce la concordancia de género y número entre sustantivo y adjetivo.',
          criterio: 'Un acierto por espacio (4). Puntaje proporcional.',
          oraciones: [
            { antes: 'Los _pulmones_', opciones: ['sano', 'sana', 'sanos', 'sanas'], despues: 'respiran aire puro.' },
            { antes: 'La _sangre_', opciones: ['rojo', 'roja', 'rojos', 'rojas'], despues: 'lleva oxígeno.' },
            { antes: 'Las _bolsitas_', opciones: ['pequeño', 'pequeña', 'pequeños', 'pequeñas'], despues: 'se llaman alvéolos.' },
            { antes: 'El _aire_', opciones: ['fresco', 'fresca', 'frescos', 'frescas'], despues: 'entra por la nariz.' }
          ],
          solucion: ['sanos', 'roja', 'pequeñas', 'fresco']
        },
        {
          id: 'M4D7', tipo: 'marcar', puntos: 2,
          consigna: 'Tocá todos los sustantivos COMUNES de esta oración.',
          contenidos: ['PRO', 'SIS'], espacio: 'Integrado', comprension: '',
          habilidad: 'Identifica sustantivos comunes dentro de una oración.',
          criterio: '3 sustantivos comunes. Puntaje = (correctos − incorrectos) / 3, mínimo 0.',
          texto: 'En Rosario, Tina dibujó la nariz, la tráquea y los pulmones.',
          solucion: [5, 7, 10]
        }
      ],
      cierre: {
        tipo: 'tocar', lugar: 'laboratorio',
        texto: '¡La fábrica funciona! Tocala para encenderla y recibir el Soplo de Aire Puro.'
      }
    },

    /* =========================== MISIÓN 5 =========================== */
    {
      id: 'M5',
      nombre: 'Detectives saludables',
      eje: 'Narración, hábitos saludables y cuidado del agua',
      lugar: 'La oficina de los detectives',
      escena: 'archivo',
      personaje: { nombre: 'Inspectora Mapache', quien: 'la detective del bosque', emoji: '🦝' },
      objeto: { emoji: '🧼', nombre: 'Jabón Detective' },
      intro: [
        'Inspectora Mapache: En mi oficina guardo casos sobre la salud. Este es el caso de Teo, un chico que un día se sintió mal después del recreo.',
        'Lumi: Para cuidar la energía, también hay que cuidar el cuerpo. ¡Leamos el caso!'
      ],
      lectura: {
        tipo: 'libro',
        titulo: 'El recreo de Teo',
        paginas: [
          { ilustracion: 'recreo1', parrafos: ['Teo estaba feliz: era el primer día de sol después de una semana de lluvia.', 'Cuando sonó el timbre del recreo, salió corriendo al patio con su pelota.'] },
          { ilustracion: 'recreo2', parrafos: ['Jugó a la pelota, se tiró en el pasto y hasta levantó un bichito bolita con las manos. Después se secó las manos en el pantalón, se frotó los ojos y se comió un alfajor sin lavarse las manos.', 'A la noche le picaban los ojos y le dolía la panza.'] },
          { ilustracion: 'recreo3', parrafos: ['Al día siguiente, la doctora le explicó: —Las manos pueden llevar gérmenes aunque no se vean sucias. Hay que lavarlas con agua y jabón antes de comer y después de jugar.', 'Desde ese día, Teo juega igual de feliz… ¡pero antes de la merienda se lava las manos!'] }
        ]
      },
      desafios: [
        {
          id: 'M5D1', tipo: 'asignar', vista: 'clasificar', puntos: 2,
          consigna: '¿En qué parte del cuento ocurre cada hecho? Llevalo al INICIO, al DESARROLLO o al FINAL.',
          contenidos: ['NAR', 'LIT'], espacio: 'Prácticas del Lenguaje', comprension: 'Literal',
          habilidad: 'Reconoce el inicio, el desarrollo y el final de una narración.',
          criterio: 'Un acierto por hecho (6). Puntaje proporcional.',
          bins: [ { id: 'I', texto: 'Inicio' }, { id: 'D', texto: 'Desarrollo' }, { id: 'F', texto: 'Final' } ],
          chips: [
            { id: 'a', texto: 'Era el primer día de sol después de una semana de lluvia.' },
            { id: 'b', texto: 'Se frotó los ojos y comió sin lavarse las manos.' },
            { id: 'c', texto: 'La doctora le explicó por qué lavarse las manos.' },
            { id: 'd', texto: 'Teo salió corriendo al patio con su pelota.' },
            { id: 'e', texto: 'A la noche le dolía la panza.' },
            { id: 'f', texto: 'Ahora Teo se lava las manos antes de la merienda.' }
          ],
          solucion: { a: 'I', d: 'I', b: 'D', e: 'D', c: 'F', f: 'F' }
        },
        {
          id: 'M5D2', tipo: 'opcion', puntos: 1,
          consigna: '¿Cuál es el problema (conflicto) de la historia?',
          contenidos: ['NAR', 'HAB', 'INF'], espacio: 'Integrado', comprension: 'Inferencial',
          habilidad: 'Identifica el conflicto de una narración y su relación con los hábitos de higiene.',
          criterio: 'Correcta: Teo se sintió mal por no lavarse las manos después de jugar.',
          opciones: [
            { id: 'a', texto: 'Teo perdió su pelota en el patio.' },
            { id: 'b', texto: 'Llovió toda la semana.' },
            { id: 'c', texto: 'Teo se sintió mal por no lavarse las manos después de jugar.' },
            { id: 'd', texto: 'El alfajor estaba vencido.' }
          ],
          solucion: 'c'
        },
        {
          id: 'M5D3', tipo: 'multiple', puntos: 2,
          consigna: 'Marcá TODOS los hábitos que nos ayudan a prevenir enfermedades.',
          contenidos: ['HAB'], espacio: 'Ciencias Naturales', comprension: '',
          habilidad: 'Reconoce hábitos de higiene que previenen enfermedades.',
          criterio: '4 hábitos saludables. Puntaje = (correctos − incorrectos) / 4, mínimo 0.',
          opciones: [
            { id: 'a', texto: 'Lavarse las manos con agua y jabón antes de comer.' },
            { id: 'b', texto: 'Frotarse los ojos con las manos sucias.' },
            { id: 'c', texto: 'Cepillarse los dientes después de comer.' },
            { id: 'd', texto: 'Meter objetos en los oídos para limpiarlos.' },
            { id: 'e', texto: 'Bañarse y cambiarse la ropa interior todos los días.' },
            { id: 'f', texto: 'Secarse las manos en la ropa.' },
            { id: 'g', texto: 'Cortar y limpiar las uñas.' }
          ],
          solucion: ['a', 'c', 'e', 'g']
        },
        {
          id: 'M5D4', tipo: 'asignar', vista: 'clasificar', puntos: 2,
          consigna: '¿Cada acción cuida el agua o la desperdicia?',
          contenidos: ['HAB'], espacio: 'Ciencias Naturales', comprension: '',
          habilidad: 'Reconoce acciones que cuidan o desperdician el agua.',
          criterio: 'Un acierto por acción (6). Puntaje proporcional.',
          bins: [ { id: 'SI', texto: '👍 Cuida el agua' }, { id: 'NO', texto: '👎 La desperdicia' } ],
          chips: [
            { id: 'a', texto: 'Cerrar la canilla mientras me cepillo los dientes.' },
            { id: 'b', texto: 'Lavar el auto con la manguera abierta.' },
            { id: 'c', texto: 'Bañarme en poco tiempo.' },
            { id: 'd', texto: 'Jugar con el agua de la canilla.' },
            { id: 'e', texto: 'Avisar si una canilla pierde agua.' },
            { id: 'f', texto: 'Lavar los platos con la canilla abierta todo el tiempo.' }
          ],
          solucion: { a: 'SI', c: 'SI', e: 'SI', b: 'NO', d: 'NO', f: 'NO' }
        },
        {
          id: 'M5D5', tipo: 'opcion', puntos: 1,
          consigna: 'La Inspectora Mapache encontró esta etiqueta en la mochila de Teo. ¿Hasta qué fecha se pueden comer estas galletitas?',
          contenidos: ['NUT', 'LIT'], espacio: 'Integrado', comprension: 'Literal',
          habilidad: 'Localiza la fecha de vencimiento en la etiqueta de un alimento.',
          criterio: 'Correcta: hasta el 15/04/2027 (fecha de vencimiento).',
          tarjeta: { titulo: 'Galletitas de avena', filas: [['Peso neto', '200 g'], ['Elaborado', '15/10/2026'], ['Vencimiento', '15/04/2027'], ['Sodio', '95 mg por porción'], ['Porción', '3 galletitas (30 g)']] },
          opciones: [
            { id: 'a', texto: 'Hasta el 15/10/2026.' },
            { id: 'b', texto: 'Hasta el 15/04/2027.' },
            { id: 'c', texto: 'Se pueden comer siempre.' },
            { id: 'd', texto: 'Hasta que se terminen los 200 g.' }
          ],
          solucion: 'b'
        },
        {
          id: 'M5D6', tipo: 'opcion', puntos: 1,
          consigna: '¿Por qué tenemos que tomar agua todos los días, sobre todo cuando hace calor o hacemos actividad física?',
          contenidos: ['NUT', 'HAB', 'INF'], espacio: 'Ciencias Naturales', comprension: 'Inferencial',
          habilidad: 'Comprende la importancia del agua como nutriente.',
          criterio: 'Correcta: porque el cuerpo pierde agua (por ejemplo, al transpirar) y necesita reponerla.',
          opciones: [
            { id: 'a', texto: 'Porque el agua tiene mucho azúcar.' },
            { id: 'b', texto: 'Porque el cuerpo pierde agua, por ejemplo al transpirar, y necesita reponerla.' },
            { id: 'c', texto: 'Porque el agua reemplaza a todos los alimentos.' },
            { id: 'd', texto: 'No hace falta tomar agua si comemos frutas.' }
          ],
          solucion: 'b'
        },
        {
          id: 'M5D7', tipo: 'asignar', vista: 'clasificar', puntos: 3,
          consigna: 'Clasificá estas palabras del caso de Teo: ¿es un sustantivo PROPIO, un sustantivo COMÚN o NO es un sustantivo?',
          contenidos: ['PRO', 'SUS'], espacio: 'Prácticas del Lenguaje', comprension: '',
          habilidad: 'Diferencia sustantivos propios, comunes y otras clases de palabras.',
          criterio: 'Un acierto por palabra (8). Puntaje proporcional.',
          bins: [ { id: 'P', texto: 'Sustantivo propio' }, { id: 'C', texto: 'Sustantivo común' }, { id: 'N', texto: 'No es sustantivo' } ],
          chips: [
            { id: 'a', texto: 'Teo' }, { id: 'b', texto: 'patio' }, { id: 'c', texto: 'jugó' }, { id: 'd', texto: 'Buenos Aires' },
            { id: 'e', texto: 'jabón' }, { id: 'f', texto: 'feliz' }, { id: 'g', texto: 'doctora' }, { id: 'h', texto: 'corrió' }
          ],
          solucion: { a: 'P', d: 'P', b: 'C', e: 'C', g: 'C', c: 'N', f: 'N', h: 'N' }
        }
      ],
      cierre: {
        tipo: 'brotar', etapas: ['🦠', '🧼', '💦', '✨'],
        texto: '¡Caso resuelto! Ayudá a Teo a lavarse las manos: tocá varias veces el jabón.'
      }
    },

    /* =========================== MISIÓN 6 =========================== */
    {
      id: 'M6',
      nombre: 'El Laboratorio de la Energía',
      eje: 'Integración final: alimentación, energía y clases de palabras',
      lugar: 'El Laboratorio de la Energía',
      escena: 'portal',
      personaje: { nombre: 'Lumi', quien: 'tu guía', emoji: '✨' },
      objeto: { emoji: '⚡', nombre: 'Energía' },
      intro: [
        'Lumi: ¡Llegamos al Laboratorio de la Energía! En la puerta hay una nota sobre el desayuno.',
        'Lumi: Para abrir el laboratorio y resolver el misterio, tenemos que usar todo lo que aprendimos.'
      ],
      lectura: {
        tipo: 'nota', figura: 'desayuno',
        titulo: 'La energía de cada mañana',
        parrafos: [
          'Mientras dormimos, nuestro cuerpo pasa muchas horas sin comer. Por eso, a la mañana necesita alimentos que le den **energía** para empezar el día: caminar hasta la escuela, jugar en el recreo y prestar atención en clase.',
          'Un buen desayuno puede tener leche o yogur, una fruta y pan o cereales. Las chicas y los chicos que desayunan suelen tener más energía durante la mañana.',
          'Al desayuno también lo acompaña un vaso de agua, y antes de comer… ¡manos limpias!'
        ],
        epigrafe: 'Un desayuno con leche, fruta y pan.',
        fuente: 'Fuente: Cartel del Laboratorio de la Energía.'
      },
      desafios: [
        {
          id: 'M6D1', tipo: 'opcion', puntos: 1,
          consigna: 'Según la nota, ¿por qué es importante desayunar?',
          contenidos: ['NUT', 'LIT'], espacio: 'Integrado', comprension: 'Literal',
          habilidad: 'Recupera información explícita de un texto informativo.',
          criterio: 'Correcta: porque después de muchas horas sin comer el cuerpo necesita energía para empezar el día.',
          opciones: [
            { id: 'a', texto: 'Porque después de muchas horas sin comer, el cuerpo necesita energía para empezar el día.' },
            { id: 'b', texto: 'Porque a la mañana no hace falta tomar agua.' },
            { id: 'c', texto: 'Porque el desayuno reemplaza al almuerzo.' },
            { id: 'd', texto: 'Porque así no hay que lavarse las manos.' }
          ],
          solucion: 'a'
        },
        {
          id: 'M6D2', tipo: 'opcion', puntos: 1,
          consigna: 'Un día Lumi no desayunó y a media mañana estaba cansada y sin ganas de jugar. ¿Por qué le pasó eso?',
          contenidos: ['NUT', 'INF'], espacio: 'Integrado', comprension: 'Inferencial',
          habilidad: 'Infiere la relación entre la alimentación y la energía.',
          criterio: 'Correcta: le faltó la energía que dan los alimentos.',
          opciones: [
            { id: 'a', texto: 'Porque durmió demasiado bien.' },
            { id: 'b', texto: 'Porque le faltó la energía que dan los alimentos.' },
            { id: 'c', texto: 'Porque tomó un vaso de agua.' },
            { id: 'd', texto: 'Porque se lavó las manos.' }
          ],
          solucion: 'b'
        },
        {
          id: 'M6D3', tipo: 'multiple', puntos: 2,
          consigna: 'Don Ramiro quiere armar un almuerzo saludable. Marcá TODO lo que pondrías en su plato.',
          contenidos: ['NUT'], espacio: 'Ciencias Naturales', comprension: '',
          habilidad: 'Selecciona alimentos para una comida saludable y equilibrada.',
          criterio: '4 opciones saludables. Puntaje = (correctas − incorrectas) / 4, mínimo 0.',
          opciones: [
            { id: 'a', texto: '🥗 Ensalada de verduras' },
            { id: 'b', texto: '🍬 Golosinas' },
            { id: 'c', texto: '🍗 Pollo al horno' },
            { id: 'd', texto: '🥤 Gaseosa' },
            { id: 'e', texto: '🍚 Arroz' },
            { id: 'f', texto: '💧 Agua' }
          ],
          solucion: ['a', 'c', 'e', 'f']
        },
        {
          id: 'M6D4', tipo: 'colorear', puntos: 3,
          consigna: 'Pintá los SUSTANTIVOS de azul, los ADJETIVOS de verde y los VERBOS de rojo.',
          contenidos: ['SUS', 'VER'], espacio: 'Prácticas del Lenguaje', comprension: '',
          habilidad: 'Identifica sustantivos, adjetivos y verbos dentro de una oración.',
          criterio: '5 palabras a pintar. Puntaje = (bien pintadas − pintadas de más) / 5, mínimo 0.',
          categorias: [ { id: 'S', texto: 'Sustantivo', color: 'azul' }, { id: 'A', texto: 'Adjetivo', color: 'verde' }, { id: 'V', texto: 'Verbo', color: 'rojo' } ],
          texto: 'La niña curiosa prepara frutas frescas.',
          solucion: { 1: 'S', 2: 'A', 3: 'V', 4: 'S', 5: 'A' }
        },
        {
          id: 'M6D5', tipo: 'escritura', puntos: 1, minCaracteres: 10,
          consigna: '¡Ya casi resolvemos el misterio! Escribí una oración EXCLAMATIVA que diría Lumi al descubrir qué pasó con la hamburguesa.',
          contenidos: ['ORA'], espacio: 'Prácticas del Lenguaje', comprension: '',
          habilidad: 'Produce una oración exclamativa con la puntuación correspondiente.',
          criterio: 'Automático: 1 punto si empieza con ¡, termina con ! y tiene al menos 3 palabras. La respuesta queda registrada para que la docente revise mayúscula y sentido.',
          solucion: { empieza: '¡', termina: '!', minPalabras: 3 }
        },
        {
          id: 'M6D7', tipo: 'completar', puntos: 2,
          consigna: 'Elegí la forma bien escrita de cada sustantivo.',
          contenidos: ['PRO'], espacio: 'Prácticas del Lenguaje', comprension: '',
          habilidad: 'Escribe con mayúscula los sustantivos propios y con minúscula los comunes.',
          criterio: 'Un acierto por espacio (4). Puntaje proporcional.',
          oraciones: [
            { antes: 'El búho', opciones: ['ramiro', 'Ramiro'], despues: 'vive en' },
            { antes: '', opciones: ['córdoba', 'Córdoba'], despues: 'con su' },
            { antes: '', opciones: ['Familia', 'familia'], despues: 'y desayuna' },
            { antes: '', opciones: ['Frutas', 'frutas'], despues: 'con yogur.' }
          ],
          solucion: ['Ramiro', 'Córdoba', 'familia', 'frutas']
        },
        {
          id: 'M6D6', tipo: 'abierta', puntos: 2, minCaracteres: 25,
          consigna: '¿Por qué es importante alimentarnos de forma saludable? Explicalo con lo que aprendiste en las misiones (nutrientes, digestión, respiración, energía).',
          contenidos: ['OPI', 'NUT', 'SIS'], espacio: 'Integrado', comprension: 'Opinión',
          habilidad: 'Formula una opinión fundamentada con conocimientos sobre nutrición y energía.',
          criterio: '2 = postura clara y justificación con al menos un contenido trabajado (los nutrientes sirven para crecer o reparar el cuerpo, los hidratos dan energía, la digestión lleva nutrientes a la sangre, oxígeno + nutrientes = energía, hábitos). 1 = postura con justificación general sin contenidos ("para estar sano"). 0 = sin postura, sin justificación o respuesta ajena.'
        }
      ],
      cierre: { tipo: 'portal', texto: 'Colocá las cinco pistas en la puerta del Laboratorio para abrirlo.' }
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
        TITULO: CONFIG.TITULO, SUBTITULO: CONFIG.SUBTITULO, MARCA: CONFIG.MARCA, INTRO: CONFIG.INTRO, DIPLOMA: CONFIG.DIPLOMA, INTENTOS_MAX: CONFIG.INTENTOS_MAX,
        DIVISIONES: CONFIG.DIVISIONES, MENSAJES: CONFIG.MENSAJES
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
  // ID legible y estable: grado + apellido + nombre (sin tildes ni espacios). Ej.: 3A-PEREZ-ANA
  function idAlumno(division, nombre, apellido) {
    var f = function (s) { return clave(s).replace(/[^a-z0-9]+/g, '').toUpperCase(); };
    return String(division).replace(/[^0-9A-Za-z]/g, '') + '-' + f(apellido) + '-' + f(nombre);
  }
  // ¿Se terminó el tiempo de la clase para esta sesión?
  function vencida(est, ahora) {
    if (est.prueba || est.estado === 'Finalizado') return false;
    return Date.parse(ahora) - Date.parse(est.inicio) > (CONFIG.HORAS_PARA_TERMINAR || 3) * 3600 * 1000;
  }
  function estadoActual(est, ahora) {
    if (est.estado === 'Finalizado') return 'Finalizado';
    return vencida(est, ahora) ? 'Sin terminar (se cerró la clase)' : 'En curso';
  }

  function validarDatos(dat) {
    if (!dat) return 'Faltan datos';
    if (normalizar(dat.nombre).length < 2) return 'Escribí tu nombre';
    if (normalizar(dat.apellido).length < 2) return 'Escribí tu apellido';
    if (CONFIG.DIVISIONES.indexOf(dat.division) < 0) return 'Elegí tu grado';
    return null;
  }

  function nuevoEstado(dat, token, ahora, prueba) {
    return {
      v: 1,
      id: (prueba ? 'PRUEBA-' : '') + idAlumno(dat.division, dat.nombre, dat.apellido),
      token: token,
      nombre: normalizar(dat.nombre), apellido: normalizar(dat.apellido),
      division: dat.division,
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
      return { publico: { ok: true, cerrado: true, yaCerrado: true, intento: e.intentos, mensaje: 'guardado' }, cambio: false };
    }
    if (vencida(est, ahora)) return { publico: { ok: false, error: 'El tiempo del integrador ya terminó. Avisale a tu seño.', vencida: true } };
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
    var max = d.tipo === 'abierta' ? 1 : Math.max(1, CONFIG.INTENTOS_MAX || 1);
    if (correcto || e.intentos >= max) e.cerrado = true;
    est.ultima = ahora;

    var tipoMsg = d.tipo === 'abierta' ? 'abierta' : correcto ? 'correcto' : e.cerrado ? 'agotado' : 'reintento';
    var pub = {
      ok: true, correcto: correcto, aciertos: c.aciertos, total: c.total, sobran: c.sobran,
      intento: e.intentos, cerrado: e.cerrado, superado: e.superado,
      pendiente: d.tipo === 'abierta', mensaje: tipoMsg
    };
    // Evaluación integral: al alumno solo se le confirma que la respuesta quedó guardada.
    if (CONFIG.MOSTRAR_RESULTADO === false && !est.prueba) pub = { ok: true, cerrado: e.cerrado, intento: e.intentos, mensaje: 'guardado' };
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
      ds[k] = CONFIG.MOSTRAR_RESULTADO === false && !est.prueba ? { intentos: e.intentos, cerrado: e.cerrado } : { intentos: e.intentos, cerrado: e.cerrado, superado: e.superado };
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
    validarDatos: validarDatos, nuevoEstado: nuevoEstado, vencida: vencida, estadoActual: estadoActual, mismaPersona: mismaPersona, idAlumno: idAlumno,
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
  var h = ['ID', 'Nombre', 'Apellido', 'Grado', 'Inicio', 'Última actividad', 'Estado', 'Desafíos realizados'];
  BANCO.misiones.forEach(function (m, i) { h.push('Misión ' + (i + 1) + ' · ' + m.eje); });
  Object.keys(CONFIG.CONTENIDOS).forEach(function (k) { h.push(CONFIG.CONTENIDOS[k]); });
  return h.concat(['Logro global (corregido)', 'Puntos obtenidos', 'Puntos corregidos (máx.)', 'Total de intentos', 'Tiempo total (min)', 'Abiertas pendientes de revisión', 'Fin']);
}
var ENC_RESP = ['ID', 'Nombre', 'Grado', 'Misión', 'Desafío', 'Pregunta', 'Contenido', 'Habilidad', 'Espacio curricular', 'Tipo de comprensión',
  'Respuesta (1.er intento)', 'Respuesta (último intento)', 'Respuesta esperada / criterio', 'Correcto en 1.er intento', 'N.º de intentos',
  'Puntaje obtenido', 'Puntaje máximo', 'Tiempo (s)', 'Estado', 'Fecha y hora (1.er intento)', 'Última actualización', 'Clave'];
var ENC_REV = ['ID', 'Nombre', 'Grado', 'Desafío', 'Consigna', 'Respuesta del alumno', 'Criterio de corrección', 'Puntaje automático', 'Puntaje máximo',
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
  var cDiv = col(idx(enc, 'Grado')), cGlob = col(idx(enc, 'Logro global (corregido)')), cEst = col(idx(enc, 'Estado'));
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

  titulo('4. Resultados por grado');
  a.getRange(fila, 1, 1, 4).setValues([['Grado', 'Alumnos', 'Finalizados', 'Logro global promedio']]).setFontWeight('bold'); fila++;
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
  a.getRange(fila, 1, 1, 5).setValues([['ID', 'Nombre', 'Apellido', 'Grado', 'Logro global']]).setFontWeight('bold'); fila++;
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
      var ep = Correccion.nuevoEstado({ nombre: 'Prueba', apellido: 'Docente', division: CONFIG.DIVISIONES[0] }, tkp, ahoraISO(), true);
      ep.id = 'PRUEBA-' + tkp.slice(0, 6);
      guardarSesion({ est: ep });
      return { ok: true, token: tkp, estado: Correccion.estadoPublico(ep), nuevo: true };
    }
    var err = Correccion.validarDatos(dat);
    if (err) return { ok: false, error: err };
    var id = Correccion.idAlumno(dat.division, dat.nombre, dat.apellido);
    var ex = cargarPorId(id);
    if (ex) {
      // Mismo nombre, apellido y grado: es el mismo alumno (por ejemplo, se le apagó la Chromebook)
      if (ex.est.estado === 'Finalizado') return { ok: false, error: '¡Ya terminaste el integrador! Si creés que es un error, avisale a tu seño.' };
      if (Correccion.vencida(ex.est, ahoraISO())) return { ok: false, error: 'El tiempo del integrador ya terminó. Avisale a tu seño.' };
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
    if (!s || s.est.estado === 'Finalizado' || Correccion.vencida(s.est, ahoraISO())) return { ok: false };
    return { ok: true, estado: Correccion.estadoPublico(s.est) };
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
  var fila = [est.id, est.nombre, est.apellido, est.division, fechaLocal(est.inicio), fechaLocal(est.ultima), Correccion.estadoActual(est, ahoraISO()), r.hechos + ' de ' + r.total];
  BANCO.misiones.forEach(function (m) { fila.push(vacio(r.mision[m.id])); });
  Object.keys(CONFIG.CONTENIDOS).forEach(function (k) { fila.push(vacio(r.contenido[k])); });
  fila.push(vacio(r.global), r.puntos, r.puntosMax, r.intentos, Math.round(r.tiempoMs / 6000) / 10, r.pendientes, fechaLocal(est.fin));
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
