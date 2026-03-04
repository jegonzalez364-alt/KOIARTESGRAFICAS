import { Component, AfterViewInit, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <!-- ════════════ CONTACT HERO ════════════ -->
    <section class="contact-hero">
      <div class="hero-bg"></div>
      <div class="neon-lines">
        <span></span><span></span><span></span>
        <span></span><span></span><span></span>
      </div>
      <div class="container">
        <div class="contact-hero-content fade-in">
          <span class="action-word">¡ZAP!</span>
          <h1 class="contact-title">Contáctanos</h1>
          <p class="contact-subtitle">¿Tienes una idea? ¡Hagámosla realidad! Escríbenos y nuestro equipo te responderá más rápido que un rayo láser.</p>
        </div>
      </div>
    </section>

    <!-- ════════════ CONTACT CONTENT ════════════ -->
    <section class="contact-section">
      <div class="container">
        <div class="contact-grid">
          <!-- LEFT: Form -->
          <div class="contact-form-wrapper fade-in">
            <div class="comic-panel-header">
              <span class="panel-number">#01</span>
              <h2>Envíanos un Mensaje</h2>
            </div>

            <!-- Auto-fill notice -->
            <div *ngIf="auth.isLoggedIn() && autoFilled" class="autofill-notice">
              <i class="fas fa-magic"></i> Datos autocompletados desde tu perfil
            </div>
            <div *ngIf="!auth.isLoggedIn()" class="register-notice">
              <i class="fas fa-user-plus"></i> <a routerLink="/registro">Regístrate</a> para autocompletar tus datos
            </div>

            <form class="contact-form" (ngSubmit)="onSubmit()">
              <div class="form-group">
                <label for="nombre">Nombre</label>
                <input type="text" id="nombre" placeholder="Tu nombre completo" [(ngModel)]="form.nombre" name="nombre" required />
              </div>
              <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" placeholder="tu&#64;email.com" [(ngModel)]="form.email" name="email" required />
              </div>
              <div class="form-group">
                <label for="telefono">Teléfono</label>
                <input type="tel" id="telefono" placeholder="+57 300 123 4567" [(ngModel)]="form.telefono" name="telefono" />
              </div>
              <div class="form-group">
                <label for="asunto">Asunto</label>
                <select id="asunto" [(ngModel)]="form.asunto" name="asunto" required>
                  <option value="" disabled>Selecciona una opción</option>
                  <option value="Cotización">Cotización</option>
                  <option value="Pedido Personalizado">Pedido Personalizado</option>
                  <option value="Soporte">Soporte Técnico</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              <div class="form-group">
                <label for="mensaje">Mensaje</label>
                <textarea id="mensaje" rows="5" placeholder="Cuéntanos tu idea..." [(ngModel)]="form.mensaje" name="mensaje" required></textarea>
              </div>
              <button type="submit" class="btn-primary contact-submit" [disabled]="sending">
                <i class="fas" [class.fa-spinner]="sending" [class.fa-spin]="sending" [class.fa-paper-plane]="!sending"></i>
                {{ sending ? 'Enviando...' : '¡Enviar Mensaje!' }}
              </button>
              <div *ngIf="successMsg" class="success-msg">
                <i class="fas fa-check-circle"></i> {{successMsg}}
              </div>
              <div *ngIf="errorMsg" class="error-msg">
                <i class="fas fa-exclamation-triangle"></i> {{errorMsg}}
              </div>
            </form>
          </div>

          <!-- RIGHT: Info Cards -->
          <div class="contact-info-side fade-in">
            <div class="comic-panel-header">
              <span class="panel-number">#02</span>
              <h2>Info de Contacto</h2>
            </div>
            <div class="info-cards">
              <div class="info-card">
                <div class="info-card-icon"><i class="fab fa-whatsapp"></i></div>
                <div class="info-card-content">
                  <h3>WhatsApp</h3>
                  <p>+57 318 690 9433</p>
                  <a href="https://wa.me/573186909433" class="info-link">Chatea con nosotros <i class="fas fa-arrow-right"></i></a>
                </div>
              </div>
              <div class="info-card">
                <div class="info-card-icon"><i class="fas fa-envelope"></i></div>
                <div class="info-card-content">
                  <h3>Email</h3>
                  <p>contacto&#64;koidesign.com</p>
                  <a href="mailto:contacto&#64;koidesign.com" class="info-link">Escríbenos <i class="fas fa-arrow-right"></i></a>
                </div>
              </div>
              <div class="info-card">
                <div class="info-card-icon"><i class="fas fa-map-marker-alt"></i></div>
                <div class="info-card-content">
                  <h3>Ubicación</h3>
                  <p>Bogotá, Colombia</p>
                </div>
              </div>
              <div class="info-card">
                <div class="info-card-icon"><i class="fas fa-clock"></i></div>
                <div class="info-card-content">
                  <h3>Horario</h3>
                  <p>Lunes a Viernes: 8am — 6pm</p>
                  <p>Sábados: 9am — 2pm</p>
                </div>
              </div>
            </div>
            <div class="contact-social">
              <h3>Síguenos</h3>
              <div class="social-links">
                <a href="#"><i class="fab fa-instagram"></i></a>
                <a href="#"><i class="fab fa-facebook-f"></i></a>
                <a href="#"><i class="fab fa-twitter"></i></a>
                <a href="#"><i class="fab fa-tiktok"></i></a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .success-msg { margin-top: 15px; color: #00ff88; font-family: var(--comic-font); letter-spacing: 1px; }
    .success-msg i { margin-right: 5px; }
    .error-msg { margin-top: 15px; color: #ff6b6b; font-family: var(--comic-font); letter-spacing: 1px; }
    .error-msg i { margin-right: 5px; }
    .autofill-notice {
      background: rgba(0,255,136,0.1); border: 1px solid rgba(0,255,136,0.25);
      padding: 10px 16px; border-radius: 8px; margin-bottom: 16px;
      color: #00ff88; font-size: 0.85rem; display: flex; align-items: center; gap: 8px;
    }
    .register-notice {
      background: rgba(0,191,255,0.1); border: 1px solid rgba(0,191,255,0.2);
      padding: 10px 16px; border-radius: 8px; margin-bottom: 16px;
      color: #888; font-size: 0.85rem; display: flex; align-items: center; gap: 8px;
    }
    .register-notice a { color: #00BFFF; text-decoration: none; font-weight: bold; }
    .register-notice a:hover { text-decoration: underline; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
  `]
})
export class ContactComponent implements AfterViewInit, OnInit {
  form = { nombre: '', email: '', telefono: '', asunto: '', mensaje: '' };
  sending = false;
  successMsg = '';
  errorMsg = '';
  autoFilled = false;

  constructor(private api: ApiService, public auth: AuthService) { }

  ngOnInit() {
    // Auto-fill if user is logged in
    if (this.auth.isLoggedIn()) {
      this.api.getProfile().subscribe({
        next: (profile) => {
          if (profile.nombre) this.form.nombre = profile.nombre;
          if (profile.email) this.form.email = profile.email;
          if (profile.telefono) this.form.telefono = profile.telefono;
          this.autoFilled = true;
        },
        error: () => { } // silently fail
      });
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      const faders = document.querySelectorAll('.fade-in');
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
        });
      }, { threshold: 0.15 });
      faders.forEach(el => observer.observe(el));
    }, 200);
  }

  onSubmit() {
    this.successMsg = '';
    this.errorMsg = '';
    if (!this.form.nombre || !this.form.email || !this.form.mensaje) {
      this.errorMsg = 'Nombre, email y mensaje son requeridos';
      return;
    }
    this.sending = true;
    this.api.submitRequest(this.form).subscribe({
      next: () => {
        this.successMsg = '¡Solicitud enviada correctamente! Te responderemos pronto.';
        this.form = { nombre: '', email: '', telefono: '', asunto: '', mensaje: '' };
        this.sending = false;
        // Re-autofill if logged in
        if (this.auth.isLoggedIn()) { this.ngOnInit(); }
      },
      error: (err) => {
        this.errorMsg = err.error?.error || 'Error al enviar tu solicitud';
        this.sending = false;
      }
    });
  }
}
