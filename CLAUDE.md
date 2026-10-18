# Box Hunter: notes for Claude

The owner (PillowFishSticks) isn't a developer and wants Claude to own the code. Keep it simple and cheap to maintain: one HTML file, no frameworks, no build step, no runtime dependencies. **Don't ask before pushing: commit and push when checks pass** (owner's standing instruction).

## What it is
A pixel-art incremental game about opening mystery boxes, in the spirit of Scritchy Scratchy (everything is an object on a desk/bench, a satisfying hand action you later automate, prestige) and Cookie Clicker (rising costs, milestones, surprise events). Sister project to Bulk Season (`PillowFishSticks/bulk-season`), whose save, input and sim-bot patterns are reused. Desktop-first (the owner plays fullscreen on a TV, often with an Xbox controller); landscape phones second.

The full scope lives in the design doc "Box Hunter: Game Design Doc" (a Claude doc artifact): https://claude.ai/code/artifact/93ef27de-3f42-46c3-98a6-1c8f5869d3c9. Six phases, each playable on the site: 1 first playable (done) → 2 economy (shelves, scrap/parts, 3 box tiers, sim bot) → 3 automation (kid, van, sorter, conveyor, offline) → 4 prestige ("Sell the business", reputation stars) → 5 content (8 box types, ~150 items, album, legendaries, cursed items, events) → 6 polish and release. **Two owner playtests:** after phase 1 (does opening feel good?) and after phase 4 (is prestige worth it?). Don't build past a playtest without the owner's feedback.

Owner decisions: name Box Hunter; the shop pet is a dog; full game 6–8 hours; no real brands (the post sack is "Second Class Post Co."); never real money, ads or paid boxes. Still open: whether prestige gets a story beat (a rival chain buying you out).

## Files
- `index.html`: the whole game (CSS, markup, JS).
- `fonts/`: Silkscreen (labels, numbers, buttons; class font "Silk") and Pixelify Sans (body text; "Pix"), OFL, self-hosted so it works offline.
- `README.md`: player-facing.

## How it's built
- **Stage:** a fixed 480×270 `#stage` scaled to fit with `transform: scale` (`fit()`), letterboxed. The scene is a 480×270 `<canvas>` drawn with `fillRect` pixel art (`R()`), `image-rendering: pixelated`. UI panels are DOM over it, styled as pixel panels (square corners, 2px ink borders, hard shadows), using the two pixel fonts at small sizes (7–16px). `stagePos(el)` maps a DOM element to stage coordinates (coins fly to `#cash .coin`).
- **Sprites:** items are emoji turned into 16×16 pixel sprites by `sprite()` (hard alpha threshold + 1px ink outline), drawn at 2×. Hand-drawn objects (bench, boxes, dog, cutter) are `fillRect` code.
- **The box (state machine `G.st`):** empty (the heap of old boxes: stomp it for `PILE_P` 20p) → arrive (slides in) → closed (slice the tape: `TAPE_N` 18 segments; `cutAt`/`sliceLine` interpolate the drag; 86% cut opens it; Space/A auto-slices down the tape via `auto`) → open (flaps fold out) → glow (rarity-coloured beams; legendary slows time with `slow`) → reveal (`reveal()`: name card `#find`, particles, dog reaction) → fly (to the tray) → opened (click to flatten for `FLAT_K` 10% of the price) → empty. `benchAction()` is the single "obvious action" for click/Space/A. Rarer boxes rattle more (`G.rattle`).
- **Data:** `RAR` (5 rarities, weights, colours), `ITEMS` (20 for the cardboard parcel; `r` rarity, `v` value £, `d` funny line), `UPG` (Sharper Cutter, Sharp Eye = `luckMult`, Haggling; cost = base × k^level). Average box value ~£6.2 for a £5 box at the start.
- **Save:** localStorage `boxHunter.v1` (`fresh()` lists the fields), autosave every 5s and on unload, a copy in `boxHunter.v1.backup` on every load; a `storage` event from another tab makes this tab read-only. Bump the key if the shape changes incompatibly.
- **Audio:** all synthesised (`tone`, `noise`, `SFX`). Music is lo-fi jazz (ii–V–I–vi in C, 76 bpm, swung, soft keys, walking bass, brushes, vinyl crackle) in `musicTick`. `S.muted` / `S.music` toggle sound and music separately.
- **Input:** pointer drag/click on the canvas (`cv`), keyboard (Space act, B buy, S sell all, 1–3 upgrades, C collection, F fullscreen), controller polled in `pollPad` (A act/hold to slice, Y buy, X sell all, d-pad left/right + B upgrades, View collection). `body.pad` / `body.touch` swap the button hints.
- `#debug` in the URL skips the title and exposes `window.BH` for tests.

## Testing
Quick Playwright checks, not a test suite: load at 1920×1080, 1366×768 and 844×390 (touch), stomp the pile, buy, drag down the tape, wait for the reveal, flatten, sell; check for page errors. For the controller, stub `navigator.getGamepads` with a fake pad. From phase 2, a sim bot (like Bulk Season's `BS.sim`) checks pacing against the doc's milestone table.

## Hosting
Public repo, GitHub Pages serves `main` at the root: https://pillowfishsticks.github.io/box-hunter/
