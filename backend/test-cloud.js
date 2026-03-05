require('dotenv').config();
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

async function testCloud() {
    console.log('Testing Cloudinary...');
    try {
        const result = await cloudinary.uploader.upload('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', {
            folder: 'test_folder'
        });
        console.log('✅ Cloudinary Upload Success:', result.secure_url);
    } catch (e) {
        console.error('❌ Cloudinary Error:', e.message);
    }

    console.log('\nTesting MongoDB...');
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected successfully!');
        process.exit(0);
    } catch (e) {
        console.error('❌ MongoDB Error:', e.message);
        process.exit(1);
    }
}

testCloud();
