# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A collection of original browser games, prototyped as self-contained HTML files and organized by creation date. There is no build system, package manager, or test suite — each game is a single `index.html` (inline CSS + JS, zero dependencies, zero external/CDN calls) that runs by opening it directly in a browser.

## Commands

- Run/preview a game: `open games/<folder>/index.html` (macOS) — no dev server or build step needed.
- List existing games (for name-collision checks before creating a new one): `ls games/`
- Get today's date for a new folder name: `date +%Y_%m_%d`

There is no lint, build, or test command — verification is done by reading the JS for bugs and opening the file in a browser.

## Architecture

### Directory layout

- `games/YYYY_MM_DD_game_title/` — one dated, snake_case-titled folder per game
  - `index.html` — the entire playable game (HTML, CSS, JS inlined together)
  - `GAME.md` — design doc: pitch, original twist, controls, core mechanics, win/lose conditions, plus notes left by each pipeline stage for the next one

Never modify or overwrite an existing game folder when creating a new game — always create a fresh dated folder.

### The subagent pipeline

Games are produced by a fixed pipeline of specialist subagents defined in `.claude/agents/`, orchestrated by `game-producer`. Each stage edits the output of the one before it, strictly in order, never in parallel:

1. **`game-creator`** — invents the concept and builds the initial prototype: game engine only (input, game loop, collision/logic, scoring, win/lose/restart). Styling is bare-minimum/legible only; visual design is explicitly out of scope here. Writes the first version of `GAME.md`. **All new games must be playable on a mobile phone browser using touch input only** — no control scheme may require a keyboard or a mouse (no keydown/keyup-only actions, no hover-dependent affordances).
2. **`game-polisher`** — restyles the HTML (palette, typography, layout, light animation/"juice") without touching mechanics. Appends a Visual Design section to `GAME.md`.
3. **`game-balancer`** — tunes pacing/ramp constants (speeds, spawn rates, timers, thresholds) so difficulty starts easy and escalates smoothly over a short session, without touching mechanics or visuals. Appends a Difficulty Tuning section to `GAME.md`.
4. **`game-thumbnailer`** — generates original poster-style artwork for the finished game as three fixed PNG sizes under `<folder_name>/thumbnails/`. Never touches game code/visuals, only adds the thumbnails folder plus a short Assets note in `GAME.md`.
5. **`game-describer`** — reads the finished `GAME.md` and `index.html` and writes a short (max 70 words each) English/Spanish/French description to `<folder_name>/description.json`, used to populate the landing page's language dropdown.

After all five stages, `game-producer` itself (not a subagent) adds the game to the root `./index.html` landing page — a new `<li>` plus matching entries in that page's `translations` object — and resyncs the description text of any other already-listed game whose `description.json` has since changed. `game-producer` blocks on each stage's result before starting the next (via `run_in_background: false`), captures what changed at each step, does a light sanity pass afterward, and reports one final summary. If a stage reports an unresolved bug, the pipeline stops rather than letting a later stage build on a broken foundation.

### When to use which agent

- Full new game, finished and playable: `game-producer` (drives all five stages plus the site listing).
- Only the raw mechanics/prototype: `game-creator` directly.
- Visual-only touch-up on an existing game: `game-polisher` directly.
- Difficulty/pacing-only touch-up on an existing game: `game-balancer` directly.
- Regenerate promotional thumbnails only: `game-thumbnailer` directly.
- Regenerate the localized description only: `game-describer` directly.
- A precisely scoped, one-off edit to an existing game (bug fix, a specific visual/logic/gameplay change) that isn't a full visual/balance pass: `game-editor` directly.

Don't hand touch-up requests on an already-existing game to `game-producer` — that re-runs the whole pipeline; go directly to the single relevant stage agent instead.
