#!/usr/bin/env node
// Deterministic, headless-safe QA gate for the autonomous game-generation routine.
// Loads a game's index.html in a headless browser and fails on anything that would
// mean the game is broken on arrival: console errors, uncaught exceptions, an outgoing
// network request (games must be zero-dependency/self-contained), or an empty page.
//
// Usage: node scripts/smoke_check.mjs <path-to-game-index.html>

import { chromium } from 'playwright';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const target = process.argv[2];

if (!target) {
  console.error('Usage: node scripts/smoke_check.mjs <path-to-game-index.html>');
  process.exit(1);
}

const absPath = resolve(target);

if (!existsSync(absPath)) {
  console.error(`smoke_check: file not found: ${absPath}`);
  process.exit(1);
}

const failures = [];

const browser = await chromium.launch();
const page = await browser.newPage();

page.on('console', (msg) => {
  if (msg.type() === 'error') {
    failures.push(`console.error: ${msg.text()}`);
  }
});

page.on('pageerror', (err) => {
  failures.push(`uncaught exception: ${err.message}`);
});

page.on('request', (req) => {
  if (!req.url().startsWith('file://') && !req.url().startsWith('data:')) {
    failures.push(`outgoing network request (games must be self-contained): ${req.url()}`);
  }
});

try {
  await page.goto(pathToFileURL(absPath).href, { waitUntil: 'load', timeout: 10000 });
  // give async init code (rAF loops, timers, touch-listener setup) a moment to run/throw
  await page.waitForTimeout(1000);

  const title = await page.title();
  const bodyText = await page.evaluate(() => document.body?.innerText?.trim() ?? '');
  const bodyHasContent = await page.evaluate(
    () => (document.body?.children?.length ?? 0) > 0
  );

  if (!title) failures.push('document has no <title>');
  if (!bodyHasContent && !bodyText) failures.push('document body is empty');
} catch (err) {
  failures.push(`page failed to load: ${err.message}`);
} finally {
  await browser.close();
}

if (failures.length > 0) {
  console.error(`smoke_check FAILED for ${target}:`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log(`smoke_check PASSED for ${target}`);
process.exit(0);
