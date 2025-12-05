/**
 * QUICK ENDPOINT CHECKER - SAKO BACKEND
 * Utility sederhana untuk cek endpoint yang tersedia tanpa verbose output
 */

const { getServerEndpointLogs } = require('../src/utils/endpointAnalyzer');

async function quickEndpointCheck() {
    try {
        console.log('🔍 Quick Endpoint Check...\n');
        
        const endpointLogs = await getServerEndpointLogs();
        
        console.log('📊 SUMMARY:');
        endpointLogs.console_lines.forEach(line => {
            console.log(line);
        });
        
        console.log('\n🗺️ MAP MODULE ENDPOINTS:');
        const mapEndpoints = endpointLogs.endpoint_details.filter(ep => ep.module === 'map');
        mapEndpoints.forEach(endpoint => {
            const icon = endpoint.method === 'GET' ? '🔍' : endpoint.method === 'POST' ? '📤' : '✏️';
            console.log(`   ${icon} ${endpoint.method.padEnd(6)} ${endpoint.fullPath}`);
        });
        
        console.log('\n🔐 AUTH MODULE ENDPOINTS:');
        const authEndpoints = endpointLogs.endpoint_details.filter(ep => ep.module === 'auth');
        authEndpoints.forEach(endpoint => {
            const icon = endpoint.method === 'GET' ? '🔍' : endpoint.method === 'POST' ? '📤' : '✏️';
            console.log(`   ${icon} ${endpoint.method.padEnd(6)} ${endpoint.fullPath}`);
        });
        
        console.log('\n📈 METHOD DISTRIBUTION:');
        Object.entries(endpointLogs.summary.by_method).forEach(([method, count]) => {
            const icon = method === 'GET' ? '🔍' : method === 'POST' ? '📤' : method === 'PUT' ? '✏️' : '🗑️';
            console.log(`   ${icon} ${method}: ${count} endpoints`);
        });
        
        console.log(`\n✅ Total: ${endpointLogs.summary.total_endpoints} endpoints across ${Object.keys(endpointLogs.summary.by_module).length} modules`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Run if called directly
if (require.main === module) {
    quickEndpointCheck();
}

module.exports = { quickEndpointCheck };