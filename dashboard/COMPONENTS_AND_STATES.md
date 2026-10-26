# Komponen dan Keadaan UI

Komponen di bawah merupakan kosakata desain, bukan keharusan membuat satu file komponen untuk setiap butir. Gunakan pola bersama agar perilaku konsisten.

## Shell aplikasi

- **AppShell:** area navigasi, header, konten utama, dan slot alert.
- **PrimaryNavigation:** link berlabel dan penanda halaman aktif; responsif untuk layar kecil.
- **PageHeader:** judul, konteks singkat, dan aksi utama halaman.
- **GlobalStatusBanner:** peringatan penting seperti koneksi Threads bermasalah atau worker berhenti; hanya tampil jika informasinya nyata.

## Konten dan draft

- **PostCard:** cuplikan teks, status, waktu, sumber, dan aksi kontekstual.
- **PostEditor:** input teks, karakter terpakai/batas, status simpan, dan validasi.
- **DraftGenerationForm:** prompt/ide, jumlah hasil, profile aktif, submit dan progress.
- **DraftResultList:** hasil generate yang dapat diedit/disimpan satu per satu.
- **StatusBadge:** label tekstual dan ikon opsional untuk status post.
- **CharacterCount:** angka karakter dan batas; perubahan batas menunjukkan error yang jelas.
- **ProfileSummary:** ringkasan profile yang dipakai saat generate.

## Profile dan konfigurasi

- **ProfileFormSection:** field terkelompok dengan label, bantuan, validasi.
- **ExamplePostList:** tambah/edit/hapus contoh; menampilkan jumlah dan batas 5–20 sesuai aturan produk.
- **ProfileVersionHistory:** versi, tanggal, dan akses melihat detail.
- **SecretInput:** tidak mengisi nilai rahasia tersimpan kembali; memiliki label dan kontrol tampil/sembunyikan untuk input baru bila diperlukan.
- **ConnectionStatus:** status koneksi dengan teks, username yang aman ditampilkan, dan kedaluwarsa bila tersedia.

## Data dashboard

- **MetricSummaryCard:** angka, nama metrik, periode, dan konteks data; hanya v0.4.
- **QueueList/Agenda:** post terjadwal dan waktu lokal; hanya v0.3+.
- **JobStatusPanel:** status worker/job terakhir; hanya saat worker tersedia.
- **InlineAlert:** informasi, sukses, peringatan, atau error yang relevan pada konteks.
- **ConfirmDialog:** aksi berdampak tinggi, fokus terperangkap, dapat ditutup dengan keyboard sesuai perilaku aksesibel.

## Status post dan gaya presentasi

| Status | Makna ringkas | Presentasi/aksi yang mungkin |
| --- | --- | --- |
| `DRAFT` | Belum disetujui | Edit, regenerate bila didukung, hapus/batalkan sesuai aturan |
| `SCHEDULED` | Disetujui, menunggu jadwal | Tampilkan waktu lokal; edit jadwal atau batalkan |
| `PUBLISHING` | Pengiriman berjalan | Indikator proses; cegah publish duplikat |
| `PUBLISHED` | Berhasil dipublikasikan | Tampilkan waktu dan link/ID bila tersedia |
| `FAILED` | Gagal setelah retry habis | Jelaskan ringkas; tawarkan retry bila aman |
| `MISSED` | Lewat jendela catch-up | Minta tinjau dan jadwalkan ulang atau batalkan |
| `CANCELED` | Dibatalkan pengguna | Status final yang tetap terlihat pada history |

## Matriks keadaan umum

| Konteks | Loading | Kosong | Error | Sukses |
| --- | --- | --- | --- | --- |
| Dashboard | Placeholder ringkasan/list | Sambutan dan CTA buat draft | Banner dengan retry bila aman | Data dimuat dan waktu pembaruan jelas bila perlu |
| Generate | Tombol proses dan progress | Instruksi memasukkan ide | Pertahankan prompt; retry | Daftar hasil muncul dengan aksi per draft |
| Daftar draft | Skeleton kartu | CTA generate draft pertama | Pesan dan muat ulang | Kartu/status dapat difilter |
| Simpan editor | Indikator “Menyimpan…” | — | Perubahan lokal tetap ada dan retry | “Tersimpan” persisten/terlihat |
| Profile | Skeleton form | Setup awal dengan bantuan | Validasi inline atau error pemuatan | Versi tersimpan dikonfirmasi |
| Koneksi Threads | “Memeriksa koneksi…” | Instruksi hubungkan akun (v0.2+) | Pesan aman dan langkah perbaikan | Status terhubung dan kedaluwarsa |
| Metrics | Placeholder (v0.4) | Belum ada post/data di periode | Data terakhir tetap dibedakan dari error terbaru | Nilai, periode, dan waktu snapshot |

## Aksesibilitas komponen

- Dialog mengembalikan fokus ke pemicu saat ditutup.
- Loading dan hasil async diumumkan dengan status live yang tidak terlalu ramai.
- Status badge selalu berisi teks.
- Setiap input punya label yang terkait; error dan bantuan terhubung secara programatik.
- Semua ikon interaktif mempunyai nama aksesibel; dekoratif disembunyikan dari pembaca layar.
