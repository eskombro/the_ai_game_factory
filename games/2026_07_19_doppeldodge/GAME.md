# Doppeldodge

**One-line pitch:** Dodge falling gates with your dot while your mirror-image echo, on the other side of a shared divider, has to dodge a completely different set of gates at the same time.

## The original twist

Most dodge/reflex games give you one avatar and one obstacle course. Doppeldodge gives you **one input and two avatars**: the dot you actually control (left lane), and an "echo" dot (right lane) that is a *true mirror reflection* of your dot across the center divider — exactly like a reflection in glass. When you push right, both your dot and its reflection move toward the mirror line; when you push left, they both move away from it.

The catch: the two lanes are **not** mirror images of each other. Each lane spawns its own independent, randomly-generated stream of gated obstacles. So a movement that threads your dot safely through a gap on the left can walk your reflection straight into a wall on the right. You're not just dodging obstacles — you're solving a live two-body positioning puzzle with a single one-dimensional control.

## How to play / controls

- **Press and hold the red dot itself** (touch or mouse down, within the dot's radius plus a small touch-friendly padding) to start or resume play. While held, drag left/right to move your dot (left lane, red) directly to your finger's/cursor's x position (1:1 positional tracking), exactly as before — you can drag anywhere on screen once the hold has validly begun on the dot, that's how you relocate it.
- **Releasing pauses the game immediately**: gate falling, spawning, the difficulty ramp, and collision checks all freeze in place, and a dim "press the red dot to play" overlay appears over the (still visible) frozen game state. Pressing back down on the dot resumes exactly where it left off. Pressing down anywhere that *isn't* the dot does nothing — the run stays paused.
- **Space** or **Enter**: start the game from the ready screen, or restart after game over. (The press-and-hold-the-ball pause mechanic only applies once a run is in progress; it does not affect the ready screen or the game-over screen.)
- The echo dot (right lane, blue) is never controlled directly — it always mirrors your dot's position across the yellow dashed divider line.

## Core mechanics

- Two side-by-side lanes share one canvas, split by a dashed vertical "mirror" line.
- Horizontal "gates" (bars with a single gap) spawn at the top of each lane independently and fall downward at a shared speed.
- Your dot's position in the left lane is set directly by input. The echo's position in the right lane is always `laneWidth - yourPosition`, i.e. a mathematical reflection.
- Each lane's gates are generated with their own random timer and random gap position/width — the two streams are uncorrelated.
- Passing a gate (in either lane) scores a point per gate, so a single "wave" of two gates can be worth up to 2 points.
- **Difficulty escalation:** gate fall speed, spawn interval, and gap width all ramp together over the first ~90 seconds of a run (fall speed from 100 up to a cap of 420 px/s; spawn interval shrinking from 1.9s down to a floor of 0.62s; gap width narrowing from a wide 85–120px range down to a tighter 54–80px range), then hold steady, so gates come faster, closer together, and require tighter positioning the longer you survive, up to a "hard but fair" ceiling reached about a minute and a half in. See "Difficulty Tuning" below for the full ramp formula and reasoning.
- Gate gap width is randomized between a (difficulty-scaled) minimum and maximum each time a gate spawns, so there's some variance from gate to gate, but every gap is always passable in isolation (the minimum never drops below the dot's diameter plus a comfortable margin).

## Win / lose conditions

- **No win condition** — this is an endless high-score survival game. The goal is to rack up the highest score before losing.
- **Lose condition:** if either the controlled dot or the mirrored echo dot touches the solid part of a gate (i.e., is not lined up with that gate's gap when it reaches the dot's height), the run ends immediately — a hit on *either* lane ends the game, since you can't choose to save one and sacrifice the other.
- High score is saved to `localStorage` (`doppeldodge_high_score`) and persists across sessions in the same browser.
- Restart is available immediately from the game-over overlay (button or Space/Enter).

## Notes for visual polish

This build is intentionally undecorated — mechanics only. Things a future styling pass should know:

- The whole game renders on a single `<canvas id="game">` at a fixed logical resolution of 500x600, scaled responsively via CSS (`width: 100%; height: auto`). Any HiDPI/`devicePixelRatio` crispening would need to touch the canvas setup code at the top of the script.
- Current placeholder palette: left lane background `#2b2b34`, right lane background `#242430`, gates `#7a7a88`, controlled dot `#e05a5a` (red), echo dot `#5a9de0` (blue), divider line `#ffd166` dashed. These are purely functional colors chosen for contrast/legibility, not a designed palette.
- No animations, particles, screen shake, or transitions exist yet — collisions, scoring, and state changes are instant. This is a natural place for polish (impact flash on death, gate-pass pulse, smoother overlay transitions, etc.).
- The two on-screen touch buttons (`#btnLeft` / `#btnRight`, ids in `#touchControls`) are plain gray rectangles and are currently always visible even on desktop — a polish pass could hide them on non-touch devices or restyle them to feel more like game controls.
- Overlays (`#readyOverlay`, `#gameOverOverlay`) are basic centered dark boxes; typography, spacing, and button styling are all default/minimal.
- The "mirror" concept is currently only communicated via the dashed yellow line and the subtitle text — a visual pass could reinforce the mirror metaphor more strongly (e.g. actual reflection/glass shader effect, symmetric lighting, etc.).

## Visual Design

A presentation-only restyle pass (no gameplay/logic changes) was applied on top of the original placeholder build.

**Palette** — still built around the original functional hues (so the red/blue = controlled/echo dot mapping stays instantly legible), but tuned into a cohesive dark-arcade scheme:
- Background page: deep near-black radial vignette (`#08080b` → `#101016` → `#202030`).
- Left lane: warm dark tint gradient (`#1c1c26` → `#2a2230`), brightening toward the divider.
- Right lane: cool dark tint gradient (`#232c3a` → `#171720`), brightening toward the divider — a literal mirror image of the left lane's lighting.
- Controlled dot: `#ff5d6c` (red) with a soft glow.
- Echo dot: `#5ac8ff` (blue) with a soft glow.
- Divider ("mirror seam"): `#ffd166` dashed line with a warm glow and a slow dash-offset drift over time.
- Gates: neutral slate `#7d7d90` with a subtle top bevel highlight and a brief glow pulse when a gate is passed.

**Typography** — system font stack only (`-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif`) for body text, and the monospace system stack (`SFMono-Regular, Consolas, "Courier New", monospace`) for the HUD score/best numbers, for a digital-readout feel. No web fonts are loaded, keeping the file fully offline/self-contained.

**Motion & juice** (cosmetic only, does not touch scoring/collision/timing logic):
- Score/best numbers glow-tinted; gate-pass triggers a brief synchronized glow pulse on the gates and both dots.
- Divider line has a slow animated dash-offset for a subtle "shimmer" and a soft mirror-sheen gradient straddling it.
- Death triggers a brief screen-shake on the game area plus a quick red screen-flash before the game-over overlay fades in.
- Overlays (ready / game-over) fade and scale in/out instead of snapping instantly; buttons and touch controls have hover/press feedback.
- Canvas renders at device pixel ratio for crisp edges on HiDPI/Retina screens (logical 500×600 coordinate space is unchanged, so no gameplay math was touched).
- On-screen touch controls are now circular "physical button" style and are hidden automatically on devices with a mouse/trackpad (`@media (hover: hover) and (pointer: fine)`), keeping them only where they're actually needed.

**Inspiration / references** used to guide the direction (limited dark palette + a single saturated accent color, generous spacing, restrained CSS-only motion instead of imagery/libraries):
- [Dark UI design inspiration and examples — Super Dev Resources](https://superdevresources.com/dark-ui-inspiration/)
- [Game UI Color Palette guide (contrast, layering, dark environments) — ColorArchive](https://colorarchive.org/guides/game-ui-color-palette/)
- [Game Juice CSS snippets — chr15m.github.io](https://chr15m.github.io/juice-it/)
- [CSS Animations for Game Juice — Chris McCormick](https://mccormick.cx/news/entries/css-animations-for-game-juice)

## Difficulty Tuning

A balance-only pass retuned the pacing constants and ramp formula in `index.html`'s `update()` function. No mechanics, controls, scoring, or win/lose logic were touched — only the numbers/formulas that control how fast the game gets hard.

**Diagnosis of the original curve:**
- `fallSpeed = min(420, 150 + elapsed*6)` hit its cap at **t ≈ 45s**, and `spawnInterval = max(0.62, 1.35 - elapsed*0.012)` hit its floor at **t ≈ 61s**. Both ramps were fully maxed out well under a minute in, which is too fast for a "hard-but-fair ceiling around 1-3 minutes" target — a new player would face endgame-level pressure before they'd even fully learned the mirroring mechanic.
- At `t=0` the base values (150px/s fall speed, 1.35s spawn interval) already produced roughly 3 gates visible in each lane simultaneously with only ~3.5s of reaction time per gate — playable, but busier than an ideal "genuinely easy" opening for a game whose core challenge (reading two independent lanes through one input) is already cognitively nontrivial from the first second.
- Gate gap width (`MIN_GAP`/`MAX_GAP`, 68–105px) was **never scaled by elapsed time** — it was randomized within the same wide, generous range for the entire run. That meant all of the late-game difficulty came from speed and spawn density; the actual "threading the needle" precision required never increased, so a skilled player's spatial challenge plateaued early even while everything else kept accelerating.

**Changes made (old → new):**

| Constant | Old | New | Purpose |
|---|---|---|---|
| `BASE_FALL_SPEED` | 150 | 130 | Slower opening gate fall, more reaction time to learn the mirroring mechanic |
| `MAX_FALL_SPEED` | 420 | 420 (unchanged) | Ceiling was already fair relative to `MOVE_SPEED`; kept as-is |
| `BASE_SPAWN_INTERVAL` | 1.35s | 1.6s | More breathing room between gates at the very start |
| `MIN_SPAWN_INTERVAL` | 0.62s | 0.62s (unchanged) | Floor density at max difficulty was already reasonable |
| `MIN_GAP` / `MAX_GAP` | 68 / 105 (constant for whole run) | Renamed `GAP_START_MIN` / `GAP_START_MAX` = 68 / 105 (used at t=0) | Early-game gap width unchanged — start stays spatially forgiving |
| *(new)* `GAP_END_MIN` / `GAP_END_MAX` | n/a | 54 / 80 | Late-game gap width — tighter, but still 30px wider than the 24px dot diameter, so every gap remains passable |
| *(new)* `DIFFICULTY_RAMP_TIME` | n/a (ramp had no unified endpoint; fall speed and spawn rate capped at different times, ~45s and ~61s) | 90s | Single ramp-completion time for fall speed, spawn rate, and gap width together |

**New ramp formula:** all three axes now share one normalized progress value, `rampT = min(1, elapsed / 90)`, and interpolate linearly from their start value to their end value as `rampT` goes 0→1 (a capped linear ramp, same style as the original, just re-tuned and extended to a third axis):
```
fallSpeed     = BASE_FALL_SPEED + (MAX_FALL_SPEED - BASE_FALL_SPEED) * rampT
spawnInterval = BASE_SPAWN_INTERVAL - (BASE_SPAWN_INTERVAL - MIN_SPAWN_INTERVAL) * rampT
gapMin        = GAP_START_MIN - (GAP_START_MIN - GAP_END_MIN) * rampT
gapMax        = GAP_START_MAX - (GAP_START_MAX - GAP_END_MAX) * rampT
```
All three reach their end value together at `elapsed = 90s` and hold flat (plateau) after that, so skilled players on long runs still get a consistent, maxed-out challenge without the game continuing to escalate indefinitely.

**Simulated trace (reaction time = time from gate spawn to reaching the dot's row; concurrency = roughly how many gates are visible in one lane at once):**

| t | fallSpeed | spawnInterval | gap range | reaction time | concurrency/lane |
|---|---|---|---|---|---|
| 0s | 130 px/s | 1.60s | 68–105px | 4.14s | ~3.1 |
| 15s | 178 px/s | 1.44s | 66–101px | 3.02s | ~2.5 |
| 30s | 227 px/s | 1.27s | 63–97px | 2.37s | ~2.2 |
| 60s | 323 px/s | 0.95s | 59–88px | 1.66s | ~2.1 |
| 90s (ceiling) | 420 px/s | 0.62s | 54–80px | 1.28s | ~2.5 |
| 120s+ | 420 px/s (plateau) | 0.62s (plateau) | 54–80px (plateau) | 1.28s | ~2.5 |

At the ceiling, full-width lane traversal takes ~0.71s (`226px / 320px/s MOVE_SPEED`), comfortably inside the 1.28s reaction window, so the endgame stays "hard but fair" rather than requiring superhuman reflexes — consistent with the original ceiling design, just reached at a better pace (~90s instead of ~45–61s) and with an added precision axis (tighter gaps) so difficulty doesn't come from raw speed/density alone.

### Further opening-difficulty reduction

A follow-up request asked for an even gentler start. Only the *start* values were eased further — the ceiling (`MAX_FALL_SPEED`, `MIN_SPAWN_INTERVAL`, `GAP_END_MIN/MAX`) and the ramp shape/timing are unchanged, so the endgame still plays exactly as tuned above.

| Constant | Previous | New |
|---|---|---|
| `BASE_FALL_SPEED` | 130 px/s | 100 px/s |
| `BASE_SPAWN_INTERVAL` | 1.6s | 1.9s |
| `GAP_START_MIN` / `GAP_START_MAX` | 68 / 105px | 85 / 120px |

At `t=0` this drops reaction time from ~4.14s to roughly ~5.4s and eases lane occupancy to ~2.2 concurrent gates, making the first several seconds noticeably calmer while the ramp still reaches the same 90s ceiling.

### Second opening-difficulty reduction

A further request asked for the start to be *slightly* less demanding again. As before, only the start-of-run values and the initial spawn-delay timers were touched — the ceiling (`MAX_FALL_SPEED`, `MIN_SPAWN_INTERVAL`, `GAP_END_MIN/MAX`) and `DIFFICULTY_RAMP_TIME` (90s) are unchanged, so the ramp still reaches the identical "hard but fair" endgame at the same pace; only how gentle the first several seconds feel was adjusted.

| Constant | Previous | New |
|---|---|---|
| `BASE_FALL_SPEED` | 100 px/s | 90 px/s |
| `BASE_SPAWN_INTERVAL` | 1.9s | 2.1s |
| `GAP_START_MIN` / `GAP_START_MAX` | 85 / 120px | 92 / 128px |
| `leftSpawnTimer` (initial, in `resetGame()`) | 0.4s | 0.6s |
| `rightSpawnTimer` (initial, in `resetGame()`) | 0.9s | 1.1s |

At `t=0` this drops the effective fall speed by 10% (reaction time from first spawn to reaching the dot's row rises from ~5.4s to ~6.0s), widens the starting gap range by ~7px on each end, adds ~0.2s more breathing room between spawns, and delays the very first gate in each lane by an extra 0.2s so a brand-new player gets a beat to get oriented before anything appears. Spawn-interval-to-crossing-time ratio (rough on-screen gate concurrency, ~2.8 gates/lane) is essentially unchanged, so the lane doesn't feel emptier or busier — just slower and more spacious. The ramp formula, ramp duration, and every ceiling constant are untouched, so difficulty from ~90s onward plays identically to the previous tuning pass.

### Follow-up polish pass (echo trail + specular highlight)

A small, focused follow-up pass added two purely cosmetic touches on top of the above, still without touching collision/scoring/timing logic:
- **Echo trail**: the last ~10 frames of the echo (blue) dot's position are kept in a small in-memory array and redrawn each frame as faint, shrinking, un-glowing ghost circles behind the current echo dot (radius and alpha both fade with age). This gives the right lane a literal "trailing reflection" look and reinforces the echo/mirror theme beyond just color-coding, at negligible render cost (a handful of extra `arc()` fills, no persistent canvas buffer or extra memory beyond one short array).
- **Specular highlight**: both dots got a small, low-opacity white highlight circle offset toward the upper-left, giving them a touch of glassy/bead-like depth instead of flat filled circles.
- Inspiration for the trail treatment: canvas-based motion-trail/ghosting techniques as discussed in [Trail Effect in Canvas Animation (CodePen)](https://codepen.io/depy/pen/amoXGB) and [Creating Motion Trails and Ghosting Effects — Palos Publishing](https://palospublishing.com/creating-motion-trails-and-ghosting-effects/), adapted here to a simple position-history array rather than a persistent fading canvas buffer, to keep the implementation tiny and dependency-free.

## Edit Log

- **2026-07-19**: Added a drag/touch-anywhere control for mobile: pointerdown+drag on the canvas now sets the controlled dot's x position directly to the touch point (1:1 tracking), routed into the existing `uLeft` state alongside (not replacing) keyboard and the hold-buttons. Coordinate mapping accounts for the canvas's responsive CSS scaling via `getBoundingClientRect()`. No changes to collision, scoring, difficulty ramp, mirroring math, or visual styling.
- **2026-07-19**: Removed the old movement controls now that drag-to-position is proven out: deleted the Arrow/A-D keyboard hold-to-move handling (`keyDown`/`keyUp` velocity branches, `holdLeft`/`holdRight` state, the `blur` reset listener, and the now-unused `MOVE_SPEED` constant) and the on-screen ◄/► touch buttons (`#btnLeft`/`#btnRight`, their `#touchControls` container markup and CSS, and `bindHoldButton`). Drag/pointer control (unchanged) is now the game's only movement input; `update()`'s movement step simplified to just `if (dragActive) uLeft = dragX`, relying on `resetGame()`'s existing `uLeft = LANE_W / 2` for the pre-drag resting position. Space/Enter start-restart handling was kept as-is.
- **2026-07-19**: Added a "press-and-hold-the-ball" gameplay twist: `pointerdown` on the canvas now only starts a drag (and thus only sets `dragActive = true`) if it hit-tests within `DOT_R + BALL_HIT_PAD` of the controlled dot's actual position (new `canvasLogicalY` helper alongside the existing `canvasLogicalX`); missing the dot, or releasing (`pointerup`/`pointercancel`), leaves/sets `dragActive = false`. `dragActive` now also gates `update()` itself via a single early-return guard at its top, so gate spawning/falling, the difficulty ramp, timers, and collision checks all freeze while the ball isn't held (state and rendering hold still). A new semi-transparent `#pauseOverlay` (`rgba(0,0,0,0.55)`, no blur, `pointer-events: none`) shows "Press and hold the red dot to play. Release to pause." whenever `state === STATE_PLAYING && !dragActive`, kept visually distinct from the opaque `#readyOverlay`/`#gameOverOverlay` `.overlay` styling; a new `syncPauseOverlay()` helper toggles it from the drag handlers and from `startGame()`/`endGame()`. Every run now starts paused (dot sits still) until the player's first valid press-and-hold on the ball; the ready and game-over flows/overlays are untouched.
- **2026-07-19 (bug fix)**: Fixed a CSS specificity bug that kept `#pauseOverlay` visible even while the dot was being held. `#pauseOverlay { display: flex; ... }` (an ID selector, specificity 1,0,0) was overriding `.hidden { display: none; }` (a class selector, specificity 0,1,0) regardless of which class was toggled, so `syncPauseOverlay()`'s existing (and already-correct) `.hidden` toggling never actually hid the overlay. Added `#pauseOverlay.hidden { display: none; }` to give the hidden state sufficient specificity to win, mirroring the same pattern already used for `.overlay.hidden`. No JS or behavior logic changed — this restores the intended behavior from the previous entry.
- **2026-07-19 (tuning)**: Widened the left/right initial spawn-timer stagger slightly: `rightSpawnTimer` in `resetGame()` changed from `1.1` to `1.15` (`leftSpawnTimer` unchanged at `0.6`), moving the left/right gate-spawn gap from 0.5s to 0.55s. Kept intentionally modest and below `MIN_SPAWN_INTERVAL` (0.62s) so the offset never approaches the late-game spawn-interval floor. No other spawn/ramp/fall-speed/gap constants touched.

## Assets

Promotional thumbnails live in `thumbnails/`:

| File | Dimensions | Intended use |
|---|---|---|
| `thumbnails/thumb-small.png` | 320 x 180 px | Compact rows in a games list / index page, sidebar links |
| `thumbnails/thumb-medium.png` | 640 x 360 px | Grid/card layout tiles on a games gallery page (the default "cover image") |
| `thumbnails/thumb-large.png` | 1280 x 720 px | Hero banner on the game's own page; also works directly as an Open Graph / Twitter Card social-preview image |

These are original illustrations inspired by the game's mirror/reflection concept and its actual in-game palette (warm/cool lane gradients, red controlled dot, blue echo dot, amber dashed divider), not screenshots of gameplay.
