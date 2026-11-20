(function () {
  const { LADDER, Game, bestHand, describe, holeLabel, fmt, RANK_CH, SUIT_CH } = Poker;
  const $ = s => document.querySelector(s);
  const esc = s => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const AVATARS = ['🤠', '😎', '🦊', '🐻', '🦉', '🐯', '🐼', '🦈', '🎩'];
  const BOTS = ['Ace', 'Blaze', 'Cleo', 'Dex', 'Echo', 'Faye', 'Gus', 'Hana'];
  const COLORS = { green: ['#2fa66a', '#116a3f'], blue: ['#2f7fd0', '#12467e'], red: ['#c4404c', '#74121c'], purple: ['#8a5cc4', '#3f1f73'], black: ['#4b5058', '#17191d'], teal: ['#22a6a6', '#0b5757'] };
  const BACKS = { red: ['#b3202c', '#7c1019'], blue: ['#2457b8', '#12295f'], black: ['#3a3d45', '#0f1013'], green: ['#1f8a55', '#0c4b2b'] };
  const STYLES = { classic: 'Classic Wood', modern: 'Modern', neon: 'Neon', vintage: 'Vintage Leather' };
  const SPEED = { fast: 0.35, normal: 1, slow: 1.8 };

  let theme = { color: 'green', style: 'classic', bg: 'casino', back: 'red', speed: 'normal', autodeal: false, showAll: false };
  try { Object.assign(theme, JSON.parse(localStorage.getItem('holdem_theme') || '{}')); } catch (e) { }
  const saveTheme = () => { try { localStorage.setItem('holdem_theme', JSON.stringify(theme)); } catch (e) { } };

  let seatsCfg = [{ name: 'You', type: 'human' }, ...[1, 2, 3, 4, 5].map(i => ({ name: BOTS[i - 1], type: 'bot' })), { name: '', type: 'empty' }, { name: '', type: 'empty' }, { name: '', type: 'empty' }];
  let blinds = [50, 100], blindMode = 'round', levelStart = Date.now();
  let G = null, timer = null, unlocked = null, turnKey = '', raiseVal = 0;

  /* ---------- theme ---------- */
  function applyTheme() {
    const app = $('#app');
    const [f1, f2] = COLORS[theme.color]; app.style.setProperty('--f1', f1); app.style.setProperty('--f2', f2);
    const [b1, b2] = BACKS[theme.back]; app.style.setProperty('--b1', b1); app.style.setProperty('--b2', b2);
    app.dataset.style = theme.style;
    $('#bg').innerHTML = BG.svg(theme.bg, 'main_');
    renderSettings();
  }
  function renderSettings() {
    const seg = (key, map) => Object.entries(map).map(([k, v]) => `<button data-k="${key}" data-v="${k}" class="${theme[key] === k ? 'on' : ''}">${v}</button>`).join('');
    $('#settings').innerHTML = `
    <h4>Table color</h4><div class="sw">${Object.entries(COLORS).map(([k, [a, b]]) => `<button title="${k}" data-k="color" data-v="${k}" class="${theme.color === k ? 'on' : ''}" style="background:radial-gradient(circle at 35% 30%,${a},${b})"></button>`).join('')}</div>
    <h4>Table style</h4><div class="seg">${seg('style', STYLES)}</div>
    <h4>Background</h4><div class="bgs">${BG.names.map(n => `<button data-k="bg" data-v="${n}" class="${theme.bg === n ? 'on' : ''}">${BG.svg(n, 't' + n + '_')}<span>${BG.labels[n]}</span></button>`).join('')}</div>
    <h4>Card back</h4><div class="sw">${Object.entries(BACKS).map(([k, [a, b]]) => `<button title="${k}" data-k="back" data-v="${k}" class="${theme.back === k ? 'on' : ''}" style="background:linear-gradient(135deg,${a},${b})"></button>`).join('')}</div>
    <h4>Bot speed</h4><div class="seg">${seg('speed', { fast: 'Fast', normal: 'Normal', slow: 'Slow' })}</div>
    <label class="chk"><input type="checkbox" id="autodeal" ${theme.autodeal ? 'checked' : ''}> Auto-deal next hand</label>
    <label class="chk"><input type="checkbox" id="showall" ${theme.showAll ? 'checked' : ''}> Reveal all hole cards (peek mode)</label>`;
  }

  /* ---------- cards & chips ---------- */
  const PIPS = (() => {
    const L = 0, C = 50, R = 100, o = (x, y, f) => [x, y, f ? 1 : 0];
    const six = [o(L, 0), o(R, 0), o(L, 50), o(R, 50), o(L, 100, 1), o(R, 100, 1)];
    return {
      2: [o(C, 0), o(C, 100, 1)], 3: [o(C, 0), o(C, 50), o(C, 100, 1)],
      4: [o(L, 0), o(R, 0), o(L, 100, 1), o(R, 100, 1)], 5: [o(L, 0), o(R, 0), o(C, 50), o(L, 100, 1), o(R, 100, 1)],
      6: six, 7: [...six, o(C, 25)], 8: [...six, o(C, 25), o(C, 75, 1)],
      9: [o(L, 0), o(R, 0), o(L, 33), o(R, 33), o(L, 67, 1), o(R, 67, 1), o(L, 100, 1), o(R, 100, 1), o(C, 50)],
      10: [o(L, 0), o(R, 0), o(L, 33), o(R, 33), o(L, 67, 1), o(R, 67, 1), o(L, 100, 1), o(R, 100, 1), o(C, 17), o(C, 83, 1)]
    };
  })();
  const ORN = {
    K: '<svg viewBox="0 0 24 16"><path d="M2 14 L3.5 4 L8 9 L12 2 L16 9 L20.5 4 L22 14Z"/><rect x="2" y="14.5" width="20" height="1.8" rx=".6"/></svg>',
    Q: '<svg viewBox="0 0 24 16"><path d="M2 14 L4 6 L8 10 L12 4 L16 10 L20 6 L22 14Z"/><circle cx="4" cy="4.5" r="1.6"/><circle cx="12" cy="2.2" r="1.6"/><circle cx="20" cy="4.5" r="1.6"/><rect x="2" y="14.5" width="20" height="1.8" rx=".6"/></svg>',
    J: '<svg viewBox="0 0 24 16"><path d="M12 1 L21 4 V9 C21 13 16 15 12 16 C8 15 3 13 3 9 V4Z"/></svg>'
  };
  function cardHTML(c, o = {}) {
    const cls = [o.dim ? 'dim' : '', o.hit ? 'hit' : ''].join(' '), dk = o.dk ? ` data-dk="${o.dk}"` : '';
    if (o.back || !c) return `<div class="card back ${cls}"${dk}></div>`;
    const rk = RANK_CH[c.r], su = SUIT_CH[c.s], red = c.s === 'h' || c.s === 'd';
    let art;
    let fa = '';
    if (c.r >= 11 && c.r <= 13) { fa = ' fa'; art = `<div class="face"><span class="orn">${ORN[rk]}</span><span class="fl">${rk}</span><span class="fs">${su}</span></div>`; }
    else if (c.r === 14) art = `<span class="pip ace" style="left:50%;top:50%">${su}</span>`;
    else art = PIPS[c.r].map(([x, y, f]) => `<span class="pip${f ? ' f' : ''}${c.r >= 8 ? ' sm' : ''}" style="left:${x}%;top:${y}%">${su}</span>`).join('');
    const cn = `<b class="${c.r === 10 ? 'ten' : ''}">${rk}</b><i>${su}</i>`;
    return `<div class="card ${red ? 'red' : ''} ${cls}"${dk}><div class="corner tl">${cn}</div><div class="corner br">${cn}</div><div class="art${fa}">${art}</div></div>`;
  }
  const DENOMS = [[1000, '#e0b43a'], [500, '#7a3fb5'], [100, '#1c1c1c'], [25, '#1f9a52'], [5, '#c62f3a'], [1, '#e8e8e8']];
  function chipsHTML(amt) {
    let left = amt, out = '', n = 0;
    for (const [d, col] of DENOMS) { while (left >= d && n < 5) { out += `<span class="chip" style="--c:${col};top:${-n * 0.28}em"></span>`; left -= d; n++; } if (n >= 5) break; }
    if (!n) out = `<span class="chip" style="--c:#e8e8e8"></span>`;
    return `<span class="chips">${out}</span>`;
  }

  /* ---------- rendering ---------- */
  function visibleTo(p) {
    if (!G) return false;
    if (theme.showAll || p.reveal) return true;
    if (p.type !== 'human') return false;
    const humans = G.players.filter(q => q.type === 'human' && !q.out);
    return humans.length <= 1 || unlocked === p.id;
  }
  const cache = new Map(), animated = new Set();
  // Deal animation is applied once per card, directly on the element, so re-rendering can never replay it.
  function popNew() {
    document.querySelectorAll('#layer [data-dk]').forEach(el => {
      const k = el.dataset.dk; if (animated.has(k)) return; animated.add(k);
      el.classList.add('deal'); el.addEventListener('animationend', () => el.classList.remove('deal'), { once: true });
    });
  }
  function sync(items) {
    const layer = $('#layer'), keep = new Set();
    for (const [k, html] of items) {
      keep.add(k); const old = cache.get(k);
      if (old && old.html === html) continue;
      const t = document.createElement('template'); t.innerHTML = html.trim(); const el = t.content.firstElementChild;
      if (old) old.el.replaceWith(el); else layer.appendChild(el);
      cache.set(k, { html, el });
    }
    for (const [k, v] of cache) if (!keep.has(k)) { v.el.remove(); cache.delete(k); }
  }
  function render() {
    if (!G) return;
    const n = G.players.length, TX = 41, TY = 36;
    const winSet = G.phase === 'showdown' ? G.winIds : null;
    const potTotal = G.pot();
    const items = [];
    G.players.forEach((p, i) => {
      const th = Math.PI / 2 + i * 2 * Math.PI / n, x = 50 + TX * Math.cos(th), y = 50 + TY * Math.sin(th);
      const bx = 50 + (x - 50) * 0.57, by = 50 + (y - 50) * 0.57;
      const turn = G.current === i && !G.runout && G.phase !== 'showdown';
      const win = G.phase === 'showdown' && G.lastWinners.includes(i);
      const vis = visibleTo(p);
      let hole = '';
      if (p.hole.length && !p.out) hole = p.hole.map((c, ci) => cardHTML(c, { dk: `${G.hand}:h${i}:${ci}`, back: !vis, dim: winSet && vis && !p.folded && !winSet.has(c.id), hit: winSet && vis && winSet.has(c.id) && win })).join('');
      let tag = '';
      if (win) tag = `+${fmt(p.won)}${p.handName ? ' · ' + p.handName : ''}`;
      else if (p.out) tag = 'Out';
      else if (p.folded && G.phase !== 'idle') tag = 'Folded';
      else if (p.allIn) tag = 'ALL-IN';
      else if (p.last && p.last !== 'SB' && p.last !== 'BB') tag = p.last;
      const sbbb = (p.last === 'SB' || p.last === 'BB') && p.bet ? ` <span style="opacity:.7">${p.last}</span>` : '';
      items.push(['s' + i, `<div data-k="s${i}" class="seat ${turn ? 'turn' : ''} ${p.folded && !p.out ? 'folded' : ''} ${p.out ? 'out' : ''} ${win ? 'win' : ''} ${vis && p.type === 'human' ? 'me' : ''}" style="left:${x}%;top:${y}%">
        <div class="hole">${hole}</div>
        <div class="plate"><div class="av" style="background:radial-gradient(circle at 35% 30%,hsl(${i * 47 + 10},50%,48%),hsl(${i * 47 + 10},50%,24%))"><b>${esc((p.name[0] || '?').toUpperCase())}</b></div><div class="info"><b>${esc(p.name)}${p.type === 'human' ? ' 👤' : ''}</b><span>${fmt(p.chips)}</span></div></div>
        ${tag ? `<div class="tag">${esc(tag)}</div>` : ''}</div>`]);
      if (p.bet > 0) items.push(['b' + i, `<div data-k="b${i}" class="bet" style="left:${bx}%;top:${by}%">${chipsHTML(p.bet)}<span>${fmt(p.bet)}${sbbb}</span></div>`]);
      if (i === G.dealer && !p.out) items.push(['d', `<div data-k="d" class="dbtn" style="left:${x + (50 - x) * 0.3 + 4}%;top:${y + (50 - y) * 0.3}%">D</div>`]);
    });
    const stage = $('#stage');
    if (!stage.querySelector('#layer')) {
      stage.innerHTML = `<div class="table" id="tableStyle"><div class="rail"></div><div class="felt"><div class="mark">Texas Hold'em</div></div></div><div id="layer"><div class="center"><div class="pot" id="pot"></div><div class="board" id="board"></div></div></div>`;
      cache.clear();
    }
    sync(items);
    // The pot and each community-card slot update independently, so a pot change never rebuilds the board.
    const potEl = $('#pot'), potHTML = `<span class="lbl">POT</span>${chipsHTML(potTotal)}<span>${fmt(potTotal)}</span>`;
    if (potEl._h !== potHTML) { potEl._h = potHTML; potEl.innerHTML = potHTML; }
    const boardEl = $('#board');
    for (let i = 0; i < 5; i++) {
      const c = G.board[i];
      const html = c ? cardHTML(c, { dk: `${G.hand}:b${i}`, dim: winSet && !winSet.has(c.id) && G.lastWinners.length && G.players.some(p => p.bestHand && G.lastWinners.includes(p.id)), hit: winSet && winSet.has(c.id) }) : '<div class="slot"></div>';
      let slot = boardEl.children[i];
      if (!slot) { slot = document.createElement('div'); boardEl.appendChild(slot); }
      if (slot._h !== html) { slot._h = html; slot.innerHTML = html; }
    }
    popNew();
    updateMeta();
    renderActions();
  }

  const levelMs = () => (blindMode === '5' ? 300000 : 600000);
  function updateMeta() {
    if (!G) return;
    let nx = '';
    if (G.phase !== 'over' && G.blindMode !== 'off') {
      if (G.level >= LADDER.length - 1) nx = ' · max blinds';
      else if (G.pendingLevelUp) nx = ' · ▲ blinds up next hand';
      else if (G.blindMode === 'round') { const rem = G.players.filter(p => !p.out).length - G.levelHands; nx = rem <= 0 ? ' · ▲ blinds up next hand' : ` · ▲ in ${rem} hand${rem > 1 ? 's' : ''}`; }
      else { const ms = Math.max(0, levelMs() - (Date.now() - levelStart)); nx = ` · ▲ ${Math.floor(ms / 60000)}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')}`; }
    }
    $('#meta').textContent = `Hand #${G.hand} · Lv ${G.level - G.startLevel + 1} · Blinds ${fmt(G.sb)}/${fmt(G.bb)} · ${G.phase === 'idle' ? 'Ready' : G.phase[0].toUpperCase() + G.phase.slice(1)}${nx}`;
  }
  setInterval(() => {
    if (!G || G.phase === 'over') return;
    if ((G.blindMode === '5' || G.blindMode === '10') && !G.pendingLevelUp && G.level < LADDER.length - 1 && Date.now() - levelStart >= levelMs()) { G.pendingLevelUp = true; G.log('level', '⏱ Blind timer is up — blinds will go up at the start of the next hand.'); }
    updateMeta();
  }, 1000);
  function myHandText(p) {
    if (!p.hole.length) return '';
    if (G.board.length < 3) return holeLabel(p.hole);
    return describe(bestHand(p.hole.concat(G.board)));
  }
  function renderActions() {
    const A = $('#actions');
    if (G.phase === 'over') { A.innerHTML = `<div class="status"><b>Game over.</b> ${G.winner ? esc(G.winner.name) + ' took every chip.' : 'All human players are out.'}</div><div class="row"><button class="abtn next" id="aReset">↺ Play again</button><button class="abtn call" id="aSetup">Change players</button></div>`; return; }
    if (G.phase === 'showdown') {
      const w = G.lastWinners.map(i => G.players[i].name).join(' & ');
      A.innerHTML = `<div class="status"><b>${esc(w)}</b> ${G.lastWinners.length > 1 ? 'win' : 'wins'} the hand.</div><div class="row"><button class="abtn next" id="aNext">Deal next hand ▸ <small>(Space)</small></button></div>`; return;
    }
    if (G.runout) { A.innerHTML = `<div class="status">All-in showdown — dealing the board…</div>`; return; }
    const L = G.legal(); if (!L) { A.innerHTML = ''; return; }
    const p = L.p;
    const bot = p.type === 'bot', d = bot ? ' disabled' : '';
    const humans = G.players.filter(q => q.type === 'human' && !q.out);
    if (!bot && humans.length > 1 && unlocked !== p.id) {
      A.innerHTML = `<div class="status">🔒 <b>${esc(p.name)}</b>, it's your turn. Pass the device, then reveal your cards in private.</div><div class="row"><button class="abtn raise" id="aReveal">I'm ${esc(p.name)} — show my cards</button></div>`; return;
    }
    const key = `${G.hand}-${G.phase}-${G.current}-${G.currentBet}`;
    if (bot) raiseVal = L.minRaiseTo; else if (key !== turnKey) { turnKey = key; raiseVal = L.minRaiseTo; }
    const step = 25;
    const callLbl = L.canCheck ? 'Check' : (L.callAmt >= p.chips ? `Call all-in ${fmt(L.callAmt)}` : `Call ${fmt(L.callAmt)}`);
    const verb = G.currentBet === 0 ? 'Bet' : 'Raise to';
    let quick = '', rrow = '';
    if (L.canRaise) {
      const allOnly = L.minRaiseTo >= L.maxRaiseTo;
      quick = allOnly ? '' : `<div class="quick${bot ? ' off' : ''}"><button data-f="min">Min</button><button data-f="0.5">½ pot</button><button data-f="0.75">¾ pot</button><button data-f="1">Pot</button><button data-f="max">All-in</button></div>`;
      rrow = `<div class="raisebox">${allOnly ? '' : `<input type="range" id="rs" min="${L.minRaiseTo}" max="${L.maxRaiseTo}" step="${step}" value="${raiseVal}"${d}><input type="number" id="rn" min="${L.minRaiseTo}" max="${L.maxRaiseTo}" step="${step}" value="${raiseVal}"${d}>`}<button class="abtn raise" id="aRaise"${d}>${allOnly ? 'All-in ' + fmt(L.maxRaiseTo) : verb + ' ' + fmt(raiseVal)}</button></div>`;
    }
    A.innerHTML = `<div class="status">${bot ? `<span>⏳ <b>${esc(p.name)}</b> is thinking…</span>` : `<span>▶ <b>${esc(p.name)}</b>'s turn</span>`}<span>Pot <b>${fmt(L.pot)}</b></span><span>To call <b>${fmt(L.callAmt)}</b></span>${bot ? '' : `<span>Your hand: <b>${esc(myHandText(p))}</b></span>`}</div>
      <div class="ctl"><div class="row"><button class="abtn fold" id="aFold"${d}>Fold</button><button class="abtn call" id="aCall"${d}>${callLbl}</button>${quick}</div>${rrow}</div>`;
  }

  /* ---------- log ---------- */
  function appendLog(e) {
    const d = document.createElement('div'); d.className = e.kind;
    d.innerHTML = esc(e.text).replace(/(10|[2-9JQKA])([♠♥♦♣])/g, (m, r, s) => `<span class="${s === '♥' || s === '♦' ? 'r' : 'k'}">${m}</span>`);
    const L = $('#log'), atEnd = L.scrollTop + L.clientHeight >= L.scrollHeight - 40;
    L.appendChild(d); if (atEnd || e.kind === 'hand') L.scrollTop = L.scrollHeight;
  }

  /* ---------- flow ---------- */
  const delay = ms => ms * SPEED[theme.speed];
  function tick() {
    render(); clearTimeout(timer); if (!G) return;
    const g = G;
    if (g.phase === 'over') { showOver(); return; }
    if (g.phase === 'showdown') { if (theme.autodeal || !g.hadHumans) timer = setTimeout(() => { if (G !== g) return; unlocked = null; g.startHand(); tick(); }, delay(3800)); return; }
    if (g.runout) { timer = setTimeout(() => { if (G !== g) return; g.runoutStep(); tick(); }, delay(1100)); return; }
    const p = g.players[g.current];
    if (p && p.type === 'bot') timer = setTimeout(() => { if (G !== g || g.current !== p.id) return; const a = g.botAction(); g.act(a.type, a.to); unlocked = null; tick(); }, delay(650 + Math.random() * 800));
  }
  function humanAct(type, to) { if (!G) return; const p = G.players[G.current]; if (!p || p.type !== 'human') return; G.act(type, to); unlocked = null; tick(); }
  function startGame() {
    clearTimeout(timer); unlocked = null; turnKey = ''; $('#stage').innerHTML = ''; animated.clear();
    const players = seatsCfg.filter(s => s.type !== 'empty').map((s, i) => ({ name: s.name.trim() || (s.type === 'human' ? 'Player' : 'Bot'), type: s.type, avatar: s.avatar }));
    G = new Game({ players, chips: 10000, sb: blinds[0], bb: blinds[1], blindMode }); levelStart = Date.now(); G.onLevel = () => { levelStart = Date.now(); };
    G.onLog = appendLog; $('#log').innerHTML = '';
    G.log('sys', `New game: ${players.length} players, everyone starts with ${fmt(10000)}.`);
    G.startHand(); tick();
  }
  function resetGame() { if (!seatsCfg.some(s => s.type !== 'empty')) return; startGame(); toast('Table reset — everyone is back to $10,000'); }
  function showOver() { }

  /* ---------- setup modal ---------- */
  function renderSetup(err) {
    const rows = seatsCfg.map((s, i) => `<div class="seatrow"><span class="n">${i + 1}</span><span class="e">${s.type === 'empty' ? '·' : AVATARS[i]}</span>
      <input data-i="${i}" data-f="name" value="${esc(s.name)}" placeholder="${s.type === 'empty' ? 'Empty seat' : 'Name'}" ${s.type === 'empty' ? 'disabled' : ''} maxlength="12">
      <select data-i="${i}" data-f="type"><option value="human" ${s.type === 'human' ? 'selected' : ''}>Human</option><option value="bot" ${s.type === 'bot' ? 'selected' : ''}>Bot</option><option value="empty" ${s.type === 'empty' ? 'selected' : ''}>Empty</option></select></div>`).join('');
    $('#setupBody').innerHTML = `<div class="presets">
      <button class="btn" data-p="solo">1 player vs 5 bots</button><button class="btn" data-p="hu">Heads-up vs bot</button><button class="btn" data-p="two">2 humans + 3 bots</button><button class="btn" data-p="full">Full table (9)</button><button class="btn" data-p="watch">Watch 6 bots</button></div>${rows}
`;
  }
  function setupOpts(err) { $('#setupOpts').innerHTML = `<div class="optrow"><label>Starting blinds <select id="blindSel" style="width:auto"><option value="25,50" ${blinds[0] === 25 ? 'selected' : ''}>$25 / $50</option><option value="50,100" ${blinds[0] === 50 ? 'selected' : ''}>$50 / $100</option><option value="100,200" ${blinds[0] === 100 ? 'selected' : ''}>$100 / $200</option></select></label>
      <label>Blinds go up <select id="blindModeSel" style="width:auto"><option value="round" ${blindMode === 'round' ? 'selected' : ''}>after every full round</option><option value="5" ${blindMode === '5' ? 'selected' : ''}>every 5 minutes</option><option value="10" ${blindMode === '10' ? 'selected' : ''}>every 10 minutes</option><option value="off" ${blindMode === 'off' ? 'selected' : ''}>never</option></select></label>
      <span class="sub" style="opacity:.7">Starting chips: $10,000 each</span></div><div class="err" id="setupErr">${err || ''}</div>`; }
  function preset(k) {
    const mkb = (n, off = 0) => Array.from({ length: n }, (_, i) => ({ name: BOTS[(i + off) % 8], type: 'bot' }));
    const pad = a => a.concat(Array.from({ length: 9 - a.length }, () => ({ name: '', type: 'empty' })));
    if (k === 'solo') seatsCfg = pad([{ name: 'You', type: 'human' }, ...mkb(5)]);
    if (k === 'hu') seatsCfg = pad([{ name: 'You', type: 'human' }, ...mkb(1)]);
    if (k === 'two') seatsCfg = pad([{ name: 'Player 1', type: 'human' }, { name: 'Player 2', type: 'human' }, ...mkb(3)]);
    if (k === 'full') seatsCfg = pad([{ name: 'You', type: 'human' }, ...mkb(8)]);
    if (k === 'watch') seatsCfg = pad(mkb(6));
  }
  function openSetup() { renderSetup(); setupOpts(); $('#setup').classList.add('open'); }

  /* ---------- helpers ---------- */
  let toastT; function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2200); }
  function setRaise(v) {
    const L = G.legal(); v = Math.max(L.minRaiseTo, Math.min(L.maxRaiseTo, Math.round(v))); raiseVal = v;
    const rs = $('#rs'), rn = $('#rn'); if (rs) rs.value = v; if (rn) rn.value = v;
    const b = $('#aRaise'); if (b) b.textContent = (v >= L.maxRaiseTo ? 'All-in ' : (G.currentBet === 0 ? 'Bet ' : 'Raise to ')) + fmt(v);
  }

  /* ---------- events ---------- */
  document.addEventListener('click', e => {
    const t = e.target.closest('button'); if (!t) return;
    const id = t.id;
    if (id === 'aFold') humanAct('fold');
    else if (id === 'aCall') humanAct('call');
    else if (id === 'aRaise') { const L = G.legal(); humanAct('raise', L.minRaiseTo >= L.maxRaiseTo ? L.maxRaiseTo : raiseVal); }
    else if (id === 'aNext') { clearTimeout(timer); unlocked = null; G.startHand(); tick(); }
    else if (id === 'aReveal') { unlocked = G.current; render(); }
    else if (id === 'aReset' || id === 'btnReset') resetGame();
    else if (id === 'aSetup' || id === 'btnPlayers') openSetup();
    else if (id === 'btnSettings') $('#settings').classList.toggle('open');
    else if (id === 'btnStart') {
      const act = seatsCfg.filter(s => s.type !== 'empty');
      if (act.length < 2) { setupOpts('Pick at least 2 players (humans or bots).'); return; }
      $('#setup').classList.remove('open'); startGame();
    } else if (id === 'btnCopy') { try { navigator.clipboard.writeText(G ? G.logs.map(l => l.text).join('\n') : '').then(() => toast('Log copied'), () => toast('Copy not available')); } catch (er) { toast('Copy not available'); } }
    else if (t.dataset.p) { preset(t.dataset.p); renderSetup(); }
    else if (t.dataset.k) { theme[t.dataset.k] = t.dataset.v; saveTheme(); applyTheme(); if (G) render(); }
    else if (t.dataset.f && G) {
      const L = G.legal(); if (!L) return; const f = t.dataset.f, pot = L.pot + L.toCall;
      if (f === 'min') setRaise(L.minRaiseTo); else if (f === 'max') setRaise(L.maxRaiseTo);
      else setRaise(Math.round((G.currentBet + pot * +f) / 25) * 25);
    }
  });
  document.addEventListener('input', e => {
    const t = e.target;
    if (t.id === 'rs' || t.id === 'rn') setRaise(+t.value || 0);
    else if (t.dataset.f === 'name') seatsCfg[+t.dataset.i].name = t.value;
  });
  document.addEventListener('change', e => {
    const t = e.target;
    if (t.dataset.f === 'type') { const s = seatsCfg[+t.dataset.i]; s.type = t.value; if (t.value === 'bot' && !s.name) s.name = BOTS[+t.dataset.i % 8]; if (t.value === 'human' && (!s.name || BOTS.includes(s.name))) s.name = 'Player ' + (+t.dataset.i + 1); renderSetup(); }
    else if (t.id === 'blindSel') blinds = t.value.split(',').map(Number);
    else if (t.id === 'blindModeSel') blindMode = t.value;
    else if (t.id === 'autodeal') { theme.autodeal = t.checked; saveTheme(); if (G && G.phase === 'showdown') tick(); }
    else if (t.id === 'showall') { theme.showAll = t.checked; saveTheme(); if (G) render(); }
  });
  document.addEventListener('keydown', e => {
    if (!G || /INPUT|SELECT|TEXTAREA/.test(e.target.tagName) || $('#setup').classList.contains('open')) return;
    const k = e.key.toLowerCase();
    if (k === ' ' && G.phase === 'showdown') { e.preventDefault(); $('#aNext') && $('#aNext').click(); }
    else if (k === 'f' && $('#aFold')) $('#aFold').click();
    else if (k === 'c' && $('#aCall')) $('#aCall').click();
    else if (k === 'r' && $('#aRaise')) $('#aRaise').click();
  });
  document.addEventListener('mousedown', e => { if (!e.target.closest('#settings') && e.target.id !== 'btnSettings') $('#settings').classList.remove('open'); });

  applyTheme(); openSetup();
  window.__holdem = { get G() { return G; }, startGame, cardHTML };
})();
