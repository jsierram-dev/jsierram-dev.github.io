import { Component, computed, effect, inject, signal } from '@angular/core';
import { LanguageService } from '../../core/language.service';
import { NavigationService } from '../../core/navigation.service';
import { TechIconComponent } from '../../shared/tech-icon/tech-icon';
import type { StackLayer } from '../../data/content.model';

type TimelineKey = 'experience' | 'education' | 'certifications';
const LIST_LIMIT = 2;

interface TimelineRow {
  dateText: string;
  titleText: string;
  link: string | null;
  desc: string | null;
  techs: string[];
}

interface StackRow {
  name: string;
  layer: StackLayer;
  count: number;
}

/**
 * experience/education/certifications currently render as empty (see content.*.json — no
 * fabricated career history, that gap is real and tracked in ROADMAP-portfolio.md). Each
 * section is built to hide itself entirely rather than show an empty heading over nothing,
 * so the panel doesn't read as broken while that content is still missing — the moment real
 * entries are added to the JSON, the section (dotted timeline, "show more", date range in
 * the heading) appears with zero further code changes.
 */
@Component({
  selector: 'app-resume-panel',
  imports: [TechIconComponent],
  templateUrl: './resume-panel.html',
  styleUrl: './resume-panel.css',
})
export class ResumePanelComponent {
  private readonly lang = inject(LanguageService);
  private readonly nav = inject(NavigationService);

  protected readonly content = this.lang.content;
  protected readonly strings = this.lang.strings;

  protected readonly timelineKeys: TimelineKey[] = ['experience', 'education', 'certifications'];

  protected readonly expanded = signal<Record<TimelineKey, boolean>>({
    experience: false,
    education: false,
    certifications: false,
  });

  constructor() {
    // al volver a esta pestaña después de haber estado en otra, "ver más" arranca
    // colapsado de nuevo — mismo pedido explícito del usuario que el reset del detalle
    // de proyecto en Portfolio (ver el effect equivalente ahí para el razonamiento
    // completo). Sin estado propio que dependa de un pedido externo (a diferencia de
    // Portfolio con portfolioFilterRequest), acá alcanza con un effect simple.
    effect(() => {
      this.nav.activeTab();
      this.expanded.set({ experience: false, education: false, certifications: false });
    });
  }

  protected readonly experienceRows = computed<TimelineRow[]>(() =>
    this.content().experience.map((e) => ({
      dateText: `${e.startMonth} ${e.startYear} – ${e.current ? this.strings().present : `${e.endMonth ?? ''} ${e.endYear}`}`,
      titleText: `${e.role} · ${e.company}`,
      link: e.link || null,
      desc: e.desc || null,
      techs: e.techs,
    }))
  );

  protected readonly educationRows = computed<TimelineRow[]>(() =>
    this.content().education.map((e) => ({
      dateText: `${e.month} ${e.year}`,
      titleText: `${e.title} · ${e.org}`,
      link: null,
      desc: e.desc || null,
      techs: e.techs,
    }))
  );

  protected readonly certificationRows = computed<TimelineRow[]>(() =>
    this.content().certifications.map((c) => ({
      dateText: c.year,
      titleText: `${c.name} · ${c.issuer}`,
      link: c.url || null,
      desc: null,
      techs: [],
    }))
  );

  protected readonly stackRows = computed<StackRow[]>(() => {
    const counts = new Map<string, StackRow>();
    for (const project of this.content().projects) {
      for (const tech of project.techs) {
        const existing = counts.get(tech.name);
        if (existing) existing.count++;
        else counts.set(tech.name, { name: tech.name, layer: tech.layer, count: 1 });
      }
    }
    return Array.from(counts.values()).sort((a, b) => b.count - a.count);
  });

  visibleRows(key: TimelineKey): TimelineRow[] {
    const rows = this.rowsFor(key);
    return this.expanded()[key] ? rows : rows.slice(0, LIST_LIMIT);
  }

  hiddenCount(key: TimelineKey): number {
    return Math.max(0, this.rowsFor(key).length - LIST_LIMIT);
  }

  isExpanded(key: TimelineKey): boolean {
    return this.expanded()[key];
  }

  toggle(key: TimelineKey): void {
    this.expanded.update((e) => ({ ...e, [key]: !e[key] }));
  }

  /** Encabezado "# EXPERIENCE 2026 – 2018" — año más reciente y más antiguo de TODA la
   *  lista (no solo la parte visible), a partir del propio dateText (el año son los
   *  últimos 4 caracteres siempre, tanto "JAN 2024 – PRESENT" como "2023" a secas). */
  yearRange(key: TimelineKey): string {
    const rows = this.rowsFor(key);
    if (rows.length === 0) return '';
    const firstYear = rows[0].dateText.slice(-4);
    const lastYear = rows[rows.length - 1].dateText.slice(-4);
    return firstYear === lastYear ? firstYear : `${firstYear} – ${lastYear}`;
  }

  rowsFor(key: TimelineKey): TimelineRow[] {
    if (key === 'experience') return this.experienceRows();
    if (key === 'education') return this.educationRows();
    return this.certificationRows();
  }

  goToStack(name: string, layer: StackLayer): void {
    this.nav.goToPortfolioFilteredBy(name, layer);
  }
}
