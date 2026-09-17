import { Component, DestroyRef, ElementRef, afterNextRender, afterRenderEffect, effect, inject, input, signal, viewChild } from '@angular/core';

/**
 * Clamps text to a fixed number of lines and only shows a "read more" toggle when the
 * text actually overflows that clamp — measured via scrollHeight vs clientHeight, not
 * guessed from a character-count heuristic. Expanding just removes the clamp class; the
 * extra height pushes whatever follows down through normal block flow, no manual reflow
 * needed.
 *
 * Every panel in this app is always in the DOM (toggled with [hidden], see app.html) so a
 * plain "measure once after render" check isn't enough: on first load, Resume/Portfolio
 * are hidden behind About and measure 0x0. A ResizeObserver re-measures whenever the
 * element's real size changes, which covers both "the tab became visible" and ordinary
 * viewport-width reflow — afterRenderEffect below still handles the more common case of
 * the text itself changing (new project, language switch) without needing a resize.
 *
 * `variant` picks the one of two known typographic contexts this is actually used in
 * (Resume timeline entries, Portfolio detail problem/role) rather than exposing a pile of
 * style inputs for a component with only two real call sites.
 */
@Component({
  selector: 'app-clamped-text',
  host: { '[attr.data-variant]': 'variant()' },
  template: `
    <p #textEl class="clamped-text" [class.is-expanded]="expanded()" [style.--clamp-lines]="lines()">{{ text() }}</p>
    @if (canClamp()) {
      <button type="button" class="clamped-text__toggle" (click)="expanded.set(!expanded())">
        {{ expanded() ? collapseLabel() : expandLabel() }}
      </button>
    }
  `,
  styles: `
    :host { display: block; }
    .clamped-text {
      margin: 0; display: -webkit-box; -webkit-box-orient: vertical;
      -webkit-line-clamp: var(--clamp-lines); overflow: hidden;
    }
    .clamped-text.is-expanded { display: block; overflow: visible; }
    :host([data-variant='timeline']) .clamped-text { font-size: 0.85rem; color: var(--muted); line-height: 1.6; max-width: 52ch; }
    :host([data-variant='detail']) .clamped-text { font-size: 0.92rem; color: var(--text); line-height: 1.65; max-width: 62ch; }
    .clamped-text__toggle {
      margin-top: 0.3rem; font-family: var(--font-mono); font-size: 0.72rem; color: var(--accent);
      text-decoration: underline; text-underline-offset: 2px;
    }
  `,
})
export class ClampedTextComponent {
  readonly text = input.required<string>();
  readonly lines = input(3);
  readonly variant = input<'timeline' | 'detail'>('detail');
  readonly expandLabel = input('Read more');
  readonly collapseLabel = input('Read less');

  private readonly textEl = viewChild<ElementRef<HTMLParagraphElement>>('textEl');
  protected readonly expanded = signal(false);
  protected readonly canClamp = signal(false);

  constructor() {
    const destroyRef = inject(DestroyRef);

    // new text (e.g. switching project/language) always starts collapsed again
    effect(() => { this.text(); this.expanded.set(false); });

    afterRenderEffect(() => {
      this.text(); // re-measure whenever the text itself changes, not just on expand/collapse
      if (this.expanded()) return; // clamp is off while expanded, measuring now would be wrong
      const el = this.textEl()?.nativeElement;
      if (!el) return;
      this.canClamp.set(el.scrollHeight > el.clientHeight + 1);
    });

    // afterNextRender only ever runs in the browser, never during the server/prerender
    // pass — exactly what a ResizeObserver needs (no DOM to observe at build time).
    afterNextRender(() => {
      const el = this.textEl()!.nativeElement;
      const observer = new ResizeObserver(() => {
        if (this.expanded()) return;
        this.canClamp.set(el.scrollHeight > el.clientHeight + 1);
      });
      observer.observe(el);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
