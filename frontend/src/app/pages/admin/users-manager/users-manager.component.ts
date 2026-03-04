import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';

@Component({
    selector: 'app-users-manager',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="admin-page">
      <div class="admin-page-header">
        <h1><i class="fas fa-users"></i> Usuarios Registrados</h1>
        <p>Visualiza y gestiona los usuarios registrados en la plataforma</p>
        <div class="stats-row">
          <span class="stat-badge total"><i class="fas fa-users"></i> {{users.length}} Total</span>
          <span class="stat-badge admins"><i class="fas fa-user-shield"></i> {{countByRole('admin')}} Admins</span>
          <span class="stat-badge regulars"><i class="fas fa-user"></i> {{countByRole('user')}} Usuarios</span>
        </div>
      </div>

      <div *ngIf="users.length === 0" class="empty-state">
        <i class="fas fa-user-slash"></i>
        <p>No hay usuarios registrados todavía</p>
      </div>

      <!-- Users Table -->
      <div class="users-table-wrapper" *ngIf="users.length > 0">
        <table class="users-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Rol</th>
              <th>Registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let u of users" [class.is-admin]="u.role === 'admin'">
              <td class="user-col">
                <i class="fas" [class.fa-user-shield]="u.role === 'admin'" [class.fa-user]="u.role !== 'admin'"
                   [style.color]="u.role === 'admin' ? '#E91E9E' : '#00BFFF'"></i>
                {{u.username}}
              </td>
              <td>{{u.nombre || '—'}}</td>
              <td>
                <a *ngIf="u.email" [href]="'mailto:' + u.email" class="data-link">
                  <i class="fas fa-envelope"></i> {{u.email}}
                </a>
                <span *ngIf="!u.email" class="no-data">—</span>
              </td>
              <td>
                <a *ngIf="u.telefono" [href]="'tel:' + u.telefono" class="data-link">
                  <i class="fas fa-phone"></i> {{u.telefono}}
                </a>
                <span *ngIf="!u.telefono" class="no-data">—</span>
              </td>
              <td>
                <span class="role-badge" [class.role-admin]="u.role === 'admin'" [class.role-user]="u.role === 'user'">
                  {{u.role === 'admin' ? 'Admin' : 'Usuario'}}
                </span>
              </td>
              <td class="date-col">{{formatDate(u.createdAt)}}</td>
              <td>
                <div class="action-btns">
                  <a *ngIf="u.telefono" [href]="'https://wa.me/57' + cleanPhone(u.telefono)" target="_blank" class="action-btn whatsapp" title="WhatsApp">
                    <i class="fab fa-whatsapp"></i>
                  </a>
                  <a *ngIf="u.email" [href]="'mailto:' + u.email" class="action-btn email" title="Enviar Email">
                    <i class="fas fa-envelope"></i>
                  </a>
                  <button *ngIf="u.role !== 'admin'" class="action-btn delete" (click)="deleteUser(u)" title="Eliminar">
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
    styles: [`
    .admin-page { max-width: 960px; }
    .admin-page-header { margin-bottom: 24px; }
    .admin-page-header h1 { font-family: var(--comic-font); font-size: 1.8rem; color: #fff; letter-spacing: 2px; }
    .admin-page-header h1 i { color: #00BFFF; margin-right: 10px; }
    .admin-page-header p { color: #aaa; margin-top: 5px; }

    .stats-row { display: flex; gap: 10px; margin-top: 15px; flex-wrap: wrap; }
    .stat-badge {
      padding: 6px 14px; border-radius: 20px; font-size: 0.8rem; font-family: var(--comic-font);
      letter-spacing: 0.5px; display: flex; align-items: center; gap: 6px;
    }
    .stat-badge.total { background: rgba(255,255,255,0.08); color: #ccc; border: 1px solid rgba(255,255,255,0.15); }
    .stat-badge.admins { background: rgba(233,30,158,0.15); color: #E91E9E; border: 1px solid rgba(233,30,158,0.3); }
    .stat-badge.regulars { background: rgba(0,191,255,0.15); color: #00BFFF; border: 1px solid rgba(0,191,255,0.3); }

    .users-table-wrapper {
      overflow-x: auto; border: 1px solid rgba(0,191,255,0.12); border-radius: 10px;
      background: rgba(15,34,64,0.5);
    }
    .users-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
    .users-table thead { background: rgba(0,191,255,0.08); }
    .users-table th {
      padding: 12px 14px; text-align: left; font-family: var(--comic-font);
      font-size: 0.75rem; color: #888; letter-spacing: 1px; text-transform: uppercase;
      border-bottom: 1px solid rgba(0,191,255,0.15);
    }
    .users-table td {
      padding: 12px 14px; border-bottom: 1px solid rgba(255,255,255,0.05);
      color: #ddd; vertical-align: middle;
    }
    .users-table tr:hover { background: rgba(255,255,255,0.03); }
    .users-table tr.is-admin { background: rgba(233,30,158,0.04); }

    .user-col { font-family: var(--comic-font); letter-spacing: 0.5px; display: flex; align-items: center; gap: 8px; }
    .date-col { color: #666; font-size: 0.8rem; }
    .no-data { color: #555; }

    .data-link {
      color: #aaa; text-decoration: none; display: flex; align-items: center; gap: 5px;
      font-size: 0.82rem; transition: color 0.2s;
    }
    .data-link:hover { color: #00BFFF; }
    .data-link i { font-size: 0.7rem; }

    .role-badge {
      padding: 3px 10px; border-radius: 12px; font-size: 0.72rem;
      font-family: var(--comic-font); letter-spacing: 0.5px;
    }
    .role-admin { background: rgba(233,30,158,0.2); color: #E91E9E; border: 1px solid rgba(233,30,158,0.3); }
    .role-user { background: rgba(0,191,255,0.12); color: #00BFFF; border: 1px solid rgba(0,191,255,0.2); }

    .action-btns { display: flex; gap: 6px; }
    .action-btn {
      width: 30px; height: 30px; border-radius: 6px; display: flex; align-items: center;
      justify-content: center; cursor: pointer; transition: all 0.2s; border: none;
      text-decoration: none; font-size: 0.8rem;
    }
    .action-btn.whatsapp { background: rgba(37,211,102,0.15); color: #25d366; border: 1px solid rgba(37,211,102,0.3); }
    .action-btn.email { background: rgba(0,191,255,0.15); color: #00BFFF; border: 1px solid rgba(0,191,255,0.3); }
    .action-btn.delete { background: rgba(255,50,50,0.12); color: #ff6b6b; border: 1px solid rgba(255,50,50,0.25); }
    .action-btn:hover { transform: translateY(-1px); filter: brightness(1.2); }

    .empty-state { text-align: center; padding: 60px; color: #555; }
    .empty-state i { font-size: 3rem; margin-bottom: 10px; }

    @media (max-width: 768px) {
      .users-table { font-size: 0.78rem; }
      .users-table th, .users-table td { padding: 10px 8px; }
      .action-btn { width: 28px; height: 28px; font-size: 0.75rem; }
    }
  `]
})
export class UsersManagerComponent implements OnInit {
    users: any[] = [];

    constructor(private api: ApiService) { }

    ngOnInit() { this.loadUsers(); }

    loadUsers() {
        this.api.getUsers().subscribe(data => {
            this.users = data.sort((a: any, b: any) => {
                if (a.role === 'admin') return -1;
                if (b.role === 'admin') return 1;
                return 0;
            });
        });
    }

    countByRole(role: string): number {
        return this.users.filter(u => u.role === role).length;
    }

    deleteUser(user: any) {
        if (confirm(`¿Eliminar al usuario "${user.username}"? Esta acción no se puede deshacer.`)) {
            this.api.deleteUser(user.id).subscribe({
                next: () => this.loadUsers(),
                error: (err) => alert(err.error?.error || 'Error al eliminar')
            });
        }
    }

    cleanPhone(phone: string): string {
        return phone.replace(/\D/g, '');
    }

    formatDate(iso: string): string {
        if (!iso) return '—';
        const d = new Date(iso);
        return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
    }
}
