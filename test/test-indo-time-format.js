/**
 * Test Indonesian Time Formatting
 * Untuk memverifikasi format waktu Indonesia di response API
 */

const { 
    formatDatabaseTimeToIndo, 
    formatIndoDate, 
    formatIndoDateTime,
    formatRelativeIndoTime 
} = require('../src/utils/indoTimeGenerator');

console.log('=== TEST FORMAT WAKTU INDONESIA ===\n');

// Test dengan contoh created_at dari database
const sampleCreatedAt = '2024-12-01 14:30:00';
const sampleUpdatedAt = '2024-12-02 16:45:30';
const sampleVisitedAt = new Date().toISOString();

console.log('1. Format Database Time (DD-MM-YYYY HH:mm):');
console.log(`   created_at: ${sampleCreatedAt}`);
console.log(`   → created_at_indo: ${formatDatabaseTimeToIndo(sampleCreatedAt)}`);
console.log(`   updated_at: ${sampleUpdatedAt}`);
console.log(`   → updated_at_indo: ${formatDatabaseTimeToIndo(sampleUpdatedAt)}`);
console.log('');

console.log('2. Format Indo Date Only (DD-MM-YYYY):');
console.log(`   created_at: ${sampleCreatedAt}`);
console.log(`   → created_at_indo: ${formatIndoDate(sampleCreatedAt)}`);
console.log('');

console.log('3. Format Indo DateTime (DD-MM-YYYY HH:mm):');
console.log(`   visited_at: ${sampleVisitedAt}`);
console.log(`   → visited_at_indo: ${formatIndoDateTime(sampleVisitedAt)}`);
console.log('');

console.log('4. Format Relative Time (X menit/jam yang lalu):');
const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

console.log(`   5 menit lalu: ${formatRelativeIndoTime(fiveMinutesAgo)}`);
console.log(`   2 jam lalu: ${formatRelativeIndoTime(twoHoursAgo)}`);
console.log(`   3 hari lalu: ${formatRelativeIndoTime(threeDaysAgo)}`);
console.log('');

console.log('5. Contoh Response API dengan Format Indonesia:');
const mockApiResponse = {
    tourist_place_id: "TP001",
    name: "Candi Borobudur",
    description: "Candi Buddha terbesar di dunia",
    created_at: sampleCreatedAt,
    updated_at: sampleUpdatedAt,
    // Format Indonesia yang ditambahkan
    created_at_indo: formatIndoDate(sampleCreatedAt),
    updated_at_indo: formatIndoDate(sampleUpdatedAt)
};

console.log(JSON.stringify(mockApiResponse, null, 2));

console.log('\n=== TEST SELESAI ===');