# Crumblewall

## One-line pitch
A pocket tower-defense where every wall and gun you build rots away after a few seconds, so the maze you're steering the swarm through is always half-dissolved and always being re-woven.

## The original twist
Classic maze tower-defense is about **building a labyrinth once** and then watching it work. Crumblewall makes the labyrinth **impermanent**: every piece you place has a visible rot timer (walls ~26s, guns ~13s) and then vanishes on its own. That single change flips the genre's rhythm:

- Your maze is never "solved" — the path the creeps take is recalculated constantly as your own pieces decay out from under it, so a corridor you built 20 seconds ago collapses back into an open lane mid-wave.
- Damage and geometry share one decaying budget. A gun is also a wall, so every gun you drop to kill something is simultaneously re-routing the swarm — and when it rots, both the damage *and* the detour disappear at once.
- There's no "build phase / defend phase" split and no permanent upkeep to protect. The whole game is one continuous act of re-drawing, which maps perfectly onto a finger dragging across a grid.

The other deliberate design choice: the standard TD rule "you may not fully seal the path" is enforced *live* against the creeps already on the board, not just the spawn gate — the game refuses any build that would strand a creep or the gate, so you can drag freely across the grid without ever creating an illegal or stuck state.

## How to play / controls
All input is unified **Pointer Events**, so the exact same code path serves touch and mouse. No keyboard is used or needed anywhere.

- **Tap a tool button** (Gun / Wall / Scrap It) at the top of the screen to select it. Buttons are ~56px tall, full-width thirds.
- **Tap a board tile** to build (or remove) with the selected tool.
- **Drag across the board** to build along a whole line of tiles in one gesture — each newly entered tile triggers one build attempt, so you can "paint" a wall run with a single swipe. Illegal, unaffordable or occupied tiles are simply skipped with a message rather than interrupting the drag.
- **Tap "Start Defense"** on the start screen to begin; **tap "Play Again"** on the game-over screen to restart.
- Multi-touch is intentionally ignored: only the first active pointer paints (tracked by `pointerId`, with `setPointerCapture`), so a stray palm touch can't build.

## Core mechanics
- **Board:** 7 x 11 grid. A green **GATE** at the top-centre spawns creeps; a red **KEEP** at the bottom-centre is what they're walking to. Neither tile can be built on.
- **Pathing:** a BFS distance field is recomputed from the keep every time the board changes (build, scrap, or rot). Creeps always step to a neighbouring tile one step closer to the keep, so any wall you drop instantly re-routes the whole swarm.
- **Build legality:** a build is refused if the resulting board would leave the gate — or any live creep's next tile — with no route to the keep. You also can't build on a tile a creep is standing on or walking into.
- **Pieces (both are solid and block pathing):**
  - **Gun** — 12 scrap, rots in 13s, range 1.8 tiles, fires every 620ms for 9 damage at the nearest creep in range.
  - **Wall** — 4 scrap, rots in 26s, no damage, pure geometry.
  - **Scrap It** — free tool; removes one of your pieces and refunds 40% of its cost (removal can never break pathing, so it's always allowed).
- **Rot:** every piece draws a shrinking green/red meter along its bottom edge and fades as its life runs out, then disappears and the path recalculates.
- **Economy:** start with 34 scrap; +1.5/s passively and +3 per creep killed. Tool buttons dim when you can't afford them.
- **Waves:** wave *w* sends `3 + floor(1.6w)` creeps with `16 x 1.28^(w-1)` HP, moving at `min(1.25, 0.62 + 0.03w)` tiles/s, spawned `max(430, 1300 - 55w)` ms apart. A 6s breather precedes wave 1 and 4.5s separates later waves; the HUD counts it down. Waves are endless.
- **Scoring:** +10 per creep killed, +25 x wave number for clearing a wave. Best score persists in `localStorage` (`crumblewall_best`).
- **Safety valve:** if a creep somehow ends up with no downhill step (it shouldn't — the placement checks prevent it), it chews through the weakest adjacent piece after 1.5s rather than freezing the wave. This exists purely to make a soft-lock impossible.

## Win / lose conditions
- **Lose:** 5 creeps reach the keep (one life each). The game-over screen shows full waves held, score and best, with a "Play Again" button that fully resets grid, creeps, economy, wave counter and lives.
- **Win:** none — it's an endless escalating-wave score chase. Balanced-for-prototype reference: a straightforward "keep two guns beside the lane" strategy reached wave 5 / ~550 points in about 100 seconds during headless playtesting; using walls to lengthen the route is the main skill lever beyond that.

## Notes for visual polish
- **Structure:** `#app` is a vertical flex column — `#hud` (4 stat readouts) → `#tools` (3 buttons) → `#stage` (holds the `<canvas id="cv">`, top-aligned, horizontally centred) → `#footer`. Two absolutely-positioned full-bleed overlays, `#startScreen` and `#overScreen`, sit on top (`.hidden` toggles them).
- **Bottom-right reservation:** `#footer` is a fixed 96px tall with `padding-right: 130px`, and the canvas is top-aligned inside `#stage`, specifically to keep the play grid and all buttons clear of the rating widget's corner. Please keep that footer height (or larger) and don't move the tool buttons to the bottom.
- **Canvas drawing is all placeholder flat rects/circles**, sized in grid units and multiplied by `cell` at draw time, so everything scales with the board:
  - Board background `#1b1f28`; walkable tiles tinted `rgba(90,140,200,a)` where alpha encodes distance-to-keep (brighter = closer). This gradient is currently very subtle and would benefit from being made readable — it's the player's only cue about the current route.
  - Gate `#4a6f4a` with "GATE" label, keep `#8a4a4a` with "KEEP" label.
  - Wall `#6d7486`, gun `#c8792e` with a dark muzzle dot; both fade via `globalAlpha` as they rot, plus a 4px rot meter (`#9fe08a` → `#ff6b6b` under 30%).
  - Creeps: `#d94f6a` circles (radius 0.28 cell) with a 3px HP bar above.
  - Shots: 110ms fading `#ffe08a` line from gun centre to target.
- **Juice opportunities** (none implemented): creep death pop, a puff/collapse when a piece rots out, a flash on the keep when a life is lost, a wave-incoming banner, and a build-refused shake on the tile. `setMessage()` in `#msg` is currently the only feedback channel for refusals — a more visible treatment there would help.
- **Palette is placeholder** throughout; accent is `#ffd257` (selected tool border, message text, big buttons).

## Visual Design

Restyled presentation only — every change below is CSS/canvas-rendering; no mechanic, control, or logic line was touched (verified by a headless Playwright pass: full flow from start screen through build/wave/wall-rot/kill/game-over, zero console errors before and after).

**Palette** (CSS custom properties in `:root`):
- Background: near-black `#0a0c11` → `#10131a` vertical gradient with a very faint warm radial glow at the top, panels (`#hud`/`#tools`/`#footer`) in a slightly lighter `#161a24` with `#2b3142` hairline borders, so the frame reads as a distinct instrument panel around the board.
- Board: dark slate gradient (`#171b25` → `#12151d`); the walkable-tile "distance to keep" tint was moved from a washed-out blue to **cyan `rgba(72,196,224,a)`** with roughly doubled max alpha, so the live route is now the brightest, most legible thing on the board as the design notes asked for.
- Accent (selected tool, HUD highlight numbers, big buttons, banner text): warm gold `#ffcb57`.
- Gun pieces: warm orange `#ff9d4d` (gradient down to a deep `#8a4c1e`); Wall pieces: cool slate `#8a92ac` (down to `#484e5f`) — the two piece types are now readable as distinct hues at a glance, each with rounded corners instead of hard-edged rects.
- Gate: emerald `#46e0a4` (deep `#2f8f66`); Keep: rose-red `#ff4f6d` (deep `#9c2f45`) — both drawn as soft glowing rounded tiles with a slow ambient pulse (`sin(now/420)`), so the two objectives are unmistakable and the keep reads as "under threat."
- Creeps: `#d94f6a` with a faint halo ring and a small specular highlight for a touch of depth; HP bar unchanged logic-wise, just restyled.

**Typography:** kept system-ui (no network font load, per the lightweight constraint) but built more hierarchy out of it — uppercase, letter-spaced HUD labels with per-stat accent colors (wave=gold, lives=rose, scrap=emerald), a gradient-filled bold title on the overlays, and tabular-nums on the live stat readouts so they don't jitter as digits change width.

**Layout/structure:** unchanged (same `#hud → #tools → #stage → #footer` column, same bottom-right reservation for the rating widget, same overlay mechanism) — only surface styling (panel backgrounds, borders, spacing, button gradients/glows, `backdrop-filter: blur` on overlays) was added.

**Motion/juice added** (all purely cosmetic side-effects layered onto existing event points — build refusal, piece rot-out, gun kill, life lost, wave start/clear — none of them change what the game *allows*, they only draw something extra when it already happened):
- HUD "bump" pop animation on lives/score when they change.
- `#msg` now fades/slides in and out instead of snapping.
- Tool buttons get a colored glow/border matching their piece type when selected, plus a small press-scale.
- Small particle bursts on creep kill and on a piece rotting away (a "puff" in the piece's own color).
- A brief screen shake + red vignette flash + particle burst on the keep when a life is lost.
- A big fading/scaling "WAVE n" / "WAVE CLEAR" banner drawn on the canvas at wave start/clear.
- A red pulse flash on the tile whenever a build attempt is refused (unaffordable, occupied, blocked-by-creep, would-seal-the-path, or gate/keep tile).

All effects are capped, self-decaying arrays (particles/flashes/shake/banner) drawn on top of the existing canvas each frame — no new timers that could interact with game state, and everything is cleared on `resetGame()`.

**Inspiration:** a quick web search on minimalist tower-defense/game UI direction (dark base + a small set of saturated neon/accent hues, one accent per functional role, flat vector shapes with glow rather than texture/imagery) confirmed the "dark navy/charcoal base with a couple of high-contrast neon accents" direction as a good minimalist fit for a fast, readable mobile TD — see [Gaming Color Palette Combinations](https://www.media.io/color-palette/gaming-color-palette.html) and the itch.io minimalist-UI reference at [hazestormstudio.itch.io/minimalist-ui](https://hazestormstudio.itch.io/minimalist-ui). Palette values above were chosen bespoke for this game's own gate/keep/gun/wall roles rather than copied wholesale.

## Difficulty Tuning

**Diagnosis.** Read through every pacing knob (`START_SCRAP`/`SCRAP_PER_SEC`/`SCRAP_PER_KILL`, `TOOL.gun`/`TOOL.wall` cost/life/range/dmg/cd, `FIRST_BREATHER`/`BREATHER`, and the four `wave*(w)` functions) and simulated the wave schedule out to ~20 waves / 5 minutes. `waveCount(w)`, `waveSpeed(w)` (capped at 1.25 tiles/s) and `waveGap(w)` (floored at 430ms) were all already smooth, self-capping curves — fine as-is. The one runaway knob was `waveHp(w) = round(16 * 1.28^(w-1))`: an **uncapped** compounding exponential. It matched the intended feel for the first ~4-5 waves (which is why the existing "wave 5 in ~100s" playtest note in this doc felt right), but from there it never levels off: wave 10 HP was already 148 (9.3x wave 1), wave 15 was 507 (32x), and wave 20 was 1742 (109x) — climbing forever with no ceiling. Combined with the still-growing creep count, the total incoming HP a defense has to clear roughly *44x'd* between wave 5 and wave 10, so any session that survived past the first couple of minutes hit an unfair, ever-steepening wall rather than a plateau.

**Fix.** Only `waveHp(w)` changed (four new named constants, `HP_BASE=16, HP_GROW=1.28, HP_TAU=9, HP_LIN=0.9`, replace the bare `16`/`1.28` literals):

```js
function waveHp(w) {
  var effW = HP_TAU * (1 - Math.exp(-(w - 1) / HP_TAU)); // eases toward a plateau instead of compounding forever
  return Math.round(HP_BASE * Math.pow(HP_GROW, effW) + HP_LIN * w);
}
```

Instead of feeding the raw wave number into the exponent forever, the exponent is first passed through an asymptotic "effective wave" that starts identical to `w` (so early waves are essentially untouched) and smoothly decelerates toward a ceiling of `HP_TAU` as `w` grows, so the exponential compounding itself tapers off continuously (no seam, no step). A small flat `HP_LIN * w` term is added on top so the curve doesn't fully flatline — endless late-game runs keep getting slowly, linearly tougher instead of topping out completely, which still rewards a skilled player's sustained play. `waveCount`, `waveSpeed`, `waveGap`, the economy constants, and both pieces' cost/life/range/dmg were all left untouched — this was a single-formula fix for the one uncapped knob, not a general re-balance.

**Old vs. new key constants:**
| constant | old | new |
|---|---|---|
| `waveHp(w)` | `round(16 * 1.28^(w-1))` (uncapped exponential) | `round(16 * 1.28^effW(w) + 0.9w)`, `effW(w) = 9*(1 - e^(-(w-1)/9))` (decelerating, plateau-seeking) |
| all other constants (`waveCount`, `waveSpeed`, `waveGap`, economy, gun/wall cost/life/dmg/range) | unchanged | unchanged |

**Resulting curve (simulated; `t` = wall-clock time from "Start Defense", assuming the wave only ends once every creep in it has spawned, matching the actual spawn-driven wave-clear trigger):**

| wave | t (old ≈ new, spawn timing unchanged) | HP/creep old → new | creeps | total wave HP old → new |
|---|---|---|---|---|
| 1 | 6s | 16 → 17 | 4 | 64 → 68 |
| 3 | 25s | 26 → 28 | 7 | 182 → 196 |
| 5 | 49s | 43 → 40 | 11 | 473 → 440 |
| 8 | 96s | 90 → 60 | 15 | 1350 → 900 |
| 10 | 129s | 148 → 74 | 19 | 2812 → 1406 |
| 15 | 218s | 507 → 106 | 27 | 13689 → 2862 |
| 20 | 303s | 1742 → 131 | 35 | 60970 → 4585 |

**How it plays now:**
- **Waves 1-4 (0-36s):** effectively unchanged from before — a couple of starting guns (34 starting scrap covers two 12-scrap guns) one-or-two-shot every creep with room to spare. This opening was already gentle and is preserved almost exactly (17 HP vs the old 16 at wave 1), so new players still get a genuinely easy, low-pressure window to learn dragging walls/guns and watching the rot timers.
- **Waves 5-10 (~49-130s):** HP keeps climbing but now decelerating rather than compounding — by wave 10 a creep has 74 HP instead of 148. Per-wave "incoming HP per second of spawn window" still rises smoothly (~18-20% per wave), so the player genuinely feels the swarm thickening and needs to start layering multiple guns and using walls to funnel creeps past them — this is the "hard but fair, ramping" middle of the curve, reaching a proper challenge (needing real multi-gun/maze tactics, not just two turrets) by roughly the 1.5-2 minute mark, matching the "ceiling within 1-3 minutes" target.
- **Waves 11-16 (~130-235s):** growth keeps slowing (per-wave HP delta shrinks from single digits down toward flat), and once `waveGap` bottoms out at its existing 430ms floor around wave 16 the incoming-HP-per-second rate itself nearly levels off — a smooth plateau rather than the old vertical wall.
- **Wave 20+ (~5 min+):** HP is ~131 and still creeping up by <1/wave, so a skilled, well-established maze keeps getting a slow trickle of extra pressure (via HP, plus the never-capped, linearly-growing creep count) for as long as the run continues, instead of becoming mathematically unwinnable — satisfying "skilled players still get challenged on long runs" without a runaway spike.
- Net effect: the well-tested opening is preserved, the middle game ramps at roughly the same felt rate it always did (so the existing "hard but fair by ~2 minutes" character survives), and the previously-unbounded late game is tamed into a genuine plateau. The `GAME.md` "Balanced-for-prototype reference" note above (wave 5 / ~550 pts / ~100s with a simple two-gun strategy) is superseded by this section for anything past wave ~5, where the two curves diverge.

**Verification:** re-read `waveHp`, `spawnCreep`, and `startWave` after the edit — `wave` is always ≥1 whenever `waveHp` is called (incremented before any spawn), so the `w-1` term inside the exponent never goes negative in a way that breaks the formula, `HP_TAU` is a nonzero constant (no division-by-zero risk), and the function is still pure/deterministic with no new state, so `resetGame()` needs no changes. Only the two `waveHp` literals were touched; every other constant, and all mechanics/controls/rendering, are byte-for-byte identical to the pre-balance version. A local headless-Chromium sanity check could not be run in this environment (snap-confinement/cgroup error unrelated to the game itself), so this pass was verified via careful re-reading of the changed logic plus a full numeric simulation of the wave schedule (see table above) rather than an in-browser playthrough.

## Edit Log

- **2026-07-28:** Fixed misleading feedback where the celebratory "Wave N cleared!" banner/message fired even when every creep in the wave reached the keep unopposed. A new `waveLeaked` flag now tracks whether any creep from the current wave reached the keep; if so, the wave-end message/banner reads "Wave N survived." / "WAVE N OVER" in a neutral muted color instead of the gold "Wave N cleared!" banner. Score bonus and all other mechanics unchanged.

## Assets

Promotional thumbnails (original poster-style illustrations inspired by the game's concept and palette, not screenshots of actual gameplay) live in `thumbnails/`:

| File               | Dimensions   | Intended web use                                                                 |
|---------------------|--------------|-----------------------------------------------------------------------------------|
| `thumb-small.png`  | 320 × 180 px | Compact rows in a games list / index page, sidebar links                          |
| `thumb-medium.png` | 640 × 360 px | Grid/card layout tiles on a games gallery page (the default "cover image")        |
| `thumb-large.png`  | 1280 × 720 px| Hero banner on the game's own page; also works directly as an Open Graph / Twitter Card social-preview image |

## Pipeline Token Usage

| Stage | Model | Tokens |
|---|---|---|
| game-creator | opus | 61569 |
| game-polisher | sonnet | 61405 |
| game-balancer | sonnet | 55082 |
| game-qa | sonnet | 92728 |
| game-editor | sonnet | 53361 |
| game-qa (re-verify) | sonnet | 39484 |
| game-thumbnailer | sonnet | 53859 |
| game-describer | sonnet | 22738 |
| **Total (subagent stages)** | | **440226** |

*Producer's own orchestration tokens aren't included above — they aren't observable from within its own execution, only each subagent call's reported usage is.*
