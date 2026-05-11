/**
 * COEDUCA Framework v2 - Games (Pop Art ENHANCED)
 * 5 juegos: tictactoe, snake, dino, hangman, trivia
 * Depende de coeduca-core.js.
 *
 * Cada juego recibe ctx = { container, config, onWin, onTie, onLose }
 * onWin: +1 pt extra, onTie: +0.5, onLose: 0.
 *
 * Mascota: Rigo 🦊
 */
(function (global) {
  'use strict';
  if (!global.COEDUCA) {
    console.error('coeduca-core.js debe cargarse antes que coeduca-games.js');
    return;
  }
  const C = global.COEDUCA;
  const reg = (type, fn) => C.registerGame(type, fn);

  // ---------- Estilos compartidos por los juegos (inyectados una sola vez) ----------
  if (!document.getElementById('coeduca-games-styles')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'coeduca-games-styles';
    styleEl.textContent = `
      /* === Animaciones compartidas para juegos === */
      @keyframes cgSlideInRight {
        from { opacity: 0; transform: translateX(60px) rotate(2deg); }
        to   { opacity: 1; transform: translateX(0) rotate(0); }
      }
      @keyframes cgSlideOutLeft {
        from { opacity: 1; transform: translateX(0); }
        to   { opacity: 0; transform: translateX(-60px); }
      }
      @keyframes cgShakeX {
        0%,100% { transform: translateX(0); }
        20% { transform: translateX(-8px); }
        40% { transform: translateX(8px); }
        60% { transform: translateX(-6px); }
        80% { transform: translateX(6px); }
      }
      @keyframes cgPopBounce {
        0%   { transform: scale(0.3); opacity: 0; }
        60%  { transform: scale(1.15); opacity: 1; }
        100% { transform: scale(1); }
      }
      @keyframes cgPulseGlow {
        0%, 100% { box-shadow: 3px 3px 0 var(--coeduca-stroke), 0 0 0 0 rgba(76,175,80,0.6); }
        50%      { box-shadow: 3px 3px 0 var(--coeduca-stroke), 0 0 0 12px rgba(76,175,80,0); }
      }
      @keyframes cgThinking {
        0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
        40%           { transform: scale(1);   opacity: 1; }
      }
      @keyframes cgConfettiFall {
        0%   { transform: translateY(-20px) rotate(0deg);   opacity: 1; }
        100% { transform: translateY(220px) rotate(720deg); opacity: 0; }
      }
      @keyframes cgDrawLine {
        from { stroke-dashoffset: 200; }
        to   { stroke-dashoffset: 0; }
      }
      @keyframes cgHeartBeat {
        0%, 100% { transform: scale(1); }
        50%      { transform: scale(1.2); }
      }
      @keyframes cgWiggle {
        0%, 100% { transform: rotate(-3deg); }
        50%      { transform: rotate(3deg); }
      }

      /* === Avatar de jugador / Rigo === */
      .cg-avatar {
        display: inline-flex; align-items: center; gap: 8px;
        background: var(--coeduca-surface);
        border: 3px solid var(--coeduca-stroke);
        border-radius: 50px;
        padding: 4px 14px 4px 4px;
        font-weight: 900; text-transform: uppercase;
        box-shadow: 3px 3px 0 var(--coeduca-stroke);
        font-size: 14px;
        letter-spacing: 0.5px;
        transition: transform 0.2s, box-shadow 0.2s;
      }
      .cg-avatar-circle {
        width: 36px; height: 36px;
        border-radius: 50%;
        border: 2px solid var(--coeduca-stroke);
        display: flex; align-items: center; justify-content: center;
        font-size: 22px;
        background: var(--coeduca-primary);
      }
      .cg-avatar.is-active {
        animation: coeducaBadgePulse 1.4s ease-in-out infinite;
      }
      .cg-avatar.is-thinking .cg-avatar-circle {
        animation: cgWiggle 0.6s ease-in-out infinite;
      }

      /* === Dot loader (Rigo está pensando) === */
      .cg-dots { display: inline-flex; gap: 4px; align-items: center; }
      .cg-dots span {
        width: 8px; height: 8px; border-radius: 50%;
        background: var(--coeduca-stroke);
        animation: cgThinking 1.2s infinite ease-in-out;
      }
      .cg-dots span:nth-child(2) { animation-delay: 0.15s; }
      .cg-dots span:nth-child(3) { animation-delay: 0.3s; }

      /* === TicTacToe celda === */
      .cg-ttt-cell {
        width: 90px; height: 90px;
        background: #FFF8E7;
        border: 3px solid var(--coeduca-stroke);
        font-size: 54px; font-weight: 900;
        cursor: pointer; border-radius: 8px;
        transition: transform 0.12s, background 0.2s;
        box-shadow: inset -2px -2px 0 rgba(0,0,0,0.08);
        display: flex; justify-content: center; align-items: center; padding: 0;
        font-family: inherit;
      }
      .cg-ttt-cell:not(:disabled):hover {
        background: #FFFEF0;
        transform: translate(-1px, -1px);
      }
      .cg-ttt-cell:not(:disabled):active { transform: scale(0.95); }
      .cg-ttt-cell.is-x { color: var(--coeduca-accent); background: #FFE4E1; }
      .cg-ttt-cell.is-o { color: var(--coeduca-info);   background: #E0F7FA; }
      .cg-ttt-cell .cg-mark {
        animation: cgPopBounce 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      /* === Trivia card === */
      .cg-trivia-card {
        background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
        color: var(--coeduca-primary);
        border: 4px solid var(--coeduca-primary);
        border-radius: 14px;
        padding: 20px 18px;
        margin-bottom: 16px;
        font-weight: 900;
        font-size: 17px;
        line-height: 1.4;
        text-shadow: 2px 2px 0 #000;
        box-shadow: 5px 5px 0 var(--coeduca-stroke);
        position: relative;
        overflow: hidden;
        animation: cgSlideInRight 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      .cg-trivia-card.is-leaving { animation: cgSlideOutLeft 0.3s ease-in forwards; }
      .cg-trivia-card::before {
        content: '?';
        position: absolute;
        top: -20px; right: -10px;
        font-size: 120px;
        color: rgba(255, 215, 0, 0.08);
        font-weight: 900;
        pointer-events: none;
      }
      .cg-trivia-opt {
        text-align: left !important;
        padding: 12px 14px !important;
        font-size: 14px !important;
        transition: transform 0.15s, box-shadow 0.15s, outline 0.2s;
      }
      .cg-trivia-opt.is-correct {
        outline: 4px solid var(--coeduca-success);
        outline-offset: 2px;
        animation: cgPulseGlow 0.8s ease-out 1;
      }
      .cg-trivia-opt.is-wrong {
        outline: 4px solid var(--coeduca-error);
        outline-offset: 2px;
        animation: cgShakeX 0.5s;
      }
      .cg-progress-bar {
        height: 14px;
        background: var(--coeduca-surface);
        border: 3px solid var(--coeduca-stroke);
        border-radius: 50px;
        overflow: hidden;
        margin: 8px auto 14px;
        max-width: 320px;
        box-shadow: 2px 2px 0 var(--coeduca-stroke);
      }
      .cg-progress-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--coeduca-accent), var(--coeduca-primary));
        transition: width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        border-right: 2px solid var(--coeduca-stroke);
      }

      /* === Hangman === */
      .cg-hm-wrap { text-align: center; }
      .cg-hm-stage {
        background: linear-gradient(180deg, #B3E5FC 0%, #FFF8E7 100%);
        border: 4px solid var(--coeduca-stroke);
        border-radius: 12px;
        box-shadow: 5px 5px 0 var(--coeduca-stroke);
        width: 240px;
        height: 240px;
        margin: 0 auto;
      }
      .cg-hm-hearts {
        margin-top: 10px;
        font-size: 22px;
        letter-spacing: 4px;
        min-height: 28px;
      }
      .cg-hm-hearts span { display: inline-block; }
      .cg-hm-hearts .heart-lost { opacity: 0.25; filter: grayscale(1); }
      .cg-hm-hearts .heart-active { animation: cgHeartBeat 1.1s ease-in-out infinite; }
      .cg-hm-word {
        font-family: 'Courier New', monospace;
        font-size: 30px;
        letter-spacing: 6px;
        font-weight: 900;
        margin: 14px 0;
        color: var(--coeduca-stroke);
        background: var(--coeduca-surface);
        border: 3px dashed var(--coeduca-stroke);
        border-radius: 10px;
        padding: 10px;
        display: inline-block;
        min-width: 200px;
      }
      .cg-hm-word .letter-revealed {
        color: var(--coeduca-success);
        animation: cgPopBounce 0.3s;
        display: inline-block;
      }
      .cg-hm-keys {
        display: grid;
        gap: 4px;
        max-width: 420px;
        margin: 0 auto;
      }
      .cg-hm-keys-row { display: flex; gap: 4px; justify-content: center; }
      .cg-hm-key {
        min-width: 32px; height: 36px;
        padding: 0 8px;
        font-size: 14px;
        font-weight: 900;
        border-radius: 8px;
        border: 2px solid var(--coeduca-stroke);
        background: var(--coeduca-surface);
        cursor: pointer;
        transition: transform 0.1s, background 0.2s;
        box-shadow: 2px 2px 0 var(--coeduca-stroke);
        font-family: inherit;
        text-transform: uppercase;
      }
      .cg-hm-key:not(:disabled):hover { transform: translate(-1px, -1px); }
      .cg-hm-key.is-hit  { background: var(--coeduca-success); color: #fff; }
      .cg-hm-key.is-miss { background: var(--coeduca-error);   color: #fff; }
      .cg-hm-key:disabled { cursor: not-allowed; box-shadow: 1px 1px 0 var(--coeduca-stroke); }

      /* === Snake === */
      .cg-snake-wrap { text-align: center; }
      .cg-snake-canvas {
        border: 4px solid var(--coeduca-stroke);
        border-radius: 12px;
        background: #1d3b1f;
        max-width: 100%;
        height: auto;
        touch-action: none;
        box-shadow: 5px 5px 0 var(--coeduca-stroke);
        display: block;
        margin: 0 auto;
      }
      .cg-snake-controls {
        margin-top: 14px;
        display: flex; flex-direction: column; align-items: center; gap: 10px;
      }
      .cg-snake-dpad {
        display: grid;
        grid-template-columns: repeat(3, 56px);
        gap: 6px;
      }
      .cg-snake-dir {
        height: 56px;
        font-size: 22px;
        padding: 0 !important;
      }
      .cg-snake-start {
        font-size: 16px !important;
        padding: 14px 36px !important;
        letter-spacing: 1.5px;
      }
      .cg-snake-score {
        display: inline-flex; gap: 14px; align-items: center;
        background: var(--coeduca-stroke);
        color: var(--coeduca-primary);
        padding: 8px 18px;
        border-radius: 50px;
        font-weight: 900;
        letter-spacing: 1px;
        margin-bottom: 10px;
        box-shadow: 3px 3px 0 var(--coeduca-stroke);
      }

      /* === Dino === */
      .cg-dino-canvas {
        border: 4px solid var(--coeduca-stroke);
        border-radius: 12px;
        max-width: 100%;
        height: auto;
        touch-action: none;
        cursor: pointer;
        box-shadow: 5px 5px 0 var(--coeduca-stroke);
        display: block;
      }

      /* === Confetti === */
      .cg-confetti-layer {
        position: absolute; inset: 0; pointer-events: none; overflow: hidden;
      }
      .cg-confetti {
        position: absolute;
        width: 10px; height: 14px;
        top: -20px;
        animation: cgConfettiFall 1.4s ease-in forwards;
        border: 1px solid rgba(0,0,0,0.4);
      }

      /* === Game status text === */
      .cg-status {
        margin-top: 16px;
        font-weight: 900;
        font-size: 20px;
        min-height: 28px;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      .cg-status.is-win  { color: var(--coeduca-success); animation: coeducaPopIn 0.5s; }
      .cg-status.is-lose { color: var(--coeduca-error);   animation: cgShakeX 0.5s; }
      .cg-status.is-tie  { color: var(--coeduca-stroke); }

      @media (max-width: 480px) {
        .cg-ttt-cell { width: 72px; height: 72px; font-size: 42px; }
        .cg-hm-stage { width: 200px; height: 200px; }
        .cg-hm-word { font-size: 24px; letter-spacing: 4px; }
      }
    `;
    document.head.appendChild(styleEl);
  }

  // ---------- Helpers compartidos ----------
  const RIGO_EMOJI = '🐸';
  const PLAYER_EMOJI = '😎';

  function avatarHTML(name, emoji, bgColor, opts = {}) {
    const cls = opts.active ? 'cg-avatar is-active' : 'cg-avatar';
    return `
      <div class="${cls}" data-avatar="${name}">
        <div class="cg-avatar-circle" style="background:${bgColor};">${emoji}</div>
        <span>${name}</span>
      </div>
    `;
  }

  function spawnConfetti(container, count = 30) {
    const layer = document.createElement('div');
    layer.className = 'cg-confetti-layer';
    const colors = ['#FFD700', '#FF6B9D', '#4FC3F7', '#4CAF50', '#9B5DE5', '#FF9F1C'];
    for (let i = 0; i < count; i++) {
      const c = document.createElement('div');
      c.className = 'cg-confetti';
      c.style.left = (Math.random() * 100) + '%';
      c.style.background = colors[i % colors.length];
      c.style.animationDelay = (Math.random() * 0.4) + 's';
      c.style.animationDuration = (1.0 + Math.random() * 0.8) + 's';
      c.style.transform = `rotate(${Math.random() * 360}deg)`;
      layer.appendChild(c);
    }
    container.appendChild(layer);
    setTimeout(() => layer.remove(), 2400);
  }

  // =====================================================================
  // 1. TICTACTOE — Tú (X) vs Rigo (O), línea ganadora trazada en SVG
  // =====================================================================
  reg('tictactoe', function (ctx) {
    let board = Array(9).fill('');
    let gameOver = false;
    let winLine = [];
    let playerTurn = true;

    const wrap = document.createElement('div');
    wrap.style.position = 'relative';
    wrap.innerHTML = `
      <div style="text-align:center;">
        <div style="display:flex;justify-content:center;gap:14px;margin-bottom:18px;flex-wrap:wrap;">
          ${avatarHTML('Tú', PLAYER_EMOJI, '#FFE4E1', { active: true })}
          <div style="display:flex;align-items:center;font-weight:900;font-size:18px;color:var(--coeduca-stroke);">VS</div>
          ${avatarHTML('Rigo', RIGO_EMOJI, '#E0F7FA')}
        </div>

        <div style="position:relative;display:inline-block;">
          <div id="ttt-grid" style="display:grid;grid-template-columns:repeat(3,90px);
               gap:8px;justify-content:center;background:var(--coeduca-stroke);padding:8px;
               border-radius:14px;box-shadow:5px 5px 0 var(--coeduca-stroke);"></div>
          <svg id="ttt-line" viewBox="0 0 290 290"
               style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none;"></svg>
        </div>

        <div id="ttt-status" class="cg-status"></div>
        <button class="coeduca-btn coeduca-btn-success" id="ttt-reset"
                style="margin-top:14px;display:none;">🔄 Volver a jugar</button>
      </div>
    `;
    ctx.container.appendChild(wrap);

    const grid = wrap.querySelector('#ttt-grid');
    const lineSvg = wrap.querySelector('#ttt-line');
    const statusEl = wrap.querySelector('#ttt-status');
    const resetBtn = wrap.querySelector('#ttt-reset');
    const playerAvatar = wrap.querySelector('[data-avatar="Tú"]');
    const rigoAvatar = wrap.querySelector('[data-avatar="Rigo"]');

    function setActiveAvatar(who) {
      playerAvatar.classList.toggle('is-active', who === 'player');
      rigoAvatar.classList.toggle('is-active', who === 'rigo');
      rigoAvatar.classList.toggle('is-thinking', who === 'rigo');
    }

    function render() {
      grid.innerHTML = '';
      board.forEach((c, i) => {
        const cell = document.createElement('button');
        cell.className = 'cg-ttt-cell';
        if (c === 'X') cell.classList.add('is-x');
        else if (c === 'O') cell.classList.add('is-o');
        if (c) cell.innerHTML = `<span class="cg-mark">${c}</span>`;
        cell.disabled = c !== '' || gameOver || !playerTurn;
        cell.addEventListener('click', () => playerMove(i));
        grid.appendChild(cell);
      });
    }

    function drawWinLine(line) {
      // Centros de las celdas en el viewBox 290x290 (3 celdas de 90 + 2 gaps de 8 + padding 8)
      // Cada celda ocupa: padding(8) + idx*98 + 45 (centro)
      const center = idx => {
        const col = idx % 3, row = Math.floor(idx / 3);
        return { x: 8 + col * 98 + 45, y: 8 + row * 98 + 45 };
      };
      const a = center(line[0]);
      const b = center(line[2]);
      const len = Math.hypot(b.x - a.x, b.y - a.y);
      lineSvg.innerHTML = `
        <line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"
              stroke="var(--coeduca-accent)" stroke-width="10" stroke-linecap="round"
              stroke-dasharray="${len}" stroke-dashoffset="${len}"
              style="animation: cgDrawLine 0.5s ease-out forwards;"/>
        <line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"
              stroke="var(--coeduca-stroke)" stroke-width="3" stroke-linecap="round"
              stroke-dasharray="${len}" stroke-dashoffset="${len}"
              style="animation: cgDrawLine 0.5s ease-out forwards;"/>
      `;
    }

    function checkWinner(b) {
      const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
      for (const line of lines) {
        const [a, c, d] = line;
        if (b[a] && b[a] === b[c] && b[a] === b[d]) return { winner: b[a], line };
      }
      return b.includes('') ? null : { winner: 'tie', line: [] };
    }

    function playerMove(i) {
      if (board[i] || gameOver || !playerTurn) return;
      board[i] = 'X';
      playerTurn = false;
      render();
      const res = checkWinner(board);
      if (res) return endGame(res.winner, res.line);

      setActiveAvatar('rigo');
      statusEl.innerHTML = `Rigo está pensando <span class="cg-dots"><span></span><span></span><span></span></span>`;
      statusEl.className = 'cg-status';
      setTimeout(rigoMove, 700);
    }

    function minimax(newBoard, player) {
      const availSpots = newBoard.reduce((acc, el, i) => (el === '' ? acc.concat(i) : acc), []);
      const result = checkWinner(newBoard);
      if (result) {
        if (result.winner === 'X') return { score: -10 };
        if (result.winner === 'O') return { score: 10 };
        return { score: 0 };
      }
      const moves = [];
      for (let i = 0; i < availSpots.length; i++) {
        const move = { index: availSpots[i] };
        newBoard[availSpots[i]] = player;
        move.score = minimax(newBoard, player === 'O' ? 'X' : 'O').score;
        newBoard[availSpots[i]] = '';
        moves.push(move);
      }
      let bestMove;
      if (player === 'O') {
        let bestScore = -10000;
        for (let i = 0; i < moves.length; i++) {
          if (moves[i].score > bestScore) { bestScore = moves[i].score; bestMove = i; }
        }
      } else {
        let bestScore = 10000;
        for (let i = 0; i < moves.length; i++) {
          if (moves[i].score < bestScore) { bestScore = moves[i].score; bestMove = i; }
        }
      }
      return moves[bestMove];
    }

    function rigoMove() {
      if (gameOver) return;
      let moveIndex;
      // 12% de probabilidad de error humano para que sea ganable
      if (Math.random() < 0.12) {
        const empty = board.map((c, i) => c === '' ? i : -1).filter(i => i >= 0);
        moveIndex = empty[Math.floor(Math.random() * empty.length)];
      } else {
        moveIndex = minimax([...board], 'O').index;
      }
      if (moveIndex !== undefined) board[moveIndex] = 'O';
      playerTurn = true;
      setActiveAvatar('player');
      statusEl.innerHTML = '';
      render();
      const res = checkWinner(board);
      if (res) endGame(res.winner, res.line);
    }

    function endGame(winner, line) {
      gameOver = true;
      winLine = line || [];
      setActiveAvatar(null);
      render();
      if (line && line.length) drawWinLine(line);

      resetBtn.style.display = 'inline-block';
      resetBtn.style.animation = 'coeducaPopIn 0.4s';

      if (winner === 'X') {
        statusEl.textContent = '🎉 ¡Ganaste a Rigo!';
        statusEl.className = 'cg-status is-win';
        spawnConfetti(wrap, 30);
        ctx.onWin();
      } else if (winner === 'O') {
        statusEl.textContent = `${RIGO_EMOJI} Rigo ganó esta vez`;
        statusEl.className = 'cg-status is-lose';
        ctx.onLose();
      } else {
        statusEl.textContent = '🤝 ¡Empate!';
        statusEl.className = 'cg-status is-tie';
        ctx.onTie();
      }
    }

    resetBtn.addEventListener('click', () => {
      board = Array(9).fill('');
      gameOver = false;
      winLine = [];
      playerTurn = true;
      lineSvg.innerHTML = '';
      statusEl.textContent = '';
      statusEl.className = 'cg-status';
      resetBtn.style.display = 'none';
      setActiveAvatar('player');
      render();
    });

    setActiveAvatar('player');
    render();
  });

  // =====================================================================
  // 2. SNAKE — diseño mejorado, cabeza con ojos, comida tipo manzana
  // =====================================================================
  reg('snake', function (ctx) {
    const SIZE = 15, CELL = 22;
    let snake, dir, nextDir, food, score, gameOver, loop, foodPulse = 0;

    const wrap = document.createElement('div');
    wrap.className = 'cg-snake-wrap';
    wrap.innerHTML = `
      <div class="cg-snake-score">
        <span>🍎</span>
        <span>PUNTOS: <span id="snake-score-val">0</span></span>
        <span>·</span>
        <span>META: <span id="snake-meta">5</span></span>
      </div>
      <canvas class="cg-snake-canvas" id="snake-canvas"
              width="${SIZE * CELL}" height="${SIZE * CELL}"></canvas>

      <div class="cg-snake-controls">
        <button class="coeduca-btn coeduca-btn-success cg-snake-start" id="snake-start">▶ START</button>
        <div class="cg-snake-dpad">
          <span></span>
          <button class="coeduca-btn cg-snake-dir" data-d="up">↑</button>
          <span></span>
          <button class="coeduca-btn cg-snake-dir" data-d="left">←</button>
          <button class="coeduca-btn cg-snake-dir" data-d="down">↓</button>
          <button class="coeduca-btn cg-snake-dir" data-d="right">→</button>
        </div>
      </div>
      <div id="snake-status" class="cg-status"></div>
    `;
    ctx.container.appendChild(wrap);

    const canvas = wrap.querySelector('#snake-canvas');
    const cctx = canvas.getContext('2d');
    const scoreVal = wrap.querySelector('#snake-score-val');
    const statusEl = wrap.querySelector('#snake-status');
    const winThreshold = (ctx.config && ctx.config.winScore) || 5;
    wrap.querySelector('#snake-meta').textContent = winThreshold;

    function reset() {
      snake = [{ x: 7, y: 7 }, { x: 6, y: 7 }, { x: 5, y: 7 }];
      dir = { x: 1, y: 0 };
      nextDir = { x: 1, y: 0 };
      placeFood();
      score = 0;
      gameOver = false;
      scoreVal.textContent = '0';
      statusEl.textContent = '';
      statusEl.className = 'cg-status';
    }

    function placeFood() {
      do {
        food = { x: Math.floor(Math.random() * SIZE), y: Math.floor(Math.random() * SIZE) };
      } while (snake.some(s => s.x === food.x && s.y === food.y));
    }

    function step() {
      if (gameOver) return;
      dir = nextDir;
      const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
      if (head.x < 0 || head.x >= SIZE || head.y < 0 || head.y >= SIZE ||
          snake.some(s => s.x === head.x && s.y === head.y)) {
        return end();
      }
      snake.unshift(head);
      if (head.x === food.x && head.y === food.y) {
        score++;
        scoreVal.textContent = score;
        // Pop animado del score
        scoreVal.style.animation = 'cgPopBounce 0.3s';
        setTimeout(() => { scoreVal.style.animation = ''; }, 300);
        if (score >= winThreshold) return win();
        placeFood();
      } else {
        snake.pop();
      }
      foodPulse = (foodPulse + 1) % 60;
      draw();
    }

    function draw() {
      // Fondo con grid sutil
      cctx.fillStyle = '#1d3b1f';
      cctx.fillRect(0, 0, canvas.width, canvas.height);
      cctx.strokeStyle = 'rgba(255,255,255,0.04)';
      cctx.lineWidth = 1;
      for (let i = 1; i < SIZE; i++) {
        cctx.beginPath();
        cctx.moveTo(i * CELL, 0); cctx.lineTo(i * CELL, canvas.height); cctx.stroke();
        cctx.beginPath();
        cctx.moveTo(0, i * CELL); cctx.lineTo(canvas.width, i * CELL); cctx.stroke();
      }

      // Comida (manzana con brillo y pulso)
      const fx = food.x * CELL + CELL / 2;
      const fy = food.y * CELL + CELL / 2;
      const pulse = 1 + Math.sin(foodPulse * 0.15) * 0.08;
      const r = (CELL / 2 - 3) * pulse;
      // sombra/glow
      cctx.fillStyle = 'rgba(255, 107, 157, 0.4)';
      cctx.beginPath(); cctx.arc(fx, fy, r + 4, 0, Math.PI * 2); cctx.fill();
      // cuerpo manzana
      const grad = cctx.createRadialGradient(fx - 2, fy - 2, 1, fx, fy, r);
      grad.addColorStop(0, '#FF8FB1');
      grad.addColorStop(1, '#E63946');
      cctx.fillStyle = grad;
      cctx.beginPath(); cctx.arc(fx, fy, r, 0, Math.PI * 2); cctx.fill();
      cctx.strokeStyle = '#1a1a1a';
      cctx.lineWidth = 2;
      cctx.stroke();
      // hojita
      cctx.fillStyle = '#4CAF50';
      cctx.beginPath();
      cctx.ellipse(fx + 2, fy - r - 1, 3, 5, -0.6, 0, Math.PI * 2);
      cctx.fill();
      cctx.stroke();

      // Serpiente
      snake.forEach((s, i) => {
        const x = s.x * CELL, y = s.y * CELL;
        const isHead = i === 0;
        const t = i / Math.max(snake.length - 1, 1);
        // Color: cabeza más oscura, cola más clara
        const lightness = isHead ? 35 : 45 + t * 18;
        cctx.fillStyle = `hsl(135, 60%, ${lightness}%)`;
        cctx.strokeStyle = '#1a1a1a';
        cctx.lineWidth = 2;
        // Segmento redondeado
        const pad = isHead ? 1 : 2;
        if (cctx.roundRect) {
          cctx.beginPath();
          cctx.roundRect(x + pad, y + pad, CELL - pad * 2, CELL - pad * 2, isHead ? 7 : 5);
          cctx.fill(); cctx.stroke();
        } else {
          cctx.fillRect(x + pad, y + pad, CELL - pad * 2, CELL - pad * 2);
          cctx.strokeRect(x + pad, y + pad, CELL - pad * 2, CELL - pad * 2);
        }
        // Ojos en la cabeza
        if (isHead) {
          const cx = x + CELL / 2, cy = y + CELL / 2;
          // Posición de ojos según dirección
          const eyeOffsetX = dir.x * 4;
          const eyeOffsetY = dir.y * 4;
          const sideX = Math.abs(dir.y) * 5; // perpendicular
          const sideY = Math.abs(dir.x) * 5;
          cctx.fillStyle = '#fff';
          cctx.beginPath();
          cctx.arc(cx + eyeOffsetX - sideX, cy + eyeOffsetY - sideY, 3, 0, Math.PI * 2);
          cctx.arc(cx + eyeOffsetX + sideX, cy + eyeOffsetY + sideY, 3, 0, Math.PI * 2);
          cctx.fill();
          cctx.fillStyle = '#1a1a1a';
          cctx.beginPath();
          cctx.arc(cx + eyeOffsetX * 1.4 - sideX, cy + eyeOffsetY * 1.4 - sideY, 1.5, 0, Math.PI * 2);
          cctx.arc(cx + eyeOffsetX * 1.4 + sideX, cy + eyeOffsetY * 1.4 + sideY, 1.5, 0, Math.PI * 2);
          cctx.fill();
        }
      });
    }

    function end() {
      gameOver = true; clearInterval(loop);
      statusEl.textContent = '💥 GAME OVER';
      statusEl.className = 'cg-status is-lose';
      ctx.onLose();
    }
    function win() {
      gameOver = true; clearInterval(loop);
      statusEl.textContent = '🎉 ¡GANASTE!';
      statusEl.className = 'cg-status is-win';
      spawnConfetti(wrap, 35);
      ctx.onWin();
    }

    function setDir(d) {
      if (gameOver) return;
      // Validar contra dirección actual de movimiento (no nextDir) para evitar 180º
      if (d === 'up'    && dir.y !==  1) nextDir = { x:  0, y: -1 };
      if (d === 'down'  && dir.y !== -1) nextDir = { x:  0, y:  1 };
      if (d === 'left'  && dir.x !==  1) nextDir = { x: -1, y:  0 };
      if (d === 'right' && dir.x !== -1) nextDir = { x:  1, y:  0 };
    }

    wrap.querySelectorAll('.cg-snake-dir').forEach(b => {
      b.addEventListener('click', () => setDir(b.dataset.d));
    });
    document.addEventListener('keydown', e => {
      if (gameOver) return;
      const map = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
      if (map[e.key]) { setDir(map[e.key]); e.preventDefault(); }
    });
    // Swipe táctil
    let touchStart = null;
    canvas.addEventListener('touchstart', e => {
      const t = e.touches[0]; touchStart = { x: t.clientX, y: t.clientY };
    }, { passive: true });
    canvas.addEventListener('touchend', e => {
      if (!touchStart) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - touchStart.x, dy = t.clientY - touchStart.y;
      if (Math.abs(dx) > Math.abs(dy)) setDir(dx > 0 ? 'right' : 'left');
      else setDir(dy > 0 ? 'down' : 'up');
      touchStart = null;
    }, { passive: true });

    wrap.querySelector('#snake-start').addEventListener('click', () => {
      reset(); draw();
      clearInterval(loop);
      loop = setInterval(step, 250);
    });
    reset(); draw();
  });

  // =====================================================================
  // 3. DINO — más rápido, mejor diseño, polvo al correr
  // =====================================================================
  reg('dino', function (ctx) {
    const W = 600, H = 180;
    let dino, obstacles, clouds, vy, gravity, onGround, score, gameOver, loop, speed;
    let frames, lastSpawnX, sunX, groundOffset, dustParticles, started;
    const winThreshold = (ctx.config && ctx.config.winScore) || 30;
    const GRACE_FRAMES = 50;
    const MIN_SPAWN_GAP = 220;
    const START_SPEED = 4.8;
    const JUMP_VELOCITY = -15.5;

    const wrap = document.createElement('div');
    wrap.style.position = 'relative';
    wrap.innerHTML = `
      <div style="text-align:center;">
        <div id="dino-score" style="font-weight:900;margin-bottom:10px;font-size:18px;
             background:var(--coeduca-stroke);color:var(--coeduca-primary);
             display:inline-block;padding:6px 18px;border-radius:50px;letter-spacing:1.5px;
             box-shadow:3px 3px 0 var(--coeduca-stroke);">
          🏃 PUNTOS: <span id="dino-score-val">0</span> &nbsp;·&nbsp; META: ${winThreshold}
        </div>
        <div style="position:relative;display:inline-block;max-width:100%;">
          <canvas class="cg-dino-canvas" id="dino-canvas" width="${W}" height="${H}"></canvas>
        </div>
        <div style="margin-top:10px;font-size:13px;font-weight:bold;color:var(--coeduca-stroke);">
          Toca el área de juego o presiona <kbd style="background:#fff;border:2px solid var(--coeduca-stroke);border-radius:4px;padding:1px 6px;font-family:inherit;">ESPACIO</kbd> para saltar
        </div>
        <div style="margin-top:12px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
          <button class="coeduca-btn coeduca-btn-success" id="dino-start">▶ START</button>
          <button class="coeduca-btn coeduca-btn-accent" id="dino-jump-btn">⬆ SALTAR</button>
        </div>
        <div id="dino-status" class="cg-status"></div>
      </div>
    `;
    ctx.container.appendChild(wrap);

    const canvas = wrap.querySelector('#dino-canvas');
    const cctx = canvas.getContext('2d');
    const scoreVal = wrap.querySelector('#dino-score-val');
    const statusEl = wrap.querySelector('#dino-status');

    function reset() {
      dino = { x: 50, y: H - 42 - 8, w: 36, h: 42 };
      obstacles = [];
      clouds = [
        { x: 100, y: 30, w: 44, h: 16 },
        { x: 280, y: 55, w: 56, h: 18 },
        { x: 460, y: 28, w: 38, h: 14 }
      ];
      vy = 0; gravity = 1.2; onGround = true;
      score = 0; gameOver = false; speed = START_SPEED;
      frames = 0;
      lastSpawnX = W + MIN_SPAWN_GAP;
      sunX = W - 60;
      groundOffset = 0;
      dustParticles = [];
      started = false;
      scoreVal.textContent = '0';
      statusEl.textContent = '';
      statusEl.className = 'cg-status';
    }

    function jump() {
      if (gameOver || !started) return;
      if (onGround) {
        vy = JUMP_VELOCITY;
        onGround = false;
        // Polvo al saltar
        for (let i = 0; i < 6; i++) {
          dustParticles.push({
            x: dino.x + dino.w / 2 + (Math.random() - 0.5) * 10,
            y: H - 8,
            vx: (Math.random() - 0.5) * 2 - 1,
            vy: -Math.random() * 1.5,
            life: 20,
            size: 3 + Math.random() * 2
          });
        }
      }
    }

    function spawnObstacle() {
      const r = Math.random();
      if (r < 0.45) {
        obstacles.push({ x: W, y: H - 30 - 8, w: 16, h: 30, type: 'cactus_s' });
      } else if (r < 0.8) {
        obstacles.push({ x: W, y: H - 44 - 8, w: 22, h: 44, type: 'cactus_l' });
      } else {
        obstacles.push({ x: W, y: H - 70 - 8, w: 28, h: 20, type: 'bird', flap: 0 });
      }
      lastSpawnX = W;
    }

    function step() {
      if (gameOver) return;
      frames++;

      // Física
      vy += gravity;
      dino.y += vy;
      const groundY = H - dino.h - 8;
      if (dino.y >= groundY) {
        if (!onGround) {
          // Polvo al aterrizar
          for (let i = 0; i < 4; i++) {
            dustParticles.push({
              x: dino.x + dino.w / 2 + (Math.random() - 0.5) * 14,
              y: H - 8,
              vx: (Math.random() - 0.5) * 2.5,
              vy: -Math.random() * 1,
              life: 16,
              size: 2 + Math.random() * 2
            });
          }
        }
        dino.y = groundY; vy = 0; onGround = true;
      }

      // Polvo de carrera (continuo)
      if (onGround && frames % 6 === 0) {
        dustParticles.push({
          x: dino.x + 4,
          y: H - 8,
          vx: -speed * 0.4 - Math.random(),
          vy: -Math.random() * 0.5,
          life: 12,
          size: 2 + Math.random() * 1.5
        });
      }
      dustParticles.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.1; p.life--; });
      dustParticles = dustParticles.filter(p => p.life > 0);

      // Obstáculos
      obstacles.forEach(o => {
        o.x -= speed;
        if (o.type === 'bird') o.flap = (o.flap + 1) % 20;
      });
      obstacles = obstacles.filter(o => o.x + o.w > 0);

      if (obstacles.length > 0) {
        const newest = obstacles[obstacles.length - 1];
        lastSpawnX = newest.x;
      } else {
        lastSpawnX -= speed;
      }

      if (frames > GRACE_FRAMES) {
        const distSinceLast = W - lastSpawnX;
        const baseChance = 0.025 + Math.min(0.018, frames / 7000);
        if (distSinceLast >= MIN_SPAWN_GAP && Math.random() < baseChance) {
          spawnObstacle();
        }
      }

      // Nubes parallax
      clouds.forEach(c => {
        c.x -= speed * 0.3;
        if (c.x + c.w < 0) {
          c.x = W + Math.random() * 100;
          c.y = 15 + Math.random() * 50;
          c.w = 36 + Math.random() * 30;
          c.h = 12 + Math.random() * 8;
        }
      });
      sunX -= speed * 0.05;
      if (sunX < -30) sunX = W + 30;
      groundOffset = (groundOffset + speed) % 28;

      // Colisión
      const pad = 5;
      for (const o of obstacles) {
        if (dino.x + pad < o.x + o.w &&
            dino.x + dino.w - pad > o.x &&
            dino.y + pad < o.y + o.h &&
            dino.y + dino.h - pad > o.y) {
          return end();
        }
      }

      // Puntaje
      score++;
      if (score % 5 === 0) {
        const displayed = Math.floor(score / 5);
        scoreVal.textContent = displayed;
        if (displayed >= winThreshold) return win();
      }
      // 3. Aceleración más suave: cada 300 frames en vez de 220, y límite en 7.5 en vez de 9
      if (frames % 300 === 0 && speed < 7.5) speed += 0.2;

      draw();
    }

    function drawCloud(c) {
      cctx.fillStyle = '#fff';
      cctx.beginPath();
      cctx.ellipse(c.x + c.w * 0.3, c.y, c.w * 0.35, c.h * 0.7, 0, 0, Math.PI * 2);
      cctx.ellipse(c.x + c.w * 0.6, c.y - 3, c.w * 0.32, c.h * 0.8, 0, 0, Math.PI * 2);
      cctx.ellipse(c.x + c.w * 0.85, c.y + 2, c.w * 0.28, c.h * 0.6, 0, 0, Math.PI * 2);
      cctx.fill();
    }

    function drawDino() {
      cctx.save();
      const x = dino.x, y = dino.y, w = dino.w, h = dino.h;
      // Sombra
      cctx.fillStyle = 'rgba(0,0,0,0.2)';
      const shadowScale = onGround ? 1 : Math.max(0.3, 1 - (groundY() - dino.y) / 80);
      cctx.beginPath();
      cctx.ellipse(x + w / 2, H - 6, (w / 2 + 2) * shadowScale, 4 * shadowScale, 0, 0, Math.PI * 2);
      cctx.fill();

      // Cuerpo (gradiente)
      const bodyGrad = cctx.createLinearGradient(x, y, x, y + h);
      bodyGrad.addColorStop(0, '#66BB6A');
      bodyGrad.addColorStop(1, '#388E3C');
      cctx.fillStyle = bodyGrad;
      cctx.strokeStyle = '#1a1a1a';
      cctx.lineWidth = 2.5;

      // Cuerpo
      cctx.beginPath();
      if (cctx.roundRect) cctx.roundRect(x + 2, y + 14, w - 6, h - 20, 6);
      else cctx.rect(x + 2, y + 14, w - 6, h - 20);
      cctx.fill(); cctx.stroke();

      // Cabeza
      cctx.beginPath();
      if (cctx.roundRect) cctx.roundRect(x + 10, y, w - 4, 18, 5);
      else cctx.rect(x + 10, y, w - 4, 18);
      cctx.fill(); cctx.stroke();

      // Cola
      cctx.beginPath();
      cctx.moveTo(x + 2, y + 16);
      cctx.lineTo(x - 8, y + 20);
      cctx.lineTo(x + 2, y + 25);
      cctx.closePath();
      cctx.fill(); cctx.stroke();

      // Espinas
      cctx.fillStyle = '#2E7D32';
      for (let i = 0; i < 3; i++) {
        cctx.beginPath();
        cctx.moveTo(x + 6 + i * 6, y + 14);
        cctx.lineTo(x + 9 + i * 6, y + 9);
        cctx.lineTo(x + 12 + i * 6, y + 14);
        cctx.closePath();
        cctx.fill(); cctx.stroke();
      }

      // Patas (animadas)
      cctx.fillStyle = '#388E3C';
      const runStep = Math.floor(frames / 5) % 2;
      if (onGround) {
        const off1 = runStep ? 0 : 4;
        const off2 = runStep ? 4 : 0;
        cctx.beginPath();
        if (cctx.roundRect) cctx.roundRect(x + 6, y + h - 8 + off1, 6, 8 - off1, 2);
        else cctx.rect(x + 6, y + h - 8 + off1, 6, 8 - off1);
        cctx.fill(); cctx.stroke();
        cctx.beginPath();
        if (cctx.roundRect) cctx.roundRect(x + 20, y + h - 8 + off2, 6, 8 - off2, 2);
        else cctx.rect(x + 20, y + h - 8 + off2, 6, 8 - off2);
        cctx.fill(); cctx.stroke();
      } else {
        cctx.beginPath();
        if (cctx.roundRect) cctx.roundRect(x + 8, y + h - 6, 7, 6, 2);
        else cctx.rect(x + 8, y + h - 6, 7, 6);
        cctx.fill(); cctx.stroke();
        cctx.beginPath();
        if (cctx.roundRect) cctx.roundRect(x + 20, y + h - 6, 7, 6, 2);
        else cctx.rect(x + 20, y + h - 6, 7, 6);
        cctx.fill(); cctx.stroke();
      }

      // Ojo
      const blink = (frames % 200) < 6;
      cctx.fillStyle = '#fff';
      cctx.fillRect(x + w - 8, y + 4, 6, blink ? 1 : 6);
      if (!blink) {
        cctx.fillStyle = '#1a1a1a';
        cctx.fillRect(x + w - 6, y + 5, 2, 3);
      }

      // Sonrisa
      cctx.strokeStyle = '#1a1a1a';
      cctx.lineWidth = 1.5;
      cctx.beginPath();
      cctx.moveTo(x + w - 4, y + 12);
      cctx.lineTo(x + w + 1, y + 13);
      cctx.stroke();

      cctx.restore();
    }
    function groundY() { return H - dino.h - 8; }

    function drawCactus(o, large) {
      const grad = cctx.createLinearGradient(o.x, o.y, o.x + o.w, o.y);
      grad.addColorStop(0, '#388E3C');
      grad.addColorStop(0.5, '#2E7D32');
      grad.addColorStop(1, '#1B5E20');
      cctx.fillStyle = grad;
      cctx.strokeStyle = '#1a1a1a';
      cctx.lineWidth = 2;
      // Tronco
      cctx.beginPath();
      if (cctx.roundRect) cctx.roundRect(o.x + o.w / 2 - 4, o.y, 8, o.h, 3);
      else cctx.rect(o.x + o.w / 2 - 4, o.y, 8, o.h);
      cctx.fill(); cctx.stroke();
      // Brazo izquierdo
      cctx.beginPath();
      if (cctx.roundRect) cctx.roundRect(o.x, o.y + o.h * 0.35, 6, o.h * 0.45, 2);
      else cctx.rect(o.x, o.y + o.h * 0.35, 6, o.h * 0.45);
      cctx.fill(); cctx.stroke();
      cctx.beginPath();
      if (cctx.roundRect) cctx.roundRect(o.x, o.y + o.h * 0.35, 8, 6, 2);
      else cctx.rect(o.x, o.y + o.h * 0.35, 8, 6);
      cctx.fill(); cctx.stroke();
      if (large) {
        cctx.beginPath();
        if (cctx.roundRect) cctx.roundRect(o.x + o.w - 6, o.y + o.h * 0.2, 6, o.h * 0.5, 2);
        else cctx.rect(o.x + o.w - 6, o.y + o.h * 0.2, 6, o.h * 0.5);
        cctx.fill(); cctx.stroke();
        cctx.beginPath();
        if (cctx.roundRect) cctx.roundRect(o.x + o.w - 8, o.y + o.h * 0.2, 8, 6, 2);
        else cctx.rect(o.x + o.w - 8, o.y + o.h * 0.2, 8, 6);
        cctx.fill(); cctx.stroke();
      }
      // Espinitas blancas
      cctx.fillStyle = '#fff';
      for (let i = 0; i < 4; i++) {
        cctx.fillRect(o.x + o.w / 2 - 1, o.y + 6 + i * (o.h / 5), 1, 2);
      }
    }

    function drawBird(o) {
      cctx.save();
      cctx.fillStyle = '#FF6B9D';
      cctx.strokeStyle = '#1a1a1a';
      cctx.lineWidth = 2;
      cctx.beginPath();
      cctx.ellipse(o.x + o.w / 2, o.y + o.h / 2, o.w / 2 - 2, o.h / 2 - 2, 0, 0, Math.PI * 2);
      cctx.fill(); cctx.stroke();
      // Alas
      const up = o.flap < 10;
      cctx.beginPath();
      if (up) {
        cctx.moveTo(o.x + 4, o.y + o.h / 2);
        cctx.lineTo(o.x + o.w / 2 - 2, o.y - 6);
        cctx.lineTo(o.x + o.w / 2 + 6, o.y + o.h / 2);
      } else {
        cctx.moveTo(o.x + 4, o.y + o.h / 2);
        cctx.lineTo(o.x + o.w / 2 - 2, o.y + o.h + 6);
        cctx.lineTo(o.x + o.w / 2 + 6, o.y + o.h / 2);
      }
      cctx.closePath();
      cctx.fill(); cctx.stroke();
      // Pico
      cctx.fillStyle = '#FFD700';
      cctx.beginPath();
      cctx.moveTo(o.x + o.w - 2, o.y + o.h / 2);
      cctx.lineTo(o.x + o.w + 6, o.y + o.h / 2 - 2);
      cctx.lineTo(o.x + o.w + 6, o.y + o.h / 2 + 2);
      cctx.closePath();
      cctx.fill(); cctx.stroke();
      // Ojo
      cctx.fillStyle = '#fff';
      cctx.fillRect(o.x + o.w - 9, o.y + o.h / 2 - 3, 3, 3);
      cctx.fillStyle = '#1a1a1a';
      cctx.fillRect(o.x + o.w - 8, o.y + o.h / 2 - 2, 2, 2);
      cctx.restore();
    }

    function draw() {
      // Cielo gradiente
      const sky = cctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, '#87CEEB');
      sky.addColorStop(0.6, '#B3E5FC');
      sky.addColorStop(1, '#FFE4B5');
      cctx.fillStyle = sky;
      cctx.fillRect(0, 0, W, H);

      // Sol con halo
      const haloGrad = cctx.createRadialGradient(sunX, 35, 18, sunX, 35, 40);
      haloGrad.addColorStop(0, 'rgba(255, 215, 0, 0.5)');
      haloGrad.addColorStop(1, 'rgba(255, 215, 0, 0)');
      cctx.fillStyle = haloGrad;
      cctx.fillRect(sunX - 40, -5, 80, 80);
      cctx.fillStyle = '#FFD700';
      cctx.strokeStyle = '#1a1a1a';
      cctx.lineWidth = 2;
      cctx.beginPath();
      cctx.arc(sunX, 35, 18, 0, Math.PI * 2);
      cctx.fill(); cctx.stroke();
      // Cara del sol
      cctx.fillStyle = '#1a1a1a';
      cctx.fillRect(sunX - 6, 32, 2, 3);
      cctx.fillRect(sunX + 4, 32, 2, 3);
      cctx.beginPath();
      cctx.arc(sunX, 40, 4, 0, Math.PI);
      cctx.lineWidth = 1.5;
      cctx.stroke();

      // Nubes
      clouds.forEach(drawCloud);

      // Suelo
      cctx.fillStyle = '#D2B48C';
      cctx.fillRect(0, H - 8, W, 8);
      cctx.strokeStyle = '#1a1a1a';
      cctx.lineWidth = 3;
      cctx.beginPath();
      cctx.moveTo(0, H - 8);
      cctx.lineTo(W, H - 8);
      cctx.stroke();

      // Piedras/marcas (parallax)
      cctx.fillStyle = '#8B6F47';
      for (let i = -1; i < W / 28 + 1; i++) {
        const gx = i * 28 - groundOffset;
        cctx.fillRect(gx + 4, H - 4, 7, 2);
        cctx.fillRect(gx + 18, H - 5, 4, 2);
      }

      // Polvo
      dustParticles.forEach(p => {
        const alpha = p.life / 20;
        cctx.fillStyle = `rgba(180, 150, 110, ${alpha})`;
        cctx.beginPath();
        cctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        cctx.fill();
      });

      // Obstáculos
      obstacles.forEach(o => {
        if (o.type === 'bird') drawBird(o);
        else drawCactus(o, o.type === 'cactus_l');
      });

      // Dino
      drawDino();

      // Indicador inicial
      if (started && frames < GRACE_FRAMES && frames > 0) {
        const remaining = Math.ceil((GRACE_FRAMES - frames) / 28);
        cctx.fillStyle = 'rgba(26,26,26,0.85)';
        cctx.fillRect(W / 2 - 80, H / 2 - 22, 160, 38);
        cctx.strokeStyle = '#FFD700';
        cctx.lineWidth = 3;
        cctx.strokeRect(W / 2 - 80, H / 2 - 22, 160, 38);
        cctx.fillStyle = '#FFD700';
        cctx.font = 'bold 22px Comic Sans MS, system-ui';
        cctx.textAlign = 'center';
        cctx.fillText('LISTO... ' + remaining, W / 2, H / 2 + 4);
      }
      // Mensaje "Presiona Start"
      if (!started) {
        cctx.fillStyle = 'rgba(26,26,26,0.85)';
        cctx.fillRect(W / 2 - 110, H / 2 - 22, 220, 38);
        cctx.strokeStyle = '#FFD700';
        cctx.lineWidth = 3;
        cctx.strokeRect(W / 2 - 110, H / 2 - 22, 220, 38);
        cctx.fillStyle = '#FFD700';
        cctx.font = 'bold 18px Comic Sans MS, system-ui';
        cctx.textAlign = 'center';
        cctx.fillText('▶ PRESIONA START', W / 2, H / 2 + 4);
      }
    }

    function end() {
      gameOver = true; clearInterval(loop);
      statusEl.textContent = '💥 GAME OVER';
      statusEl.className = 'cg-status is-lose';
      ctx.onLose();
    }
    function win() {
      gameOver = true; clearInterval(loop);
      statusEl.textContent = '🏆 ¡GANASTE!';
      statusEl.className = 'cg-status is-win';
      spawnConfetti(wrap, 35);
      ctx.onWin();
    }

    canvas.addEventListener('click', jump);
    canvas.addEventListener('touchstart', e => { jump(); e.preventDefault(); }, { passive: false });
    document.addEventListener('keydown', e => {
      if (e.code === 'Space') { jump(); e.preventDefault(); }
    });
    wrap.querySelector('#dino-jump-btn').addEventListener('click', jump);
    wrap.querySelector('#dino-start').addEventListener('click', () => {
      reset(); started = true; draw();
      clearInterval(loop);
      loop = setInterval(step, 26); // ~38fps, más fluido y rápido
    });
    reset(); draw();
  });

  // =====================================================================
  // 4. HANGMAN — horca colorida, teclado QWERTY, vidas con corazones
  // =====================================================================
  reg('hangman', function (ctx) {
    const words = (ctx.config && ctx.config.words) || ['ENGLISH', 'TEACHER', 'SCHOOL'];
    let word, guessed, mistakes, gameOver;
    const MAX = 6;

    const wrap = document.createElement('div');
    wrap.className = 'cg-hm-wrap';
    wrap.style.position = 'relative';
    wrap.innerHTML = `
      <svg id="hm-svg" class="cg-hm-stage" viewBox="0 0 240 240"></svg>
      <div id="hm-hearts" class="cg-hm-hearts"></div>
      <div id="hm-word" class="cg-hm-word"></div>
      <div id="hm-keys" class="cg-hm-keys"></div>
      <div id="hm-status" class="cg-status"></div>
      <button class="coeduca-btn coeduca-btn-success" id="hm-reset" style="margin-top:10px;">🔄 Nueva palabra</button>
    `;
    ctx.container.appendChild(wrap);

    const svg = wrap.querySelector('#hm-svg');
    const heartsEl = wrap.querySelector('#hm-hearts');
    const wordEl = wrap.querySelector('#hm-word');
    const keysEl = wrap.querySelector('#hm-keys');
    const statusEl = wrap.querySelector('#hm-status');

    function drawHangman() {
      // Partes del muñeco que se van revelando con cada error
      // 0: solo la base (siempre visible como escenario)
      // 1: cabeza, 2: cuerpo, 3: brazo izq, 4: brazo der, 5: pierna izq, 6: pierna der
      const head    = mistakes >= 1 ? `<circle cx="160" cy="78" r="16" fill="#FFE0B2" stroke="#1a1a1a" stroke-width="3" style="animation: cgPopBounce 0.4s;"/>
        <circle cx="155" cy="76" r="2" fill="#1a1a1a"/>
        <circle cx="165" cy="76" r="2" fill="#1a1a1a"/>
        <path d="M155 86 Q160 82 165 86" fill="none" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round"/>` : '';
      const body    = mistakes >= 2 ? `<line x1="160" y1="94" x2="160" y2="150" stroke="#E63946" stroke-width="4" stroke-linecap="round" style="animation: cgPopBounce 0.3s;"/>` : '';
      const armL    = mistakes >= 3 ? `<line x1="160" y1="108" x2="138" y2="128" stroke="#FFE0B2" stroke-width="4" stroke-linecap="round" style="animation: cgPopBounce 0.3s;"/>` : '';
      const armR    = mistakes >= 4 ? `<line x1="160" y1="108" x2="182" y2="128" stroke="#FFE0B2" stroke-width="4" stroke-linecap="round" style="animation: cgPopBounce 0.3s;"/>` : '';
      const legL    = mistakes >= 5 ? `<line x1="160" y1="150" x2="142" y2="180" stroke="#1976D2" stroke-width="4" stroke-linecap="round" style="animation: cgPopBounce 0.3s;"/>` : '';
      const legR    = mistakes >= 6 ? `<line x1="160" y1="150" x2="178" y2="180" stroke="#1976D2" stroke-width="4" stroke-linecap="round" style="animation: cgPopBounce 0.3s;"/>` : '';

      // Cuerda solo si ya hay cabeza
      const rope = mistakes >= 1 ? `<line x1="160" y1="40" x2="160" y2="62" stroke="#8B4513" stroke-width="2"/>` : '';

      svg.innerHTML = `
        <!-- Escenario: pasto -->
        <rect x="0" y="210" width="240" height="30" fill="#7CB342"/>
        <path d="M0 210 Q60 205 120 210 T240 210 L240 240 L0 240 Z" fill="#558B2F"/>
        <!-- Florcitas -->
        <circle cx="30" cy="218" r="3" fill="#FF6B9D"/>
        <circle cx="80" cy="220" r="3" fill="#FFD700"/>
        <circle cx="200" cy="218" r="3" fill="#FF6B9D"/>

        <!-- Base de la horca -->
        <rect x="40" y="205" width="100" height="8" fill="#8B4513" stroke="#1a1a1a" stroke-width="2.5"/>
        <!-- Poste vertical -->
        <rect x="78" y="30" width="10" height="180" fill="#A0522D" stroke="#1a1a1a" stroke-width="2.5"/>
        <!-- Travesaño -->
        <rect x="78" y="30" width="92" height="10" fill="#A0522D" stroke="#1a1a1a" stroke-width="2.5"/>
        <!-- Refuerzo diagonal -->
        <line x1="88" y1="50" x2="115" y2="40" stroke="#1a1a1a" stroke-width="2.5"/>

        ${rope}
        ${head}
        ${body}
        ${armL}
        ${armR}
        ${legL}
        ${legR}
      `;
    }

    function renderHearts() {
      const remaining = MAX - mistakes;
      let html = '';
      for (let i = 0; i < MAX; i++) {
        if (i < remaining) {
          const activeCls = (i === remaining - 1 && remaining <= 2) ? ' heart-active' : '';
          html += `<span class="${activeCls}">❤️</span>`;
        } else {
          html += `<span class="heart-lost">🖤</span>`;
        }
      }
      heartsEl.innerHTML = html;
    }

    function renderWord() {
      const html = word.split('').map(c => {
        if (guessed.has(c)) return `<span class="letter-revealed">${c}</span>`;
        return '<span>_</span>';
      }).join(' ');
      wordEl.innerHTML = html;
    }

    function buildKeys() {
      const rows = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];
      keysEl.innerHTML = rows.map(row => {
        const keys = row.split('').map(letter =>
          `<button class="cg-hm-key" data-letter="${letter}">${letter}</button>`
        ).join('');
        return `<div class="cg-hm-keys-row">${keys}</div>`;
      }).join('');
      keysEl.querySelectorAll('.cg-hm-key').forEach(btn => {
        btn.addEventListener('click', () => guess(btn.dataset.letter, btn));
      });
    }

    function reset() {
      word = words[Math.floor(Math.random() * words.length)].toUpperCase();
      guessed = new Set();
      mistakes = 0;
      gameOver = false;
      statusEl.textContent = '';
      statusEl.className = 'cg-status';
      // Defensa contra restauración de DOM (bfcache / iOS): limpiar cualquier
      // estado residual antes de reconstruir, así el juego siempre arranca
      // desde cero aunque el navegador hubiera guardado el HTML previo.
      keysEl.innerHTML = '';
      wordEl.innerHTML = '';
      svg.innerHTML = '';
      buildKeys();
      drawHangman();
      renderHearts();
      renderWord();
    }

    function guess(letter, btn) {
      if (gameOver || guessed.has(letter)) return;
      guessed.add(letter);
      btn.disabled = true;
      if (word.includes(letter)) {
        btn.classList.add('is-hit');
        renderWord();
        if (word.split('').every(c => guessed.has(c))) {
          gameOver = true;
          statusEl.textContent = `🎉 ¡Ganaste! La palabra era ${word}`;
          statusEl.className = 'cg-status is-win';
          spawnConfetti(wrap, 30);
          ctx.onWin();
        }
      } else {
        btn.classList.add('is-miss');
        // Shake del SVG
        svg.style.animation = 'cgShakeX 0.4s';
        setTimeout(() => { svg.style.animation = ''; }, 400);
        mistakes++;
        drawHangman();
        renderHearts();
        if (mistakes >= MAX) {
          gameOver = true;
          statusEl.textContent = `💀 Game Over. La palabra era ${word}`;
          statusEl.className = 'cg-status is-lose';
          ctx.onLose();
        }
      }
    }

    // Soporte teclado físico
    const keyHandler = e => {
      if (gameOver) return;
      // Si el juego ya no está en el DOM (re-render del layout), salir.
      if (!document.body.contains(wrap)) return;
      const letter = e.key.toUpperCase();
      if (/^[A-Z]$/.test(letter) && !guessed.has(letter)) {
        const btn = keysEl.querySelector(`[data-letter="${letter}"]`);
        if (btn && !btn.disabled) guess(letter, btn);
      }
    };
    document.addEventListener('keydown', keyHandler);

    // Cleanup automático: si el wrap es removido del DOM, removemos el listener
    // para evitar fugas y duplicados al re-renderizar el juego.
    if (typeof MutationObserver !== 'undefined') {
      const cleanupObserver = new MutationObserver(() => {
        if (!document.body.contains(wrap)) {
          document.removeEventListener('keydown', keyHandler);
          cleanupObserver.disconnect();
        }
      });
      cleanupObserver.observe(document.body, { childList: true, subtree: true });
    }

    wrap.querySelector('#hm-reset').addEventListener('click', reset);
    reset();
  });

  // =====================================================================
  // 5. TRIVIA — animaciones cuidadas, barra de progreso, transiciones
  // =====================================================================
  reg('trivia', function (ctx) {
    const questions = (ctx.config && ctx.config.questions) || [];
    const winThreshold = Math.ceil(questions.length * 0.7);
    const tieThreshold = Math.floor(questions.length / 2);
    let idx = 0, correct = 0, wrong = 0, finished = false, transitioning = false;

    const wrap = document.createElement('div');
    wrap.style.position = 'relative';
    wrap.innerHTML = `
      <div style="text-align:center;">
        <div id="tr-progress-text" style="font-weight:900;margin-bottom:4px;font-size:14px;
             text-transform:uppercase;letter-spacing:1px;"></div>
        <div class="cg-progress-bar"><div id="tr-progress-fill" class="cg-progress-fill" style="width:0%"></div></div>

        <div style="display:flex;justify-content:center;gap:8px;margin-bottom:14px;flex-wrap:wrap;">
          <span style="background:var(--coeduca-success);color:#fff;border:2px solid var(--coeduca-stroke);
                       border-radius:50px;padding:4px 14px;font-weight:900;font-size:13px;
                       box-shadow:2px 2px 0 var(--coeduca-stroke);">
            ✓ Aciertos: <span id="tr-correct">0</span>
          </span>
          <span style="background:var(--coeduca-error);color:#fff;border:2px solid var(--coeduca-stroke);
                       border-radius:50px;padding:4px 14px;font-weight:900;font-size:13px;
                       box-shadow:2px 2px 0 var(--coeduca-stroke);">
            ✗ Fallos: <span id="tr-wrong">0</span>
          </span>
        </div>

        <div id="tr-card-container" style="min-height:100px;"></div>
        <div id="tr-options" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;"></div>
        <div id="tr-status" class="cg-status"></div>
      </div>
    `;
    ctx.container.appendChild(wrap);

    const cardContainer = wrap.querySelector('#tr-card-container');
    const opts = wrap.querySelector('#tr-options');
    const progText = wrap.querySelector('#tr-progress-text');
    const progFill = wrap.querySelector('#tr-progress-fill');
    const correctEl = wrap.querySelector('#tr-correct');
    const wrongEl = wrap.querySelector('#tr-wrong');
    const statusEl = wrap.querySelector('#tr-status');
    const colors = ['#FF6B9D', '#4FC3F7', '#FFD700', '#A8E6CF'];

    function updateProgress() {
      const pct = (idx / questions.length) * 100;
      progFill.style.width = pct + '%';
      progText.textContent = `Pregunta ${Math.min(idx + 1, questions.length)} de ${questions.length}`;
      correctEl.textContent = correct;
      wrongEl.textContent = wrong;
    }

    function render() {
      if (idx >= questions.length || finished) return finish();
      transitioning = false;
      updateProgress();
      const q = questions[idx];

      // Card nueva con animación de entrada
      cardContainer.innerHTML = `<div class="cg-trivia-card">${C.escapeHTML(q.q)}</div>`;
      // Opciones
      opts.innerHTML = '';
      q.options.forEach((o, j) => {
        const b = document.createElement('button');
        b.className = 'coeduca-btn cg-trivia-opt';
        b.style.background = colors[j % 4];
        b.style.color = '#1a1a1a';
        b.style.animation = `cgPopBounce 0.35s ${j * 0.06}s both`;
        b.innerHTML = `<b>${'ABCD'[j]}.</b> ${C.escapeHTML(o)}`;
        b.addEventListener('click', () => answer(j, b, q.answer));
        opts.appendChild(b);
      });
    }

    function answer(picked, btn, correctIdx) {
      if (finished || transitioning) return;
      transitioning = true;
      const isCorrect = picked === correctIdx;
      const allBtns = [...opts.children];
      allBtns.forEach((b, j) => {
        b.disabled = true;
        if (j === correctIdx) b.classList.add('is-correct');
        if (j === picked && !isCorrect) b.classList.add('is-wrong');
      });

      if (isCorrect) {
        correct++;
        // Confetti pequeño
        spawnConfetti(wrap, 12);
      } else {
        wrong++;
      }
      correctEl.textContent = correct;
      wrongEl.textContent = wrong;

      setTimeout(() => {
        // Animación de salida de la card actual
        const card = cardContainer.querySelector('.cg-trivia-card');
        if (card) card.classList.add('is-leaving');
        // Apagar las opciones también
        allBtns.forEach(b => {
          b.style.transition = 'opacity 0.25s';
          b.style.opacity = '0';
        });
        setTimeout(() => {
          idx++;
          render();
        }, 320);
      }, 1100);
    }

    function finish() {
      finished = true;
      cardContainer.innerHTML = '';
      opts.innerHTML = '';
      progFill.style.width = '100%';
      progText.textContent = 'Resultado final';
      const pct = Math.round((correct / questions.length) * 100);
      let icon, msgClass;
      if (correct >= winThreshold) {
        icon = '🏆'; msgClass = 'is-win';
        spawnConfetti(wrap, 50);
        ctx.onWin();
      } else if (correct >= tieThreshold) {
        icon = '👍'; msgClass = 'is-tie';
        ctx.onTie();
      } else {
        icon = '📚'; msgClass = 'is-lose';
        ctx.onLose();
      }
      statusEl.innerHTML = `${icon} ${correct} / ${questions.length} (${pct}%)`;
      statusEl.className = 'cg-status ' + msgClass;
    }

    if (questions.length === 0) {
      cardContainer.innerHTML = `<div class="cg-trivia-card">No hay preguntas configuradas.</div>`;
      return;
    }
    render();
  });

})(typeof window !== 'undefined' ? window : this);