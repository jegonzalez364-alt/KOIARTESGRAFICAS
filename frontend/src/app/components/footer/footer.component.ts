import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="footer">
      <div class="container">
        <div class="footer-logo">
          <img src="img/logoicon.png" alt="KOI Design" class="footer-logo-img" width="40" height="40" loading="lazy" decoding="async" />
        </div>
        <p class="footer-text">{{footerText}}</p>
        <div class="social-links">
          <a href="#" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
          <a href="#" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
          <a href="#" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent implements OnInit {
  footerText = '© 2024 KOI Design. Todos los derechos reservados. Hecho con 💚 y Láseres.';

  constructor(private api: ApiService) { }

  ngOnInit() {
    this.api.getSettings().subscribe({
      next: (res) => {
        if (res && res.footerText) {
          this.footerText = res.footerText;
        }
      }
    });

    this.api.previewSettings$.subscribe(preview => {
      if (preview && preview.footerText) {
        this.footerText = preview.footerText;
      }
    });
  }
}
