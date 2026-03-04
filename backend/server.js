/* ============================================
   KOI DESIGN — Backend API Server
   ============================================ */

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'koi-design-secret-key-2024';

// ---------- Middleware ----------
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ---------- File paths ----------
const DATA_DIR = path.join(__dirname, 'data');
const GALLERY_FILE = path.join(DATA_DIR, 'gallery.json');
const CARDS_FILE = path.join(DATA_DIR, 'cards.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const REQUESTS_FILE = path.join(DATA_DIR, 'requests.json');

// ---------- Helpers ----------
function readJSON(file) {
    try {
        return JSON.parse(fs.readFileSync(file, 'utf-8'));
    } catch {
        return [];
    }
}

function writeJSON(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
}

// ---------- Initialize admin user ----------
function initAdmin() {
    const users = readJSON(USERS_FILE);
    const adminExists = users.find(u => u.id === 'admin-1');
    if (!adminExists) {
        const hashed = bcrypt.hashSync('admin123', 10);
        const adminUser = {
            id: 'admin-1',
            username: 'admin',
            password: hashed,
            role: 'admin',
            nombre: 'Administrador',
            email: 'admin@koidesign.com',
            telefono: ''
        };
        users.push(adminUser);
        writeJSON(USERS_FILE, users);
        console.log('✅ Admin user initialized (user: admin / pass: admin123)');
    } else if (!adminExists.email) {
        // Patch existing admin to have email field
        adminExists.email = 'admin@koidesign.com';
        adminExists.nombre = adminExists.nombre || 'Administrador';
        adminExists.telefono = adminExists.telefono || '';
        writeJSON(USERS_FILE, users);
        console.log('✅ Admin user patched with email field');
    }
}
initAdmin();

// ---------- Multer config for file uploads ----------
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'uploads'));
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${uuidv4()}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif|webp|mp4|webm|mov/;
        const ext = allowed.test(path.extname(file.originalname).toLowerCase());
        const mime = allowed.test(file.mimetype);
        if (ext || mime) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten imágenes y videos'));
        }
    }
});

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
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
    }

    const cleanUsername = username.trim();
    const users = readJSON(USERS_FILE);
    const user = users.find(u => u.username === cleanUsername);
    if (!user) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '8h' }
    );

    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
});

// GET /api/auth/me — verify token
app.get('/api/auth/me', authMiddleware, (req, res) => {
    res.json({ user: req.user });
});

// PUT /api/auth/update — change username/password (auth required)
app.put('/api/auth/update', authMiddleware, (req, res) => {
    const { currentPassword, newUsername, newPassword } = req.body;
    if (!currentPassword) {
        return res.status(400).json({ error: 'Contraseña actual requerida' });
    }

    const users = readJSON(USERS_FILE);
    const user = users.find(u => u.id === req.user.id);
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

    writeJSON(USERS_FILE, users);

    // Generate new token with updated info
    const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '8h' }
    );

    res.json({ token, user: { id: user.id, username: user.username, role: user.role }, message: 'Credenciales actualizadas' });
});

// ============================================
//   GALLERY ROUTES (public read, auth write)
// ============================================

// GET /api/gallery
app.get('/api/gallery', (req, res) => {
    const gallery = readJSON(GALLERY_FILE);
    gallery.sort((a, b) => a.order - b.order);
    res.json(gallery);
});

// POST /api/gallery — add slide (auth required)
app.post('/api/gallery', authMiddleware, upload.single('media'), (req, res) => {
    const gallery = readJSON(GALLERY_FILE);
    const { type, alt, src } = req.body;

    const newSlide = {
        id: `slide-${uuidv4().slice(0, 8)}`,
        type: type || 'image',
        src: req.file ? `/uploads/${req.file.filename}` : (src || ''),
        alt: alt || 'Nuevo slide',
        order: gallery.length
    };

    gallery.push(newSlide);
    writeJSON(GALLERY_FILE, gallery);
    res.status(201).json(newSlide);
});

// DELETE /api/gallery/:id (auth required)
app.delete('/api/gallery/:id', authMiddleware, (req, res) => {
    let gallery = readJSON(GALLERY_FILE);
    const item = gallery.find(g => g.id === req.params.id);
    if (!item) return res.status(404).json({ error: 'Slide no encontrado' });

    // Delete file if it's an upload
    if (item.src && item.src.startsWith('/uploads/')) {
        const filePath = path.join(__dirname, item.src);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    gallery = gallery.filter(g => g.id !== req.params.id);
    // Recalculate order
    gallery.forEach((g, i) => g.order = i);
    writeJSON(GALLERY_FILE, gallery);
    res.json({ message: 'Slide eliminado' });
});

// ============================================
//   CARDS ROUTES (public read, auth write)
// ============================================

// GET /api/cards
app.get('/api/cards', (req, res) => {
    const cards = readJSON(CARDS_FILE);
    cards.sort((a, b) => a.order - b.order);
    res.json(cards);
});

// POST /api/cards — add card (auth required)
app.post('/api/cards', authMiddleware, upload.single('image'), (req, res) => {
    const cards = readJSON(CARDS_FILE);
    const { title, description, btnText, btnLink, tag, imageSrc } = req.body;

    const newCard = {
        id: `card-${uuidv4().slice(0, 8)}`,
        number: `#${String(cards.length + 1).padStart(2, '0')}`,
        title: title || 'Nueva Card',
        description: description || '',
        image: req.file ? `/uploads/${req.file.filename}` : (imageSrc || ''),
        btnText: btnText || 'Ver Más',
        btnLink: btnLink || '#',
        tag: tag || '',
        order: cards.length
    };

    cards.push(newCard);
    writeJSON(CARDS_FILE, cards);
    res.status(201).json(newCard);
});

// PUT /api/cards/:id — edit card (auth required)
app.put('/api/cards/:id', authMiddleware, upload.single('image'), (req, res) => {
    const cards = readJSON(CARDS_FILE);
    const index = cards.findIndex(c => c.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Card no encontrada' });

    const { title, description, btnText, btnLink, tag } = req.body;
    if (title) cards[index].title = title;
    if (description) cards[index].description = description;
    if (btnText) cards[index].btnText = btnText;
    if (btnLink) cards[index].btnLink = btnLink;
    if (tag !== undefined) cards[index].tag = tag;
    if (req.file) {
        // Delete old file if it was an upload
        if (cards[index].image && cards[index].image.startsWith('/uploads/')) {
            const old = path.join(__dirname, cards[index].image);
            if (fs.existsSync(old)) fs.unlinkSync(old);
        }
        cards[index].image = `/uploads/${req.file.filename}`;
    }

    writeJSON(CARDS_FILE, cards);
    res.json(cards[index]);
});

// DELETE /api/cards/:id (auth required)
app.delete('/api/cards/:id', authMiddleware, (req, res) => {
    let cards = readJSON(CARDS_FILE);
    const item = cards.find(c => c.id === req.params.id);
    if (!item) return res.status(404).json({ error: 'Card no encontrada' });

    if (item.image && item.image.startsWith('/uploads/')) {
        const filePath = path.join(__dirname, item.image);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    cards = cards.filter(c => c.id !== req.params.id);
    cards.forEach((c, i) => {
        c.order = i;
        c.number = `#${String(i + 1).padStart(2, '0')}`;
    });
    writeJSON(CARDS_FILE, cards);
    res.json({ message: 'Card eliminada' });
});

// ============================================
//   SEARCH ROUTE (public)
// ============================================

// GET /api/search?q=term
app.get('/api/search', (req, res) => {
    const query = (req.query.q || '').toLowerCase().trim();
    if (!query) return res.json({ cards: [], gallery: [] });

    const cards = readJSON(CARDS_FILE);
    const gallery = readJSON(GALLERY_FILE);

    const matchedCards = cards.filter(c =>
        c.title.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        (c.tag && c.tag.toLowerCase().includes(query))
    );

    const matchedGallery = gallery.filter(g =>
        g.alt.toLowerCase().includes(query) ||
        (g.type && g.type.toLowerCase().includes(query))
    );

    res.json({ cards: matchedCards, gallery: matchedGallery });
});

// ============================================
//   USER REGISTRATION (public)
// ============================================

// POST /api/auth/register — register new user (non-admin)
app.post('/api/auth/register', (req, res) => {
    try {
        const { username, password, nombre, email, telefono } = req.body;
        if (!username || !password || !email) {
            return res.status(400).json({ error: 'Usuario, contraseña y email son requeridos' });
        }
        if (password.length < 4) {
            return res.status(400).json({ error: 'La contraseña debe tener al menos 4 caracteres' });
        }

        const users = readJSON(USERS_FILE);
        if (users.find(u => u.username === username)) {
            return res.status(409).json({ error: 'Ese nombre de usuario ya existe' });
        }
        if (users.find(u => u.email && u.email === email)) {
            return res.status(409).json({ error: 'Ese email ya está registrado' });
        }

        const newUser = {
            id: `user-${uuidv4().slice(0, 8)}`,
            username: username.trim(),
            password: bcrypt.hashSync(password, 10),
            role: 'user',
            nombre: nombre || '',
            email: email.trim(),
            telefono: telefono || '',
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        writeJSON(USERS_FILE, users);

        const token = jwt.sign(
            { id: newUser.id, username: newUser.username, role: newUser.role },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.status(201).json({
            token,
            user: { id: newUser.id, username: newUser.username, role: newUser.role, nombre: newUser.nombre, email: newUser.email, telefono: newUser.telefono }
        });
    } catch (err) {
        console.error('Error en registro:', err);
        res.status(500).json({ error: 'Error interno del servidor al registrar' });
    }
});

// GET /api/auth/profile — get full profile for logged-in user
app.get('/api/auth/profile', authMiddleware, (req, res) => {
    const users = readJSON(USERS_FILE);
    const user = users.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({
        id: user.id, username: user.username, role: user.role,
        nombre: user.nombre || '', email: user.email || '', telefono: user.telefono || ''
    });
});
// ============================================
//   USERS MANAGEMENT (admin)
// ============================================

// GET /api/users — admin gets all registered users
app.get('/api/users', authMiddleware, (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Solo administradores' });
    const users = readJSON(USERS_FILE);
    const safeUsers = users.map(u => ({
        id: u.id, username: u.username, role: u.role,
        nombre: u.nombre || '', email: u.email || '', telefono: u.telefono || '',
        createdAt: u.createdAt || ''
    }));
    res.json(safeUsers);
});

// DELETE /api/users/:id — admin deletes a user
app.delete('/api/users/:id', authMiddleware, (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Solo administradores' });
    if (req.params.id === req.user.id) return res.status(400).json({ error: 'No puedes eliminarte a ti mismo' });
    let users = readJSON(USERS_FILE);
    const target = users.find(u => u.id === req.params.id);
    if (!target) return res.status(404).json({ error: 'Usuario no encontrado' });
    if (target.role === 'admin') return res.status(400).json({ error: 'No puedes eliminar a un administrador' });
    users = users.filter(u => u.id !== req.params.id);
    writeJSON(USERS_FILE, users);
    res.json({ message: 'Usuario eliminado' });
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
app.get('/api/requests', authMiddleware, adminMiddleware, (req, res) => {
    const requests = readJSON(REQUESTS_FILE);
    requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(requests);
});

// GET /api/requests/mine — user gets their own requests
app.get('/api/requests/mine', authMiddleware, (req, res) => {
    const requests = readJSON(REQUESTS_FILE);
    const mine = requests.filter(r => r.userId === req.user.id);
    mine.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(mine);
});

// POST /api/requests — any user (or guest) creates a request
app.post('/api/requests', optionalAuth, (req, res) => {
    const { nombre, email, telefono, asunto, mensaje } = req.body;
    if (!nombre || !email || !mensaje) {
        return res.status(400).json({ error: 'Nombre, email y mensaje son requeridos' });
    }

    const requests = readJSON(REQUESTS_FILE);
    const newReq = {
        id: `req-${uuidv4().slice(0, 8)}`,
        userId: req.user ? req.user.id : null,
        username: req.user ? req.user.username : null,
        nombre, email, telefono: telefono || '',
        asunto: asunto || 'General',
        mensaje,
        status: 'pendiente',
        adminNotes: '',
        respondedVia: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    requests.push(newReq);
    writeJSON(REQUESTS_FILE, requests);
    res.status(201).json(newReq);
});

// PUT /api/requests/:id — admin updates status/notes
app.put('/api/requests/:id', authMiddleware, adminMiddleware, (req, res) => {
    const requests = readJSON(REQUESTS_FILE);
    const index = requests.findIndex(r => r.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Solicitud no encontrada' });

    const { status, adminNotes, respondedVia } = req.body;
    if (status) requests[index].status = status;
    if (adminNotes !== undefined) requests[index].adminNotes = adminNotes;
    if (respondedVia) requests[index].respondedVia = respondedVia;
    requests[index].updatedAt = new Date().toISOString();

    writeJSON(REQUESTS_FILE, requests);
    res.json(requests[index]);
});

// DELETE /api/requests/:id — admin deletes request
app.delete('/api/requests/:id', authMiddleware, adminMiddleware, (req, res) => {
    let requests = readJSON(REQUESTS_FILE);
    if (!requests.find(r => r.id === req.params.id)) {
        return res.status(404).json({ error: 'Solicitud no encontrada' });
    }
    requests = requests.filter(r => r.id !== req.params.id);
    writeJSON(REQUESTS_FILE, requests);
    res.json({ message: 'Solicitud eliminada' });
});

// ============================================
//   SERVE FRONTEND (PRODUCTION / RENDER)
// ============================================

// The Angular app will be built into frontend/dist/frontend/browser
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

// Serve static files from the Angular build
app.use(express.static(FRONTEND_DIR));

// Catch-all route to serve Angular's index.html for any non-API route
app.get('*', (req, res) => {
    // DO NOT catch routes starting with /api or /uploads
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

// ---------- Start ----------
app.listen(PORT, () => {
    console.log(`🐟 KOI Design API corriendo en puerto ${PORT}`);
});
