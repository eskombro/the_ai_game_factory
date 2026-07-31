# Hangwire

**One-line pitch:** Drag falling weights onto a swaying hanging mobile and make each beam balance to clear it — before the wire strain snaps.

## The original twist

Balance/lever puzzles usually appear as static algebra ("what weight makes this mobile level?"). Hangwire turns torque into a **real-time clearing mechanic**: a beam holding two or more weights that balances (net torque within tolerance) *chimes and empties itself* for points, freeing its hooks. So balance is not the win state you preserve — it is the move you spend, and the more weights you can hold in an unbalanced state before resolving them, the bigger the payout.

On top of that sits a second, global constraint: the two beams hang from a **shared root beam**, so their *total* masses must also stay roughly equal. Clearing a beam instantly makes its half weightless and yanks the whole mobile lopsided, which means every clear creates the next problem. Local balance and global balance pull against each other.

## How to play (touch controls)

Everything is a single drag gesture, wired with unified **pointer events** (`pointerdown` / `pointermove` / `pointerup` / `pointercancel`) on the canvas, so touch and mouse behave identically. No keyboard is used or needed anywhere.

- **Start screen** — a tap/click on the big `START` button begins play (`#startBtn`).
- **Drag the incoming weight** from the holder (lower-left circle) onto any empty hook. A green ring previews the hook it will snap to.
- **Drag a hung weight** to another empty hook to rearrange the mobile (free, but costs time).
- **Drag a hung weight into empty space** to jettison it (+6% strain).
- **Release with no free hook nearby**: an incoming weight simply snaps back to the holder with no penalty.
- **Game over screen** — tap `PLAY AGAIN` (`#againBtn`) to restart immediately.

## Core mechanics

- The mobile: a root beam with two child beams. Each child beam has 4 hooks at offsets `-3, -1, +1, +3` (labelled ×3 / ×1 on screen).
- **Beam torque** = Σ (weight × hook offset). It is printed under each beam and drives that beam's visible tilt.
- **Clear rule**: any beam with ≥ 2 weights whose |torque| ≤ `TOL` (1) clears all its weights.
  - Score = `sum of weights × number of weights × 10`, ×1.5 if the torque is exactly 0 ("PERFECT").
  - So bigger stacks are worth much more — but holding an unbalanced stack bleeds strain.
- **Wire strain** (top bar, 0–100%):
  - each beam adds up to `0.12/s` scaled by `(|torque| − 1) / 12`;
  - the root adds up to `0.12/s` scaled by `(|massLeft − massRight| − 3) / 9`;
  - if *nothing* is over its deadzone, strain drains at `0.12/s`.
- **Incoming weights**: one at a time in the holder with a countdown bar (7.2s at level 1, −0.4s per level, floor 3.2s). Its timer pauses while it is being dragged. The next weight is previewed to its left.
- **Difficulty ramp**: level = 1 + ⌊clears / 4⌋. Each level shortens the holder countdown and widens the weight range (`1..min(8, 3+level)`), so exact 1:3 and 1:1 pairings get harder to spot under less time.

## Win / lose

There is no win state — it is an endless score chase. Two ways to lose:

1. **Wire strain reaches 100%** → "THE WIRE SNAPPED".
2. **4 weights time out in the holder** → "TOO MANY DROPPED WEIGHTS". (Every 5 beams cleared refunds one drop, so skilled play can sustain a long run.)

Both routes show the final score, beams cleared, level and best score, plus a `PLAY AGAIN` button.

## Notes for visual polish

- **Everything gameplay-related is drawn on one full-screen `<canvas id="cv">`**; only the HUD (`#hud`, `#score`, `#lvl`, `#strainBar`, `#dropCount`) and the two overlay screens (`#startScreen`, `#overScreen`) are DOM.
- Layout constants live in `computeLayout()` (object `L`): `L.rootX/rootY` (root pivot), `L.rootArm`, `L.string`, `L.u` (hook spacing unit), `L.podR`, `L.podDrop`, `L.holdX/holdY` (holder), `L.nextX/nextY` (next-weight preview), `L.snap` (drop snap radius). Changing art should go through these rather than hard-coded numbers.
- Current placeholder palette: background `#14171c`, beams `#6c7a8b` (turn `#c9683f` when over tolerance, `#8de0b0` for ~0.5s after a clear), strings `#3b444f`, hung weights `#8fa6c4`, the carried/incoming weight `#d8a25a`, positive popups `#8de0b0`, penalties `#d98060`, strain bar blue→amber→red.
- Deliberately unstyled but functional feedback that is worth keeping legible: the per-beam torque number under each beam, the ×3/×1 hook labels, the holder countdown bar, and the green snap-preview ring while dragging. These are the game's only teaching signals.
- There is intentional empty space in the middle of the screen — it is the drag corridor between the holder and the mobile. Safe to decorate, but keep it visually quiet.
- **Bottom-right corner is deliberately empty** (holder sits at x ≈ 38% of width) so `play.html`'s rating widget never covers a control. Please keep it clear.
- Nice polish targets that need no mechanic changes: a swing/wobble easing on beams (already eased in `updatePositions`), a chime flash on clear (`beam.flash`), a rope-snap effect on game over, and a shake when a weight is dropped.

## Visual Design

**Direction:** "engineering blueprint / suspended mechanism" — a quiet dark instrument-panel background with a faint drafting grid, letting the beams, wires and weight pods read as the literal mechanism under test. Kept to CSS + canvas only; no images, no network fonts, no libraries.

- **Background:** the canvas itself no longer paints a solid fill (`ctx.clearRect` only) — the page background shows through, a static, zero-per-frame-cost `body` CSS layering two very low-alpha corner glows (amber top-left, mint bottom-right) over a repeating-linear-gradient hairline grid on `#0d1015`. This reads as a blueprint/schematic without any per-frame drawing cost.
- **Palette (`PAL` object in JS, mirrored in CSS):**
  - Base: `#0d1015` background, `#eef1f6` text.
  - Structure (calm): wires/strings `#4a5566`, beams `#8791a1`.
  - Hot/imbalanced: beams & torque readout `#e2703f` / `#e2795a`.
  - Clear/success: mint `#6fe3ab` (beam flash glow, popups, PLAY buttons).
  - Weight pods: radial-gradient fill interpolated per-pod from cool slate `#7c93b8` (light weights) to warm copper `#c98a52` (heavy weights) — a free, non-mechanic-changing readability cue layered on top of the existing printed number. Carried/incoming weight stays a consistent warm gold `#e8a94f` so it's always recognizable mid-drag.
  - Wire strain bar: blue `#5b8dd6` → amber `#e0a63c` → red `#e2543f`, now with a pulsing red glow (`#strainWrap.danger`) past 75%.
  - Popups: mint for gains, coral `#e2795a` for penalties.
- **Typography:** system font stack only (no web fonts). Added `letter-spacing` and `tabular-nums`/`font-variant-numeric` to the score, level and strain-label HUD text so digits don't jitter in width; the start-screen title got wider tracking plus a soft amber `text-shadow` glow.
- **Layout:** untouched — all changes route through the existing `L`/`computeLayout()` constants per the notes above; no positions, hit-radii, or hook math were touched.
- **Juice added (cosmetic only, no logic/input changes):**
  - Radial-gradient shading on every weight pod for subtle depth.
  - A soft glow (`shadowBlur`) on a beam during its post-clear flash.
  - Popup text now pops in with a quick scale-down tween instead of appearing at fixed size.
  - A brief CSS-only screen shake (`#wrap.shake`) on a jettisoned weight and on a holder timeout, and a stronger shake (`#wrap.shake-big`) on any game over.
  - A ~0.7s "rope-snap" render effect (`G.snapFx`) exclusively for the wire-strain-triggered ending: the ceiling wire visibly breaks apart with a widening gap and slight sag, plus a brief red screen flash, before the game-over overlay fades in. The drop-based ending only gets the shake, since the wire didn't literally snap.
  - Start/game-over overlays now cross-fade (`opacity` transition) instead of hard `display:none` toggling.
- **Verified with:** Playwright + a locally installed headless Chromium (`npx playwright install chromium`, since the sandboxed snap Chromium on this box wouldn't launch). Scripted pointer drags confirmed weight placement, beam clears, jettisoning, wire-strain ramp-up, the new wire-snap visual, and the restart flow all still work with zero console/page errors after the restyle.
- **Inspiration / sources:** general minimalist-game-UI research (flat, limited-palette, geometric aesthetics used by games like *Monument Valley*/*GRIS*) — see [Minimalist Game Art guide](https://pixune.com/blog/minimalist-game-art-guide/) and [Flat UI Colors palettes](https://flatuicolors.com/) for the flat/limited-palette direction that informed keeping the palette to five or six purposeful hues rather than decorative ones.

## Difficulty Tuning

**Diagnosis of the original curve:** the level formula, holder timer and weight range were already reasonably paced (`level = 1 + ⌊clears/4⌋`, gated on clears rather than wall-clock time, so slower players naturally get a slower ramp — good). But two things undercut the "genuinely easy start" goal:
- The weight range opened at `1..4` and the wire-strain formulas divided by fixed spans (`12` for beam torque, `9` for root mass diff) that were sized for the *endgame* weight cap of 8. At level 1 a single unlucky drop (e.g. a 4 on the outer `×3` hook, torque 12) already sat at ~92% of the beam's maximum strain rate, and one lopsided beam (4 weights × 4 = 16 mass on one side) already *saturated* the root-imbalance rate at 100% — i.e. the global-balance pressure was already at full endgame severity on a brand-new player's very first moves.
- Level-ups landed in coarse 4-clear chunks, so the ramp felt like a handful of discrete jumps rather than a smooth climb.

**Changes made (all in the `index.html` script, constants/formulas only — no mechanics, controls, or win/lose rules touched):**

| Constant / formula | Old | New |
|---|---|---|
| Holder countdown `podLife(level)` | `max(3.2, 7.2 − (level−1)×0.4)` | `max(3.4, 7.6 − (level−1)×0.35)` |
| Weight range `weightMax(level)` | `min(8, 3 + level)` | `min(8, 2 + level)` |
| Level formula | `1 + ⌊clears / 4⌋` | `1 + ⌊clears / 3⌋` (smaller, more frequent steps) |
| Beam-strain span (torque-over-tolerance needed for the full 0.12/s rate) | `12` (implicit) | `20` (named `BEAM_STRAIN_SPAN`) |
| Root-strain span (mass-diff-over-deadzone needed for the full 0.12/s rate) | `9` (implicit) | `20` (named `ROOT_STRAIN_SPAN`) |

Everything else — `TOL`, `ROOT_DEAD`, the 0.12/s strain-rate ceilings themselves, `STRAIN_RECOVER`, `DROP_PENALTY`, `JETTISON_PENALTY`, `MAX_DROPS`, `REFUND_EVERY`, `SPAWN_GAP` — is unchanged. At the weight cap (level 6+, range 1..8) the strain-span change is a no-op: `(24−1)/20` and `(32−3)/20` both still clamp to 1, so the *worst-case* danger ceiling a skilled player eventually faces is identical to before. The spans only soften how quickly that ceiling is reached while the weight range is still small.

**Reasoning / traced curve** (using clears as the driver, plus a rough ~3.75s-per-clear pace to translate into wall-clock time for a competent-but-learning player):

| Clears | Level | Holder timer | Weight range | Beam-strain worst case | ~elapsed |
|---|---|---|---|---|---|
| 0 | 1 | 7.6s | 1–3 | 0.048/s (40% of ceiling) | 0s |
| 6 | 3 | 6.9s | 1–5 | 0.084/s (70%) | ~23s |
| 15 | 6 | 5.85s | 1–8 (cap reached) | 0.12/s (100%, ceiling) | ~56s |
| 24 | 9 | 4.8s | 1–8 | 0.12/s | ~90s |
| 36 | 13 | 3.4s (floor reached) | 1–8 | 0.12/s | ~135s |
| 45+ | 16+ | 3.4s (plateau) | 1–8 (plateau) | 0.12/s (plateau) | ~169s+ |

This gives: a first ~20-30s where a new player can drop a single weight in the wrong place without meaningfully threatening the wire (worst-case strain rate is well under half the ceiling, and only three low, easy-to-mentally-add weight values are in play — including the exact `1 far out / 3 close in` pairing the game-over tip already teaches); a continuous climb through the first minute as the weight range fills out to its full 1–8 spread and the danger ceiling is reached; and continued tightening of the time pressure (holder countdown) out to roughly the 2–2.5 minute mark, after which the game is fully plateaued (weight range, strain-rate ceiling, and holder timer all capped) so long runs stay challenging without getting harder forever.

Verified with a headless Playwright pass (Chromium): confirmed zero console/page errors through the start screen, an idle first-weight timeout (drop registers at ~8.3s in, matching `spawnTimer(0.7s) + podLife(7.6s)` at level 1, with strain rising by the expected 12% and then draining at the expected 0.12/s once idle), and re-derived the table above by running the exact `podLife`/`weightMax`/strain-span formulas from the file in isolation to sanity-check the level-6 weight cap and level-13 timer floor land where intended.

## Assets

Promotional thumbnails live in `thumbnails/`:

| File               | Dimensions   | Intended web use                                                                 |
|---------------------|--------------|-----------------------------------------------------------------------------------|
| `thumb-small.png`  | 320 × 180 px | Compact rows in a games list / index page, sidebar links                          |
| `thumb-medium.png` | 640 × 360 px | Grid/card layout tiles on a games gallery page (the default "cover image")        |
| `thumb-large.png`  | 1280 × 720 px| Hero banner on the game's own page; also works directly as an Open Graph / Twitter Card social-preview image |

These are original illustrations inspired by the game's concept and palette (a balanced mint-lit beam beside an imbalanced, torque-tilted amber/orange beam, on the blueprint-grid background), not screenshots of actual gameplay.

## Pipeline Token Usage

| Stage | Model | Tokens |
|---|---|---|
| game-creator | opus | 62,286 |
| game-polisher | sonnet | 77,312 |
| game-balancer | sonnet | 57,898 |
| game-qa | sonnet | 142,028 |
| game-thumbnailer | sonnet | 33,489 |
| game-describer | sonnet | 20,350 |
| **Total (subagent stages)** | | **393,363** |

*Producer's own orchestration tokens aren't included above — they aren't observable from within its own execution, only each subagent call's reported usage is.*

*Note: an earlier, accidentally-duplicated game-creator invocation (which produced a discarded "Pivot Haul" prototype from a stray background task launch, deleted before any other stage ran) is not included in this table since its output was never part of this game.*
