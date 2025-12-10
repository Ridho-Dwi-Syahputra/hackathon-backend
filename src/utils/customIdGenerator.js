/**
 * Custom ID Generator Utility
 * Universal function untuk generate sequential IDs dengan format PREFIX + NUMBER
 * 
 * @author SAKO Development Team
 * @version 1.0.0
 */

/**
 * Men-generate ID Custom berurutan dengan prefix dan padding
 * @param {Object} db - Database connection object
 * @param {string} prefix - Prefix untuk ID (U, RVW, MAP, dll.)
 * @param {string} tableName - Nama tabel database
 * @param {string} idField - Nama field ID di database
 * @param {number} padding - Jumlah digit untuk padding (default: 3)
 * @returns {Promise<string>} Generated custom ID
 * 
 * @example
 * // Di controller:
 * const userId = await generateCustomId(db, 'U', 'users', 'users_id', 3);
 * // Result: U001, U002, U003, dst.
 */
const generateCustomId = async (db, prefix, tableName, idField, padding = 3) => {
    try {
        // Validasi input parameters
        if (!db || !prefix || !tableName || !idField) {
            throw new Error('Missing required parameters: db, prefix, tableName, and idField are required');
        }

        // Query untuk mendapatkan ID terakhir dengan prefix yang sama (sekali saja)
        const query = `
            SELECT ${idField} FROM ${tableName} 
            WHERE ${idField} LIKE '${prefix}%' 
            ORDER BY CAST(SUBSTRING(${idField}, ${prefix.length + 1}) AS UNSIGNED) DESC 
            LIMIT 1
        `;
        const result = await db.query(query);
        
        // Cek apakah ada data yang ditemukan
        const lastRecord = result[0] && result[0].length > 0 ? result[0][0] : null;

        let nextNumber = 1;
        
        if (lastRecord && lastRecord[idField]) {
            const lastId = lastRecord[idField]; // Contoh: "RV005"
            
            // Extract number part dari ID
            const numberPart = lastId.replace(prefix, ""); // "005"
            const lastNumber = parseInt(numberPart, 10); // 5
            
            if (!isNaN(lastNumber) && lastNumber >= 0) {
                nextNumber = lastNumber + 1; // 6
            }
        }

        let attempts = 0;
        const maxAttempts = 10;
        
        while (attempts < maxAttempts) {
            // Format angka dengan padding (misal: 6 -> "006")
            const paddedNumber = String(nextNumber).padStart(padding, '0');
            const generatedId = `${prefix}${paddedNumber}`;
            
            // Cek apakah ID sudah ada (untuk memastikan tidak ada race condition)
            const checkQuery = `SELECT ${idField} FROM ${tableName} WHERE ${idField} = ?`;
            const existingCheck = await db.query(checkQuery, [generatedId]);
            
            if (existingCheck[0] && existingCheck[0].length === 0) {
                // ID belum ada, aman untuk digunakan
                console.log(`📝 Generated unique ID: ${generatedId} for table: ${tableName} (attempt: ${attempts + 1})`);
                return generatedId;
            }
            
            // ID sudah ada, increment dan coba lagi
            console.warn(`⚠️ ID ${generatedId} sudah ada, mencoba generate ulang... (attempt: ${attempts + 1})`);
            nextNumber++; // INCREMENT DI SINI!
            attempts++;
        }

        
        // Jika semua attempt gagal, gunakan fallback dengan timestamp + random
        console.error(`❌ Gagal generate unique ID setelah ${maxAttempts} attempts`);
        const timestamp = Date.now().toString().slice(-3); // 3 digit terakhir
        const randomNum = Math.floor(Math.random() * 100).toString().padStart(2, '0');
        const fallbackId = `${prefix}${timestamp}${randomNum}`.slice(0, prefix.length + padding);
        
        console.warn(`🔄 Using fallback ID: ${fallbackId}`);
        return fallbackId;
        
    } catch (error) {
        console.error('❌ Error generating custom ID:', {
            prefix,
            tableName,
            idField,
            error: error.message
        });
        
        // Fallback: Generate dengan timestamp jika gagal
        const timestamp = Date.now().toString().slice(-padding);
        const fallbackId = `${prefix}${timestamp.padStart(padding, '0')}`;
        
        console.warn(`🔄 Using fallback ID: ${fallbackId}`);
        return fallbackId;
    }
};

/**
 * Validate format ID yang sudah ada
 * @param {string} id - ID yang akan divalidasi
 * @param {string} expectedPrefix - Expected prefix
 * @returns {boolean} True jika format valid
 * 
 * @example
 * validateIdFormat('U001', 'U'); // returns true
 * validateIdFormat('ABC123', 'U'); // returns false
 */
const validateIdFormat = (id, expectedPrefix) => {
    if (!id || !expectedPrefix) return false;
    
    const regex = new RegExp(`^${expectedPrefix}\\d+$`);
    return regex.test(id);
};

/**
 * Extract number dari custom ID
 * @param {string} id - Custom ID
 * @param {string} prefix - Prefix yang akan diremove
 * @returns {number|null} Number part dari ID atau null jika invalid
 * 
 * @example
 * extractNumberFromId('U005', 'U'); // returns 5
 * extractNumberFromId('MAP010', 'MAP'); // returns 10
 */
const extractNumberFromId = (id, prefix) => {
    if (!id || !prefix) return null;
    
    const numberPart = id.replace(prefix, '');
    const number = parseInt(numberPart, 10);
    
    return isNaN(number) ? null : number;
};

module.exports = {
    generateCustomId,
    validateIdFormat,
    extractNumberFromId
};