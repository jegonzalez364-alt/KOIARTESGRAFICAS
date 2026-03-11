const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema({
    // --- GENERAL / COLORS ---
    primaryColor: { type: String, default: '#E91E9E' }, // magenta
    secondaryColor: { type: String, default: '#00BFFF' }, // cyan
    accentColor: { type: String, default: '#FFD700' }, // yellow
    bgColor: { type: String, default: '#06101e' }, // dark-bg
    cardBgColor: { type: String, default: '#f5f0e8' }, // card-bg

    // --- IMAGES ---
    logoUrl: { type: String, default: 'img/logoicon.png' },
    heroBgUrl: { type: String, default: '/img/KoiFondo.png' },
    heroMascotUrl: { type: String, default: 'img/Koi-Icono.png' },
    missionMascotUrl: { type: String, default: 'img/DragonRojoDiseñador.png' },

    // --- TEXTS: HERO ---
    heroTitle: { type: String, default: 'Transformamos tus Ideas en' },
    heroTitleColor: { type: String, default: '#ffffff' },
    heroTitleFont: { type: String, default: "'Inter', sans-serif" },
    heroHighlightItem1: { type: String, default: 'Arte Láser' },
    heroHighlightItem2: { type: String, default: 'Regalos Únicos' },
    heroHighlightItem3: { type: String, default: 'Diseño Creativo' },
    heroSubtitle: { type: String, default: 'Personalizamos cada detalle para sorprender.' },
    heroSubtitleColor: { type: String, default: '#e0e0e0' },
    heroSubtitleFont: { type: String, default: "'Inter', sans-serif" },
    heroBtnText: { type: String, default: 'Explorar Catálogo' },
    heroActionWord: { type: String, default: '¡BAM!' },

    // Collection texts
    collectionTitle: { type: String, default: 'La Colección' },
    collectionSubtitle: { type: String, default: 'Explora nuestros paneles de asombrosos artefactos de madera. ¡Cada uno cuenta una historia!' },

    // --- TEXTS: ABOUT (NOSOTROS) SERVICES ---
    servicesTitle: { type: String, default: '¡Personalizamos tus mejores ideas!' },

    service1Title: { type: String, default: 'Personalización Total' },
    service1Desc: { type: String, default: 'Cualquier diseño que imagines, lo hacemos realidad. Fotos, geek, anime, series, música, decoración ¡y mucho más! Ideal para sorprender a esa persona especial.' },

    service2Title: { type: String, default: 'Corte Láser de Precisión' },
    service2Desc: { type: String, default: 'Trabajamos en madera, acrílico y más materiales con acabados limpios, exactos y de alta calidad.' },

    service3Title: { type: String, default: 'Fechas Especiales' },
    service3Desc: { type: String, default: 'Amor y Amistad, aniversarios, cumpleaños o cualquier ocasión que merezca un detalle único.' },

    // --- TEXTS: MISSION ---
    missionTitle: { type: String, default: 'Tu idea, nuestra misión' },
    missionSubtitle: { type: String, default: 'Siempre encontramos la forma de hacerla posible. 🤯' },
    missionActionWord: { type: String, default: '¡BOOM!' },

    // --- TEXTS: INFO BLOCKS (PAYMENTS, SHIPPING, SOCIAL) ---
    paymentsTitle: { type: String, default: 'Pagos Fáciles' },

    shippingTitle: { type: String, default: 'Envíos Seguros y Rápidos' },
    shippingItem1Title: { type: String, default: 'Servientrega' },
    shippingItem1Desc: { type: String, default: 'Directo a tu puerta, a nivel nacional' },
    shippingItem2Title: { type: String, default: 'Interrapidísimo' },
    shippingItem2Desc: { type: String, default: 'Envíos rápidos y seguros a toda Colombia' },

    socialTitle: { type: String, default: 'Encuéntranos' },
    socialWhatsapp: { type: String, default: '318 690 9433' },
    socialFacebook: { type: String, default: 'KoiDesignsSoacha' },
    socialInstagram: { type: String, default: '@KoiDesignsSoacha' },
    socialTiktok: { type: String, default: '@koiartesgraficas' },
    socialCatalogText: { type: String, default: 'Ver Catálogo' },

    // --- TEXTS: CONTACT CTA ---
    ctaTitle: { type: String, default: '¿Listo para empezar tu historia?' },
    ctaSubtitle: { type: String, default: 'Ya sea un reloj personalizado o un pedido masivo para tu próximo evento, estamos aquí para hacerlo realidad.' },
    ctaBtn1Text: { type: String, default: 'Contáctanos' },
    ctaBtn2Text: { type: String, default: 'WhatsApp' },

    contactTitle: { type: String, default: 'Contáctanos' },
    contactSubtitle: { type: String, default: '¿Tienes una idea? ¡Hagámosla realidad! Escríbenos y nuestro equipo te responderá más rápido que un rayo láser.' },
    contactActionWord: { type: String, default: '¡ZAP!' },
    
    // --- TEXTS: CONTACT INFO WIDGETS ---
    contactWhatsappNumber: { type: String, default: '+57 318 690 9433' },
    contactWhatsappText: { type: String, default: 'Chatea con nosotros' },
    contactEmailAddress: { type: String, default: 'contacto@koidesign.com' },
    contactEmailText: { type: String, default: 'Escríbenos' },
    contactLocation: { type: String, default: 'Bogotá, Colombia' },
    contactScheduleWeekdays: { type: String, default: 'Lunes a Viernes: 8am — 6pm' },
    contactScheduleWeekends: { type: String, default: 'Sábados: 9am — 2pm' },
    contactCardBgColor: { type: String, default: '#ffffff' },
    contactCardBgOpacity: { type: String, default: '0.03' },
    contactWhatsappTextColor: { type: String, default: '#00BFFF' },
    contactEmailTextColor: { type: String, default: '#00BFFF' },

    // --- FOOTER ---
    footerText: { type: String, default: '© 2024 KOI Design. Todos los derechos reservados. Hecho con 💚 y Láseres.' },

    // --- ALL PROJECT IMAGES ---
    collectionMascotLeftUrl: { type: String, default: 'img/dragoasomadonaranja.png' },
    collectionMascotRightUrl: { type: String, default: 'img/dragoasomadorojo.png' },
    modalDragonLeftUrl: { type: String, default: 'img/DragonTecnologico2.png' },
    modalDragonRightUrl: { type: String, default: 'img/DragonTecnologico.png' },
    ctaBgUrl: { type: String, default: '' },

    // --- GALLERY MODAL TEXTS ---
    modalTextTopLeft: { type: String, default: '¡ZAP!' },
    modalTextTopRight: { type: String, default: '¡POW!' },
    modalTextBottomLeft: { type: String, default: '¡BOOM!' },
    modalTextBottomRight: { type: String, default: '¡WOW!' },

    // --- TYPOGRAPHY ---
    primaryFont: { type: String, default: "'Inter', 'Segoe UI', sans-serif" },

    // --- COMPONENT STYLES ---
    // Cards (La Colección)
    cardBorderRadius: { type: String, default: '4px' },
    cardBorderColor: { type: String, default: '#E91E9E' },
    cardOpacity: { type: String, default: '1' },

    // Service Cards
    serviceCardBg: { type: String, default: 'rgba(255,255,255,0.04)' },
    serviceCardBorderRadius: { type: String, default: '4px' },
    serviceCardBorderColor: { type: String, default: 'rgba(233,30,158,0.3)' },

    // Info Blocks (Pagos, Envíos, Redes)
    infoBlockBg: { type: String, default: 'rgba(255,255,255,0.03)' },
    infoBlockBorderColor: { type: String, default: 'rgba(255,215,0,0.25)' },
    infoBlockBorderRadius: { type: String, default: '4px' },

    // Speech Bubble
    speechBubbleBg: { type: String, default: 'rgba(6,16,30,0.85)' },
    speechBubbleBorderColor: { type: String, default: '#E91E9E' },
    speechBubbleBorderRadius: { type: String, default: '20px' },

    // CTA Buttons (Starburst)
    ctaBtnBg: { type: String, default: '#003333' },
    ctaBtnColor: { type: String, default: '#ffffff' },
    ctaBtnBorderRadius: { type: String, default: '30px' },

    // Channel Cards (Redes Sociales)
    channelCardBg: { type: String, default: 'rgba(255,255,255,0.04)' },
    channelCardBorderColor: { type: String, default: 'rgba(0,191,255,0.2)' },
    channelCardBorderRadius: { type: String, default: '4px' },

    // Gallery Modal
    modalOverlayBg: { type: String, default: 'rgba(0,0,0,0.92)' },
    modalContentBg: { type: String, default: '#0a1a2f' },
    modalBorderColor: { type: String, default: '#E91E9E' },

    // Mission Banner
    missionBannerBg: { type: String, default: 'rgba(255,255,255,0.04)' },
    missionBannerBorderColor: { type: String, default: 'rgba(0,191,255,0.25)' },

    // --- CUSTOM BLOCKS (WIDGETS) ---
    customBlocks: { type: String, default: '[]' },

}, { timestamps: true });

// We use a singleton pattern where there is only one settings document
module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
