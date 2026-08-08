import { Component, computed, inject } from '@angular/core';
import { LanguageService } from '../../core/language.service';

@Component({
  selector: 'app-about-panel',
  templateUrl: './about-panel.html',
})
export class AboutPanelComponent {
  private readonly lang = inject(LanguageService);
  protected readonly heading = computed(() => this.lang.strings().aboutHeading);
  protected readonly paragraphs = computed(() => this.lang.content().profile.about);
}
