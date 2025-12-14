/**
 * Geolocation Helper - SAKO BACKEND
 * Menyediakan fungsi perhitungan jarak geografis untuk validasi QR scan
 * Menggunakan Haversine Formula untuk akurasi tinggi
 */

/**
 * Menghitung jarak antara dua koordinat geografis menggunakan Haversine Formula
 * @param {number} lat1 - Latitude titik pertama (user location)
 * @param {number} lon1 - Longitude titik pertama (user location)
 * @param {number} lat2 - Latitude titik kedua (tourist place location)
 * @param {number} lon2 - Longitude titik kedua (tourist place location)
 * @returns {number} Jarak dalam meter
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    // Radius bumi dalam meter
    const R = 6371e3;
    
    // Konversi derajat ke radian
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    // Haversine formula
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    // Jarak dalam meter
    const distance = R * c;
    
    return distance;
}

/**
 * Validasi apakah user berada dalam radius yang diizinkan dari lokasi target
 * @param {number} userLat - Latitude user
 * @param {number} userLon - Longitude user
 * @param {number} targetLat - Latitude lokasi target
 * @param {number} targetLon - Longitude lokasi target
 * @param {number} maxRadius - Radius maksimal dalam meter (default: 200m)
 * @returns {Object} { isValid: boolean, distance: number }
 */
function validateProximity(userLat, userLon, targetLat, targetLon, maxRadius = 200) {
    const distance = calculateDistance(userLat, userLon, targetLat, targetLon);
    
    return {
        isValid: distance <= maxRadius,
        distance: Math.round(distance), // Bulatkan untuk readability
        maxRadius: maxRadius
    };
}

/**
 * Format jarak untuk display ke user
 * @param {number} distanceInMeters - Jarak dalam meter
 * @returns {string} Formatted distance string
 */
function formatDistance(distanceInMeters) {
    if (distanceInMeters < 1000) {
        return `${Math.round(distanceInMeters)} meter`;
    } else {
        return `${(distanceInMeters / 1000).toFixed(2)} km`;
    }
}

module.exports = {
    calculateDistance,
    validateProximity,
    formatDistance
};
