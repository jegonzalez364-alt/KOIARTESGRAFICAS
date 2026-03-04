import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="login-section">
      <div class="login-card">
        <div class="login-header">
          <img src="img/logoicon.png" alt="KOI Design" class="login-logo" />
          <h1>Crear Cuenta</h1>
          <p>Regístrate para enviar solicitudes y autocompletar formularios</p>
        </div>
        <form (ngSubmit)="onRegister()" class="login-form">
          <div class="form-row">
            <div class="form-group">
              <label><i class="fas fa-user"></i> Usuario</label>
              <input type="text" [(ngModel)]="form.username" name="username" placeholder="Tu nombre de usuario" required />
            </div>
            <div class="form-group">
              <label><i class="fas fa-lock"></i> Contraseña</label>
              <input type="password" [(ngModel)]="form.password" name="password" placeholder="Mínimo 4 caracteres" required />
            </div>
          </div>
          <div class="form-group">
            <label><i class="fas fa-id-card"></i> Nombre Completo</label>
            <input type="text" [(ngModel)]="form.nombre" name="nombre" placeholder="Tu nombre y apellido" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label><i class="fas fa-envelope"></i> Email</label>
              <input type="email" [(ngModel)]="form.email" name="email" placeholder="correo@ejemplo.com" required />
            </div>
            <div class="form-group">
              <label><i class="fas fa-phone"></i> Teléfono</label>
              <input type="tel" [(ngModel)]="form.telefono" name="telefono" placeholder="318 690 9433" />
            </div>
          </div>

          <div *ngIf="errorMsg" class="alert alert-error">
            <i class="fas fa-exclamation-triangle"></i> {{errorMsg}}
          </div>

          <button type="submit" class="btn-primary btn-full" [disabled]="loading">
            <i class="fas" [class.fa-spinner]="loading" [class.fa-spin]="loading" [class.fa-user-plus]="!loading"></i>
            {{ loading ? 'Registrando...' : 'Crear Cuenta' }}
          </button>

          <div class="login-footer">
            <p>¿Ya tienes cuenta? <a routerLink="/login">Inicia Sesión</a></p>
          </div>
        </form>
      </div>
    </section>
  `,
  styles: [`
    .login-section {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      padding: 100px 20px 40px; background: url('/img/KoiFondo.png') center/cover no-repeat fixed;
    }
    .login-card {
      width: 100%; max-width: 520px; background: rgba(15,34,64,0.8);
      border: 2px solid rgba(0,191,255,0.2); border-radius: 16px; padding: 40px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05);
    }
    .login-header { text-align: center; margin-bottom: 30px; }
    .login-logo { width: 60px; height: 60px; margin-bottom: 15px; }
    .login-header h1 { font-family: var(--comic-font); font-size: 1.6rem; color: #fff600; letter-spacing: 2px; }
    .login-header p { color: #aaa; font-size: 0.85rem; margin-top: 6px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .form-group { margin-bottom: 16px; }
    .form-group label {
      display: block; font-size: 0.8rem; color: #ccc; margin-bottom: 6px;
      font-family: var(--comic-font); letter-spacing: 1px;
    }
    .form-group label i { margin-right: 6px; color: #00BFFF; }
    .form-group input {
      width: 100%; padding: 11px 14px; background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.15); border-radius: 6px;
      color: #fff; font-size: 0.9rem; outline: none; transition: border-color 0.3s;
    }
    .form-group input:focus { border-color: #00BFFF; box-shadow: 0 0 8px rgba(0,191,255,0.15); }
    .alert-error {
      padding: 10px 14px; border-radius: 6px; margin-bottom: 14px;
      background: rgba(255,50,50,0.1); border: 1px solid rgba(255,50,50,0.3);
      color: #ff6b6b; font-size: 0.85rem;
    }
    .btn-full { width: 100%; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .login-footer { text-align: center; margin-top: 20px; }
    .login-footer p { color: #888; font-size: 0.85rem; }
    .login-footer a { color: #00BFFF; text-decoration: none; font-weight: bold; }
    .login-footer a:hover { text-decoration: underline; }
    @media (max-width: 480px) { .form-row { grid-template-columns: 1fr; } }
  `]
})
export class RegisterComponent {
  form = { username: '', password: '', nombre: '', email: '', telefono: '' };
  loading = false;
  errorMsg = '';

  constructor(private api: ApiService, private router: Router) { }

  onRegister() {
    this.errorMsg = '';
    if (!this.form.username || !this.form.password || !this.form.email) {
      this.errorMsg = 'Usuario, contraseña y email son requeridos';
      return;
    }
    this.loading = true;
    this.api.register(this.form).subscribe({
      next: (res) => {
        localStorage.setItem('koi_token', res.token);
        localStorage.setItem('koi_user', JSON.stringify(res.user));
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.errorMsg = err.error?.error || 'Error al registrarse';
        this.loading = false;
      }
    });
  }
}

