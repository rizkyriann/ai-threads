# Tech Stack — Threads AI Assistant

Ringkasan teknologi yang dipakai aplikasi saat ini. Untuk aturan produk lihat [`PRD.md`](./PRD.md); untuk cara menjalankan lokal lihat [`SETUP.md`](./SETUP.md).

## Ringkasan

| Area | Teknologi | Pemakaian |
| --- | --- | --- |
| Runtime | Node.js 22 LTS | Menjalankan Next.js, Prisma, dan API server-side |
| Package manager | npm | Instalasi dependency dan script proyek |
| Web framework | Next.js 15 App Router | Halaman dashboard, server rendering, dan Route Handlers |
| UI | React 19, TypeScript strict | Komponen interaktif dan tipe aplikasi |
| Styling | CSS global custom di `app/globals.css` | Design tokens, layout, komponen, dan responsive behavior |
| Ikon | Lucide React | Ikon navigasi dan aksi dashboard |
| Validasi input | Zod 4 | Validasi request API dan hasil generasi AI |
| Database | MySQL 8.x | Penyimpanan profile, contoh post, draft, akun Threads, dan status post |
| ORM / migrations | Prisma 6 | Model data, Prisma Client, serta migration MySQL |
| Provider AI | Gemini Developer API, SDK `@google/genai` | Membuat dan meregenerasi draft melalui model dari `GEMINI_MODEL` |
| Autentikasi | JWT HS256, library `jose` | Session pemilik di cookie HTTP-only selama 12 jam |
| Enkripsi token | AES-256-GCM (`node:crypto`) | Mengenkripsi access token Threads sebelum disimpan di MySQL |
| Integrasi sosial | Threads Graph API resmi | Validasi akun, refresh token, pembuatan container teks, dan publish manual |
| Metrics / job log | Prisma models `MetricSnapshot` dan `JobLog` | Snapshot harian Insights API dan pemantauan job scheduler |
| Lint | ESLint 9 + `eslint-config-next` | Pemeriksaan gaya dan aturan Next.js |
| Build | Next.js standalone output | Build production untuk pemindahan ke server |

## Struktur aplikasi

- `dashboard/app/` — halaman App Router dan Route Handlers API.
- `dashboard/components/` — shell dashboard, editor profile, form login, dan pengaturan Threads.
- `dashboard/lib/` — helper autentikasi/JWT, Gemini, Prisma, enkripsi token, dan Threads API.
- `dashboard/prisma/` — schema MySQL dan migrations.
- `dashboard/app/globals.css` — styling responsif dashboard.

## Integrasi server-side

1. Browser berkomunikasi dengan Next.js Route Handlers.
2. Route Handlers memvalidasi session JWT sebelum membaca atau mengubah data.
3. Prisma menyimpan data ke MySQL.
4. Generator memanggil Gemini API dari server; API key tidak dikirim ke browser.
5. Token Threads dienkripsi dengan AES-256-GCM sebelum disimpan. Token hanya didekripsi server saat memanggil Threads API.

## Konfigurasi environment

Nama variabel yang dipakai (nilainya tidak disimpan di repository):

- `DATABASE_URL` — koneksi MySQL untuk Prisma.
- `GEMINI_API_KEY` — API key Gemini Developer API.
- `GEMINI_MODEL` — model Gemini; default saat ini `gemini-flash-lite-latest`.
- `APP_PASSWORD` — password login pemilik.
- `SESSION_SECRET` — secret random minimal 32 byte untuk menandatangani JWT HS256.
- `THREADS_TOKEN_ENCRYPTION_KEY` — key random 32 byte dalam base64 untuk AES-256-GCM.
- `SCHEDULER_SECRET` — bearer secret untuk cron memanggil endpoint scheduler internal.

Template variabel tersedia di [`dashboard/.env.example`](./dashboard/.env.example). File `.env` bersifat lokal dan tidak boleh masuk repository.

## Menjalankan dan pemeriksaan

Jalankan perintah berikut dari direktori `dashboard/`:

```bash
npm install
npm run db:generate
npm run db:deploy
npm run dev
```

Pemeriksaan yang tersedia:

```bash
npm run typecheck
npm run lint
npm run build
npm audit
```

## Deployment sasaran

- Build Next.js memakai `output: "standalone"`; deployment tanpa Docker.
- Akses dashboard dibatasi ke jaringan privat Tailscale.
- MySQL berjalan di server; scheduler berjalan melalui endpoint internal yang dipanggil cron/systemd timer setiap menit.

## Perbedaan dari stack yang direncanakan di PRD

- Database awal diputuskan menjadi **MySQL + Prisma**, menggantikan rekomendasi SQLite.
- Provider AI yang dipakai adalah **Gemini**, bukan OpenAI.
- UI saat ini memakai CSS custom dan Lucide React; Tailwind/shadcn belum dipasang.
- Login sudah menggunakan JWT HS256 melalui `jose`.
