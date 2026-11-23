# ☕ CY Coffee POS - Point of Sales Modern & Ringan

Aplikasi web **Point of Sales (POS) khusus Coffee Shop** yang sangat ringan, cepat, stabil, dan minim error (*zero-runtime-error mindset*). Didesain khusus agar siap langsung di-deploy sebagai **Static Site ke Cloudflare Pages** tanpa ketergantungan server backend yang kompleks.

---

## 🚀 Fitur Unggulan

### 1. Kasir Cepat & Responsif (Rush Hour Ready)
- **Katalog Menu Terstruktur:** Kategori *Coffee*, *Non-Coffee*, *Manual Brew*, *Pastry & Snack*, dan *Add-on*.
- **Varian Cepat Instan:** Dukungan varian *Iced/Hot*, ukuran *Regular/Large*, dan opsi kustom langsung di kartu menu tanpa alur klik berbelit.
- **Pencarian Real-Time:** Filter instan berdasarkan nama menu atau kategori.
- **Perhitungan Kasir Otomatis:**
  - Qty `+` / `-`, hapus item, dan tambah catatan per item (*contoh: less ice, gula dipisah*).
  - Diskon fleksibel (Nominal Rp atau Persentase %) dengan proteksi nilai negatif.
  - Perhitungan Pajak Resto / PB1 (0%, 10%, 11%, atau custom).
  - Subtotal dan Total Bayar real-time.

### 2. Multi-Metode Pembayaran & Kembalian
- **Tunai (Cash):** Kalkulator uang diterima, tombol nominal pecahan cepat (*Uang Pas, Rp20.000, Rp50.000, Rp100.000, Rp200.000*), dan kalkulasi kembalian otomatis.
- **QRIS:** Tampilan QRIS statis untuk scan pembayaran via e-wallet / mobile banking.
- **Debit / Transfer:** Panduan pembayaran EDC / mesin kasir.
- **Input Nama Pelanggan & No. Meja:** Memudahkan barista dalam antrean pesanan.

### 3. Struk Pembayaran Digital & Thermal Ready
- Tampilan struk rapi standar thermal receipt (Nama coffee shop, waktu, nomor pesanan, detail item & varian, total bayar, metode bayar, kembalian).
- Tombol **Cetak Struk** menggunakan `@media print` yang secara otomatis terformat rapi untuk printer thermal ukuran 58mm atau 80mm.
- Tombol **Transaksi Baru** untuk langsung melayani pelanggan berikutnya.

### 4. Manajemen Menu (Menu Manager)
- Tambah menu baru lengkap dengan harga dasar, deskripsi, badge, dan varian.
- Edit menu & harga kapan saja.
- Toggle ketersediaan stok (*Tersedia / Habis*) dengan 1 klik.
- Hapus menu dengan konfirmasi aman.
- Tombol **Reset Bawaan** untuk mengembalikan daftar menu awal.

### 5. Riwayat & Rekap Harian (Orders & Summary)
- Rekapitulasi metrik penjualan:
  - **Total Omzet**
  - **Jumlah Transaksi**
  - **Rata-rata Order (Average Order Value / AOV)**
  - **Rincian Per Metode Pembayaran** (*Cash* vs *QRIS* vs *Debit/Transfer*)
- Filter rentang waktu: *Hari Ini*, *7 Hari Terakhir*, dan *Semua Periode*.
- Pencarian riwayat struk berdasarkan Nomor Order, ID Transaksi, atau Nama Pelanggan.
- Buka dan cetak ulang struk transaksi lama.

### 6. Pengaturan Toko & Keamanan Data (LocalStorage + JSON Backup)
- Konfigurasi Nama Coffee Shop, Tagline, Alamat, Nomor WhatsApp, Nama Kasir, dan Catatan Kaki Struk.
- **Ekspor Backup JSON:** Unduh seluruh riwayat transaksi, menu, dan pengaturan sebagai arsip lokal.
- **Impor JSON:** Pulihkan data dari file backup kapan saja.
- **Zero-Runtime-Crash:** Dilengkapi `React Error Boundary` di level root untuk pemulihan darurat jika terjadi corrupt data atau galat tak terduga.

---

## 🛠️ Tech Stack
- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS (skema warna warm coffee & kontras jelas)
- **Icons:** Lucide React
- **Storage:** Safe LocalStorage Helper (`safeGet`, `safeSet` dengan validasi schema & try-catch)
- **Deployment:** Cloudflare Pages Static Hosting (dilengkapi `public/_redirects`)

---

## 💻 Menjalankan di Lokal (Development)

1. **Clone atau buka folder proyek:**
   ```bash
   cd "POS Cy Coffee 08"
   ```

2. **Jalankan local dev server:**
   ```bash
   npm run dev
   ```

3. Buka peramban pada alamat yang ditampilkan (biasanya `http://localhost:5173`).

---

## ☁️ Panduan Deploy ke Cloudflare Pages

Aplikasi ini sudah dipersiapkan 100% untuk Cloudflare Pages:
- Build folder: `dist/`
- SPA routing redirect: `public/_redirects` -> disalin otomatis ke `dist/_redirects` (`/* /index.html 200`).

### Cara 1: Deploy Otomatis via GitHub / GitLab
1. Push repository proyek ini ke akun GitHub / GitLab Anda.
2. Masuk ke [Cloudflare Dashboard](https://dash.cloudflare.com/) > **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
3. Pilih repository proyek Anda.
4. Pada **Build settings**:
   - **Framework preset:** `Vite`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
5. Klik **Save and Deploy**. Website POS Anda langsung aktif dalam waktu kurang dari 1 menit!

### Cara 2: Deploy Manual via Cloudflare Wrangler CLI
```bash
# Build aplikasi
npm run build

# Deploy langsung dist folder
npx wrangler pages deploy dist --project-name=pos-cy-coffee
```

### Cara 3: Direct Upload (Drag & Drop)
1. Jalankan `npm run build`.
2. Masuk ke dashboard Cloudflare Pages > **Upload Assets**.
3. Drag & drop folder `dist/` ke area upload Cloudflare.
