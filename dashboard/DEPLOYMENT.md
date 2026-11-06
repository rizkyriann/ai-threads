# Deployment ke Server Linux

Panduan ini untuk menjalankan Threads Studio di server Linux local lab, jaringan lokal, atau Tailscale. Contoh perintah menggunakan Ubuntu/Debian.

## Prasyarat

- Node.js 22 LTS dan npm
- MySQL 8.x
- Git
- User Linux khusus untuk aplikasi, misalnya `threads-app`
- Akses jaringan lokal atau Tailscale

Jangan membuka MySQL ke internet umum. Gunakan user database khusus aplikasi, bukan user `root`.

## 1. Siapkan Database

Masuk ke MySQL sebagai administrator:

```sql
CREATE DATABASE threads_ai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'threads_user'@'localhost' IDENTIFIED BY 'PASSWORD_DB_YANG_KUAT';
GRANT ALL PRIVILEGES ON threads_ai.* TO 'threads_user'@'localhost';
```

## 2. Ambil Project

Clone repository ke server dan masuk ke directory aplikasi:

```bash
git clone <URL_REPOSITORY>
cd <NAMA_REPOSITORY>/dashboard
npm ci
```

Pastikan perubahan terbaru sudah masuk repository. File yang hanya ada di PC kerja dan belum di-commit tidak akan ikut saat `git clone` atau `git pull`.

Jangan menyalin `node_modules` atau `.next` dari Windows ke Linux. Dependency dan build harus dibuat ulang di server Linux.

## 3. Environment Production

Salin template environment:

```bash
cp .env.example .env
```

Isi nilai production berikut:

```text
DATABASE_URL
GEMINI_API_KEY
GEMINI_MODEL
THREADS_TOKEN_ENCRYPTION_KEY
SCHEDULER_SECRET
APP_PASSWORD
SESSION_SECRET
```

Gunakan secret berbeda dari development. Generate nilai acak dengan OpenSSL:

```bash
openssl rand -base64 32
openssl rand -hex 32
openssl rand -hex 32
```

`THREADS_TOKEN_ENCRYPTION_KEY` harus berupa base64 dari tepat 32 byte. Jangan mengganti key ini setelah token Threads tersimpan, kecuali sudah memiliki proses re-enkripsi.

Jika aplikasi dijalankan dengan user `threads-app`, berikan kepemilikan file environment kepada user tersebut dan batasi izinnya:

```bash
sudo chown threads-app:threads-app .env
chmod 600 .env
```

Jangan commit `.env` atau membagikan isinya.

## 4. Migration dan Build

Jalankan dari directory `dashboard`:

```bash
npm run db:generate
npm run db:deploy
npm run build
```

## 5. Uji Manual

Jalankan aplikasi pada port lokal:

```bash
npx next start
```

Uji login dan halaman dashboard melalui `http://127.0.0.1:3000` dari server, lalu hentikan dengan Ctrl+C.

## 6. Jalankan dengan PM2

Install PM2 secara global dan jalankan aplikasi dengan konfigurasi yang sudah disediakan:

```bash
npm install -g pm2
pm2 start ecosystem.config.cjs
pm2 save
```

Setup auto-start saat server reboot (ikuti instruksi yang dicetak ke terminal):

```bash
pm2 startup systemd
pm2 save
```

Perintah `pm2 startup` otomatis membuat unit systemd untuk menyalakan PM2 saat boot, sehingga tidak perlu membuat unit file manual.

Perintah berguna sehari-hari:

```bash
pm2 status
pm2 logs threads-studio
pm2 restart threads-studio
pm2 stop threads-studio
pm2 monit
```

Gunakan reverse proxy HTTPS jika aplikasi perlu diakses dari perangkat lain. Untuk local lab, batasi akses ke LAN atau Tailscale dan jangan membuka port Node langsung ke internet.

## 7. Jalankan Scheduler dengan Cron

Script scheduler tersedia di:

```text
scripts/run-scheduler.sh
```

Script membaca `.env` project dan memanggil endpoint scheduler melalui loopback `127.0.0.1`. Pastikan script executable:

```bash
chmod +x scripts/run-scheduler.sh
```

Uji manual:

```bash
bash scripts/run-scheduler.sh
```

Tambahkan cron untuk user aplikasi:

```bash
crontab -e
```

```cron
* * * * * bash /path/ke/repository/dashboard/scripts/run-scheduler.sh >/dev/null 2>&1
```

Scheduler memproses post terjadwal, retry terbatas, catch-up maksimal dua jam, dan pengambilan metrik yang sudah waktunya. Status job dapat dilihat di halaman Jadwal.

## 8. Update Aplikasi

Sebelum update, backup database. Kemudian:

```bash
cd /path/ke/repository/dashboard
git pull
npm ci
npm run db:generate
npm run db:deploy
npm run build
pm2 restart threads-studio
```

Perintah `pm2 restart` dijalankan dari directory `dashboard`. Jika `.env` berubah isi, gunakan `pm2 restart threads-studio --update-env`.

## 9. Smoke Test Setelah Deploy

- Buka dashboard dan login.
- Buka Content profile.
- Hubungkan akun Threads.
- Generate satu draft.
- Edit draft dan simpan.
- Jadwalkan post beberapa menit ke depan.
- Pastikan cron berjalan dan status worker berubah aktif.
- Pastikan post diproses sesuai jadwal.
- Periksa log service dan `JobLog` jika scheduler gagal.

## Troubleshooting

### Aplikasi tidak bisa start

```bash
pm2 logs threads-studio --lines 100
```

Periksa `DATABASE_URL`, `SESSION_SECRET`, dan permission `.env`.

### Migration gagal

```bash
npx prisma migrate status
```

Gunakan `npm run db:deploy` di server production. Jangan gunakan `prisma migrate dev` pada database production.

### Scheduler tidak aktif

Uji endpoint melalui script:

```bash
bash /path/ke/repository/dashboard/scripts/run-scheduler.sh
```

Kemudian periksa cron, `SCHEDULER_SECRET`, status service, dan log:

```bash
pm2 logs threads-studio
```
