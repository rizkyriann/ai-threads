# Kriteria Penerimaan Dashboard

Checklist ini digunakan saat implementasi UI per versi. Kriteria backend dan integrasi tetap mengacu pada PRD serta rencana implementasi.

## Umum

- [ ] Verifikasi manual bahwa pemilik dapat menavigasi dashboard dengan keyboard tanpa terjebak fokus.
- [ ] Navigasi halaman aktif jelas dan kontrol interaktif berlabel.
- [ ] Semua halaman utama dapat dipakai pada HP dan laptop tanpa scroll horizontal konten.
- [ ] Target sentuh nyaman (minimal 44×44 px) dan tidak bergantung pada hover.
- [ ] Fokus keyboard terlihat; kontras teks normal memadai.
- [ ] Status/error tidak dibedakan hanya dengan warna.
- [ ] Waktu yang ditampilkan menggunakan `Asia/Jakarta`.
- [ ] Loading, empty, error, dan success states tersedia untuk operasi async utama.

## Login dan profile (v0.1)

- [ ] Login memiliki label, progress submit, dan error yang jelas tanpa bocor informasi sensitif.
- [ ] Form profile mencakup kebutuhan profile pada PRD dan dapat digunakan di layar kecil.
- [ ] Contoh tulisan menunjukkan batas jumlah 5–20 serta validasi terkait.
- [ ] Perubahan profile yang disimpan tercatat sebagai versi baru; versi yang dipakai draft dapat diketahui.
- [ ] Perubahan belum tersimpan tidak hilang diam-diam saat pengguna bernavigasi.

## Generate dan edit draft (v0.1)

- [x] Default generasi adalah 5 draft; jumlah yang diminta divalidasi 1–5.
- [ ] Prompt pengguna tetap ada bila request gagal.
- [x] Pengguna dapat menyimpan hasil, mengedit, dan meregenerasi satu draft.
- [ ] Editor menampilkan hitungan karakter; draft di atas batas ditolak dengan pesan jelas.
- [x] Regenerate mengganti draft AI yang sama; perubahan editor yang belum disimpan meminta konfirmasi sebelum ditutup.
- [ ] Draft tersimpan dapat ditemukan lagi dalam daftar/history dengan status dan sumber.

## Dashboard dan history (v0.1)

- [ ] Dashboard mengarahkan pengguna ke draft yang menunggu review dan aksi berikutnya.
- [ ] Tidak ada metrik, antrean, atau status integrasi palsu saat datanya belum tersedia.
- [ ] Filter status/tanggal (bila ada) bekerja bersama empty state yang jelas.

## Koneksi dan publikasi (v0.2)

- [ ] Input token tidak memaparkan token tersimpan dan tidak mengirimkannya ke client setelah penyimpanan.
- [ ] Status koneksi dan kedaluwarsa terlihat.
- [ ] Publish manual meminta aksi eksplisit, memberi progress, dan mencegah submit ganda.
- [ ] Sukses hanya ditampilkan setelah server mengonfirmasi publikasi.
- [ ] Error publikasi memberi status dan langkah berikutnya tanpa membocorkan rahasia.

## Scheduler (v0.3)

- [ ] Pemilihan jadwal menampilkan dan menyimpan waktu lokal dengan benar sebagai UTC.
- [ ] Antrean menampilkan waktu lokal, status, dan aksi yang sesuai.
- [ ] `PUBLISHING`, `FAILED`, dan `MISSED` masing-masing memiliki presentasi dan langkah tindak lanjut yang jelas.
- [ ] Status worker yang tersedia di UI berasal dari data nyata.

## Metrik dan Auto (v0.4)

- [ ] Periode 7/30 hari terlihat jelas; kosong, nol, dan gagal memuat dibedakan.
- [ ] Metrik memiliki label dan konteks; visualisasi tidak mengandalkan warna saja.
- [ ] Kontrol Auto menampilkan batas, jam aktif, status jeda darurat, serta konfirmasi perubahan penting.
- [ ] Jeda darurat mudah ditemukan dan feedback perubahan langsung terlihat.

## Verifikasi manual minimum

- [ ] Coba alur dari login hingga draft tersimpan pada desktop dan HP.
- [ ] Uji keyboard-only dan pembaca layar untuk form, dialog, dan status async utama.
- [ ] Uji prompt kosong, error provider, batas karakter, serta kehilangan koneksi saat menyimpan.
- [ ] Periksa konsistensi visual status di dashboard, daftar, dan detail post.
