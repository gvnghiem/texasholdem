'use strict';
(function (root) {
  const SUITS = ['s', 'h', 'd', 'c'];
  const SUIT_CH = { s: '♠', h: '♥', d: '♦', c: '♣' };
  const RANK_CH = { 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9', 10: '10', 11: 'J', 12: 'Q', 13: 'K', 14: 'A' };
  const RN = { 2: ['Two', 'Twos'], 3: ['Three', 'Threes'], 4: ['Four', 'Fours'], 5: ['Five', 'Fives'], 6: ['Six', 'Sixes'], 7: ['Seven', 'Sevens'], 8: ['Eight', 'Eights'], 9: ['Nine', 'Nines'], 10: ['Ten', 'Tens'], 11: ['Jack', 'Jacks'], 12: ['Queen', 'Queens'], 13: ['King', 'Kings'], 14: ['Ace', 'Aces'] };
  const LADDER = [[25, 50], [50, 100], [75, 150], [100, 200], [150, 300], [200, 400], [300, 600], [400, 800], [500, 1000], [750, 1500], [1000, 2000], [1500, 3000], [2000, 4000], [3000, 6000], [5000, 10000]];
  const cardStr = c => RANK_CH[c.r] + SUIT_CH[c.s];
  const fmt = n => '$' + Math.round(n).toLocaleString('en-US');

  function newDeck() { const d = []; for (const s of SUITS) for (let r = 2; r <= 14; r++) d.push({ r, s, id: r + s }); return d; }
  function shuffle(a, rng) { rng = rng || Math.random; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

  /* ---------- hand evaluation ---------- */
  function eval5(a, b, c, d, e) {
    const cnt = new Array(15).fill(0); let flush = true;
    const cs = [a, b, c, d, e];
    for (const x of cs) { cnt[x.r]++; if (x.s !== a.s) flush = false; }
    const g4 = [], g3 = [], g2 = [], g1 = [];
    for (let r = 14; r >= 2; r--) { const n = cnt[r]; if (n === 4) g4.push(r); else if (n === 3) g3.push(r); else if (n === 2) g2.push(r); else if (n === 1) g1.push(r); }
    let straight = 0;
    if (g1.length === 5) { if (g1[0] - g1[4] === 4) straight = g1[0]; else if (g1[0] === 14 && g1[1] === 5) straight = 5; }
    let cat, tb;
    if (straight && flush) { cat = 8; tb = [straight]; }
    else if (g4.length) { cat = 7; tb = [g4[0], g1[0]]; }
    else if (g3.length && g2.length) { cat = 6; tb = [g3[0], g2[0]]; }
    else if (flush) { cat = 5; tb = g1; }
    else if (straight) { cat = 4; tb = [straight]; }
    else if (g3.length) { cat = 3; tb = [g3[0], ...g1]; }
    else if (g2.length === 2) { cat = 2; tb = [g2[0], g2[1], g1[0]]; }
    else if (g2.length === 1) { cat = 1; tb = [g2[0], ...g1]; }
    else { cat = 0; tb = g1; }
    let score = cat; for (let i = 0; i < 5; i++) score = score * 15 + (tb[i] || 0);
    return { score, cat, tb };
  }
  function bestHand(cards) {
    let best = null; const n = cards.length;
    for (let i = 0; i < n - 4; i++) for (let j = i + 1; j < n - 3; j++) for (let k = j + 1; k < n - 2; k++) for (let l = k + 1; l < n - 1; l++) for (let m = l + 1; m < n; m++) {
      const r = eval5(cards[i], cards[j], cards[k], cards[l], cards[m]);
      if (!best || r.score > best.score) { best = r; best.cards = [cards[i], cards[j], cards[k], cards[l], cards[m]]; }
    }
    return best;
  }
  function describe(h) {
    const t = h.tb;
    switch (h.cat) {
      case 8: return t[0] === 14 ? 'Royal Flush' : `Straight Flush, ${RN[t[0]][0]} high`;
      case 7: return `Four of a Kind, ${RN[t[0]][1]}`;
      case 6: return `Full House, ${RN[t[0]][1]} full of ${RN[t[1]][1]}`;
      case 5: return `Flush, ${RN[t[0]][0]} high`;
      case 4: return `Straight, ${RN[t[0]][0]} high`;
      case 3: return `Three of a Kind, ${RN[t[0]][1]}`;
      case 2: return `Two Pair, ${RN[t[0]][1]} and ${RN[t[1]][1]}`;
      case 1: return `Pair of ${RN[t[0]][1]}`;
      default: return `High Card, ${RN[t[0]][0]}`;
    }
  }
  function holeLabel(h) {
    if (h.length < 2) return '';
    const [a, b] = h[0].r >= h[1].r ? [h[0], h[1]] : [h[1], h[0]];
    if (a.r === b.r) return `Pocket ${RN[a.r][1]}`;
    return `${RN[a.r][0]}-${RN[b.r][0]} ${a.s === b.s ? 'suited' : 'offsuit'}`;
  }
  function equity(hole, board, opps, sims, rng) {
    const known = new Set(hole.concat(board).map(c => c.id));
    const rest = newDeck().filter(c => !known.has(c.id));
    const need = 5 - board.length; let win = 0;
    for (let s = 0; s < sims; s++) {
      const tot = need + opps * 2;
      for (let i = 0; i < tot; i++) { const j = i + Math.floor(rng() * (rest.length - i)); const t = rest[i]; rest[i] = rest[j]; rest[j] = t; }
      const b = board.concat(rest.slice(0, need));
      const me = bestHand(hole.concat(b)).score;
      let better = false, tie = 0;
      for (let o = 0; o < opps; o++) {
        const sc = bestHand([rest[need + o * 2], rest[need + o * 2 + 1]].concat(b)).score;
        if (sc > me) { better = true; break; }
        if (sc === me) tie++;
      }
      if (!better) win += 1 / (tie + 1);
    }
    return win / sims;
  }

  /* ---------- game ---------- */
  class Game {
    constructor(cfg) {
      let lv = LADDER.findIndex(l => l[0] === cfg.sb); if (lv < 0) lv = 1;
      this.level = lv; this.startLevel = lv; this.sb = LADDER[lv][0]; this.bb = LADDER[lv][1];
      this.blindMode = cfg.blindMode || 'off'; this.levelHands = 0; this.pendingLevelUp = false; this.onLevel = null;
      this.startChips = cfg.chips || 10000;
      this.rng = cfg.rng || Math.random; this.sims = cfg.sims || 150;
      this.players = cfg.players.map((p, i) => ({
        id: i, name: p.name, type: p.type, avatar: p.avatar || '', chips: this.startChips,
        hole: [], folded: false, allIn: false, bet: 0, total: 0, acted: false, out: false, reveal: false,
        last: '', won: 0, bestHand: null, handName: '',
        style: { aggr: 0.25 + this.rng() * 0.6, tight: this.rng() }
      }));
      this.hadHumans = this.players.some(p => p.type === 'human');
      this.hand = 0; this.dealer = Math.floor(this.rng() * this.players.length);
      this.board = []; this.phase = 'idle'; this.runout = false; this.current = -1;
      this.currentBet = 0; this.lastRaise = this.bb; this.logs = []; this.winIds = null; this.lastWinners = []; this.winner = null;
      this.onLog = null;
    }
    log(kind, text) { const e = { kind, text, n: this.logs.length }; this.logs.push(e); if (this.onLog) this.onLog(e); }
    pot() { return this.players.reduce((s, p) => s + p.total, 0); }
    canAct(p) { return !p.out && !p.folded && !p.allIn; }
    needsAction(p) { return this.canAct(p) && (!p.acted || p.bet < this.currentBet); }
    nextSeat(from, pred) { const n = this.players.length; for (let k = 1; k <= n; k++) { const i = (((from + k) % n) + n) % n; if (pred(this.players[i])) return i; } return -1; }
    inHand() { return this.players.filter(p => !p.folded && !p.out); }

    startHand() {
      if (this.phase === 'over') return;
      for (const p of this.players) if (!p.out && p.chips <= 0) { p.out = true; this.log('sys', `${p.name} is out of chips and leaves the table.`); }
      const live = this.players.filter(p => !p.out);
      if (live.length < 2 || (this.hadHumans && !live.some(p => p.type === 'human'))) {
        this.phase = 'over'; this.runout = false; this.current = -1;
        this.winner = live.length === 1 ? live[0] : null;
        if (this.winner) this.log('win', `${this.winner.name} has won all the chips! 🏆`);
        else this.log('sys', 'All human players have been eliminated.');
        return;
      }
      if (this.hand > 0) {
        let why = '';
        if (this.blindMode === 'round' && this.levelHands >= live.length) why = 'a full round of hands has been played';
        else if (this.pendingLevelUp) why = 'the blind timer ran out';
        if (why && this.level < LADDER.length - 1) {
          this.level++; this.sb = LADDER[this.level][0]; this.bb = LADDER[this.level][1]; this.levelHands = 0;
          this.log('level', `⬆ Blinds go up to ${fmt(this.sb)}/${fmt(this.bb)} (level ${this.level + 1}) — ${why}.`);
          if (this.onLevel) this.onLevel(this.level);
        }
        this.pendingLevelUp = false;
      }
      this.levelHands++;
      this.hand++; this.board = []; this.winIds = null; this.lastWinners = []; this.runout = false;
      for (const p of this.players) { p.hole = []; p.folded = p.out; p.allIn = false; p.bet = 0; p.total = 0; p.acted = false; p.reveal = false; p.last = ''; p.won = 0; p.bestHand = null; p.handName = ''; }
      this.dealer = this.nextSeat(this.dealer, p => !p.out);
      const d = this.dealer;
      const sbI = live.length === 2 ? d : this.nextSeat(d, p => !p.out);
      const bbI = this.nextSeat(sbI, p => !p.out);
      this.deck = shuffle(newDeck(), this.rng);
      this.log('hand', `Hand #${this.hand} · Dealer: ${this.players[d].name} · Blinds ${fmt(this.sb)}/${fmt(this.bb)}`);
      this.postBlind(this.players[sbI], this.sb, 'small blind');
      this.postBlind(this.players[bbI], this.bb, 'big blind');
      for (let r = 0; r < 2; r++) {
        let i = sbI;
        for (let k = 0; k < live.length; k++) { const c = this.deck.pop(); c.fresh = true; this.players[i].hole.push(c); i = this.nextSeat(i, p => !p.out); }
      }
      this.currentBet = this.bb; this.lastRaise = this.bb; this.phase = 'preflop';
      this.log('street', 'Pre-flop: hole cards dealt.');
      const first = live.length === 2 ? sbI : this.nextSeat(bbI, p => !p.out);
      this.current = this.canAct(this.players[first]) ? first : this.nextSeat(first, p => this.canAct(p));
      if (this.roundComplete()) this.endBettingRound();
    }
    postBlind(p, amt, label) {
      const a = Math.min(p.chips, amt); p.chips -= a; p.bet += a; p.total += a; if (p.chips === 0) p.allIn = true;
      p.last = label === 'small blind' ? 'SB' : 'BB';
      this.log('blind', `${p.name} posts the ${label}, ${fmt(a)}${p.allIn ? ' (all-in)' : ''}.`);
    }
    roundComplete() {
      const ih = this.inHand();
      if (ih.length <= 1) return true;
      const actors = ih.filter(p => !p.allIn);
      if (actors.length === 0) return true;
      if (actors.length === 1 && actors[0].bet >= this.currentBet) return true;
      return !actors.some(p => this.needsAction(p));
    }
    legal() {
      const p = this.players[this.current]; if (!p) return null;
      const toCall = Math.max(0, this.currentBet - p.bet);
      const maxTo = p.chips + p.bet;
      return { p, toCall, callAmt: Math.min(toCall, p.chips), canCheck: toCall === 0, canRaise: p.chips > toCall, minRaiseTo: Math.min(this.currentBet + this.lastRaise, maxTo), maxRaiseTo: maxTo, pot: this.pot() };
    }
    act(type, raiseTo) {
      if (this.current < 0 || this.phase === 'showdown' || this.phase === 'over' || this.phase === 'idle') return false;
      const p = this.players[this.current], L = this.legal(), pot0 = L.pot, toCall = L.toCall;
      if (type === 'check' && toCall > 0) type = 'call';
      if (type === 'call' && toCall === 0) type = 'check';
      if (type === 'raise' && !L.canRaise) type = 'call';
      if (type === 'fold') {
        p.folded = true; p.last = 'Fold';
        this.log('action', `${p.name} folds${toCall > 0 ? ` (facing ${fmt(toCall)})` : ''}.`);
      } else if (type === 'check') {
        p.acted = true; p.last = 'Check';
        this.log('action', `${p.name} checks. Pot ${fmt(pot0)}.`);
      } else if (type === 'call') {
        const a = L.callAmt; p.chips -= a; p.bet += a; p.total += a; p.acted = true;
        if (p.chips === 0) p.allIn = true;
        p.last = p.allIn ? 'All-in' : 'Call';
        const odds = (pot0 / a).toFixed(1);
        this.log('action', p.allIn ? `${p.name} calls ALL-IN for ${fmt(a)} (pot odds ${odds}:1).` : `${p.name} calls ${fmt(a)} to win ${fmt(pot0 + a)} (pot odds ${odds}:1).`);
      } else if (type === 'raise') {
        let to = Math.floor(raiseTo); const maxTo = L.maxRaiseTo;
        if (!(to >= L.minRaiseTo)) to = L.minRaiseTo;
        if (to > maxTo) to = maxTo;
        const facing = this.currentBet, add = to - p.bet;
        p.chips -= add; p.bet = to; p.total += add; if (p.chips === 0) p.allIn = true;
        const full = (to - facing) >= this.lastRaise;
        if (full) { this.lastRaise = to - facing; for (const o of this.players) if (o !== p && this.canAct(o)) o.acted = false; }
        this.currentBet = Math.max(this.currentBet, to); p.acted = true;
        const pct = Math.round(((to - facing) / (pot0 + toCall || 1)) * 100);
        p.last = p.allIn ? 'All-in' : (facing === 0 ? 'Bet' : 'Raise');
        this.log('action', `${p.name} ${facing === 0 ? 'bets' : 'raises to'} ${fmt(to)}${p.allIn ? ' — ALL-IN' : ''} (+${fmt(add)}, ≈${pct}% of pot). Pot ${fmt(this.pot())}.`);
      } else return false;
      this.advance();
      return true;
    }
    advance() {
      const ih = this.inHand();
      if (ih.length === 1) { this.awardUncontested(ih[0]); return; }
      if (this.roundComplete()) { this.endBettingRound(); return; }
      this.current = this.nextSeat(this.current, p => this.needsAction(p));
    }
    endBettingRound() {
      for (const p of this.players) { p.bet = 0; p.acted = false; if (this.canAct(p)) p.last = ''; }
      this.currentBet = 0; this.lastRaise = this.bb;
      if (this.phase === 'river') { this.showdown(); return; }
      const ih = this.inHand(), actors = ih.filter(p => !p.allIn);
      if (actors.length <= 1) {
        this.runout = true; this.current = -1;
        ih.forEach(p => p.reveal = true);
        this.log('street', 'Betting is closed — hands are turned face up and the board runs out.');
        return;
      }
      this.dealCommunity();
      this.current = this.nextSeat(this.dealer, p => this.canAct(p));
    }
    dealCommunity() {
      this.deck.pop();
      const take = n => { const c = []; for (let i = 0; i < n; i++) { const x = this.deck.pop(); x.fresh = true; c.push(x); } this.board.push(...c); return c; };
      const note = ` · Pot ${fmt(this.pot())}`;
      if (this.board.length === 0) { const c = take(3); this.phase = 'flop'; this.log('street', `Flop: ${c.map(cardStr).join(' ')}${note}`); }
      else if (this.board.length === 3) { const c = take(1); this.phase = 'turn'; this.log('street', `Turn: ${cardStr(c[0])} — board ${this.board.map(cardStr).join(' ')}${note}`); }
      else { const c = take(1); this.phase = 'river'; this.log('street', `River: ${cardStr(c[0])} — board ${this.board.map(cardStr).join(' ')}${note}`); }
    }
    runoutStep() { if (!this.runout) return; if (this.board.length < 5) this.dealCommunity(); else this.showdown(); }
    awardUncontested(w) {
      const pot = this.pot(); w.chips += pot; w.won = pot;
      this.phase = 'showdown'; this.runout = false; this.current = -1; this.lastWinners = [w.id]; this.winIds = null;
      for (const p of this.players) p.bet = 0;
      this.log('win', `${w.name} wins ${fmt(pot)} — everyone else folded.`);
    }
    showdown() {
      this.phase = 'showdown'; this.runout = false; this.current = -1;
      const ih = this.inHand(), n = this.players.length;
      for (const p of this.players) p.bet = 0;
      for (const p of ih) {
        p.reveal = true; p.bestHand = bestHand(p.hole.concat(this.board)); p.handName = describe(p.bestHand);
        this.log('show', `${p.name} shows ${p.hole.map(cardStr).join(' ')} — ${p.handName}.`);
      }
      const levels = [...new Set(this.players.filter(p => p.total > 0).map(p => p.total))].sort((a, b) => a - b);
      let prev = 0, idx = 0; const winIds = new Set(); const winners0 = new Set();
      for (const lvl of levels) {
        let pot = 0; for (const p of this.players) pot += Math.max(0, Math.min(p.total, lvl) - prev);
        const elig = ih.filter(p => p.total >= lvl); prev = lvl;
        if (pot <= 0 || !elig.length) continue;
        const label = levels.length > 1 ? (idx === 0 ? 'the main pot' : `side pot ${idx}`) : 'the pot';
        idx++;
        if (elig.length === 1) {
          elig[0].chips += pot; elig[0].won += pot; winners0.add(elig[0].id);
          this.log('win', `${elig[0].name} wins ${fmt(pot)} (${idx === 1 && levels.length === 1 ? 'uncontested' : 'uncalled bet returned'}).`);
          continue;
        }
        let top = -1, ws = [];
        for (const p of elig) { const s = p.bestHand.score; if (s > top) { top = s; ws = [p]; } else if (s === top) ws.push(p); }
        ws.sort((a, b) => (((a.id - this.dealer) % n) + n) % n - (((b.id - this.dealer) % n) + n) % n);
        const share = Math.floor(pot / ws.length); let rem = pot - share * ws.length;
        for (const w of ws) { const g = share + (rem > 0 ? 1 : 0); if (rem > 0) rem--; w.chips += g; w.won += g; winners0.add(w.id); w.bestHand.cards.forEach(c => winIds.add(c.id)); }
        if (ws.length === 1) this.log('win', `${ws[0].name} wins ${label}, ${fmt(pot)}, with ${ws[0].handName}.`);
        else this.log('win', `${ws.map(w => w.name).join(' & ')} split ${label}, ${fmt(pot)} — ${ws[0].handName}.`);
      }
      this.winIds = winIds; this.lastWinners = [...winners0];
    }

    /* ---------- bot AI ---------- */
    botAction() {
      const L = this.legal(), p = L.p, rng = this.rng, st = p.style;
      const opps = Math.max(1, this.inHand().length - 1);
      const eq = equity(p.hole, this.board, opps, this.sims, rng) + (rng() - 0.5) * 0.06;
      const pot = L.pot, stack = p.chips + p.bet;
      const strong = 0.35 + 0.35 / (1 + (opps - 1) * 0.35) - 0.10 * st.aggr;
      const medium = strong - 0.14;
      const mk = frac => {
        let to = this.currentBet + Math.max(this.lastRaise, Math.round((pot + L.toCall) * frac));
        to = Math.round(to / 25) * 25; to = Math.max(to, L.minRaiseTo);
        if (to >= stack * 0.65) to = stack; return Math.min(to, stack);
      };
      if (L.toCall === 0) {
        if (L.canRaise && eq >= strong) return { type: 'raise', to: mk(0.5 + rng() * 0.4) };
        if (L.canRaise && eq >= medium && rng() < 0.3 + 0.4 * st.aggr) return { type: 'raise', to: mk(0.35 + rng() * 0.15) };
        if (L.canRaise && rng() < 0.03 + 0.06 * st.aggr) return { type: 'raise', to: mk(0.5) };
        return { type: 'check' };
      }
      const potOdds = L.callAmt / (pot + L.callAmt);
      const need = potOdds * (0.62 + 0.25 * st.tight);
      const bigCall = L.callAmt >= p.chips * 0.5;
      if (L.canRaise && eq >= strong && rng() < 0.5 + 0.4 * st.aggr) return { type: 'raise', to: mk(0.6 + rng() * 0.4) };
      if (eq >= need && (!bigCall || eq >= medium)) return { type: 'call' };
      if (L.canRaise && L.toCall < pot * 0.5 && rng() < 0.02 * st.aggr) return { type: 'raise', to: mk(0.7) };
      return { type: 'fold' };
    }
  }

  const api = { LADDER, Game, bestHand, describe, holeLabel, cardStr, fmt, newDeck, shuffle, eval5, equity, RANK_CH, SUIT_CH };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.Poker = api;
})(typeof window !== 'undefined' ? window : globalThis);
