# Rencana Implementasi — Threads AI Assistant


## Prinsip pelaksanaan

- Bangun dan validasi tiap versi sebelum melanjutkan ke versi berikutnya.
- Dahulukan alur yang bisa dipakai end-to-end daripada fitur otomasi lanjutan.
- Gunakan API resmi Threads; jangan memakai scraping atau otomasi browser.
- Simpan waktu sebagai UTC dan tampilkan waktu dalam zona `Asia/Jakarta`.
- Rahasia hanya berada di environment server, tidak di source control.
- Pertahankan footprint kecil agar dapat dijalankan pada laptop RAM 2 GB.

## Tahap 0 — Fondasi proyek

- [ ] Tetapkan keputusan yang menghalangi implementasi (lihat [`TECHNICAL_DECISIONS.md`](./TECHNICAL_DECISIONS.md)).
- [ ] Buat aplikasi Next.js App Router dengan TypeScript strict.
- [ ] Siapkan Tailwind dan komponen UI yang diperlukan.
- [ ] Siapkan Prisma dan SQLite untuk pengembangan lokal, setelah keputusan database dikonfirmasi.
- [ ] Tambahkan validasi environment dan contoh konfigurasi tanpa rahasia (`.env.example`).
- [ ] Pastikan `.env` dan file database lokal tidak masuk repo bila sesuai kebijakan proyek.
- [ ] Dokumentasikan perintah development, pemeriksaan tipe, lint, dan build.

**Selesai bila:** aplikasi dapat dijalankan lokal dengan konfigurasi yang terdokumentasi, dan build production berhasil.

## v0.1 — Generator draft AI

### Akses dan profil

- [ ] Implementasikan login satu pemilik; tanpa registrasi publik.
- [ ] Simpan content profile: niche, topik, audiens, nada, bahasa, serta aturan/hal yang dihindari.
- [ ] Simpan 5–20 contoh tulisan yang disukai.
- [ ] Catat versi profile; draft merujuk versi yang digunakan saat dibuat.
- [ ] Sediakan halaman untuk melihat dan mengubah profile serta riwayat versinya.

### Draft

- [ ] Buat draft dari topik, ide, atau prompt bebas melalui satu provider AI.
- [ ] Default jumlah hasil 5; sediakan pengaturan/validasi jumlah yang wajar.
- [ ] Bentuk awal: post tunggal maksimal 500 karakter. Multi-post thread menunggu keputusan produk.
- [ ] Tampilkan jumlah karakter dan jelaskan penolakan jika draft melewati batas.
- [ ] Sediakan regenerasi satu draft, pengeditan manual, dan penyimpanan.
- [ ] Tampilkan error provider dengan aman dan sediakan retry terbatas.
- [ ] Catat sumber draft (AI/manual) dan profile version yang dipakai.

### Riwayat dan dashboard minimum

- [ ] Tampilkan draft dan post dengan status serta tanggal.
- [ ] Sediakan pencarian/filter dasar jika diperlukan untuk review harian.
- [ ] Pastikan layout dapat digunakan di HP dan laptop.

**Selesai bila:** pemilik bisa login, mengatur profile, menghasilkan draft, mengedit, menyimpan, lalu menemukan kembali draft; pengujian penerimaan menilai hasil cukup mencerminkan suara pemilik untuk iterasi prompt berikutnya.

## v0.2 — Integrasi dan publish manual

- [ ] Buat halaman pengaturan untuk memasukkan token akun Threads sendiri.
- [ ] Enkripsi token saat disimpan; kunci enkripsi hanya dari environment server.
- [ ] Tampilkan status koneksi dan waktu kedaluwarsa token.
- [ ] Verifikasi endpoint, izin, batas karakter, dan aturan Meta saat implementasi.
- [ ] Implementasikan alur resmi: buat container, lalu publish.
- [ ] Implementasikan publish manual dengan status, ID Threads, dan penanganan error.
- [ ] Terapkan perlindungan idempotensi agar permintaan ulang tidak membuat post ganda.
- [ ] Uji dengan akun sendiri dan lingkungan/API yang diizinkan Meta.

**Selesai bila:** satu draft yang disetujui dapat dipublikasikan manual dan hasil/statusnya tercatat tanpa duplikasi pada retry yang aman.

## v0.3 — Scheduler dan deployment rumahan

- [x] Tambahkan waktu jadwal dan konversi `Asia/Jakarta` ↔ UTC yang konsisten.
- [x] Bangun endpoint worker ringan yang dipanggil cron/systemd timer setiap menit.
- [x] Gunakan transisi status atomik menuju `PUBLISHING`.
- [x] Terapkan retry maksimal 3 kali dengan backoff dan pencatatan error.
- [x] Implementasikan catch-up: default maksimal 2 jam; selebihnya `MISSED`.
- [x] Saat worker menemukan status `PUBLISHING` tertinggal, rekonsiliasi post melalui Threads API; hasil ambigu ditahan untuk review agar tidak dipublikasikan ganda.
- [x] Simpan log job dan tampilkan status/waktu run worker pada antrean jadwal.
- [ ] Uji build standalone dan prosedur pemindahan hasil build ke laptop.
- [ ] Siapkan service auto-start (systemd atau PM2), sinkronisasi waktu, firewall, dan akses privat Tailscale.
- [ ] Siapkan backup database harian terenkripsi, retensi 14 hari, dan uji pemulihan.
- [ ] Ukur penggunaan RAM dan latensi pada perangkat sasaran.

**Selesai bila:** jadwal, catch-up, restart, retry, serta pemulihan backup sudah diuji; tidak ada publikasi ganda dalam skenario uji.

## v0.4 — Otomasi dan feedback loop

- [ ] Tambahkan pengaturan mode Manual, Scheduled, dan Auto; Scheduled tetap default.
- [ ] Batasi Auto dengan kuota harian, jam aktif, topik profile, dan jeda darurat.
- [x] Tambahkan job pengambilan snapshot metrik harian melalui Threads API.
- [x] Tampilkan ringkasan metrik 7 dan 30 hari.
- [x] Tandai tiga post berkinerja terbaik berdasarkan snapshot views/engagement dan sertakan sebagai konteks prompt berikutnya.
- [ ] Tambahkan notifikasi kegagalan setelah kanal diputuskan.
- [ ] Pantau anggaran dan pemakaian provider AI.

**Selesai bila:** mode Auto dapat dijeda segera, mematuhi batas yang dikonfigurasi, dan metrik tersimpan serta terlihat.

## Pengujian penerimaan lintas versi

- Validasi aturan bisnis dan batas karakter.
- Uji alur kegagalan provider/API, timeout, dan retry.
- Uji transisi status serta idempotensi untuk publikasi.
- Uji waktu sekitar pergantian hari dan zona waktu Jakarta.
- Uji login dan akses dari perangkat pemilik melalui jaringan privat.
- Uji backup dan pemulihan sebelum deployment permanen.
- Catat hasil uji manual/API dan batasan akun/API yang ditemukan.

## Di luar lingkup awal

Multi-user, SaaS/billing, auto-follow/like/reply massal, scraping, otomasi browser, model lokal, aplikasi native, dan akses publik internet.
