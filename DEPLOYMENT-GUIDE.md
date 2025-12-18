# 🌐 Panduan Hosting Backend SAKO di carihosting.id

## 📋 Informasi Akun

- **Domain**: ridhodwisyahputra.my.id
- **Hosting**: carihosting.id (Shared Hosting)
- **Username**: ridhodwi
- **IP**: 103.38.108.58
- **cPanel**: https://mercury.carihosting.id:2083

---

## 🎯 RINGKASAN DEPLOYMENT

Backend SAKO menggunakan:
- **Runtime**: Node.js (Express.js)
- **Database**: MySQL (connection pool + Sequelize ORM)
- **Port**: 30000 (default dari cPanel)
- **External Services**: Firebase (notifications), Cloudinary (images), Supabase (storage)
- **Environment**: Production

---

## 🚀 LANGKAH-LANGKAH DEPLOY (DETAIL)

### **STEP 1: Setup Database di cPanel** 💾

#### 1.1. Login ke cPanel

1. Buka browser → https://mercury.carihosting.id:2083
2. Login dengan:
   ```
   Username: ridhodwi
   Password: [password cPanel Anda]
   ```
3. Dashboard cPanel akan terbuka

#### 1.2. Buat Database MySQL (MySQL Database Wizard)

1. **Di dashboard cPanel, cari "MySQL Database Wizard"**
   - Scroll ke section "Databases"
   - Klik icon **"MySQL Database Wizard"**

2. **Step 1: Create a Database**
   - Database Name: ketik `sako_db`
   - Database akan jadi: `ridhodwi_sako_db` (dengan prefix username otomatis)
   - Klik **"Next Step"
   
   ![Database dibuat: ridhodwi_sako]

3. **Step 2: Create Database Users**
   - Username: ketik `sako_user`
   - Username akan jadi: `ridhodwi_sako_db_user`
   - Password: **PENTING - BUAT PASSWORD KUAT!**
     ```
     Contoh: Sako2025@Secure!DB#Pass
     ```
   - Centang "I have copied this password in a safe place"
   - **📝 CATAT PASSWORD INI! Akan dipakai di environment variables**
   - Klik **"Create User"**

4. **Step 3: Add User To Database**
   - User `ridhodwi_sako_db_user` akan ditambahkan ke database `ridhodwi_sako_db`
   - **CENTANG "ALL PRIVILEGES"** (semua checkbox)
   - Klik **"Next Step"**
   
5. **Selesai!** ✅
   - Database: `ridhodwi_sako_db`
   - User: `ridhodwi_sako_db_user`
   - Password: [yang tadi Anda buat]

#### 1.3. Import Database Schema & Data

1. **Kembali ke Dashboard cPanel**
   - Klik logo cPanel di kiri atas untuk kembali

2. **Buka phpMyAdmin**
   - Cari section "Databases"
   - Klik **"phpMyAdmin"**
   - Tab baru akan terbuka

3. **Pilih Database**
   - Di sidebar kiri, klik **`ridhodwi_sako`**
   - Database akan terbuka

4. **Import SQL File**
   - Klik tab **"Import"** di bagian atas
   - Klik **"Choose File"** atau **"Browse"**
   - Pilih file SQL Anda:
     - `database.sql` ATAU
     - `db_sako_hackathon.sql` ATAU
     - `sako_production.sql`
   - **Format**: pastikan "SQL" selected
   - **Character set**: `utf8mb4_unicode_ci` (biasanya sudah default)
   - Klik **"Go"** (tombol di bawah)

5. **Tunggu Import Selesai**
   - Progress bar akan muncul
   - Tunggu sampai muncul pesan: **"Import has been successfully finished"**
   - Durasi: tergantung ukuran file (biasanya 10-60 detik)

6. **Verifikasi Import**
   - Klik database `ridhodwi_sako` di sidebar
   - Klik tab "Structure"
   - Pastikan tabel-tabel muncul:
     ```
     ✅ users
     ✅ quiz_attempts
     ✅ quiz_categories
     ✅ quiz_levels
     ✅ quiz_questions
     ✅ tourist_places
     ✅ visited_places
     ✅ reviews
     ✅ videos
     ✅ video_collections
     ✅ user_badges
     ✅ notifications
     ... dan tabel lainnya
     ```

7. **Set Charset Database (PENTING!)**
   - Klik tab **"Operations"**
   - Di section "Collation", pilih: **`utf8mb4_unicode_ci`**
   - Klik **"Go"**
   - Ini memastikan database support emoji dan karakter Unicode

#### 1.4. Test Koneksi Database (Optional)

1. **Masih di phpMyAdmin**
   - Pilih database `ridhodwi_sako`
   - Klik tab **"SQL"**

2. **Run Test Query**
   ```sql
   SELECT COUNT(*) as total_users FROM users;
   SELECT COUNT(*) as total_places FROM tourist_places;
   SELECT VERSION() as mysql_version;
   ```
   - Paste query di atas
   - Klik **"Go"**
   - Seharusnya muncul hasil query (jumlah users, places, versi MySQL)

3. **Database siap digunakan!** ✅

---

**📝 CATAT INFORMASI INI:**
```
DB_NAME: ridhodwi_sako
DB_USER: ridhodwi_sako_db_user
DB_PASSWORD: [password yang Anda buat tadi]
DB_HOST: localhost
DB_PORT: 3306
```

**⚠️ PENTING**: Jangan lupa password database! Akan dipakai di Step 2.

---

### **STEP 2: Setup Node.js Application** 🟢

#### 2.1. Buka Application Manager

1. **Kembali ke Dashboard cPanel**
   - Klik logo cPanel di kiri atas

2. **Cari "Application Manager"**
   - Scroll ke section **"Software"**
   - Klik **"Application Manager"** (icon dengan logo container)
   - Atau ketik "application" di search box cPanel

3. **Halaman Application Manager akan terbuka**

#### 2.2. Create Node.js Application

1. **Klik tombol "Create Application"** (atau "Create New Application")

2. **Isi Form Application dengan DETAIL BERIKUT:**

---

**📍 Port**
```
30000
```
- ✅ **Sudah terisi otomatis** - ini port internal yang dipakai Node.js
- **BIARKAN SAJA, JANGAN DIUBAH!**

---

**📍 Application Name**
```
sako
```
- Nama aplikasi (bebas, untuk identifikasi saja)
- Gunakan huruf kecil, tanpa spasi

---

**📍 Deployment Domain**
```
ridhodwisyahputra.my.id
```
- ✅ **Sudah terisi otomatis** dengan domain Anda
- **BIARKAN SAJA**

---

**📍 Base Application URL**
```
ridhodwisyahputra.my.id/sako-backend
```
- ✅ **Sudah terisi** - path URL untuk akses aplikasi
- Artinya API akan diakses via: `https://ridhodwisyahputra.my.id/sako-backend/api/...`
- **BIARKAN SAJA**

---

**📍 Application Path**
```
/home/ridhodwi/sako-backend
```
- ✅ **Sudah terisi** - folder di server tempat code backend
- **BIARKAN SAJA**

---

**📍 Application type** ⚠️ **HARUS DIISI!**
```
Node.js
```
- **Klik dropdown** dan pilih **"Node.js"**
- Ini memberitahu server bahwa aplikasi pakai runtime Node.js

---

**📍 Application startup file**
```
server.js
```
- ✅ **Sudah terisi** - file entry point backend
- Sesuai dengan `server.js` di root folder backend
- **BIARKAN SAJA**

---

**📍 Deployment Environment** ⚠️ **HARUS DIPILIH!**
```
⚫ Production
```
- **Klik radio button "Production"**
- Jangan pilih "Development" karena ini untuk hosting live

---

**📍 Start Command** ⚠️ **HARUS DIISI!**
```
node server.js
```
- Command untuk menjalankan aplikasi
- Ketik: `node server.js`
- Atau bisa juga: `npm start` (jika package.json punya script start)

---

**📍 Stop Command** (Optional - bisa dikosongkan)
```

```
- **KOSONGKAN SAJA**
- cPanel akan otomatis handle stop process

---

#### 2.3. Set Environment Variables ⚠️ **SANGAT PENTING!**

Masih di halaman yang sama, scroll ke bawah ke section **"Environment Variables"**

1. **Klik tombol "Add +" berulang kali untuk menambahkan variable**

2. **Isi SEMUA environment variables berikut INI:**

---

**Variable 1: PORT**
```
Name: PORT
Value: 30000
```
- Port yang digunakan aplikasi (harus sama dengan Port di atas)

**Cara Add:**
- Klik "Add +"
- Kolom "Name" isi: `PORT`
- Kolom "Value" isi: `30000`
- Klik di luar kolom atau tekan Enter

---

**Variable 2: NODE_ENV**
```
Name: NODE_ENV
Value: production
```
- Environment mode (production untuk hosting live)

---

**Variable 3: DB_HOST**
```
Name: DB_HOST
Value: localhost
```
- ⚠️ **PENTING**: Harus `localhost`, BUKAN `127.0.0.1`
- Ini hostname MySQL server di shared hosting

---

**Variable 4: DB_PORT**
```
Name: DB_PORT
Value: 3306
```
- Port standard MySQL

---

**Variable 5: DB_USER**
```
Name: DB_USER
Value: ridhodwi_sako_db_user
```
- Username database yang dibuat di Step 1
- ⚠️ **Harus PERSIS sama** dengan yang di Step 1.3

---

**Variable 6: DB_PASSWORD** ⚠️ **KRUSIAL!**
```
Name: DB_PASSWORD
Value: [PASSWORD DATABASE YANG ANDA CATAT DI STEP 1]
```
- Password database user yang dibuat tadi
- **PASTE password yang Anda catat!**
- Contoh: `Sako2025@Secure!DB#Pass`

---

**Variable 7: DB_NAME**
```
Name: DB_NAME
Value: ridhodwi_sako_db
```
- Nama database yang dibuat di Step 1
- ⚠️ **BUKAN** `sako`, tapi `ridhodwi_sako_db` (dengan prefix)

---

**Variable 8: JWT_SECRET** ⚠️ **GANTI INI!**
```
Name: JWT_SECRET
Value: sako_jwt_production_2025_x9KpL3mN8qR2tY5uH7jW_change_this_to_random_string
```
- Secret key untuk JWT authentication
- **GANTI** dengan random string yang panjang dan kuat!
- Generate di: https://randomkeygen.com/ (pilih "Fort Knox Passwords")
- Atau pakai: `openssl rand -base64 48` di terminal

---

**Variable 9: MAX_FILE_SIZE**
```
Name: MAX_FILE_SIZE
Value: 5242880
```
- Max file upload size (5MB dalam bytes)

---

**Variable 10: EXTERNAL_URL**
```
Name: EXTERNAL_URL
Value: https://ridhodwisyahputra.my.id/sako-backend
```
- Base URL aplikasi untuk external access

---

**Variable 11: TUNNEL_ENABLED**
```
Name: TUNNEL_ENABLED
Value: false
```
- Matikan tunnel di production

---

**Variable 12: CORS_ORIGINS**
```
Name: CORS_ORIGINS
Value: *
```
- Allow all origins (atau isi domain spesifik jika perlu keamanan lebih)
- Untuk production specific: `https://ridhodwisyahputra.my.id`

---

**Variable 13-17: FIREBASE (untuk notifikasi)** ⚠️ **COPY dari .env**

```
Name: FIREBASE_PROJECT_ID
Value: sako-cultural-app
```

```
Name: FIREBASE_CLIENT_EMAIL
Value: firebase-adminsdk-fbsvc@sako-cultural-app.iam.gserviceaccount.com
```

```
Name: FIREBASE_PRIVATE_KEY
Value: -----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCx8wk+LmK+vnal
[... COPY SELURUH PRIVATE KEY DARI .env ...]
-----END PRIVATE KEY-----
```
- ⚠️ **PENTING**: Copy SELURUH private key termasuk `-----BEGIN` dan `-----END`
- Jangan lupa newline `\n` diganti dengan enter sebenarnya

```
Name: FIREBASE_SENDER_ID
Value: 24983268260
```

---

**Variable 18-21: SUPABASE (untuk storage)** ⚠️ **COPY dari .env**

```
Name: SUPABASE_URL
Value: https://lqdmiwpsmufcwziayoev.supabase.co
```

```
Name: SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxZG1pd3BzbXVmY3d6aWF5b2V2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0Mjk3NTMsImV4cCI6MjA4MDAwNTc1M30.LXiJztaN9b3pQ_Jbbl7k6gtXjpk_S9SwIVkXKwP6w1E
```

```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxZG1pd3BzbXVmY3d6aWF5b2V2Iiwicm9zZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDQyOTc1MywiZXhwIjoyMDgwMDA1NzUzfQ._1_TNP52Ku6-qHhYwRayXxg077XnvmYDGpV-PXDhcnc
```

---

**Variable 22-24: CLOUDINARY (untuk image upload)** ⚠️ **COPY dari .env**

```
Name: CLOUDINARY_CLOUD_NAME
Value: dirsli3xe
```

```
Name: CLOUDINARY_API_KEY
Value: 314459834698424
```

```
Name: CLOUDINARY_API_SECRET
Value: tXGIDh9BMkmg2IeUz2Zkphv5kks
```

---

#### 2.4. Verifikasi Environment Variables

**CHECKLIST - Pastikan SEMUA ini sudah di-add:**

- [ ] PORT = 30000
- [ ] NODE_ENV = production
- [ ] DB_HOST = localhost
- [ ] DB_PORT = 3306
- [ ] DB_USER = ridhodwi_sako_db_user
- [ ] DB_PASSWORD = [password database Anda]
- [ ] DB_NAME = ridhodwi_sako_db
- [ ] JWT_SECRET = [random string kuat]
- [ ] MAX_FILE_SIZE = 5242880
- [ ] EXTERNAL_URL = https://ridhodwisyahputra.my.id/sako-backend
- [ ] TUNNEL_ENABLED = false
- [ ] CORS_ORIGINS = *
- [ ] FIREBASE_PROJECT_ID = sako-cultural-app
- [ ] FIREBASE_CLIENT_EMAIL = firebase-adminsdk-fbsvc@...
- [ ] FIREBASE_PRIVATE_KEY = [full private key]
- [ ] FIREBASE_SENDER_ID = 24983268260
- [ ] SUPABASE_URL = https://lqdmiwpsmufcwziayoev.supabase.co
- [ ] SUPABASE_ANON_KEY = eyJ...
- [ ] SUPABASE_SERVICE_ROLE_KEY = eyJ...
- [ ] CLOUDINARY_CLOUD_NAME = dirsli3xe
- [ ] CLOUDINARY_API_KEY = 314459834698424
- [ ] CLOUDINARY_API_SECRET = tXG...

**Total: 22 Environment Variables**

---

#### 2.5. Create Application

1. **Scroll ke bawah**
2. **Klik tombol "Create"** (tombol biru)
3. **Tunggu proses**:
   - Application sedang dibuat
   - Environment variables disimpan
   - Folder `/home/ridhodwi/sako-backend` dibuat otomatis
4. **Halaman redirect** ke detail aplikasi
5. **Status**: Initially "Stopped" (normal, karena belum ada code)

✅ **Node.js Application berhasil dibuat!**

---

**📝 CATAT URL INI:**
```
App URL: https://ridhodwisyahputra.my.id/sako-backend
API Endpoint: https://ridhodwisyahputra.my.id/sako-backend/api
```

---

### **STEP 3: Upload Backend Code** 📤

#### 3.1. Prepare Deployment Package (Di Komputer Lokal)

**⚠️ JANGAN upload folder node_modules dan .git!**

**Opsi A: Menggunakan PowerShell Script (RECOMMENDED)**

1. **Buka PowerShell di folder backend**:
   ```powershell
   cd "d:\Local Disk D\sako 3\backend\hackathon-backend"
   ```

2. **Jalankan script prepare-deploy.ps1**:
   ```powershell
   .\prepare-deploy.ps1
   ```

3. **Script akan otomatis**:
   - ✅ Check Node.js installed
   - ✅ Install dependencies
   - ✅ Buat file zip dengan nama: `backend-sako-deploy-20250512-143022.zip` (dengan timestamp)
   - ✅ Exclude node_modules, .git, .env (otomatis)
   - ✅ Simpan di folder yang sama

4. **File zip siap diupload!**

---

**Opsi B: Manual Zip (jika script error)**

1. **Buka folder backend** di File Explorer
2. **Pilih SEMUA file dan folder** KECUALI:
   - ❌ `node_modules/`
   - ❌ `.git/`
   - ❌ `.env` (jangan upload .env development!)
   - ❌ `backend-sako-deploy-*.zip` (file zip lama)

3. **Klik kanan → Send to → Compressed (zipped) folder**
4. **Rename** menjadi: `backend-sako-deploy.zip`

---

#### 3.2. Upload Code ke Server

**Metode 1: Via cPanel File Manager (RECOMMENDED untuk pemula)**

1. **Buka File Manager di cPanel**
   - Klik **"File Manager"** di cPanel Dashboard
   - Atau cari "file" di search box

2. **Navigate ke folder aplikasi**
   - Di panel kiri, klik folder **`sako-backend`**
   - Path akan menunjukkan: `/home/ridhodwi/sako-backend`
   - **Folder mungkin kosong** - ini normal!

3. **Upload file zip**
   - Klik tombol **"Upload"** di toolbar atas
   - Halaman upload akan terbuka di tab baru
   - **Drag & Drop** file `backend-sako-deploy-*.zip` ke area upload
   - Atau klik **"Select File"** dan pilih file zip
   - **Tunggu progress bar** sampai 100%
   - ✅ Upload complete!

4. **Kembali ke File Manager tab**
   - Klik tab File Manager yang tadi
   - Atau klik "Go Back to /home/ridhodwi/sako-backend"
   - **File zip** seharusnya sudah muncul di folder

5. **Extract (Unzip) file**
   - **Klik kanan** pada file `backend-sako-deploy-*.zip`
   - Pilih **"Extract"**
   - Dialog muncul: "Extract to: /home/ridhodwi/sako-backend"
   - Klik **"Extract File(s)"**
   - Tunggu proses extract
   - ✅ **Files extracted successfully!**

6. **Verifikasi files**
   - Seharusnya sekarang ada folder dan file:
     ```
     /home/ridhodwi/sako-backend/
     ├── package.json
     ├── server.js
     ├── src/
     │   ├── app.js
     │   ├── config/
     │   ├── controllers/
     │   ├── middleware/
     │   ├── models/
     │   ├── routes/
     │   └── utils/
     ├── public/
     └── backend-sako-deploy-*.zip
     ```

7. **Hapus file zip** (optional, untuk hemat space)
   - **Klik kanan** file zip
   - Pilih **"Delete"**
   - Confirm deletion

---

**Metode 2: Via FTP (Alternative - untuk yang familiar dengan FTP)**

1. **Install FTP Client** (jika belum punya):
   - Download **FileZilla** dari https://filezilla-project.org/
   - Atau gunakan WinSCP

2. **FTP Credentials** (cek di email hosting):
   ```
   Host: ridhodwisyahputra.my.id atau 103.38.108.58
   Username: ridhodwi
   Password: [password cPanel Anda]
   Port: 21
   ```

3. **Connect via FTP**
   - Buka FileZilla
   - Input credentials di atas
   - Click "Quickconnect"

4. **Navigate ke folder**
   - Remote site: `/home/ridhodwi/sako-backend`
   - Local site: `d:\Local Disk D\sako 3\backend\hackathon-backend`

5. **Upload files**
   - Select SEMUA files di local (kecuali node_modules, .git, .env)
   - Drag ke remote folder
   - Tunggu upload selesai

---

#### 3.3. Install Node.js Dependencies di Server

**⚠️ PENTING: Install dependencies di server, BUKAN upload node_modules!**

**Cara 1: Via Terminal di cPanel (RECOMMENDED)**

1. **Buka Terminal**
   - Di cPanel, cari **"Terminal"**
   - Klik untuk open

2. **Navigate ke folder aplikasi**
   ```bash
   cd /home/ridhodwi/sako-backend
   ```

3. **Check current directory**
   ```bash
   pwd
   ```
   Output: `/home/ridhodwi/sako-backend`

4. **Check file package.json ada**
   ```bash
   ls -la package.json
   ```
   Output: `-rw-r--r-- 1 ridhodwi ridhodwi 1234 May 12 14:30 package.json`

5. **Install dependencies** ⚠️ **HARUS dengan flag --production**
   ```bash
   npm install --production
   ```
   
   **Penjelasan:**
   - `--production`: Skip devDependencies (nodemon, testing tools, dll)
   - Hemat space & lebih secure di production
   
   **Output:**
   ```
   npm WARN deprecated ...
   
   added 245 packages, and audited 246 packages in 45s
   
   12 packages are looking for funding
     run `npm fund` for details
   
   found 0 vulnerabilities
   ```

6. **Verifikasi node_modules terinstall**
   ```bash
   ls -la node_modules | head -20
   ```
   - Seharusnya ada banyak folder (express, mysql2, sequelize, dll)

---

**Cara 2: Via Application Manager (Alternative)**

1. **Buka Application Manager** di cPanel
2. **Pilih aplikasi "sako"** dari list
3. **Klik "Run NPM Install"** button (jika ada)
4. **Tunggu proses** install selesai (2-5 menit)

---

#### 3.4. Verifikasi Upload & Dependencies

**Checklist Verifikasi:**

- [ ] File `server.js` ada di `/home/ridhodwi/sako-backend/`
- [ ] Folder `src/` dengan subfolder (config, controllers, middleware, models, routes, utils) ada
- [ ] File `package.json` ada
- [ ] Folder `node_modules/` ada dan berisi banyak package
- [ ] **TIDAK ADA** folder `.git/` di server (harus excluded)
- [ ] **TIDAK ADA** file `.env` di server (env variables sudah di Application Manager)

**Command untuk check:**
```bash
cd /home/ridhodwi/sako-backend
ls -la
```

Expected output:
```
drwxr-xr-x  8 ridhodwi ridhodwi   4096 May 12 14:30 .
drwx--x--x 10 ridhodwi ridhodwi   4096 May 12 14:00 ..
-rw-r--r--  1 ridhodwi ridhodwi   1234 May 12 14:30 package.json
-rw-r--r--  1 ridhodwi ridhodwi 123456 May 12 14:30 package-lock.json
-rw-r--r--  1 ridhodwi ridhodwi   2345 May 12 14:30 server.js
drwxr-xr-x 12 ridhodwi ridhodwi   4096 May 12 14:35 node_modules
drwxr-xr-x  8 ridhodwi ridhodwi   4096 May 12 14:30 src
drwxr-xr-x  3 ridhodwi ridhodwi   4096 May 12 14:30 public
```

✅ **Backend code berhasil diupload dan dependencies terinstall!**

---

### **STEP 4: Start Node.js Application** ▶️

#### 4.1. Start Aplikasi

1. **Buka Application Manager** di cPanel
   - Cari "Application Manager" di search box
   - Atau ke section "Software"

2. **Pilih aplikasi "sako"**
   - List aplikasi akan tampil
   - Klik pada aplikasi **"sako"**

3. **Start aplikasi**
   - Klik tombol **"Start"** (icon play ▶️)
   - Atau klik **"Restart"** jika sudah running

4. **Tunggu proses startup**
   - Status akan berubah menjadi **"Running"** ✅
   - Icon hijau muncul
   - Biasanya 5-10 detik

---

#### 4.2. Check Application Status

**Status Indicators:**

✅ **Running** (hijau) - Aplikasi berjalan normal
```
Status: Running
Uptime: 00:02:34
Port: 30000
```

⚠️ **Starting** (kuning) - Sedang startup
```
Status: Starting...
```

❌ **Stopped** (merah) - Aplikasi tidak berjalan
```
Status: Stopped
Error: [lihat error log]
```

---

#### 4.3. View Logs (jika ada error)

1. **Di halaman Application Manager**
2. **Scroll ke "Application Logs"**
3. **Klik "View Logs"** atau **"Show Log"**

**Logs yang perlu dicek:**
- ✅ "Server listening on port 30000"
- ✅ "MySQL connected: localhost"
- ✅ "Database: ridhodwi_sako"
- ❌ "Connection refused" - Database tidak konek
- ❌ "EADDRINUSE" - Port sudah dipakai

**Troubleshooting Common Errors:**

**Error 1: Database Connection Failed**
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```
- ✅ **Solusi**: Cek environment variable `DB_HOST` harus `localhost`
- ✅ **Solusi**: Cek `DB_USER` dan `DB_PASSWORD` benar
- ✅ **Solusi**: Cek database `ridhodwi_sako_db` sudah dibuat di Step 1

**Error 2: Port Already in Use**
```
Error: listen EADDRINUSE :::30000
```
- ✅ **Solusi**: Stop aplikasi lain yang pakai port 30000
- ✅ **Solusi**: Restart aplikasi via Application Manager

**Error 3: Module Not Found**
```
Error: Cannot find module 'express'
```
- ✅ **Solusi**: Run `npm install --production` lagi di Terminal

---

### **STEP 5: Test API Endpoints** 🧪

#### 5.1. Test via Browser

**Test 1: Root Endpoint**

1. **Buka browser**
2. **Akses URL**:
   ```
   https://ridhodwisyahputra.my.id/sako-backend
   ```
   atau
   ```
   https://ridhodwisyahputra.my.id/sako-backend/api
   ```

3. **Expected Response** (JSON):
   ```json
   {
     "success": true,
     "message": "SAKO Backend API berjalan dengan baik!",
     "version": "1.0.0",
     "timestamp": "2025-05-12T14:30:45.123Z",
     "endpoints": {
       "auth": "/api/auth",
       "home": "/api/home",
       "map": "/api/map",
       "profile": "/api/profile",
       "quiz": "/api/quiz"
     }
   }
   ```

✅ **Jika tampil JSON seperti di atas, API BERHASIL!**

❌ **Jika error 404/502**: Cek Application Manager, status harus "Running"

---

**Test 2: Health Check**

```
https://ridhodwisyahputra.my.id/sako-backend/api/health
```

Expected:
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2025-05-12T14:30:45.123Z"
}
```

---

#### 5.2. Test via Postman/Thunder Client

**Test Login Endpoint**

1. **Buat New Request**
2. **Method**: `POST`
3. **URL**:
   ```
   https://ridhodwisyahputra.my.id/sako-backend/api/auth/login
   ```

4. **Headers**:
   ```
   Content-Type: application/json
   ```

5. **Body** (raw JSON):
   ```json
   {
     "email": "test@gmail.com",
     "password": "12345678"
   }
   ```

6. **Send Request**

7. **Expected Response** (200 OK):
   ```json
   {
     "success": true,
     "message": "Login berhasil",
     "data": {
       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
       "user": {
         "id": "USR-001",
         "email": "test@gmail.com",
         "name": "Test User"
       }
     }
   }
   ```

✅ **Jika dapat token JWT, authentication berhasil!**

---

**Test Upload Image (jika ada)**

```
POST https://ridhodwisyahputra.my.id/sako-backend/api/upload/profile
Headers:
  Content-Type: multipart/form-data
  Authorization: Bearer [token_dari_login]
Body:
  file: [pilih image]
```

Expected:
```json
{
  "success": true,
  "message": "Upload berhasil",
  "data": {
    "url": "https://res.cloudinary.com/dirsli3xe/image/upload/v1234567890/sako/..."
  }
}
```

---

#### 5.3. Test Database Connection

**Via Terminal cPanel:**

1. **Buka Terminal**
2. **Connect ke MySQL**:
   ```bash
   mysql -u ridhodwi_sako_db_user -p ridhodwi_sako_db
   ```
   Enter password: [password database Anda]

3. **Test query**:
   ```sql
   SHOW TABLES;
   SELECT * FROM users LIMIT 5;
   ```

4. **Exit**:
   ```sql
   EXIT;
   ```

✅ **Jika query berhasil, database connection OK!**

---

#### 5.4. Test External Services

**Test Firebase Notifications:**
```
POST https://ridhodwisyahputra.my.id/sako-backend/api/notifications/send
Headers:
  Content-Type: application/json
  Authorization: Bearer [token]
Body:
{
  "userId": "USR-001",
  "title": "Test Notif",
  "message": "Halo dari production!"
}
```

**Test Cloudinary Upload:**
```
POST https://ridhodwisyahputra.my.id/sako-backend/api/upload/test
Headers:
  Content-Type: multipart/form-data
Body:
  file: [image file]
```

**Test Supabase Storage:**
```
GET https://ridhodwisyahputra.my.id/sako-backend/api/storage/files
Headers:
  Authorization: Bearer [token]
```

✅ **Jika semua test berhasil, semua service terintegrasi dengan baik!**

---

### **STEP 6: Update Frontend Config** 📱

#### 6.1. Update API Base URL

**File**: `frontend/hackathon-frontend/app/src/main/java/com/example/sako/data/remote/ApiConfig.kt`

**SEBELUM (Development):**
```kotlin
object ApiConfig {
    private const val BASE_URL = "http://10.0.2.2:5000" // Android Emulator
    // atau
    private const val BASE_URL = "http://192.168.1.100:5000" // Local Network
    
    val apiService: ApiService by lazy {
        val retrofit = Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
        
        retrofit.create(ApiService::class.java)
    }
}
```

**SESUDAH (Production):**
```kotlin
object ApiConfig {
    // ✅ Ganti dengan domain production
    private const val BASE_URL = "https://ridhodwisyahputra.my.id/sako-backend"
    
    val apiService: ApiService by lazy {
        val retrofit = Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
        
        retrofit.create(ApiService::class.java)
    }
}
```

---

#### 6.2. Update AndroidManifest.xml (jika ada hardcoded URL)

**File**: `frontend/hackathon-frontend/app/src/main/AndroidManifest.xml`

**Cek apakah ada:**
```xml
<manifest>
    <application
        android:usesCleartextTraffic="true">  <!-- HAPUS INI di production! -->
```

**Ganti menjadi:**
```xml
<manifest>
    <application
        android:usesCleartextTraffic="false">  <!-- HTTPS aman, tidak perlu cleartext -->
```

**Atau HAPUS attribute** `android:usesCleartextTraffic` sama sekali (default false untuk HTTPS).

---

#### 6.3. Test Frontend ke Production API

**Langkah Testing:**

1. **Build APK Production**:
   ```bash
   cd "d:\Local Disk D\sako 3\frontend\hackathon-frontend"
   .\gradlew assembleRelease
   ```

2. **Install APK ke device**:
   - File APK di: `app/build/outputs/apk/release/app-release.apk`
   - Install ke HP fisik (bukan emulator)
   - Atau test di emulator dengan internet aktif

3. **Test Login**:
   - Buka aplikasi
   - Input email/password test user
   - Klik login
   - ✅ **Berhasil jika dapat token dan masuk home screen**

4. **Test Fitur-Fitur**:
   - [ ] Login/Register
   - [ ] Load data home (categories, videos, dll)
   - [ ] Load map locations
   - [ ] Upload profile photo
   - [ ] Take quiz
   - [ ] Receive notifications

---

#### 6.4. Troubleshooting Frontend Connection

**Error 1: "Unable to resolve host"**
```
java.net.UnknownHostException: Unable to resolve host "ridhodwisyahputra.my.id"
```
- ✅ **Solusi**: Cek internet connection di device
- ✅ **Solusi**: Cek domain sudah propagasi (ping domain)

**Error 2: "Failed to connect to ridhodwisyahputra.my.id:443"**
```
java.net.ConnectException: Failed to connect
```
- ✅ **Solusi**: Cek SSL certificate domain (harus HTTPS valid)
- ✅ **Solusi**: Cek backend status "Running" di Application Manager

**Error 3: "Cleartext HTTP traffic not permitted"**
```
Cleartext HTTP traffic to ridhodwisyahputra.my.id not permitted
```
- ✅ **Solusi**: Pastikan pakai `https://` bukan `http://`
- ✅ **Solusi**: Set `usesCleartextTraffic="false"` di AndroidManifest

**Error 4: "401 Unauthorized" di semua endpoint kecuali login**
```
HTTP 401 Unauthorized
```
- ✅ **Solusi**: Cek JWT token disimpan dengan benar
- ✅ **Solusi**: Cek header `Authorization: Bearer [token]` ada di request

---

### **STEP 7: Monitoring & Maintenance** 🔧

#### 7.1. Monitor Application Health

**Via cPanel Application Manager:**

1. **Buka Application Manager**
2. **Klik aplikasi "sako"**
3. **Check Metrics**:
   - **Status**: Running ✅
   - **Uptime**: Berapa lama aplikasi berjalan
   - **Memory Usage**: RAM usage (jangan sampai penuh)
   - **CPU Usage**: Load processor

**Recommended Checks:**
- Cek status **setiap hari** (pagi/sore)
- Set reminder untuk monitoring

---

#### 7.2. View Application Logs

**Real-time Logs:**

1. **Via Application Manager**:
   - Klik **"View Logs"**
   - Atau **"Show Log"**

2. **Via Terminal**:
   ```bash
   cd /home/ridhodwi/sako-backend
   tail -f logs/app.log
   # atau
   pm2 logs sako
   ```

**Logs to Monitor:**
- ✅ Successful requests: `POST /api/auth/login - 200 OK`
- ⚠️ Warnings: `Warning: Connection pool exhausted`
- ❌ Errors: `Error: Database connection lost`

---

#### 7.3. Restart Application (jika perlu)

**Kapan perlu restart:**
- Memory leak (RAM usage terus naik)
- Application hang/slow
- Setelah update code
- Database connection error

**Cara Restart:**

**Metode 1: Via Application Manager**
1. Klik **"Restart"** button
2. Tunggu status kembali "Running"

**Metode 2: Via Terminal**
```bash
# Stop
cd /home/ridhodwi/sako-backend
pm2 stop sako

# Start
pm2 start sako

# Restart
pm2 restart sako
```

---

#### 7.4. Update Code (Rolling Update)

**Langkah Update Backend:**

1. **Di Local**: Edit code, test, commit
2. **Prepare deployment**: Run `prepare-deploy.ps1`
3. **Upload ke server**: Via File Manager atau FTP
4. **Extract**: Overwrite files lama
5. **Restart app**: Via Application Manager

**Best Practice:**
- ✅ Test di local development dulu
- ✅ Backup database sebelum update besar
- ✅ Update di jam low-traffic (malam)
- ✅ Monitor logs setelah update

---

#### 7.5. Backup Strategy

**Database Backup:**

1. **Via cPanel phpMyAdmin**:
   - Buka database `ridhodwi_sako`
   - Klik **"Export"**
   - Format: SQL
   - Compression: zipped
   - Download file backup

2. **Via Terminal (automated)**:
   ```bash
   mysqldump -u ridhodwi_sako_db_user -p ridhodwi_sako_db > backup-$(date +%Y%m%d).sql
   gzip backup-*.sql
   ```

**Schedule Backups:**
- Daily backup: Database
- Weekly backup: Full application (code + database)
- Store backups: Google Drive / Local

**Files Backup:**
```bash
cd /home/ridhodwi
tar -czf sako-backend-backup-$(date +%Y%m%d).tar.gz sako-backend/
```

---

#### 7.6. Security Checklist

- [ ] JWT_SECRET adalah random string yang kuat (min 32 karakter)
- [ ] Database password kuat (kombinasi huruf, angka, simbol)
- [ ] Firebase/Cloudinary/Supabase credentials aman (tidak di-share)
- [ ] CORS_ORIGINS set ke domain spesifik (bukan `*`) di production
- [ ] File `.env` tidak ter-commit ke Git
- [ ] Log file tidak expose sensitive data (password, token)
- [ ] SSL certificate aktif dan valid (HTTPS)
- [ ] Rate limiting aktif untuk prevent DDoS

---

#### 7.7. Performance Optimization

**Database Optimization:**
```sql
-- Add indexes untuk query cepat
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_location_category ON locations(category_id);

-- Analyze table performance
ANALYZE TABLE users;
ANALYZE TABLE locations;
```

**Application Optimization:**
- ✅ Enable gzip compression di Express
- ✅ Set cache headers untuk static files
- ✅ Connection pooling sudah aktif (max 10)
- ✅ Pagination untuk list data besar

**Monitoring Tools:**
- cPanel built-in metrics
- Google Analytics (frontend)
- Log file analysis

---

#### 7.8. Common Production Issues

**Issue 1: Application Stopped Unexpectedly**
- **Cause**: Memory limit exceeded, uncaught exception
- **Solution**: Check logs, restart app, fix code bug

**Issue 2: Slow API Response**
- **Cause**: Database query slow, connection pool exhausted
- **Solution**: Optimize queries, add indexes, increase pool size

**Issue 3: 502 Bad Gateway**
- **Cause**: Node.js app crashed, port not listening
- **Solution**: Restart app, check logs for errors

**Issue 4: Database Connection Lost**
- **Cause**: Too many connections, MySQL restarted
- **Solution**: Check connection pool settings, restart app

Build APK baru dan test!

---

## 🔧 Troubleshooting

### **Masalah 1: Application Not Starting**

**Cek Logs**:
- Di Node.js App, klik **"Open Logs"**
- Atau via SSH:
  ```bash
  cd /home/ridhodwi/sako-backend
  tail -f logs/error.log
  ```

**Solusi**:
- Pastikan `PORT=5000` di environment variables
- Pastikan database credentials benar
- Cek `npm install` sudah selesai

---

### **Masalah 2: Database Connection Error**

**Cek**:
```bash
DB_HOST=localhost  # Bukan 127.0.0.1
DB_USER=ridhodwi_sako_db_user  # Dengan prefix username
DB_NAME=ridhodwi_sako_db
```

**Test Koneksi**:
```bash
mysql -u ridhodwi_sako_db_user -p ridhodwi_sako_db
```

---

### **Masalah 3: 502 Bad Gateway**

**Penyebab**: Node.js app tidak running atau port salah

**Solusi**:
1. Restart app di cPanel
2. Cek process:
   ```bash
   ps aux | grep node
   ```
3. Pastikan port 5000 tidak dipakai app lain

---

### **Masalah 4: CORS Error**

Tambah di environment variables:
```bash
CORS_ORIGIN=*
```

Atau specific domain:
```bash
CORS_ORIGIN=https://ridhodwisyahputra.my.id
```

---

### **Masalah 5: File Upload Error**

**Cek permissions**:
```bash
cd /home/ridhodwi/sako-backend
chmod -R 755 public/
chmod -R 777 public/uploads/
```

---

## 📊 Monitoring

### **Cek Status App**:
- cPanel → Setup Node.js App → Cek icon status

### **Cek Logs**:
```bash
# Error logs
tail -f ~/sako-backend/logs/error.log

# Access logs
tail -f ~/logs/access.log
```

### **Cek Resource Usage**:
- cPanel → Server Status
- CPU, Memory, Disk usage

---

## 🔄 Update Backend (Deploy Perubahan)

### **Via File Manager**:
1. Edit file langsung di File Manager
2. Restart Node.js app

### **Via FTP**:
1. Upload file yang berubah
2. Restart Node.js app

### **Via Git** (Recommended):
```bash
cd /home/ridhodwi/sako-backend
git pull origin main
npm install --production
# Restart app via cPanel
```

---

## 🔐 Security Checklist

- ✅ Ganti `JWT_SECRET` dengan string random yang kuat
- ✅ Set `NODE_ENV=production`
- ✅ Gunakan HTTPS (SSL sudah aktif di domain)
- ✅ Jangan commit `.env` ke Git
- ✅ Gunakan strong password untuk database
- ✅ Enable rate limiting di production
- ✅ Backup database berkala

---

## 📞 Support

Jika ada masalah:
1. Cek logs di cPanel
2. Contact support carihosting: https://carihosting.id/support
3. Dokumentasi: https://docs.carihosting.id

---

## ✅ Final Deployment Checklist

### **STEP 1: Database** ✅
- [ ] Database `ridhodwi_sako_db` created
- [ ] User `ridhodwi_sako_db_user` created with strong password
- [ ] User privileges granted (SELECT, INSERT, UPDATE, DELETE)
- [ ] Database tables imported via phpMyAdmin
- [ ] Charset set to `utf8mb4_unicode_ci`
- [ ] Test query berhasil

### **STEP 2: Node.js Application** ✅
- [ ] Application "sako" created via Application Manager
- [ ] Port set to 30000
- [ ] Application type: Node.js
- [ ] Start command: `node server.js`
- [ ] Deployment environment: Production
- [ ] All 22 environment variables added (DB, JWT, Firebase, Supabase, Cloudinary)

### **STEP 3: Upload Code** ✅
- [ ] Deployment package created (prepare-deploy.ps1 atau manual zip)
- [ ] Exclude: node_modules, .git, .env
- [ ] File uploaded ke `/home/ridhodwi/sako-backend`
- [ ] File zip extracted successfully
- [ ] Dependencies installed: `npm install --production`

### **STEP 4: Start Application** ✅
- [ ] Application started via Application Manager
- [ ] Status: "Running" (green icon)
- [ ] No errors in application logs

### **STEP 5: Test API** ✅
- [ ] Browser test: `/sako-backend/api` returns JSON
- [ ] Postman test: Login endpoint returns JWT token
- [ ] All endpoints responding correctly

### **STEP 6: Update Frontend** ✅
- [ ] `ApiConfig.kt` updated with production BASE_URL
- [ ] `usesCleartextTraffic="false"` in AndroidManifest
- [ ] APK built and tested
- [ ] All app features working

### **STEP 7: Monitoring Setup** ✅
- [ ] Application status checked: Running
- [ ] Daily monitoring schedule set
- [ ] Backup strategy planned

---

## 📞 Support & Resources

### **carihosting.id Support**
- Website: https://carihosting.id
- Ticket Support: https://carihosting.id/support
- Live Chat: Available di dashboard cPanel
- Email: support@carihosting.id

### **Documentation**
- cPanel Docs: https://docs.cpanel.net/
- Node.js Docs: https://nodejs.org/docs/
- Express.js Docs: https://expressjs.com/

---

## 🎉 Deployment Complete!

**Backend Production URL**:  
```
https://ridhodwisyahputra.my.id/sako-backend/api
```

**Frontend BASE_URL**:
```kotlin
private const val BASE_URL = "https://ridhodwisyahputra.my.id/sako-backend"
```

**Next Steps**:
1. Monitor application health daily
2. Setup automated database backups
3. Test all features from mobile app
4. Share app to users (Google Play or APK)
5. Collect feedback and iterate

---

**🚀 Selamat! Backend SAKO App berhasil di-deploy ke production!**

---

**Dibuat**: 18 Desember 2024  
**Update Terakhir**: 12 Mei 2025  
**Hosting**: carihosting.id (Shared Hosting)  
**Domain**: ridhodwisyahputra.my.id  
**Backend Framework**: Node.js + Express + MySQL  
**Version**: 1.0.0

