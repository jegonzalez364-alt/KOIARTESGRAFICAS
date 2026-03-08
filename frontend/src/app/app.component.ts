import { Component, OnInit } from '@angular/core';
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
  constructor(private api: ApiService) { }

  ngOnInit() {
    this.api.getSettings().subscribe({
      next: (settings: SiteSettings) => {
        if (settings) {
          const root = document.documentElement;
          if (settings.primaryColor) root.style.setProperty('--magenta', settings.primaryColor);
          if (settings.secondaryColor) root.style.setProperty('--cyan', settings.secondaryColor);
          if (settings.accentColor) root.style.setProperty('--yellow', settings.accentColor);
          if (settings.bgColor) root.style.setProperty('--dark-bg', settings.bgColor);
          if (settings.cardBgColor) root.style.setProperty('--card-bg', settings.cardBgColor);
        }
      },
      error: (err) => console.error('Error loading global settings', err)
    });
  }
}
