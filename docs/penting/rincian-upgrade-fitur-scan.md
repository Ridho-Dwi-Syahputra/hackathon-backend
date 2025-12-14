# Rincian Upgrade Fitur Scan QR (Geolocation Integration)

Dokumen ini merinci rencana pengembangan fitur Scan QR pada Modul Map agar mendukung validasi berbasis lokasi (Geolocation) serta protokol pembuatan aset QR Code.

---

## 1. Protokol Pembuatan Aset QR Code (Static Generation)

Sistem Sako menggunakan pendekatan **Pre-generated Static QR Code**. Artinya, kode QR tidak dibuat secara dinamis oleh backend setiap kali request, melainkan dibuat sekali di awal (statis) dan dicetak untuk ditempatkan di lokasi fisik.

### Konsep Dasar
*   **Sifat Data**: `code_value` pada tabel `qr_code` bersifat statis dan unik untuk setiap `tourist_place_id`.
*   **Efisiensi**: Tidak membebani server dengan proses generate image QR berulang-ulang.
*   **Keamanan**: Validasi dilakukan di sisi server saat scanning (mencocokkan `code_value` + Geolocation), bukan pada kompleksitas gambar QR itu sendiri.

### Panduan Teknis (Actionable Guide)
Berikut adalah langkah-langkah bagi tim pengembang/konten untuk membuat aset fisik QR Code:

1.  **Ekstraksi Data**:
    *   Ambil data `code_value` dari tabel `qr_code` di database.
    *   Contoh: `SAKO-TP001-JAMGADANG`, `SAKO-TP002-LUBANGJEPANG`.

2.  **Pemilihan Generator**:
    *   Gunakan layanan pihak ketiga yang terpercaya untuk mengubah string `code_value` menjadi gambar (PNG/SVG).
    *   **Rekomendasi Tools**:
        *   **QRCode Monkey**: Memungkinkan kustomisasi warna, logo di tengah, dan resolusi tinggi.
        *   **Adobe Express**: Bagus untuk integrasi dengan desain poster/banner.
    *   *Catatan*: Pastikan QR Code memiliki tingkat koreksi kesalahan (Error Correction Level) minimal **'M' (Medium)** atau **'Q' (Quartile)** agar tetap terbaca meski sedikit rusak atau tertutup logo.

3.  **Desain & Pencetakan**:
    *   Cetak QR Code pada media fisik (akrilik/stiker) yang tahan cuaca.
    *   Tempatkan di titik koordinat yang sesuai dengan data `latitude` dan `longitude` di database (dalam radius 200m).

---

## 2. Perubahan Database (`sako.sql`)

Saat ini tabel `tourist_place` belum memiliki atribut koordinat. Kita perlu menambahkan kolom `latitude` dan `longitude` untuk menyimpan titik pusat lokasi wisata.

### Query SQL Update
Jalankan query berikut pada database `sako`:

```sql
ALTER TABLE `tourist_place`
ADD COLUMN `latitude` DECIMAL(10, 8) NULL COMMENT 'Koordinat Lintang' AFTER `address`,
ADD COLUMN `longitude` DECIMAL(11, 8) NULL COMMENT 'Koordinat Bujur' AFTER `latitude`;
```

*   **Tipe Data**: `DECIMAL` digunakan untuk presisi tinggi koordinat GPS.
*   **Contoh Data**:
    *   Jam Gadang: Lat `-0.305`, Long `100.369`.

---

## 3. Alur Logika Baru (Flowchart Logic)

### A. Frontend (Mobile App)

1.  **Trigger**: User menekan tombol FAB "Scan QR" di `DetailMapScreen`.
2.  **Permission Check**:
    *   Cek izin `CAMERA`.
    *   Cek izin `ACCESS_FINE_LOCATION`.
    *   *Jika belum diizinkan*: Tampilkan dialog permintaan izin sistem.
3.  **Get Location**:
    *   Gunakan `FusedLocationProviderClient` untuk mendapatkan `lastLocation` atau `getCurrentLocation`.
    *   Tampilkan loading indicator "Mendapatkan lokasi...".
4.  **Scan QR**:
    *   Buka kamera, user memindai kode QR fisik yang ada di lokasi.
    *   Dapatkan string `code_value` dari QR.
5.  **API Call**:
    *   Kirim request ke backend dengan payload:
        ```json
        {
          "qr_code": "SAKO-TP001-JAMGADANG",
          "user_latitude": -0.305123,
          "user_longitude": 100.369456
        }
        ```

### B. Backend (Server Logic)

Endpoint: `POST /api/map/scan/qr`

1.  **Validasi Input**: Pastikan `qr_code`, `user_latitude`, dan `user_longitude` tidak kosong.
2.  **Cek QR Code**:
    *   Query tabel `qr_code` berdasarkan `code_value`.
    *   *Gagal*: Jika tidak ditemukan -> Return 404 "QR Code tidak valid/tidak terdaftar".
3.  **Ambil Data Lokasi Wisata**:
    *   Dari hasil QR, dapatkan `tourist_place_id`.
    *   Query tabel `tourist_place` untuk mengambil `latitude` dan `longitude` target.
4.  **Cek Riwayat Kunjungan (`user_visit`)**:
    *   Cek apakah user ini sudah pernah scan di tempat ini (`status = 'visited'`).
    *   *Gagal*: Jika sudah -> Return 400 "Anda sudah mengunjungi lokasi ini sebelumnya".
5.  **Validasi Jarak (Geofencing)**:
    *   Hitung jarak antara (`user_latitude`, `user_longitude`) dengan (`place_latitude`, `place_longitude`).
    *   Gunakan rumus **Haversine** untuk akurasi bola bumi.
    *   **Threshold**: 200 meter.
    *   *Gagal*: Jika Jarak > 200m -> Return 400 "Lokasi Anda terlalu jauh dari titik wisata. Silakan mendekat ke lokasi.".
6.  **Eksekusi Sukses**:
    *   Insert/Update tabel `user_visit` set `status` = 'visited'.
    *   Tambahkan XP ke user (+50 XP).
    *   Kirim Notifikasi FCM (Firebase Cloud Messaging) ke user: "Selamat! Anda berhasil mengunjungi [Nama Tempat]".
    *   Return 200 OK.

---

## 4. Implementasi Teknis

### Rumus Haversine (JavaScript Helper)

Gunakan fungsi ini di controller backend (`utils/geoHelper.js`):

```javascript
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Radius bumi dalam meter
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Hasil dalam meter
}
```

### Payload Request Frontend

Pastikan `MapRepository.kt` mengirim data seperti ini:

```kotlin
data class ScanQrRequest(
    @SerializedName("qr_code") val qrCode: String,
    @SerializedName("latitude") val latitude: Double,
    @SerializedName("longitude") val longitude: Double
)
```

---

## 4. Skenario Error & Notifikasi

| Kondisi | Pesan Error (Pop-up) | Tindakan Sistem |
| :--- | :--- | :--- |
| QR Code tidak ada di DB | "QR Code tidak dikenali." | Tolak request. |
| Lokasi User > 200m | "Anda terlalu jauh dari lokasi wisata (Jarak: 350m). Harap mendekat." | Tolak request. |
| User sudah pernah scan | "Anda telah mengunjungi lokasi ini sebelumnya." | Tampilkan detail kunjungan lama. |
| GPS Mati/Tidak Akurat | "Gagal mendapatkan lokasi akurat. Pastikan GPS aktif." | Frontend menolak sebelum kirim API. |
| Sukses | "Kunjungan Terverifikasi! +50 XP" | Update DB, Kirim Notif, Update UI. |
