import { Injectable, PLATFORM_ID, computed, effect, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import contentEn from '../data/content.en.json';
import contentEs from '../data/content.es.json';
import stringsEn from '../data/strings.en.json';
import stringsEs from '../data/strings.es.json';
import type { Content } from '../data/content.model';
import type { Strings } from '../data/strings.model';

export type Lang = 'en' | 'es';

const CONTENT: Record<Lang, Content> = { en: contentEn as Content, es: contentEs as Content };
const STRINGS: Record<Lang, Strings> = { en: stringsEn as Strings, es: stringsEs as Strings };
const STORAGE_KEY = 'portfolioLang';

/**
 * Client-side language toggle, not a separate build per language (see
 * ROADMAP-portfolio.md "Idioma / i18n" for the full reasoning: both languages are
 * already in the prerendered bundle, switching is just swapping which object feeds
 * the render, no request/reload involved). Default is always English — a returning
 * visitor's own choice is restored from localStorage, but the prerendered HTML
 * itself can only bake in one default, and that default is English on purpose.
 *
 * Guarded for the server/prerender pass (isPlatformBrowser): `localStorage` and
 * `document` don't exist while Angular renders each route to static HTML at build
 * time. Reading a saved preference and touching `document.documentElement.lang`
 * only happen in the browser, after hydration — same class of guard the mockup
 * needed for `localStorage` (there: blocked storage/private mode; here: no
 * storage/DOM at all during prerender), just a different reason.
 */
@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly currentLang = signal<Lang>(this.readInitialLang());

  readonly content = computed<Content>(() => CONTENT[this.currentLang()]);
  readonly strings = computed<Strings>(() => STRINGS[this.currentLang()]);

  constructor() {
    effect(() => {
      const lang = this.currentLang();
      if (!this.isBrowser) return;
      document.documentElement.lang = lang;
      try {
        localStorage.setItem(STORAGE_KEY, lang);
      } catch {
        // storage blocked (private mode / policy) — language still works for this
        // visit via the signal, it just won't be remembered next time
      }
    });
  }

  setLang(lang: Lang): void {
    if (lang !== 'en' && lang !== 'es') return;
    this.currentLang.set(lang);
  }

  private readInitialLang(): Lang {
    if (!this.isBrowser) return 'en';
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'en' || saved === 'es') return saved;
    } catch {
      // storage blocked — fall through to the default below
    }
    return 'en';
  }
}
