# Cheek Ascent

## One-line pitch
Swipe your squirrel from branch to branch up an endless swaying tree — but the more acorns you stuff in your cheeks, the shorter your leaps get, so you must risk a landing on a rare hollow branch to bank them before you fall.

## The original twist
Most "climb an endless tower" games (Doodle Jump and its many clones) only care about not falling. Cheek Ascent adds a **carrying-capacity risk/reward loop**: every acorn you collect physically weakens your next leap (your swipe power is reduced proportionally to how full your cheeks are), so greedily hoarding acorns makes the game harder to survive. Acorns only turn into permanent score once you land on a "hollow" branch (a tree-knot that auto-banks your cheeks) — so the player is constantly deciding whether to keep pushing for more acorns (higher potential score, but weaker jumps and higher fall risk) or divert toward the next hollow to cash in safely.

## How to play / controls
100% touch-only, built on the Pointer Events API (works with a single finger; also happens to work with a mouse for desktop testing, but nothing requires a keyboard or hover):

- **Swipe (drag-and-release) anywhere on screen** while the squirrel is standing on a branch: the direction and length of the swipe becomes the launch direction and power. Swipe up-and-toward-the-next-branch to leap there.
  - Swipes shorter than a small threshold are ignored (so repositioning your finger doesn't accidentally launch you).
  - Swipe length is clamped between a minimum and maximum drag distance, which maps to minimum/maximum launch speed.
- **Tap the "Tap to Start" / "Tap to Restart" buttons** (large on-screen buttons) to begin or restart a run.
- Only one finger/pointer is tracked at a time; extra simultaneous touches are ignored. Input is ignored entirely while the squirrel is mid-air (you must wait to land before your next swipe registers), so there is no way to queue up conflicting gestures.

## Core mechanics
- **Endless procedurally-generated branches** zig-zag up either side of a central trunk. Branches gently sway side to side (more so at greater height), so timing/aim matters more as you climb.
- **Cheek weight**: each acorn collected on a landed branch adds to your cheek count (capped at 6). Your next launch's power is reduced by a percentage per acorn carried (capped so a jump is never literally impossible).
- **Hollow branches**: a special ring-shaped branch appears every few branches. Landing on one instantly banks all currently-carried acorns into your permanent score and empties your cheeks.
- **Camera**: scrolls upward only, keeping the squirrel roughly in the upper-middle of the screen as you climb higher; it never scrolls back down.
- **Scoring**: `score = (acorns successfully stashed × 10) + floor(max height reached / 10)`. Height score is banked permanently as soon as it's reached (you can't lose height-based score by falling), but un-stashed acorns in your cheeks are lost if you die.
- **Difficulty escalation**: as height increases (up to a soft cap), branch gaps widen, branches get narrower, horizontal offsets grow, and branch sway amplitude/frequency increase — all interpolated smoothly from an easy start. (These constants are intentionally simple placeholders for the balancing pass.)

## Win / lose / restart
- There is no "win" state — this is an endless arcade high-score chaser, matching the genre.
- **Lose condition**: the squirrel is airborne (not landed on a branch) and falls far enough below the bottom of the visible screen. Since the camera never scrolls down, any missed jump that sends the squirrel below the current view is unrecoverable and ends the run.
- On game over, the run's score is compared against a `localStorage`-persisted best score (per the project's "persist a high score" pattern) and updated if beaten. A "Tap to Restart" button fully resets state (branches, camera, cheeks, score) and returns to `playing`.

## Notes for visual polish
- All current colors are flat placeholders with no theming: sky `#cfe8d8`, trunk `#8a6a4a`, branch `#6f4e2a`, hollow ring `#3a2a1a`/`#1b1f18`, acorn `#d98e2b`, squirrel body `#a05a2c`. None of this reflects a real palette — please restyle freely.
- The squirrel is drawn as a plain circle + ellipse tail + one eye dot in `render()`; there's no animation (no run cycle, no launch squish/stretch, no landing bounce). This is the best place to add "juice" — e.g. a stretch-along-velocity effect while airborne, a squash on landing, a cheek-bulge visual that scales more dramatically with `cheekCount` (currently just a subtle radius increase), and particle/sparkle feedback when stashing at a hollow branch.
- Branches are plain rectangles; hollow branches are a plain ring. Acorns are plain circles. All are good candidates for icon-style redraws or small sprite work.
- HUD (`#scoreText`, `#heightText`, `#bestText`, `#cheeksText`) is unstyled text with a text-shadow hack for legibility over the canvas — a real HUD treatment (icons for cheeks/acorns, a proper score panel) would help a lot.
- The start and game-over overlays (`#startOverlay`, `#gameOverOverlay`) are generic dark-scrim boxes with a plain amber button (`.bigButton`) — figure/ground, typography, and button styling are all open for a full pass.
- Camera/physics/scoring logic lives entirely in JS and is untouched by styling; polish should only need to touch CSS and the `render()` drawing calls, not `update()`/`checkLanding()`/`launch()`.

## Visual Design

**Direction:** a warm, minimalist "woodland altitude" look — a soft gradient sky that shifts from a mint-and-peach dawn near the ground to a cooler dusk indigo/mauve higher up (borrowing the day-to-night altitude cue from games like *Alto's Adventure*), with three layers of translucent, procedurally-tiled canopy "blobs" drifting behind the trunk at different parallax speeds to suggest an endless forest canopy without any image assets. Palette leans on muted earth tones (umber trunk, olive-brown branches, warm amber acorns/hollow glow) against the airy sky so the squirrel and collectibles read clearly at a glance.

- **Palette:** sky `#cdeee0`→`#ffe9c4` (low) fading to `#2c3a58`→`#7c6a8a` (high, interpolated by camera height); canopy `#8fbf9a`→`#4a5a78`; trunk `#4f331f`/`#8a6238`; branches `#5c3f22`/`#8a6238`; hollow branch ring `#c9832f` with a pulsing amber glow; acorns `#c97f2e`/`#f4c877`; squirrel body `#a85a2c`/`#d68a52` with cream `#f3e0c4` belly/cheeks; UI accent amber `#e2a13a`/`#b97a1f` on a warm cream glass panel `rgba(255,247,232,0.72)`.
- **Typography:** no web fonts loaded — system font stack (`-apple-system, BlinkMacSystemFont, "SF Pro Rounded", "Segoe UI", "Nunito", system-ui, sans-serif`) for a friendly, rounded, zero-latency look; small-caps-style uppercase labels with letterspacing for HUD stat names, bold tabular numerals for values.
- **HUD:** replaced raw text lines with frosted "glass" pill panels (semi-transparent, blurred, subtle shadow) top-left (score/height) and top-right (best score + a 6-dot cheek-fullness meter that fills with a glowing amber dot per acorn carried, replacing the old "Cheeks: n/6" text).
- **Overlays:** start/game-over screens now sit in a rounded frosted card with a pop-in scale/fade entrance animation (disabled under `prefers-reduced-motion`) instead of a flat dark scrim box; the button got a pill shape, amber gradient, and a "pressed" depth animation on tap.
- **Juice (cosmetic-only, layered on top of unchanged game logic):** the squirrel now stretches along its velocity while airborne and does a spring-back squash on landing (strength scaled to impact speed); cheeks visibly bulge more as `cheekCount` rises; a light screen-shake accompanies hard landings; small gold sparkle particles burst on acorn pickup and a larger sparkle/ring burst plays when banking acorns at a hollow branch; branches sway-rotate slightly in sync with their existing physics sway; the hollow branch pulses with an amber glow. A few short WebAudio oscillator "blips" (no audio files) accompany landing, acorn pickup, stashing, and game-over for light feedback; audio is only unlocked on the first Start/Restart tap gesture.
- **Inspiration sources:** general 2026 minimalist mobile-game palette/parallax research — see [Canva: Forest Canopy Sky palette](https://www.canva.com/colors/color-palettes/forest-canopy-sky/), [Envato: Mobile App Color Scheme Trends for 2026](https://elements.envato.com/learn/color-scheme-trends-in-mobile-app-design), and general parallax-background layering technique notes from itch.io-style asset packs (e.g. [Bongseng's Parallax Forest/Desert/Sky/Moon pack](https://bongseng.itch.io/parallax-forest-desert-sky-moon)) as a reference for how far/near canopy layers are typically composed, adapted here as flat CSS-canvas shapes rather than sprite art.

All of the above is presentation-only: `update()`, `checkLanding()`, `launch()`, `resetGame()`'s scoring/physics fields, and all tuning constants in `CONFIG` are byte-for-byte unchanged from the pre-polish version. New cosmetic state (particle list, squash/shake timers) is read-only with respect to gameplay — it observes `squirrel`/`cheekCount`/`stashScore` each frame to trigger effects but never writes back into them.

### Refinement pass (follow-up, second visual polish pass)

This pass sharpened the art and deepened the "woodland altitude" atmosphere without touching `update()`, `checkLanding()`, `launch()`, `resetGame()`'s gameplay fields, or any `CONFIG` tuning constant — every addition below is either a new `render()`-only draw call or new cosmetic-only state (particles, floating text, drag-preview mirror, facing direction) that reads gameplay state but never writes back into it.

- **Sky & atmosphere:** deepened the dusk end of the sky gradient (`SKY_HIGH.top` `#2c3a58` → `#22304c`, a richer navy) and the canopy/hill high-altitude tones (`CANOPY_HIGH` `#4a5a78` → `#414f70`) for more contrast against the warm low-altitude palette. Added a soft sun glow near the ground that fades out as altitude increases, and ~26 deterministic twinkling stars that fade in above roughly the halfway point of the climb — reinforcing the "climbing from dawn into dusk" read (inspired by the day-to-night altitude framing used in *Alto's Adventure*'s minimalist mountain silhouettes, per [Harry Nesbitt's making-of writeup](http://www.harrynesbitt.com/blog/the-making-of-altos-adventure/)).
- **Parallax depth:** added a fourth, furthest-back layer — a slow-moving wavy ridge/hill silhouette (`HILL_LOW` `#a9d1ae` → `HILL_HIGH` `#37456a`) drawn as a single filled path — sitting behind the existing three canopy layers for an extra depth cue, again echoing the layered-silhouette technique used in minimalist "endless traverse" games like *Alto's Adventure*.
- **Canopy silhouettes:** each canopy "node" now draws as a small cluster of 2–3 overlapping lobes (still fully procedural/deterministic via the existing hash function) instead of one flat circle, reading as leafier, less blobby foliage at the same performance cost.
- **Trunk:** added sparse, deterministic bark knots (dark ellipse + faint ring) tied to world height so they scroll naturally with the trunk, plus a brighter core-highlight gradient stripe down the center for more roundness.
- **Branches & acorns:** each live branch now sprouts 1–2 small leaf lobes near its tip; acorns got a hatched cap detail and a bright highlight speck, with their body gradient extended to three stops (cream highlight → amber → deep umber) for a rounder, glossier read.
- **Squirrel sprite:** added a facing flip (mirrors horizontally to face its direction of travel), a gentle idle breathing/tail-flick loop while perched (replacing total stillness between jumps), a soft ground-contact shadow when landed, simple front/hind paw shapes, whiskers, and a small eyebrow arc for character. The cheek bulge now uses its own two-stop radial gradient (was a flat fill) so it reads more like packed volume.
- **HUD:** score/height/best numbers now "pop" (quick scale + amber flash) on every increase, giving the counters the same kind of `+N`-adjacent feedback recommended in juice-design writeups (see [itch.io: Making a Game Feel "Juicy" with Simple Effects](https://itch.io/blog/1059831/making-a-game-feel-juicy-with-simple-effects) and the [Game UI Database's Scoring & Combos collection](https://www.gameuidatabase.com/index.php?scrn=136) for reference on counter-pop/flash patterns). Cheek-meter dots were reshaped from plain circles to a subtle acorn-nut silhouette (asymmetric border-radius) and now scale up slightly when filled.
- **New juice:** a floating `+N` score popup now appears at the exact spot where acorns are banked at a hollow branch (spatially-located feedback, same reasoning as the HUD pop sources above); landing now also kicks up a few small dust-colored particles in addition to the existing squash/shake; and, while the player is mid-drag on a landed squirrel, a dotted trajectory preview (re-deriving the same speed/direction/gravity math `launch()` uses, without calling it) plus a short directional arrow now render live so the swipe's aim and power are visible before release — a read-only visualization of an existing mechanic, not a change to it.
- **Inspiration sources (this pass):** [Harry Nesbitt, "The Making of Alto's Adventure"](http://www.harrynesbitt.com/blog/the-making-of-altos-adventure/) for the day-to-night altitude/layered-silhouette framing; [itch.io: Making a Game Feel "Juicy" with Simple Effects](https://itch.io/blog/1059831/making-a-game-feel-juicy-with-simple-effects) and the [Game UI Database Scoring & Combos collection](https://www.gameuidatabase.com/index.php?scrn=136) for HUD-pop/floating-score feedback patterns.

## Difficulty Tuning

**Diagnosis (pre-tuning):** the branch-generation ramp (`gap`, `offset`, `width`, `sway`) is driven entirely by `difficultyT(h) = clamp(h / DIFFICULTY_MAX_H, 0, 1)`, a linear fraction of world-height fed into `lerp()` calls in `spawnNextBranch()`. Working the launch physics backwards (a jump can only land on a branch if its parabolic peak height reaches the branch's height gap: `vh0 >= sqrt(2 * GRAVITY * gap)`, `GRAVITY = 1500`), the *old* constants (`GAP_MIN: 85`, `OFFSET_MIN: 55`, `DIFFICULTY_MAX_H: 4200`) meant a comfortable (15%-margin) jump already required roughly **60–80% of max swipe power on branch 1**, and the ramp reached **100% (max-power precision jumps required on nearly every branch) by about 45 seconds in** — then stayed pinned there for the rest of the run. That's a hard-immediately, then-flat curve: the opposite of "easy start, smooth ramp, brief plateau."

**Changes made (only pacing/ramp constants — `launch()`/`checkLanding()`/`update()` physics formulas, controls, and win/lose logic are untouched):**

| Constant | Old | New | Why |
|---|---|---|---|
| `GAP_MIN` | 85 | 55 | Lowers the vertical reach needed for the *very first* jumps well below max swipe power, so a new player's natural first few swipes succeed without needing to learn "swipe hard" immediately. |
| `OFFSET_MIN` | 55 | 40 | Reduces the horizontal precision/power budget required early, in step with the smaller starting `gap`. |
| `DIFFICULTY_MAX_H` | 4200 | 9500 | Stretches the height range over which difficulty ramps from 0→100%, so the climb to the ceiling takes roughly a real minute-and-a-half to two minutes of typical play instead of under a minute. |
| `difficultyT(h)` formula | raw linear `h / DIFFICULTY_MAX_H` | smoothstep-eased `t*t*(3-2t)` of the same fraction | Replaces the linear ramp with an S-curve: very gentle slope near `t=0` (long easy opening, since a linear ramp already starts climbing from the first branch), fastest through the middle (the section where skill is actually being tested), and eases into a plateau near `t=1` instead of snapping straight to the max-difficulty ceiling. `GAP_MAX`, `OFFSET_MAX`, `BRANCH_MIN_WIDTH`, and `SWAY_MAX_AMP` (the endgame ceiling values) were intentionally left unchanged so the top-end challenge is the same as before — only the shape and pacing of the climb to get there changed. |

**Resulting curve (modeled from the same physics, assuming a ~0.6s average human reaction/aim pause between landings):**

| Elapsed time | Swipe power needed for a comfortable jump | Feel |
|---|---|---|
| 0–20s | ~30–34% of max | Genuinely easy: any confident swipe clears the gap with room to spare — time to learn the controls. |
| ~30–45s | ~38–49% | Noticeably picking up, still forgiving. |
| ~60–75s | ~63–80% | Hard but fair: real aim and swipe strength matter. |
| ~90–105s | ~96–100% | Reaches the "hard but fair" ceiling (near-max-power, precisely-aimed swipes needed) — lands inside the target 1–3 minute window. |
| 105s+ | pinned at ~100% | Plateaus at the ceiling rather than continuing to escalate, so long runs stay consistently (not increasingly) demanding for a skilled player. |

**Left unchanged, deliberately:** `GRAVITY`, `MIN/MAX_DRAG`, `MIN/MAX_LAUNCH_SPEED` (these define swipe-to-launch control feel, not the difficulty ramp, and changing them would alter core mechanics/controls); `WEIGHT_PENALTY_PER_ACORN`/`MAX_WEIGHT_PENALTY` (the cheek-weight risk/reward curve is the game's core twist, not a time/height-based escalation, so it was left as originally designed); `HOLLOW_GAP_MIN/MAX` and `ACORN_CHANCE` (static spawn-frequency knobs for the scoring loop, not tied to survival difficulty, so left at their original values); `GAP_MAX`, `OFFSET_MAX`, `BRANCH_MIN_WIDTH`, `SWAY_MAX_AMP` (endgame ceiling values, kept the same so the game isn't made easier or harder overall — only the climb to that ceiling was smoothed out).

## Assets

Original promotional illustrations (not screenshots) live in `thumbnails/`, regenerated to match the second visual-polish (refinement) pass. Composed in the game's real palette (deepened dusk navy/mauve sky fading to dawn peach/mint near the ground, with a soft ground-level sun glow and twinkling upper-altitude stars, plus a distant ridge/hill parallax silhouette), the poster depicts a detailed squirrel (paw, whisker, eyebrow, and gradient cheek-bulge detail) mid-leap between a bark-knotted trunk's branches, with a warm dotted trajectory arc toward a glowing amber hollow branch, leaf-lobe canopy clusters, leaf-sprig branch tips, hatched-cap gradient acorns, a small acorn-shaped cheek-meter HUD mockup, and a poster-style "Cheek Ascent" logo lockup in the game's system font stack:

| File | Dimensions | Intended use |
|---|---|---|
| `thumbnails/thumb-small.png` | 320 × 180 px | Compact rows in a games list / index page, sidebar links |
| `thumbnails/thumb-medium.png` | 640 × 360 px | Grid/card layout tiles on a games gallery page (the default "cover image") |
| `thumbnails/thumb-large.png` | 1280 × 720 px | Hero banner on the game's own page; also works directly as an Open Graph / Twitter Card social-preview image |

All three are downsampled from one 1280×720 SVG master — original illustrations inspired by the game's current concept, art details, and palette, not screenshots of actual gameplay.
