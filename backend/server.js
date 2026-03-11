/* ============================================
   KOI DESIGN — Backend API Server
   ============================================ */

const express = require('express');
const cors = require('cors');
const compression = require('compression');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
require('dotenv').config();

// Load Cloudinary Config
const { cloudinary, upload } = require('./config/cloudinary');

// Load Mongoose Models
const Card = require('./models/Card');
const User = require('./models/User');
const Gallery = require('./models/Gallery');
const Request = require('./models/Request');
const CotizadorSettings = require('./models/CotizadorSettings');
const SiteSettings = require('./models/SiteSettings');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'koi-design-secret-key-2024';

// ---------- Middleware ----------
app.use(compression());
app.use(cors());
app.use(express.json());

// Security & best-practice headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
});

// Even though images are in Cloudinary, we keep /uploads for any legacy files during transition
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ---------- MongoDB Connection ----------
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/koi', {
    serverSelectionTimeoutMS: 5000
})
    .then(() => {
        console.log('✅ Connected to MongoDB Atlas');
        initAdmin();
    }).catch(err => {
        console.error('❌ MongoDB Connection Error:', err.message);
    });

// ---------- Initialize admin user ----------
async function initAdmin() {
    try {
        let adminExists = await User.findOne({ username: 'admin' });
        if (!adminExists) {
            const hashed = bcrypt.hashSync('admin123', 10);
            await User.create({
                username: 'admin',
                password: hashed,
                role: 'admin',
                nombre: 'Administrador',
                email: 'admin@koidesign.com',
                telefono: ''
            });
            console.log('✅ Admin user initialized in MongoDB');
        } else if (!adminExists.email) {
            // Patch existing admin to have email field
            adminExists.email = 'admin@koidesign.com';
            adminExists.nombre = adminExists.nombre || 'Administrador';
            adminExists.telefono = adminExists.telefono || '';
            await adminExists.save();
            console.log('✅ Admin user patched with email field in MongoDB');
        }
    } catch (err) {
        console.error('Failed to init admin:', err);
    }
}
// Removed sync initAdmin() call here since MongoDB connection handles it now.

// Removed local diskStorage definitions as they are now handled by config/cloudinary.js

// ---------- Auth Middleware ----------
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token requerido' });
    }
    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch {
        return res.status(401).json({ error: 'Token inválido o expirado' });
    }
}

// ============================================
//   AUTH ROUTES
// ============================================

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
        }

        const cleanUsername = username.trim();
        const user = await User.findOne({ username: cleanUsername });
        if (!user) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const valid = bcrypt.compareSync(password, user.password);
        if (!valid) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const token = jwt.sign(
            { id: user._id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({ token, user: user.toJSON() });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

// GET /api/auth/me — verify token
app.get('/api/auth/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ user: user.toJSON() });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/auth/update — change username/password (auth required)
app.put('/api/auth/update', authMiddleware, async (req, res) => {
    const { currentPassword, newUsername, newPassword } = req.body;
    if (!currentPassword) {
        return res.status(400).json({ error: 'Contraseña actual requerida' });
    }

    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

        const valid = bcrypt.compareSync(currentPassword, user.password);
        if (!valid) {
            return res.status(401).json({ error: 'Contraseña actual incorrecta' });
        }

        // Update username if provided
        if (newUsername && newUsername.trim()) {
            user.username = newUsername.trim();
        }

        // Update password if provided
        if (newPassword && newPassword.trim().length >= 4) {
            user.password = bcrypt.hashSync(newPassword.trim(), 10);
        } else if (newPassword) {
            return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 4 caracteres' });
        }

        // Generate new token with updated info
        const token = jwt.sign(
            { id: user._id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({ token, user: user.toJSON(), message: 'Credenciales actualizadas' });
    } catch (err) {
        console.error('Update auth error:', err);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

// ============================================
//   GALLERY ROUTES (public read, auth write)
// ============================================

// GET /api/gallery
app.get('/api/gallery', async (req, res) => {
    try {
        const gallery = await Gallery.find().sort({ order: 1 });
        res.json(gallery.map(g => g.toJSON()));
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener la galería' });
    }
});

// POST /api/gallery — add slide (auth required)
app.post('/api/gallery', authMiddleware, upload.single('media'), async (req, res) => {
    try {
        const { type, alt, src } = req.body;
        const count = await Gallery.countDocuments();

        const newSlide = await Gallery.create({
            type: type || 'image',
            src: req.file ? req.file.path : (src || ''), // req.file.path is the Cloudinary URL
            alt: alt || 'Nuevo slide',
            order: count
        });

        res.status(201).json(newSlide.toJSON());
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al agregar elemento' });
    }
});

// DELETE /api/gallery/:id (auth required)
app.delete('/api/gallery/:id', authMiddleware, async (req, res) => {
    try {
        const slide = await Gallery.findById(req.params.id);
        if (!slide) return res.status(404).json({ error: 'Slide no encontrado' });

        // If it was uploaded to Cloudinary, you would typically use the Cloudinary SDK to delete the file here.
        // For simplicity, we just delete the database record for now.
        if (slide.src) {
            const publicIdMatch = slide.src.match(/\/v\d+\/(.+?)\./);
            if (publicIdMatch && publicIdMatch[1]) {
                await cloudinary.uploader.destroy(publicIdMatch[1]);
            }
        }

        await Gallery.findByIdAndDelete(req.params.id);

        // Recalculate order (optional, but keeps numbers clean)
        const remaining = await Gallery.find().sort({ order: 1 });
        for (let i = 0; i < remaining.length; i++) {
            remaining[i].order = i;
            await remaining[i].save();
        }

        res.json({ message: 'Slide eliminado' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al eliminar' });
    }
});

// ============================================
//   CARDS ROUTES (public read, auth write)
// ============================================

// GET /api/cards
app.get('/api/cards', async (req, res) => {
    try {
        const cards = await Card.find().sort({ order: 1 });
        res.json(cards.map(c => c.toJSON()));
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener cartas', details: err.message, stack: err.stack });
    }
});

// Safe wrapper for upload.fields — if no files are sent, multer-storage-cloudinary can error out
const cardUpload = upload.fields([{ name: 'image', maxCount: 1 }, { name: 'galleryFiles', maxCount: 10 }]);
function safeCardUpload(req, res, next) {
    cardUpload(req, res, (err) => {
        if (err) {
            console.error('Multer upload error (non-fatal):', err.message);
        }
        // Always continue — req.files may be undefined if no files sent, that's fine
        next();
    });
}

// POST /api/cards — add card (auth required)
app.post('/api/cards', authMiddleware, safeCardUpload, async (req, res) => {
    try {
        const { title, description, btnText, btnLink, tag, imageSrc } = req.body;
        const count = await Card.countDocuments();

        let galleryImages = [];
        if (req.files && req.files['galleryFiles']) {
            galleryImages = req.files['galleryFiles'].map(f => f.path);
        }

        const newCard = await Card.create({
            title: title || 'Nueva Card',
            description: description || '',
            image: req.files && req.files['image'] ? req.files['image'][0].path : (imageSrc || ''),
            galleryImages: galleryImages,
            btnText: btnText || 'Ver Más',
            btnLink: btnLink || '#',
            tag: tag || '',
            order: count
        });

        res.status(201).json(newCard.toJSON());
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al crear carta' });
    }
});

// PUT /api/cards/reorder — swap two cards' order (auth required)
app.put('/api/cards/reorder', authMiddleware, async (req, res) => {
    try {
        const { cardId, direction } = req.body; // direction: -1 (up) or 1 (down)
        const card = await Card.findById(cardId);
        if (!card) return res.status(404).json({ error: 'Card no encontrada' });

        const targetOrder = card.order + direction;
        const swapCard = await Card.findOne({ order: targetOrder });

        if (swapCard) {
            swapCard.order = card.order;
            card.order = targetOrder;
            await swapCard.save();
            await card.save();
        }

        const cards = await Card.find().sort({ order: 1 });
        res.json(cards.map(c => c.toJSON()));
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al reordenar' });
    }
});


// PUT /api/cards/:id — edit card (auth required)
app.put('/api/cards/:id', authMiddleware, safeCardUpload, async (req, res) => {
    try {
        const card = await Card.findById(req.params.id);
        if (!card) return res.status(404).json({ error: 'Card no encontrada' });

        const { title, description, btnText, btnLink, tag, keptGalleryImages } = req.body;
        if (title) card.title = title;
        if (description !== undefined) card.description = description;
        if (btnText) card.btnText = btnText;
        if (btnLink) card.btnLink = btnLink;
        if (tag !== undefined) card.tag = tag;

        // handle kept gallery images
        let keptImagesArray = [];
        if (keptGalleryImages) {
            try {
                keptImagesArray = JSON.parse(keptGalleryImages);
            } catch (e) {
                if (typeof keptGalleryImages === 'string') {
                    keptImagesArray = [keptGalleryImages];
                }
            }
        }

        // Find which images were removed to delete them from Cloudinary
        const currentGallery = card.galleryImages || [];
        const removedImages = currentGallery.filter(img => !keptImagesArray.includes(img));
        for (let imgUrl of removedImages) {
            const publicIdMatch = imgUrl.match(/\/v\d+\/(.+?)\./);
            if (publicIdMatch && publicIdMatch[1]) {
                await cloudinary.uploader.destroy(publicIdMatch[1]).catch(() => { });
            }
        }

        let newGalleryImages = [...keptImagesArray];
        if (req.files && req.files['galleryFiles']) {
            const uploadedUrls = req.files['galleryFiles'].map(f => f.path);
            newGalleryImages = newGalleryImages.concat(uploadedUrls);
        }
        card.galleryImages = newGalleryImages;

        if (req.files && req.files['image']) {
            // Remove old main image from Cloudinary if it's there
            if (card.image) {
                const publicIdMatch = card.image.match(/\/v\d+\/(.+?)\./);
                if (publicIdMatch && publicIdMatch[1]) {
                    await cloudinary.uploader.destroy(publicIdMatch[1]).catch(() => { });
                }
            }
            card.image = req.files['image'][0].path; // Cloudinary URL
        }

        await card.save();
        res.json(card.toJSON());
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al editar carta' });
    }
});

// DELETE /api/cards/:id (auth required)
app.delete('/api/cards/:id', authMiddleware, async (req, res) => {
    try {
        const card = await Card.findById(req.params.id);
        if (!card) return res.status(404).json({ error: 'Card no encontrada' });

        if (card.image) {
            const publicIdMatch = card.image.match(/\/v\d+\/(.+?)\./);
            if (publicIdMatch && publicIdMatch[1]) {
                await cloudinary.uploader.destroy(publicIdMatch[1]).catch(() => { });
            }
        }

        if (card.galleryImages && card.galleryImages.length > 0) {
            for (let imgUrl of card.galleryImages) {
                const publicIdMatch = imgUrl.match(/\/v\d+\/(.+?)\./);
                if (publicIdMatch && publicIdMatch[1]) {
                    await cloudinary.uploader.destroy(publicIdMatch[1]).catch(() => { });
                }
            }
        }

        await Card.findByIdAndDelete(req.params.id);

        const remaining = await Card.find().sort({ order: 1 });
        for (let i = 0; i < remaining.length; i++) {
            remaining[i].order = i;
            await remaining[i].save();
        }

        res.json({ message: 'Card eliminada' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al eliminar carta' });
    }
});

// ============================================
//   SEARCH ROUTE (public)
// ============================================

// GET /api/search?q=term
app.get('/api/search', async (req, res) => {
    const queryTerm = (req.query.q || '').trim();
    if (!queryTerm) return res.json({ cards: [], gallery: [] });

    try {
        const regex = new RegExp(queryTerm, 'i');
        const matchedCards = await Card.find({
            $or: [
                { title: regex },
                { description: regex },
                { tag: regex }
            ]
        });

        const matchedGallery = await Gallery.find({
            $or: [
                { alt: regex },
                { type: regex }
            ]
        });

        res.json({
            cards: matchedCards.map(c => c.toJSON()),
            gallery: matchedGallery.map(g => g.toJSON())
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error en búsqueda' });
    }
});

// ============================================
//   USER REGISTRATION (public)
// ============================================

// POST /api/auth/register — register new user (non-admin)
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, password, nombre, email, telefono } = req.body;
        if (!username || !password || !email) {
            return res.status(400).json({ error: 'Usuario, contraseña y email son requeridos' });
        }
        if (password.length < 4) {
            return res.status(400).json({ error: 'La contraseña debe tener al menos 4 caracteres' });
        }

        const exactUser = await User.findOne({ username });
        if (exactUser) return res.status(409).json({ error: 'Ese nombre de usuario ya existe' });

        const emailUser = await User.findOne({ email });
        if (emailUser) return res.status(409).json({ error: 'Ese email ya está registrado' });

        const newUser = await User.create({
            username: username.trim(),
            password: bcrypt.hashSync(password, 10),
            role: 'user',
            nombre: nombre || '',
            email: email.trim(),
            telefono: telefono || ''
        });

        const token = jwt.sign(
            { id: newUser._id, username: newUser.username, role: newUser.role },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.status(201).json({ token, user: newUser.toJSON() });
    } catch (err) {
        console.error('Error en registro:', err);
        res.status(500).json({ error: 'Error interno del servidor al registrar' });
    }
});

// GET /api/auth/profile — get full profile for logged-in user
app.get('/api/auth/profile', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.json(user.toJSON());
    } catch (err) {
        res.status(500).json({ error: 'Error de servidor' });
    }
});

// ============================================
//   USERS MANAGEMENT (admin)
// ============================================

// GET /api/users — admin gets all registered users
app.get('/api/users', authMiddleware, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Solo administradores' });
    try {
        const users = await User.find().sort({ createdAt: -1 });
        res.json(users.map(u => u.toJSON()));
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
});

// DELETE /api/users/:id — admin deletes a user
app.delete('/api/users/:id', authMiddleware, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Solo administradores' });
    if (req.params.id === req.user.id) return res.status(400).json({ error: 'No puedes eliminarte a ti mismo' });

    try {
        const target = await User.findById(req.params.id);
        if (!target) return res.status(404).json({ error: 'Usuario no encontrado' });
        if (target.role === 'admin') return res.status(400).json({ error: 'No puedes eliminar a un administrador' });

        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'Usuario eliminado' });
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar usuario' });
    }
});

// ============================================
//   REQUESTS / PETITIONS ROUTES
// ============================================

// Admin-only middleware
function adminMiddleware(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Acceso solo para administradores' });
    }
    next();
}

// Optional auth — sets req.user if token present, otherwise continues
function optionalAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
            const token = authHeader.split(' ')[1];
            req.user = jwt.verify(token, JWT_SECRET);
        } catch { }
    }
    next();
}

// GET /api/requests — admin gets all requests
app.get('/api/requests', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const requests = await Request.find().sort({ createdAt: -1 });
        res.json(requests.map(r => r.toJSON()));
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener solicitudes' });
    }
});

// GET /api/requests/mine — user gets their own requests
app.get('/api/requests/mine', authMiddleware, async (req, res) => {
    try {
        const mine = await Request.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(mine.map(r => r.toJSON()));
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener tus solicitudes' });
    }
});

// POST /api/requests — any user (or guest) creates a request
app.post('/api/requests', optionalAuth, async (req, res) => {
    const { nombre, email, telefono, asunto, mensaje } = req.body;
    if (!nombre || !email || !mensaje) {
        return res.status(400).json({ error: 'Nombre, email y mensaje son requeridos' });
    }

    try {
        const newReq = await Request.create({
            userId: req.user ? req.user.id : null,
            username: req.user ? req.user.username : null,
            nombre,
            email,
            telefono: telefono || '',
            asunto: asunto || 'General',
            mensaje,
            status: 'pendiente',
            adminNotes: '',
            respondedVia: ''
        });
        res.status(201).json(newReq.toJSON());
    } catch (err) {
        console.error('Error creando solicitud:', err);
        res.status(500).json({ error: 'Error al enviar solicitud' });
    }
});

// PUT /api/requests/:id — admin updates status/notes
app.put('/api/requests/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const reqDoc = await Request.findById(req.params.id);
        if (!reqDoc) return res.status(404).json({ error: 'Solicitud no encontrada' });

        const { status, adminNotes, respondedVia } = req.body;
        if (status) reqDoc.status = status;
        if (adminNotes !== undefined) reqDoc.adminNotes = adminNotes;
        if (respondedVia) reqDoc.respondedVia = respondedVia;

        await reqDoc.save();
        res.json(reqDoc.toJSON());
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar solicitud' });
    }
});

// DELETE /api/requests/:id — admin deletes request
app.delete('/api/requests/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const reqDoc = await Request.findById(req.params.id);
        if (!reqDoc) return res.status(404).json({ error: 'Solicitud no encontrada' });

        await Request.findByIdAndDelete(req.params.id);
        res.json({ message: 'Solicitud eliminada' });
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar solicitud' });
    }
});

// ============================================
//   COTIZADOR SETTINGS ROUTES (GET public, PUT admin)
// ============================================

// GET /api/settings/cotizador
app.get('/api/settings/cotizador', async (req, res) => {
    try {
        let settings = await CotizadorSettings.findOne();
        if (!settings) {
            // Create default settings if not exists
            settings = await CotizadorSettings.create({});
        }
        res.json(settings.toJSON());
    } catch (err) {
        console.error('Error fetching cotizador settings:', err);
        res.status(500).json({ error: 'Error al obtener configuracion del cotizador' });
    }
});

// PUT /api/settings/cotizador (admin only)
app.put('/api/settings/cotizador', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        let settings = await CotizadorSettings.findOne();
        if (!settings) {
            settings = new CotizadorSettings({});
        }

        const { 
            costo3D_m2, 
            costo3D_material,
            costo3D_impresion,
            costoLaser_material,
            costoLaser_impresion,
            costoNormal_m2, 
            costoFraccionado_m2, 
            precioPendon_m2, 
            minimoPendon 
        } = req.body;

        if (costo3D_m2 !== undefined) settings.costo3D_m2 = Number(costo3D_m2);
        if (costo3D_material !== undefined) settings.costo3D_material = Number(costo3D_material);
        if (costo3D_impresion !== undefined) settings.costo3D_impresion = Number(costo3D_impresion);
        if (costoLaser_material !== undefined) settings.costoLaser_material = Number(costoLaser_material);
        if (costoLaser_impresion !== undefined) settings.costoLaser_impresion = Number(costoLaser_impresion);
        if (costoNormal_m2 !== undefined) settings.costoNormal_m2 = Number(costoNormal_m2);
        if (costoFraccionado_m2 !== undefined) settings.costoFraccionado_m2 = Number(costoFraccionado_m2);
        if (precioPendon_m2 !== undefined) settings.precioPendon_m2 = Number(precioPendon_m2);
        if (minimoPendon !== undefined) settings.minimoPendon = Number(minimoPendon);

        await settings.save();
        res.json(settings.toJSON());
    } catch (err) {
        console.error('Error updating cotizador settings:', err);
        res.status(500).json({ error: 'Error al actualizar configuracion del cotizador' });
    }
});

// ============================================
//   SITE SETTINGS (VISUAL CMS)
// ============================================

// GET /api/settings - Public
app.get('/api/settings', async (req, res) => {
    try {
        let settings = await SiteSettings.findOne();
        if (!settings) {
            settings = await SiteSettings.create({});
        }
        res.json(settings);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener configuración del sitio' });
    }
});

// PUT /api/settings - Admin Only
app.put('/api/settings', authMiddleware, upload.fields([
    { name: 'logoImage', maxCount: 1 },
    { name: 'heroBgImage', maxCount: 1 },
    { name: 'heroMascotImage', maxCount: 1 },
    { name: 'missionMascotImage', maxCount: 1 }
]), async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Acceso denegado' });
    }

    try {
        let settings = await SiteSettings.findOne();
        if (!settings) {
            settings = new SiteSettings({});
        }

        const updatableFields = [
            'primaryColor', 'secondaryColor', 'accentColor', 'bgColor', 'cardBgColor',
            'logoUrl', 'heroBgUrl', 'heroMascotUrl', 'missionMascotUrl',
            'heroTitle', 'heroTitleColor', 'heroTitleFont', 'heroHighlightItem1', 'heroHighlightItem2', 'heroHighlightItem3',
            'heroSubtitle', 'heroSubtitleColor', 'heroSubtitleFont', 'heroBtnText', 'heroActionWord',
            'collectionTitle', 'collectionSubtitle',
            'servicesTitle', 'service1Title', 'service1Desc', 'service2Title', 'service2Desc', 'service3Title', 'service3Desc',
            'missionTitle', 'missionSubtitle', 'missionActionWord',
            'paymentsTitle', 'shippingTitle', 'shippingItem1Title', 'shippingItem1Desc', 'shippingItem2Title', 'shippingItem2Desc',
            'socialTitle', 'socialWhatsapp', 'socialFacebook', 'socialInstagram', 'socialTiktok', 'socialCatalogText',
            'ctaTitle', 'ctaSubtitle', 'ctaBtn1Text', 'ctaBtn2Text',
            'contactTitle', 'contactSubtitle', 'contactActionWord',
            'contactWhatsappNumber', 'contactWhatsappText', 'contactEmailAddress', 'contactEmailText',
            'contactLocation', 'contactScheduleWeekdays', 'contactScheduleWeekends',
            'contactCardBgColor', 'contactCardBgOpacity', 'contactWhatsappTextColor', 'contactEmailTextColor',
            'footerText', 'customBlocks',
            // Images
            'collectionMascotLeftUrl', 'collectionMascotRightUrl',
            'modalDragonLeftUrl', 'modalDragonRightUrl', 'ctaBgUrl',
            // Component Styles
            'cardBorderRadius', 'cardBorderColor', 'cardOpacity',
            'serviceCardBg', 'serviceCardBorderRadius', 'serviceCardBorderColor',
            'infoBlockBg', 'infoBlockBorderColor', 'infoBlockBorderRadius',
            'speechBubbleBg', 'speechBubbleBorderColor', 'speechBubbleBorderRadius',
            'ctaBtnBg', 'ctaBtnColor', 'ctaBtnBorderRadius',
            'channelCardBg', 'channelCardBorderColor', 'channelCardBorderRadius',
            'modalOverlayBg', 'modalContentBg', 'modalBorderColor',
            'missionBannerBg', 'missionBannerBorderColor'
        ];

        updatableFields.forEach(field => {
            if (req.body[field] !== undefined && req.body[field] !== null) {
                settings[field] = req.body[field];
            }
        });

        if (req.files) {
            if (req.files['logoImage'] && req.files['logoImage'][0]) {
                settings.logoUrl = req.files['logoImage'][0].path;
            }
            if (req.files['heroBgImage'] && req.files['heroBgImage'][0]) {
                settings.heroBgUrl = req.files['heroBgImage'][0].path;
            }
            if (req.files['heroMascotImage'] && req.files['heroMascotImage'][0]) {
                settings.heroMascotUrl = req.files['heroMascotImage'][0].path;
            }
            if (req.files['missionMascotImage'] && req.files['missionMascotImage'][0]) {
                settings.missionMascotUrl = req.files['missionMascotImage'][0].path;
            }
        }

        await settings.save();
        res.json(settings);
    } catch (err) {
        console.error('Error updating settings:', err);
        res.status(500).json({ error: 'Error al actualizar configuración' });
    }
});

// ============================================
//   SERVE FRONTEND (PRODUCTION / RENDER)
// ============================================

const FRONTEND_DIR = path.join(__dirname, '..', 'frontend', 'dist', 'frontend', 'browser');

console.log('--- DIAGNOSTICO DE RUTAS ---');
console.log('__dirname:', __dirname);
console.log('FRONTEND_DIR:', FRONTEND_DIR);
if (fs.existsSync(FRONTEND_DIR)) {
    console.log('Contenido de FRONTEND_DIR:', fs.readdirSync(FRONTEND_DIR));
} else {
    console.error('ALERTA: FRONTEND_DIR no existe en la ruta especificada.');
}
console.log('----------------------------');

app.use(express.static(FRONTEND_DIR, {
    maxAge: '1y',
    immutable: true,
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache');
        }
    }
}));

app.get('*', (req, res) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
        return res.status(404).json({ error: 'Endpoint no encontrado' });
    }

    const indexPath = path.join(FRONTEND_DIR, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send('Frontend not built yet. Run `npm run build` from the frontend directory.');
    }
});

app.listen(PORT, () => {
    console.log(`🐟 KOI Design API corriendo en puerto ${PORT}`);
});
