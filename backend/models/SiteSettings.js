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
    heroHighlightItem1: { type: String, default: 'Arte Láser' },
    heroHighlightItem2: { type: String, default: 'Regalos Únicos' },
    heroHighlightItem3: { type: String, default: 'Diseño Creativo' },
    heroSubtitle: { type: String, default: 'Personalizamos cada detalle para sorprender.' },
    heroBtnText: { type: String, default: 'Explorar Catálogo' },
    heroActionWord: { type: String, default: '¡BAM!' },

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

    // --- TEXTS: CONTACT PAGE HERO ---
    contactTitle: { type: String, default: 'Contáctanos' },
    contactSubtitle: { type: String, default: '¿Tienes una idea? ¡Hagámosla realidad! Escríbenos y nuestro equipo te responderá más rápido que un rayo láser.' },
    contactActionWord: { type: String, default: '¡ZAP!' },

    // --- FOOTER ---
    footerText: { type: String, default: '© 2024 KOI Design. Todos los derechos reservados. Hecho con 💚 y Láseres.' },

    // --- CUSTOM BLOCKS (WIDGETS) ---
    customBlocks: { type: String, default: '[]' },

}, { timestamps: true });

// We use a singleton pattern where there is only one settings document
module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
