/* ==========================================================
   POKÉBOT - MOTOR DEL JUEGO DE PLATAFORMAS Y BUCLE PRINCIPAL
========================================================== */

let carouselIndex = 0;
let selectedPoke = POKEMON_LIST[0];

let canvas, ctx;
let gameRunning = false;
let gearsFound = 0;
const TOTAL_GEARS = 8;
let keys = { left: false, right: false, jump: false };
let animationTick = 0;

// Sistema de cámara para el mundo extendido de 3600 px
let cameraX = 0;
const WORLD_WIDTH = 3600;

// Estado del jugador
let player = {
  x: 60,
  y: 430,
  w: 68,
  h: 68,
  vx: 0,
  vy: 0,
  speed: 5.4,
  jumpForce: -13.5,
  grounded: false,
  facing: 'right'
};

// Instancias dinámicas de plataformas, tuercas y rivales
let gamePlatforms = [];
let gameGears = [];
let gameRivals = [];

function getSelectedPoke() {
  return selectedPoke;
}

function setGameRunning(val) {
  gameRunning = val;
}

function advancePlayerAfterBattle() {
  player.x += (player.facing === 'right' ? 85 : -85);
  if (player.x < 0) player.x = 0;
  if (player.x + player.w > WORLD_WIDTH) player.x = WORLD_WIDTH - player.w;
}

/* ==========================================================
   NAVEGACIÓN Y PANTALLAS
========================================================== */
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');

  if (id === 'platformer-screen') {
    gameRunning = true;
    requestAnimationFrame(gameLoop);
  } else if (id === 'battle-screen') {
    gameRunning = false;
    requestAnimationFrame(battleLoop);
  } else if (id === 'victory-screen') {
    gameRunning = false;
    initConfetti();
    playSound('victory');
    requestAnimationFrame(confettiLoop);
  } else {
    gameRunning = false;
  }
}

function goToSelectScreen() {
  updateCarouselUI();
  showScreen('select-screen');
}

function updateCarouselUI() {
  selectedPoke = POKEMON_LIST[carouselIndex];
  const cImg = document.getElementById('carousel-img');
  
  const imgObj = safeLoadImage(selectedPoke.img, selectedPoke.fallbackImg);
  cImg.src = imgObj.src;
  cImg.onerror = () => {
    if (selectedPoke.fallbackImg && cImg.src !== selectedPoke.fallbackImg) {
      cImg.src = selectedPoke.fallbackImg;
    }
  };

  document.getElementById('carousel-name').textContent = selectedPoke.name;
  document.getElementById('carousel-indicator').textContent = `${carouselIndex + 1} / ${POKEMON_LIST.length}`;
}

function carouselPrev() {
  carouselIndex--;
  if (carouselIndex < 0) carouselIndex = POKEMON_LIST.length - 1;
  playSound('coin');
  updateCarouselUI();
}

function carouselNext() {
  carouselIndex++;
  if (carouselIndex >= POKEMON_LIST.length) carouselIndex = 0;
  playSound('coin');
  updateCarouselUI();
}

function startAdventure() {
  selectedPoke = POKEMON_LIST[carouselIndex];
  document.getElementById('hud-name').textContent = selectedPoke.name;
  resetGameWorld();
  showScreen('platformer-screen');
  startBGM();
}

function updateRivalsHUD() {
  const defeatedCount = gameRivals.filter(r => r.defeated).length;
  const rivalTag = document.getElementById('hud-rivals');
  if (rivalTag) rivalTag.textContent = defeatedCount;
}

function resetGameWorld() {
  player.x = 60;
  player.y = 430;
  player.vx = 0;
  player.vy = 0;
  cameraX = 0;
  gearsFound = 0;
  platformParticles = [];
  
  const gearsTag = document.getElementById('hud-gears');
  if (gearsTag) gearsTag.textContent = '0';

  // Plataformas estables del mundo
  gamePlatforms = PLATFORMS.map(p => ({ ...p }));
  
  // Generar 8 tuercas aleatorias en posiciones variadas de plataformas
  gameGears = generateRandomGears(TOTAL_GEARS);

  // Generar 6 rivales aleatorios por niveles excluyendo al Pokémon elegido
  gameRivals = generateRandomRivals(selectedPoke.pokeId);

  updateRivalsHUD();
}

function restartGame() {
  resetGameWorld();
  showScreen('platformer-screen');
}

/* ==========================================================
   CONTROLES (TECLADO Y TÁCTIL)
========================================================== */
window.addEventListener('keydown', e => {
  initAudio();
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
    if (document.getElementById('select-screen').classList.contains('active')) carouselPrev();
    else keys.left = true;
  }
  if (e.code === 'ArrowRight' || e.code === 'KeyD') {
    if (document.getElementById('select-screen').classList.contains('active')) carouselNext();
    else keys.right = true;
  }
  if ((e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') && player.grounded) {
    player.vy = player.jumpForce;
    player.grounded = false;
    playSound('jump');
    spawnDust(player.x + player.w / 2, player.y + player.h);
  }
});

window.addEventListener('keyup', e => {
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = false;
  if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = false;
});

function setTouch(act, val) {
  initAudio();
  if (act === 'left') keys.left = val;
  if (act === 'right') keys.right = val;
  if (act === 'jump' && val && player.grounded) {
    player.vy = player.jumpForce;
    player.grounded = false;
    playSound('jump');
    spawnDust(player.x + player.w / 2, player.y + player.h);
  }
}

/* ==========================================================
   BUCLE PRINCIPAL (PLATAFORMAS)
========================================================== */
function gameLoop() {
  if (!gameRunning) return;
  animationTick++;

  // Movimiento horizontal
  if (keys.left) {
    player.vx = -player.speed;
    player.facing = 'left';
    if (player.grounded && Math.random() < 0.25) {
      spawnDust(player.x + player.w * 0.7, player.y + player.h);
    }
  } else if (keys.right) {
    player.vx = player.speed;
    player.facing = 'right';
    if (player.grounded && Math.random() < 0.25) {
      spawnDust(player.x + player.w * 0.3, player.y + player.h);
    }
  } else {
    player.vx *= 0.82;
  }

  // Gravedad
  player.vy += 0.65;
  if (player.vy > 12) player.vy = 12;

  player.x += player.vx;
  player.y += player.vy;

  // Límites del mundo
  if (player.x < 0) player.x = 0;
  if (player.x + player.w > WORLD_WIDTH) player.x = WORLD_WIDTH - player.w;

  // Seguimiento suave de la cámara
  const targetCamX = player.x - 300;
  cameraX += (targetCamX - cameraX) * 0.1;
  if (cameraX < 0) cameraX = 0;
  if (cameraX > WORLD_WIDTH - 960) cameraX = WORLD_WIDTH - 960;

  // Colisión con plataformas
  player.grounded = false;
  gamePlatforms.forEach(p => {
    if (
      player.x + player.w * 0.7 > p.x &&
      player.x + player.w * 0.3 < p.x + p.w &&
      player.y + player.h >= p.y &&
      player.y + player.h <= p.y + 18 &&
      player.vy >= 0
    ) {
      if (!player.grounded && player.vy > 4) {
        spawnDust(player.x + player.w / 2, p.y);
      }
      player.y = p.y - player.h;
      player.vy = 0;
      player.grounded = true;
    }
  });

  // Recolección de tuercas doradas
  gameGears.forEach(g => {
    if (!g.taken) {
      const d = Math.hypot((player.x + player.w / 2) - g.x, (player.y + player.h / 2) - g.y);
      if (d < 42) {
        g.taken = true;
        gearsFound++;
        playSound('coin');
        spawnSparkles(g.x, g.y);
        const hudGears = document.getElementById('hud-gears');
        if (hudGears) hudGears.textContent = gearsFound;
      }
    }
  });

  // Encuentro con rivales
  gameRivals.forEach(r => {
    if (!r.defeated) {
      if (
        player.x + player.w * 0.8 > r.x &&
        player.x + player.w * 0.2 < r.x + r.w &&
        player.y + player.h > r.y &&
        player.y < r.y + r.h
      ) {
        startBattle(r);
      }
    }
  });

  // Condición de Victoria: vencer a los 6 rivales y recolectar las 8 tuercas
  if (gameRivals.length > 0 && gameRivals.every(r => r.defeated) && gearsFound >= TOTAL_GEARS) {
    gameRunning = false;
    setTimeout(() => {
      const vImg = document.getElementById('victory-img');
      if (vImg) vImg.src = selectedPoke.img;
      showScreen('victory-screen');
    }, 300);
    return;
  }

  // Renderizar gráficos
  renderCanvasWorld();

  requestAnimationFrame(gameLoop);
}

/* ==========================================================
   RENDERIZADO CON CÁMARA Y PARALLAX
========================================================== */
function renderCanvasWorld() {
  if (!canvas) {
    canvas = document.getElementById('gameCanvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
  }

  // 1. Cielo con degradado
  const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  skyGrad.addColorStop(0, '#38bdf8');
  skyGrad.addColorStop(0.6, '#7dd3fc');
  skyGrad.addColorStop(1, '#bae6fd');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. Sol resplandeciente (Parallax suave)
  const sunX = 850 - cameraX * 0.05;
  const sunY = 70;
  const sunGlow = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 65);
  sunGlow.addColorStop(0, 'rgba(254, 240, 138, 1)');
  sunGlow.addColorStop(0.4, 'rgba(250, 204, 21, 0.7)');
  sunGlow.addColorStop(1, 'rgba(250, 204, 21, 0)');
  ctx.fillStyle = sunGlow;
  ctx.beginPath();
  ctx.arc(sunX, sunY, 65, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.arc(sunX, sunY, 32, 0, Math.PI * 2);
  ctx.fill();

  // 3. Montañas de Fondo con Parallax
  drawParallaxMountains();

  // 4. Nubes flotantes
  drawCloud(180 - cameraX * 0.15, 85, 1.1);
  drawCloud(540 - cameraX * 0.15, 110, 0.9);
  drawCloud(950 - cameraX * 0.15, 75, 1.2);
  drawCloud(1400 - cameraX * 0.15, 120, 0.85);
  drawCloud(1850 - cameraX * 0.15, 90, 1.05);
  drawCloud(2300 - cameraX * 0.15, 105, 1.0);
  drawCloud(2850 - cameraX * 0.15, 80, 1.15);
  drawCloud(3300 - cameraX * 0.15, 115, 0.95);

  // Traslación de cámara para el mundo
  ctx.save();
  ctx.translate(-cameraX, 0);

  // 5. Plataformas
  gamePlatforms.forEach(p => drawStylizedPlatform(p));

  // 6. Tuercas Doradas
  gameGears.forEach(g => {
    if (!g.taken) drawGoldenGear(g.x, g.y, animationTick);
  });

  // 7. Rivales
  gameRivals.forEach(r => {
    if (!r.defeated) drawRival(r);
  });

  // 8. Jugador Pokémon
  drawPlayer();

  // 9. Partículas
  renderPlatformParticles(ctx);

  ctx.restore();
}

function drawParallaxMountains() {
  ctx.save();
  // Capa lejana
  ctx.fillStyle = '#93c5fd';
  ctx.beginPath();
  ctx.moveTo(0, 520);
  for (let x = -200; x < 4000; x += 300) {
    const peakX = x - cameraX * 0.2;
    ctx.lineTo(peakX, 350 + (x % 40));
    ctx.lineTo(peakX + 150, 520);
  }
  ctx.lineTo(canvas.width, 520);
  ctx.fill();

  // Capa cercana
  ctx.fillStyle = '#86efac';
  ctx.beginPath();
  ctx.moveTo(0, 520);
  for (let x = -200; x < 4000; x += 400) {
    const hillX = x - cameraX * 0.4;
    ctx.quadraticCurveTo(hillX + 200, 420, hillX + 400, 520);
  }
  ctx.fill();
  ctx.restore();
}

function drawCloud(x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  
  ctx.fillStyle = 'rgba(203, 213, 225, 0.4)';
  ctx.beginPath();
  ctx.arc(0, 6, 26, 0, Math.PI * 2);
  ctx.arc(28, 6, 34, 0, Math.PI * 2);
  ctx.arc(58, 6, 26, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.beginPath();
  ctx.arc(0, 0, 26, 0, Math.PI * 2);
  ctx.arc(28, -6, 34, 0, Math.PI * 2);
  ctx.arc(58, 0, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawStylizedPlatform(p) {
  ctx.save();
  const radius = p.isGround ? 0 : 12;

  // Tierra / base
  const dirtGrad = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.h);
  dirtGrad.addColorStop(0, '#92400e');
  dirtGrad.addColorStop(1, '#451a03');
  ctx.fillStyle = dirtGrad;
  
  ctx.beginPath();
  ctx.roundRect(p.x, p.y, p.w, p.h, [radius, radius, radius, radius]);
  ctx.fill();

  // Césped
  const grassHeight = p.isGround ? 16 : 10;
  const grassGrad = ctx.createLinearGradient(p.x, p.y, p.x, p.y + grassHeight);
  grassGrad.addColorStop(0, '#4ade80');
  grassGrad.addColorStop(1, '#16a34a');
  ctx.fillStyle = grassGrad;

  ctx.beginPath();
  ctx.roundRect(p.x, p.y, p.w, grassHeight, [radius, radius, 0, 0]);
  ctx.fill();

  // Borde iluminado
  ctx.strokeStyle = '#86efac';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(p.x + radius, p.y + 1);
  ctx.lineTo(p.x + p.w - radius, p.y + 1);
  ctx.stroke();

  // Flores decorativas
  if (!p.isGround) {
    drawFlower(p.x + 20, p.y - 4, '#f43f5e');
    drawFlower(p.x + p.w - 25, p.y - 4, '#38bdf8');
  }

  // Sombra
  if (!p.isGround) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.beginPath();
    ctx.ellipse(p.x + p.w / 2, p.y + p.h + 20, p.w * 0.45, 8, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawFlower(x, y, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x - 3, y - 3, 3, 0, Math.PI * 2);
  ctx.arc(x + 3, y - 3, 3, 0, Math.PI * 2);
  ctx.arc(x, y - 6, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.arc(x, y - 3, 2, 0, Math.PI * 2);
  ctx.fill();
}

function drawGoldenGear(x, y, tick) {
  ctx.save();
  const floatY = y + Math.sin(tick * 0.08) * 4;
  
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.beginPath();
  ctx.ellipse(x, y + 25, 14, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.translate(x, floatY);
  ctx.rotate(tick * 0.04);

  ctx.fillStyle = '#ca8a04';
  for (let i = 0; i < 6; i++) {
    ctx.rotate(Math.PI / 3);
    ctx.fillRect(-17, -5, 34, 10);
  }

  const gearGrad = ctx.createRadialGradient(0, -4, 2, 0, 0, 16);
  gearGrad.addColorStop(0, '#fef08a');
  gearGrad.addColorStop(0.5, '#eab308');
  gearGrad.addColorStop(1, '#a16207');
  ctx.fillStyle = gearGrad;
  ctx.beginPath();
  ctx.arc(0, 0, 14, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.arc(0, 0, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawRival(r) {
  ctx.save();
  const floatY = Math.sin(animationTick * 0.06 + r.x) * 4;
  const currY = r.y + floatY;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.beginPath();
  ctx.ellipse(r.x + r.w / 2, r.y + r.h - 2, r.w * 0.35, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  const imgObj = safeLoadImage(r.img, r.fallbackImg);
  if (imgObj && imgObj.complete && imgObj.naturalWidth > 0) {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(imgObj, r.x, currY, r.w, r.h);
  }

  // Cartelito con el nombre del rival
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.beginPath();
  ctx.roundRect(r.x + r.w / 2 - 38, currY - 26, 76, 20, 10);
  ctx.fill();
  ctx.strokeStyle = '#f87171';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px Fredoka One, Nunito';
  ctx.textAlign = 'center';
  ctx.fillText(r.name, r.x + r.w / 2, currY - 12);

  ctx.restore();
}

function drawPlayer() {
  ctx.save();
  
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.beginPath();
  ctx.ellipse(player.x + player.w / 2, player.y + player.h - 2, player.w * 0.35, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  const bobbing = (Math.abs(player.vx) > 0.5 && player.grounded) ? Math.sin(animationTick * 0.3) * 3 : 0;

  const pImg = safeLoadImage(selectedPoke.img, selectedPoke.fallbackImg);
  if (pImg && pImg.complete && pImg.naturalWidth > 0) {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    if (player.facing === 'right') {
      ctx.translate(player.x + player.w, player.y + bobbing);
      ctx.scale(-1, 1);
      ctx.drawImage(pImg, 0, 0, player.w, player.h);
    } else {
      ctx.drawImage(pImg, player.x, player.y + bobbing, player.w, player.h);
    }
  }
  ctx.restore();
}

function battleLoop() {
  if (document.getElementById('battle-screen').classList.contains('active')) {
    renderBattleEffects();
    requestAnimationFrame(battleLoop);
  }
}

function confettiLoop() {
  if (document.getElementById('victory-screen').classList.contains('active')) {
    renderConfetti();
    requestAnimationFrame(confettiLoop);
  }
}

/* ==========================================================
   INICIALIZACIÓN
========================================================== */
window.onload = () => {
  preloadAllGameImages();
  resetGameWorld();
  goToSelectScreen();
};
