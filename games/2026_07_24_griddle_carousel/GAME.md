# Griddle Carousel

**One-line pitch:** Spin a rotating pantry wheel to line up the right ingredient with a fixed pickup arrow, stack them in order, and serve customers before their ticket timer runs out.

## The original twist

Instead of dragging ingredients directly onto a plate (classic cooking-game mechanic) or matching tiles, the ingredients live on a carousel-style wheel that the player physically spins with a drag/flick gesture — like turning a dial or a lazy Susan. A single fixed "pickup arrow" sits above the wheel; whatever ingredient happens to be rotated into alignment with it is the only one you can grab. This turns ingredient selection into a rotational-aiming and timing puzzle (search the wheel, spin it into place, grab), layered on top of a standard sequence-matching/time-pressure cooking loop. The wheel also has real inertia — flick it and it keeps spinning and decelerating — so players can throw it toward a distant ingredient rather than slowly dragging all the way around.

## How to play / controls

All controls are pointer-based (`pointerdown`/`pointermove`/`pointerup`), so touch and mouse work identically:

- **Spin the wheel:** press and drag anywhere inside the wheel; the wheel rotates to track your finger/cursor angle around the center. Release while moving to flick it — it keeps spinning and gradually slows down (inertia + friction).
- **Grab an ingredient:** tap the orange arrow button fixed just above the wheel. Whichever ingredient is currently aligned with the arrow gets grabbed.
- **Serve:** once your stack (shown in the "Your stack" tray) exactly matches the order ticket at the top, a SERVE button appears — tap it to complete the order.
- **Start / Restart:** a start screen with instructions and a "Start Shift" button is shown before play; a game-over screen with a "Try Again" button appears after the shift ends.

## Core mechanics

- One **order ticket** (the "current" customer) is active at a time, showing a required sequence of ingredient icons (always starts with a top bun, ends with a bottom bun, with 0–3 random fillings in between depending on difficulty level).
- Grabbing the ingredient that matches the *next* required slot in the recipe appends it to your stack. Grabbing the wrong one **resets your stack to empty** (no life lost, but you lose time and your combo streak).
- The current order has a countdown timer (shown as a shrinking, color-shifting bar: green → yellow → red). If it hits zero, you **lose a life**, the order is discarded, and the next customer from the queue (if any) becomes current.
- While one order is current, up to `QUEUE_MAX` additional customers can be waiting in a FIFO queue (shown as a simple count, "Next up: N"); their timers only start once they become the current order.
- New customers join the queue periodically as long as there's room.
- Successful serves add to your score (based on recipe length, remaining time fraction, and a combo counter that resets on any mistake), increment a serve counter, and every `SERVES_PER_LEVEL` serves the difficulty **levels up**: recipes get longer (up to a cap), the timer budget shrinks (down to a floor), spawn rate quickens slightly, and the wheel is reshuffled into a new random arrangement.
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

**Resulting curve** (recipe length still `min(2 + (level−1), 5)`; level-up every 3 serves):

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

These are original poster-style illustrations inspired by the game's concept and palette (espresso-brown room with a soft mustard glow, a shaded lazy-Susan ingredient wheel with a glowing aligned segment, the mustard pickup "clamp" above it, and a cream paper order ticket, titled in the Georgia display face) — not screenshots of actual gameplay.

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
