import { Component, OnInit, HostListener } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { ApiService, SiteSettings } from './services/api.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, CommonModule],
  template: `
    <app-header></app-header>
    <router-outlet></router-outlet>
    <app-footer></app-footer>
    <a *ngIf="whatsappUrl && !isAdminRoute" [href]="whatsappUrl" target="_blank" class="floating-wa" aria-label="WhatsApp">
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
      text-decoration: none;
      animation: pulse-ring 2s infinite;
    }
    .floating-wa i {
      animation: vibrate 2s linear infinite;
    }
    .floating-wa:hover {
      transform: scale(1.1);
      transition: transform 0.3s ease;
      color: white;
    }
    @keyframes pulse-ring {
      0% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.7); }
      70% { box-shadow: 0 0 0 15px rgba(37, 211, 102, 0); }
      100% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0); }
    }
    @keyframes vibrate {
      0% { transform: rotate(0deg); }
      5% { transform: rotate(15deg); }
      10% { transform: rotate(-15deg); }
      15% { transform: rotate(20deg); }
      20% { transform: rotate(-15deg); }
      25% { transform: rotate(15deg); }
      30% { transform: rotate(0deg); }
      100% { transform: rotate(0deg); }
    }
  `]
})
export class AppComponent implements OnInit {
  title = 'KOI Design';
  whatsappUrl = '';
  isAdminRoute = false;

  constructor(private api: ApiService, private router: Router) { 
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isAdminRoute = event.urlAfterRedirects.includes('/admin');
    });
  }

  @HostListener('window:message', ['$event'])
  onMessage(event: MessageEvent) {
    if (event.data && event.data.type === 'VISUAL_PREVIEW_URL') {
      window.location.hash = event.data.url;
    }
  }

  @HostListener('document:contextmenu', ['$event'])
  onRightClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target && target.nodeName === 'IMG') {
      event.preventDefault(); // Bloquea clic derecho en imágenes
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
