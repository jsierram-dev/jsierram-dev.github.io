import { Injectable, PLATFORM_ID, afterNextRender, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const STORAGE_KEY = 'portfolioAdmin';
const URL_PARAM = 'admin';

/**
 * Owner-only view switch, NOT access control: the site is static, so admin-only projects
 * still ship inside main.js — this only keeps them off the page for regular visitors.
 *
 * `?admin=1` stores the flag in localStorage, `?admin=0` clears it; either way the param is
 * removed from the URL. The flag is applied after the first render (not at construction)
 * so hydration always matches the prerendered HTML, which is built without it.
 */
@Injectable({ providedIn: 'root' })
export class AdminService {
  readonly isAdmin = signal(false);

  constructor() {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return;
    afterNextRender(() => this.isAdmin.set(this.readFlag()));
  }

  private readFlag(): boolean {
    try {
      const url = new URL(window.location.href);
      const param = url.searchParams.get(URL_PARAM);
      if (param !== null) {
        if (param === '1') localStorage.setItem(STORAGE_KEY, '1');
        else localStorage.removeItem(STORAGE_KEY);
        url.searchParams.delete(URL_PARAM);
        history.replaceState(history.state, '', url.pathname + url.search + url.hash);
      }
      return localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      // storage blocked — admin view simply stays off
      return false;
    }
  }
}
