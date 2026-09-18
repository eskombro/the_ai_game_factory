# Deadhang

**One-line pitch:** An endless vertical climb where you move one hand at a time up a wall whose every hold crumbles the instant you leave it — keep your grip from running out.

## The original twist

Most climbing games are ragdoll-physics flailing. Deadhang is a **hold-snapping puzzle-climber** built on three rules that fight each other:

1. **One hand always bears your weight.** You can only move a hand while the *other* hand is on a hold — so the reach circle is measured from your anchor, not from the hand you're moving. Every move re-frames what's reachable next.
2. **The wall disappears behind you.** A hold crumbles the moment you complete a move off it. There is no downclimb, no re-using a rest, no farming a safe corner.
3. **Grip is the clock.** Stamina drains continuously and drains *2.4x faster while a hand is in the air*, so hesitating mid-drag actively costs you. The only refill is a green jug somewhere above you — i.e. the only way to survive is to keep climbing.

That combination makes each move a small routefinding decision (which hand do I move, and to which of two or three reachable holds?) under a timer that punishes dithering, rather than a dexterity test.

## How to play / controls

Touch-only by design, with the identical mouse path wired through the same handlers (unified `pointerdown` / `pointermove` / `pointerup`, with a `touch*` + `mouse*` fallback for browsers without Pointer Events).

- **Tap a hold** — the game moves whichever hand can legally reach it (a hand hanging free is always picked first). This is the primary, simplest input.
- **Drag a hand** — press on the L or R hand circle and drag it onto a hold. While dragging, a dashed circle shows your reach limit (measured from the anchored hand) and every legal target is ringed; the target under your finger fills in. Release off a legal hold and the hand simply returns.
- **Start / restart** — full-width buttons on the start and game-over panels, centered.

No keyboard input exists anywhere in the game. No hover-dependent affordance exists — the target highlighting appears during an active drag (pointer down), not on hover.

## Core mechanics

- **Hands.** Two hands, each either *on a hold* or *free*. A hand can only be picked up/moved if its partner is anchored. A target hold must be unoccupied and within `maxSpan` (~44% of the play column width) of the **partner's** hold.
- **Hold types.**
  - *Crimp* (grey) — neutral, 1.0x grip drain.
  - *Jug* (green) — +14 grip instantly on grab, then only 0.55x drain. Your rest stop.
  - *Brittle* (orange) — snaps 2.2s after you grab it, 1.2x drain. When it snaps, that hand goes **free** (drawn red) and you must place it fast.
- **Grip.** Starts at 100. Drain rate = base 6/s, rising with height to a cap of 12/s, multiplied by the average of the two hands' factors (free/dragging hand = 2.4x).
- **Crumbling.** Completing a move destroys the hold you left. Cancelled drags do *not* destroy it (forgiving to mis-taps), but the elevated in-air drain still charges you for the hesitation.
- **Procedural wall.** Generated one row at a time above the camera. Each row gets a *primary* hold guaranteed within reach of the previous row's primary, plus a *secondary* guaranteed within reach of that primary, plus 0–2 decoys. This guarantees a solvable hand-over-hand ladder in either hand order, while the decoys supply the actual choices. Rows below the camera are culled.
- **Difficulty ramp** (over the first ~190m): row gap 74px → 116px (closer to max reach), jug frequency 30% → 9%, brittle frequency 4% → 32%, decoy count drops, and base grip drain climbs. Two brittle holds are never placed as both the primary and secondary of the same row.
- **Scoring.** `score = metres climbed + flow bonus`. Height is measured from the starting body position at 12px/metre and only counts upward progress. **Flow**: each move made within 1.7s of the previous one raises the multiplier (max x5) and awards that many bonus points, so smooth fast climbing beats cautious climbing. Best score is kept in `localStorage`.

## Win / lose conditions

Endless — there is no win state, only a personal best. You fall (game over) when:

- **Grip hits zero** ("Your grip gave out."), or
- **Both hands are off the wall at once** ("Both hands came off the wall.") — e.g. a brittle hold snaps while your other hand is already free.

A soft dead-end (no legal target in reach at all) is surfaced with a "No holds in reach…" warning and resolves itself as a grip-out. It is extremely rare by construction of the generated ladder and did not occur in any automated playtest.

Game over shows height, flow bonus, total score and best, with a full-width **CLIMB AGAIN** button that resets cleanly (holds, hands, grip, flow, camera, height all re-initialised).

## Verification done at this stage

Headless Playwright playtests driving real touch taps and mouse drags:

- iPhone 12, 375x667, 430x932 and 1280x800 desktop (mouse click/drag only) — all playable start to game over, zero console/page errors.
- Fast bot (90ms/move) reached 720m; human-paced bot (400–700ms/move) fell at ~200–290m in ~15–25s, so the ramp bites at realistic pace (final tuning is the balancer's job).
- Verified: start screen gate, tap-to-move, drag-to-move, brittle snap → free-hand state → on-screen warning → recovery, grip-out game over, and restart back to a fresh run.
- **Bottom-right check:** across all viewports, zero required tap targets landed in the reserved bottom-right corner (the camera holds the climber at 58% of screen height, so the reachable band sits above the widget zone; only dead, already-crumbled wall renders down there).

## Notes for visual polish

Mechanics are done; everything below is deliberately placeholder-grade.

- **Structure:** one `<canvas id="c">` fills the viewport and draws the whole playfield. Everything else is DOM: `#hud` (top bar: height / score / flow + `#gripOuter` > `#gripFill` bar), `#warn` (a status line under the HUD), and two overlay panels `#startScreen` and `#overScreen` (`.overlay` > `.panel`, `.btn` buttons).
- **Placeholder colors** live in one `COL` object in the JS plus the `<style>` block: bg `#14161a`, play column `#1b1f26`, crimp `#8d97a6`, jug `#5fc98c`, brittle `#e09246`, hand `#f2f2f2`, free hand `#ff7a6b`, body/arms `#cfd6e0`, reach circle `#4fa3d1`, valid-target ring `#ffe27a`. The grip bar switches colour at 50% / 22% in `renderHud()`.
- **Canvas regions worth theming:** the centred play column (`PLAY_X`..`PLAY_X+PLAY_W`, capped at 460px so it stays a wall on desktop), the 10m gridlines with their tiny `Nm` labels, the stick-figure climber (two arm lines from a body dot to each hand), the hold circles, and the dashed reach circle. A brittle hold's radius currently shrinks as its fuse burns — that's the only "animation" and it is load-bearing feedback, please keep something equivalent.
- **Keep readable/legible:** which hand is which (they're labelled L/R), whether a hand is free (currently a red circle + the `#warn` line), and which holds are legal targets during a drag.
- **Don't move** essential controls into the bottom-right corner, and don't change the `H * 0.58` camera anchor without re-checking that corner.
- **Don't touch** `CFG` (balance constants) or any of the input/`commitMove`/generation logic during a visual pass.

## Visual Design

**Direction: "Chalk & Granite."** A cold, near-black shaft lit from nowhere, with exactly two semantic accents — one cool (guidance) and one warm (hazard) — so the player's eye is only ever pulled by information, never by decoration. Built on the standard limited-palette advice for dark game art: pick one dominant dark hue, give it a value scale (void → granite → seam → chalk) rather than more hues, and reserve saturation entirely for gameplay-critical objects (*Downwell*'s black/white/red and *Hyper Light Drifter*'s neon-on-dark are the touchstones). Everything is CSS + 2D canvas; no images, no fonts, no network.

### Palette

| Role | Hex | Used for |
| --- | --- | --- |
| Void | `#0b0d11` → `#12161d` | page background, the space either side of the shaft |
| Granite | `#171c24` (col. gradient `#0f1319`→`#1a2029`) | the climbable column |
| Seam / edge | `#2e3945`, gridlines `#212832`, labels `#39424f` | column lip, 10 m gridlines, `Nm` markers |
| Chalk | `#eef2f6` | hands, climber's head, primary numerals |
| Chalk dim / far | `#9aa6b4` / `#5b6675` | body copy, HUD labels |
| Mint (safe) | `#6ee0a0` (dark `#2f8a5c`) | jugs, primary buttons, panel seam |
| Amber (hazard) | `#f0964a` (dark `#8a4a17`) | brittle holds, soft warnings |
| Rust (danger) | `#ff6b5e` | free hand, low-grip bar, "YOU FELL", urgent warning |
| Ice (guidance) | `#56c8e8` | reach circle, healthy grip bar |
| Gold (target) | `#ffd76a` | valid-target rings, snap preview, flow multiplier |
| Slate (neutral) | `#8b98a8` (dark `#5a6674`) | crimps |

### Typography

System stacks only, no web fonts. All numerals, labels, the title and buttons use the platform monospace stack (`ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace`) with wide tracking (`.16em`–`.3em`) for an instrument-panel/route-topo feel; prose in the panels stays on `system-ui` for legibility. Canvas text (`L`/`R` hand labels, metre markers) uses the same monospace stack.

### What changed

- **Shaft, not a rectangle.** The column now has a horizontal light gradient, a lit 1px lip, an outer falloff band, deterministic hash-based rock grain that scrolls with the wall, and far parallax strata (0.3x) drifting behind it. 10 m gridlines are dimmer, with every 50 m promoted to a brighter "major" line.
- **Holds read as objects.** Each hold gets a pocket shadow, a darker base with a lighter lit face and a chalked lip arc. Jugs carry a soft mint halo and a grip groove; crimps stay neutral slate; brittles keep a crack mark. **The brittle fuse feedback is unchanged and still load-bearing** — same shrink curve — but now also jitters, tints toward rust, and grows a warning halo as it burns.
- **A climber, not a stick figure.** Bowed quadratic arms with a dark outline + chalk highlight, a hanging torso, a head, and legs with a slow `sin` sway. Drawn over the arms so it reads as one silhouette.
- **Drag affordances.** The reach circle is now an animated dashed ring with a faint ice-tinted fill; valid targets pulse gold; the snap target gets a filled halo plus a thicker ring. Lifted/free hands get a pulsing ring (ice while dragging, rust while free).
- **HUD.** Column-aligned on wide screens (`max()` padding, so it never stretches to 1280px), monospace labels over a top scrim, a segmented grip bar that shifts ice → gold → rust and pulses when critical, and a `x3+` flow multiplier that scales and glows.
- **Juice (cosmetic only).** Render-side observers watch for state transitions and spawn: chalk-dust bursts when a hold crumbles or a hand lands, a short screen shake on a brittle snap / fall, drifting ambient dust motes, a red vignette pulse below 22 % grip, and four tiny WebAudio blips (move / jug / snap / fall) built from a single oscillator. None of it reads back into the simulation.
- **Panels.** Darkened, blurred backdrop over a live wall render, mono title with a mint seam, colour-dotted rule list matching the in-game hold colours, and a big monospace score readout. The live HUD fades out behind an open panel (`:has()`, degrades gracefully).

### Preserved

Mechanics, rules, scoring, ramp constants (`CFG`) and the pointer/touch/mouse wiring are untouched — this pass edited only `COL`, `drawHold`, `render`, `renderHud`, the `<style>` block and panel markup, plus a new presentation-only fx block. The start screen still gates play with its instructions and a full-width centred button, and no UI was added anywhere near the reserved bottom-right corner (verified at 390x844, 375x667, 360x560 and 1280x800).

### Inspiration

- [Unlocking Creativity: The Power of Limited Color Palettes in Game Art — Wayline](https://www.wayline.io/blog/limited-color-palettes-game-art) (dominant dark hue + 2–3 supporting colours, value/saturation for depth; *Downwell*, *Hyper Light Drifter* as references)
- [All You Need to Know about Minimalist Game Art — Pixune](https://pixune.com/blog/minimalist-game-art-guide/) (straight lines, simple shapes, restricted palette)
- [Minimalist Game Jam — itch.io](https://itch.io/jam/minimalist-game-jam) and [GoedWare Jam: Limited Color Palette Edition](https://itch.io/jam/goedware-game-jam-limited-color-palette) (jam-scale restraint as the baseline)

## Difficulty Tuning

### The problem

The prototype's ramp was gated on **metres climbed** (`difficultyT = maxHeightMeters / rampMeters`, `rampMeters = 190`), and row gaps *themselves* grow with that same `t` — so a climbing player pushed their own difficulty up faster the more they climbed, a self-reinforcing spiral. Combined with a high, height-independent-of-time `drainBase` (6.0 grip/s — enough on its own to empty a full 100-grip meter in ~17s even standing still on a crimp), the net effect was a punishing opening: the creator's own bots confirmed a human-paced player fell in **15–25s at 200–290m**, i.e. players hit the full difficulty ceiling at essentially the same moment they died, with no runway to actually feel a smooth ramp or a multi-minute session.

### The fix: gate difficulty on elapsed run time, not height

`difficultyT` now reads `clamp(elapsedRunTime / CFG.rampSeconds, 0, 1)` (`rampSeconds = 100`), where `elapsedRunTime` is time since the current run's `reset()`. This removes the height-climbed feedback loop entirely (row gap no longer feeds back into the variable that grows row gap) and makes the ramp a fixed, predictable ~100-second climb to the ceiling for every player regardless of pace, which is what "hard-but-fair ceiling in 1–3 minutes" actually asks for. All of the per-row/per-second constants that used to key off metres now key off this same time-based `t`:

| Constant | Old (height-gated) | New (time-gated, `rampSeconds = 100`) | Why |
| --- | --- | --- | --- |
| Grip drain (base → cap) | `drainBase 6.0` → `drainCap 12.0`, scaled additionally by raw metres climbed (`drainPerMeter 0.022`, capping out at 272m — inconsistent with the 190m ramp) | `drainBase 2.5` → `drainCap 7.0`, both purely a function of `difficultyT` | Old base alone emptied a full grip bar in ~17s even hanging still; new base gives ~40–47s of "buffer" at t=0 before a single jug is needed. The old cap/ramp mismatch (272m vs 190m) is gone — one curve drives it. |
| Jug frequency | `30% → 9%` over 190m | `34% → 12%` over 100s | Slightly more generous at both ends so refills stay a realistic option even at the ceiling. |
| Brittle frequency | `4% → 32%` over 190m | `3% → 26%` over 100s | Gentler opening (fewer snap-holds while still learning the drag), slightly lower ceiling so the endgame is tense but not a near-certain trap. |
| Brittle fuse (reaction time) | flat `2.2s` always | `3.2s → 1.9s` over 100s (new: ramps per-run, assigned at grab time) | Was flat regardless of run progress — a first-touch brittle hold was exactly as punishing as one at minute two. Now a fresh run gives a full 3.2s to react; the fuse only tightens toward (and past) the old flat value as the run gets harder. |
| Row gap, `maxSpan`, hold-type ratios, decoy count | unchanged in value, but driven by the height-based, self-reinforcing `t` | unchanged in value, now driven by the time-based `t` | These formulas were fine; only their input variable was the problem. |

Everything else — `multFree` (2.4x airborne drain), `multJug`/`multCrimp`/`multBrittle`, `jugBonus`, reach distance (`spanRatio`/`spanMin`/`spanMax`), grab/snap/tap radii, and all drag/tap/crumbling logic — is untouched; these define the core rules, not pacing.

### Resulting curve (verified with headless Playwright bots driving real taps)

At `rampSeconds = 100`, `difficultyT` and its dependent constants move smoothly as:

| t (elapsed) | drain rate | jug % | brittle % | brittle fuse |
| --- | --- | --- | --- | --- |
| 0s | 2.5/s | 34% | 3% | 3.2s |
| 15s | 3.2/s | 31% | 6% | 3.0s |
| 30s | 3.9/s | 27% | 10% | 2.8s |
| 60s | 5.2/s | 21% | 17% | 2.4s |
| 90s | 6.6/s | 14% | 24% | 2.0s |
| 100s+ (ceiling, plateaus) | 7.0/s | 12% | 26% | 1.9s |

Playtested with three bot profiles (all tapping at a human-like 400–700ms/move cadence, reading the live game state, no code changes made for the test):

- **Greedy/near-optimal** (always takes the highest reachable hold): survived to the full ramp and beyond, dying at **~103s / 1708m** — real tension builds through the back half without ever feeling unfair.
- **35%-mistake bot** (mostly climbs well, sometimes picks a random valid hold): died at **~49s / 326m**.
- **55%-mistake bot** (frequently misplays): died at **~46s / 206m**.

All three are already 2–3x longer than the old 15–25s baseline, the opening ~15–20s is comfortably easy in every profile (grip stays above ~85% while jugs are plentiful and brittles rare), and the ramp completes smoothly with no sudden spikes — difficulty is now a session-length curve instead of something a player blows past on the way to an early death.

### Old vs. new key constants

| Constant | Old | New |
| --- | --- | --- |
| `drainBase` | 6.0 | 2.5 |
| `drainCap` | 12.0 | 7.0 |
| `drainPerMeter` | 0.022 (removed) | — (drain now scales with `difficultyT`, not raw metres) |
| `brittleFuse` | 2.2 (flat) | `brittleFuseStart` 3.2 → `brittleFuseEnd` 1.9 (ramped) |
| jug frequency | 30% → 9% | 34% → 12% |
| brittle frequency | 4% → 32% | 3% → 26% |
| ramp driver | `rampMeters` 190 (height-gated, self-reinforcing) | `rampSeconds` 100 (time-gated, decoupled) |
| row gap / span / decoys | unchanged values | unchanged values (now time-driven) |

## Assets

Original promotional illustrations (not screenshots — a poster-style composition drawn from the game's "Chalk & Granite" palette and key motifs: the granite shaft, mint jug, amber brittle hold with crack, ice dashed reach circle, gold valid-target ring, and the chalk-white climber with a rust free-hand) live in `thumbnails/`:

| File               | Dimensions   | Intended web use                                                                 |
|---------------------|--------------|-----------------------------------------------------------------------------------|
| `thumb-small.png`  | 320 × 180 px | Compact rows in a games list / index page, sidebar links                          |
| `thumb-medium.png` | 640 × 360 px | Grid/card layout tiles on a games gallery page (the default "cover image")        |
| `thumb-large.png`  | 1280 × 720 px| Hero banner on the game's own page; also works directly as an Open Graph / Twitter Card social-preview image |

## Pipeline Token Usage

| Stage | Model | Tokens |
|---|---|---|
| game-creator | opus | 59968 |
| game-polisher | opus | 97237 |
| game-balancer | sonnet | 84138 |
| game-qa | sonnet | 167198 |
| game-thumbnailer | sonnet | 35936 |
| game-describer | sonnet | 23047 |
| **Total (subagent stages)** | | **467524** |

*Producer's own orchestration tokens aren't included above — they aren't observable from within its own execution, only each subagent call's reported usage is.*
*No `game-editor` fix pass was needed: QA found no bugs, console errors, or broken interactions — only two minor, non-blocking UX suggestions.*
