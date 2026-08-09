# Grudgewall

**One-line pitch:** A tap-only tower defense where every turret you build makes the whole horde angrier — so the winning move is to build as *few* turrets as possible and merge them into monsters.

## The original twist

Standard tower defense rewards you for covering the map with turrets. Grudgewall inverts that: each **placement** permanently raises a **Grudge** meter, and Grudge directly multiplies the HP of every enemy that spawns for the rest of the run (and eventually the wave sizes too). Spamming turrets is self-sabotage.

The escape valve is **merging**: combining two same-level turrets into one turret of the next level costs nothing and adds **zero Grudge**, while roughly tripling damage output. **Repositioning** a turret to any empty cell is also free (it just needs a short reload). So the whole game is a tension between *coverage* (many weak turrets, high Grudge) and *concentration* (few huge turrets, low Grudge, but thin coverage that you must physically drag around the board by re-tapping).

The player's real resource isn't scrap — it's the number of times they're willing to touch an empty cell.

## How to play / controls

Everything is a single tap on the board. **No keyboard, no hover, no drag, no gestures.**

- **Tap an empty cell** (with nothing selected) → build a Lv1 turret for 20 scrap. **+1 Grudge.**
- **Tap a turret** → select it (shows its range ring, and highlights every legal merge partner).
- With a turret selected:
  - **Tap another turret of the same level** → merge into level+1. Free, no Grudge.
  - **Tap an empty cell** → move the selected turret there. Free, but it can't fire for ~1.1s.
  - **Tap a turret of a different level** → switch selection to that one.
  - **Tap the selected turret again**, or tap outside the grid → cancel the selection.
- **START / PLAY AGAIN / Restart** are large buttons (56px min height) driven by `click`, which fires on tap.

Input is handled by a single `pointerdown` listener on the canvas (unified touch + mouse), with a `touchstart`/`mousedown` fallback pair for browsers without Pointer Events. Desktop mouse clicking works identically to tapping.

## Core mechanics

- **Board:** 5 columns × 8 rows. Enemies spawn at the top of a random column and walk straight down. The bottom edge is your wall.
- **Turret levels** (damage / range in cells, all fire every 0.9s):
  | Lv | dmg | range |
  |----|-----|-------|
  | 1  | 1   | 1.7   |
  | 2  | 3   | 2.1   |
  | 3  | 8   | 2.5   |
  | 4  | 20  | 2.9   |
  | 5  | 48  | 3.3   |

  Lv5 is the cap; merging two Lv5s is rejected with a message. Turrets auto-target the enemy in range that is **furthest down the board** (most urgent).
- **Grudge:** enemy HP multiplier = `1 + 0.18 × grudge`. Wave size also gains `+floor(grudge / 4)` enemies. Both are shown live in the HUD (e.g. `Grudge 5 (×1.90)`).
- **Enemy stats by wave `w`:** count `4 + w + floor(grudge/4)`, HP `round((2.6 + 1.65·(w−1)) × grudgeMult)`, speed `0.42 + 0.035·(w−1)` rows/sec, spawn gap `max(0.55, 1.5 − 0.06·(w−1))` sec.
- **Economy:** start with 40 scrap (2 turrets). +4 per kill, +`12 + 3·wave` per wave cleared. Turret cost is a flat 20.
- **Wave director:** `break` (build phase, 3.5s between waves, 4.0s before wave 1) → `spawn` → `clear` (waits until the field is empty) → next wave.

## Win / lose conditions

- **Lose:** 3 enemies reach the wall (`Wall` counter in the HUD hits 0).
- **Win:** clear all 12 waves.
- **Score:** `kills × 10 + wavesCleared × 50`, shown live. On a win, `+100 per remaining wall point` is added as a bonus in the end-screen total.
- Both endings show an end overlay with a **PLAY AGAIN** button; a **Restart** button in the top-right HUD is available at any time during play.

## Difficulty escalation

Waves get more numerous, tougher and faster on a fixed curve, but the *player's own building* is a second, self-inflicted difficulty axis via Grudge. A player who panic-builds 12 turrets faces ×3.16 HP enemies and larger waves; a disciplined player at Grudge 6 faces ×2.08 enemies but has to defend 5 columns with two or three high-level turrets and constant repositioning. See "Difficulty Tuning" below for the exact curve and reasoning.

Numbers are deliberately left in one `CFG`-style block near the top of the script (`COLS`, `ROWS`, `MAX_WAVE`, `TOWER_COST`, `START_SCRAP`, `GRUDGE_HP`, `RESETTLE`, the `LV` table, and the `waveCount` / `enemyHp` / `enemySpeed` / `spawnGap` functions) for the balancing pass.

## Notes for visual polish

Mechanics are done; the visuals are intentionally placeholder-grade.

**Structure:**
- `#hud` (top bar) — wave / wall / scrap / grudge / score text plus a `#restartBtn`. Currently plain 12px text that may wrap to two rows on a 375px phone; a compact icon/pill treatment would help a lot.
- `#stage` → `<canvas id="cv">` — the whole board is canvas-drawn in the `draw()` function. Everything is flat rectangles and circles.
- `#bottombar` (78px tall) — `#status` (contextual instruction line, changes based on selection/phase) and `#msg` (transient 2.2s feedback toast, amber). **Its right side has 100px of reserved padding and must stay empty** — that's where `play.html`'s floating rating widget sits.
- `.overlay` × 2 — `#startScreen` (title, instruction paragraph, bullet list, `#startBtn`) and `#endScreen` (`#endTitle`, `#endBody`, `#againBtn`). Both are centered with 110px bottom padding so no button lands near the bottom-right corner.

**Placeholder colors currently in use:**
- Page bg `#14161c`, board bg `#1b1f28`, grid lines `#2a3040`, wall strip `#7a6a3a`.
- Turrets by level: L1 `#4f8ef7`, L2 `#48c98a`, L3 `#f2c14e`, L4 `#f2803c`, L5 `#e057c8` — squares with a black level number. A distinct silhouette/shape per level would read far better than color alone.
- Enemies: `#d9534f` circles with a green-on-dark HP bar above them.
- Selection: amber `#ffd479` outline + translucent amber fill on legal merge targets + a thin range circle.
- Shots are a 0.12s straight line flash in the firing turret's color (`shots[]` array) — this is the main hook for "juice" (muzzle flash, impact pop, screen shake on a breach).

**Things worth animating:** turret merge (two squares snapping together), the Grudge number ticking up when a turret is placed (it's the whole point of the game and currently has no emphasis), enemy death, and the wall taking a hit.

**Do not change:** the canvas grid geometry math (`cs`, `gx`, `gy`, `cellCX`, `cellCY`, `rowY`) is shared by both rendering and hit-testing in `onTap()` — restyling must not alter the canvas element's box or those calculations, or taps will land on the wrong cells.

## Visual Design

**Direction: "ember siege".** A near-black war-room board lit from two sides — a cold red glow at the top (where the horde spawns) and a warm amber glow at the bottom (your wall). The whole style is built to dramatize the core tension: *your side is gold and geometric, the horde is red and round, and the Grudge meter is the one element allowed to bleed red into the board itself.*

### Palette (all CSS/canvas, no assets)

| Role | Hex |
|------|-----|
| Page ink | `#0b0d12` |
| Panel / pill fill | `#12151d` / `#171b25` |
| Hairlines | `#232a38` (grid `#242b3a`, board edge `#333c50`) |
| Text / muted text | `#e9e7e2` / `#8d94a6` |
| Ember (primary action) | `#ff7a3c` → `#e8571f` gradient |
| Grudge (the antagonist stat) | `#ff4d4d` |
| Wall / gold | `#ffc861`, critical `#ff6a5a` |
| Selection amber | `#ffd479` |
| Enemy | `#ef5a52` with `#8e1f1f` core |
| Turret ramp L1→L5 | `#5fa8d3` · `#62c9a5` · `#f0c25a` · `#f2803c` · `#d873e8` |

The turret ramp reads cool→hot as level climbs, and deliberately avoids the enemy red so a Lv4 turret is never confused with a spawn.

### Typography

System stack only (`system-ui` / `-apple-system` / Segoe UI / Roboto) — zero font requests, works offline. All numbers use a monospace stack (`ui-monospace, SF Mono, Menlo, Consolas`) with tabular figures so the HUD never jitters as scrap/score tick. Title is 800-weight, `.12em` tracked, with a cream→ember gradient text clip; labels are 7–9px uppercase with wide tracking.

### Layout

- **HUD** rebuilt as five compact stacked pills (tiny uppercase label over a mono value) plus two 29–34px icon buttons (sound, restart). Fits on one row down to 320px wide via a `max-width: 374px` step-down; the Grudge pill is the only one with a red border and an inner glow whose intensity is driven by a `--heat` custom property set from the live Grudge value.
- **Bottom bar** keeps its 78px height and its **100px right-hand reservation for the rating widget**; the status line gained a small steel accent rule, and the transient message slides in.
- **Overlays** use `justify-content: safe center` + `overflow-y: auto` with two height step-downs (`720px`, `600px`) so the start screen's title and START button both stay on screen on a 320×568 phone, while retaining ~88–108px of bottom padding so no tap target lands in the bottom-right corner.

### Board rendering

- Board is a rounded, drop-shadowed plate with a top-to-bottom gradient and a defined edge; a dashed, slowly pulsing red line marks the spawn edge.
- **Grudge is visible on the board itself:** a red gradient bleeds down from the top of the plate, growing with the Grudge count (capped at 0.42 alpha).
- **Per-level turret silhouettes** (the biggest legibility win): Lv1 rounded square → Lv2 diamond → Lv3 hexagon → Lv4 octagon → Lv5 six-point star, each with a lit gradient body, a level-scaled outer glow, and the level numeral punched out in near-black. A thin white arc around each turret shows its reload progress; a dashed amber ring plus 42% opacity marks a turret still settling after a move. The five shapes are also previewed as CSS `clip-path` chips on the start screen.
- **Wall** is now three lit segments (one per wall point) drawn just inside the bottom edge; spent segments go dark, and the final segment pulses red.
- **Enemies** are glowing red orbs with a dark core, a faint downward threat trail, a subtle idle bob, a white hit-flash, and a rounded HP bar that shifts green → amber → red.

### Motion / juice (all cosmetic, zero gameplay effect)

Build: expanding ember + red ring, a floating `+1 GRUDGE`, a HUD pill scale-bump, and a small shake. Merge: a snap line between the two cells, a burst of particles, a ring, and a floating `LVn`. Kill: particle pop, ring, floating `+4`. Breach: a heavy shake, a wall-line particle burst and a low sawtooth thud. Shots gained a muzzle flash, an impact dot and a glow that fades with the flash. Selection range ring uses an animated dash offset. Screen shake is applied via a canvas transform that decays in the render loop — hit-testing still reads `getBoundingClientRect`, and all 40 cells were verified to map correctly during play.

Audio is ~40 lines of WebAudio oscillator blips (build/merge/move/kill/wave/breach/win/lose), unlocked on the START tap, with a mute toggle in the HUD. No files, no CDN — the game is still one self-contained offline HTML file.

**Verified in a real browser** at 320×568, 360×640, 390×780 and 1000×820: start → build → select → merge → move → waves → breach → end screen → PLAY AGAIN, with zero console errors and no change to mechanics, controls or win/lose conditions.

### Inspiration

- [itch.io — games tagged Minimalist + Tower Defense](https://itch.io/games/tag-minimalist/tag-tower-defense) (flat shapes, single-accent UI, silhouette-first readability)
- [itch.io — Minimalist tag overview](https://itch.io/games/tag-minimalist) (restraint: one idea, one palette, motion only where it teaches)
- [Lospec — Oil 6](https://lospec.com/palette-list/oil-6) (reviewed as a candidate ramp; rejected as too pastel for this game's siege mood, but its warm→cool monoramp logic informed the L1→L5 turret ramp)

## Difficulty Tuning

Mechanics, controls, visuals and win/lose rules are unchanged. Only the pacing constants inside the `CFG`-style block were retuned: `GRUDGE_HP` and the two coefficients inside `enemyHp()`, plus the `break`/first-`break` timers. Everything else (`waveCount`, `enemySpeed`, `spawnGap`, the `LV` table, scrap economy, `MAX_WAVE = 12`) was left as-is after confirming by calculation that it already ramps smoothly.

**What a headless simulation found.** Before touching anything, I modeled the wave director analytically (enemy count/HP/speed/spawn-gap per wave, turret DPS by level, merge-chain throughput) for three archetypal players — *restrained* (grows Grudge slowly, keeps 2 merged turrets), *moderate* (grows Grudge normally, 2-3 merged turrets), and *heavy-spam* (grows Grudge fast, 3-4 merged turrets) — over the full 12-wave campaign:

- The base ramp (HP, count, speed, spawn gap) is already linear/smooth wave-to-wave with no hard steps, and a fixed-strategy trace showed no jarring spikes.
- Total campaign length (11 breaks + 12 spawn phases, excluding "wait for the last enemy to die") came out to **~180-225s (3-3.7 min)** depending on how much a player builds — squarely in the "few minutes" target, so `MAX_WAVE` and the base spawn/break pacing didn't need to change.
- The one real problem: because each merge level is worth ~3× damage for only 2× the turret count, a turret's damage-per-Grudge-point *keeps increasing* all the way to Lv5 (Lv1 ≈1.11 dps/grudge → Lv5 ≈3.33 dps/grudge). At the old `GRUDGE_HP = 0.14`, that merge-efficiency growth outpaced the linear HP tax enough that an optimizing "build a lot, then merge it all" player came out *ahead* of a modest, disciplined player in the simulation (`heavy-spam` avg throughput margin +5.6 vs `moderate` +0.4 vs `restrained` -2.3) — the opposite of the intended lesson. (Naively spamming turrets *without* merging was already correctly punished, margin -0.5 — that part of the design already worked.)

**The fix.** Raised `GRUDGE_HP` (0.14 → 0.18) and lowered the enemy-HP-vs-wave base curve (`3 + 1.9·(w-1)` → `2.6 + 1.65·(w-1)`) together, so the two changes cancel out around Grudge ≈ 8 (a "typical" amount for a mid-game player who has built a handful of turrets and merged some of them) and diverge smoothly on either side:

| Grudge at wave 12 | Old wave-12 enemy HP | New wave-12 enemy HP |
|---|---|---|
| 0 (never built) | 24 | 21 (easier) |
| 6 (very restrained) | 44 | 43 (~same) |
| 8 (typical) | 51 | 51 (pivot — unchanged) |
| 12 (a bit build-happy) | 64 | 66 (slightly harder) |
| 20 (spammy) | 91 | 95 (harder) |
| 32 (heavy spam) | 131 | 140 (clearly harder) |

Re-running the same simulation with the new constants confirms restrained/moderate play is essentially untouched (worst/avg throughput margins moved by <0.5), while the naive-spam-without-merging case (still clearly a losing strategy, margin -0.4) and the optimizing heavy-spam-with-merging case both get measurably harder to sustain than before — restraint and merging now read more clearly as the reward path without punishing an average player who builds a normal amount. (A player who *perfectly* min-maxes merge chains can still eke out more raw throughput from more Grudge than from less — that's an inherent consequence of "more turrets in play = more simultaneous coverage," which is a mechanic, not a pacing constant, so it's out of scope for this pass; it's flagged here rather than fixed.)

**Onboarding pacing.** The very first build window (`breakTimer` before wave 1) was extended from 2.5s to 4.0s so a first-time player has time to read the status line and place their first turret without feeling rushed, before wave 1's slow, low-HP enemies (unchanged: 5 enemies, ~4 HP, 0.42 rows/sec ≈ 19s to cross the board) start arriving. To keep total session length roughly the same after that addition, the break between all later waves was trimmed slightly (4.0s → 3.5s) — still comfortably enough time to build or merge a turret or two every wave.

**Old → new constants:**

| Constant | Old | New |
|---|---|---|
| `GRUDGE_HP` | 0.14 | 0.18 |
| `enemyHp` base (`HP_BASE`) | 3 | 2.6 |
| `enemyHp` slope (`HP_SLOPE`) | 1.9 | 1.65 |
| first `breakTimer` (before wave 1) | 2.5s | 4.0s |
| `breakTimer` (between waves 2-12) | 4.0s | 3.5s |

**Sanity trace with the new constants** (assuming a "moderate" player, Grudge ≈ 8-10 by mid-game):
- t≈0-4s: build phase, 5 slow (0.42 rows/sec) 4-HP enemies about to spawn — trivially easy, plenty of time to place/read.
- t≈30s (wave ~3): 8 enemies, HP ~11-17, speed ~0.49 — still comfortably below any turret's one-shot threshold for a Lv2+ turret.
- t≈60s (wave ~5-6): 10-11 enemies, HP ~18-30, speed ~0.56-0.59 — this is where a Lv1/Lv2-only board starts to feel the squeeze, nudging the player toward merging.
- t≈120s (wave ~9-10): 15-16 enemies, HP ~44-51 (at Grudge 8-10), speed ~0.70-0.74 — hard-but-fair ceiling reached, matching the target 1-3 minute window.
- t≈180-220s (wave 11-12, end of campaign): 17-18 enemies, HP ~53-58, speed ~0.77-0.80 — the campaign's natural finale, so no plateau was added (a fixed 12-wave run is meant to peak at its ending rather than flatten out).

Verified in a browser: opened the game, played through wave 1-3 to confirm the new 4.0s opening build window and eased early HP feel unrushed, and re-read `update()`/`enemyHp()`/`waveCount()` for off-by-ones, division-by-zero (none — `grudgeMult()` is always ≥1) and runaway caps (Grudge is intentionally uncapped, as before, since it's the core "this is your fault" mechanic; the multiplier it feeds is bounded away from overflow by JS number limits long before it's reachable in a 12-wave run).

## Assets

Promotional thumbnails live in `thumbnails/`:

| File               | Dimensions   | Intended web use                                                                 |
|---------------------|--------------|-----------------------------------------------------------------------------------|
| `thumb-small.png`  | 320 × 180 px | Compact rows in a games list / index page, sidebar links                          |
| `thumb-medium.png` | 640 × 360 px | Grid/card layout tiles on a games gallery page (the default "cover image")        |
| `thumb-large.png`  | 1280 × 720 px| Hero banner on the game's own page; also works directly as an Open Graph / Twitter Card social-preview image |

These are original poster-style illustrations composed from the game's own "ember siege" palette and per-level turret silhouettes (square/diamond/hex/octagon/star), not screenshots of actual gameplay.

## Pipeline Token Usage

| Stage | Model | Tokens |
|---|---|---|
| game-creator | opus | 44,454 |
| game-polisher | opus | 89,315 |
| game-balancer | sonnet | 95,838 |
| game-qa | sonnet | 81,329 |
| game-thumbnailer | sonnet | 42,511 |
| game-describer | sonnet | 20,901 |
| **Total (subagent stages)** | | **374,348** |

*game-editor and the game-qa re-verify pass were not run — QA's initial playtest found no bugs or evidenced usability problems, so the conditional fix step was skipped. Producer's own orchestration tokens aren't included above — they aren't observable from within its own execution, only each subagent call's reported usage is.*
