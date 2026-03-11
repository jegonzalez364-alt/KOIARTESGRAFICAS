import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ApiService, GallerySlide, Card, SiteSettings } from '../../services/api.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- ════════════ HERO ════════════ -->
    <section class="hero" id="inicio">
      <div class="neon-lines">
        <span></span><span></span><span></span>
        <span></span><span></span><span></span>
      </div>
      <div class="hero-bg" [style.background-image]="'url(' + api.getMediaUrl(settings.heroBgUrl) + ')'"></div>
      <div class="container">
        <!-- Left: Speech Bubble -->
        <div class="hero-content fade-in">
          <div>
            <span class="action-word">{{settings.heroActionWord}}</span>
            <span class="new-tag">¡Nuevos Diseños!</span>
          </div>
          <div class="speech-bubble" [style.backgroundColor]="settings.speechBubbleBg" [style.borderColor]="settings.speechBubbleBorderColor" [style.borderRadius]="settings.speechBubbleBorderRadius">
            <h1 [style.color]="settings.heroTitleColor" [style.fontFamily]="settings.heroTitleFont">{{settings.heroTitle}} <span class="highlight-text">{{settings.heroHighlightItem1}}</span></h1>
            <p [style.color]="settings.heroSubtitleColor" [style.fontFamily]="settings.heroSubtitleFont">{{settings.heroSubtitle}}</p>
          </div>
          <div class="hero-btns">
            <button class="btn-primary" (click)="scrollToSection('coleccion')">{{settings.heroBtnText}}</button>
            <button class="btn-secondary" (click)="goContacto()">Pedido Personalizado</button>
          </div>
        </div>

        <!-- Right: Gallery Carousel -->
        <div class="hero-image fade-in">
          <div class="hero-gallery">
            <div class="gallery-track">
              <div *ngFor="let slide of gallery; let i = index"
                   class="gallery-slide" [class.active]="i === currentSlide">
                <div class="comic-frame" *ngIf="slide.type === 'image'">
                  <img [src]="api.getMediaUrl(slide.src)" [alt]="slide.alt" width="800" height="500" [attr.fetchpriority]="i === 0 ? 'high' : 'auto'" [attr.loading]="i === 0 ? 'eager' : 'lazy'" decoding="async" />
                </div>
                <div class="comic-frame" *ngIf="slide.type === 'video'">
                  <video #galleryVideo muted loop playsinline [src]="api.getMediaUrl(slide.src)"></video>
                </div>
                <div class="comic-frame youtube-frame" *ngIf="slide.type === 'youtube'">
                  <iframe *ngIf="i === currentSlide"
                    [src]="getSafeYouTubeUrl(slide.src, true)"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen></iframe>
                  <iframe *ngIf="i !== currentSlide"
                    [src]="getSafeYouTubeUrl(slide.src, false)"
                    frameborder="0"
                    allowfullscreen></iframe>
                </div>
              </div>
            </div>
            <button class="gallery-arrow gallery-prev" (click)="prevSlide()" aria-label="Anterior">
              <i class="fas fa-chevron-left"></i>
            </button>
            <button class="gallery-arrow gallery-next" (click)="nextSlide()" aria-label="Siguiente">
              <i class="fas fa-chevron-right"></i>
            </button>
            <div class="gallery-dots">
              <button *ngFor="let slide of gallery; let i = index"
                      class="gallery-dot" [class.active]="i === currentSlide"
                      (click)="goToSlide(i)" [attr.aria-label]="'Imagen ' + (i+1)"></button>
            </div>
          </div>
          <span class="pow-label">¡POW!</span>
        </div>
      </div>
    </section>

    <!-- ════════════ COLLECTION ════════════ -->
    <section class="collection" id="coleccion">
      <div class="container">
        <div class="section-title-box fade-in">
          <h2>{{settings.collectionTitle}}</h2>
          <p>{{settings.collectionSubtitle}}</p>
        </div>

        <div class="cards-section-wrapper">
          <div class="mascot mascot-left fade-in">
            <img src="img/dragoasomadonaranja.png" alt="Mascota Dragón Naranja" width="150" height="200" loading="lazy" decoding="async" />
          </div>
          <div class="cards-grid">
            <div *ngFor="let card of cards; let i = index"
                 class="card fade-in" [class.card-halftone]="card.isHalftone"
                 [style.--card-index]="i"
                 [style.borderColor]="settings.cardBorderColor"
                 [style.borderRadius]="settings.cardBorderRadius"
                 [style.opacity]="settings.cardOpacity"
                 [style.backgroundColor]="settings.cardBgColor"
                 (mousemove)="onCardMouseMove($event, i)"
                 (mouseleave)="onCardMouseLeave(i)">
              <div class="card-header">
                <img *ngIf="card.image" [src]="api.getMediaUrl(card.image)" [alt]="card.title" width="400" height="250" loading="lazy" decoding="async" />
                <span *ngIf="card.isHalftone" class="halftone-title" [innerHTML]="card.halftoneTitle"></span>
                <span *ngIf="card.tag" class="card-tag">{{card.tag}}</span>
                <span class="card-number">{{card.number}}</span>
              </div>
              <div class="card-body">
                <h3>{{card.title}}</h3>
                <p>{{card.description}}</p>
                <a *ngIf="!card.galleryImages || card.galleryImages.length === 0" [href]="card.btnLink" class="card-btn">{{card.btnText}}</a>
                <button *ngIf="card.galleryImages && card.galleryImages.length > 0" class="card-btn" (click)="openCardGallery(card)">{{card.btnText}}</button>
              </div>
            </div>
          </div>
          <div class="mascot mascot-right fade-in">
            <img src="img/dragoasomadorojo.png" alt="Mascota Dragón Rojo" width="150" height="200" loading="lazy" decoding="async" />
          </div>
        </div>
      </div>
    </section>

    <!-- ════════════ NOSOTROS / SERVICIOS ════════════ -->
    <section class="about-section" id="nosotros">
      <div class="container">
        <div class="section-title-box fade-in">
          <h2>{{settings.servicesTitle}}</h2>
        </div>
        <div class="services-grid">
          <div class="service-card fade-in" [style.backgroundColor]="settings.serviceCardBg" [style.borderColor]="settings.serviceCardBorderColor" [style.borderRadius]="settings.serviceCardBorderRadius">
            <div class="service-icon"><i class="fas fa-palette"></i></div>
            <h3>{{settings.service1Title}}</h3>
            <p>{{settings.service1Desc}}</p>
          </div>
          <div class="service-card fade-in" [style.backgroundColor]="settings.serviceCardBg" [style.borderColor]="settings.serviceCardBorderColor" [style.borderRadius]="settings.serviceCardBorderRadius">
            <div class="service-icon"><i class="fas fa-crosshairs"></i></div>
            <h3>{{settings.service2Title}}</h3>
            <p>{{settings.service2Desc}}</p>
          </div>
          <div class="service-card fade-in" [style.backgroundColor]="settings.serviceCardBg" [style.borderColor]="settings.serviceCardBorderColor" [style.borderRadius]="settings.serviceCardBorderRadius">
            <div class="service-icon"><i class="fas fa-gift"></i></div>
            <h3>{{settings.service3Title}}</h3>
            <p>{{settings.service3Desc}}</p>
          </div>
        </div>

        <!-- Mascota + Frase -->
        <div class="mission-banner fade-in" [style.backgroundColor]="settings.missionBannerBg" [style.borderColor]="settings.missionBannerBorderColor">
          <div class="mission-mascot">
            <img [src]="api.getMediaUrl(settings.missionMascotUrl)" alt="Dragón Rojo Diseñador" width="130" height="auto" loading="lazy" decoding="async" style="transform: scale(1.2) translateY(-10px);" />
          </div>
          <div class="mission-text">
            <span class="action-word">{{settings.missionActionWord}}</span>
            <h3>{{settings.missionTitle}}</h3>
            <p>{{settings.missionSubtitle}}</p>
          </div>
        </div>

        <!-- Métodos de pago -->
        <div class="info-block fade-in" [style.backgroundColor]="settings.infoBlockBg" [style.borderColor]="settings.infoBlockBorderColor" [style.borderRadius]="settings.infoBlockBorderRadius">
          <div class="comic-panel-header">
            <span class="panel-number">💸</span>
            <h2>{{settings.paymentsTitle}}</h2>
          </div>
          <div class="payment-grid">
            <div class="payment-item"><i class="fas fa-mobile-alt"></i><span>Nequi</span></div>
            <div class="payment-item"><i class="fas fa-mobile-alt"></i><span>Daviplata</span></div>
            <div class="payment-item"><i class="fas fa-university"></i><span>Bancolombia</span></div>
            <div class="payment-item"><i class="fab fa-cc-mastercard"></i><span>MasterCard</span></div>
            <div class="payment-item"><i class="fab fa-cc-visa"></i><span>VISA</span></div>
            <div class="payment-item"><i class="fab fa-cc-amex"></i><span>Amex</span></div>
            <div class="payment-item"><i class="fab fa-cc-diners-club"></i><span>Diners</span></div>
            <div class="payment-item"><i class="fab fa-google-pay"></i><span>Google Pay</span></div>
            <div class="payment-item"><i class="fab fa-apple-pay"></i><span>Apple Pay</span></div>
            <div class="payment-item"><i class="fas fa-exchange-alt"></i><span>PSE</span></div>
            <div class="payment-item"><i class="fas fa-credit-card"></i><span>Codensa</span></div>
            <div class="payment-item"><i class="fas fa-piggy-bank"></i><span>Abonos</span></div>
          </div>
        </div>

        <!-- Envíos -->
        <div class="info-block fade-in" [style.backgroundColor]="settings.infoBlockBg" [style.borderColor]="settings.infoBlockBorderColor" [style.borderRadius]="settings.infoBlockBorderRadius">
          <div class="comic-panel-header">
            <span class="panel-number">🛵</span>
            <h2>{{settings.shippingTitle}}</h2>
          </div>
          <div class="shipping-info">
            <div class="shipping-item"><i class="fas fa-truck"></i><div><h4>{{settings.shippingItem1Title}}</h4><p>{{settings.shippingItem1Desc}}</p></div></div>
            <div class="shipping-item"><i class="fas fa-shipping-fast"></i><div><h4>{{settings.shippingItem2Title}}</h4><p>{{settings.shippingItem2Desc}}</p></div></div>
          </div>
        </div>

        <!-- Redes y contacto -->
        <div class="info-block fade-in" [style.backgroundColor]="settings.infoBlockBg" [style.borderColor]="settings.infoBlockBorderColor" [style.borderRadius]="settings.infoBlockBorderRadius">
          <div class="comic-panel-header">
            <span class="panel-number">📱</span>
            <h2>{{settings.socialTitle}}</h2>
          </div>
          <div class="contact-channels">
            <a href="https://wa.me/573186909433" class="channel-card" [style.backgroundColor]="settings.channelCardBg" [style.borderColor]="settings.channelCardBorderColor" [style.borderRadius]="settings.channelCardBorderRadius" target="_blank"><i class="fab fa-whatsapp"></i><span>{{settings.socialWhatsapp}}</span></a>
            <a href="https://facebook.com/KoiDesignsSoacha" class="channel-card" [style.backgroundColor]="settings.channelCardBg" [style.borderColor]="settings.channelCardBorderColor" [style.borderRadius]="settings.channelCardBorderRadius" target="_blank"><i class="fab fa-facebook-f"></i><span>{{settings.socialFacebook}}</span></a>
            <a href="https://instagram.com/KoiDesignsSoacha" class="channel-card" [style.backgroundColor]="settings.channelCardBg" [style.borderColor]="settings.channelCardBorderColor" [style.borderRadius]="settings.channelCardBorderRadius" target="_blank"><i class="fab fa-instagram"></i><span>{{settings.socialInstagram}}</span></a>
            <a href="https://tiktok.com/&#64;koiartesgraficas" class="channel-card" [style.backgroundColor]="settings.channelCardBg" [style.borderColor]="settings.channelCardBorderColor" [style.borderRadius]="settings.channelCardBorderRadius" target="_blank"><i class="fab fa-tiktok"></i><span>{{settings.socialTiktok}}</span></a>
            <a href="https://wa.me/c/573186909433" class="channel-card channel-catalog" [style.backgroundColor]="settings.channelCardBg" [style.borderColor]="settings.channelCardBorderColor" [style.borderRadius]="settings.channelCardBorderRadius" target="_blank"><i class="fas fa-book-open"></i><span>{{settings.socialCatalogText}}</span></a>
          </div>
        </div>
      </div>
    </section>

    <!-- ════════════ CUSTOM BLOCKS (WIDGETS) ════════════ -->
    <section class="custom-blocks-section" *ngIf="parsedBlocks.length > 0">
      <div class="container">
        <ng-container *ngFor="let block of parsedBlocks">
          <p *ngIf="block.type === 'text'" [style.color]="block.styles?.color" [style.font-size]="block.styles?.fontSize">{{block.content}}</p>
          <button *ngIf="block.type === 'button'" class="starburst-btn" [style.color]="block.styles?.color" [style.background-color]="block.styles?.bgColor" [style.font-size]="block.styles?.fontSize">{{block.content}}</button>
          <hr *ngIf="block.type === 'divider'" [style.border-color]="block.styles?.color" [style.border-width]="block.styles?.fontSize" style="border-style:solid; margin:10px 0;">
          <div *ngIf="block.type === 'spacer'" [style.height]="block.styles?.fontSize"></div>
        </ng-container>
      </div>
    </section>

    <!-- ════════════ CTA ════════════ -->
    <section class="cta-section" id="contacto">
      <div class="container">
        <div class="cta-inner fade-in">
          <span class="action-word cta-pow">{{settings.contactActionWord}}</span>
          <h2>{{settings.ctaTitle}}</h2>
          <p>{{settings.ctaSubtitle}}</p>
          <div class="cta-buttons-wrapper">
            <span class="star-decoration">✦</span>
            <button class="starburst-btn" [style.backgroundColor]="settings.ctaBtnBg" [style.color]="settings.ctaBtnColor" [style.borderRadius]="settings.ctaBtnBorderRadius" (click)="goContacto()"><i class="fas fa-envelope"></i> {{settings.ctaBtn1Text}}</button>
            <button class="starburst-btn" [style.backgroundColor]="settings.ctaBtnBg" [style.color]="settings.ctaBtnColor" [style.borderRadius]="settings.ctaBtnBorderRadius" (click)="goWhatsApp()"><i class="fab fa-whatsapp"></i> {{settings.ctaBtn2Text}}</button>
            <span class="star-decoration">✦</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ════════════ MODAL GALERÍA DE CARDS ════════════ -->
    <div class="card-modal-overlay" *ngIf="isCardGalleryOpen" (click)="closeCardGallery()" [style.backgroundColor]="settings.modalOverlayBg">
      <span class="comic-action-float top-left">{{settings.modalTextTopLeft}}</span>
      <span class="comic-action-float top-right">{{settings.modalTextTopRight}}</span>

      <div class="card-modal-container" (click)="$event.stopPropagation()" [style.backgroundColor]="settings.modalContentBg" [style.borderColor]="settings.modalBorderColor">
        <button class="card-modal-close" (click)="closeCardGallery()"><i class="fas fa-times"></i></button>
        
        <img [src]="api.getMediaUrl(settings.modalDragonLeftUrl || '')" alt="Dragón Izquierdo" class="modal-dragon modal-dragon-left" />
        <img [src]="api.getMediaUrl(settings.modalDragonRightUrl || '')" alt="Dragón Derecho" class="modal-dragon modal-dragon-right" />
        
        <span class="comic-panel-counter" *ngIf="activeCardGallery.length > 1">
          {{currentCardGallerySlide + 1}} / {{activeCardGallery.length}}
        </span>

        <div class="card-modal-slider">
          <div class="comic-halftone-corner"></div>
          <img [src]="api.getMediaUrl(activeCardGallery[currentCardGallerySlide])" alt="Imagen de galería" />
        </div>
        
        <button class="card-modal-arrow prev" *ngIf="activeCardGallery.length > 1" (click)="prevCardGallerySlide()">
          <i class="fas fa-chevron-left"></i>
        </button>
        <button class="card-modal-arrow next" *ngIf="activeCardGallery.length > 1" (click)="nextCardGallerySlide()">
          <i class="fas fa-chevron-right"></i>
        </button>
        
        <div class="card-modal-dots" *ngIf="activeCardGallery.length > 1">
          <span *ngFor="let img of activeCardGallery; let i = index" 
                class="card-modal-dot" 
                [class.active]="i === currentCardGallerySlide"
                (click)="currentCardGallerySlide = i"></span>
        </div>
      </div>

      <span class="comic-action-float bottom-left">{{settings.modalTextBottomLeft}}</span>
      <span class="comic-action-float bottom-right">{{settings.modalTextBottomRight}}</span>
    </div>
  `,
  styles: [`
    .highlight-text { color: var(--cyan); }
    .hero-bg {
      position: absolute; top: 0; left: 0; width: 100%; height: 100%;
      background-size: cover; background-position: center; filter: brightness(0.4) contrast(1.2); z-index: -1;
    }
    .cta-pow {
      position: absolute; top: -15px; right: 20px; font-size: 1.2rem; transform: rotate(15deg); color: var(--yellow);
    }
  `]
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  gallery: GallerySlide[] = [];
  cards: Card[] = [];
  currentSlide = 0;
  autoPlayInterval: any;
  cardElements: HTMLElement[] = [];
  private observer: IntersectionObserver | null = null;
  @ViewChildren('galleryVideo') galleryVideos!: QueryList<ElementRef<HTMLVideoElement>>;

  // Visual CMS Settings defaults
  settings: SiteSettings = {
    primaryColor: '#E91E9E', secondaryColor: '#00BFFF', accentColor: '#FFD700',
    bgColor: '#06101e', cardBgColor: '#f5f0e8',
    logoUrl: 'img/logoicon.png', heroBgUrl: '/img/KoiFondo.png',
    heroMascotUrl: 'img/Koi-Icono.png', missionMascotUrl: 'img/DragonRojoDiseñador.png',
    heroTitle: 'Transformamos tus Ideas en', heroTitleColor: '#ffffff', heroTitleFont: "'Komika Axis', sans-serif", heroHighlightItem1: 'Arte Láser',
    heroSubtitle: 'Personalizamos cada detalle para sorprender.', heroSubtitleColor: '#e0e0e0', heroSubtitleFont: "'Komika Axis', sans-serif",
    heroBtnText: 'Explorar Catálogo', heroActionWord: '¡BAM!',
    collectionTitle: 'La Colección', collectionSubtitle: 'Explora nuestros paneles de asombrosos artefactos de madera. ¡Cada uno cuenta una historia!',
    missionTitle: 'Tu idea, nuestra misión', missionSubtitle: 'Siempre encontramos la forma de hacerla posible. 🤯',
    missionActionWord: '¡BOOM!', contactTitle: 'Contáctanos',
    contactSubtitle: '¿Tienes una idea? ¡Hagámosla realidad! Escríbenos y nuestro equipo te responderá más rápido que un rayo láser.',
    contactActionWord: '¡ZAP!',
    servicesTitle: '¡Personalizamos tus mejores ideas!',
    service1Title: 'Personalización Total',
    service1Desc: 'Cualquier diseño que imagines, lo hacemos realidad. Fotos, geek, anime, series, música, decoración ¡y mucho más! Ideal para sorprender a esa persona especial.',
    service2Title: 'Corte Láser de Precisión',
    service2Desc: 'Trabajamos en madera, acrílico y más materiales con acabados limpios, exactos y de alta calidad.',
    service3Title: 'Fechas Especiales',
    service3Desc: 'Amor y Amistad, aniversarios, cumpleaños o cualquier ocasión que merezca un detalle único.',
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
    modalTextTopLeft: '¡ZAP!', modalTextTopRight: '¡POW!', modalTextBottomLeft: '¡BOOM!', modalTextBottomRight: '¡WOW!', primaryFont: "'Komika Axis', sans-serif",
    cardBorderRadius: '4px', cardBorderColor: '#E91E9E', cardOpacity: '1',
    serviceCardBg: 'rgba(255,255,255,0.04)', serviceCardBorderRadius: '4px', serviceCardBorderColor: 'rgba(233,30,158,0.3)',
    infoBlockBg: 'rgba(255,255,255,0.03)', infoBlockBorderColor: 'rgba(255,215,0,0.25)', infoBlockBorderRadius: '4px',
    speechBubbleBg: 'rgba(255,255,255,0.95)', speechBubbleBorderColor: '#E91E9E', speechBubbleBorderRadius: '20px',
    ctaBtnBg: '#003333', ctaBtnColor: '#ffffff', ctaBtnBorderRadius: '30px',
    channelCardBg: 'rgba(255,255,255,0.04)', channelCardBorderColor: 'rgba(0,191,255,0.2)', channelCardBorderRadius: '4px',
    modalOverlayBg: 'rgba(0,0,0,0.92)', modalContentBg: '#0a1a2f', modalBorderColor: '#E91E9E',
    missionBannerBg: 'rgba(255,255,255,0.04)', missionBannerBorderColor: 'rgba(0,191,255,0.25)'
  };

  isCardGalleryOpen = false;
  activeCardGallery: string[] = [];
  currentCardGallerySlide = 0;
  parsedBlocks: any[] = [];

  constructor(public api: ApiService, private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.api.getSettings().subscribe({
      next: (res) => {
        if (res) {
          this.settings = { ...this.settings, ...res };
          this.parseBlocks();
        }
      },
      error: (err) => console.error('Error fetching settings', err)
    });

    // Live preview: update text fields in real-time from the Visual Editor
    this.api.previewSettings$.subscribe(preview => {
      if (preview) {
        this.settings = { ...this.settings, ...preview };
        this.parseBlocks();
      }
    });

    this.api.getGallery().subscribe(data => {
      this.gallery = data;
      setTimeout(() => this.setupFadeObserver(), 100);
    });
    this.api.getCards().subscribe(data => {
      this.cards = data;
      setTimeout(() => this.setupFadeObserver(), 100);
    });
  }

  openCardGallery(card: Card) {
    if (card.galleryImages && card.galleryImages.length > 0) {
      this.activeCardGallery = card.galleryImages;
      this.currentCardGallerySlide = 0;
      this.isCardGalleryOpen = true;
      document.body.style.overflow = 'hidden';
    }
  }

  closeCardGallery() {
    this.isCardGalleryOpen = false;
    this.activeCardGallery = [];
    document.body.style.overflow = '';
  }

  prevCardGallerySlide() {
    if (this.activeCardGallery.length > 0) {
      this.currentCardGallerySlide = (this.currentCardGallerySlide - 1 + this.activeCardGallery.length) % this.activeCardGallery.length;
    }
  }

  nextCardGallerySlide() {
    if (this.activeCardGallery.length > 0) {
      this.currentCardGallerySlide = (this.currentCardGallerySlide + 1) % this.activeCardGallery.length;
    }
  }

  ngAfterViewInit() {
    this.startAutoPlay();
    this.setupFadeObserver();
  }

  setupFadeObserver() {
    if (!this.observer) {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            this.observer?.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px 50px 0px' });
    }

    setTimeout(() => {
      const faders = document.querySelectorAll('.fade-in:not(.visible)');
      faders.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          el.classList.add('visible');
        } else {
          this.observer?.observe(el);
        }
      });
    }, 100);
  }

  goToSlide(index: number) {
    this.currentSlide = (index + this.gallery.length) % this.gallery.length;
    this.handleVideoAutoplay();
  }

  prevSlide() { this.goToSlide(this.currentSlide - 1); }
  nextSlide() { this.goToSlide(this.currentSlide + 1); }

  handleVideoAutoplay() {
    setTimeout(() => {
      if (!this.galleryVideos) return;
      const videos = this.galleryVideos.toArray();
      // Find which video indices map to which slides
      let videoIdx = 0;
      for (let i = 0; i < this.gallery.length; i++) {
        if (this.gallery[i].type === 'video') {
          if (videos[videoIdx]) {
            const vid = videos[videoIdx].nativeElement;
            if (i === this.currentSlide) {
              vid.currentTime = 0;
              vid.play().catch(() => { });
            } else {
              vid.pause();
            }
          }
          videoIdx++;
        }
      }
    }, 100);
  }

  startAutoPlay() {
    this.autoPlayInterval = setInterval(() => this.nextSlide(), 15000);
  }

  ngOnDestroy() {
    if (this.autoPlayInterval) clearInterval(this.autoPlayInterval);
    if (this.observer) this.observer.disconnect();
  }

  onCardMouseMove(event: MouseEvent, index: number) {
    const card = (event.currentTarget as HTMLElement);
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const midX = rect.width / 2;
    const midY = rect.height / 2;
    const rotateY = ((x - midX) / midX) * 4;
    const rotateX = ((midY - y) / midY) * 4;
    card.style.transform = `translateY(-6px) perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  }

  onCardMouseLeave(index: number) {
    const cards = document.querySelectorAll('.card');
    if (cards[index]) {
      (cards[index] as HTMLElement).style.transform = '';
    }
  }

  scrollToSection(sectionId: string) {
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  goContacto() {
    window.location.href = '/contacto';
  }

  goWhatsApp() {
    window.open('https://wa.me/573186909433');
  }

  getSafeYouTubeUrl(url: string, autoplay: boolean = false): SafeResourceUrl {
    let embedUrl = this.api.getYouTubeEmbedUrl(url);
    if (autoplay) {
      embedUrl += '?autoplay=1&mute=1&loop=1';
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  private parseBlocks() {
    try {
      this.parsedBlocks = JSON.parse(this.settings.customBlocks || '[]');
    } catch {
      this.parsedBlocks = [];
    }
  }
}
