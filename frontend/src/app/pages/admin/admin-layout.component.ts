import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="admin-wrapper">
      <aside class="admin-sidebar">
        <div class="sidebar-header">
          <img src="img/logoicon.png" alt="KOI Design" class="sidebar-logo" />
          <h2>Admin Panel</h2>
          <p class="sidebar-user"><i class="fas fa-user-shield"></i> {{auth.getUser()?.username}}</p>
        </div>
        <nav class="sidebar-nav">
          <a routerLink="/admin/galeria" routerLinkActive="active">
            <i class="fas fa-images"></i> Galería
          </a>
          <a routerLink="/admin/cards" routerLinkActive="active">
            <i class="fas fa-th-large"></i> Cards / Colección
          </a>
          <a routerLink="/admin/solicitudes" routerLinkActive="active">
            <i class="fas fa-inbox"></i> Solicitudes
          </a>
          <a routerLink="/admin/usuarios" routerLinkActive="active">
            <i class="fas fa-users"></i> Usuarios
          </a>
          <a routerLink="/admin/cotizador-settings" routerLinkActive="active">
            <i class="fas fa-calculator"></i> Ajustes Cotizador
          </a>
          <a routerLink="/admin/apariencia" routerLinkActive="active">
            <i class="fas fa-paint-roller"></i> Editor Visual (CMS)
          </a>
          <a routerLink="/admin/cuenta" routerLinkActive="active">
            <i class="fas fa-user-cog"></i> Cuenta
          </a>
          <a routerLink="/" class="sidebar-back">
            <i class="fas fa-arrow-left"></i> Volver al Sitio
          </a>
          <a (click)="auth.logout()" class="sidebar-logout">
            <i class="fas fa-sign-out-alt"></i> Cerrar Sesión
          </a>
        </nav>
      </aside>
      <main class="admin-main">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .admin-wrapper { display: flex; min-height: 100vh; padding-top: 70px; }
    .admin-sidebar {
      width: 260px; background: linear-gradient(180deg, #0a1a2f 0%, #0f2240 100%);
      border-right: 2px solid rgba(0,191,255,0.2); padding: 30px 0; flex-shrink: 0; position: fixed;
      top: 70px; bottom: 0; left: 0; z-index: 100; overflow-y: auto;
    }
    .sidebar-header { text-align: center; padding: 0 20px 25px; border-bottom: 1px solid rgba(255,255,255,0.08); }
    .sidebar-logo { width: 60px; height: 60px; object-fit: contain; margin-bottom: 10px; }
    .sidebar-header h2 { font-family: var(--comic-font); font-size: 1.2rem; color: #E91E9E; letter-spacing: 2px; text-transform: uppercase; }
    .sidebar-user { font-size: 0.8rem; color: #aaa; margin-top: 6px; }
    .sidebar-nav { padding: 20px 0; }
    .sidebar-nav a {
      display: flex; align-items: center; gap: 12px; padding: 14px 24px; color: #ccc;
      font-family: var(--comic-font); font-size: 0.95rem; letter-spacing: 1px; transition: all 0.2s;
      cursor: pointer; text-decoration: none;
    }
    .sidebar-nav a:hover { background: rgba(255,255,255,0.05); color: #fff; }
    .sidebar-nav a.active { background: rgba(233,30,158,0.15); color: #E91E9E; border-left: 3px solid #E91E9E; }
    .sidebar-nav a i { width: 20px; text-align: center; }
    .sidebar-back { margin-top: 30px !important; border-top: 1px solid rgba(255,255,255,0.08); }
    .sidebar-logout { color: #ff6b6b !important; }
    .admin-main { flex: 1; margin-left: 260px; padding: 30px; background: #06101e; min-height: calc(100vh - 70px); }
    @media (max-width: 768px) {
      .admin-sidebar { width: 200px; }
      .admin-main { margin-left: 200px; padding: 20px; }
    }
    @media (max-width: 480px) {
      .admin-wrapper { flex-direction: column; }
      .admin-sidebar { width: 100%; position: static; }
      .admin-main { margin-left: 0; }
    }
  `]
})
export class AdminLayoutComponent {
  constructor(public auth: AuthService) { }
}
