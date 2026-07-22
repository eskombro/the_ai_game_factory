# Pulse Relay

**One-line pitch:** A single-lane rhythm game where every incoming signal demands a *different* touch gesture — tap, swipe, or press-and-hold — so you're reading and reacting to shape, not just timing.

## The original twist

Most rhythm games separate gestures across multiple lanes (one lane = one button/key). Pulse Relay collapses everything into **one lane, one finger** — the challenge isn't "which lane" but "which gesture." Three note shapes scroll down a single transmission line toward a receiver ring, and each shape demands a distinct touch gesture performed at the right instant:

- **Circle** → quick **tap**
- **Arrow** (left/right) → **swipe** in the arrow's direction
- **Bar** → **press and hold** for the bar's full length, releasing exactly as its tail crosses the line

Because gesture type itself is the puzzle (not lane position), the game reads naturally as a single-thumb, one-handed phone experience, and mixing gesture types keeps a single lane from feeling monotonous the way a one-lane tap-only game would.

## How to play / controls (touch only)

Everything happens with one finger anywhere on the canvas — there is no fixed "button," the whole play area is the target:

- **Tap** — touch down and lift quickly with minimal movement, timed to when a circle note crosses the receiver ring.
- **Swipe** — touch down, move left or right at least ~28px within ~380ms, and lift, timed to when an arrow note crosses the ring. Direction must match the arrow.
- **Hold** — touch down as a bar note's leading edge approaches the ring, keep your finger down continuously, and lift as its trailing edge crosses the ring.
- **Start / Restart** — tap the on-screen "TAP TO START" / "TAP TO RETRY" buttons.

No keyboard or mouse-only interaction exists anywhere in the game; all handlers are `touchstart`/`touchmove`/`touchend`/`touchcancel`.

## Core mechanics

- A chart of notes is generated at the start of each run (42 notes by default, `CONFIG.TOTAL_NOTES`), starting with tap-only notes as a soft tutorial ramp, then mixing in swipes and finally holds as the run progresses. Note spacing tightens gradually (`BASE_INTERVAL_MS` → `MIN_INTERVAL_MS`) so the pace escalates smoothly.
- Each note scrolls from a spawn point to a fixed **receiver ring** near the bottom over a constant lead time (`LEAD_TIME_MS`), so position on screen always reflects time-to-hit.
- **Timing windows:** within `PERFECT_WINDOW_MS` of the exact moment = Perfect (100 pts); within `GOOD_WINDOW_MS` = Good (50 pts); outside that, or performing the wrong gesture type while a note is active, = Miss (0 pts).
- **Combo & multiplier:** consecutive Perfect/Good hits build a combo counter; every `COMBO_STEP` (10) combo raises the score multiplier by 1x, capped at `COMBO_MAX_MULT` (4x). Any Miss resets combo to 0.
- **Health:** starts at `HEALTH_MAX` (100). Each Miss costs `HEALTH_LOSS_MISS` (12) health; each Perfect regenerates a small amount (`HEALTH_REGEN_PERFECT`, 1) as a reward for precision play.
- Unjudged notes that scroll past their timing window without any input are auto-resolved as Misses by the per-frame update loop, so nothing gets stuck unresolved.

## Win / lose conditions

- **Lose:** health reaches 0 at any point → "RELAY LOST" screen with final score, best combo, accuracy, and a Perfect/Good/Miss breakdown, plus a "TAP TO RETRY" button that starts a fresh (re-randomized) chart.
- **Win:** every note in the chart has been judged and the run reaches the end without health hitting 0 → "RELAY COMPLETE" screen with the same stats and a retry button.

## Notes for visual polish

- All visuals are placeholder/functional only: flat dark background (`#1a1a1a`), a plain grey lane strip, a thin grey receiver line, solid-color note shapes (blue circle = tap, orange triangle = swipe, green bar = hold), and plain white feedback text ("PERFECT"/"GOOD"/"MISS") that briefly fades near the receiver line.
- HUD (`#hud`, `#healthWrap`/`#healthBar`) is bare CSS-styled text/bars, top-left score and top-right combo/multiplier, health bar directly beneath. Health bar color currently hard-switches between green/amber/red via inline style in JS (`healthBar.style.background`) at 40%/15% thresholds — a future pass could animate this transition instead of a hard cutover.
- Title and end-of-run screens (`#titleScreen`, `#endScreen`) are simple centered overlays with default system monospace font and one flat blue button style (`.btn`) — a strong candidate for thematic re-skinning (e.g. a retro terminal/signal-operator aesthetic to match the "relay" premise).
- The canvas itself (`#canvas`) is where all real-time gameplay renders (lane, receiver line, notes, hit feedback text) — any glow/particle/animation polish for hits, misses, and combo milestones would happen inside `render()`/`drawNote()`.
- No audio exists yet; the rhythm genre would benefit strongly from a later pass adding a synthesized metronome/beat pulse and hit-feedback tones via the Web Audio API (kept out of this mechanics-only pass to stay in scope, but there are no blockers to adding it — note timings are already precisely tracked in `notes[]`).
- Note shapes are minimal geometric primitives (circle/triangle/rectangle) with no glow, trail, or spawn/hit animation — good low-risk targets for juice in the visual pass.

## Visual Design

Restyled the whole presentation layer (HTML/CSS/canvas rendering) while leaving `CONFIG`, chart generation, judging, input handling, and win/lose logic completely untouched — verified by re-reading the file after edits and by driving a full headless-browser playthrough (Playwright/Chromium, touch input) that showed no console/page errors and correct Perfect/Good/Miss/health behavior.

**Direction:** a dark "signal-operator terminal" aesthetic — near-black background with a faint radial vignette, a single glowing transmission lane, and neon-on-black accent colors, inspired by minimalist rhythm/arcade games' common pattern of a restrained dark palette plus a handful of saturated accent hues carrying all the meaning (itch.io's minimalist/neon rhythm-game tag and dark-neon UI reference sets), and lightweight CSS `box-shadow`/`text-shadow` glow techniques instead of images for the "juice."

**Palette:**
- Background: `#05070a` near-black with a subtle `#14202a` radial glow behind the lane.
- Lane: vertical gradient `#111a22` → `#0a0e13` with a faint cyan-tinted 1px border and slow-scrolling low-opacity scan ticks.
- Tap (circle) = cyan `#4fd8ff`; Swipe (arrow) = amber `#ffb454`; Hold (bar) = mint green `#6be6a6` (brightens to `#b6f5d4` while actively held).
- Judgment colors: Perfect = pale mint-cyan `#8ff4de`, Good = warm amber `#ffcf6b`, Miss = coral-red `#ff5a72`. Health bar cross-fades smoothly between mint/amber/red instead of hard-switching.

**Typography:** monospace stack (`'JetBrains Mono', ui-monospace, 'SF Mono', 'Cascadia Code', Menlo, Consolas, monospace`) — no network font requests, just a preference list so systems that have a coding-style monospace font get one, uppercase wide-letter-spacing headings for a terminal/readout feel.

**Juice/animation added (all purely cosmetic, no gameplay effect):**
- Notes glow (canvas `shadowBlur`) and scale up slightly as they approach the receiver ring; hold bars additionally brighten while actively held.
- Receiver line has a persistent soft cyan glow.
- Hit judging spawns a fading expanding ring burst at the receiver line, color-coded to the result, plus color-coded "PERFECT/GOOD/MISS" text that drifts upward while fading (replacing the old plain white flash).
- Combo/multiplier HUD text does a quick scale-and-flash pulse whenever the multiplier tier increases.
- A Miss triggers a brief CSS screen-shake on the whole `#game` panel for tactile negative feedback.
- Health bar width/color transitions are now animated (CSS `transition`) instead of snapping between colors.
- Title/end overlays got a translucent blurred backdrop, glowing outlined buttons with a press-scale state, and legend swatches reshaped to match their in-game note silhouettes (circle/arrow/bar) with matching glow.
- Added minimal WebAudio feedback: short synthesized tones on Perfect/Good/Miss (distinct pitch/timbre per result), created lazily on first touch so it never blocks input or violates autoplay policies, wrapped in try/catch so audio failures can never affect gameplay.

**Inspiration sources:**
- [Top Rhythm games tagged Minimalist – itch.io](https://itch.io/games/tag-minimalist/tag-rhythm)
- [Dark Neon Game UI Concepts – Nexa Visuals (itch.io)](https://nexavisuals.itch.io/dark-neon-game-ui-concepts/devlog/1509395/dark-neon-game-ui-concepts-is-now-available)
- [How to Create Neon Text With CSS – CSS-Tricks](https://css-tricks.com/how-to-create-neon-text-with-css/)

## Difficulty Tuning

Rebalanced pacing only — `CONFIG` constants and the chart-generation/type-selection formulas — while leaving judging math, gesture recognition, health/combo rules, and win/lose logic byte-for-byte identical. Verified with a Monte Carlo simulation of `generateChart()`'s formulas (Node, 5000 simulated runs) plus a real headless-browser playthrough (Playwright, touch events) that scripted-timed taps against the new opening notes land as Perfect with full health, and confirmed the script still parses/runs with zero console errors.

**The core problem with the old curve:** difficulty was gated on raw note index divided by `TOTAL_NOTES - 1`, so the entire ramp from "gentle" to "hardest" was compressed into whichever short span the fixed 42-note chart happened to cover — a full run finished in ~33-42 seconds on average, reaching maximum note density and full gesture variety (including holds) by roughly note 19, only ~18-20 seconds in. There was no plateau: the last note was always the single hardest moment of the run, which reads as an abrupt ending rather than a "ceiling" a skilled player gets to enjoy.

**The fix — decoupled ramp progress:** chart length and difficulty-ramp length are now two independent constants. A new `rampProgress = min(1, noteIndex / RAMP_NOTES)` value climbs from 0 to 1 over the first `RAMP_NOTES` notes and then holds flat at 1 for the rest of the chart. Both note-spawn interval and gesture-type mix now read from `rampProgress` instead of raw chart-position progress, so the game reaches its "hard but fair" ceiling at a fixed, tunable point in time, then plateaus — giving skilled players a genuine sustained-challenge tail instead of one climactic final note.

**Key constant changes (old -> new):**
- `TOTAL_NOTES`: 42 -> 130 (a full cleared run is now a real "few minutes" session instead of ~35 seconds; ~35s of that is post-ceiling plateau)
- `RAMP_NOTES` (new): 78 — number of notes over which difficulty climbs from easiest to hardest; decouples ramp length from total chart length
- `TAP_INTRO_NOTES` (new, replaces a hardcoded `index < 5`): 5 -> 9 — a longer tap-only onboarding beat (~9-10s instead of ~5s) before any other gesture appears
- `START_DELAY_MS`: 2200 -> 2400 — slightly more orientation time before the first note arrives
- `BASE_INTERVAL_MS`: 950 -> 1050 — gentler opening spawn gap (~1s between notes) so the very first notes feel unhurried
- `MIN_INTERVAL_MS`: 520 (unchanged) — the hardest-point spawn gap stays the same, so peak challenge for skilled players isn't diluted
- `PERFECT_WINDOW_MS` / `GOOD_WINDOW_MS` / `LEAD_TIME_MS` / health & combo constants: unchanged — the existing 45ms/110ms timing windows and 1300ms scroll time were already reasonable and applied uniformly, so the fix targeted pacing (density + gesture introduction), not judgment forgiveness

**Resulting curve (simulated, ~5000-run average; a played run varies with actual hold-note lengths):**
- **t=0-10s:** tap-only notes, ~1050ms→~930ms apart. Pure onboarding — one gesture, comfortable spacing.
- **t=10-30s:** swipes are mixed in (left/right, ~45% of notes) alongside taps; spacing eases from ~930ms to ~850ms. Still no holds.
- **t=30-45s:** all three gesture types can now appear (holds unlock once `rampProgress` passes 0.5, around note ~39, roughly the 40s mark); spacing continues tightening toward ~700ms.
- **t~70s (avg):** `rampProgress` reaches 1 — spawn interval bottoms out at 520ms and the full tap/swipe/hold mix is live. This is the "hard but fair" ceiling, reached comfortably inside the target 1-3 minute window.
- **t=70s to finish (avg ~106s total):** density and gesture mix hold flat at the ceiling for a ~35 second plateau, so a skilled player gets a sustained test rather than one hard note right before the win screen.
- Health (`HEALTH_MAX` 100, `HEALTH_LOSS_MISS` 12) still allows 9 consecutive misses before death — unchanged, but now backed by a much gentler and longer on-ramp, so a new player is far less likely to burn through that buffer before they've learned the controls.

Net effect: the same eventual peak difficulty (spawn rate, gesture mix, timing windows, health costs) is preserved for players who reach it, but the path there is stretched from a ~20-second cliff into a smooth ~70-second climb, followed by a real plateau — matching "easy start, smooth continuous ramp, hard-but-fair ceiling within 1-3 minutes, short overall session."

## Assets

Original promotional illustrations (not gameplay screenshots) inspired by the game's "signal-operator terminal" concept and palette (near-black `#05070a` background, cyan/amber/mint neon note accents, monospace terminal type):

| File | Dimensions | Intended use |
|------|-----------|--------------|
| `thumbnails/thumb-small.png` | 320 × 180 px | Compact rows in a games list / index page, sidebar links |
| `thumbnails/thumb-medium.png` | 640 × 360 px | Grid/card layout tiles on a games gallery page (default "cover image") |
| `thumbnails/thumb-large.png` | 1280 × 720 px | Hero banner on the game's own page; also works as an Open Graph / Twitter Card social-preview image |

## Pipeline Token Usage

| Stage | Model | Tokens |
|---|---|---|
| game-creator | sonnet | 45452 |
| game-polisher | sonnet | 66441 |
| game-balancer | sonnet | 57186 |
| game-qa | opus | 92481 |
| game-thumbnailer | sonnet | 32670 |
| game-describer | sonnet | 17803 |
| **Total (subagent stages)** | | **312033** |

*Note: game-polisher, game-balancer, game-thumbnailer, and game-describer were requested to run on model `fable` for this experimental run, but `fable` was unavailable (hard monthly spend limit), so they fell back to `sonnet`. The table records the model each stage actually ran on.*

*Producer's own orchestration tokens aren't included above — they aren't observable from within its own execution, only each subagent call's reported usage is.*
