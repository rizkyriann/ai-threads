# Spesifikasi Dashboard

## Tujuan

Dashboard membantu pemilik akun menyelesaikan review konten dengan cepat dari laptop maupun HP: melihat hal yang perlu ditindaklanjuti, membuat atau mengedit draft, dan memahami status publikasi. Produk hanya memiliki satu pengguna dan tidak menyediakan area publik.

## Prinsip UX

- Konten dan aksi berikutnya menjadi fokus; dashboard bukan halaman analitik berat.
- Status selalu terlihat dan menggunakan label teks, bukan warna saja.
- Aksi penting dapat dilakukan dengan keyboard dan layar sentuh.
- Draft tidak terbit hanya karena dibuka atau diedit; publish membutuhkan aksi eksplisit atau jadwal yang disetujui.
- Jangan menampilkan kontrol yang tampak aktif bila fitur/API terkait belum tersedia.
- Waktu tampil dalam zona `Asia/Jakarta`.

## Navigasi utama

Navigasi desktop berupa sidebar atau navigasi ringkas; pada layar kecil gunakan menu yang mudah dijangkau tanpa mengorbankan ruang konten.

1. **Dashboard** — ringkasan dan tindakan berikutnya.
2. **Buat draft** — generator AI.
3. **Draft & riwayat** — daftar konten berdasarkan status.
4. **Content profile** — gaya, audiens, aturan, contoh, versi.
5. **Pengaturan** — akun Threads, koneksi, dan konfigurasi yang tersedia pada versi tersebut.

Tautan navigasi harus memiliki label yang jelas, indikator halaman aktif, fokus keyboard, dan target sentuh minimal 44×44 px.

## Struktur halaman

### 1. Login

- Form satu password pemilik dengan label eksplisit.
- Password dapat ditampilkan/sembunyikan; jangan menyimpan password di browser.
- Error login tampil dekat form tanpa mengungkap apakah informasi rahasia tertentu benar.
- Keadaan submitting terlihat dan tombol tidak mengirim berulang kali.

### 2. Dashboard / Beranda

Susunan prioritas:

1. Header dengan sapaan/identitas aplikasi dan akses profile/pengaturan.
2. Peringatan operasional yang perlu tindakan (misalnya koneksi Threads bermasalah pada v0.2+).
3. Ringkasan: draft menunggu review, antrean hari ini, dan post gagal bila fitur sudah tersedia.
4. Daftar “Perlu ditinjau” berisi draft terbaru dan CTA ke editor.
5. Agenda/aktivitas terbaru; pada v0.1 tampilkan riwayat draft tanpa mengesankan scheduler sudah tersedia.
6. Ringkasan metrik 7/30 hari hanya pada v0.4 setelah pengumpulan metrik aktif.

Setiap kartu ringkasan dapat mengarahkan ke daftar terkait dan menyertakan angka, label, serta konteks periode bila relevan. Jangan menampilkan angka dummy dalam penggunaan nyata.

### 3. Buat draft

- Field topik/ide/prompt bebas dengan label dan teks bantuan.
- Pilihan jumlah draft (default 5) dengan batas yang ditetapkan aplikasi.
- Tampilkan ringkasan profile aktif yang akan memberi konteks pada generasi.
- Tombol generate menunjukkan status proses, mencegah pengiriman ganda, dan memberi cara mencoba ulang saat gagal.
- Hasil tampil sebagai daftar kartu draft; setiap kartu punya edit, regenerate satu draft, dan simpan.
- Post tunggal menampilkan jumlah karakter dan batas maksimal 500 karakter.
- Format thread hanya muncul bila fitur thread multi-post telah diputuskan dan diimplementasikan.

### 4. Editor draft

- Editor teks dengan jumlah karakter yang selalu terlihat.
- Simpan perubahan dengan indikator tersimpan/belum tersimpan.
- Tampilkan sumber (AI/manual), tanggal dibuat/diubah, dan versi profile yang digunakan.
- Sediakan regenerasi tanpa menimpa suntingan diam-diam; konfirmasi bila perubahan lokal akan hilang.
- Aksi publish/jadwalkan hanya muncul sesuai versi dan status koneksi.
- Tombol destruktif atau pembatalan diberi label eksplisit dan konfirmasi jika sulit dibatalkan.

### 5. Draft & riwayat

- Daftar post dengan status, cuplikan isi, tanggal dibuat atau jadwal, dan aksi yang sesuai status.
- Filter status dan tanggal; pertahankan filter saat kembali dari detail jika memungkinkan.
- Status yang berasal dari PRD: `DRAFT`, `SCHEDULED`, `PUBLISHING`, `PUBLISHED`, `FAILED`, `MISSED`, `CANCELED`.
- Filter dan status masa depan tidak ditampilkan sebelum relevan.
- Duplikasi post lama menjadi draft baru dapat ditambahkan pada versi history yang mendukungnya.

### 6. Content profile

- Form terkelompok: niche/topik, audiens, nada, bahasa, aturan dan hal yang dihindari.
- Pengelolaan 5–20 contoh post favorit, termasuk penanda contoh terbaik bila didukung.
- Simpan menghasilkan versi baru; perubahan yang belum disimpan tidak boleh tampak sebagai versi aktif.
- Sediakan tampilan riwayat versi dengan tanggal dan kemampuan melihat isi versi lama.
- Validasi, batas input, dan pesan error berada dekat field terkait.

### 7. Pengaturan dan koneksi Threads (v0.2+)

- Input token bersifat rahasia; nilai yang sudah tersimpan tidak ditampilkan kembali.
- Perlihatkan status koneksi, username bila tersedia, dan kedaluwarsa token.
- Tombol uji/perbarui koneksi memberi feedback; error tidak membocorkan token.
- Konfirmasi sebelum mengganti atau menghapus koneksi.

### 8. Jadwal dan worker (v0.3+)

- Tampilkan waktu lokal Jakarta secara konsisten beserta tanggal.
- Agenda menyediakan edit jadwal, batal, dan buka post.
- `PUBLISHING` memperlihatkan proses; `FAILED` menjelaskan kegagalan yang aman dibagikan dan aksi retry bila tersedia; `MISSED` meminta peninjauan.
- Status worker/job dan waktu pemeriksaan terakhir dapat dilihat dari dashboard atau halaman operasi.

### 9. Metrik (v0.4+)

- Ringkasan periode 7/30 hari, dengan definisi metrik dan waktu snapshot.
- Views, likes, replies, reposts, quotes jika disediakan API.
- Bedakan “belum ada data” dari nilai nol dan dari kegagalan pengambilan.
- Gunakan tabel/list yang mudah dibaca sebagai alternatif visual chart.

## Responsif

- Rancang mobile-first agar tugas review nyaman pada HP.
- Pada layar kecil, kartu dan form menjadi satu kolom; tabel berubah menjadi daftar/kartu dengan label field.
- Hindari scroll horizontal untuk konten utama.
- Form panjang dibagi bagian yang jelas; tombol utama tetap mudah ditemukan tanpa menutupi konten.
- Uji viewport sempit, orientasi landscape, dan zoom browser.

## Di luar dashboard

Balas komentar dan berdiskusi tetap berlangsung manual di aplikasi Threads. Dashboard tidak mengimplementasikan auto-follow, auto-like, atau auto-reply massal.
