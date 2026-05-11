/**
 * RIGO THE CHAMELEON v2 - Mascota oficial del ecosistema de inglés
 * Estilo: Kawaii realista (silueta de camaleón con cresta, cola enrollada, 4 patas)
 *
 * Uso:  <script src="rigo.js"></script>
 *       <rigo-mascot grade="Noveno"></rigo-mascot>
 *       (el atributo grade filtra los hints personalizados)
 *
 * API pública:
 *   rigo.welcome()        -> saludo inicial antes del NIE
 *   rigo.loginSuccess(n)  -> celebración al ingresar
 *   rigo.setGrade(grade)  -> filtra hints al grado actual
 *   rigo.inviteGame()     -> invita al juego final
 *   rigo.cheer()          -> festeja una respuesta correcta
 *   rigo.comfort()        -> consuela tras un error
 *   rigo.say(texto, ms)   -> mensaje libre
 *   rigo.setEmotion(e)    -> cambia emoción manualmente
 *
 * Eventos emitidos:
 *   rigo-hint-requested   -> cuando el estudiante toca a Rigo pidiendo ayuda
 */
(function () {
  'use strict';

  const EMOTIONS = [
    'neutral', 'welcome', 'happy', 'confused', 'thinking',
    'sneaky', 'sad', 'excited', 'game', 'love', 'angry',
    'dizzy', 'musical', 'elder', 'easterEgg'
  ];

  // MENSAJES: cada uno puede tener:
  //   - text:    el mensaje (obligatorio)
  //   - grade:   null = todos los grados; array = solo esos grados
  //   - emotion: emoción forzada al mostrar el mensaje (opcional)
  //              Si no se define, usa la emoción por defecto del contexto.
  const RANDOM_MESSAGES = [
    { text: "No olvides subirlo a Classroom", grade: null, emotion: 'thinking' },
    { text: "Six Seven", grade: ["Octavo", "Séptimo"], emotion: 'game' },
    { text: "Raios", grade: null, emotion: 'dizzy' },
    { text: "Con calma 🎶", grade: null, emotion: 'musical' },
    { text: "Compremos un ventilador entre todos", grade: null, emotion: 'excited' },
    { text: "Ya casi terminas... Las ganas", grade: null, emotion: 'thinking' },
    { text: "Let\'s go!", grade: null, emotion: 'neutral' },
    { text: "El inglés no es tan difícil", grade: null, emotion: 'sneaky' },
    { text: "Hace calor por aquí", grade: null, emotion: 'confused' },
    { text: "Hola my friend", grade: null, emotion: 'happy' },
    { text: "Tranqui", grade: null, emotion: 'thinking' },
    { text: "Respira y continúa", grade: null, emotion: 'neutral' },
    { text: "Learning is cool", grade: null, emotion: 'happy' },
    { text: "You\'re doing great!", grade: null, emotion: 'excited' },
    { text: "¡No te rindas!", grade: null, emotion: 'excited' },
    { text: "I believe in you!", grade: null, emotion: 'love' },
    { text: "Practice makes perfect", grade: null, emotion: 'thinking' },
    { text: "Keep going, friend!", grade: null, emotion: 'happy' },
    { text: "¡Tú puedes!", grade: null, emotion: 'excited' },
    { text: "Vamos por ese 10!", grade: null, emotion: 'love' },
    { text: "Quizz time!", grade: null, emotion: 'happy' }
  ];

  // HINTS: si grade es null aparecen para todos los grados.
  //        si grade es un array, solo aparecen para esos grados.
  //        emotion fuerza una emoción específica al mostrar el hint.
  // Emociones disponibles: neutral, welcome, happy, confused, thinking,
  //                        sneaky, sad, excited, game, love, angry,
  //                        dizzy, musical, elder
  // Grados válidos: "Séptimo", "Octavo", "Noveno", "Primer Año", "Segundo Año", "Prueba"
  const HINT_MESSAGES = [
    { text: "Lalala", grade: null, emotion: 'musical' },
    { text: "La cucaracha, la cucarachaaa 🎶", grade: null, emotion: 'musical' },
    { text: "Recuerdo cuando iba a octavo", grade: ["Octavo"], emotion: 'elder' },
    { text: "Recuerdo cuando iba a séptimo", grade: ["Séptimo"], emotion: 'elder' },
    { text: "Hagamos una excursión", grade: null, emotion: 'excited' },
    { text: "¡DEMERITO!", grade: null, emotion: 'angry' },
    { text: "Los churros preparados ❤️", grade: null, emotion: 'love' },
    { text: "¿Ya tomaste agua?", grade: null, emotion: 'sneaky' },
    { text: "Inglés en Inglés es English", grade: null, emotion: 'sneaky' },
    { text: "Me llamo Rigoberto, pero dime Rigo", grade: null, emotion: 'welcome' },
    { text: "¿Barca o Real?", grade: null, emotion: 'game' },
    { text: "No me baño desde el año pasado", grade: null, emotion: 'game' },
    { text: "Apúrate que es para ayer", grade: null, emotion: 'elder' },
    { text: "Ayer fui al machacal", grade: null, emotion: 'excited' },
    { text: "Mi crush es una mosca", grade: null, emotion: 'excited' },
    { text: "Han pasado 84 años", grade: null, emotion: 'elder' },
    { text: "Respira, esto acabará pronto", grade: null, emotion: 'neutral' },
    { text: "No te distraigas", grade: null, emotion: 'angry' },
    { text: "Deja de tocarme", grade: null, emotion: 'angry' },
    { text: "La respuesta está en tu corazón", grade: null, emotion: 'love' },
    { text: "¿Necesitas ayuda?", grade: null, emotion: 'confused' },
    { text: "Duolingo no está aquí", grade: null, emotion: 'sad' },
    { text: "No dudes tanto", grade: null, emotion: 'sneaky' },
    { text: "Seguro 10", grade: null, emotion: 'excited' },
    { text: "Ese examen es míiiiio 🎶", grade: null, emotion: 'musical' },
    { text: "Hoy es un buen día", grade: null, emotion: 'happy' },
    { text: "Se trabaja mejor en silencio", grade: null, emotion: 'sneaky' },
    { text: "Lo estás haciendo bien", grade: null, emotion: 'thinking' },
    { text: "Psst... piensa rápido", grade: null, emotion: 'sneaky' }
  ];

  const CHEER_MESSAGES = [
    "Eres bueno en esto",
    "Nada mal",
    "Todo correcto",
    "Bien hecho",
    "Excelente",
    "Vamooos",
    "¡Sí señor!",
    "¡Increíble!",
    "¡Eres una máquina!",
    "¡Perfecto!",
    "¡Genial!",
    "¡Excelente!",
    "¡Así se hace!"
  ];

  const COMFORT_MESSAGES = [
    "Oops, no era así",
    "No podemos saberlo todo",
    "Fallar es parte del proceso",
    "Tranqui, todos fallamos",
    "No te exijo mucho y aún me fallas",
    "Ni modo, toca perder",
    "Nadie nace sabiendo",
    "Respira e intenta de nuevo",
    "Todos aprendemos de los errores",
    "No pasa nada, seguimos",
    "Casi casi, inténtalo otra vez"
  ];

  class RigoMascot extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.currentEmotion = 'neutral';
      this.bubbleTimer = null;
      this.randomTimer = null;
      this.blinkTimer = null;
      this.grade = null;
      this.emotionTimer = null;

      this.isDragging = false;
      this.dragOffsetX = 0;
      this.dragOffsetY = 0;
      this.hasMoved = false;
    }

    static get observedAttributes() { return ['grade']; }

    attributeChangedCallback(name, _oldVal, newVal) {
      if (name === 'grade') this.grade = newVal || null;
    }

    connectedCallback() {
      this.grade = this.getAttribute('grade') || null;
      this.render();
      // No restauramos posición previa: Rigo siempre arranca en su esquina por
      // defecto (abajo-derecha). El estudiante puede arrastrarlo durante la
      // sesión, pero al recargar vuelve a su lugar.
      this.setupInteractions();
      this.startRandomMessages();
      this.startBlinking();
    }

    disconnectedCallback() {
      clearTimeout(this.randomTimer);
      clearInterval(this.blinkTimer);
      clearTimeout(this.bubbleTimer);
	  clearTimeout(this.emotionTimer);
    }

    // Filtra mensajes según grado: null = todos; array = solo esos grados.
    // Devuelve el objeto completo { text, grade, emotion } o null si no hay candidatos.
    pickMessage(pool) {
      const candidates = pool.filter(m =>
        m.grade === null || (Array.isArray(m.grade) && this.grade && m.grade.includes(this.grade))
      );
      if (!candidates.length) return pool[0];
      return candidates[Math.floor(Math.random() * candidates.length)];
    }

    // ======================= SVG CAMALEÓN =======================
    getSVG(emotion) {
      if (emotion === 'easterEgg') {
        return `
          <svg viewBox="0 0 200 200" width="100%" height="100%">
            <g stroke="#1a1a1a" stroke-width="3">
              <rect x="5" y="5" width="92" height="92" fill="#FF6B9D"/>
              <rect x="103" y="5" width="92" height="92" fill="#FFE66D"/>
              <rect x="5" y="103" width="92" height="92" fill="#4ECDC4"/>
              <rect x="103" y="103" width="92" height="92" fill="#A8E6CF"/>
            </g>
            <g font-family="Impact, sans-serif" font-size="22" fill="#1a1a1a" text-anchor="middle" font-weight="bold">
              <text x="51" y="58">RIGO</text>
              <text x="149" y="58">POP</text>
              <text x="51" y="156">ART</text>
              <text x="149" y="156">!</text>
            </g>
          </svg>
        `;
      }

      const face = this.getFaceParts(emotion);
      const bodyAnim = emotion === 'excited' ? 'style="animation: rigoBounce 0.6s ease-in-out infinite;"' : '';

      // En welcome, la cola se mueve de lado a lado en lugar de un brazo extra.
      // (El brazo lateral confundía porque Rigo ya tiene 4 patas).
      const tailClass = emotion === 'welcome' ? 'rigo-tail-wave' : '';

      const gameGlasses = emotion === 'game'
        ? `<rect x="44" y="76" width="40" height="22" rx="4" fill="#1a1a1a"/>
           <rect x="116" y="76" width="40" height="22" rx="4" fill="#1a1a1a"/>
           <rect x="84" y="84" width="32" height="4" fill="#1a1a1a"/>
           <rect x="50" y="80" width="8" height="6" fill="#fff" opacity="0.4"/>
           <rect x="122" y="80" width="8" height="6" fill="#fff" opacity="0.4"/>`
        : '';

      const questionMark = emotion === 'confused'
        ? `<text x="165" y="40" font-family="Impact, sans-serif" font-size="32" fill="#FF6B9D" stroke="#1a1a1a" stroke-width="1.5" font-weight="bold">?</text>`
        : '';

      const thoughtBubble = emotion === 'thinking'
        ? `<circle cx="168" cy="50" r="10" fill="#fff" stroke="#1a1a1a" stroke-width="2.5"/>
           <circle cx="185" cy="32" r="6" fill="#fff" stroke="#1a1a1a" stroke-width="2"/>`
        : '';

      const tear = emotion === 'sad'
        ? `<path d="M 52 108 Q 54 118 56 108 Q 58 118 56 122 Q 52 124 50 120 Z" fill="#4FC3F7" stroke="#1a1a1a" stroke-width="1.5"/>`
        : '';

      // Marca de enojo estilo anime (cruz/vena roja) en la frente
      const angryMark = emotion === 'angry'
        ? `<g stroke="#E63946" stroke-width="3.5" stroke-linecap="round" fill="none">
             <path d="M 160 38 L 170 48 M 175 38 L 185 48"/>
             <path d="M 155 48 L 160 38 L 155 28"/>
             <path d="M 190 48 L 185 38 L 190 28"/>
           </g>
           <g fill="#E63946" opacity="0.6">
             <ellipse cx="30" cy="75" rx="4" ry="3"/>
             <ellipse cx="30" cy="90" rx="5" ry="3"/>
             <ellipse cx="28" cy="105" rx="3" ry="2"/>
           </g>`
        : '';

      // Mareo: estrellas/espirales orbitando la cabeza + gota de sudor
      const dizzyMark = emotion === 'dizzy'
        ? `<g class="rigo-dizzy-orbit" style="transform-origin: 100px 50px;">
             <text x="60" y="35" font-family="Impact, sans-serif" font-size="22" fill="#FFD93D" stroke="#1a1a1a" stroke-width="1.2" font-weight="bold">★</text>
             <text x="135" y="32" font-family="Impact, sans-serif" font-size="18" fill="#A8E6CF" stroke="#1a1a1a" stroke-width="1.2" font-weight="bold">✦</text>
             <text x="100" y="22" font-family="Impact, sans-serif" font-size="16" fill="#FF6B9D" stroke="#1a1a1a" stroke-width="1" font-weight="bold">✶</text>
           </g>
           <path d="M 168 70 Q 172 80 168 88 Q 164 80 168 70 Z" fill="#4FC3F7" stroke="#1a1a1a" stroke-width="1.5"/>`
        : '';

      // Musical: micrófono + notas musicales flotando
      const musicalMark = emotion === 'musical'
        ? `<g>
             <!-- Micrófono frente a la boca -->
             <ellipse cx="100" cy="155" rx="11" ry="13" fill="#3a3a3a" stroke="#1a1a1a" stroke-width="2.5"/>
             <ellipse cx="100" cy="153" rx="8" ry="10" fill="#5a5a5a" stroke="none"/>
             <g stroke="#1a1a1a" stroke-width="0.8" opacity="0.6">
               <line x1="94" y1="150" x2="106" y2="150"/>
               <line x1="93" y1="155" x2="107" y2="155"/>
               <line x1="94" y1="160" x2="106" y2="160"/>
             </g>
             <rect x="97" y="166" width="6" height="14" fill="#1a1a1a"/>
             <rect x="93" y="178" width="14" height="4" rx="1" fill="#1a1a1a"/>
           </g>
           <g class="rigo-music-float">
             <!-- Nota musical 1 -->
             <g transform="translate(20, 30)">
               <circle cx="0" cy="14" r="5" fill="#FF6B9D" stroke="#1a1a1a" stroke-width="1.8"/>
               <path d="M 5 14 L 5 -2 L 18 -6 L 18 6" fill="none" stroke="#1a1a1a" stroke-width="2.5" stroke-linecap="round"/>
               <path d="M 5 -2 L 18 -6" fill="none" stroke="#1a1a1a" stroke-width="2.5"/>
             </g>
             <!-- Nota musical 2 -->
             <g transform="translate(160, 45)">
               <circle cx="0" cy="10" r="4" fill="#4ECDC4" stroke="#1a1a1a" stroke-width="1.5"/>
               <path d="M 4 10 L 4 -4" fill="none" stroke="#1a1a1a" stroke-width="2.2" stroke-linecap="round"/>
               <path d="M 4 -4 Q 10 -2 8 4" fill="none" stroke="#1a1a1a" stroke-width="2.2" stroke-linecap="round"/>
             </g>
             <!-- Nota musical 3 -->
             <g transform="translate(170, 90)">
               <circle cx="0" cy="8" r="3.5" fill="#FFE66D" stroke="#1a1a1a" stroke-width="1.5"/>
               <path d="M 3.5 8 L 3.5 -3" fill="none" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round"/>
             </g>
           </g>`
        : '';

      // Anciano: anteojos redondos + barba blanca + bastón
      const elderMark = emotion === 'elder'
        ? `<g>
             <!-- Anteojos redondos sobre los ojos -->
             <circle cx="55" cy="88" r="22" fill="none" stroke="#1a1a1a" stroke-width="3"/>
             <circle cx="145" cy="88" r="22" fill="none" stroke="#1a1a1a" stroke-width="3"/>
             <line x1="77" y1="88" x2="123" y2="88" stroke="#1a1a1a" stroke-width="3"/>
             <!-- Reflejo del cristal -->
             <path d="M 42 80 Q 48 75 56 78" fill="none" stroke="#fff" stroke-width="2" opacity="0.6"/>
             <path d="M 132 80 Q 138 75 146 78" fill="none" stroke="#fff" stroke-width="2" opacity="0.6"/>
           </g>
           <!-- Cejas blancas pobladas -->
           <g fill="#f5f5f5" stroke="#1a1a1a" stroke-width="1.5">
             <path d="M 40 65 Q 55 58 72 64 Q 70 70 55 68 Q 45 70 40 65 Z"/>
             <path d="M 128 64 Q 145 58 160 65 Q 155 70 145 68 Q 130 70 128 64 Z"/>
           </g>
           <!-- Barba blanca debajo del mentón -->
           <g fill="#f5f5f5" stroke="#1a1a1a" stroke-width="2">
             <path d="M 80 132 Q 75 145 80 158 Q 88 165 95 158 Q 100 168 105 158 Q 112 165 120 158 Q 125 145 120 132 Q 100 138 80 132 Z"/>
           </g>
           <g stroke="#cccccc" stroke-width="0.8" opacity="0.7">
             <path d="M 85 140 L 85 152" fill="none"/>
             <path d="M 95 142 L 95 156" fill="none"/>
             <path d="M 105 142 L 105 156" fill="none"/>
             <path d="M 115 140 L 115 152" fill="none"/>
           </g>
           <!-- Bastón a la derecha -->
           <g stroke="#8B4513" stroke-width="4" stroke-linecap="round" fill="none">
             <path d="M 175 90 Q 178 88 180 92 L 180 175"/>
           </g>
           <circle cx="178" cy="89" r="4" fill="#A0522D" stroke="#1a1a1a" stroke-width="1.5"/>`
        : '';


      return `
        <svg viewBox="0 0 200 200" width="100%" height="100%" ${bodyAnim}>
          <defs>
            <radialGradient id="cheek" cx="50%" cy="50%">
              <stop offset="0%" stop-color="#FF6B9D" stop-opacity="0.9"/>
              <stop offset="100%" stop-color="#FF6B9D" stop-opacity="0"/>
            </radialGradient>
            <radialGradient id="belly" cx="50%" cy="30%">
              <stop offset="0%" stop-color="#D4F5A8" stop-opacity="0.9"/>
              <stop offset="100%" stop-color="#B8E986" stop-opacity="0.6"/>
            </radialGradient>
          </defs>

          <!-- COLA ENROLLADA (se anima en welcome) -->
          <g class="${tailClass}" style="transform-origin: 55px 150px;">
            <path d="M 55 150 Q 35 150, 25 135 Q 15 120, 20 105 Q 25 92, 38 92 Q 48 92, 48 102 Q 48 108, 42 108 Q 37 108, 37 103"
                  fill="none" stroke="#1a1a1a" stroke-width="4" stroke-linecap="round"/>
            <path d="M 55 150 Q 35 150, 25 135 Q 15 120, 20 105 Q 25 92, 38 92 Q 48 92, 48 102 Q 48 108, 42 108 Q 37 108, 37 103"
                  fill="none" class="rigo-skin-stroke" stroke-width="12" stroke-linecap="round" opacity="0.95"/>
            <g stroke="#1a1a1a" stroke-width="1.2" stroke-linecap="round" opacity="0.5">
              <path d="M 50 148 Q 48 152 46 150" fill="none"/>
              <path d="M 38 144 Q 35 147 33 144" fill="none"/>
              <path d="M 28 130 Q 25 130 24 127" fill="none"/>
            </g>
          </g>

          <!-- PATAS TRASERAS -->
          <ellipse cx="70" cy="168" rx="14" ry="9" class="rigo-skin" stroke="#1a1a1a" stroke-width="3"/>
          <path d="M 60 170 L 58 175 M 66 172 L 65 178 M 72 172 L 72 178" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round"/>
          <ellipse cx="130" cy="168" rx="14" ry="9" class="rigo-skin" stroke="#1a1a1a" stroke-width="3"/>
          <path d="M 120 172 L 120 178 M 128 172 L 128 178 M 136 170 L 138 175" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round"/>

          <!-- CUERPO -->
          <path d="M 55 135 Q 50 160, 75 165 Q 100 170, 125 165 Q 150 160, 145 135 Q 145 125, 135 118 L 65 118 Q 55 125, 55 135 Z"
                class="rigo-skin" stroke="#1a1a1a" stroke-width="3.5"/>
          <ellipse cx="100" cy="150" rx="28" ry="15" fill="url(#belly)"/>
          <g stroke="#1a1a1a" stroke-width="1" stroke-linecap="round" opacity="0.3" fill="none">
            <path d="M 82 145 Q 100 148 118 145"/>
            <path d="M 80 152 Q 100 156 120 152"/>
            <path d="M 82 159 Q 100 162 118 159"/>
          </g>

          <!-- PATITAS DELANTERAS -->
          <ellipse cx="55" cy="150" rx="9" ry="12" class="rigo-skin" stroke="#1a1a1a" stroke-width="3"/>
          <path d="M 50 158 L 48 163 M 55 160 L 55 165 M 60 158 L 62 163" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round"/>
          <ellipse cx="145" cy="150" rx="9" ry="12" class="rigo-skin" stroke="#1a1a1a" stroke-width="3"/>
          <path d="M 140 158 L 138 163 M 145 160 L 145 165 M 150 158 L 152 163" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round"/>

          <!-- CRESTA DENTADA -->
          <path d="M 70 55 L 78 38 L 85 52 L 92 32 L 100 50 L 108 30 L 116 50 L 123 38 L 130 55 Z"
                class="rigo-skin" stroke="#1a1a1a" stroke-width="3" stroke-linejoin="round"/>

          <!-- CABEZA -->
          <path d="M 100 45 C 55 45, 40 80, 45 110 C 50 135, 70 135, 100 135 C 130 135, 150 135, 155 110 C 160 80, 145 45, 100 45 Z"
                class="rigo-skin" stroke="#1a1a1a" stroke-width="3.5"/>

          <!-- MOTITAS -->
          <g fill="#FFE066" opacity="0.7">
            <circle cx="70" cy="60" r="2"/>
            <circle cx="85" cy="50" r="1.5"/>
            <circle cx="130" cy="58" r="2"/>
            <circle cx="115" cy="48" r="1.5"/>
            <circle cx="98" cy="65" r="1.5"/>
            <circle cx="90" cy="140" r="1.5"/>
            <circle cx="115" cy="142" r="2"/>
            <circle cx="135" cy="155" r="1.5"/>
          </g>
          <g fill="#52BF48" opacity="0.45">
            <circle cx="78" cy="72" r="2"/>
            <circle cx="122" cy="68" r="2"/>
            <circle cx="100" cy="55" r="1.5"/>
            <circle cx="75" cy="130" r="1.5"/>
            <circle cx="125" cy="132" r="1.5"/>
            <circle cx="65" cy="145" r="1.5"/>
          </g>

          <!-- OJOS -->
          ${face.leftEye}
          ${face.rightEye}

          <!-- MEJILLAS -->
          <ellipse cx="48" cy="108" rx="11" ry="7" fill="url(#cheek)"/>
          <ellipse cx="152" cy="108" rx="11" ry="7" fill="url(#cheek)"/>

          <!-- FOSAS NASALES -->
          <circle cx="94" cy="108" r="1.5" fill="#1a1a1a"/>
          <circle cx="106" cy="108" r="1.5" fill="#1a1a1a"/>

          ${face.mouth}
          ${gameGlasses}
          ${questionMark}
          ${thoughtBubble}
          ${tear}
          ${angryMark}
          ${dizzyMark}
          ${musicalMark}
          ${elderMark}

          <!-- BRILLO SUPERIOR -->
          <ellipse cx="85" cy="58" rx="14" ry="6" fill="#fff" opacity="0.3"/>
        </svg>
      `;
    }

    getFaceParts(emotion) {
      // Ojos laterales salientes como la referencia
      const LE_CX = 55, LE_CY = 88;
      const RE_CX = 145, RE_CY = 88;

      let leftEye, rightEye, mouth;

      switch (emotion) {
        case 'happy':
          leftEye = this.happyEye(LE_CX, LE_CY);
          rightEye = this.happyEye(RE_CX, RE_CY);
          mouth = `<path d="M 85 122 Q 100 138 115 122" fill="#FF6B9D" stroke="#1a1a1a" stroke-width="3" stroke-linecap="round"/>`;
          break;
        case 'excited':
          leftEye = this.sparkleEye(LE_CX, LE_CY);
          rightEye = this.sparkleEye(RE_CX, RE_CY);
          mouth = `<ellipse cx="100" cy="126" rx="13" ry="9" fill="#FF3366" stroke="#1a1a1a" stroke-width="3"/>
                   <path d="M 90 124 Q 100 118 110 124" fill="none" stroke="#FFB8CC" stroke-width="2"/>`;
          break;
        case 'welcome':
          leftEye = this.bigEye(LE_CX, LE_CY);
          rightEye = this.bigEye(RE_CX, RE_CY);
          mouth = `<path d="M 85 122 Q 100 134 115 122" fill="#FF6B9D" stroke="#1a1a1a" stroke-width="3" stroke-linecap="round"/>`;
          break;
        case 'confused':
          leftEye = this.bigEye(LE_CX, LE_CY, -2);
          rightEye = this.smallEye(RE_CX, RE_CY);
          mouth = `<path d="M 88 124 Q 94 119 100 124 Q 106 129 112 124" fill="none" stroke="#1a1a1a" stroke-width="3" stroke-linecap="round"/>`;
          break;
        case 'thinking':
          leftEye = `<ellipse cx="${LE_CX}" cy="${LE_CY}" rx="18" ry="17" class="rigo-skin" stroke="#1a1a1a" stroke-width="3"/>
                     <path d="M 44 88 L 66 90" stroke="#1a1a1a" stroke-width="3.5" stroke-linecap="round"/>`;
          rightEye = this.bigEye(RE_CX, RE_CY, 0, 2);
          mouth = `<path d="M 90 126 L 112 122" fill="none" stroke="#1a1a1a" stroke-width="3" stroke-linecap="round"/>`;
          break;
        case 'sneaky':
          leftEye = `<ellipse cx="${LE_CX}" cy="${LE_CY}" rx="18" ry="17" class="rigo-skin" stroke="#1a1a1a" stroke-width="3"/>
                     <path d="M 42 88 Q 55 80 68 88" fill="none" stroke="#1a1a1a" stroke-width="3.5" stroke-linecap="round"/>
                     <path d="M 47 90 Q 55 86 63 90" fill="#1a1a1a" stroke="none"/>`;
          rightEye = `<ellipse cx="${RE_CX}" cy="${RE_CY}" rx="18" ry="17" class="rigo-skin" stroke="#1a1a1a" stroke-width="3"/>
                      <path d="M 132 88 Q 145 80 158 88" fill="none" stroke="#1a1a1a" stroke-width="3.5" stroke-linecap="round"/>
                      <path d="M 137 90 Q 145 86 153 90" fill="#1a1a1a" stroke="none"/>`;
          mouth = `<path d="M 85 124 Q 100 132 118 118" fill="none" stroke="#1a1a1a" stroke-width="3" stroke-linecap="round"/>`;
          break;
        case 'sad':
          leftEye = this.bigEye(LE_CX, LE_CY + 2, 0, 3);
          rightEye = this.bigEye(RE_CX, RE_CY + 2, 0, 3);
          mouth = `<path d="M 85 130 Q 100 120 115 130" fill="none" stroke="#1a1a1a" stroke-width="3" stroke-linecap="round"/>`;
          break;
        case 'game':
          leftEye = `<ellipse cx="${LE_CX}" cy="${LE_CY}" rx="18" ry="17" class="rigo-skin" stroke="#1a1a1a" stroke-width="3"/>`;
          rightEye = `<ellipse cx="${RE_CX}" cy="${RE_CY}" rx="18" ry="17" class="rigo-skin" stroke="#1a1a1a" stroke-width="3"/>`;
          mouth = `<path d="M 85 122 Q 100 134 115 122" fill="#FF6B9D" stroke="#1a1a1a" stroke-width="3" stroke-linecap="round"/>`;
          break;
        case 'love':
          leftEye = this.heartEye(LE_CX, LE_CY);
          rightEye = this.heartEye(RE_CX, RE_CY);
          mouth = `<path d="M 85 122 Q 100 136 115 122" fill="#FF6B9D" stroke="#1a1a1a" stroke-width="3" stroke-linecap="round"/>`;
          break;
        case 'angry':
          leftEye = this.angryEye(LE_CX, LE_CY);
          rightEye = this.angryEye(RE_CX, RE_CY);
          mouth = `<path d="M 85 125 Q 100 118 115 125 Q 110 128 100 126 Q 90 128 85 125 Z" fill="#1a1a1a" stroke="#1a1a1a" stroke-width="2.5" stroke-linejoin="round"/>
                   <path d="M 92 126 L 94 130 M 98 126 L 98 131 M 104 126 L 106 130" stroke="#fff" stroke-width="1.2" stroke-linecap="round"/>`;
          break;
        case 'dizzy':
          leftEye = this.spiralEye(LE_CX, LE_CY);
          rightEye = this.spiralEye(RE_CX, RE_CY);
          // Boca ondulada estilo "uuugh"
          mouth = `<path d="M 82 124 Q 88 120 94 124 Q 100 128 106 124 Q 112 120 118 124" fill="none" stroke="#1a1a1a" stroke-width="3" stroke-linecap="round"/>`;
          break;
        case 'musical':
          // Ojos cerrados cantando con cejas alegres
          leftEye = this.singingEye(LE_CX, LE_CY);
          rightEye = this.singingEye(RE_CX, RE_CY);
          // Boca abierta cantando "O"
          mouth = `<ellipse cx="100" cy="126" rx="9" ry="12" fill="#1a1a1a" stroke="#1a1a1a" stroke-width="2.5"/>
                   <ellipse cx="100" cy="129" rx="6" ry="7" fill="#FF3366"/>`;
          break;
        case 'elder':
          // Ojos pequeños y cansados (los anteojos van encima vía elderMark)
          leftEye = this.smallEye(LE_CX, LE_CY);
          rightEye = this.smallEye(RE_CX, RE_CY);
          // Sonrisa amable y serena (más leve que happy)
          mouth = `<path d="M 88 124 Q 100 130 112 124" fill="none" stroke="#1a1a1a" stroke-width="3" stroke-linecap="round"/>`;
          break;
        case 'neutral':
        default:
          leftEye = this.bigEye(LE_CX, LE_CY);
          rightEye = this.bigEye(RE_CX, RE_CY);
          mouth = `<path d="M 90 124 Q 100 130 110 124" fill="none" stroke="#1a1a1a" stroke-width="3" stroke-linecap="round"/>`;
      }
      return { leftEye, rightEye, mouth };
    }

    // Ojo grande kawaii con párpado saliente (estilo camaleón real)
    bigEye(cx, cy, pupilOffsetX = 0, pupilOffsetY = 0) {
      return `
        <g>
          <ellipse cx="${cx}" cy="${cy}" rx="18" ry="17" class="rigo-skin" stroke="#1a1a1a" stroke-width="3"/>
          <circle cx="${cx}" cy="${cy}" r="13" fill="#fff" stroke="#1a1a1a" stroke-width="2.5"/>
          <circle cx="${cx + pupilOffsetX}" cy="${cy + pupilOffsetY}" r="9" fill="#1a1a1a"/>
          <circle cx="${cx - 3 + pupilOffsetX}" cy="${cy - 3 + pupilOffsetY}" r="3.5" fill="#fff"/>
          <circle cx="${cx + 4 + pupilOffsetX}" cy="${cy + 4 + pupilOffsetY}" r="1.5" fill="#fff"/>
        </g>
      `;
    }

    smallEye(cx, cy) {
      return `
        <g>
          <ellipse cx="${cx}" cy="${cy}" rx="14" ry="13" class="rigo-skin" stroke="#1a1a1a" stroke-width="3"/>
          <circle cx="${cx}" cy="${cy}" r="8" fill="#fff" stroke="#1a1a1a" stroke-width="2.5"/>
          <circle cx="${cx}" cy="${cy}" r="5" fill="#1a1a1a"/>
          <circle cx="${cx - 1.5}" cy="${cy - 1.5}" r="2" fill="#fff"/>
        </g>
      `;
    }

    happyEye(cx, cy) {
      return `
        <g>
          <ellipse cx="${cx}" cy="${cy}" rx="18" ry="17" class="rigo-skin" stroke="#1a1a1a" stroke-width="3"/>
          <path d="M ${cx - 10} ${cy + 2} Q ${cx} ${cy - 10} ${cx + 10} ${cy + 2}"
                fill="none" stroke="#1a1a1a" stroke-width="3.5" stroke-linecap="round"/>
        </g>
      `;
    }

    sparkleEye(cx, cy) {
      return `
        <g>
          <ellipse cx="${cx}" cy="${cy}" rx="18" ry="17" class="rigo-skin" stroke="#1a1a1a" stroke-width="3"/>
          <circle cx="${cx}" cy="${cy}" r="13" fill="#fff" stroke="#1a1a1a" stroke-width="2.5"/>
          <circle cx="${cx}" cy="${cy}" r="10" fill="#1a1a1a"/>
          <path d="M ${cx - 4} ${cy - 5} L ${cx - 1} ${cy - 1} L ${cx + 4} ${cy - 4}
                   L ${cx + 1} ${cy + 2} L ${cx + 5} ${cy + 5} L ${cx} ${cy + 3}
                   L ${cx - 5} ${cy + 6} L ${cx - 2} ${cy + 1} Z" fill="#fff"/>
          <circle cx="${cx + 5}" cy="${cy + 5}" r="1.5" fill="#fff"/>
        </g>
      `;
    }

    heartEye(cx, cy) {
      return `
        <g>
          <ellipse cx="${cx}" cy="${cy}" rx="18" ry="17" class="rigo-skin" stroke="#1a1a1a" stroke-width="3"/>
          <path d="M ${cx} ${cy + 6}
                   C ${cx - 10} ${cy - 2}, ${cx - 12} ${cy - 8}, ${cx - 6} ${cy - 8}
                   C ${cx - 2} ${cy - 8}, ${cx} ${cy - 4}, ${cx} ${cy - 2}
                   C ${cx} ${cy - 4}, ${cx + 2} ${cy - 8}, ${cx + 6} ${cy - 8}
                   C ${cx + 12} ${cy - 8}, ${cx + 10} ${cy - 2}, ${cx} ${cy + 6} Z"
                fill="#FF3366" stroke="#1a1a1a" stroke-width="2"/>
          <circle cx="${cx - 4}" cy="${cy - 5}" r="1.5" fill="#fff"/>
        </g>
      `;
    }

    angryEye(cx, cy) {
      // Ceja gruesa inclinada hacia el centro + ojo entrecerrado
      const toward = cx < 100 ? 1 : -1; // inclina ceja hacia el centro de la cara
      return `
        <g>
          <ellipse cx="${cx}" cy="${cy}" rx="18" ry="17" class="rigo-skin" stroke="#1a1a1a" stroke-width="3"/>
          <!-- ojo entrecerrado -->
          <path d="M ${cx - 11} ${cy + 1} Q ${cx} ${cy + 5} ${cx + 11} ${cy + 1} Q ${cx} ${cy - 3} ${cx - 11} ${cy + 1} Z"
                fill="#fff" stroke="#1a1a1a" stroke-width="2.5"/>
          <circle cx="${cx}" cy="${cy + 1}" r="4" fill="#1a1a1a"/>
          <!-- ceja gruesa inclinada -->
          <path d="M ${cx - 12 * toward} ${cy - 11} L ${cx + 12 * toward} ${cy - 4}"
                stroke="#1a1a1a" stroke-width="5" stroke-linecap="round"/>
        </g>
      `;
    }

    // Ojo en espiral estilo cómic para mareo/náuseas
    spiralEye(cx, cy) {
      return `
        <g>
          <ellipse cx="${cx}" cy="${cy}" rx="18" ry="17" class="rigo-skin" stroke="#1a1a1a" stroke-width="3"/>
          <circle cx="${cx}" cy="${cy}" r="13" fill="#fff" stroke="#1a1a1a" stroke-width="2.5"/>
          <path d="M ${cx} ${cy}
                   m -1 0
                   a 2 2 0 1 1 2 0
                   a 4 4 0 1 1 -4 0
                   a 6 6 0 1 1 6 0
                   a 8 8 0 1 1 -8 0
                   a 10 10 0 1 1 10 0"
                fill="none" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round"/>
        </g>
      `;
    }

    // Ojo cerrado cantando feliz (curva en forma de U invertida con pestañas)
    singingEye(cx, cy) {
      return `
        <g>
          <ellipse cx="${cx}" cy="${cy}" rx="18" ry="17" class="rigo-skin" stroke="#1a1a1a" stroke-width="3"/>
          <path d="M ${cx - 11} ${cy + 3} Q ${cx} ${cy - 8} ${cx + 11} ${cy + 3}"
                fill="none" stroke="#1a1a1a" stroke-width="3.5" stroke-linecap="round"/>
          <!-- pestañas alegres -->
          <path d="M ${cx - 11} ${cy + 3} L ${cx - 14} ${cy + 1}" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round"/>
          <path d="M ${cx + 11} ${cy + 3} L ${cx + 14} ${cy + 1}" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round"/>
          <path d="M ${cx} ${cy - 5} L ${cx} ${cy - 8}" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round"/>
        </g>
      `;
    }

    // ======================= RENDER =======================
    render() {
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
            user-select: none;
            -webkit-user-select: none;
            -webkit-touch-callout: none;
            font-family: 'Comic Sans MS', 'Chalkboard SE', system-ui, sans-serif;
            touch-action: none;
          }
          #rigo-wrapper {
            position: relative;
            width: 140px;
            height: 140px;
            cursor: grab;
            filter: drop-shadow(3px 4px 0 rgba(0,0,0,0.25));
            transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
          }
          #rigo-wrapper.dragging {
            cursor: grabbing;
            transition: none;
            filter: drop-shadow(6px 8px 0 rgba(0,0,0,0.35));
          }
          #rigo-wrapper:hover:not(.dragging) { transform: scale(1.08) rotate(-3deg); }
          #rigo-wrapper:active:not(.dragging) { transform: scale(0.95); }

          @keyframes popArtSkin {
            0%   { fill: #7ED957; }
            14%  { fill: #5AC850; }
            28%  { fill: #8FDB5F; }
            42%  { fill: #6BCF4A; }
            57%  { fill: #7FD856; }
            71%  { fill: #52BF48; }
            85%  { fill: #85D95B; }
            100% { fill: #7ED957; }
          }
          @keyframes popArtStroke {
            0%   { stroke: #7ED957; }
            14%  { stroke: #5AC850; }
            28%  { stroke: #8FDB5F; }
            42%  { stroke: #6BCF4A; }
            57%  { stroke: #7FD856; }
            71%  { stroke: #52BF48; }
            85%  { stroke: #85D95B; }
            100% { stroke: #7ED957; }
          }
          /* Cambio de color visible pero sutil (45s por ciclo completo) */
          .rigo-skin { animation: popArtSkin 45s infinite linear; fill: #7ED957; }
          .rigo-skin-stroke { animation: popArtStroke 45s infinite linear; stroke: #7ED957; }

          /* En modo angry la piel se vuelve roja y vibra */
          :host([data-emotion="angry"]) .rigo-skin {
            animation: angrySkin 0.4s infinite linear;
            fill: #E63946;
          }
          :host([data-emotion="angry"]) .rigo-skin-stroke {
            animation: angryStroke 0.4s infinite linear;
            stroke: #E63946;
          }
          @keyframes angrySkin {
            0%, 100% { fill: #E63946; }
            50%      { fill: #FF3333; }
          }
          @keyframes angryStroke {
            0%, 100% { stroke: #E63946; }
            50%      { stroke: #FF3333; }
          }

          @keyframes rigoBounce {
            0%, 100% { transform: translateY(0); }
            50%      { transform: translateY(-6px); }
          }
          @keyframes tailWave {
            0%, 100% { transform: rotate(0deg); }
            25%      { transform: rotate(-12deg); }
            75%      { transform: rotate(12deg); }
          }
          .rigo-tail-wave {
            animation: tailWave 0.8s ease-in-out infinite;
          }
          @keyframes rigoShake {
            0%, 100% { transform: translateX(0) rotate(0); }
            25%      { transform: translateX(-2px) rotate(-1deg); }
            75%      { transform: translateX(2px) rotate(1deg); }
          }
          :host([data-emotion="angry"]) #svg-container {
            animation: rigoShake 0.15s infinite linear;
          }

          /* Mareo: piel verdosa enferma + tambaleo lento */
          @keyframes dizzySkin {
            0%, 100% { fill: #A8C97A; }
            50%      { fill: #8FB868; }
          }
          @keyframes dizzyStroke {
            0%, 100% { stroke: #A8C97A; }
            50%      { stroke: #8FB868; }
          }
          :host([data-emotion="dizzy"]) .rigo-skin {
            animation: dizzySkin 1.2s infinite ease-in-out;
            fill: #A8C97A;
          }
          :host([data-emotion="dizzy"]) .rigo-skin-stroke {
            animation: dizzyStroke 1.2s infinite ease-in-out;
            stroke: #A8C97A;
          }
          @keyframes rigoSway {
            0%, 100% { transform: rotate(-4deg); }
            50%      { transform: rotate(4deg); }
          }
          :host([data-emotion="dizzy"]) #svg-container {
            animation: rigoSway 1.4s infinite ease-in-out;
          }
          @keyframes dizzyOrbit {
            0%   { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .rigo-dizzy-orbit {
            animation: dizzyOrbit 2s infinite linear;
          }

          /* Musical: balanceo rítmico + notas flotando */
          @keyframes rigoSing {
            0%, 100% { transform: translateY(0) rotate(-2deg); }
            50%      { transform: translateY(-4px) rotate(2deg); }
          }
          :host([data-emotion="musical"]) #svg-container {
            animation: rigoSing 0.6s infinite ease-in-out;
          }
          @keyframes musicFloat {
            0%   { transform: translateY(0); opacity: 0.4; }
            50%  { transform: translateY(-8px); opacity: 1; }
            100% { transform: translateY(-16px); opacity: 0; }
          }
          .rigo-music-float {
            animation: musicFloat 1.8s infinite ease-out;
          }

          /* Anciano: movimiento muy lento y tembloroso */
          @keyframes elderTremble {
            0%, 100% { transform: translateX(0) translateY(0); }
            25%      { transform: translateX(0.5px) translateY(-0.3px); }
            50%      { transform: translateX(-0.3px) translateY(0.4px); }
            75%      { transform: translateX(0.4px) translateY(0.2px); }
          }
          :host([data-emotion="elder"]) #svg-container {
            animation: elderTremble 0.5s infinite linear;
          }
          @keyframes rigoIdle {
            0%, 100% { transform: translateY(0) rotate(0); }
            50%      { transform: translateY(-3px) rotate(1deg); }
          }

          #svg-container {
            width: 100%;
            height: 100%;
            animation: rigoIdle 4s ease-in-out infinite;
            pointer-events: none;
          }

          #speech-bubble {
            position: absolute;
            bottom: 110%;
            right: 10%;
            background: #fff;
            border: 3px solid #1a1a1a;
            border-radius: 18px;
            padding: 10px 14px;
            font-size: 13px;
            font-weight: bold;
            color: #1a1a1a;
            line-height: 1.3;
            width: max-content;
            max-width: 200px;
            text-align: center;
            box-shadow: 3px 4px 0 #1a1a1a;
            opacity: 0;
            transform: translateY(10px) scale(0.8);
            transition: opacity 0.25s, transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
            pointer-events: none;
            white-space: normal;
          }
          #speech-bubble::after {
            content: '';
            position: absolute;
            bottom: -10px;
            right: 25px;
            width: 0;
            height: 0;
            border: 10px solid transparent;
            border-top-color: #fff;
            border-bottom: 0;
          }
          #speech-bubble::before {
            content: '';
            position: absolute;
            bottom: -14px;
            right: 22px;
            width: 0;
            height: 0;
            border: 13px solid transparent;
            border-top-color: #1a1a1a;
            border-bottom: 0;
          }
          #speech-bubble.show {
            opacity: 1;
            transform: translateY(0) scale(1);
          }

          @media (max-width: 480px) {
            :host { bottom: 10px; right: 10px; }
            #rigo-wrapper { width: 110px; height: 110px; }
            #speech-bubble { font-size: 12px; max-width: 160px; }
          }
        </style>

        <div id="rigo-wrapper" translate="no">
          <div id="speech-bubble"></div>
          <div id="svg-container">${this.getSVG(this.currentEmotion)}</div>
        </div>
      `;
    }

    // ======================= INTERACCIONES =======================
    setupInteractions() {
      const wrapper = this.shadowRoot.getElementById('rigo-wrapper');

      const onDown = (e) => {
        this.isDragging = true;
        this.hasMoved = false;
        wrapper.classList.add('dragging');
        const point = e.touches ? e.touches[0] : e;
        const rect = this.getBoundingClientRect();
        this.dragOffsetX = point.clientX - rect.left;
        this.dragOffsetY = point.clientY - rect.top;
        e.preventDefault();
      };

      const onMove = (e) => {
        if (!this.isDragging) return;
        this.hasMoved = true;
        const point = e.touches ? e.touches[0] : e;
        const x = point.clientX - this.dragOffsetX;
        const y = point.clientY - this.dragOffsetY;
        const maxX = window.innerWidth - this.offsetWidth;
        const maxY = window.innerHeight - this.offsetHeight;
        this.style.left = Math.max(0, Math.min(x, maxX)) + 'px';
        this.style.top = Math.max(0, Math.min(y, maxY)) + 'px';
        this.style.right = 'auto';
        this.style.bottom = 'auto';
        e.preventDefault();
      };

      const onUp = () => {
        if (!this.isDragging) return;
        this.isDragging = false;
        wrapper.classList.remove('dragging');
        if (this.hasMoved) this.savePosition();
        else this.handleTap();
      };

      wrapper.addEventListener('mousedown', onDown);
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
      wrapper.addEventListener('touchstart', onDown, { passive: false });
      window.addEventListener('touchmove', onMove, { passive: false });
      window.addEventListener('touchend', onUp);
    }

    handleTap() {
      if (Math.random() < 0.008) {
        this.setEmotion('easterEgg');
        this.say("¡Modo POP ART desbloqueado!", 4000);
        
        // Limpiamos la emoción anterior si el usuario hizo clic rápido
        if (this.emotionTimer) clearTimeout(this.emotionTimer);
        this.emotionTimer = setTimeout(() => this.setEmotion('neutral'), 4000);
        return;
      }
      
      const msg = this.pickMessage(HINT_MESSAGES);
      const emotion = msg.emotion || 'sneaky';
      
      this.setEmotion(emotion);
      this.say(msg.text, 4000);
      
      this.dispatchEvent(new CustomEvent('rigo-hint-requested', {
        bubbles: true, composed: true,
        detail: { hint: msg.text, emotion }
      }));
      
      if (this.emotionTimer) clearTimeout(this.emotionTimer);
      this.emotionTimer = setTimeout(() => this.setEmotion('neutral'), 4000);
    }

    savePosition() {
      // Posición no persistida: cada recarga vuelve a la esquina por defecto.
      // Si el estudiante lo arrastra, se mantiene durante la sesión.
      try { localStorage.removeItem('rigo_pos'); } catch (e) { /* silencioso */ }
    }

    restorePosition() {
      try {
        const saved = localStorage.getItem('rigo_pos');
        if (!saved) return;
        const pos = JSON.parse(saved);
        if (pos.left && pos.top) {
          this.style.left = pos.left;
          this.style.top = pos.top;
          this.style.right = 'auto';
          this.style.bottom = 'auto';
        }
      } catch (e) { /* silencioso */ }
    }

    setEmotion(emotion) {
      if (!EMOTIONS.includes(emotion)) emotion = 'neutral';
      this.currentEmotion = emotion;
      this.setAttribute('data-emotion', emotion);
      const container = this.shadowRoot.getElementById('svg-container');
      if (container) container.innerHTML = this.getSVG(emotion);
    }

    say(text, duration = 4000) {
      const bubble = this.shadowRoot.getElementById('speech-bubble');
      if (!bubble) return;
      bubble.textContent = text;
      bubble.classList.add('show');
      if (this.bubbleTimer) clearTimeout(this.bubbleTimer);
      this.bubbleTimer = setTimeout(() => {
        bubble.classList.remove('show');
      }, duration);
    }

    startRandomMessages() {
      const schedule = () => {
        const delay = 45000 + Math.random() * 60000;
        this.randomTimer = setTimeout(() => {
          const bubble = this.shadowRoot.getElementById('speech-bubble');
          if (bubble && !bubble.classList.contains('show') && !this.isDragging) {
            const msg = this.pickMessage(RANDOM_MESSAGES);
            const prev = this.currentEmotion;
            const emotion = msg.emotion || 'happy';
            this.setEmotion(emotion);
            this.say(msg.text, 3500);
            setTimeout(() => this.setEmotion(prev), 3500);
          }
          schedule();
        }, delay);
      };
      schedule();
    }

    startBlinking() {
      this.blinkTimer = setInterval(() => {
        if (!['neutral', 'happy', 'welcome'].includes(this.currentEmotion)) return;
        const svg = this.shadowRoot.querySelector('#svg-container svg');
        if (!svg) return;
        const eyes = svg.querySelectorAll('circle[r="13"]');
        eyes.forEach(e => { e.style.transform = 'scaleY(0.1)'; e.style.transformOrigin = 'center'; });
        setTimeout(() => { eyes.forEach(e => e.style.transform = ''); }, 140);
      }, 4500 + Math.random() * 3000);
    }

    // ======================= API PÚBLICA =======================
    setGrade(grade) {
      this.grade = grade || null;
      this.setAttribute('grade', grade || '');
    }

    welcome() {
      this.setEmotion('welcome');
      this.say("¡Hola! Soy Rigo, tu compañero de estudio. Escribe tu NIE", 7000);
    }

    loginSuccess(name) {
      this.setEmotion('excited');
      const msg = name ? `¡Hola ${name}! ¡A estudiar!` : "¡Bienvenido! ¡A estudiar!";
      this.say(msg, 4000);
      setTimeout(() => this.setEmotion('neutral'), 4000);
    }

    inviteGame() {
      this.setEmotion('game');
      this.say("¿Una partida rápida? 🎮", 5000);
    }

    cheer() {
      this.setEmotion('excited');
      const msg = CHEER_MESSAGES[Math.floor(Math.random() * CHEER_MESSAGES.length)];
      this.say(msg, 2500);
      
      if (this.emotionTimer) clearTimeout(this.emotionTimer);
      this.emotionTimer = setTimeout(() => this.setEmotion('happy'), 2500);
    }

    comfort() {
      this.setEmotion('sad');
      const msg = COMFORT_MESSAGES[Math.floor(Math.random() * COMFORT_MESSAGES.length)];
      this.say(msg, 3000);
      setTimeout(() => this.setEmotion('neutral'), 3000);
    }
  }

  customElements.define('rigo-mascot', RigoMascot);

  window.addEventListener('DOMContentLoaded', () => {
    window.rigo = document.querySelector('rigo-mascot');
  });
})();
