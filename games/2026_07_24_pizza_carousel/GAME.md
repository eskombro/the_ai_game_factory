# Pizza Carousel

**One-line pitch:** Spin a rotating topping wheel to line up the right pizza ingredient with a fixed pickup arrow, build each pie on its crust in the order the ticket demands, and serve customers before their ticket timer runs out.

## The original twist

Instead of dragging ingredients directly onto a plate (classic cooking-game mechanic) or matching tiles, the ingredients live on a carousel-style wheel that the player physically spins with a drag/flick gesture — like turning a dial or a lazy Susan. A single fixed "pickup arrow" sits above the wheel; whatever ingredient happens to be rotated into alignment with it is the only one you can grab. This turns ingredient selection into a rotational-aiming and timing puzzle (search the wheel, spin it into place, grab), layered on top of a standard sequence-matching/time-pressure cooking loop. The wheel also has real inertia — flick it and it keeps spinning and decelerating — so players can throw it toward a distant ingredient rather than slowly dragging all the way around.

## How to play / controls

All controls are pointer-based (`pointerdown`/`pointermove`/`pointerup`), so touch and mouse work identically:

- **Spin the wheel:** press and drag anywhere inside the wheel; the wheel rotates to track your finger/cursor angle around the center. Release while moving to flick it — it keeps spinning and gradually slows down (inertia + friction).
- **Grab an ingredient:** tap the orange arrow button fixed just above the wheel. Whichever topping (or the crust) is currently aligned with the arrow gets grabbed.
- **Serve:** once your stack (shown in the "Your stack" tray) exactly matches the order ticket at the top, a SERVE button appears — tap it to complete the order.
- **Start / Restart:** a start screen with instructions and a "Start Shift" button is shown before play; a game-over screen with a "Try Again" button appears after the shift ends.

## Core mechanics

- One **order ticket** (the "current" customer) is active at a time, showing a required sequence of ingredient icons. Every recipe has exactly **one fixed anchor ingredient — the crust — always first**; every remaining slot (1 to 4 of them, depending on difficulty level) is a topping drawn fully at random, both in *which* toppings appear and in what *order* they appear. There is no second fixed or positional ingredient anywhere in the recipe — unlike the game's original "always ends with the same bottom piece" version, only the crust is ever guaranteed.
- Grabbing the ingredient that matches the *next* required slot in the recipe appends it to your stack. Grabbing the wrong one **resets your stack to empty** (no life lost, but you lose time and your combo streak).
- The current order has a countdown timer (shown as a shrinking, color-shifting bar: green → yellow → red). If it hits zero, you **lose a life**, the order is discarded, and the next customer from the queue (if any) becomes current.
- While one order is current, up to `QUEUE_MAX` additional customers can be waiting in a FIFO queue (shown as a simple count, "Next up: N"); their timers only start once they become the current order.
- New customers join the queue periodically as long as there's room.
- Successful serves add to your score (based on recipe length, remaining time fraction, and a combo counter that resets on any mistake), increment a serve counter, and every `SERVES_PER_LEVEL` serves the difficulty **levels up**: recipes get longer (up to a cap), the timer budget shrinks (down to a floor), spawn rate quickens slightly, and the wheel is reshuffled into a new random arrangement. Level 1 is a special case: it promotes to level 2 after just `SERVES_TO_LEAVE_LEVEL_1` serves (2, instead of the usual 3). This was originally added because level 1's recipe length (2) used to mean "crust + one *fixed* bottom piece" — a single unavoidable combination. Recipes are now crust + fully-random toppings instead, so even a length-2 order already varies (5 possible toppings); the faster level-1 promotion is kept as-is regardless (recipe-length/level-up pacing is a separate, unrelated tuning concern), it's just no longer strictly load-bearing for ticket variety the way it originally was. Every level from 2 onward still uses the normal `SERVES_PER_LEVEL` cadence.
- The wheel always guarantees at least one of each ingredient type is present after every shuffle, so no required ingredient is ever unreachable.

## Win/lose conditions

- There is no fixed "win" state — it's a high-score endless shift. The game ends when **lives reach 0** (starting lives: 3, lost only when an order's timer expires).
- Final score and best score (persisted in `localStorage`) are shown on the game-over screen, with a one-tap restart.

## Notes for visual polish

- All rendering is on a single full-viewport `<canvas id="gameCanvas">`; there is no DOM-based HUD during gameplay (score/lives/level header, order ticket, dish tray, wheel, pickup arrow are all canvas-drawn each frame inside `draw()`).
- Start screen (`#startScreen`) and game-over screen (`#gameOverScreen`) are plain DOM overlays with a dark translucent background, default sans-serif type, and a single flat orange (`#e8a33d`) button — very placeholder, ripe for real branding/typography.
- Ingredient icons are flat colored primitives (circle/square/diamond) with a single letter label (`B`/`P`/`C`/`L`/`T`/`b`) instead of real food art — this is the biggest opportunity for visual polish (real burger-part illustrations or sprites would read much better than shape+letter).
- Current placeholder palette: background `#2b2b2b`/`#333`, ticket/dish panels `#3d3d3d`, accent/action color `#e8a33d`, success green `#7cd67c`/`#6fbf6f`, warning yellow `#e0c04a`, danger red `#e05a4a`/`#e74c3c`.
- The pickup arrow is a simple filled circle + triangle; could become a much more characterful "chef's hand" or clamp graphic.
- No animation/juice yet beyond flat color flashes (green on successful grab/serve, red on mistake) and a plain progress bar — spin motion itself has physical inertia already, but squash/stretch, particle bursts on serve, and a more tactile wheel (e.g. drop shadow, rim highlight, click-stop feel between segments) would all help.
- Layout is computed proportionally from `window.innerWidth/innerHeight` in the `layout()` function (returns header/ticket/dish/wheel region rects) — any visual redesign should keep reading from/adjusting that function rather than hardcoding pixel values, so it stays responsive across phone sizes.

## Visual Design

Direction: a warm, cozy "short-order diner" look — an espresso-brown room lit by a soft mustard glow, with cream paper "order tickets" and glossy, plated ingredients. Kept fully single-file, offline, and lightweight (no images, no web fonts, no libraries) — all art is canvas/CSS primitives.

**Palette**
- Background: espresso gradient `#2c2119` → `#1f1712` with a radial mustard glow behind the wheel.
- Panels (order ticket / stack tray): warm dark `#33271f` with rounded corners, soft drop shadows, and a 1px inner highlight; the start/game-over instruction card is a cream "receipt" (`#fbf3e3`→`#efe0c6`, ink text `#3a2c20`) with a dashed-separator list and an "ORDER TICKET" header.
- Accent / actions (arrow button, SERVE, score, combo): mustard `#f0a43a` → `#d0851f`.
- Text: cream `#f5ead6`, muted tan `#b39b86`, faint `#8a745f`.
- Feedback: success green `#8fce6d`, warning yellow `#e8c14a`, danger red/tomato `#e0603f`. Ingredient hues kept semantically (bun tan, patty brown, cheese yellow, lettuce/tomato greens & red) but rendered with radial shading + rim gloss for depth.

**Typography**
- Display (title, score value, final score, combo): Georgia serif stack — evokes a printed menu/receipt.
- UI/labels/body: `system-ui` sans stack, uppercase micro-labels with letter-spacing for a tidy ticket feel. No network font loads.

**Wheel & pickup**
- The carousel is now a shaded "lazy-Susan" plate: radial-gradient face, raised rim, recessed center hub, faint segment tick lines, and a drop shadow for a tactile, physical feel.
- The segment currently aligned with the arrow gets a glowing mustard ring + slight upscale so the grab target reads instantly.
- The pickup marker became a rounded mustard "clamp" button with a gloss highlight, glow, and a dashed connector down to the plate; it squash-pops on a successful grab.

**Motion / juice (cosmetic only — no logic changes)**
- Particle burst (mustard + green confetti) on a successful serve.
- Screen shake on mistakes and lost lives (decaying world-space offset).
- Squash-pop on grabbed ingredients (both on the clamp and the newest stack item), a subtly pulsing SERVE button, and a blinking timer bar when time is low.
- Lightweight WebAudio blips (initialized on the Start tap): rising triangle chime on serve, soft click on grab, low saw buzz on mistake, square tone on life lost. All wrapped in try/catch and no-ops if WebAudio is unavailable.

Inspiration / sources:
- itch.io "Picking the Perfect Color Palette for Your Game" — https://itch.io/blog/1039646/picking-the-perfect-color-palette-for-your-game
- Warm burger/food flat palettes (ColorsWall / SchemeColor) — https://colorswall.com/palette/156234 and https://www.schemecolor.com/hamburger-illustration-color-palette.php

## Difficulty Tuning

Goal: a genuinely easy opening (a new cook clears simple 2-part orders with lots of spare time), a smooth continuous ramp with no jarring spikes, a "hard but fair" ceiling reached in roughly 1.5–2 minutes, and a gentle plateau afterward so long runs still test skilled players. Only pacing constants and the timer formula changed — mechanics, controls, visuals, and win/lose rules are untouched.

**The core fix — a length-aware order timer.** Previously the order timer was independent of recipe length (`max(9, 20 − 1.2·(level−1))`), so every level-up applied a *double hit*: the recipe gained an ingredient **and** the flat timer shrank at the same moment — a compounding spike, worst exactly when the recipe reached 5 items. The timer is now budgeted per ingredient plus a flat reaction buffer:

```
per      = max(TIME_PER_INGREDIENT_MIN, TIME_PER_INGREDIENT_BASE − (level−1)·TIME_SHRINK_PER_LEVEL)
timeMax  = per · recipeLength + TIME_BUFFER
```

A longer recipe therefore gets proportionally *more* total time, and the only pressure knob that actually escalates is the smooth per-ingredient budget. That converts the difficulty measure players feel — **seconds available per ingredient** — into a clean monotonic descent instead of a saw-tooth.

**Resulting curve** (recipe length still `min(2 + (level−1), 5)`; level-up every 3 serves from level 2 onward, but only 2 serves to leave level 1 — see Core Mechanics):

| Level | Recipe len | Order timer | Sec / ingredient | Spawn interval |
|-------|-----------|-------------|------------------|----------------|
| 1 | 2 | 14.6s | 7.30 | 5.0s |
| 2 | 3 | 18.5s | 6.17 | 4.75s |
| 3 | 4 | 21.8s | 5.45 | 4.5s |
| 4 | 5 | 24.5s | 4.90 | 4.25s |
| 5 | 5 | 23.0s | 4.60 | 4.0s |
| 6 | 5 | 21.5s | 4.30 | 3.75s |
| 7 | 5 | 20.0s | 4.00 | 3.5s |
| 8+ | 5 | 19.0s | 3.80 (floor) | ↓ to 2.6s |

Seconds-per-ingredient falls smoothly from **7.3s → 3.8s** with no step reversals, then plateaus. Estimated wall-clock (assuming ~2.6s of real effort per ingredient): max recipe length (5) is reached around **~80s**, the sub-5s/ingredient "hard but fair" band by **~80–120s**, and the tightest plateau around **~4 min**, after which only the spawn cadence keeps inching up.

**Spawn/queue pacing.** New customers only start their timer once they become the active order, so spawn rate governs breathing room rather than lethality. Base interval was nudged from 4.5s → 5.0s (a touch more early downtime while learning), tightening 0.25s per level toward a 2.6s floor (was 2.2s) so late-game stays busy without becoming a wall.

**Old → new key constants:**

| Constant | Old | New |
|----------|-----|-----|
| Order timer | `TIME_MAX_BASE 20`, `TIME_MAX_MIN 9`, `TIME_SHRINK_PER_LEVEL 1.2` (flat, length-independent) | `TIME_PER_INGREDIENT_BASE 4.8`, `TIME_PER_INGREDIENT_MIN 2.8`, `TIME_SHRINK_PER_LEVEL 0.30`, `TIME_BUFFER 5` (length-aware) |
| `SPAWN_INTERVAL_BASE` | 4.5 | 5.0 |
| Spawn shrink / floor | `−0.25/level`, floor 2.2 | `SPAWN_SHRINK_PER_LEVEL 0.25`, `SPAWN_INTERVAL_MIN 2.6` |
| Recipe length / `SERVES_PER_LEVEL` | `2→5`, 3 | unchanged |
| `WHEEL_FRICTION` | 0.985 | unchanged (spin feel is constant, not an escalation lever) |

## Assets

Promotional thumbnails live in `thumbnails/` as three fixed 16:9 PNG sizes derived from one master illustration:

| File               | Dimensions   | Intended web use                                                                 |
|---------------------|--------------|-----------------------------------------------------------------------------------|
| `thumb-small.png`  | 320 × 180 px | Compact rows in a games list / index page, sidebar links                          |
| `thumb-medium.png` | 640 × 360 px | Grid/card layout tiles on a games gallery page (the default "cover image")        |
| `thumb-large.png`  | 1280 × 720 px| Hero banner on the game's own page; also works directly as an Open Graph / Twitter Card social-preview image |

These are original poster-style illustrations inspired by the game's current pizza-themed concept and palette (espresso-brown backdrop with a soft mustard glow, a shaded topping wheel showing crust, pepperoni, mushroom, olive, basil and jalapeno arranged around a fixed crust hub, the mustard pickup "clamp" arrow glowing above the aligned topping, a cream paper order ticket, and a dish-tray stack, titled "Pizza Carousel" in the Georgia display face) — not screenshots of actual gameplay. Regenerated 2026-07-25 to replace the original burger/griddle-themed artwork after the game's redesign and rename from "Griddle Carousel" to "Pizza Carousel."

## Edit Log

- **2026-07-25** — Bug fixes (game-editor, standalone request, three independent items):
  1. Fixed overlapping UI: the "Combo xN" streak indicator was drawn centered in the wheel area at a y-position that landed directly on/inside the pickup clamp marker on every screen size tested, making both unreadable when a combo was active. Moved it into the dish-tray header row (right-aligned, opposite "YOUR STACK", mirroring the existing ORDER/"Next up: N" pattern in the ticket panel) so it no longer overlaps the marker.
  2. Investigated the "same order ticket repeats within level 1" report. Confirmed via static analysis and a runtime simulation that `spawnCustomer()`/`makeRecipe()` already generate a brand-new, independently-randomized customer object for every single serve (not gated on level-up in any way — verified distinct object identities across consecutive serves). The visually-identical ticket at level 1 is a deterministic side effect of the balance-tuned `RECIPE_MIN_LEN = 2` constant (a length-2 recipe has zero filling slots, so "top bun, bottom bun" is the only mathematically possible sequence at that length) — not a ticket-generation defect. No code change made; see report for details and options if visual variety at level 1 is still wanted.
  3. Fixed case-sensitive ingredient symbol: `bunBottom`'s single-letter label was lowercase `'b'`, while every other ingredient (including `bunTop`'s `'B'`) used uppercase — the only place in the game where case distinguished two otherwise-similar-looking symbols. Changed `bunBottom`'s label to uppercase `'H'` (bottom bun / "heel"), removing the only case-sensitive label in the game while keeping it visually distinct from `bunTop`'s `'B'`.
- **2026-07-25** — Follow-up to item 2 above: rather than touching recipe generation or `RECIPE_MIN_LEN`, made level 1 promote to level 2 faster so its single fixed combination is seen fewer times. Added `SERVES_TO_LEAVE_LEVEL_1 = 2` and a `servesSinceLevelUp` counter (reset on each level-up); the level-up check now uses `SERVES_TO_LEAVE_LEVEL_1` while `level === 1` and falls back to the unchanged `SERVES_PER_LEVEL = 3` for every level after that, so level 1 now takes 2 serves and every level from 2 onward still takes exactly 3, unaffected. Updated the Core Mechanics bullet and the Difficulty Tuning curve caption to describe the level-1 exception.
- **2026-07-25** — Fixed a bug in `shuffleWheel()` where a required ingredient could occasionally be entirely absent from the wheel (making its order impossible to complete). The old "guarantee every ingredient appears" step forced each missing ingredient into an independently-random slot, so a forced insertion could silently overwrite either another forced insertion or the sole existing occurrence of some other, already-present ingredient. Rewrote it to shuffle all slot indices once, hand out the first `INGREDIENTS.length` distinct slots as guaranteed one-per-ingredient placements, and only fill the remaining slots with free random picks — nothing is ever overwritten, so the invariant ("every ingredient appears at least once") holds unconditionally. Verified with a 3,000,000-iteration standalone simulation of the exact new logic (0 failures) after first reproducing the old bug's failure with a smaller repro run.
- **2026-07-25** — Mechanic change (user request, not a bug fix): recipes previously forced *two* fixed pieces (a top bun first, a bottom bun last) with only the middle fillings varying. Redesigned `makeRecipe(len)` so there is exactly **one** fixed anchor ingredient (always first) followed by `len - 1` slots drawn fully at random (identity and order both) from a topping pool — no other positional/fixed rule remains anywhere in the recipe. Since a two-fixed-bun structure no longer made sense with only one anchor, retooled the `INGREDIENTS` roster end-to-end to a coherent pizza theme: `crust` (the anchor) plus five random toppings — `pepperoni`, `mushroom`, `olive`, `basil`, `jalapeno` — each with its own uppercase single-letter label (C/P/M/O/B/J, no case-sensitivity reintroduced), color, and shape, reusing the existing icon-drawing pattern exactly. `FILLINGS` was renamed `TOPPINGS` and is now derived from `INGREDIENTS` itself (`INGREDIENTS.filter(...).map(...)`) rather than hand-duplicated, so the two can't drift out of sync again. Recipe-length logic, the wheel/spin/pickup/serve mechanics, scoring, lives, and all level-up/pacing constants (including the level-1 fast-promotion) are untouched — this only changes what a recipe is built from. Verified by simulating `makeRecipe` for every length 2–5 (0 malformed recipes across 800,000 draws combined, anchor always in position 0, all remaining slots confirmed drawn from the topping pool with the expected count of distinct sequences at each length), and by grepping the whole file to confirm no `bunTop`/`bunBottom`/`patty`/`cheese`/`lettuce`/`tomato`/`FILLINGS` references remain anywhere (rendering, wheel, matching logic, comments). Refreshed `description.json` via `game-describer` since this changes both a core mechanic and the game's visual/food theme. Rewrote the pitch, "How to play," and "Core mechanics" sections above to describe the new one-anchor-plus-toppings system; left the historical "Notes for visual polish," "Visual Design," and earlier Edit Log entries as point-in-time records rather than rewriting them. Note: the game's title ("Griddle Carousel") and overall diner-styling/copy were intentionally left unchanged — that was explicitly out of scope for this request (ingredient identities and recipe generation only) — so there's now a minor residual naming mismatch ("griddle" evokes fried food, not pizza) worth a future look if the game gets a full re-theme.
- **2026-07-25** — Renamed the displayed title from "Griddle Carousel" to "Pizza Carousel," resolving the naming mismatch flagged in the entry directly above (the food-mismatch word "Griddle" was the only thing that needed to go; "Carousel" stayed since it still accurately describes the spinning-wheel mechanic). Changed every user-facing occurrence: `index.html`'s `<title>` and the start-screen `<h1>`, and `GAME.md`'s own H1. The game-over screen doesn't display the title (it just says "Shift Over"), so nothing there needed changing. Confirmed `description.json` never names the game by title, so no refresh was needed for the rename alone. Deliberately left unchanged: the folder name (`games/2026_07_24_griddle_carousel/`, an internal path that the deployed site's thumbnail/game links and Cloudflare KV rating data under the `griddle_carousel` slug depend on) and the `griddleCarouselHighScore` localStorage key (renaming it would silently reset players' saved high scores) — both are internal/technical identifiers, not something a player reads, and were out of scope for this rename.
- **2026-07-25** — Now that there's no real production data yet to protect, superseded the "deliberately left unchanged" note in the entry directly above: renamed the folder from `games/2026_07_24_griddle_carousel/` to `games/2026_07_24_pizza_carousel/` (via `git mv`, keeping the `2026_07_24` creation-date prefix untouched — only the `griddle_carousel` slug segment changed), and renamed the `localStorage` high-score key in `index.html` from `griddleCarouselHighScore` to `pizzaCarouselHighScore` at both its read and write sites. Re-grepped the whole (now-renamed) folder afterward and confirmed zero remaining "griddle" references anywhere outside the historical, dated Edit Log entries above (which correctly stay as point-in-time records of the old name).

## Pipeline Token Usage

| Stage | Model | Tokens |
|---|---|---|
| game-creator | sonnet | not recorded (interrupted run) |
| game-polisher | opus (inherited) | not recorded (interrupted run) |
| game-balancer | opus (inherited) | not recorded (interrupted run) |
| game-qa | opus | 81358 |
| game-thumbnailer | opus (inherited) | 25600 |
| game-describer | opus (inherited) | 33094 |
| **Total (recorded subagent stages)** | | **140052** |

*Producer's own orchestration tokens aren't included above — they aren't observable from within its own execution, only each subagent call's reported usage is. The game-creator/game-polisher/game-balancer stages ran during an earlier session that was interrupted by a monthly spend limit before their token figures were captured, so they are marked "not recorded (interrupted run)". No game-editor/re-verify game-qa pass was needed (QA found no blocking issues).*
