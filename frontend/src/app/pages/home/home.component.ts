import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ApiService, GallerySlide, Card } from '../../services/api.service';

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
      <div class="hero-bg"></div>
      <div class="container">
        <!-- Left: Speech Bubble -->
        <div class="hero-content fade-in">
          <div>
            <span class="action-word">¡BOOM!</span>
            <span class="new-tag">¡Nuevos Diseños!</span>
          </div>
          <div class="speech-bubble">
            <h1>¡Desata tu creatividad con corte láser!</h1>
            <p>Desde cajas crispeteras únicas hasta relojes de madera intrincados — ¡creamos historias en madera MDF para el futuro!</p>
          </div>
          <div class="hero-btns">
            <button class="btn-primary">¡Compra Ya!</button>
            <button class="btn-secondary">Pedido Personalizado</button>
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
          <h2>La Colección</h2>
          <p>Explora nuestros paneles de asombrosos artefactos de madera. ¡Cada uno cuenta una historia!</p>
        </div>

        <div class="cards-section-wrapper">
          <div class="mascot mascot-left fade-in">
            <img src="img/dragoasomadonaranja.png" alt="Mascota Dragón Naranja" width="150" height="200" loading="lazy" decoding="async" />
          </div>
          <div class="cards-grid">
            <div *ngFor="let card of cards; let i = index"
                 class="card fade-in" [class.card-halftone]="card.isHalftone"
                 [style.--card-index]="i"
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
          <h2>¡Personalizamos tus mejores ideas!</h2>
        </div>
        <div class="services-grid">
          <div class="service-card fade-in">
            <div class="service-icon"><i class="fas fa-palette"></i></div>
            <h3>Personalización Total</h3>
            <p>Cualquier diseño que imagines, lo hacemos realidad. Fotos, geek, anime, series, música, decoración ¡y mucho más! Ideal para sorprender a esa persona especial.</p>
          </div>
          <div class="service-card fade-in">
            <div class="service-icon"><i class="fas fa-crosshairs"></i></div>
            <h3>Corte Láser de Precisión</h3>
            <p>Trabajamos en madera, acrílico y más materiales con acabados limpios, exactos y de alta calidad.</p>
          </div>
          <div class="service-card fade-in">
            <div class="service-icon"><i class="fas fa-gift"></i></div>
            <h3>Fechas Especiales</h3>
            <p>Amor y Amistad, aniversarios, cumpleaños o cualquier ocasión que merezca un detalle único.</p>
          </div>
        </div>

        <!-- Mascota + Frase -->
        <div class="mission-banner fade-in">
          <div class="mission-mascot">
            <img src="img/drarojo.png" alt="Mascota KOI" width="100" height="150" loading="lazy" decoding="async" />
          </div>
          <div class="mission-text">
            <span class="action-word">¡BOOM!</span>
            <h3>Tu idea, nuestra misión</h3>
            <p>Siempre encontramos la forma de hacerla posible. 🤯</p>
          </div>
        </div>

        <!-- Métodos de pago -->
        <div class="info-block fade-in">
          <div class="comic-panel-header">
            <span class="panel-number">💸</span>
            <h2>Pagos Fáciles</h2>
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
        <div class="info-block fade-in">
          <div class="comic-panel-header">
            <span class="panel-number">🛵</span>
            <h2>Envíos Seguros y Rápidos</h2>
          </div>
          <div class="shipping-info">
            <div class="shipping-item"><i class="fas fa-truck"></i><div><h4>Servientrega</h4><p>Directo a tu puerta, a nivel nacional</p></div></div>
            <div class="shipping-item"><i class="fas fa-shipping-fast"></i><div><h4>Interrapidísimo</h4><p>Envíos rápidos y seguros a toda Colombia</p></div></div>
          </div>
        </div>

        <!-- Redes y contacto -->
        <div class="info-block fade-in">
          <div class="comic-panel-header">
            <span class="panel-number">📱</span>
            <h2>Encuéntranos</h2>
          </div>
          <div class="contact-channels">
            <a href="https://wa.me/573186909433" class="channel-card" target="_blank"><i class="fab fa-whatsapp"></i><span>318 690 9433</span></a>
            <a href="https://facebook.com/KoiDesignsSoacha" class="channel-card" target="_blank"><i class="fab fa-facebook-f"></i><span>KoiDesignsSoacha</span></a>
            <a href="https://instagram.com/KoiDesignsSoacha" class="channel-card" target="_blank"><i class="fab fa-instagram"></i><span>&#64;KoiDesignsSoacha</span></a>
            <a href="https://tiktok.com/&#64;koiartesgraficas" class="channel-card" target="_blank"><i class="fab fa-tiktok"></i><span>&#64;koiartesgraficas</span></a>
            <a href="https://wa.me/c/573186909433" class="channel-card channel-catalog" target="_blank"><i class="fas fa-book-open"></i><span>Ver Catálogo</span></a>
          </div>
        </div>
      </div>
    </section>

    <!-- ════════════ CTA ════════════ -->
    <section class="cta-section" id="contacto">
      <div class="container">
        <div class="cta-inner fade-in">
          <h2>¿Listo para empezar tu historia?</h2>
          <p>Ya sea un reloj personalizado o un pedido masivo para tu próximo evento, estamos aquí para hacerlo realidad.</p>
          <div class="cta-buttons-wrapper">
            <span class="star-decoration">✦</span>
            <button class="starburst-btn" (click)="goContacto()"><i class="fas fa-envelope"></i> Contáctanos</button>
            <button class="starburst-btn" (click)="goWhatsApp()"><i class="fab fa-whatsapp"></i> WhatsApp</button>
            <span class="star-decoration">✦</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ════════════ MODAL GALERÍA DE CARDS ════════════ -->
    <div class="card-modal-overlay" *ngIf="isCardGalleryOpen" (click)="closeCardGallery()">
      <span class="comic-action-float top-left">¡ZAP!</span>
      <span class="comic-action-float top-right">¡POW!</span>

      <div class="card-modal-container" (click)="$event.stopPropagation()">
        <button class="card-modal-close" (click)="closeCardGallery()"><i class="fas fa-times"></i></button>
        
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

      <span class="comic-action-float bottom-left">¡BOOM!</span>
      <span class="comic-action-float bottom-right">¡WOW!</span>
    </div>
  `
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren('galleryVideo') galleryVideos!: QueryList<ElementRef<HTMLVideoElement>>;
  gallery: GallerySlide[] = [];
  cards: Card[] = [];
  currentSlide = 0;
  autoPlayInterval: any;
  cardElements: HTMLElement[] = [];
  private observer: IntersectionObserver | null = null;

  isCardGalleryOpen = false;
  activeCardGallery: string[] = [];
  currentCardGallerySlide = 0;

  constructor(public api: ApiService, private sanitizer: DomSanitizer) { }

  ngOnInit() {
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
}
