(function (root) {
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const wrap = (inner) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">${inner}</svg>`;
  const glow = (id, s) => `<filter id="${id}" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="${s}"/></filter>`;

  const scenes = {
    house(p) {
      const r = rng(7); let books = '';
      for (let row = 0; row < 4; row++) { let x = 1175; const y = 120 + row * 130; while (x < 1470) { const w = 14 + r() * 18, h = 70 + r() * 40; books += `<rect x="${x}" y="${y + 110 - h}" width="${w}" height="${h}" fill="hsl(${Math.floor(r() * 360)},45%,${35 + r() * 20}%)"/>`; x += w + 2; } books += `<rect x="1160" y="${y + 110}" width="325" height="10" fill="#2a190f"/>`; }
      let planks = ''; for (let i = -12; i <= 28; i++) planks += `<line x1="${800 + (i - 8) * 55}" y1="650" x2="${800 + (i - 8) * 190}" y2="900" stroke="rgba(0,0,0,.28)" stroke-width="2"/>`;
      let stars = ''; for (let i = 0; i < 25; i++) stars += `<circle cx="${185 + r() * 270}" cy="${125 + r() * 150}" r="${.8 + r() * 1.4}" fill="#fff" opacity=".8"/>`;
      return wrap(`<defs><linearGradient id="${p}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a5444"/><stop offset="1" stop-color="#4a3025"/></linearGradient>
<linearGradient id="${p}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0f1d3a"/><stop offset="1" stop-color="#3a5a8c"/></linearGradient>
<linearGradient id="${p}f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6b4528"/><stop offset="1" stop-color="#3a2412"/></linearGradient>
<radialGradient id="${p}g"><stop offset="0" stop-color="#ffd58a" stop-opacity=".7"/><stop offset="1" stop-color="#ffd58a" stop-opacity="0"/></radialGradient></defs>
<rect width="1600" height="900" fill="url(#${p}w)"/>
<rect y="430" width="1600" height="230" fill="#3a2a20"/>${[0,1,2,3,4,5,6,7].map(i => `<rect x="${40 + i * 200}" y="460" width="160" height="170" fill="none" stroke="rgba(255,255,255,.1)" stroke-width="3"/>`).join('')}
<rect y="650" width="1600" height="250" fill="url(#${p}f)"/>${planks}
<rect x="165" y="105" width="310" height="300" fill="#2b1d14"/><rect x="180" y="120" width="280" height="270" fill="url(#${p}s)"/>${stars}<circle cx="410" cy="170" r="24" fill="#f6f1d3"/>
<rect x="318" y="120" width="8" height="270" fill="#2b1d14"/><rect x="180" y="250" width="280" height="8" fill="#2b1d14"/>
<path d="M120 90 H230 Q215 250 235 420 H120Z" fill="#8c2f39"/><path d="M520 90 H410 Q425 250 405 420 H520Z" fill="#8c2f39"/>
<rect x="1150" y="90" width="345" height="560" fill="#3a2619"/>${books}
<rect x="650" y="150" width="130" height="170" fill="#c9a227"/><rect x="662" y="162" width="106" height="146" fill="#5d7c8a"/><circle cx="715" cy="215" r="28" fill="#e0c36a"/><rect x="830" y="190" width="100" height="80" fill="#c9a227"/><rect x="840" y="200" width="80" height="60" fill="#8aa56d"/>
<circle cx="1080" cy="430" r="180" fill="url(#${p}g)"/><path d="M1040 480 L1120 480 L1100 400 L1060 400Z" fill="#e8c27a"/><rect x="1076" y="480" width="8" height="190" fill="#222"/><ellipse cx="1080" cy="672" rx="40" ry="8" fill="#222"/>
<ellipse cx="800" cy="790" rx="680" ry="110" fill="#5b2a2f" opacity=".85"/><ellipse cx="800" cy="790" rx="640" ry="92" fill="none" stroke="#d9b45a" stroke-width="4" opacity=".6"/>`);
    },
    casino(p) {
      const r = rng(11); let slots = '', lights = '';
      for (let i = 0; i < 12; i++) { const x = 30 + i * 133; const hue = [50, 190, 320, 120][i % 4]; slots += `<g><rect x="${x}" y="330" width="112" height="240" rx="12" fill="#1c0b14" stroke="#c9a227" stroke-width="3"/><rect x="${x + 12}" y="360" width="88" height="80" rx="6" fill="hsl(${hue},55%,${20 + r() * 10}%)"/><rect x="${x + 12}" y="455" width="88" height="22" rx="4" fill="#0a0408"/><circle cx="${x + 56}" cy="345" r="6" fill="hsl(${hue},100%,65%)"/></g>`; }
      for (let i = 0; i < 9; i++) lights += `<circle cx="${60 + i * 185}" cy="50" r="90" fill="url(#${p}l)"/><circle cx="${60 + i * 185}" cy="50" r="9" fill="#fff3c4"/>`;
      return wrap(`<defs><linearGradient id="${p}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2d0a14"/><stop offset="1" stop-color="#150509"/></linearGradient>
<radialGradient id="${p}l"><stop offset="0" stop-color="#ffd27a" stop-opacity=".55"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient>
<filter id="${p}bl"><feGaussianBlur stdDeviation="3"/></filter><pattern id="${p}c" width="80" height="80" patternUnits="userSpaceOnUse"><rect width="80" height="80" fill="#4a0d1c"/><path d="M40 6 L74 40 L40 74 L6 40Z" fill="none" stroke="#d9b45a" stroke-opacity=".28" stroke-width="3"/><circle cx="40" cy="40" r="5" fill="#d9b45a" fill-opacity=".3"/></pattern>${glow(p + 'n', 6)}</defs>
<rect width="1600" height="900" fill="url(#${p}b)"/>${lights}
<rect y="300" width="1600" height="30" fill="#3a1520"/><g opacity=".55" filter="url(#${p}bl)">${slots}</g>
<rect x="190" y="0" width="46" height="640" fill="#7b5d1a" opacity=".55"/><rect x="800" y="0" width="46" height="640" fill="#7b5d1a" opacity=".55"/><rect x="1380" y="0" width="46" height="640" fill="#7b5d1a" opacity=".55"/>
<text x="800" y="205" text-anchor="middle" font-size="120" font-weight="900" font-family="Georgia,serif" fill="#ff3d6e" filter="url(#${p}n)" opacity=".9">LUCKY 7</text>
<text x="800" y="205" text-anchor="middle" font-size="120" font-weight="900" font-family="Georgia,serif" fill="none" stroke="#ffe9f0" stroke-width="3">LUCKY 7</text>
<rect y="570" width="1600" height="330" fill="url(#${p}c)"/><rect y="570" width="1600" height="330" fill="#000" opacity=".18"/>`);
    },
    outdoors(p) {
      const r = rng(5); let trees = '', bulbs = '', flowers = '';
      for (let i = 0; i < 16; i++) { const x = i * 110 + r() * 40, h = 90 + r() * 90; trees += `<rect x="${x + 28}" y="${520 - h * .2}" width="14" height="${h * .55}" fill="#4a3220"/><circle cx="${x + 35}" cy="${480 - h * .3}" r="${48 + r() * 24}" fill="hsl(${105 + r() * 30},45%,${24 + r() * 10}%)"/>`; }
      for (let i = 0; i <= 20; i++) { const x = i * 80, y = 70 + Math.sin(i / 20 * Math.PI) * 60; bulbs += `<circle cx="${x}" cy="${y + 6}" r="7" fill="#ffe29a"/><circle cx="${x}" cy="${y + 6}" r="22" fill="url(#${p}b)"/>`; }
      for (let i = 0; i < 30; i++) flowers += `<circle cx="${r() * 1600}" cy="${640 + r() * 70}" r="${3 + r() * 3}" fill="hsl(${Math.floor(r() * 360)},80%,65%)"/>`;
      return wrap(`<defs><linearGradient id="${p}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#58b4f5"/><stop offset="1" stop-color="#dff3ff"/></linearGradient><linearGradient id="${p}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#58a850"/><stop offset="1" stop-color="#2c6a30"/></linearGradient>
<radialGradient id="${p}b"><stop offset="0" stop-color="#ffd780" stop-opacity=".5"/><stop offset="1" stop-color="#ffd780" stop-opacity="0"/></radialGradient><radialGradient id="${p}u"><stop offset="0" stop-color="#fff7c2"/><stop offset="1" stop-color="#fff7c2" stop-opacity="0"/></radialGradient></defs>
<rect width="1600" height="900" fill="url(#${p}s)"/><circle cx="1290" cy="150" r="190" fill="url(#${p}u)"/><circle cx="1290" cy="150" r="58" fill="#fff6b0"/>
${[[200, 180], [620, 120], [980, 230], [1450, 330]].map(([x, y]) => `<g fill="#fff" opacity=".92"><ellipse cx="${x}" cy="${y}" rx="95" ry="30"/><ellipse cx="${x + 55}" cy="${y - 20}" rx="65" ry="30"/><ellipse cx="${x - 55}" cy="${y - 10}" rx="55" ry="24"/></g>`).join('')}
<path d="M0 470 Q250 360 520 450 T1040 430 T1600 440 V700 H0Z" fill="#7bb274"/><path d="M0 540 Q300 450 640 520 T1250 500 T1600 530 V720 H0Z" fill="#5e9d5c"/>${trees}
<rect y="560" width="1600" height="340" fill="url(#${p}g)"/>${flowers}
<path d="M0 760 H1600 V900 H0Z" fill="#8a6038"/>${Array.from({ length: 12 }, (_, i) => `<line x1="0" y1="${775 + i * 12}" x2="1600" y2="${775 + i * 12}" stroke="rgba(0,0,0,.25)" stroke-width="2"/>`).join('')}
<path d="M0 70 Q800 190 1600 70" stroke="#333" fill="none" stroke-width="3"/>${bulbs}`);
    },
    vegas(p) {
      const r = rng(21); let stars = '', back = '', wins = '', beams = '', cars = '';
      for (let i = 0; i < 110; i++) stars += `<circle cx="${r() * 1600}" cy="${r() * 420}" r="${.6 + r() * 1.4}" fill="#fff" opacity="${.3 + r() * .7}"/>`;
      let x = 0; while (x < 1600) { const w = 50 + r() * 80, h = 120 + r() * 260; back += `<rect x="${x}" y="${700 - h}" width="${w}" height="${h}" fill="#1a0a33"/>`; for (let k = 0; k < h / 26; k++) for (let m = 0; m < w / 22; m++) if (r() < .42) wins += `<rect x="${x + 6 + m * 20}" y="${700 - h + 8 + k * 24}" width="8" height="12" fill="#ffd36b" opacity="${.5 + r() * .5}"/>`; x += w + 4; }
      for (let i = 0; i < 4; i++) beams += `<polygon points="${200 + i * 400},720 ${150 + i * 400 + (i % 2 ? 160 : -60)},0 ${230 + i * 400 + (i % 2 ? 220 : 0)},0" fill="#fff" opacity=".07"/>`;
      for (let i = 0; i < 26; i++) cars += `<rect x="${r() * 1600}" y="${790 + r() * 90}" width="${40 + r() * 80}" height="4" rx="2" fill="${r() < .5 ? '#ff4d6d' : '#fff3c4'}" opacity=".75"/>`;
      return wrap(`<defs><linearGradient id="${p}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#07021a"/><stop offset=".6" stop-color="#2d0a52"/><stop offset="1" stop-color="#ff3d81"/></linearGradient>${glow(p + 'n', 7)}</defs>
<rect width="1600" height="900" fill="url(#${p}s)"/>${stars}${beams}${back}${wins}
<polygon points="260,700 430,360 600,700" fill="#12082a" stroke="#38e8ff" stroke-width="3"/><rect x="425" y="260" width="10" height="100" fill="#38e8ff"/>
<rect x="1060" y="300" width="22" height="400" fill="#15092e"/><ellipse cx="1071" cy="300" rx="110" ry="22" fill="#1d0e3f" stroke="#ff4fd8" stroke-width="3"/>
<rect x="1180" y="440" width="160" height="260" fill="#160a30" stroke="#ffd36b" stroke-width="3"/><rect x="900" y="480" width="120" height="220" fill="#160a30" stroke="#ff4fd8" stroke-width="3"/>
<g font-family="'Brush Script MT','Segoe Script',cursive" font-size="130" text-anchor="middle"><text x="800" y="180" fill="#ff4fd8" filter="url(#${p}n)">Las Vegas</text><text x="800" y="180" fill="#ffe3fb" stroke="#ff4fd8" stroke-width="2">Las Vegas</text></g>
<g fill="none" stroke-width="4"><rect x="40" y="560" width="190" height="60" stroke="#38e8ff" filter="url(#${p}n)"/><rect x="1390" y="560" width="190" height="60" stroke="#ffd36b" filter="url(#${p}n)"/></g>
<path d="M90 700 Q80 560 150 470" stroke="#07021a" stroke-width="14" fill="none"/><path d="M150 470 q-60-30-110 10 M150 470 q-20-60-90-60 M150 470 q40-50 100-30 M150 470 q60 0 90 50" stroke="#07021a" stroke-width="9" fill="none"/>
<path d="M1520 700 Q1530 570 1470 480" stroke="#07021a" stroke-width="14" fill="none"/><path d="M1470 480 q60-30 110 10 M1470 480 q20-60 90-60 M1470 480 q-40-50-100-30 M1470 480 q-60 0-90 50" stroke="#07021a" stroke-width="9" fill="none"/>
<rect y="700" width="1600" height="200" fill="#0a0612"/>${cars}`);
    },
    atlantic(p) {
      const r = rng(33); let waves = '', spokes = '', cabins = '', posts = '', gulls = '', sky = '';
      for (let i = 0; i < 26; i++) waves += `<path d="M${r() * 1600} ${535 + r() * 150} q20-8 40 0 t40 0" stroke="rgba(255,255,255,.28)" fill="none" stroke-width="2"/>`;
      for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; spokes += `<line x1="320" y1="390" x2="${320 + Math.cos(a) * 165}" y2="${390 + Math.sin(a) * 165}" stroke="#2a1a3a" stroke-width="3"/>`; cabins += `<circle cx="${320 + Math.cos(a) * 165}" cy="${390 + Math.sin(a) * 165}" r="11" fill="hsl(${i * 23},85%,60%)"/>`; }
      for (let i = 0; i < 15; i++) posts += `<rect x="${i * 115 + 10}" y="650" width="16" height="90" fill="#e9e1d2"/>`;
      for (let i = 0; i < 6; i++) { const x = 500 + r() * 800, y = 120 + r() * 160; gulls += `<path d="M${x} ${y} q12-14 24 0 q12-14 24 0" stroke="#fff" fill="none" stroke-width="3"/>`; }
      let bx = 560; while (bx < 1000) { const w = 50 + r() * 50, h = 80 + r() * 150; sky += `<rect x="${bx}" y="${520 - h}" width="${w}" height="${h}" fill="#3b2850"/>`; bx += w + 3; }
      return wrap(`<defs><linearGradient id="${p}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#262a6b"/><stop offset=".55" stop-color="#d4528a"/><stop offset="1" stop-color="#ffb870"/></linearGradient>
<linearGradient id="${p}o" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e7845f"/><stop offset=".25" stop-color="#2a5d92"/><stop offset="1" stop-color="#0b2748"/></linearGradient>
<radialGradient id="${p}u"><stop offset="0" stop-color="#fff2b8"/><stop offset="1" stop-color="#ffb870" stop-opacity="0"/></radialGradient>${glow(p + 'n', 5)}</defs>
<rect width="1600" height="900" fill="url(#${p}s)"/><circle cx="1180" cy="500" r="230" fill="url(#${p}u)" opacity=".8"/><circle cx="1180" cy="505" r="78" fill="#fff0b0"/>${gulls}${sky}
<rect y="520" width="1600" height="200" fill="url(#${p}o)"/>${Array.from({ length: 9 }, (_, i) => `<rect x="${1180 - 70 + i * 3 - i * 4}" y="${528 + i * 16}" width="${140 - i * 6}" height="5" rx="2" fill="#ffe7a1" opacity="${.65 - i * .06}"/>`).join('')}${waves}
<g opacity=".95"><rect x="120" y="510" width="760" height="20" fill="#4a3220"/>${[0, 1, 2, 3, 4, 5, 6].map(i => `<rect x="${150 + i * 110}" y="530" width="12" height="60" fill="#33231a"/>`).join('')}<polygon points="260,520 320,390 380,520" fill="#2a1a3a"/><circle cx="320" cy="390" r="165" fill="none" stroke="#2a1a3a" stroke-width="6"/>${spokes}${cabins}<circle cx="320" cy="390" r="12" fill="#ffd36b"/></g>
<text x="620" y="500" font-family="Georgia,serif" font-weight="800" font-size="40" fill="#ffe9a8" filter="url(#${p}n)" text-anchor="middle" letter-spacing="6">ATLANTIC CITY</text>
<rect y="720" width="1600" height="180" fill="#8b6a46"/>${Array.from({ length: 9 }, (_, i) => `<line x1="0" y1="${735 + i * 20 + i * i * 1.2}" x2="1600" y2="${735 + i * 20 + i * i * 1.2}" stroke="rgba(0,0,0,.3)" stroke-width="3"/>`).join('')}
<rect y="648" width="1600" height="12" fill="#f2ead9"/>${posts}`);
    }
  };
  root.BG = { names: ['house', 'casino', 'outdoors', 'vegas', 'atlantic'], labels: { house: 'House', casino: 'Casino', outdoors: 'Outdoors', vegas: 'Las Vegas', atlantic: 'Atlantic City' }, svg: (n, p) => scenes[n](p || 'bg_') };
})(window);
