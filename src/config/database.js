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
  queueLimit: 0,
  // TAMBAHAN: charset untuk pool
  charset: 'utf8mb4'
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
        logging: process.env.NODE_ENV === 'development' ? false : false,
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
            charset: 'utf8mb4'
            // HAPUS INI: collate: 'utf8mb4_unicode_ci' 
            // Collation akan diset di database level, bukan connection level
        },
        define: {
            timestamps: true,
            underscored: false,
            freezeTableName: true,
            // PINDAHKAN COLLATION KE SINI (define level)
            charset: 'utf8mb4',
            collate: 'utf8mb4_unicode_ci'
        }
    }
);

// Test Legacy Connection dengan logging yang lebih baik
const testDatabaseConnection = async () => {
    try {
        console.log('🔍 Testing koneksi ke database...');
        console.log('🔗 Host:', `${process.env.DB_HOST}:${process.env.DB_PORT}`);
        console.log('👤 User:', process.env.DB_USER);
        console.log('🗄️  Database:', process.env.DB_NAME);

        const connection = await pool.getConnection();
        
        // Test query
        const [rows] = await connection.execute('SELECT 1 as test');
        
        if (rows[0].test === 1) {
            console.log('✅ MySQL Pool berhasil terhubung!');
            
            // Show MySQL version dan charset
            const [version] = await connection.execute('SELECT VERSION() as version');
            const [charset] = await connection.execute('SHOW VARIABLES LIKE "character_set_database"');
            const [collation] = await connection.execute('SHOW VARIABLES LIKE "collation_database"');
            
            console.log('📊 MySQL Version:', version[0].version);
            console.log('🔤 Character Set:', charset[0].Value);
            console.log('🎯 Collation:', collation[0].Value);
        }
        
        connection.release();
        return true;

    } catch (error) {
        console.error('❌ MySQL Pool connection gagal:', error.message);
        throw error;
    }
};

// Test Sequelize connection
const testSequelizeConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Sequelize ORM berhasil terhubung ke database:', process.env.DB_NAME);
        
        // Sync database (untuk development saja)
        if (process.env.NODE_ENV === 'development') {
            console.log('🔄 Menyinkronkan model database...');
            await sequelize.sync({ alter: false });
            console.log('✅ Model database berhasil disinkronkan');
        }
        
    } catch (error) {
        console.error('❌ Koneksi Sequelize gagal:', error.message);
        console.error('🔧 Periksa konfigurasi database di file .env');
        throw error;
    }
};

// Test koneksi database saat startup
const initializeDatabase = async () => {
    console.log('🚀 Menginisialisasi koneksi database SAKO...');
    
    try {
        // Test kedua koneksi
        await testDatabaseConnection(); // MySQL Pool
        await testSequelizeConnection(); // Sequelize ORM
        
        console.log('🎉 Semua koneksi database berhasil!');
        
    } catch (error) {
        console.error('❌ Inisialisasi database gagal:', error.message);
        
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('🔐 Error: Username atau password database salah');
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            console.error('🗄️ Error: Database tidak ditemukan');
        } else if (error.code === 'ECONNREFUSED') {
            console.error('📡 Error: Tidak dapat terhubung ke MySQL server');
        }
        
        // Jangan exit di development, biar server tetap jalan
        if (process.env.NODE_ENV !== 'development') {
            process.exit(1);
        }
    }
};

// Jalankan inisialisasi
initializeDatabase();

// Export untuk fleksibilitas penggunaan
module.exports = {
    // Legacy export untuk kompatibilitas dengan controller existing
    pool,
    // Sequelize exports untuk model baru
    sequelize,
    testDatabaseConnection,    // EXPORT FUNCTION INI
    testSequelizeConnection,
    initializeDatabase
};

// Default export tetap pool untuk backward compatibility
module.exports.default = pool;