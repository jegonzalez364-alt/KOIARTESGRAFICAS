import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, SiteSettings } from '../../../services/api.service';

@Component({
  selector: 'app-appearance-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './appearance-manager.component.html',
  styleUrls: ['./appearance-manager.component.css']
})
export class AppearanceManagerComponent implements OnInit {
  settings: SiteSettings = {
    primaryColor: '#E91E9E', secondaryColor: '#00BFFF', accentColor: '#FFD700',
    bgColor: '#06101e', cardBgColor: '#f5f0e8',
    logoUrl: 'img/logoicon.png', heroBgUrl: '/img/KoiFondo.png',
    heroMascotUrl: 'img/Koi-Icono.png', missionMascotUrl: 'img/DragonRojoDiseñador.png',
    heroTitle: 'Transformamos tus Ideas en', heroHighlightItem1: 'Arte Láser',
    heroHighlightItem2: 'Regalos Únicos', heroHighlightItem3: 'Diseño Creativo',
    heroSubtitle: 'Personalizamos cada detalle para sorprender.',
    heroBtnText: 'Explorar Catálogo', heroActionWord: '¡BAM!',
    missionTitle: 'Tu idea, nuestra misión', missionSubtitle: 'Siempre encontramos la forma de hacerla posible. 🤯',
    missionActionWord: '¡BOOM!', contactTitle: 'Contáctanos',
    contactSubtitle: '¿Tienes una idea? ¡Hagámosla realidad! Escríbenos y nuestro equipo te responderá más rápido que un rayo láser.',
    contactActionWord: '¡ZAP!'
  };

  originalSettings: any = null;
  saving = false;
  successMsg = '';
  errorMsg = '';

  // File uploads
  logoFile: File | null = null;
  heroBgFile: File | null = null;
  heroMascotFile: File | null = null;
  missionMascotFile: File | null = null;

  activeTab = 'colores';

  constructor(public api: ApiService) { }

  ngOnInit() {
    this.api.getSettings().subscribe({
      next: (res) => {
        if (res && res._id) {
          this.settings = { ...res };
          this.originalSettings = { ...res };
        }
      },
      error: () => this.errorMsg = 'Error al cargar la configuración. Se usarán valores por defecto.'
    });
  }

  onFileSelected(event: Event, type: 'logo' | 'heroBg' | 'heroMascot' | 'missionMascot') {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      if (type === 'logo') this.logoFile = file;
      if (type === 'heroBg') this.heroBgFile = file;
      if (type === 'heroMascot') this.heroMascotFile = file;
      if (type === 'missionMascot') this.missionMascotFile = file;
    }
  }

  saveSettings() {
    this.saving = true;
    this.successMsg = '';
    this.errorMsg = '';

    const formData = new FormData();
    Object.keys(this.settings).forEach(key => {
      if (key !== '_id' && (this.settings as any)[key] !== undefined) {
        formData.append(key, (this.settings as any)[key]);
      }
    });

    if (this.logoFile) formData.append('logoImage', this.logoFile);
    if (this.heroBgFile) formData.append('heroBgImage', this.heroBgFile);
    if (this.heroMascotFile) formData.append('heroMascotImage', this.heroMascotFile);
    if (this.missionMascotFile) formData.append('missionMascotImage', this.missionMascotFile);

    this.api.updateSettings(formData).subscribe({
      next: (res) => {
        this.settings = { ...res };
        this.originalSettings = { ...res };
        this.saving = false;
        this.successMsg = '¡Configuración guardada y aplicada exitosamente!';

        // Clear file inputs
        this.logoFile = null; this.heroBgFile = null;
        this.heroMascotFile = null; this.missionMascotFile = null;

        setTimeout(() => this.successMsg = '', 5000);
      },
      error: (err) => {
        this.saving = false;
        this.errorMsg = 'Error al guardar: ' + (err.error?.error || 'Error desconocido');
      }
    });
  }

  resetCurrentTab() {
    if (this.originalSettings) {
      this.settings = { ...this.originalSettings };
    }
  }
}
