const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');
require('dotenv').config();

// Legacy MySQL Pool (untuk kompatibilitas dengan kode yang sudah ada)
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Sequelize Configuration
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'mysql',
        logging: process.env.NODE_ENV === 'development' ? false : false, // disable SQL logging
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        timezone: '+07:00', // Waktu Indonesia Barat
        dialectOptions: {
            dateStrings: true,
            typeCast: true,
            charset: 'utf8mb4',
            collate: 'utf8mb4_unicode_ci'
        },
        define: {
            timestamps: true,
            underscored: false, // gunakan camelCase
            freezeTableName: true // gunakan nama tabel exact sesuai definisi
        }
    }
);

// Test Legacy Connection (untuk kompatibilitas dengan kode existing)
pool.getConnection()
  .then(connection => {
    console.log('✅ Koneksi MySQL Pool berhasil terhubung ke database:', process.env.DB_NAME);
    connection.release();
  })
  .catch(err => {
    console.error('❌ Koneksi MySQL Pool gagal:', err.message);
  });

// Test Sequelize connection
const testSequelizeConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Sequelize ORM berhasil terhubung ke database:', process.env.DB_NAME);
        console.log('🔗 Host:', process.env.DB_HOST + ':' + process.env.DB_PORT);
        console.log('👤 User:', process.env.DB_USER);
        
        // Sync database (untuk development saja)
        if (process.env.NODE_ENV === 'development') {
            console.log('🔄 Menyinkronkan model database...');
            // alter: false untuk tidak auto-alter struktur tabel
            await sequelize.sync({ alter: false });
            console.log('✅ Model database berhasil disinkronkan');
        }
        
    } catch (error) {
        console.error('❌ Koneksi Sequelize gagal:', error.message);
        console.error('🔧 Periksa konfigurasi database di file .env');
        console.error('📋 DB_HOST:', process.env.DB_HOST);
        console.error('📋 DB_PORT:', process.env.DB_PORT);
        console.error('📋 DB_NAME:', process.env.DB_NAME);
        console.error('📋 DB_USER:', process.env.DB_USER);
        process.exit(1);
    }
};

// Test koneksi database saat startup
const initializeDatabase = async () => {
    console.log('🚀 Menginisialisasi koneksi database SAKO...');
    await testSequelizeConnection();
};

// Jalankan inisialisasi
initializeDatabase();

// Export untuk fleksibilitas penggunaan
module.exports = {
    // Legacy export untuk kompatibilitas dengan controller existing
    pool,
    // Sequelize exports untuk model baru
    sequelize,
    testSequelizeConnection,
    initializeDatabase
};

// Default export tetap pool untuk backward compatibility
module.exports.default = pool;