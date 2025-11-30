require('dotenv').config();
const app = require('./src/app');
const { getServerEndpointLogs } = require('./src/utils/endpointAnalyzer');

// Import Firebase initialization
require('./src/controllers/firebase/firebaseConfig');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        console.log('🚀 Menginisialisasi Server SAKO...');
        
        // Import dan test database connection - PERBAIKAN DI SINI
        try {
            const database = require('./src/config/database');
            
            // Cek apakah function testDatabaseConnection ada
            if (database.testDatabaseConnection && typeof database.testDatabaseConnection === 'function') {
                console.log('🔗 Testing koneksi database...');
                await database.testDatabaseConnection();
            } else {
                console.log('📝 Database test function tidak ditemukan, skip test');
            }
            
        } catch (dbError) {
            console.warn('⚠️ Database connection warning:', dbError.message);
            console.log('📝 Server akan tetap berjalan tanpa database connection');
        }
        
        // Start server
        const server = app.listen(PORT, async () => {
            console.log('\n' + '='.repeat(60));
            console.log('🎉 SERVER SAKO BERHASIL BERJALAN!');
            console.log('='.repeat(60));
            console.log(`📡 Server: http://localhost:${PORT}`);
            console.log(`🔥 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`📅 Started: ${new Date().toLocaleString('id-ID')}`);
            console.log('='.repeat(60));
            
            // Dynamic endpoint analysis and logging
            try {
                console.log('\n🔍 Scanning available endpoints...');
                const endpointLogs = await getServerEndpointLogs();
                console.log('\n📋 Available API Endpoints:');
                endpointLogs.console_lines.forEach(line => {
                    console.log(line);
                });
                console.log('   🔔 Firebase: Initialized');
                
                // Show key endpoints untuk development
                console.log('\n🌟 Key Endpoints:');
                console.log('   📱 Health Check: GET /')
                console.log('   🔐 User Login: POST /api/auth/login');
                console.log('   🗺️ Place Detail: GET /api/map/detail/:id');
                console.log('   ⭐ Add Review: POST /api/map/review/add');
                console.log('   📱 Scan QR: POST /api/map/scan/qr');
                
            } catch (analyzerError) {
                console.warn('⚠️ Endpoint analyzer error:', analyzerError.message);
                console.log('\n📋 Available Endpoints (Fallback):');
                console.log('   🔐 Auth: /api/auth/* (7 endpoints)');
                console.log('   ❓ Quiz: /api/quiz/* (2 endpoints)');
                console.log('   🏷️ Category: /api/category/* (2 endpoints)');
                console.log('   🗺️ Map: /api/map/* (7 endpoints)');
                console.log('   👤 Profile: /api/profile/* (4 endpoints)');
                console.log('   🏆 Badge: /api/badge/* (2 endpoints)');
                console.log('   📹 Video: /api/video/* (5 endpoints)');
                console.log('   🔔 Firebase: Initialized');
            }
            
            console.log('='.repeat(60) + '\n');
        });

        // Graceful shutdown
        process.on('SIGTERM', () => {
            console.log('\n🛑 SIGTERM received. Shutting down gracefully...');
            server.close(() => {
                console.log('✅ Server closed.');
                process.exit(0);
            });
        });

        process.on('SIGINT', () => {
            console.log('\n🛑 SIGINT received. Shutting down gracefully...');
            server.close(() => {
                console.log('✅ Server closed.');
                process.exit(0);
            });
        });

    } catch (error) {
        console.error('❌ Error starting server:', error.message);
        process.exit(1);
    }
};

startServer();
