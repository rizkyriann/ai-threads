# Alur Pengguna Dashboard

Alur berikut berpusat pada satu pemilik akun. Fitur mengikuti roadmap; langkah bertanda versi mendatang baru berlaku saat implementasinya tersedia.

## A. Login

1. Pemilik membuka dashboard melalui jaringan privat.
2. Memasukkan password pada field berlabel.
3. Mengirim form dan melihat indikator proses.
4. Jika berhasil, masuk ke Dashboard; jika gagal, pesan muncul dekat form dan bisa dicoba kembali.

## B. Setup content profile

1. Buka **Content profile**.
2. Isi niche/topik, audiens, nada, bahasa, dan hal yang dihindari.
3. Tambahkan 5–20 contoh tulisan favorit.
4. Tinjau validasi dan simpan.
5. Dashboard mengonfirmasi profile aktif dan versinya.
6. Untuk perubahan berikutnya, tampilkan perubahan yang belum tersimpan dan buat versi baru hanya setelah penyimpanan berhasil.

## C. Generate dan review draft (v0.1)

1. Pilih **Buat draft**.
2. Masukkan topik/ide/prompt, tentukan jumlah bila perlu; default 5.
3. Tinjau profile aktif yang menjadi konteks.
4. Generate; tampilkan progress dan cegah submit berulang.
5. Jika berhasil, tinjau draft satu per satu termasuk karakter dan error validasi.
6. Edit, regenerate draft tertentu, atau simpan.
7. Draft tersimpan terlihat di **Draft & riwayat** dengan sumber dan status.

Jika provider gagal, pertahankan input pengguna, jelaskan masalah secara ringkas, dan sediakan retry.

## D. Edit draft yang sudah tersimpan

1. Buka draft dari dashboard atau daftar.
2. Edit konten; jumlah karakter berubah langsung.
3. Simpan dan dapatkan konfirmasi tersimpan.
4. Jika meninggalkan halaman dengan perubahan belum tersimpan, minta konfirmasi.

## E. Hubungkan akun Threads (v0.2)

1. Buka **Pengaturan → Threads**.
2. Masukkan token pada field rahasia dan simpan.
3. Server memvalidasi koneksi; UI menampilkan hasil dan status tanpa menampilkan kembali token.
4. Jika token tidak valid/kedaluwarsa, tampilkan langkah pemulihan yang relevan.

## F. Publish manual (v0.2)

1. Buka draft dan tinjau isi akhir.
2. Pilih **Publish sekarang**.
3. Tampilkan konfirmasi isi/aksi dan status pengiriman.
4. Cegah pengiriman ganda selama request berjalan.
5. Tampilkan hasil berhasil beserta waktu/tautan bila tersedia, atau error serta tindakan yang aman.
6. Status dan ID post tersimpan di riwayat.

## G. Jadwalkan post (v0.3)

1. Dari draft yang disetujui, pilih **Jadwalkan**.
2. Pilih tanggal dan waktu lokal `Asia/Jakarta`.
3. Tinjau waktu terpilih dan konfirmasi.
4. Draft berpindah menjadi `SCHEDULED`, terlihat di antrean, dan dapat diedit atau dibatalkan sesuai aturan status.
5. Setelah worker memprosesnya, UI memperbarui status menjadi `PUBLISHING`, lalu `PUBLISHED` atau status gagal yang sesuai.

## H. Menangani post gagal/terlewat (v0.3)

1. Dashboard menampilkan peringatan dan post terkait.
2. Pemilik membuka detail untuk membaca status, jadwal, dan ringkasan error yang tidak sensitif.
3. Untuk `FAILED`, pemilik dapat mencoba kembali bila diizinkan dan aman.
4. Untuk `MISSED`, pemilik meninjau ulang lalu menjadwalkan waktu baru atau membatalkan.

## I. Meninjau metrik (v0.4)

1. Pilih periode 7 atau 30 hari.
2. Tinjau ringkasan dan metrik per post.
3. Buka post terbaik untuk melihat konteks dan data snapshot.
4. Dashboard menggunakan contoh performa terbaik pada generasi berikutnya hanya bila fitur feedback loop aktif.

## Aturan lintas alur

- Jangan kehilangan teks input ketika API gagal atau terjadi validasi.
- Tampilkan konfirmasi untuk aksi yang dapat membuang edit atau mengubah status publikasi.
- Semua error harus menawarkan langkah berikutnya jika memungkinkan.
- Aksi asinkron menampilkan loading dan hasil; jangan mengandalkan toast sesaat sebagai satu-satunya rekam status.
- Navigasi kembali mempertahankan konteks yang berguna, seperti filter dan scroll daftar.
