const mongoose = require('mongoose');

const TEST_URI = 'mongodb://jagonzalez364:koidesigns123@ac-dpl2elp-shard-00-00.7o3updy.mongodb.net:27017,ac-dpl2elp-shard-00-01.7o3updy.mongodb.net:27017,ac-dpl2elp-shard-00-02.7o3updy.mongodb.net:27017/?ssl=true&replicaSet=atlas-h2v3eb-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0';

async function testConnection() {
    try {
        console.log('⏳ Connecting to Atlas...');
        await mongoose.connect(TEST_URI);
        console.log('✅ Connected! Credentials are correct.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Connection Failed:', err.message);
        process.exit(1);
    }
}

testConnection();
