import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="login-section">
      <div class="login-container">
        <div class="login-card">
          <div class="login-header">
            <img src="img/logoicon.png" alt="KOI Design" class="login-logo" />
            <h1>Panel de Administración</h1>
            <p>Ingresa tus credenciales para acceder</p>
          </div>
          <form (ngSubmit)="onLogin()" class="login-form">
            <div class="form-group">
              <label for="username"><i class="fas fa-user"></i> Usuario</label>
              <input type="text" id="username" [(ngModel)]="username" name="username" placeholder="admin" required />
            </div>
            <div class="form-group">
              <label for="password"><i class="fas fa-lock"></i> Contraseña</label>
              <input type="password" id="password" [(ngModel)]="password" name="password" placeholder="••••••" required />
            </div>
            <div *ngIf="error" class="login-error">
              <i class="fas fa-exclamation-triangle"></i> {{error}}
            </div>
            <button type="submit" class="btn-primary login-btn" [disabled]="loading">
              <i class="fas" [class.fa-spinner]="loading" [class.fa-spin]="loading" [class.fa-sign-in-alt]="!loading"></i>
              {{ loading ? 'Ingresando...' : 'Ingresar' }}
            </button>
          </form>
          <div class="login-footer">
            <p class="register-link">¿No tienes cuenta? <a routerLink="/registro">Crear Cuenta</a></p>
            <a routerLink="/" class="back-link"><i class="fas fa-arrow-left"></i> Volver al Inicio</a>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .login-section {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      background: url('/img/KoiFondo.png') center/cover no-repeat fixed;
      padding: 100px 20px 40px;
    }
    .login-container { width: 100%; max-width: 420px; }
    .login-card {
      background: rgba(15, 34, 64, 0.9); border: 2px solid rgba(0,191,255,0.3);
      border-radius: 12px; padding: 40px 35px; box-shadow: 0 0 40px rgba(0,191,255,0.1), 0 8px 32px rgba(0,0,0,0.4);
    }
    .login-header { text-align: center; margin-bottom: 30px; }
    .login-logo { width: 80px; height: 80px; object-fit: contain; margin-bottom: 15px; }
    .login-header h1 { font-family: var(--comic-font); font-size: 1.5rem; color: #fff; letter-spacing: 2px; text-transform: uppercase; }
    .login-header p { color: #aaa; font-size: 0.9rem; margin-top: 8px; }
    .login-form .form-group { margin-bottom: 20px; }
    .login-form label { display: block; font-family: var(--comic-font); font-size: 0.85rem; color: #ccc; margin-bottom: 6px; letter-spacing: 1px; }
    .login-form label i { margin-right: 6px; color: #E91E9E; }
    .login-form input {
      width: 100%; padding: 12px 16px; background: rgba(255,255,255,0.05); border: 2px solid rgba(255,255,255,0.15);
      border-radius: 6px; color: #fff; font-size: 1rem; transition: border-color 0.3s; outline: none;
    }
    .login-form input:focus { border-color: #00BFFF; box-shadow: 0 0 10px rgba(0,191,255,0.2); }
    .login-error {
      background: rgba(233,30,30,0.1); border: 1px solid rgba(233,30,30,0.3);
      padding: 10px 14px; border-radius: 6px; color: #ff6b6b; font-size: 0.85rem; margin-bottom: 15px;
    }
    .login-btn {
      width: 100%; padding: 14px; font-size: 1.1rem; border-radius: 6px; letter-spacing: 2px;
    }
    .login-btn:disabled { opacity: 0.7; cursor: not-allowed; }
    .login-footer { text-align: center; margin-top: 20px; }
    .back-link { color: #aaa; font-size: 0.85rem; transition: color 0.3s; }
    .back-link:hover { color: #00BFFF; }
    .back-link i { margin-right: 5px; }
    .register-link { color: #888; font-size: 0.85rem; margin-bottom: 12px; }
    .register-link a { color: #00BFFF; text-decoration: none; font-weight: bold; }
    .register-link a:hover { text-decoration: underline; }
  `]
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {
    if (auth.isLoggedIn()) {
      router.navigate(['/admin']);
    }
  }

  async onLogin() {
    this.error = '';
    this.loading = true;
    const success = await this.auth.login(this.username, this.password);
    this.loading = false;
    if (success) {
      const user = this.auth.getUser();
      this.router.navigate([user?.role === 'admin' ? '/admin' : '/']);
    } else {
      this.error = 'Usuario o contraseña incorrectos';
    }
  }
}

