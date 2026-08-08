import { Injectable, signal } from '@angular/core';
import type { StackLayer } from '../data/content.model';

export type TabKey = 'about' | 'resume' | 'portfolio' | 'cv';

export interface PortfolioFilterRequest {
  tech: string;
  layer: StackLayer;
}

/**
 * Shared tab state + the one cross-panel jump the site needs: clicking a Stack row
 * in Resume switches to Portfolio pre-filtered to that exact technology (mirrors
 * `goToPortfolioFilteredBy()` in the design mockup). A small shared service instead
 * of prop-drilling or a ViewChild reach-into-child-component call — Resume doesn't
 * need to know Portfolio exists, it just states an intent.
 */
@Injectable({ providedIn: 'root' })
export class NavigationService {
  readonly activeTab = signal<TabKey>('about');

  /** Consumed (and cleared) by the Portfolio panel once it applies the filter — so
   *  it doesn't reapply the same filter every time the tab is revisited afterward. */
  readonly portfolioFilterRequest = signal<PortfolioFilterRequest | null>(null);

  goTo(tab: TabKey): void {
    this.activeTab.set(tab);
  }

  goToPortfolioFilteredBy(tech: string, layer: StackLayer): void {
    this.portfolioFilterRequest.set({ tech, layer });
    this.activeTab.set('portfolio');
  }
}
