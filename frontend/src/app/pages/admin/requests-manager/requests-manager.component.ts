import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';

@Component({
    selector: 'app-requests-manager',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="admin-page">
      <div class="admin-page-header">
        <h1><i class="fas fa-inbox"></i> Solicitudes de Usuarios</h1>
        <p>Gestiona las peticiones y solicitudes enviadas por los usuarios</p>
        <div class="stats-row">
          <span class="stat-badge pending"><i class="fas fa-clock"></i> {{countByStatus('pendiente')}} Pendientes</span>
          <span class="stat-badge progress"><i class="fas fa-spinner"></i> {{countByStatus('en_proceso')}} En Proceso</span>
          <span class="stat-badge done"><i class="fas fa-check"></i> {{countByStatus('respondido')}} Respondidas</span>
          <span class="stat-badge total"><i class="fas fa-inbox"></i> {{requests.length}} Total</span>
        </div>
      </div>

      <!-- Filter -->
      <div class="filter-bar">
        <button *ngFor="let f of filters" class="filter-btn" [class.active]="activeFilter === f.value" (click)="activeFilter = f.value">
          <i [class]="f.icon"></i> {{f.label}}
        </button>
      </div>

      <div *ngIf="filteredRequests.length === 0" class="empty-state">
        <i class="fas fa-check-double"></i>
        <p>No hay solicitudes {{activeFilter !== 'all' ? 'con estado "' + activeFilter + '"' : ''}}</p>
      </div>

      <!-- Requests List -->
      <div *ngFor="let req of filteredRequests" class="request-card" [class.expanded]="expandedId === req.id">
        <div class="request-header" (click)="toggleExpand(req.id)">
          <div class="request-status" [class]="'status-' + req.status">
            {{ req.status === 'pendiente' ? '⏳' : req.status === 'en_proceso' ? '🔄' : '✅' }}
          </div>
          <div class="request-summary">
            <h3>{{req.asunto}}</h3>
            <p class="request-meta">
              <span><i class="fas fa-user"></i> {{req.nombre}}</span>
              <span><i class="fas fa-envelope"></i> {{req.email}}</span>
              <span *ngIf="req.telefono"><i class="fas fa-phone"></i> {{req.telefono}}</span>
              <span class="req-date"><i class="fas fa-calendar"></i> {{formatDate(req.createdAt)}}</span>
            </p>
          </div>
          <i class="fas fa-chevron-down expand-icon" [class.rotated]="expandedId === req.id"></i>
        </div>

        <div class="request-body" *ngIf="expandedId === req.id">
          <div class="message-block">
            <label>Mensaje del usuario:</label>
            <p>{{req.mensaje}}</p>
          </div>

          <div *ngIf="req.username" class="user-info-tag">
            <i class="fas fa-user-check"></i> Usuario registrado: <strong>{{req.username}}</strong>
          </div>

          <!-- Admin Controls -->
          <div class="admin-controls">
            <div class="control-row">
              <div class="form-group">
                <label>Estado</label>
                <select [(ngModel)]="req.status" [ngModelOptions]="{standalone: true}">
                  <option value="pendiente">⏳ Pendiente</option>
                  <option value="en_proceso">🔄 En Proceso</option>
                  <option value="respondido">✅ Respondido</option>
                </select>
              </div>
              <div class="form-group">
                <label>Respondido vía</label>
                <select [(ngModel)]="req.respondedVia" [ngModelOptions]="{standalone: true}">
                  <option value="">Sin responder</option>
                  <option value="email">📧 Email</option>
                  <option value="whatsapp">💬 WhatsApp</option>
                  <option value="llamada">📞 Llamada</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label>Notas del Admin</label>
              <textarea [(ngModel)]="req.adminNotes" [ngModelOptions]="{standalone: true}" placeholder="Notas internas sobre esta solicitud..." rows="3"></textarea>
            </div>
            <div class="actions-row">
              <button class="btn-save" (click)="saveRequest(req)">
                <i class="fas fa-save"></i> Guardar Cambios
              </button>
              <div class="respond-btns">
                <a *ngIf="req.email" [href]="'mailto:' + req.email + '?subject=Re: ' + req.asunto" class="respond-btn email" target="_blank" title="Enviar Email">
                  <i class="fas fa-envelope"></i> Email
                </a>
                <a *ngIf="req.telefono" [href]="'https://wa.me/57' + cleanPhone(req.telefono) + '?text=Hola ' + req.nombre + ', respecto a tu solicitud sobre ' + req.asunto" class="respond-btn whatsapp" target="_blank" title="Enviar WhatsApp">
                  <i class="fab fa-whatsapp"></i> WhatsApp
                </a>
                <a *ngIf="req.telefono" [href]="'tel:' + req.telefono" class="respond-btn call" title="Llamar">
                  <i class="fas fa-phone"></i> Llamar
                </a>
              </div>
              <button class="btn-delete" (click)="deleteRequest(req.id)">
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .admin-page { max-width: 900px; }
    .admin-page-header { margin-bottom: 20px; }
    .admin-page-header h1 { font-family: var(--comic-font); font-size: 1.8rem; color: #fff; letter-spacing: 2px; }
    .admin-page-header h1 i { color: #E91E9E; margin-right: 10px; }
    .admin-page-header p { color: #aaa; margin-top: 5px; }
    .stats-row { display: flex; gap: 10px; margin-top: 15px; flex-wrap: wrap; }
    .stat-badge {
      padding: 6px 14px; border-radius: 20px; font-size: 0.8rem; font-family: var(--comic-font);
      letter-spacing: 0.5px; display: flex; align-items: center; gap: 6px;
    }
    .stat-badge.pending { background: rgba(255,193,7,0.15); color: #ffc107; border: 1px solid rgba(255,193,7,0.3); }
    .stat-badge.progress { background: rgba(0,191,255,0.15); color: #00bfff; border: 1px solid rgba(0,191,255,0.3); }
    .stat-badge.done { background: rgba(0,255,136,0.15); color: #00ff88; border: 1px solid rgba(0,255,136,0.3); }
    .stat-badge.total { background: rgba(255,255,255,0.08); color: #ccc; border: 1px solid rgba(255,255,255,0.15); }

    .filter-bar { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
    .filter-btn {
      background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
      color: #aaa; padding: 8px 16px; border-radius: 20px; cursor: pointer;
      font-size: 0.8rem; transition: all 0.2s; font-family: var(--comic-font); letter-spacing: 0.5px;
    }
    .filter-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }
    .filter-btn.active { background: rgba(233,30,158,0.2); border-color: #E91E9E; color: #E91E9E; }

    .request-card {
      background: rgba(15,34,64,0.6); border: 1px solid rgba(0,191,255,0.12);
      border-radius: 10px; margin-bottom: 12px; overflow: hidden; transition: all 0.3s;
    }
    .request-card.expanded { border-color: rgba(0,191,255,0.3); box-shadow: 0 4px 20px rgba(0,0,0,0.3); }
    .request-header {
      display: flex; align-items: center; gap: 14px; padding: 16px 20px;
      cursor: pointer; transition: background 0.2s;
    }
    .request-header:hover { background: rgba(255,255,255,0.03); }
    .request-status { font-size: 1.4rem; }
    .request-summary { flex: 1; }
    .request-summary h3 { font-family: var(--comic-font); font-size: 1rem; color: #fff; letter-spacing: 0.5px; }
    .request-meta { display: flex; gap: 14px; flex-wrap: wrap; margin-top: 5px; }
    .request-meta span { font-size: 0.75rem; color: #888; display: flex; align-items: center; gap: 4px; }
    .request-meta .req-date { color: #666; }
    .expand-icon { color: #666; transition: transform 0.3s; }
    .expand-icon.rotated { transform: rotate(180deg); }

    .request-body { padding: 0 20px 20px; border-top: 1px solid rgba(255,255,255,0.06); }
    .message-block { background: rgba(0,0,0,0.2); padding: 14px; border-radius: 8px; margin: 14px 0; }
    .message-block label { font-size: 0.75rem; color: #888; font-family: var(--comic-font); letter-spacing: 0.5px; display: block; margin-bottom: 6px; }
    .message-block p { color: #ddd; font-size: 0.9rem; line-height: 1.6; white-space: pre-wrap; }
    .user-info-tag {
      display: inline-flex; align-items: center; gap: 6px;
      background: rgba(0,191,255,0.1); border: 1px solid rgba(0,191,255,0.2);
      padding: 5px 12px; border-radius: 4px; font-size: 0.8rem; color: #00BFFF; margin-bottom: 14px;
    }

    .admin-controls { margin-top: 10px; }
    .control-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .form-group { margin-bottom: 12px; }
    .form-group label { display: block; font-size: 0.75rem; color: #aaa; margin-bottom: 4px; font-family: var(--comic-font); letter-spacing: 0.5px; }
    .form-group select, .form-group textarea {
      width: 100%; padding: 9px 12px; background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.15); border-radius: 6px;
      color: #fff; font-size: 0.85rem; outline: none; transition: border-color 0.3s; resize: vertical;
    }
    .form-group select:focus, .form-group textarea:focus { border-color: #00BFFF; }

    .actions-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .btn-save {
      background: linear-gradient(135deg, #00BFFF, #0088cc); border: none;
      color: #fff; padding: 9px 20px; border-radius: 6px; cursor: pointer;
      font-family: var(--comic-font); font-size: 0.85rem; letter-spacing: 0.5px;
      display: flex; align-items: center; gap: 6px; transition: all 0.2s;
    }
    .btn-save:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,191,255,0.3); }

    .respond-btns { display: flex; gap: 6px; margin-left: auto; }
    .respond-btn {
      padding: 8px 14px; border-radius: 6px; font-size: 0.8rem;
      display: flex; align-items: center; gap: 5px; text-decoration: none;
      transition: all 0.2s; font-family: var(--comic-font); letter-spacing: 0.5px;
    }
    .respond-btn.email { background: rgba(0,191,255,0.15); color: #00BFFF; border: 1px solid rgba(0,191,255,0.3); }
    .respond-btn.whatsapp { background: rgba(37,211,102,0.15); color: #25d366; border: 1px solid rgba(37,211,102,0.3); }
    .respond-btn.call { background: rgba(233,30,158,0.15); color: #E91E9E; border: 1px solid rgba(233,30,158,0.3); }
    .respond-btn:hover { transform: translateY(-1px); }

    .btn-delete {
      background: rgba(255,50,50,0.15); border: 1px solid rgba(255,50,50,0.3);
      color: #ff6b6b; width: 36px; height: 36px; border-radius: 6px; cursor: pointer;
      display: flex; align-items: center; justify-content: center; transition: all 0.2s;
    }
    .btn-delete:hover { background: rgba(255,50,50,0.3); }

    .empty-state { text-align: center; padding: 50px; color: #555; }
    .empty-state i { font-size: 3rem; margin-bottom: 10px; }
    @media (max-width: 768px) {
      .control-row { grid-template-columns: 1fr; }
      .actions-row { flex-direction: column; align-items: stretch; }
      .respond-btns { margin-left: 0; justify-content: center; }
    }
  `]
})
export class RequestsManagerComponent implements OnInit {
    requests: any[] = [];
    expandedId = '';
    activeFilter = 'all';
    filters = [
        { value: 'all', label: 'Todas', icon: 'fas fa-inbox' },
        { value: 'pendiente', label: 'Pendientes', icon: 'fas fa-clock' },
        { value: 'en_proceso', label: 'En Proceso', icon: 'fas fa-spinner' },
        { value: 'respondido', label: 'Respondidas', icon: 'fas fa-check' }
    ];

    constructor(public api: ApiService) { }

    ngOnInit() { this.loadRequests(); }

    loadRequests() {
        this.api.getRequests().subscribe(data => this.requests = data);
    }

    get filteredRequests() {
        if (this.activeFilter === 'all') return this.requests;
        return this.requests.filter(r => r.status === this.activeFilter);
    }

    countByStatus(status: string): number {
        return this.requests.filter(r => r.status === status).length;
    }

    toggleExpand(id: string) {
        this.expandedId = this.expandedId === id ? '' : id;
    }

    saveRequest(req: any) {
        this.api.updateRequest(req.id, {
            status: req.status,
            adminNotes: req.adminNotes,
            respondedVia: req.respondedVia
        }).subscribe(() => {
            this.loadRequests();
        });
    }

    deleteRequest(id: string) {
        if (confirm('¿Eliminar esta solicitud?')) {
            this.api.deleteRequest(id).subscribe(() => this.loadRequests());
        }
    }

    cleanPhone(phone: string): string {
        return phone.replace(/\D/g, '');
    }

    formatDate(iso: string): string {
        const d = new Date(iso);
        return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
}
