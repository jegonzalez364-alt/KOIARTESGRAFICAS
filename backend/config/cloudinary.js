const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();

// Configure Cloudinary with API keys from .env
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Set up the Multer storage engine to use Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'koi-artesgraficas', // Folder name in your Cloudinary account
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'gif', 'mp4'],
        // Cloudinary automatically handles transformations if needed, but we keep original files
    }
});

const upload = multer({ storage: storage });

module.exports = { cloudinary, upload };
