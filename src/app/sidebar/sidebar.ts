import { Component, DestroyRef, afterNextRender, computed, inject, signal } from '@angular/core';
import { LanguageService } from '../core/language.service';

interface GithubCell {
  /** 0–4, drives the fill color the same way GitHub's own heatmap reads at a glance. */
  level: number;
}

// Not the real user's tech stack list, just the 3 highlights shown as sidebar chips — same
// 3 the design mockup used. Deliberately not derived from profile.cv.skills: those are full
// comma-separated lists ("Angular, HTML5, CSS3"), this is a short, curated "at a glance" set.
const SIDEBAR_STACK_HIGHLIGHTS = ['Angular', 'Node', 'PostgreSQL'];

const GITHUB_WEEKS = 18;
const GITHUB_DAYS = 7;
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

  /** Empty on the server and on the client's first paint, same reasoning as localTime — the
   *  illustrative random heatmap is filled in client-side only, once. The real build should
   *  replace this generator entirely with real contribution data fetched at build time via
   *  GitHub's GraphQL API (see ROADMAP-portfolio.md, "Investigación..."), baked into the
   *  prerendered HTML directly — at that point this whole client-only guard goes away, since
   *  real data is safe to render on the server too. */
  protected readonly githubGrid = signal<GithubCell[][]>([]);
  protected readonly githubTotal = signal(0);

  protected readonly githubActivityLabel = computed(() =>
    this.strings().githubActivityLabel.replace('{n}', String(this.githubTotal()))
  );

  constructor() {
    const destroyRef = inject(DestroyRef);

    // afterNextRender only ever runs in the browser, never during the server/prerender pass
    // (see Angular docs) — exactly the guarantee needed here: Math.random()/Date/setInterval
    // must never run at build time, or the "random" heatmap and the clock would get baked
    // into the static HTML as if they were real, unchanging content.
    afterNextRender(() => {
      this.githubGrid.set(this.buildIllustrativeGithubGrid());
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

  private buildIllustrativeGithubGrid(): GithubCell[][] {
    let total = 0;
    const grid: GithubCell[][] = Array.from({ length: GITHUB_WEEKS }, (_, w) =>
      Array.from({ length: GITHUB_DAYS }, (_, day) => {
        const isWeekend = day === 0 || day === 6;
        // slightly busier in more recent weeks (higher w = more recent, grid reads left-to-right)
        const chance = (isWeekend ? 0.25 : 0.55) + (w / GITHUB_WEEKS) * 0.2;
        let level = 0;
        if (Math.random() < chance) {
          level = 1 + Math.floor(Math.random() * 4);
          total += level;
        }
        return { level };
      })
    );
    this.githubTotal.set(total);
    return grid;
  }
}
