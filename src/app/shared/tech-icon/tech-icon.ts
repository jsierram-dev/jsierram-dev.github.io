import { Component, computed, input } from '@angular/core';
import { techMeta } from '../../data/tech-meta';

/**
 * Colored tech badge (rounded-square background + real brand-mark path), reused by the
 * Portfolio detail chips and the Resume Stack list. Path data is bound via [attr.d]/
 * [attr.fill] onto a static template, not [innerHTML] — avoids needing DomSanitizer just
 * to render a handful of known, locally-owned SVG paths.
 */
@Component({
  selector: 'app-tech-icon',
  template: `
    <svg [attr.width]="size()" [attr.height]="size()" viewBox="0 0 26 26" aria-hidden="true">
      <rect width="26" height="26" rx="4" [attr.fill]="meta().color" fill-opacity="0.16"></rect>
      <rect x="0.5" y="0.5" width="25" height="25" rx="3.5" fill="none" [attr.stroke]="meta().color" stroke-opacity="0.55"></rect>
      <svg x="5.5" y="5.5" width="15" height="15" [attr.viewBox]="meta().viewBox">
        <path [attr.fill]="meta().color" [attr.d]="meta().path"></path>
      </svg>
    </svg>
  `,
})
export class TechIconComponent {
  readonly name = input.required<string>();
  readonly size = input<number>(26);
  protected readonly meta = computed(() => techMeta(this.name()));
}
