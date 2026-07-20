# Roll Call

**One-line pitch:** Swipe to slide every colored marble at once across an ice-like grid, and once a marble reaches its own goal it locks in place and becomes a wall for the rest — so the order you solve them in is the real puzzle.

## The original twist

Sliding-until-you-hit-a-wall is a familiar mechanic on its own, but Roll Call combines it with two things that aren't commonly paired:

1. **One swipe moves every marble simultaneously**, in the same direction, each independently sliding until it hits a wall, the board edge, or another marble. There's no way to move a single piece in isolation — every plan has to account for all marbles reacting to the same input at once.
2. **Reaching a goal locks a marble permanently.** A solved marble stops responding to swipes and becomes a static obstacle for the others. This turns "solve the marbles in the right order" into the core puzzle logic — solving marble A first might be exactly what you need to create a wall that stops marble B in the right place, or it might permanently block the only path marble B had left, forcing a rethink (or an Undo).

This is not a clone of any single well-known game; it borrows the general "slide until obstruction" idea (seen in some maze puzzles) but the shared single-input-for-all-pieces mechanic plus permanent-lock-as-obstacle is a fresh combination not otherwise represented in this repo.

## How to play / Controls (touch-only)

- **Swipe** anywhere on the board (up, down, left, or right) to slide every unlocked marble one full step in that direction, stopping each one individually when it hits a wall, the board edge, or another marble.
- **Tap "Undo"** to step back one swipe (works even after failing a level — it un-fails you).
- **Tap "Restart"** to reset the current level from scratch.
- **Tap "Next Level" / "Retry Level" / "Play Again"** on the overlay screens to progress.
- All input is handled via Pointer Events (`pointerdown` / `pointermove` / `pointerup`) with `touch-action: none`, so it works with a finger on a phone screen with no keyboard or mouse required. A swipe shorter than 20px is ignored as a tap (no-op), so accidental taps don't waste a move.

## Core mechanics

- The board is an N×N grid (grows from 4×4 up to 7×7 across the 9 levels) with some internal walls (drawn as thick gold segments on cell edges).
- Each marble has a color and a matching goal ring of the same color.
- On a swipe, marbles are processed in an order based on the direction of travel (the one furthest along the direction of motion moves first) so that trailing marbles correctly stack up behind ones that stopped ahead of them.
- A marble whose position equals its own goal cell is considered **locked**: it is skipped during future swipes (never moves again) and rendered with a white ring, and it now blocks other marbles from passing through or landing on its cell.
- Swipes that don't move any marble at all don't count against your move total (no penalty for an accidental no-op swipe).
- Every level ships with a `par` (the true minimum number of swipes, verified offline with a breadth-first search solver over the level's state space) and a `moveLimit` of `par + 3`.

## Win / lose conditions

- **Level win:** every marble is locked on its own goal. Stars are awarded based on efficiency: 3 stars if solved in ≤ par moves, 2 stars if ≤ par+1, 1 star otherwise (only reachable up to the move limit).
- **Level lose:** the move counter reaches `moveLimit` before every marble is locked. An "Out of Moves" overlay appears with a Retry button; Undo also works from this state to take back the last swipe and keep playing instead of a full restart.
- **Game complete:** all 9 levels solved. A summary screen shows total stars out of 27, with a "Play Again" button that resets everything (level 1, 0 stars).

## Level data & validation

All 9 levels are hand-picked from a random generator and validated offline with a small BFS solver (positions of all marbles form the state; each state has up to 4 successor states, one per swipe direction) to guarantee every level is solvable and to compute the true `par`. This was necessary because the "lock on goal" rule makes some naive wall layouts unsolvable (a marble can permanently block the only path to another marble's goal) — the solver caught and eliminated several such broken layouts during design.

## Notes for visual polish

- All colors are functional placeholders: background `#202024`/`#2c2c33`, grid lines `#45454e`, walls `#e9c46a` (gold), marble colors `#e63946` (red), `#457b9d` (blue), `#2a9d8a` (teal), `#f4a261` (orange), locked-marble ring `#ffffff`. These are legible but entirely unstyled — a good target for a full palette/theme pass.
- The board is drawn on a single `<canvas id="board">` inside `#boardWrap`; grid, walls, goal rings, and marbles are all redrawn from scratch every frame in `render()` — an animation/tweening pass (e.g. lerping marble position over a few frames instead of snapping) would add a lot of "juice" here, since right now marbles teleport instantly to their stopped position on every swipe.
- The four overlay `<div class="overlay">` elements (`#startOverlay`, `#winOverlay`, `#loseOverlay`, `#finishOverlay`) are plain dark boxes with default button styling — a good target for iconography (stars, lock icons, colored marble icons matching the palette) and transition animations.
- HUD (`#hud`) is plain text-only (`Level X / 9`, `Moves: X / Y`, `Stars: N`) — no icons or color coding yet (e.g. could tint the moves counter as it approaches the limit).
- The gold wall color and white lock-ring are purely functional choices for contrast against the dark board; feel free to reinterpret visually (e.g. as ice cracks, magnetic clamps, etc.) as long as walls remain clearly distinguishable from the grid lines and locked marbles remain clearly distinguishable from active ones.
- Difficulty pacing (grid sizes 4→7, marble counts 1→4, `par` values 2,4,3,7,5,9,10,10,13, and the `SLACK = 3` move-limit buffer) was generated automatically and only loosely checked for a smooth ramp — this is a good target for the balancer pass (par is not perfectly monotonic level-to-level, e.g. level 3's par of 3 is lower than level 2's par of 4).

## Visual Design

Applied a "frosted ice at night" theme: a cool, deep navy/charcoal backdrop with sparse glassmorphism (frosted, blurred, translucent panels) reserved for just the HUD badges and the overlay cards, so the glass effect reads clearly instead of being overused. Direction was informed by a quick look at minimalist puzzle/game-jam UI trends (flat design + restrained pastel/neutral palettes, Monument-Valley-style negative space) and current glassmorphism guidance (blur 3–6px, a visible 1px light border, and only 1–3 glass elements per screen so it doesn't collapse into a flat blur). No mechanics, level data, or marble colors were touched — only how existing values are drawn/rendered.

- **Palette:** page background is a dark navy/charcoal gradient (`#0c1220` → `#070a12` with a subtle top glow). The board itself is a slightly lighter frosted slab (`#1b2740` → `#121a2c`). Existing marble hex colors from the level data (`#e63946` red, `#457b9d` blue, `#2a9d8a` teal, `#f4a261` orange) were kept exactly as-is (untouched data) and reused as the game's own accent set: they now double as the HUD's danger/warn colors and the button gradient (`#457b9d` → `#2a9d8a`), tying the UI chrome back into the game's own identity instead of introducing new arbitrary colors. Walls were reinterpreted from flat gold bars into glowing icy-cyan "frost cracks" (`#8ecae6` with a soft shadow-blur glow) to better match the "ice-like grid" pitch. Locked marbles keep a white ring but with a soft glow instead of a plain hard-edged stroke.
- **Typography:** system-font stack only (`-apple-system, BlinkMacSystemFont, "Segoe UI", "Segoe UI Rounded", Roboto, Helvetica Neue, Arial`) — no network font loads, keeping the file a single fast, offline-capable HTML document. Headings use bold weight, slight letter-spacing, and a soft cyan text-glow; HUD badges are compact pill shapes with color-coded text (the moves counter shifts from a calm teal to amber to red as the move limit approaches, giving at-a-glance urgency feedback).
- **Layout:** HUD entries became rounded pill "chips" on a faint frosted strip; the board sits in a rounded frosted card with an outer glow/shadow; overlays (start/win/lose/finish) now render as a centered glass "card" (blurred backdrop, translucent fill, light border, drop shadow) with a spring-like scale-in transition instead of an opaque full-bleed box.
- **Motion/juice (all cosmetic, no gameplay change):** marbles now animate smoothly between cells on a swipe (a ~150ms eased slide) instead of snapping instantly, addressing the "instant movement" note. A marble that newly locks onto its goal gets a brief ~260ms pop/overshoot animation on its glow ring. An invalid/no-op swipe now gives a quick screen-shake on the board instead of silent nothing. Marbles render as glossy gradient-shaded beads (radial gradient + soft drop shadow) rather than flat-filled circles, and goal cells are drawn as dashed rings in the marble's own color. Overlay panels fade and scale in/out via CSS transitions, and buttons scale down slightly on press for tactile touch feedback. All of this was verified with Playwright (system default in this repo, `node_modules/playwright`) driving simulated pointer swipes end-to-end — movement, wall-blocking, locking, star scoring, undo, restart, and level progression all still behave identically to before the visual pass.

## Difficulty Tuning

No level layouts, walls, marble positions, colors, or core mechanics were touched — every level's `par` was re-verified with an independent BFS solver (all 9 matched the shipped values exactly) before tuning. Two pacing-only levers were changed: **level order** and **the move-limit slack formula**.

**1. Level order (fixes an uneven par ramp):** the previous order produced pars `2, 4, 3, 7, 5, 9, 10, 10, 13` — level 4 (par 7) was immediately followed by level 5 (par 5), a 2-move *drop* in required moves right as a third marble (and its added lock/blocking interactions) was introduced, which read as a difficulty regression despite the board getting more complex. The old levels 4 and 5 (both 5×5) were swapped so the 3-marble/par-5 board now comes first and the 2-marble/par-7 board follows, giving pars `2, 4, 3, 5, 7, 9, 10, 10, 13` — non-decreasing except for a single, deliberate small dip (4 → 3) at the exact point the game introduces its second marble; that dip is intentional breathing room so a new mechanic (multi-marble interaction/locking) is introduced at a slightly *shorter* puzzle rather than piling a new mechanic on top of a raw move-count increase. Grid size and marble count still climb in the same broad strokes as before (4×4×1 → 5×5×2/3 → 6×6×3/4 → 7×7×4).

**2. Move-limit slack now scales gently with par instead of a flat +3:** `moveLimit = par + slackForPar(par)`, where `slackForPar(par) = 2 + round(par * 0.3)`. Old vs. new per level (in final order):

| Level | Size | Marbles | Par | Old moveLimit (par+3) | New slack | New moveLimit | Limit/Par ratio |
|---|---|---|---|---|---|---|---|
| 1 | 4×4 | 1 | 2  | 5  | 3 | 5  | 2.50 |
| 2 | 4×4 | 1 | 4  | 7  | 3 | 7  | 1.75 |
| 3 | 5×5 | 2 | 3  | 6  | 3 | 6  | 2.00 |
| 4 | 5×5 | 3 | 5  | 8  | 4 | 9  | 1.80 |
| 5 | 5×5 | 2 | 7  | 10 | 4 | 11 | 1.57 |
| 6 | 6×6 | 3 | 9  | 12 | 5 | 14 | 1.56 |
| 7 | 6×6 | 4 | 10 | 13 | 5 | 15 | 1.50 |
| 8 | 7×7 | 4 | 10 | 13 | 5 | 15 | 1.50 |
| 9 | 7×7 | 4 | 13 | 16 | 6 | 19 | 1.46 |

No level's limit ever got tighter than before (slack is always ≥ 3, matching or exceeding the old flat value), so nothing got harder by default — only the later, more move-heavy boards (where a single misread swipe costs more relative progress) picked up extra forgiveness, while the short early levels stay tight enough to still require real precision.

**Why this curve:** with the reordered pars (2, 4, 3, 5, 7, 9, 10, 10, 13), a player solving at par plays roughly 2 → 6 → 9 → 14 → 21 → 30 → 40 → 50 → 63 cumulative moves across the 9 levels — level 1 is a two-swipe "learn the controls" level, levels 2-3 stay small and introduce the second marble/lock-as-wall twist without a spike, levels 4-6 (pars 5, 7, 9) form the smooth ramp into "hard but fair" territory (roughly the first minute or two of real play for a typical player, once retries/thinking time are included), and levels 7-9 plateau at a high-but-fair ceiling (par 10, 10, then a final par-13 capstone) so the last part of the session tests a now-warmed-up player without a jarring final spike. The generous early slack (up to 2.5x par on level 1) means a new player can fumble a swipe or two while learning without failing, while the tighter late-game ratio (down to ~1.46x on the final level) keeps the hardest boards from feeling trivially forgiving, matching the intended "easy start, smooth ramp, hard-but-fair finish" curve for a few-minutes-long session.

Old key constants: level order `par 2,4,3,7,5,9,10,10,13`; flat `SLACK = 3` (`moveLimit = par + 3` for every level).
New key constants: level order `par 2,4,3,5,7,9,10,10,13`; `slackForPar(par) = 2 + round(par * 0.3)` (`moveLimit = par + slackForPar(par)`, ranging from +3 on the easiest levels to +6 on the hardest).

## Assets

Promotional thumbnails were generated as original illustrations inspired by the game's concept and palette (not screenshots of actual gameplay), saved under `thumbnails/`:

| File               | Dimensions   | Intended web use                                                                 |
|---------------------|--------------|-----------------------------------------------------------------------------------|
| `thumb-small.png`  | 320 x 180 px | Compact rows in a games list / index page, sidebar links                          |
| `thumb-medium.png` | 640 x 360 px | Grid/card layout tiles on a games gallery page (the default "cover image")        |
| `thumb-large.png`  | 1280 x 720 px| Hero banner on the game's own page; also works directly as an Open Graph / Twitter Card social-preview image |

The artwork depicts a stylized "frosted ice at night" board: a frosted glass grid card on a deep navy backdrop, glowing icy-cyan frost-crack walls, four glossy gradient marble beads in the game's actual accent colors (red `#e63946`, blue `#457b9d`, teal `#2a9d8a`, orange `#f4a261`) with dashed goal rings in matching hues, one marble shown locked on its goal with a soft white glow ring, and a "ROLL CALL" logo lockup in the lower-left using the game's own system-font stack.
