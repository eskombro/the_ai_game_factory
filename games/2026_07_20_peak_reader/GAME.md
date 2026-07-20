# Peak Reader

**One-line pitch:** Sit in the lineup, drag to find the peak, and tap-paddle at the right moment to catch it — but read the set well enough to let the closeouts roll by.

## The original twist

Most surf games turn surfing into a balance/dodge action sequence (stay upright, avoid rocks) while you're already riding. Peak Reader moves the challenge to the moment *before* the ride: real surfing skill is largely about reading the wave and choosing your takeoff spot — most of a session is spent sitting, watching, positioning, and deciding whether a wave is even worth going for. This game is built entirely around that read/decide/paddle loop rather than an in-ride balancing act. Catching the wave cleanly *is* the win condition; the "ride" itself is just the payoff, not a second skill test.

## How to play / controls (touch-only)

- **Drag left/right** anywhere on the screen to slide your surfer along "the lineup" (a horizontal track) and line up with where the wave's peak will break.
- **Tap rapidly** (repeated taps, anywhere on screen) once the wave is close to "paddle" and catch it. Taps only count during the short catch window right before the wave breaks.
- Doing nothing (not tapping) is a valid, deliberate choice — it means you're letting that wave pass.
- Tap anywhere to advance through the "wave to continue" resolution screen, the intro screen, and the game-over/restart screen.
- No keyboard or mouse-only input is required anywhere; mouse events are wired up only as a convenience for desktop testing.

## Core mechanics

- Each wave approaches over ~1.8–2.6 seconds (a bar sliding from the top of the screen down to the "break line"). It carries a highlighted **peak zone** that drifts left/right along the lineup as it approaches (an eased drift plus a small sine wobble) — you have to actively track it with your drag, not just park in one spot.
- Waves come in three size tiers — **Small, Medium, Big** — with bigger waves worth more points but having a narrower peak zone and requiring more paddle taps to catch.
- Some waves are **closeouts** (drawn in solid red, no makeable zone): the correct read is to not paddle for them at all. Paddling (2+ taps) during a closeout's catch window causes a wipeout.
- The last ~1.1 seconds before a wave breaks is the **catch window**. During that window the game tracks:
  - Whether your position was ever inside the peak zone (position gate).
  - How many taps you landed (paddle-power gate, tier-dependent: 3/4/5 taps for small/medium/big).
  - Your closest distance to the zone's exact center (accuracy, used for scoring).
- Resolution per wave:
  - **In zone + enough taps** → you catch it. Score = tier base points scaled by accuracy (closer to the peak's center = more points).
  - **In zone + not enough taps** → you missed it (no penalty, just no points — you were paddling too slowly).
  - **Never in zone** → the wave rolls past you (no penalty).
  - **Closeout + 2+ taps** → wipeout (lose a life, no points).
  - **Closeout + fewer than 2 taps** → "good read," no points, no penalty.
  - **Big wave caught with weak accuracy (scratching in late)** → wipeout instead of a clean catch — big waves punish sloppy timing even if you technically caught them.
- Difficulty ramps smoothly across the 10-wave session: approach time shortens, peak zones narrow, wobble increases, closeout probability rises, and bigger waves become more common as the session goes on.

## Win / lose conditions

- A **session** is a fixed sequence of 10 waves.
- You start with **3 lives** (wipeouts). Every wipeout costs one life.
- **Session ends** when either:
  - All 10 waves have been resolved (a completed session — "SESSION COMPLETE"), or
  - Lives reach 0 before the 10 waves are done ("SESSION OVER").
- There's no traditional "win" screen beyond a completed session with a good score — the goal is to maximize your score and avoid wipeouts. A final summary shows total score, a flavor rank (Beach Walker → Grommet → Local → Charger → Big-Wave Legend), and a breakdown of waves caught / missed / wiped out / correctly skipped closeouts. Tapping the summary screen starts a brand-new session.

## Notes for visual polish

- Everything is drawn on a single full-viewport `<canvas>` with a plain dark-teal background (`#0a2a3a`) — no art assets, sprites, or animation flourishes yet, just flat rectangles/circles and default `sans-serif` text.
- The "lineup" is the vertical column defined by `trackGeom()`; the approaching wave is a horizontal bar sliding from `topY` down to the dashed `breakY` line; the peak zone is a green sub-rectangle inside that bar; closeouts are a solid red bar instead. These are strong candidates for the surf/ocean theming pass (actual wave curvature, foam texture, spray, etc.) instead of flat bars.
- Closeout waves are currently telegraphed with an obvious solid-red bar and a "CLOSEOUT" label for the entire approach, which makes the read fairly easy. A future difficulty/visual pass could make the "tell" subtler (e.g., an erratic/flat zone shape instead of an explicit color+label) so reading the wave is a sharper skill.
- The player marker is a simple orange circle on the break line that pulses briefly (via `tapFlashT`) on every registered tap — a good hook for a paddle-splash or motion-blur effect later.
- Result/intro/game-over screens are plain semi-transparent black overlays with centered white/green/red/blue text — ripe for a proper surf-culture visual identity (wave photography-style gradients, board/wave iconography, a scoreboard-style font, etc.).
- Colors used as placeholders: background `#0a2a3a`, zone green `rgba(90,220,120, ...)`, closeout red `rgba(255,70,70, ...)`, player marker `#ff8c3c`, accent green text `#7CFF7C`, accent gold text `#ffd27c`, accent blue text `#7CD9FF`. None of these are final — treat this entire palette as a placeholder for the polish pass.

## Visual Design

**Direction:** an ocean/surf "golden hour lineup" look — warm low sun over a deep-water gradient, restrained enough to stay a single lightweight canvas file. Inspired by flat-design ocean/sunset gradient palettes (warm sky tones blending into deep sea blues) and the "≤3 colors, mechanics-first" ethos of minimalist game-jam aesthetics on itch.io, adapted here to a slightly richer but still small, purposeful palette.

- **Palette:**
  - Sky-to-sea vertical gradient backdrop: `#FFEFD6` (pale sand) → `#FFD9A0` (horizon glow) → `#1C6387` (sea surface) → `#04202E` (deep water), plus a soft warm radial "sun" glow (`rgba(255,233,190,…)`) low in the sky.
  - Peak zone / success: seafoam teal `rgba(92,224,184,…)`, brighter and glowing (via `shadowBlur`) once the catch window opens.
  - Closeout / danger: coral red `rgba(255,74,58,…)` with a subtle diagonal hazard-stripe texture (clipped to the band) instead of a flat block.
  - Player marker: warm coral-orange `#FF7A4D` with a foam-white (`#FFF6E8`) rim, drawn as a small surfboard-like ellipse.
  - Text accents: gold `#FFD27C` (HUD wave counter, "missed" results, rank), seafoam `#5CE0B8` (caught / good prompts), coral `#FF6B5A` (wipeout, life pips), sky blue `#8FE1FF` (good-read closeout skips).
- **Typography:** system font stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif`) at a few bold weights (700/800) for the title and results, regular weight for body copy — no web font loading, keeping the file dependency-free and fast on mobile.
- **Layout/HUD:** the flat white text HUD was replaced with a translucent gradient top bar, a gold "WAVE n/10" readout, and small filled circles ("life pips") in place of a plain "Lives: n" string. Intro/resolve/game-over overlays switched from a flat black scrim to a radial dark-ocean vignette so the wave/lineup stays faintly visible underneath.
- **Motion/juice (cosmetic only, no mechanics touched):** the peak zone and wave band are now rounded, gradient-filled bands with a thin animated "energy" squiggle riding the top edge; a low-amplitude animated swell (sine-wave lines) drifts behind the lineup for ambience; the player marker gets a gentle idle bob and a brighter glow/flash on each registered paddle tap, with small expanding ripple rings spawned at the tap point; a wipeout triggers a brief (~0.3s) screen-shake via a render-time canvas translate. All of these are driven by new cosmetic-only state (`bgTime`, `shakeT`, `splashes`) that the game logic never reads.
- **Audio (new, optional flourish):** tiny inline WebAudio beeps — a soft tick on each in-window paddle tap, a rising tone on a clean catch, a low tone on a wipeout, a light blip on a correctly-skipped closeout. Lazily initialized on first touch/click, wrapped in try/catch, and silently no-ops if WebAudio is unavailable — never blocks input or gameplay.
- **Inspiration sources:**
  - [Ocean Color Schemes: 20 Palette Combinations to Try](https://www.media.io/color-palette/ocean-color-palette.html) and [20 Best Sunset Color Palette Ideas with Hex Codes](https://www.media.io/color-palette/sunset-color-palette.html) — ocean-blue + warm-sun gradient combinations, used as the basis for the sky/sea backdrop and sun glow.
  - [Top games in game jams tagged Minimalist – itch.io](https://itch.io/games/in-jam/tag-minimalist) — reference for keeping the palette small and mechanics-forward rather than adding art assets.
- Mechanics, controls, scoring, tap/drag input handling, difficulty ramp, and win/lose conditions were left byte-for-byte identical — only the render layer, CSS, and small cosmetic side-effect hooks (screen shake timer, splash particles, beeps) were touched.

## Difficulty Tuning

**Problem with the original ramp:** the session length is a fixed 10 waves, so "difficulty over time" here really means "difficulty over wave index," and the original ramp used that wave index (`progress = (waveIndex-1)/9`) *linearly* to drive every knob. That made wave 1 — the player's very first look at the game — already a real test: a 45% chance of a medium/big wave, a 12% chance of a closeout, and a zone/wobble/approach-time setting barely distinguishable from wave 2's. There was no genuinely easy on-ramp, just a constant-rate climb from a "fairly hard already" starting point to a "very hard" ceiling.

**Change made:** introduced a single eased difficulty curve, `difficultyT(waveIndex) = p*p` where `p = (waveIndex-1)/(SESSION_WAVES-1)` (quadratic ease-in), and fed that `d` value into every ramp knob instead of the old raw linear `progress`. This keeps the *same* wave-1 and wave-10 endpoints philosophy (still 0 at the first wave, still 1 at the last) but reshapes the middle: early waves move very little off the easy baseline, and most of the escalation happens in the second half of the session, arriving at essentially the same "hard but fair" ceiling on the final wave that the original design targeted.

Alongside the re-shaped curve, the *starting* values of the tier-mix and closeout-probability lerps were pulled down (their end/ceiling values were left close to the original, so the overall difficulty ceiling — and thus overall game difficulty — is not raised or lowered by default, only the shape of the climb to it):

| Knob | Old (linear, wave 1 -> wave 10) | New (eased, wave 1 -> wave 10) |
|---|---|---|
| Tier weights (small / medium / big) | 55% / 35% / 10% -> 15% / 40% / 45% | 90% / 10% / 0% -> 12% / 40% / 48% |
| Closeout probability | 12% -> 35% | 3% -> 35% |
| Approach duration | 2.6s -> 1.8s | 2.6s -> 1.8s (unchanged endpoints, eased curve) |
| Peak-zone width multiplier | 1.00 -> 0.85 | 1.00 -> 0.85 (unchanged endpoints, eased curve) |
| Peak drift wobble amplitude | 0.02 -> 0.07 | 0.02 -> 0.07 (unchanged endpoints, eased curve) |
| Peak drift wobble frequency | 1.2 -> 2.6 | 1.2 -> 2.6 (unchanged endpoints, eased curve) |

`TIER_DATA` itself (per-tier base points, required taps, zone-width fraction, big-wave late threshold) and the fixed 1.1s `CATCH_WINDOW` were left untouched — those define each tier's identity and the scoring formula, not the session's pacing, and are out of scope for a balance-only pass.

**Resulting curve (computed from the new constants):**

| Wave | Closeout chance | Approach time | Zone-width mult. | Wobble amp / freq | Tier mix (S/M/B) |
|---|---|---|---|---|---|
| 1 | 3.0% | 2.60s | 1.00 | 0.020 / 1.20 | 90% / 10% / 0% |
| 3 | 4.6% | 2.56s | 0.99 | 0.022 / 1.27 | 86% / 11% / 2% |
| 5 | 9.3% | 2.44s | 0.97 | 0.030 / 1.48 | 75% / 16% / 9% |
| 7 | 17.2% | 2.24s | 0.93 | 0.042 / 1.82 | 55% / 23% / 21% |
| 9 | 28.3% | 1.97s | 0.88 | 0.060 / 2.31 | 28% / 34% / 38% |
| 10 | 35.0% | 1.80s | 0.85 | 0.070 / 2.60 | 12% / 40% / 48% |

Waves 1-3 are now an authentic tutorial stretch: almost exclusively small (wide-zone, low-tap-count) waves, near-zero closeout risk, full-width peak zones, slow/gentle drift, and the longest approach time to read and line up. The middle of the session (waves 4-7) is where medium/big waves and closeouts start appearing at a meaningful, gradually-increasing rate, teaching the player to read sets under rising but still-fair pressure. The back end (waves 8-10) escalates fastest, landing on the same hard-but-fair ceiling the original design intended for the final wave — over a third of waves are closeouts, nearly half of scored waves are big (narrow zone, 5 required taps, harsh late-catch penalty), and the peak zone drifts faster and less predictably. Because escalation is driven by a smooth quadratic function of wave index rather than by discrete jumps, there are no jarring steps between waves — each wave's difficulty is a small, continuous increment over the previous one.

## Assets

Promotional thumbnails (original illustrations inspired by the game's surf/golden-hour concept and palette, not screenshots of actual gameplay) live in `thumbnails/`:

| File               | Dimensions   | Intended web use                                                                 |
|---------------------|--------------|-----------------------------------------------------------------------------------|
| `thumb-small.png`  | 320 × 180 px | Compact rows in a games list / index page, sidebar links                          |
| `thumb-medium.png` | 640 × 360 px | Grid/card layout tiles on a games gallery page (the default "cover image")        |
| `thumb-large.png`  | 1280 × 720 px| Hero banner on the game's own page; also works directly as an Open Graph / Twitter Card social-preview image |

## Visual Design (2026-07-20 elevation pass — "Dusk Reef")

Player feedback on the first-pass "golden hour lineup" look was that it read as flat and generic (a gradient plus bare rectangles). This pass keeps the same warm-sunset-over-deep-water premise but rebuilds it as a layered surf poster: parallax wave silhouettes, foam texture, refined HUD chrome, and more satisfying feedback on catches/wipeouts/good reads — all render-layer and purely-cosmetic-state changes, with mechanics/controls/scoring/timing/difficulty left byte-for-byte identical (verified by diffing every touched function against the pre-pass source; `spawnWave`, `resolveWave`, `centerAt`/`zoneCenterAt`/`decoyCenterAt`, `update`'s wave-state branch, and all input handlers are untouched except for new, clearly-commented cosmetic-only lines that only read state, never write it).

- **Palette — "Dusk Reef":** shifted from a single flat 4-stop gradient to a warm sunset sky (`#FBE7C6` cream → `#FF9F6B` coral horizon glow) sitting *behind* cooler, layered wave-silhouette bands (`rgba(255,182,145,.20)` far / `rgba(64,108,150,.38)` mid / `rgba(24,64,96,.60)` near) that deepen into `#1C4F72` → `#071726` at the base. This warm-sky/cool-water split is a classic sunset-surf-poster move and gives the background real depth instead of a single smooth blend. Peak-zone seafoam was brightened slightly to `rgba(99,230,192,…)` for more pop against the busier backdrop; closeout coral, player coral-orange, and gold/sky/coral text accents are carried over with only minor value tweaks for contrast.
- **Structural additions:**
  - **Parallax wave silhouettes:** three sine-based translucent bands (`WAVE_LAYERS`) drifting at different speeds/phases behind the lineup — cheap (a few dozen line segments per band, no images) but reads as genuine depth/parallax rather than a flat backdrop.
  - **Foam texture:** the peak zone and decoy now share one `drawFoamBand()` helper that adds a scalloped foam-bubble cap along the top edge (small arcs) instead of a thin squiggle; the break line got matching foam puffs instead of a plain dash; a fixed field of 26 gently-pulsing foam flecks scatters across the sea; a precomputed low-alpha dot pattern (`buildGrainPattern`) adds a faint poster-grain texture over the whole frame at near-zero per-frame cost.
  - **HUD redesign:** the flat single-line HUD became a two-tier bar with tracked (manually letter-spaced) uppercase labels over bold display-font values, a thin gold rule under the bar, a 10-dot wave-progress track (replacing bare "WAVE n/10" text with a visual readout alongside it), and life pips redrawn as small coral wave-chevrons instead of plain circles.
  - **Zone/decoy vs. player hierarchy:** wave-tier and CLOSEOUT labels moved into small pill badges (dark translucent capsule + accent-colored outline) instead of bare text; the bottom prompt ("PADDLE n/x", "DON'T PADDLE", "LINE UP WITH THE PEAK") now sits inside a similar pill for legibility over the new busier background; the player marker became a simple surfboard-capsule silhouette (deck stringer line, foam rim) with a fading wake trail behind its recent positions, instead of a plain circle.
  - **Typography pairing:** added a second, still-system-only font stack, `FONT_DISPLAY` (Georgia/Iowan Old Style/Palatino/Times New Roman serif), used for the title and big headline numbers (score, "pts", resolve-screen message) to contrast with the sans-serif HUD/body copy — a deliberate display/body pairing instead of one weight of one typeface everywhere. No fonts are downloaded; everything resolves to whatever serif/sans the OS already has.
  - **Motion/feedback upgrades (cosmetic-state only, gated behind a `state !== prevRenderState` transition watcher that only *reads* `state`/`lastResult`):** a clean catch now fires a small radial spark burst (`spawnCatchBurst`, 12 gold/seafoam particles with light gravity) at the player's position; a wipeout adds a brief full-screen coral tint pulse (`flashT`/`drawWipeoutFlash`, ~0.3s) on top of the existing screen-shake; a good read (closeout correctly skipped) gets a soft expanding sky-blue ring (`spawnReadRing`). A new purely-visual "dissipating ring" plays when a double-up decoy's own window closes without being tapped — it only ever triggers *after* that read is already locked in (the real catch window can't have opened yet, per the existing `DOUBLEUP_GAP`), so it's positive feedback for a correct read, never new information that could change a live decision.
  - **Decoy/real-peak equivalence preserved:** both the real peak zone and the double-up decoy are drawn through the same `drawFoamBand()` call with the same colors/glow/foam styling — the only difference is *when* each is active and its fade-alpha, exactly preserving the "timing read, not color read" property the double-up mechanic depends on.
- **Inspiration sources:**
  - [Layered ocean-wave / sunset-horizon minimalist seascape references](https://www.istockphoto.com/illustrations/ocean-wave-silhouette) and general layered-parallax-illustration technique — basis for the `WAVE_LAYERS` background bands and the warm-sky/cool-water split.
  - [How to make Multi-Layered Parallax Illustration with CSS & Javascript (Medium)](https://medium.com/@patrickwestwood/how-to-make-multi-layered-parallax-illustration-with-css-javascript-2b56883c3f27) — reference for depth-via-independent-speed-layers, adapted here to canvas/sine-wave bands instead of DOM layers.
  - [itch.io Minimalist game jams](https://itch.io/jam/minimalistic-jam) and [Palette Jam](https://itch.io/jam/palletejam) — kept as the guiding constraint (small, purposeful palette; cheap CSS/canvas-only effects; no asset downloads) even while adding more visual richness than the first pass.
- **Verification:** re-read the full file for syntax (parsed cleanly with `new Function()`), diffed every touched function against the pre-pass source to confirm gameplay functions are untouched, and drove the game end-to-end in headless Chrome via the DevTools protocol (dispatching synthetic pointer events) to confirm the intro, drift/approach, active-paddle-window, resolve, HUD (score/lives/wave-progress), and wipeout states all render and update correctly with the new visuals.

## Edit Log

- **2026-07-20 — Added double-up (fake-peak) waves.** Player feedback: apart from the peak's X-axis drift, waves felt uniform once the timing window was learned. Added a second, orthogonal "read" axis: on eligible non-closeout waves (probability ramping with the existing difficulty curve, capped so it naturally can't fit into the fastest late-session approach windows), a decoy zone now briefly fades in and out earlier in the approach, drawn with the exact same colors/glow as the real peak zone — the only tell is *when* each one lights up and fades, not its color or shape. Paddling (2+ taps) during the decoy's window is a trap resulting in a wipeout (reusing the existing lives/wipeout resolution path, same as a closeout); ignoring it and reading through to the real peak costs nothing. New constants (`DOUBLEUP_*`) were added and fed by the same `difficultyT()` ramp game-balancer tuned, without touching any existing tier/closeout/timing/scoring values. Intro copy was updated with one line so the new risk is telegraphed before a session starts.
