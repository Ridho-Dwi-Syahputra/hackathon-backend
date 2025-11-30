/**
 * TEST ENDPOINT ANALYZER
 * Script untuk test dan melihat hasil analisis endpoint
 */

const { analyzeEndpoints, getServerEndpointLogs } = require('../src/utils/endpointAnalyzer');

async function testEndpointAnalyzer() {
    console.log('🧪 Testing Endpoint Analyzer...\n');
    
    try {
        // Test full analysis
        console.log('📊 Full Endpoint Analysis:');
        console.log('='.repeat(50));
        const summary = await analyzeEndpoints();
        
        console.log('\n📋 Summary:');
        console.log(`   Total Endpoints: ${summary.total_endpoints}`);
        console.log(`   Modules Found: ${Object.keys(summary.by_module).length}`);
        console.log('\n📈 By Method:');
        Object.entries(summary.by_method).forEach(([method, count]) => {
            console.log(`   ${method}: ${count} endpoints`);
        });
        
        console.log('\n🗺️ Detailed Endpoints:');
        summary.endpoints.forEach(endpoint => {
            console.log(`   ${endpoint.method.padEnd(6)} ${endpoint.fullPath.padEnd(30)} (${endpoint.module})`);
        });
        
        // Test server log format
        console.log('\n' + '='.repeat(50));
        console.log('🚀 Server Log Format Test:');
        console.log('='.repeat(50));
        
        const serverLogs = await getServerEndpointLogs();
        serverLogs.console_lines.forEach(line => {
            console.log(line);
        });
        
        // Export to JSON
        console.log('\n💾 Exporting analysis to JSON...');
        const analyzer = require('../src/utils/endpointAnalyzer').EndpointAnalyzer;
        const analyzerInstance = new analyzer();
        await analyzerInstance.generateEndpointReport();
        const exportResult = analyzerInstance.exportToJson('./endpoint-analysis.json');
        
        console.log('\n✅ Test completed successfully!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error(error.stack);
    }
}

// Run test
testEndpointAnalyzer();