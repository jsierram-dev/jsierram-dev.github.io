import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { LanguageService } from '../../core/language.service';
import { NavigationService } from '../../core/navigation.service';
import { TechIconComponent } from '../../shared/tech-icon/tech-icon';
import type { Project, StackLayer } from '../../data/content.model';

const LAYERS: StackLayer[] = ['fe', 'be', 'db', 'tp'];
type SortOrder = 'featured' | 'newest' | 'oldest';

@Component({
  selector: 'app-portfolio-panel',
  imports: [TechIconComponent],
  templateUrl: './portfolio-panel.html',
  styleUrl: './portfolio-panel.css',
})
export class PortfolioPanelComponent {
  private readonly lang = inject(LanguageService);
  private readonly nav = inject(NavigationService);

  protected readonly content = this.lang.content;
  protected readonly strings = this.lang.strings;
  protected readonly layers = LAYERS;

  protected readonly categoryState = signal<string>('__all__');
  protected readonly layerFilters = signal<Record<StackLayer, string>>({ fe: '', be: '', db: '', tp: '' });
  protected readonly sortOrder = signal<SortOrder>('featured');
  protected readonly openProjectKey = signal<string | null>(null);

  protected readonly categories = computed(() => {
    const cats = this.content().projects.map((p) => p.category);
    return ['__all__', ...Array.from(new Set(cats))];
  });

  protected readonly layerOptions = computed(() => {
    const projects = this.content().projects;
    const result = {} as Record<StackLayer, string[]>;
    for (const layer of LAYERS) {
      const values = projects.flatMap((p) => p.techs.filter((t) => t.layer === layer).map((t) => t.name));
      result[layer] = Array.from(new Set(values));
    }
    return result;
  });

  protected readonly filteredProjects = computed(() => {
    const category = this.categoryState();
    const filters = this.layerFilters();
    const sort = this.sortOrder();
    const list = this.content().projects.filter((p) => {
      if (category !== '__all__' && p.category !== category) return false;
      return LAYERS.every((layer) => {
        const chosen = filters[layer];
        return !chosen || p.techs.some((t) => t.layer === layer && t.name === chosen);
      });
    });
    return [...list].sort((a, b) => {
      if (sort === 'newest') return b.date.localeCompare(a.date);
      if (sort === 'oldest') return a.date.localeCompare(b.date);
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return b.date.localeCompare(a.date);
    });
  });

  protected readonly openProject = computed<Project | null>(() => {
    const key = this.openProjectKey();
    return key ? (this.content().projects.find((p) => p.key === key) ?? null) : null;
  });

  constructor() {
    // categorías/labels de capa son ellas mismas traducidas, una selección de filtro no
    // tiene sentido across un cambio de idioma — mismo motivo que buildPortfolioControls()
    // en el mockup, que se reconstruía completo en cada cambio de idioma. Un único effect
    // (no dos separados) para no depender del orden de ejecución entre "resetear" y
    // "aplicar un salto pendiente desde Resume -> Stack" cuando ambos podrían dispararse
    // juntos al recrearse el panel.
    //
    // nav.activeTab() se agregó como dependencia más (2026-08-08, pedido explícito del
    // usuario): al volver de una pestaña visitada, esa pestaña debe quedar en su estado
    // por defecto, no como se dejó la última vez (antes, con [hidden] persistiendo el
    // componente, un detalle de proyecto abierto seguía abierto al volver desde otra
    // pestaña). Se suma acá, en el MISMO effect, en vez de uno nuevo aparte, por la misma
    // razón que ya evitaba dos effects: si el usuario entra desde Resume→Stack, activeTab
    // Y portfolioFilterRequest cambian juntos en la misma función — un effect separado que
    // solo mirara activeTab podría correr y resetear el filtro ANTES o DESPUÉS del que
    // aplica la solicitud pendiente, según el orden, pisándolo. Con un solo effect no hay
    // ambigüedad de orden posible.
    effect(() => {
      this.content(); // dependencia: re-correr en cada cambio de idioma
      this.nav.activeTab(); // dependencia: re-correr también al entrar/salir de esta pestaña
      // untracked: este mismo effect limpia la solicitud más abajo; si fuera dependencia, esa
      // escritura lo volvía a disparar y el segundo pase (ya con null) borraba el filtro recién
      // aplicado. No hace falta como disparador: goToPortfolioFilteredBy() cambia activeTab.
      const request = untracked(() => this.nav.portfolioFilterRequest());
      this.categoryState.set('__all__');
      this.layerFilters.set(
        request ? { fe: '', be: '', db: '', tp: '', [request.layer]: request.tech } : { fe: '', be: '', db: '', tp: '' }
      );
      this.sortOrder.set('featured');
      this.openProjectKey.set(null);
      if (request) this.nav.portfolioFilterRequest.set(null);
    });
  }

  setCategory(cat: string): void {
    this.categoryState.set(cat);
  }

  setLayerFilter(layer: StackLayer, value: string): void {
    this.layerFilters.update((f) => ({ ...f, [layer]: value }));
  }

  /** Native <select> never fires 'change' when the user re-picks the option that's already
   *  selected (no value transition from the browser's point of view) — blanking the value
   *  here, right before the native dropdown opens, forces a real transition on re-pick, so
   *  onLayerChange() below can detect "picked the same tech again" and treat it as deselect
   *  (pedido explícito 2026-10-07: click en una tech ya activa quita el filtro, en vez de
   *  tener que elegir manualmente la opción en blanco de esa capa, ej. "Services"). */
  onLayerMouseDown(layer: StackLayer, event: Event): void {
    const select = event.target as HTMLSelectElement;
    if (this.layerFilters()[layer]) select.value = '';
  }

  /** If the blanking above opened the dropdown but the user closed it without picking
   *  anything (Escape, click outside), 'change' never fires — restore the real value so the
   *  select doesn't visually show "no filter" while the previous filter is still applied. */
  onLayerBlur(layer: StackLayer, event: Event): void {
    (event.target as HTMLSelectElement).value = this.layerFilters()[layer];
  }

  onLayerChange(layer: StackLayer, event: Event): void {
    const newValue = (event.target as HTMLSelectElement).value;
    const current = this.layerFilters()[layer];
    this.setLayerFilter(layer, newValue !== '' && newValue === current ? '' : newValue);
  }

  setSortOrder(value: SortOrder): void {
    this.sortOrder.set(value);
  }

  onSortChange(event: Event): void {
    this.setSortOrder((event.target as HTMLSelectElement).value as SortOrder);
  }

  /** Primer tech "primary" de esa capa, o si no hay ninguno marcado, el primero que
   *  aparezca — mismo criterio que primaryTech() en el mockup. */
  primaryTech(project: Project, layer: StackLayer): string | null {
    const hit = project.techs.find((t) => t.layer === layer && t.primary) ?? project.techs.find((t) => t.layer === layer);
    return hit ? hit.name : null;
  }

  openDetail(key: string): void {
    this.openProjectKey.set(key);
  }

  closeDetail(): void {
    this.openProjectKey.set(null);
  }
}
