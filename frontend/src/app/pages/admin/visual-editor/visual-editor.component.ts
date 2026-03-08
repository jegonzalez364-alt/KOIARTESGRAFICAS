import { Component, OnInit, ViewChild, ElementRef, DoCheck, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService, SiteSettings } from '../../../services/api.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
    selector: 'app-visual-editor',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './visual-editor.component.html',
    styleUrls: ['./visual-editor.component.css']
})
export class VisualEditorComponent implements OnInit, DoCheck {
    @ViewChild('previewIframe') previewIframe!: ElementRef<HTMLIFrameElement>;

    settings: SiteSettings = {
        primaryColor: '#E91E9E', secondaryColor: '#00BFFF', accentColor: '#FFD700',
        bgColor: '#06101e', cardBgColor: '#f5f0e8',
        logoUrl: 'img/logoicon.png', heroBgUrl: '/img/KoiFondo.png',
        heroMascotUrl: 'img/Koi-Icono.png', missionMascotUrl: 'img/DragonRojoDiseñador.png',
        heroTitle: 'Transformamos tus Ideas en', heroHighlightItem1: 'Arte Láser',
        heroSubtitle: 'Personalizamos cada detalle para sorprender.',
        heroBtnText: 'Explorar Catálogo', heroActionWord: '¡BAM!',
        missionTitle: 'Tu idea, nuestra misión',
        missionSubtitle: 'Siempre encontramos la forma de hacerla posible. 🤯',
        missionActionWord: '¡BOOM!', contactTitle: 'Contáctanos',
        contactSubtitle: '¿Tienes una idea? ¡Hagámosla realidad!',
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
        ctaBtn2Text: 'WhatsApp'
    };

    // UI state
    panelTab = 'sections';
    activeSection = 'hero';
    saving = false;
    hasChanges = false;
    toastMsg = '';
    toastType: 'success' | 'error' = 'success';

    // Undo / Redo
    undoStack: string[] = [];
    redoStack: string[] = [];
    private maxUndo = 30;

    // Files
    logoFile: File | null = null;
    heroBgFile: File | null = null;
    heroMascotFile: File | null = null;
    missionMascotFile: File | null = null;

    // Preview
    previewUrl: SafeResourceUrl;
    private lastSettingsJson = '';
    private savedSettingsJson = '';

    // Section labels for status bar
    sectionLabels: Record<string, string> = {
        hero: 'Inicio / Hero',
        services: 'Servicios',
        mission: 'Nuestra Misión',
        payments: 'Pagos',
        shipping: 'Envíos',
        social: 'Redes Sociales',
        cta: 'Contacto (CTA)'
    };

    constructor(
        public api: ApiService,
        private sanitizer: DomSanitizer,
        private router: Router
    ) {
        this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl('/');
    }

    ngOnInit() {
        this.api.getSettings().subscribe({
            next: (res) => {
                if (res && (res as any)._id) {
                    this.settings = { ...res };
                    this.savedSettingsJson = JSON.stringify(this.settings);
                }
            },
            error: () => this.showToast('Error al cargar la configuración', 'error')
        });
    }

    ngDoCheck() {
        // Push changes to iframe in real-time
        this.api.previewSettings$.next(this.settings);

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

        // Track unsaved changes
        this.hasChanges = JSON.stringify(this.settings) !== this.savedSettingsJson;
    }

    // ── Keyboard shortcuts ──
    @HostListener('window:keydown', ['$event'])
    handleKeyboard(event: KeyboardEvent) {
        if (event.ctrlKey && event.key === 'z') {
            event.preventDefault();
            this.undo();
        } else if (event.ctrlKey && event.key === 'y') {
            event.preventDefault();
            this.redo();
        } else if (event.ctrlKey && event.key === 's') {
            event.preventDefault();
            this.saveSettings();
        }
    }

    // ── Section accordion ──
    toggleSection(section: string) {
        this.activeSection = this.activeSection === section ? '' : section;
    }

    // ── Undo / Redo ──
    onFieldChange() {
        // Push current state to undo before the change takes effect
        this.pushUndo();
        this.redoStack = [];
    }

    private pushUndo() {
        this.undoStack.push(JSON.stringify(this.settings));
        if (this.undoStack.length > this.maxUndo) {
            this.undoStack.shift();
        }
    }

    undo() {
        if (this.undoStack.length === 0) return;
        this.redoStack.push(JSON.stringify(this.settings));
        const prev = this.undoStack.pop()!;
        this.settings = JSON.parse(prev);
    }

    redo() {
        if (this.redoStack.length === 0) return;
        this.undoStack.push(JSON.stringify(this.settings));
        const next = this.redoStack.pop()!;
        this.settings = JSON.parse(next);
    }

    // ── File selection ──
    onFileSelected(event: Event, type: 'logo' | 'heroBg' | 'heroMascot' | 'missionMascot') {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
            if (type === 'logo') this.logoFile = file;
            if (type === 'heroBg') this.heroBgFile = file;
            if (type === 'heroMascot') this.heroMascotFile = file;
            if (type === 'missionMascot') this.missionMascotFile = file;
            this.hasChanges = true;
        }
    }

    // ── Save ──
    saveSettings() {
        if (this.saving) return;
        this.saving = true;

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
                this.savedSettingsJson = JSON.stringify(this.settings);
                this.saving = false;
                this.logoFile = null; this.heroBgFile = null;
                this.heroMascotFile = null; this.missionMascotFile = null;
                this.showToast('¡Cambios guardados exitosamente!', 'success');
            },
            error: (err) => {
                this.saving = false;
                this.showToast('Error al guardar: ' + (err.error?.error || 'Error desconocido'), 'error');
            }
        });
    }

    // ── Navigation ──
    goBack() {
        if (this.hasChanges) {
            const confirm = window.confirm('Tienes cambios sin guardar. ¿Deseas salir de todas formas?');
            if (!confirm) return;
        }
        this.router.navigate(['/admin']);
    }

    openPreview() {
        window.open('/', '_blank');
    }

    // ── Toast ──
    private showToast(msg: string, type: 'success' | 'error') {
        this.toastMsg = msg;
        this.toastType = type;
        setTimeout(() => this.toastMsg = '', 4000);
    }
}
