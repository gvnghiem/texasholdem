# Texas Hold'em

A browser-based Texas Hold'em game in plain JavaScript. No dependencies, no build tooling needed to play: open `index.html`.

## Features
- Standard no-limit Texas Hold'em: blinds, dealer button, flop/turn/river, side pots, split pots, all-in run-outs
- 2–9 seats; each can be **Human**, **Bot** or **Empty**. Several humans can share one screen (hot-seat, cards hidden until your turn)
- Everyone starts with **$10,000**
- **Blinds rise** after every full round, every 5 min, every 10 min, or never (ladder $25/$50 up to $5,000/$10,000)
- Standard card faces (pips, J/Q/K frames, readable indexes) and selectable card backs
- Table **color** (6) and **style** (Classic Wood, Modern, Neon, Vintage Leather)
- Backgrounds: **House, Casino, Outdoors, Las Vegas, Atlantic City** (generated SVG scenes)
- **Reset** button, and an annotated **move log** (pot odds on calls, raise size as % of pot, showdown hands, side pots)
- Responsive; on phones it asks for **landscape** and switches to a compact layout
- Keyboard: `F` fold, `C` check/call, `R` raise, `Space` next hand

## Run
Open `index.html` in a browser, or serve the folder: `python3 -m http.server`.

## Develop
Source lives in `src/`; `index.html` is generated.

```
python3 build.py        # rebuild index.html from src/
node test/engine.test.js  # hand rankings, chip conservation over simulated games, blind levels
```

| File | Purpose |
|------|---------|
| `src/engine.js` | Rules engine, hand evaluator, side pots, blind levels, bot AI (Monte Carlo equity). DOM-free, runs in Node |
| `src/ui.js` | Rendering, setup/settings, input handling, timers |
| `src/backgrounds.js` | Generated SVG backgrounds |
| `src/style.css` | Themes, cards, responsive/compact phone layout |
| `src/template.html` | Page shell |

## Notes
Bots are heuristic (equity vs. pot odds with some randomness and per-bot aggression); they don't model opponents. Local play only, no online multiplayer.
