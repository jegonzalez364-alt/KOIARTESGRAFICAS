const mongoose = require('mongoose');

const cotizadorSettingsSchema = new mongoose.Schema({
    costo3D_m2: { type: Number, default: 106000 },
    costoNormal_m2: { type: Number, default: 53180 },
    costoFraccionado_m2: { type: Number, default: 53180 },
    precioPendon_m2: { type: Number, default: 80000 },
    minimoPendon: { type: Number, default: 40000 }
}, { timestamps: true });

module.exports = mongoose.model('CotizadorSettings', cotizadorSettingsSchema);
