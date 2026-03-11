const mongoose = require('mongoose');
const SiteSettings = require('./models/SiteSettings');

const TEST_URI = 'mongodb+srv://jagonzalez364:koidesigns123@cluster0.7o3updy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

async function updateSettings() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(TEST_URI);
        const settings = await SiteSettings.findOne({});
        if (settings) {
            settings.speechBubbleBg = 'rgba(255,255,255,0.95)';
            settings.primaryFont = "'Komika Axis', sans-serif";
            settings.heroTitleFont = "'Komika Axis', sans-serif";
            settings.heroSubtitleFont = "'Komika Axis', sans-serif";
            await settings.save();
            console.log('Settings updated successfully!');
        } else {
            console.log('No settings found. Creating new...');
            await SiteSettings.create({
                speechBubbleBg: 'rgba(255,255,255,0.95)',
                primaryFont: "'Komika Axis', sans-serif",
                heroTitleFont: "'Komika Axis', sans-serif",
                heroSubtitleFont: "'Komika Axis', sans-serif"
            });
            console.log('New settings created.');
        }
        process.exit(0);
    } catch (error) {
        console.error('Error updating DB:', error);
        process.exit(1);
    }
}
updateSettings();
