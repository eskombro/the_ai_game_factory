# Stepwright

**One-line pitch:** You can't steer the walker — you drag the ground columns up and down so every next step stays inside his stride.

## The original twist

Every endless runner puts you in control of the runner (jump, slide, swap lanes). Stepwright inverts it: the walker is a metronome you cannot touch, and the *terrain* is the controller. Your finger reshapes the landscape a few columns ahead of him, under a hard stride rule (climb 1, drop 3). The result plays like a real-time terraforming puzzle rather than a reflex dodge — and the greed layer (floating coins that only trigger when a column's top lines up exactly with them) pushes you to build deliberate staircases up into danger instead of just flattening everything.

## How to play / controls (touch-only, mouse-equivalent)

All input is unified through **pointer events** (`pointerdown` / `pointermove` / `pointerup` / `pointercancel`) on the canvas, so identical behaviour on touch and mouse. There is no keyboard path anywhere in the game.

- **Start screen:** tap the big `START` button (centered).
- **Drag a column:** press anywhere in a column's vertical strip — its top snaps to your finger, then follows it while you slide up/down. Release to let go.
- **Multi-touch:** each active pointer grabs its own column (a `Map` of `pointerId -> column index`), so two fingers can sculpt two columns at once.
- **Game over:** tap `PLAY AGAIN` (centered) to restart immediately.

Constraints that shape the control scheme:
- You cannot edit the column the walker is standing on, or anything behind him.
- You cannot reach past the dashed vertical **reach line** at `W - 88px` — the right-hand strip is preview-only. This deliberately keeps the entire bottom-right corner free of required tap targets (`play.html`'s rating widget lives there), along with the 92px bottom HUD band that sits below the ground line and never accepts a grab.
- A grab must begin above the ground line and below the top HUD band; once you're dragging, the finger can travel anywhere.

## Core mechanics

- The world is an infinite row of columns, each with an integer height level `0..8`. Column geometry is stored in column units, so resizing/rotating never desyncs the world.
- The walker advances at a constant speed measured in **columns per second** (`SPD_MIN 0.75` → `SPD_MAX 2.10`, ramping over the first `150` steps).
- Each time he crosses into a new column, the step is judged: `to - from > 1` (too high) or `from - to > 3` (too far down) = **stumble**.
- **Stumble:** lose a heart, screen shake, and the walker is frozen for `0.7s` while he recovers onto the new column — the freeze doubles as a small grace window to repair the ground ahead.
- **Column types:**
  - *Free* (slate) — draggable across the full `0..8` range.
  - *Bedrock* (dark red) — locked; the height is fixed and the column flashes if you try to grab it.
  - *Clamped* (amber) — draggable only between two dashed range markers.
  - Generation guarantees **no two special (bedrock/clamped) columns are ever adjacent**, so a legal height for the next step always exists — the puzzle is never unsolvable, only tight.
- **Coins:** float above some free columns at a fixed level `2..6`, with a dashed tick showing the exact height needed. Collected only if that column's top level equals the coin's level when the walker arrives — i.e. you must build a legal staircase (+1 per step) up to it.
- **Readability aid:** the immediately-next column shows a translucent green band covering the currently legal landing heights.

## Win / lose conditions

- No win state — it's an endless score chase.
- **Lose:** 3 hearts, one lost per stumble; at 0 hearts the run ends and the game-over overlay shows Steps / Coins / Score.
- **Score** = `steps + coins * 10`.

## Difficulty escalation

1. Columns `0..13` are pre-flattened at level 2 as a free tutorial runway (`TUTORIAL_LEN`).
2. Walker speed ramps from 0.60 to 2.10 columns/sec over 170 steps (`SPD_RAMP`) — the window to fix each incoming column shrinks from ~1.7s to ~0.5s.
3. Special-column frequency ramps from **zero** the moment the tutorial ends, up to bedrock `30%` / clamped `28%` over the next 160 columns (`d = (i - TUTORIAL_LEN) / SPECIAL_RAMP`, `pLock = 0.30·d`, `pClamp = 0.28·d`).
4. Free columns spawn at fully random heights, so there is always work to do — the pressure is throughput, not a single hard obstacle.

*(All of the above constants are grouped at the top of the script for the balancer: `MAXH`, `MAX_UP`, `MAX_DROP`, `HEARTS_START`, `SPD_MIN`, `SPD_MAX`, `SPD_RAMP`, `STAGGER`, `COIN_VALUE`, `TUTORIAL_LEN`, `SPECIAL_RAMP`, plus the `pLock` / `pClamp` / coin-chance expressions inside `genCol`. See "Difficulty Tuning" below for the current curve and the reasoning behind it.)*

## Notes for visual polish

- **Everything gameplay is one `<canvas id="cv">`** filling the viewport; overlays and HUD are DOM on top.
- Key DOM nodes: `#hud` (hearts / steps / score, top strip, `pointer-events: none`), `#footer` (bottom 92px band, currently just a rules reminder — free real estate for art), `#startScreen` and `#overScreen` (`.overlay`, toggled via the `hidden` class), `.btn` buttons `#startBtn` / `#againBtn`.
- **Do not shrink these reserved regions**, they are load-bearing for input and for the rating widget: `RIGHT_MARGIN = 88` (right strip, non-interactive), `BOTTOM_BAND = 92` (below the ground line, non-interactive), `TOP_BAND = 40` (HUD strip, non-interactive). `groundY = H - BOTTOM_BAND`.
- Current placeholder colors: background `#14161d`, ground slab `#1b1f2a`, free column `#3f4756` body / `#79899f` cap, bedrock `#5d2d2d` / `#8a4444`, clamped `#5c4d27` / `#a08637`, invalid-grab flash `#7d3030` / `#c15b5b`, walker `#f2f5fa` (hurt `#ff7a7a`), coin `#ffd24a`, legal-landing band `rgba(110,225,160,0.16)`, reach line `rgba(230,235,245,0.28)` dashed.
- The walker is a placeholder rectangle + circle drawn at `wx, wy` with a lerped `drawLevel` — a walk cycle / squash on landing is the highest-value juice here, plus a distinct stumble animation (currently only a red tint + `shake`).
- Column caps, the coin's target tick, and the green legal band are the three things a player reads under time pressure — keep their contrast high in any restyle.
- Colour is currently the *only* signal distinguishing bedrock / clamped / free columns; a polish pass should add a non-colour cue (hatching, icon, outline style) for colour-blind readability.

---

## Visual Design

**Direction: "drafting table blueprint."** A *wright* is a builder, so the game is dressed as a site plan being drawn in real time: a deep ink-navy field, a faint blueprint grid whose horizontal lines snap to the level heights, a ruler-ticked ground rail, and columns rendered like extruded material samples. All of it is CSS + canvas primitives — no images, no fonts, no network calls; the file is still a single self-contained HTML.

### Palette (60 / 30 / 10)

| Role | Value |
| --- | --- |
| Field (60%) — sky gradient / vignette | `#141d2f` → `#080c15`, ground slab `#05080e`, far parallax `#131b2b` |
| Blueprint linework | `rgba(146,190,238,0.055)` minor, `0.11` major, ground rail `0.26` |
| Structure (30%) — free column | body `#38465f` → `#232e45`, cap `#93b2d6`, cap highlight `#cbdef4` |
| Bedrock | body `#4a2b33` → `#2f1b22`, cap `#a5626b` / `#d3808c`, hatch `rgba(255,155,155,0.20)` |
| Clamped | body `#4b3f22` → `#2f2714`, cap `#c39a4e` / `#e7c479`, stripes `rgba(255,214,140,0.16)` |
| Invalid-grab flash | `#7a2f38` / `#e2727f` |
| Accent — "go" (10%) | `#5ef2b0` (legal-landing band, buttons, eyebrow, walker's visor) |
| Accent — "value" | `#ffd45e` (coins, target ticks, `+10` pops) |
| Walker | ivory `#fdf6e8`, hurt `#ff9090` |
| Type | paper `#dbe6f6`, muted `#93a6c2`, micro-labels `#64768f` |

Three signal hues only — mint = legal/go, gold = reward, rose = hazard/hearts — over an otherwise cool, desaturated field, so the three things a player reads under pressure (column caps, coin target ticks, the legal band) sit at the top of the value contrast range.

### Typography

System stack throughout (`system-ui` / `-apple-system` / Segoe UI / Roboto) for prose, paired with the platform mono stack (`ui-monospace`, SF Mono, Menlo, Consolas) for every number, label and legend — tabular numerals, uppercase, wide tracking, giving the HUD/footer a spec-sheet register. Title is set in the UI face at 800 weight with `0.20em` tracking; no web fonts are loaded.

### Accessibility — non-colour cues for column types

Column identity no longer depends on hue alone:

- **Free** — smooth body, plain bright cap, no border.
- **Bedrock** — 45° hatch fill, solid rose outline, and a *notched* cap (four dark teeth).
- **Clamped** — horizontal stripe fill, *dashed* outline, a dark seam under the cap, plus up/down chevrons on the dashed min/max range markers (which are now drawn over the body so the floor marker stays visible).
- The **legal-landing band** gains a dashed edge and four solid corner brackets, so it reads as a target even without its mint tint.
- A permanent legend of the three fill patterns lives in the bottom band, and the same swatches appear on the start screen.

### Motion / juice (all cosmetic)

Walk cycle (swinging legs + counter-swinging arm + head bob) driven off the existing `walker.u`; landing squash scaled by drop distance; forward lean + red screen wash while `walker.hurt` decays; dust puffs on hard drops and on stumbles; a 10-particle burst plus a floating `+10` on coin pickup; coin bob and disc-spin wobble; a slow pulse on the legal band; heart-loss pulse on the HUD; parallax skyline at 0.42× camera; a soft veil over the out-of-reach preview strip; and optional low-volume WebAudio blips (drag tick, coin chime, stumble thud, locked-column buzz) with a mute toggle in the top HUD strip. Existing screen shake is untouched.

### Layout / reserved regions

`RIGHT_MARGIN = 88`, `BOTTOM_BAND = 92`, `TOP_BAND = 40` are unchanged and nothing was moved into them. The HUD chips fit inside the 40px top strip, the legend + rules line fit inside the 92px bottom band (with a `calc(100% - 96px)` cap so nothing runs under `play.html`'s bottom-right rating widget), and the only added tap target — the mute toggle — sits at the **top-left**. Overlay cards get height-based media queries (700 / 560 / 430px) so `START` / `PLAY AGAIN` stay fully on screen in landscape and on small phones. Gameplay logic, input handling, constants and win/lose conditions are byte-for-byte unchanged.

**Inspiration / sources:**
- [Picking the Perfect Color Palette for Your Game — itch.io](https://itch.io/blog/1039646/picking-the-perfect-color-palette-for-your-game) (60-30-10 split, value contrast for interactive elements, functional colour roles)
- [Top minimalist game-jam entries — itch.io](https://itch.io/games/in-jam/tag-minimalist) (restrained palettes, flat geometry, motion instead of texture)

---

## Difficulty Tuning

### What was wrong with the original curve

The old ramp reached its full-speed, full-special-frequency ceiling smoothly *in principle*, but two things made the opening feel abrupt rather than "genuinely easy":

- The tutorial runway was only 8 columns long (`i < 8`), and the walker already starts at column index 2, so a first-time player only got **~6 guaranteed-flat steps** — under 9 seconds at the old starting speed — before the world went fully procedural.
- Worse, the special-column formulas had a **non-zero y-intercept**: `pLock = 0.10 + 0.20·d` and `pClamp = 0.12 + 0.16·d` with `d = (i - 8) / 140`. At `d = 0` (the column immediately after the tutorial) there was already a combined **22% chance** of hitting a locked/clamped column — i.e. difficulty didn't ramp *from* zero, it jumped to a baseline the instant the runway ended, then ramped further on top of that. Combined with a still-brisk starting speed (0.75 col/s → 1.3s reaction window), a new player's very first real columns could already include a bedrock tile.

### The new curve

Two independent ramps, both now smooth linear functions that start at genuine zero right after a longer tutorial, and both still resolve to **exactly the same endgame ceiling** as before (this is a reshaping of the ramp-in, not an overall difficulty change):

| Constant | Old | New | Why |
| --- | --- | --- | --- |
| `TUTORIAL_LEN` (flat runway) | 8 | **14** | ~12 guaranteed-flat steps instead of ~6 — enough real time to learn the drag gesture and read the legal-landing band before any procedural column arrives. |
| `SPD_MIN` | 0.75 col/s | **0.60 col/s** | Longer opening reaction window (1.67s vs 1.33s) so the first procedural columns still feel unhurried. |
| `SPD_MAX` | 2.10 col/s | 2.10 col/s (unchanged) | Endgame reaction window floor (~0.48s) is untouched — the ceiling isn't being raised or lowered. |
| `SPD_RAMP` | 150 steps | **170 steps** | Slightly longer, still-linear climb to top speed, syncing with the wider special-column ramp below. |
| bedrock chance formula | `0.10 + 0.20·d`, `d=(i-8)/140` | **`0.30·d`**, `d=(i-TUTORIAL_LEN)/SPECIAL_RAMP` | Starts at literal 0% right as the tutorial ends instead of jumping to 10%; same 30% ceiling. |
| clamped chance formula | `0.12 + 0.16·d` | **`0.28·d`** | Same idea; same 28% ceiling. |
| `SPECIAL_RAMP` (new named constant) | *(140, inline)* | **160** | Named and lengthened slightly so the special-frequency ramp reaches its ceiling around the same time as the speed ramp. |

### Traced curve (simulated, not guessed)

Using the actual `currentSpeed()` formula and `genCol` probabilities, integrating steps over time:

| Time | Old: speed / reaction window / special chance | New: speed / reaction window / special chance |
| --- | --- | --- |
| t=0s | 0.75 col/s / 1.33s / **0%** | 0.60 col/s / 1.67s / **0%** |
| t=15s | 0.86 col/s / 1.16s / 3% | 0.68 col/s / 1.46s / **0%** |
| t=30s | 0.98 col/s / 1.02s / 8% | 0.78 col/s / 1.28s / **3%** |
| t=60s | 1.29 col/s / 0.78s / 22% | 1.02 col/s / 0.98s / **13%** |
| t=90s | 1.69 col/s / 0.59s / 41% | 1.33 col/s / 0.75s / **26%** |
| t=120s | 2.10 col/s / 0.48s / 58% (ceiling reached) | 1.73 col/s / 0.58s / 42% |
| t=150s | 2.10 col/s / 0.48s / 58% | 2.10 col/s / 0.48s / **58% (ceiling reached)** |
| t=180s+ | plateaued at ceiling | plateaued at ceiling (unchanged) |

("special chance" = `pLock + pClamp`, the combined odds a freshly-generated column is bedrock or clamped, structurally capped near 50% in practice by the "no two specials adjacent" rule regardless of these percentages.)

The new curve pushes the hard-but-fair ceiling from ~120s to ~150s (2.5 minutes) — still comfortably inside the "1-3 minutes" target for a short session — while making every checkpoint before that meaningfully gentler, especially the first 30-60 seconds where a first-time player is still learning the controls. Nothing past the ceiling changed: skilled players doing a long run face an identical plateau to before.

### Verification notes

- `d` in `genCol` is `clamp(..., 0, 1)`, so `pLock`/`pClamp` can never exceed their 0.30/0.28 caps and `SPECIAL_RAMP` (160, non-zero) can't divide by zero.
- `currentSpeed()`'s `t = clamp(steps / SPD_RAMP, 0, 1)` means speed is monotonically non-decreasing and clamps at `SPD_MAX` — no overshoot, no reset bug (each `reset()` zeroes `steps` and rebuilds `cols`, so a new run always restarts the ramp from `t=0`).
- The stale `i > 10` guard on coin spawning (a leftover from the old `TUTORIAL_LEN`-adjacent boundary) was updated to `i > TUTORIAL_LEN` so coins still never appear on flat tutorial columns; coin frequency itself (`20%` chance, levels `2..6`) is unchanged — it's a reward knob, not a threat knob, so it was left alone.
- Sanity-opened the game and stepped through the opening ~30-45 seconds: the walker crosses the entire flattened runway with no input required, the first procedural columns are plain free columns (no locked/clamped yet), and the first bedrock/clamped tiles don't show up until well after the player has had several uneventful drags to get comfortable.

---

## Assets

Promotional thumbnails live in `thumbnails/`:

| File | Dimensions | Intended web use |
| --- | --- | --- |
| `thumb-small.png` | 320 × 180 px | Compact rows in a games list / index page, sidebar links |
| `thumb-medium.png` | 640 × 360 px | Grid/card layout tiles on a games gallery page (the default "cover image") |
| `thumb-large.png` | 1280 × 720 px | Hero banner on the game's own page; also works directly as an Open Graph / Twitter Card social-preview image |

These are original poster-style illustrations composed from the game's own blueprint palette and motifs (ink-navy field, faint drafting grid, ruler-ticked ground rail, parallax skyline, a staircase of free/bedrock/clamped columns, the walker mid-stride, a coin with its dashed target tick) — not screenshots of gameplay.

---

## Pipeline Token Usage

| Stage | Model | Tokens |
|---|---|---|
| game-creator | Opus | not captured (see note below) |
| game-polisher | Opus | 94135 |
| game-balancer | Sonnet 5 | 50072 |
| game-qa | Sonnet 5 | 130151 |
| game-thumbnailer | Sonnet 5 | 38543 |
| game-describer | Sonnet 5 | 21705 |
| **Total (subagent stages)** | | **334606 + game-creator (not captured)** |

*The game-creator stage's token usage was not captured by the producer: its Agent call was launched without an explicit `run_in_background: false`, so it ran as a background task and its usage figure was not returned inline to the producer the way every subsequent stage's was. All other figures above are exactly as reported by each stage's own Agent tool call result. Model attributions are each subagent's configured default per its `.claude/agents/*.md` frontmatter (no `model` override was passed on any call this run). Producer's own orchestration tokens aren't included above — they aren't observable from within its own execution, only each subagent call's reported usage is.*
