# Leadline

**One-line pitch:** Drag your finger to draw the racing line your car follows — and the length of line still lying ahead of it *is* your throttle, so if you stop drawing, you stop moving.

## The original twist

There are plenty of "draw a road and watch a car drive on it" games, but they're all side-view physics toys where you sketch terrain and then spectate. Leadline is a top-down endless racer where the drawn line is a **live steering input tied to the accelerator**:

- The car uses **pure-pursuit steering** toward a lookahead point on your line, with a turn rate that *drops as speed rises*. Draw a corner too tight for your current speed and the car understeers wide off your line and onto the dirt — the line is a request, not a rail.
- **Line ahead = throttle.** The car's speed cap is scaled by how much unconsumed line remains in front of it (0-300px maps to 30%-100% of top speed). It literally eats the line it drives on, so the game is a race against your own finger: you have to keep laying track ahead of a car that keeps getting faster and eating it quicker.

That single coupling produces the whole difficulty curve for free: going fast requires drawing far ahead, drawing far ahead means committing to a line before you can see how the road bends, and committing badly means understeering into the dirt (which slams the speed cap to a crawl and bleeds your clock).

## How to play / controls (touch-first, mouse parity)

- **Drag anywhere on the track** to draw the line. A new press *clears* the old line and starts a fresh one from your fingertip — the car immediately starts steering toward it.
- Lift your finger and the previously drawn line stays in the world and keeps being consumed, so you can draw in bursts.
- The two buttons (START, DRIVE AGAIN) are large centred tap targets.
- Everything is wired through **pointer events** (`pointerdown` / `pointermove` / `pointerup` / `pointercancel`), so touch and mouse take exactly the same code path. There is **no keyboard input at all**, and nothing depends on hover.
- **Bottom-right corner is free:** the HUD is a top bar, both overlay buttons are centred, and the car sits at 72% screen height with the meaningful drawing area *above* it. Nothing the player must reach lives in the bottom-right.

## Core mechanics

| System | Behaviour |
| --- | --- |
| Leadline | World-space polyline. Points appended at >= 7px spacing while dragging; consumed points are recycled off the front of the array. |
| Steering | Pure pursuit to the first line point >= `LOOKAHEAD` (46px) away. Max turn rate `TURN_BASE / (1 + v / TURN_SPEED_REF)`, so understeer grows with speed. Heading is hard-clamped to ±1.05 rad, so the car can never point sideways/backwards (distance is always monotonic — no stuck states). |
| Throttle | `frac = lerp(THROTTLE_FLOOR, 1, min(lineAhead / 300, 1))`; speed cap = `topSpeed(distance) * frac`. No line at all = 30% of top speed. |
| Cornering drag | Speed is bled in proportion to the actual angular rate used, so jagged/scribbled lines are slow. |
| Road | Analytic sum of 3 randomly-phased sine harmonics, amplitude scaled so the road always fits the viewport (no horizontal camera). Half-width narrows and wander amplitude grows with distance. |
| Off-road | Leaving the tarmac clamps speed to `OFFROAD_SPEED` (95) and flashes a border. Recoverable, but it wrecks your pace. |
| Blockers | Orange circles spawned on the road at a gap that shrinks with distance. Hit = -3s and speed cut to 32%. Each blocker only hits once. |
| Checkpoints | Yellow gates every `700 + 0.055 * distance` px; passing one adds 5.5s (clock capped at 26s). The gap growth is tuned so the required average pace stays at roughly 60% of the current top speed for the whole run. |

## Win / lose conditions

- **Lose:** the clock reaches 0. There is no win state — it's a distance chase (`DIST` in metres = px/12), with a personal best kept in `localStorage`.
- **Restart:** the game-over overlay's "DRIVE AGAIN" button, always reachable by tap.

## Balance sanity check (headless simulation)

Simulated three player skill levels over the real update loop:

- **Never draws:** dies in ~20-30s at ~100-170m (drifting on 30% throttle can't out-pace the checkpoint gaps).
- **Sloppy jittery finger:** ~45-53s, ~400m, ~40% of frames off-road.
- **Smooth line drawn ~180px ahead:** ~60-67s, ~1000-1150m, peak speed ~400px/s, ~6% off-road.

So skill maps cleanly onto score, and doing nothing loses quickly. All pacing constants live in a single `TUNE` object at the top of the script for the balance pass.

## Notes for visual polish

- **Everything gameplay-related is drawn on `<canvas id="cv">`**; only the HUD and the two overlays are DOM. Canvas is inside `#wrap` (max-width 560px, centred).
- Key DOM hooks: `#hud` (top bar, `pointer-events: none` — keep it that way, the player draws through it), `#time` (gets `.low` class under 5s), `#dist`, `#throttleBox` / `#throttleBar` (throttle meter, width + colour set from JS each frame — the JS overrides `background`, so restyle it there or remove that line), `#warn` (the "DRAW AHEAD!" nag, opacity toggled from JS), `#startScreen`, `#overScreen`, `.btn`.
- Placeholder colours: off-road `#1b2a1f`, tarmac `#3a3f47` with `#8d939c` edges, leadline `#4fd06a` (live) / white 18% (consumed tail), tip dot `#4fd06a`, blockers `#e2542f` (`#5c4a4a` once hit), checkpoint gate `#ffd34d`, car `#f2f4f8` (flashes `#ff6060` on impact), background `#14161a`.
- The car is a flat triangle at `CAR_SCREEN_Y = H * 0.72`, rotated by `car.a` in the `render()` car block — an obvious place for a nicer sprite, skid marks or an exhaust trail.
- Good juice opportunities that don't touch mechanics: speed streaks scaled by `game.car.v`, a glow on the live line proportional to `game.throttle`, a screen shake on `game.hitFlash`, a burst on `game.cpFlash` (both are already decaying 0..1 timers ready to drive effects).
- Please keep the bottom-right corner clear of anything that reads as interactive — `play.html` floats its rating widget there.

## Visual Design

**Direction: "night stage telemetry."** A cold, near-black rally stage seen from above at night, treated like a readout rather than a scene. The screen carries exactly two accent families so the player never has to decode what a colour means: **mint = you and your agency** (the leadline, the throttle bar, distance, the primary button), **amber-to-coral = the clock and everything that costs you** (checkpoint gates, the "draw ahead" nag, blockers, off-road, low time). Everything else is desaturated slate and pine so those two accents are the only saturated things on screen.

### Palette

| Role | Colour |
| --- | --- |
| Void / page | `#070b10` (page surround `#05080c`) |
| Verge (off-road) | `#0d1a18` pine-black, with world-anchored mint ticks at 10% |
| Asphalt | `#191f27` → `#222a34` vertical gradient |
| Road edge | `rgba(150,172,196,.55)` hairline over a 10px `rgba(95,240,192,.10)` shoulder glow |
| Centre dashes | `rgba(226,238,252,.16)` |
| Leadline (live) | `#5ff0c0` mint, glow scaled by throttle; tip core `#d7fff1` |
| Leadline (consumed) | `rgba(95,240,192,.13)` |
| Checkpoint gate | `#ffd166` amber, posts + pulsing centre-weighted wash |
| Blocker | `#ff6a45` coral with a radial bloom and a dark core; spent = 28% coral outline |
| Car | `#eef4ff`, `#ff5a5a` on impact, mint exhaust taper |
| Text | `#e7eef7` / muted `#6f8299` / dim `#4d5c6e` |

### Typography

System-only, zero network fonts. Body/labels use the native sans stack; **all numerics and micro-labels use the system mono stack** (`ui-monospace, SF Mono, Menlo, Consolas`) with tabular figures, so the HUD and the score read as instrument telemetry. Labels are 9-10px, uppercase, `.18em`-`.34em` tracking; the title is an 800-weight wide-tracked `LEAD`(mint)`LINE`(white) lockup with a mint hairline rule under it.

### Motion / juice (all presentation-only)

- **Screen shake** on `game.hitFlash` (max ~6px, quadratic falloff) applied only to the world transform, never to input mapping.
- **Checkpoint** `game.cpFlash` drives an expanding amber ring from the car, a soft warm wash, and a one-shot scale/colour pop on the HUD clock.
- **Speed reads from the verge**: roadside ticks are placed deterministically in world space and stretch from 7px to ~37px with car speed, so the off-road blurs past as you accelerate — no particle system, no state.
- **Leadline glow** (`shadowBlur`) is proportional to `game.throttle`, and the car's exhaust taper grows with velocity, so "line ahead = throttle" is visible without reading the meter.
- **Off-road** replaced the hard border with a pulsing coral inset gradient on both edges.
- Dashed world-anchored centre line + a top fog gradient and radial vignette for depth.
- CSS-only elsewhere: overlay fade-in, button press depress, low-time blink, nag pill pulse, HUD fade in/out per run (it no longer ghosts behind the overlays).

Verified headlessly in Chromium at 390×780 and 900×820: start → drive → time-up → restart, ~60fps, no console errors. Bottom-right stays free of anything interactive.

**Inspiration:** [Minimal Drift (itch.io)](https://midnightpixelstudio.itch.io/minimal-drift) for its neon-on-night, low-clutter top-down drift look, and the broader [minimalist racing tag on itch.io](https://itch.io/games/tag-minimalist/tag-racing) for the convention of a two-accent palette over a near-monochrome track.

## Difficulty Tuning

The core mechanics, controls, and win/lose rules are untouched — this pass only reshaped the `TUNE` object so the same "hard but fair" ceiling arrives later and more smoothly, instead of front-loading the ramp. All four hazard axes (road narrowing, curve wander, blocker density, top speed) now share roughly the same ramp length so they escalate as one coherent curve rather than several hazards independently hitting their ceiling at different times.

### What changed and why

| Constant | Old | New | Reasoning |
| --- | --- | --- | --- |
| `START_TIME` | 20 | 24 | A few more seconds of clock before a first-time player has to have found the first checkpoint, so figuring out "drag = throttle + steering" doesn't itself cost a life. |
| `MAX_TIME` | 26 | 30 | Raised proportionally with `START_TIME` so the stockpile cap still sits a natural amount above the launch value. |
| `CP_GAP_BASE` | 700px | 640px | The first checkpoint arrives sooner, so a fumbling opening still banks a time bonus before the clock gets tight. |
| `CP_GAP_GROWTH` | 0.055 | 0.048 | Checkpoints stay reachable a little longer into the run as speed climbs, keeping the pace requirement from outrunning the player's growing skill. |
| `SPEED_BASE` | 200px/s | 190px/s | A touch gentler at distance 0. |
| `SPEED_GAIN` | 230 | 240 | Increased to compensate for the lower base — **top-speed ceiling is unchanged at 430px/s**, only the base moved. |
| `SPEED_RAMP` | 13000px | 16000px | Top speed now climbs to its ceiling over a longer distance, stretching the acceleration curve to match the longer hazard ramps below. |
| `ROAD_W_START` | 0.30 | 0.33 | A visibly wider opening lane to drive on while learning pure-pursuit steering. |
| `ROAD_W_END` | 0.175 | 0.175 | Ceiling narrowness unchanged — the road still gets genuinely tight at high skill/distance. |
| `ROAD_W_RAMP` | 9000px | 12000px | Narrows more gradually so the squeeze is felt as a smooth trend, not a fast tightening in the first minute. |
| `WANDER_START` | 0.30 | 0.20 | Noticeably straighter bends at the very start. |
| `WANDER_END` | 0.95 | 0.95 | Ceiling waviness unchanged. |
| `WANDER_RAMP` | 8000px | 12000px | Now ramps over the same distance as `ROAD_W_RAMP`, so "narrower" and "curvier" escalate together instead of wander outpacing width (which used to be the single fastest-escalating hazard). |
| `OBS_FIRST` | 620px | 950px | A real hazard-free warm-up stretch before the first blocker, so the player's first few corners are about learning the line, not also dodging. |
| `OBS_GAP_START` | 520px | 640px | More breathing room between the earliest blockers. |
| `OBS_GAP_END` | 210px | 210px | Ceiling density unchanged — late-game blocker spam is just as tight as before. |
| `OBS_GAP_RAMP` | 9000px | 12500px | Density increases more gradually, matching the other hazard ramps. |

Everything not listed (`ACCEL`, `BRAKE`, `MIN_SPEED`, `OFFROAD_SPEED`, `THROTTLE_FULL`, `THROTTLE_FLOOR`, all steering constants, `OBS_PENALTY`, `OBS_SPEED_KEEP`) is untouched: the throttle-from-line-ahead curve and the pure-pursuit/understeer feel are the game's core twist, not a pacing knob, so they were left exactly as designed.

### Simulated curve (headless trace, same three skill archetypes as the original balance pass, now with basic obstacle-avoidance added to the "sloppy"/"smooth" bots so blocker hits are represented realistically)

| Skill | Old: death time / distance | New: death time / distance |
| --- | --- | --- |
| Never draws | ~29s / ~160m | ~35-38s / ~185-195m |
| Sloppy jittery finger | ~39-41s / ~410-440m | ~62-65s / ~650-710m |
| Smooth line ~180px ahead | ~70-72s / ~1060-1110m | ~99-102s / ~1530-1565m |

Old vs. new trace for the "smooth" archetype (top speed `top`, road half-width `roadHW`, in px):

```
t=0s    old top=200 hw=108   new top=190 hw=119   (wider road, slightly lower cap at the gate)
t=15s   old top=238 hw=97    new top=221 hw=109   (new ramp is visibly behind old at the same timestamp — the point)
t=30s   old top=284 hw=84    new top=256 hw=98
t=45s   old top=333 hw=70    new top=297 hw=86
t=60s   old top=386 hw=63    new top=343 hw=71    (old was basically already at its ceiling here)
t=90s   n/a (already dead)   new top=430 hw=63    (new reaches the same ceiling values old had at ~60s, but ~30s later)
```

Reading the curve: opening seconds are measurably easier (wider road, gentler bends, no blockers until ~950px, more clock buffer), the ramp is smooth and continuous (all four hazard axes share ~12-16k px ramps instead of a mix of 8-13k), and a skilled player now reaches the same "hard but fair" ceiling numbers the old tuning hit at ~60s at around ~90s instead — squarely inside the target 1-3 minute window — after which the curve plateaus (all ramps are clamped at 1.0) so long runs stay challenging without continuing to escalate. A player who never draws still fails quickly (this is intentional — the game is explicitly a race against your own line, and doing nothing must still lose), just with a slightly longer runway to notice something is wrong.

## Assets

Promotional thumbnails (original illustration, not gameplay screenshots) live in `thumbnails/`:

| File               | Dimensions   | Intended web use                                                                 |
|---------------------|--------------|-----------------------------------------------------------------------------------|
| `thumb-small.png`  | 320 × 180 px | Compact rows in a games list / index page, sidebar links                          |
| `thumb-medium.png` | 640 × 360 px | Grid/card layout tiles on a games gallery page (the default "cover image")        |
| `thumb-large.png`  | 1280 × 720 px| Hero banner on the game's own page; also works directly as an Open Graph / Twitter Card social-preview image |

These are original vector illustrations composed from the game's own "night stage telemetry" palette and motifs (near-black void, slate asphalt, mint leadline/agency accents, amber checkpoint gate, coral blocker hazard, mono-font HUD flourish and title lockup) — they are not screenshots or captures of actual gameplay.

## Pipeline Token Usage

| Stage | Model | Tokens |
|---|---|---|
| game-creator | opus | 55,079 |
| game-polisher | opus | 68,535 |
| game-balancer | sonnet | 75,021 |
| game-qa | sonnet | 82,357 |
| game-thumbnailer | sonnet | 55,754 |
| game-describer | sonnet | 20,547 |
| **Total (subagent stages)** | | **357,293** |

*QA found no issues warranting a fix pass (one cosmetic UX suggestion only — see QA findings), so `game-editor` and a re-verify QA pass were not run. Producer's own orchestration tokens aren't included above — they aren't observable from within its own execution, only each subagent call's reported usage is.*
