const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user', enum: ['admin', 'user'] },
    nombre: { type: String, default: '' },
    email: { type: String, default: '' },
    telefono: { type: String, default: '' }
}, {
    timestamps: true
});

userSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.password; // Do not return password by default
        return ret;
    }
});

module.exports = mongoose.model('User', userSchema);
