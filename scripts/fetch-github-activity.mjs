// Fetches real GitHub contribution data at build time and bakes it into
// src/app/data/github-activity.json, which sidebar.ts imports directly (same
// resolveJsonModule pattern as content.en.json). Replaces the old client-only
// Math.random() heatmap — see the removed comment in sidebar.ts for why that
// existed (afterNextRender never runs during prerender, so fake data was the
// only way to avoid baking randomness into the static HTML). Real data has no
// such problem: it's safe to prerender directly.
//
// No GitHub token needed and none should ever be added here: github.com/users/
// <login>/contributions is the same public, unauthenticated HTML fragment
// GitHub's own profile page fetches to render your contribution graph to any
// visitor — no GraphQL API / personal access token required, unlike most
// "GitHub contribution widget" tutorials assume.
//
// Run manually (`npm run fetch:github`) or from CI before `ng build`. Never
// fails the build: on any error it leaves the existing committed JSON alone
// so a stale-but-real snapshot ships instead of breaking the build entirely.

import { JSDOM } from 'jsdom';
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const GITHUB_LOGIN = 'jsierram-dev';
const WEEKS_TO_KEEP = 18; // matches GITHUB_WEEKS in sidebar.ts — a recent slice, not the full year
const OUT_PATH = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src/app/data/github-activity.json');

async function main() {
  const res = await fetch(`https://github.com/users/${GITHUB_LOGIN}/contributions`);
  if (!res.ok) throw new Error(`GitHub returned ${res.status}`);
  const html = await res.text();

  const dom = new JSDOM(html);
  const doc = dom.window.document;

  const totalHeading = doc.querySelector('#js-contribution-activity-description');
  const totalMatch = totalHeading?.textContent.match(/([\d,]+)\s*contributions?/i);
  if (!totalMatch) throw new Error('could not find the contribution total on the page');
  const total = parseInt(totalMatch[1].replace(/,/g, ''), 10);

  const cells = Array.from(doc.querySelectorAll('td.ContributionCalendar-day[data-date]'));
  if (cells.length === 0) throw new Error('no contribution day cells found on the page');

  /** @type {Map<string, number[]>} weekStartISO ("YYYY-MM-DD", the Sunday) -> levels[7] */
  const weekMap = new Map();
  for (const cell of cells) {
    const dateStr = cell.getAttribute('data-date');
    const level = parseInt(cell.getAttribute('data-level') ?? '0', 10);
    const date = new Date(`${dateStr}T00:00:00Z`);
    const dayOfWeek = date.getUTCDay(); // 0 = Sunday, matches sidebar.ts's day-0/day-6 weekend check
    const weekStart = new Date(date);
    weekStart.setUTCDate(date.getUTCDate() - dayOfWeek);
    const key = weekStart.toISOString().slice(0, 10);
    if (!weekMap.has(key)) weekMap.set(key, new Array(7).fill(0));
    weekMap.get(key)[dayOfWeek] = level;
  }

  const weeks = Array.from(weekMap.keys())
    .sort()
    .map((key) => weekMap.get(key))
    .slice(-WEEKS_TO_KEEP);

  writeFileSync(OUT_PATH, JSON.stringify({ total, weeks }, null, 2) + '\n');
  console.log(`Wrote ${OUT_PATH}: total=${total}, weeks=${weeks.length}`);
}

main().catch((err) => {
  console.warn('fetch-github-activity: could not refresh real data, leaving existing file as-is.');
  console.warn(err.message);
  if (!existsSync(OUT_PATH)) {
    // first run ever, nothing committed yet — write an honest all-zero grid rather than fail the build
    writeFileSync(OUT_PATH, JSON.stringify({ total: 0, weeks: Array.from({ length: WEEKS_TO_KEEP }, () => new Array(7).fill(0)) }, null, 2) + '\n');
  }
});
