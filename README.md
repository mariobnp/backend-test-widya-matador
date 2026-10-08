# Sistem Manajemen Inventaris Barang

REST API untuk registrasi dan autentikasi pengguna serta pengelolaan barang
milik masing-masing pengguna. Aplikasi dibuat menggunakan Node.js, Express,
TypeScript, Prisma ORM 7, MySQL, JWT, Zod, dan Vitest.

## Fitur

- Registrasi dan login dengan password yang di-hash menggunakan bcrypt.
- Autentikasi JWT untuk endpoint profil dan barang.
- CRUD barang yang dibatasi berdasarkan pemiliknya.
- Pencarian barang berdasarkan nama dan pagination.
- Validasi request sebelum data diteruskan ke database.

## Teknologi

- Node.js dan Express 5
- TypeScript
- MySQL dengan Prisma ORM 7 dan MariaDB driver adapter
- JWT (`jsonwebtoken`) dan bcrypt
- Zod untuk validasi
- Vitest untuk unit test

## Menjalankan secara lokal

### Prasyarat

- Node.js dan npm
- Server MySQL yang berjalan
- Database MySQL kosong untuk development

### Setup

1. Clone repository dan masuk ke direktori proyek.
2. Pasang dependency:

   ```bash
   npm ci
   ```

3. Buat database development di MySQL, misalnya:

   ```sql
   CREATE DATABASE backend_test
     CHARACTER SET utf8mb4
     COLLATE utf8mb4_unicode_ci;
   ```

4. Salin `.env.example` menjadi `.env`, lalu isi konfigurasi MySQL dan
   `JWT_SECRET` dengan nilai milik Anda. Contoh format:

   ```env
   DATABASE_URL="mysql://<USER>:<PASSWORD>@127.0.0.1:3306/backend_test"
   MYSQL_HOST="127.0.0.1"
   MYSQL_PORT="3306"
   MYSQL_USER="<USER>"
   MYSQL_PASSWORD="<PASSWORD>"
   MYSQL_DATABASE="backend_test"
   JWT_SECRET="<secret-acak-minimal-32-karakter>"
   ```

   `DATABASE_URL` digunakan oleh Prisma CLI, sedangkan aplikasi memakai
   `MYSQL_*` melalui adapter MariaDB. Arahkan keduanya ke database yang sama.
   Jika password database mengandung karakter khusus di URL, lakukan
   URL-encoding. Jangan commit atau membagikan `.env` dan jangan gunakan
   kredensial development untuk produksi.

   Untuk menghasilkan `JWT_SECRET` acak, jalankan:

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

5. Terapkan migrasi dan generate Prisma Client:

   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

6. Jalankan server:

   ```bash
   npm run dev
   ```

   Server berjalan pada `http://localhost:3000`.

## Dokumentasi API

Swagger UI tersedia saat server aktif di `http://localhost:3000/api-docs`.
Spesifikasi OpenAPI mencakup endpoint registrasi, login, current user, dan
seluruh endpoint Items, termasuk request, response, validasi, serta autentikasi.
Dokumen OpenAPI dalam format JSON tersedia di
`http://localhost:3000/api-docs/openapi.json`.

Base URL lokal: `http://localhost:3000/api/v1`

Semua request dengan body harus menggunakan `Content-Type: application/json`.
Endpoint Items dan `GET /users/me` memerlukan header:

```http
Authorization: Bearer <access_token>
```

### Registrasi

`POST /auth/register`

```json
{
  "name": "Budi Santoso",
  "email": "budi@example.com",
  "password": "Password123!"
}
```

Berhasil: `201 Created`. Email yang sudah dipakai menghasilkan `409 Conflict`;
input yang tidak valid menghasilkan `400 Bad Request`.

### Login

`POST /auth/login`

```json
{
  "email": "budi@example.com",
  "password": "Password123!"
}
```

Berhasil: `200 OK`, dengan access token yang berlaku 3600 detik:

```json
{
  "success": true,
  "message": "Login berhasil.",
  "data": {
    "token-type": "Bearer",
    "access_token": "<jwt>",
    "expires_in": 3600
  }
}
```

Email atau password yang salah menghasilkan `401 Unauthorized`.

### Current user

`GET /users/me`

Memerlukan autentikasi. Berhasil: `200 OK` beserta data user tanpa password.
Token tidak ada atau tidak valid menghasilkan `401 Unauthorized`.

### Membuat barang

`POST /items` (memerlukan autentikasi)

```json
{
  "name": "Kopi Arabika 250g",
  "description": "Kopi enak dan sehat",
  "stock": 100,
  "price": 75000.00
}
```

Berhasil: `201 Created`.

### Melihat daftar barang

`GET /items` (memerlukan autentikasi)

Query parameter opsional:

| Parameter | Keterangan | Default |
| --- | --- | --- |
| `page` | Nomor halaman, bilangan bulat positif | `1` |
| `limit` | Jumlah barang per halaman, bilangan bulat positif | `10` |
| `search` | Filter nama barang | Tidak ada filter |

Contoh: `GET /items?page=1&limit=10&search=Arabika`

Respons memuat array `data` dan objek `pagination` dengan `page`, `limit`,
`total_items`, dan `total_pages`.

### Memperbarui barang

`PUT /items/:id` (memerlukan autentikasi). `id` harus berupa UUID dan body
memuat semua field barang:

```json
{
  "name": "Kopi Arabika 250g Baru",
  "description": "Kopi enak dan sehat",
  "stock": 120,
  "price": 80000.00
}
```

Berhasil: `200 OK`. Barang yang tidak ada atau bukan milik user menghasilkan
`404 Not Found`.

### Menghapus barang

`DELETE /items/:id` (memerlukan autentikasi). `id` harus berupa UUID.
Berhasil: `200 OK`. Barang yang tidak ada atau bukan milik user menghasilkan
`404 Not Found`.

### Aturan validasi barang

- Nama dan deskripsi wajib diisi; panjang maksimum masing-masing 100 dan 255
  karakter.
- Stok harus berupa bilangan bulat nonnegatif.
- Harga harus berupa angka nonnegatif dengan maksimum dua angka desimal dan
  sesuai kapasitas kolom `DECIMAL(10, 2)`.
- Nilai harga pada respons API dikirim sebagai JSON number.
- Setiap user hanya dapat melihat, memperbarui, atau menghapus barang miliknya.

Request tidak valid menghasilkan `400 Bad Request`; request tanpa token yang
valid menghasilkan `401 Unauthorized`.

## Pengujian

Jalankan seluruh unit test:

```bash
npm test
```

Jalankan aplikasi:
```bash
npm run dev
```

Periksa tipe TypeScript:

```bash
npx tsc --noEmit
```

## Jawaban pertanyaan take-home test

### 1. Alur request dan pemisahan tanggung jawab

Alur umum request adalah:

```text
Client
  -> Express JSON parser
  -> Router
  -> Middleware autentikasi (untuk endpoint yang dilindungi)
  -> Controller dan validasi Zod
  -> Service
  -> Model
  -> Prisma Client / MariaDB adapter
  -> MySQL
```

Router memilih endpoint dan middleware autentikasi memverifikasi Bearer token
sebelum handler berjalan. Controller membaca request, memvalidasi body, query,
atau parameter, lalu membentuk status dan struktur response. Service menangani
aturan bisnis, seperti kepemilikan barang dan pagination. Model berisi operasi
Prisma yang mengakses database.

Pemisahan ini menjaga setiap lapisan memiliki tanggung jawab yang jelas,
memudahkan pengujian tanpa database nyata, serta membuat perubahan aturan bisnis
atau penyimpanan tidak perlu mencampur kode HTTP dan query database. Pada fitur
ini validasi dilakukan di controller melalui helper Zod; autentikasi berjalan
lebih dahulu pada route yang dilindungi. Registrasi dan login tidak memerlukan
middleware autentikasi.

### 2. Keamanan dan penyimpanan JWT

Untuk aplikasi web di browser, pilihan yang lebih aman terhadap pencurian token
melalui JavaScript adalah cookie `HttpOnly`, `Secure`, dan `SameSite` yang
sesuai kebutuhan. `HttpOnly` mencegah JavaScript membaca token, `Secure`
membatasi pengiriman ke HTTPS, dan `SameSite` membantu mengurangi risiko CSRF.
Jika cookie digunakan untuk autentikasi, tetap tinjau perlindungan CSRF dan
konfigurasi domain/CORS.

`localStorage` mudah digunakan, tetapi dapat dibaca oleh JavaScript sehingga
serangan XSS dapat mencuri token. Bila token tetap dikirim dalam response JSON
seperti kontrak API saat ini, client browser sebaiknya menyimpannya sesingkat
mungkin, misalnya hanya di memori, dan tidak menaruhnya di `localStorage` tanpa
memahami risikonya. Implementasi backend saat ini mengembalikan token di JSON;
untuk beralih ke cookie perlu menambahkan pengiriman `Set-Cookie` pada backend.

### 3. Penanganan konkurensi saat mengurangi stok

Jangan membaca stok terlebih dahulu di aplikasi, lalu menulis hasil
pengurangannya berdasarkan nilai lama. Dua request bersamaan bisa sama-sama
membaca stok `1` dan kemudian keduanya menyimpan `0`, sehingga salah satu
pemesanan tampak berhasil walaupun stok sudah habis.

Pengurangan stok harus dilakukan atomik di database dengan syarat stok saat ini
setidaknya sebesar jumlah yang diminta. Dengan Prisma, pola yang dapat digunakan
adalah `updateMany` dengan filter `id`, `userId`, dan `stock: { gte: quantity }`,
serta operasi atomik `stock: { decrement: quantity }`. Jika `count` hasil update
adalah `0`, barang tidak ada, bukan milik user, atau stok tidak mencukupi dan
request harus ditolak. Jika perubahan stok merupakan bagian dari transaksi
bisnis lain, jalankan operasi terkait dalam transaksi database yang sama.
Dengan stok awal `1`, hanya satu request bersamaan yang dapat mengubahnya; yang
lainnya gagal dan stok tidak menjadi negatif.

Saat ini API yang didefinisikan menyediakan CRUD penuh barang, bukan endpoint
khusus untuk pemesanan atau pengurangan stok secara bersamaan. Pola atomik
tersebut perlu diterapkan ketika operasi pengurangan stok ditambahkan.
