# Rubble Paddle

**Pitch:** A brick-breaker where the bricks you smash fall as rubble you can catch. Hoarding it makes your paddle wider but heavier, and a flick fires the whole load back at the wall.

## Original twist
In classic breakout, broken bricks just disappear. Here every broken brick drops a chunk of rubble. Catching it widens your paddle, so the ball is easier to catch, but it also weighs the paddle down so it lags further behind your finger. Your rubble is also your ammo. Flicking up fires all of it as a volley of shards that break bricks for double points, and your paddle goes back to light and narrow. So you keep choosing between being wide and slow or narrow and quick.

## How to play / controls (touch-first, mouse parity via Pointer Events)
- **Drag anywhere** (finger, or mouse held down) to move the paddle. Movement is relative, so you can drag from any spot without covering the paddle.
- **Tap** (press and release with less than 12px of movement) to launch the ball when it is resting on the paddle.
- **Flick up** (a quick upward swipe of more than 40px at faster than 0.6px/ms, mostly vertical) to fire every rubble chunk you hold as upward shards. A flick also launches a resting ball.
- The Start and Play Again buttons are centered DOM buttons. There are no keyboard controls, and nothing essential sits in the bottom-right corner. The HUD is along the top and the paddle sits at 80% of the screen height. Drag gestures work anywhere on the canvas.

## Core mechanics
- 7 columns of bricks. The level has `min(4 + level, 10)` rows. From level 2 the top rows take 2 hits, and from level 5 the top row takes 3.
- Ball speed is `300 + 25*(level-1)` px/s, capped at 540. Where the ball hits the paddle sets its bounce angle (up to ±60°). A minimum vertical speed component stops the ball from getting stuck bouncing nearly flat.
- Each broken brick drops a 14x8 rubble chunk that falls under gravity (650 px/s²). Catching it adds 1 to your load, adds 8px of paddle width (capped at 70% of screen width), and scores +1.
- Paddle follow stiffness is `26 / (1 + 0.35 * load)`, so more load means more lag.
- Volley: one shard per held chunk, spread across the paddle and moving up at 750 px/s. Each shard deals 1 damage to the first brick it hits. Afterwards the load and width reset.
- Scoring: brick broken by the ball = 10, broken by a shard = 20, a hit that doesn't break a multi-hit brick = 2, rubble caught = 1, level clear = 100 × level. The best score is stored in localStorage (`rubblePaddleBest`).

## Win / lose
- The game is endless. Clearing all bricks moves you to the next level, which has more rows, tougher bricks and a faster ball. The ball goes back onto the paddle, and you keep any rubble you're carrying.
- If the ball falls below the screen you lose a life. You also lose all held and falling rubble, and the paddle resets. You start with 3 lives, and at 0 the Game Over overlay shows your score, level and best, with a Play Again button.

## Notes for visual polish
- `<canvas id="game">` fills the screen and everything in play is drawn on it in `render()`. The overlays are `#startScreen` and `#overScreen` (`.overlay`, with `.hidden` toggling them), and the buttons are `#startBtn` and `#restartBtn`.
- Current placeholder colors: background `#111`; bricks by remaining hits `#888` (1), `#c84` (2), `#c44` (3); rubble and the load notches on the paddle `#a97`; shards `#fd6`; paddle `#4a9`; ball `#fff`; HUD text `#eee`.
- The HUD is drawn on the canvas along the top (score/best on the left, level/rubble in the center, lives on the right). Hint text ("Tap to launch" / "Flick up to fire N rubble") is drawn 40px below the paddle, and level/life-lost banners are drawn at 55% of the height.
- Good places to add juice: rubble sticking to the paddle (it currently shows as notches on top), paddle sag or wobble with weight, the shard volley launch, brick break debris, and the life-lost moment.
- Tunables are grouped at the top of the script (`// ---------- Tunables ----------`).

## Visual Design
**Direction: "dusk quarry".** Warm masonry against a deep slate-violet sky. It uses a limited palette of about 8 colors, in the spirit of the restricted-palette brick-breakers from Palette Jam 2. Brick color shows durability at a glance, and the rubble is the same stone as the bricks, so you can see that the paddle is carrying broken wall.

**Palette**
| Role | Hex |
|---|---|
| Background gradient (top to bottom) | `#2a2333` to `#1c1a26` |
| Ink / HUD values | `#f1e8d8` |
| Muted labels / body text | `#9a90a6` |
| Brick, 1 hit (sandstone) | `#e0cba6` |
| Brick, 2 hits (terracotta) | `#d0814f` |
| Brick, 3 hits (oxblood) | `#9c3f4b` |
| Rubble / load (light, dark) | `#a88a6b`, `#7d654e` |
| Shards, rubble count, best score (spark) | `#ffd27a` |
| Paddle and buttons (patina teal, dark) | `#6cb8a9`, `#3f8073` |
| Ball | `#f6efe2` |
| Danger (life lost) | `#e0606c` |

**Type:** system rounded stack only (`ui-rounded, "SF Pro Rounded", "Nunito", "Trebuchet MS", system-ui, sans-serif`). No web fonts. The HUD uses small uppercase 11px labels over 800-weight values.

**Shapes and motion (all cosmetic, in render/FX code only):**
- Bricks are rounded slabs with a top highlight and a bottom shade. Damaged multi-hit bricks show crack lines and flash chalk-white when chipped.
- Falling rubble tumbles as it falls. Held load is drawn as an uneven pile of chunks on the paddle, and the newest chunk pops when caught. The paddle's underside bows downward with load, up to 6px. Its top edge, which is the collision line, is unchanged.
- Shards are spark-yellow arrowheads with fading streaks. A flick sends a gold ring out from the paddle, plus a spark burst and a small shake.
- The ball leaves a soft 8-frame trail. Broken bricks throw debris squares in their own color.
- Losing a life triggers a red vignette, a bigger shake and red debris. Banners fade and scale in, and life-lost banners are red. Banners are hidden on the Game Over overlay.
- "Tap to launch" pulses. Lives are shown as chalk dots in the top right.
- Overlays use a radial dusk gradient. The start screen has a CSS-only mini brick wall where two bricks loop a falling animation. Buttons are teal slabs that press down.
- Short WebAudio beeps play for paddle, brick, chip, catch, volley, level clear and life lost. The audio context starts on the Start/Play Again tap.
- Respects `prefers-reduced-motion`: no shake and no overlay animations.

**Inspiration**
- [Pixel Breaker (Palette Jam 2, 8-color limit)](https://multipixels.itch.io/pixel-breaker)
- [itch.io minimalist breakout tag](https://itch.io/games/free/tag-breakout/tag-minimalist)
- [Minimal Brick Breaker](https://apprenticesoft.itch.io/minimal-brick-breaker)

## Difficulty Tuning
**Curve:** ball speed is now continuous in live play time `t` (seconds with the ball in flight, reset each new game, kept across lives and levels): `speed = 240 + 280*(1 - exp(-t/80))`, capped at 520 px/s. It is re-applied on every paddle bounce, so it ramps smoothly with no steps.

| t | speed (px/s) |
|---|---|
| 0s | 240 |
| 30s | ~328 |
| 60s | ~389 |
| 120s | ~457 |
| 180s | ~497 |
| plateau | 520 cap |

Roughly 60-120s in, the player is at "hard but fair" speed (about the old level 3-6 range), then creeps toward the cap.

**Level structure (softened so level 2 is not a spike):** rows `min(3 + level, 10)` (level 1 = 4 rows, 28 bricks); 2-hit rows start at level 3 (`min(level-2, 4)` rows); the 3-hit top row starts at level 6.

| Constant | Old | New |
|---|---|---|
| Ball speed at start | 300 flat | 240 |
| Speed ramp | +25 per level, cap 540 | time-based asymptote, cap 520 |
| Rows | min(4+level, 10) | min(3+level, 10) |
| 2-hit bricks from | level 2 | level 3 |
| 3-hit brick from | level 5 | level 6 |

Paddle weight, rubble, volley and lives are unchanged.

## Assets
Thumbnails in `thumbnails/` (original illustrations inspired by the game's concept and palette, not screenshots):

| File               | Dimensions   | Intended web use |
|---------------------|--------------|------------------|
| `thumb-small.png`  | 320 × 180 px | Compact rows in a games list / index page, sidebar links |
| `thumb-medium.png` | 640 × 360 px | Grid/card layout tiles on a games gallery page (the default "cover image") |
| `thumb-large.png`  | 1280 × 720 px| Hero banner on the game's own page; also works as an Open Graph / Twitter Card social-preview image |

## Pipeline Token Usage

| Stage | Model | Tokens |
|---|---|---|
| game-creator | default (frontmatter) | 26071 |
| game-polisher | default (frontmatter) | 58867 |
| game-balancer | default (frontmatter) | 19668 |
| game-qa | default (frontmatter) | 23044 |
| game-thumbnailer | default (frontmatter) | 17804 |
| game-describer | default (frontmatter) | 14449 |
| **Total (subagent stages)** | | **159903** |

*Producer's own orchestration tokens aren't included above — they aren't observable from within its own execution, only each subagent call's reported usage is.*
