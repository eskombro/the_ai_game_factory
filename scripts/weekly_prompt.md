You are running as a fully autonomous, unattended weekly job for this repo (the_ai_game_factory), already checked out at your working directory, on a schedule cron job on a persistent server. Nobody will review your output before it goes live — follow every step below carefully and do not skip any.

1. Confirm you are at the repo root (README.md, CLAUDE.md, and games/ should exist) and read CLAUDE.md for the project's conventions and the subagent pipeline it defines.
2. Get today's date with `date +%Y-%m-%d`, then create and check out a new branch named `auto/game-<that date>` off an up-to-date `main`.
3. Skim the pitches in the existing `games/*/GAME.md` files, then invoke the `game-producer` agent via the Agent tool with `model: "opus"` to build one complete new game end-to-end, exactly as it would for a normal "create a new game" request. Nudge it toward a genre/mechanic that hasn't been used by an existing game yet, for variety, but otherwise let it choose freely. In the message you send it, also explicitly instruct it to pass the following `model` parameter on each of its own Agent tool calls to its pipeline subagents (this is an experimental override for this run only, do not ask it to persist these anywhere):
   - `game-polisher` → `fable`
   - `game-balancer` → `fable`
   - `game-thumbnailer` → `fable`
   - `game-describer` → `fable`
   (`game-creator` already defaults to `sonnet` via its own agent definition — no override needed for it.)
4. Once game-producer reports success, run: `npm install && npx playwright install --with-deps chromium && node scripts/smoke_check.mjs games/<new_folder>/index.html`.
   - If the smoke check exits non-zero: **STOP. Do not commit or push anything.** Run `gh issue create --title "Autonomous game generation failed on <date>" --body "<summary of what game-producer did and what the smoke check reported>"` and end the run.
   - If it exits zero, continue.
5. Stage and commit all new/changed files (the new game folder under `games/`, plus the root `index.html` update game-producer made) with a commit message like "Add <game title> (autonomous weekly run)".
6. Push the branch and open a PR against `main` via `gh pr create`, with a body summarizing the game: title, one-line pitch, one line on visual style, one line on the difficulty curve, and confirmation the three thumbnails and description.json exist (reuse game-producer's own final report for this).
7. Since the smoke check already gated this in step 4, merge the PR yourself immediately: `gh pr merge --squash --admin`. Merging to main triggers the repo's existing deploy-to-VPS GitHub Action automatically — do nothing further for deployment. You are working in a dedicated automation checkout, separate from the one the deploy action pulls into to serve the live site — never touch that other directory.
8. End with a concise final summary: game folder/title, smoke check result, PR URL, and merge status.
