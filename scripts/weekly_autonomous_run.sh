#!/usr/bin/env bash
# Cron entrypoint for the weekly autonomous game-generation run.
# Runs Claude Code headlessly against a *dedicated* checkout of this repo
# (kept separate from the checkout the deploy workflow serves the live site
# from, to avoid the two processes touching the same working tree).
#
# Expected to be invoked from cron as:
#   0 6 * * 0 /path/to/this-checkout/scripts/weekly_autonomous_run.sh >> /path/to/logs/weekly_run.log 2>&1
set -euo pipefail

# cron runs with a minimal PATH and doesn't source ~/.bashrc, so neither
# nvm-managed node/npm/claude nor manually-installed binaries (e.g. gh in
# ~/bin) are found by default. Load both explicitly.
export PATH="$HOME/bin:$HOME/.npm-global/bin:/usr/local/bin:$PATH"

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use default > /dev/null

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_DIR"

# Fine-grained pipeline progress checkpoints, written directly to disk by
# game-producer (and the top-level run) as each stage starts/finishes.
# Deliberately kept OUTSIDE the repo (a sibling of REPO_DIR) so it can never
# get picked up by the pipeline's own `git add`/commit step. This is separate
# from stdout/weekly_run.log because nested Agent-tool calls (game-producer,
# and its own subagents) don't stream their internal progress back to this
# script's stdout in real time -- only their final result does, once they
# return. If a run gets killed mid-pipeline (e.g. hitting a usage limit),
# this file is what tells you how far it actually got.
export PIPELINE_LOG="$(dirname "$REPO_DIR")/pipeline_checkpoints.log"

echo "===== weekly_autonomous_run.sh starting at $(date -u +%Y-%m-%dT%H:%M:%SZ) =====" | tee -a "$PIPELINE_LOG"

git checkout main
git pull origin main

claude -p "$(cat scripts/weekly_prompt.md)" --dangerously-skip-permissions --verbose

echo "===== weekly_autonomous_run.sh finished at $(date -u +%Y-%m-%dT%H:%M:%SZ) =====" | tee -a "$PIPELINE_LOG"
