/* ==========================================================
   POKÉBOT - DATOS DEL JUEGO, POOL DE RIVALES Y ALEATORIEDAD
========================================================== */

// Helper para URLs de sprites oficiales con fallback automático a jsDelivr CDN
function createPokeObj(name, pokeId, hp, moves) {
  return {
    name,
    pokeId,
    img: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokeId}.png`,
    fallbackImg: `https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/other/official-artwork/${pokeId}.png`,
    hp: hp || 100,
    moves: moves || [
      { name: 'Placaje', power: 30, heal: 0, fx: 'normal' },
      { name: 'Ataque Rápido', power: 35, heal: 0, fx: 'normal' },
      { name: 'Descanso', power: 0, heal: 40, fx: 'heal' }
    ]
  };
}

// 12 POKÉMON SELECCIONABLES POR EL JUGADOR (Con carga local instantánea)
const POKEMON_LIST = [
  {
    id: 'pikachu',
    name: 'Pikachu',
    pokeId: 25,
    img: 'assets/pokemon/25.png',
    fallbackImg: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/other/official-artwork/25.png',
    hp: 100,
    moves: [
      { name: '💥 Rayo', power: 32, heal: 0, shield: false, fx: 'electric', category: 'strong', desc: 'Ataque eléctrico potente' },
      { name: '⚡ Ataque Rápido', power: 18, heal: 0, shield: false, fx: 'normal', category: 'quick', desc: 'Golpe veloz y seguro' },
      { name: '🛡️ Pantalla de Luz', power: 0, heal: 0, shield: true, fx: 'shield', category: 'shield', desc: 'Bloquea 75% y contraataca' },
      { name: '💚 Descanso', power: 0, heal: 48, shield: false, fx: 'heal', category: 'heal', desc: 'Restaura +48 HP de energía' }
    ]
  },
  {
    id: 'charmander',
    name: 'Charmander',
    pokeId: 4,
    img: 'assets/pokemon/4.png',
    fallbackImg: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/other/official-artwork/4.png',
    hp: 100,
    moves: [
      { name: '💥 Lanzallamas', power: 34, heal: 0, shield: false, fx: 'fire', category: 'strong', desc: 'Ráfaga ardiente' },
      { name: '⚡ Arañazo', power: 18, heal: 0, shield: false, fx: 'normal', category: 'quick', desc: 'Ataque frontal rápido' },
      { name: '🛡️ Protección', power: 0, heal: 0, shield: true, fx: 'shield', category: 'shield', desc: 'Bloquea 75% y contraataca' },
      { name: '💚 Descanso', power: 0, heal: 48, shield: false, fx: 'heal', category: 'heal', desc: 'Restaura +48 HP de energía' }
    ]
  },
  {
    id: 'charizard',
    name: 'Charizard',
    pokeId: 6,
    img: 'assets/pokemon/6.png',
    fallbackImg: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/other/official-artwork/6.png',
    hp: 110,
    moves: [
      { name: '💥 Lanzallamas', power: 35, heal: 0, shield: false, fx: 'fire', category: 'strong', desc: 'Fuego devastador' },
      { name: '⚡ Vuelo', power: 20, heal: 0, shield: false, fx: 'normal', category: 'quick', desc: 'Picado veloz' },
      { name: '🛡️ Giro Defensivo', power: 0, heal: 0, shield: true, fx: 'shield', category: 'shield', desc: 'Bloquea 75% y contraataca' },
      { name: '💚 Respiro', power: 0, heal: 52, shield: false, fx: 'heal', category: 'heal', desc: 'Restaura +52 HP de energía' }
    ]
  },
  {
    id: 'squirtle',
    name: 'Squirtle',
    pokeId: 7,
    img: 'assets/pokemon/7.png',
    fallbackImg: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/other/official-artwork/7.png',
    hp: 100,
    moves: [
      { name: '💥 Hidrobomba', power: 33, heal: 0, shield: false, fx: 'water', category: 'strong', desc: 'Chorro de alta presión' },
      { name: '⚡ Pistola Agua', power: 18, heal: 0, shield: false, fx: 'water', category: 'quick', desc: 'Disparo acuático rápido' },
      { name: '🛡️ Refugio', power: 0, heal: 0, shield: true, fx: 'shield', category: 'shield', desc: 'Bloquea 75% y contraataca' },
      { name: '💚 Hidrocura', power: 0, heal: 48, shield: false, fx: 'heal', category: 'heal', desc: 'Restaura +48 HP de energía' }
    ]
  },
  {
    id: 'blastoise',
    name: 'Blastoise',
    pokeId: 9,
    img: 'assets/pokemon/9.png',
    fallbackImg: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/other/official-artwork/9.png',
    hp: 115,
    moves: [
      { name: '💥 Hidrobomba', power: 35, heal: 0, shield: false, fx: 'water', category: 'strong', desc: 'Cañones acuáticos dobles' },
      { name: '⚡ Hidroariete', power: 20, heal: 0, shield: false, fx: 'water', category: 'quick', desc: 'Carga acuática' },
      { name: '🛡️ Caparazón Férreo', power: 0, heal: 0, shield: true, fx: 'shield', category: 'shield', desc: 'Bloquea 75% y contraataca' },
      { name: '💚 Refugio', power: 0, heal: 54, shield: false, fx: 'heal', category: 'heal', desc: 'Restaura +54 HP de energía' }
    ]
  },
  {
    id: 'bulbasaur',
    name: 'Bulbasaur',
    pokeId: 1,
    img: 'assets/pokemon/1.png',
    fallbackImg: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/other/official-artwork/1.png',
    hp: 100,
    moves: [
      { name: '💥 Hoja Afilada', power: 33, heal: 0, shield: false, fx: 'leaf', category: 'strong', desc: 'Corte de hojas filosas' },
      { name: '⚡ Látigo Cepa', power: 18, heal: 0, shield: false, fx: 'leaf', category: 'quick', desc: 'Latigazo veloz' },
      { name: '🛡️ Barrera Verde', power: 0, heal: 0, shield: true, fx: 'shield', category: 'shield', desc: 'Bloquea 75% y contraataca' },
      { name: '💚 Síntesis', power: 0, heal: 48, shield: false, fx: 'heal', category: 'heal', desc: 'Restaura +48 HP de energía' }
    ]
  },
  {
    id: 'eevee',
    name: 'Eevee',
    pokeId: 133,
    img: 'assets/pokemon/133.png',
    fallbackImg: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/other/official-artwork/133.png',
    hp: 100,
    moves: [
      { name: '💥 Mordisco', power: 32, heal: 0, shield: false, fx: 'normal', category: 'strong', desc: 'Mordida contundente' },
      { name: '⚡ Ataque Rápido', power: 18, heal: 0, shield: false, fx: 'normal', category: 'quick', desc: 'Embestida ágil' },
      { name: '🛡️ Protección', power: 0, heal: 0, shield: true, fx: 'shield', category: 'shield', desc: 'Bloquea 75% y contraataca' },
      { name: '💚 Deseo', power: 0, heal: 48, shield: false, fx: 'heal', category: 'heal', desc: 'Restaura +48 HP de energía' }
    ]
  },
  {
    id: 'lucario',
    name: 'Lucario',
    pokeId: 448,
    img: 'assets/pokemon/448.png',
    fallbackImg: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/other/official-artwork/448.png',
    hp: 105,
    moves: [
      { name: '💥 Esfera Aural', power: 34, heal: 0, shield: false, fx: 'electric', category: 'strong', desc: 'Energía de aura infalible' },
      { name: '⚡ Puño Incremento', power: 19, heal: 0, shield: false, fx: 'normal', category: 'quick', desc: 'Puñetazo dinámico' },
      { name: '🛡️ Escudo Aural', power: 0, heal: 0, shield: true, fx: 'shield', category: 'shield', desc: 'Bloquea 75% y contraataca' },
      { name: '💚 Paz Mental', power: 0, heal: 50, shield: false, fx: 'heal', category: 'heal', desc: 'Restaura +50 HP de energía' }
    ]
  },
  {
    id: 'gengar',
    name: 'Gengar',
    pokeId: 94,
    img: 'assets/pokemon/94.png',
    fallbackImg: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/other/official-artwork/94.png',
    hp: 100,
    moves: [
      { name: '💥 Bola Sombra', power: 34, heal: 0, shield: false, fx: 'leaf', category: 'strong', desc: 'Proyectil sombrío' },
      { name: '⚡ Tinieblas', power: 18, heal: 0, shield: false, fx: 'normal', category: 'quick', desc: 'Rayo fantasmal rápido' },
      { name: '🛡️ Sustituto', power: 0, heal: 0, shield: true, fx: 'shield', category: 'shield', desc: 'Bloquea 75% y contraataca' },
      { name: '💚 Hipnosis Curativa', power: 0, heal: 48, shield: false, fx: 'heal', category: 'heal', desc: 'Restaura +48 HP de energía' }
    ]
  },
  {
    id: 'snorlax',
    name: 'Snorlax',
    pokeId: 143,
    img: 'assets/pokemon/143.png',
    fallbackImg: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/other/official-artwork/143.png',
    hp: 120,
    moves: [
      { name: '💥 Golpe Cuerpo', power: 34, heal: 0, shield: false, fx: 'normal', category: 'strong', desc: 'Impacto pesado colosal' },
      { name: '⚡ Cabezazo', power: 18, heal: 0, shield: false, fx: 'normal', category: 'quick', desc: 'Golpe de frente' },
      { name: '🛡️ Barrera Gruesa', power: 0, heal: 0, shield: true, fx: 'shield', category: 'shield', desc: 'Bloquea 75% y contraataca' },
      { name: '💚 Descanso', power: 0, heal: 56, shield: false, fx: 'heal', category: 'heal', desc: 'Restaura +56 HP de energía' }
    ]
  },
  {
    id: 'greninja',
    name: 'Greninja',
    pokeId: 658,
    img: 'assets/pokemon/658.png',
    fallbackImg: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/other/official-artwork/658.png',
    hp: 100,
    moves: [
      { name: '💥 Shuriken de Agua', power: 34, heal: 0, shield: false, fx: 'water', category: 'strong', desc: 'Estrellas ninja acuáticas' },
      { name: '⚡ Golpe Aéreo', power: 18, heal: 0, shield: false, fx: 'normal', category: 'quick', desc: 'Tajo ninja veloz' },
      { name: '🛡️ Sustituto Ninja', power: 0, heal: 0, shield: true, fx: 'shield', category: 'shield', desc: 'Bloquea 75% y contraataca' },
      { name: '💚 Recuperación', power: 0, heal: 48, shield: false, fx: 'heal', category: 'heal', desc: 'Restaura +48 HP de energía' }
    ]
  },
  {
    id: 'cinderace',
    name: 'Cinderace',
    pokeId: 815,
    img: 'assets/pokemon/815.png',
    fallbackImg: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/other/official-artwork/815.png',
    hp: 105,
    moves: [
      { name: '💥 Balón Ígneo', power: 34, heal: 0, shield: false, fx: 'fire', category: 'strong', desc: 'Chut ígneo imparable' },
      { name: '⚡ Nitrocarga', power: 19, heal: 0, shield: false, fx: 'fire', category: 'quick', desc: 'Carrera ardiente' },
      { name: '🛡️ Finta Defensiva', power: 0, heal: 0, shield: true, fx: 'shield', category: 'shield', desc: 'Bloquea 75% y contraataca' },
      { name: '💚 Descanso', power: 0, heal: 50, shield: false, fx: 'heal', category: 'heal', desc: 'Restaura +50 HP de energía' }
    ]
  }
];

// GRAN POOL DE RIVALES POR NIVELES PARA GENERACIÓN ALEATORIA
const RIVAL_TIERS = {
  // Nivel 1 (x: 620): Rivales iniciales
  tier1: [
    { name: 'Meowth', pokeId: 52, hp: 65 },
    { name: 'Psyduck', pokeId: 54, hp: 65 },
    { name: 'Pikachu', pokeId: 25, hp: 65 },
    { name: 'Clefairy', pokeId: 35, hp: 65 },
    { name: 'Growlithe', pokeId: 58, hp: 70 },
    { name: 'Poliwag', pokeId: 60, hp: 65 }
  ],
  // Nivel 2 (x: 1060): Bosque robótico
  tier2: [
    { name: 'Jigglypuff', pokeId: 39, hp: 70 },
    { name: 'Geodude', pokeId: 74, hp: 75 },
    { name: 'Poliwhirl', pokeId: 61, hp: 75 },
    { name: 'Cubone', pokeId: 104, hp: 70 },
    { name: 'Magnemite', pokeId: 81, hp: 70 },
    { name: 'Haunter', pokeId: 93, hp: 75 }
  ],
  // Nivel 3 (x: 1670): Media distancia
  tier3: [
    { name: 'Machop', pokeId: 66, hp: 80 },
    { name: 'Scyther', pokeId: 123, hp: 80 },
    { name: 'Kadabra', pokeId: 64, hp: 80 },
    { name: 'Hitmonlee', pokeId: 106, hp: 80 },
    { name: 'Magneton', pokeId: 82, hp: 80 },
    { name: 'Primeape', pokeId: 57, hp: 80 }
  ],
  // Nivel 4 (x: 2110): Torres eléctricas
  tier4: [
    { name: 'Electabuzz', pokeId: 125, hp: 85 },
    { name: 'Magmar', pokeId: 126, hp: 85 },
    { name: 'Pinsir', pokeId: 127, hp: 85 },
    { name: 'Gengar', pokeId: 94, hp: 85 },
    { name: 'Jolteon', pokeId: 135, hp: 85 },
    { name: 'Alakazam', pokeId: 65, hp: 85 }
  ],
  // Nivel 5 (x: 2550): Rivales pesados
  tier5: [
    { name: 'Gyarados', pokeId: 130, hp: 90 },
    { name: 'Dragonite', pokeId: 149, hp: 90 },
    { name: 'Onix', pokeId: 95, hp: 90 },
    { name: 'Lapras', pokeId: 131, hp: 90 },
    { name: 'Snorlax', pokeId: 143, hp: 95 },
    { name: 'Charizard', pokeId: 6, hp: 90 }
  ],
  // Nivel 6 (x: 3260): Jefe final Legendario
  tier6: [
    { name: 'Mewtwo', pokeId: 150, hp: 100 },
    { name: 'Rayquaza', pokeId: 384, hp: 105 },
    { name: 'Zapdos', pokeId: 145, hp: 100 },
    { name: 'Articuno', pokeId: 144, hp: 100 },
    { name: 'Moltres', pokeId: 146, hp: 100 },
    { name: 'Lugia', pokeId: 249, hp: 105 }
  ]
};

// Ubicaciones de los 6 rivales en el mapa de 3600px
const RIVAL_SPAWN_LOCATIONS = [
  { x: 620, y: 345, w: 68, h: 68, tier: 'tier1' },
  { x: 1060, y: 345, w: 68, h: 68, tier: 'tier2' },
  { x: 1670, y: 285, w: 68, h: 68, tier: 'tier3' },
  { x: 2110, y: 235, w: 70, h: 70, tier: 'tier4' },
  { x: 2550, y: 245, w: 75, h: 75, tier: 'tier5' },
  { x: 3260, y: 155, w: 75, h: 75, tier: 'tier6' }
];

// PREGUNTAS DE ROBÓTICA Y CIENCIA
const QUESTIONS = [
  {
    q: '¿Qué le da energía al robot para funcionar?',
    correct: 0,
    opts: ['La Batería', 'Una Piedra', 'Un Zapato', 'Un Vaso']
  },
  {
    q: '¿Qué componente usa el robot para girar y andar?',
    correct: 1,
    opts: ['Un Lápiz', 'Las Ruedas', 'Una Cuchara', 'Un Libro']
  },
  {
    q: '¿Qué elemento electrónico emite luces de colores?',
    correct: 2,
    opts: ['Un Tornillo', 'Una Hoja', 'Luces LED', 'Un Botón']
  },
  {
    q: '¿Cuál es considerado el "cerebro" del robot?',
    correct: 0,
    opts: ['El Microchip', 'La Rueda', 'El Espejo', 'El Cable']
  },
  {
    q: '¿Por dónde viaja la corriente eléctrica?',
    correct: 3,
    opts: ['Por Madera', 'Por Lana', 'Por Papel', 'Por Cables de Cobre']
  },
  {
    q: '¿Qué dispositivo permite al robot detectar obstáculos?',
    correct: 1,
    opts: ['Un Tenedor', 'Un Sensor', 'Una Toalla', 'Un Sombrero']
  },
  {
    q: '¿Qué botón usamos para encender el sistema?',
    correct: 0,
    opts: ['Botón ON / Switch', 'Botón Silencio', 'Tornillo', 'Tapa']
  },
  {
    q: '¿Qué mecanismo usa un robot para levantar objetos pesados?',
    correct: 2,
    opts: ['Un Globo', 'Un Algodón', 'Un Brazo Robótico', 'Una Pluma']
  },
  {
    q: '¿Qué parte transmite el movimiento entre ejes mecánicos?',
    correct: 0,
    opts: ['Los Engranajes', 'Una Cuerda de Lana', 'Un Bloque de Hielo', 'Un Borrador']
  },
  {
    q: '¿Cómo le decimos a las instrucciones que sigue un robot?',
    correct: 1,
    opts: ['Música', 'Programa / Código', 'Dibujo', 'Poema']
  },
  {
    q: '¿Qué sensor usarías para que un robot siga una línea negra?',
    correct: 0,
    opts: ['Sensor Infrarrojo de Luz', 'Un Reloj de Arena', 'Un Termómetro', 'Un Espejo']
  },
  {
    q: '¿Qué tipo de energía limpia puede recargar a un robot?',
    correct: 2,
    opts: ['Energía de Caramelo', 'Vapor de Sopa', 'Energía Solar', 'Energía de Papel']
  }
];

// PLATAFORMAS (Mundo de 3600 px)
const PLATFORMS = [
  // Suelo extendido continuo
  { x: 0, y: 520, w: 3600, h: 80, isGround: true },

  // ZONA 1: Inicio
  { x: 170, y: 410, w: 150, h: 26 },
  { x: 370, y: 310, w: 160, h: 26 },
  { x: 570, y: 410, w: 150, h: 26 },

  // ZONA 2: Bosque Robótico
  { x: 780, y: 320, w: 170, h: 26 },
  { x: 1010, y: 410, w: 160, h: 26 },
  { x: 1220, y: 310, w: 180, h: 26 },
  { x: 1440, y: 220, w: 150, h: 26 },
  { x: 1620, y: 350, w: 160, h: 26 },

  // ZONA 3: Torres de Engranajes
  { x: 1850, y: 410, w: 160, h: 26 },
  { x: 2060, y: 300, w: 170, h: 26 },
  { x: 2280, y: 200, w: 160, h: 26 },
  { x: 2500, y: 320, w: 170, h: 26 },
  { x: 2720, y: 420, w: 160, h: 26 },

  // ZONA 4: Cima de la Fortaleza Tecnológica (Final)
  { x: 2950, y: 330, w: 180, h: 26 },
  { x: 3180, y: 230, w: 230, h: 26 }
];

// CANDIDATOS DE SPAWN PARA TUERCAS DORADAS (Se eligen 8 al azar)
const GEAR_CANDIDATE_LOCATIONS = [
  { x: 245, y: 360 },
  { x: 450, y: 260 },
  { x: 645, y: 360 },
  { x: 865, y: 270 },
  { x: 1100, y: 360 },
  { x: 1310, y: 260 },
  { x: 1515, y: 170 },
  { x: 1700, y: 300 },
  { x: 1930, y: 360 },
  { x: 2145, y: 250 },
  { x: 2360, y: 150 },
  { x: 2580, y: 270 },
  { x: 2800, y: 370 },
  { x: 3040, y: 280 },
  { x: 3295, y: 180 }
];

/* ==========================================================
   UTILIDADES DE ALEATORIEDAD
========================================================== */
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Genera 6 rivales aleatorios por nivel evitando que sea el Pokémon del jugador
function generateRandomRivals(playerPokeId) {
  return RIVAL_SPAWN_LOCATIONS.map((loc) => {
    const pool = RIVAL_TIERS[loc.tier].filter(p => p.pokeId !== playerPokeId);
    const chosen = pool[Math.floor(Math.random() * pool.length)];

    return {
      name: chosen.name,
      pokeId: chosen.pokeId,
      img: `assets/pokemon/${chosen.pokeId}.png`,
      fallbackImg: `https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/other/official-artwork/${chosen.pokeId}.png`,
      x: loc.x,
      y: loc.y,
      w: loc.w,
      h: loc.h,
      hp: chosen.hp,
      maxHp: chosen.hp,
      defeated: false
    };
  });
}

// Genera 8 tuercas aleatorias en posiciones variadas
function generateRandomGears(count = 8) {
  const shuffled = shuffleArray(GEAR_CANDIDATE_LOCATIONS);
  return shuffled.slice(0, count).map(loc => ({
    x: loc.x,
    y: loc.y,
    taken: false
  }));
}

/* ==========================================================
   GESTOR RESILIENTE DE IMÁGENES
========================================================== */
const loadedImages = {};

function safeLoadImage(primaryUrl, fallbackUrl) {
  if (loadedImages[primaryUrl]) return loadedImages[primaryUrl];

  const img = new Image();
  
  img.onerror = () => {
    if (fallbackUrl && img.src !== fallbackUrl) {
      console.warn(`Fallback de imagen para: ${primaryUrl}`);
      img.src = fallbackUrl;
    }
  };

  img.src = primaryUrl;
  loadedImages[primaryUrl] = img;
  if (fallbackUrl) {
    loadedImages[fallbackUrl] = img;
  }
  return img;
}

function preloadAllGameImages() {
  POKEMON_LIST.forEach(p => safeLoadImage(p.img, p.fallbackImg));
  
  // Pre-cargar todos los posibles rivales
  Object.values(RIVAL_TIERS).forEach(tierList => {
    tierList.forEach(r => {
      const primary = `assets/pokemon/${r.pokeId}.png`;
      const fallback = `https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/other/official-artwork/${r.pokeId}.png`;
      safeLoadImage(primary, fallback);
    });
  });
}
