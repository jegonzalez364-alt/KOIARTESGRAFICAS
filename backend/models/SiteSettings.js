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

    // --- TEXTS: MISSION ---
    missionTitle: { type: String, default: 'Tu idea, nuestra misión' },
    missionSubtitle: { type: String, default: 'Siempre encontramos la forma de hacerla posible. 🤯' },
    missionActionWord: { type: String, default: '¡BOOM!' },

    // --- TEXTS: CONTACT HERO ---
    contactTitle: { type: String, default: 'Contáctanos' },
    contactSubtitle: { type: String, default: '¿Tienes una idea? ¡Hagámosla realidad! Escríbenos y nuestro equipo te responderá más rápido que un rayo láser.' },
    contactActionWord: { type: String, default: '¡ZAP!' },

}, { timestamps: true });

// We use a singleton pattern where there is only one settings document
module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
