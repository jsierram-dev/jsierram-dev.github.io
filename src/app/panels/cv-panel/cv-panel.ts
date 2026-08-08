import { Component, computed, inject } from '@angular/core';
import { LanguageService } from '../../core/language.service';
import type { ExperienceEntry } from '../../data/content.model';

/**
 * El documento se arma con el mismo content.<lang>.json que Resume/Portfolio — sin fuente de
 * datos aparte (ver ROADMAP-portfolio.md "CV: contenido y PDF"). Cada sección se oculta por
 * completo si no hay datos todavía (mismo patrón que Resume: experience/education/certifications
 * siguen vacíos, gap real sin rellenar con contenido inventado), en vez de mostrar un
 * encabezado sobre nada.
 *
 * Botón "Download PDF": apunta a /cv-{lang}.pdf — carpeta `public/`, servida en la raíz (no
 * `assets/`, la mención en el roadmap quedó desactualizada de antes de que existiera esa
 * carpeta; ver cómo public/fonts/ ya sigue este mismo patrón). El archivo todavía no existe
 * (PDF real pendiente de subir a mano, gap conocido — ROADMAP-portfolio.md "CV: contenido y
 * PDF") así que el link da 404 hasta entonces; el nombre de archivo se muestra igual junto al
 * botón como confirmación visual de que el idioma activo elige el PDF correcto.
 *
 * Sin línea de LinkedIn/GitHub: mismo gap ya documentado en el sidebar (usuario real todavía
 * sin confirmar) — mostrar una URL adivinada como texto de un documento de CV sería peor que
 * el `href="#"` silencioso de un ícono, así que directamente no se muestra la línea.
 */
@Component({
  selector: 'app-cv-panel',
  templateUrl: './cv-panel.html',
  styleUrl: './cv-panel.css',
})
export class CvPanelComponent {
  private readonly lang = inject(LanguageService);

  protected readonly content = this.lang.content;
  protected readonly strings = this.lang.strings;

  protected readonly cvFilename = computed(() => `cv-${this.lang.currentLang()}.pdf`);
  protected readonly cvHref = computed(() => `/${this.cvFilename()}`);

  protected readonly featuredProjects = computed(() =>
    this.content().projects.filter((p) => p.featured && p.cvBullet)
  );

  protected readonly languagesText = computed(() =>
    this.content()
      .languages.map((l) => `${l.language}: ${l.level}`)
      .join(' · ')
  );

  expDate(e: ExperienceEntry): string {
    const end = e.current ? this.strings().present : `${e.endMonth ?? ''} ${e.endYear}`.trim();
    return `${e.startMonth} ${e.startYear} – ${end}`;
  }
}
