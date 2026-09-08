/* ==========================================================
   POKÉBOT - SISTEMA TÁCTICO DE BATALLA, BLOQUEO Y EQUILIBRIO
========================================================== */

let activeRival = null;
let playerHp = 100;
let rivalHp = 100;
let currentChosenMove = null;

let playerShieldActive = false;
let enemyCharging = false;

function startBattle(rival) {
  setGameRunning(false);
  activeRival = rival;
  playerHp = getSelectedPoke().hp;
  rivalHp = rival.hp;
  playerShieldActive = false;
  enemyCharging = false;
  battleParticles = [];
  floatingTexts = [];

  const playerPoke = getSelectedPoke();
  const pImg = safeLoadImage(playerPoke.img, playerPoke.fallbackImg);
  const rImg = safeLoadImage(rival.img, rival.fallbackImg);

  document.getElementById('b-pname').textContent = playerPoke.name;
  const pImgEl = document.getElementById('b-pimg');
  pImgEl.src = pImg.src;
  pImgEl.classList.remove('shield-active');
  pImgEl.onerror = () => {
    if (playerPoke.fallbackImg && pImgEl.src !== playerPoke.fallbackImg) {
      pImgEl.src = playerPoke.fallbackImg;
    }
  };

  document.getElementById('b-ename').textContent = rival.name;
  const rImgEl = document.getElementById('b-eimg');
  rImgEl.src = rImg.src;
  rImgEl.classList.remove('charging-aura');
  rImgEl.onerror = () => {
    if (rival.fallbackImg && rImgEl.src !== rival.fallbackImg) {
      rImgEl.src = rival.fallbackImg;
    }
  };

  updateHpUI();
  renderBattleButtons();
  document.getElementById('b-msg').textContent = '¿Qué estrategia quieres usar?';

  // Aplicar escenario temático según la zona del rival
  const bScreen = document.getElementById('battle-screen');
  if (bScreen) {
    bScreen.classList.remove('theme-meadow', 'theme-forest', 'theme-steampunk', 'theme-electric', 'theme-ocean', 'theme-boss');
    if (rival.x < 750) {
      bScreen.classList.add('theme-meadow');
    } else if (rival.x < 1700) {
      bScreen.classList.add('theme-forest');
    } else if (rival.x < 2200) {
      bScreen.classList.add('theme-steampunk');
    } else if (rival.x < 2600) {
      bScreen.classList.add('theme-electric');
    } else if (rival.x < 3100) {
      bScreen.classList.add('theme-ocean');
    } else {
      bScreen.classList.add('theme-boss');
    }
  }

  showScreen('battle-screen');
}

function updateHpUI() {
  const currentPoke = getSelectedPoke();
  const pPct = Math.max(0, (playerHp / currentPoke.hp) * 100);
  const rPct = Math.max(0, (rivalHp / activeRival.maxHp) * 100);

  const pBar = document.getElementById('b-php');
  const rBar = document.getElementById('b-ehp');

  if (pBar) {
    pBar.style.width = pPct + '%';
    pBar.style.background = pPct < 30 ? 'linear-gradient(90deg, #f87171, #ef4444)' : (pPct < 60 ? 'linear-gradient(90deg, #facc15, #eab308)' : 'linear-gradient(90deg, #4ade80, #22c55e)');
  }
  if (rBar) {
    rBar.style.width = rPct + '%';
    rBar.style.background = rPct < 30 ? 'linear-gradient(90deg, #f87171, #ef4444)' : (rPct < 60 ? 'linear-gradient(90deg, #facc15, #eab308)' : 'linear-gradient(90deg, #4ade80, #22c55e)');
  }
}

function renderBattleButtons() {
  const container = document.getElementById('b-moves-grid');
  if (!container) return;
  container.innerHTML = '';

  const currentPoke = getSelectedPoke();
  currentPoke.moves.forEach(move => {
    const btn = document.createElement('button');
    btn.className = `battle-action-btn btn-${move.category || 'strong'}`;
    
    btn.innerHTML = `
      <span>${move.name}</span>
      <span class="btn-desc">${move.desc || ''}</span>
    `;
    
    btn.onclick = () => openQuestion(move);
    container.appendChild(btn);
  });
}

function openQuestion(move) {
  currentChosenMove = move;
  playSound('coin');

  const modal = document.getElementById('question-modal');
  const randQ = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];

  document.getElementById('q-title').textContent = randQ.q;
  const btnBox = document.getElementById('q-buttons');
  btnBox.innerHTML = '';

  // Mezclar opciones aleatoriamente para mayor variedad
  const mappedOpts = randQ.opts.map((text, idx) => ({
    text,
    isCorrect: idx === randQ.correct
  }));
  const shuffledOpts = shuffleArray(mappedOpts);

  shuffledOpts.forEach((optObj) => {
    const btn = document.createElement('button');
    btn.className = 'q-opt';
    btn.textContent = optObj.text;
    btn.dataset.correct = optObj.isCorrect ? 'true' : 'false';
    btn.onclick = () => submitAnswer(optObj.isCorrect, btn);
    btnBox.appendChild(btn);
  });

  modal.classList.add('active');
}

function submitAnswer(isOk, btn) {
  const all = document.querySelectorAll('.q-opt');
  all.forEach(b => b.disabled = true);

  if (isOk) {
    btn.classList.add('correct');
    playSound('good');
  } else {
    btn.classList.add('wrong');
    all.forEach(b => {
      if (b.dataset.correct === 'true') {
        b.classList.add('correct');
      }
    });
    playSound('bad');
  }

  setTimeout(() => {
    document.getElementById('question-modal').classList.remove('active');
    runTurn(isOk);
  }, 950);
}

function runTurn(success) {
  const playerSprite = document.getElementById('b-pimg');
  const enemySprite = document.getElementById('b-eimg');
  const playerPoke = getSelectedPoke();

  if (success) {
    // 1. ACCIÓN DE BLOQUEO / ESCUDO
    if (currentChosenMove.category === 'shield' || currentChosenMove.shield) {
      playerShieldActive = true;
      playerSprite.classList.add('shield-active');
      document.getElementById('b-msg').textContent = `¡${playerPoke.name} activó ${currentChosenMove.name}! (Bloqueará 75% del próximo daño)`;
      playSound('shield');
      triggerMoveFX('shield', true);
      spawnFloatingText('🛡️ ¡ESCUDO ACTIVO!', 240, 120, '#38bdf8');

      setTimeout(() => {
        enemyTurn();
      }, 1000);
      return;
    }

    // 2. ACCIÓN DE CURACIÓN
    if (currentChosenMove.category === 'heal' || currentChosenMove.heal > 0) {
      const healAmount = currentChosenMove.heal || 48;
      playerHp = Math.min(playerPoke.hp, playerHp + healAmount);
      updateHpUI();
      
      document.getElementById('b-msg').textContent = `¡${playerPoke.name} usó ${currentChosenMove.name} y recuperó +${healAmount} HP!`;
      playSound('heal');
      triggerMoveFX('heal', true);
      spawnFloatingText(`+${healAmount} HP 💚`, 240, 120, '#4ade80');

      setTimeout(() => {
        enemyTurn();
      }, 1100);
      return;
    }

    // 3. ATAQUES OFENSIVOS (Fuerte o Rápido)
    document.getElementById('b-msg').textContent = `¡${playerPoke.name} ejecutó ${currentChosenMove.name}!`;
    playSound(currentChosenMove.fx || 'attack');
    playerSprite.style.animation = 'attackShake 0.4s ease';

    triggerMoveFX(currentChosenMove.fx || 'normal', true);

    setTimeout(() => {
      triggerScreenShake();
      
      const dmg = currentChosenMove.power || 20;
      rivalHp = Math.max(0, rivalHp - dmg);
      enemySprite.classList.add('hit-flash');
      setTimeout(() => enemySprite.classList.remove('hit-flash'), 300);
      
      spawnFloatingText(`-${dmg} HP`, 720, 130, '#f87171');
      updateHpUI();
    }, 250);

    setTimeout(() => {
      playerSprite.style.animation = 'float 2.5s ease-in-out infinite alternate';

      if (rivalHp <= 0) {
        document.getElementById('b-msg').textContent = `¡Victoria! ¡Derrotaste a ${activeRival.name}! 🎉`;
        playSound('good');
        activeRival.defeated = true;
        updateRivalsHUD();
        
        setTimeout(() => {
          advancePlayerAfterBattle();
          showScreen('platformer-screen');
        }, 1300);
      } else {
        enemyTurn();
      }
    }, 900);

  } else {
    document.getElementById('b-msg').textContent = '¡Fallo técnico en el reto! Turno del rival...';
    setTimeout(enemyTurn, 850);
  }
}

/* ==========================================================
   TURNO INTELIGENTE DEL RIVAL
========================================================== */
function enemyTurn() {
  const enemySprite = document.getElementById('b-eimg');
  const playerSprite = document.getElementById('b-pimg');
  
  // 1. CASO: EL RIVAL ESTABA CARGANDO ENERGÍA EN EL TURNO PREVIO
  if (enemyCharging) {
    enemyCharging = false;
    enemySprite.classList.remove('charging-aura');

    document.getElementById('b-msg').textContent = `¡${activeRival.name} desata su ATAQUE CARGADO DEVASTADOR!`;
    enemySprite.style.animation = 'enemyAttackShake 0.5s ease';
    playSound('attack');
    triggerMoveFX('fire', false);

    setTimeout(() => {
      triggerScreenShake();

      let baseDmg = Math.floor(activeRival.maxHp * 0.42); // Golpe fuerte (~32-42 HP)
      
      if (playerShieldActive) {
        // Bloqueo exitoso
        playerShieldActive = false;
        playerSprite.classList.remove('shield-active');
        
        const mitigatedDmg = Math.max(6, Math.floor(baseDmg * 0.25)); // Solo recibe 25%
        playerHp = Math.max(0, playerHp - mitigatedDmg);
        
        // Contraataque reflejado al rival
        const reflectDmg = 12;
        rivalHp = Math.max(0, rivalHp - reflectDmg);

        playSound('clank');
        triggerMoveFX('clank', true);
        
        spawnFloatingText(`🛡️ ¡BLOQUEADO! -${mitigatedDmg} HP`, 240, 110, '#38bdf8');
        spawnFloatingText(`💥 ¡CONTRAATAQUE! -${reflectDmg} HP`, 720, 120, '#facc15');
      } else {
        playerHp = Math.max(0, playerHp - baseDmg);
        playerSprite.classList.add('hit-flash');
        setTimeout(() => playerSprite.classList.remove('hit-flash'), 300);
        spawnFloatingText(`💥 ¡GOLPE CRÍTICO! -${baseDmg} HP`, 240, 110, '#ef4444');
      }

      updateHpUI();
      checkBattleOutcome();
    }, 300);
    return;
  }

  // 2. DECISIÓN DE LA IA DEL RIVAL
  const roll = Math.random();

  // A) Cargar ataque demoledor (25% chance si rival tiene más de 30 HP)
  if (roll < 0.25 && rivalHp > 30) {
    enemyCharging = true;
    enemySprite.classList.add('charging-aura');
    document.getElementById('b-msg').textContent = `⚠️ ¡${activeRival.name} está acumulando energía para un ataque demoledor!`;
    playSound('shield');
    spawnFloatingText('⚡ ¡CARGANDO PODER!', 720, 120, '#facc15');
    
    setTimeout(() => {
      document.getElementById('b-msg').textContent = '¡Usa Bloqueo / Escudo o cúrate en tu próximo turno!';
    }, 900);
    return;
  }

  // B) Curación de emergencia del rival si está en peligro (20% si <30% HP)
  if (roll < 0.45 && rivalHp < activeRival.maxHp * 0.35) {
    const rHeal = 22;
    rivalHp = Math.min(activeRival.maxHp, rivalHp + rHeal);
    document.getElementById('b-msg').textContent = `¡${activeRival.name} usó Auto-Reparación y recuperó +${rHeal} HP!`;
    playSound('heal');
    triggerMoveFX('heal', false);
    spawnFloatingText(`+${rHeal} HP 💚`, 720, 120, '#4ade80');
    updateHpUI();
    
    setTimeout(() => {
      document.getElementById('b-msg').textContent = '¿Qué ataque quieres usar?';
    }, 1000);
    return;
  }

  // C) Ataque Normal Estándar
  document.getElementById('b-msg').textContent = `¡${activeRival.name} ataca!`;
  enemySprite.style.animation = 'enemyAttackShake 0.4s ease';
  playSound('attack');
  triggerMoveFX('normal', false);

  setTimeout(() => {
    triggerScreenShake();
    
    let baseDmg = Math.floor(16 + (activeRival.maxHp / 10)); // ~22-26 HP
    
    if (playerShieldActive) {
      playerShieldActive = false;
      playerSprite.classList.remove('shield-active');
      
      const mitigatedDmg = Math.max(4, Math.floor(baseDmg * 0.25));
      playerHp = Math.max(0, playerHp - mitigatedDmg);
      
      const reflectDmg = 8;
      rivalHp = Math.max(0, rivalHp - reflectDmg);

      playSound('clank');
      triggerMoveFX('clank', true);
      
      spawnFloatingText(`🛡️ ¡BLOQUEO! -${mitigatedDmg} HP`, 240, 110, '#38bdf8');
      spawnFloatingText(`💥 -${reflectDmg} HP`, 720, 120, '#facc15');
    } else {
      playerHp = Math.max(0, playerHp - baseDmg);
      playerSprite.classList.add('hit-flash');
      setTimeout(() => playerSprite.classList.remove('hit-flash'), 300);
      spawnFloatingText(`-${baseDmg} HP`, 240, 120, '#f87171');
    }

    updateHpUI();
    checkBattleOutcome();
  }, 250);
}

function checkBattleOutcome() {
  const enemySprite = document.getElementById('b-eimg');
  setTimeout(() => {
    enemySprite.style.animation = 'float 2.5s ease-in-out infinite alternate';

    if (rivalHp <= 0) {
      document.getElementById('b-msg').textContent = `¡Derrotaste a ${activeRival.name}! 🎉`;
      playSound('good');
      activeRival.defeated = true;
      updateRivalsHUD();
      
      setTimeout(() => {
        advancePlayerAfterBattle();
        showScreen('platformer-screen');
      }, 1200);
    } else if (playerHp <= 0) {
      handlePlayerDefeat();
    } else {
      document.getElementById('b-msg').textContent = '¿Qué estrategia quieres usar?';
    }
  }, 900);
}

function handlePlayerDefeat() {
  document.getElementById('b-msg').textContent = '⚠️ ¡Tu Pokémon se quedó sin energía!';
  playSound('bad');

  const container = document.getElementById('b-moves-grid');
  if (container) {
    container.innerHTML = `
      <button class="battle-action-btn btn-heal" style="font-size:1.2rem;" onclick="retryCurrentBattle()">
        🔄 Reintentar Combate
      </button>
      <button class="battle-action-btn" style="font-size:1.2rem;" onclick="retreatToMap()">
        🏃 Volver al Mapa
      </button>
    `;
  }
}

function retryCurrentBattle() {
  playerHp = getSelectedPoke().hp;
  rivalHp = activeRival.maxHp;
  playerShieldActive = false;
  enemyCharging = false;
  
  const pImgEl = document.getElementById('b-pimg');
  if (pImgEl) pImgEl.classList.remove('shield-active');
  const rImgEl = document.getElementById('b-eimg');
  if (rImgEl) rImgEl.classList.remove('charging-aura');

  updateHpUI();
  renderBattleButtons();
  document.getElementById('b-msg').textContent = '¡Nueva oportunidad! Elige tu movimiento con cuidado.';
}

function retreatToMap() {
  playerHp = getSelectedPoke().hp;
  if (typeof player !== 'undefined') {
    player.x = Math.max(60, player.x - 120);
  }
  showScreen('platformer-screen');
}
