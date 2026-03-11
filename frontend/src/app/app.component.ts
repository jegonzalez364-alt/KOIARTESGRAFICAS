import { Component, OnInit, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { ApiService, SiteSettings } from './services/api.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    <app-header></app-header>
    <router-outlet></router-outlet>
    <app-footer></app-footer>
  `,
  styles: [`:host { display: block; }`]
})
export class AppComponent implements OnInit {
  title = 'KOI Design';

  constructor(private api: ApiService) { }

  @HostListener('window:message', ['$event'])
  onMessage(event: MessageEvent) {
    if (event.data && event.data.type === 'CMS_PREVIEW') {
      this.api.previewSettings$.next(event.data.settings);
    }
  }

  ngOnInit() {
    this.api.getSettings().subscribe({
      next: (settings: SiteSettings) => {
        if (settings) {
          this.applyCssVars(settings);
        }
      },
      error: (err) => console.error('Error loading global settings', err)
    });

    this.api.previewSettings$.subscribe(preview => {
      if (preview) {
        this.applyCssVars(preview);
      }
    });
  }

  private applyCssVars(settings: SiteSettings) {
    const root = document.documentElement;
    if (settings.primaryColor) root.style.setProperty('--magenta', settings.primaryColor);
    if (settings.secondaryColor) root.style.setProperty('--cyan', settings.secondaryColor);
    if (settings.accentColor) root.style.setProperty('--yellow', settings.accentColor);
    if (settings.bgColor) root.style.setProperty('--dark-bg', settings.bgColor);
    if (settings.cardBgColor) root.style.setProperty('--card-bg', settings.cardBgColor);
    root.style.setProperty('--font-family-primary', settings.primaryFont || "'Inter', 'Segoe UI', sans-serif");
  }
}
