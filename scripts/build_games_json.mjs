#!/usr/bin/env node
// Rebuilds the full game list as JSON from games/*/, for syncing into the
// Cloudflare Worker's KV store (see cloudflare/worker.js). The repo is the
// source of truth; this script is the only place that derives the list from
// it, so game-producer no longer needs to hand-edit index.html per game.
//
// Usage: node scripts/build_games_json.mjs > games.json

import { readdirSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";

const gamesDir = path.join(process.cwd(), "games");

const FOLDER_RE = /^(\d{4})_(\d{2})_(\d{2})_(.+)$/;

const games = readdirSync(gamesDir)
  .filter((folder) => existsSync(path.join(gamesDir, folder, "index.html")))
  .map((folder) => {
    const match = folder.match(FOLDER_RE);
    if (!match) {
      throw new Error(`Folder "${folder}" doesn't match the YYYY_MM_DD_slug convention`);
    }
    const [, year, month, day, slug] = match;
    const date = `${year}-${month}-${day}`;

    const gameMd = readFileSync(path.join(gamesDir, folder, "GAME.md"), "utf8");
    const titleMatch = gameMd.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1].trim() : slug;

    const descPath = path.join(gamesDir, folder, "description.json");
    const description = existsSync(descPath)
      ? JSON.parse(readFileSync(descPath, "utf8"))
      : { en: "", es: "", fr: "" };

    return {
      slug,
      folder,
      title,
      date,
      path: `games/${folder}/index.html`,
      thumbnail: `games/${folder}/thumbnails/thumb-small.png`,
      description,
    };
  })
  .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

process.stdout.write(JSON.stringify(games));
