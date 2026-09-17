import { Component, DestroyRef, afterNextRender, computed, inject, signal } from '@angular/core';
import { LanguageService } from '../core/language.service';
import githubActivity from '../data/github-activity.json';

interface GithubCell {
  /** 0–4, drives the fill color the same way GitHub's own heatmap reads at a glance. */
  level: number;
}

// Not the real user's tech stack list, just the 3 highlights shown as sidebar chips — same
// 3 the design mockup used. Deliberately not derived from profile.cv.skills: those are full
// comma-separated lists ("Angular, HTML5, CSS3"), this is a short, curated "at a glance" set.
const SIDEBAR_STACK_HIGHLIGHTS = ['Angular', 'Node', 'PostgreSQL'];

// 5 discrete levels (0 = no activity) instead of a computed opacity — matches how GitHub's
// own contribution graph reads (a handful of clearly distinct shades, not a smooth gradient).
const GITHUB_LEVEL_COLORS = [
  'rgba(127,163,122,0.08)',
  'rgba(127,163,122,0.35)',
  'rgba(127,163,122,0.55)',
  'rgba(127,163,122,0.78)',
  '#7fa37a',
];

/**
 * Real user data (avatar/name/role, availability, stack highlights, location, contact) is all
 * static/known and safe to prerender as-is. Two exceptions that need real care because this app
 * (unlike the design mockup, which only ever ran in one browser) also renders on the server at
 * build time — see each one below.
 */
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class SidebarComponent {
  protected readonly lang = inject(LanguageService);
  protected readonly content = computed(() => this.lang.content().profile);
  protected readonly strings = this.lang.strings;
  protected readonly stackHighlights = SIDEBAR_STACK_HIGHLIGHTS;
  protected readonly levelColors = GITHUB_LEVEL_COLORS;

  /** Placeholder ("--:--") matches what the server also renders — the real time is filled in
   *  client-side only (see below), so there's nothing for hydration to disagree about. */
  protected readonly localTime = signal('--:--');

  /** Real contribution data, fetched at build time by scripts/fetch-github-activity.mjs from
   *  GitHub's own public (no token needed) contribution-graph page and baked into
   *  data/github-activity.json — safe to prerender directly, unlike the old client-only
   *  Math.random() heatmap this replaced (afterNextRender never runs during prerender, so
   *  fake data used to be the only way to avoid baking randomness into the static HTML). */
  protected readonly githubGrid: GithubCell[][] = githubActivity.weeks.map((week) => week.map((level) => ({ level })));
  protected readonly githubTotal = githubActivity.total;

  protected readonly githubActivityLabel = computed(() =>
    this.strings().githubActivityLabel.replace('{n}', String(this.githubTotal))
  );

  constructor() {
    const destroyRef = inject(DestroyRef);

    // afterNextRender only ever runs in the browser, never during the server/prerender pass
    // (see Angular docs) — exactly the guarantee needed here: Date/setInterval must never run
    // at build time, or the clock would get baked into the static HTML as if it were real,
    // unchanging content.
    afterNextRender(() => {
      this.updateLocalTime();
      const id = setInterval(() => this.updateLocalTime(), 30_000);
      destroyRef.onDestroy(() => clearInterval(id));
    });
  }

  private updateLocalTime(): void {
    const timezone = this.content().timezone;
    this.localTime.set(
      new Intl.DateTimeFormat('en-GB', { timeZone: timezone, hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date())
    );
  }
}
