import { Component, OnInit, ViewChild, ElementRef, DoCheck } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, SiteSettings } from '../../../services/api.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-appearance-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './appearance-manager.component.html',
  styleUrls: ['./appearance-manager.component.css']
})
export class AppearanceManagerComponent implements OnInit, DoCheck {
  @ViewChild('previewIframe') previewIframe!: ElementRef<HTMLIFrameElement>;
  settings: SiteSettings = {
    primaryColor: '#E91E9E', secondaryColor: '#00BFFF', accentColor: '#FFD700',
    bgColor: '#06101e', cardBgColor: '#f5f0e8',
    logoUrl: 'img/logoicon.png', heroBgUrl: '/img/KoiFondo.png',
    heroMascotUrl: 'img/Koi-Icono.png', missionMascotUrl: 'img/DragonRojoDiseñador.png',
    heroTitle: 'Transformamos tus Ideas en', heroHighlightItem1: 'Arte Láser',
    heroSubtitle: 'Personalizamos cada detalle para sorprender.',
    heroBtnText: 'Explorar Catálogo', heroActionWord: '¡BAM!',
    missionTitle: 'Tu idea, nuestra misión', missionSubtitle: 'Siempre encontramos la forma de hacerla posible. 🤯',
    missionActionWord: '¡BOOM!', contactTitle: 'Contáctanos',
    contactSubtitle: '¿Tienes una idea? ¡Hagámosla realidad! Escríbenos y nuestro equipo te responderá más rápido que un rayo láser.',
    contactActionWord: '¡ZAP!',
    servicesTitle: '¡Personalizamos tus mejores ideas!',
    service1Title: 'Personalización Total',
    service1Desc: 'Cualquier diseño que imagines, lo hacemos realidad...',
    service2Title: 'Corte Láser de Precisión',
    service2Desc: 'Trabajamos en madera, acrílico y más materiales...',
    service3Title: 'Fechas Especiales',
    service3Desc: 'Amor y Amistad, aniversarios, cumpleaños...',
    paymentsTitle: 'Pagos Fáciles',
    shippingTitle: 'Envíos Seguros y Rápidos',
    shippingItem1Title: 'Servientrega',
    shippingItem1Desc: 'Directo a tu puerta, a nivel nacional',
    shippingItem2Title: 'Interrapidísimo',
    shippingItem2Desc: 'Envíos rápidos y seguros a toda Colombia',
    socialTitle: 'Encuéntranos',
    socialWhatsapp: '318 690 9433',
    socialFacebook: 'KoiDesignsSoacha',
    socialInstagram: '@KoiDesignsSoacha',
    socialTiktok: '@koiartesgraficas',
    socialCatalogText: 'Ver Catálogo',
    ctaTitle: 'Contáctanos',
    ctaSubtitle: '¿Tienes una idea? ¡Hagámosla realidad!',
    ctaBtn1Text: 'Contáctanos',
    ctaBtn2Text: 'WhatsApp',
    footerText: '© 2024 KOI Design. Todos los derechos reservados. Hecho con 💚 y Láseres.',
    customBlocks: '[]',
    collectionMascotLeftUrl: 'img/dragoasomadonaranja.png',
    collectionMascotRightUrl: 'img/dragoasomadorojo.png',
    modalDragonLeftUrl: 'img/DragonTecnologico2.png',
    modalDragonRightUrl: 'img/DragonTecnologico.png',
    ctaBgUrl: '',
    cardBorderRadius: '4px', cardBorderColor: '#E91E9E', cardOpacity: '1',
    serviceCardBg: 'rgba(255,255,255,0.04)', serviceCardBorderRadius: '4px', serviceCardBorderColor: 'rgba(233,30,158,0.3)',
    infoBlockBg: 'rgba(255,255,255,0.03)', infoBlockBorderColor: 'rgba(255,215,0,0.25)', infoBlockBorderRadius: '4px',
    speechBubbleBg: 'rgba(6,16,30,0.85)', speechBubbleBorderColor: '#E91E9E', speechBubbleBorderRadius: '20px',
    ctaBtnBg: '#003333', ctaBtnColor: '#ffffff', ctaBtnBorderRadius: '30px',
    channelCardBg: 'rgba(255,255,255,0.04)', channelCardBorderColor: 'rgba(0,191,255,0.2)', channelCardBorderRadius: '4px',
    modalOverlayBg: 'rgba(0,0,0,0.92)', modalContentBg: '#0a1a2f', modalBorderColor: '#E91E9E',
    missionBannerBg: 'rgba(255,255,255,0.04)', missionBannerBorderColor: 'rgba(0,191,255,0.25)'
  };

  activeTab = 'colores';
  previewUrl: SafeResourceUrl;
  private lastSettingsJson = '';

  constructor(public api: ApiService, private sanitizer: DomSanitizer) {
    this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl('/');
  }

  ngDoCheck() {
    // Update local singleton
    this.api.previewSettings$.next(this.settings);

    // Post to iframe
    if (this.previewIframe && this.previewIframe.nativeElement.contentWindow) {
      const currentJson = JSON.stringify(this.settings);
      if (currentJson !== this.lastSettingsJson) {
        this.previewIframe.nativeElement.contentWindow.postMessage({
          type: 'CMS_PREVIEW',
          settings: this.settings
        }, '*');
        this.lastSettingsJson = currentJson;
      }
    }
  }

  originalSettings: any = null;
  saving = false;
  successMsg = '';
  errorMsg = '';

  // File uploads
  logoFile: File | null = null;
  heroBgFile: File | null = null;
  heroMascotFile: File | null = null;
  missionMascotFile: File | null = null;


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
