import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';

@Component({
    selector: 'app-account-settings',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="admin-page">
      <div class="admin-page-header">
        <h1><i class="fas fa-user-cog"></i> Configuración de Cuenta</h1>
        <p>Cambia tu nombre de usuario y/o contraseña</p>
      </div>

      <div class="admin-card">
        <h3><i class="fas fa-key"></i> Cambiar Credenciales</h3>
        <form (ngSubmit)="onSave()" class="admin-form">
          <div class="form-group">
            <label>Contraseña Actual <span class="required">*</span></label>
            <div class="input-wrapper">
              <i class="fas fa-lock"></i>
              <input [type]="showCurrentPass ? 'text' : 'password'" [(ngModel)]="form.currentPassword"
                name="currentPassword" placeholder="Ingresa tu contraseña actual" required />
              <button type="button" class="toggle-pass" (click)="showCurrentPass = !showCurrentPass">
                <i class="fas" [class.fa-eye]="!showCurrentPass" [class.fa-eye-slash]="showCurrentPass"></i>
              </button>
            </div>
          </div>

          <hr class="divider" />

          <div class="form-group">
            <label>Nuevo Usuario</label>
            <div class="input-wrapper">
              <i class="fas fa-user"></i>
              <input type="text" [(ngModel)]="form.newUsername" name="newUsername"
                [placeholder]="'Actual: ' + currentUsername" />
            </div>
            <small class="hint">Déjalo vacío para mantener el actual</small>
          </div>

          <div class="form-group">
            <label>Nueva Contraseña</label>
            <div class="input-wrapper">
              <i class="fas fa-lock"></i>
              <input [type]="showNewPass ? 'text' : 'password'" [(ngModel)]="form.newPassword"
                name="newPassword" placeholder="Mínimo 4 caracteres" />
              <button type="button" class="toggle-pass" (click)="showNewPass = !showNewPass">
                <i class="fas" [class.fa-eye]="!showNewPass" [class.fa-eye-slash]="showNewPass"></i>
              </button>
            </div>
            <small class="hint">Déjalo vacío para mantener la actual</small>
          </div>

          <div class="form-group" *ngIf="form.newPassword">
            <label>Confirmar Nueva Contraseña</label>
            <div class="input-wrapper">
              <i class="fas fa-lock"></i>
              <input [type]="showConfirmPass ? 'text' : 'password'" [(ngModel)]="form.confirmPassword"
                name="confirmPassword" placeholder="Repite la nueva contraseña" />
              <button type="button" class="toggle-pass" (click)="showConfirmPass = !showConfirmPass">
                <i class="fas" [class.fa-eye]="!showConfirmPass" [class.fa-eye-slash]="showConfirmPass"></i>
              </button>
            </div>
            <small *ngIf="form.newPassword && form.confirmPassword && form.newPassword !== form.confirmPassword" class="error-hint">
              <i class="fas fa-exclamation-circle"></i> Las contraseñas no coinciden
            </small>
          </div>

          <div *ngIf="successMsg" class="alert alert-success">
            <i class="fas fa-check-circle"></i> {{successMsg}}
          </div>
          <div *ngIf="errorMsg" class="alert alert-error">
            <i class="fas fa-exclamation-triangle"></i> {{errorMsg}}
          </div>

          <button type="submit" class="btn-primary" [disabled]="saving || !form.currentPassword || (form.newPassword && form.newPassword !== form.confirmPassword)">
            <i class="fas" [class.fa-spinner]="saving" [class.fa-spin]="saving" [class.fa-save]="!saving"></i>
            {{ saving ? 'Guardando...' : 'Guardar Cambios' }}
          </button>
        </form>
      </div>
    </div>
  `,
    styles: [`
    .admin-page { max-width: 600px; }
    .admin-page-header { margin-bottom: 30px; }
    .admin-page-header h1 { font-family: var(--comic-font); font-size: 1.8rem; color: #fff; letter-spacing: 2px; }
    .admin-page-header h1 i { color: #E91E9E; margin-right: 10px; }
    .admin-page-header p { color: #aaa; margin-top: 5px; }
    .admin-card {
      background: rgba(15,34,64,0.6); border: 1px solid rgba(0,191,255,0.15);
      border-radius: 10px; padding: 30px; margin-bottom: 25px;
    }
    .admin-card h3 { font-family: var(--comic-font); color: #00BFFF; font-size: 1.1rem; margin-bottom: 20px; letter-spacing: 1px; }
    .admin-card h3 i { margin-right: 8px; }
    .admin-form .form-group { margin-bottom: 18px; }
    .admin-form label {
      display: block; font-size: 0.85rem; color: #ccc; margin-bottom: 6px;
      font-family: var(--comic-font); letter-spacing: 1px;
    }
    .required { color: #E91E9E; }
    .input-wrapper {
      position: relative; display: flex; align-items: center;
      background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15);
      border-radius: 6px; transition: border-color 0.3s;
    }
    .input-wrapper:focus-within { border-color: #00BFFF; box-shadow: 0 0 8px rgba(0,191,255,0.15); }
    .input-wrapper > i { padding: 0 12px; color: #888; font-size: 0.9rem; }
    .input-wrapper input {
      flex: 1; padding: 11px 0; background: transparent; border: none;
      color: #fff; font-size: 0.95rem; outline: none;
    }
    .toggle-pass {
      background: none; border: none; color: #888; padding: 0 12px; cursor: pointer;
      font-size: 0.9rem; transition: color 0.2s;
    }
    .toggle-pass:hover { color: #00BFFF; }
    .hint { display: block; margin-top: 5px; color: #666; font-size: 0.75rem; }
    .error-hint { display: block; margin-top: 5px; color: #ff6b6b; font-size: 0.8rem; }
    .divider { border: none; border-top: 1px solid rgba(255,255,255,0.08); margin: 20px 0; }
    .alert {
      padding: 12px 16px; border-radius: 6px; margin-bottom: 16px;
      font-size: 0.9rem; display: flex; align-items: center; gap: 8px;
    }
    .alert-success { background: rgba(0,255,136,0.1); border: 1px solid rgba(0,255,136,0.3); color: #00ff88; }
    .alert-error { background: rgba(255,50,50,0.1); border: 1px solid rgba(255,50,50,0.3); color: #ff6b6b; }
    .btn-primary { margin-top: 5px; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
  `]
})
export class AccountSettingsComponent {
    form = { currentPassword: '', newUsername: '', newPassword: '', confirmPassword: '' };
    saving = false;
    successMsg = '';
    errorMsg = '';
    showCurrentPass = false;
    showNewPass = false;
    showConfirmPass = false;
    currentUsername = '';

    constructor(private api: ApiService, private auth: AuthService) {
        const user = auth.getUser();
        this.currentUsername = user?.username || 'admin';
    }

    onSave() {
        this.successMsg = '';
        this.errorMsg = '';

        if (!this.form.newUsername && !this.form.newPassword) {
            this.errorMsg = 'Debes cambiar al menos el usuario o la contraseña';
            return;
        }

        if (this.form.newPassword && this.form.newPassword !== this.form.confirmPassword) {
            this.errorMsg = 'Las contraseñas no coinciden';
            return;
        }

        this.saving = true;
        this.api.updateCredentials(this.form.currentPassword, this.form.newUsername, this.form.newPassword)
            .subscribe({
                next: (res: any) => {
                    // Update stored token and user data
                    if (res.token) {
                        localStorage.setItem('koi_token', res.token);
                    }
                    if (res.user) {
                        localStorage.setItem('koi_user', JSON.stringify(res.user));
                        this.currentUsername = res.user.username;
                    }
                    this.successMsg = res.message || '¡Credenciales actualizadas!';
                    this.form = { currentPassword: '', newUsername: '', newPassword: '', confirmPassword: '' };
                    this.saving = false;
                },
                error: (err) => {
                    this.errorMsg = err.error?.error || 'Error al actualizar credenciales';
                    this.saving = false;
                }
            });
    }
}
