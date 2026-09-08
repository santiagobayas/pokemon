/* ==========================================================
   POKÉBOT - SISTEMA DE PARTÍCULAS, ANIMACIONES Y EFECTOS FX
========================================================== */

let platformParticles = [];
let battleParticles = [];
let floatingTexts = [];
let confettiPieces = [];

let fxCanvas, fxCtx;
let confCanvas, confCtx;

/* 1. PARTÍCULAS DE PLATAFORMAS (Polvo al pisar/saltar y destellos) */
function spawnDust(x, y) {
  for (let i = 0; i < 6; i++) {
    platformParticles.push({
      x: x + (Math.random() - 0.5) * 20,
      y: y - 2,
      vx: (Math.random() - 0.5) * 2.5,
      vy: -Math.random() * 2 - 0.5,
      radius: Math.random() * 5 + 3,
      alpha: 0.85,
      color: 'rgba(255, 255, 255, '
    });
  }
}

function spawnSparkles(x, y) {
  for (let i = 0; i < 16; i++) {
    platformParticles.push({
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 7,
      vy: (Math.random() - 0.5) * 7,
      radius: Math.random() * 4 + 2,
      alpha: 1,
      color: 'rgba(250, 204, 21, '
    });
  }
}

function renderPlatformParticles(ctx) {
  for (let i = platformParticles.length - 1; i >= 0; i--) {
    const p = platformParticles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.alpha -= 0.035;

    if (p.alpha <= 0) {
      platformParticles.splice(i, 1);
      continue;
    }

    ctx.fillStyle = `${p.color}${p.alpha})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

/* 2. PARTÍCULAS Y ANIMACIONES DE COMBATE */
function triggerMoveFX(fxType, isPlayer) {
  const startX = isPlayer ? 240 : 720;
  const startY = 170;
  const targetX = isPlayer ? 720 : 240;
  const targetY = 170;

  const count = (fxType === 'heal' || fxType === 'shield') ? 16 : 32;

  for (let i = 0; i < count; i++) {
    const angle = Math.atan2(targetY - startY, targetX - startX) + (Math.random() - 0.5) * 0.7;
    const isSelfFX = (fxType === 'heal' || fxType === 'shield');
    const speed = isSelfFX ? Math.random() * 2.5 : Math.random() * 10 + 6;

    battleParticles.push({
      x: isSelfFX ? startX + (Math.random() - 0.5) * 70 : startX,
      y: isSelfFX ? startY + (Math.random() - 0.5) * 70 : startY,
      vx: isSelfFX ? (Math.random() - 0.5) * 2.5 : Math.cos(angle) * speed,
      vy: isSelfFX ? -Math.random() * 2.5 - 0.5 : Math.sin(angle) * speed,
      type: fxType,
      size: Math.random() * 9 + 4,
      life: 32,
      maxLife: 32
    });
  }
}

function renderBattleEffects() {
  if (!fxCanvas) {
    fxCanvas = document.getElementById('battle-effects-canvas');
    if (!fxCanvas) return;
    fxCtx = fxCanvas.getContext('2d');
  }

  fxCtx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);

  // Render partículas
  for (let i = battleParticles.length - 1; i >= 0; i--) {
    const p = battleParticles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life--;

    if (p.life <= 0) {
      battleParticles.splice(i, 1);
      continue;
    }

    fxCtx.save();
    fxCtx.globalAlpha = Math.max(0, p.life / p.maxLife);

    if (p.type === 'electric') {
      fxCtx.strokeStyle = '#fde047';
      fxCtx.lineWidth = p.size;
      fxCtx.beginPath();
      fxCtx.moveTo(p.x, p.y);
      fxCtx.lineTo(p.x + (Math.random() - 0.5) * 35, p.y + (Math.random() - 0.5) * 35);
      fxCtx.stroke();
    } else if (p.type === 'fire') {
      fxCtx.fillStyle = p.life % 2 === 0 ? '#ea580c' : '#facc15';
      fxCtx.beginPath();
      fxCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      fxCtx.fill();
    } else if (p.type === 'water') {
      fxCtx.fillStyle = 'rgba(96, 165, 250, 0.85)';
      fxCtx.beginPath();
      fxCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      fxCtx.fill();
      fxCtx.strokeStyle = '#ffffff';
      fxCtx.lineWidth = 1.5;
      fxCtx.stroke();
    } else if (p.type === 'leaf') {
      fxCtx.fillStyle = '#22c55e';
      fxCtx.beginPath();
      fxCtx.ellipse(p.x, p.y, p.size, p.size / 2, p.life * 0.2, 0, Math.PI * 2);
      fxCtx.fill();
    } else if (p.type === 'heal') {
      fxCtx.fillStyle = '#4ade80';
      fxCtx.font = '24px sans-serif';
      fxCtx.fillText('💚', p.x, p.y);
    } else if (p.type === 'shield') {
      fxCtx.strokeStyle = '#38bdf8';
      fxCtx.fillStyle = 'rgba(56, 189, 248, 0.25)';
      fxCtx.lineWidth = 2.5;
      fxCtx.beginPath();
      fxCtx.arc(p.x, p.y, p.size * 1.5, 0, Math.PI * 2);
      fxCtx.stroke();
      fxCtx.fill();
    } else if (p.type === 'clank') {
      fxCtx.strokeStyle = '#facc15';
      fxCtx.lineWidth = 3;
      fxCtx.beginPath();
      fxCtx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
      fxCtx.stroke();
    } else {
      fxCtx.fillStyle = '#ffffff';
      fxCtx.beginPath();
      fxCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      fxCtx.fill();
    }

    fxCtx.restore();
  }

  // Render números de daño / cura flotantes
  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    const ft = floatingTexts[i];
    ft.y += ft.vy;
    ft.alpha -= 0.025;

    if (ft.alpha <= 0) {
      floatingTexts.splice(i, 1);
      continue;
    }

    fxCtx.save();
    fxCtx.globalAlpha = Math.max(0, ft.alpha);
    fxCtx.font = 'bold 32px Fredoka One, Nunito';
    fxCtx.textAlign = 'center';
    fxCtx.fillStyle = ft.color;
    fxCtx.strokeStyle = '#000000';
    fxCtx.lineWidth = 5;
    fxCtx.strokeText(ft.text, ft.x, ft.y);
    fxCtx.fillText(ft.text, ft.x, ft.y);
    fxCtx.restore();
  }
}

function spawnFloatingText(text, x, y, color) {
  floatingTexts.push({
    text: text,
    x: x,
    y: y,
    vy: -2.2,
    alpha: 1,
    color: color
  });
}

function triggerScreenShake() {
  const container = document.getElementById('game-container');
  if (!container) return;
  container.classList.add('screen-shaking');
  setTimeout(() => container.classList.remove('screen-shaking'), 350);
}

/* 3. CONFETI DE VICTORIA */
function initConfetti() {
  confettiPieces = [];
  const colors = ['#facc15', '#38bdf8', '#4ade80', '#f43f5e', '#a855f7', '#fb923c'];
  for (let i = 0; i < 90; i++) {
    confettiPieces.push({
      x: Math.random() * 960,
      y: Math.random() * -600,
      w: Math.random() * 12 + 6,
      h: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      vy: Math.random() * 3 + 2.5,
      vx: (Math.random() - 0.5) * 2,
      angle: Math.random() * 360,
      vAngle: (Math.random() - 0.5) * 6
    });
  }
}

function renderConfetti() {
  if (!confCanvas) {
    confCanvas = document.getElementById('confetti-canvas');
    if (!confCanvas) return;
    confCtx = confCanvas.getContext('2d');
  }

  confCtx.clearRect(0, 0, confCanvas.width, confCanvas.height);

  confettiPieces.forEach(c => {
    c.y += c.vy;
    c.x += c.vx;
    c.angle += c.vAngle;

    if (c.y > 600) {
      c.y = -20;
      c.x = Math.random() * 960;
    }

    confCtx.save();
    confCtx.translate(c.x, c.y);
    confCtx.rotate((c.angle * Math.PI) / 180);
    confCtx.fillStyle = c.color;
    confCtx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
    confCtx.restore();
  });
}
