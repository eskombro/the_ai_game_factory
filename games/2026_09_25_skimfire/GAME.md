# Skimfire

**One-line pitch:** A bullet-hell where enemy shots that *barely* miss you become your shield — and the only way to shoot is to let go of the controls.

## The original twist

Two twists stacked on top of a very simple dodge-em-up:

1. **You have no weapon.** Your only ammo is the enemy's own fire. Bullets that pass through your skim ring (close, but not touching your hull) get converted into orbs. Every 3 skims = 1 orb. So the only way to arm yourself is to fly *dangerously close* to death, deliberately.
2. **Your shield *is* your ammo, and firing means letting go.** Each orb absorbs one hit that would otherwise kill you. Firing is bound to *lifting your finger* — the same finger that steers you. So pulling the trigger means (a) spending all your defence and (b) freezing in place, mid-bullet-storm, until you put your finger back down. Offence and mobility and defence are all the same resource.

That "release the stick to shoot" binding makes the whole game one continuous gesture: press = live and gather, release = commit and fire.

## How to play / controls (touch-first, mouse-equivalent)

All input goes through unified **pointer events** (`pointerdown` / `pointermove` / `pointerup` / `pointercancel`) on the canvas, so touch and mouse behave identically.

- **Hold and drag anywhere** on the play area to fly. If you grab near the ship, it keeps your relative offset (no jump); if you grab far away, the ship parks ~64px *above* your finger so your thumb never covers it.
- **Let a bullet skim you** (inside the ring, outside the hull) to charge. 3 skims → 1 orb (max 5).
- **Lift your finger** to launch every orb at the nearest enemy. While no finger is down, **the ship does not move** — a white outline ring marks that frozen state.
- **Start screen:** `START` button, centered. **Game over:** `PLAY AGAIN` button, centered. Both are large (min 200x64) and never in the bottom-right corner.

Nothing is bound to the keyboard, hover, or right-click. There is no required tap target in the bottom-right corner (HUD lives top-left; both overlay buttons are centered with 90px of bottom padding), so `play.html`'s floating rating widget can't block anything essential.

## Core mechanics

- **Ship:** hull radius 8 (lethal), skim ring radius 34. Moves by exponential easing toward the finger target (rate 14/s), clamped to the viewport.
- **Skims:** a bullet is flagged `skimmed` once (it turns grey and can't be re-skimmed, but can still kill you). +2 score each, +1 charge. `SKIMS_PER_ORB = 3`, `ORB_MAX = 5`; skims that overflow the orb cap award +5 score instead.
- **Orbs:** spin around the ship at radius 30. Each absorbs one lethal hit (consumed, 0.55s i-frames, plus a 70px shockwave that clears nearby bullets so a block isn't instantly punished). Player starts each run with **2 orbs** as a training buffer.
- **Firing:** on `pointerup`, every orb becomes a projectile (speed 430) aimed at the nearest enemy with a slight fan spread; straight up if no enemy exists. Firing empties the shield.
- **Enemies:** spawn off the top, descend to a hover band in the top ~34% of the screen, then strafe and bounce off the side margins.
  - `spit` — fires aimed bullets at the player (2-shot spread from wave 4).
  - `ring` — fires a radial burst of 7–11 bullets; more likely to spawn at higher waves.
  - HP `2` / `3` base plus `floor((wave-1)/3)`; a small HP bar sits under each. After ~20s alive an enemy flees upward (no points).
- **Scoring:** skim +2, orb overflow +5, kill `40 + wave*5`.

## Win / lose conditions

- **Lose:** a bullet touches your hull while you have **zero orbs**. There are no lives — orbs are the lives, and you spend them every time you shoot.
- **Win:** none — it's an endless score chase. Run stats shown on death: score, wave reached, total skims, total kills.
- **Restart:** `PLAY AGAIN` fully resets state (score, wave, timers, all entity arrays, pointer id, starting orbs).

## Difficulty escalation

A wave counter ticks every `WAVE_TIME = 18s` and drives everything (left deliberately as single constants for the balancer; tuned in the Difficulty Tuning section below):

- bullet speed `min(165, 95 + wave*9)`; enemy fire cooldowns shrink with wave (floored at 0.5s)
- spawn interval `max(0.9, 3.2 - wave*0.25)`; concurrent enemy cap `min(6, floor(1 + wave*0.7))`
- ring-burst bullet count `6 + min(4, floor(wave/2))`; ring-enemy spawn chance `min(0.5, 0.08 + wave*0.07)`
- `spit` enemies go to a 2-shot spread from wave 6 (was wave 4)
- enemy HP grows every 3 waves up to a cap of `+5`, so volleys must land more often as the screen gets busier, without turning into an unkillable sponge on very long runs

`START_GRACE = 1.8s` before the first spawn.

## Verification done

Headless Node simulation (stubbed canvas/DOM, real game code) covering ~2.5 minutes of simulated play with scripted pointer gestures: no runtime errors; confirmed fire→kill path, orb block + shockwave, zero-orb death, game-over overlay, restart, and that the canvas accepts a fresh drag after restart. Two bugs found and fixed during review: (1) array index could dangle after the block shockwave spliced the bullet list mid-iteration, (2) timed-out enemies oscillated forever instead of leaving (now a `leaving` flag).

## Notes for visual polish

- **Everything gameplay-related is one full-screen `<canvas id="cvs">`**; the two overlays (`#startScreen`, `#overScreen`, sharing `.screen`) are plain DOM divs toggled with a `.hidden` class. Buttons are `#startBtn` / `#againBtn` (`.btn`). `#finalScore` / `#finalStats` hold the run summary text.
- **Placeholder palette:** background `#0c0d12`, ship + player shots + accents `#7fe3c0`, orbs `#9fe8ff`, live enemy bullets `#ffd76a`, already-skimmed bullets `#5d6274`, `spit` enemy `#e0644f`, `ring` enemy `#c06adf`, HP bar `#8be0a0`.
- **Readability is load-bearing here:** the skim ring, the hull, and the "already skimmed / still lethal" bullet distinction are the three things a player reads every frame. Don't make skimmed bullets so dim they look harmless, and keep the hull visually much smaller than the ring (the gap between them *is* the game).
- Canvas draw hooks worth dressing up: the charge arc (yellow arc sweeping the skim ring as it fills), the frozen-state outline ring drawn when no finger is down, the orb ring, the block shockwave (currently just a particle `burst` + screen shake), and `G.fireFlash` (already tracked, currently unused — free hook for a muzzle/release flash).
- HUD is drawn in canvas at the top-left: score, `WAVE n`, five orb pips, and a "lift finger to fire" hint. **Keep the bottom-right corner free** of anything essential (site rating widget). Screen shake is `G.shake` applied as a canvas translate.
- No images, audio, or external assets; everything is inline in the single `index.html`.

## Visual Design

**Direction:** "cold vacuum, hot bullets" — a near-black deep-space field where the only saturated colour is *information*. Palette discipline follows the Downwell-style rule of a tiny, role-assigned palette: background recessive, player mint, danger amber, threat coral/violet, everything else greyscale. Nothing decorative is allowed to be as bright as something that can kill you.

### Palette (CSS custom properties + a mirrored `C` table in the canvas code)

| Role | Colour |
| --- | --- |
| Background ink | `#06070d` (with a cool `rgba(58,92,140,0.30)` nebula glow toward the top and a radial vignette) |
| Player hull / shots / skim ring | `#5ff2c0` mint (shot cores `#e8fff6`) |
| Orbs / shield pips | `#a9ecff` ice, white specular highlight |
| **Live** enemy bullets | `#ffc94a` amber, `#fff3cf` hot core, 22%-alpha halo |
| **Skimmed** (spent but still lethal) bullets | `#39405a` body with a solid `#7d87a6` rim — deliberately cold, never faint: it keeps its full silhouette so it still reads as a solid object |
| `spit` enemy | `#ff6a55` coral disc with a dark downward muzzle notch |
| `ring` enemy | `#b467f0` violet drawn as an open annulus (shape telegraphs the radial burst) |
| Text / muted | `#e9ecf6` / `#838ba4`; game-over title coral |

### Typography

System stacks only, zero network fonts. `system-ui` for titles/UI with wide tracking (`0.18em` on `SKIMFIRE`, gradient white→mint fill), and `ui-monospace / SF Mono / Menlo / Consolas` for all numerals (in-canvas score, final score, run stats) so digits don't jitter as they change.

### Motion / juice (all presentation-only)

- Canvas starfield built once per resize into an offscreen canvas, drawn as **two parallax layers** drifting downward off a cosmetic-only `bgT` clock (never feeds gameplay).
- Skim ring = soft 6px mint halo ring + a **rotating dashed overlay** that brightens when a finger is down; the frozen-state ring is a slower, pulsing dashed ring at `GRAZE_R + 9`.
- `G.fireFlash` is now used: a mint shockwave ring blooms out of the skim ring on release.
- Charge arc is a round-capped amber sweep on the ring; engine wash flickers under the hull while steering; particles are additive (`lighter`) fading sparks; particle colours re-keyed to the palette (ice on a block, mint on a hit, amber on a kill, coral on death).
- Top scrim gradient behind the HUD, glowing orb pips (filled = ice with halo, empty = thin outline), pulsing `LIFT FINGER TO FIRE` hint. Bottom-right stays empty.
- Overlays: fade/rise entry animations, a rotating dashed "skim ring" logo mark built from CSS only, pill button with a slow breathing glow and a `:active` press scale.

### Constraints honoured

Zero gameplay/logic/constant changes — only drawing code, CSS and overlay markup. Still one self-contained offline HTML file: no images, no audio, no external fonts or libraries. Verified headlessly in Chromium at 390x780 and 320x568 (start → play → fire → frozen → death → restart), no console errors.

### Inspiration

- [Less is Lethal: How Limiting Your Color Palette Elevates Your Indie Game — Wayline](https://www.wayline.io/blog/limiting-color-palette-indie-game) (role-assigned, deliberately small palettes; the *Downwell* readability example)
- [Neon Barrage — visually minimal, audio-synced bullet hell (itch.io Bullet Hell Jam)](https://itch.io/jam/bullet-jam-2021/rate/998658) (simple-shape neon bullet-hell language on near-black)
- [itch.io: games tagged Bullet Hell + Minimalist](https://itch.io/games/tag-bullet_hell/tag-minimalist) (general genre survey)

## Difficulty Tuning

**Diagnosis before tuning:** the wave-driven knobs were already sane in shape, but two of them (`bullet speed`, `enemy HP`) had **no ceiling** and grew forever, so a long run would eventually produce bullets faster than the 26px hull-to-ring gap could realistically be read, and enemies tankier than the 5-orb salvo could ever clear — contrary to "hard but fair" and to the "few-minute session" framing. The very first wave was also slightly busier than ideal for a first-time player: up to 2 concurrent enemies and a 21% chance the very first enemy encountered is the 7-11-bullet `ring` type, with no calm beat to learn dragging before the first shot.

**Approach:** keep the existing wave-timer architecture (`WAVE_TIME = 18s` unchanged) and reshape the per-wave formulas so every knob is a smooth function of `wave` that (a) starts at a gentle floor, (b) rises continuously (no thresholds jumping by more than one small step), and (c) is explicitly capped so all the fast-moving knobs converge on a "hard but fair" ceiling around wave 8-9 (~135-150s, i.e. the middle of the 1-3 minute target window), after which only enemy HP keeps inching up (itself now capped) to keep long runs interesting without becoming unfair.

### Key constants: old vs new

| Knob | Old | New | Why |
| --- | --- | --- | --- |
| Start grace | `1.4s` | `1.8s` | A slightly longer calm beat before the first enemy so a brand-new player can test dragging before any threat appears. |
| Bullet speed | `95 + wave*9` (**uncapped**) | `min(165, 95 + wave*9)` | Same gentle wave-1 speed (104px/s), but now plateaus at wave ~8 instead of growing forever — keeps the skim ring readable/reactable on long runs. |
| Concurrent enemy cap | `min(6, 2 + floor(wave/2))` (starts at **2**) | `min(6, floor(1 + wave*0.7))` (starts at **1**) | Wave 1 is now a genuine 1-on-1 tutorial encounter instead of two shooters at once; still reaches the same cap of 6 by wave 8. |
| Spawn interval | `max(0.9, 3.0 - wave*0.22)` | `max(0.9, 3.2 - wave*0.25)` | Slightly longer breathing room wave-1 (2.95s vs 2.78s); reaches the same 0.9s floor a touch sooner (~wave 10) to match the new enemy-cap ramp. |
| Ring-enemy spawn chance | `min(0.5, 0.15 + wave*0.06)` (wave-1 = **21%**) | `min(0.5, 0.08 + wave*0.07)` (wave-1 = **15%**) | Lower odds that a new player's very first enemy is the harder radial-burst type; converges to the same 50% cap by wave 6. |
| Ring burst bullet count | `7 + min(4, floor(wave/2))` (caps at **11**) | `6 + min(4, floor(wave/2))` (caps at **10**) | One bullet fewer at every step — a small, consistent softening rather than a bigger overall difficulty change. |
| `spit` 2-shot threshold | wave **4** | wave **6** | Delays the first aimed double-shot until the ramp is further along, so the ~60s mark isn't already near peak bullet density. |
| Enemy fire-cooldown reduction | spit `-min(1.0, wave*0.09)`, ring `-min(1.2, wave*0.1)` | spit `-min(1.0, wave*0.11)`, ring `-min(1.2, wave*0.13)` | Reaches the same 0.5s cooldown floor by wave ~9 instead of wave ~12, so fire-rate finishes ramping in step with speed/spawn/enemy-cap instead of trailing behind them. |
| Enemy HP ramp | `+floor((wave-1)/3)` (**uncapped**) | `+min(5, floor((wave-1)/3))` | Same growth curve through the main ramp; now plateaus (cap reached ~wave 16) so a very long run never turns a single enemy into an unkillable sponge. |

### Resulting curve (simulated by re-running the exact in-file formulas)

| t | wave | bullet speed | max enemies | spawn interval | ring chance | spit shots | HP (spit/ring) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 0-15s | 1 | 104 | **1** | 2.95s | 15% | 1 | 2 / 3 |
| 30s | 2 | 113 | 2 | 2.70s | 22% | 1 | 2 / 3 |
| 60s | 4 | 131 | 3 | 2.20s | 36% | 1 | 3 / 4 |
| 90s | 6 | 149 | 5 | 1.70s | 50% (cap) | 2 | 3 / 4 |
| 120s | 7 | 158 | 5 | 1.45s | 50% | 2 | 4 / 5 |
| 135s | 8 | **165 (cap)** | **6 (cap)** | 1.20s | 50% | 2 | 4 / 5 |
| 150s+ | 9+ | 165 | 6 | 0.90s (floor) | 50% | 2 | 4→7, capped at +5 |
| 180s+ | 11+ | 165 | 6 | 0.90s | 50% | 2 | plateaus by ~wave 16 |

**Reading the curve:** the opening 15-18 seconds are a genuine one-enemy tutorial with slow bullets and a low chance of meeting the harder `ring` type — enough time to learn drag-to-fly and the skim-to-charge loop under no real pressure. From there every knob rises continuously (no jumps bigger than one small step per 18s wave), converging on a "hard but fair" ceiling by roughly the 2-2.5 minute mark (wave 8-9), which sits inside the requested 1-3 minute window. Past that point, bullet speed, spawn rate, enemy count, ring odds, burst size and fire-rate are all fully plateaued; only enemy HP keeps a slow, now-capped climb so skilled players chasing a long run still feel gradual extra resistance without it ever becoming unfair or unkillable.

### Verification

Re-derived every formula's output at t = 0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 240, 300, 420s by executing the exact expressions now in `index.html` in a standalone Node script (not hand math) — confirmed monotonic, continuous growth with no negative values, no division by zero, and all six ramping knobs (speed, spawn interval, enemy cap, ring chance, ring burst, cooldowns) hit their caps within wave 6-10 while HP's cap holds by wave 16. Also reloaded the full `index.html` script in a stubbed headless DOM/canvas context to confirm it still parses and executes with no runtime errors after the edits. No mechanics, controls, rendering, or win/lose logic were touched — only the named tuning constants and the formulas that read them.

## Edit Log

- **2026-09-25:** Fixed a QA-reported HUD-overlap bug: enemies could hover directly over the top-left score/wave/hint text. `spawnEnemy()`'s hover-y minimum moved from `70` to `95`, and enemies whose hover `tY` lands below `120` now get their spawn `x` restricted to `rand(160, W-45)` instead of `rand(45, W-45)`, keeping them clear of the top-left HUD text region. Positioning-only change; no other mechanics, visuals, or difficulty constants touched.
- **2026-09-25 (re-verify):** A follow-up QA pass confirmed the spawn-time fix works (enemies no longer *spawn* inside the HUD keep-out) but found the fix incomplete: the per-frame horizontal strafe bounds in the enemy update loop aren't clamped by `tY`, so an enemy already hovering in the top band can still strafe back into the HUD text column after spawning (observed 6 times across a 130s/6-wave sample). This is a cosmetic readability issue only — no crashes, no effect on scoring/collision/win-lose logic, core mechanics fully re-verified with no regressions. Left unresolved per the pipeline's one-fix-pass policy; flagged here for a future targeted `game-editor` pass (clamp strafe x to `[160, W-30-r]` whenever `tY < 120`, not just the initial spawn).

## Assets

| File | Dimensions | Intended web use |
| --- | --- | --- |
| `thumbnails/thumb-small.png` | 320 x 180 px | Compact rows in a games list / index page, sidebar links |
| `thumbnails/thumb-medium.png` | 640 x 360 px | Grid/card layout tiles on a games gallery page (the default "cover image") |
| `thumbnails/thumb-large.png` | 1280 x 720 px | Hero banner on the game's own page; also works directly as an Open Graph / Twitter Card social-preview image |

These are original poster-style illustrations composed from the game's own palette and motifs (mint skim ring/hull, ice orbs, amber live bullets, slate skimmed bullets, coral `spit` and violet `ring` enemies) — not screenshots of actual gameplay.

## Pipeline Token Usage

| Stage | Model | Tokens |
|---|---|---|
| game-creator | opus | 43,915 |
| game-polisher | opus | 69,834 |
| game-balancer | sonnet | 66,836 |
| game-qa | sonnet | 104,650 |
| game-editor | sonnet | 52,976 |
| game-qa (re-verify) | sonnet | 148,368 |
| game-thumbnailer | sonnet | 37,398 |
| game-describer | sonnet | 24,610 |
| **Total (subagent stages)** | | **548,587** |

*Producer's own orchestration tokens aren't included above — they aren't observable from within its own execution, only each subagent call's reported usage is.*
