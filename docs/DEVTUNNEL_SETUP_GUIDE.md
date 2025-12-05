# SAKO DevTunnel Setup Guide

## 🚀 Quick Setup Steps

### 1. **Setup DevTunnel (Optional)**
```bash
# Install devtunnel (if not installed)
winget install Microsoft.devtunnel

# Login to devtunnel
devtunnel user login

# Create and start tunnel for SAKO backend (port 5000)
devtunnel host -p 5000 --allow-anonymous

# Output akan seperti:
# Hosting port 5000 at: https://abc123-5000.devtunnels.ms
```

### 2. **Update .env Configuration**
```bash
# Edit .env file and add/update these lines:

# Enable tunnel mode
TUNNEL_ENABLED=true

# Set your devtunnel URL (replace with actual URL from step 1)
EXTERNAL_URL=https://abc123-5000.devtunnels.ms

# Optional: Add more CORS origins if needed
CORS_ORIGINS=http://localhost:3000,https://yourapp.com
```

### 3. **Start SAKO Backend**
```bash
# Start the backend server
npm start

# Server will show:
# 🌐 External URL: https://abc123-5000.devtunnels.ms
# 📱 Android Access: https://abc123-5000.devtunnels.ms/api
```

### 4. **Update Android ApiConfig.kt**
```kotlin
// Copy the generated code from server startup or from:
// GET https://abc123-5000.devtunnels.ms/

object ApiConfig {
    const val BASE_URL = "https://abc123-5000.devtunnels.ms/api/"
    
    // Alternative URLs for testing
    const val LOCAL_URL = "http://10.0.2.2:5000/api/"
    const val TUNNEL_URL = "https://abc123-5000.devtunnels.ms/api/"
    
    const val CONTENT_TYPE = "application/json"
    const val ACCEPT = "application/json"
}
```

## 🔄 **Switching Between Modes**

### **Local Development Mode (Default)**
```bash
# In .env:
TUNNEL_ENABLED=false
# EXTERNAL_URL= (comment out or leave empty)

# Android will use: http://10.0.2.2:5000/api/
```

### **DevTunnel Mode**
```bash
# In .env:
TUNNEL_ENABLED=true
EXTERNAL_URL=https://your-tunnel-url.devtunnels.ms

# Android will use: https://your-tunnel-url.devtunnels.ms/api/
```

### **Production Mode**
```bash
# In .env:
TUNNEL_ENABLED=true
EXTERNAL_URL=https://your-production-domain.com
NODE_ENV=production

# Android will use: https://your-production-domain.com/api/
```

## 🧪 **Testing Configuration**

### **1. Test Health Check**
```bash
# Local
curl http://localhost:5000/

# Tunnel
curl https://abc123-5000.devtunnels.ms/

# Should return server info and Android config
```

### **2. Test Auth Endpoint**
```bash
# Test registration
curl -X POST https://abc123-5000.devtunnels.ms/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Test User","email":"test@example.com","password":"password123"}'
```

### **3. Test from Android**
```kotlin
// In your Android app, test connection:
class ApiTest {
    suspend fun testConnection() {
        try {
            val response = ApiClient.apiService.healthCheck()
            Log.d("API", "Connection successful: ${response.message}")
        } catch (e: Exception) {
            Log.e("API", "Connection failed: ${e.message}")
        }
    }
}
```

## 📝 **Notes**

- **DevTunnel URL changes**: URL akan berubah setiap restart devtunnel, update di .env
- **CORS**: Semua origin sudah dikonfigurasi otomatis
- **Security**: Tidak ada security khusus untuk development
- **Performance**: Ada sedikit overhead karena tunneling
- **Real Device**: Gunakan devtunnel untuk test di device fisik
- **Team Share**: Team bisa akses backend yang sama dengan tunnel URL

## 🔍 **Troubleshooting**

### **CORS Error**
```bash
# Add your origin to .env:
CORS_ORIGINS=http://localhost:3000,https://yourapp.com
```

### **DevTunnel Not Working**
```bash
# Check if devtunnel is running:
devtunnel list

# Restart tunnel:
devtunnel host -p 5000 --allow-anonymous
```

### **Android Can't Connect**
```kotlin
// Make sure BASE_URL is correct and ends with /api/
const val BASE_URL = "https://abc123-5000.devtunnels.ms/api/"
//                                                        ^^^^ Important!
```