# Ricochet Sling

**One-line pitch:** Pull back and release a slingshot ball to bank it off rotating mirrors into a glowing target — and you can keep rotating those mirrors in real time, even while the ball is mid-flight.

## The original twist

Most bounce/aiming games are "aim once, watch the physics resolve." Ricochet Sling turns the mirrors themselves into a second, simultaneous input: at any moment — before you fire *or* while the ball is already ricocheting around the field — a quick tap on a mirror flips its angle 90° and instantly redirects the ball's path. That means the skill isn't just picking a good launch angle, it's "juggling" mirror flips in real time to steer a ball you've already let go of, including using two fingers at once (one holding/aiming, one flipping a mirror) since input is tracked per touch point.

## How to play / controls

Touch/pointer only, no keyboard, no mouse-only interactions:

- **Drag to aim & fire:** Touch near the ball (it rests on the cannon at the bottom of the field), drag backward like a slingshot, and lift your finger to launch. Pull distance sets power; pull direction (reversed) sets the launch angle. A dashed aim line previews the shot while dragging. A very short pull (under ~14px) is treated as a cancelled shot — no ball is fired and no attempt is spent.
- **Tap to rotate a mirror:** A quick tap (under ~300ms, minimal finger movement) directly on a blue mirror bar flips it between its two diagonal orientations. This works whether the ball is sitting at the cannon or actively flying — flip mirrors on the fly to redirect a ball already in motion.
- **Restart:** After a game over, tap the on-screen "Restart" button.

Multiple simultaneous touches are supported naturally: each finger is tracked by its own pointer ID, so aiming with one finger while flipping a mirror with another finger both work at the same time.

## Core mechanics

- The ball launches in a straight line (no gravity) and bounces elastically off the three solid walls (left, right, top).
- Mirrors are short reflective bars; hitting one reflects the ball's velocity about the mirror's contact normal and awards +10 score per bounce.
- Red obstacle blocks destroy the shot instantly on contact (counts as a miss).
- The green target is the goal; touching it clears the level. From level 3 onward the target drifts back and forth, and its radius shrinks slightly each level, demanding more precise (and more actively re-aimed) shots.
- Each shot that goes past the bottom edge, hits an obstacle, or bounces around for more than ~7 seconds without resolving is also counted as a miss (prevents stuck/infinite states) and returns the ball to the cannon for another attempt, as long as shots remain.
- Every level draws a new field with more mirrors and (from level 3) more obstacles, generated with simple randomized placement that keeps elements from overlapping the cannon, target, or each other.

## Win / lose conditions

- **Clear a level:** the ball touches the target. Score += 100 + (25 × shots remaining), then a fresh, slightly harder level is generated and the shot count refills.
- **Game over:** you run out of shots (5 per level) without clearing the current level. An overlay shows your final score and the level you reached, with a Restart button that resets everything to level 1.
- There's no upper win state — the loop is endless, scored by how many levels you can clear before running out of shots on one of them.

## Notes for visual polish

This build intentionally uses flat, high-contrast placeholder colors and no animation flourishes:

- Canvas background: `#1c1c26`. Ball: `#f2f2f2` (plain white circle, r=7). Cannon: gray circle `#555`.
- Mirrors: solid blue bars (`#5bc0eb`), drawn with `lineCap: round`, no glow/gradient.
- Target: flat green ring (`#3ddc84` outer disc with a background-colored inner cutout to fake a "ring" look) — a real polish pass could turn this into a proper glowing beacon/animated pulse to sell "this is the goal."
- Obstacles: flat red rectangles (`#e63946`) — could use hazard stripes or a warning icon.
- Aim-line preview: yellow dashed line (`#ffd23f`) from the ball — could be upgraded with a tapering/gradient trail.
- HUD (`#hud`, top row of level/score/shots) and the `#howto` instructional text are plain monospace text with no icons — a polish pass could add icons for shots-remaining (e.g. pips/balls) instead of a text counter.
- `#message` (transient "Blocked!" / "Missed!" / "Level Clear!" text) currently just fades in/out with opacity — could get a proper pop/shake animation.
- `#overlay` (game-over screen) is a flat dark scrim with plain text and a yellow button (`#restartBtn`) — no confetti/particle treatment yet.
- The canvas is sized dynamically at runtime by `resizeCanvas()` to fit within the viewport (accounting for the HUD/message/howto text heights) so it never overflows short phone screens — any visual pass that changes HUD/message/howto element heights should keep this function's `reserved` height calculation in sync, or the canvas may be sized incorrectly.
- Internal game resolution is a fixed 400×620 logical coordinate space (`W`, `H` constants at the top of the script); all drawing and collision math happens in these units regardless of the actual on-screen pixel size.

## Visual Design

Direction: a minimalist **"neon laser lab on deep navy"** aesthetic — a restrained dark palette with a few saturated accent hues that read as glowing energy, so the target, mirrors, and ball each own a distinct color role. Presentation-only pass; no mechanics, controls, physics, or win/lose logic were touched.

### Palette

- Background: deep navy radial gradient, `#141b31` → `#0a0e1a` (page uses a matching `#1a2140`/`#12182b`/`#0a0e1a` radial), with a faint cyan grid (`rgba(86,209,224,0.05)`) drawn on the canvas for spatial depth.
- Mirrors (reflect + interact): cyan `#56d1e0` with a soft glow and a near-white inner highlight.
- Target (goal): emerald `#4ee89e`, drawn as a glowing pulsing aura ring + core disc + inner cutout + bright center pip (the pulse/aura are cosmetic; collision still uses the unchanged `target.r`).
- Ball / slingshot / aim: warm amber `#ffcf5c` / `#fff6e0` — glowing ball core, amber dashed trajectory guide, translucent sling band from finger to ball, and a fading amber motion trail.
- Obstacles (hazard): coral `#ff6b6b` rounded blocks with clipped diagonal hazard stripes and a soft red glow.
- Text: near-white `#e8ecf6` with muted `#7c86a3` for secondary copy.

### Typography

- System sans stack (`-apple-system, "Segoe UI", Roboto, system-ui`) for instructional/overlay copy — clean and zero network cost.
- System monospace stack (`ui-monospace, "SF Mono", Menlo, Consolas`) for the HUD "readout" pills and score/stats, giving a control-panel feel. No web fonts loaded.

### Motion / juice (all cosmetic, logic-untouched)

- HUD restyled into three bordered pill panels with uppercase micro-labels over large values.
- Pulsing target aura, glow (`shadowBlur`) on target/mirrors/ball/aim line.
- Lightweight particle bursts on mirror bounce (cyan), obstacle hit (coral), and level clear (emerald), plus a decaying screen-shake on those same events (applied via a canvas `ctx.translate`, so the fixed 400×620 coordinate space is unchanged).
- Amber ball motion trail; transient message text now pops/scales in; game-over overlay gained a blurred scrim, emerald glowing title, and a cyan gradient Restart button.
- No new element heights break `resizeCanvas()` — it still measures HUD/message/howto `offsetHeight` at runtime.

### Constraints kept

- Single self-contained `index.html`, zero external/CDN dependencies, works offline.
- Touch-only, no hover-dependent affordances added; all interactions remain pointer/tap driven.

### Inspiration sources

- itch.io — "Picking the Perfect Color Palette for Your Game" (https://itch.io/blog/1039646/picking-the-perfect-color-palette-for-your-game)
- Piktochart — "The Best 15 Gaming Color Palette Combinations" (https://piktochart.com/blog/gaming-color-palette/) — neon-on-dark, teal/violet base with warm warning accents.

## Difficulty Tuning

Pacing-only pass. No mechanics, controls, physics, or win/lose logic were touched — only the numeric constants inside `generateLevel(lvl)` that shape how each new field escalates. Global knobs (ball speed range, pull limits, 5 shots/level, flight timeout, score values) were intentionally left unchanged.

### Goal of the curve

A few-minute session: the first couple of levels must be genuinely forgiving (learn the sling + mirror-flip loop), then difficulty should rise smoothly with **one new source of pressure introduced per level** rather than several at once, reaching a "hard but fair" ceiling around **level 7–9** (roughly 1.5–2.5 minutes at ~15–20s per level) and continuing a gentle, near-plateaued climb afterward so long runs still challenge skilled players.

### The main problem fixed

Previously **level 3 was a spike**: the target began oscillating (`lvl >= 3`, amplitude already 32), the first obstacle appeared, and the radius shrank — three new difficulty sources landing on the same level. The target also started shrinking on level 1 (never shown at full size), and mirror count jumped on level 2. The new schedule staggers these so each early level adds exactly one new thing.

### Introduction cadence (new)

- **L1** — baseline: full-size static target (r≈26), 2 mirrors, no obstacles, no movement.
- **L2** — only a subtle target shrink; still static, still 2 mirrors, no obstacles.
- **L3** — first obstacle appears (1); target still static.
- **L4** — target begins moving, but with a gentle amplitude (16px) and slow speed.
- **L5+** — amplitude, obstacle count, mirror count, and shrink all ramp smoothly and cap out.

### Formula changes (old → new)

| Knob | Old | New |
|------|-----|-----|
| Target radius | `max(15, 26 − lvl·1.3)` (L1 = 24.7, floor ≈ L9) | `max(15, 26 − (lvl−1)·1.2)` (L1 = 26 full, floor ≈ L11) |
| Target moving | `lvl >= 3` | `lvl >= 4` |
| Oscillation amplitude | `min(20 + lvl·4, 110)` (32 the instant it turns on) | `moving ? min(16 + (lvl−4)·9, 100) : 0` (starts at 16, caps 100) |
| Target speed | `0.5 + lvl·0.05` | `0.45 + lvl·0.045` (slightly gentler) |
| Mirror count | `min(2 + ⌊lvl/2⌋, 7)` (3 by L2) | `min(2 + ⌊(lvl−1)/2⌋, 7)` (3 by L3) |
| Obstacle count | `lvl>=3 ? min(⌊(lvl−2)/2⌋+1, 4) : 0` (spike alongside movement) | `lvl>=3 ? min(⌊(lvl−3)/2⌋+1, 4) : 0` (1 obstacle at L3 before movement) |

### Resulting curve (simulated trace)

```
L1  r=26.0  static        amp=0   mir=2  obs=0
L2  r=24.8  static        amp=0   mir=2  obs=0
L3  r=23.6  static        amp=0   mir=3  obs=1
L4  r=22.4  moving spd=.63 amp=16  mir=3  obs=1
L5  r=21.2  moving spd=.68 amp=25  mir=4  obs=2
L6  r=20.0  moving spd=.72 amp=34  mir=4  obs=2
L7  r=18.8  moving spd=.77 amp=43  mir=5  obs=3
L8  r=17.6  moving spd=.81 amp=52  mir=5  obs=3
L9  r=16.4  moving spd=.85 amp=61  mir=6  obs=4  (obstacles capped)
L10 r=15.2  moving spd=.90 amp=70  mir=6  obs=4
L11 r=15.0  moving spd=.95 amp=79  mir=7  obs=4  (radius + mirrors capped)
```

Caps are respected (`MAX_MIRRORS=7`, `MAX_OBSTACLES=4`, `TARGET_MIN_RADIUS=15`) and no value overshoots. Placement margin stays safe: at max amplitude (100) the target center is constrained to `[130, 270]`, so its full swing (`±100`) stays within the `0–400` field. No timers/resets were altered, so no risk of stuck states or division-by-zero.

## Assets

Promotional thumbnails live in `thumbnails/` as three fixed web-ready PNG sizes, all 16:9 and downsampled from a single 1280×720 master (identical framing at every size):

| File               | Dimensions   | Intended web use                                                                 |
|---------------------|--------------|-----------------------------------------------------------------------------------|
| `thumb-small.png`  | 320 × 180 px | Compact rows in a games list / index page, sidebar links                          |
| `thumb-medium.png` | 640 × 360 px | Grid/card layout tiles on a games gallery page (the default "cover image")        |
| `thumb-large.png`  | 1280 × 720 px| Hero banner on the game's own page; also works directly as an Open Graph / Twitter Card social-preview image |

These are original poster-style illustrations inspired by the game's concept and palette — not screenshots of gameplay. The artwork depicts an amber slingshot ball caught mid-flight with a glowing motion trail, its traveled path banking off cyan glowing mirror bars and a dashed amber trajectory guide continuing into the emerald pulsing target, with a coral hazard-striped obstacle below, all on the game's deep-navy "neon laser lab" gridded background, using the real CSS palette (`#56d1e0` cyan, `#4ee89e` emerald, `#ffcf5c` amber, `#ff6b6b` coral, `#0a0e1a`/`#141b31` navy).
