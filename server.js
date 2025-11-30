require('dotenv').config();
const app = require('./src/app');

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
        const server = app.listen(PORT, () => {
            console.log('\n' + '='.repeat(60));
            console.log('🎉 SERVER SAKO BERHASIL BERJALAN!');
            console.log('='.repeat(60));
            console.log(`📡 Server: http://localhost:${PORT}`);
            console.log(`🔥 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`📅 Started: ${new Date().toLocaleString('id-ID')}`);
            console.log('='.repeat(60));
            console.log('\n📋 Available Endpoints:');
            console.log('   🔐 Auth: /api/auth/*');
            console.log('   ❓ Quiz: /api/quiz/*');
            console.log('   🏷️  Category: /api/category/*');
            console.log('   🔔 Firebase: Initialized');
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
