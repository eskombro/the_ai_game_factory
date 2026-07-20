# Ripple Rescue

**One-line pitch:** You can't touch the ducklings — tap the pond to send out water ripples that push them away from hungry whirlpools and into the safety of the nest.

## The original twist

Indirect, physics-only control: every tap creates an expanding circular wavefront that shoves *everything* it passes over, radially away from your finger. There is no way to grab, drag, or steer a duckling directly. Precision comes from *where* you tap relative to a duckling (push angle) and *when* (the wavefront weakens as it spreads). Because a single ripple hits every duckling it crosses, panicked spam-tapping near one duck can shove another straight into a whirlpool — the player's own rescue tool is also the main source of mistakes.

## How to play / controls (touch only)

- **Tap the water** — creates a ripple at your fingertip that expands outward. Any duckling the wavefront passes gets pushed directly away from the tap point. The push is strongest near the tap and at the crest of the wave, and fades as the ring grows (max radius 240 px). Small cooldown (0.18 s) between taps.
- **Start / Play Again button** — large touch button on the overlay (pointerdown + click fallback).
- No keyboard or mouse-only paths anywhere; canvas uses `pointerdown` with a `touchstart` fallback and `touch-action: none`.

## Core mechanics

- Ducklings drift in from the top/left/right edges every few seconds.
- Whirlpools exert a gentle constant far-field pull plus a strong near-field pull and a tangential swirl within 150 px. A duckling that gets within the capture radius (16 px) of a whirlpool center is eaten.
- The **nest** is a gold ring at the bottom center. A duckling pushed inside it is rescued: +1 score, duckling removed.
- Duck movement: velocity + damping (water drag), soft bouncing walls, ripple impulses, whirlpool forces.

## Scoring, win/lose, difficulty

- **Score:** +1 per rescued duckling; session best tracked in-page.
- **Lose:** 3 ducklings eaten by whirlpools → game over overlay with score/best and a Play Again button (full restart path resets all state).
- **Difficulty ramp:** every 5 rescues = +1 level. Each level: spawn interval shrinks (4.2 s → floor 1.6 s) and whirlpool pull grows (+7/level). A second whirlpool appears at level 3, a third at level 5.

## Key tuning constants (top of the script)

`RIPPLE_SPEED`, `RIPPLE_MAX_R`, `RIPPLE_BAND`, `RIPPLE_PUSH`, `RIPPLE_COOLDOWN`, `DUCK_DAMP`, `BASE_PULL`, `SWIRL`, `CAPTURE_R`, `SPAWN_START`, `SPAWN_MIN`, `LEVEL_EVERY`, `MAX_LOST`, `POOL_SLOTS` — all grouped under "Tuning constants" for the balancer pass.

## Notes for visual polish

- Everything is drawn on one `<canvas id="game">` at a fixed 400×700 logical resolution, scaled to fit the viewport (portrait-first). All drawing happens in `render()`; placeholder shapes only:
  - Pond background: flat `#16394d` fill.
  - Ducklings: yellow circles (`#ffe066`) with a small orange dot as a direction "beak" and a sine bob.
  - Whirlpools: three animated blue arc spirals + dark center dot.
  - Ripples: white stroked circles fading with radius.
  - Nest: gold stroked ring with a "NEST" text label — good candidate for a proper lily-pad/nest illustration.
- HUD is a plain fixed `<div id="hud">` text line (score / lost / level).
- Overlay (`#overlay`) doubles as start menu and game-over screen; `#bigBtn` is the only button. Keep it finger-sized.
- Do not change the input handlers, physics constants (balancer owns those), or the logical 400×700 coordinate space.

## Visual Design

**Direction:** calm "twilight pond" flat-minimalist look — limited palette, soft gradients, rounded type, gentle motion. Inspired by the restrained, distraction-free aesthetic of minimalist puzzle games (Monument Valley / Klocki-style limited palettes and clean UI) and calm teal/mist water palettes ("one light mist tone, one mid teal for interactive elements, one deep slate for depth").

**Palette**

- Deep page background: `#081a24` (radial darkening)
- Pond water: `#1a566e → #14465c → #0d3448` vertical gradient + faint drifting caustic bands (`#a8e6f5` at ~3% alpha) and a soft vignette
- Aqua (interactive/ripples/whirlpool arcs, HUD numbers): `#7fd4f0` / `#a8e6f5`, crest rings in mist `#e9f6fb`
- Duck gold: `#ffd75e` body (highlight `#ffe98f`), beak `#f0913c`, wing `#e09e2e`
- Nest amber/twig: `#f2c14e` glow, `#c8934a` twig dashes
- Danger coral (Lost counter, warning emphasis): `#ff8a7a`

**Typography:** rounded system stack (`ui-rounded, SF Pro Rounded, Hiragino Maru Gothic ProN, Quicksand, Nunito, -apple-system, sans-serif`) — no webfont downloads, file stays offline-capable.

**What changed (presentation only)**

- Canvas: rounded corners + soft drop shadow, centered with flexbox; pond gradient, shimmer bands, vignette.
- Nest: placeholder ring/label replaced with a glowing twig-nest (dashed amber strokes, pulsing inner ring, radial gold glow).
- Ducklings: gradient body, velocity-oriented triangular beak, eye dot, wing arc, elliptical water shadow (bob kept).
- Whirlpools: dark vortex radial gradient under the existing spiral arcs (two-tone) with a near-black center.
- Ripples: bright crest ring + fainter trailing ring, same radii/alpha falloff.
- HUD: three pill chips (Rescued / Lost / Level) with blur backdrop; Lost in coral, Rescued in gold.
- Overlay: blurred glass backdrop, animated concentric-ripple emblem, pill-shaped gradient Start button with press-scale.
- Juice (cosmetic only): gold sparkle burst on rescue, aqua splash + brief screen shake on a lost duckling, tiny WebAudio blips (tap plop, rescue chime, low lost thud) — no gameplay constants, handlers, or coordinate space touched.

**Inspiration sources**

- Minimalist game art principles / limited palettes: https://pixune.com/blog/minimalist-game-art-guide/
- Calm minimalist puzzle UI (Klocki, Monument Valley): https://thetech.com/2023/03/10/cozy-puzzle-minimalist
- Teal/water palette guidance (mist + mid teal + deep slate): https://www.media.io/color-palette/blue-green-teal-color-palette.html

## Difficulty Tuning

*(Supersedes the "Difficulty ramp" bullet above; mechanics, controls, visuals, and win/lose rules unchanged.)*

**Goal:** genuinely easy opening while the player learns indirect ripple control, then a continuous ramp that hits a "hard but fair" ceiling around the 2-minute mark and plateaus so long runs stay winnable-feeling.

**What changed**

1. **Continuous per-rescue scaling instead of level steps.** Pull and spawn interval previously jumped only when the level ticked (every 5 rescues: pull +7, spawn −0.45 s), producing stair-step spikes. Both now scale smoothly per rescue with the same overall slope (+1.4→1.5 pull/rescue, −0.09 s/rescue), so difficulty rises a little with every rescue rather than lurching every fifth one. The level counter (`LEVEL_EVERY = 5`) is retained for the HUD and the level-3/5 whirlpool unlocks.
2. **Whirlpool fade-in (`POOL_FADE_IN = 10` s).** Every whirlpool now ramps its pull and swirl from 35% → 100% strength over its first 10 seconds (`str = 0.35 + 0.65 · min(1, age/10)`, applied to both the radial force and the swirl). This gives the opening a true grace window (effective pull ~8 → 24 over the first 10 s) and converts the formerly instant full-strength whirlpool arrivals at levels 3 and 5 into gentle 10-second escalations.
3. **Caps for a fair plateau.** Pull now plateaus at 58 (`BASE_PULL 24 + PULL_BONUS_MAX 34`, reached at 23 rescues) — previously it grew without bound (+7/level forever). Spawn floor eased 1.6 s → 1.8 s (reached at 27 rescues); with three whirlpools active, 1.8 s is already a dense endgame.

**Old vs. new constants/formulas**

| Knob | Old | New |
| --- | --- | --- |
| Whirlpool pull | `30 + (level−1)·7`, uncapped | `24 + min(score·1.5, 34)` → caps at 58 |
| Spawn interval | `4.2 − (level−1)·0.45`, floor 1.6 s | `4.2 − score·0.09`, floor 1.8 s |
| New-pool strength | 100% instantly | 35% → 100% over 10 s (`age`/`str` on each pool) |
| Ripple push/cooldown, swirl base, capture radius, MAX_LOST | unchanged | unchanged |

**Projected curve** (assuming ~1 rescue per spawn interval + 2 s handling):

| Time | Rescues | Pull | Spawn | Whirlpools |
| --- | --- | --- | --- | --- |
| 0 s | 0 | 24 (eff. ~8, fading in) | 4.2 s | 1 |
| 30 s | ~5 | ~31 | 3.75 s | 1 |
| 60 s | ~11 | ~40 | 3.2 s | 2 (fading in) |
| 90 s | ~17 | ~50 | 2.7 s | 2 |
| 120 s | ~23 | 58 (cap) | 2.1 s | 3 (fading in) |
| 150 s+ | 27+ | 58 (cap) | 1.8 s (floor) | 3 — sustained ceiling |

## Assets

Promotional thumbnails live in `thumbnails/`:

| File               | Dimensions   | Intended web use                                                                 |
|--------------------|--------------|----------------------------------------------------------------------------------|
| `thumb-small.png`  | 320 × 180 px | Compact rows in a games list / index page, sidebar links                          |
| `thumb-medium.png` | 640 × 360 px | Grid/card layout tiles on a games gallery page (the default "cover image")        |
| `thumb-large.png`  | 1280 × 720 px| Hero banner on the game's own page; also works directly as an Open Graph / Twitter Card social-preview image |

All three are downsampled from a single 1280×720 master, so framing is identical across sizes. These are original poster-style illustrations inspired by the game's concept and palette (twilight-pond teals, aqua ripples, duck gold, amber nest, coral accents) — not screenshots of gameplay.
