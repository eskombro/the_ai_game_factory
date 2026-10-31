# Loopsnare

**Pitch:** A snake that never dies from biting itself. Biting itself is the whole point: cross your own trail to lasso gems, but never lasso a mine.

## Original twist

In classic snake games, crossing your own body kills you. In Loopsnare it's the only way to score. Whenever your head crosses your trail, the closed loop snaps shut and everything inside it gets captured. Capturing several gems in one loop scores quadratically, so you want big, greedy loops. Red mines are scattered around, though, and a loop that encloses a mine blows up. Every loop is a quick judgment about what you can surround without catching a mine.

## How to play / controls (touch-first, mouse equivalent)

- **Hold and drag anywhere** on the screen. The snake's head turns toward your finger at a limited turn rate. It always moves forward at a constant speed.
- **Hold your finger still** and the snake circles around that point, which is the easiest way to make a tight loop around a gem.
- **Release** and the snake goes straight. It bounces off the screen edges.
- The mouse works the same way through unified Pointer Events (press and drag). There are no keyboard controls.
- The start screen and game-over screen each have one large centered button (Start / Play again). Nothing essential sits in the bottom-right corner, and steering works from any point on the screen.

## Core mechanics

- The snake's trail has a fixed length, which grows slowly with difficulty from 420px to 620px.
- **Loop closing:** each frame, the newest head segment is tested against older trail segments. On a crossing, the polygon from the crossing point through the trail back to the head is the loop. The loop part of the trail is removed and grows back as you keep moving.
- **Capture:** if the loop contains no mines, every gem inside is captured for `10 * n^2` points (n = gems in that loop).
- **Mine in loop:** you lose a life, the mine is destroyed (and respawns elsewhere), and no gems in that loop are captured.
- **Head hits a mine:** you lose a life and the mine is destroyed and later respawned.
- **Gems expire:** each gem has a countdown ring. If it runs out, you lose a life. Expiry ignores invulnerability.
- After any mine damage you get 1.5s of invulnerability, and the snake blinks.

## Win / lose

- Endless score attack. You start with 3 lives, and the game ends at 0. The best score is saved in localStorage (`loopsnare_best`).

## Difficulty escalation (all in `CFG`, ramped linearly over `rampTime` = 120s)

- Snake speed goes from 150 to 220 px/s, and trail length from 420 to 620 px.
- The gem spawn interval goes from 2.4s to 0.9s (max 8 gems on screen), and gem lifetime from 12s to 5.5s.
- Mines start at 1, with +1 every 15s up to 8. After 30s they begin to drift and bounce, ramping up to 30 px/s.

## Notes for visual polish

- There is a single full-screen `<canvas id="game">`, and everything in play is drawn in `render()`.
- The HUD is `#hud`, fixed top-left, with `#score`, `#lives` and `#best`. Spawns stay below `CFG.hudTop` (52px), so the HUD doesn't cover items.
- Overlays are `#startScreen` and `#overScreen` (class `.overlay`, toggled with `.hidden`), and the buttons are `#startBtn` and `#restartBtn`.
- Current placeholder colors:
  - background `#111`
  - snake trail `#ddd` (`#666` while blinking/invulnerable), head `#fd3`
  - gems `#3d6`, turning `#cf4` when under 30% of their life, with a white countdown arc
  - mines `#e33` with `#f99` spikes
  - loop flash: translucent green `#4f8` on a capture, red `#f44` on a mine
  - floating score text `#8f8`, damage text `#f55`
- Effects in the `effects` array are of type `poly` (loop flash), `ring` (burst) and `text` (floating label). They keep fading on the game-over screen.
- A faint circle marks the finger's steering target while it's held down.
- `window.__loopsnare` is a read-only debug hook (state, gems, mines, head, score, lives) for automated QA. It's harmless and safe to keep.

## Visual Design

**Direction:** "A single thread on deep ink." The game is a lasso game, so the snake is styled as a glowing cream rope with an amber "needle" head. It tapers and darkens toward the tail, so you can read at a glance which part of the trail is oldest. Everything else is a flat neon-minimal shape on a near-black field with a faint dot grid and a soft CSS vignette.

**Palette**
| Role | Hex |
|---|---|
| Background (ink) | `#0b0d17`, dot grid `rgba(122,128,153,0.13)` |
| Snake thread | `#f3e9d2`, fading toward `#282c40` at the tail; `#464a60` while invulnerable/blinking |
| Snake head / pointer marker / lives pips | `#ffc857` (amber, soft glow) |
| Gems, capture flash, score popups, buttons | `#5ef2c2` (mint) |
| Gem about to expire | `#d8f25e` (lime), pulsing, with a coral countdown arc |
| Mines, damage flash, BOOM/OUCH/MISSED, burst rings | `#ff5a6e` (coral) |
| Muted labels | `#7a8099` |

**Typography:** system rounded stack (`ui-rounded, "SF Pro Rounded", "Nunito", system-ui, sans-serif`) with no web font loads. Headings and buttons use uppercase 800 weight with wide letter-spacing. The HUD uses small spaced labels with tabular numerals.

**Shapes & motion**
- Gems are rotated, gently swaying diamonds with a glow and a thin countdown ring on a faint track.
- Mines are slowly spinning 8-point coral stars with a dark core and a breathing halo.
- A captured loop gets a translucent fill plus a bright rim that widens as it fades. Mint particle bursts scale with the combo size, and a "+pts" popup scales up as it appears and has a dark outline.
- On damage there's a coral burst, a short screen shake (disabled under `prefers-reduced-motion`), and a low WebAudio thud. Captures play rising triangle blips, one per gem in the loop. Audio starts only after the Start/Play again tap.
- HUD lives are shown as amber pips. The original `#lives` text node is kept but visually hidden. The score pops briefly whenever it increases.
- The start screen has an inline SVG loop logo that draws itself in, plus an idle figure-eight rope doodle on the canvas behind the blurred overlay. Overlay contents fade and rise in a staggered sequence.
- Implementation note: all game logic is byte-identical to the prototype. `render()` only reads state, and it maps the logic's legacy effect colors (`#4f8/#f44/#8f8/#f55`) to the palette above. Cosmetic juice is triggered by tagging newly seen `effects` entries with `_seen`. `window.__loopsnare` is unchanged.

**Inspiration**
- Neon-minimal snake games on itch.io, e.g. [Neon Snake](https://twistedbyart.itch.io/neon-snake) and [Minimalist Snake](https://albertocantosz.itch.io/minimalist-snake)
- [Glowcoil spec](https://app.cinevva.com/arcade/glowcoil): dark navy field, a glowing head that differs in color from the body, and small particle bursts on collect
- [NeonLines](https://rawg.io/games/neonlines): line-only aesthetic

## Difficulty Tuning

**Problem:** a scripted run lost all 3 lives in ~10-15s. Every expired gem costs a life, and the old start (a gem every 2.4s, 12s life, so ~5 gems alive at once) demanded a capture every ~2.4s from second one, which a new player cannot sustain.

**Curve:** `d = min(1, elapsed / rampTime)`, linear, `rampTime` 120s -> 150s. Speed, trail length, gem spawn interval and gem lifetime lerp on `d`. Mines add one per `mineEvery` seconds (a step, but a gentle one) and drift ramps in over 60s once started.

| Constant | Old | New |
|---|---|---|
| speed (px/s) | 150 -> 220 | 130 -> 200 |
| trail length (px) | 420 -> 620 | 420 -> 600 |
| gem spawn interval (s) | 2.4 -> 0.9 | 4.5 -> 1.6 |
| gem lifetime (s) | 12 -> 5.5 | 20 -> 8 |
| mines | 1, +1/15s, max 8 | 1, +1/25s, max 6 |
| mine drift start / speed | 30s / 30 px/s | 45s / 24 px/s |
| rampTime (s) | 120 | 150 |
| invulnerability (s) | 1.5 | 2.0 |

**Trace (steady-state gems alive ~ life/interval):** t=0: 4.5s spawn, 20s life (~4 gems, 4.4s of slack each), speed 130, 1 mine. t=30s (d=.2): 3.9s / 16.4s, 2 mines (second arrives at 25s), no drift. t=60s (d=.4): 3.3s / 14.4s, 3 mines, drifting. t=120s (d=.8): 2.2s / 9.6s, 5 mines, speed 186. t=150s+: 1.6s / 8s, 6 mines, speed 200 (plateau). Gem lifetime per spawn interval shrinks from ~4.4x to ~5x spare, with the pressure coming mostly from mines and speed; the old end state (0.9s / 5.5s) was ~6x gems per life window and far harsher, so the ceiling is also softened to stay fair.

## Edit Log

- 2026-10-31: Staggered the starting gems (second gets +8s life; first timer-spawned gem now waits gemSpawnStart instead of 0.5s) so an idle player no longer loses two lives in one frame at 20s; start-screen text now says an expiring gem costs a life.

## Assets

Thumbnails in `thumbnails/` (original poster-style illustrations inspired by the game's concept and palette, not screenshots):

| File               | Dimensions   | Intended web use                                                                 |
|---------------------|--------------|-----------------------------------------------------------------------------------|
| `thumb-small.png`  | 320 × 180 px | Compact rows in a games list / index page, sidebar links                          |
| `thumb-medium.png` | 640 × 360 px | Grid/card layout tiles on a games gallery page (the default "cover image")        |
| `thumb-large.png`  | 1280 × 720 px| Hero banner on the game's own page; also works directly as an Open Graph / Twitter Card social-preview image |

## Pipeline Token Usage

| Stage | Model | Tokens |
|---|---|---|
| game-creator | default (frontmatter) | 30969 |
| game-polisher | default (frontmatter) | 46621 |
| game-balancer | default (frontmatter) | 18300 |
| game-qa | default (frontmatter) | 36832 |
| game-editor | default (frontmatter) | 18979 |
| game-qa (re-verify) | default (frontmatter) | 29277 |
| game-thumbnailer | default (frontmatter) | 18311 |
| game-describer | default (frontmatter) | 15070 |
| **Total (subagent stages)** | | **214359** |

*Producer's own orchestration tokens aren't included above — they aren't observable from within its own execution, only each subagent call's reported usage is.*
