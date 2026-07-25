# Tip Line

**One-line pitch:** Drag a trail of dominoes around walls to every target, then tap GO — but some crossings are timed gates that only let your chain reaction through when they're open, so you read the rhythm and choose the moment to fire.

## The original twist

Most touch puzzle games either test *spatial* skill (route-finding, fitting through gaps) or *timing* skill (react to a moving cue), rarely both at once through the same single gesture. Tip Line combines them: you draw the entire solution up front with one continuous drag (a domino trail, capped by a limited domino "budget" so you can't just flood the board), and then the actual test happens afterward and mostly hands-off — the chain reaction propagates at a fixed, watchable speed along the path you already committed to. Some path segments are "gates": circular zones, flanked by mandatory wall chokepoints, that flip between open and closed on their own visible clock. Because the chain travels at constant speed, the moment you tap GO fully determines whether the wavefront arrives at each gate while it's open — so the skill isn't dodging or reacting in the moment, it's *predicting* a rhythm and picking your launch instant (and re-picking it on retry, since the trail stays intact and only the timing needs to change). It's part route-planning puzzle, part "read the beat and press play at the right time" reflex check, layered onto the very tactile, satisfying idea of watching your own drawn line of dominoes tip over one by one.

## How to play / controls

Touch or mouse, unified via Pointer Events (`pointerdown`/`pointermove`/`pointerup`) — fully playable with a finger on mobile or a mouse click-and-drag on desktop:

- **Drag from the gold "S" pin** to lay a trail of dominoes. The trail follows your finger/cursor exactly and cannot be dragged through gray walls (the trail simply stops extending until you steer around them). A limited domino budget (shown top-right as "Dominoes used/total") caps how long your trail can be, so efficient routing matters.
- **Tap GO** (bottom-left button) to ignite the first domino. The chain reaction then plays out automatically along your trail at a fixed speed — no further input needed until it resolves.
- **Tap Clear** (bottom-left, next to GO) to erase the current trail and start over, or just start a fresh drag from the pin at any time (before firing) to redraw automatically.
- After a run: if every target was toppled, tap **Next Level** to continue. If the chain stalled, tap **Fire Again** to retry the exact same trail (useful for re-timing past a gate) or **Redraw Path** to plan a new route.
- Nothing requires a keyboard. Essential controls (GO/Clear) sit at bottom-left, well clear of the bottom-right corner reserved for the site's rating widget.

## Core mechanics

- **Targets** (orange circles, turn green when toppled) must all be reached by the falling chain within a single run to clear the level.
- **Obstacles** (solid gray walls) block the trail from being drawn through them — you must route around.
- **Gates** (pulsing circles, green when open / red when closed, on a fixed period) are placed as mandatory chokepoints (flanked by walls so there's no way around). The chain's arrival time at a gate is fully determined by when you tapped GO plus the fixed travel speed, so a closed gate at that instant permanently halts the chain there for that attempt — any targets beyond it stay untoppled. The gate's cycle is visible and running continuously (even while you're still drawing), so you can watch and predict it before ever firing.
- **Domino budget**: each level has a fixed maximum trail length; once reached, the trail simply stops growing, forcing reasonably direct routing rather than looping everywhere.
- **Levels**: 5 hand-authored levels teach the pieces one at a time (straight shot → multiple targets → a wall to route around → a first gate → combining everything). From level 6 onward, levels are procedurally generated with more targets, more gates, faster/tighter gate cycles, and a generous-but-finite budget.

## Win / lose conditions

- **Clear a level** by firing a chain that reaches every target in one run — the game then advances to the next (harder) level. There is no final "win" screen; it's an endless, escalating sequence, and your best level reached is saved locally (shown on the start screen next time).
- **A single attempt "stalls"** (not a permanent game over) if the chain fails to reach every target — either because a gate was closed when the wavefront arrived, or because the drawn trail simply never reached a target. A stalled attempt just prompts an immediate retry (re-fire the same trail with better timing, or redraw the route entirely) — there are no lives, timers, or fail states beyond that, keeping the loop low-pressure and puzzle-like.

## Notes for visual polish

- Everything is drawn on a single full-screen `<canvas id="game">`; there is no sprite art at all yet — dominoes are just a stroked line (gray `#7d8bab` standing / gold `#e8c04a` toppled), targets are plain circles (orange `#d98a2b` / green `#3a9c6e`), obstacles are flat gray rectangles (`#454b5c`), and the start pin is a gold circle with a plain "S" glyph. All of this is placeholder — a great candidate for real domino-tile sprites/shadows, a more tactile "falling" tip animation per domino (currently it's just a colored line + a small white wavefront dot), and particle/flash feedback when a target topples or a gate blocks the chain.
- Gate zones currently render as a simple filled+stroked circle that switches between green/red; consider a more readable countdown affordance (e.g., a radial wipe or ticking arc) so players can read "how long until it flips" at a glance rather than just current state.
- HUD is a plain semi-transparent bar (`#hud`, top) with three text labels (Level / Targets / Dominoes) — no icons yet. Controls (`#controls`, bottom-left) are two flat buttons; a "Redraw"-style icon or clearer visual distinction between GO/Clear would help.
- The `#banner` result panel (top overlay) and `#start-screen` (full-screen intro) are both unstyled dark boxes with default system font — good candidates for the main visual identity pass (a domino/tile motif would fit the theme well).
- Board geometry is stored as fractions of the viewport (`fx`/`fy` in 0–1) and converted to pixels every frame, so the layout already reflows cleanly on resize/orientation change — polish passes can rely on this and don't need to touch the coordinate system.
- No audio at all currently (no sound engine wired up); a domino "tick" sound per tip and a distinct "clunk" for a gate block/topple would suit this game well if audio is ever in scope for a future pass.

## Visual Design

**Direction:** a dark, "control-room" minimalist look — near-black ink background, a single warm gold accent for the dominoes/fire theme, and a cool mint/coral pair for state-reading (open vs. closed, success vs. stall). Kept to system fonts and zero network requests/images; every visual (gradients, glow, particles, the domino tiles themselves) is drawn with inline CSS or canvas primitives, so the file stays a single lightweight offline HTML page.

- **Palette:**
  - Ink background `#0a0c12`, board fill is a soft radial gradient from `#1b2131` (upper-mid glow) to `#0e111a` (edges), plus a very faint 46px grid for depth/texture.
  - Gold `#f4c453` (dim `#b8912f`) — the start pin, toppled dominoes, budget indicator, title gradient warm end.
  - Mint `#3ddc97` — open gates, toppled/lit targets, GO button, "Level Clear" banner accent, targets HUD dot.
  - Coral `#ff5d72` — closed gates, gate-blocked flash, "Chain Stalled" banner accent.
  - Slate `#8a93ad` / wall `#333a4b` — standing dominoes and obstacles, kept desaturated so the gold/mint/coral state colors read clearly against them.
- **Typography:** system font stack only (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial`) — no webfont load. Start-screen `<h1>` uses a gold→mint gradient clipped to text for a bit of identity; HUD/buttons use bold weights with slight letter-spacing for a clean, technical feel.
- **HUD/controls:** the top bar is now a floating pill with backdrop blur and small colored status dots (slate/mint/gold) instead of plain text; GO gets a gradient fill and a soft pulsing glow (`goPulse` keyframes) whenever a valid trail is ready to fire, Clear is a ghost/outline button so the two are unmistakable at a glance.
- **Dominoes:** each path point now renders as a small standing tile (canvas `roundRect`, oriented perpendicular to the trail) instead of a flat stroked line. As the wavefront reaches a tile it plays a short eased "tip" animation — the tile foreshortens and slides forward while shifting from slate to gold with a brief gold glow — and the leading wavefront itself is a soft white radial-gradient spark rather than a flat dot.
- **Targets:** unlit targets get a slow ambient pulse ring (orange); on topple they flash a quick pop/scale animation and switch to a mint glow, plus a lightweight radial particle burst (canvas-drawn, no images) fired once per topple.
- **Gates:** kept the fill+stroke open/closed circle, but added a thin outer "ticking arc" that visibly sweeps down as the current phase (open or closed) runs out, addressing the earlier note about making the countdown legible rather than only a binary color state. A blocked gate now flashes an expanding coral shockwave ring, paired with a brief, purely cosmetic screen-shake on the whole canvas when a run stalls at a gate — both are cheap canvas/transform effects, no new game state affecting rules.
- **Banner/start screen:** the result banner and start screen are now real cards (rounded corners, subtle border, backdrop blur, drop shadow) instead of flat dark boxes; the banner tints its heading mint on clear / coral on stall so the outcome reads before the text does. The start screen adds a small row of CSS-only mini dominoes that loop through a tip animation to establish the theme before gameplay even starts.
- **Inspiration/sources (lightweight research budget: one search, no page fetches needed beyond the search summaries):** general guidance on minimalist game UI palettes — dark/near-black bases with a small number of saturated accent colors reserved for state and feedback, generous spacing, and simple sans typography — drawn from [Game UI Color Palette: Designing for High Contrast, Fast Reading, and Dark Environments](https://colorarchive.org/guides/game-ui-color-palette/), [Picking the Perfect Color Palette for Your Game (itch.io blog)](https://itch.io/blog/1039646/picking-the-perfect-color-palette-for-your-game), and [Gaming Color Palette Combinations](https://www.media.io/color-palette/gaming-color-palette.html). Adapted the "dark base + 2-4 accent colors" pattern to this game's own gold/mint/coral thematic set rather than copying any single example palette.

## Difficulty Tuning

**Goal:** keep the 5 hand-authored levels as the easy, low-pressure teaching ramp they already were, then have the endless procedural mode escalate *smoothly* from where they leave off and reach a "hard but fair" ceiling within roughly the first 1-3 minutes of procedural play, after which it plateaus (matching the "few minutes at a time" session length this game is designed for) rather than continuing to escalate indefinitely.

**What was wrong before:** all six procedural knobs (`targetCount`, `gateCount`, `extraObstacleCount`, gate `period`, gate `openFrac`, `gapHalf`) ramped linearly toward their caps at very different rates — reaching their floors/caps anywhere from procedural level 6 to procedural level 18 (i.e. overall level 12 through level 24). That's a 2-3x spread, meaning the "hard but fair" ceiling wasn't reliably reached within a short session, and some knobs kept getting easier-feeling relative to others for a long stretch, muddying the sense of a single coherent ramp. Separately, the very first procedural level (level 6, `n=0`) reused a *looser* gate period/openFrac (3000ms / 0.6) than hand level 5 had just used (2600ms / 0.55) — a small but real regression right at the hand-to-procedural handoff, where difficulty should keep climbing, not dip.

**What changed:** every procedural ramp now starts at (or continues) roughly where hand level 5 left off, and all of them reach their same original ceiling values by procedural level 7-8 (overall level 13-14) via staggered capped-linear ramps (each knob caps at a slightly different `n` — 7, 8, or 8 — so no single level absorbs every increment at once):

| Knob | Old formula | Old cap reached at | New formula | New cap reached at |
|---|---|---|---|---|
| `targetCount` | `2 + min(4, floor(n/2))` | n=8 (lvl 14) | `2 + min(4, floor(n/1.75))` | n=7 (lvl 13) |
| `gateCount` | `1 + min(2, floor(n/5))` | n=10 (lvl 16) | `1 + min(2, floor(n/4))` | n=8 (lvl 14) |
| `extraObstacleCount` | `min(3, floor(n/3))` | n=9 (lvl 15) | `min(3, floor(n/2.5))` | n=8 (lvl 14) |
| gate `period` (ms) | `max(1400, 3000 - n*90)` | n≈18 (lvl 24) | `max(1400, 2500 - n*137.5)` | n=8 (lvl 14) |
| gate `openFrac` | `max(0.42, 0.6 - n*0.015)` | n=12 (lvl 18) | `max(0.42, 0.52 - n*0.0125)` | n=8 (lvl 14) |
| `gapHalf` | `max(0.08, 0.12 - n*0.004)` | n=10 (lvl 16) | `max(0.08, 0.12 - n*0.005)` | n=8 (lvl 14) |

The **ceiling values themselves are unchanged** (same 6 targets / 3 gates / 3 extra obstacles / 1400ms period / 0.42 open-fraction / 0.08 gap-half caps as before) — only how quickly the game climbs to that ceiling changed, and the domino `budget` formula (`74 + targetCount*18 + gateCount*14 + extraObstacleCount*6`) was left untouched since it already tracks those counts automatically and scales its ceiling (242) in step. This satisfies "don't make the game harder overall by default": the hardest the endless mode ever gets is identical to before, it's just reached at a well-paced tempo instead of a too-slow one.

**Traced curve (level → key stats), computed from the formulas above:**

| Level | Source | Targets | Gates | Extra obstacles | Domino budget | Gate period | Gate open % |
|---|---|---|---|---|---|---|---|
| 1 | hand | 1 | 0 | 0 | 55 | — | — |
| 2 | hand | 2 | 0 | 0 | 70 | — | — |
| 3 | hand | 1 | 0 | 1 wall | 78 | — | — |
| 4 | hand | 1 | 1 | 0 (2 flanking walls) | 78 | 3000ms | 60% |
| 5 | hand | 2 | 1 | 0 (2 flanking walls) | 96 | 2600ms | 55% |
| 6 | procedural n=0 | 2 | 1 | 0 | 124 | 2500ms | 52% |
| 8 | procedural n=2 | 3 | 1 | 0 | 142 | 2225ms | 49.5% |
| 10 | procedural n=4 | 4 | 2 | 1 | 180 | 1950ms | 47% |
| 12 | procedural n=6 | 5 | 2 | 2 | 204 | 1675ms | 44.5% |
| 14 | procedural n=8 | 6 | 3 | 3 | 242 | 1400ms | 42% |
| 20+ | procedural n≥8 | 6 | 3 | 3 | 242 | 1400ms | 42% (plateau) |

Reading the trace: levels 1-3 are trivial (single/double target, no timing pressure, very generous budgets) so a new player learns dragging, routing, and firing with zero risk of failure. Level 4 introduces the timing-gate mechanic with a very forgiving 60%-open cycle; level 5 tightens it slightly while adding a second target. From there the procedural mode continues the *same downward trend* on gate timing (2600ms→2500ms→2225ms..., 55%→52%→49.5%...) rather than resetting looser, so there's no felt dip at the level 5→6 seam. Target/gate/obstacle counts and gate tightness then climb together smoothly and reach the same hard-but-fair ceiling the original design intended by around level 13-14 — roughly 8-9 levels of procedural play, which at an estimated 10-25 seconds per level (including an occasional mistimed-gate retry) lands the ceiling within about the first 2-4 minutes of endless-mode play. Every level from 14 onward plays at that fixed ceiling difficulty indefinitely, so skilled players get a long, consistently challenging tail without the game continuing to escalate past what's "fair."

## Playtesting notes (from build-time verification)

Automated pointer-drag testing (via a headless Chromium + Puppeteer harness driving real `mousedown/mousemove/mouseup`, which the game treats identically to touch through Pointer Events) confirmed, with zero console/page errors:
- Drawing a trail, obstacle-blocking (a diagonal drag that clips a wall's corner correctly halts the trail early — confirms collision detection is working, not a bug), and budget capping all behave as designed.
- Levels 1–4 (straight shot, two targets, wall routing, first gate) were each completed successfully end-to-end.
- A genuine gate-closed stall was reproduced (firing immediately after drawing on Level 4), producing the "Chain Stalled — a gate was closed" banner, and the "Fire Again" retry flow was confirmed to eventually clear the level once fired at a better real-world moment — validating the core timing-retry loop.

## Assets

Promotional thumbnails (original poster-style illustrations composed from this game's own palette and motifs — not screenshots of gameplay) live in `thumbnails/`:

| File               | Dimensions   | Intended web use                                                                 |
|---------------------|--------------|-----------------------------------------------------------------------------------|
| `thumb-small.png`  | 320 × 180 px | Compact rows in a games list / index page, sidebar links                          |
| `thumb-medium.png` | 640 × 360 px | Grid/card layout tiles on a games gallery page (the default "cover image")        |
| `thumb-large.png`  | 1280 × 720 px| Hero banner on the game's own page; also works directly as an Open Graph / Twitter Card social-preview image |

## Pipeline Token Usage

| Stage | Model | Tokens |
|---|---|---|
| game-creator | sonnet | 105,830 |
| game-polisher | sonnet | 85,349 |
| game-balancer | sonnet | 69,737 |
| game-qa (attempt 1 — interrupted mid-run by a transient API error, no findings produced) | sonnet | 68,012 |
| game-qa (attempt 2 — completed; retried fresh after the interruption) | sonnet | 179,089 |
| game-thumbnailer | sonnet | 46,046 |
| game-describer | sonnet | 20,393 |
| **Total (subagent stages)** | | **574,456** |

*game-editor was not invoked — game-qa's completed playtest found no bugs or evidenced usability problems requiring a fix, only low-priority polish observations.*

*Producer's own orchestration tokens aren't included above — they aren't observable from within its own execution, only each subagent call's reported usage is.*
