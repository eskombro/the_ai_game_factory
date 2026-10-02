# Glowhoard

**One-line pitch:** A light-avoidance stealth scramble where the glowing loot you steal is also the lantern that gives you away.

## The original twist

It is a stealth/light-avoidance game (new genre for this catalog), but the threat is not only external. Classic
"stay in the shadows" games give you a fixed stealth state; here **your stealth is your inventory**. Every mote you
pick up adds a permanent glow to your own body, so a full hoard means you are lit even while standing in perfect
shadow. Scoring is quadratic (`motes² ` per deposit), so the game constantly asks: one more mote at square-growing
value, or run home now before your own light cooks you? Greed is literally luminous.

Shadows are real geometry, not scripted zones: lamps orbit the room and every pillar casts an exact umbra wedge
that sweeps across the floor, so safe ground is in constant motion.

## How to play / controls (touch-only, mouse-equivalent)

- **Touch and hold anywhere** in the arena (or **click and drag** with a mouse) — your creature glides toward your
  finger/cursor. Release to coast to a stop. One unified `pointerdown`/`pointermove`/`pointerup` path handles touch
  and mouse identically; extra fingers are ignored. No keyboard input exists anywhere in the game.
- **Start screen** with instructions and a large `START` button; the game-over screen has a large `PLAY AGAIN` button.
  Both are centered and ≥56px tall.
- Essential targets avoid the **bottom-right corner**: the den sits bottom-*left* (virtual 82,522), all buttons are
  centered, and `CORNER_KEEPOUT` (74 virtual px) prevents motes from ever spawning in the bottom-right corner.

## Core mechanics

- **Arena:** fixed virtual 400×600 play field, letterboxed and scaled to fit any viewport (logic is resolution
  independent). Six circular **pillars** are solid obstacles and the only shadow casters.
- **Lamps:** 2 at the start, orbiting their own centres; a 3rd unlocks at 20 points and a 4th at 60 points. Their
  orbital speed ramps with elapsed time (`LIGHT_SPD_RAMP`, capped at 1.9×).
- **Light model (exact, shared by visuals and rules):** a point is lit by a lamp only if it is within the lamp's
  range *and* the straight line to the lamp misses every pillar (segment/circle test). Intensity falls off as
  `(1 - d/range)²`. Total exposure = lamp sum + rising **ambient** + **self-glow** (`0.105 × carried motes`).
- **Burn meter:** exposure above `SAFE_LIGHT` (0.10) fills the burn bar; full darkness drains it slowly. Carrying
  even one mote puts you just over the safe line, so a loaded run is always on a clock.
- **Motes:** 3 on the floor at a time, each relocating after 13s (they blink before moving). Spawn placement
  deliberately prefers currently *lit* floor, so the loot is bait.
- **Den (bottom-left):** stepping in banks your whole hoard for `carried²` points and refills some den charge; while
  you shelter there, burn drains fast (`NEST_COOL`) but **den charge** drains too (~6s of total shelter), recharging
  only while you are outside. Camping is therefore not a strategy — an empty den stops cooling you.
- **Difficulty escalation:** ambient light rises with time (0.03 → 0.17 cap) so deep shadow eventually stops being
  perfectly safe; lamps speed up; extra lamps unlock at score thresholds; and your own hoard scales the pressure.

## Win / lose

- **Lose:** burn meter reaches 100% → `SCORCHED`, showing final score and session best, with `PLAY AGAIN`.
- **Win:** no terminal win state — it is a score chase (endless). Session length is naturally bounded by the ambient
  ramp plus lamp escalation; the "win" is beating your best.
- **Score:** sum of `carried²` per deposit (1, 4, 9, 16, 25, 36 for a 1–6 mote drop-off). `MAX_CARRY = 6`.

## Verification notes

Headlessly playtested with Playwright (390×780 mobile context, `hasTouch`): touch-tapping `START` begins play,
synthetic touch pointer drags move the creature, motes are picked up, deposits award `carried²`, den sheltering
drains the burn bar to 0, a full burn bar ends the run, and touch-tapping `PLAY AGAIN` fully resets score/carry/burn.
No console or page errors.

## Notes for visual polish

- **DOM structure:** `#hud` (SCORE / CARRY / BURN bar) above `#stage`, which holds `#cv` (the canvas) plus two
  absolutely positioned overlays `#startScreen` and `#overScreen` (toggled by the `.hidden` class). Buttons:
  `#startBtn`, `#againBtn`. HUD elements updated by `syncHud()`: `#scoreTxt`, `#carryTxt`, `#burnBar` (width %, and
  its background color is currently set inline at 35%/70% thresholds — change there if restyling).
- **Canvas regions:** everything is drawn in virtual 400×600 space via a letterbox transform; use the `VW`/`VH`
  constants and the `view` object if adding effects. Arena floor `#121219`, pillars `#2a2a36`/`#3d3d4d`,
  den `#06060a` with a `#4d6a8a` rim and a `#7fd4ff` charge arc, lamps `#fff2c0`, motes `#b9ffe4`,
  player tinting from cool blue to hot red by burn level, score popups `#ffe9a8`.
- **Lighting is a real render pass:** each lamp is composited with `globalCompositeOperation = "lighter"` from a
  half-resolution offscreen buffer (`LS = 0.5`), where shadow wedges are punched out with `destination-out`. Raising
  `LS` to 1 gives crisp shadow edges at some cost; adding a blur to that buffer would soften umbra edges nicely.
  Do **not** change the geometry in `shadowPoly`/`occluded`/`lightAt` — those three must stay in agreement or the
  visible shadows will stop matching where you are actually safe.
- Good candidates for juice: a heat vignette/pulse as burn passes ~70%, a shockwave on deposit, trailing afterimage
  for the creature, a soft flicker on the lamps. The `popups` array is the existing hook for floating text.
- All placeholder colors are flat fills; there is no texture, gradient art, or font loading to preserve.

## Visual Design

**Direction:** "cold loot, hot threat" — a near-black heist vault lit by two opposed accents. Everything that is
*yours* (motes, carry pips, self-glow, den charge, primary CTA) is cold luminous teal/cyan; everything that
*hurts* (lamp pools, ambient wash, burn bar, SCORCHED screen, PLAY AGAIN) is amber → ember. The room itself is
blue-ink stone, so the player instantly parses the screen as "teal = mine, warm = danger" without any extra UI.
Follows the minimalist dark-UI convention of a single deep base plus one or two glowing accent hues
(e.g. the "glowing teal edition" dark-fantasy kits and 1-bit noir packs on itch.io) rather than a full palette.

**Palette**

| Role | Hex |
| --- | --- |
| Void / letterbox | `#04050b` |
| Panel / HUD ink | `#080a13` → `#0d1120` |
| Arena floor | `#141829` → `#080a14` (gradient + 40px grid at 4% + radial vignette) |
| Hairline / borders | `#1c2234` |
| Pillar stone | `#272e46` → `#0f131f`, rim `rgba(156,180,220,0.2)` |
| Text / muted | `#dde3f2` / `#737b99` |
| Cold accent (loot, you, den, START) | `#6cf0c2`, pale core `#cffff0`, den arc `#7fe9ff` |
| Warm accent (score, lamplight) | `#ffd37a`, lamp core `#fffaea`, falloff `#ffc97c` → `#ffa64e` |
| Hot / ember (burn, death) | `#ff9a4d` → `#ff553a` |

**Typography:** system fonts only, zero network loads. Headings use heavy `system-ui` at `0.2em` tracking
(GLOWHOARD / SCORCHED as wide glowing signage); all instrumentation — HUD labels and values, tag line, buttons,
score readouts, canvas popups and the DEN label — uses the system mono stack (`ui-monospace, SF Mono, Menlo,
Consolas`) in small caps-ish tracking, giving a cold "security panel" voice against the soft body copy.

**Layout / UI:** HUD became a thin instrument strip (stacked micro-label + tabular-nums value, pill burn track
with tick hatching and a glow that intensifies past 35% / 70%). Overlays sit on a blurred radial scrim with a
hairline card holding the rules, split by faded rules; buttons are glowing pills ≥56px (teal to start, ember to
retry), and a `clamp()`-sized title plus a short-viewport media query keep it readable on small phones.

**Motion / juice (all cosmetic, no rule reads any of it):** breathing glow on the title, heat-pulse on SCORCHED,
lamp filament flicker + faint orbit traces, pulsing motes with a specular dot, orbiting carry pips, creature
afterimage trail and shy eye-glints that fade as it cooks, expanding shockwave rings on pickup/deposit/death,
decaying screen shake on deposit and death, a pulsing ember vignette above 50% burn, and three very quiet
WebAudio blips (pickup / deposit / death) created lazily on first interaction. Light geometry
(`lightAt`/`occluded`/`shadowPoly`) was left untouched; only lamp *colour* was warmed to amber so lit floor reads
as lamplight instead of fog.

**Inspiration sources:**
- [Top game assets tagged Dark + User Interface — itch.io](https://itch.io/game-assets/tag-dark/tag-user-interface) (deep base + high-contrast single-accent dark UI kits)
- [Minimalist UI — Hazestorm Studio, itch.io](https://hazestormstudio.itch.io/minimalist-ui) (restrained HUD strip / thin meter conventions)
- [Top-rated minimalist games tagged "shadows" — itch.io](https://itch.io/games/top-rated/tag-minimalist/tag-shadows) (shadow-as-subject, flat-silhouette mood)

**Verification:** re-playtested headlessly (Playwright, 390×780 and 420×820, `hasTouch`, DPR 2) after the restyle —
start button, touch-drag gliding, mouse click-drag gliding, mote pickup, den deposit awarding `carried²`, den
cooling, burn-out → SCORCHED, and PLAY AGAIN reset all behave exactly as before, with no console or page errors.

## Difficulty Tuning

**Diagnosis:** the game already had the right *shape* of escalation (rising ambient light, lamp speed-up, score-gated
extra lamps), but the two time-driven ramps were compressed into the first few seconds instead of spread across the
session:

- `AMBIENT_RAMP` (old `0.0040`/s) pushed ambient light from its base `0.030` past `SAFE_LIGHT` (`0.10`) by **t≈17.5s**
  and all the way to its `0.170` cap by **t≈35s**. That means a brand-new player, still learning to glide and read
  shadows, lost "perfectly safe darkness" as an option before even their first lamp/pillar lap was finished — deep
  shadow started quietly ticking the burn meter almost immediately, which reads as an arbitrary early spike rather
  than a curve the player can feel building.
- `LIGHT_SPD_RAMP` (old `0.010`/s) hit its `1.9×` cap at **t≈90s**, which was already inside the intended 1–3 minute
  "hard but fair" window, but out of sync with the much-faster ambient ramp above.

Both are pure elapsed-time multipliers (`st.t`) feeding `ambientNow()` and the lamp-orbit `mult` in `update()` — no
mechanic, control, or win/lose logic touches them, so they were safe to retime in isolation.

**Change:** slow both ramps so the *same two endpoints* (base safety and the existing hard cap) are reached on a
"few-minutes session" timescale instead of a "first half-minute" timescale. The ceiling severity is intentionally
unchanged (`AMBIENT_MAX` still `0.170`, `LIGHT_SPD_MAX` still `1.9×`) — only the pacing to get there moved, so a
skilled long-run player eventually faces the same pressure as before, just not on top of a brand-new player.

| Constant | Old | New | Effect |
| --- | --- | --- | --- |
| `AMBIENT_RAMP` | `0.0040`/s | `0.0012`/s | Ambient crosses `SAFE_LIGHT` at ~t=58s (was ~t=17.5s); hits its `0.170` cap at ~t=117s (was ~t=35s) |
| `LIGHT_SPD_RAMP` | `0.010`/s | `0.0075`/s | Lamp-orbit speed hits its `1.9×` cap at t=120s (was t=90s), now landing in the same window as the ambient cap |

Unchanged (score-gated, already smooth since they scale with player skill rather than the clock): 3rd lamp unlock at
20 points, 4th at 60 points, `LIGHT_SPD_MAX` 1.9×, `AMBIENT_MAX` 0.170, all burn/cool/den-charge rates, mote count/life.

**Simulated curve (new constants), elapsed time → state:**

| t | Ambient light | Ambient-only burn rate (deep shadow) | Lamp speed multiplier |
| --- | --- | --- | --- |
| 0s | 0.030 (well under `SAFE_LIGHT`) | 0/s — pure shadow is fully safe | 1.00× |
| 15s | 0.048 | 0/s | 1.11× |
| 30s | 0.066 | 0/s | 1.23× |
| 45s | 0.084 | 0/s | 1.34× |
| 60s | 0.102 | ~0.001/s (just barely ticking) | 1.45× |
| 90s | 0.138 | ~0.018/s | 1.68× |
| 120s | 0.170 (capped) | ~0.032/s (same peak as the old curve) | 1.90× (capped) |
| 150s+ | 0.170 (plateau) | ~0.032/s (plateau) | 1.90× (plateau) |

Read as a session: for roughly the first minute, a player who is actually finding shadow is **completely safe from
ambient light** and only has to dodge the two starting lamps directly — plenty of room to learn the glide controls
and the light/shadow read without a hidden clock punishing them. From t≈60s to t≈120s the room itself gets
smoothly less forgiving (ambient creeps past the safe line, lamps visibly speed up), reaching the same "hard but
fair" ceiling by the 2-minute mark that the original design intended, then holding flat so longer runs don't spiral
into an unfair end-game. The score-gated 3rd/4th lamp unlocks still layer on top of this for players who are banking
hoards quickly, so a fast, aggressive player still gets a steeper curve than a cautious one — difficulty tracks
*their* play, not just the clock.

**Verification:** re-read `update()`/`ambientNow()` for off-by-ones, caps, and reset behavior — `ambientNow` still
clamps at `AMBIENT_MAX` via `Math.min`, the lamp-speed `mult` still clamps at `LIGHT_SPD_MAX`, both still reset to
their t=0 state on `newState()` (new game / Play Again), and neither can go negative or divide by zero. Re-ran the
existing headless Playwright smoke test (390×780, touch+mouse) after the edit: start → drag-glide → burn meter
responds to light exposure → no console or page errors. No mechanic, control, or visual code was touched — only
`AMBIENT_RAMP` and `LIGHT_SPD_RAMP`.

## Assets

Original poster-style illustrations (not screenshots) inspired by the game's "cold loot, hot threat" concept and
palette, generated as three fixed sizes under `thumbnails/`:

| File | Dimensions | Intended use |
| --- | --- | --- |
| `thumb-small.png` | 320 × 180 px | Compact rows in a games list / index page, sidebar links |
| `thumb-medium.png` | 640 × 360 px | Grid/card layout tiles on a games gallery page (default cover image) |
| `thumb-large.png` | 1280 × 720 px | Hero banner on the game's own page; also usable as an Open Graph / Twitter Card social-preview image |

The illustration depicts the teal shadow-creature (carried glow pips orbiting it) sheltering in an umbra wedge cast
by stone pillars, with two amber lamp light-pools and baited loose motes to its right and the glowing teal den in
the lower-left corner beside a GLOWHOARD logo treatment — composed from the real in-game palette (`#04050b` void,
`#6cf0c2`/`#cffff0` cold accent, `#ffd37a`/`#ffa64e` warm accent) rather than a capture of actual gameplay.

## Pipeline Token Usage

| Stage | Model | Tokens |
|---|---|---|
| game-creator | opus | 65542 |
| game-polisher | opus | 76016 |
| game-balancer | sonnet | 59146 |
| game-qa | sonnet | 118879 |
| game-thumbnailer | sonnet | 37673 |
| game-describer | sonnet | 20868 |
| **Total (subagent stages)** | | **378124** |

*game-editor was not invoked — game-qa's playtest found no bugs, console errors, or incorrect state transitions
that warranted a fix pass, so no re-verify game-qa pass was run either.*

*Producer's own orchestration tokens aren't included above — they aren't observable from within its own execution,
only each subagent call's reported usage is.*
