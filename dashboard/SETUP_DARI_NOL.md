# Setup dari Nol sampai Publik dengan Cloudflare Tunnel

Panduan ini menjelaskan cara menyiapkan Threads AI Dashboard di komputer Windows, menjalankannya di production mode lokal, lalu menerbitkannya melalui Cloudflare Tunnel. Komputer harus tetap hidup dan tersambung internet agar aplikasi dapat diakses.

## Gambaran komponen

- Aplikasi: Next.js 15, Node.js 22 LTS, npm.
- Database: MySQL 8.x lokal.
- Tunnel: `cloudflared`, meneruskan HTTPS publik ke `http://127.0.0.1:3000`.
- Fitur generasi konten memerlukan Gemini API key. Koneksi akun Threads diperlukan untuk fitur Threads.
- Domain sendiri dan akun Cloudflare diperlukan untuk alamat tetap, misalnya `threads.example.com`. Quick Tunnel dapat dipakai untuk uji cepat, tetapi alamatnya acak dan tidak tetap.

## 1. Instal aplikasi yang diperlukan

Unduh dan instal:

1. **Git for Windows** dari <https://git-scm.com/download/win>.
2. **Node.js 22 LTS** dari <https://nodejs.org/>. Installer menyertakan npm.
3. **MySQL Community Server 8.x** dari <https://dev.mysql.com/downloads/installer/>. Saat setup, pilih MySQL Server dan MySQL Workbench; atur password root dan catat dengan aman.
4. **Visual Studio Code** (opsional, untuk mengedit file) dari <https://code.visualstudio.com/>.
5. **cloudflared** dari dokumentasi resmi <https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/>. Di Windows, bisa juga instal dengan `winget install --id Cloudflare.cloudflared` dari PowerShell.

Buka PowerShell baru, lalu pastikan Node dan Git tersedia:

```powershell
node --version
npm --version
git --version
cloudflared --version
```

Node harus menunjukkan versi mayor 22. Pastikan service MySQL sedang berjalan (Windows Services, nama biasanya `MySQL80`).

## 2. Ambil project ke komputer

Clone repository menggunakan URL Git repository project:

```powershell
git clone <URL_REPOSITORY>
cd <NAMA_REPOSITORY>\dashboard
```

Jika source sudah ada di komputer, buka PowerShell di folder `dashboard` yang berisi `package.json`.

Instal dependency sesuai lockfile:

```powershell
npm ci
```

## 3. Buat database dan user aplikasi

Buka MySQL Workbench, sambungkan ke server lokal sebagai `root`, lalu jalankan SQL berikut. Ganti password contoh dengan password kuat:

```sql
CREATE DATABASE threads_ai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'threads_user'@'localhost' IDENTIFIED BY 'GANTI_DENGAN_PASSWORD_KUAT';
GRANT ALL PRIVILEGES ON threads_ai.* TO 'threads_user'@'localhost';
```

Kalau database/user sudah pernah dibuat, jangan jalankan `CREATE` ulang; periksa database dan grant yang ada.

## 4. Atur environment aplikasi

Di PowerShell dari folder `dashboard`:

```powershell
Copy-Item .env.example .env
```

Buka `.env` dan isi nilai berikut. Jangan commit atau mengirim isi file ini ke orang lain.

```dotenv
DATABASE_URL="mysql://threads_user:PASSWORD_URL_ENCODED@127.0.0.1:3306/threads_ai"
GEMINI_API_KEY=""
GEMINI_MODEL="gemini-flash-lite-latest"
THREADS_TOKEN_ENCRYPTION_KEY=""
SCHEDULER_SECRET=""
APP_PASSWORD="GANTI_DENGAN_PASSWORD_LOGIN_YANG_KUAT"
SESSION_SECRET=""
```

Karakter khusus pada password MySQL dalam URL (misalnya `@`, `#`, `/`, `:`) harus di-URL-encode. Pilihan termudah adalah gunakan password database yang terdiri dari huruf dan angka.

Buat secret acak dengan PowerShell (jalankan dari folder project):

```powershell
node -e "const c=require('crypto'); console.log('THREADS_TOKEN_ENCRYPTION_KEY='+c.randomBytes(32).toString('base64')); console.log('SESSION_SECRET='+c.randomBytes(32).toString('hex')); console.log('SCHEDULER_SECRET='+c.randomBytes(32).toString('hex'))"
```

Salin setiap nilai yang dicetak ke variabel yang sesuai di `.env`. Jangan mengubah `THREADS_TOKEN_ENCRYPTION_KEY` setelah menyimpan token Threads karena token tersimpan dienkripsi dengan key tersebut. `SESSION_SECRET` harus setidaknya 32 byte. Untuk membuat draft, dapatkan `GEMINI_API_KEY` di <https://aistudio.google.com/apikey> lalu isi. Tanpa key ini, fitur generasi AI tidak akan berfungsi.

## 5. Terapkan skema database dan uji development

```powershell
npm run db:generate
npm run db:deploy
npm run dev
```

Buka <http://localhost:3000>, login memakai nilai `APP_PASSWORD`, dan pastikan dashboard tampil. Hentikan server development dengan `Ctrl+C` sebelum langkah berikutnya.

## 6. Build dan jalankan mode production lokal

Buat build production:

```powershell
npm run build
```

Konfigurasi Next.js menggunakan output standalone. Untuk menjalankan hasil build pada Windows, jalankan server standalone dengan environment yang dibaca dari `.env` oleh Next.js:

```powershell
$env:HOSTNAME = "127.0.0.1"
$env:PORT = "3000"
node .next/standalone/server.js
```

Biarkan jendela PowerShell ini tetap berjalan. Verifikasi dari komputer yang sama di <http://127.0.0.1:3000>. Tunnel hanya dapat meneruskan trafik jika server aplikasi hidup dan bisa diakses di alamat lokal tersebut.

## 7. Publikasikan lewat Cloudflare Tunnel (domain tetap)

Untuk hostname tetap, domain harus sudah ditambahkan dan aktif di akun Cloudflare. Jika belum punya domain, beli domain lalu tambahkan ke Cloudflare mengikuti instruksi dashboard Cloudflare.

1. Login ke akun Cloudflare:

   ```powershell
   cloudflared tunnel login
   ```

   Browser akan terbuka; pilih domain yang akan dipakai dan izinkan koneksi.

2. Buat named tunnel dan catat ID yang dihasilkan:

   ```powershell
   cloudflared tunnel create threads-dashboard
   cloudflared tunnel list
   ```

3. Buat DNS hostname publik yang mengarah ke tunnel (ganti domain dengan domain milik sendiri):

   ```powershell
   cloudflared tunnel route dns threads-dashboard threads.example.com
   ```

4. Buat konfigurasi tunnel di `%USERPROFILE%\.cloudflared\config.yml`. Ganti `<TUNNEL-UUID>` dengan UUID dari langkah sebelumnya dan sesuaikan hostname:

   ```yaml
   tunnel: <TUNNEL-UUID>
   credentials-file: C:\Users\<NAMA-USER-WINDOWS>\.cloudflared\<TUNNEL-UUID>.json
   ingress:
     - hostname: threads.example.com
       service: http://127.0.0.1:3000
     - service: http_status:404
   ```

   Pastikan path `credentials-file` cocok dengan file JSON yang dibuat oleh `cloudflared tunnel create`.

5. Di PowerShell pertama, jalankan aplikasi production (langkah 6). Buka PowerShell kedua, lalu jalankan:

   ```powershell
   cloudflared tunnel run threads-dashboard
   ```

6. Buka `https://threads.example.com` dari jaringan lain atau ponsel untuk memastikan endpoint publik berfungsi.

Cloudflare Tunnel membuat koneksi keluar dari komputer; tidak perlu membuka port router atau mengekspos port 3000 ke internet. Untuk uji singkat tanpa domain, jalankan `cloudflared tunnel --url http://127.0.0.1:3000`; URL `trycloudflare.com` yang diberikan bersifat sementara dan dapat berubah.

## 8. Jalankan otomatis setelah komputer restart (opsional)

Untuk pemakaian berkelanjutan, aplikasi dan `cloudflared` sama-sama harus berjalan. Cara paling mudah adalah menyiapkan Scheduled Task Windows untuk menjalankan dua perintah tersebut saat login. Alternatif `cloudflared` sebagai service tersedia melalui:

```powershell
cloudflared service install
```

Pastikan konfigurasi tunnel sudah benar sebelum memasangnya sebagai service. Menjalankan `cloudflared` sebagai service saja tidak otomatis menyalakan server Next.js; server aplikasi juga perlu service/task terpisah. Penggunaan komputer personal berarti akses publik akan terputus saat komputer mati, tidur, atau internet terputus.

## 9. Scheduler untuk post terjadwal

Post terjadwal memerlukan pemanggilan endpoint scheduler setiap menit. Repo menyediakan `scripts/run-scheduler.sh` untuk Linux, bukan Windows. Jika ingin memakai scheduler dari komputer Windows, siapkan Scheduled Task yang memanggil endpoint `POST /api/internal/scheduler` tiap menit dengan header `Authorization: Bearer <SCHEDULER_SECRET>`, atau jalankan aplikasi pada server Linux sesuai [`DEPLOYMENT.md`](./DEPLOYMENT.md). Jangan letakkan secret pada URL atau unggah ke repository.

## Catatan keamanan dan troubleshooting

- URL publik dapat dijangkau siapa pun. Gunakan `APP_PASSWORD` yang kuat, jangan bagikan kredensial, dan jaga `.env` serta file kredensial tunnel. Login aplikasi tetap harus digunakan.
- Jika halaman gagal dibuka, pastikan aplikasi production berjalan di `127.0.0.1:3000`, lalu pastikan `cloudflared tunnel run` tidak melaporkan error.
- Jika database gagal tersambung, periksa service MySQL, nama database/user, password, dan `DATABASE_URL`.
- Jika login gagal/error session, pastikan `APP_PASSWORD` terisi dan `SESSION_SECRET` minimal 32 byte, lalu mulai ulang server.
- Jika hostname tidak bisa diakses, verifikasi DNS record tunnel pada Cloudflare, hostname pada `config.yml`, dan UUID/path credentials.
- Setelah mengubah kode atau `.env`, hentikan server, jalankan ulang build (`npm run build`) jika kode berubah, lalu start kembali server dan tunnel.
- Backup database secara berkala. Token Threads terenkripsi ada di database dan bergantung pada `THREADS_TOKEN_ENCRYPTION_KEY`; simpan backup key secara aman.
