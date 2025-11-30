

# **Laporan Spesifikasi Teknis Komprehensif dan Revisi Arsitektur Sistem Aplikasi SAKO**

## **BAB 1: Pengenalan Aplikasi dan Ekosistem Digital SAKO**

### **1.1 Definisi dan Filosofi SAKO**

Sistem Aplikasi Kebudayaan Online (SAKO) merupakan sebuah platform edukasi berbasis seluler yang dirancang secara spesifik untuk merevitalisasi pemahaman generasi muda terhadap kekayaan budaya Minangkabau. Dalam era digitalisasi yang masif, SAKO hadir bukan sekadar sebagai repositori informasi, melainkan sebagai media interaktif yang menjembatani kesenjangan antara pengetahuan adat tradisional dengan pola konsumsi media modern. Nama "SAKO" sendiri merefleksikan pusaka atau warisan, yang dalam konteks ini diterjemahkan menjadi aset digital yang harus dijaga integritas dan keberlanjutannya.

Secara filosofis, aplikasi ini mengadopsi prinsip "Alam Takambang Jadi Guru", yang diintegrasikan ke dalam antarmuka pengguna (UI) dan pengalaman pengguna (UX). Hal ini terlihat dari pendekatan visual yang menggunakan ornamen rumah gadang, serta penggunaan warna-warna marawa (merah, kuning, hitam) yang dominan pada elemen desain seperti background.png dan sako.png. Tujuan utama dari pengembangan sistem ini adalah menciptakan ekosistem pembelajaran yang imersif, di mana pengguna tidak hanya membaca teks statis, tetapi terlibat dalam eksplorasi visual dan kognitif melalui tiga pilar modul utama.

### **1.2 Analisis Mendalam Tiga Modul Utama**

Arsitektur SAKO dibangun di atas tiga pilar fungsional yang saling terinterkoneksi melalui basis data relasional yang kompleks. Ketiga modul ini dirancang untuk memfasilitasi gaya belajar yang berbeda: visual, kinestetik (melalui peta), dan kognitif (melalui kuis).

#### **1.2.1 Modul Peta Lokasi Budaya (Geo-Cultural Mapping)**

Modul Peta merupakan fitur direktori yang memungkinkan pengguna untuk menelusuri lokasi-lokasi bersejarah dan budaya di Sumatera Barat. Modul ini berfokus pada informasi deskriptif, visual, dan reputasi sosial.

Setiap lokasi disimpan dalam entitas basis data tourist\_place. Sesuai revisi terbaru, tabel ini kini memiliki atribut Rating Agregat (average\_rating) yang dihitung otomatis dari tabel review, memungkinkan aplikasi menampilkan bintang penilaian (misal: 4.5/5) secara instan. Fitur krusial lainnya adalah integrasi QR Code (qr\_code) yang memfasilitasi validasi kunjungan fisik. Ketika pengguna berada di lokasi seperti "Museum Gudang Ransum", mereka memindai kode QR untuk memicu pencatatan di tabel user\_visit. Interaksi sosial diperkaya dengan fitur ulasan (review) dan apresiasi "Like" pada ulasan (review\_like), menciptakan ekosistem komunitas yang hidup.

#### **1.2.2 Modul Kuis Gamifikasi (Cultural Gamification)**

Modul Kuis berfungsi sebagai mesin evaluasi kognitif pengguna dengan sistem progresi bertingkat (tiered progression). Pengguna harus menyelesaikan level tertentu sebelum dapat membuka level berikutnya, mekanisme yang diatur oleh tabel prerequisite\_level dan user\_level\_progress.

Struktur kuis dibagi berdasarkan kategori budaya di tabel quiz\_category. Setiap kategori memiliki serangkaian level (level) yang berisi soal-soal (question). Jawaban pengguna direkam di attempt\_answer dan dikalkulasi untuk memperbarui user\_points serta total\_xp pada tabel users. Prestasi visual diberikan melalui user\_badge.

#### **1.2.3 Modul Video Edukasi (Visual Learning)**

Modul Video menyediakan konten pembelajaran pasif yang dikurasi. Entitas video menyimpan judul, kategori, dan tautan streaming. Fitur interaktif mencakup penandaan favorit yang disimpan dalam tabel favorit\_video, memungkinkan pengguna menyusun perpustakaan pribadi.

### **1.3 Fitur Pendukung Ekosistem**

* **Autentikasi Pengguna:** Fokus pada Login dan Register. Password diamankan dengan hash sebelum token sesi diterbitkan ke tabel users.  
* **Halaman Profil:** Dasbor pribadi yang menampilkan agregasi data dari users (XP), user\_points (Poin), dan user\_badge (Lencana).  
* **Beranda (Home):** Hub pusat yang menyajikan ringkasan aktivitas dan rekomendasi konten berdasarkan progres level terakhir (user\_level\_progress).

---

## **BAB 2: Spesifikasi Teknologi dan Infrastruktur Pengembangan**

### **2.1 Front-End: Android Native dengan Kotlin**

Pengembangan sisi klien menggunakan Android Studio dengan bahasa Kotlin.

* **Arsitektur Folder:** ui/screen (Komponen per modul), data/remote (Retrofit API Service), utils (Wrapper State Loading/Success/Error).  
* **UI Toolkit:** Jetpack Compose untuk antarmuka deklaratif yang reaktif.  
* **Networking:** Retrofit dengan konverter GSON/Moshi untuk menyinkronkan data JSON dari backend dengan Data Class Kotlin.  
* **Layanan Notifikasi (Android):**  
  * **Firebase Cloud Messaging (FCM) Client SDK:** Diimplementasikan untuk men-generate token unik perangkat (FCM Token) dan mengirimnya ke backend saat login, serta menerima pesan notifikasi (Push Notification) dari server.

### **2.2 Back-End: Node.js dengan Express (MVC)**

* **Model:** Menggunakan Sequelize ORM atau raw SQL query untuk memanipulasi 20 tabel database.  
* **Controller:** Logika bisnis terpusat, misal MapController yang menangani logika Review Like dan Auto-Rating Calculation.  
* **Layanan Notifikasi (Server):**  
  * **Firebase Admin SDK:** Digunakan di backend untuk mengirim notifikasi (trigger) ke aplikasi Android menggunakan fcm\_token yang tersimpan di tabel users.  
* **Storage:** Supabase Storage untuk menyimpan aset gambar (image\_url), menjaga database SQL tetap ringan.  
* **Database:** MySQL/MariaDB sebagai Single Source of Truth.  
* **Deployment & Tunneling:**  
  * **Ngrok:** Digunakan untuk mengekspos server backend lokal (localhost) ke internet publik secara aman.

---

## **BAB 3: Bedah Database Relasional (Analisis 20 Tabel)**

Berdasarkan SQL Dump terbaru, penambahan fitur review\_like, serta penambahan kolom fcm\_token pada tabel users sesuai Opsi A.

### **3.1 Data Master (Konten Statis)**

Tabel referensi yang diisi oleh admin/sistem.

| No | Nama Tabel | Fungsi Utama | Keterangan Revisi |
| :---- | :---- | :---- | :---- |
| 1 | quiz\_category | Kategori kuis (Sejarah, Adat). | \- |
| 2 | level | Tingkatan kesulitan kuis. | Parent dari question. |
| 3 | question | Bank soal kuis. | \- |
| 4 | question\_option | Pilihan jawaban (A,B,C,D). | Menyimpan kunci jawaban. |
| 5 | prerequisite\_level | Syarat pembukaan level. | Logika locking level. |
| 6 | tourist\_place | Data lokasi wisata. | Ditambah: average\_rating. |
| 7 | qr\_code | Kode unik scan lokasi. | Relasi ke tourist\_place. |
| 8 | video | Katalog video edukasi. | \- |
| 9 | badge | Katalog lencana prestasi. | \- |

### **3.2 Data Transaksi (Aktivitas User)**

Tabel dinamis yang berisi data hasil interaksi pengguna.

| No | Nama Tabel | Fungsi Utama | Keterangan Revisi |
| :---- | :---- | :---- | :---- |
| 10 | users | Akun pengguna utama. | **Update:** Ada kolom fcm\_token (Text) untuk alamat notifikasi Firebase. PK: users\_id, password\_hash, token. |
| 11 | user\_points | Dompet poin user. | \- |
| 12 | quiz\_attempt | Sesi pengerjaan kuis. | Status in\_progress/submitted. |
| 13 | attempt\_answer | Log jawaban per soal. | \- |
| 14 | user\_level\_progress | Status kelulusan level. | \- |
| 15 | user\_category\_progress | Persentase kategori. | \- |
| 16 | review | Ulasan & Rating User. | Ada: total\_likes. |
| 17 | review\_like | (Baru) Log Like Ulasan. | Mencegah spam like. |
| 18 | user\_visit | Log kunjungan fisik (QR). | Status Enum: visited, not\_visited. |
| 19 | user\_badge | Log perolehan lencana. | \- |
| 20 | favorit\_video | Bookmark video user. | \- |

### **3.4 Implementasi Query Tambahan (Rating Otomatis & Review Like)**

A. Fitur "Like pada Review" (SUDAH ADA)  
Struktur review dengan total\_likes dan tabel review\_like sudah ada di SQL Dump Anda.  
B. Fitur "Rating Otomatis Tempat Wisata" (TUTORIAL)  
Agar halaman DetailMapScreen menampilkan rating tanpa menghitung manual.  
**Langkah 1: Tambahkan Kolom average\_rating**

SQL

ALTER TABLE \`tourist\_place\`  
ADD COLUMN \`average\_rating\` DECIMAL(3,1) DEFAULT 0.0;

**Langkah 2: Buat Trigger Penghitung Otomatis**

SQL

DELIMITER $$  
CREATE TRIGGER \`after\_review\_insert\_update\_rating\`  
AFTER INSERT ON \`review\`  
FOR EACH ROW  
BEGIN  
    UPDATE \`tourist\_place\`  
    SET average\_rating \= (SELECT IFNULL(AVG(rating), 0) FROM review WHERE tourist\_place\_id \= NEW.tourist\_place\_id)  
    WHERE tourist\_place\_id \= NEW.tourist\_place\_id;  
END$$  
DELIMITER ;

### **3.5 Data Dummy (Seeding Data Master)**

Karena map tidak menggunakan geo-location (lat/long), data alamat menjadi sangat penting.

**1\. Insert Tempat Wisata**

SQL

INSERT INTO \`tourist\_place\` (\`tourist\_place\_id\`, \`name\`, \`description\`, \`address\`, \`image\_url\`, \`average\_rating\`) VALUES  
(UUID(), 'Museum Gudang Ransum', 'Museum sejarah tambang.', 'Sawahlunto', 'https://xyz.supabase.co/.../gudang.jpg', 0.0),  
(UUID(), 'Istano Basa Pagaruyung', 'Istana kebesaran Minangkabau.', 'Tanah Datar', 'https://xyz.supabase.co/.../pagaruyung.jpg', 0.0);

**2\. Insert Kategori**

SQL

INSERT INTO \`quiz\_category\` (\`id\`, \`name\`, \`is\_active\`) VALUES (UUID(), 'Sejarah', 1);

---

## **BAB 4: Alur Logika Bisnis dan Interaksi Pengguna (Flow Analysis)**

Bab ini menjelaskan secara rinci bagaimana data mengalir antar layar dan tabel untuk setiap fitur.

### **4.1 Alur Autentikasi (Authentication Flow)**

#### **4.1.1 Fungsional Login & Registrasi**

**1\. Login (Masuk)**

* **Fungsional:** Mengecek tabel users. User memasukkan atribut email dan password di front end. Fungsional ini mengecek kebenaran data tersebut.  
* **Logic:**  
  * Jika benar: Generate Token Auth, simpan ke tabel users (kolom token).  
  * **Update FCM Token:** Backend menerima fcm\_token dari request body (dikirim oleh Android). Backend melakukan query UPDATE users SET fcm\_token \= '...' WHERE users\_id \= '...'. Ini memastikan notifikasi terkirim ke HP yang sedang dipakai.  
  * Arahkan ke halaman Home.  
  * Jika salah: Tampilkan Sticky Bar / Pop up "Password salah atau akun tidak ditemukan" dan arahkan opsi untuk register.

**2\. Register (Daftar)**

* **Fungsional:** Mendaftarkan atau insert data ke tabel users dan inisialisasi poin.  
* **Logic:**  
  * **User input:** email, nama lengkap, password, konfirmasi password.  
  * **Cek Duplikasi:** Cek apakah email sudah ada di tabel users.  
    * Jika ada: Muncul Pop up "Email yang dimasukkan sudah ada dan terdaftar, silahkan login".  
  * **Insert Data:** Jika belum ada, insert ke tabel users.  
  * **Atribut:** users\_id (UUID), full\_name, email, password\_hash (hasil enkripsi), total\_xp (0), status ('active'), user\_image\_url (NULL), created\_at & updated\_at (Waktu Indo), token, fcm\_token (Default NULL atau diisi jika dikirim).  
  * **Inisialisasi Poin:** Otomatis insert ke tabel user\_points dengan total\_points \= 0\.  
  * **Output:** Pop up "Pendaftaran Berhasil".

#### **4.1.2 Fungsional Pendukung (Logout)**

**Logout:** Menghapus sesi token dari penyimpanan lokal HP, menghapus token di tabel users, dan sebaiknya juga mengosongkan fcm\_token (set NULL) agar notifikasi tidak masuk ke perangkat yang sudah logout.

#### **4.1.3 Rekomendasi dan Saran Modul Autentikasi**

* **Auto-Generate Data user\_visit:**  
  * **Saran:** Karena aplikasi tidak memiliki admin panel untuk mengelola relasi user-visit secara manual, sangat disarankan pada saat proses Register sukses, Backend secara otomatis menjalankan looping query untuk mengambil semua tourist\_place\_id yang ada, lalu meng-insert data ke tabel user\_visit dengan status \= 'not\_visited' untuk user baru tersebut. Ini akan mencegah error "Data Kosong" saat user membuka peta pertama kali dan melakukan scan.  
* **Keamanan:** Pastikan password tidak disimpan plain-text, gunakan bcrypt hash.

#### **4.1.4 Final Request dan Response Modul Autentikasi**

**4.1.4.1 Isi Full AuthRequest.kt**

Kotlin

package com.sako.app.data.remote.request  
import com.google.gson.annotations.SerializedName

data class LoginRequest(  
    @SerializedName("email") val email: String,  
    @SerializedName("password") val password: String,  
    @SerializedName("fcm\_token") val fcmToken: String // Tambahan untuk update token saat login  
)

data class RegisterRequest(  
    @SerializedName("full\_name") val fullName: String,  
    @SerializedName("email") val email: String,  
    @SerializedName("password") val password: String  
)

**4.1.4.2 Isi Full AuthResponse.kt**

Kotlin

package com.sako.app.data.remote.response  
import com.google.gson.annotations.SerializedName

data class AuthResponse(  
    val status: String,  
    val message: String,  
    val data: AuthData? \= null  
)

data class AuthData(  
    @SerializedName("users\_id") val usersId: String,  
    @SerializedName("full\_name") val fullName: String,  
    @SerializedName("email") val email: String,  
    @SerializedName("token") val token: String,  
    @SerializedName("user\_image\_url") val userImageUrl: String?  
)

### **4.2 Alur Modul Peta dan Ulasan (The Exploration Loop)**

#### **4.2.1 Fungsional 1: Menampilkan List Lokasi Budaya & Status Kunjungan**

Fungsi ini merender MapScreen, menampilkan daftar lokasi dan indikator apakah user yang sedang login sudah pernah berkunjung.

* **Screen:** MapScreen.kt  
* **Aktor:** User (Logged In)  
* **Operasi CRUD:** READ  
* **Tabel Terkait:** tourist\_place, user\_visit, users.  
* **Detail Logika Backend:**  
  * **Identifikasi User:** Backend mengekstrak users\_id dari token JWT.  
  * **Query Data:** Backend mengambil daftar tourist\_place dan melakukan Left Join ke user\_visit.  
  * **Logika Penentuan Status:** Sistem membaca kolom status (ENUM) pada tabel user\_visit.  
    * Jika data ditemukan DAN nilai status adalah 'visited', maka is\_visited \= true.  
    * Jika data tidak ditemukan, ATAU nilai status adalah 'not\_visited', maka is\_visited \= false.  
* **Spesifikasi Integrasi Frontend:**  
  * **Endpoint:** GET /api/map/places  
  * **Response JSON:** \[ { "id": "...", "name": "...", "is\_visited": true } \]

#### **4.2.2 Fungsional 2: Menampilkan Detail Lokasi & Validasi Scan QR**

Fungsi ini menangani DetailMapScreen.

* **Screen:** DetailMapScreen.kt  
* **Operasi CRUD:** READ  
* **Tabel Terkait:** tourist\_place, user\_visit, review.  
* **Detail Logika Backend:**  
  * **Fetch Data:** Ambil detail lokasi, image\_url, dan average\_rating.  
  * **Validasi Tombol Scan QR:** Cek tabel user\_visit untuk users\_id dan tourist\_place\_id terkait.  
    * Jika status \== 'not\_visited' (atau null) \-\> Tombol Scan ENABLED/MERAH.  
    * Jika status \== 'visited' \-\> Tombol Scan DISABLED/ABU-ABU.  
  * **List Ulasan:** Mengambil data review terkait.  
* **Spesifikasi Integrasi Frontend:**  
  * **Endpoint:** GET /api/map/places/{id}  
  * **Response JSON:** { "data": {..., "is\_scan\_enabled": true } }

#### **4.2.3 Fungsional 3: Menampilkan List Ulasan (User & Publik)**

* **Screen:** DetailMapScreen.kt  
* **CRUD:** READ  
* **Tabel:** review, users, review\_like.  
* **Detail Logika Backend:**  
  * **Segregasi Data:** Backend memisahkan query menjadi dua: "Ulasan Kamu" (where user\_id \= login user) dan "Ulasan Lainnya".  
  * **Validasi Ulasan Kamu:** Jika user belum pernah mengulas, kirim respon null/false agar UI menampilkan tombol kuning "Berikan Ulasanmu".  
  * **Preview & Lazy Loading:** Untuk "Ulasan Lainnya", ambil 5 ulasan teratas (berdasarkan total\_likes DESC, lalu created\_at DESC). Sisanya dimuat via endpoint terpisah.  
  * **Cek Like:** Cek di tabel review\_like, apakah user login sudah me-like ulasan tersebut.  
* **Integrasi Frontend:**  
  * **Endpoint:** GET /api/map/places/{id}/reviews

#### **4.2.4 Fungsional 4: Memberikan dan Menghapus Like pada Review**

* **Screen:** DetailMapScreen.kt (Ikon Hati di Card Ulasan)  
* **CRUD:** CREATE & DELETE  
* **Tabel:** review, review\_like.  
* **Logika Backend:**  
  * Cek tabel review\_like.  
  * **Jika Belum Like:** INSERT data baru. Trigger DB update total\_likes (+1).  
  * **Jika Sudah Like:** DELETE data tersebut. Trigger DB update total\_likes (-1).  
* **Integrasi Frontend:**  
  * **Endpoint:** POST /api/reviews/{id}/toggle-like

#### **4.2.5 Fungsional 5: Mengelola Ulasan (Tambah, Edit, Hapus)**

Fungsi ini mengelola penuh siklus hidup ulasan pengguna.

* **Screen:** DetailMapScreen, TambahUlasanScreen, EditUlasanScreen.  
* **CRUD:** CREATE, UPDATE, DELETE.  
* **Tabel:** review, users, tourist\_place.  
* **Detail Logika Backend:**  
  * **Tambah Ulasan:**  
    * Cek apakah users\_id sudah punya review\_id di tempat ini.  
    * Jika Belum: INSERT ke review (rating, review\_text, created\_at Waktu Indo).  
    * Trigger DB update average\_rating.  
    * **Notifikasi:** Backend melakukan query SELECT fcm\_token dari tabel users berdasarkan users\_id. Kirim notifikasi "Anda berhasil menambahkan ulasan..." menggunakan Firebase Admin SDK ke token tersebut. (Metode Fire-and-Forget, tidak disimpan di database).  
  * **Edit Ulasan:**  
    * Validasi users\_id pemilik.  
    * Load data lama ke UI.  
    * User edit \-\> UPDATE tabel review.  
    * UI: Pop-up "Kamu berhasil mengubah ulasan ini\!".  
  * **Hapus Ulasan:**  
    * User klik Hapus \-\> Konfirmasi Pop-up.  
    * DELETE dari tabel review.  
    * UI: Pop-up "Kamu berhasil menghapus ulasan ini\!".  
* **Integrasi Frontend:**  
  * POST /api/map/places/{id}/review  
  * PUT /api/reviews/{id}  
  * DELETE /api/reviews/{id}

#### **4.2.6 Fungsional 6: Scan QR & Update Kunjungan**

* **Screen:** ScanMapScreen.kt.  
* **CRUD:** UPDATE (Status).  
* **Tabel:** qr\_code, user\_visit.  
* **Detail Logika Backend:**  
  * **Input:** User scan QR (code\_value).  
  * **Validasi:** Cek tabel qr\_code apakah kode valid untuk tourist\_place\_id tersebut.  
  * **Update Kunjungan:**  
    * Cari baris di user\_visit milik users\_id dan tourist\_place\_id.  
    * Lakukan UPDATE user\_visit SET status \= 'visited', visited\_at \= NOW().  
    * *Catatan: Ini asumsi data not\_visited sudah ada (lihat saran 4.2.8).*  
  * **Respon:** Kirim status sukses dan tanggal kunjungan.  
* **Integrasi Frontend:**  
  * **Endpoint:** POST /api/scan

#### **4.2.7 Final Request dan Response Modul Map**

**4.2.7.1 Isi Full MapRequest.kt**

Kotlin

package com.sako.app.data.remote.request  
import com.google.gson.annotations.SerializedName

data class ReviewRequest(  
    @SerializedName("rating") val rating: Int,  
    @SerializedName("review\_text") val reviewText: String  
)

data class ScanQrRequest(  
    @SerializedName("code\_value") val codeValue: String,  
    @SerializedName("tourist\_place\_id") val touristPlaceId: String  
)

**4.2.7.2 Isi Full MapResponse.kt**

Kotlin

package com.sako.app.data.remote.response  
import com.google.gson.annotations.SerializedName

data class MapItem(  
    @SerializedName("tourist\_place\_id") val touristPlaceId: String,  
    val name: String,  
    val description: String,  
    val address: String,  
    @SerializedName("image\_url") val imageUrl: String,  
    @SerializedName("is\_visited") val isVisited: Boolean  
)

data class MapDetailData(  
    @SerializedName("tourist\_place\_id") val touristPlaceId: String,  
    val name: String,  
    val address: String,  
    @SerializedName("image\_url") val imageUrl: String,  
    @SerializedName("average\_rating") val averageRating: Double,  
    @SerializedName("is\_scan\_enabled") val isScanEnabled: Boolean,  
    @SerializedName("user\_review") val userReview: ReviewItem?,  
    @SerializedName("other\_reviews") val otherReviews: List\<ReviewItem\>  
)

data class ReviewItem(  
    @SerializedName("review\_id") val reviewId: String,  
    @SerializedName("user\_full\_name") val userFullName: String,  
    val rating: Int,  
    @SerializedName("review\_text") val reviewText: String,  
    @SerializedName("total\_likes") val totalLikes: Int,  
    @SerializedName("is\_liked\_by\_me") val isLikedByMe: Boolean  
)

#### **4.2.8 Saran Keseluruhan & Rekomendasi Teknis**

* **Generate Data user\_visit (PENTING):**  
  * **Jangan Hardcode data user\!**  
  * **Saran:** Buatlah Trigger Database atau Logic Backend saat User Register. Sistem harus otomatis meng-insert baris ke tabel user\_visit untuk **semua** tourist\_place yang ada dengan status awal 'not\_visited'. Ini memastikan saat user membuka peta, datanya ada dan statusnya benar.  
* **Supabase Image URL:**  
  * **Saran:** Pastikan URL gambar yang disimpan di database adalah **Public URL** dari Supabase. Frontend Android cukup menggunakan library gambar (seperti Coil) untuk memuat URL tersebut secara langsung tanpa perlu autentikasi header tambahan.  
* **Format Waktu:**  
  * Pastikan backend mengirim format waktu (created\_at) yang sudah dikonversi ke Waktu Indonesia atau format ISO 8601 yang bisa di-parse mudah oleh Android.

---

## **BAB 5: Spesifikasi Teknis Backend (API Endpoint)**

### **5.1 Struktur Folder MVC (Tree Map)**

Berikut adalah struktur folder backend Node.js yang disusun ulang untuk mencerminkan struktur akhir proyek Anda, dengan pemisahan logika alat bantu (supabase/fotoController.js) di dalam folder controllers.

HACKATHON-BACKEND/  
├── node\_modules/  
├── src/  
│   ├── config/  
│   │   ├── database.js           \# Konfigurasi koneksi MySQL  
│   │   ├── firebase.js           \# Konfigurasi Firebase Admin SDK  
│   │   └── supabase.js           \# Konfigurasi Supabase Client  
│   ├── controllers/  
│   │   ├── supabase/  
│   │   │   └── fotoController.js \# Handle Upload Gambar ke Supabase  
│   │   ├── authController.js     \# Logika Login & Register  
│   │   ├── badgeController.js    \# Logika Lencana & Prestasi  
│   │   ├── categoryController.js \# Logika Kategori Kuis  
│   │   ├── mapController.js      \# Logika Peta, Review, Scan QR  
│   │   ├── profileController.js  \# Logika Profil User  
│   │   ├── quizController.js     \# Logika Soal & Attempt Kuis  
│   │   └── videoController.js    \# Logika Video & Favorit  
│   ├── middleware/  
│   │   ├── auth.js               \# Validasi Token JWT  
│   │   ├── errorHandler.js       \# Global Error Handling  
│   │   └── upload.js             \# Middleware Multer (jika diperlukan)  
│   ├── models/  
│   │   └── mapModel.js           \# Skema Tabel (dan model lainnya)  
│   ├── routes/  
│   │   ├── authRoutes.js  
│   │   ├── badgeRoutes.js  
│   │   ├── categoryroutes.js  
│   │   ├── mapRoutes.js  
│   │   ├── profileRoutes.js  
│   │   ├── quizRoutes.js  
│   │   └── videoRoutes.js  
│   ├── utils/  
│   │   ├── customIdGenerator.js  \# Helper ID unik (U001, RVW001)  
│   │   └── responseHelper.js     \# Standarisasi JSON Response  
│   └── app.js                    \# Konfigurasi Aplikasi Express  
├──.env  
├──.gitignore  
├── package-lock.json  
├── package.json  
├── sako.sql  
└── server.js                     \# Entry Point Server

### **5.2 API Endpoints Kunci**

Endpoint berikut mencerminkan struktur folder baru.

| Modul | Method | Endpoint | Fungsi & Logika Penting |
| :---- | :---- | :---- | :---- |
| **Auth** | POST | /api/auth/register | Mendaftarkan user. **Logic:** Menggunakan customIdGenerator untuk membuat users\_id (misal: U001). Setelah sukses, sistem **otomatis** meng-insert data not\_visited ke tabel user\_visit untuk 5 lokasi wisata agar peta siap dipakai. |
| **Auth** | POST | /api/auth/login | Login user. **Logic:** Menerima fcm\_token dari Android dan meng-update tabel users. Ini memastikan notifikasi masuk ke device yang aktif. |
| **Map** | GET | /api/map/places | Mengambil list wisata. Melakukan join dengan user\_visit untuk status is\_visited. |
| **Map** | POST | /api/map/review | User mengirim ulasan. **Logic:** Trigger DB update rating. Backend membaca fcm\_token user dan mengirim notifikasi "Ulasan Berhasil" (Fire-and-Forget). |
| **Supabase** | POST | /api/foto/upload | Upload gambar. **Logic:** fotoController (di folder supabase) meng-upload file ke Supabase Storage dan mengembalikan URL publik. |
| **Kuis** | POST | /api/kuis/attempt | Submit jawaban kuis. Menghitung skor dan update XP user. |

### **5.3 Rekomendasi Isi File Utils**

Folder utils/ memuat dua file penting untuk standarisasi ID dan format respon API.

File 1: src/utils/customIdGenerator.js  
Digunakan agar ID di database urut dan mudah dibaca (U001, U002), bukan UUID acak panjang.

JavaScript

/\*\*  
 \* Men-generate ID Custom berurutan (Contoh: U001, RVW005)  
 \*/  
const generateCustomId \= async (model, prefix, idField, padding \= 3) \=\> {  
    // Cari data terakhir berdasarkan ID (descending)  
    const lastRecord \= await model.findOne({  
        order:\],  
        attributes: \[idField\]  
    });

    let nextNumber \= 1;  
    if (lastRecord) {  
        const lastId \= lastRecord\[idField\]; // Misal: "U005"  
        const numberPart \= lastId.replace(prefix, ""); // "005"  
        const lastNumber \= parseInt(numberPart, 10); // 5  
          
        if (\!isNaN(lastNumber)) {  
            nextNumber \= lastNumber \+ 1;  
        }  
    }

    // Format angka (misal: 6 \-\> "006")  
    const paddedNumber \= String(nextNumber).padStart(padding, '0');  
    return \`${prefix}${paddedNumber}\`;  
};

module.exports \= { generateCustomId };

File 2: src/utils/responseHelper.js  
Wrapper standar agar frontend Android selalu menerima struktur JSON yang konsisten.

JavaScript

exports.successResponse \= (res, data, message \= "Success") \=\> {  
  return res.status(200).json({  
    status: "success",  
    message: message,  
    data: data  
  });  
};

exports.errorResponse \= (res, message \= "Internal Server Error", code \= 500) \=\> {  
  return res.status(code).json({  
    status: "error",  
    message: message,  
    data: null  
  });  
};

### **5.4 Setup Konfigurasi (Config Files)**

Penjelasan konfigurasi di folder config/ untuk menghubungkan aplikasi dengan layanan eksternal.

1. src/config/database.js (MySQL)  
   Menggunakan library sequelize atau mysql2. Memuat kredensial (host, user, password, database name) dari file .env.  
2. src/config/firebase.js (FCM)  
   Menginisialisasi firebase-admin menggunakan file serviceAccountKey.json. File ini diekspor untuk digunakan oleh authController (notifikasi register) dan mapController (notifikasi ulasan).  
3. src/config/supabase.js (Storage)  
   Menggunakan @supabase/supabase-js. Mengambil SUPABASE\_URL dan SUPABASE\_KEY dari environment variables untuk mengizinkan fotoController mengunggah gambar.

---

## **BAB 6: Implementasi Data Dummy (Data Seeding)**

Bab ini menyediakan kumpulan perintah SQL (*Query*) untuk mengisi data awal (seeding) pada tabel-tabel master yang berkaitan dengan modul Peta. Data ini menggunakan format ID kustom (TP001, QR001) agar lebih mudah dibaca dan dikelola saat pengujian tugas.

### **6.1 Skenario Data Awal**

Kita akan memasukkan data untuk 4 destinasi wisata ikonik di Sumatera Barat dengan ID yang berurutan.

| ID Tempat | Nama Lokasi | ID QR Code | Kode QR (Untuk Scan) |
| :---- | :---- | :---- | :---- |
| **TP001** | Jam Gadang | **QR001** | SAKO-TP001-BKT |
| **TP002** | Museum Gudang Ransum | **QR002** | SAKO-TP002-SWL |
| **TP003** | Pantai Air Manis | **QR003** | SAKO-TP003-PDG |
| **TP004** | Pantai Carocok | **QR004** | SAKO-TP004-PSS |

### **6.2 Script SQL Seeding**

Silakan salin dan jalankan query berikut di tab **SQL** pada **phpMyAdmin**.

**Catatan:** Karena kolom ID bertipe CHAR(36), penggunaan string pendek seperti 'TP001' diperbolehkan dan akan tersimpan dengan baik.

SQL

\-- Hapus data lama jika ada (Opsional, untuk reset)  
DELETE FROM \`qr\_code\`;  
DELETE FROM \`tourist\_place\`;

\-- 1\. Insert Data ke Tabel 'tourist\_place'  
\-- ID dibuat Manual: TP001 \- TP004  
INSERT INTO \`tourist\_place\`   
(\`tourist\_place\_id\`, \`name\`, \`description\`, \`address\`, \`image\_url\`, \`is\_active\`, \`created\_at\`, \`updated\_at\`, \`average\_rating\`)   
VALUES   
(  
    'TP001',   
    'Jam Gadang',   
    'Jam Gadang adalah ikon pariwisata Kota Bukittinggi yang menjulang setinggi 26 meter di jantung kota. Menara jam ini memiliki keunikan pada angka empat romawi yang ditulis IIII dan atap bagonjong yang mencerminkan arsitektur Minangkabau. Dibangun pada masa kolonial Belanda, tempat ini menawarkan pemandangan kota yang indah dan udara sejuk khas perbukitan.',   
    'Jl. Raya Bukittinggi \- Payakumbuh, Benteng Ps. Atas, Bukittinggi',   
    'https://xyz.supabase.co/storage/v1/object/public/sako-assets/jam\_gadang.jpg',   
    1, NOW(), NOW(), 0.0  
),  
(  
    'TP002',   
    'Museum Gudang Ransum',   
    'Terletak di Sawahlunto, museum ini merupakan bekas dapur umum yang dibangun pada tahun 1918 untuk pekerja tambang batubara. Koleksinya meliputi periuk dan kuali raksasa yang menjadi saksi bisu sejarah pertambangan "Orang Rantai" di era kolonial. Wisatawan dapat mempelajari sejarah kuliner massal dan teknologi uap yang digunakan pada masa lampau.',   
    'Jl. Abdul Rahman Hakim, Air Dingin, Sawahlunto',   
    'https://xyz.supabase.co/storage/v1/object/public/sako-assets/gudang\_ransum.jpg',   
    1, NOW(), NOW(), 0.0  
),  
(  
    'TP003',   
    'Pantai Air Manis',   
    'Pantai ini terkenal di seluruh nusantara sebagai lokasi legenda Malin Kundang si anak durhaka. Pengunjung dapat melihat formasi batu yang menyerupai pecahan kapal dan sosok manusia yang sedang bersujud memohon ampun di tepi pantai. Selain wisata sejarah, pantai ini menawarkan pasir cokelat yang luas dan pemandangan Gunung Padang yang memukau.',   
    'Jl. Malin Kundang, Air Manis, Padang Selatan, Kota Padang',   
    'https://xyz.supabase.co/storage/v1/object/public/sako-assets/air\_manis.jpg',   
    1, NOW(), NOW(), 0.0  
),  
(  
    'TP004',   
    'Pantai Carocok',   
    'Primadona wisata di Painan, Pesisir Selatan ini menawarkan keindahan air laut yang jernih dan jembatan apung yang ikonik. Terhubung dengan Pulau Batu Kereta, kawasan ini menjadi spot favorit untuk menikmati matahari terbenam dan bermain wahana air. Suasana pantai yang tenang menjadikannya lokasi yang sempurna untuk rekreasi keluarga.',   
    'Jl. Pantai Carocok, Painan, Pesisir Selatan',   
    'https://xyz.supabase.co/storage/v1/object/public/sako-assets/carocok.jpg',   
    1, NOW(), NOW(), 0.0  
);

\-- 2\. Insert Data ke Tabel 'qr\_code'  
\-- ID dibuat Manual: QR001 \- QR004, dihubungkan ke TP001 \- TP004  
INSERT INTO \`qr\_code\`   
(\`qr\_code\_id\`, \`tourist\_place\_id\`, \`code\_value\`, \`is\_active\`, \`created\_at\`, \`updated\_at\`)   
VALUES   
('QR001', 'TP001', 'SAKO-TP001-BKT', 1, NOW(), NOW()),  
('QR002', 'TP002', 'SAKO-TP002-SWL', 1, NOW(), NOW()),  
('QR003', 'TP003', 'SAKO-TP003-PDG', 1, NOW(), NOW()),  
('QR004', 'TP004', 'SAKO-TP004-PSS', 1, NOW(), NOW());

### **6.3 Verifikasi Data**

1. **Cek Tabel tourist\_place**: Pastikan ID-nya adalah TP001, TP002, dst.  
2. **Cek Tabel qr\_code**: Pastikan kolom tourist\_place\_id berisi TP001, TP002, dst, yang sesuai dengan data tempat wisata.  
3. **Pengujian:** Saat membuat QR Code generator untuk dites di HP, gunakan text seperti SAKO-TP001-BKT.

---

## **BAB 7: Implementasi Teknis Pemindaian QR Code dan Verifikasi Kunjungan (Fungsional 6\)**

### **7.1 Pendahuluan: Menjembatani Kehadiran Fisik dan Jejak Digital**

Dalam ekosistem Sistem Aplikasi Kebudayaan Online (SAKO), Fungsional 6 (Scan QR & Update Kunjungan) memegang peranan yang sangat fundamental. Fitur ini bukan sekadar mekanisme pencatatan data semata, melainkan merupakan jembatan validasi utama yang mengubah kehadiran fisik pengguna di lokasi budaya menjadi progres digital yang terukur dalam sistem gamifikasi aplikasi. Berdasarkan spesifikasi yang telah ditetapkan pada Bab 4 (4.2.6), tujuan utama dari bab ini adalah menguraikan secara komprehensif bagaimana arsitektur teknis dibangun untuk menangani siklus hidup data dari sebuah string identitas unik (code\_value) hingga menjadi aset visual yang dapat dipindai, serta bagaimana aplikasi menerjemahkan kembali visual tersebut menjadi transaksi basis data yang valid.

Kompleksitas implementasi ini terletak pada integrasi tiga domain yang berbeda: optik fisik (kualitas cetak dan kondisi pencahayaan QR Code), pemrosesan citra digital di sisi klien (Android Jetpack Compose), dan integritas transaksional di sisi server (Backend API). Tantangan utama yang dihadapi adalah memastikan bahwa proses pemindaian berjalan instan dan akurat meskipun pengguna berada di lokasi wisata yang mungkin memiliki pencahayaan minim atau kode QR yang sudah mengalami degradasi fisik akibat cuaca. Oleh karena itu, pemilihan teknologi pemindaian dan strategi pembuatan kode QR menjadi keputusan arsitektural yang krusial.

Implementasi ini akan berpusat pada layar ScanMapScreen.kt, yang bertindak sebagai antarmuka pemindai. Di balik layar, logika backend akan menangani operasi CRUD bertipe UPDATE pada tabel user\_visit, memastikan bahwa status kunjungan pengguna berubah dari asumsi awal 'not\_visited' menjadi 'visited' secara *real-time*. Analisis mendalam dalam bab ini akan memandu pengembang melalui setiap langkah teknis, mulai dari pemilihan *library* yang tepat hingga penulisan kode yang aman dan efisien.

### **7.2 Transformasi Data: Dari code\_value Menjadi Aset Optik**

Pertanyaan mendasar dalam implementasi ini adalah: "Bagaimana caranya supaya code\_value itu jadi gambar qr\_code dan nanti bisa di scan?" Ini adalah masalah representasi data. code\_value yang tersimpan dalam tabel qr\_code hanyalah serangkaian karakter alfanumerik (misalnya UUID atau string unik). Agar dapat dipindai oleh kamera perangkat seluler, data ini harus dikonversi menjadi simbol matriks dua dimensi yang mematuhi standar ISO/IEC 18004\.

#### **7.2.1 Standarisasi Generasi Kode dan Tingkat Koreksi Kesalahan**

Dalam konteks aplikasi pariwisata seperti SAKO, kode QR akan ditempatkan di lingkungan fisik yang tidak terduga—terpapar sinar matahari, hujan, atau goresan fisik. Oleh karena itu, sekadar menghasilkan kode QR standar tidaklah cukup. Kita harus menerapkan strategi *Error Correction Level* (ECL) yang agresif.

Standar QR Code menyediakan empat tingkat koreksi kesalahan:

* **Level L (Low):** Memulihkan sekitar 7% data.  
* **Level M (Medium):** Memulihkan sekitar 15% data.  
* **Level Q (Quartile):** Memulihkan sekitar 25% data.  
* **Level H (High):** Memulihkan sekitar 30% data.

Rekomendasi Implementasi:  
Untuk SAKO, sangat disarankan untuk menggunakan Level H (High) saat men-generate gambar QR Code dari code\_value. Alasannya adalah ketahanan fisik. Jika kode QR di Museum Gudang Ransum tergores atau sebagian tertutup oleh stiker vandalisme, Level H memungkinkan algoritma pemindai (scanner) untuk tetap mendekode code\_value dengan benar selama kerusakan tidak melebihi 30% dari luas permukaan kode. Meskipun Level H membuat matriks kode menjadi lebih padat dan kompleks, kamera smartphone modern dengan resolusi tinggi mampu menanganinya dengan mudah.

#### **7.2.2 Protokol Pembuatan Aset QR Code (Actionable Guide)**

Karena tabel qr\_code menyimpan code\_value yang bersifat statis untuk setiap tourist\_place\_id, Anda tidak perlu membangun mesin generator QR dinamis di backend. Pendekatan yang paling efisien adalah *pre-generation* (pembuatan di awal). Berikut adalah langkah teknis yang harus dilakukan pengembang untuk mengubah code\_value menjadi gambar:

1. **Ekstraksi Data:** Ambil semua code\_value dari database qr\_code.  
2. **Pemilihan Generator:** Gunakan layanan generator QR Code yang mendukung kustomisasi visual dan output resolusi tinggi (vektor atau PNG kualitas cetak). Berdasarkan analisis pasar alat digital, platform seperti **QRCode Monkey** atau **Adobe Express** direkomendasikan karena menyediakan kontrol penuh atas desain tanpa biaya lisensi yang membebani.  
3. **Konfigurasi Desain (Penting untuk Scannability):**  
   * **Kontras:** Pastikan *foreground* (warna kode) gelap (hitam/merah tua) dan *background* terang (putih). Jangan membalik warna ini karena banyak algoritma deteksi standar, termasuk versi lama ZXing, kesulitan membaca kode "negatif" (putih di atas hitam).  
   * **Quiet Zone:** Pastikan ada margin kosong (putih) di sekeliling kode setidaknya setebal 4 modul (titik). Tanpa *quiet zone* ini, algoritma pemindai tidak dapat mendeteksi batas kode, terutama jika kode ditempatkan pada latar belakang yang ramai secara visual.  
   * **Format Output:** Unduh dalam format .SVG atau .EPS untuk keperluan percetakan fisik agar tidak pecah (pixelated) saat dicetak dalam ukuran besar, dan .PNG untuk keperluan pengujian digital.

Dengan mengikuti protokol ini, Anda memastikan bahwa aset fisik yang ditempel di lokasi wisata memiliki probabilitas keberhasilan pindai (scan rate) yang mendekati 100%, meminimalkan frustrasi pengguna di lapangan.

### **7.3 Strategi Arsitektur Pemindaian: Pemilihan *Scanning Engine***

Langkah selanjutnya adalah menentukan "otak" dari fitur pemindaian di aplikasi Android. Dalam ekosistem pengembangan Android modern, terdapat dua kandidat utama: **ZXing (Zebra Crossing)** dan **Google ML Kit Vision API**. Pemilihan di antara keduanya akan menentukan performa aplikasi, ukuran file APK, dan kepuasan pengguna.

#### **7.3.1 Analisis Komparatif: Google ML Kit vs. ZXing**

Berdasarkan tinjauan literatur teknis terkini, terdapat perbedaan performa yang signifikan antara kedua pustaka ini, terutama dalam konteks aplikasi yang dibangun menggunakan Jetpack Compose.

| Parameter Evaluasi | Google ML Kit (Vision API) | ZXing (Zebra Crossing) | Implikasi pada Aplikasi SAKO |
| :---- | :---- | :---- | :---- |
| **Status Pemeliharaan** | **Aktif & Didukung Penuh.** Mendapat pembaruan rutin dari Google dan integrasi mendalam dengan Android OS. | **Maintenance Mode.** Hanya menerima patch keamanan; tidak ada pengembangan fitur baru secara aktif. | Menggunakan ML Kit menjamin kompatibilitas jangka panjang dengan versi Android terbaru. |
| **Performa Cahaya Minim** | **Superior.** Menggunakan model *Machine Learning* yang dilatih untuk mengenali pola dalam kondisi *low-light* dan *noise* tinggi. | **Rentan.** Sering gagal memindai dalam kondisi pencahayaan buruk atau bayangan. | Kritis untuk lokasi wisata SAKO yang mungkin berupa museum dalam ruangan atau situs luar ruangan saat sore hari. |
| **Kecepatan Deteksi** | **Sangat Cepat.** Memanfaatkan akselerasi perangkat keras (hardware acceleration) untuk pemrosesan gambar real-time. | **Variabel/Lambat.** Implementasi Java murni seringkali lebih lambat dan membebani CPU utama. | ML Kit memberikan pengalaman pengguna (UX) yang lebih responsif dan instan. |
| **Orientasi Pemindaian** | **Omnidirectional.** Dapat memindai kode dari sudut manapun tanpa orientasi tegak lurus yang ketat. | **Terbatas.** Seringkali memerlukan orientasi spesifik untuk deteksi optimal. | Memudahkan turis memindai sambil berjalan atau dari sudut yang sulit. |
| **Ukuran Aplikasi** | **Efisien (Unbundled).** Model dapat diunduh via Google Play Services, menjaga ukuran APK tetap kecil. | **Bundled.** Kode sumber pustaka harus disertakan dalam APK, menambah ukuran aplikasi. | ML Kit lebih ramah terhadap penyimpanan perangkat pengguna. |

Keputusan Arsitektural:  
Berdasarkan analisis di atas, laporan ini merekomendasikan penggunaan Google ML Kit yang diintegrasikan dengan CameraX. Pendekatan ini dianggap sebagai standar industri modern, menggantikan ZXing yang mulai ditinggalkan karena masalah akurasi pembacaan dan kurangnya pembaruan. ML Kit menawarkan keandalan yang dibutuhkan untuk memvalidasi kunjungan pengguna secara instan tanpa hambatan teknis yang berarti.

### **7.4 Implementasi Teknis Frontend: ScanMapScreen.kt**

Implementasi pada sisi klien (Android) melibatkan orkestrasi antara UI deklaratif (Jetpack Compose) dan API kamera imperatif (CameraX). Karena Jetpack Compose belum memiliki komponen kamera bawaan yang matang sepenuhnya, kita perlu menggunakan pola AndroidView untuk menjembatani komponen PreviewView dari CameraX ke dalam hierarki UI Compose.

#### **7.4.1 Konfigurasi Dependensi (Gradle)**

Langkah pertama adalah menyuntikkan dependensi yang diperlukan ke dalam modul aplikasi (build.gradle). Kita memerlukan artefak CameraX untuk siklus hidup kamera dan artefak ML Kit untuk pemindaian barcode.

Kotlin

// build.gradle.kts (Module: app)  
dependencies {  
    // Inti CameraX & Lifecycle  
    val camerax\_version \= "1.3.1" // Pastikan menggunakan versi stabil terbaru  
    implementation("androidx.camera:camera-camera2:$camerax\_version")  
    implementation("androidx.camera:camera-lifecycle:$camerax\_version")  
    implementation("androidx.camera:camera-view:$camerax\_version")  
      
    // Google ML Kit Barcode Scanning  
    implementation("com.google.mlkit:barcode-scanning:17.2.0")  
      
    // Ikon Material untuk UI Overlay  
    implementation("androidx.compose.material:material-icons-extended:1.6.0")  
      
    // Guava (sering dibutuhkan untuk ListenableFuture pada CameraX)  
    implementation("com.google.guava:guava:31.1-android")  
}

#### **7.4.2 Mesin Analisis Citra (ImageAnalysis.Analyzer)**

Inti dari logika pemindaian bukanlah pada tampilan kamera (preview), melainkan pada analisis frame gambar di latar belakang. Kita perlu membuat kelas khusus, misalnya QrCodeAnalyzer, yang mengimplementasikan antarmuka ImageAnalysis.Analyzer. Kelas ini bertugas mengonversi aliran data mentah dari kamera (ImageProxy) menjadi format yang dimengerti oleh ML Kit (InputImage), lalu mengekstraksi string code\_value jika QR terdeteksi.

Sangat penting untuk menutup imageProxy (imageProxy.close()) setelah setiap pemrosesan. Kegagalan melakukan hal ini akan menyebabkan aliran kamera macet (freeze) karena buffer memori kamera penuh dan tidak dapat menerima frame baru.

Kotlin

// QrCodeAnalyzer.kt  
import android.annotation.SuppressLint  
import androidx.camera.core.ImageAnalysis  
import androidx.camera.core.ImageProxy  
import com.google.mlkit.vision.barcode.BarcodeScanning  
import com.google.mlkit.vision.barcode.common.Barcode  
import com.google.mlkit.vision.common.InputImage

class QrCodeAnalyzer(  
    private val onQrCodeScanned: (String) \-\> Unit  
) : ImageAnalysis.Analyzer {

    // Inisialisasi klien pemindai ML Kit  
    private val scanner \= BarcodeScanning.getClient()

    @SuppressLint("UnsafeOptInUsageError")  
    override fun analyze(imageProxy: ImageProxy) {  
        val mediaImage \= imageProxy.image  
        if (mediaImage\!= null) {  
            // Konversi ImageProxy ke InputImage dengan rotasi yang benar  
            val image \= InputImage.fromMediaImage(  
                mediaImage,   
                imageProxy.imageInfo.rotationDegrees  
            )

            // Proses gambar dengan ML Kit  
            scanner.process(image)  
             .addOnSuccessListener { barcodes \-\>  
                    // Iterasi hasil deteksi  
                    for (barcode in barcodes) {  
                        // Pastikan hanya memproses QR Code, bukan barcode produk (EAN/UPC)  
                        if (barcode.format \== Barcode.FORMAT\_QR\_CODE) {  
                            barcode.rawValue?.let { codeValue \-\>  
                                // Callback ke UI dengan nilai kode  
                                onQrCodeScanned(codeValue)  
                            }  
                        }  
                    }  
                }  
             .addOnFailureListener {  
                    // Log error jika diperlukan, tapi jangan crash aplikasi  
                }  
             .addOnCompleteListener {  
                    // SANGAT PENTING: Tutup proxy untuk memproses frame berikutnya  
                    imageProxy.close()  
                }  
        } else {  
            imageProxy.close()  
        }  
    }  
}

#### **7.4.3 Konstruksi UI ScanMapScreen.kt dengan AndroidView**

Layar ini menggabungkan logika permintaan izin kamera, inisialisasi ProcessCameraProvider, dan pengikatan *Use Case* (Preview dan Analyzer) ke siklus hidup aktivitas.

Poin penting dalam implementasi ini:

1. **Izin Kamera:** Menggunakan rememberLauncherForActivityResult untuk meminta izin secara dinamis.  
2. **Debouncing:** Mekanisme untuk mencegah pemanggilan API berulang-ulang dalam hitungan milidetik saat kamera terus-menerus mendeteksi QR yang sama.  
3. **Executor:** Analisis gambar harus berjalan di *thread* latar belakang (menggunakan Executors.newSingleThreadExecutor()) agar tidak memblokir UI utama (Main Thread) yang menyebabkan tampilan kamera tersendat (lag).

Kotlin

// ScanMapScreen.kt  
import android.Manifest  
import android.content.pm.PackageManager  
import android.util.Log  
import android.view.ViewGroup  
import android.widget.Toast  
import androidx.activity.compose.rememberLauncherForActivityResult  
import androidx.activity.result.contract.ActivityResultContracts  
import androidx.camera.core.CameraSelector  
import androidx.camera.core.ImageAnalysis  
import androidx.camera.core.Preview  
import androidx.camera.lifecycle.ProcessCameraProvider  
import androidx.camera.view.PreviewView  
import androidx.compose.foundation.layout.Box  
import androidx.compose.foundation.layout.fillMaxSize  
import androidx.compose.material3.Text  
import androidx.compose.runtime.\*  
import androidx.compose.ui.Alignment  
import androidx.compose.ui.Modifier  
import androidx.compose.ui.platform.LocalContext  
import androidx.compose.ui.platform.LocalLifecycleOwner  
import androidx.compose.ui.viewinterop.AndroidView  
import androidx.core.content.ContextCompat  
import java.util.concurrent.Executors

@Composable  
fun ScanMapScreen(  
    onScanSuccess: (String) \-\> Unit // Fungsi navigasi/API call dari ViewModel  
) {  
    val context \= LocalContext.current  
    val lifecycleOwner \= LocalLifecycleOwner.current  
      
    // State untuk izin kamera  
    var hasCameraPermission by remember {  
        mutableStateOf(  
            ContextCompat.checkSelfPermission(  
                context,  
                Manifest.permission.CAMERA  
            ) \== PackageManager.PERMISSION\_GRANTED  
        )  
    }

    // Launcher untuk request permission  
    val launcher \= rememberLauncherForActivityResult(  
        contract \= ActivityResultContracts.RequestPermission(),  
        onResult \= { granted \-\>  
            hasCameraPermission \= granted  
            if (\!granted) {  
                Toast.makeText(context, "Izin kamera diperlukan untuk memindai QR", Toast.LENGTH\_SHORT).show()  
            }  
        }  
    )

    // Request izin saat layar pertama kali dibuka  
    LaunchedEffect(key1 \= true) {  
        if (\!hasCameraPermission) {  
            launcher.launch(Manifest.permission.CAMERA)  
        }  
    }

    if (hasCameraPermission) {  
        Box(modifier \= Modifier.fillMaxSize(), contentAlignment \= Alignment.Center) {  
            AndroidView(  
                factory \= { ctx \-\>  
                    val previewView \= PreviewView(ctx).apply {  
                        this.scaleType \= PreviewView.ScaleType.FILL\_CENTER  
                        layoutParams \= ViewGroup.LayoutParams(  
                            ViewGroup.LayoutParams.MATCH\_PARENT,  
                            ViewGroup.LayoutParams.MATCH\_PARENT  
                        )  
                    }

                    // Executor untuk analisis gambar di background thread  
                    val cameraExecutor \= Executors.newSingleThreadExecutor()  
                      
                    val cameraProviderFuture \= ProcessCameraProvider.getInstance(ctx)

                    cameraProviderFuture.addListener({  
                        val cameraProvider \= cameraProviderFuture.get()

                        // 1\. Setup Preview (Tampilan Kamera)  
                        val preview \= Preview.Builder().build().also {  
                            it.setSurfaceProvider(previewView.surfaceProvider)  
                        }

                        // 2\. Setup Image Analyzer (Logika Pemindaian)  
                        val imageAnalysis \= ImageAnalysis.Builder()  
                            // Strategy: Hanya ambil frame terbaru, buang yang lama (mencegah lag)  
                         .setBackpressureStrategy(ImageAnalysis.STRATEGY\_KEEP\_ONLY\_LATEST)  
                         .build()  
                         .also {  
                                it.setAnalyzer(cameraExecutor, QrCodeAnalyzer { codeValue \-\>  
                                    // Callback ini berjalan di background thread  
                                    // Pindah ke Main Thread untuk update UI/Navigasi  
                                    ContextCompat.getMainExecutor(ctx).execute {  
                                        onScanSuccess(codeValue)  
                                    }  
                                })  
                            }

                        val cameraSelector \= CameraSelector.DEFAULT\_BACK\_CAMERA

                        try {  
                            // Unbind semua use case sebelum binding ulang (membersihkan state lama)  
                            cameraProvider.unbindAll()

                            // Bind use cases ke lifecycle pemilik (Activity/Fragment)  
                            cameraProvider.bindToLifecycle(  
                                lifecycleOwner,  
                                cameraSelector,  
                                preview,  
                                imageAnalysis  
                            )  
                        } catch (exc: Exception) {  
                            Log.e("ScanMapScreen", "Gagal memuat kamera", exc)  
                        }  
                    }, ContextCompat.getMainExecutor(ctx))

                    previewView  
                },  
                modifier \= Modifier.fillMaxSize()  
            )  
              
            // Tambahkan Overlay UI di sini (misal: bingkai pemindai atau teks instruksi)  
            // ScannerOverlay()  
        }  
    } else {  
        // Tampilan fallback jika izin ditolak  
        Text("Kamera tidak tersedia. Mohon izinkan akses kamera di pengaturan.")  
    }  
}

### **7.5 Logika Backend dan Integritas Transaksi Data**

Setelah aplikasi klien berhasil mengekstraksi code\_value, data tersebut dikirim ke server. Di sinilah logika bisnis utama (Fungsional 6\) dieksekusi. Backend tidak hanya sekadar menyimpan data, tetapi memvalidasi keabsahan klaim kunjungan tersebut.

#### **7.5.1 Spesifikasi Endpoint API**

Sesuai permintaan, kita menggunakan metode HTTP POST. Struktur data JSON harus ringkas namun membawa informasi konteks yang cukup.

* **Endpoint:** POST /api/scan  
* **Header Autentikasi:** Authorization: Bearer \<JWT\_TOKEN\> (Token ini membawa identitas users\_id).  
* **Request Body:**  
  JSON  
  {  
    "code\_value": "QR-PGR-001-XYZ" // String unik hasil scan  
  }

#### **7.5.2 Alur Logika Kontroler (Backend Controller Logic)**

Logika di backend harus dieksekusi secara atomik untuk menjaga konsistensi data. Berikut adalah algoritma langkah demi langkah yang harus diimplementasikan dalam *Controller* (menggunakan Node.js/Express sesuai spesifikasi Bab 2):

1. Ekstraksi Identitas:  
   Sistem mengekstrak users\_id dari payload token JWT yang dikirim di header. Ini memastikan bahwa pengguna hanya bisa mencatatkan kunjungan untuk akun mereka sendiri (mencegah impersonation).  
2. Validasi Kode QR (Tabel qr\_code):  
   Langkah pertama adalah memverifikasi apakah code\_value yang dikirim benar-benar ada dan valid.  
   * *Query:* SELECT tourist\_place\_id FROM qr\_code WHERE code\_value \= 'QR-PGR-001-XYZ' LIMIT 1;  
   * *Keputusan:*  
     * Jika hasil **NULL**: Kembalikan respon HTTP 404 Not Found atau 400 Bad Request. Pesan: "Kode QR tidak valid atau tidak dikenali." Logika berhenti di sini.  
     * Jika hasil **ADA**: Simpan tourist\_place\_id yang ditemukan ke dalam variabel sementara.  
3. Eksekusi Update Kunjungan (Tabel user\_visit):  
   Sesuai asumsi bahwa data not\_visited sudah ada, kita melakukan operasi UPDATE. Operasi ini harus spesifik menargetkan baris yang memiliki kombinasi users\_id (dari token) dan tourist\_place\_id (dari hasil validasi QR).  
   * *Query SQL:*  
     SQL  
     UPDATE user\_visit  
     SET status \= 'visited',  
         visited\_at \= NOW()  
     WHERE users\_id \=?   
       AND tourist\_place\_id \=?  
       AND status \= 'not\_visited'; \-- Pastikan hanya mengupdate yang belum dikunjungi

4. **Analisis Hasil Update (Affected Rows):**  
   * **Jika Rows Affected \= 1:** Berarti update sukses. Pengguna belum pernah berkunjung sebelumnya, dan sekarang statusnya berubah menjadi 'visited'.  
     * *Respon:* HTTP 200 OK. JSON: { "status": "success", "message": "Kunjungan berhasil diverifikasi", "visited\_at": "..." }.  
   * **Jika Rows Affected \= 0:** Ada dua kemungkinan:  
     1. Pengguna sudah pernah berkunjung sebelumnya (status sudah 'visited').  
     2. Data baris tidak ditemukan (asumsi awal data not\_visited meleset).  
     * *Penanganan:* Untuk kasus ini, idealnya backend melakukan pengecekan sekunder. Jika status sudah 'visited', kembalikan pesan "Anda sudah pernah mengunjungi tempat ini". Jika data tidak ada, sistem yang lebih *robust* akan melakukan INSERT otomatis (*Upsert*). Namun, sesuai instruksi ketat "Fungsional 6", kita mengembalikan status gagal atau informasi bahwa kunjungan sudah tercatat.

#### **7.5.3 Integrasi Frontend-Backend (Handling Response)**

Di sisi frontend (ScanMapScreen / ViewModel), respon dari API harus ditangani dengan umpan balik visual yang jelas:

* **Sukses (200):** Tampilkan dialog/modal dengan animasi centang hijau. Berikan pesan "Selamat\! Kunjungan Anda di telah tercatat. \+50 XP". Navigasikan pengguna kembali ke peta atau detail lokasi dengan status tombol scan yang kini berubah menjadi *disabled* (abu-abu).  
* **Gagal (400/404):** Tampilkan *Snackbar* merah: "Kode QR tidak dikenali. Silakan coba lagi." Reset status pemindai agar pengguna bisa mencoba scan ulang.  
* **Konflik/Sudah Visit (409):** Tampilkan pesan: "Anda sudah pernah check-in di lokasi ini sebelumnya."

### **7.6 Aspek Keamanan, UX, dan Rekomendasi Lanjutan**

Meskipun fungsionalitas dasar telah terpenuhi, implementasi di lapangan membutuhkan pertimbangan tambahan untuk menjamin keamanan dan kenyamanan pengguna.

#### **7.6.1 Pencegahan Kecurangan (Anti-Spoofing)**

Mengingat code\_value bersifat statis, ada risiko pengguna memfoto QR Code tersebut dan membagikannya ke teman yang tidak berada di lokasi ("Joki Absen"). Untuk memitigasi risiko ini tanpa mengubah arsitektur kode statis, laporan ini menyarankan (sebagai wawasan tingkat lanjut/third-order insight) penambahan validasi geolokasi sekunder.

* Saat memanggil POST /api/scan, aplikasi juga mengirimkan koordinat GPS pengguna saat ini.  
* Backend membandingkan koordinat pengguna dengan koordinat tourist\_place.  
* Jika jarak \> 100 meter, tolak pemindaian meskipun kode QR valid.

#### **7.6.2 Penanganan Kondisi Lingkungan (Fitur UX)**

Lingkungan wisata seringkali memiliki pencahayaan yang tidak ideal (misalnya di dalam gua atau museum yang remang). ML Kit memang memiliki performa *low-light* yang baik, namun fitur fisik kamera tetap dibutuhkan.

* **Fitur Senter (Flashlight):** Disarankan menambahkan tombol *toggle* pada overlay ScanMapScreen untuk mengaktifkan LED flash. Pada CameraX, ini dilakukan melalui cameraControl.enableTorch(true).  
* **Zoom:** Untuk QR Code yang ditempatkan agak tinggi atau jauh, fitur *pinch-to-zoom* sangat membantu. Ini dapat diimplementasikan dengan menghubungkan *gesture listener* Compose ke cameraControl.setZoomRatio().

### **7.7 Kesimpulan Implementasi**

Implementasi Fungsional 6 ini merupakan sinergi antara desain aset fisik yang cermat (QR Level H), pemilihan pustaka pemindaian yang cerdas (ML Kit), dan logika backend yang ketat. Dengan beralih dari ZXing ke ML Kit, aplikasi SAKO mendapatkan keuntungan performa signifikan yang krusial untuk pengalaman pengguna di lokasi wisata. Arsitektur kode yang memisahkan logika analisis gambar (Analyzer) dari UI (Composable) memastikan kode tetap bersih, modular, dan mudah dipelihara. Sementara itu, validasi berlapis di backend menjamin bahwa setiap poin pengalaman (XP) yang diberikan kepada pengguna adalah hasil dari kunjungan fisik yang sah, menjaga integritas sistem gamifikasi SAKO secara keseluruhan.

---

## **BAB 8: Implementasi Sistem Notifikasi dengan Firebase Cloud Messaging (FCM)**

Bab ini menguraikan langkah-langkah teknis untuk membangun sistem notifikasi *real-time* yang terintegrasi. Fokus utama implementasi ini adalah memberikan umpan balik instan kepada pengguna setelah mereka berhasil mengirimkan ulasan (Fungsional 5), menggunakan metode *Fire-and-Forget* (kirim langsung tanpa simpan riwayat di database).

### **8.1 Persiapan Lingkungan Firebase (Console Setup)**

Langkah pertama adalah mendaftarkan aplikasi SAKO ke ekosistem Google Firebase untuk mendapatkan kredensial akses.

**Langkah 1: Membuat Proyek Firebase**

1. Buka browser dan kunjungi [console.firebase.google.com](https://console.firebase.google.com/).  
2. Login menggunakan akun Google Anda.  
3. Klik **"Create a project"** (Buat proyek).  
4. Beri nama proyek: **SAKO-App**.  
5. Matikan *Google Analytics* (opsional untuk tugas ini agar lebih sederhana), lalu klik **Create Project**.

**Langkah 2: Konfigurasi untuk Android (Frontend)**

1. Di halaman *Overview* proyek, klik ikon **Android** (robot hijau).  
2. **Register app:**  
   * *Android package name*: Masukkan nama paket aplikasi Anda, misal com.sako.app (Harus sama persis dengan yang ada di AndroidManifest.xml atau build.gradle aplikasi Android Anda).  
   * Klik **Register app**.  
3. **Download config file:**  
   * Unduh file **google-services.json**.  
   * **PENTING:** Simpan file ini di folder app/ di dalam struktur proyek Android Studio Anda.  
4. Klik *Next* hingga selesai.

**Langkah 3: Konfigurasi untuk Node.js (Backend)**

1. Di menu sebelah kiri, klik ikon **Gear (Pengaturan)** \> **Project settings**.  
2. Pilih tab **Service accounts**.  
3. Pada bagian *Admin SDK configuration snippet*, pilih **Node.js**.  
4. Klik tombol **Generate new private key**.  
5. Akan terunduh sebuah file JSON (misal: sako-app-firebase-adminsdk-xyz.json).  
6. **Rename** file tersebut menjadi serviceAccountKey.json.  
7. Pindahkan file ini ke folder sako-backend/config/ di proyek backend Anda.

### **8.2 Integrasi Sisi Klien (Frontend Android)**

Implementasi di sisi Android bertujuan untuk menerima pesan dari server dan menampilkannya di *system tray* HP pengguna.

1\. Tambahkan Dependensi (build.gradle Module: app)  
Tambahkan plugin Google Services dan library Firebase Messaging.

Kotlin

plugins {  
    id("com.android.application")  
    id("org.jetbrains.kotlin.android")  
    // Tambahkan plugin ini  
    id("com.google.gms.google-services")  
}

dependencies {  
    // Firebase Cloud Messaging (FCM)  
    implementation("com.google.firebase:firebase-messaging:23.4.0")  
      
    // Platform BoM (Bill of Materials) untuk manajemen versi otomatis  
    implementation(platform("com.google.firebase:firebase-bom:32.7.0"))  
}

*Catatan: Jangan lupa tambahkan classpath 'com.google.gms:google-services:4.4.0' di build.gradle (Project Level).*

2\. Buat Service Penangan Pesan (MyFirebaseMessagingService.kt)  
Buat file kelas baru yang mewarisi FirebaseMessagingService. Kelas ini akan menangani notifikasi yang masuk.

Kotlin

package com.sako.app.service

import android.app.NotificationChannel  
import android.app.NotificationManager  
import android.content.Context  
import android.os.Build  
import android.util.Log  
import androidx.core.app.NotificationCompat  
import com.google.firebase.messaging.FirebaseMessagingService  
import com.google.firebase.messaging.RemoteMessage  
import com.sako.app.R // Sesuaikan dengan package R anda

class MyFirebaseMessagingService : FirebaseMessagingService() {

    // Fungsi ini dipanggil saat Token FCM baru digenerate (misal saat install ulang)  
    override fun onNewToken(token: String) {  
        Log.d("FCM", "Refreshed token: $token")  
        // TODO: Kirim token ini ke backend (biasanya dihandle saat Login)  
    }

    // Fungsi ini dipanggil saat pesan diterima dan aplikasi sedang dibuka (Foreground)  
    override fun onMessageReceived(remoteMessage: RemoteMessage) {  
        // Cek apakah pesan berisi notifikasi payload  
        remoteMessage.notification?.let {  
            showNotification(it.title, it.body)  
        }  
    }

    private fun showNotification(title: String?, body: String?) {  
        val channelId \= "SAKO\_NOTIF\_CHANNEL"  
        val notificationManager \= getSystemService(Context.NOTIFICATION\_SERVICE) as NotificationManager

        // Buat Channel untuk Android O ke atas  
        if (Build.VERSION.SDK\_INT \>= Build.VERSION\_CODES.O) {  
            val channel \= NotificationChannel(  
                channelId, "Notifikasi SAKO",  
                NotificationManager.IMPORTANCE\_DEFAULT  
            )  
            notificationManager.createNotificationChannel(channel)  
        }

        val notification \= NotificationCompat.Builder(this, channelId)  
         .setSmallIcon(R.drawable.ic\_launcher\_foreground) // Ganti dengan ikon SAKO  
         .setContentTitle(title)  
         .setContentText(body)  
         .setAutoCancel(true)  
         .build()

        notificationManager.notify(0, notification)  
    }  
}

3\. Daftarkan Service di AndroidManifest.xml  
Tambahkan deklarasi service di dalam tag \<application\>.

XML

\<service  
    android:name\=".service.MyFirebaseMessagingService"  
    android:exported\="false"\>  
    \<intent-filter\>  
        \<action android:name\="com.google.firebase.MESSAGING\_EVENT" /\>  
    \</intent-filter\>  
\</service\>

### **8.3 Integrasi Sisi Server (Backend Node.js)**

Di sisi backend, kita akan mengimplementasikan logika spesifik Fungsional 5: "Saat ulasan berhasil disimpan, kirim notifikasi ke pemilik ulasan".

1\. Instalasi Library  
Buka terminal di folder sako-backend dan jalankan:

Bash

npm install firebase-admin

2\. Inisialisasi Firebase Admin (config/firebase.js)  
File ini akan memuat kunci rahasia yang sudah Anda unduh di langkah 8.1.

JavaScript

// config/firebase.js  
const admin \= require("firebase-admin");  
const serviceAccount \= require("./serviceAccountKey.json"); // Pastikan file ada di folder ini

admin.initializeApp({  
  credential: admin.credential.cert(serviceAccount)  
});

module.exports \= admin;

3\. Implementasi Logika Notifikasi (controllers/app/mapController.js)  
Berikut adalah kode lengkap untuk fungsi addReview yang mencakup insert database, update rating, dan pengiriman notifikasi (Fire-and-Forget).

JavaScript

// controllers/app/mapController.js  
const Review \= require('../../models/mapModel').Review;  
const TouristPlace \= require('../../models/mapModel').TouristPlace;  
const User \= require('../../models/userModel'); // Import model User  
const admin \= require('../../config/firebase'); // Import Firebase Admin  
const { generateCustomId } \= require('../../utils/customIdGenerator');  
const { successResponse, errorResponse } \= require('../../utils/responseHelper');

exports.addReview \= async (req, res) \=\> {  
    try {  
        const { rating, reviewText, touristPlaceId } \= req.body;  
        const userId \= req.user.users\_id; // Didapat dari middleware auth (JWT)

        // 1\. Cek apakah user sudah pernah review (Opsional, business rule)  
        const existingReview \= await Review.findOne({ where: { user\_id: userId, tourist\_place\_id: touristPlaceId } });  
        if (existingReview) {  
            return errorResponse(res, "Anda sudah memberikan ulasan untuk tempat ini.", 400);  
        }

        // 2\. Generate ID & Insert Review  
        const newReviewId \= await generateCustomId(Review, 'RVW', 'review\_id');  
        await Review.create({  
            review\_id: newReviewId,  
            user\_id: userId,  
            tourist\_place\_id: touristPlaceId,  
            rating: rating,  
            review\_text: reviewText  
        });

        // 3\. Trigger Update Average Rating (Biasanya otomatis via Trigger MySQL,   
        // tapi jika tidak, bisa dikalkulasi manual di sini).   
        // Asumsi: Trigger MySQL \`after\_review\_insert\_update\_rating\` sudah aktif.

        // 4\. LOGIKA NOTIFIKASI (FIRE-AND-FORGET)  
        // Ambil fcm\_token milik user dari tabel users  
        const user \= await User.findOne({   
            where: { users\_id: userId },  
            attributes: \['fcm\_token', 'full\_name'\]   
        });

        if (user && user.fcm\_token) {  
            const messagePayload \= {  
                notification: {  
                    title: 'Ulasan Berhasil\!',  
                    body: \`Terima kasih ${user.full\_name}, ulasan Anda telah berhasil ditambahkan. \+10 Poin\!\`  
                },  
                token: user.fcm\_token  
            };

            // Kirim via Firebase (Tanpa await agar tidak memblokir respon API)  
            admin.messaging().send(messagePayload)  
             .then((response) \=\> {  
                    console.log('Notifikasi sukses dikirim:', response);  
                })  
             .catch((error) \=\> {  
                    console.error('Gagal kirim notifikasi:', error);  
                });  
        }

        // 5\. Kembalikan Respon ke Android  
        return successResponse(res, null, "Ulasan berhasil ditambahkan.");

    } catch (error) {  
        console.error(error);  
        return errorResponse(res, "Terjadi kesalahan server.", 500);  
    }  
};

### **8.4 Ringkasan Alur Data (Flow Summary)**

1. **Android:** User mengisi rating bintang 5 dan teks "Tempatnya bagus\!" \-\> Klik "Kirim".  
2. **Android:** Mengirim POST /api/map/review dengan Header Authorization: Bearer \<token\>.  
3. **Backend:** Memverifikasi token JWT user.  
4. **Backend:** Menyimpan ulasan ke tabel MySQL review.  
5. **Backend (Background):** Mengambil fcm\_token dari tabel users berdasarkan ID pengirim.  
6. **Backend (Background):** Memanggil server Firebase Google untuk mengirim pesan ke token tersebut.  
7. **Backend:** Langsung mengirim respon JSON 200 OK ke Android (tanpa menunggu notifikasi selesai terkirim).  
8. **Firebase:** Meneruskan pesan ke HP User.  
9. **Android:** MyFirebaseMessagingService menerima sinyal \-\> Menampilkan notifikasi "Ulasan Berhasil\!" di layar HP.