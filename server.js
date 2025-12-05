require('dotenv').config();
const app = require('./src/app');
const { getServerEndpointLogs } = require('./src/utils/endpointAnalyzer');
const UrlConfig = require('./src/utils/urlConfig');

// Import Firebase initialization
require('./src/controllers/firebase/firebaseConfig');

const PORT = process.env.PORT || 3000;
const urlConfig = new UrlConfig();

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
        const server = app.listen(PORT, '0.0.0.0', async () => {
            console.log('\n' + '='.repeat(60));
            console.log('🎉 SERVER SAKO BERHASIL BERJALAN!');
            console.log('='.repeat(60));
            
            // Print URL configuration using UrlConfig
            urlConfig.printStartupInfo();
            
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
                const baseUrl = urlConfig.getApiBaseUrl();
                console.log('\n🌟 Key Endpoints:');
                console.log(`   📱 Health Check: GET ${baseUrl}/`);
                console.log(`   🔐 User Login: POST ${baseUrl}/api/auth/login`);
                console.log(`   🗺️ Place Detail: GET ${baseUrl}/api/map/places/:id`);
                console.log(`   ⭐ Add Review: POST ${baseUrl}/api/map/places/:id/reviews`);
                console.log(`   📱 Scan QR: POST ${baseUrl}/api/map/scan/qr`);
                
                if (urlConfig.tunnelEnabled && urlConfig.externalUrl) {
                    console.log('\n🚀 DevTunnel Ready for Android:');
                    console.log(`   ✅ Tunnel Active: ${urlConfig.externalUrl}`);
                    console.log('   📋 Copy this to your Android ApiConfig.kt:');
                    console.log(`   const val BASE_URL = "${urlConfig.externalUrl}/api/"`);
                    console.log('\n   🔗 Quick Test: Open in browser:');
                    console.log(`   ${urlConfig.externalUrl}/`);
                }
                
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
