/**
 * ENDPOINT ANALYZER UTILITY - SAKO BACKEND
 * Menganalisis dan mengecek semua endpoint yang tersedia dari routes
 * Untuk logging dan dokumentasi otomatis
 */

const fs = require('fs');
const path = require('path');

class EndpointAnalyzer {
    constructor() {
        this.routesPath = path.join(__dirname, '../routes');
        this.endpoints = [];
        this.routeFiles = [];
    }

    /**
     * Scan semua file routes di folder routes/
     */
    async scanRouteFiles() {
        try {
            const files = fs.readdirSync(this.routesPath);
            this.routeFiles = files
                .filter(file => file.endsWith('Routes.js') || file.endsWith('routes.js'))
                .map(file => ({
                    filename: file,
                    fullPath: path.join(this.routesPath, file),
                    moduleName: file.replace(/Routes?\.js$/, '').toLowerCase()
                }));

            console.log(`📁 Ditemukan ${this.routeFiles.length} file routes:`);
            this.routeFiles.forEach(file => {
                console.log(`   - ${file.filename}`);
            });

            return this.routeFiles;
        } catch (error) {
            console.error('❌ Error scanning route files:', error.message);
            return [];
        }
    }

    /**
     * Analisis file route untuk extract endpoint information
     */
    analyzeRouteFile(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const endpoints = [];
            
            // Pattern untuk mendeteksi route definitions
            // router.get('/path', ...), router.post('/path', ...)
            const routePattern = /router\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/gi;
            
            let match;
            while ((match = routePattern.exec(content)) !== null) {
                const method = match[1].toUpperCase();
                const path = match[2];
                
                endpoints.push({
                    method: method,
                    path: path,
                    fullPath: path // akan diupdate dengan prefix nanti
                });
            }

            return endpoints;
        } catch (error) {
            console.warn(`⚠️ Warning: Tidak bisa membaca file ${filePath}:`, error.message);
            return [];
        }
    }

    /**
     * Analisis app.js untuk mendapatkan route mounting information
     */
    analyzeAppMounting() {
        try {
            const appPath = path.join(__dirname, '../app.js');
            const content = fs.readFileSync(appPath, 'utf8');
            const mountings = {};

            // Pattern untuk mendeteksi app.use('/prefix', routes)
            const mountPattern = /app\.use\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*(\w+Routes?)\s*\)/gi;
            
            let match;
            while ((match = mountPattern.exec(content)) !== null) {
                const prefix = match[1];
                const routeVar = match[2];
                
                // Convert route variable name ke module name
                const moduleName = routeVar.replace(/Routes?$/, '').toLowerCase();
                mountings[moduleName] = prefix;
            }

            return mountings;
        } catch (error) {
            console.warn('⚠️ Warning: Tidak bisa membaca app.js:', error.message);
            return {};
        }
    }

    /**
     * Generate endpoint analysis report
     */
    async generateEndpointReport() {
        console.log('\n🔍 Analyzing endpoints...\n');
        
        // Scan route files
        await this.scanRouteFiles();
        
        // Analyze app mounting
        const mountings = this.analyzeAppMounting();
        console.log('\n🔗 Route mountings detected:');
        Object.entries(mountings).forEach(([module, prefix]) => {
            console.log(`   ${module} -> ${prefix}`);
        });

        // Analyze each route file
        const allEndpoints = [];
        
        for (const routeFile of this.routeFiles) {
            console.log(`\n📋 Analyzing ${routeFile.filename}:`);
            
            const endpoints = this.analyzeRouteFile(routeFile.fullPath);
            const prefix = mountings[routeFile.moduleName] || '/api/unknown';
            
            const moduleEndpoints = endpoints.map(endpoint => ({
                ...endpoint,
                module: routeFile.moduleName,
                fullPath: prefix + endpoint.path,
                file: routeFile.filename
            }));

            moduleEndpoints.forEach(endpoint => {
                console.log(`   ${endpoint.method.padEnd(6)} ${endpoint.fullPath}`);
            });

            allEndpoints.push(...moduleEndpoints);
        }

        this.endpoints = allEndpoints;
        return this.generateSummary();
    }

    /**
     * Generate summary untuk logging dan dokumentasi
     */
    generateSummary() {
        const summary = {
            total_endpoints: this.endpoints.length,
            by_method: {},
            by_module: {},
            endpoints: this.endpoints,
            formatted_list: []
        };

        // Group by method
        this.endpoints.forEach(endpoint => {
            const method = endpoint.method;
            if (!summary.by_method[method]) {
                summary.by_method[method] = 0;
            }
            summary.by_method[method]++;
        });

        // Group by module
        this.endpoints.forEach(endpoint => {
            const module = endpoint.module;
            if (!summary.by_module[module]) {
                summary.by_module[module] = {
                    count: 0,
                    endpoints: []
                };
            }
            summary.by_module[module].count++;
            summary.by_module[module].endpoints.push({
                method: endpoint.method,
                path: endpoint.fullPath
            });
        });

        // Generate formatted list untuk console logging
        Object.entries(summary.by_module).forEach(([module, data]) => {
            const icon = this.getModuleIcon(module);
            summary.formatted_list.push(`   ${icon} ${module.charAt(0).toUpperCase() + module.slice(1)}: ${data.endpoints.length} endpoints`);
        });

        return summary;
    }

    /**
     * Get icon untuk module berdasarkan nama
     */
    getModuleIcon(module) {
        const icons = {
            'auth': '🔐',
            'quiz': '❓',
            'category': '🏷️',
            'map': '🗺️',
            'profile': '👤',
            'badge': '🏆',
            'video': '📹',
            'notification': '🔔'
        };
        return icons[module] || '📁';
    }

    /**
     * Generate log output untuk server.js
     */
    generateServerLogOutput() {
        const summary = this.generateSummary();
        const logLines = [
            `📋 Total Endpoints: ${summary.total_endpoints}`,
            ...summary.formatted_list
        ];

        return {
            console_lines: logLines,
            endpoint_details: summary.endpoints,
            summary: summary
        };
    }

    /**
     * Export hasil analisis ke file JSON (opsional)
     */
    exportToJson(outputPath = null) {
        const summary = this.generateSummary();
        const output = {
            generated_at: new Date().toISOString(),
            ...summary
        };

        if (outputPath) {
            fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
            console.log(`📄 Endpoint analysis exported to: ${outputPath}`);
        }

        return output;
    }
}

/**
 * Static method untuk quick analysis
 */
async function analyzeEndpoints() {
    const analyzer = new EndpointAnalyzer();
    return await analyzer.generateEndpointReport();
}

/**
 * Generate output untuk server.js logging
 */
async function getServerEndpointLogs() {
    const analyzer = new EndpointAnalyzer();
    await analyzer.generateEndpointReport();
    return analyzer.generateServerLogOutput();
}

module.exports = {
    EndpointAnalyzer,
    analyzeEndpoints,
    getServerEndpointLogs
};