import { Component, OnInit, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { ApiService, SiteSettings } from './services/api.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, CommonModule],
  template: `
    <app-header></app-header>
    <router-outlet></router-outlet>
    <app-footer></app-footer>
    <a *ngIf="whatsappUrl" [href]="whatsappUrl" target="_blank" class="floating-wa" aria-label="WhatsApp">
      <i class="fab fa-whatsapp"></i>
    </a>
  `,
  styles: [`
    :host { display: block; }
    .floating-wa {
      position: fixed;
      bottom: 25px;
      right: 25px;
      background-color: #25D366;
      color: white;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 35px;
      box-shadow: 0px 4px 10px rgba(0,0,0,0.3);
      z-index: 9999;
      transition: transform 0.3s ease;
      text-decoration: none;
    }
    .floating-wa:hover {
      transform: scale(1.1);
      color: white;
    }
  `]
})
export class AppComponent implements OnInit {
  title = 'KOI Design';
  whatsappUrl = '';

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
          this.whatsappUrl = settings.socialWhatsappUrl || 'https://wa.me/573186909433';
        }
      },
      error: (err) => console.error('Error loading global settings', err)
    });

    this.api.previewSettings$.subscribe(preview => {
      if (preview) {
        this.applyCssVars(preview);
        this.whatsappUrl = preview.socialWhatsappUrl || 'https://wa.me/573186909433';
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
