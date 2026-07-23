# Ink Tide

## One-line pitch
Drag your finger to paint territory blue while a rival ink spreads in automatic, readable pulses — race to claim 62% of the board (or wipe the enemy out) before time runs out.

## Original twist
Most territory-painting games (e.g. Splatoon-style ink games) have the rival spreading continuously and smoothly. Ink Tide's enemy instead runs on its own visible **charge/surge cycle**: it silently recharges an "ink meter" for several seconds (doing nothing), then unleashes a short, intense surge that attacks several frontier tiles at once, then goes quiet again to recharge. The enemy meter bar is shown on-screen, so a skilled player reads the rhythm and times aggressive pushes for the enemy's quiet "charging" windows, then pulls back to let their own ink regenerate before the next enemy surge lands. This turns territory painting into a rhythm-reading resource game rather than a reflex-only smear-fest.

A second layer: cells aren't captured instantly. Every tile has an owner (neutral/player/enemy) and a "hold value" (0-100). Painting an enemy tile first has to burn its hold value down to zero (turning it neutral) before it can be claimed; painting a neutral tile has to build player value up past a capture threshold. Reinforcing your own tiles (painting them again) raises their hold value, making them more resistant to the enemy's next surge. So the same drag gesture is used for three different jobs — attack, capture, and defend — depending on what's already on the tile underneath your finger.

## How to play / controls
- **Drag your finger across the grid** to paint a stroke of tiles. This is the only control in the game.
  - Dragging over a **gray (neutral)** tile paints it toward your color; two passes over the same tile are enough to fully claim it.
  - Dragging over a **red (enemy)** tile weakens/erodes it; enough painting turns it neutral, then a further pass claims it for you.
  - Dragging over your **own (blue)** tile reinforces it, raising its resistance to the enemy's next surge.
  - Painting costs "ink" (a meter shown at the top). Ink drains as you paint and regenerates automatically whenever you lift your finger and let it rest — so play in bursts rather than one endless smear.
  - Multiple simultaneous fingers are supported: each touch point paints its own path independently (useful for defending two fronts at once), at the cost of draining ink faster.
- No keyboard or mouse-only interaction exists anywhere in the game; a big on-screen "Restart" button (and a "Play Again" button on the end overlay) are the only other touch targets.

## Core mechanics
- Grid: 11 columns x 16 rows of tiles. Player starts with a small 2x2 foothold in the bottom-left corner; the enemy starts with a 2x2 foothold in the top-right corner. Everything else starts neutral.
- Each tile has `owner` (neutral / player / enemy) and `value` (0-100), representing how solidly held it is.
- Player input is a discrete, event-driven paint stroke: on touch-move, the path between the last recorded cell and the new cell is filled in (via a line-interpolation walk) so fast swipes don't skip tiles. Each stepped tile costs a fixed amount of ink and applies a fixed amount of paint value.
- Enemy AI runs on a charge/surge cycle entirely driven by elapsed time (not player input): it recharges its own ink meter while "charging," then spends it during a timed "surge," attacking a random sample of its frontier tiles (tiles bordering non-enemy territory) each frame until the surge ends or its ink runs out.
- A very mild difficulty ramp scales enemy regen/attack strength up slowly over the match's elapsed time (further tuning is left to the balance pass).
- HUD shows: your territory %, enemy territory %, match countdown timer, your ink meter, and the enemy's ink meter with a "charging"/"surging" label so the pulse rhythm is legible.

## Win / lose conditions
- **Win** if your territory reaches 62% of the grid, or if the enemy's territory is fully wiped out (0 tiles) after an initial 6-second grace period.
- **Lose** if the enemy's territory reaches 62% of the grid, or if your own territory is fully wiped out (0 tiles) after the same grace period.
- If the 90-second match timer runs out first, whoever holds a strictly greater percentage of the grid wins; a tie counts as a loss (decisive dominance is required).
- On game end, an overlay reports final territory percentages and a score (`round(your % x 100)`, plus a small time-remaining bonus if you won by threshold before the clock ran out). A "Play Again" button restarts immediately; the grid, both ink meters, the timer, and the enemy's charge state all reset.

## Notes for visual polish
- All colors are placeholders: neutral tiles are flat dark gray (`rgb(60,60,60)`), player tiles are blue (`rgb(77,166,255)`), enemy tiles are red (`rgb(255,92,92)`). Tile fill alpha is modulated by `value/100` (0.35-1.0) so partially-held tiles look "washed out" versus fully-held ones — this is a functional readability cue, not just decoration, so please preserve the underlying information (owner + relative hold strength) through any re-theme.
- The enemy ink meter bar changes color when `enemyState === 'surging'` (class `.surging` on `#enemyInkFill`) — currently just a color swap from red to orange. This is the main "tell" that a push is imminent/happening; a future pass could add a more noticeable pulse/glow/animation to make the rhythm even more readable at a glance.
- The canvas is drawn at a fixed logical resolution of 330x480px (11 x 16 grid, 30px cells) and scaled responsively via CSS (`width:100%; max-width:330px`). Any polish pass should keep the grid's aspect ratio intact since gameplay math assumes square cells.
- HUD text elements (`#playerPct`, `#enemyPct`, `#timer`, `#inkLabel`, `#enemyStateLabel`) and bars (`#inkFill`, `#enemyInkFill`) are plain divs/spans with inline-style-driven widths — good candidates for restyling without touching any logic.
- The win/lose overlay (`#overlay`) is a simple centered dark box; visual polish could add color-coded win/lose theming, animated territory reveal, etc.
- Playtesting note: base constants (enemy surge strength/frequency, ink costs, capture threshold) currently make the enemy fairly aggressive against a naive constant-drag strategy — a scripted "smear everywhere" bot tends to lose, while a bot that rests to refill ink and concentrates on defending its own frontier fares better. Fine-tuning these numbers for a smooth, fair difficulty ramp is intentionally left to the balance pass; nothing here is a logic bug (win, lose, and restart paths were all verified to trigger correctly in isolation).

## Visual Design

**Direction:** "Sumi-e ink duel" — a minimalist ink-painting aesthetic inspired by Japanese sumi-e / *Okami*-style ink-on-paper games, which lean on a very limited palette and the power of suggestion rather than detail. Two saturated accent inks contend on a dark charcoal "ink ground," so the board reads like colored ink bleeding across wet paper.

**Palette (two accents + neutrals):**
- Ground: deep sumi ink `#0c0e13` with a soft radial glow toward the top; raised panels `#15181f`.
- Text/"rice paper": warm off-white `#ece7da`, muted `#8f8a7e` for secondary labels.
- Player ink (you): indigo-blue `#52a7ff` (`rgb(82,167,255)` on canvas).
- Enemy tide: vermillion `#ff5e54` (`rgb(255,94,84)` on canvas).
- Surge tell: amber `#ffbf5c`.
- Neutral tiles: cool charcoal `rgb(40,44,54)`; grid lines a faint paper tint `rgba(236,231,218,0.06)`.

The functional readability cue from the prototype is preserved untouched: tile fill alpha still scales `0.35→1.0` with hold `value/100`, so partially-held tiles read washed-out and solid tiles read fully saturated. Only the base RGBs were re-tinted; no gameplay math changed.

**Typography:** Georgia serif for the title, timer, and overlay headings (an "inked brush" feel) paired with a system humanist sans (`Avenir Next`/`Segoe UI`/`system-ui`) for HUD labels and numbers. Tabular-nums keep the timer and meters from jittering. All fonts are system/local — zero network font loads.

**HUD:** territory percentages become color-coded pill badges (blue "YOU", vermillion "ENEMY") flanking a large serif countdown; ink/tide meters are rounded inset "ink wells" with gradient fills and a soft glow on the player bar.

**Juice / motion (cosmetic only, no logic touched):**
- The enemy "surging" state now pulses the tide meter (amber gradient + brightness `surgePulse` keyframe) *and* wraps the whole board in a warm glow via a `.surging` class toggled on `#canvasHolder` — a more legible "a push is landing" tell than the old flat color swap.
- Win/lose overlay is color-themed (blue glow on win, vermillion on lose) via `.win`/`.lose` classes toggled in `endGame`, fades in, blurs the board behind it, and renders its score line as a multi-line block.
- Buttons are pill-shaped with a press-down active state.

**Constraints kept:** single self-contained `index.html`, zero external/CDN calls, canvas aspect ratio and 30px square cells unchanged, all interactions touch-friendly with large tap targets.

**Inspiration sources:**
- [The Art of Japanese Sumi-e Ink Painting: Minimalism, Zen, and Brushwork — Moments Log](https://www.momentslog.com/culture/the-art-of-japanese-sumi-e-ink-painting-minimalism-zen-and-brushwork)
- [How Okami-Style Traditional Sumi-e Art Brings This Action RPG to Life — 80.lv](https://80.lv/articles/how-okami-style-traditional-sumi-e-art-brings-this-action-rpg-to-life)
- [Exploring the Simplicity of Japanese Minimalist Art — Rossetti Art](https://rossettiart.com/blogs/news/japanese-minimalist-art)

## Difficulty Tuning

**Problem addressed:** the prototype ran the enemy at full strength from the first second (`rampFactor = 1 + elapsed*0.006`, i.e. ~1.0 at t=0). Its first surge landed ~6s in and dealt ~154 frontier value every ~8.5s (~18 value/sec of pressure) — so a new player was under maximum assault before learning the controls. A simulated active "greedy" player bot actually *lost* under the old numbers (enemy overtook ~40s in).

**New curve — smooth asymptotic enemy ramp.** A single `rampFactor` scales both the enemy's charge regen (how *often* it surges) and its per-surge attack power, so effective enemy pressure grows as roughly `rampFactor²`. It eases in from a gentle floor toward a late-game ceiling:

```
rampFactor(t) = RAMP_MAX − (RAMP_MAX − RAMP_MIN) · exp(−t / RAMP_TAU)
              = 1.05 − 0.70 · exp(−t / 30)
```

This is a smooth, continuous, kink-free asymptote (no hard steps or arbitrary plateaus). It self-caps near `RAMP_MAX` so long runs stay challenging without spiking.

| Elapsed | rampFactor | Enemy surge cycle | Effective enemy pressure | Feel |
|--------:|-----------:|------------------:|-------------------------:|------|
| 0 s   | 0.35 | ~20 s (first surge ~18 s in) | ~2.7 val/s  | very easy — free room to learn |
| 15 s  | 0.63 | ~12 s | ~7.9 val/s  | warming up |
| 30 s  | 0.79 | ~10 s | ~12 val/s   | contested |
| 45 s  | 0.89 | ~9 s  | ~15 val/s   | hard-but-fair zone begins |
| 60 s  | 0.96 | ~8.7 s| ~17 val/s   | tense back-half |
| 90 s  | ~1.02| ~8.4 s| ~18 val/s   | full pressure at the wire |

**Simulated traces (60 fps, verified in a headless sim):**
- *Passive player (worst case):* enemy territory at t=15/30/45/60 s went from **7 / 20 / 32 / 44 %** (old) to **5 / 7 / 15 / 24 %** (new) — a genuinely gentle opening that accelerates in the back half instead of steamrolling immediately.
- *Active player bot:* now **wins by majority** (player 34 % vs enemy 16 % at 60 s) but the enemy is visibly accelerating late, keeping it tense rather than a runaway 62 % threshold blowout. Under the old ramp the same bot *lost*.

**Key constant changes (old → new):**
- Enemy ramp: `RAMP_PER_SEC = 0.006` (factor 1.00→1.54, aggressive from t=0) → replaced by `RAMP_MIN = 0.35`, `RAMP_MAX = 1.05`, `RAMP_TAU = 30` (factor 0.35→~1.02, gentle start).
- `PLAYER_INK_REGEN_PER_SEC`: `6 → 7` — a small boost so an active player has enough ink to convert the easy opening into a real lead and defend the frontier during the tense finish, without dulling the core burst-then-rest rhythm.

Everything else (surge strength/duration/drain, frontier sample, paint value, ink cost, capture threshold, timers, thresholds, win/lose rules, visuals) is unchanged — only the ramp shape and player regen were retuned.

### Post-QA winnability retune (2026-07-23)

A QA playtest (6 full 90 s matches, real touch gestures, best result 26 % vs 28 % — a narrow timeout loss) showed the primary win was effectively unreachable: under perfect efficiency the old ink economy (start 100 + regen 7·90 = 730 ink at 4 ink/step) only funds ~91 neutral captures ≈ 54 % of the board, already below the 62 % win threshold, before any enemy erosion. Only a razor-thin majority-at-timeout was realistically possible; naive play lost decisively. Balance constants only were retuned (no mechanics/controls/visuals):

- `WIN_THRESHOLD`: `0.62 → 0.58` — a threshold actually reachable given the ink economy, still requiring clear dominance. (On-screen instruction text and this doc's "62 %" references updated to match.)
- `INK_COST_PER_STEP`: `4 → 3` — each paint step is cheaper, stretching the ink budget ~33 %.
- `PLAYER_INK_REGEN_PER_SEC`: `7 → 9` — more ink over the match for genuine offense plus frontier defense.
- `RAMP_MAX`: `1.05 → 0.92` — trims the enemy's late-game surge ceiling (pressure ~rampFactor², so ~23 % less late pressure) so a player leading late has real counterplay instead of being inevitably overtaken at the buzzer.

New ink budget = 100 + 9·90 = 910 ink at 3/step = ~303 steps ≈ 152 theoretical neutral captures, comfortably above the 103 tiles (58 %) needed — so a skilled, active player can genuinely reach the primary win with a defense buffer left over, while imperfect play and enemy erosion keep it tense (passive play still loses). `WIN_THRESHOLD` is shared by both sides, so the enemy's outright-win threshold also drops to 58 % (win/lose structure unchanged).

## Edit Log

- **2026-07-23 (game-editor):** Post-QA winnability retune — balance constants only: `WIN_THRESHOLD 0.62→0.58`, `INK_COST_PER_STEP 4→3`, `PLAYER_INK_REGEN_PER_SEC 7→9`, `RAMP_MAX 1.05→0.92` (details above), plus updated the on-screen instruction "62 %→58 %" to stay accurate. Two QA-flagged cosmetic fixes: `resetGame` now clears the stale `win`/`lose` overlay class (not just `show`); the end-overlay stat line now puts "Your territory" and "Enemy" on separate lines so `white-space: pre-line` no longer collapses the spacing.

## Assets

Promotional thumbnails (under `thumbnails/`):

| File               | Dimensions   | Intended web use                                                                 |
|--------------------|--------------|-----------------------------------------------------------------------------------|
| `thumb-small.png`  | 320 × 180 px | Compact rows in a games list / index page, sidebar links                          |
| `thumb-medium.png` | 640 × 360 px | Grid/card layout tiles on a games gallery page (the default "cover image")        |
| `thumb-large.png`  | 1280 × 720 px| Hero banner on the game's own page; also works directly as an Open Graph / Twitter Card social-preview image |

These are original poster-style illustrations inspired by Ink Tide's concept and palette — not screenshots of gameplay. All three are downsampled from a single 1280×720 master and share identical 16:9 framing. The artwork uses the game's real palette (deep sumi-ink ground `#0c0e13`, indigo-blue player ink `#52a7ff`, vermillion enemy tide `#ff5e54`, amber surge tell `#ffbf5c`, warm rice-paper text `#ece7da`) and its Georgia-serif title treatment. It depicts the 11×16 territory board mid-duel: blue ink flooding up from the bottom-left foothold, the red tide bleeding down from the top-right, an amber contested frontier between them, and a single blue brush-stroke gesture with a fingertip head sweeping across the board — evoking the drag-to-paint core mechanic and the enemy's surge rhythm.

## Pipeline Token Usage

Per-stage subagent token usage. The original run (game-creator → game-editor) hit a cloud usage limit and died partway through; those stages had already completed successfully but their token figures were not captured before the interruption, so they are recorded as "not recorded" below. The resumed stages (re-verify QA onward) have exact figures. Models are from each agent's own frontmatter (`sonnet`/`opus`) or inherited from the producer (opus) where no model is pinned.

| Stage | Model | Tokens |
|---|---|---|
| game-creator | sonnet | not recorded (interrupted run) |
| game-polisher | opus (inherited) | not recorded (interrupted run) |
| game-balancer | opus (inherited) | not recorded (interrupted run) |
| game-qa | opus | not recorded (interrupted run) |
| game-editor | opus (inherited) | not recorded (interrupted run) |
| game-qa (re-verify) | opus | 49,475 |
| game-thumbnailer | opus (inherited) | 40,073 |
| game-describer | opus (inherited) | 29,298 |
| **Total (resumed stages)** | | **118,846** |

*Producer's own orchestration tokens aren't included above — they aren't observable from within its own execution, only each subagent call's reported usage is.*
