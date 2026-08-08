import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('renders the 4 file tabs and defaults to about.md active', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    // direct children only — .tabstrip also holds the language-switch buttons, which
    // carry aria-label too ("English"/"Español") but aren't file tabs
    const tabs = compiled.querySelectorAll('.tabstrip > button[aria-label]');
    expect(tabs.length).toBe(4);
    expect(compiled.querySelector('.tabstrip button.active')?.getAttribute('aria-label')).toBe('about.md');
  });
});
