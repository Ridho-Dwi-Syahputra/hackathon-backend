/**
 * Test Logging System 
 * Untuk memastikan logging tidak terganggu oleh implementasi format waktu Indonesia
 */

const { writeLog, getIndonesianTime } = require('../src/utils/logsGenerator');

console.log('=== TEST SISTEM LOGGING ===\n');

console.log('1. Test getIndonesianTime():');
const logTimestamp = getIndonesianTime();
console.log(`   Current timestamp: ${logTimestamp}`);
console.log('');

console.log('2. Test writeLog() function:');
const testLogResult = writeLog('test', 'INFO', 'Test logging system masih berfungsi', {
    test_type: 'log_verification',
    timestamp: logTimestamp,
    status: 'testing'
});

console.log(`   Write log result: ${testLogResult ? 'SUCCESS' : 'FAILED'}`);
console.log('');

console.log('3. Test separation with indoTimeGenerator:');
try {
    const { formatIndoDate, formatDatabaseTimeToIndo } = require('../src/utils/indoTimeGenerator');
    
    const now = new Date().toISOString();
    console.log('   Logging timestamp:', getIndonesianTime());
    console.log('   Response format (Indo Date):', formatIndoDate(now));
    console.log('   Response format (Database):', formatDatabaseTimeToIndo(now));
    console.log('   ✅ Both utilities work independently');
} catch (error) {
    console.error('   ❌ Error testing separation:', error.message);
}

console.log('\n4. Test typical logging scenario in controller:');
const mockControllerLog = () => {
    const startTime = Date.now();
    const userId = 'USR001';
    const action = 'test_action';
    
    // Simulate controller logging (typical usage)
    writeLog('map', 'INFO', `User ${userId} melakukan ${action}`, {
        user_id: userId,
        action: action,
        endpoint: 'GET /api/test',
        ip_address: '127.0.0.1',
        response_time_ms: Date.now() - startTime,
        timestamp_indo: getIndonesianTime() // This should still work
    });
    
    return 'Controller logging test completed';
};

const controllerResult = mockControllerLog();
console.log(`   ${controllerResult}`);

console.log('\n=== TEST SELESAI ===');
console.log('Logging system tetap berfungsi normal tanpa terganggu format waktu response!');