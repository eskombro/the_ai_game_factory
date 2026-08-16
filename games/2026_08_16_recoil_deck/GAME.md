# Recoil Deck

**One-line pitch:** A pocket card duel where every card you play hits the boss now — and lands on a visible track that hits *you* back a few turns later, so your own attacks are the only enemy attacks.

## The original twist

There is no enemy hand, no enemy deck, and no hidden intent. **The boss fights you with your own cards.** Anything you play is copied onto a public *return track* and resolves against you after a fixed delay: damage comes back as damage to you, block comes back as boss armour, healing comes back as boss healing.

That turns a familiar card-battler into a scheduling puzzle with full information:

- Your damage output *is* your incoming damage, so the question is never "how much can I deal" but "when will it land, and will I be holding block then".
- Defending is not free — every point of block you gain becomes a point of boss armour later, so turtling literally makes the boss harder to kill.
- The only true escape is speed: **cards still in flight when the boss dies never come home.** Winning a fight is really about timing a final burst so the last salvo never recoils.

## How to play / controls (touch-first, mouse-equivalent)

All input is unified `pointerdown` / `pointermove` / `pointerup`, so identical gestures work with a finger or a mouse. No keyboard is used or needed anywhere.

- **Start screen** — tap/click **START RUN**.
- **Play a card** — **drag it upward** out of your hand (about 55px) and release; the card turns green when it is armed to play.
- **Alternative play path** — **tap a card** to select it (gold border), then tap the **PLAY <NAME>** button in the bottom bar.
- **Drag a card down or sideways and release** — cancels; the card snaps back.
- **End your turn** — tap **END TURN** (bottom bar). Unplayed cards are discarded.
- **Between fights** — tap one of the three big reward buttons.
- **Game over** — tap **NEW RUN**.

Bottom-right corner is deliberately kept clear: the bottom bar has 76px of right padding and the hand row has 40px, so no card or button enters the area reserved for the site's floating rating widget. Verified at 320×568, 390×664 and 412×839.

## Core mechanics

**Turn order (start of each of your turns):**
1. Every pending return ticks down by 1.
2. The boss's **lash** hits (a small, escalating chip attack — the clock that stops you from stalling forever).
3. All returns that reached 0 resolve against you, then those cards go to your discard pile.
4. Your **block is wiped**, energy refills to 3, and you draw back up to 4 cards.

Because block is wiped *after* incoming resolves, block gained on a turn exists precisely to absorb what lands at the start of your **next** turn. The status panel spells this out live: `Incoming next turn: N → fully blocked / you take X`.

**Cards** (cost / effect now / recoil after N turns):

| Card | Cost | Now | Recoil |
|---|---|---|---|
| Jab | 1 | Deal 5 | in 2: 5 damage to you |
| Slam | 2 | Deal 12 | in 2: 12 damage to you |
| Guard | 1 | Gain 8 block | in 3: boss +8 armour |
| Mend | 1 | Heal 6 | in 3: boss heals 6 |
| Riposte | 1 | Deal 4, gain 4 block | in 2: 4 damage to you & boss +4 armour |
| Crush | 3 | Deal 20 | in 3: 20 damage to you |
| Bulwark | 2 | Gain 16 block | in 3: boss +16 armour |
| Purge | 1 | Cancel the soonest return | never returns |
| Stall | 1 | Delay all returns by +1 turn | never returns |

Starting deck: 5 Jab, 3 Guard, 2 Slam, 1 Mend, 1 Purge. Standard draw pile → discard → reshuffle cycling; cards sitting on the return track are temporarily out of the deck, which is its own soft pressure (spam attacks and your deck thins out).

Boss armour is permanent until chewed through; player block is per-turn.

**Run structure (rogue-lite loop):** beat a boss → heal 12 → pick one of three rewards (two random cards to add to your deck, or skip for a bigger heal plus +5 max HP) → next boss, with more HP and a higher starting lash. HP and deck carry across the whole run.

## Win / lose conditions

- **Win a fight:** boss HP reaches 0. There is no final boss — fights escalate forever, so a "win" is how deep you get.
- **Lose the run:** your HP reaches 0 (checked at the start of a turn, when the lash and your recoils land). Run ends, score is shown, **NEW RUN** restarts from fight 1.
- **Score:** bosses defeated (primary) plus total damage dealt. Best run is persisted via `localStorage` inside a `try/catch` so it degrades harmlessly on `file://`.

## Difficulty escalation

- Within a fight: the boss's lash starts at 0–N and grows +1 every 4 turns, so slow fights are punished, but gently.
- Across a run: boss HP starts at 36 and adds +8 per fight for the first 6 fights, then +5 per fight after that; the lash's per-fight base starts +1 higher every 2 fights, capped at +6 for very long runs.
- Emergent escalation: your deck grows with reward cards, and bigger cards recoil harder — the deck that beats fight 4 is the deck that can kill you on fight 6.

Baseline tuning was checked with a headless rules simulator plus scripted browser bots (aggro / block-first / adaptive). Skill ordering came out correct — a mindless "play everything" bot dies around fight 2–3, a block-first bot around 3, and an adaptive bot averages ~4 — so the mechanic rewards planning rather than throughput. See "Difficulty Tuning" below for the dedicated balance pass over these constants and the reasoning behind the current numbers.

## Notes for visual polish

- **No canvas.** Everything is plain DOM, so it can be restyled entirely in CSS.
- Key elements: `#topbar` (boss name, HP bar, fight/turn/lash readout), `#track` (the return track — the signature element, 4 columns `in 1 / in 2 / in 3 / 4+` holding `.chip` items), `#status` (player HP bar, `block`/`energy`/`deck` pills, and the `#incoming` line), `#log` (last 3 events, fixed 56px), `#hand` (`.card` elements), `#bottombar` (`#btnPlay`, `#btnEnd`), `#overlay` + `#obox` (start / reward / game-over screens).
- `.chip.bad` = an incoming damage return, `.chip.warn` = an incoming buff-the-boss return; `.col.soon` is the "lands next turn" column. These three states carry most of the game's readability and deserve the strongest visual treatment. The `#incoming.safe` / `#incoming.hurt` pair is the second most important signal.
- Card states already have hooks: `.card.sel` (tapped/selected), `.card.armed` (dragged high enough to fire on release), `.card.poor` (unaffordable, dimmed). Drag currently uses an inline `transform` set in JS — any CSS transition on `.card` transform will fight the drag, so transition only non-transform properties, or exclude the dragging card.
- Placeholder palette: background `#16171c`, panels bordered `#3a3d47`, boss bar `#b5453f`, player bar `#3f8f5a`, recoil text `#d1867a`, selected gold `#e6c46a`, armed green `#6fbf8b`.
- Layout is a flex column with a flexible `#spacer` between the log and the hand, so the hand stays thumb-reachable at the bottom on tall phones; that gap is intentional breathing room and a good spot for any decorative art.
- Do not shrink the right-side padding on `#bottombar` (76px) or `#handwrap` (40px) — that is the rating-widget clearance.
- `.card` is `flex: 1 1 76px; max-width: 84px` so four cards fit down to a 320px-wide screen; card text is deliberately terse for that reason.
- No sound, no images, no external fonts — keep it dependency-free.

## Visual Design

**Direction: "Ink & Ember" — an austere, information-dense duel readout.** The fiction is that you're staring at a ledger of your own incoming mistakes, so the UI leans terminal/instrument rather than fantasy-card-game: a desaturated indigo-ink field, warm cream text, and colour used *only* where it carries a rule. No images, no external fonts, no libraries — still one self-contained offline HTML file.

### Palette

Named as CSS custom properties on `:root`, each colour tied to one meaning:

| Token | Hex | Meaning |
|---|---|---|
| `--ink` | `#14131d` | page base (with two very faint radial washes: ember from the top/boss side, mint from the bottom/your side) |
| `--ink-2` | `#1c1a29` | raised surface |
| `--line` / `--line-2` | `#322f47` / `#45415f` | hairlines, panel + card borders |
| `--cream` | `#ece5db` | primary text |
| `--mute` / `--faint` | `#948da8` / `#6b6580` | secondary / tertiary text |
| `--ember` | `#e26a45` | **the boss, damage, and everything recoiling at you** |
| `--mint` | `#63c6a0` | **you: player HP, "fully blocked", armed-to-play card** |
| `--steel` | `#7e8ccd` | block & armour (defence, neutral) |
| `--gold` | `#e8b877` | energy cost, tap-selected card, reward offers |
| `--mauve` | `#a482bb` | recoils that *buff* the boss (armour/heal) — deliberately not red, so "this hurts me" and "this makes the boss stronger" never blur together |

Deep companion fills (`--ember-lo #5d2a24`, `--mauve-lo #33254a`, `--steel-lo #262b47`, `--gold-lo #3a3121`, `--mint-lo #1f3a33`) back the chips and pills so the accents stay legible at 8px.

### Typography

System stack only, deliberately paired:
- **System sans** (`system-ui / -apple-system / Segoe UI / Roboto`) for prose — card effect text, overlay paragraphs, reward descriptions.
- **System mono** (`ui-monospace, SFMono-Regular, Menlo, Cascadia Mono, Consolas`) for every *number and label* — HP readouts, the fight/turn/lash line, track chips and column labels, the `Incoming next turn` line, the log, buttons and overlay headings. Wide letter-spacing (`.10`–`.16em`) plus uppercase on headings/buttons gives the instrument-panel feel with zero font weight to download. Because numbers are tabular, HP and armour values no longer jitter between renders.

### Layout & component treatment

- **Panels** became soft-cornered (10px) raised cards: a subtle top-light gradient, 1px hairline, and a broad low-opacity drop shadow, so the three information blocks separate without extra chrome.
- **Return track — the signature element** — gets the most emphasis: an ember bullet + tracking on the header, dashed borders for far columns vs. a solid, ember-tinted, softly *pulsing* `in 1` column (`soonpulse`, 2.4s), and chips restyled as left-bordered tags (ember = damage to you, mauve = boss buff). Chips fade/slide in (`chipin`, 220ms) as they appear.
- **HP bars** are now slim 9px capsules with an inset track, a gradient fill and a matching glow, animating their width over 320ms on a `cubic-bezier(.22,1,.36,1)` ease.
- **`#incoming`** — the second-most important signal — is a tinted, left-bordered callout that flips wholesale between mint (`safe`) and ember (`hurt`) rather than only changing text colour.
- **Cards** got a vertical gradient face, a circular gold cost badge, an uppercase name, and — the key readability change — a **dashed ember rule separating "what it does now" from "what it does to you later"**, mirroring the game's central tension on every card. `.sel` reads as a gold halo, `.armed` as a mint glow with a slight brightness lift. Per the engine notes, `.card` transitions **exclude `transform`** (only `border-color`, `box-shadow`, `opacity`, `filter`), so nothing fights the JS-driven drag.
- **Buttons** are mono/uppercase with a 1px press translate; `END TURN` stays the blue primary, and an enabled `PLAY` picks up the gold selection colour so the tap-to-select path visibly completes.
- **Overlays** gained a blurred backdrop, an ember top-wash, and a 300ms rise-in for the box; the instruction block is a left-ember-ruled callout and reward offers are gold-ruled.
- **The empty `#spacer`** now carries a single very faint ↩ recoil glyph (5% opacity) — decorative breathing room, per the engine notes.

### Juice (presentation only)

- `#game.shake` — a 280ms, ≤3px shake plus an ember flash on `#status` whenever the player's HP drops; an ember flash on `#topbar` whenever the boss's HP drops.
- Implemented as a small `fxAfterRender()` at the end of `renderFight()` that only *reads* `G.hp` / `G.boss.hp` and toggles CSS classes. **No game state, rule, tuning constant, or input handler was touched** — mechanics, controls and win/lose behave identically.
- A `prefers-reduced-motion: reduce` block disables every animation and transition.

### Constraints respected

- Rating-widget clearance untouched: `#bottombar` keeps `padding-right: 76px` (bottom padding now also adds `env(safe-area-inset-bottom)`) and `#handwrap` keeps `padding-right: 40px`. Verified programmatically at 390×664 and 320×568 — no button or card intersects the bottom-right 60×60 region.
- Pointer-unified drag/tap controls verified working after the restyle via scripted mouse **and** touch input (drag-to-play, tap-select → PLAY, cancel-drag), with zero console errors and no horizontal/vertical overflow at 320×568.
- A `max-width: 360px` block tightens track-header tracking and chip type so the header stays on one line and chips like `Guard +8 armr` no longer ellipsis-truncate on small phones.

### Inspiration

- [Minimalist card games on itch.io](https://itch.io/games/tag-card-game/tag-minimalist) — the genre convention of letting flat colour blocks and type carry all state, with no illustration.
- [Way to Crown devlog](https://itch.io/t/4632639/hardcore-deckbuilder-with-minimalistic-visuals-way-to-crown) — a deck-builder whose UI is explicitly "influenced by browser-based idle games, packing as much information as possible while staying clean and clear", and whose animations exist "to give visual feedback, not for artistic value". That framing drove the instrument-panel typography and the strictly functional shake/flash.
- [Lospec "Oil 6" palette](https://lospec.com/palette-list/oil-6) (`#fbf5ef #f2d3ab #c69fa5 #8b6d9c #494d7e #272744`) — source of the muted indigo/cream/mauve relationship; adapted darker and pushed toward ember/mint so the two gameplay poles (boss vs. you) stay separable.

## Difficulty Tuning

A dedicated balance pass, done with a rules-accurate Node.js port of the engine (`beginTurn`/`playCard`/`furyAt`/boss-HP math copied verbatim) driven by three scripted bots — mindless aggro, block-first "turtle", and a threat-aware "adaptive" bot that blocks only when `incoming > block` and purges a soon-landing damage return when it can — run across many RNG seeds and reward paths.

**What the simulation showed with the original constants:** the opening is already correctly easy (fight 1 is close to damage-free for any sane play) and the skill ordering the creator found still held (turtle dies earliest, aggro survives longest by outrunning its own recoils, adaptive lands in the middle) — but the *shape* of the ramp was steppy rather than smooth. Two floored terms (`fury` stepping up every `FURY_DEPTH` fights, `BOSS_HP` stepping up every fight by a flat amount) tended to cross their thresholds together, and because fight length itself grows with boss HP, a fight that runs a couple of turns long compounds into a much longer, much lashier fight than the one before it. Concretely: with the shipped constants, simulated runs regularly went from "untouched" (fight 1‑2) to "down to ~25 HP" (fight 3) to dead (fight 4), a jump that reads as a spike rather than a climb even though the average "run ends around fight 4" outcome itself was fine.

**Changes made (only pacing constants and the two escalation formulas — no card stats, costs, recoil delays, or rules changed):**

| Constant | Old | New | Why |
|---|---|---|---|
| `FURY_RAMP` (lash +1 every N turns of a fight) | 3 | 4 | Softens the in-fight ramp so a fight that runs a bit long doesn't immediately jump to a harsher lash tier — the single biggest contributor to the old spike. |
| `FURY_DEPTH` (lash's per-fight base +1 every N fights) | 2 | 2 (unchanged) | This cadence was already fine and matches the validated "hard-but-fair by fight ~4" ceiling; only its long-run behavior needed a cap (below). |
| `FURY_BASE_CAP` *(new)* | — | 6 | The per-fight lash base now stops climbing past fight ~13, so extremely long runs plateau instead of the lash eventually dwarfing everything else. |
| `BOSS_HP_INC` (hp added per fight) | 8 (forever) | 8 for the first `BOSS_HP_RAMP_FIGHTS` fights, then `BOSS_HP_INC_LATE` | Keeps the exact same early/mid escalation (fights 1‑7 are numerically identical to before), but stops the linear HP growth from compounding indefinitely for players who get deep into a run. |
| `BOSS_HP_RAMP_FIGHTS` *(new)* | — | 6 | Number of full-rate HP steps before the slower tail kicks in (i.e. fights 1‑7 unchanged, fight 8+ eases off). |
| `BOSS_HP_INC_LATE` *(new)* | — | 5 | The gentler per-fight HP add-on once the ramp above is spent — a capped-linear tail instead of unbounded linear growth, per the "long runs stay challenged but don't snowball" goal. |

`MAX_HP`, `BOSS_HP`, `ENERGY`, `HAND_SIZE`, `WIN_HEAL`, `HEAL_SKIP`, `MAXHP_BONUS`, and every card's cost/damage/block/heal/recoil-delay are all untouched — the creator's original card math and reward loop were already sound, so only the escalation formulas and their long-run tail were touched.

**Resulting curve (simulated, adaptive bot, representative seed):**

| Fight | Boss HP | Lash base (turn 1) | Typical HP left after |
|---|---|---|---|
| 1 | 36 | 0 | ~full — genuinely free to learn the drag-to-play/tap-select controls and the return-track readout |
| 2 | 44 | 0 | still near-full; first small chip of recoil damage starts to matter |
| 3 | 52 | 1 | noticeably tighter — this is where "when do I block vs. attack" starts to bite |
| 4–5 | 60–68 | 1–2 | the "hard but fair" ceiling; this is where an average adaptive run now ends (avg. death fight ≈ 4.0 across 20 seeds, matching the pre-tuning baseline almost exactly — the goal was a smoother climb to the same ceiling, not a harder or easier one) |
| 6–7 | 76–84 | 2–3 | still full-rate escalation for players who are ahead of the curve |
| 8–12 | 89→114 | 3–5 | HP growth eases to the slower tail (`BOSS_HP_INC_LATE`); still getting harder, just not compounding |
| 13+ | +5/fight | capped at 6 | long-run plateau — lash stops climbing, HP keeps inching up so skilled players are still tested without the numbers running away |

Net effect: fight 1 stays free, fights 2→5 climb smoothly instead of jumping, the run still reaches a hard-but-fair wall in roughly the same place (about a minute or two of play for most players), and very long runs taper into a plateau instead of an unbounded snowball — while the average "how far do I get" outcome for a competent adaptive player is essentially unchanged from before the pass.

## Assets

Original promotional illustrations (poster/box-art style, not screenshots) live in `thumbnails/`:

| File | Dimensions | Intended use |
|---|---|---|
| `thumb-small.png` | 320 × 180 px | Compact rows in a games list / index page, sidebar links |
| `thumb-medium.png` | 640 × 360 px | Grid/card layout tiles on a games gallery page (the default "cover image") |
| `thumb-large.png` | 1280 × 720 px | Hero banner on the game's own page; also works directly as an Open Graph / Twitter Card social-preview image |

These are original vector illustrations composed from the game's own "Ink & Ember" palette and motifs (the ember boss emblem, the four-column return track escalating toward a glowing "IN 1" column, a fanned hand of named cards, the mint player token, and a looping ember arrow tracing the play-now / recoil-later loop) — not a capture of the running game.

## Pipeline Token Usage

| Stage | Model | Tokens |
|---|---|---|
| game-creator | opus | 94916 |
| game-polisher | opus | 60124 |
| game-balancer | sonnet | 101756 |
| game-qa | sonnet | 104545 |
| game-thumbnailer | sonnet | 65592 |
| game-describer | sonnet | 22362 |
| **Total (subagent stages)** | | **449295** |

*Producer's own orchestration tokens aren't included above — they aren't observable from within its own execution, only each subagent call's reported usage is.*

*QA found no bugs or evidenced usability problems in this run, so the conditional `game-editor` fix pass and re-verify `game-qa` pass were not invoked and have no rows here.*
