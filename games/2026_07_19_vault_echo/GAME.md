# Vault Echo

## One-line pitch
A memory-heist game where you must repeat an ever-growing vault combination from memory, then decide each round whether to bank your loot and walk away, or push one round deeper and risk losing it all.

## The original twist
Vault Echo combines two mechanics that don't usually appear together: a **Simon-style pattern-memory challenge** (watch a growing sequence, then reproduce it) and a **push-your-luck banking decision** (like a "keep rolling or cash out" gamble). After every successfully repeated combination, the game explicitly stops and forces the player to choose:

- **Bank the loot** and end the run with a guaranteed score, or
- **Push deeper** into a longer, faster, higher-value combination — where a single wrong tumbler or a timeout wipes the *entire run's* unbanked loot back to zero.

This turns a familiar memory-recall mechanic into a tension-driven risk/reward loop: the reward per round keeps climbing, but so does the sequence length and the speed of the reveal, while the time you're given to answer doesn't grow proportionally. There's also a defined "perfect" endpoint (round 10) that rewards mastery with a forced double-loot payout, giving the run a clear finish line instead of an infinite grind.

This is explicitly NOT an aiming/crosshair/reflex-targeting game — there is no cursor tracking, no moving target, and no two-axis positioning. The only input is "which of 4 pads was flashed, in order."

## How to play / Controls
- Click **Start Run** to begin.
- Watch the 4 pads (each marked with a distinct symbol — circle, triangle, square, diamond — arranged in a 2x2 grid) flash in a sequence.
- Repeat the sequence in the same order by clicking/tapping the pads directly.
- You have a limited time window (shown as a shrinking bar) to enter the full sequence. Running out of time counts as a failure, same as pressing the wrong pad.
- After each successful round, choose:
  - **Bank Loot & End Run** — locks in your current total score safely.
  - **Push Deeper (Risk It)** — advances to a longer, faster round for a bigger potential payout.
- After a run ends (bust or bank), click **Start New Run** to play again.

## Core mechanics
- Each round's combination is `round number + 2` random taps long (round 1 = length 3, round 10 = length 12).
- The reveal speed (how fast pads flash) increases with round number, making later sequences harder to visually track.
- The input time budget scales with sequence length but does not scale with round difficulty otherwise, so pressure increases as sequences lengthen.
- Loot per round = `round number x 25`, so later, riskier rounds are worth substantially more.
- Total run score = sum of loot from every round completed so far in the current run. This total is entirely at risk until banked.
- A "Best Bank" high score is stored locally (localStorage) and only updates when a run is successfully banked (or completed at round 10) — busted runs never count toward the high score, reinforcing the risk/reward tension.

## Win / lose conditions
- **Bank (safe win)**: Player chooses to bank after any successful round; the run ends immediately with the accumulated score locked in.
- **Full clear (big win)**: Player successfully completes round 10 (the final, longest combination). The run auto-ends with the total loot doubled as a "master thief" bonus — this is the maximum-value outcome.
- **Bust (lose)**: Player enters a wrong pad, or the input timer runs out, at any point during a round. The entire run's unbanked total score is wiped to zero and the run ends. Previously banked scores from earlier completed runs (i.e., the stored Best Bank) are unaffected.

## Notes for visual polish
- Current styling is intentionally minimal/placeholder: dark gray body background (`#222`), plain monospace font, plain bordered boxes for the 4 pads, and a simple green (`#4a9`) shrinking div-based timer bar.
- Key elements for a future polish pass:
  - `#pads` (the 2x2 grid of `.pad` divs) — this is the main visual focus and would benefit the most from theming (vault dial / tumbler art, glow effects on `.active` and `.correct` states).
  - `#timerBarOuter` / `#timerBarInner` — currently a flat green bar; could become a tense "alarm meter" with color transitions (green to red) as time runs low.
  - `#progressDots` — currently plain filled/empty circle characters (`●`/`○`) showing input progress; could be restyled as glowing tumbler LEDs.
  - `#hud`, `#status`, `#decisionPanel`, `#endPanel` — plain text/button panels; could use vault/heist theming (e.g., "vault door" framing, alarm klaxon flash on bust, gold/loot styling on bank).
  - No animations currently beyond instant class toggles (`.active`, `.correct`) — a polish pass could add transitions/easing for pad flashes and panel changes.
  - Color palette used so far is purely functional placeholder (dark background, light text, one green accent) — free to redesign entirely.

## Visual Design

Restyled with a "safe-cracking heist" direction: a near-black warm charcoal background (`#0a0906`) with a subtle radial vignette, framed by a single dark brass-bordered card (`#14110c`/`#1c170f`) that reads like a vault door plaque. Accent palette is brass/gold (`#c9a227`, bright highlight `#f0d379`, dim border `#6b5a26`) for the primary UI and neutral state, with a muted olive/green (`#7dbf6e`) reserved for "safe/bank/correct" feedback and a deep alarm red (`#c0402c`, bright `#ff7a54`) reserved for "danger/bust/wrong" feedback — so color itself communicates risk state at a glance, reinforcing the push-your-luck tension.

Typography pairs a small-caps serif title (system Georgia/Times, gold gradient text) evoking an engraved brass plaque with a monospace body/HUD font (`ui-monospace`/`SF Mono`/Consolas) for the numeric readouts, giving a "mechanical lock/ledger" feel — both are system fonts, no network font loading.

The 4 pads became circular tumbler dials with an inset dark face and brass rim; the `.active` state glows bright gold with a scale-up, `.correct` glows green, and a new purely-cosmetic `.wrong` class flashes red on a bad tap (paired with a brief screen-shake on the card and a low buzzer tone) before the existing bust logic ends the run. The timer bar now shifts color from gold to amber to a pulsing red as time runs low (a `warn`/`danger` CSS class swap driven off the existing countdown percentage — no timing values changed), and the progress dots became small glowing brass LEDs. Panels (start/decision/end) get a soft fade-up entrance, and the end panel is tinted gold/green/red depending on whether the run was a full clear, a bank, or a bust. Added a few short WebAudio oscillator beeps (tumbler tick per flash, chime on success/bank, buzzer on bust, fanfare on full clear) with a small mute toggle, all optional/cosmetic and muteable, persisted via `localStorage`.

Inspiration direction: minimalist dark-mode heist/lock UIs using restrained brass/gold + near-black palettes with color-coded risk states (green=safe, red=danger), drawn from general safe-cracking/heist game UI conventions (see itch.io "Safe Cracker" style minigames and the Game UI Database's hacking/lockpicking UI collection) rather than any single copied design.

## Difficulty Tuning

Only pacing constants were adjusted (playback speed, input timer budget). Sequence length growth (`round + 2`), loot scaling (`round x 25`), the round-10 finish line, and all mechanics/visuals are unchanged.

**What changed:**
- Flash reveal speed per pad: `showDuration = max(220, 650 - round*35)` &rarr; `max(220, 700 - round*44)`.
- Gap between flashes: `gapDuration = max(120, 300 - round*15)` &rarr; `max(110, 320 - round*19)`.
- Input timer budget: `2000 + sequenceLength * 750` &rarr; `2500 + sequenceLength * 750`.

**Why:** the old curve was already a reasonable capped-linear ramp, but round 1 felt tighter than it needed to for a first-time player, and the reveal-speed floor was never actually reached within the 10-round session (so the ramp was pure linear, not tapering off toward round 10). Raising the base reveal duration and steepening its per-round slope keeps round 1 noticeably slower/easier to watch while making round 8-10 flash faster (more tension at the finish) than before &mdash; same floor, wider range, still a smooth capped-linear curve with no jumps. Raising the flat +750ms-per-tap timer's base term (2000 -> 2500) adds proportionally more slack to short early sequences (where the flat term dominates) and proportionally less to long late sequences (where the `750/tap` term dominates), which naturally produces "generous at the start, tighter at the end" without needing a separate formula.

**Resulting curve (per round, sequence length = round + 2):**

| Round | Seq. len | Flash on/gap (ms) | Timer budget (ms) | Time per tap (ms) |
|---|---|---|---|---|
| 1  | 3  | 656 / 301 | 4750  | 1583 |
| 2  | 4  | 612 / 282 | 5500  | 1375 |
| 3  | 5  | 568 / 263 | 6250  | 1250 |
| 5  | 7  | 480 / 225 | 7750  | 1107 |
| 8  | 10 | 348 / 168 | 10000 | 1000 |
| 10 | 12 | 260 / 130 | 11500 | 958  |

Both the reveal speed and the timer's floors (220ms flash, 110ms gap) are never actually reached within the 10-round session (the nearest floor hit would be round ~11), so the entire visible ramp stays purely smooth/linear from the first round to the forced round-10 finish - no plateaus, no jumps.

**Simulated session length (sanity check):** assuming a player uses about half of the offered input-timer budget each round plus ~2s to decide bank-vs-push, cumulative time to reach the round-10 finish line is roughly 1.7 minutes; a slow/cautious player using the full budget each round would take closer to 2.5-3 minutes, and a fast/confident player well under a minute. This keeps the "hard but fair" round-10 ceiling landing inside the intended 1-3 minute window for an average player, while the early rounds (short sequence, slow flash, ~1.4-1.6s per tap to respond) stay comfortably easy for someone still learning the pad layout.

## Assets

Promotional thumbnails were generated for this game and saved to `thumbnails/`:

| File               | Dimensions   | Intended web use                                                                 |
|---------------------|--------------|-----------------------------------------------------------------------------------|
| `thumb-small.png`  | 320 x 180 px | Compact rows in a games list / index page, sidebar links                          |
| `thumb-medium.png` | 640 x 360 px | Grid/card layout tiles on a games gallery page (the default "cover image")        |
| `thumb-large.png`  | 1280 x 720 px| Hero banner on the game's own page; also works directly as an Open Graph / Twitter Card social-preview image |

## Edit Log

- **2026-07-19**: Removed the redundant keyboard input path (number keys, arrow keys, Enter, and `C` shortcuts) since this game targets mobile browser play and every action already had a full click/tap control path via the pads and buttons. Updated the Controls section to describe only tap/click.
- **2026-07-19**: Replaced the 4 pads' leftover keyboard-hint labels ("1 / &larr;", "2 / &uarr;", "3 / &rarr;", "4 / &darr;") with distinct geometric symbols (&#9679; circle, &#9650; triangle, &#9632; square, &#9670; diamond), one per pad in the same left-to-right/top-to-bottom order, to fully remove the implied keyboard mapping now that keyboard input has been removed. Also bumped `.pad` font-size from 18px to 32px since the old size was tuned to fit two-token text and looked small for a single symbol. Updated the Controls bullet describing the pads to match.

These are original poster-style illustrations inspired by the game's safe-cracking heist concept and brass/gold palette, not screenshots of actual gameplay.
