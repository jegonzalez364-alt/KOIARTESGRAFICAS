import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, GallerySlide } from '../../../services/api.service';
import imageCompression from 'browser-image-compression';

@Component({
  selector: 'app-gallery-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-page">
      <div class="admin-page-header">
        <h1><i class="fas fa-images"></i> Gestor de Galería</h1>
        <p>Administra los slides del carrusel de la página principal</p>
      </div>

      <!-- Add New Slide -->
      <div class="admin-card">
        <h3><i class="fas fa-plus-circle"></i> Agregar Nuevo Slide</h3>
        <form (ngSubmit)="addSlide()" class="admin-form">
          <div class="form-row">
            <div class="form-group">
              <label>Tipo</label>
              <select [(ngModel)]="newSlide.type" name="type">
                <option value="image">Imagen</option>
                <option value="video">Video</option>
                <option value="youtube">YouTube</option>
              </select>
            </div>
            <div class="form-group">
              <label>Descripción (alt)</label>
              <input type="text" [(ngModel)]="newSlide.alt" name="alt" placeholder="Descripción del slide" />
            </div>
          </div>
          <div class="form-group" *ngIf="newSlide.type !== 'youtube'">
            <label>Subir archivo (imagen o video)</label>
            <input type="file" (change)="onFileSelected($event)" [accept]="newSlide.type === 'video' ? 'video/*' : 'image/*'" class="file-input" />
          </div>
          <div class="form-group">
            <label>{{ newSlide.type === 'youtube' ? 'URL de YouTube' : 'O ingresar URL directa' }}</label>
            <input type="text" [(ngModel)]="newSlide.src" name="src"
              [placeholder]="newSlide.type === 'youtube' ? 'https://www.youtube.com/watch?v=... o https://youtu.be/...' : 'https://...'"
              (input)="onUrlInput()" />
            <small *ngIf="newSlide.type === 'youtube'" class="yt-hint">
              <i class="fab fa-youtube"></i> Acepta: youtube.com/watch?v=, youtu.be/, youtube.com/shorts/, youtube.com/embed/
            </small>
          </div>
          <button type="submit" class="btn-primary" [disabled]="adding">
            <i class="fas" [class.fa-spinner]="adding" [class.fa-spin]="adding" [class.fa-plus]="!adding"></i>
            {{ adding ? 'Agregando...' : 'Agregar Slide' }}
          </button>
        </form>
      </div>

      <!-- Current Slides -->
      <div class="admin-card">
        <h3><i class="fas fa-list"></i> Slides Actuales ({{slides.length}})</h3>
        <div *ngIf="slides.length === 0" class="empty-state">
          <i class="fas fa-image"></i>
          <p>No hay slides en la galería</p>
        </div>
        <div class="admin-grid">
          <div *ngFor="let slide of slides" class="admin-item">
            <div class="item-preview">
              <img *ngIf="slide.type === 'image'" [src]="api.getMediaUrl(slide.src)" [alt]="slide.alt" />
              <video *ngIf="slide.type === 'video'" [src]="api.getMediaUrl(slide.src)" muted></video>
              <img *ngIf="slide.type === 'youtube'" [src]="api.getYouTubeThumbnail(slide.src)" [alt]="slide.alt" />
              <span class="item-badge">{{ slide.type === 'youtube' ? '▶ YouTube' : (slide.type === 'video' ? '🎬 Video' : '🖼️ Imagen') }}</span>
            </div>
            <div class="item-info">
              <p class="item-title">{{slide.alt}}</p>
              <p class="item-meta">Orden: {{slide.order}}</p>
            </div>
            <button class="btn-delete" (click)="deleteSlide(slide.id)" title="Eliminar">
              <i class="fas fa-trash-alt"></i>
            </button>
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
    .admin-form .form-row { display: grid; grid-template-columns: 1fr 2fr; gap: 15px; }
    .admin-form .form-group { margin-bottom: 15px; }
    .admin-form label { display: block; font-size: 0.85rem; color: #ccc; margin-bottom: 5px; font-family: var(--comic-font); letter-spacing: 1px; }
    .admin-form input, .admin-form select {
      width: 100%; padding: 10px 14px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15);
      border-radius: 6px; color: #fff; font-size: 0.9rem; outline: none; transition: border-color 0.3s;
    }
    .admin-form input:focus, .admin-form select:focus { border-color: #00BFFF; }
    .file-input { padding: 8px !important; }
    .admin-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px; }
    .admin-item {
      background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.08);
      border-radius: 8px; overflow: hidden; position: relative;
    }
    .item-preview { height: 150px; overflow: hidden; position: relative; }
    .item-preview img, .item-preview video { width: 100%; height: 100%; object-fit: cover; }
    .item-badge {
      position: absolute; top: 8px; left: 8px; background: rgba(0,0,0,0.7); padding: 3px 10px;
      border-radius: 4px; font-size: 0.75rem; color: #fff;
    }
    .item-info { padding: 12px; }
    .item-title { font-size: 0.85rem; color: #fff; }
    .item-meta { font-size: 0.75rem; color: #888; margin-top: 4px; }
    .btn-delete {
      position: absolute; top: 8px; right: 8px; background: rgba(255,50,50,0.8); border: none;
      color: #fff; width: 32px; height: 32px; border-radius: 50%; cursor: pointer;
      display: flex; align-items: center; justify-content: center; transition: all 0.2s;
    }
    .btn-delete:hover { background: #ff3333; transform: scale(1.1); }
    .empty-state { text-align: center; padding: 40px; color: #666; }
    .empty-state i { font-size: 3rem; margin-bottom: 10px; }
    .yt-hint { display: block; margin-top: 6px; color: #ff4444; font-size: 0.75rem; letter-spacing: 0.5px; }
    .yt-hint i { margin-right: 4px; }
    @media (max-width: 768px) { .admin-form .form-row { grid-template-columns: 1fr; } }
  `]
})
export class GalleryManagerComponent implements OnInit {
  slides: GallerySlide[] = [];
  newSlide = { type: 'image' as 'image' | 'video' | 'youtube', alt: '', src: '' };
  selectedFile: File | null = null;
  adding = false;

  constructor(public api: ApiService) { }

  ngOnInit() { this.loadSlides(); }

  loadSlides() {
    this.api.getGallery().subscribe(data => this.slides = data);
  }

  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        try {
          const options = { maxSizeMB: 2, maxWidthOrHeight: 1920, useWebWorker: true };
          this.selectedFile = await imageCompression(file, options) as File;
        } catch (error) {
          console.error('Error al comprimir:', error);
          this.selectedFile = file;
        }
      } else {
        this.selectedFile = file;
      }
    } else {
      this.selectedFile = null;
    }
  }

  addSlide() {
    this.adding = true;
    const formData = new FormData();
    formData.append('type', this.newSlide.type);
    formData.append('alt', this.newSlide.alt);
    if (this.selectedFile) {
      formData.append('media', this.selectedFile);
    } else {
      formData.append('src', this.newSlide.src);
    }
    this.api.addGallerySlide(formData).subscribe({
      next: () => {
        this.loadSlides();
        this.newSlide = { type: 'image', alt: '', src: '' };
        this.selectedFile = null;
        this.adding = false;
      },
      error: () => this.adding = false
    });
  }

  // Auto-detect YouTube URLs and switch type
  onUrlInput() {
    if (this.api.isYouTubeUrl(this.newSlide.src)) {
      this.newSlide.type = 'youtube';
    }
  }

  deleteSlide(id: string) {
    if (confirm('¿Eliminar este slide?')) {
      this.api.deleteGallerySlide(id).subscribe(() => this.loadSlides());
    }
  }
}
