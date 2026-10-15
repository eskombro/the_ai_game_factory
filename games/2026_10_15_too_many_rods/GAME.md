# Too Many Rods

## One-line pitch

A fishing game that is really a one-finger juggling act: up to five lines are in the water, every one of them needs your hand, and you only have one.

## The original twist

Most fishing games are about a single rod and a single tension bar. Here the fight with any individual fish is deliberately easy — the game is about **attention as a scarce resource**. You cannot decline a bite (ignoring one costs you a mistake), so success keeps *creating* new obligations, and the thing that loses you the next fish is holding on to the current one.

The hook that makes it work mechanically: a hooked fish's patience is worked off by **sustained** reeling, not by touching it. Slack decays at 2.0/s while you reel but regrows at 1.0/s while you don't, so a fish you merely tap at keeps drifting toward spitting the hook. That single rule is what stops the game from degenerating into round-robin tapping across all five lines (see "Balance findings" below — an unconstrained version was literally unloseable).

Two different constraints bind at different times, which gives the game its shape:
- **Few fish on** → *tension* limits you. You can hold one line nearly continuously, so you snap lines.
- **Many fish on** → *patience* limits you. Tension never builds because you are away from each line so often, but you can't give any of them enough sustained contact.

## How to play / controls

Entirely one finger (or one mouse button — all input is unified through pointer events, so touch and click-drag behave identically).

| Gesture | Effect |
| --- | --- |
| **Swipe up** on a line showing `BITE!` | Sets the hook (needs 26px of upward travel) |
| **Press and hold** a line that is `HOOKED` | Reels that fish in; raises tension, works off slack |
| **Release** | Stops reeling; tension falls, slack grows |
| **Slide sideways** while held | Moves your hand to another line (re-arms the flick there) |
| **Swipe up** on an idle line | Spooks it — short cooldown, but costs no mistake |

A line's whole vertical column is the tap target (~75px wide at 375px viewport). Starting a grab is only possible between the header and the bottom of the water, so the bottom strip is a dead zone.

Moving back downward mid-drag re-arms the hook swipe, so a player who never lifts their finger can still hook a fresh bite on the line they're already holding.

## Core mechanics

Each of the 5 rod slots is a small state machine: `closed → cool → idle → nibble → hooked → cool → idle …`

- **nibble** — lasts `nibbleWindow()` (1.6s → 0.55s). Swipe up in time or the fish **GOT AWAY** (mistake).
- **hooked** — two bars race each other:
  - `reel` fills only while you hold; the fish is landed at `fish.sec` seconds of total contact.
  - `tension` rises at `fish.pull`/s while reeling, falls at `RECOVER` (0.75/s) while not. Hitting 1.0 is **LINE SNAPPED** (mistake).
  - `slack` falls at `SLACK_DECAY` (2.0/s) while reeling, rises at 1.0/s while not. Exceeding `fish.pat` is **SPIT THE HOOK** (mistake).
- Bites are scheduled globally, one at a time, onto a random *idle* line.

**Fish tiers** (`sec` / `pull` / `pat` / `weight`): small 1.10/0.70/1.90/1.4, medium 1.80/0.82/1.60/3.1, big 2.50/0.92/1.30/6.2. Big fish are worth the most and are the most likely to ruin your juggling.

### Difficulty escalation

- `difficulty()` = `landed / 16`, clamped to 1 — the main ramp.
- `overdrive()` = `(landed - 16) / 30`, **uncapped** — keeps squeezing bite interval, nibble window, pull and patience forever so a skilled run still ends instead of plateauing.
- Rods unlock at **0, 0, 3, 8, 14** fish landed. Locked slots are drawn greyed with their unlock threshold, so the next step up is visible.
- Bite interval runs 2.8s → 1.3s (floor 0.90s) and is **deliberately independent of rod count** — extra rods are parallel slots to juggle, not more fish per second. (Tying rate to rod count was the original balance bug; see below.)

## Win / lose conditions

No win state — it's an endless score chase. **3 mistakes ends the run.** A mistake is: a bite that expired un-hooked, a snapped line, or a spat hook. Spooking an empty line is free.

**Scoring:** a landed fish is worth `round(weight × 10 × multiplier)`. The multiplier is `1 + floor(streak/3) × 0.5`, capped at **x3.0**, where streak is consecutive fish landed without a mistake. Best score persists via `localStorage` (wrapped in try/catch so `file://` can't break it).

## Verification notes

Driven headlessly through a stubbed-DOM harness (pointer events dispatched at real computed coordinates). Confirmed: hook-on-swipe, reel-to-land, snap-on-overhold, spit-on-neglect, got-away-on-ignore, 3-mistake game over with correct summary text, full state reset on restart, spook path costs no mistake, hand sliding between and off columns, rod unlocks through all 5 slots, and hooking a new bite without lifting the finger. Audit: **0 keyboard listeners, 0 hover rules, 0 mouse-only events, 0 external/network references.**

### Balance findings (for the balancer stage)

Bot playtests, for a baseline — both an urgency-sorting bot and a smarter finish-the-closest-fish bot land **16-23 fish in 44-56 seconds**. Deaths are now spread out after the rod-5 unlock rather than slamming into it. Two earlier versions were *unloseable* by an optimal bot (890 fish / 33 minutes, zero mistakes) before the slack-decay and bite-rate fixes, so be careful not to reintroduce either:
1. Don't make reeling reset slack instantly — one-frame touches would again be enough to babysit all five lines.
2. Don't scale bite rate up with rod count — at 5 rods that put arrivals ~3x over what one hand can service and killed every run within a few fish of the unlock.

Human runs will be shorter than the bot's; the opener (2 rods, 2.8s bites, small fish) is intentionally sleepy as a teaching ramp and is the most likely thing to want shortening.

## Notes for visual polish

Mechanics are complete; visuals are deliberately placeholder flat rectangles and circles on a canvas.

**Structure:** one full-screen `<canvas id="c">` plus two absolutely-positioned HTML overlays, `#startScreen` and `#overScreen` (toggled by a `.hidden` class). Overlay buttons are real `<button class="btn">` elements (`#startBtn`, `#againBtn`), bound via `pointerdown` with a `click` fallback.

**Canvas regions** (all derived in `resize()`, so keep them variable-driven rather than hardcoding):
- `0 … headerH` (58px) — header: score (left), streak multiplier (centre), mistake dots `X o o` (right).
- `waterTop … waterBot` — the water, divided into `MAX_LINES` equal columns of width `colW`. This is the only interactive area.
- Per column: rod line from `rodY` down to a bobber at `bobberY` (bobbers bob via `Math.sin(t * …)`), then stacked below it the nibble countdown bar, `REEL` bar, `TENSION` bar, a `REEL IT!` slack warning, and the fish weight in lb. Flash messages (`+points`, `HOOKED!`, `NEW ROD`, `SNAPPED`…) draw at `waterBot - 14`.
- The held column is tinted `rgba(103,214,160,0.10)` — this is the player's only feedback about where their "hand" is, so **keep or strengthen it**; it's load-bearing, not decoration.
- `H - bottomPad … H` (124px) — intentionally empty dead strip holding only the two hint lines at `H-92` and `H-74`. **This is what keeps the reserved bottom-right corner free of essential controls — do not move controls or tap targets into it.**

**Placeholder palette:** background `#11161c`, water `#16222e`, deck rail `#2a3542`, idle `#6b7a8a`, nibble/alert yellow `#ffd24a`, hooked orange `#ff9d4a`, good/green `#67d6a0`, danger red `#e8695f`, tension amber `#d9b55c`, muted text `#8fa0b2`, bar track `#223040`.

**Worth juicing (addressed in the Visual Design pass below):** the `BITE!` moment (it's the reaction beat and currently just a colour swap plus a text `↑`), tension crossing 0.75, the land/`+points` pop, and the `NEW ROD` unlock. A diegetic treatment of the five bars as actual rods/reels on a boat gunwale would help legibility a lot. Please keep all three bars per line readable at a glance at 375px wide — reading four or five of them simultaneously *is* the game.

## Visual Design

**Direction: "harbor patina" — a weathered dock at last light.** Calm, nearly monochrome deep-teal
water under a dusk sky, with warmth rationed out as a signal: one amber lantern hue carries *every*
demand for your attention, one rust hue carries *every* loss, one sea-glass green carries your hand
and your winnings. The restraint is deliberate — reading four or five columns at once is the game,
so colour is used as a legend, never as decoration.

### Palette

| Role | Hex | Used for |
| --- | --- | --- |
| Ink | `#0b1418` | night air / page background |
| Deep | `#081d23` | water floor (bottom of the water gradient) |
| Water | `#123a42` | water surface (top of the gradient, `#19454d` at the horizon) |
| Wood | `#241a13` (hi `#3b2c20`) | gunwale rail above the water, dock plank below it |
| Cream | `#f1e7d6` | primary type, bobber bellies |
| Muted | `#8aa09f` / dim `#55696c` | labels, locked-rod text, hints |
| **Amber** | `#f2a93b` (hi `#ffc661`) | **attention**: `BITE!`, nibble timer, tension bar, start button, hooked flash |
| **Rust** | `#d2543a` | **loss**: mistake pips, hooked bobber, tension > 0.75, every mistake flash |
| **Sea glass** | `#5fcfae` | **you**: the held column, the reel bar, landed-fish burst, streak multiplier |

Every canvas colour is defined once in a `C` palette object at the top of the script, so a future
re-skin is a single-object edit.

### Typography

System stacks only — no web fonts, no network requests.

- **Display** (`--serif`): `ui-serif, "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif`,
  uppercase with `0.055em` tracking — titles, score, multiplier, fish weight, result numbers. Gives
  the dock a slightly old-tackle-shop feel without an asset download.
- **UI** (`--sans`): `system-ui` stack. All small labels are uppercase at `0.14–0.26em` tracking
  (via `ctx.letterSpacing`, feature-detected in a `try/catch` so unsupported browsers just render
  untracked).

### What changed (presentation only)

- **Scene:** cached sky / water / dock gradients built in `resize()`; seven drifting sine swell lines;
  a warm horizon haze under the gunwale; a weathered wood rail at `waterTop` with a small rod butt +
  reel knob per column; a plank dock filling the reserved bottom strip; twelve slow deep-water motes;
  a soft radial vignette.
- **Bobbers:** classic two-tone floats (coloured crown, cream belly) with a waterline smear ellipse,
  state-coloured and state-glowed; lines are now quadratic curves that sway with the fish and pull
  taut (brighter, straighter, thicker) while you reel.
- **`BITE!`:** pulsing amber halo ring around the bobber, glowing bold label, a bobbing `↑`, a faint
  pulsing amber column tint, and an expanding water ripple spawned at the moment the bite lands.
- **The hand (load-bearing):** strengthened per the previous stage's note — sea-glass vertical
  gradient tint, bright 1px column edges, a solid glowing bar across the rail segment and a chevron
  marker, so where your hand is reads instantly even in peripheral vision.
- **Bars:** rounded pill tracks; reel = sea glass (glows while actually reeling), tension = amber
  that flips to rust and jitters past 0.75.
- **Header:** serif score, glowing multiplier when live, mistakes as three pips (hollow cream →
  filled rust, glowing on the last life).
- **Juice:** `fx` layer with ripples, gravity particles, screen shake, and a rust *edge* pulse (a
  radial gradient, never a full wash, so the board stays readable). Shake peaks at 9px on a mistake,
  3px on a land. Flash messages became rounded chips that rise and fade, clamped to stay on screen.
- **Overlays:** a single centred glass panel (dusk gradient, amber hairline top border) with a rise-in
  animation, bulleted rules, a lantern-glow pulsing amber primary button, and the result screen laid
  out as a key/value ledger.
- **Audio:** ~60 lines of WebAudio blips (bite / hook / land / mistake / new rod / spook) built lazily
  on the first tap, each under 0.07 gain, with a **Sound: On/Off** ghost toggle on the start screen.
  Fully wrapped in `try/catch`; muting touches no game state.

### Constraints respected

- **No mechanics touched.** Constants, `update()`, `makeFish()`, the pointer handlers, scoring,
  unlocks and strike/land rules are byte-identical. The `fx` layer is write-only from gameplay code
  and never read back by `update()`.
- Still one self-contained HTML file, zero network calls (`grep` for `http`/CDN: 0 hits), offline-ready.
- The `H - 124px` bottom strip remains a non-interactive dock plank holding only the two hint lines;
  overlays keep their 140px bottom padding. **Nothing was added to the bottom-right corner.**
- Verified in headless Chromium at 390×780, 360×600, 768×1024 and 1200×760: start → bite → hook →
  reel → land → snap → 3 mistakes → game over → restart all behave as before, best score persists,
  console clean, and the start button stays reachable (overlay scrolls) on a 600px-tall screen.

### Inspiration

- [HexPalette — "Harbor Patina" / "Deep Harbor" palettes](https://hexpalette.com/palettes) (weathered
  dock teal + rust + cream; teal as anchor, rust as hero accent)
- [Ocean colour schemes](https://www.media.io/color-palette/ocean-color-palette.html) (navy → teal
  depth ramps warmed with a single amber/sand accent)
- [Minimalist palette principles](https://www.media.io/color-palette/minimalist-color-palette.html)
  (neutrals plus one muted accent; reserve the accent for the most important callouts only)

## Difficulty Tuning

Mechanics, controls, visuals and the win/lose rule (3 mistakes) are untouched. Everything below is
a pacing-only pass over the same knobs the previous stage already identified: `difficulty()`,
`overdrive()`, `biteInterval()`, and `UNLOCK_AT`.

### What was wrong

The previous stage's own bot playtests (16-23 fish landed in 44-56s, deaths spread near the end)
were already a solid shape with no cliff at the rod-5 unlock — that finding is still true and
nothing here was done to disturb it. The one thing it explicitly flagged as worth revisiting was
the *opener*: with only 2 rods, a 2.8s average bite interval, and the main ramp written as a plain
linear `landed / 16`, the first stretch of a run reads as dead air — long waits for a single lazy
bite on a near-empty board, which is a weak teaching moment even though it's correctly "easy."

### What changed, and why

1. **Eased ramp curve** — `difficulty()` now runs `landed / RAMP_FISH` through a smoothstep
   (`x*x*(3-2*x)`) instead of using it linearly. Same 0→1 endpoints, same every downstream formula
   (`nibbleWindow`, `biteInterval`, `makeFish`'s sec/pull/pat/tier-odds all still just call
   `difficulty()`/`overdrive()`), but the curve is now flat near landed=0 (genuinely gentle
   opening fish, not just "linearly a bit easier") and flat again approaching the cap (so the
   hand-off into `overdrive()` has no seam), with the steepest climb through the middle of the
   run — a smooth S-curve instead of a straight ramp, satisfying "escalate smoothly, no jarring
   steps" more literally than a straight line did.
2. **Rod-3 unlocks sooner** — `UNLOCK_AT[2]` (the third rod) moved from `3` → `2` landed fish. This
   is the direct fix for "the opener is intentionally sleepy... most likely thing to want
   shortening": it doesn't touch bite cadence or fish difficulty (both stay deliberately
   rod-count-independent, per the previous stage's warning), it just puts a 3rd line in play one
   fish sooner, which is the cheapest lever to make the board feel less empty during the teaching
   phase. Rod 4 and rod 5 moved from `8`/`14` → `9`/`16` to keep their *relative* spacing against
   the slightly longer main ramp (see next point) — the gaps between unlocks (2→9→16, i.e. 7 then
   7) stay smooth and increasing-or-flat, never a sudden step.
3. **Main ramp stretched slightly, 16 → `RAMP_FISH = 18`**, and `overdrive()`'s span 30 → `OD_SPAN
   = 32` (same ratio, so the overdrive tail keeps the same relative "slow squeeze" shape). This
   purely compensates for (1) and (2) so that reaching the hard-but-fair ceiling still takes about
   the same real time as before — the goal was a *better-shaped* curve, not a faster or slower
   one.
4. **`biteInterval()` base trimmed, 2.8s → 2.6s** (slope 1.5 → 1.3, so the *floor* value at full
   difficulty is unchanged at `2.6 - 1.3 = 1.3`, identical to the old `2.8 - 1.5 = 1.3`). This
   shaves a little more of the early dead air without touching how tight bites get once the ramp
   is maxed — late-game pacing is byte-for-byte the same number as before, only the opening is
   less sleepy.

### Sanity-checking the curve (simulated, not just guessed)

Hand-deriving the actual time-to-land-N-fish is hard by eye because bite arrival, reel duty-cycling
(you cannot hold continuously past a medium/big fish's `pull` without snapping — releasing to let
tension recover is mandatory even for an "easy" fish), and juggling overlap all interact. So this
was checked with a small Node simulation of the real `update()` state machine driven by a
duty-cycling bot (hooks any nibble for free, reels whichever hooked line has the least slack
headroom, releases once tension nears the snap line and resumes once it's recovered). Run against
the **unmodified** constants first, it reproduces the previous stage's own reported baseline almost
exactly — median 20 fish landed in ~52s — which gave confidence the model is a fair stand-in for
comparing old vs. new, even though its absolute numbers (an optimized bot) will be faster than a
real first-time player's.

| Checkpoint | Old constants | New constants |
| --- | --- | --- |
| Rod 3 opens | ~8.2s | **~5.1s** (opener shortened, as intended) |
| Rod 4 opens | ~21.5s | ~23.2s |
| Rod 5 opens | ~35.3s | ~39.2s |
| Difficulty hits its cap (hard-but-fair ceiling) | ~40.0s | ~43.6s |
| Gap between rod-5 unlock and the ceiling (no cliff) | ~4.7s | ~4.4s |
| Median full-run length (3 strikes) | ~51.7s | ~53.6s |
| Median fish landed per run | 20 | 21 |

Reading this against the brief: the opener is measurably less dead (3rd rod a third sooner), the
ceiling still lands squarely in the "roughly 1-3 minutes" target (and real humans — slower than
this bot — will land it later still, comfortably inside that window), the rod-5-to-ceiling gap that
prevented the old cliff-at-unlock problem is preserved almost exactly, and the overall run length
and fish-per-run are within simulation noise of the old numbers — i.e. this is a *better-shaped*
curve, not a harder or easier one by default.

### Key constants, old → new

| Constant | Old | New |
| --- | --- | --- |
| `difficulty()` shape | linear `landed/16` | smoothstep-eased `landed/RAMP_FISH`, `RAMP_FISH = 18` |
| `overdrive()` span | `(landed-16)/30` | `(landed-RAMP_FISH)/OD_SPAN`, `OD_SPAN = 32` |
| `biteInterval()` base → floor | `2.8 → 1.3` | `2.6 → 1.3` (floor unchanged, only the start moved) |
| `UNLOCK_AT` | `[0, 0, 3, 8, 14]` | `[0, 0, 2, 9, 16]` |
| `nibbleWindow()`, `makeFish()`, `RECOVER`, `SLACK_DECAY`, `FLICK_PX` | unchanged | unchanged |

Everything not listed above (tension/slack rates, fish tiers' `sec`/`pull`/`pat`/`weight`, scoring,
mistake handling, all rendering/input code) is byte-identical to the previous stage's output.

## Edit Log

- **2026-10-15** — Fixed flash chips (`HOOKED!`, `SPIT THE HOOK`, `GOT AWAY`, etc.) from adjacent
  columns visually overlapping near `waterBot` when active at the same time, per a QA report. In
  `drawColumn()`'s flash-chip block, a column now checks whether its left/right neighbor has an
  active flash chip at the same moment and, only then, nudges its own chip vertically (even columns
  up, odd columns down by 11px) so two simultaneous chips render at different heights instead of
  colliding. No change when a chip is alone.

## Assets

Promotional thumbnails live in `thumbnails/` as three original illustrations (not gameplay
screenshots), composed in the "harbor patina" palette and inspired by the one-finger
multi-rod-juggling concept:

| File | Dimensions | Intended use |
| --- | --- | --- |
| `thumb-small.png` | 320 × 180 px | Compact rows in a games list / index page, sidebar links |
| `thumb-medium.png` | 640 × 360 px | Grid/card layout tiles on a games gallery page (default cover image) |
| `thumb-large.png` | 1280 × 720 px | Hero banner on the game's own page; also works as an Open Graph / Twitter Card social-preview image |

All three are downsampled from a single 1280×720 SVG master (dusk sky over teal water, a dark
wood gunwale rail with five rod lines/bobbers color-coded amber/sea-glass/rust/muted to read as
BITE / held-by-your-hand / mistake / idle, a stylized single finger touching the held line, and a
box-art title lockup) — original artwork, not a capture of the running game.

## Pipeline Token Usage

| Stage | Model | Tokens |
|---|---|---|
| game-creator | opus | 85109 |
| game-polisher | opus | 87016 |
| game-balancer | sonnet | 102891 |
| game-qa | sonnet | 121314 |
| game-editor | sonnet | 46407 |
| game-qa (re-verify) | sonnet | 137510 |
| game-thumbnailer | sonnet | 32798 |
| game-describer | sonnet | 24633 |
| **Total (subagent stages)** | | **637678** |

*Producer's own orchestration tokens aren't included above — they aren't observable from within its own execution, only each subagent call's reported usage is.*
