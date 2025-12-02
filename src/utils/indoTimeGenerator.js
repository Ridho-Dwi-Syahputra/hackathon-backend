/**
 * Indonesian Time Generator Utility
 * Utility untuk memformat waktu database/response ke format Indonesia
 * Digunakan untuk created_at, updated_at, visited_at, dll dalam response API
 * 
 * @author SAKO Development Team
 * @version 1.0.0
 */

/**
 * Mengkonversi tanggal ke zona waktu Indonesia
 * @param {Date|string} date - Tanggal yang akan dikonversi
 * @returns {Date} Date object dalam zona waktu Indonesia
 */
const toIndoTime = (date) => {
    const inputDate = new Date(date);
    return new Date(inputDate.getTime() + (7 * 60 * 60 * 1000)); // UTC+7
};

/**
 * Format tanggal Indonesia untuk response API (DD-MM-YYYY)
 * @param {Date|string|null} date - Tanggal yang akan diformat, null untuk hari ini
 * @returns {string} Format: "02-12-2024"
 */
const formatIndoDate = (date = null) => {
    const targetDate = date ? new Date(date) : new Date();
    const indoTime = toIndoTime(targetDate);
    
    const day = String(indoTime.getDate()).padStart(2, '0');
    const month = String(indoTime.getMonth() + 1).padStart(2, '0');
    const year = indoTime.getFullYear();
    
    return `${day}-${month}-${year}`;
};

/**
 * Format waktu Indonesia untuk response API (HH:mm)
 * @param {Date|string|null} date - Tanggal yang akan diformat, null untuk waktu sekarang
 * @returns {string} Format: "15:30"
 */
const formatIndoTime = (date = null) => {
    const targetDate = date ? new Date(date) : new Date();
    const indoTime = toIndoTime(targetDate);
    
    const hours = String(indoTime.getHours()).padStart(2, '0');
    const minutes = String(indoTime.getMinutes()).padStart(2, '0');
    
    return `${hours}:${minutes}`;
};

/**
 * Format datetime lengkap Indonesia untuk response API (DD-MM-YYYY HH:mm)
 * @param {Date|string|null} date - Tanggal yang akan diformat, null untuk sekarang
 * @returns {string} Format: "02-12-2024 15:30"
 */
const formatIndoDateTime = (date = null) => {
    const targetDate = date ? new Date(date) : new Date();
    const dateStr = formatIndoDate(targetDate);
    const timeStr = formatIndoTime(targetDate);
    
    return `${dateStr} ${timeStr}`;
};

/**
 * Format waktu relatif dalam bahasa Indonesia (X menit yang lalu, X jam yang lalu, dll)
 * @param {Date|string} date - Tanggal yang akan dibandingkan dengan sekarang
 * @returns {string} Format: "5 menit yang lalu", "2 jam yang lalu", "3 hari yang lalu"
 */
const formatRelativeIndoTime = (date) => {
    const targetDate = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - targetDate.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 1) {
        return 'Baru saja';
    } else if (diffMinutes < 60) {
        return `${diffMinutes} menit yang lalu`;
    } else if (diffHours < 24) {
        return `${diffHours} jam yang lalu`;
    } else if (diffDays < 7) {
        return `${diffDays} hari yang lalu`;
    } else {
        return formatIndoDate(date);
    }
};

/**
 * Mengecek apakah tanggal yang diberikan adalah hari ini (zona waktu Indonesia)
 * @param {Date|string} date - Tanggal yang akan dicek
 * @returns {boolean} True jika hari ini, false jika bukan
 */
const isToday = (date) => {
    const targetDate = new Date(date);
    const indoTargetDate = toIndoTime(targetDate);
    const indoToday = toIndoTime(new Date());
    
    return indoTargetDate.toDateString() === indoToday.toDateString();
};

/**
 * Konversi ISO string dari database ke format Indonesia yang user-friendly
 * @param {string} isoString - ISO string dari database (created_at, updated_at, visited_at)
 * @returns {string|null} Format user-friendly dalam bahasa Indonesia atau null jika kosong
 */
const formatDatabaseTimeToIndo = (isoString) => {
    if (!isoString) return null;
    
    const date = new Date(isoString);
    
    if (isToday(date)) {
        return `Hari ini ${formatIndoTime(date)}`;
    } else {
        return formatIndoDateTime(date);
    }
};

module.exports = {
    toIndoTime,
    formatIndoDate,
    formatIndoTime, 
    formatIndoDateTime,
    formatRelativeIndoTime,
    isToday,
    formatDatabaseTimeToIndo
};