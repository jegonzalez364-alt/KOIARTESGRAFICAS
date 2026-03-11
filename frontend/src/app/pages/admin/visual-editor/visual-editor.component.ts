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
        heroTitle: 'Transformamos tus Ideas en', heroTitleColor: '#ffffff', heroTitleFont: "'Inter', 'Segoe UI', sans-serif", heroHighlightItem1: 'Arte Láser',
        heroSubtitle: 'Personalizamos cada detalle para sorprender.', heroSubtitleColor: '#e0e0e0', heroSubtitleFont: "'Inter', 'Segoe UI', sans-serif",
        heroBtnText: 'Explorar Catálogo', heroActionWord: '¡BAM!',
        collectionTitle: 'La Colección', collectionSubtitle: 'Explora nuestros paneles de asombrosos artefactos de madera. ¡Cada uno cuenta una historia!',
        missionTitle: 'Tu idea, nuestra misión', missionSubtitle: 'Siempre encontramos la forma de hacerla posible. 🤯',
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
        ctaBtn2Text: 'WhatsApp',
        footerText: '© 2024 KOI Design. Todos los derechos reservados. Hecho con 💚 y Láseres.',
        customBlocks: '[]',
        collectionMascotLeftUrl: 'img/dragoasomadonaranja.png',
        collectionMascotRightUrl: 'img/dragoasomadorojo.png',
        modalDragonLeftUrl: 'img/DragonTecnologico2.png',
        modalDragonRightUrl: 'img/DragonTecnologico.png',
        ctaBgUrl: '',
        modalTextTopLeft: '¡ZAP!',
        modalTextTopRight: '¡POW!',
        modalTextBottomLeft: '¡BOOM!',
        modalTextBottomRight: '¡WOW!',
        primaryFont: "'Inter', 'Segoe UI', sans-serif",
        cardBorderRadius: '4px', cardBorderColor: '#E91E9E', cardOpacity: '1',
        serviceCardBg: 'rgba(255,255,255,0.04)', serviceCardBorderRadius: '4px', serviceCardBorderColor: 'rgba(233,30,158,0.3)',
        infoBlockBg: 'rgba(255,255,255,0.03)', infoBlockBorderColor: 'rgba(255,215,0,0.25)', infoBlockBorderRadius: '4px',
        speechBubbleBg: 'rgba(255,255,255,0.95)', speechBubbleBorderColor: '#E91E9E', speechBubbleBorderRadius: '20px',
        ctaBtnBg: '#003333', ctaBtnColor: '#ffffff', ctaBtnBorderRadius: '30px',
        channelCardBg: 'rgba(255,255,255,0.04)', channelCardBorderColor: 'rgba(0,191,255,0.2)', channelCardBorderRadius: '4px',
        modalOverlayBg: 'rgba(0,0,0,0.92)', modalContentBg: '#0a1a2f', modalBorderColor: '#E91E9E',
        missionBannerBg: 'rgba(255,255,255,0.04)', missionBannerBorderColor: 'rgba(0,191,255,0.25)'
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
    collectionLeftFile: File | null = null;
    collectionRightFile: File | null = null;
    modalLeftFile: File | null = null;
    modalRightFile: File | null = null;

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
        cta: 'Contacto (CTA)',
        footer: 'Pie de Página'
    };

    // Widget blocks
    blocks: any[] = [];
    editingBlockId = '';

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
                    this.parseBlocks();
                }
            },
            error: () => this.showToast('Error al cargar la configuración', 'error')
        });
    }

    private parseBlocks() {
        try {
            this.blocks = JSON.parse(this.settings.customBlocks || '[]');
        } catch {
            this.blocks = [];
        }
    }

    private syncBlocks() {
        this.settings.customBlocks = JSON.stringify(this.blocks);
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
    onFileSelected(event: Event, type: 'logo' | 'heroBg' | 'heroMascot' | 'missionMascot' | 'collectionLeft' | 'collectionRight' | 'modalLeft' | 'modalRight') {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
            if (type === 'logo') this.logoFile = file;
            if (type === 'heroBg') this.heroBgFile = file;
            if (type === 'heroMascot') this.heroMascotFile = file;
            if (type === 'missionMascot') this.missionMascotFile = file;
            if (type === 'collectionLeft') this.collectionLeftFile = file;
            if (type === 'collectionRight') this.collectionRightFile = file;
            if (type === 'modalLeft') this.modalLeftFile = file;
            if (type === 'modalRight') this.modalRightFile = file;
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
        if (this.collectionLeftFile) formData.append('collectionLeftImage', this.collectionLeftFile);
        if (this.collectionRightFile) formData.append('collectionRightImage', this.collectionRightFile);
        if (this.modalLeftFile) formData.append('modalLeftImage', this.modalLeftFile);
        if (this.modalRightFile) formData.append('modalRightImage', this.modalRightFile);

        this.api.updateSettings(formData).subscribe({
            next: (res) => {
                this.settings = { ...res };
                this.savedSettingsJson = JSON.stringify(this.settings);
                this.saving = false;
                this.logoFile = null; this.heroBgFile = null;
                this.heroMascotFile = null; this.missionMascotFile = null;
                this.collectionLeftFile = null; this.collectionRightFile = null;
                this.modalLeftFile = null; this.modalRightFile = null;
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

    // ── Widget Blocks ──
    addBlock(type: 'text' | 'button' | 'divider' | 'spacer') {
        this.pushUndo();
        const defaults: Record<string, any> = {
            text: { content: 'Tu texto aquí...', styles: { color: '#ffffff', fontSize: '16px' } },
            button: { content: 'Botón', styles: { color: '#ffffff', bgColor: '#E91E9E', fontSize: '16px' } },
            divider: { content: '', styles: { color: '#FFD700', fontSize: '2px' } },
            spacer: { content: '', styles: { fontSize: '30px' } }
        };
        const block = {
            id: 'block_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            type,
            ...defaults[type]
        };
        this.blocks.push(block);
        this.syncBlocks();
        this.editingBlockId = block.id;
        this.redoStack = [];
    }

    removeBlock(index: number) {
        this.pushUndo();
        this.blocks.splice(index, 1);
        this.syncBlocks();
        this.redoStack = [];
    }

    moveBlock(index: number, direction: number) {
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= this.blocks.length) return;
        this.pushUndo();
        const temp = this.blocks[index];
        this.blocks[index] = this.blocks[newIndex];
        this.blocks[newIndex] = temp;
        this.syncBlocks();
        this.redoStack = [];
    }

    onBlockChange() {
        this.pushUndo();
        this.syncBlocks();
        this.redoStack = [];
    }
}
