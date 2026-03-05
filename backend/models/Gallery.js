const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
    type: { type: String, default: 'image', enum: ['image', 'video', 'youtube'] },
    src: { type: String, required: true },
    alt: { type: String, default: 'Media slide' },
    order: { type: Number, default: 0 }
}, {
    timestamps: true
});

gallerySchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model('Gallery', gallerySchema);
