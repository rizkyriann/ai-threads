# Dokumentasi Dashboard

Dashboard Next.js Threads AI Assistant sekaligus dokumentasi UI-nya. Dokumen produk utama: [`../PRD.md`](../PRD.md).

Ringkasan framework, database, autentikasi, dan integrasi ada di [`../TECH_STACK.md`](../TECH_STACK.md).

## Menjalankan aplikasi

Ikuti [`../SETUP.md`](../SETUP.md). Singkatnya: `npm install`, salin `.env.example` ke `.env`, siapkan MySQL, jalankan migration Prisma, lalu `npm run dev`.

Generasi memakai Gemini Developer API. API key disimpan server-side di `.env` dan diperoleh dari Google AI Studio.

## Dokumen

- [`DASHBOARD_SPEC.md`](./DASHBOARD_SPEC.md) — tujuan dashboard, navigasi, halaman, dan cakupan per versi.
- [`USER_FLOWS.md`](./USER_FLOWS.md) — alur utama pengguna dan perilaku interaksi.
- [`UI_GUIDELINES.md`](./UI_GUIDELINES.md) — prinsip visual, responsif, aksesibilitas, dan feedback.
- [`COMPONENTS_AND_STATES.md`](./COMPONENTS_AND_STATES.md) — komponen UI, status, empty/loading/error states.
- [`ACCEPTANCE_CRITERIA.md`](./ACCEPTANCE_CRITERIA.md) — checklist penerimaan dashboard.
- [`TASK.md`](./TASK.md) — daftar pekerjaan implementasi dashboard.

## Prioritas implementasi

1. v0.1: login, dashboard ringkas, generator draft, editor draft, profile, dan history dasar.
2. v0.2: status koneksi Threads dan aksi publish manual.
3. v0.3: jadwal, antrean, endpoint scheduler, catch-up, retry, dan status operasi.
4. v0.4: metrik, ringkasan performa, serta kontrol mode Auto dan jeda darurat.

Item pada versi mendatang tidak perlu ditampilkan sebagai fitur aktif sebelum backend-nya tersedia. Bila perlu, tampilkan status “belum tersedia” hanya jika membantu pemahaman pengguna.
