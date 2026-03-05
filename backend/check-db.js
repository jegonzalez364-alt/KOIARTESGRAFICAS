const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const TEST_URI = 'mongodb://jagonzalez364:koidesigns123@ac-dpl2elp-shard-00-00.7o3updy.mongodb.net:27017,ac-dpl2elp-shard-00-01.7o3updy.mongodb.net:27017,ac-dpl2elp-shard-00-02.7o3updy.mongodb.net:27017/?ssl=true&replicaSet=atlas-h2v3eb-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0';

// Import the User schema from the models to query it
const User = require('./models/User');

async function checkAdmin() {
    try {
        console.log('⏳ Connecting to Atlas...');
        await mongoose.connect(TEST_URI);
        console.log('✅ Connected.');

        const users = await User.find({});
        console.log(`Found ${users.length} users in the database.`);

        const adminUser = await User.findOne({ username: 'admin' });
        if (adminUser) {
            console.log('✅ Admin user found:');
            console.log('- Username:', adminUser.username);
            console.log('- Role:', adminUser.role);
            console.log('- Hashed Password:', adminUser.password);

            // Test "admin"
            const testAdmin = bcrypt.compareSync('admin', adminUser.password);
            console.log('Does password match "admin"?:', testAdmin);

            // Test "admin123"
            const testAdmin123 = bcrypt.compareSync('admin123', adminUser.password);
            console.log('Does password match "admin123"?:', testAdmin123);
        } else {
            console.log('❌ Admin user NOT FOUND in the database.');
        }
        process.exit(0);
    } catch (err) {
        console.error('❌ Connection Failed:', err.message);
        process.exit(1);
    }
}

checkAdmin();
