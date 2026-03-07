import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ApiService, SearchResult } from '../../services/api.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  template: `
    <header class="header" id="header" [class.scrolled]="isScrolled" role="banner">
      <div class="container">
        <a routerLink="/" class="logo">
          <img src="img/logoicon.png" alt="KOI Design" class="logo-img" width="50" height="50" fetchpriority="high" />
        </a>

        <nav class="nav-links" [class.active]="mobileNavOpen" role="navigation" aria-label="Navegación principal">
          <a (click)="scrollToSection('inicio')" class="nav-link" style="cursor:pointer" role="link">Inicio</a>
          <a (click)="scrollToSection('coleccion')" class="nav-link" style="cursor:pointer" role="link">Productos</a>
          <a routerLink="/cotizador" routerLinkActive="active" class="nav-link highlight-link">Cotizador</a>
          <a (click)="scrollToSection('nosotros')" class="nav-link" style="cursor:pointer" role="link">Nosotros</a>
          <a routerLink="/contacto" routerLinkActive="active">Contacto</a>
        </nav>

        <div class="nav-right">
          <div class="search-box" [class.search-open]="searchOpen">
            <input type="text" placeholder="Buscar" [(ngModel)]="searchQuery" (keyup.enter)="doSearch()" (input)="onSearchInput()" />
            <button type="button" aria-label="Buscar" (click)="doSearch()"><i class="fas fa-search"></i></button>
          </div>

          <!-- Search Results Dropdown -->
          <div class="search-results" *ngIf="searchResults && showResults">
            <div class="search-results-header">
              <span>Resultados de búsqueda</span>
              <button (click)="closeSearch()" class="close-search" aria-label="Cerrar búsqueda">&times;</button>
            </div>
            <div *ngIf="searchResults.cards.length === 0 && searchResults.gallery.length === 0" class="no-results">
              No se encontraron resultados para "{{searchQuery}}"
            </div>
            <div *ngIf="searchResults.cards.length > 0" class="results-section">
              <h4>Productos</h4>
              <div *ngFor="let card of searchResults.cards" class="result-item" (click)="goToCard(card)">
                <img [src]="api.getMediaUrl(card.image)" *ngIf="card.image" class="result-thumb" />
                <div>
                  <strong>{{card.title}}</strong>
                  <p>{{card.description}}</p>
                </div>
              </div>
            </div>
            <div *ngIf="searchResults.gallery.length > 0" class="results-section">
              <h4>Galería</h4>
              <div *ngFor="let slide of searchResults.gallery" class="result-item">
                <img [src]="api.getMediaUrl(slide.src)" *ngIf="slide.type==='image'" class="result-thumb" />
                <div><strong>{{slide.alt}}</strong></div>
              </div>
            </div>
          </div>

          <button class="cart-btn" aria-label="Carrito"><i class="fas fa-shopping-cart"></i></button>

          <ng-container *ngIf="!auth.isLoggedIn()">
            <a routerLink="/login" class="btn-entrar">Entrar</a>
            <a routerLink="/registro" class="btn-entrar btn-register">Registro</a>
          </ng-container>
          <div *ngIf="auth.isLoggedIn()" class="admin-menu">
            <span class="user-greeting"><i class="fas fa-user-circle"></i> {{auth.getUser()?.username}}</span>
            <a *ngIf="auth.getUser()?.role === 'admin'" routerLink="/admin" class="btn-entrar btn-admin"><i class="fas fa-cog"></i> Admin</a>
            <button class="btn-entrar btn-logout" (click)="auth.logout()" aria-label="Cerrar sesión"><i class="fas fa-sign-out-alt"></i></button>
          </div>

          <button class="hamburger" (click)="mobileNavOpen = !mobileNavOpen" aria-label="Menú">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </header>

    <!-- Mobile overlay nav -->
    <div class="mobile-nav-overlay" [class.active]="mobileNavOpen">
      <button class="close-nav" (click)="mobileNavOpen = false">&times;</button>
      <a (click)="scrollToSection('inicio'); mobileNavOpen = false" style="cursor:pointer">Inicio</a>
      <a (click)="scrollToSection('coleccion'); mobileNavOpen = false" style="cursor:pointer">Productos</a>
      <a routerLink="/cotizador" (click)="mobileNavOpen = false">Cotizador</a>
      <a (click)="scrollToSection('nosotros'); mobileNavOpen = false" style="cursor:pointer">Nosotros</a>
      <a routerLink="/contacto" (click)="mobileNavOpen = false">Contacto</a>
      <a *ngIf="!auth.isLoggedIn()" routerLink="/login" (click)="mobileNavOpen = false">Entrar</a>
      <a *ngIf="!auth.isLoggedIn()" routerLink="/registro" (click)="mobileNavOpen = false">Registrarse</a>
      <a *ngIf="auth.isLoggedIn() && auth.getUser()?.role === 'admin'" routerLink="/admin" (click)="mobileNavOpen = false">Admin Panel</a>
      <a *ngIf="auth.isLoggedIn()" (click)="auth.logout(); mobileNavOpen = false" style="cursor:pointer">Cerrar Sesión</a>
    </div>
  `,
  styles: [`
    .admin-menu { display: flex; align-items: center; gap: 5px; }
    .btn-admin { font-size: 0.85rem !important; padding: 6px 14px !important; }
    .btn-logout { font-size: 0.85rem !important; padding: 6px 10px !important; background: transparent; border-color: #E91E9E !important; }
    .btn-logout:hover { background: #E91E9E; }
    .btn-register { background: transparent !important; border-color: #00BFFF !important; color: #00BFFF !important; font-size: 0.85rem !important; }
    .btn-register:hover { background: #00BFFF !important; color: #fff !important; }
    .user-greeting { color: #ccc; font-size: 0.8rem; font-family: var(--comic-font); letter-spacing: 0.5px; display: flex; align-items: center; gap: 5px; padding: 0 6px; }
    .search-results {
      position: absolute; top: 70px; right: 20px; width: 400px; max-height: 450px;
      background: #0f2240; border: 2px solid rgba(0,191,255,0.3); border-radius: 8px;
      overflow-y: auto; z-index: 1001; box-shadow: 0 8px 30px rgba(0,0,0,0.5);
    }
    .search-results-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.1);
      font-family: var(--comic-font); font-size: 0.9rem; letter-spacing: 1px; text-transform: uppercase;
    }
    .close-search { background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer; }
    .no-results { padding: 20px; text-align: center; color: #999; }
    .results-section { padding: 10px 16px; }
    .results-section h4 { font-family: var(--comic-font); color: #E91E9E; margin-bottom: 8px; font-size: 0.9rem; letter-spacing: 1px; }
    .result-item {
      display: flex; align-items: center; gap: 12px; padding: 8px; margin-bottom: 6px;
      border-radius: 6px; cursor: pointer; transition: background 0.2s;
    }
    .result-item:hover { background: rgba(255,255,255,0.05); }
    .result-thumb { width: 50px; height: 50px; object-fit: cover; border-radius: 4px; border: 1px solid rgba(255,255,255,0.15); }
    .result-item strong { font-size: 0.9rem; }
    .result-item p { font-size: 0.8rem; color: #aaa; margin-top: 2px; }
    @media (max-width: 768px) { .search-results { width: calc(100vw - 40px); right: 20px; } }
  `]
})
export class HeaderComponent {
  mobileNavOpen = false;
  isScrolled = false;
  searchQuery = '';
  searchResults: SearchResult | null = null;
  showResults = false;
  searchOpen = false;

  constructor(public auth: AuthService, public api: ApiService, private router: Router) { }

  @HostListener('window:scroll')
  onScroll() {
    this.isScrolled = window.scrollY > 60;
  }

  onSearchInput() {
    if (this.searchQuery.trim().length >= 2) {
      this.api.search(this.searchQuery).subscribe(res => {
        this.searchResults = res;
        this.showResults = true;
      });
    } else {
      this.showResults = false;
    }
  }

  doSearch() {
    if (this.searchQuery.trim()) {
      this.api.search(this.searchQuery).subscribe(res => {
        this.searchResults = res;
        this.showResults = true;
      });
    }
  }

  closeSearch() {
    this.showResults = false;
    this.searchQuery = '';
  }

  goToCard(card: any) {
    this.closeSearch();
    this.router.navigate(['/'], { fragment: 'coleccion' });
  }

  scrollToSection(sectionId: string) {
    // If not on home page, navigate there first then scroll
    if (this.router.url !== '/' && !this.router.url.startsWith('/#')) {
      this.router.navigate(['/']).then(() => {
        setTimeout(() => {
          const el = document.getElementById(sectionId);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
      });
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
