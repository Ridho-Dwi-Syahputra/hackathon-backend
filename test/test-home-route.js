// Test script untuk debug homeRoutes loading issue
console.log('🔍 Testing homeRoutes loading...\n');

try {
    console.log('1️⃣ Loading homeController...');
    const homeController = require('../src/controllers/homeController');
    console.log('   ✅ homeController loaded');
    console.log('   - getDashboardData type:', typeof homeController.getDashboardData);
    console.log('   - getUserStats type:', typeof homeController.getUserStats);
    console.log('   - getRecentActivities type:', typeof homeController.getRecentActivities);
    console.log('   - getPopularContent type:', typeof homeController.getPopularContent);
    console.log('');
    
    console.log('2️⃣ Loading verifyToken middleware...');
    const { verifyToken } = require('../src/middleware/auth');
    console.log('   ✅ verifyToken loaded');
    console.log('   - verifyToken type:', typeof verifyToken);
    console.log('');
    
    console.log('3️⃣ Loading homeRoutes...');
    const homeRoutes = require('../src/routes/homeRoutes');
    console.log('   ✅ homeRoutes loaded');
    console.log('   - homeRoutes type:', typeof homeRoutes);
    console.log('   - homeRoutes constructor:', homeRoutes.constructor.name);
    console.log('');
    
    console.log('4️⃣ Checking router stack...');
    if (homeRoutes.stack) {
        console.log('   Router has', homeRoutes.stack.length, 'routes:');
        homeRoutes.stack.forEach((layer, i) => {
            console.log(`   ${i+1}. ${layer.route?.path || 'middleware'} - methods:`, layer.route?.methods || 'N/A');
        });
    }
    
    console.log('\n✅ ALL CHECKS PASSED - homeRoutes should work!');
} catch (error) {
    console.error('\n❌ ERROR DETECTED:');
    console.error('   Message:', error.message);
    console.error('   Stack:', error.stack);
}
