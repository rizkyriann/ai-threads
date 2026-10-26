# Pedoman UI Dashboard

Pedoman ini menetapkan arah awal; token visual final dapat disesuaikan saat implementasi dan ditinjau pada perangkat pemilik.

## Arah visual

- Antarmuka editorial dan content-first: teks draft menjadi elemen utama.
- Gunakan layout bersih dengan hirarki tipografi tegas, ruang bernapas, dan panel/kartu seperlunya.
- Hindari dashboard analitik yang padat, dekorasi berlebihan, dan animasi yang tidak membantu tugas.
- Gunakan ikon konsisten dari Lucide sesuai stack PRD; ikon aksi harus memiliki label aksesibel.
- Gunakan warna semantik untuk status dan feedback, bukan sebagai satu-satunya pembeda.

## Tipografi dan konten

- Ukuran teks isi minimal sekitar 16 px untuk kenyamanan baca; teks bantuan tidak boleh terlalu kecil.
- Gunakan line-height yang nyaman untuk paragraf draft.
- Hirarki judul, label, isi, metadata, dan bantuan harus konsisten.
- Isi Threads ditampilkan dengan line break yang dipertahankan dan panjang teks yang mudah dipindai.
- Tanggal/waktu menggunakan format lokal Indonesia dan zona `Asia/Jakarta`; jangan menampilkan UTC mentah ke pengguna.

## Layout dan kepadatan

- Mulai dari layout mobile, perluas untuk tablet/laptop.
- Gunakan lebar konten yang menjaga baris draft mudah dibaca; hindari kolom terlalu lebar.
- Prioritaskan “perlu ditinjau” dan tindakan utama di atas aktivitas sekunder.
- Gunakan grid ringkasan hanya jika informasi tersebut tersedia dan berguna.
- Pastikan halaman tetap berfungsi pada zoom browser dan tidak memerlukan hover.

## Aksesibilitas dan interaksi

- Kontras teks normal minimal 4.5:1; komponen dan indikator fokus harus terlihat jelas.
- Semua fungsi dapat dioperasikan dengan keyboard; urutan fokus mengikuti urutan visual.
- Jangan menghilangkan focus ring tanpa pengganti yang setara.
- Label form selalu terlihat; placeholder hanya contoh, bukan pengganti label.
- Error dihubungkan dengan field terkait dan diumumkan secara semantik kepada teknologi bantu.
- Target sentuh minimal 44×44 px, dengan jarak cukup antartombol.
- Hormati `prefers-reduced-motion`; transisi singkat hanya untuk menunjukkan perubahan keadaan.
- Jangan gunakan warna saja untuk membedakan status; gabungkan teks/ikon.

## Feedback sistem

- **Loading:** skeleton atau indikator sesuai konteks; untuk generate/publish, jelaskan aksi yang sedang berlangsung.
- **Success:** konfirmasi dekat aksi dan status persisten pada daftar/detail.
- **Validation:** pesan spesifik dekat field atau draft terkait.
- **Error:** bahasa jelas, tidak teknis berlebihan, tidak membocorkan token/API key/stack trace, dan sertakan retry bila aman.
- **Empty:** jelaskan mengapa kosong dan berikan CTA berikutnya.
- **Optimistic UI:** gunakan hanya untuk operasi yang dapat dibalik/terjamin; status publikasi tidak boleh menyatakan berhasil sebelum API mengonfirmasi.

## Komponen dan aksi

- Tombol memiliki kata kerja spesifik: “Simpan draft”, “Regenerate”, “Publish sekarang”. Hindari label ambigu seperti “OK”.
- Bedakan aksi utama, sekunder, dan destruktif secara visual.
- Tombol publish, batal, hapus koneksi, atau membuang perubahan harus punya konfirmasi sesuai dampak.
- Saat request sedang berlangsung, cegah aksi duplikat dan tetap tunjukkan status.
- Draft panjang harus nyaman diedit di layar kecil; textarea menyesuaikan kebutuhan tanpa kehilangan akses ke aksi simpan.

## Performa yang dirasakan

- Dashboard sasaran terbuka kurang dari 2 detik pada jaringan rumahan (PRD).
- Hindari memuat chart berat; muat data halaman seperlunya.
- Berikan ukuran/ruang tetap untuk elemen async agar layout tidak melompat.
- Daftar panjang dapat memakai pagination atau pemuatan bertahap jika volume membutuhkannya.
