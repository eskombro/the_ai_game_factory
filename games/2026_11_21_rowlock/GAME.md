# Rowlock

**Pitch:** A falling-block puzzle where you can't touch the falling block. Slide the rows of the stack beneath it instead, and let everything crumble into place.

## The original twist

Classic falling-block games have you steer the piece over a fixed stack. Rowlock reverses that: **each piece falls in a fixed column, and the stack is what moves.** Every row slides sideways and wraps around like a combination-lock tumbler. Rows that just took a landing lock for one turn, so each move has to plan around the part of the stack you can't shift.

## How to play (touch first, mouse works the same way)

All input uses unified Pointer Events (`pointerdown` / `pointermove` / `pointerup` / `pointercancel`) plus `click` on the overlay button. Nothing needs a keyboard.

1. **Start screen:** tap **Start**.
2. **Slide a row:** press anywhere on a row and drag left or right. It moves one cell per 0.75 cell of finger travel and wraps at the edges. Two fingers can slide two rows at once.
3. **Drop (optional):** tap **DROP** to land the piece immediately. Otherwise it falls by itself.
4. **Plan ahead:** the top-right preview shows the next piece *in the column it will fall in*. The outlined cells on the board show where the current piece will land.

## Core mechanics

- **Board:** 7 columns by 13 rows. It starts with an uneven settled skyline up to 3 cells high, with at least one empty column.
- **Sliding:** a row can't slide if it is locked or if the move would push a cell into the falling piece.
- **Landing:** a grounded piece locks after 450 ms. Only real descent refills that timer, so sliding back and forth can't stall the game. If a gap opens under a grounded piece, it drops at once.
- **Crumble:** after each landing, every column collapses downward, so no holes survive. The real goal is levelling the skyline: slide cells off tall columns so they fall into short ones.
- **Rowlock:** rows holding the just-landed piece's cells (after crumbling) are locked until the next piece lands. They show diagonal stripes.
- **Pieces:** 1 to 4 cells, no rotation. Larger shapes get more common at higher levels.
- **Escalation:** level = 1 + floor(lines / 5). Fall interval is `max(130, 850 × 0.84^(level−1))` ms. From level 4, every `max(5, 11 − level)` landings, one junk cell lands on each of the two tallest columns.

## Scoring, win/lose

- A landing that clears 1 / 2 / 3 / 4 rows scores 100 / 300 / 500 / 800 × level.
- Consecutive clearing landings add a combo bonus of 50 × (combo − 1) × level.
- **Win:** clear 40 rows.
- **Lose:** a new piece has no room to spawn, or junk overflows a full column.
- The end screen shows score, lines, and best score, with **Play Again**. Best score is saved in `localStorage` when available. Hiding the page pauses the game and shows **Resume**.

## Tuning knobs (top of the script)

`COLS`, `ROWS`, `WIN_LINES`, `LINES_PER_LEVEL`, `START_ROWS`, `BASE_FALL_MS`, `FALL_DECAY`, `MIN_FALL_MS`, `LOCK_DELAY_MS`, `GARBAGE_FROM_LEVEL`, `JUNK_CELLS`, `DRAG_STEP_RATIO`, `LINE_SCORE`, `COMBO_SCORE`. Shape odds per level are in `pickShape()`, and the junk cadence is in `lockPiece()`.

## Notes for visual polish

- **DOM:** `#hud` (`#score`, `#lines`, `#level`, `#best`, `canvas#next`), `#wrap` > `canvas#board`, `#bar` > `#drop`, and one reused `#overlay` (`#ovTitle`, `#ovText`, `#action`, toggled with `.hidden`).
- **Canvas:** all drawing is in `draw()`, sized in `resize()` from an integer `cell`. The next preview is 91×52 CSS px, and its 13 px cells map to the 7 board columns, so keep that mapping if it is resized.
- **Placeholder colors:** page `#181b22`, board `#0e1015`, grid `#262b36`, held row `#2a3242`, junk `#6b7280`, piece colors in `COLORS`, DROP `#3b82f6`, Start `#22c55e`.
- **Keep readable:** locked rows must stay distinct without relying on color (currently hatching), and the landing outline is essential information.
- **Good spots for juice:** row slide, crumble (currently instant), row clear, and lock on/off.
- **Bottom-right corner:** `#bar` keeps 76 px of right padding and the board ends above it, leaving the rating widget's area free. Keep it that way.

## Visual Design

**Direction: machined brass on gunmetal.** The board is treated as the inside of a combination lock: rows are engraved grooves, tiles are small machined parts, and locked rows get brass bolts.

**Palette**

| Role | Color |
| --- | --- |
| Page / board well | `#171a1e` / `#101317` |
| Grooves / ticks | `#252b32` / `#3a424b` |
| Primary accent (brass) / button edge | `#d8a23a` / `#9c6f1f` |
| Text and landing outline (ivory) | `#f1e8d6` |
| Secondary text (steel) | `#8d959c` |
| Lost title (oxide) | `#c8603f` |
| Junk | `#58616a`, plus a center rivet |
| Pieces | `#d8a23a` `#c8703a` `#b5483a` `#ddd0b3` `#5fa08f` `#3f7f92` `#94668a` |

**Type:** the system monospace stack only (`ui-monospace`, SF Mono, Menlo, Consolas, Liberation Mono). Labels and buttons are uppercase and letterspaced, like stamped metal. No web fonts.

**Motion:** row slides ease and wrap across the edges, blocks visibly crumble, cleared rows flash and collapse, lock bolts slide in, the board gives a 1.5-3 px landing kick, and the score pulses. All of it is skipped or reduced under `prefers-reduced-motion`. There is no audio.

**Readability:** locked rows keep diagonal hatching and add end bolts, held rows show arrows, junk has a rivet, and the falling piece has an ivory edge, so none of these states rely on color alone.

**Implementation note:** effects live in the rendering section and work by comparing each frame with a snapshot of the previous one. The kick is drawn inside the canvas and the frame is a `box-shadow`, so the board's rect, which input maps to rows, is never transformed.

**Inspiration**

- [WARDLOCK](https://csaf.itch.io/wardlock): brass lock plates with engraved channels.

## Difficulty Tuning

**Why:** a bot making one well-chosen row slide per piece won 80/80. The old fall interval (850 ms/row, about 10 s per piece at level 1, still about 3 s at level 8) gave far more thinking time than a human needs, and the 40-line win would take 8+ minutes. Retuned for human-paced time pressure and roughly a 4-5 minute win.

**Curve:** level = 1 + floor(lines / 4). Fall interval = `max(90, 380 × 0.87^(level−1))` ms per row, so a piece takes about 4 s to fall at level 1 (easy, time to learn), about 2.7 s at level 3, about 1.5 s at level 8 (lines 28+), and about 1.1 s at level 10 (win zone). Ceiling is reached around lines 30-36, i.e. about 2.5-4 minutes in, and the 90 ms floor is only hit past level 13 (unreachable before the win at 40 lines). Lock delay now scales: `min(450, 150 + 1.5 × interval)` ms (450 through level 3, about 330 ms by level 9) so late grace shrinks smoothly. Junk starts at level 5 (lines 16+) rather than 4, cadence unchanged (every `max(5, 11 − level)` landings), offsetting the faster level pace.

| Constant | Old | New |
| --- | --- | --- |
| `BASE_FALL_MS` | 850 | 380 |
| `FALL_DECAY` | 0.84 | 0.87 |
| `MIN_FALL_MS` | 130 | 90 |
| `LINES_PER_LEVEL` | 5 | 4 |
| `GARBAGE_FROM_LEVEL` | 4 | 5 |
| Lock delay | fixed 450 ms | `min(450, 150 + 1.5 × interval)` |

Not changed: board size, win at 40 lines, shapes, scoring, controls. Estimates are by calculation, not bot-verified; if a bot still wins most games, the next lever is a lower `BASE_FALL_MS` or more junk (`JUNK_CELLS`).

## Assets

Thumbnails live in `thumbnails/`:

| File               | Dimensions   | Intended web use                                                                 |
|---------------------|--------------|-----------------------------------------------------------------------------------|
| `thumb-small.png`  | 320 × 180 px | Compact rows in a games list / index page, sidebar links                          |
| `thumb-medium.png` | 640 × 360 px | Grid/card layout tiles on a games gallery page (the default "cover image")        |
| `thumb-large.png`  | 1280 × 720 px| Hero banner on the game's own page; also works directly as an Open Graph / Twitter Card social-preview image |

These are original illustrations inspired by the game's concept and palette, not screenshots.

## Pipeline Token Usage

| Stage | Model | Tokens |
|---|---|---|
| game-creator | per agent frontmatter default | 55140 |
| game-polisher | per agent frontmatter default | 58268 |
| game-balancer | per agent frontmatter default | 22151 |
| game-qa | per agent frontmatter default | 30594 |
| game-thumbnailer | per agent frontmatter default | 23417 |
| game-describer | per agent frontmatter default | 14246 |
| **Total (subagent stages)** | | **203816** |

*Producer's own orchestration tokens aren't included above — they aren't observable from within its own execution, only each subagent call's reported usage is.*
