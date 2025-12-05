# 🔥 Firebase & FCM Troubleshooting Guide

## ❌ **Masalah yang Diperbaiki**

### 1. **Error: "Please set a valid API key"**
Masalah ini terjadi di sisi Android, bukan backend. Backend Firebase Admin SDK sudah dikonfigurasi dengan benar.

### 2. **FCM Token tidak tersimpan**
- ✅ Backend sudah diperbaiki untuk menyimpan FCM token dengan benar
- ✅ Logging ditambahkan untuk tracking FCM token updates

### 3. **Token tidak ditemukan (401 Unauthorized)**
- ✅ Auth middleware diperbaiki dengan debugging yang lebih baik
- ✅ Token validation diperbaiki

---

## 🔧 **Perbaikan yang Sudah Dilakukan di Backend**

### **1. Auth Middleware (`src/middleware/auth.js`)**
```javascript
// ✅ Ditambahkan debug logging
// ✅ Improved token validation
// ✅ Better error messages
```

### **2. FCM Token Handling (`src/controllers/authController.js`)**
```javascript
// ✅ Enhanced FCM token update logic
// ✅ Better error handling untuk FCM updates
// ✅ Fallback ke existing token jika update gagal
```

### **3. Custom ID Generator (`src/utils/customIdGenerator.js`)**
```javascript
// ✅ Diperbaiki untuk mencegah duplicate ID
// ✅ Ditambahkan race condition protection
// ✅ Better fallback mechanism
```

---

## 📱 **Yang Perlu Diperbaiki di Android**

### **1. Firebase Configuration (google-services.json)**
Pastikan file `google-services.json` sudah benar dan sesuai dengan project Firebase:

```json
{
  "project_info": {
    "project_number": "24983268260",
    "project_id": "sako-cultural-app"
  },
  "client": [
    {
      "client_info": {
        "mobilesdk_app_id": "1:24983268260:android:xxxxx"
      },
      "api_key": [
        {
          "current_key": "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXX"
        }
      ]
    }
  ]
}
```

### **2. build.gradle (Module: app)**
```kotlin
android {
    // ... existing config
}

dependencies {
    // Firebase BOM
    implementation platform('com.google.firebase:firebase-bom:32.7.0')
    
    // Firebase services
    implementation 'com.google.firebase:firebase-messaging'
    implementation 'com.google.firebase:firebase-analytics'
    
    // ... other dependencies
}

// Apply plugin di bagian bawah
apply plugin: 'com.google.gms.google-services'
```

### **3. build.gradle (Project level)**
```kotlin
buildscript {
    dependencies {
        classpath 'com.google.gms:google-services:4.4.0'
    }
}
```

### **4. Android Manifest (AndroidManifest.xml)**
```xml
<application>
    <!-- Firebase Cloud Messaging -->
    <service
        android:name=".firebase.MyFirebaseMessagingService"
        android:exported="false">
        <intent-filter>
            <action android:name="com.google.firebase.MESSAGING_EVENT" />
        </intent-filter>
    </service>

    <!-- FCM default notification icon -->
    <meta-data
        android:name="com.google.firebase.messaging.default_notification_icon"
        android:resource="@drawable/ic_notification" />

    <!-- FCM default notification channel -->
    <meta-data
        android:name="com.google.firebase.messaging.default_notification_channel_id"
        android:value="sako_default" />
</application>
```

### **5. FCM Token Generation (Kotlin)**
```kotlin
class FirebaseHelper {
    companion object {
        fun generateFCMToken(callback: (String?) -> Unit) {
            FirebaseMessaging.getInstance().token
                .addOnCompleteListener { task ->
                    if (!task.isSuccessful) {
                        Log.w("FCM", "Fetching FCM registration token failed", task.exception)
                        callback(null)
                        return@addOnCompleteListener
                    }

                    // Get new FCM registration token
                    val token = task.result
                    Log.d("FCM", "FCM Registration Token: $token")
                    callback(token)
                }
        }
    }
}
```

### **6. Send FCM Token to Backend**
```kotlin
// Saat login, kirim FCM token ke backend
private fun loginUser(email: String, password: String) {
    FirebaseHelper.generateFCMToken { fcmToken ->
        val loginRequest = LoginRequest(
            email = email,
            password = password,
            fcm_token = fcmToken
        )
        
        // Kirim request ke backend
        viewModel.login(loginRequest)
    }
}
```

---

## 🧪 **Testing Steps**

### **1. Test FCM Token Generation**
```kotlin
// Di MainActivity atau Application class
FirebaseMessaging.getInstance().token.addOnCompleteListener { task ->
    if (!task.isSuccessful) {
        Log.w("FCM", "Fetching FCM registration token failed", task.exception)
        return@addOnCompleteListener
    }

    val token = task.result
    Log.d("FCM", "FCM Token: $token")
    
    // Test kirim ke backend
    // POST /api/auth/login dengan fcm_token
}
```

### **2. Test Backend Connection**
```bash
# Test login dengan FCM token
curl -X POST http://192.168.236.205:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "123456",
    "fcm_token": "your_fcm_token_here"
  }'
```

### **3. Test Authorization**
```bash
# Test protected endpoint dengan token
curl -X GET http://192.168.236.205:5000/api/map/places?page=1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_jwt_token_here"
```

---

## 📋 **Checklist Perbaikan**

### **Backend (✅ Sudah Selesai)**
- [x] Custom ID Generator diperbaiki
- [x] Auth middleware dengan debug logging
- [x] FCM token handling diperbaiki
- [x] Error logging ditingkatkan

### **Android (⚠️ Perlu Diperbaiki)**
- [ ] Pastikan `google-services.json` benar
- [ ] Update dependencies Firebase terbaru
- [ ] Implementasi FCM token generation
- [ ] Kirim FCM token saat login
- [ ] Test autorization header format
- [ ] Implementasi proper token storage

---

## 🚨 **Quick Fix untuk Testing**

1. **Cek FCM token di Android:**
```kotlin
FirebaseMessaging.getInstance().token.addOnCompleteListener { task ->
    Log.d("FCM_TOKEN", "Token: ${task.result}")
}
```

2. **Cek authorization header format:**
```kotlin
// Pastikan format: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
val authHeader = "Bearer $token"
```

3. **Test dengan Postman:**
- Login: `POST /api/auth/login` dengan fcm_token
- Copy token dari response
- Test map endpoint: `GET /api/map/places?page=1` dengan `Authorization: Bearer <token>`

---

## 🔗 **Resources**

- [Firebase Android Setup](https://firebase.google.com/docs/android/setup)
- [Firebase Cloud Messaging Android](https://firebase.google.com/docs/cloud-messaging/android/client)
- [JWT Authorization Headers](https://jwt.io/introduction)