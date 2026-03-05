const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
    userId: { type: String, default: null },
    username: { type: String, default: null },
    nombre: { type: String, required: true },
    email: { type: String, required: true },
    telefono: { type: String, default: '' },
    asunto: { type: String, default: 'General' },
    mensaje: { type: String, required: true },
    status: { type: String, default: 'pendiente', enum: ['pendiente', 'en_proceso', 'completado', 'cancelado'] },
    adminNotes: { type: String, default: '' },
    respondedVia: { type: String, default: '' }
}, {
    timestamps: true
});

requestSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model('Request', requestSchema);
