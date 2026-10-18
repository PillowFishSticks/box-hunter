# Box Hunter: notes for Claude

The owner (PillowFishSticks) isn't a developer and wants Claude to own the code. Keep it simple and cheap to maintain: one HTML file, no frameworks, no build step, no runtime dependencies. **Don't ask before pushing: commit and push when checks pass** (owner's standing instruction).

## What it is
A pixel-art incremental game about opening mystery boxes, in the spirit of Scritchy Scratchy (everything is an object on a desk/bench, a satisfying hand action you later automate, prestige) and Cookie Clicker (rising costs, milestones, surprise events). Sister project to Bulk Season (`PillowFishSticks/bulk-season`), whose save, input and sim-bot patterns are reused. Desktop-first (the owner plays fullscreen on a TV, with a mouse); landscape phones second.

The full scope lives in the design doc "Box Hunter: Game Design Doc" (a Claude doc artifact): https://claude.ai/code/artifact/93ef27de-3f42-46c3-98a6-1c8f5869d3c9. The owner asked for everything at once after playtest 1, so all six phases are built (polish ongoing). Original plan: 1 first playable → 2 economy (shelves, scrap/parts, 3 box tiers, sim bot) → 3 automation (kid, van, sorter, conveyor, offline) → 4 prestige ("Sell the business", reputation stars) → 5 content (8 box types, ~150 items, album, legendaries, cursed items, events) → 6 polish and release. **Two owner playtests:** after phase 1 (does opening feel good?) and after phase 4 (is prestige worth it?).

Owner decisions: name Box Hunter; the shop pet is a dog; full game 6–8 hours; no real brands (the post sack is "Second Class Post Co."); never real money, ads or paid boxes. Still open: whether prestige gets a story beat (a rival chain buying you out).

## Files
- `index.html`: the whole game (CSS, markup, JS).
- `fonts/`: Silkscreen (headings; "Silk"; canvas labels use `SilkC`, a copy without the digit override), Pixelify Sans (body, buttons, money; "Pix") and Jersey 10, OFL, self-hosted. **Both pixel fonts have unreadable digits** (owner couldn't tell 4 from 9), so the `@font-face` rules split by `unicode-range`: digits, £, %, . , / + × come from Jersey 10 inside both "Pix" and "Silk". All faces are loaded up front so the canvas has them.
- `README.md`: player-facing.

## How it's built
- **Stage:** a fixed 480×270 `#stage` scaled to fit (`fit()`). The scene is a 480×270 canvas of `fillRect` pixel art (`R()`); the room is cached in `ROOM` (`buildRoom()`, garage → unit after 1 sale → warehouse after 5). UI panels are DOM over it. Never draw numbers on the canvas at small sizes (owner found them unreadable): counts are DOM tags (`#qTag`, `#hTag`).
- **Layout:** top: till (cash, ⚙ parts, ⭐ stars), goal bar (`GOALS`, one line each, keep texts short), tools (help, album, sound, music, save, fullscreen). Left: Box shop (`BOXES`, ×1/×5/×10 + Bulk Buy sizes, 🚚 corner picks the van's box, at most 6 rows: the priciest unlocked + the next locked) and the All upgrades button. Right: finds tray (`TRAY` = 9) and "Your business" (rows open the matching upgrades tab). Bench: queue stack (left), mat with the box, empties heap + baler (right), staff row + conveyor + machines (bottom), sorter, dog, shop shelves on the wall, van outside the window.
- **No controller support** (owner removed it: too buggy). Keyboard: Space act, B buy, S sell all, J sell junk, U upgrades, C album, E grab the mystery van, X bin empties, arrows move focus, Esc closes.
- **Modals:** fit the screen (`.modal>.panel` is a flex column, only `.scroll` scrolls), ✕ top-right, click the backdrop or Esc to close. No bottom close buttons.
- **Upgrades screen** (`#upModal`, owner: everything in one place, nothing opened by clicking bench objects): tabs Hands / Shop / Staff / Van / Machines / Stars (`TABS`, `u.g`), one row per upgrade, sized so each tab fits without scrolling (Stars scrolls, 2 columns). Sorter rules sit in the Van tab. There is no Quick buy (owner removed it); `quickPicks()` is still used by the Accountant and the sim.
- **Core vs visuals:** the economy is a headless core (`coreTick`, `rollBox`, `gain`, `autoOpen`, `buyBoxes`, `sortOne`, `shelfTick`, `eventsTick`, `sellBusiness`) shared by the game and the sim bot; visuals go through the `FX` hooks (no-ops when `SIM`). The core runs on real time; big gaps are caught up in 1s steps (`catchUp`): full rate while the tab is hidden, half rate offline up to 8h (receipt modal).
- **Boxes:** parcel £5, envelope £40, sack £300, luggage £2.5k, crate £20k, storage £200k (after 1 sale), haunted £2M (3 sales), pallet £10M (7 sales; 12–36 boxes inside), Mystery Vault £1T (9 sales, hand only, ends with credits). Each opens differently (`kind`, `cutLine()`, a `draw*` per kind). Unlocking needs opened counts of the previous box, sometimes sales, and a cash licence (`lic`, bought by clicking the row). Item values are calibrated per box so the average is `ev` × price at base luck (`RM`, `LUCKX`).
- **Never broke:** a free ♻️ Old cardboard row is always at the top of the shop (`SCRAP`, not in `BOXES`). It drops a sheet on the mat; cutting it pays `SCRAP_PAY` 50p, no item, no empty. No free postie parcels and no buying by clicking the mat (owner found both weird); boxes are only bought in the shop.
- **Shop dog** (`dog`, `drawDog`): wanders along the front of the bench (`DOGY`, `DOGX`), drawn after the box and staff so it's never hidden (owner); stays to the sides while a box is on the mat, trots over to sniff new boxes, hops at rare finds, barks at epics, naps when idle.
- **Finds:** tray items `{i,m}` (m: ×1.2 by hand, ×2 special). Click → pop-up: sell / shelve / album / scrap for parts. Shelves earn 0.4%/s and sell at full value (0.8%/s chance). 19 album sets with bonuses (`SETS`), 5 relics (rule changers, kept forever), cursed haunted items with shelf effects (`CURSED`).
- **Automation:** staff (`staffRate`, ×1.5 at 10/25/40, cap 3+3×conveyor), training tiers, van (auto-buy), sorter (auto-sell by `S.rules`), baler (auto-bin), accountant (auto-upgrade), machines bought with parts (slicer, arm, spinner). Empties: every opened box adds one to the heap; a full heap stops all opening; click it to bin.
- **Prestige:** stars = floor((run earnings ÷ £10M)^0.4 × 1.15^Big name). Every star ever = +1% value. Star upgrades in four groups (Head starts, Boosts, Keep, plus the Unlocks list).
- **Events:** mystery van (click within 8s), car boot (shelves 3× for 60s), customs auction, lucky hour. Banners say "Bonus event: …".
- **Save:** localStorage `boxHunter.v1` (v3 shape, `migrate()` upgrades phase-1 saves), backup on load, read-only if another tab writes, BH1: export/import codes in the 💾 modal.
- `#debug` skips the title and exposes `window.BH` (incl. `BH.sim(hours,{verbose:1})`).

## Balance
`BH.sim(14)` plays the whole game headlessly (hand opens every 3s, buys the cheapest affordable upgrade keeping a reserve, licences at 1.2×, sells the business when the star rate drops). Latest run: first staff ~8 min, first sale ~50 min, all box types ~3.1h, vault ~4h for the bot (≈6h for a person). Targets from the design doc: first sale ~45 min, all boxes ~4h, vault 6–8h.

## Testing
Quick Playwright checks, not a test suite: load at 1920×1080, 1366×768 and 844×390, buy a box, hold on it to cut, wait for the reveal; set a late-game state through `BH.S` and screenshot the bench; open every upgrades tab and check `#upList` scrollHeight ≤ clientHeight (Stars may scroll); check for page errors. Rerun `BH.sim(14)` after any economy change.

## Hosting
Public repo, GitHub Pages serves `main` at the root: https://pillowfishsticks.github.io/box-hunter/
