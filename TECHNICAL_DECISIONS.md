# Keputusan Teknis — Threads AI Assistant


## Keputusan yang mengikuti PRD

| Topik | Keputusan | Status / catatan |
| --- | --- | --- |
| Pengguna | Satu pengguna, pemilik akun | Diputuskan di PRD |
| Framework | Next.js App Router dan TypeScript strict | Diputuskan di PRD |
| UI | Tailwind, shadcn/ui, Lucide | Diputuskan di PRD |
| ORM | Prisma | Diputuskan di PRD |
| Database | MySQL dengan Prisma | Diputuskan pemilik, 26 Oktober 2026; menggantikan rekomendasi SQLite di PRD |
| Provider AI | Gemini Developer API melalui SDK resmi `@google/genai` | Diputuskan pemilik, 26 Oktober 2026; API key Google AI Studio dan model diatur melalui environment |
| Hosting | Laptop pribadi, tanpa Docker; akses privat melalui Tailscale | Diputuskan di PRD |
| Integrasi Threads | API resmi; tidak menggunakan scraping atau browser automation | Diputuskan di PRD |
| Zona waktu | Simpan UTC, antarmuka `Asia/Jakarta` | Diputuskan di PRD |
| Mode operasi awal | Scheduled sebagai default; Auto baru pada v0.4 | Diputuskan di PRD |
| Ukuran post | Maksimal 500 karakter, perlu verifikasi aturan API Meta saat coding | PRD; verifikasi tetap diperlukan |

## Keputusan terbuka

| Topik | Status | Rekomendasi awal / tindakan |
| --- | --- | --- |
| Multi-post thread | Terbuka | PRD menanyakan apakah masuk v0.2. Untuk menjaga MVP sederhana, mulai dari post tunggal; putuskan sebelum desain model final. |
| Login/session | Password tunggal dari `APP_PASSWORD`; JWT HS256 di cookie HTTP-only, SameSite Strict, masa berlaku 12 jam | Implementasi awal melalui `jose`; tambahkan pembatasan percobaan login sebelum akses jaringan yang lebih luas |
| Enkripsi token Threads | AES-256-GCM, nonce acak 12 byte, tag autentikasi 16 byte; key 32 byte base64 di `THREADS_TOKEN_ENCRYPTION_KEY` | Implementasi awal; rotasi key perlu prosedur migrasi sebelum key diganti |
| Worker | Endpoint internal `POST /api/internal/scheduler`, dipanggil cron/systemd timer setiap menit dan dilindungi `SCHEDULER_SECRET` | Dipilih untuk menghindari proses Node terpisah pada server RAM 2 GB |
| Pengelola proses | Terbuka | Pilih systemd atau PM2 berdasarkan kebutuhan operasi dan pemulihan. |
| Notifikasi | Terbuka | Email atau Telegram; opsional pada v0.4. |
| Nama aplikasi | Terbuka | Tidak menghalangi implementasi. |
| Versi runtime/deployment | Terbuka | Kunci versi Node, OS, dan prosedur build/deploy sebelum memasang ke laptop. |

## Catatan evaluasi

- Verifikasi endpoint, scope, batas publikasi, insight, dan refresh token terhadap dokumentasi resmi Meta tepat sebelum implementasi integrasi.
- Token akses Threads dan API key AI adalah rahasia server. Jangan menaruhnya di browser, log, atau repository.
- Perubahan keputusan harus ditinjau dampaknya terhadap skema data, keamanan, migrasi, dan backup.

## Log keputusan

| Tanggal | Keputusan | Alasan | Dampak |
| --- | --- | --- | --- |
| 26 Oktober 2026 | MySQL + Prisma | Pilihan pemilik; cocok dengan database yang ingin dipakai | Membutuhkan server MySQL dan `DATABASE_URL` |
| 26 Oktober 2026 | OpenAI API | Pilihan awal, kemudian diganti atas permintaan pemilik | Tidak lagi digunakan |
| 26 Oktober 2026 | Gemini Developer API | Pilihan pemilik menggantikan OpenAI untuk generasi draft | Membutuhkan `GEMINI_API_KEY`; model saat ini `gemini-flash-lite-latest` |
