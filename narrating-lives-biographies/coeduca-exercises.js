/**
 * COEDUCA Framework v1 - Exercises
 * 15 tipos de ejercicios reutilizables.
 * Depende de coeduca-core.js.
 *
 * Cada ejercicio recibe ctx = {
 *   container, exerciseId, data, config,
 *   recordAnswer(score, total, details), cheer(), comfort()
 * }
 */
(function (global) {
  'use strict';
  if (!global.COEDUCA) {
    console.error('coeduca-core.js debe cargarse antes que coeduca-exercises.js');
    return;
  }
  const C = global.COEDUCA;
  const reg = (type, fn) => C.registerExercise(type, fn);

  // Inyectar estilos auxiliares una sola vez (placeholder de reorder_sentences)
  (function injectAuxStyles() {
    if (document.getElementById('coeduca-aux-styles')) return;
    const style = document.createElement('style');
    style.id = 'coeduca-aux-styles';
    style.textContent =
      '.ro-target[data-show-placeholder]::before{' +
        'content:attr(data-placeholder);' +
        'position:absolute;' +
        'top:50%;left:50%;transform:translate(-50%,-50%);' +
        'width:calc(100% - 20px);' +
        'text-align:center;' +
        'color:#9aa0a6;' +
        'font-style:italic;' +
        'font-size:13px;' +
        'pointer-events:none;' +
        'line-height:1.3;' +
      '}';
    document.head.appendChild(style);
  })();

  // Helper: feedback visual junto a un input/elemento
  function feedback(target, ok, ctx) {
    const span = document.createElement('span');
    span.className = 'coeduca-feedback ' + (ok ? 'correct' : 'wrong');
    span.textContent = ok ? 'OK' : 'X';
    target.parentNode.insertBefore(span, target.nextSibling);
    if (ok) ctx.cheer(); else ctx.comfort();
  }

  function gradeButton(onCheck) {
    const btn = document.createElement('button');
    btn.className = 'coeduca-btn coeduca-btn-success';
    btn.textContent = 'Revisar respuestas';
    btn.style.marginTop = '12px';
    btn.addEventListener('click', onCheck);
    return btn;
  }

  // =====================================================================
  // 1. WORDSEARCH (sopa de letras con celdas compartidas)
  // =====================================================================
  reg('wordsearch', function (ctx) {
    const data = ctx.data || {};
    const words = (data.words || []).map(w => String(w).toUpperCase().replace(/\s+/g, ''));
    const directions = [
      [0, 1], [1, 0], [1, 1], [-1, 1]  // H, V, diag down-right, diag up-right
    ];

    // Estrategia de colocación:
    //   1) Ordenar palabras de mayor a menor longitud (las largas son las más
    //      difíciles de encajar; colocarlas primero deja más libertad luego).
    //   2) Para cada palabra, evaluar TODAS las posiciones+direcciones válidas
    //      y puntuarlas por # de letras compartidas con palabras ya colocadas.
    //      Elegir entre las de mejor puntaje (con desempate aleatorio) para
    //      MAXIMIZAR el solapamiento de letras y ahorrar espacio en la grilla.
    //   3) Si una palabra no cabe, agrandar la grilla en +1 y reintentar todo.
    //      Esto garantiza que nunca se "pierda" silenciosamente una palabra
    //      como ocurría antes (CRIED quedaba fuera y la grilla no la incluía).

    const minSize = data.gridSize || Math.max(10, ...words.map(w => w.length + 2));
    const maxSize = minSize + 8; // techo razonable para evitar bucles
    let size, grid, placements;

    function findBestPlacement(grid, size, word) {
      const candidates = [];
      let bestScore = -1;
      for (let d = 0; d < directions.length; d++) {
        const [dr, dc] = directions[d];
        for (let r = 0; r < size; r++) {
          for (let c = 0; c < size; c++) {
            const endR = r + dr * (word.length - 1);
            const endC = c + dc * (word.length - 1);
            if (endR < 0 || endR >= size || endC < 0 || endC >= size) continue;
            let overlap = 0;
            let ok = true;
            for (let i = 0; i < word.length; i++) {
              const cell = grid[r + dr * i][c + dc * i];
              if (cell === '') continue;
              if (cell === word[i]) overlap++;
              else { ok = false; break; }
            }
            if (!ok) continue;
            if (overlap > bestScore) {
              bestScore = overlap;
              candidates.length = 0;
              candidates.push({ r, c, dr, dc });
            } else if (overlap === bestScore) {
              candidates.push({ r, c, dr, dc });
            }
          }
        }
      }
      if (!candidates.length) return null;
      // Desempate aleatorio entre las mejores opciones
      return candidates[Math.floor(Math.random() * candidates.length)];
    }

    function attemptLayout(targetSize) {
      const g = Array.from({ length: targetSize }, () => Array(targetSize).fill(''));
      const place = [];
      // Palabras largas primero; copia para no mutar el array original.
      const ordered = words.slice().sort((a, b) => b.length - a.length);
      for (const word of ordered) {
        const pick = findBestPlacement(g, targetSize, word);
        if (!pick) return null; // falla: hay que crecer la grilla
        const { r, c, dr, dc } = pick;
        for (let i = 0; i < word.length; i++) g[r + dr * i][c + dc * i] = word[i];
        place.push({ word, r, c, dr, dc });
      }
      return { g, place };
    }

    // Buscar el tamaño mínimo que acomode todas las palabras.
    // Se hacen varios reintentos por tamaño porque la elección aleatoria de
    // desempates puede llevar a un callejón sin salida en una corrida concreta.
    size = minSize;
    let layout = null;
    while (!layout && size <= maxSize) {
      for (let retry = 0; retry < 6 && !layout; retry++) {
        layout = attemptLayout(size);
      }
      if (!layout) size++;
    }
    if (!layout) {
      // Garantía absoluta: en caso patológico, usar el tamaño máximo
      // y al menos colocar lo que se pueda (mantiene comportamiento previo).
      size = maxSize;
      const g = Array.from({ length: size }, () => Array(size).fill(''));
      const place = [];
      const ordered = words.slice().sort((a, b) => b.length - a.length);
      for (const word of ordered) {
        const pick = findBestPlacement(g, size, word);
        if (!pick) continue;
        const { r, c, dr, dc } = pick;
        for (let i = 0; i < word.length; i++) g[r + dr * i][c + dc * i] = word[i];
        place.push({ word, r, c, dr, dc });
      }
      layout = { g, place };
    }
    grid = layout.g;
    placements = layout.place;

    // Rellenar celdas vacías con letras aleatorias.
    // Sesgar el relleno hacia letras que YA aparecen en las palabras objetivo
    // hace que la sopa se sienta menos "rellena de ruido" y más coherente.
    const targetLetters = words.join('') || 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const fallbackLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (grid[r][c] === '') {
          // 70% letras del pool de palabras, 30% alfabeto general
          const pool = Math.random() < 0.7 ? targetLetters : fallbackLetters;
          grid[r][c] = pool[Math.floor(Math.random() * pool.length)];
        }
      }
    }

    // Render
    const wrap = document.createElement('div');
    // Font size dinámico: cada celda ocupa ~(100/size)% del ancho del grid.
    // Queremos que la letra ocupe ~55% de la celda. Mínimo absoluto 9px.
    // cqw funciona porque .ws-grid tiene container-type: inline-size.
    const cellFontSize = `max(9px, ${(55 / size).toFixed(2)}cqw)`;
    wrap.innerHTML = `
      <div class="ws-grid-wrap">
        <div id="ws-grid-${ctx.exerciseId}" class="ws-grid"
             style="grid-template-columns:repeat(${size},1fr); --ws-cell-font:${cellFontSize};"></div>
        <div class="ws-list">
          <div class="ws-list-title">Palabras</div>
          <ul id="ws-list-${ctx.exerciseId}">
            ${words.map(w => `<li data-w="${w}">${w}</li>`).join('')}
          </ul>
          <div class="ws-progress" id="ws-progress-${ctx.exerciseId}">0 / ${words.length}</div>
        </div>
      </div>
    `;
    ctx.container.appendChild(wrap);

    const gridEl = wrap.querySelector('#ws-grid-' + ctx.exerciseId);
    const listEl = wrap.querySelector('#ws-list-' + ctx.exerciseId);
    const progressEl = wrap.querySelector('#ws-progress-' + ctx.exerciseId);

    // Capa SVG sobrepuesta para dibujar las "marcas resaltadoras" sobre las palabras
    // encontradas (estilo marcador pop art).
    gridEl.style.position = 'relative';
    const overlaySvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    overlaySvg.setAttribute('class', 'ws-overlay');
    overlaySvg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:5;overflow:visible;';
    gridEl.appendChild(overlaySvg);

    // Paleta rotativa para los "marcadores" de palabras encontradas
    const highlighterColors = [
      'rgba(255, 215, 0, 0.55)',   // dorado
      'rgba(255, 107, 157, 0.50)', // rosa
      'rgba(79, 195, 247, 0.50)',  // celeste
      'rgba(155, 93, 229, 0.50)',  // morado
      'rgba(255, 159, 28, 0.55)',  // naranja
      'rgba(76, 175, 80, 0.50)'    // verde
    ];
    let foundColorIndex = 0;

    let cellIdx = 0;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const cell = document.createElement('div');
        cell.textContent = grid[r][c];
        cell.dataset.r = r;
        cell.dataset.c = c;
        cell.className = 'ws-cell';
        // Índice usado por el CSS para animación escalonada (cellIn)
        cell.style.setProperty('--i', cellIdx++);
        gridEl.appendChild(cell);
      }
    }

    // Dibuja el trazo de marcador sobre la palabra encontrada
    function drawHighlight(cells) {
      if (!cells || cells.length === 0) return;
      const gridRect = gridEl.getBoundingClientRect();
      const first = cells[0].getBoundingClientRect();
      const last = cells[cells.length - 1].getBoundingClientRect();
      const x1 = first.left + first.width / 2 - gridRect.left;
      const y1 = first.top + first.height / 2 - gridRect.top;
      const x2 = last.left + last.width / 2 - gridRect.left;
      const y2 = last.top + last.height / 2 - gridRect.top;
      // Grosor proporcional al tamaño de la celda
      const thickness = first.width * 0.78;

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      const color = highlighterColors[foundColorIndex++ % highlighterColors.length];
      line.setAttribute('x1', x1);
      line.setAttribute('y1', y1);
      line.setAttribute('x2', x2);
      line.setAttribute('y2', y2);
      line.setAttribute('stroke', color);
      line.setAttribute('stroke-width', thickness);
      line.setAttribute('stroke-linecap', 'round');
      line.style.mixBlendMode = 'multiply';
      // Animación: el trazo se "dibuja" desde el inicio
      const len = Math.hypot(x2 - x1, y2 - y1);
      line.setAttribute('stroke-dasharray', len);
      line.setAttribute('stroke-dashoffset', len);
      line.style.transition = 'stroke-dashoffset 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)';
      overlaySvg.appendChild(line);
      // Triggear la animación en el siguiente frame
      requestAnimationFrame(() => { line.setAttribute('stroke-dashoffset', 0); });
    }

    // Burst de confeti pop art al encontrar una palabra
    function popConfetti(cells) {
      if (!cells || !cells.length) return;
      const mid = cells[Math.floor(cells.length / 2)];
      const rect = mid.getBoundingClientRect();
      const gridRect = gridEl.getBoundingClientRect();
      const cx = rect.left + rect.width / 2 - gridRect.left;
      const cy = rect.top + rect.height / 2 - gridRect.top;
      const colors = ['#FFD700', '#FF6B9D', '#4FC3F7', '#9B5DE5', '#FF9F1C', '#6FCF97'];
      const layer = document.createElement('div');
      layer.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:6;overflow:visible;';
      gridEl.appendChild(layer);
      const N = 14;
      for (let i = 0; i < N; i++) {
        const dot = document.createElement('span');
        const angle = (Math.PI * 2 * i) / N + Math.random() * 0.4;
        const dist = 40 + Math.random() * 60;
        const dx = Math.cos(angle) * dist;
        const dy = Math.sin(angle) * dist;
        const color = colors[i % colors.length];
        const isStar = i % 2 === 0;
        dot.style.cssText = `
          position:absolute; left:${cx}px; top:${cy}px;
          width:${isStar ? 10 : 7}px; height:${isStar ? 10 : 7}px;
          background:${color};
          border:1.5px solid #1a1a1a;
          border-radius:${isStar ? '2px' : '50%'};
          transform: translate(-50%,-50%) rotate(0deg);
          transition: transform 0.7s cubic-bezier(0.22, 0.61, 0.36, 1), opacity 0.7s ease-out;
          opacity: 1;
        `;
        layer.appendChild(dot);
        requestAnimationFrame(() => {
          dot.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(${(Math.random()*720-360)|0}deg) scale(${0.4 + Math.random()*0.6})`;
          dot.style.opacity = '0';
        });
      }
      setTimeout(() => layer.remove(), 800);
    }

    let selecting = false;
    let startCell = null;
    let currentSelection = [];
    const found = new Set();

    function clearTempHighlight() {
      gridEl.querySelectorAll('.ws-cell').forEach(c => {
        if (!c.classList.contains('ws-found')) c.classList.remove('ws-active');
      });
    }

    function getCellFromPoint(x, y) {
      const el = document.elementFromPoint(x, y);
      if (el && el.dataset && el.dataset.r !== undefined) return el;
      return null;
    }

    function getLineCells(a, b) {
      const r1 = +a.dataset.r, c1 = +a.dataset.c;
      const r2 = +b.dataset.r, c2 = +b.dataset.c;
      const dr = r2 - r1, dc = c2 - c1;
      const len = Math.max(Math.abs(dr), Math.abs(dc));
      if (len === 0) return [a];
      // Solo aceptamos H, V o diagonales perfectas
      if (dr !== 0 && dc !== 0 && Math.abs(dr) !== Math.abs(dc)) return null;
      const stepR = dr === 0 ? 0 : dr / Math.abs(dr);
      const stepC = dc === 0 ? 0 : dc / Math.abs(dc);
      const cells = [];
      for (let i = 0; i <= len; i++) {
        const cell = gridEl.querySelector(`[data-r="${r1 + stepR * i}"][data-c="${c1 + stepC * i}"]`);
        if (!cell) return null;
        cells.push(cell);
      }
      return cells;
    }

    function start(e) {
      const point = e.touches ? e.touches[0] : e;
      const cell = getCellFromPoint(point.clientX, point.clientY);
      if (!cell) return;
      selecting = true;
      startCell = cell;
      currentSelection = [cell];
      clearTempHighlight();
      cell.classList.add('ws-active');
      e.preventDefault();
    }
    function move(e) {
      if (!selecting) return;
      const point = e.touches ? e.touches[0] : e;
      const cell = getCellFromPoint(point.clientX, point.clientY);
      if (!cell) return;
      const cells = getLineCells(startCell, cell);
      if (!cells) return;
      clearTempHighlight();
      cells.forEach(c => { if (!c.classList.contains('ws-found')) c.classList.add('ws-active'); });
      currentSelection = cells;
      e.preventDefault();
    }
    function end() {
      if (!selecting) return;
      selecting = false;
      if (!currentSelection.length) return;
      const word = currentSelection.map(c => c.textContent).join('');
      const reverse = word.split('').reverse().join('');
      const target = words.find(w => (w === word || w === reverse) && !found.has(w));
      if (target) {
        found.add(target);
        const cellsCopy = currentSelection.slice(); // referencia estable
        currentSelection.forEach((c, i) => {
          c.classList.remove('ws-active');
          // Stagger the pop animation across the word
          setTimeout(() => c.classList.add('ws-found'), i * 60);
        });
        // Trazo resaltador SVG y confeti pop art
        drawHighlight(cellsCopy);
        popConfetti(cellsCopy);
        const li = listEl.querySelector(`[data-w="${target}"]`);
        if (li) li.classList.add('ws-li-found');
        if (progressEl) progressEl.textContent = found.size + ' / ' + words.length;
        ctx.cheer();
        ctx.recordAnswer(found.size, words.length,
          words.map(w => found.has(w) ? w + ': encontrada' : w + ': no encontrada'));
      } else {
        clearTempHighlight();
      }
      currentSelection = [];
    }

    gridEl.addEventListener('mousedown', start);
    gridEl.addEventListener('mousemove', move);
    gridEl.addEventListener('mouseup', end);
    gridEl.addEventListener('touchstart', start, { passive: false });
    gridEl.addEventListener('touchmove', move, { passive: false });
    gridEl.addEventListener('touchend', end);
  });

  // =====================================================================
  // 2. MATCHLINES (unir con líneas usando SVG)
  // =====================================================================
  reg('matchlines', function (ctx) {
    const pairs = ctx.data || []; // [{left, right}, ...]
    const left = C.shuffle(pairs.map((p, i) => ({ id: i, text: p.left })));
    const right = C.shuffle(pairs.map((p, i) => ({ id: i, text: p.right })));

    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <div style="position:relative; padding: 20px 0; width: 100%;">
        <svg id="ml-svg-${ctx.exerciseId}" style="position:absolute;inset:0;width:100%;height:100%;
             pointer-events:none;z-index:1; overflow:visible;"></svg>
        <div style="display:flex; justify-content:center; gap:120px; position:relative; z-index:2;">
          <div id="ml-left-${ctx.exerciseId}" style="display:flex; flex-direction:column; justify-content:center; gap:15px;"></div>
          <div id="ml-right-${ctx.exerciseId}" style="display:flex; flex-direction:column; justify-content:center; gap:15px;"></div>
        </div>
      </div>
    `;
    ctx.container.appendChild(wrap);

    const svg = wrap.querySelector('#ml-svg-' + ctx.exerciseId);
    const leftCol = wrap.querySelector('#ml-left-' + ctx.exerciseId);
    const rightCol = wrap.querySelector('#ml-right-' + ctx.exerciseId);

    function makeItem(item, side) {
      const el = document.createElement('div');
      el.textContent = item.text;
      el.dataset.id = item.id;
      el.dataset.side = side;
      
      const bgColor = side === 'L' ? '#E1F5FE' : '#FFF9C4';

      el.style.cssText = `background:${bgColor}; border:3px solid #1a1a1a; border-radius:10px;
        padding:10px 20px; font-weight:bold; cursor:pointer; box-sizing: border-box;
        text-align:center; box-shadow:2px 2px 0 #1a1a1a; transition:transform 0.15s, background 0.15s;
        width:max-content; position:relative; z-index:2;`;
        
      return el;
    }
    
    left.forEach(it => leftCol.appendChild(makeItem(it, 'L')));
    right.forEach(it => rightCol.appendChild(makeItem(it, 'R')));

    const connections = []; // {leftId, rightId, lineEl}
    let activeLeft = null;

    function getConnectionPoint(el, side) {
      const rect = el.getBoundingClientRect();
      const parent = wrap.getBoundingClientRect();
      const x = side === 'L' ? rect.right : rect.left;
      return { 
        x: x - parent.left, 
        y: rect.top + rect.height / 2 - parent.top 
      };
    }

    function drawLine(a, b, color) {
      const p1 = getConnectionPoint(a, 'L');
      const p2 = getConnectionPoint(b, 'R');
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      
      const offset = Math.abs(p2.x - p1.x) * 0.5; 
      // Aquí está corregida la línea del error
      const d = `M ${p1.x},${p1.y} C ${p1.x + offset},${p1.y} ${p2.x - offset},${p2.y} ${p2.x},${p2.y}`;
      
      path.setAttribute('d', d);
      path.setAttribute('stroke', color || '#1a1a1a');
      path.setAttribute('stroke-width', '4');
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke-linecap', 'round');
      
      svg.appendChild(path);
      return path;
    }

    function redrawAll() {
      svg.innerHTML = '';
      const r = wrap.getBoundingClientRect();
      // Aquí también se corrigieron las comillas invertidas
      svg.setAttribute('viewBox', `0 0 ${r.width} ${r.height}`);
      svg.style.height = r.height + 'px';
      
      connections.forEach(con => {
        // Y aquí
        const a = leftCol.querySelector(`[data-id="${con.leftId}"]`);
        const b = rightCol.querySelector(`[data-id="${con.rightId}"]`);
        con.lineEl = drawLine(a, b, con.correct ? '#4CAF50' : '#E63946');
      });
    }

    [leftCol, rightCol].forEach(col => {
      col.addEventListener('click', e => {
        const item = e.target.closest('[data-id]');
        if (!item) return;
        
        if (item.dataset.side === 'L') {
          const idx = connections.findIndex(c => c.leftId == item.dataset.id);
          if (idx >= 0) connections.splice(idx, 1);
          
          leftCol.querySelectorAll('[data-id]').forEach(el => el.style.background = '#E1F5FE');
          
          activeLeft = item;
          item.style.background = '#FFD700';
        } else if (activeLeft) {
          const idx = connections.findIndex(c => c.rightId == item.dataset.id);
          if (idx >= 0) connections.splice(idx, 1);
          
          const correct = activeLeft.dataset.id === item.dataset.id;
          connections.push({
            leftId: activeLeft.dataset.id,
            rightId: item.dataset.id,
            correct
          });
          
          if (correct) ctx.cheer(); else ctx.comfort();
          activeLeft.style.background = correct ? '#A8E6CF' : '#FFCDD2';
          activeLeft = null;
          redrawAll();
          checkAll();
        }
      });
    });

    function checkAll() {
      const correct = connections.filter(c => c.correct).length;
      // Y aquí en el registro final
      ctx.recordAnswer(correct, pairs.length,
        connections.map(c => `${c.leftId} -> ${c.rightId}: ${c.correct ? 'OK' : 'X'}`));
    }

    function equalizeWidthsAndDraw() {
      let maxW = 0;
      const allCards = wrap.querySelectorAll('[data-id]');
      
      allCards.forEach(el => {
        if (el.offsetWidth > maxW) maxW = el.offsetWidth;
      });
      
      allCards.forEach(el => {
        el.style.width = maxW + 'px';
      });
      
      redrawAll();
    }

    setTimeout(equalizeWidthsAndDraw, 100);
    window.addEventListener('resize', redrawAll);
});

  // =====================================================================
  // 3. DRAGBANK (arrastrar palabras de un banco a huecos)
  // =====================================================================
  reg('dragbank', function (ctx) {
    // data: { sentences: [{text: 'I ___ to school', answer: 'go'}, ...], bank: ['extra', 'words'] }
    const sentences = (ctx.data && ctx.data.sentences) || [];
    const extraBank = (ctx.data && ctx.data.bank) || [];
    const allWords = C.shuffle([...sentences.map(s => s.answer), ...extraBank]);

    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <div id="db-bank-${ctx.exerciseId}" style="display:flex;flex-wrap:wrap;gap:8px;
           padding:14px;background:#FFF8E7;border:3px dashed #1a1a1a;border-radius:12px;
           margin-bottom:16px;min-height:50px;">
      </div>
      <div id="db-sentences-${ctx.exerciseId}"></div>
    `;
    ctx.container.appendChild(wrap);

    const bankEl = wrap.querySelector('#db-bank-' + ctx.exerciseId);
    const sentEl = wrap.querySelector('#db-sentences-' + ctx.exerciseId);

    function makeWord(w) {
      const el = document.createElement('div');
      el.textContent = w;
      el.className = 'db-word';
      el.dataset.word = w;
      el.style.cssText = `background:#FF6B9D;color:#fff;border:3px solid #1a1a1a;border-radius:8px;
        padding:6px 12px;font-weight:900;cursor:grab;box-shadow:2px 2px 0 #1a1a1a;
        text-shadow:1px 1px 0 #1a1a1a;user-select:none;-webkit-user-select:none;`;
      attachDrag(el);
      return el;
    }
    allWords.forEach(w => bankEl.appendChild(makeWord(w)));

    sentences.forEach((s, i) => {
      const row = document.createElement('div');
      row.style.cssText = 'margin:10px 0;font-size:16px;line-height:2;font-weight:bold;';
      const parts = s.text.split('___');
      const slot = `<span class="db-slot" data-i="${i}" data-answer="${C.escapeHTML(s.answer)}"
                    style="display:inline-block;min-width:80px;min-height:30px;border:3px dashed #1a1a1a;
                    border-radius:6px;padding:2px 8px;margin:0 4px;background:#FFF;vertical-align:middle;"></span>`;
      row.innerHTML = (i + 1) + '. ' + C.escapeHTML(parts[0]) + slot + C.escapeHTML(parts[1] || '');
      sentEl.appendChild(row);
    });

    function attachDrag(el) {
      C.makeDraggable(el, {
        onMove: ({ under }) => {
          document.querySelectorAll('.db-slot').forEach(s => s.classList.remove('coeduca-drop-hover'));
          const slot = under && under.closest && under.closest('.db-slot');
          if (slot) slot.classList.add('coeduca-drop-hover');
        },
        onDrop: ({ under }) => {
          document.querySelectorAll('.db-slot').forEach(s => s.classList.remove('coeduca-drop-hover'));
          
          if (!under) return;
          const slot = under.closest && under.closest('.db-slot');
          if (slot) {
            const existing = slot.querySelector('.db-word');
            if (existing) bankEl.appendChild(existing);
            slot.appendChild(el);
            
            if (C.normalize(el.textContent) === C.normalize(slot.dataset.answer)) {
              ctx.cheer();
            } else {
              ctx.comfort();
            }
            // -------------------------------
            check();
          } else {
            if (el.parentElement && !el.parentElement.classList.contains('db-slot')) {
            } else {
              bankEl.appendChild(el);
            }
          }
        }
      });
    }

    function check() {
      let correct = 0;
      const details = [];
      sentEl.querySelectorAll('.db-slot').forEach(slot => {
        const w = slot.querySelector('.db-word');
        const ans = slot.dataset.answer;
        if (w && C.normalize(w.textContent) === C.normalize(ans)) {
          correct++;
          slot.style.borderColor = '#4CAF50';
          slot.style.background = '#E8F5E9';
          details.push(ans + ': OK');
        } else {
          slot.style.borderColor = w ? '#E63946' : '#1a1a1a';
          slot.style.background = w ? '#FFEBEE' : '#FFF';
          details.push(ans + ': ' + (w ? w.textContent + ' (X)' : 'vacío'));
        }
      });
      ctx.recordAnswer(correct, sentences.length, details);
      if (correct === sentences.length) ctx.cheer();
    }
  });

  // NOTA: 'listenfill' (escuchar y rellenar) se logra usando type:'dragbank'
  // con la propiedad 'audio' a nivel de ejercicio. El core renderiza el
  // reproductor automáticamente arriba del banco de palabras.

  // =====================================================================
  // 5. REORDER_SENTENCES (reordenar oraciones desordenadas) - MEJORADO
  // =====================================================================
  reg('reorder_sentences', function (ctx) {
    // data: [{ words: ['I', 'go', 'to', 'school'], es: 'Voy a la escuela' }]
    //   o   [{ sentence: 'I go to school', es: 'Voy a la escuela' }]
    // El campo `es` es opcional. Si se incluye, se muestra como placeholder
    // dentro de la caja vacía donde el alumno arma la oración: una pista en
    // español para que sepa qué oración tiene que armar.
    const items = (ctx.data || []).map((it, idx) => {
      const words = it.words || it.sentence.split(/\s+/);
      return {
        idx,
        original: words.slice(),
        shuffled: C.shuffle(words.slice()),
        es: it.es || ''
      };
    });

    const wrap = document.createElement('div');

    items.forEach((it, i) => {
      const rowWrap = document.createElement('div');
      rowWrap.style.cssText = 'margin:14px 0;padding:12px;background:#FFF8E7;border:3px solid #1a1a1a;border-radius:10px;';

      const header = document.createElement('div');
      header.style.cssText = 'font-weight:bold;margin-bottom:12px;';
      header.textContent = `${i + 1}. Ordena las palabras para formar la oración:`;
      rowWrap.appendChild(header);

      // Si el item incluye traducción al español, la mostramos arriba de las cajas
      // como una pista clara y leíble (con icono y estilo distinto de las fichas).
      if (it.es) {
        const hint = document.createElement('div');
        hint.style.cssText = 'margin:0 0 10px 0;padding:8px 12px;background:#FFF3CD;' +
          'border:2px dashed #1a1a1a;border-radius:8px;font-style:italic;font-size:14px;' +
          'color:#1a1a1a;';
        hint.innerHTML = '<b>Pista en español:</b> ' + C.escapeHTML(it.es);
        rowWrap.appendChild(hint);
      }

      // Contenedor responsivo
      const flexContainer = document.createElement('div');
      flexContainer.style.cssText = 'display:flex; flex-wrap:wrap; gap:10px;';

      // Caja 1: Banco (Origen)
      const sourceBox = document.createElement('div');
      sourceBox.className = 'ro-source';
      sourceBox.style.cssText = 'flex:1 1 200px; display:flex; flex-wrap:wrap; align-content:flex-start; gap:6px; min-height:48px; padding:8px; background:#f0f0f0; border:2px dashed #1a1a1a; border-radius:8px;';

      // Caja 2: Zona (Destino).
      // Usamos un placeholder CSS-only mediante `data-placeholder` + ::before
      // para que se muestre solo cuando la caja esté vacía. Si no hay traducción,
      // usamos un texto neutro que invita a soltar las palabras aquí.
      const targetBox = document.createElement('div');
      targetBox.className = 'ro-target';
      targetBox.dataset.i = i;
      const placeholderText = it.es
        ? '"' + it.es + '"  -  arma la oración en inglés aquí'
        : 'Suelta las palabras aquí';
      targetBox.dataset.placeholder = placeholderText;
      targetBox.style.cssText = 'position:relative; flex:1 1 200px; display:flex; flex-wrap:wrap; align-content:flex-start; gap:6px; min-height:48px; padding:8px; background:#fff; border:2px solid #1a1a1a; border-radius:8px; box-shadow:inset 2px 2px 6px rgba(0,0,0,0.06);';

      flexContainer.appendChild(sourceBox);
      flexContainer.appendChild(targetBox);
      rowWrap.appendChild(flexContainer);
      wrap.appendChild(rowWrap);

      // Helper: muestra/oculta el placeholder según el contenido de targetBox
      const updatePlaceholder = () => {
        const hasChips = targetBox.querySelector('[data-word]');
        if (hasChips) {
          targetBox.removeAttribute('data-show-placeholder');
        } else {
          targetBox.setAttribute('data-show-placeholder', '1');
        }
      };
      updatePlaceholder();

      // Crear las fichas
      it.shuffled.forEach((w) => {
        const chip = document.createElement('div');
        chip.textContent = w;
        chip.dataset.word = w;
        chip.style.cssText = `background:#4FC3F7;color:#1a1a1a;border:2px solid #1a1a1a;
          border-radius:6px;padding:6px 14px;font-weight:bold;cursor:grab;
          box-shadow:2px 2px 0 #1a1a1a; user-select:none; transition: transform 0.1s;
          position:relative; z-index:2;`;

        // Variables para detectar si fue arrastre o solo un clic rápido
        let pX = 0, pY = 0;

        // Aplicar sistema de Drag & Drop del core
        C.makeDraggable(chip, {
          onPickup: ({ clientX, clientY }) => {
            pX = clientX;
            pY = clientY;
          },
          onMove: ({ under }) => {
            sourceBox.style.borderColor = '#1a1a1a';
            targetBox.style.borderColor = '#1a1a1a';
            const hoverBox = under && under.closest ? under.closest('.ro-source, .ro-target') : null;
            if (hoverBox) hoverBox.style.borderColor = '#FFD700';
          },
          onDrop: ({ under, clientX, clientY }) => {
            sourceBox.style.borderColor = '#1a1a1a';
            targetBox.style.borderColor = '#1a1a1a';

            // DETECTOR DE CLIC: Si movió menos de 5px, lo tomamos como un clic/tap
            if (Math.abs(clientX - pX) < 5 && Math.abs(clientY - pY) < 5) {
              if (chip.parentElement === sourceBox) {
                targetBox.appendChild(chip);
              } else {
                sourceBox.appendChild(chip);
              }
              updatePlaceholder();
              return;
            }

            // Lógica normal de soltar al arrastrar
            const dropBox = under && under.closest ? under.closest('.ro-source, .ro-target') : null;
            if (dropBox) {
              const siblings = [...dropBox.querySelectorAll('[data-word]')].filter(c => c !== chip);
              let insertBeforeNode = null;
              for (const sibling of siblings) {
                const rect = sibling.getBoundingClientRect();
                if (clientX < rect.left + rect.width / 2) {
                  insertBeforeNode = sibling;
                  break;
                }
              }
              if (insertBeforeNode) {
                dropBox.insertBefore(chip, insertBeforeNode);
              } else {
                dropBox.appendChild(chip);
              }
            } else {
              if (chip.parentElement !== targetBox) {
                sourceBox.appendChild(chip);
              }
            }
            updatePlaceholder();

            const tBox = wrap.querySelector(`.ro-target[data-i="${i}"]`);
            const got = [...tBox.querySelectorAll('[data-word]')].map(c => c.textContent);
            if (got.length === it.original.length) {
              if (got.join(' ') === it.original.join(' ')) ctx.cheer();
              else ctx.comfort();
            }
          }
        });

        sourceBox.appendChild(chip);
      });
    });

    // Validar las respuestas
    const btn = document.createElement('button');
    btn.className = 'coeduca-btn coeduca-btn-success';
    btn.textContent = 'Revisar respuestas';
    btn.style.marginTop = '12px';
    btn.addEventListener('click', () => {
      let correct = 0;
      const details = [];
      items.forEach((it, i) => {
        const targetBox = wrap.querySelector(`.ro-target[data-i="${i}"]`);
        const got = [...targetBox.querySelectorAll('[data-word]')].map(c => c.textContent);

        const ok = got.length === it.original.length && got.join(' ') === it.original.join(' ');

        if (ok) correct++;
        targetBox.style.background = ok ? '#E8F5E9' : '#FFEBEE';
        targetBox.style.borderColor = ok ? '#4CAF50' : '#E63946';
        details.push(it.original.join(' ') + ': ' + (ok ? 'OK' : (got.join(' ') || 'vacio')));
      });
      ctx.recordAnswer(correct, items.length, details);
      if (correct === items.length) ctx.cheer(); else ctx.comfort();
    });
    wrap.appendChild(btn);

    ctx.container.appendChild(wrap);
  });

  // =====================================================================
  // 6. REORDER_LETTERS (formar palabra)
  // =====================================================================
  reg('reorder_letters', function (ctx) {
    // data: [{ word: 'SCHOOL', hint: 'Lugar de estudio' }]
    const items = (ctx.data || []).map((it, idx) => ({
      idx,
      word: it.word.toUpperCase(),
      hint: it.hint || '',
      shuffled: C.shuffle(it.word.toUpperCase().split('')).join('')
    }));

    const wrap = document.createElement('div');
    items.forEach((it, i) => {
      const row = document.createElement('div');
      row.style.cssText = 'margin:12px 0;padding:12px;background:#FFF8E7;border:3px solid #1a1a1a;border-radius:10px;';
      
      // Envolvemos las letras y el input en un div con flexbox
      row.innerHTML = `
        <div style="font-weight:bold;margin-bottom:10px;">${i + 1}. ${C.escapeHTML(it.hint || 'Forma la palabra')}</div>
        <div style="display:flex; flex-wrap:wrap; align-items:center; gap:12px;">
          <div style="font-family:monospace;font-size:22px;letter-spacing:6px;font-weight:900;
               background:#fff;border:2px solid #1a1a1a;border-radius:6px;padding:6px 12px;">
            ${it.shuffled}
          </div>
          <input type="text" class="coeduca-input rl-input" data-i="${i}" placeholder="Escribe la palabra"
                 autocomplete="off" autocapitalize="characters" style="flex:1; min-width:180px;">
        </div>
      `;
      wrap.appendChild(row);
    });
    wrap.querySelectorAll('.rl-input').forEach(inp => {
      inp.addEventListener('blur', () => {
        if (!inp.value.trim()) return;
        const it = items[+inp.dataset.i];
        if (C.normalize(inp.value) === C.normalize(it.word)) ctx.cheer();
        else ctx.comfort();
      });
    });
    wrap.appendChild(gradeButton(() => {
      let correct = 0;
      const details = [];
      items.forEach(it => {
        const inp = wrap.querySelector(`.rl-input[data-i="${it.idx}"]`);
        const ok = C.normalize(inp.value) === C.normalize(it.word);
        if (ok) correct++;
        inp.classList.toggle('correct', ok);
        inp.classList.toggle('wrong', !ok);
        details.push(it.word + ': ' + (ok ? 'OK' : inp.value || 'vacío'));
      });
      ctx.recordAnswer(correct, items.length, details);
      if (correct === items.length) ctx.cheer(); else ctx.comfort();
    }));
    ctx.container.appendChild(wrap);
  });

 // =====================================================================
  // 7. EMOJIPHRASE (escribir frase que describa emojis)
  // =====================================================================
  reg('emojiphrase', function (ctx) {
    // data: [{ emojis: '🔍📰', accept: ['look', 'newspaper'], example: 'I look for news' }]
    const items = ctx.data || [];
    const wrap = document.createElement('div');
    
    // Contenedor Grid: 1 columna si solo hay un ítem, si hay más usa columnas adaptables
    const grid = document.createElement('div');
    grid.style.cssText = `
      display: grid; 
      grid-template-columns: ${items.length === 1 ? '1fr' : 'repeat(auto-fit, minmax(260px, 1fr))'}; 
      gap: 24px; 
      margin-top: 10px;
    `;

    // Colores pastel alternados para las cards (Pop Art)
    const cardColors = ['#E1F5FE', '#FFF9C4', '#FCE4EC', '#E8F5E9'];

    items.forEach((it, i) => {
      const bgColor = cardColors[i % cardColors.length];
      const card = document.createElement('div');
      
      card.style.cssText = `
        position: relative;
        background: ${bgColor};
        border: 3px solid #1a1a1a;
        border-radius: 14px;
        padding: 24px 16px 16px;
        box-shadow: 4px 4px 0 #1a1a1a;
        text-align: center;
        display: flex;
        flex-direction: column;
        justify-content: center;
        transition: transform 0.15s;
      `;

      card.innerHTML = `
        <div style="position: absolute; top: -14px; left: -14px; background: #FF6B9D; color: #fff; border: 3px solid #1a1a1a; border-radius: 50%; width: 36px; height: 36px; display: grid; place-items: center; font-weight: 900; font-size: 16px; box-shadow: 2px 2px 0 #1a1a1a; z-index: 2;">
          ${i + 1}
        </div>
        <div style="font-size: 56px; line-height: 1.2; margin-bottom: 14px; filter: drop-shadow(2px 2px 0px rgba(0,0,0,0.15));">
          ${C.escapeHTML(it.emojis)}
        </div>
        <div style="font-weight: 900; font-size: 13px; margin-bottom: 8px; color: #1a1a1a; text-transform: uppercase; letter-spacing: 0.5px;">
          Escribe una oración
        </div>
        <input type="text" class="coeduca-input ep-input" data-i="${i}"
               style="width: 100%; text-align: center; font-size: 16px;" autocomplete="off" placeholder="Tu oración en inglés">
        <div class="ep-fb" data-i="${i}" style="margin-top: 8px; font-size: 14px; font-weight: 900; min-height: 20px;"></div>
      `;
      grid.appendChild(card);
    });

    wrap.appendChild(grid);

    // Envolver el botón en un div para centrarlo bien
    const btnWrap = document.createElement('div');
    btnWrap.style.cssText = 'text-align: center; margin-top: 24px;';
    
    btnWrap.appendChild(gradeButton(() => {
      let correct = 0;
      const details = [];
      items.forEach((it, i) => {
        const inp = wrap.querySelector(`.ep-input[data-i="${i}"]`);
        const fb = wrap.querySelector(`.ep-fb[data-i="${i}"]`);
        const text = C.normalize(inp.value);
        
        // Criterio de validación
        const accept = (it.accept || []).map(C.normalize);
        const hasAll = accept.length > 0 && accept.every(a => text.includes(a));
        const matchExample = it.example && C.normalize(it.example) === text;
        const strict = hasAll || matchExample;
        
        if (strict) correct++;
        
        inp.classList.toggle('correct', strict);
        inp.classList.toggle('wrong', !strict);
        
        fb.textContent = strict ? '¡EXCELENTE!' : (it.example ? 'Ejemplo: ' + it.example : 'Inténtalo de nuevo');
        fb.style.color = strict ? '#4CAF50' : '#E63946';
        
        details.push(it.emojis + ': ' + (inp.value || 'vacío') + ' (' + (strict ? 'OK' : 'X') + ')');
      });
      
      ctx.recordAnswer(correct, items.length, details);
      if (correct === items.length) ctx.cheer(); else ctx.comfort();
    }));

    wrap.appendChild(btnWrap);
    ctx.container.appendChild(wrap);
  });

  // =====================================================================
  // 8. MULTIPLECHOICE (selección múltiple, radio buttons estilizados)
  // =====================================================================
  reg('multiplechoice', function (ctx) {
    // data: [{ q: '___ a teacher', options: ['I am', 'I is'], answer: 0 }]
    const items = ctx.data || [];
    const wrap = document.createElement('div');
    
    items.forEach((it, i) => {
      const row = document.createElement('div');
      row.style.cssText = 'margin:14px 0;padding:16px;background:#FFF8E7;border:3px solid #1a1a1a;border-radius:12px;';
      
      // Creamos las opciones con una clase específica para poder manipularlas luego
      let optsHTML = it.options.map((opt, j) => `
        <label class="mc-lbl-${ctx.exerciseId}-${i}" style="display:flex; align-items:center; background:#fff; 
               border:2px solid #1a1a1a; border-radius:8px; padding:10px 14px; margin:8px 0; 
               font-weight:bold; cursor:pointer; box-shadow:2px 2px 0 #1a1a1a; 
               transition: background 0.15s, transform 0.1s, box-shadow 0.1s;">
          <input type="radio" name="mc-${ctx.exerciseId}-${i}" value="${j}" 
                 style="margin-right:12px; cursor:pointer; transform: scale(1.3);">
          <span style="flex:1;">${C.escapeHTML(opt)}</span>
        </label>
      `).join('');
      
      row.innerHTML = `<div style="font-weight:900; margin-bottom:12px; font-size:16px;">${i + 1}. ${C.escapeHTML(it.q)}</div>${optsHTML}`;
      wrap.appendChild(row);

      // --- MEJORA 1: Interactividad al seleccionar ---
      const inputs = row.querySelectorAll(`input[name="mc-${ctx.exerciseId}-${i}"]`);
      const labels = row.querySelectorAll(`.mc-lbl-${ctx.exerciseId}-${i}`);
      
      inputs.forEach(inp => {
        inp.addEventListener('change', () => {
          // Resetear todas las etiquetas de esta pregunta
          labels.forEach(l => {
            l.style.background = '#fff';
            l.style.transform = 'translate(0, 0)';
            l.style.boxShadow = '2px 2px 0 #1a1a1a';
          });
          // Iluminar la seleccionada (Estilo Pop Art: Amarillo)
          if (inp.checked) {
            const activeLabel = inp.closest('label');
            activeLabel.style.background = '#FFD700'; 
            activeLabel.style.transform = 'translate(-2px, -2px)';
            activeLabel.style.boxShadow = '4px 4px 0 #1a1a1a';
            
            if (+inp.value === it.answer) ctx.cheer(); 
            else ctx.comfort();
          }
        });
      });
    });

    wrap.appendChild(gradeButton(() => {
      let correct = 0;
      const details = [];
      
      items.forEach((it, i) => {
        const sel = wrap.querySelector(`input[name="mc-${ctx.exerciseId}-${i}"]:checked`);
        const ok = sel && +sel.value === it.answer;
        if (ok) correct++;
        
        // --- MEJORAS 2 y 3: Evaluar, colorear y bloquear ---
        wrap.querySelectorAll(`input[name="mc-${ctx.exerciseId}-${i}"]`).forEach(r => {
          r.disabled = true; // Evita cambios post-evaluación
          
          const lbl = r.closest('label');
          lbl.style.cursor = 'default';
          lbl.style.transform = 'translate(0, 0)'; // Quitar el efecto de "levantado"
          lbl.style.boxShadow = '2px 2px 0 #1a1a1a';
          
          if (+r.value === it.answer) {
            // Es la correcta (siempre la mostramos en verde, la haya elegido o no)
            lbl.style.background = '#A8E6CF'; 
            lbl.style.borderColor = '#4CAF50';
          } else if (r.checked) {
            // La eligió, pero es incorrecta (Rojo)
            lbl.style.background = '#FFCDD2';
            lbl.style.borderColor = '#E63946';
          } else {
            // Ni la eligió, ni era la correcta (Apagar visualmente)
            lbl.style.background = '#f5f5f5';
            lbl.style.opacity = '0.6';
          }
        });
        
        details.push(it.q + ': ' + (ok ? 'OK' : 'X (correcta: ' + it.options[it.answer] + ')'));
      });
      
      ctx.recordAnswer(correct, items.length, details);
      if (correct === items.length) ctx.cheer(); else ctx.comfort();
    }));
    
    ctx.container.appendChild(wrap);
  });

  // =====================================================================
  // 9. SPOTERROR (clic en la palabra incorrecta)
  // =====================================================================
  reg('spoterror', function (ctx) {
    // data: [{ words: ['She', 'are', 'happy'], errorIndex: 1, fix: 'is' }]
    const items = ctx.data || [];
    const selected = {}; // { itemIdx: wordIdx }
    let graded = false;

    const wrap = document.createElement('div');
    items.forEach((it, i) => {
      const row = document.createElement('div');
      row.style.cssText = 'margin:14px 0;padding:16px 20px;background:#FFF8E7;border:3px solid #1a1a1a;border-radius:12px;';
      
      const wordSpans = it.words.map((w, j) => `
        <span class="se-word se-word-${ctx.exerciseId}-${i}" data-i="${i}" data-j="${j}"
              style="display:inline-block; background:#fff; border:3px solid #1a1a1a;
                     border-radius:8px; padding:6px 12px; margin:4px 3px; font-weight:900; font-size:17px; cursor:pointer;
                     box-shadow:3px 3px 0 #1a1a1a; transition:transform 0.15s, box-shadow 0.15s, background 0.15s, color 0.15s;
                     position:relative;">
          ${C.escapeHTML(w)}
        </span>
      `).join('');
      
      // Envolvemos la oración en su propia cajita centrada para separarla del texto
      row.innerHTML = `
        <div style="font-weight:900; font-size:16px; margin-bottom:4px; color:var(--coeduca-text);">
          ${i + 1}. Toca la palabra incorrecta:
        </div>
        <div style="line-height:2.8; margin-top:16px; text-align:center; background:rgba(255,255,255,0.6); 
                    padding:12px 10px; border-radius:10px; border:2px dashed rgba(0,0,0,0.15);">
          ${wordSpans}
        </div>`;
      wrap.appendChild(row);
    });

    wrap.addEventListener('click', e => {
      if (graded) return;

      const w = e.target.closest('.se-word');
      if (!w) return;
      const i = +w.dataset.i;
      
      wrap.querySelectorAll(`.se-word-${ctx.exerciseId}-${i}`).forEach(s => {
        s.style.background = '#fff';
        s.style.transform = 'translate(0, 0)';
        s.style.boxShadow = '3px 3px 0 #1a1a1a';
      });
      
      w.style.background = '#FFD700';
      w.style.transform = 'translate(-2px, -2px)';
      w.style.boxShadow = '5px 5px 0 #1a1a1a';
      selected[i] = +w.dataset.j;
      
      const it = items[i];
      if (+w.dataset.j === it.errorIndex) ctx.cheer(); 
      else ctx.comfort();
    });

    wrap.appendChild(gradeButton(() => {
      if (graded) return;
      graded = true;
      
      let correct = 0;
      const details = [];
      
      items.forEach((it, i) => {
        const ok = selected[i] === it.errorIndex;
        if (ok) correct++;
        
        const allWords = wrap.querySelectorAll(`.se-word-${ctx.exerciseId}-${i}`);
        
        allWords.forEach(w => {
          w.style.cursor = 'default';
          w.style.transform = 'translate(0,0)';
          
          const j = +w.dataset.j;
          
          if (j === it.errorIndex) {
            // Palabra correcta a corregir (Verde)
            w.style.background = '#A8E6CF';
            w.style.borderColor = '#4CAF50';
            w.style.color = '#1a1a1a';
            w.style.boxShadow = '2px 2px 0 #1a1a1a';
            
            if (it.fix) {
              const fixBadge = document.createElement('div');
              // Diseño de burbuja de cómic con el piquito apuntando abajo
              fixBadge.innerHTML = `
                <div style="background:#1a1a1a; color:#fff; font-size:14px; padding:5px 12px; border-radius:8px; 
                            font-weight:900; letter-spacing:1px; box-shadow:3px 3px 0 var(--coeduca-accent);">
                  ${C.escapeHTML(it.fix)}
                </div>
                <div style="width:0; height:0; border-left:6px solid transparent; border-right:6px solid transparent; 
                            border-top:8px solid #1a1a1a; margin: 0 auto;"></div>
              `;
              fixBadge.style.cssText = `position:absolute; bottom:110%; left:50%; transform:translateX(-50%); 
                                        display:flex; flex-direction:column; align-items:center; z-index:10; 
                                        margin-bottom:4px; animation: coeducaPopIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);`;
              w.appendChild(fixBadge);
            }
          } else if (j === selected[i]) {
            // Error del estudiante (Rojo)
            w.style.background = '#FFCDD2';
            w.style.borderColor = '#E63946';
            w.style.boxShadow = '2px 2px 0 #1a1a1a';
          } else {
            // Palabras neutras (Gris sin sombra para no llamar la atención)
            w.style.background = '#f5f5f5';
            w.style.borderColor = '#ccc';
            w.style.color = '#999';
            w.style.boxShadow = 'none';
          }
        });

        details.push(it.words.join(' ') + ' -> error: ' + it.words[it.errorIndex] +
          ' (corrige: ' + (it.fix || '') + ')' + ' [' + (ok ? 'OK' : 'X') + ']');
      });
      
      ctx.recordAnswer(correct, items.length, details);
      if (correct === items.length) ctx.cheer(); else ctx.comfort();
    }));
    
    ctx.container.appendChild(wrap);
  });

  // =====================================================================
  // 10. CATEGORIZE (clasificar arrastrando a columnas)
  // =====================================================================
  reg('categorize', function (ctx) {
    // data: { categories: ['Verbs', 'Nouns'], items: [{text:'run', cat:0}, ...] }
    const cats = ctx.data.categories || [];
    const items = C.shuffle((ctx.data.items || []).slice());

    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <div id="cat-bank-${ctx.exerciseId}" style="display:flex;flex-wrap:wrap;gap:6px;
           padding:10px;background:#FFF8E7;border:3px dashed #1a1a1a;border-radius:10px;
           margin-bottom:14px;min-height:50px;"></div>
      <div style="display:grid;grid-template-columns:repeat(${cats.length},1fr);gap:10px;">
        ${cats.map((c, i) => `
          <div class="cat-col" data-cat="${i}" style="background:#fff;border:3px solid #1a1a1a;
               border-radius:10px;padding:10px;min-height:120px;">
            <h4 style="margin:0 0 8px;text-align:center;background:#FFD700;border:2px solid #1a1a1a;
                border-radius:6px;padding:4px;text-transform:uppercase;font-size:13px;">
              ${C.escapeHTML(c)}
            </h4>
            <div class="cat-drop" data-cat="${i}" style="min-height:80px;"></div>
          </div>
        `).join('')}
      </div>
    `;
    ctx.container.appendChild(wrap);

    const bank = wrap.querySelector('#cat-bank-' + ctx.exerciseId);
    items.forEach((it, idx) => {
      const chip = document.createElement('div');
      chip.textContent = it.text;
      chip.dataset.cat = it.cat;
      chip.dataset.idx = idx;
      chip.style.cssText = `background:#FF6B9D;color:#fff;border:2px solid #1a1a1a;
        border-radius:6px;padding:5px 10px;font-weight:bold;cursor:grab;
        box-shadow:1px 1px 0 #1a1a1a;text-shadow:1px 1px 0 #1a1a1a;`;
      bank.appendChild(chip);
      C.makeDraggable(chip, {
        onDrop: ({ under }) => {
          const drop = under && under.closest && under.closest('.cat-drop');
          if (drop) {
            drop.appendChild(chip);
            if (+drop.dataset.cat === it.cat) ctx.cheer(); 
            else ctx.comfort();
          } else {
            bank.appendChild(chip);
          }
          check();
        }
      });
    });

    function check() {
      let correct = 0;
      const details = [];
      items.forEach((it, idx) => {
        const chip = wrap.querySelector(`[data-idx="${idx}"]`);
        const parent = chip.closest('.cat-drop');
        if (parent && +parent.dataset.cat === it.cat) {
          correct++;
          chip.style.background = '#4CAF50';
          details.push(it.text + ' -> ' + cats[it.cat] + ': OK');
        } else {
          chip.style.background = '#FF6B9D';
          details.push(it.text + ' -> ' + cats[it.cat] + ': ' +
            (parent ? 'puesto en ' + cats[+parent.dataset.cat] : 'sin colocar'));
        }
      });
      ctx.recordAnswer(correct, items.length, details);
    }
  });

  // =====================================================================
  // 11. DROPDOWN (select dentro de oración)
  // =====================================================================
  reg('dropdown', function (ctx) {
    // data: [{ before: 'I', options: ['am','is','are'], answer: 0, after: 'happy' }]
    const items = ctx.data || [];
    const wrap = document.createElement('div');
    items.forEach((it, i) => {
      const row = document.createElement('div');
      row.style.cssText = 'margin:10px 0;padding:12px;background:#FFF8E7;border:3px solid #1a1a1a;border-radius:10px;font-size:16px;';
      const opts = it.options.map((o, j) =>
        `<option value="${j}">${C.escapeHTML(o)}</option>`).join('');
      row.innerHTML = `${i + 1}. ${C.escapeHTML(it.before || '')}
        <select class="coeduca-input dd-sel" data-i="${i}" style="font-size:15px;padding:4px 8px;">
          <option value="">-- elegir --</option>${opts}
        </select>
        ${C.escapeHTML(it.after || '')}`;
      wrap.appendChild(row);
    });
    wrap.querySelectorAll('.dd-sel').forEach(sel => {
      sel.addEventListener('change', () => {
        if (sel.value === '') return;
        const i = +sel.dataset.i;
        const it = items[i];
        if (+sel.value === it.answer) ctx.cheer(); 
        else ctx.comfort();
      });
    });
    wrap.appendChild(gradeButton(() => {
      let correct = 0;
      const details = [];
      items.forEach((it, i) => {
        const sel = wrap.querySelector(`.dd-sel[data-i="${i}"]`);
        const ok = sel.value !== '' && +sel.value === it.answer;
        if (ok) correct++;
        sel.classList.toggle('correct', ok);
        sel.classList.toggle('wrong', sel.value !== '' && !ok);
        details.push((it.before || '') + ' [' + it.options[it.answer] + '] ' +
          (it.after || '') + ': ' + (ok ? 'OK' : 'X'));
      });
      ctx.recordAnswer(correct, items.length, details);
      if (correct === items.length) ctx.cheer(); else ctx.comfort();
    }));
    ctx.container.appendChild(wrap);
  });

  // =====================================================================
  // 12. MATCHIMAGE (arrastrar texto a imagen/emoji)
  // =====================================================================
  reg('matchimage', function (ctx) {
    // data: [{ word: 'Cat', emoji: '🐈', image: 'files/cat.png' }]
    const pairs = (ctx.data || []).map((p, i) => ({ ...p, idx: i }));
    const shuffled = C.shuffle(pairs.slice());

    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <div id="mi-bank-${ctx.exerciseId}" style="display:flex;flex-wrap:wrap;gap:8px;
           padding:10px;background:#FFF8E7;border:3px dashed #1a1a1a;border-radius:10px;
           margin-bottom:14px;"></div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:10px;">
        ${pairs.map(p => `
          <div class="mi-target" data-idx="${p.idx}"
               style="background:#fff;border:3px solid #1a1a1a;border-radius:10px;
                      padding:8px;text-align:center;min-height:100px;display:flex;
                      flex-direction:column;align-items:center;justify-content:center;
                      box-shadow:2px 2px 0 #1a1a1a;">
            ${p.image
              ? `<img src="${C.escapeHTML(p.image)}" style="max-width:80px;max-height:80px;border:2px solid #1a1a1a;border-radius:6px;">`
              : `<div style="font-size:46px;">${C.escapeHTML(p.emoji || '?')}</div>`}
            <div class="mi-slot" style="margin-top:6px;min-height:28px;width:100%;
                 border:2px dashed #1a1a1a;border-radius:6px;padding:2px;"></div>
          </div>
        `).join('')}
      </div>
    `;
    ctx.container.appendChild(wrap);

    const bank = wrap.querySelector('#mi-bank-' + ctx.exerciseId);
    shuffled.forEach(p => {
      const chip = document.createElement('div');
      chip.textContent = p.word;
      chip.dataset.idx = p.idx;
      chip.style.cssText = `background:#4FC3F7;border:2px solid #1a1a1a;border-radius:6px;
        padding:5px 10px;font-weight:bold;cursor:grab;box-shadow:1px 1px 0 #1a1a1a;`;
      bank.appendChild(chip);
      C.makeDraggable(chip, {
        // --- AGREGA ESTO ---
        onMove: ({ under }) => {
          document.querySelectorAll('.mi-slot').forEach(s => s.classList.remove('coeduca-drop-hover'));
          const slot = under && under.closest && under.closest('.mi-slot');
          if (slot) slot.classList.add('coeduca-drop-hover');
        },
        // -------------------
        onDrop: ({ under }) => {
          document.querySelectorAll('.mi-slot').forEach(s => s.classList.remove('coeduca-drop-hover'));
          
          const slot = under && under.closest && under.closest('.mi-slot');
          if (slot) {
            const existing = slot.querySelector('[data-idx]');
            if (existing) bank.appendChild(existing);
            slot.appendChild(chip);
            
            // --- NUEVO: Reacción de Rigo ---
            const target = slot.closest('.mi-target');
            if (target && +chip.dataset.idx === +target.dataset.idx) {
              ctx.cheer();
            } else {
              ctx.comfort();
            }
            // -------------------------------
          } else {
            bank.appendChild(chip);
          }
          check();
        }
      });
    });

    function check() {
      let correct = 0;
      const details = [];
      pairs.forEach(p => {
        const target = wrap.querySelector(`.mi-target[data-idx="${p.idx}"]`);
        const slot = target.querySelector('.mi-slot');
        const chip = slot.querySelector('[data-idx]');
        const ok = chip && +chip.dataset.idx === p.idx;
        if (ok) {
          correct++;
          target.style.background = '#E8F5E9';
        } else {
          target.style.background = chip ? '#FFEBEE' : '#fff';
        }
        details.push(p.word + ': ' + (ok ? 'OK' : 'X'));
      });
      ctx.recordAnswer(correct, pairs.length, details);
    }
  });

  // =====================================================================
  // 13. FILLBLANK (escribir respuesta con teclado)
  // =====================================================================
  reg('fillblank', function (ctx) {
    // data: [{ text: 'I ___ to school', answer: 'go' }] o multiple ___ con answers array
    const items = ctx.data || [];
    const wrap = document.createElement('div');
    items.forEach((it, i) => {
      const answers = Array.isArray(it.answer) ? it.answer : [it.answer];
      const parts = it.text.split('___');
      let html = (i + 1) + '. ';
      parts.forEach((p, j) => {
        html += C.escapeHTML(p);
        if (j < parts.length - 1) {
          const ans = answers[j] || '';
          html += `<input type="text" class="coeduca-input fb-input" data-i="${i}" data-j="${j}"
                          data-answer="${C.escapeHTML(ans)}"
                          style="width:${Math.max(70, ans.length * 14)}px;margin:0 4px;"
                          autocomplete="off">`;
        }
      });
      const row = document.createElement('div');
      row.style.cssText = 'margin:12px 0;font-size:16px;font-weight:bold;line-height:2;';
      row.innerHTML = html;
      wrap.appendChild(row);
    });
	wrap.querySelectorAll('.fb-input').forEach(inp => {
      inp.addEventListener('blur', () => {
        if (!inp.value.trim()) return; // Ignorar si lo deja vacío
        const ans = inp.dataset.answer;
        if (C.normalize(inp.value) === C.normalize(ans)) ctx.cheer();
        else ctx.comfort();
      });
    });
    wrap.appendChild(gradeButton(() => {
      let correct = 0, total = 0;
      const details = [];
      items.forEach((it, i) => {
        const answers = Array.isArray(it.answer) ? it.answer : [it.answer];
        answers.forEach((ans, j) => {
          total++;
          const inp = wrap.querySelector(`.fb-input[data-i="${i}"][data-j="${j}"]`);
          const ok = C.normalize(inp.value) === C.normalize(ans);
          if (ok) correct++;
          inp.classList.toggle('correct', ok);
          inp.classList.toggle('wrong', !ok);
          details.push(ans + ': ' + (ok ? 'OK' : (inp.value || 'vacío')));
        });
      });
      ctx.recordAnswer(correct, total, details);
      if (correct === total) ctx.cheer(); else ctx.comfort();
    }));
    ctx.container.appendChild(wrap);
  });

  // =====================================================================
  // 14. TRUEFALSE (verdadero / falso)
  // =====================================================================
  reg('truefalse', function (ctx) {
    // data: [{ statement: '...', answer: true }]
    const items = ctx.data || [];
    const selections = {};
    const wrap = document.createElement('div');
    items.forEach((it, i) => {
      const row = document.createElement('div');
      row.style.cssText = 'margin:10px 0;padding:12px;background:#FFF8E7;border:3px solid #1a1a1a;border-radius:10px;';
      row.innerHTML = `
        <div style="font-weight:bold;margin-bottom:8px;">${i + 1}. ${C.escapeHTML(it.statement)}</div>
        <div style="display:flex;gap:10px;">
          <button class="coeduca-btn tf-btn" data-i="${i}" data-v="true"
                  style="background:#4CAF50;color:#fff;flex:1;">TRUE</button>
          <button class="coeduca-btn tf-btn" data-i="${i}" data-v="false"
                  style="background:#E63946;color:#fff;flex:1;">FALSE</button>
        </div>
      `;
      wrap.appendChild(row);
    });
    wrap.addEventListener('click', e => {
      const b = e.target.closest('.tf-btn');
      if (!b) return;
      const i = +b.dataset.i;
      selections[i] = b.dataset.v === 'true';
      wrap.querySelectorAll(`.tf-btn[data-i="${i}"]`).forEach(btn => {
        btn.style.outline = btn === b ? '4px solid #FFD700' : 'none';
      });
      
      const it = items[i];
      if (selections[i] === it.answer) ctx.cheer(); 
      else ctx.comfort();
    });
    wrap.appendChild(gradeButton(() => {
      let correct = 0;
      const details = [];
      items.forEach((it, i) => {
        const ok = selections[i] === it.answer;
        if (ok) correct++;
        details.push(it.statement.substring(0, 40) + ': ' +
          (ok ? 'OK' : 'X (correcta: ' + (it.answer ? 'TRUE' : 'FALSE') + ')'));
      });
      ctx.recordAnswer(correct, items.length, details);
      if (correct === items.length) ctx.cheer(); else ctx.comfort();
    }));
    ctx.container.appendChild(wrap);
  });

})(typeof window !== 'undefined' ? window : this);