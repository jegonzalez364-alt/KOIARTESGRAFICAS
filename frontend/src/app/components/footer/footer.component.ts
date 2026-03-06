import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="footer">
      <div class="container">
        <div class="footer-logo">
          <img src="img/logoicon.png" alt="KOI Design" class="footer-logo-img" width="40" height="40" loading="lazy" decoding="async" />
        </div>
        <p class="footer-text">© 2024 KOI Design. Todos los derechos reservados. Hecho con <span class="heart">💚</span> y Láseres.</p>
        <div class="social-links">
          <a href="#" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
          <a href="#" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
          <a href="#" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent { }
