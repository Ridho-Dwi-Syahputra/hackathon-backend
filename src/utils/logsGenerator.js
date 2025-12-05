const fs = require('fs');
const path = require('path');

/**
 * CORE LOGS GENERATOR UTILITY UNTUK SAKO
 * - Auto create folder logs jika belum ada
 * - Format bahasa Indonesia dengan waktu lokal
 * - Maksimal 100 baris per file
 * - Auto hapus logs terlama jika sudah penuh
 * 
 * HANYA CORE FUNCTIONALITY - Specialized loggers ada di masing-masing controller
 */

// Fungsi untuk mendapatkan waktu Indonesia
const getIndonesianTime = () => {
    const now = new Date();
    return now.toLocaleString('id-ID', {
        timeZone: 'Asia/Jakarta',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
};

// Fungsi untuk memastikan folder logs ada
const ensureLogsFolderExists = (logPath) => {
    try {
        const logsDir = path.dirname(logPath);
        
        if (!fs.existsSync(logsDir)) {
            fs.mkdirSync(logsDir, { recursive: true });
            console.log(`✅ Folder logs dibuat: ${logsDir}`);
        }
        
        return true;
    } catch (error) {
        console.error(`❌ Gagal membuat folder logs: ${error.message}`);
        return false;
    }
};

// Fungsi untuk membaca jumlah baris dalam file
const countFileLines = (filePath) => {
    try {
        if (!fs.existsSync(filePath)) {
            return 0;
        }
        
        const content = fs.readFileSync(filePath, 'utf8');
        return content.split('\n').filter(line => line.trim() !== '').length;
    } catch (error) {
        console.error(`❌ Error menghitung baris: ${error.message}`);
        return 0;
    }
};

// Fungsi untuk menghapus baris terlama
const removeOldestLines = (filePath, maxLines = 100) => {
    try {
        if (!fs.existsSync(filePath)) {
            return;
        }
        
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n').filter(line => line.trim() !== '');
        
        if (lines.length >= maxLines) {
            const linesToRemove = 20;
            const remainingLines = lines.slice(linesToRemove);
            
            fs.writeFileSync(filePath, remainingLines.join('\n') + '\n', 'utf8');
            
            console.log(`🧹 Membersihkan ${linesToRemove} baris terlama dari ${path.basename(filePath)}`);
        }
    } catch (error) {
        console.error(`❌ Error menghapus baris lama: ${error.message}`);
    }
};

// CORE FUNCTION: Fungsi utama untuk menulis logs
const writeLog = (category, level, message, data = null) => {
    try {
        const logFileName = `${category}.log`;
        const logPath = path.join(process.cwd(), 'src', 'logs', 'notifikasi', logFileName);
        
        // Pastikan folder logs ada
        if (!ensureLogsFolderExists(logPath)) {
            return false;
        }
        
        // Cek jumlah baris dan hapus yang lama jika perlu
        const currentLines = countFileLines(logPath);
        if (currentLines >= 100) {
            removeOldestLines(logPath, 100);
        }
        
        // Format pesan log dalam bahasa Indonesia
        const timestamp = getIndonesianTime();
        let logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
        
        // Tambahkan data jika ada
        if (data) {
            if (typeof data === 'object') {
                logMessage += `\nData: ${JSON.stringify(data, null, 2)}`;
            } else {
                logMessage += `\nData: ${data}`;
            }
        }
        
        logMessage += '\n' + '='.repeat(80) + '\n';
        
        // Tulis ke file
        fs.appendFileSync(logPath, logMessage, 'utf8');
        
        return true;
        
    } catch (error) {
        console.error(`❌ Error menulis log: ${error.message}`);
        return false;
    }
};

// Export hanya core functions
module.exports = {
    // Core functions
    writeLog,
    getIndonesianTime,
    
    // Utility functions
    ensureLogsFolderExists,
    countFileLines,
    removeOldestLines
};