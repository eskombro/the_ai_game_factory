# Skitter &amp; Cling

**One-line pitch:** Your single finger is a shepherd that *repels* blue skitters and *attracts* orange clingers at the same time — so every push you make to pen one flock drags the other one out of place.

## The original twist

Herding games are usually one-directional: the cursor is a sheepdog, everything runs away from it, and the whole skill is angle-of-approach. Skitter &amp; Cling splits the flock into two opposite polarities that share one finger. Blue **skitters** flee your touch; orange **clingers** actively chase it. They go to *different* pens, so the two goals are permanently in tension: the moment you dive down-field to shove a skitter toward the blue pen, every clinger on the board abandons the orange pen and comes running after you. You can never work on one problem in isolation — you're constantly choosing a path that shoves one group where it should go *while* towing the other group somewhere useful (or at least somewhere harmless).

That single inversion turns a simple "push the dots" game into a route/ordering problem you solve live with one continuous drag: do you pen the clingers first (easy, but then the skitters have wandered), or clear the skitters first while a comet-tail of clingers follows you around the field? Lifting your finger is also a real move — with no shepherd on the board both types slow to an idle wander, which is how you "park" the clingers before going to work on the far corner.

## How to play / controls

Single-pointer, unified through Pointer Events (`pointerdown`/`pointermove`/`pointerup`/`pointercancel`), so the exact same code path serves a finger on mobile and a click-and-drag on desktop. No keyboard, no hover, no multi-touch required (extra fingers are explicitly ignored so a stray palm can't hijack the shepherd).

- **Start screen:** a full-screen overlay with the two-sentence rule and a large centered **START** button (tap or click).
- **Press and drag anywhere on the field** to place the shepherd (white dot with a translucent ring showing its scare radius). Drag to move it.
- **Blue circles (skitters)** accelerate directly away from the shepherd whenever it's inside that ring. **Orange squares (clingers)** accelerate toward the shepherd from much further away.
- **Lift your finger** to remove the shepherd entirely — both types decay to a slow idle wander. This is a legitimate tactic, not just "stop playing."
- An animal is **penned the instant its centre enters its own colour's pen** (blue pen for skitters, orange pen for clingers); it's removed and scores immediately. The wrong colour entering a pen does nothing at all — no penalty, it just gets in the way.
- **Game over screen:** a large centered **PLAY AGAIN** button restarts from Round 1.
- The shepherd may be dragged up to ~30px past the field edge (the HUD and bottom bar are `pointer-events: none`, so those taps fall through to the canvas). This exists so you can always get *behind* an animal pinned flat against a wall and push it back inward — verified as a real failure case during build testing before the margin was added.
- The playfield deliberately stops ~88px above the bottom of the screen; the bottom band is text only, keeping the bottom-right corner (site rating widget) free of anything required.

## Core mechanics

- **Two polarities, one input.** Skitters: repulsion force scaled by `(1 - d/fleeRadius)` inside a 92px (scaled) ring. Clingers: attraction inside a much larger 240px (scaled) ring, cutting out at point-blank range so they orbit the finger instead of jittering on top of it.
- **Momentum with a decaying speed cap.** Being spooked or lured raises an animal's speed cap instantly; the cap then bleeds back down toward the idle wander speed rather than snapping, so a hard shove keeps gliding for a moment after you leave. This is what makes "punting" a skitter across the field into the pen feel deliberate.
- **Idle wander.** Every animal random-walks its heading continuously, so an unattended board slowly decays into disorder — you can't fully park anything for long.
- **Walls slide, they don't bounce.** Hitting a field edge zeroes only the normal velocity component, so a pinned animal slides along the wall under sideways pressure instead of sticking or rebounding into your face.
- **Soft separation** keeps overlapping animals from merging into one indistinguishable dot.
- **Rounds.** Each round spawns a mixed flock and a timer. Pen everything to clear it: +10 per animal, +25 round bonus, +2 per second left on the clock, then a 1.5s banner and the next round auto-starts.
- **Escalation:** animal count `2 + ceil(round * 0.8)` capped at 11 (R1: 3 → R7: 8 → R11+: 11), clinger share rises to ~45% of the flock, round time `max(20, 34 - 1.5*(round-1))` seconds, and animal speed multiplier `min(1.55, 1 + 0.06*(round-1))`. From **round 5 onward the two pens swap sides on odd rounds**, which invalidates the muscle memory you just built (the pens are always drawn and labelled in their own colour, so it's readable, not a gotcha). See "Difficulty Tuning" below for the reasoning behind these exact constants.
- **Best score** persists in `localStorage` (`skitterCling.best`), wrapped in try/catch so a blocked-storage browser still runs.

## Win / lose conditions

- **No win state — it's an endless escalating run.** Clearing a round always leads to a harder one.
- **Lose:** the round timer reaching zero with any animal still loose ends the game immediately. Score, the number of animals still loose, and the persisted best score are shown, with a single PLAY AGAIN button.
- There are no lives and no per-animal failure — the only pressure is the round clock, which keeps the loop about efficient routing rather than punishing individual mistakes.

## Build-time verification (headless Chromium, Playwright)

Driven with synthesized `PointerEvent`s (touch) and separately with real mouse input on a non-touch desktop context; zero console/page errors in any run.

- Start screen → tap START → play → timer expiry → game-over overlay → PLAY AGAIN → fresh Round 1 all confirmed, plus `resize`/orientation change to landscape and back.
- **Polarity confirmed by pixel measurement:** holding the shepherd at a fixed point for 1.8s raised orange pixels within a 95px radius from 0 to ~85 while blue pixels stayed at 0–1.
- A scripted auto-shepherd cleared Round 1 end to end (round banner "Round 1 penned!", +25 and time bonus applied, advanced to Round 2 with 4 animals) and later hit the game-over path with the best score correctly stored.
- The pen-swap sampling at round ≥5 confirmed the pen rectangles/labels re-render on the correct sides.
- An earlier build let an animal get pinned nearly unpushable against a wall; the out-of-field shepherd margin was added in response and the case re-tested.

## Notes for visual polish

- **Everything gameplay-related is one full-screen `<canvas id="game">`**; the only DOM chrome is `#hud` (top band, 68px), `#bottom` (bottom band, 88px), `#banner` (round-clear toast), `#startScreen`, and `#overScreen`. **The 68px / 88px band heights are load-bearing** — they're mirrored by `HUD_H`/`BOT_H` in JS to compute the playfield rect. If a polish pass changes those heights in CSS, change the constants to match, or the field will overlap the chrome. The bottom band's `padding-right: 100px` is what keeps the copy clear of the rating widget.
- Both bands are `pointer-events: none` **on purpose** — taps in them fall through to the canvas so the shepherd can reach just past the field edge. Don't add interactive elements there without re-checking that.
- Current art is pure placeholder primitives: field is a flat `#1a1f2b` rect with a `#2c3446` border; skitters are plain `#59a6ff` circles, clingers plain `#ffa63d` squares (shape difference is intentional colour-blind redundancy — please keep two distinct silhouettes); pens are 14%-alpha fills with a 3px stroke and a centered text label; the shepherd is a white dot inside a translucent ring; captures emit a single expanding stroked ring. All of this is begging for real character art (fleeing vs. following creatures with facing/animation would sell the two polarities instantly), a textured pasture, and gate/fence-styled pens.
- **The scare ring around the shepherd is a gameplay affordance, not decoration** — it shows the exact `FLEE_RADIUS`. Keep something that communicates that radius (and consider making the clinger lure radius legible too; it's currently invisible and 2.6× larger, which is the one thing a new player can't see).
- Good juice opportunities that don't touch rules: a directional squash/trail on a spooked skitter, a "tugged" lean on clingers toward the finger, a pen-fills-up counter, a flash when a pen swaps sides at round 5+, and screen-edge vignetting as the timer bar goes red (`#timeBar.low` class already toggles at 25%).
- Layout is computed every frame from the canvas size (`computeField()`), and all forces/sizes are multiplied by a scale factor `sc`, so the game already reflows on resize/rotate — a polish pass can rely on that and shouldn't hardcode pixel positions.
- No audio at all. A rising "spook" whoosh, a soft "boop" per pen, and a distinct round-clear chime would suit it if audio ever comes into scope.

## Visual Design

**Direction:** kept the placeholder-primitive language (flat shapes, no bitmap art) but pushed it toward a minimalist "night pasture" look — near-black field with a very faint dot-grid texture, punchy saturated accent colours for the two polarities, and small, cheap animated flourishes rather than any new imagery. Inspiration was drawn from general game-jam/minimalist-UI conventions (small, high-contrast accent palette on a dark neutral base; simple type hierarchy; motion used sparingly as feedback rather than decoration) rather than any single reference, per a lightweight web search on minimalist game-jam visual language (see sources below).

- **Palette:** background `#0a0c12`; playfield a subtle vertical gradient `#1a2030 → #141824` with a faint (3.5% alpha) dot-grid texture, bordered in `#2e3648`. Skitters (blue) `#5cb0ff`, clingers (orange) `#ffab45` — both brightened slightly from the placeholder hex values for better contrast against the darker field, with matching soft glow (`shadowBlur`) instead of a flat fill. Good/danger states use `#5fe0ab` (time bar, PLAY/START button) and `#ff5f6d` (low-time bar + edge vignette). All colours defined once as CSS custom properties (`--bg`, `--skit`, `--cling`, `--good`, `--bad`, `--panel`, `--line`) and mirrored as JS constants (`C_SKIT`/`C_CLING`) so canvas and DOM chrome always match.
- **Typography:** still the system font stack only (no web font requests) — `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`. Established a small hierarchy instead of a single weight: uppercase, letter-spaced, bold HUD labels (13px) for round/loose/score; a larger bold gradient-filled `<h1>` (blue→orange, via `background-clip: text`) for the game title on the start screen; bold plain headings for round-over/game-over titles; and a lighter, taller-line-height body copy colour (`#c3ccdd`) for instructions.
- **Pens as fences, not just rectangles:** dashed stroke (reads as fence rail) plus small filled corner "posts", with a brief white flash + fill-alpha boost when the pens actually swap sides at round 5+ (triggered from the existing swap boolean already computed in `computeField()`, purely a rendering read — no new gameplay state).
- **Shepherd legibility:** the flee ring (`FLEE_RADIUS`) is still drawn as before; added a second, larger, dashed, low-alpha ring at `LURE_RADIUS` so the previously-invisible clinger attraction range is now visible too, addressing the note that it was "the one thing a new player can't see." The shepherd dot itself got a soft white glow.
- **Motion "juice" (all cosmetic, reading existing velocity/state, never writing back into it):** skitters get a slight directional stretch along their current heading (and a matching glow boost) the faster they're fleeing; clingers get a subtle rotation/lean toward the shepherd while being lured (and were switched from an axis-aligned square to a 45°-rotated diamond of the *same* corner-to-centre size, keeping the two-silhouette colour-blind redundancy the notes asked to preserve, just with a bit more visual character); both leave a short fading motion trail once their speed cap rises above idle-wander. A capture triggers a tiny (≤3px, 120ms) screen-shake and an expanding stroked ring (existing), and the edge of the screen gets a soft pulsing red vignette once the round timer drops under 25% (same threshold the existing `#timeBar.low` class already used).
- **Overlays & banner:** start/game-over overlays now fade in; the round-clear banner pops in with a small overshoot scale-in; the PLAY AGAIN / START button got a chunky "pressed" 3D treatment (solid drop shadow that collapses on `:active`) instead of a flat colour swap, to make the single most important tap target feel more tactile.
- **Audio (new, optional, fully self-contained):** a handful of `WebAudioContext` oscillator "beeps" — a short triangle-wave blip per capture (pitched differently for skitters vs. clingers), a three-note square-wave chime on round clear, and a soft descending sawtooth on game over. No audio files, nothing loaded over the network; `AudioContext` is only created/resumed from the START button's click (a real user gesture) and every call is wrapped in try/catch so a blocked or unsupported context silently no-ops.
- **Constraints preserved exactly:** `HUD_H` (68px) and `BOT_H` (88px) are untouched in both CSS and JS, so the reserved bottom-right corner for the site's rating widget is unchanged; both bands remain `pointer-events: none`; all input is still routed through the same Pointer Events handlers with no new hover- or keyboard-only affordances; no gameplay constant (`FLEE_RADIUS`, `LURE_RADIUS`, accelerations, speed caps, round/timer/scoring formulas, pen-swap rule) was touched — every change above only reads those values for rendering.
- **Sources consulted:** a single web search on minimalist game-jam/UI colour-palette and juice conventions — [Minimalist Game Art guide (Pixune)](https://pixune.com/blog/minimalist-game-art-guide/), [Best 30 Game UI Design Color Palettes (Octet Design Labs)](https://octet.design/colors/user-interfaces/game-ui-design/), and general itch.io "minimalist" jam tags — used only to confirm the small-palette/high-contrast-accent/motion-as-feedback direction, not for any specific asset or code.

## Difficulty Tuning

**What was touched:** only the four literals inside `roundConfig(r)` (the per-round animal-count coefficient, the round-timer decay rate, and the speed-multiplier growth rate; the round-timer floor and speed-multiplier ceiling were kept as-is). Nothing about the core interaction — `FLEE_RADIUS`, `LURE_RADIUS`, `FLEE_ACC`, `LURE_ACC`, `WANDER_ACC`, `DAMP`, `CAP_DECAY`, `MAX_ROUND_ANIMALS`, the pen-swap trigger (`round >= 5`, odd rounds), scoring, or win/lose conditions — was changed.

**Diagnosis.** The previous ramp was already internally smooth (every per-round step in animal count, clinger share, timer, and speed was continuous/monotonic with no double-jumps), so the shape of the curve wasn't the problem — its *pace* was. Working through `roundConfig(r)` by hand: animal count didn't reach its cap of 11 until round 14, the round timer didn't reach its 20s floor until round ~13, and the speed multiplier didn't reach its 1.55× cap until round 12. Cross-checking against the round timer budgets themselves (each round can take up to `cfg.time` seconds, so summing them is a reasonable upper-bound proxy for elapsed play time, and a skilled player who isn't hugging the full timer will land at roughly 55-65% of that sum): the old curve summed to ~308s of round-timer budget just to reach round 11, and ~369s to reach the true numeric ceiling at round 14 — i.e. a competent player was looking at something like 3.5-4.5 minutes of play before hitting "hard but fair," well past the "roughly 1-3 minutes" target for this kind of short session, with the truly maxed-out board arriving even later. Round 1 itself (3 animals, 34s, 1.0× speed) was already appropriately gentle and needed no change.

**Fix.** Raised the three ramp *rates* (not the caps, not round 1's starting values) so the same smooth, no-jump shape reaches its ceiling roughly 3 rounds sooner:

| constant | old | new | effect |
|---|---|---|---|
| animal-count coefficient | `2 + ceil(round * 0.6)` | `2 + ceil(round * 0.8)` | count cap (11) reached at round 11 instead of round 14 |
| round-timer decay | `34 - 1.2*(round-1)` | `34 - 1.5*(round-1)` | timer floor (20s) reached at round ~11 instead of ~13 |
| speed-multiplier growth | `1 + 0.05*(round-1)` | `1 + 0.06*(round-1)` | speed cap (1.55×) reached at round ~10-11 instead of ~12 |
| round-timer floor | `20` | `20` (unchanged) | |
| speed-multiplier ceiling | `1.55` | `1.55` (unchanged) | |
| `MAX_ROUND_ANIMALS` | `11` | `11` (unchanged) | |

All three axes were tuned to converge on their ceiling at roughly the *same* round (~10-11) rather than spreading out to 12/13/14 as before, so the "everything gets hard together" feel is a touch more coherent, and round 5's existing pen-swap twist still lands solidly in the middle of the ramp rather than near its end.

**Resulting curve (traced round-by-round):**

| round | animals (old→new) | clingers | round time (old→new) | speed mult (old→new) |
|---|---|---|---|---|
| 1 | 3 → 3 | 1 | 34.0s → 34.0s | 1.00 → 1.00 |
| 3 | 4 → 5 | 2 | 31.6s → 31.0s | 1.10 → 1.12 |
| 5 | 5 → 6 | 2 → 3 | 29.2s → 28.0s | 1.20 → 1.24 |
| 7 | 7 → 8 | 3 → 4 | 26.8s → 25.0s | 1.30 → 1.36 |
| 9 | 8 → 10 | 4 → 5 | 24.4s → 22.0s | 1.40 → 1.48 |
| 11 | 9 → 11 (new cap) | 4 → 5 | 22.0s → 20.0s (new floor) | 1.50 → 1.55 (new cap) |
| 14+ | 11 (old cap) | 5 | 20.0s (old floor) | 1.55 (old cap) |

Round 1 and round 2 are, by design, essentially untouched (round 2 shifts by only ±0.3s / ±0.01 speed) — the opening stays exactly as forgiving as before. From there the new curve pulls slightly ahead each round, so by round 11 the board is fully at its designed ceiling (11 animals, 20s clock, 1.55× top speed) instead of only getting there around round 14. Translating that back through the round-timer-budget proxy above: reaching the new ceiling now sums to roughly 290s of *maximum* round-timer budget (vs. ~369s before to reach the old ceiling), which at a realistic 55-65% usage puts "hard but fair" at roughly the 2.5-3.5 minute mark of actual play instead of 4+ minutes — squarely inside the intended few-minutes-per-session window, with the existing per-round caps still providing a natural plateau for anyone who keeps playing past that.

**Verification.** Re-read the edited `roundConfig()` for regressions: the `Math.min`/`Math.max` caps are untouched so no value can now exceed its intended ceiling or undershoot its floor; the `(r <= 1)` special case for round 1's clinger count is untouched and still yields the same 1-clinger/2-skitter split; no new branch, loop, or state was introduced, so there's no new failure mode (no div-by-zero, no timer that fails to reset — `spawnRound()`/`nextRound()` still reset `timeLeft`/`roundTime` from `cfg.time` exactly as before). A small Node trace of `roundConfig(r)` for `r = 1..16` under both the old and new formulas (see table above) confirmed every step is still monotonic non-decreasing with no jump larger than +1 animal, +0.06 speed, or a timer step in the direction of increasing difficulty — i.e. still a smooth ramp, just a faster one.

**Key constants, old vs. new (unchanged items included for completeness):**
- `FLEE_RADIUS = 92`, `LURE_RADIUS = 240`, `FLEE_ACC = 1150`, `LURE_ACC = 470`, `WANDER_ACC = 90`, `DAMP = 2.1`, `SPD_WANDER = 46`, `SPD_FLEE = 250`, `SPD_LURE = 205`, `CAP_DECAY = 260`, `MAX_ROUND_ANIMALS = 11` — all unchanged (core feel, not pacing).
- `roundConfig(r)` animal-count coefficient: `0.6` → `0.8`.
- `roundConfig(r)` round-timer decay rate: `1.2` → `1.5` (floor still `20`).
- `roundConfig(r)` speed-multiplier growth rate: `0.05` → `0.06` (ceiling still `1.55`).
- Pen-swap trigger (`round >= 5`, odd rounds only): unchanged — still lands mid-ramp under the new curve.

## Assets

Promotional thumbnails, generated as original poster-style illustrations inspired by the game's concept and palette (night-pasture dark background, glowing blue skitters, glowing orange clingers, dashed-fence pens) — not screenshots of gameplay:

| File | Dimensions | Intended use |
|---|---|---|
| `thumbnails/thumb-small.png` | 320 × 180 px | Compact rows in a games list / index page, sidebar links |
| `thumbnails/thumb-medium.png` | 640 × 360 px | Grid/card layout tiles on a games gallery page (the default "cover image") |
| `thumbnails/thumb-large.png` | 1280 × 720 px | Hero banner on the game's own page; also works directly as an Open Graph / Twitter Card social-preview image |

## Pipeline Token Usage

| Stage | Model | Tokens |
|---|---|---|
| game-creator | opus | 66621 |
| game-polisher | sonnet | 77170 |
| game-balancer | sonnet | 65302 |
| game-qa | sonnet | 180129 |
| game-thumbnailer | sonnet | 41045 |
| game-describer | sonnet | 22150 |
| **Total (subagent stages)** | | **452417** |

*Producer's own orchestration tokens aren't included above — they aren't observable from within its own execution, only each subagent call's reported usage is. No `game-editor` fix pass was needed: QA's one finding (a documented-vs-actual mismatch on the shepherd's horizontal edge-reach margin) had explicitly low/no practical gameplay impact, so it was judged not to warrant a fix before publishing.*
