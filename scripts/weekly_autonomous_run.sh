#!/usr/bin/env bash
# Cron entrypoint for the weekly autonomous game-generation run.
# Runs Claude Code headlessly against a *dedicated* checkout of this repo
# (kept separate from the checkout the deploy workflow serves the live site
# from, to avoid the two processes touching the same working tree).
#
# Expected to be invoked from cron as:
#   0 6 * * 0 /path/to/this-checkout/scripts/weekly_autonomous_run.sh >> /path/to/logs/weekly_run.log 2>&1
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_DIR"

echo "===== weekly_autonomous_run.sh starting at $(date -u +%Y-%m-%dT%H:%M:%SZ) ====="

git checkout main
git pull origin main

claude -p "$(cat scripts/weekly_prompt.md)" --dangerously-skip-permissions

echo "===== weekly_autonomous_run.sh finished at $(date -u +%Y-%m-%dT%H:%M:%SZ) ====="
