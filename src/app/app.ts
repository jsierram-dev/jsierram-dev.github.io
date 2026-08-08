import { Component, inject } from '@angular/core';
import { LanguageService } from './core/language.service';
import { NavigationService } from './core/navigation.service';
import { SidebarComponent } from './sidebar/sidebar';
import { AboutPanelComponent } from './panels/about-panel/about-panel';
import { ResumePanelComponent } from './panels/resume-panel/resume-panel';
import { PortfolioPanelComponent } from './panels/portfolio-panel/portfolio-panel';
import { CvPanelComponent } from './panels/cv-panel/cv-panel';

/**
 * Root shell: sidebar + a tabstrip-driven "panel" switcher, no Angular Router. Deliberate
 * (see ROADMAP-portfolio.md, Arquitectura): a single page with state-based panels sidesteps
 * GitHub Pages' classic SPA 404-on-refresh problem entirely, since there's only ever one URL.
 *
 * `data-active-tab` on the host mirrors the mockup's own mechanism: on mobile, .sidebar
 * (a child component's host element) only renders when the active tab is "about" — see
 * app.css's mobile media query for the rule that reads this attribute.
 */
@Component({
  selector: 'app-root',
  imports: [SidebarComponent, AboutPanelComponent, ResumePanelComponent, PortfolioPanelComponent, CvPanelComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
  host: { '[attr.data-active-tab]': 'nav.activeTab()' },
})
export class App {
  protected readonly lang = inject(LanguageService);
  protected readonly nav = inject(NavigationService);
}
