# Setup Pengembangan Lokal

Panduan ini untuk menjalankan aplikasi dashboard di komputer development. Backend menggunakan Prisma + MySQL dan generasi memakai Gemini Developer API. Deployment ke laptop server akan didokumentasikan terpisah ketika v0.3.

## Prasyarat

- Git.
- Node.js 22 LTS dan npm.
- MySQL 8.x yang berjalan lokal atau dapat diakses dari komputer development.
- Gemini API key dari Google AI Studio untuk generasi.

## Mulai

1. Masuk ke direktori `dashboard`.
2. Jalankan `npm install`.
3. Buat database MySQL kosong dan user khusus aplikasi, misalnya:

   ```sql
   CREATE DATABASE threads_ai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'threads_user'@'localhost' IDENTIFIED BY 'ganti-password-kuat';
   GRANT ALL PRIVILEGES ON threads_ai.* TO 'threads_user'@'localhost';
   ```

4. Salin `.env.example` menjadi `.env` lokal. Isi `DATABASE_URL`, `GEMINI_API_KEY`, `APP_PASSWORD`, `SESSION_SECRET`, `THREADS_TOKEN_ENCRYPTION_KEY`, dan `SCHEDULER_SECRET`; jangan commit `.env`.
5. Atur nilai `SESSION_SECRET` menjadi random minimal 32 byte. Jangan gunakan contoh placeholder pada server.
   Buat `THREADS_TOKEN_ENCRYPTION_KEY` dengan `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`.
6. Jalankan `npm run db:deploy` untuk menerapkan migration awal yang tersedia.
7. Jalankan `npm run dev` dan buka alamat lokal yang ditampilkan.

Scheduler dipanggil setiap menit oleh cron atau systemd timer ke endpoint lokal `POST /api/internal/scheduler` dengan header `Authorization: Bearer $SCHEDULER_SECRET`. Endpoint ini dilindungi bearer secret dari environment server. Scheduler menerapkan catch-up maksimal dua jam, retry terbatas, dan menulis ringkasan ke tabel `JobLog`.

Untuk perubahan skema berikutnya selama development, jalankan `npm run db:migrate -- --name <nama-migrasi>`.

Untuk build produksi, jalankan `npm run db:generate`, `npm run build`, lalu `npm start`. Di server gunakan `npm run db:deploy` untuk menerapkan migration yang sudah dibuat.

### Menjalankan scheduler setiap menit (Ubuntu/Debian)

Scheduler disediakan sebagai endpoint lokal yang diotorisasi dengan `SCHEDULER_SECRET`. Setelah aplikasi dijalankan sebagai service, tambahkan cron entry untuk user service:

```cron
* * * * * bash /path/ke/project/dashboard/scripts/run-scheduler.sh >/dev/null 2>&1
```

Script membaca `.env` lokal tanpa mencetak secret, lalu memanggil endpoint melalui loopback `127.0.0.1`. Status run dan ringkasannya tersimpan pada `JobLog` dan terlihat di halaman Jadwal.


## Pemeriksaan sebelum perubahan dikirim

- Jalankan formatter/linter yang dikonfigurasi proyek.
- Jalankan pemeriksaan TypeScript.
- Jalankan test suite yang tersedia.
- Jalankan build production.
- Periksa bahwa file environment, token, dan database lokal tidak terikut dalam perubahan.

## Database lokal

Gunakan database terpisah untuk development. Skema MySQL didefinisikan pada `dashboard/prisma/schema.prisma`; migrasi dikelola melalui Prisma. Buat user database khusus aplikasi, bukan memakai akun root pada deployment. Jangan memakai atau menghapus database produksi untuk pengembangan. Uji backup dan restore menggunakan salinan lokal.

## Troubleshooting

- **Environment tidak lengkap:** bandingkan nama variabel yang dibutuhkan dengan `.env.example`; jangan membagikan isi `.env` saat meminta bantuan.
- **Koneksi MySQL gagal:** pastikan service MySQL berjalan, database dan user telah dibuat, serta `DATABASE_URL` benar.
- **Koneksi Gemini gagal:** pastikan `GEMINI_API_KEY` berasal dari Google AI Studio dan kuota API tersedia; jangan menampilkan key dalam log.
- **Skema database tidak sesuai:** jalankan `npm run db:migrate -- --name <nama-migrasi>` pada development dan tinjau migration sebelum menerapkan ke produksi.
