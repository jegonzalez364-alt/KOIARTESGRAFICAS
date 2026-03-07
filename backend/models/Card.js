const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    galleryImages: [{ type: String }],
    btnText: { type: String, default: 'Ver Más' },
    btnLink: { type: String, default: '#' },
    tag: { type: String, default: '' },
    order: { type: Number, default: 0 }
}, {
    timestamps: true
});

// Virtual property to simulate the local 'id' and 'number' formatting
cardSchema.virtual('number').get(function () {
    return `#${String(this.order + 1).padStart(2, '0')}`;
});

cardSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model('Card', cardSchema);
