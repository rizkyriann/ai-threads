# Task Dashboard — Threads AI Assistant

Task list ini memecah dokumentasi dashboard menjadi pekerjaan implementasi yang bisa ditandai. Urutan mengikuti roadmap di [`../IMPLEMENTATION_PLAN.md`](../IMPLEMENTATION_PLAN.md). Jangan mengaktifkan UI untuk fitur sebelum fungsinya tersedia.

## 0. Fondasi UI

- [x] Siapkan app shell responsif: navigasi, header, area konten, dan slot notifikasi.
- [x] Tetapkan token warna, tipografi, spacing, focus ring, dan status semantik.
- [ ] Lengkapi pola bersama untuk tombol, field, textarea, badge status, alert, dialog, skeleton, dan empty state.
- [x] Tambahkan focus ring, label aksi ikon, focus trap dialog, dan target aksi utama minimal 44×44 px.
- [ ] Uji manual navigasi keyboard, pembaca layar, kontras, serta target sentuh pada perangkat.
- [x] Buat layout dasar mobile-first; uji manual lintas ukuran layar masih perlu dilakukan.

## 1. v0.1 — Dashboard dan draft

### Login

- [x] Buat halaman login satu pemilik dengan label password dan keadaan submitting.
- [x] Tampilkan error login secara aman dan dekat dengan form.

### Content profile

- [x] Buat halaman form profile: niche/topik, audiens, nada, bahasa, aturan/hal yang dihindari.
- [x] Buat pengelolaan 5–20 contoh tulisan favorit.
- [x] Tampilkan validasi field, jumlah contoh, dan konfirmasi simpan.
- [x] Buat tampilan riwayat versi profile serta versi yang dipakai draft.

### Generator dan editor draft

- [x] Buat form ide/topik/prompt bebas dengan default jumlah 5 draft.
- [x] Tampilkan profile yang menjadi konteks generasi bila sudah tersimpan.
- [x] Buat loading, error/retry, dan success state untuk generate.
- [x] Tampilkan hasil sebagai kartu yang dapat diedit dan disimpan.
- [x] Regenerate satu draft AI tanpa membuat draft duplikat.
- [x] Buat editor draft dengan hitungan karakter dan batas 500 karakter.
- [x] Minta konfirmasi saat menutup draft/profile dengan perubahan belum disimpan; browser warning aktif untuk perubahan profile.
- [x] Tampilkan sumber draft, tanggal, dan versi profile.

### Dashboard dan history

- [x] Buat beranda dengan draft menunggu review dan aksi utama.
- [x] Tampilkan daftar draft dari MySQL dengan status, cuplikan teks, tanggal, pencarian, dan filter.
- [x] Sambungkan pencarian/filter dan state kosong ke daftar draft.
- [x] Sediakan empty state saat filter/pencarian tidak menemukan draft.
- [x] Buat layout responsif untuk HP dan laptop; verifikasi perangkat nyata masih perlu dilakukan.

## 2. v0.2 — Koneksi Threads dan publish manual

- [x] Buat halaman pengaturan akun Threads.
- [x] Buat input token rahasia; token tersimpan terenkripsi dan tidak ditampilkan kembali.
- [x] Tampilkan status koneksi, username, dan kedaluwarsa bila tersedia.
- [x] Buat UI aksi publish manual dengan konfirmasi dan progress.
- [x] Cegah pengiriman ganda melalui klaim status atomik.
- [x] Tampilkan status berhasil/gagal tanpa membocorkan rahasia.
- [x] Tampilkan ID post yang dikembalikan API setelah publish.

## 3. v0.3 — Scheduler dan status operasi

- [x] Buat pemilih tanggal/waktu yang menggunakan waktu lokal `Asia/Jakarta` dan menyimpan UTC.
- [x] Buat agenda/antrean post terjadwal dengan aksi ubah waktu dan batal.
- [x] Tampilkan status `PUBLISHING`, `FAILED`, `MISSED`, dan langkah tindak lanjut.
- [x] Tambahkan status worker/job dan waktu proses terakhir berdasarkan `JobLog`.
- [x] Pertahankan konteks antrean saat mengubah jadwal atau membatalkannya.
- [x] Sediakan endpoint scheduler rahasia untuk dipanggil cron/systemd timer, dengan catch-up dua jam dan retry terbatas.

## 4. v0.4 — Metrik dan mode Auto

- [x] Buat ringkasan metrik periode 7 dan 30 hari.
- [x] Tampilkan views, likes, replies, reposts, quotes bila tersedia.
- [x] Bedakan nilai nol, data belum ada, dan kegagalan pengambilan.
- [x] Buat tampilan post terbaik serta konteks performanya; contoh teratas digunakan untuk prompt generasi berikutnya.
- [ ] Buat pengaturan mode Manual/Scheduled/Auto dengan Scheduled sebagai default.
- [ ] Tampilkan batas post harian, jam aktif, dan status jeda darurat.
- [ ] Pastikan tombol jeda darurat mudah ditemukan dan memberi feedback segera.

## 5. Verifikasi dashboard

- [ ] Ikuti seluruh kriteria di [`ACCEPTANCE_CRITERIA.md`](./ACCEPTANCE_CRITERIA.md).
- [ ] Uji alur login → profile → generate → edit → simpan di desktop dan HP.
- [ ] Uji keyboard-only dan teknologi bantu pada form, dialog, navigasi, serta status async utama.
- [ ] Uji error provider, validasi karakter, perubahan belum disimpan, dan koneksi terputus.
- [ ] Pastikan status terlihat konsisten di dashboard, list, dan detail.
- [ ] Periksa tampilan pada viewport kecil, zoom browser, dan orientasi landscape.

## Di luar task dashboard

API/backend, integrasi Meta, worker, backup, deployment laptop, dan pengambilan metrik ditangani dalam task implementasi utama. UI terkait hanya diaktifkan setelah sumber data dan perilaku backend siap.
