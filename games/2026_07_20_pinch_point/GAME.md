# Pinch Point

**One-line pitch:** Drag to steer and drag sideways to resize your blob as you squeeze it through a stream of shrinking gaps — the bigger you dare to stay, the more each gap is worth.

## The original twist

Most "gap dodger" games (Flappy Bird and its many clones) only ever give you control over *position*. Pinch Point adds a second, equally important control axis: your own size, driven by a single continuous drag — vertical motion steers, horizontal motion resizes — using just one finger or one held mouse button. Score rewards staying large (bigger blob = bigger bonus per gap cleared), but a large blob is much harder to fit through a narrow gap, so the player is constantly trading risk for reward by actively dragging in and out as gaps approach, rather than just tapping to move.

## How to play / controls

A single point of contact — one finger, or one held mouse button — controls everything:

- **Drag up/down:** press anywhere and drag to move the blob's vertical position by the same amount you drag. Pressing down does not snap the blob to your finger/cursor — only movement from that press point shifts it, relative to wherever the blob already was.
- **Drag left/right to resize:** the blob's size follows the horizontal offset between your pointer's current position and where the press started. Drag right of the start point to grow the blob toward its max size, drag left to shrink it toward its min size. No horizontal movement leaves the blob at whatever size it was when you pressed down; releasing and pressing again resets that neutral baseline to the blob's current size.
- **Tap/click to start:** touch or click anywhere on the start screen to begin a run.
- **Tap "Play Again":** after a collision, tap the on-screen button to restart immediately.

Mouse and touch drive the exact same underlying logic, so the game plays identically with a single held mouse button on desktop or a single finger on mobile — no multi-touch gesture is used or required.

## Core mechanics

- The blob sits at a fixed horizontal position on the left third of the screen. Red wall segments ("gates"), each with one gap, scroll in from the right at a steadily increasing speed.
- The blob's vertical position moves by the pointer's Y *delta* since the current press began (not an absolute jump to the press point) while a single finger or mouse button is held down; if no pointer is down, the blob holds its last position and size while gates keep advancing.
- The blob's radius is controlled live by the horizontal offset from wherever the current press started, mapped toward a minimum or maximum radius (relative to screen width, so it scales to any phone size).
- Passing a gate cleanly awards `10 + round(radius / 2)` points — staying bigger is worth more per gate, creating a constant push to grow versus the safety of shrinking for tight gaps.
- Difficulty ramps smoothly over the first ~60 seconds of a run: gate speed increases, gates spawn more frequently, and the range of gap sizes shrinks (both the largest and smallest possible gap get tighter).
- The current score and personal best (persisted in `localStorage`) are shown at the top of the screen throughout the run.

## Win / lose conditions

- **Lose:** if the blob's circle is not fully inside a gate's gap while horizontally overlapping that gate (i.e., it clips a red wall segment), the run ends immediately.
- **No fixed win state** — this is an endless score-attack run, in the tradition of the genre it riffs on. The implicit goal is to beat your own best score, which is tracked and displayed across sessions.
- After a loss, a "Squeezed!" overlay shows the run's score and best score, with a Play Again button to restart instantly.

## Notes for visual polish

- All game world rendering happens on `<canvas id="game">` via 2D context calls in `render()`. Currently flat placeholder colors: background `#111`, gate walls `#c0392b` (flat red rectangles with a rectangular gap), blob `#4ba3ff` (flat blue circle). No shading, gradients, particles, or animation beyond raw movement.
- DOM overlay UI (`#ui`, `#overlay`, `#restartBtn`) uses default system monospace font and a plain blue button (`#4ba3ff`) — a good candidate for a distinct visual identity/theme (e.g., organic/cellular, sci-fi airlock, bubble-in-a-tube, etc.) that ties together the blob-squeezing concept.
- The blob is currently a plain filled circle with no indication of "how squeezed" it currently is relative to available min/max radius — a visual gauge (e.g., a thin ring or color gradient tied to radius) could help players judge pinch state without staring at their own fingers.
- Gate walls are flat rectangles; a tapered/rounded "mouth" near the gap opening could sell the squeeze-through moment better once visual polish begins.
- No screen shake, hit-flash, or particle burst on collision/pass yet — good targets for "juice" in the polish pass.
- Difficulty ramp constants live at the top of the script (`GATE_SPEED_START`, `GATE_SPEED_MAX`, `SPAWN_INTERVAL_START/MIN`, `GAP_HALF_MAX/MIN_START/END`, `RAMP_SECONDS`) for the balancing pass to tune independently of mechanics.

## Visual Design

**Direction:** an organic/bio-luminescent "cell squeezing through a membrane" look — a dark, deep-teal void with a glowing mint blob and coral-pink gate walls, following the dark-base + neon-accent palette pattern common in minimalist arcade/game-jam styling (a near-black backdrop with one or two saturated accent hues doing all the work). Researched via general web search on minimalist mobile game UI trends and itch.io-style arcade color palettes before settling on a two-accent scheme sized for a single small canvas game.

**Palette:**
- Background: radial gradient from `#12333d` (near the blob's home lane) out to `#0b1c26` and `#050b12` at the edges, plus a soft radial vignette (`rgba(0,0,0,0.42)` at the corners) for depth — all canvas-drawn gradients, no images.
- Blob (player): radial gradient `#d3fff0` → `#6dfad0` (mint) → `#189a82`, with a soft mint glow (`shadowBlur`) and a thin white arc "gauge ring" around it that fills proportionally to how close the blob's current radius is to its max — a direct answer to the game-creator's note about giving players a visual read on pinch state without watching their own fingers.
- Gate walls: linear gradient `#ff3d5e` → `#ff6b81` (coral/red) with a matching glow, plus a bright thin white line traced along each gap edge (a "sensor line" look) instead of literally rounding the geometry — keeps the original rectangular collision shape fully legible while still selling the "squeeze-through" moment.
- UI/text: off-white `#eafff6` on translucent dark glass panels (`rgba(8,20,28,0.55)` + `backdrop-filter: blur`), with the HUD score in mint and a small dimmed "Best" line beneath it.

**Typography:** system font stack only (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`) for body copy, and a monospace system stack (`ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`) for the score HUD to keep a digital-readout feel — no network font loads, keeping the file fully offline-capable.

**Motion/juice (cosmetic only, no gameplay effect):**
- Short screen shake (magnitude decaying over ~0.35s) and a burst of coral particles on collision/game over.
- A small burst of mint particles plus a rising WebAudio "blip" tone each time a gate is passed cleanly.
- A low WebAudio "thud" tone on collision.
- All particle/shake/audio state is separate cosmetic-only variables (`particles`, `shakeTime/shakeMag`, `audioCtx`) that are written to but never read by any collision, scoring, or input-handling code — gameplay mechanics, controls, and win/lose logic are byte-for-byte unchanged from the game-creator's version.
- Fixed a latent CSS gap where the "Play Again" button's `hidden` class had no matching rule (so it was always visible, even before the first run); added `#restartBtn.hidden { display: none; }` so it now only appears after a loss, as the JS already intended.

**Inspiration sources:**
- [Picking the Perfect Color Palette for Your Game — itch.io blog](https://itch.io/blog/1039646/picking-the-perfect-color-palette-for-your-game) — dark-base-plus-neon-accent palette guidance for arcade-style games.
- General search on minimalist mobile/arcade game UI trends (Dribbble/itch.io/Pinterest results) confirming flat gradients, glassy translucent HUD panels, and restrained 2-3 hue palettes as a current minimalist direction.

### 2026-07-20 refresh — "too monotone" fix

**Why:** playtesting feedback was that the original two-accent (mint + coral) scheme on a nearly-uniform dark-teal backdrop read as flat/monotone in motion — every gate and every frame of background looked the same hue. This pass keeps the same dark-base-plus-neon-accent family (still no images, still canvas/CSS gradients only) but widens the palette and adds depth cues so the screen has more going on at a glance, without touching any mechanic, control, or win/lose logic.

**Researched via:** web search on triadic/multi-hue game-jam palettes ("Neon Night", "Space Odyssey" style dark+vivid combos) and synthwave/vaporwave CSS gradient references, confirming that layering 3-4 hues over a dark base (rather than 2) plus simple parallax depth (stars/orbs) is a common, still-lightweight way to avoid a flat look while keeping everything CSS/canvas-only.

**What changed:**
- **Background:** replaced the single teal radial gradient with a layered violet-indigo-to-near-black gradient (`#2c1f52` → `#182050` → `#0e1a3a` → `#060314`), plus two new cosmetic-only background layers drawn behind the gameplay: four slow-drifting soft color orbs (violet, teal, amber, magenta) and ~46 twinkling warm/cool star dots. All positions are stored as fractions of width/height so they stay correct across resizes; none of this state is ever read by game logic.
- **Blob:** now shifts hue live with its own radius — cool mint (`#6dfad0`) at minimum size fading to warm gold (`#ffcf6b`) at maximum size, via a small `lerpColor()` helper — so the blob's color itself reinforces the existing "bigger = riskier, more valuable" mechanic (a pure rendering read of `blob.r`, which the renderer already treated as read-only). The glow color and gauge-ring logic are unchanged otherwise.
- **Gate walls:** each gate is now randomly assigned one of three cosmetic gradient pairs at spawn time (`paletteIdx`, coral-red / coral-gold / magenta-pink) instead of always the same coral gradient, so consecutive gates read as visually distinct while remaining clearly "the wall/danger" color family. This is a new field on the gate object but is written once at spawn and never read anywhere near collision/scoring/position logic.
- **HUD/UI:** score now reads in gold, "Best" in a soft violet, HUD pill background/border switched from flat teal-tinted glass to a violet-indigo glass gradient; the overlay title and "Play Again" button now use a three-stop mint→gold→coral / gold→coral gradient instead of the old two-stop mint/coral pairing, for more visible richness on the start and game-over screens.
- **Particles:** gate-pass sparkles are now a mixed mint + gold burst (was solid mint); the collision burst is now a mixed coral-red + magenta burst (was solid coral) to match the wider palette.

**Verified:** loaded the file via a headless Chrome DevTools session (mobile viewport, synthetic touch/drag input) and confirmed: the start screen, live gameplay (blob color-shift, multiple gate color variants including the new magenta/gold ones, twinkling background), and the game-over overlay all render as intended; collision/scoring behavior was unchanged (same pointer-drag steer/resize, same "clip a wall = game over" rule).

**New/changed constants (all cosmetic, no gameplay effect):** `GATE_COLOR_PALETTES`, `ORB_PALETTE`/`orbs`, `STAR_COUNT`/`stars`, `cosmeticTime`, `lerpColor()`, and the `--gold`/`--gold-deep`/`--violet`/`--violet-deep` CSS custom properties. No changes to `BLOB_MIN_R/MAX_R/START_R`, `GATE_WIDTH`, difficulty/ramp constants, scoring formula, collision logic, or input handling.

**Inspiration sources (this pass):**
- [The Best 15 Gaming Color Palette Combinations — Piktochart](https://piktochart.com/blog/gaming-color-palette/) and [Gaming Color Palettes — Coolors](https://coolors.co/palettes/popular/gaming) — dark-background + multi-accent ("Neon Night", "Space Odyssey") palette combinations as an antidote to a flat two-hue scheme.
- [Triadic Harmony — palette.site](https://palette.site/blog/2025-09-22-triadic-harmony/) — using 3 spaced hues over a dominant base color for a "vibrant but balanced" arcade look.
- General search on synthwave/vaporwave CSS gradient backgrounds — confirmed layered multi-stop gradients plus small drifting/twinkling elements are a common lightweight (no-image) way to add background depth.

### 2026-07-20 performance pass — flat dark/gray theme (fix reported lag)

**Why:** after the "too monotone" refresh above, the player reported the game had become "very laggy." The likely cause: every frame was recreating several `ctx.createRadialGradient`/`createLinearGradient` objects (background, 4 drifting orbs, each gate wall, the blob) and applying `ctx.shadowBlur` (an expensive canvas op) to both the blob and every gate wall, on top of per-frame trig for 4 drifting orbs and alpha math for 46 twinkling stars. The user also explicitly asked for a specific new look: dark background, light-gray obstacles, no gradients, lighter rendering.

**What changed (rendering only, zero gameplay/mechanics/balance changes):**
- **Background:** replaced the multi-stop radial gradient with a flat solid dark fill (`BG_COLOR = "#0a0a12"`). Dropped the fixed vignette overlay too (it was itself a gradient, redrawn as a full-screen `fillRect` every frame) to honor the "avoid gradients" request outright.
- **Removed entirely:** the 4 drifting color "orb" gradients and the 46 twinkling background stars (`orbs`, `ORB_PALETTE`, `stars`, `STAR_COUNT`, `initOrbs`/`initStars`, `cosmeticTime`) — these were the single biggest cost (gradient + trig math for dozens of objects every frame) and didn't fit the new flat/dark aesthetic anyway.
- **Gate walls:** replaced the per-gate random 3-palette linear-gradient fill plus `shadowBlur` glow with a single flat light-gray fill (`GATE_COLOR = "#c7ccd6"`), removing `GATE_COLOR_PALETTES` and the gate's `paletteIdx` field entirely. Kept the thin white "sensor line" stroke along the gap edge (a cheap `stroke()`, not a gradient/shadow) for gap-edge legibility.
- **Blob:** replaced the radial-gradient fill plus `shadowBlur` glow with a flat solid fill. Kept the existing mint→gold `lerpColor()` size cue (bigger = more gold = riskier) since it's a cheap flat-color computation with no gradient or shadow involved, and it's a meaningful gameplay-readability feature the game-creator originally asked for. Kept the thin white gauge-ring stroke around the blob (cheap, non-gradient).
- Particle effects (collision/gate-pass bursts) were left untouched — small fixed counts, flat fills, no gradients, not a meaningful contributor to the reported lag.

**Verified:** re-read `render()` top to bottom after the change — zero `createRadialGradient`, `createLinearGradient`, or `shadowBlur` calls remain anywhere in the per-frame render path. Confirmed via `node -e` syntax check and opened the file directly (`open index.html`) to sanity-check the game still loads and plays with the same controls/collision/scoring as before.

**Note:** the `description.json` marketing copy previously called the blob "glowing" in all three languages, which was accurate under the old shadowBlur-glow theme but not this one — regenerated via `game-describer` to describe the flat dark-background/light-gray-gates look instead.

## Difficulty Tuning

**Starting point:** the pre-balance version already had the right shape — a single `difficultyT()` progress value (0→1) driving gate speed, spawn interval, and gap-size range via `lerp()`, with a linear ramp that finished at a hard 60-second cutoff. The values themselves (140→380 px/s speed, 1.8s→1.0s spawn interval, gap half-width 120/75 down to 75/42) were already well-judged for an easy opening and a fair ceiling, so this pass focused on *how* progress accumulates over time rather than re-picking the endpoints.

**Two issues with the old linear ramp:**
1. Its rate of increase was constant from the very first second, so difficulty was already climbing at full speed while the player was still learning the pinch/drag controls — not "genuinely easy" for as long as it could be.
2. Because it was linear right up to `RAMP_SECONDS`, it hit the cap with a hard kink: full acceleration one instant, then perfectly flat the next. That's exactly the kind of "arbitrary-feeling plateau" the ramp should avoid.

**Change made — ease the same ramp instead of re-picking endpoints:**
- `difficultyT()` now takes the raw `elapsed / RAMP_SECONDS` fraction and applies a smoothstep curve, `raw*raw*(3 - 2*raw)`, before it's used anywhere. This keeps every downstream `lerp()` call (speed, spawn interval, gap range) untouched — only the pacing of *when* they move through their existing start→end values changed.
- `RAMP_SECONDS`: `60` → `75`, nudging the "hard but fair" ceiling from the very fast edge of the target window to a more centered ~1.25 minutes, still well inside the 1–3 minute goal.
- Initial `spawnTimer` (delay before the first gate, both at load and on restart): `1.2` → `1.5` seconds, giving a first-time player a beat longer to get their first finger down and get oriented before anything appears.
- No speed, spawn-interval, or gap-size constants were changed — same 140→380 px/s, 1.8s→1.0s, and gap-half ranges as before.

**Curve check (simulated, not just eyeballed):**

| t (elapsed) | old linear T | new smoothstep T | speed | spawn interval | gap half-range |
|---|---|---|---|---|---|
| 0s | 0.00 | 0.00 | 140 px/s | 1.8s | 75–120 |
| 15s | 0.25 | 0.10 | 165 px/s | 1.72s | 72–115 |
| 30s | 0.50 | 0.35 | 224 px/s | 1.52s | 63–104 |
| 45s | 0.75 | 0.65 | 296 px/s | 1.28s | 54–91 |
| 60s | 1.00 (capped) | 0.90 | 355 px/s | 1.08s | 45–80 |
| 75s | 1.00 | 1.00 (capped) | 380 px/s | 1.00s | 42–75 |
| 90s+ | 1.00 | 1.00 | 380 px/s | 1.00s | 42–75 (plateau) |

At 15 seconds in, the new curve is only 10% ramped versus the old curve's 25% — noticeably gentler while the player is still learning to coordinate one-finger drag and two-finger pinch. Gap diameters at t=0 (150–240px) stay far larger than the player's starting blob diameter (52px) either way, so the opening was already safe; the ease just makes the *climb away* from that safety net gradual instead of immediate. By 75 seconds both curves have converged on the same ceiling (380 px/s, 1.0s spawns, 42–75px gap halves), and because smoothstep's slope approaches zero at t=1, the transition into the endless plateau is seamless rather than an abrupt linear-to-flat snap. Runs beyond ~75s continue at this fixed hard-but-fair ceiling indefinitely, consistent with the endless score-attack format.

**Old → new key constants:**
- `RAMP_SECONDS`: `60` → `75`
- initial `spawnTimer` (declaration + `startGame()` reset): `1.2` → `1.5`
- `difficultyT()`: raw linear fraction → smoothstep-eased fraction (`raw*raw*(3-2*raw)`) of the same `elapsed / RAMP_SECONDS` progress
- Unchanged: `GATE_SPEED_START/MAX`, `SPAWN_INTERVAL_START/MIN`, `GAP_HALF_MAX/MIN_START/END`, `BLOB_MIN_R/MAX_R/START_R`, `GATE_WIDTH`, scoring formula, collision logic, and all controls/visuals.

## Assets

Original poster-style illustrations (not screenshots) inspired by the game's bio-luminescent palette and pinch/squeeze concept, saved under `thumbnails/`:

| File               | Dimensions   | Intended web use                                                                 |
|---------------------|--------------|-----------------------------------------------------------------------------------|
| `thumb-small.png`  | 320 × 180 px | Compact rows in a games list / index page, sidebar links                          |
| `thumb-medium.png` | 640 × 360 px | Grid/card layout tiles on a games gallery page (the default "cover image")        |
| `thumb-large.png`  | 1280 × 720 px| Hero banner on the game's own page; also works directly as an Open Graph / Twitter Card social-preview image |

The artwork depicts the glowing mint blob mid-pinch (a dashed vertical guide with two ring handles evoking the two-finger gesture) facing a run of coral-pink gate walls whose gaps narrow from left to right, with the "PINCH POINT" title rendered in the same mint-to-coral gradient used on the game's own game-over screen.

## Edit Log

- **2026-07-20:** Fixed the start screen not responding to any tap/click on first load (the `#overlay` div was intercepting pointer events before they ever reached the canvas's own listeners, and the only working entry point, `restartBtn`, was hidden until after a game over). Also replaced the two-finger pinch-to-resize control scheme with a single-pointer drag: blob.y follows the pointer's Y, and blob.r follows the horizontal offset from where the current press started (right = grow, left = shrink), so the game is now fully playable with either one finger or a single held mouse button — no multi-touch required. Updated the on-screen start instructions and this doc's controls/mechanics sections to match.
- **2026-07-20:** Fixed vertical movement snapping the blob to the press point on every new touch/click. `blob.y` now moves by the pointer's Y *delta* since the current press began (relative to the blob's position when the press started), matching how horizontal drag already controlled size relatively. Pressing down no longer teleports the blob; only subsequent movement of that same press does.
