# Game Spring

A collection of original browser games, prototyped as self-contained HTML files and organized by creation date.

# Main features and functionalities

- Each game is a single-page, self-contained HTML file — no build step, no dependencies, just open it in a browser
- Every game is designed mobile-first: controls are touch-only (tap/swipe/drag/hold), no keyboard or mouse required
- Every game ships with a companion design doc describing its pitch, controls, core mechanics, and win/lose conditions
- Games are built through a staged pipeline — mechanics first, then visual polish, then difficulty tuning — each stage recorded as its own section in the game's design doc
- New games get promotional thumbnails and a listing on the root landing page, so the collection is directly browsable/playable from `index.html`
- New games are added as dated folders, so the collection doubles as a timeline of prototypes

# Main parts of the project

- `index.html` — the landing page listing every published game with its thumbnail, title, and pitch
- `games/` — one subfolder per game, named `YYYY_MM_DD_game_title`
  - `index.html` — the playable game (HTML, CSS, and JS in one file)
  - `GAME.md` — the design doc: pitch, controls, mechanics, win/lose conditions, plus sections appended by each pipeline stage (visual design, difficulty tuning, edit log, assets)
  - `thumbnails/` — promotional artwork for the landing page and social previews (small/medium/large PNGs)
- `.claude/agents/` — the specialist subagents that build and maintain games: `game-producer` (orchestrates the full pipeline), `game-creator` (mechanics/prototype), `game-polisher` (visual design), `game-balancer` (difficulty pacing), `game-thumbnailer` (promotional art), and `game-editor` (scoped one-off edits to an existing game, outside the creation pipeline)
- `CLAUDE.md` — project-level instructions for Claude Code, describing the pipeline and repo conventions in detail
