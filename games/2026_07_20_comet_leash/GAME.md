# Comet Leash

**One-line pitch:** Hold your finger anywhere to drag your comet toward it on an energy leash that burns out if you pull too long — grab stars, dodge mines, and learn to coast.

## The original twist

Finger-gravity steering is familiar, but here the pull itself is a draining resource. The leash meter empties while you hold and refills only while you coast on momentum, and fully burning it out locks you out of pulling until it partially recovers. The game is about rationing your touch: short tugs and clever coasting beat holding the screen down.

## How to play / controls (touch only)

- **Tap** the start screen to begin; **tap** the game-over screen to play again.
- **Touch and hold anywhere** on the screen: the comet accelerates toward your finger while the leash meter (top center) drains.
- **Drag** your finger to steer continuously.
- **Release** to coast on momentum; the leash meter recharges while you are not pulling.
- If the meter hits zero it "burns out" (bar turns dark red) — pulling is disabled until it refills past a recovery threshold.
- Only the first finger is tracked; extra fingers are ignored.
- No keyboard or mouse required for anything. Input is implemented with pointer events (`pointerdown`/`pointermove`/`pointerup`/`pointercancel`) plus `touch-action: none`.

## Core mechanics

- Comet has inertia: constant-magnitude acceleration toward the finger while pulling, velocity drag, a speed cap, and damped bounces off all four screen edges.
- One yellow star is on screen at a time. Touching it scores +1, refills part of the leash meter, and respawns the star away from the comet (and clear of the HUD strip).
- Red mines spawn from random screen edges aimed at random interior points, cross the arena, and despawn once well offscreen.
- Hitting a mine costs 1 of 3 lives, destroys that mine, and grants ~2.0 s of invulnerability (comet blinks).
- Difficulty ramp: target mine count = 1 + score/4 (max 8); mine speed = 55 + 6.5·score px/s (max 235); first mine delayed ~2.2 s after start.
- Best score persists via `localStorage` (`comet_leash_best`), guarded by try/catch.

## Win / lose conditions

- Endless score-chase; no win state. Score = stars collected.
- Lose when all 3 lives are gone. Game-over screen shows score and best; a 0.6 s tap lockout prevents accidental instant restarts.

## Notes for visual polish (next stage)

- Everything is drawn on a single full-screen `<canvas id="game">`; there is no DOM UI. All visuals are placeholder flat shapes on `#0b0e1a`:
  - Comet: white/ice circle `#e8f4ff` (blinks during invulnerability).
  - Star: yellow 5-point star `#ffd94f`. Mines: red circles `#ff5252`.
  - Leash line + finger ring: `#7fd4ff` while pulling, `#3a4a5a` when depleted/inactive.
  - Tether bar: green `#5fd0a0`, dark red `#8a4a4a` when burned out; HUD text plain white sans-serif.
- Good juice targets: comet trail while coasting, leash burn-out feedback, star pickup pop, mine hit shake. Keep the leash meter highly readable — it is the core mechanic.
- Ready/game-over screens are canvas-drawn text via `drawCenterText()`; restyle freely but keep tap-anywhere-to-start/restart.

## Visual Design

**Direction:** minimalist "deep night sky, restrained neon" — a dark indigo base leads, with just two neon accents used only as highlights (cyan = you/your leash, gold = reward) plus coral reserved exclusively for danger. All effects are CSS/canvas-only; no images, fonts, or external assets.

### Palette

- Background: vertical gradient `#0b1030` → `#070a18`, with a sparse twinkling starfield (density scales with viewport).
- Ink / primary text: `#eef4ff`; muted text: `#8b98bd`.
- Leash & comet accent: electric cyan `#6fe3ff` (dimmed inactive state `#3a4560`); comet body `#eaf6ff` with white core and cyan halo.
- Reward: warm gold `#ffd257` (star, score glyph, low-leash warning, "tap to" prompts).
- Danger: coral `#ff4d6d` (mines with dark `#5c1020` cores, hit vignette, burned-out leash label).

### Typography

System font stack (`-apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif`) — no font downloads. Weight does the hierarchy work: 800 titles, 600 HUD numerals, 500 body/labels.

### Juice added (all cosmetic; hooks are one-line additions, zero logic changes)

- Comet particle trail whose emission rate scales with speed.
- Animated dashed leash with flowing dash offset + gently breathing finger ring while pulling; sparse dim dashes when the pull is inactive.
- Star: soft glow, slow spin, gentle bob; pickup fires a gold particle burst + expanding ring pulse.
- Mine hit: brief screen shake, coral particle burst, red radial vignette flash.
- Leash burn-out: bar flickers coral, label switches to bold coral warning; bar also shifts to gold below 30% as an early warning. Bar is now rounded with a subtle glow to keep the core mechanic loud.
- HUD converted to glyphs: gold star + count (top-left), comet-colored life pips with hollow outlines for lost lives (top-right).
- "Tap to start / play again" prompts pulse via sine alpha.

### Inspiration sources

- Dark-base + neon-accent gaming palettes (dark tone leads, neon as highlights only): https://piktochart.com/blog/gaming-color-palette/ and https://www.designyourway.net/blog/space-color-palettes/
- Layered minimal juice (particles, shake, trails as small iterative additions): https://abagames.github.io/joys-of-small-game-development-en/make_game_juicy.html and https://www.bloodmooninteractive.com/articles/juice.html

## Notes for difficulty tuning (balancer stage)

All tunables are grouped in one commented constant block near the top of the script: `PULL_ACCEL`, `DRAG`, `MAX_SPEED`, `WALL_BOUNCE`, `TETHER_*`, `STAR_TETHER_BONUS`, `MINE_*`, `LIVES_START`, `INVULN_TIME`, `RESTART_LOCK`.

## Difficulty Tuning

Difficulty is keyed entirely to score (stars collected), which naturally paces the ramp to the player's own skill. The pass reshaped the curve so the opening is a genuine tutorial window, the middle ramps continuously, and both ramps (mine count and mine speed) reach their ceiling together at roughly the 2-2.5 minute mark of decent play, then plateau.

### The curve

- **Grace period (new):** the first mine now spawns ~2.2 s after start (`FIRST_MINE_DELAY`, was a hardcoded 0.5 s), so a new player can feel out the leash-and-coast controls and usually grab a star before any threat exists.
- **Opening (score 0-5, ~first 30 s):** 1-2 mines at 55-90 px/s — slow enough to sidestep with a single tug.
- **Mid-game (score 6-19, ~30-90 s):** count grows +1 per 4 stars, speed +6.5 px/s per star. At score 13 (~1 min): 4 mines at ~140 px/s. Both ramps are linear and per-star, and each mine's speed is still randomized ±15%, so there are no felt steps.
- **Ceiling (score ~28, ~2-2.5 min):** 8 mines at 235 px/s. Count and speed caps now land at the same score (previously count capped at 21 while speed kept climbing to 34, a lopsided lurch). After the cap, challenge plateaus and long runs are a pure skill test.

### Old → new constants

| Constant | Old | New | Why |
|---|---|---|---|
| `MINE_BASE_SPEED` | 70 | 55 | Easier read-and-dodge while learning |
| `MINE_SPEED_PER` | 5 | 6.5 | Steeper mid-ramp so the speed cap aligns with the count cap at score ~28 |
| `MINE_SPEED_MAX` | 240 | 235 | Same ceiling feel, aligned cap score |
| `MINE_COUNT_PER` | 3 | 4 | Slower crowding; 8-mine cap at score 28 instead of 21 |
| `MINE_SPAWN_GAP` | 0.7 | 0.9 | Gentler replacement rate, mostly felt early |
| first-mine delay | 0.5 | 2.2 (`FIRST_MINE_DELAY`) | Calm learning window at the start of every run |
| `TETHER_DRAIN` | 38 | 32 | ~3.1 s of continuous pull before burnout (was ~2.6 s) — forgiving for screen-holders |
| `TETHER_REGEN` | 26 | 28 | Slightly quicker recovery keeps coasting rewarding, not punitive |
| `STAR_TETHER_BONUS` | 22 | 26 | Scoring feeds the resource loop a bit more generously |
| `INVULN_TIME` | 1.6 | 2.0 | Prevents unfair chain-hits once 6-8 mines are on screen |

Unchanged: comet physics (`PULL_ACCEL`, `DRAG`, `MAX_SPEED`, `WALL_BOUNCE`), lives, recovery threshold, restart lockout — the movement feel and rules are identical.

## Assets

Promotional thumbnails live in `thumbnails/`. All three share a 16:9 aspect ratio and are downsampled from a single 1280×720 master, so framing is identical across sizes:

| File               | Dimensions   | Intended web use                                                                 |
|---------------------|--------------|-----------------------------------------------------------------------------------|
| `thumb-small.png`  | 320 × 180 px | Compact rows in a games list / index page, sidebar links                          |
| `thumb-medium.png` | 640 × 360 px | Grid/card layout tiles on a games gallery page (the default "cover image")        |
| `thumb-large.png`  | 1280 × 720 px| Hero banner on the game's own page; also works directly as an Open Graph / Twitter Card social-preview image |

These are original poster-style illustrations inspired by the game's concept and palette (indigo night sky `#0b1030`→`#070a18`, cyan `#6fe3ff` comet/leash, gold `#ffd257` star, coral `#ff4d6d` mines) — not screenshots of gameplay.
