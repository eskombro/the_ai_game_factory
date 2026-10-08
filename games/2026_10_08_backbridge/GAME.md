# Backbridge

## One-line pitch

A walker who never jumps and never falls crosses an endless chasm on planks you drag into place — and the only way to afford the bridge ahead is to tear up the bridge behind him.

## The original twist

Two ideas lock together:

1. **Planks only hold weight when the whole span is finished.** A plank is load-bearing only if *both* of its ends can trace a path back to solid rock **without using that plank itself**. So a half-built chain of planks hanging over the void is a dashed, un-walkable scaffold; the instant the last plank touches the far pillar, the entire chain snaps into "solid" and becomes a walkway. You are building spans, not placing tiles.
2. **The bridge is your wood supply.** Wood is scarce and plank cost scales with length. Tapping the middle of any plank recycles it for 70% of its wood — so the structure you just crossed is the raw material for the next gap. The 30% loss is the real clock on the economy.

Combined with a walker who **stops politely at every brink instead of dying**, failure never comes from a missed input — it comes from mismanaging the resource loop, or from yanking a plank that was secretly holding up the one under his feet.

## How to play / controls (touch-first, mouse-identical)

All input is a single unified `pointerdown` / `pointermove` / `pointerup` path on the canvas, so a finger and a mouse drive exactly the same code. No keyboard is used anywhere.

- **Drag from a yellow anchor dot → lay a plank.** Anchor dots are pillar top corners, anywhere along a pillar's top surface, and the ends of existing planks. Drag out a ghost plank; it is green when legal, red with a reason ("TOO LONG", "TOO STEEP", "NO WOOD") when not. Release near another anchor to snap to it. Wood cost is shown live on the ghost.
- **Tap the middle of a plank → recycle it** for 70% of its wood. The plank the walker is currently standing on is protected ("HE'S STANDING ON IT"); every other plank, including load-bearing ones further down the chain, is fair game.
- **Start screen:** `#startScreen` overlay with instructions and a 230x64 `START` button. **Game over:** `#overScreen` with the score and a `PLAY AGAIN` button. Both buttons are centre-aligned with 140px of bottom padding, well clear of the bottom-right corner.

## Core mechanics

- **Walker:** auto-walks right at ~46 px/s along any solid surface (pillar top or load-bearing plank). Slower uphill, faster downhill. He has a 16px step-up / 26px step-down tolerance, so plank joints don't need to be pixel-perfect. If the next step has no surface, he simply **stops and waits**. If the surface under him disappears, he **falls** with gravity — he can survive a short drop onto a lower plank, but 300px of fall is fatal.
- **Structural solidity:** recomputed on every build/recycle via a graph search over plank endpoints (keys are rounded world coordinates; pillar tops and any plank end resting on rock are "ground" nodes). Non-solid planks are drawn dashed and thin.
- **Economy:** cost = `length * 0.10` wood (so the 110px maximum plank costs 11). Start with 55 wood and 28 seconds.
- **Plank limits:** 26–110px long, slope at most ~42 degrees (`|dy| <= 0.9*|dx|`), one end must begin at an existing anchor.
- **Reaching a new pillar** grants time and wood (both bonuses decay with distance), which is the only way to refill either resource.

## Win / lose conditions

Endless; the score is **pillars crossed**. There is no win state — only a personal best.

Two losses:

- **OUT OF TIME** — the clock, which only refills at pillars, hits zero (typically because a span cost more wood/thought than you had time for).
- **INTO THE CHASM** — the walker falls 300px, which in practice means a recycle pulled the support out from under a span he was standing on.

## Difficulty escalation

Driven entirely by terrain generation plus bonus decay, all in the `CFG` object at the top of the script:

- Gap width grows `110 + 22*index` (capped at 430px), so gaps go from one plank to four-plus.
- Pillar width shrinks `130 - 3*index` (min 62px) — less flat ground to recover on, and less time between gaps.
- Pillar height variance grows `18 + 4*index` (max 70px step), forcing stepped spans that must respect the slope limit.
- Time bonus decays 8.0 → 4.0 s/pillar; wood bonus decays 26 → 14/pillar. Since gap cost rises while the bonus falls, recycling goes from optional to mandatory within a minute.

## Verified behaviour (automated playtest)

Driven headlessly at 390x700 with synthetic touch pointer events *and* with real mouse events — both produce identical results (7 pillars crossed by a scripted bot, 19 planks built, zero console errors):

- Start button reachable by touch tap; cantilever plank correctly non-solid; completing the span flips the whole chain to solid.
- Walker waits at brinks, crosses finished spans, and banks pillar bonuses.
- Recycle returns 70% (9-cost plank → +6 wood) and correctly de-solidifies whatever it was supporting.
- Tapping the plank underfoot is refused; yanking a plank mid-span makes the walker fall and ends the run with `INTO THE CHASM`.
- `PLAY AGAIN` fully resets state (score 0, wood 55) in both input modes.

## Notes for visual polish

- **Everything gameplay-related is one `<canvas id="cv">`** filling the viewport. DOM chrome is only: `#hud` (top bar: TIME / WOOD / PILLARS, `pointer-events:none`), `#hint` (one-line control reminder under the HUD), `#startScreen`, `#overScreen`.
- **Placeholder palette:** background `#14161c`; pillar body `#39404f` with a `#5a6478` top lip; solid plank `#c8a06a` (7px round-cap line), non-solid plank `#8a7a5e` (4px dashed); anchor dots and accent text `#ffd27a`; valid ghost `#7ce08a`, invalid ghost `#ff6a5a`; recycle highlight `#ff9d5c`; walker is a plain white rect + circle (turns `#ff7a6a` while falling).
- **Readability is the whole visual job here:** a player must instantly tell (a) solid vs. not-yet-supported planks, (b) where the anchor dots are, (c) which plank a tap is about to recycle. Those three distinctions carry the game; keep them loud.
- **Camera:** walker sits at 30% of width, 52% of height (world→screen via `cam.x/cam.y`). The bottom ~45% of the screen is empty chasm, which is deliberate — it keeps every essential tap target away from the bottom-right rating widget. Any decorative chasm/parallax art is welcome there, but don't move the camera framing.
- Small text drawn on canvas: pillar index numbers, the ghost's cost label, a "waiting" tag above the walker, and the centred flash message at y=86 (bonus and error toasts) — these are the natural candidates for nicer typography.
- `window.__BB` is a read-only debug snapshot hook used by automated playtests; leave it in place.

## Visual Design

**Direction: "cold chasm, warm timber."** The whole world is a desaturated blue-slate night — fog strata, parallax rock ridges, drifting dust — and *wood is the only warm colour on screen*. Because timber is the resource the entire game is about, giving it a monopoly on warmth makes the economy legible at a glance: gold anchors are where you can spend, amber planks are where your wood currently sits, and the cold void is everything you can't build on. Per the minimalist-jam principle of a tight palette plus generous negative space, the bottom ~45% of the frame stays almost empty, with only fog and motes, so the bridge line always reads as the focal band.

### Palette (13 colours)

| Role | Hex |
| --- | --- |
| Void / page background | `#080a10` |
| Sky top → mid gradient | `#141d2b` → `#0f1521` |
| Far / near ridge silhouettes | `#131b28` / `#19222f` |
| Pillar body gradient | `#3e4a5d` → `#141b27` |
| Pillar top lip | `#9fb0c7` → `#56627a` |
| Plank — underside / body / lit edge | `#6b4a23` / `#b8803f` / `#e9b574` |
| Plank — unsupported scaffold | `#7d6b4d` (dashed, drifting) |
| Anchor dots, waiting chip, accents | `#ffc866` |
| Ghost valid | `#6fe3a0` |
| Ghost invalid / fail title / low HUD | `#ff6b5e` |
| Recycle highlight | `#ff9a4d` |
| Ink (walker, HUD values) | `#eef1f6` |
| Muted (labels, pillar numbers) | `#8a95a8` |

The three distinctions GAME.md flagged as load-bearing stay the loudest things on screen: **solid vs. scaffold** (thick 3-tone timber with a drop shadow and iron bolts vs. a thin, dashed, slowly drifting line), **anchors** (amber core + white specular + pulsing halo, bigger on rock than on plank ends), and **recycle target** (pulsing orange glow, marching dashes, and a `+N WOOD` chip showing the refund).

### Typography

System stacks only — zero font downloads, still fully offline.

- UI/display: `-apple-system, system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`. Uppercase + wide tracking (0.1–0.3em) for the title, HUD labels, buttons and canvas chips; normal-case sentence copy on the start screen.
- Numerals: `ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`, tabular, for TIME / WOOD / PILLARS, the final score, and the pillar index numbers — so the clock doesn't jitter as it counts down.

### Motion / juice (all cosmetic, zero gameplay impact)

- Parallax: two procedural ridge silhouettes (0.30 / 0.52) + dust motes (0.22) + fog strata (0.40). Camera framing is untouched.
- Build: dust + wood-chip burst at the plank, 2px shake, low wooden thunk.
- Span completes: every plank that flips load-bearing does a white "it holds" flare; a two-note chime + shake only when 2+ planks snap solid at once (i.e. a real span, not a single plank on rock).
- Recycle: orange chips thrown along the plank's whole length, 2.6px shake, descending blip. Refused recycles get a short low buzz.
- Pillar reached: amber sparkle burst, chime, and a green `+Ns +N WOOD` chip that rises and fades.
- Pressure: under 6 seconds, a red vignette pulses at the screen edges and the HUD clock blinks coral.
- Walker: walk-cycle legs/arm + body bob derived from `walker.x`, a stance when waiting, a tumble-rotate and coral tint while falling, plus a soft ground shadow.
- Audio is 6 tiny WebAudio oscillator blips created lazily on the first START tap — no files, no library.
- `prefers-reduced-motion` disables all overlay entrance animations.

### Verified after restyle

Headless Chromium at 390x700, mouse *and* touch: start → build 4 spans → cross → ghost valid/invalid states → recycle (8-cost plank refunded 5 = 70% floored) → underfoot-plank refusal → OUT OF TIME → PLAY AGAIN resets to score 0 / wood 55 / 0 planks. Zero console errors; `scripts/smoke_check.mjs` passes.

### Inspiration

- [Minimalist game art guide — palette budgets, negative space, silhouette-first readability (Pixune)](https://pixune.com/blog/minimalist-game-art-guide/)
- [Minimalistic Jam 3 — itch.io](https://itch.io/jam/minimalistic-jam-3) and [8 Bits to Infinity ~ Palette Jam](https://itch.io/jam/palette-jam) for the hard colour-count constraint that shaped the 13-colour table above.

## Difficulty Tuning

### The problem

The terrain-generation side of the ramp (gap width, pillar width, step height — all documented under "Difficulty escalation" above) was already smooth and continuous, so it was left untouched. The economy side was not: **time income decayed while time cost kept rising**, which guarantees an unwinnable wall rather than a skill-testable ceiling.

Modelled as a per-pillar "cycle" (lay N planks, cross the gap, cross the next pillar), the real-world cost of a cycle grows with the gap (more planks to drag, more distance to walk), while the old `TIME_BONUS_BASE → TIME_BONUS_MIN` (8.0 → 4.0s, decaying 0.15/pillar) was *shrinking* at the same time. A scripted "competent" player (~1.3s per plank drag) was already time-negative by pillar 1 and hit `OUT OF TIME` by pillar 6-7 (≈70s) — before the gap had grown large enough to be an interesting spatial puzzle, and regardless of skill. There was effectively no learning window and no "hard but fair" ceiling, only a fast, un-skippable countdown to a loss screen.

### The fix

Only the economy constants moved; terrain generation, plank limits, recycle refund (the core "30% loss is the clock" twist), and all mechanics/visuals are untouched:

| Constant | Old | New | Why |
| --- | --- | --- | --- |
| `TIME_START` | 22 | 28 | More slack to read the first gap and attempt a first drag without the clock already biting. |
| `TIME_BONUS_BASE` | 8.0 | 16.0 | Early pillars (small gaps, 1-2 planks) now bank a large time *surplus*, not a deficit — this is what makes the opening "genuinely easy." |
| `TIME_BONUS_DECAY` | 0.15 /pillar | 0.22 /pillar | Steeper early decay, but off a much higher base, so the bonus still clears the (rising) per-pillar cost for roughly the first dozen pillars before flattening. |
| `TIME_BONUS_MIN` | 4.0 | 13.0 | The floor now sits close to the *steady-state* cost of a maxed-out gap (4 planks + a long walk, ≈16-19s for a fast player) instead of far below it. Reaching the floor no longer means an immediate, un-recoverable deficit — it means a slow bleed, which is the "slower/plateaued increase" the ceiling should feel like. |
| `WOOD_START` | 45 | 55 | Wood was never the actual bottleneck (it only ever climbed in simulation), but a slightly larger starting bank keeps the first few spans from ever feeling tight while the player is still learning the drag gesture. |
| `WOOD_BONUS_BASE` | 26 | 28 | Small bump to match the slightly larger starting bank; keeps early pillars flush. |
| `WOOD_BONUS_DECAY` | 0.6 /pillar | 0.35 /pillar | Gentler decay so wood income doesn't collapse well before the time economy does — time, not wood, should be the thing that ultimately ends a run, matching the existing `OUT OF TIME` / `INTO THE CHASM` loss copy. |
| `WOOD_BONUS_MIN` | 14 | 15 | Essentially unchanged — recycling is still meant to become mandatory once the floor is reached; this isn't a lever for making wood easier, just a rounding match to the new base/decay. |

Terrain generation (`GAP_BASE/GROW/MAX/JITTER`, `P_W_BASE/DECAY/MIN`, `STEP_BASE/GROW/MAX`, `TOP_CLAMP`) and `P0_W` are **unchanged** — they already escalate linearly and cap smoothly (no jumps), and the gap/pillar-width/step caps are exactly what defines the "plateau" the new economy numbers are tuned to land on.

### Reasoning / simulated trace

A small offline simulator (not shipped with the game) modelled a full run using the documented formulas: `planksNeeded = ceil(gap / 110)`, `cost ≈ 0.10 * spanLength`, `cycleTime = planksNeeded * buildSecPerPlank + gap/46 + pillarWidth/46` (+ recycle time once wood runs short), run against three player speeds (skilled 1.3s/plank, mid 1.9s/plank, newbie 2.6s/plank):

| Player | t≈0-60s | t≈60-120s | Ceiling reached | Run ends |
| --- | --- | --- | --- | --- |
| Skilled | time balance climbing (28s → 58-68s banked) | still climbing/flat as gap nears its 430px cap | ~pillar 15, ≈190s (gap maxed, bonus at floor) | ~pillar 23, ≈340s — a long, slowly-bled plateau |
| Mid | time balance climbing (28s → ~54s banked) | starts a slow bleed as 3-4 plank spans appear | ~pillar 15, ≈215s | ~pillar 17, ≈260s |
| Newbie | time balance climbing (28s → ~45s banked) | bleed begins around pillar 6 (3-plank spans) | effectively pillar ~11-13, ≈160-200s | ~pillar 14, ≈225s |

Under the **old** constants, all three profiles were time-negative from pillar 1 onward and died at pillar 6-7 (≈70-110s) regardless of skill — no easy opening, no ceiling, just a fixed-length countdown. Under the **new** constants, every profile gets a genuinely easy, climbing-surplus opening (first ~45-110s), a smooth transition into "hard but fair" as the gap/plank-count climbs (roughly the 1-3 minute mark, synced to the point where `GAP_MAX`/`TIME_BONUS_MIN` both kick in), and then a slower bleed-out that rewards — but doesn't infinitely reward — skill and recycling discipline, consistent with the "no win state, only a personal best" design.

### Old vs. new at a glance

```
                 TIME_START  TIME_BONUS(base→min, decay)   WOOD_START  WOOD_BONUS(base→min, decay)
Old:             22          8.0 → 4.0   (-0.15/pillar)     45          26 → 14   (-0.6/pillar)
New:             28          16.0 → 13.0 (-0.22/pillar)     55          28 → 15   (-0.35/pillar)
```

## Assets

Original poster-style illustrations (not screenshots) inspired by the game's "cold chasm, warm timber" concept and documented palette:

| File | Dimensions | Intended use |
| --- | --- | --- |
| `thumbnails/thumb-small.png` | 320 × 180 px | Compact rows in a games list / index page, sidebar links |
| `thumbnails/thumb-medium.png` | 640 × 360 px | Grid/card layout tiles on a games gallery page (the default "cover image") |
| `thumbnails/thumb-large.png` | 1280 × 720 px | Hero banner on the game's own page; also works directly as an Open Graph / Twitter Card social-preview image |

## Pipeline Token Usage

| Stage | Model | Tokens |
|---|---|---|
| game-creator | opus | 63993 |
| game-polisher | opus | 102930 |
| game-balancer | sonnet | 91853 |
| game-qa | sonnet | 171495 |
| game-thumbnailer | sonnet | 31423 |
| game-describer | sonnet | 21936 |
| **Total (subagent stages)** | | **483630** |

*Producer's own orchestration tokens aren't included above — they aren't observable from within its own execution, only each subagent call's reported usage is.*
