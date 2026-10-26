# Arsitektur — Threads AI Assistant

Dokumen ini merangkum arsitektur sasaran dari PRD. Detail implementasi yang belum diputuskan dicatat di [`TECHNICAL_DECISIONS.md`](./TECHNICAL_DECISIONS.md).

## Konteks sistem

```text
HP / Laptop pemilik
        │
        │ jaringan privat Tailscale
        ▼
Laptop server (Ubuntu Server / Debian minimal)
  ├── Next.js App Router: UI dan API aplikasi
  ├── Worker ringan / pemanggilan scheduler (v0.3)
  └── Prisma ── MySQL
        │
        ├── Provider AI (permintaan generasi dari server)
        └── Threads API resmi (publish dan insights)
```

Tidak ada akses publik internet yang direncanakan. Aplikasi tetap memerlukan koneksi keluar dari server ke provider AI dan Meta. Pengguna berinteraksi manual di aplikasi Threads untuk balasan komentar dan diskusi.

## Komponen dan tanggung jawab

- **Web app:** autentikasi pemilik, pengelolaan profile, generate/edit draft, persetujuan, antrean, history, dan dashboard.
- **Lapisan server/API:** validasi input dan status, pemanggilan provider eksternal, otorisasi, serta operasi database. Rahasia tidak dikirim ke client.
- **Database:** profile beserta versi, contoh tulisan, post dan bagian thread, akun Threads, snapshot metrik, pengaturan, dan log job sesuai tahap rilis.
- **Worker:** memproses jadwal dan retry secara independen dari permintaan halaman; diperkenalkan pada v0.3.
- **Provider AI:** Gemini Developer API melalui SDK resmi Google. Kunci disediakan melalui environment server; gunakan timeout, retry terbatas, dan kontrol anggaran.
- **Threads API:** alur resmi membuat media container lalu publish; metrik dan refresh token sesuai izin/endpoint resmi yang tersedia.
- **Jaringan privat:** Tailscale membatasi akses dashboard ke perangkat pemilik; firewall server tetap aktif.

## Alur data utama

### Membuat draft (v0.1)

1. Pemilik login dan mengirim ide/topik serta jumlah draft.
2. Server mengambil versi profile aktif dan contoh terpilih.
3. Server memanggil provider AI dengan batas timeout/anggaran.
4. Hasil divalidasi (termasuk batas karakter), lalu disimpan sebagai `DRAFT` dengan sumber dan versi profile.
5. Pemilik mengedit, meregenerasi, atau menyimpan draft.

### Menerbitkan post (v0.2+)

1. Pemilik menyetujui draft dan memilih publish sekarang atau jadwal.
2. Server memastikan status dan idempotency key valid.
3. Untuk jadwal, worker mengklaim pekerjaan secara atomik dan mengubah status ke `PUBLISHING`.
4. Server membuat container lewat Threads API, kemudian mempublikasikannya.
5. Simpan ID media, waktu publish, dan status `PUBLISHED`; jika gagal, simpan error dan terapkan kebijakan retry.
6. Setelah restart di tengah publish, periksa API sebelum mencoba ulang agar tidak membuat duplikasi.

### Metrik (v0.4)

Job berkala mengambil metrik post melalui endpoint resmi yang diizinkan dan menyimpan snapshot bertanggal. Ringkasan dipakai dashboard dan, setelah evaluasi, konteks prompt berikutnya.

## Status dan konsistensi

Status post: `DRAFT`, `SCHEDULED`, `PUBLISHING`, `PUBLISHED`, `FAILED`, `MISSED`, `CANCELED`. Perubahan ke `PUBLISHING` harus bersyarat/atomik agar dua eksekusi worker tidak mengklaim post yang sama. Jadwal disimpan UTC dan ditampilkan dalam `Asia/Jakarta`. Catch-up default maksimal dua jam; retry maksimal tiga kali sesuai PRD.

## Keamanan dan operasi

- Akses UI hanya melalui jaringan privat dan login pemilik.
- Hash password dengan algoritma password hashing yang sesuai; gunakan cookie/session dengan atribut aman.
- Token Threads dienkripsi di sisi server dengan AES-GCM; kunci enkripsi ada di environment server.
- API key provider AI disimpan di environment; jangan pernah dikirim ke browser atau dicatat dalam log.
- Jangan commit `.env`, token, database produksi, atau backup.
- Gunakan log terstruktur dan rotasi; sanitasi detail error agar tidak membocorkan rahasia.
- Sinkronkan jam server dengan NTP. Backup harian terenkripsi, retensi 14 hari, dan uji pemulihan.
- Ukur memori dan performa pada perangkat sasaran; build dilakukan di mesin lain dan kirim output standalone.

## Batas kapasitas dan deployment

Sasaran adalah laptop RAM 2 GB, OS minimal tanpa GUI, tanpa Docker. Proses aplikasi dan worker harus ringan; database menggunakan MySQL melalui Prisma. Proses dikelola systemd atau PM2 (belum diputuskan). Dashboard tidak memerlukan domain atau callback publik karena aksesnya privat. Rincian pemasangan dibangun dalam [`SETUP.md`](./SETUP.md) dan panduan deployment terpisah saat v0.3.
