# Inkputt

**Pitch:** Mini-golf where every putt leaves an ink trail that hardens into a wall, so each shot rebuilds the course for the next one.

## Original twist

In normal mini-golf the course stays the same. In Inkputt, the path your ball rolls along is wet ink, and when the ball stops that ink hardens into a solid wall. Old trails work as bank rails you can bounce off on purpose, but a sloppy shot can wall off the cup or trap the ball. You can wash away all the ink, but it costs a stroke. Each shot is played on the course and also changes it.

## How to play / controls

- **Putt:** touch anywhere on the course, drag, and release. It works like a slingshot: the ball goes the opposite way from your drag, and longer drags hit harder (full power at 130 CSS px). Drags shorter than 10 px are ignored, so you can cancel by sliding back to where you started.
- **Wash ink (+1):** the button in the top-left HUD clears all hardened ink for a 1-stroke penalty. It only works while the ball is at rest and there is ink to wash.
- Everything uses unified pointer events (`pointerdown/move/up/cancel`), so touch and mouse behave the same way. There are no keyboard controls. The drag can start anywhere on the canvas, and no control sits in the bottom-right corner.
- The start screen has instructions and a Start button. Between holes an overlay shows a Next hole button, and after hole 9 an end overlay shows a Play again button.

## Core mechanics

- Top-down course of 360x560 logical units, scaled to fit the viewport. Ball radius is 6 and cup radius is 11.
- Friction combines a linear and a proportional term. The ball stops below 6 units/s. Movement is sub-stepped (each step is at most half the ball's radius) so the ball can't pass through walls.
- Collisions are circle against line segment, with restitution 0.78. The course border, rectangular walls and hardened ink are all segments. Ink has a half-thickness of 2.
- **Ink:** while the ball rolls, a trail point is recorded every 8 units. When the ball stops, the trail becomes solid segments. Any segment within (R + 5) of where the ball stopped is left out so the ball is never stuck inside its own ink. This leaves a small gap at every resting spot, too narrow for the ball to pass through.
- **Cup:** the ball drops if it is over the cup moving slower than 380 units/s, or if it stops on it. A faster ball gets pulled toward the centre ("lip") but can roll past.
- **Water:** rolling into water costs +1 stroke penalty. The ball goes back to where the shot started and that shot's wet trail is thrown away.
- 9 hand-made holes, par 31 in total. Later holes add zig-zag walls, water, peg fields, a side-opening pocket and a spiral, so the ink matters more.

## Win / lose / scoring

- Sink the ball on each hole. Your score is strokes, including water and wash penalties.
- **Pick-up cap:** once you reach par + 4 strokes without sinking, the hole ends and scores par + 4. This means a hole can never get stuck.
- After 9 holes the end screen shows total strokes and the result against par. The best (lowest) total is saved in `localStorage` (`inkputt_best`).

## Notes for visual polish

- DOM: `#hud` holds `#washBtn` and the info lines `#hudHole` and `#hudStrokes`. `#wrap > canvas#cv` is the course. The overlays are `#startScreen`, `#holeScreen` (`#holeTitle`, `#holeText`, `#nextBtn`) and `#endScreen` (`#endText`, `#bestText`, `#againBtn`). They toggle with the `.hidden` class.
- Placeholder colours drawn in `draw()`: margin `#2e6b2e`, green `#4caf50`, walls `#5b3a1e`, water `#2f7fd8`, cup `#111`, hardened ink `#111` (4 px round caps), wet trail `rgba(0,0,0,0.4)`, ball `#fff`, tee marker in translucent white. The aim line is dashed and shifts from yellow to red with power, and the power % appears top-left of the canvas.
- Feedback that has no visuals yet: wet-to-hardened ink transition, sinking (the ball currently just shrinks into the cup over 0.5 s), water splash (centred text for 1.2 s), lip-outs, and wall bounces.
- Keep ink colour clearly different from wall colour while still reading as "solid". Players need to see at a glance that ink blocks the ball.
- Keep the bottom-right corner free of essential UI (rating widget). The cup on hole 4 and the tee on hole 9 are on the right side but nothing there needs a tap.

## Visual Design

**Direction: "sumi ink on paper."** The page is warm paper and the course looks like a flat felt green set into it. Walls are terracotta clay. The player's trails are deep indigo-black ink, the darkest thing on screen, so they stand apart from the warm walls but still read as solid barriers. The look is flat 2D with soft offset shadows and no textures or images.

**Palette (fewer than 15 colours, each with a set role)**

| Role | Hex |
|---|---|
| Paper (page, cards, margin) | `#efe7d6`, `#e4d9c2`, edge `#cdbf9f` |
| Ink (hardened trails, text, primary buttons) | `#1c1f3a` (wet trail: same colour at 38% alpha) |
| Green felt + mow stripes + rim | `#86b46f`, `#7eab67`, `#5f8a4c` |
| Clay walls (body / top face / shadow) | `#c9653e`, `#de7f56`, `rgba(70,40,20,.28)` |
| Water (deep / surface / ripple) | `#468a9e`, `#5ea3b5`, white at 55% |
| Accent: aim/power (low then high power) | mustard `#e8b04a`, then vermilion `#d9483b` above 75% |
| Flag pennant / "Twist" and "New best" text | `#d9483b`, clay `#c9653e` |
| Ball | `#fbfaf5` with a `#d9d4c4` shade crescent and a drop shadow |

**Type:** system fonts only, with no font downloads. Headings, the hole/par line and the splash toast use Georgia ("Iowan Old Style", Times fallback). Body, HUD stats and buttons use `system-ui`. Numbers use tabular figures.

**Layout/UI:** the HUD has an outlined pill "Wash ink" button that fills with ink on press, plus a right-aligned serif hole line. The canvas has rounded corners and a soft paper shadow. Overlays are cream cards on an indigo scrim, with a slightly tilted ink-stroke underline under the title and a pill button with a press-down shadow. The bottom-right corner is still free of UI.

**Cosmetic juice (no logic changes).** All of this lives in `fxBefore()` / `fxAfter()`, which wrap the unchanged `physics()` call and only observe state:
- Ink hardening: new segments flash with a white glow that fades over 0.45 s, plus a low "thunk". Hardened ink has a drop shadow and a faint highlight line. The drawn width equals the collision width (`INK_PAD*2`), so what you see is what blocks the ball.
- Wall/ink bounces: ink-coloured particle puff, a click whose volume scales with impact, and a tiny screen shake.
- Putt: a soft tick plus a small white puff. The ball resting with no cup also gets a quiet tone.
- Sinking: a mustard ripple ring around the cup and a two-note chime. The flag hides while the ball drops.
- Water: white ripple rings and spray at the entry point, a filtered-noise splash sound, 5 px shake, and the "Splash! +1 stroke" text shown as a pop-in ink pill.
- Ambient effects: water ripples drift slowly, the flag waves gently, and a pulse ring around the resting ball shows it's ready to putt.
- Aim: the dashed line became a tapering row of dots in mustard, turning vermilion above 75% power. The top-left "%" became a small ink pill with a power bar.
- Audio is tiny WebAudio oscillators and noise. It is unlocked on the first pointerdown, and the game still works if WebAudio isn't available.

**Inspiration**
- [Pixune: Key Elements of Minimalist Game Art](https://pixune.com/blog/minimalist-game-art-guide/): keep the palette under ~15 colours with a role for each, and use one bright contrasting accent for key elements (here the aim/flag accent).
- [Minimalist top-down mini golf on itch.io](https://kwan765.itch.io/mini-golf) and [Mini Mini Golf Golf](https://www.pocketgamer.com/mini-mini-golf-golf/launch/): flat, fuss-free top-down courses built from simple shapes and drag-to-putt clarity.
- The game's own ink theme (sumi-e brush ink on washi paper) gave the paper/indigo base colours.

**Doc note (resolved by balancer):** the par mismatch is fixed, see Difficulty Tuning. Code pars now sum to 31.

## Difficulty Tuning

**Par reconciliation.** The doc said par 31 but the code summed to 29. The code now matches the doc (31). Old pars 2,3,3,3,3,4,3,4,4 (29) became 3,3,3,3,3,4,4,4,4 (31). Reasons: hole 1's wall sits directly between tee and cup, so a par of 2 needed a bank shot and punished new players; hole 7's peg field blocks the straight line up the centre (x=180 has pegs at y=140 and y=320), so par 3 was unrealistic. The pick-up cap is still par + 4, so hole 1 now caps at 7 (was 6) and hole 7 at 8 (was 7).

**Curve.** Course layouts are the main difficulty ramp (open hole, bank walls, water, pegs, spiral) and were left untouched. The one continuous knob added is cup forgiveness: the maximum speed at which the ball drops, `sinkSpeed()`, falls linearly per hole from 520 units/s on hole 1 to 380 on hole 9 (old: a flat 380). A fast first-hole putt that crosses the cup still drops, while by the spiral the player must control putt power as originally designed.

| Hole | Par | Sink speed (units/s) |
|---|---|---|
| 1 | 3 | 520 |
| 2 | 3 | 502 |
| 3 | 3 | 485 |
| 4 | 3 | 467 |
| 5 | 3 | 450 |
| 6 | 4 | 432 |
| 7 | 4 | 415 |
| 8 | 4 | 397 |
| 9 | 4 | 380 |

Because a session is 9 holes (about 4-8 minutes), the ceiling is reached at the last hole rather than on a clock. Friction, restitution, max launch speed, ink geometry and the pick-up cap are unchanged.

**Old vs new:** SINK_SPEED 380 flat to 520 down to 380 (new `SINK_SPEED_EASY`); par total 29 to 31 (holes 1 and 7 each +1).

## Assets

Thumbnails live in `thumbnails/`:

| File               | Dimensions   | Intended web use                                                                 |
|---------------------|--------------|-----------------------------------------------------------------------------------|
| `thumb-small.png`  | 320 × 180 px | Compact rows in a games list / index page, sidebar links                          |
| `thumb-medium.png` | 640 × 360 px | Grid/card layout tiles on a games gallery page (the default "cover image")        |
| `thumb-large.png`  | 1280 × 720 px| Hero banner on the game's own page; also works directly as an Open Graph / Twitter Card social-preview image |

These are original illustrations inspired by the game's concept and palette, not screenshots of gameplay.

## Pipeline Token Usage

| Stage | Model | Tokens |
|---|---|---|
| game-creator | opus | 35792 |
| game-polisher | opus | 53695 |
| game-balancer | sonnet | 20507 |
| game-qa | sonnet | 54334 |
| game-thumbnailer | sonnet | 18748 |
| game-describer | sonnet | 15223 |
| **Total (subagent stages)** | | **198299** |

*Producer's own orchestration tokens aren't included above — they aren't observable from within its own execution, only each subagent call's reported usage is.*
