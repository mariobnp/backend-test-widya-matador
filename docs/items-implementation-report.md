# Laporan Rencana Implementasi CRUD Items

## Tujuan

Melengkapi endpoint CRUD barang sesuai `API-Spec.md` dan `Requirements.md`,
mengikuti pola fitur register serta login yang sudah ada. Semua endpoint Items
akan memerlukan autentikasi JWT dan setiap barang hanya dapat diakses oleh user
yang memilikinya.

## Langkah Pengerjaan

1. **Periksa validasi dan tipe data yang sudah tersedia**
   - Gunakan schema Zod untuk create, update, UUID parameter, dan query list.
   - Pastikan validasi nama, deskripsi, stok bilangan bulat nonnegatif, serta
     harga nonnegatif sesuai kapasitas kolom `DECIMAL(10, 2)`.
   - Lengkapi tipe request dan tipe respons barang, termasuk harga numerik dan
     timestamp dalam format ISO.

2. **Buat model Items**
   - Tambahkan fungsi Prisma untuk membuat, mencari, memperbarui, menghapus,
     dan mengambil daftar barang.
   - Terapkan filter `userId` pada seluruh operasi baca/perubahan agar user
     tidak dapat membaca atau mengubah barang milik user lain.
   - Untuk daftar, terapkan pencarian nama, pagination, dan penghitungan total.

3. **Buat service Items**
   - Hubungkan input tervalidasi dengan fungsi model.
   - Konversi harga Prisma Decimal menjadi number pada bentuk respons API.
   - Tentukan nilai pagination bawaan (`page=1`, `limit=10`) dan gunakan error
     404 jika barang tidak ditemukan atau bukan milik user yang meminta.
   - Bentuk respons pagination sesuai spesifikasi endpoint.

4. **Buat controller Items**
   - Validasi body, parameter `id`, dan query melalui helper `validate`.
   - Ambil `userId` dari request yang telah dilewati middleware autentikasi.
   - Gunakan status dan pesan respons sesuai endpoint create, list, update,
     dan delete; teruskan error ke error middleware.

5. **Daftarkan routes Items**
   - Tambahkan `POST /`, `GET /`, `PUT /:id`, dan `DELETE /:id`.
   - Pasang middleware autentikasi pada seluruh route Items.
   - Daftarkan router pada prefix `/api/v1/items`.

6. **Tambahkan unit test**
   - Uji validasi payload, UUID, query pagination, serta batas stok dan harga.
   - Uji alur service sukses dan gagal, termasuk item tidak ditemukan,
     kepemilikan user, hasil pencarian kosong, serta error database.
   - Uji controller atau route untuk memastikan autentikasi dan bentuk/status
     respons sesuai kontrak.

7. **Verifikasi**
   - Jalankan test Items yang relevan, seluruh test suite, dan pemeriksaan
     TypeScript.
   - Periksa status Git untuk memastikan hanya perubahan yang dimaksud yang
     tersisa.

## Urutan Commit

Sesuai instruksi pengerjaan proyek, setiap file implementasi akan di-commit
setelah selesai dengan pesan berawalan `feat:` atau `test:`. Laporan ini dibuat
dan disimpan terlebih dahulu sebelum implementasi dimulai.
