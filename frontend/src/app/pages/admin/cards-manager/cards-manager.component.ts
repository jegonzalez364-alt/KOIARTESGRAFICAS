import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Card } from '../../../services/api.service';

@Component({
  selector: 'app-cards-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-page">
      <div class="admin-page-header">
        <h1><i class="fas fa-th-large"></i> Gestor de Cards</h1>
        <p>Administra las tarjetas de producto de la colección</p>
      </div>

      <!-- Add / Edit Card -->
      <div class="admin-card">
        <h3><i class="fas" [class.fa-plus-circle]="!editing" [class.fa-edit]="editing"></i>
          {{ editing ? 'Editar Card' : 'Agregar Nueva Card' }}
        </h3>
        <form (ngSubmit)="editing ? updateCard() : addCard()" class="admin-form">
          <div class="form-row">
            <div class="form-group">
              <label>Título</label>
              <input type="text" [(ngModel)]="form.title" name="title" placeholder="Nombre del producto" required />
            </div>
            <div class="form-group">
              <label>Tag (opcional)</label>
              <input type="text" [(ngModel)]="form.tag" name="tag" placeholder="Ej: Bestseller, Especial" />
            </div>
          </div>
          <div class="form-group">
            <label>Descripción</label>
            <textarea [(ngModel)]="form.description" name="description" rows="3" placeholder="Descripción del producto"></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Texto del botón</label>
              <input type="text" [(ngModel)]="form.btnText" name="btnText" placeholder="Ver Más" />
            </div>
            <div class="form-group">
              <label>Link del botón</label>
              <input type="text" [(ngModel)]="form.btnLink" name="btnLink" placeholder="#" />
            </div>
          </div>
          <div class="form-group">
            <label>Imagen (subir archivo)</label>
            <div class="file-row">
              <input type="file" id="mainImageInput" (change)="onFileSelected($event)" accept="image/*" class="file-input-hidden" />
              <label for="mainImageInput" class="comic-file-btn"><i class="fas fa-upload"></i> Seleccionar</label>
              <span class="file-name-box" *ngIf="selectedFile"><i class="fas fa-file-image"></i> {{selectedFile.name}}</span>
            </div>
          </div>
          <div class="form-group">
            <label>O URL de imagen</label>
            <input type="text" [(ngModel)]="form.imageSrc" name="imageSrc" placeholder="https://..." />
          </div>
          <div class="form-group gallery-upload-group">
            <label>Imágenes de Galería (Modal)</label>
            <input type="file" id="galleryImagesInput" (change)="onGalleryFilesSelected($event)" accept="image/*" multiple class="file-input-hidden" />
            <label for="galleryImagesInput" class="comic-file-btn"><i class="fas fa-images"></i> Elegir Archivos</label>
            
            <div class="gallery-preview-container" *ngIf="keptGalleryImages.length > 0 || selectedGalleryFiles.length > 0">
              <div class="preview-item" *ngFor="let img of keptGalleryImages; let i = index">
                <img [src]="api.getMediaUrl(img)" />
                <button type="button" class="btn-remove" (click)="removeKeptGalleryImage(i)"><i class="fas fa-times"></i></button>
                <div class="move-actions">
                  <button type="button" (click)="moveKeptImage(i, -1)"><i class="fas fa-chevron-left"></i></button>
                  <button type="button" (click)="moveKeptImage(i, 1)"><i class="fas fa-chevron-right"></i></button>
                </div>
              </div>
              
              <div class="preview-item new-file" *ngFor="let file of selectedGalleryFiles; let i = index">
                <div class="file-placeholder"><i class="fas fa-file-image"></i><br>Nuevo</div>
                <button type="button" class="btn-remove" (click)="removeSelectedGalleryFile(i)"><i class="fas fa-times"></i></button>
                <div class="move-actions">
                  <button type="button" (click)="moveSelectedFile(i, -1)"><i class="fas fa-chevron-left"></i></button>
                  <button type="button" (click)="moveSelectedFile(i, 1)"><i class="fas fa-chevron-right"></i></button>
                </div>
              </div>
            </div>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn-primary" [disabled]="saving">
              <i class="fas" [class.fa-spinner]="saving" [class.fa-spin]="saving" [class.fa-save]="!saving"></i>
              {{ saving ? 'Guardando...' : (editing ? 'Guardar Cambios' : 'Agregar Card') }}
            </button>
            <button *ngIf="editing" type="button" class="btn-secondary btn-cancel" (click)="cancelEdit()">
              <i class="fas fa-times"></i> Cancelar
            </button>
          </div>
        </form>
      </div>

      <!-- Cards List -->
      <div class="admin-card">
        <h3><i class="fas fa-list"></i> Cards Actuales ({{cards.length}})</h3>
        <div *ngIf="cards.length === 0" class="empty-state">
          <i class="fas fa-th-large"></i>
          <p>No hay cards</p>
        </div>
        <div class="admin-grid">
          <div *ngFor="let card of cards" class="admin-item card-item">
            <div class="item-preview">
              <img *ngIf="card.image" [src]="api.getMediaUrl(card.image)" [alt]="card.title" />
              <div *ngIf="!card.image" class="no-image"><i class="fas fa-image"></i></div>
              <span *ngIf="card.tag" class="item-badge tag-badge">{{card.tag}}</span>
              <span class="item-badge number-badge">{{card.number}}</span>
            </div>
            <div class="item-info">
              <p class="item-title">{{card.title}}</p>
              <p class="item-desc">{{card.description}}</p>
            </div>
            <div class="item-actions">
              <button class="btn-order" (click)="moveCard(card.id, -1)" title="Subir">
                <i class="fas fa-arrow-up"></i>
              </button>
              <button class="btn-order" (click)="moveCard(card.id, 1)" title="Bajar">
                <i class="fas fa-arrow-down"></i>
              </button>
              <button class="btn-edit" (click)="editCard(card)" title="Editar">
                <i class="fas fa-pen"></i>
              </button>
              <button class="btn-delete" (click)="deleteCard(card.id)" title="Eliminar">
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
    .admin-page-header { margin-bottom: 30px; }
    .admin-page-header h1 { font-family: var(--comic-font); font-size: 1.8rem; color: #fff; letter-spacing: 2px; }
    .admin-page-header h1 i { color: #E91E9E; margin-right: 10px; }
    .admin-page-header p { color: #aaa; margin-top: 5px; }
    .admin-card {
      background: rgba(15,34,64,0.6); border: 1px solid rgba(0,191,255,0.15);
      border-radius: 10px; padding: 25px; margin-bottom: 25px;
    }
    .admin-card h3 { font-family: var(--comic-font); color: #00BFFF; font-size: 1.1rem; margin-bottom: 20px; letter-spacing: 1px; }
    .admin-card h3 i { margin-right: 8px; }
    .admin-form .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
    .admin-form .form-group { margin-bottom: 15px; }
    .admin-form label { display: block; font-size: 0.85rem; color: #ccc; margin-bottom: 5px; font-family: var(--comic-font); letter-spacing: 1px; }
    .admin-form input, .admin-form select, .admin-form textarea {
      width: 100%; padding: 10px 14px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15);
      border-radius: 6px; color: #fff; font-size: 0.9rem; outline: none; transition: border-color 0.3s;
      font-family: inherit;
    }
    .admin-form input:focus, .admin-form select:focus, .admin-form textarea:focus { border-color: #00BFFF; }
    .admin-form textarea { resize: vertical; }
    .file-input-hidden { display: none; }
    .comic-file-btn {
      display: inline-flex; align-items: center; gap: 6px;
      width: fit-content;
      padding: 7px 14px; background: var(--yellow); color: var(--black);
      font-family: var(--comic-font); font-size: 0.75rem; font-weight: 900;
      letter-spacing: 1px; border: 2px solid var(--black);
      border-radius: 4px; cursor: pointer;
      box-shadow: 3px 3px 0 var(--black); transition: all 0.2s ease;
      text-transform: uppercase; margin-top: 6px;
    }
    .comic-file-btn:hover {
      background: #fff; transform: translateY(-2px);
      box-shadow: 4px 4px 0 var(--black);
    }
    .file-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .file-name-box {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 5px 12px; background: rgba(0,191,255,0.1);
      border: 1px solid rgba(0,191,255,0.3); border-radius: 4px;
      color: #aae; font-size: 0.8rem; max-width: 250px;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .file-name-box i { color: #00BFFF; }
    .form-actions { display: flex; gap: 10px; }
    .btn-cancel { background: transparent !important; border-color: #aaa !important; color: #aaa !important; }
    .admin-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px; }
    .admin-item {
      background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.08);
      border-radius: 8px; overflow: hidden; position: relative;
    }
    .item-preview { height: 140px; overflow: hidden; position: relative; }
    .item-preview img { width: 100%; height: 100%; object-fit: cover; }
    .no-image { height: 100%; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.03); color: #555; font-size: 2rem; }
    .item-badge { position: absolute; padding: 3px 10px; border-radius: 4px; font-size: 0.75rem; color: #fff; }
    .tag-badge { top: 8px; left: 8px; background: rgba(233,30,158,0.8); }
    .number-badge { top: 8px; right: 8px; background: rgba(0,0,0,0.7); }
    .item-info { padding: 12px; }
    .item-title { font-size: 0.9rem; color: #fff; font-weight: bold; }
    .item-desc { font-size: 0.8rem; color: #888; margin-top: 4px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .item-actions { display: flex; gap: 6px; position: absolute; bottom: 8px; right: 8px; }
    .btn-edit, .btn-delete {
      border: none; color: #fff; width: 32px; height: 32px; border-radius: 50%; cursor: pointer;
      display: flex; align-items: center; justify-content: center; transition: all 0.2s;
    }
    .btn-edit { background: rgba(0,191,255,0.7); }
    .btn-edit:hover { background: #00BFFF; transform: scale(1.1); }
    .btn-delete { background: rgba(255,50,50,0.7); }
    .btn-delete:hover { background: #ff3333; transform: scale(1.1); }
    .btn-order { background: rgba(255,255,255,0.15); }
    .btn-order:hover { background: rgba(255,255,255,0.3); transform: scale(1.1); }
    .empty-state { text-align: center; padding: 40px; color: #666; }
    .empty-state i { font-size: 3rem; margin-bottom: 10px; }
    
    .gallery-preview-container { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px; }
    .preview-item { position: relative; width: 80px; height: 80px; border-radius: 6px; overflow: hidden; border: 1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.3); }
    .preview-item img { width: 100%; height: 100%; object-fit: cover; }
    .file-placeholder { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #aaa; font-size: 0.7rem; }
    .btn-remove { position: absolute; top: 2px; right: 2px; background: rgba(255,0,0,0.8); color: white; border: none; width: 20px; height: 20px; border-radius: 50%; font-size: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
    .move-actions { position: absolute; bottom: 0; left: 0; width: 100%; display: flex; justify-content: space-between; background: rgba(0,0,0,0.6); padding: 2px 5px; }
    .move-actions button { background: none; border: none; color: white; cursor: pointer; font-size: 10px; }

    @media (max-width: 768px) { .admin-form .form-row { grid-template-columns: 1fr; } }
  `]
})
export class CardsManagerComponent implements OnInit {
  cards: Card[] = [];
  form = { title: '', description: '', btnText: 'Ver Más', btnLink: '#', tag: '', imageSrc: '' };
  selectedFile: File | null = null;
  selectedGalleryFiles: File[] = [];
  keptGalleryImages: string[] = [];
  editing = false;
  editingId = '';
  saving = false;

  constructor(public api: ApiService) { }

  ngOnInit() { this.loadCards(); }

  loadCards() {
    this.api.getCards().subscribe(data => this.cards = data);
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0] || null;
  }

  onGalleryFilesSelected(event: any) {
    if (event.target.files) {
      const files = Array.from(event.target.files) as File[];
      this.selectedGalleryFiles.push(...files);
    }
  }

  removeSelectedGalleryFile(index: number) {
    this.selectedGalleryFiles.splice(index, 1);
  }

  removeKeptGalleryImage(index: number) {
    this.keptGalleryImages.splice(index, 1);
  }

  moveKeptImage(index: number, direction: number) {
    if (index + direction < 0 || index + direction >= this.keptGalleryImages.length) return;
    const temp = this.keptGalleryImages[index];
    this.keptGalleryImages[index] = this.keptGalleryImages[index + direction];
    this.keptGalleryImages[index + direction] = temp;
  }

  moveSelectedFile(index: number, direction: number) {
    if (index + direction < 0 || index + direction >= this.selectedGalleryFiles.length) return;
    const temp = this.selectedGalleryFiles[index];
    this.selectedGalleryFiles[index] = this.selectedGalleryFiles[index + direction];
    this.selectedGalleryFiles[index + direction] = temp;
  }

  addCard() {
    this.saving = true;
    const formData = new FormData();
    formData.append('title', this.form.title);
    formData.append('description', this.form.description);
    formData.append('btnText', this.form.btnText);
    formData.append('btnLink', this.form.btnLink);
    formData.append('tag', this.form.tag);
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    } else {
      formData.append('imageSrc', this.form.imageSrc);
    }
    if (this.keptGalleryImages.length > 0) {
      formData.append('keptGalleryImages', JSON.stringify(this.keptGalleryImages));
    }
    if (this.selectedGalleryFiles.length > 0) {
      for (let i = 0; i < this.selectedGalleryFiles.length; i++) {
        formData.append('galleryFiles', this.selectedGalleryFiles[i]);
      }
    }
    this.api.addCard(formData).subscribe({
      next: () => { this.loadCards(); this.resetForm(); this.saving = false; },
      error: () => this.saving = false
    });
  }

  editCard(card: Card) {
    this.editing = true;
    this.editingId = card.id;
    this.form = {
      title: card.title,
      description: card.description,
      btnText: card.btnText,
      btnLink: card.btnLink,
      tag: card.tag,
      imageSrc: card.image
    };
    this.keptGalleryImages = card.galleryImages ? [...card.galleryImages] : [];
    this.selectedGalleryFiles = [];
  }

  updateCard() {
    this.saving = true;
    const formData = new FormData();
    formData.append('title', this.form.title);
    formData.append('description', this.form.description);
    formData.append('btnText', this.form.btnText);
    formData.append('btnLink', this.form.btnLink);
    formData.append('tag', this.form.tag);
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }
    if (this.keptGalleryImages.length > 0) {
      formData.append('keptGalleryImages', JSON.stringify(this.keptGalleryImages));
    }
    if (this.selectedGalleryFiles.length > 0) {
      for (let i = 0; i < this.selectedGalleryFiles.length; i++) {
        formData.append('galleryFiles', this.selectedGalleryFiles[i]);
      }
    }
    this.api.updateCard(this.editingId, formData).subscribe({
      next: () => { this.loadCards(); this.cancelEdit(); this.saving = false; },
      error: () => this.saving = false
    });
  }

  deleteCard(id: string) {
    if (confirm('¿Eliminar esta card?')) {
      this.api.deleteCard(id).subscribe(() => this.loadCards());
    }
  }

  cancelEdit() {
    this.editing = false;
    this.editingId = '';
    this.resetForm();
  }

  resetForm() {
    this.form = { title: '', description: '', btnText: 'Ver Más', btnLink: '#', tag: '', imageSrc: '' };
    this.selectedFile = null;
    this.selectedGalleryFiles = [];
    this.keptGalleryImages = [];
  }

  moveCard(cardId: string, direction: number) {
    this.api.reorderCards(cardId, direction).subscribe(data => this.cards = data);
  }
}
