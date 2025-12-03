/**
 * URL Configuration Helper for SAKO Backend
 * Supports multiple deployment environments
 */

class UrlConfig {
    constructor() {
        this.port = process.env.PORT || 5000;
        this.nodeEnv = process.env.NODE_ENV || 'development';
        this.externalUrl = process.env.EXTERNAL_URL;
        this.tunnelEnabled = process.env.TUNNEL_ENABLED === 'true';
    }

    /**
     * Get local server URL
     */
    getLocalUrl() {
        return `http://localhost:${this.port}`;
    }

    /**
     * Get external/tunnel URL if available
     */
    getExternalUrl() {
        return this.externalUrl;
    }

    /**
     * Get the best available URL for API responses
     */
    getApiBaseUrl() {
        if (this.tunnelEnabled && this.externalUrl) {
            return this.externalUrl;
        }
        return this.getLocalUrl();
    }

    /**
     * Get Android-specific URLs
     */
    getAndroidUrls() {
        return {
            emulator: `http://10.0.2.2:${this.port}`,
            external: this.externalUrl,
            recommended: this.externalUrl || `http://10.0.2.2:${this.port}`
        };
    }

    /**
     * Get CORS origins including dynamic tunnel URL
     */
    getCorsOrigins() {
        const baseOrigins = [
            'http://localhost:3000',
            'http://127.0.0.1:3000', 
            'http://localhost:8080',
            `http://10.0.2.2:${this.port}`,
            'http://10.0.2.2:3000'
        ];

        // Add tunnel URL if enabled
        if (this.tunnelEnabled && this.externalUrl) {
            baseOrigins.push(this.externalUrl);
            baseOrigins.push(this.externalUrl.replace('https://', 'http://'));
        }

        // Add custom CORS origins from .env
        if (process.env.CORS_ORIGINS) {
            const customOrigins = process.env.CORS_ORIGINS
                .split(',')
                .map(url => url.trim());
            baseOrigins.push(...customOrigins);
        }

        return [...new Set(baseOrigins)]; // Remove duplicates
    }

    /**
     * Generate Android Kotlin code for ApiConfig
     */
    generateAndroidConfig() {
        const baseUrl = this.getApiBaseUrl();
        return `
// ApiConfig.kt - Generated Configuration
object ApiConfig {
    // Base URL - Auto-generated based on server config
    const val BASE_URL = "${baseUrl}/api/"
    
    // Alternative URLs for testing
    const val LOCAL_URL = "http://10.0.2.2:${this.port}/api/"
    ${this.externalUrl ? `const val TUNNEL_URL = "${this.externalUrl}/api/"` : '// No tunnel URL configured'}
    
    // Headers
    const val CONTENT_TYPE = "application/json"
    const val ACCEPT = "application/json"
    
    // Current environment: ${this.nodeEnv}
    // Tunnel enabled: ${this.tunnelEnabled}
    // Generated at: ${new Date().toISOString()}
}

// Usage in Retrofit
object ApiClient {
    private val retrofit by lazy {
        Retrofit.Builder()
            .baseUrl(ApiConfig.BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }
    
    val apiService: ApiService by lazy {
        retrofit.create(ApiService::class)
    }
}`;
    }

    /**
     * Get server info for health check endpoint
     */
    getServerInfo() {
        const androidUrls = this.getAndroidUrls();
        
        return {
            local_url: this.getLocalUrl(),
            external_url: this.externalUrl,
            tunnel_enabled: this.tunnelEnabled,
            android_urls: androidUrls,
            cors_origins: this.getCorsOrigins(),
            environment: this.nodeEnv,
            port: this.port,
            recommendations: {
                development: androidUrls.recommended,
                production: this.externalUrl || 'Set EXTERNAL_URL for production'
            }
        };
    }

    /**
     * Print startup configuration info
     */
    printStartupInfo() {
        const androidUrls = this.getAndroidUrls();
        
        console.log('\n📊 URL Configuration Summary:');
        console.log(`   🏠 Local: ${this.getLocalUrl()}`);
        
        if (this.tunnelEnabled && this.externalUrl) {
            console.log(`   🌐 External: ${this.externalUrl}`);
            console.log(`   📱 Android: Use ${this.externalUrl}/api/`);
        } else {
            console.log(`   📱 Android Emulator: ${androidUrls.emulator}/api/`);
            console.log('   🔧 For real device: Enable tunnel in .env');
        }
        
        console.log(`   🔀 CORS Origins: ${this.getCorsOrigins().length} configured`);
    }
}

module.exports = UrlConfig;