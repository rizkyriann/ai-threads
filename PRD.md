# PRD: Threads AI Assistant

Versi 0.1 (Draft) · 25 Oktober 2026 · Pemilik: Rian · Penggunaan pribadi, satu pengguna

## 1. Ringkasan

Threads AI Assistant adalah aplikasi web pribadi untuk membantu mengembangkan satu akun Threads. Aplikasi membuat draft postingan dengan AI sesuai gaya penulis, menjadwalkannya, mempublikasikannya lewat Threads API resmi, lalu mengumpulkan metrik untuk memperbaiki draft berikutnya. Aplikasi berjalan di laptop bekas (RAM 2 GB) sebagai server rumahan, tanpa Docker. Aplikasi bersifat privat: hanya pemilik yang mengaksesnya lewat jaringan privat, dan tidak ada pengguna publik.

Aplikasi ini bukan pengganti kehadiran pemilik akun. Interaksi seperti membalas komentar, ikut diskusi, dan follow tetap dikerjakan manual.

## 2. Latar Belakang dan Masalah

- Konsisten posting itu melelahkan: ide dan waktu menulis sering habis.
- Draft AI yang generik terdengar seperti AI dan tidak mencerminkan suara pemilik.
- Tidak ada umpan balik sistematis tentang jenis konten yang berhasil.
- Biaya harus rendah: tanpa langganan tool penjadwal dan tanpa VPS berbayar.

## 3. Tujuan dan Non-Tujuan

**Tujuan**

- G1: Menghasilkan draft yang sesuai suara pemilik; target minimal 50% draft disetujui dengan edit ringan.
- G2: Post terjadwal tayang tepat waktu (selisih maksimal 2 menit) dan tidak pernah dobel.
- G3: Review harian selesai dalam 10 menit atau kurang.
- G4: Berjalan stabil di laptop RAM 2 GB tanpa Docker; biaya operasional hanya API AI.
- G5: Metrik performa tersimpan dan dipakai untuk memperbaiki prompt.

**Non-tujuan**

- Multi-user, SaaS, billing, role, dan fitur agency.
- Auto-follow, auto-like, dan auto-reply massal.
- Scraping atau browser automation untuk publish.
- Menjalankan model AI secara lokal di laptop.
- Aplikasi mobile native (cukup web responsif atau PWA), halaman publik, dan akses dari internet terbuka.

## 4. Pengguna dan Konteks Penggunaan

Satu pengguna: pemilik akun, seorang developer full-stack di Indonesia. Dashboard hanya diakses pemilik dari HP dan laptop lewat jaringan privat (Tailscale); tidak ada pengguna publik. Zona waktu antarmuka Asia/Jakarta, sedangkan penyimpanan waktu di database memakai UTC.

## 5. Prinsip Produk

1. **Human-in-the-loop:** mode default adalah Scheduled; mode Auto bersifat opsional dan dibatasi.
2. **API resmi saja:** tidak ada scraping dan tidak ada otomasi browser.
3. **Sederhana:** satu developer, satu server, satu akun.
4. **Hemat sumber daya:** semua komponen harus muat di RAM 2 GB.
5. **Aman secara default:** token dan kunci API hanya ada di server dan terenkripsi.

## 6. Lingkup Fitur

### F1. Personal Content Profile

- Menyimpan niche, topik, target audiens, nada bicara, bahasa, hal yang dihindari, dan 5–20 contoh postingan favorit.
- Setiap draft mencatat versi profile yang dipakai.
- Kriteria: profile dapat dibuat, diubah, dan dilihat riwayat versinya.

### F2. AI Draft Generator

- Membuat N draft (default 5) dari topik, ide, atau prompt bebas.
- Format: post tunggal (maksimal 500 karakter) dan thread (beberapa post berurutan).
- Prompt disusun dari profile, contoh terbaik, dan (mulai v0.4) ringkasan metrik.
- Pengguna dapat meregenerasi satu draft, mengedit manual, dan menyimpan.
- Kriteria: draft yang melebihi batas karakter ditolak dengan pesan jelas; error provider AI ditampilkan dan bisa dicoba ulang.

### F3. Integrasi Threads (token akun sendiri)

- Menghubungkan satu akun Threads memakai token akun sendiri yang dibuat manual dari dashboard aplikasi Meta dan dimasukkan lewat halaman pengaturan; token disimpan terenkripsi. Alur OAuth penuh bersifat opsional dan ditunda.
- Long-lived token diperbarui otomatis sebelum kedaluwarsa (sekitar 60 hari); dashboard memberi peringatan bila pembaruan gagal.
- Status koneksi selalu terlihat.

### F4. Publishing

- Publish manual (“Publish sekarang”) dan publish terjadwal.
- Alur dua langkah ke Threads API: buat media container, lalu publish.
- Thread dipublikasikan berurutan sebagai balasan berantai.
- Kunci idempoten mencegah post terkirim dobel.

### F5. Scheduler dan Worker

- Worker memeriksa antrean setiap menit.
- Catch-up setelah laptop mati: post yang terlewat dalam batas waktu tertentu (default 2 jam) tetap dipublikasikan; yang lebih lama ditandai MISSED untuk ditinjau.
- Retry dengan backoff maksimal 3 kali, lalu status FAILED.

### F6. Mode Otomasi

- **Manual:** semua aksi dilakukan pengguna.
- **Scheduled (default):** AI membuat draft, pengguna menyetujui, sistem mempublikasikan sesuai jadwal.
- **Auto:** AI membuat dan menjadwalkan draft harian, lalu publish tanpa review. Dilengkapi batas post per hari, jam aktif, dan tombol jeda darurat.

### F7. Content History

- Daftar semua post dengan filter status dan tanggal, lengkap dengan metrik.
- Duplikasi post lama menjadi draft baru.

### F8. Dashboard Minimal

- Antrean hari ini, draft yang menunggu review, status token, post gagal, dan ringkasan metrik 7 dan 30 hari.

### F9. Metrik dan Feedback Loop (v0.4)

- Job harian menarik views, likes, replies, reposts, dan quotes untuk setiap post, lalu menyimpannya sebagai snapshot.
- Post berperforma terbaik ditandai dan dipakai sebagai contoh dalam prompt berikutnya.

## 7. Alur Pengguna Utama

1. **Setup sekali:** hubungkan akun Threads, isi content profile.
2. **Harian:** worker membuat draft, pengguna mereview dari HP, menyetujui dan memilih jam tayang, worker mempublikasikan, lalu metrik terkumpul dan memperbaiki draft berikutnya.
3. **Interaksi manual:** pengguna membalas komentar dan berdiskusi langsung di aplikasi Threads, di luar sistem ini.

## 8. Status Post

| Status | Arti |
| --- | --- |
| DRAFT | Draft dibuat AI atau manual, belum disetujui |
| SCHEDULED | Disetujui dan menunggu jam tayang |
| PUBLISHING | Sedang dikirim ke Threads API |
| PUBLISHED | Berhasil tayang, ID Threads tersimpan |
| FAILED | Gagal setelah retry habis |
| MISSED | Jam tayang terlewat melebihi batas catch-up |
| CANCELED | Dibatalkan pengguna |

Aturan: transisi ke PUBLISHING dilakukan secara atomik (update bersyarat di database). Bila worker mati di tengah proses, saat startup sistem memeriksa ke Threads API apakah post sudah tayang sebelum melakukan retry.

## 9. Arsitektur dan Infrastruktur

**Gambaran**

Pengguna (HP atau laptop) → Tailscale (jaringan privat) → Laptop server berisi Next.js (dashboard dan API), Worker (cron), dan Database. Worker memanggil API provider AI dan Threads API.

**Anggaran memori (RAM 2 GB)**

| Komponen | Perkiraan |
| --- | --- |
| OS server minimal tanpa GUI | 200–300 MB |
| Next.js (build standalone) | 300–500 MB |
| Worker | sekitar 100 MB |
| Database | SQLite hampir 0; PostgreSQL 100–200 MB |
| Tailscale | 30–50 MB |
| Swap file 2 GB | pengaman saat lonjakan |

**Keputusan arsitektur**

- OS: Ubuntu Server atau Debian minimal tanpa GUI.
- Tanpa Docker. Proses dikelola PM2 (atau systemd) dengan auto-start setelah reboot.
- Build dilakukan di luar laptop (PC utama atau GitHub Actions) dengan `output: standalone`, lalu hasil build dikirim ke laptop.
- Database default SQLite lewat Prisma. PostgreSQL menjadi opsi bila kebutuhan tumbuh.
- Worker berupa proses Node ringan dengan node-cron, atau endpoint scheduler yang dipanggil cron sistem setiap menit.
- Akses privat lewat Tailscale tanpa membuka port; dashboard tidak terekspos ke internet publik dan tidak membutuhkan domain atau callback publik.
- Pengaturan laptop: lid close diabaikan, auto-boot setelah listrik mati, dan baterai yang menggembung dilepas.
- Fallback: jika beban terlalu berat, worker dan database tetap di laptop, sedangkan Next.js dipindah ke VPS kecil dengan akses tetap privat.

**Stack:** Next.js App Router, TypeScript strict, Tailwind, shadcn/ui, Lucide, Prisma, satu provider AI, Threads API resmi.

## 10. Model Data (Ringkas)

- **Profile:** id, version, niche, audience, tone, language, rules, createdAt.
- **ExamplePost:** id, profileId, text, isTop.
- **Post:** id, status, mode, scheduledAt (UTC), publishedAt, profileVersion, source (AI atau MANUAL), threadsMediaId, idempotencyKey, retryCount, errorMessage.
- **PostPart:** id, postId, order, text, threadsMediaId (untuk thread).
- **ThreadsAccount:** id, threadsUserId, username, accessToken (terenkripsi), tokenExpiresAt.
- **Metric:** id, postId, capturedAt, views, likes, replies, reposts, quotes.
- **Setting:** key, value (mode otomasi, batas harian, jam aktif, jeda darurat).
- **JobLog:** id, job, startedAt, status, detail.

## 11. Integrasi Eksternal

**Threads API (Meta)**

- Buat container: `POST /{user-id}/threads` dengan `media_type=TEXT` dan `text`.
- Publish: `POST /{user-id}/threads_publish` dengan `creation_id`.
- Insights: `GET /{media-id}/insights`.
- Refresh long-lived token lewat endpoint refresh resmi.
- Catatan implementasi: batas 500 karakter, batas jumlah post per 24 jam, dan scope izin (publish dan insights) harus diverifikasi ke dokumentasi resmi Meta saat mulai coding. Untuk akun sendiri, aplikasi Meta dalam mode development dengan akun sebagai tester umumnya tidak memerlukan app review. Token akun sendiri dapat dibuat langsung dari dashboard aplikasi Meta (bila tersedia), sehingga alur OAuth penuh tidak wajib.

**Provider AI**

- Satu provider; kunci API disimpan di environment server.
- Timeout, retry terbatas, dan batas anggaran bulanan di dalam aplikasi.

## 12. Kebutuhan Non-Fungsional

- **Performa:** halaman dashboard terbuka kurang dari 2 detik di jaringan rumahan; total pemakaian memori di bawah 1,5 GB.
- **Keandalan:** tidak ada post dobel; catch-up setelah mati; jam server sinkron lewat NTP.
- **Keamanan:** akses hanya lewat Tailscale; login cukup satu password pemilik dengan session aman, tanpa registrasi dan tanpa reset password; token dienkripsi (AES-GCM, kunci di environment); file `.env` tidak masuk repo; SSH hanya dengan key; firewall aktif; update keamanan otomatis.
- **Observabilitas:** log terstruktur dengan rotasi, halaman JobLog, dan notifikasi kegagalan (email atau Telegram, opsional).
- **Backup:** backup database harian terenkripsi ke luar laptop, disimpan 14 hari.
- **Biaya:** hanya biaya API AI, dengan batas anggaran.

## 13. Kebijakan dan Kepatuhan

- Hanya memakai API resmi; tanpa scraping dan tanpa otomasi browser.
- Tidak ada auto-follow, auto-like, atau auto-reply massal.
- Mengikuti kebijakan platform Meta dan Threads, termasuk pelabelan konten AI bila diwajibkan.
- Mode Auto dibatasi pada topik yang ada di profile, dan klaim faktual tetap sebaiknya direview.

## 14. Metrik Keberhasilan

- Minimal 50% draft disetujui dengan edit ringan setelah 2 minggu penyesuaian profile.
- 100% post terjadwal tayang dalam 2 menit dari jadwal; nol post dobel.
- Waktu review harian 10 menit atau kurang.
- Uptime worker minimal 95% per bulan (menyesuaikan hosting rumahan).
- Pertumbuhan akun (follower dan rata-rata views per post) dipantau sebagai indikator, bukan target keras.

## 15. Roadmap

| Versi | Fokus | Isi utama |
| --- | --- | --- |
| v0.1 | AI Draft Generator | Password tunggal, profile, generate, edit, simpan draft, history dasar |
| v0.2 | Threads Publishing | Token akun sendiri, publish manual, refresh token |
| v0.3 | Scheduler | Worker, antrean, retry, catch-up, deploy ke laptop (PM2, Tailscale, backup) |
| v0.4 | Personal Automation | Mode Auto, metrik, feedback loop, notifikasi |

Setiap versi dirilis dan dipakai dulu sebelum lanjut ke versi berikutnya.

## 16. Risiko dan Mitigasi

| Risiko | Mitigasi |
| --- | --- |
| Laptop mati atau listrik padam | Catch-up worker, auto-boot, monitoring sederhana |
| RAM 2 GB habis | Build di luar laptop, swap, SQLite, pantau dengan htop |
| Token Meta kedaluwarsa | Job refresh terjadwal dan peringatan di dashboard |
| Post dobel | Kunci idempoten dan transisi status atomik |
| Akun dibatasi karena perilaku otomatis | Hanya API resmi, batas post harian, tanpa aksi massal |
| Draft AI terdengar generik | Profile kaya contoh, review manual, feedback loop metrik |
| Kebocoran token atau kunci API | Enkripsi, `.env` di luar repo, SSH key, akses hanya lewat Tailscale |
| Biaya API AI membengkak | Batas anggaran bulanan dan jumlah draft per hari |

## 17. Pertanyaan Terbuka

- SQLite atau PostgreSQL sebagai database awal?
- Provider AI mana yang dipakai?
- Nama final aplikasi?
- Notifikasi kegagalan lewat apa (email atau Telegram)?
- Apakah fitur thread multi-post masuk v0.2 atau ditunda?
