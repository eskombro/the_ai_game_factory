# Nightling

**One-line pitch:** You are a small shadow creature dodging roaming spotlights in the dark — drag to slip through the gloom, and tap DASH to flash straight through the light unharmed before it can catch you.

## The original twist

Most "avoid the light" stealth games are instant-death: touch the light, you lose. Nightling instead uses a **fillable Exposure meter** — standing in light drains it up over time (faster the closer you are to a spotlight's core), and it drains back down the moment you slip into darkness, so brief, glancing exposure is recoverable. Layered on top is a **limited-charge Dash**: tapping DASH grants a short burst of total light-immunity, letting you sprint straight through a spotlight that would otherwise be lethal. Dash charges are scarce and regenerate slowly, so the game becomes a resource-management puzzle: hoard shadow position normally, and spend dash charges only when you're truly boxed in. Risk is added by shard pickups that only spawn in currently-dark patches of the arena and both add score and shave points off your Exposure meter, tempting you to leave a safe pocket of shadow.

## How to play / controls (touch-only)

- **Drag anywhere on the screen** (touch-and-move): your shadow orb smoothly follows your finger. No fixed lanes — full 2D freedom within the arena.
- **Tap the DASH button** (bottom-right circle): if you have a charge available, your orb flashes forward and is briefly (0.35s) immune to Exposure gain. You start with 3 charges; they regenerate automatically over time (roughly one every 3.2 seconds at the start of a run, easing to one every 4.5 seconds as the run ramps up), up to a max of 3.
- **Tap anywhere on the start/game-over screen** to begin or retry.
- All interaction uses pointer events (`pointerdown`/`pointermove`/`pointerup`) configured with `touch-action: none`, so it works purely on touch with no keyboard or mouse-hover dependency (mouse also happens to work for desktop testing, as a side effect of using pointer events, but is never required).

## Core mechanics

- **Exposure meter (0–100):** rises while inside a spotlight's radius (faster near the light's center), decays while in darkness. Reaching 100 ends the run.
- **Spotlights:** patrol back and forth along a horizontal sine path at varying rows. Difficulty escalates over a run: a new spotlight is added every 20 seconds starting at the 16-second mark (starting at 2, capping at 6 around 1:16), and both patrol speed and light radius slowly increase with elapsed time along smooth asymptotic curves.
- **Dash:** consumes 1 of up to 3 charges, grants ~0.35s of full Exposure immunity plus a snappier movement follow-speed, letting the player punch through an otherwise-fatal light zone. Charges regenerate passively.
- **Shards:** small pickups that spawn every few seconds in a spot verified to be outside all current spotlight radii at spawn time. Collecting one adds +10 score and reduces Exposure by 10, rewarding players for venturing into darker corners rather than turtling in one safe pixel.
- **Scoring:** score accrues continuously from survival time (1.5 pts/sec) plus +10 per shard. Best score is saved to `localStorage` and shown on the HUD and game-over screen.

## Win / lose conditions

- There is no fixed "win" — Nightling is an endless score-attack survival loop (difficulty ramps indefinitely, capped at a max spotlight count/speed/radius for playability).
- **Lose:** Exposure meter reaches 100 (the light catches you) → game-over overlay shows final score and best score, with a full-screen tap-to-retry target.

## Notes for visual polish

- Current palette is placeholder/functional only: near-black arena background (`#05060a`), warm pale-yellow radial gradient spotlights, a violet player orb (`#8a7cff`, turns white while dashing), and cyan shard dots (`#5ad1ff`).
- Key DOM/canvas regions for a future pass:
  - `#canvas` — the full game arena (single full-bleed canvas, redraws every frame).
  - `#hud` (top) — score/best text row plus a red `#exposureFill` bar inside `#exposureBar`. Currently plain text/CSS bar; could become a more thematic "detection" gauge.
  - `#dashBtn` (bottom-right circle) — currently a plain translucent violet circle with text label + charge count (`x3`/`x2`/etc.); a future pass could add a radial charge-fill animation, icon, or press feedback.
  - `#overlay` — start and game-over screen share one element/copy block; currently plain centered text with a pulsing "Tap to Start/Retry" hint. No animation on the player, spotlights, or shard collection yet — all instant state changes, good candidates for juice (light flicker, dash trail, shard sparkle, catch flash).
- No sound implemented at all — Web Audio API synth stings (dash whoosh, shard chime, catch alarm) would suit this stealth theme well and stay dependency-free.

## Visual Design

**Direction:** "bioluminescence in the deep night" — a near-black indigo arena where every gameplay element is a soft light source, following the dark-UI convention of one deep base plus a few saturated glow accents (violet = you, amber = danger, cyan = reward, red = alarm).

**Palette**

- Night base: radial `#070a16` → `#03040a` (deep indigo-black), with a faint twinkling starfield and a soft CSS edge vignette.
- Nightling (player): lavender `#a898ff` / deep violet `#6f5cff`, drawn with a highlight-gradient body, radial halo, and a fading motion trail (white-hot while dashing).
- Spotlights: warm amber core `rgba(255,248,228)` → `#ffce7a` falloff with a gentle brightness flicker; a thin rim ring marks the exact danger radius (drawn radius always equals the hitbox — flicker is alpha-only).
- Shards: cyan `#6fe0ff` glowing motes with a slow pulse; cyan sparkle burst on pickup.
- Alarm: `#ff5964` — exposure bar tip, danger vignette, CAUGHT! screen accent.
- Text: moon-gray `#c9cde6` on dim `#7b80a3`, monospace stack (`ui-monospace / SF Mono / Roboto Mono / Menlo`) with wide letterspacing for a quiet, instrument-panel stealth feel. System fonts only, no webfont loads.

**UI / juice (all cosmetic, zero logic changes)**

- Exposure bar: fixed violet→amber→red gradient revealed by fill width; pulses and glows red above ~65, plus a red inset "closing in" vignette whose opacity tracks exposure.
- Dash button: three glowing charge pips instead of "x3" text, ready-state glow ring, press-scale feedback.
- Overlays: breathing luminous orb above a letterspaced glowing title (turns red on CAUGHT!), pill-shaped pulsing tap hint; brief screen shake on game over.
- Tiny WebAudio synth stings (no assets): sawtooth dash whoosh, sine shard chime, low square caught alarm — created lazily on first touch, fully guarded so audio failure never affects play.

**Inspiration sources**

- Lospec "glow" palette tag (inky purple→cyan glow ramps): https://lospec.com/palette-list/tag/glow
- Dark-mode gaming palette guidance (deep base + neon accents for active states/alerts): https://piktochart.com/blog/gaming-color-palette/ and https://www.designyourway.net/blog/night-color-palettes/
- Minimalist light/shadow stealth aesthetics (shadow-creature glow vs. hard light, e.g. Aragami and jam-scale "stay in the dark" games): https://www.shacknews.com/article/97596/interview-aragami-designer-talks-lightshadow-game-systems-and-pure-stealth-gameplay

## Difficulty Tuning

**Goal:** genuinely easy, teachable first ~20-30 seconds; a smooth, continuous ramp with no steps or snaps; a "hard but fair" ceiling reached around 1:15-1:30; then only a slow drift so long runs stay interesting. Balance constants/formulas only — mechanics, controls, and win/lose rules untouched.

**The curve (what the player faces)**

| Time | Lights | Radius bonus | Patrol speed (perceived) | Exposure fill (edge / core) | Dash regen | Shard cadence |
|------|--------|--------------|--------------------------|------------------------------|------------|----------------|
| 0s   | 2      | +0 px        | 1.0x                     | 15.6 / 51 per s              | 3.2s       | 2.8s |
| 30s  | 3      | +9 px        | ~1.7x                    | 19 / 62 per s                | 3.7s       | 2.6s |
| 60s  | 5      | +15 px       | ~2.0x                    | 22 / 74 per s                | 4.1s       | 2.3s |
| 90s  | 6 (max)| +19 px       | ~2.2x                    | 24 / 79 per s (full)         | 4.5s       | 2.1s |
| 180s | 6      | +23 px       | ~2.2x (plateau)          | 24 / 79 per s                | 4.5s       | 1.6s (floor) |

Exposure decay in darkness stays 30/s throughout, so at t=0 edge-light exposure (15.6/s) fills slower than darkness drains it — a beginner grazing a light recovers easily.

**Old → new constants/formulas**

- Spotlight schedule: first extra light at **10s → 16s**, then every **14s → 20s** (still starts at 2, caps at 6; full density now at ~76s instead of 52s).
- Patrol speed multiplier: `min(2.2, 1 + t*0.012)` → `1 + 1.1*(1 − e^(−t/75))`. The old linear-with-cap form, combined with positions computed as `sin(t * speed * mul)`, made *perceived* sweep speed climb to ~3.4x by t=100s and then snap down to 2.2x when the cap engaged — a hidden spike. The asymptotic form ramps perceived speed smoothly to a gentle ~2.2x peak with no snap.
- Light radius growth: `min(26, t*0.16)` (linear, capped at 162s) → `24*(1 − e^(−t/60))` (asymptotic, most of the growth lands inside the first two minutes, never exceeds +24px).
- Exposure fill: constant `(24 + 55*proximity)/s` → same base scaled by a newcomer-grace multiplier `0.65 + 0.35*min(1, t/75)` (65% strength at t=0, full strength by 75s). Decay unchanged at 30/s.
- Dash regen: fixed **4.5s → 3.2s + min(1.3, t*0.015)** — one charge every 3.2s early (forgiving while learning), easing back to the original 4.5s by ~87s.
- Shard cadence: `max(1.4, 3.2 − t*0.01)` → `max(1.6, 2.8 − t*0.008)` — slightly denser relief early, slightly less shard-spam late.

**Reasoning:** the opening was previously full-strength from frame one (core light killed in ~1.3s at t=0) and the arena hit max spotlight density at only 52s. The new curve keeps every knob a continuous function of elapsed time (capped-linear or asymptotic), moves the ceiling to ~1:15-1:30 of play, and slightly softens the deep late game (speed asymptote 2.1x vs. old 2.2x cap, radius +24 vs. +26) so the overall game is not harder — just better paced.

## Assets

Promotional thumbnails live in `thumbnails/` as three fixed sizes derived from one master illustration:

| File               | Dimensions   | Intended web use                                                                 |
|---------------------|--------------|-----------------------------------------------------------------------------------|
| `thumb-small.png`  | 320 × 180 px | Compact rows in a games list / index page, sidebar links                          |
| `thumb-medium.png` | 640 × 360 px | Grid/card layout tiles on a games gallery page (the default "cover image")        |
| `thumb-large.png`  | 1280 × 720 px| Hero banner on the game's own page; also works directly as an Open Graph / Twitter Card social-preview image |

These are original poster-style illustrations inspired by the game's concept and palette — not screenshots of gameplay. The artwork depicts the luminous violet nightling mid-dash (white-hot core, violet motion trail) punching out of the gloom into a warm amber spotlight, with roaming spotlights (each ringed by its thin danger rim), cyan shards scattered in the dark pockets, and a faint indigo starfield, over the game's real night palette (`#070a16`→`#03040a` base, amber `#ffce7a`, lavender `#a898ff`/`#6f5cff`, cyan `#6fe0ff`). The title is set in the game's wide-tracked monospace stack.
