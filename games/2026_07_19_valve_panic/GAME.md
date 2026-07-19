# Valve Panic

**One-line pitch:** Hold your fingers on overheating steam valves to vent them before they blow — and keep enough fingers in play as more valves come online.

## The original twist

Most reflex games ask you to dodge, tap-react, or repeat a sequence. Valve Panic is built around **sustained multi-touch attention management**: every valve on the panel is a separate hold-target that only cools while a finger physically stays on it. There's no single "best" input — you must actively decide, moment to moment, which valves are safe to leave alone and which need a finger *right now*, and as more valves come online than you have comfortable fingers for, you're forced into genuine multi-touch triage (e.g. thumb + three fingers on one hand, or both hands) rather than a single continuous gesture. This is a fundamentally different feel from lane-dodging or memorize-and-repeat games: the core tension is resource allocation under simultaneous, independent countdowns, not spatial avoidance or recall.

## How to play / controls

- **Press and hold** a lit ("online") valve with a finger to vent it — its pressure drops while held.
- **Lift your finger** and pressure resumes rising on its own.
- Multiple valves can be held **at the same time with different fingers** (true multi-touch — implemented per-element with independent `pointerId` tracking and `setPointerCapture`, so each finger reliably controls only the valve it landed on even if it drifts slightly).
- Tap the **Start Shift** / **Play Again** button (tap = standard `click`, fires on touch) to begin or restart.
- No keyboard or mouse-only interaction exists anywhere in the game; every action is reachable via touch (or a mouse, incidentally, since pointer events unify both, but nothing requires it).

## Core mechanics

- 8 valve slots are laid out in a fixed 2x4 grid. The game starts with 3 valves "online" (actively filling); the rest are dim/offline placeholders.
- Every online valve has a **pressure meter (0-100%)** that rises automatically over time at a per-valve rate (with some per-valve random variance so they don't all move in lockstep).
- Holding a valve makes its pressure fall quickly instead (vent rate > fill rate, so holding always wins locally — the challenge is *coverage*, not per-valve skill).
- If a valve reaches **100%**, it explodes: you lose a life, the valve resets to 0% and enters a brief ~1.2s "broken" grace period (visually flashing, cannot be vented, doesn't fill) before resuming normal operation.
- **Difficulty escalates smoothly** over a fixed 75-second session:
  - New valves come online periodically on an eased schedule (gaps start around ~13s and shrink smoothly, accelerating through the session) until all 8 slots are active around the ~55s mark.
  - The base fill rate scales up over the session on the same kind of eased curve (up to ~2.4x the starting rate by the end), so late-game valves demand much faster reflexes and more simultaneous holds. See the "Difficulty Tuning" section below for the exact formula and timeline.
- **Scoring:** three tiers on release, so both cautious upkeep and risky close calls pay off, in clearly increasing order. Every tier still requires the hold to have actually dropped pressure by at least 4 points (the anti-farming guard) &mdash; lifting your finger off a valve you barely touched earns nothing. Tiers are decided by the *peak* pressure that valve reached during the hold (which, since pressure only ever falls while held, is simply the pressure at the moment you first touched it):
  - **Low vent (+1):** peak stayed in the safe zone (below 50%) and the hold still dropped it by at least 4 points.
  - **Mid vent (+3):** peak reached the warn zone (50-79%) before being vented down.
  - **High save (+5):** peak reached the danger zone (>=80%, a genuine close call) and was vented all the way back down to <=25% by the time you released &mdash; the biggest reward, keeping the riskiest play the most lucrative. (If a valve peaks in the danger zone but isn't vented all the way to <=25% before release, that hold instead scores as a mid vent, since it still reached the warn zone along the way.)
  - A small "+1"/"+3"/"+5" number briefly pops up on the valve tile and floats up before fading whenever a release earns points (color-coded green/amber/red to match the tier) &mdash; purely a visual readout, it has no effect on the score itself.

## Win / lose conditions

- **Win ("Shift Complete"):** survive the full 75-second session with at least 1 life remaining.
- **Lose ("Meltdown"):** run out of lives (start with 3; each valve explosion costs 1) before the session timer ends.
- Either outcome shows a final Score (points, from all three vent tiers) and a **Play Again** button that fully resets state (all valves, lives, score, timers) and restarts the loop.

## Notes for visual polish

- All valve visuals are pure CSS/DOM (no canvas) — each `.valve` div has a `.fill` div (height = pressure %, background color swaps green -> amber -> red via inline style at 50%/80% thresholds) and a `.pct` text readout. This is the main area a visual pass should target: replace the flat color fill with a more "gauge/steam" look, add a needle or bubble/steam particle effect, etc.
- Currently placeholder colors: background `#14161a`/`#20242b`/`#24282f` (near-black panel grays), fill colors `#3a7d44` (safe/green), `#d4a017` (warning/amber), `#c0392b` (danger/red), held-state border `#6fd6ff` (cyan), explosion flash `#7a1f1f`/`#ff4444`.
- The "exploded/broken" grace state currently just flashes the whole tile red via a CSS `@keyframes flash` and shows text "OFF" — a follow-up pass could add a more distinct steam/smoke visual or shake effect.
- `#hud` (time/lives/score) and `#legend` (instructions) are plain text bars — good candidates for iconography (e.g. heart icons for lives, a gauge icon, etc.) without touching any game-logic code.
- Layout is a fixed 2-column x 4-row grid sized to fit a ~375-430px-wide portrait viewport; valve tiles are currently plain rounded rectangles (`border-radius: 10px`) with a solid border that changes color on `.held` — a good target for a more tactile "physical valve/gauge" skin.
- The start/end overlay (`#overlay`) is a simple centered modal — fine to restyle freely, its DOM structure (title/text/score/button) should stay stable for future logic hooks.

## Visual Design

**Direction:** industrial control-room gauge panel. Each valve is now a circular analog dial (conic-gradient progress ring + rotating clock-hand needle + digital center readout) set into a riveted dark panel tile, evoking a boiler-room instrument cluster rather than a flat progress bar. Inspiration drawn from dark-mode dashboard palettes that pair near-black slate surfaces with warm amber/red warning accents (common in "Bloomberg-terminal"-style dense control UIs), and from minimalist game-jam conventions of restricting the palette to a handful of intentional, semantically-consistent colors rather than decorative ones.

- **Palette:** near-black slate background (`#08090b`) with a subtle radial vignette; panel/tile surfaces in dark charcoal grays (`#15181d`, `#191c22`, `#23272f` borders). Semantic gauge colors carried over from the original spec and kept consistent: safe green `#34c471`, warning amber `#f2a933`, danger red `#ef4b45`, held/venting cyan `#4bd9f0` (used for the glow border, needle, and steam wisps while a valve is actively held). A muted amber/black diagonal "hazard stripe" rule sits under the title as a small industrial motif.
- **Typography:** system UI sans-serif (`-apple-system`/`Segoe UI`/Roboto) for labels and copy; a system monospace stack (`ui-monospace`/`SF Mono`/`Roboto Mono`/Menlo/Consolas) for all numeric readouts (timer, lives, score, per-valve %) to give them a "terminal digits" feel — no web fonts loaded, everything is a local system stack.
- **Valve tile treatment:** the old vertical color-fill bar was replaced with a circular gauge — a `conic-gradient` progress ring (color driven by the same 50%/80% thresholds already in the logic) plus a thin rotating needle (`transform: rotate()`, driven purely by the existing `pressure` value, same math as the ring). A dark inset "face" holds the monospace percentage readout. Offline valves are dimmed/desaturated standby dials; held valves get a cyan glow border plus two small CSS-only rising "steam" dots (`::before`/`::after`, looping `steamRise` keyframe, gated entirely by the existing `.held` class — no new JS state). Exploded/broken valves keep the tile-flash animation and add small radiating "soot puff" pseudo-elements plus a brief whole-screen `shake` keyframe applied to `#app` at the moment of explosion.
- **Juice/feedback (cosmetic-only additions):** a short WebAudio square/sawtooth "clunk" beep on valve explosion and a light two-note chime on scoring a "save" — both wrapped in try/catch, with the `AudioContext` created/resumed inside the existing Start Shift button click handler (a real user gesture) so later autoplay-restricted playback works reliably on mobile Safari/Chrome. Lives in the HUD render as heart glyphs (♥♥♥) instead of a bare digit — purely a display-string change in `updateHud()`, the underlying `lives` integer and win/lose checks are untouched.
- **Layout:** unchanged 2×4 grid sized for a ~375–430px portrait viewport; tiles kept the same `min-height`/gap so touch target sizes are identical to the pre-polish version.
- **Constraints preserved:** no external fonts, images, or CDN calls; single self-contained HTML file; no `:hover`-gated affordances and no keyboard-only handlers introduced (verified via grep for `keydown`/`keyup`/`:hover` — none present); all `pointerdown`/`pointerup`/`pointercancel`/`lostpointercapture` touch handling and multi-touch `pointerId` tracking left byte-for-byte identical to the prototype.
- **Inspiration sources:** dark-mode dashboard color-pairing conventions ([devpalettes.com dark color palettes](https://devpalettes.com/dark-color-palettes/), [AdminLTE dark dashboard round-up](https://adminlte.io/blog/dark-dashboard-templates/)) and minimalist/limited-palette game-jam conventions ([itch.io "Picking the Perfect Color Palette for Your Game"](https://itch.io/blog/1039646/picking-the-perfect-color-palette-for-your-game), [itch.io Minimalist Game Jam](https://itch.io/jam/minimalist-game-jam-1)).

## Difficulty Tuning

**Problem with the prototype curve:** both escalation axes — new valves coming online and the per-valve fill-rate multiplier — ramped **linearly** against raw elapsed time. Because total on-screen pressure workload is roughly `activeValves * fillRate`, two linear ramps multiplied together compound into a curve that's effectively quadratic, not smooth. Simulating the old constants (`SPAWN_INTERVAL` 9s→4s linear, `DIFFICULTY_MAX_MULT` 1.4 linear) showed all 8 valves already online by **t≈37s — less than half the 75s session** — after which only the fill-rate kept climbing for the remaining 38s. That front-loaded the "more things to track" half of the ramp into the first third of the session (a new valve roughly every 7-8s starting almost immediately), while the back half of the run just got faster instead of also getting busier, and the total workload still grew ~6.4x start-to-end. Net effect: pressure ramped up too quickly right as a new player was still learning the controls, then the session's second half didn't feel meaningfully different in kind from the first.

**Fix — ease both ramps instead of changing their endpoints.** The end-of-session peak values are intentionally left the same as the prototype (peak fill-rate multiplier still 2.4x, all 8 valves still online by session end) — this is a curve-shape fix, not an overall difficulty increase or decrease. Both `difficultyMultiplier()` and `spawnInterval()` now drive off `Math.pow(elapsed / SESSION_DURATION, EASE_POW)` instead of a raw linear fraction, which keeps the curve near its starting value for longer and then accelerates smoothly into the back half — a single continuous formula, no thresholds or steps:

```
difficultyMultiplier(t) = 1 + DIFFICULTY_MAX_MULT * (t/SESSION_DURATION)^MULT_EASE_POW
spawnInterval(t)        = lerp(SPAWN_INTERVAL_START, SPAWN_INTERVAL_END, (t/SESSION_DURATION)^SPAWN_EASE_POW)
```

| Constant | Old | New | Why |
|---|---|---|---|
| `DIFFICULTY_MAX_MULT` | 1.4 (linear) | 1.4 (eased, pow 1.6) | Same end-of-session peak fill-rate (2.4x base); ramp now starts nearly flat and accelerates, instead of climbing at a constant rate from second one. |
| `SPAWN_INTERVAL_START` | 9s | 13s | Longer gap before the 4th valve comes online, giving a longer genuinely-easy tutorial window. |
| `SPAWN_INTERVAL_END` | 4s | 5.5s (asymptotic) | Combined with the eased curve, the 8th (final) valve now comes online around t≈54s instead of t≈37s — spreading valve onboarding across ~70% of the session instead of ~50%. |
| `MULT_EASE_POW` (new) | — | 1.6 | Shapes the fill-rate ramp: flat-ish for the first ~15s, then increasingly steep. |
| `SPAWN_EASE_POW` (new) | — | 1.8 | Shapes the spawn-interval shrink the same way, so valve count and fill-rate escalate in step rather than one maxing out early. |

**Simulated timeline under the new constants** (BASE_FILL_RATE and VENT_RATE unchanged at 6%/s and 26%/s):

| t | Active valves | Fill-rate mult | Time-to-blow if ignored | Total panel pressure-rise |
|---|---|---|---|---|
| 0s | 3 | 1.00x | 16.7s | 18 %/s |
| 15s | 4 | 1.11x | 15.1s | 26.6 %/s |
| 30s | 5 | 1.32x | 12.6s | 39.7 %/s |
| 45s | 6 | 1.62x | 10.3s | 58.3 %/s |
| 60s | 8 | 1.98x | 8.4s | 95.1 %/s |
| 75s | 8 | 2.40x | 6.9s | 115.2 %/s |

This gives a genuinely easy opening (first ~13s: only the original 3 valves, fill-rate barely above base, ~17s of neglect-time before any valve is even in danger), a smooth continuous ramp through the middle (each new valve and each fill-rate bump arrives gradually, not as a jump), and a "hard but fair" finish concentrated in the last ~20 seconds of the 75s session, once all 8 valves are online and the multiplier is near its cap — matching the target of reaching peak difficulty within roughly the last third of a short session rather than by its halfway point. End-of-session peak intensity (115.2 %/s total pressure-rise) is unchanged from the original constants; only the shape of how the session gets there was smoothed and shifted later.

## Assets

Promotional thumbnails (original illustrations inspired by the game's control-room instrument-panel concept and palette, not screenshots of actual gameplay):

| File | Dimensions | Intended use |
|---|---|---|
| `thumbnails/thumb-small.png` | 320 x 180 px | Compact rows in a games list / index page, sidebar links |
| `thumbnails/thumb-medium.png` | 640 x 360 px | Grid/card layout tiles on a games gallery page (the default "cover image") |
| `thumbnails/thumb-large.png` | 1280 x 720 px | Hero banner on the game's own page; also works directly as an Open Graph / Twitter Card social-preview image |

## Edit Log

- **2026-07-19:** Fixed a bug where score almost never incremented. The "close call" flag (`wasHigh`) was set by comparing the raw, unrounded `pressure` value to `HIGH_THRESHOLD` (80), while the on-screen readout shows `Math.round(pressure)`. Since the pressure rises in small per-frame steps, the display could read "80%" up to ~0.5% before the raw value actually reached 80 — so a player who grabbed a valve the instant it visibly hit 80% (the exact behavior the game teaches) would start venting before the internal flag ever flipped, and the save was never counted. Changed the check to `Math.round(v.pressure) >= HIGH_THRESHOLD` so it aligns with what the player actually sees. No visible/gameplay change other than scoring now working as designed.
- **2026-07-19:** Reworked scoring so it rewards ordinary play, not just dramatic saves. Added a small +1 "routine vent" tick, awarded once per vent action (on releasing the last finger from a valve, only if that hold dropped its pressure by >=4%) — a discrete, per-action trigger, not per-frame, so it can't be inflated by holding longer. The existing high-pressure close-call save now awards +5 instead of +1, keeping it the clearly bigger reward. Updated the end-of-run overlay text from "Final Score: N saves" to "Final Score: N pts" since the total now blends both scoring sources.
- **2026-07-19:** Expanded two-tier release scoring into three tiers, keyed by the peak pressure reached during each hold (safe/warn/danger, reusing the existing gauge-color thresholds): low vent +1 (peak stayed below 50%), mid vent +3 (new — peak reached 50-79%), high save +5 (peak reached >=80% and was vented back to <=25%, unchanged). All three still require the existing minimum pressure-drop guard. Moved the high-tier save check out of the per-frame update loop and into the same release handler used by the other tiers, so all scoring now triggers consistently on release rather than mid-hold; also reset `holdStartPressure` when a valve explodes so a delayed release event from that same touch can't retroactively score a tier. Added a one-line scoring explanation to the start overlay, and a small color-coded "+1"/"+3"/"+5" popup (pure CSS float-and-fade, same lightweight pattern as the steam-wisp animation) that appears on a valve tile whenever a release earns points; purely cosmetic, no effect on scoring logic.
- **2026-07-19:** Added a persistent best score, stored under `localStorage` key `valvePanicBest` (read/write wrapped in try/catch for private-browsing safety). On each game end, if the run's final score beats the stored best, it's updated and saved. Shown on the overlay: "Best: N pts" before the first run, and "Final Score: N pts · Best: M pts" after each run — the live 3-stat HUD (Time/Lives/Score) is untouched.
- **2026-07-19:** Thickened the visible gauge ring band on each valve dial from 7px to 12px by shrinking `.valve .face` from 42x42 to 32x32 (dial/ring stayed 56x56), per feedback that the color ring was too thin to read. Trimmed `.pct` font-size from 12px to 10.5px so the percentage readout still fits comfortably in the smaller face. Needle length (22px) left unchanged — proportionate against the new sizes.
