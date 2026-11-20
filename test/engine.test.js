const P = require('../src/engine.js');
const { Game, bestHand, describe } = P;
const mk = s => s.split(' ').map(t => { const r = { A: 14, K: 13, Q: 12, J: 11, T: 10 }[t[0]] || +t[0]; return { r, s: t[1], id: t }; });
const chk = (s, exp) => { const d = describe(bestHand(mk(s))); console.log(d === exp ? 'ok  ' : 'FAIL', s, '->', d); if (d !== exp) process.exitCode = 1; };
chk('As Ks Qs Js Ts 2c 3d', 'Royal Flush');
chk('9h 8h 7h 6h 5h Ac Ad', 'Straight Flush, Nine high');
chk('As 2d 3c 4h 5s Kd 9c', 'Straight, Five high');
chk('Kh Kd Kc Ks 2d 2c 2s', 'Four of a Kind, Kings');
chk('Kh Kd Kc 2s 2d 9c 4s', 'Full House, Kings full of Twos');
chk('Ah 9h 6h 3h 2h Kd Kc', 'Flush, Ace high');
chk('Qh Qd 7c 7s 4d 4c 2s', 'Two Pair, Queens and Sevens');
chk('Qh Qd 8c 7s 4d 3c 2s', 'Pair of Queens');
chk('Ah Qd 8c 7s 4d 3c 2s', 'High Card, Ace');

let hands = 0, games = 0;
for (let g = 0; g < 40; g++) {
  const n = 2 + (g % 8);
  const game = new Game({ players: Array.from({ length: n }, (_, i) => ({ name: 'B' + i, type: 'bot' })), sims: 20 });
  let guard = 0;
  while (game.phase !== 'over' && guard++ < 400) {
    game.startHand(); if (game.phase === 'over') break; hands++;
    let acts = 0;
    while (game.phase !== 'showdown') {
      if (++acts > 300) throw new Error('stuck');
      if (game.runout) { game.runoutStep(); continue; }
      const a = game.botAction(); game.act(a.type, a.to);
      if (game.phase === 'showdown') break; const sum = game.players.reduce((s, p) => s + p.chips + p.total, 0);
      if (sum !== 10000 * n) throw new Error('chips not conserved mid-hand ' + sum);
    }
    const sum = game.players.reduce((s, p) => s + p.chips, 0);
    if (sum !== 10000 * n) throw new Error('chips not conserved after hand ' + sum + ' vs ' + 10000 * n);
  }
  games++;
}
console.log('games', games, 'hands', hands, 'OK');
{
  const g = new Game({ players: [0,1,2,3].map(i=>({name:'P'+i,type:'bot'})), sims: 10, blindMode: 'round', sb: 50, rng: (()=>{let s=12345;return()=>{s|=0;s=s+0x6D2B79F5|0;let x=Math.imul(s^s>>>15,1|s);x=x+Math.imul(x^x>>>7,61|x)^x;return((x^x>>>14)>>>0)/4294967296}})() });
  const seen = [];
  for (let h = 0; h < 13; h++) { g.startHand(); seen.push(g.bb); while (g.phase !== 'showdown') { if (g.runout) { g.runoutStep(); continue; } const a = g.botAction(); g.act(a.type, a.to); } }
  console.log('bb per hand:', seen.join(','));
  const ok = seen.slice(0,4).every(x=>x===100) && seen[4]===150 && seen[8]===200;
  console.log(ok ? 'blind-round OK' : 'blind-round FAIL'); if(!ok) process.exitCode=1;
}
