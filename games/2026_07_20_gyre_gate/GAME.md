# Gyre Gate

**One-line pitch:** Spin a stack of concentric rings with your fingers to keep each one's rotating gap open under a fixed marker before a falling ball reaches it.

## The original twist

Most "dodge the gap" games move the falling object or the whole obstacle sideways. Gyre Gate instead keeps the ball's path perfectly fixed (straight down through the center of a target) and makes the *obstacles themselves rotate continuously and independently*, each on its own clock. The player doesn't dodge — they actively re-time and re-aim several spinning "locks" at once, using one drag gesture per ring, while a steady stream of balls forces them to keep juggling all the rings in parallel. It's part reflex game, part multi-object spatial memory/attention game (like literally keeping several spinning plates aligned), which doesn't overlap with any of the sibling games' mechanics (no shared-input mirroring, no hold-to-charge, no multi-touch triage sliders, no memory-sequence banking, no drag-to-resize, no ripple pushes).

## How to play / controls (touch only)

- The playfield is a set of concentric rings around a center point. Each ring has one open "gate" (a gap in its circle) and spins slowly and continuously, clockwise or counter-clockwise depending on the ring.
- A yellow tick mark at the top of the outer ring shows the fixed **check point** — this is where every ball must find an open gate as it falls straight down through the rings toward the center.
- **Touch and drag along a ring** (put your finger near that ring's circle and swipe left/right/around) to spin it manually. The ring rotates to match your finger's angular motion in real time. Release, and the ring resumes spinning on its own from wherever you left it.
- **Multi-touch:** put down more than one finger at once to control several rings simultaneously — this is often required once multiple balls are falling.
- **Tap the on-screen button** to start the game and to retry after a game over. No keyboard or mouse-only interaction exists anywhere in the game.

## Core mechanics

- Balls spawn periodically at the top of the screen and fall straight down at a steady (increasing) speed along the vertical line through the center.
- As a ball's falling distance-from-center crosses each ring's radius (outer ring first, then progressively inner rings), the game checks whether that ring's gate currently covers the top check-point angle (with a small forgiveness window).
  - If the gate is open there: the ball passes through and continues falling toward the next ring.
  - If the gate is closed there: the ball is destroyed and the player loses one life.
- A ball that clears every ring and reaches the center scores one point.
- Rings keep auto-rotating at all times (unless a finger is actively holding/dragging that specific ring), so a gate that was open a second ago may have drifted shut by the time the next ball arrives — the player must keep re-checking and re-aiming every ring, not just set-and-forget.
- Difficulty escalates continuously over the session: balls fall faster, spawn more frequently, gates narrow, and rings spin faster over time, via a smooth shared ramp that starts easy and eases into a hard-but-fair plateau after ~100 seconds (see "Difficulty Tuning" below for the exact curve).

## Win / lose conditions

- The player starts with 3 lives. Each ball that hits a closed gate costs one life.
- The game ends when lives reach 0; the final score (number of balls that reached the center) is shown along with a retry button.
- There is no explicit "win" state — it's an endless high-score arcade loop, matching the style of the other games in this collection.

## Notes for visual polish

- Everything is rendered on a single `<canvas id="game">` in flat placeholder colors: background `#111`, rings `#5588cc` (or `#66ff99` while actively grabbed by a finger), ball `#ff5566`, top check-point marker `#ffcc55`, center dot `#333`.
- HUD (score/lives) is plain white text in a `<div id="hud">` fixed to the top corners — no icons yet, just text labels ("Score: N" / "Lives: N"). Consider heart icons for lives, a more game-y numeral font, and a subtler HUD background/shadow.
- The `<div id="overlay">` (start screen and game-over screen) is currently a flat semi-transparent black box with plain text and a single flat blue button (`#4da6ff`). Title, body copy, score readout, and button (`#startBtn`) are all separate elements that can be restyled independently. The overlay text also changes ("Gyre Gate" / "Tap to Start" → "Sealed Shut" / "Tap to Retry"), so any redesign should account for both states.
- Rings are drawn as thick (`10px`) flat-colored arcs with a hard-edged gap — there's a lot of room for glow/gradient/particle treatment on the gate edges, a trail/glow on the falling ball, a satisfying flash/shake on life loss, and a burst effect when a ball scores at the center.
- The grabbed-ring color change (`#5588cc` → `#66ff99`) is the only current feedback that a ring is being actively controlled; a future pass could add a highlight ring, glow, or finger-follow indicator instead of a flat color swap.
- Layout is fully responsive via a `resize` handler that recomputes ring radii from `Math.min(window.innerWidth, window.innerHeight)`, so it already adapts to different phone sizes — polish should preserve that responsiveness rather than hardcoding pixel positions.

## Visual Design

**Direction:** minimalist "arcade lock" aesthetic — a near-black vignette backdrop, thin neon-glow rings on a cool cyan-to-violet gradient, and warm gold/coral accents reserved for the two things the player must track (the fixed check-point marker and the falling ball). Inspired by dark-base-plus-limited-neon-accent conventions common in minimalist arcade/game-jam UI (deep near-black or navy base with 2-4 saturated accent colors used sparingly for interactive/alert elements, CRT-glow-style `shadowBlur` halos on moving/important shapes, and tabular-numeral HUD chips for fast legibility) — see sources below.

- **Palette:**
  - Background: radial vignette from `#141b2e` (center) to `#05070c` (edges), redrawn each frame behind the rings for depth without any image asset.
  - Rings: each ring gets a distinct hue along a fixed cyan → blue → violet gradient (`hsl(195…295, 85%, 62%)`, outer ring cyan, innermost ring violet) with a soft `shadowBlur` glow instead of a flat stroke, so the stack reads as concentric "energy" bands rather than plain arcs.
  - Grabbed-ring feedback: replaced the flat green swap with a brighter mint (`#6dffc4`) plus a stronger glow radius — same semantic color family as before, refined into a clearer glow-based "actively held" cue per the original polish notes.
  - Check-point marker: warm gold (`#ffd166`) with a glow, doubling as the palette's primary accent (also used for the score chip and the title/button gradient) so the player's eye is trained to associate gold with "the target line."
  - Ball: coral-red (`#ff6b6b`) with a glow and a short fading motion-trail line, making its fall path and speed easier to read at a glance.
  - Text: off-white `#eef2fb` primary, muted slate `#7f8bad` secondary/body copy.
- **Typography:** system font stack (`-apple-system, "Segoe UI", Roboto,` etc.) — no network font loads. Title uses a gold-to-mint gradient fill with letter-spacing for a "game-y" wordmark feel; HUD numerals use `tabular-nums` inside small pill-shaped glass chips (`backdrop-filter: blur`) instead of bare text, and lives are shown as a row of dot glyphs (filled = remaining, dimmed/grayscale = lost) instead of a "Lives: N" string.
- **Motion/juice (cosmetic only, no gameplay-affecting state):** a brief screen-shake and full-screen red radial flash on losing a life; a small mint particle burst plus a soft blip tone when a ball scores at the center; a low buzz tone on life loss. All of this is driven by new presentation-only variables (`particles`, `shakeTime`/`shakeMag`, a Web Audio `beep()` helper) that are only ever read inside `draw()`/CSS and never influence `update()`'s collision/scoring math — `update()` itself was left byte-for-byte identical to the pre-polish version.
- **Layout:** unchanged responsive `resize`/`layoutRings` logic; HUD chips and overlay panel use flexible padding/percentage-based positioning so the redesign still adapts across phone sizes.
- **Inspiration sources:**
  - [Game UI Color Palette: Designing for High Contrast, Fast Reading, and Dark Environments — ColorArchive](https://colorarchive.org/guides/game-ui-color-palette/)
  - [Gaming Color Palette Combinations: Top 22 Picks + Hex — media.io](https://www.media.io/color-palette/gaming-color-palette.html)
  - [Gaming Color Palettes: Best Picks — Design Your Way](https://www.designyourway.net/blog/gaming-color-palettes/)

## Difficulty Tuning

**Problem with the placeholder pacing:** all four difficulty stats (`currentFallSpeed`, `currentSpawnInterval`, `currentGateHalfWidth`, `currentSpin`) ramped *linearly* with `elapsed` seconds and were simply clamped at their min/max. That meant a constant slope from the very first frame (no gentle "learn the controls" window) and a hard corner in the curve at the moment each stat hit its cap — full difficulty arrived as early as ~65-72s in, then flatlined instantly.

**New approach — shared smoothstep ramp:** all four stats now ease from their base value to their ceiling value together, driven by one shared progress curve:

```js
var DIFFICULTY_RAMP_TIME = 100; // seconds to reach ~full difficulty
function difficultyProgress() {
  var p = clamp(elapsed / DIFFICULTY_RAMP_TIME, 0, 1);
  return p * p * (3 - 2 * p); // smoothstep: zero slope at p=0 and p=1
}
currentFallSpeed()      = BASE_FALL_SPEED + (MAX_FALL_SPEED - BASE_FALL_SPEED) * difficultyProgress()
currentSpawnInterval()  = BASE_SPAWN_INTERVAL - (BASE_SPAWN_INTERVAL - MIN_SPAWN_INTERVAL) * difficultyProgress()
currentGateHalfWidth()  = BASE_GATE_HALF_WIDTH - (BASE_GATE_HALF_WIDTH - MIN_GATE_HALF_WIDTH) * difficultyProgress()
currentSpin()           = BASE_SPIN + (MAX_SPIN - BASE_SPIN) * difficultyProgress()
```

Smoothstep's zero derivative at both ends of the 0-100s window gives an imperceptibly slow start (genuinely easy opening, matching the "learn the controls" goal), a steady pickup through the middle of the run, and an easing-in to the plateau at the ceiling with no jarring corner — instead of the old shape's abrupt full-speed-then-flat transition.

**Base/ceiling values (endpoints unchanged from the placeholder pass — only the ramp shape and timing changed, so the overall difficulty band is the same, just reached more smoothly):**

| Stat | Base (t=0) | Ceiling (t≈100s) |
|---|---|---|
| Fall speed | 85 px/s | 230 px/s |
| Spawn interval | 2.3 s | 1.0 s |
| Gate width (total) | ~71° | ~39° |
| Auto-spin speed | ~20°/s | ~66°/s |

**Simulated trace under the new curve** (progress %, then derived values):

| t | progress | fall speed | spawn interval | gate width | spin speed |
|---|---|---|---|---|---|
| 0s | 0% | 85 px/s | 2.30 s | 71.0° | 20.1°/s |
| 15s | 6% | 94 px/s | 2.22 s | 69.1° | 22.8°/s |
| 30s | 22% | 116 px/s | 2.02 s | 64.1° | 30.0°/s |
| 60s | 65% | 179 px/s | 1.46 s | 50.3° | 49.8°/s |
| 90s | 97% | 226 px/s | 1.04 s | 39.9° | 64.6°/s |
| 100s+ | 100% (plateau) | 230 px/s | 1.00 s | 39.0° | 65.9°/s |

Reading of the curve: the first 15-30s stay very close to base values (a real "easy start" window to learn the drag-to-spin gesture on one ring before juggling several), the middle of the run (30-90s) ramps up continuously and smoothly, the hard-but-fair ceiling is reached by ~1m40s (within the target 1-3 minute window), and every stat then plateaus at its ceiling so longer runs stay challenging without spiraling into an unfair/impossible state. `DIFFICULTY_RAMP_TIME` is the single knob to retime the whole curve (larger = longer/gentler session, smaller = faster ramp) without touching any of the four base/ceiling values.

**Old vs. new key constants:**

| Constant | Old (linear + hard clamp) | New (smoothstep) |
|---|---|---|
| Fall speed ramp | `FALL_SPEED_RAMP = 2.0 px/s per second` (capped ~72.5s) | shared `DIFFICULTY_RAMP_TIME = 100s` smoothstep to `MAX_FALL_SPEED` |
| Spawn interval ramp | `SPAWN_RAMP = 0.02 s per second` (capped ~65s) | shared smoothstep to `MIN_SPAWN_INTERVAL` |
| Gate width ramp | `GATE_RAMP = 0.004 per second` (capped ~70s) | shared smoothstep to `MIN_GATE_HALF_WIDTH` |
| Spin speed ramp | `SPIN_RAMP = 0.012 per second` (capped ~66.7s) | shared smoothstep to `MAX_SPIN` |

No mechanics, controls, visuals, or win/lose conditions were changed — only the four `BASE_*_RAMP` constants were removed and replaced by the single `DIFFICULTY_RAMP_TIME` constant plus the shared `difficultyProgress()` helper that the four `current*()` functions now read from.

## Assets

Promotional thumbnails generated for this game (in `thumbnails/`):

| File               | Dimensions   | Intended web use                                                                 |
|---------------------|--------------|-----------------------------------------------------------------------------------|
| `thumb-small.png`  | 320 × 180 px | Compact rows in a games list / index page, sidebar links                          |
| `thumb-medium.png` | 640 × 360 px | Grid/card layout tiles on a games gallery page (the default "cover image")        |
| `thumb-large.png`  | 1280 × 720 px| Hero banner on the game's own page; also works directly as an Open Graph / Twitter Card social-preview image |

These are original illustrations inspired by the game's concept and palette (concentric cyan-to-violet gates, a gold checkpoint marker, and a coral falling ball, one gate shown mint-highlighted as "actively held") rather than screenshots of the running game.
