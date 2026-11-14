# Slickstone

**Pitch:** Solo curling with your fingertip: flick the stone up the ice, then rub the ice ahead of it to sweep it home. Every swept patch stays slick for the rest of the end.

## The original twist

In real curling, sweeping only lasts as long as the stone passes over it. In Slickstone, **sweeping is permanent terrain for the whole end**. Each patch you rub turns slick (lower friction, less curl) and stays that way for all four of your stones, and for the red stones too. Sweep a lane and you've built a highway for later throws. Sweep the house, though, and later stones (or ones you knock) won't stop in it. Every sweep helps this stone and changes the next one's shot.

## How to play (touch first, mouse works the same way)

All input goes through unified Pointer Events (`pointerdown` / `pointermove` / `pointerup` / `pointercancel`) on the canvas, plus `click` on the HTML buttons. Touch and mouse behave the same, and nothing needs a keyboard.

1. **Start screen:** tap **Start**.
2. **Choose curl (optional):** tap the **Curl** button (top-left) to switch between right (↻) and left (↺) curl. The small arrow above the stone shows which way it will drift. You can only switch while aiming.
3. **Flick:** press on the yellow stone in the delivery zone (below the grey DELIVERY line). You can drag it left or right to set your starting spot, then flick upward and let go. Launch velocity comes from your finger speed over roughly the last 80 ms. If you drag past the delivery line, the stone throws automatically, and **that same finger becomes your sweeping finger**.
4. **Sweep:** while the stone slides, rub back and forth inside the dashed box just ahead of it (8–140 px in front, ±50 px to each side). More rubbing makes the ice slicker, up to full slick. Slick ice cuts friction by up to 50% and curl by up to 75%.
5. Once every stone stops, the next stone comes up. After 4 stones the end is scored.

## Core mechanics

- **Sheet (logical 360×640, scaled to fit):** house centred at (180,130) with rings of radius 18 / 42 / 64. BACK line at y=50, HOG line at y=300, DELIVERY line at y=470. Stones start at (180,590).
- **Physics:** constant friction deceleration (55 px/s² on plain ice) that scales down with slick. The thrown stone gets a constant sideways curl acceleration (14 px/s²) that doesn't change its speed. Stones bounce off each other with equal mass and restitution 0.9. 4 physics substeps per frame.
- **Out of play:** a stone touching a side edge, fully past the BACK line, or stopped short of the HOG line is removed. The HOG check runs for every stone once all motion stops.
- **Slick grid:** 36×64 cells of 10 px each, values 0..1. Rubbing adds `distance × 0.012` within a 16 px radius of the finger. The grid resets at the start of each end.
- **Red stones:** at the start of end *n*, `min(n−1, 5)` red stones are placed at random between y=90 and y=280 (house and guard area). They're obstacles you can knock out.

## Scoring, win/lose

- Each of your stones in the house scores 3 (button) / 2 (middle) / 1 (outer). A stone counts if any part of it touches the ring.
- Each red stone still in the house **subtracts** its ring value.
- **End target** = `2 + endNumber` (3, 4, 5, …). Meet it and you clear the end, and your score is added to the Total. Fall short and the game ends.
- The game-over screen shows the final Total and how many ends you cleared. **Play Again** restarts from end 1.
- The HUD shows End, Stone k/4, live end points / target, and Total.

## Tuning knobs (top of the script)

`BASE_FRICTION`, `SLICK_FRICTION_CUT`, `CURL_ACCEL`, `SLICK_CURL_CUT`, `FLICK_GAIN` (0.3), `MAX_LAUNCH` (420), `MIN_LAUNCH_VY`, `MAX_ANGLE` (±25°), `SWEEP_PER_PX`, `SWEEP_RADIUS`, the sweep-box size, `targetFor(n)`, `redCountFor(n)`.
Measured in testing: a launch of about 160 px/s stops just past the hog line, about 200 px/s reaches the house, and 350 px/s or more sails out the back. A short throw plus some sweeping is the intended skill.

## Notes for visual polish

- **DOM:** `#hud` (top bar: `#curlBtn`, `#hEnd`, `#hStone`, `#hPts`, `#hTarget`, `#hTotal`), `#wrap` > `canvas#c` (everything in the game), `#startScreen` / `#endScreen` overlays (`.overlay`, `.hidden`), with `#endTitle`, `#endText`, `#endBtn`.
- **Canvas** is drawn in logical 360×640 units through a scale+DPR transform in `resize()`. All drawing lives in `draw()`.
- **Placeholder colours:** ice `#eef4f8`, slick cells `rgba(60,170,255, 0.55·v)` drawn as hard 10 px squares (they could be softened or blended). House outer `#36c`, button `#d33` at 55% alpha. Hog line `#c22`. Player stones are a grey body with a `#fc3` centre, red stones a `#d33` centre. The sweep box is a dashed blue rectangle. Hint text sits at the bottom centre of the canvas.
- **Bottom-right corner:** no controls there. The delivery stone starts at the bottom centre and the curl button is top-left. Keep it that way.
- There are no sound or particle effects yet. Good candidates: sweep scratch particles, stone clack on collision, a score pop at end of end.
- `window.__slickstone` is a read-only debug hook (`phase`, `stones`) for automated playtesting. It's harmless, so leave it in.

## Visual Design

**Direction: "Nordic night rink."** A deep navy frame around a pale, pebbled sheet of ice. Flat shapes, a small limited palette, and soft, low-key motion. The one bright warm colour is your stone, so the eye always finds it first.

**Palette**

| Role | Hex |
|---|---|
| Page background (radial gradient) | `#1d3157` → `#14213d` → `#0c1529` |
| Ink (lines, text on ice, hint pill) | `#1d2b44` / `#14213d` |
| Ice | `#f4f8fb` (subtle vertical gradient `#eef4f9`–`#e9f0f6` plus pebble specks) |
| Frost / swept ice / sweep box | `#8ecae6`, slick glow `rgb(70,170,235)` |
| House outer ring | `#5fa8d3` |
| Player stone cap, buttons, accents | sunflower `#ffb703` (handle/button shadow `#c98a00`) |
| Red stones, button, HOG line, game-over title | coral red `#e63946` (handle `#a4222e`) |
| Granite stone body | `#b4bfcd` → `#6f7c90` radial |
| HUD secondary text | mist `#a9bcd0` |

**Typography:** system rounded stack only, with no web-font download: `ui-rounded, "SF Pro Rounded", "Nunito", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`. Headings and buttons use weight 800. The ice-line labels (B A C K / H O G / D E L I V E R Y) are letter-spaced 9 px caps. Numbers use tabular figures.

**What changed (presentation only)**
- The ice sheet, rings, and line markings are pre-rendered once into an offscreen 2× canvas, then blitted each frame.
- The slick grid now renders into a 36×64 offscreen canvas and is upscaled with smoothing, so swept ice shows as soft frosty blobs instead of hard 10 px squares. The data and thresholds are the same.
- Stones have a drop shadow, a granite gradient body, a coloured cap with a highlight, and a handle that spins as the stone slides (curl direction sets the spin direction). Moving stones leave a fading comet trail.
- The sweep box is rounded, faintly filled, and has marching dashes. The stone waiting in delivery shows a pulsing yellow ring. The hint text sits on a navy pill.
- Juice: white ice-shaving particles while rubbing, dark chips plus a small capped screen shake on hard stone hits, and a coloured puff when a stone goes out of play. Particles and shake are reduced under `prefers-reduced-motion`.
- WebAudio, created on the first pointer press: filtered-noise sweep scratches (throttled), a low whoosh on release, a triangle "clack" on collisions, and a rising chime or falling tone at the end of each end.
- HUD stats sit in translucent chips, and the points value pops when it changes. The overlays are blurred navy with a CSS-only rings logo, a staggered rise-in animation, and a pill-shaped sunflower button with a pressed state. The end-screen title is sunflower on a cleared end and coral on game over.
- Layout, element IDs, and the canvas size are unchanged. The curl button stays top-left, and the bottom-right corner still has no controls. `window.__slickstone` is untouched.

**Inspiration**
- The flat-colour 2D curling palette (sky blue `#8ecae6`, sunflower `#ffb703`, red, off-white): https://www.summerengine.com/asset-store/flat-colour-c23ddc19
- Pastel, soft-colour curling precedent (Cuckoo Curling): https://chromacool.itch.io/cuckoo-curling/comments
- Granite-grey stone tone reference: https://www.summerengine.com/asset-store/chunky-low-poly-d94dd564

## Difficulty Tuning

**Problem:** Targets rose by 1 point per end and red stones were added every end, so by end 5-6 the target approached the practical maximum (four stones, up to 12 pts minus red penalties) and the game ended abruptly. Separately, continuous sweeping halved friction over the whole path, so a stone thrown to just reach the house could be carried off the back line even with moderate sweeping.

**Sweep fix:** `SLICK_FRICTION_CUT` 0.5 -> 0.35 (max stopping-distance gain 2.0x -> about 1.54x), `SLICK_CURL_CUT` 0.75 -> 0.6, `SWEEP_PER_PX` 0.012 -> 0.01 (about 100 px of rubbing for a full patch). Sweeping is still clearly rewarding and lets a soft throw reach the house, but a hard throw with nonstop sweeping can still overshoot, so restraint remains a skill.

**Ramp (per end n):**

| End | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 10+ |
|---|---|---|---|---|---|---|---|---|---|
| Old target | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 12+ |
| New target | 2 | 3 | 3 | 4 | 5 | 5 | 6 | 6 | 8 (cap) |
| Old red stones | 0 | 1 | 2 | 3 | 4 | 5 | 5 | 5 | 5 |
| New red stones | 0 | 0 | 1 | 1 | 2 | 2 | 3 | 3 | 4 (cap) |

Formulas: `targetFor(n) = min(8, round(1.5 + 0.6n))`, `redCountFor(n) = min(floor((n-1)/2), 4)`. Ends 1-2 have an open sheet and a low target (about one stone on the button, or two in the outer ring), so a new player can learn flick and sweep. Pressure builds gradually; with about 15-45 s per end, the target tops out around end 10 (several minutes in), and the cap keeps it fair for skilled players.

## Edit Log

- 2026-11-14: A flick rejected for being too slow (launch vy below `MIN_LAUNCH_VY`, including an auto-throw past the delivery line) now shows "Too slow - flick faster" in the hint for 2.5 s, or until the next grab. Physics and thresholds are unchanged.
- 2026-11-14: Total now only increases when an end is cleared (code moved to match the Scoring section above). A failed end's points are no longer added, so Game Over's "Final total" equals the sum of cleared ends.

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
| game-creator | opus | 37813 |
| game-polisher | opus | 68665 |
| game-balancer | sonnet | 20490 |
| game-qa | sonnet | 50908 |
| game-editor | sonnet | 27145 |
| game-qa (re-verify) | sonnet | 21026 |
| game-thumbnailer | sonnet | 21793 |
| game-describer | sonnet | 17467 |
| **Total (subagent stages)** | | **265307** |

*Producer's own orchestration tokens aren't included above — they aren't observable from within its own execution, only each subagent call's reported usage is.*
