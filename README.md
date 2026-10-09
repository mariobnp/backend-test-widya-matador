# Sistem Manajemen Inventaris Barang

Sistem Manajemen Inventaris Barang adalah REST API untuk mengelola data barang milik setiap pengguna. Pengguna bisa membuat akun, login, melihat profil, dan mengelola barang miliknya sendiri.

Project ini dibuat menggunakan Node.js, Express, TypeScript, Prisma ORM, MySQL, JWT, Zod, dan Vitest.

## Fitur

* Registrasi dan login pengguna.
* Password disimpan dalam bentuk hash menggunakan bcrypt.
* Autentikasi menggunakan JWT untuk endpoint yang membutuhkan login.
* CRUD barang, mulai dari menambah, melihat, memperbarui, hingga menghapus barang.
* Setiap pengguna hanya bisa mengakses barang miliknya sendiri.
* Pencarian barang berdasarkan nama dan pagination untuk membagi hasil ke beberapa halaman.
* Validasi request sebelum diproses lebih lanjut.

## Teknologi yang Digunakan

* **Node.js dan Express 5** untuk menjalankan server dan menangani request API.
* **TypeScript** untuk membantu memeriksa tipe data.
* **MySQL dan Prisma ORM 7** untuk menyimpan dan mengelola data.
* **MariaDB driver adapter** untuk menghubungkan Prisma dengan database.
* **JWT dan bcrypt** untuk autentikasi dan keamanan password.
* **Zod** untuk memvalidasi input.
* **Vitest** untuk menjalankan unit test.

## Menjalankan Aplikasi Secara Lokal

### Prasyarat

Sebelum menjalankan aplikasi, pastikan sudah tersedia:

* Node.js dan npm.
* Server MySQL yang sedang berjalan.
* Database MySQL kosong untuk development.

### Langkah instalasi

1. Clone repository, lalu masuk ke folder project.

2. Instal dependency:

   ```bash
   npm ci
   ```

3. Buat database di MySQL. Contohnya:

   ```sql
   CREATE DATABASE backend_test
     CHARACTER SET utf8mb4
     COLLATE utf8mb4_unicode_ci;
   ```

4. Salin file `.env.example` menjadi `.env`, kemudian sesuaikan konfigurasi database dan JWT.

   Contoh isi `.env`:

   ```env
   DATABASE_URL="mysql://<USER>:<PASSWORD>@127.0.0.1:3306/backend_test"
   MYSQL_HOST="127.0.0.1"
   MYSQL_PORT="3306"
   MYSQL_USER="<USER>"
   MYSQL_PASSWORD="<PASSWORD>"
   MYSQL_DATABASE="backend_test"
   JWT_SECRET="<secret-acak-minimal-32-karakter>"
   ```

   `DATABASE_URL` digunakan oleh Prisma CLI, sedangkan konfigurasi `MYSQL_*` digunakan oleh aplikasi melalui MariaDB adapter. Pastikan semuanya mengarah ke database yang sama.

   Jika password MySQL mengandung karakter khusus, karakter tersebut perlu di-encode dengan benar pada `DATABASE_URL`.

   Untuk membuat secret JWT secara acak, jalankan:

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

   Jangan membagikan file `.env` atau memasukkan kredensial ke repository.

5. Jalankan migrasi database dan generate Prisma Client:

   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

6. Jalankan server:

   ```bash
   npm run dev
   ```

   Secara default, aplikasi berjalan di `http://localhost:3000`.

## Dokumentasi API

Dokumentasi API tersedia melalui Swagger UI setelah server dijalankan:

* Swagger UI: `http://localhost:3000/api-docs`
* OpenAPI JSON: `http://localhost:3000/api-docs/openapi.json`

Base URL API lokal:

`http://localhost:3000/api/v1`

Request yang memiliki body harus menggunakan header berikut:

```http
Content-Type: application/json
```

Endpoint Items dan `GET /users/me` membutuhkan token JWT pada header:

```http
Authorization: Bearer <access_token>
```

### 1. Registrasi

`POST /auth/register`

Contoh request:

```json
{
  "name": "Budi Santoso",
  "email": "budi@example.com",
  "password": "Password123!"
}
```

Jika berhasil, API mengembalikan `201 Created`. Email yang sudah digunakan menghasilkan `409 Conflict`, sedangkan input yang tidak valid menghasilkan `400 Bad Request`.

### 2. Login

`POST /auth/login`

Contoh request:

```json
{
  "email": "budi@example.com",
  "password": "Password123!"
}
```

Jika berhasil, API mengembalikan `200 OK` beserta token JWT yang berlaku selama 3600 detik.

Contoh response:

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

Jika email atau password salah, API mengembalikan `401 Unauthorized`.

### 3. Melihat profil pengguna

`GET /users/me`

Endpoint ini membutuhkan token JWT yang valid. Jika berhasil, API mengembalikan data pengguna tanpa password.

Jika token tidak ada atau tidak valid, API mengembalikan `401 Unauthorized`.

### 4. Menambahkan barang

`POST /items`

Endpoint ini membutuhkan autentikasi.

Contoh request:

```json
{
  "name": "Kopi Arabika 250g",
  "description": "Kopi enak dan sehat",
  "stock": 100,
  "price": 75000.00
}
```

Jika berhasil, API mengembalikan `201 Created`.

### 5. Melihat daftar barang

`GET /items`

Endpoint ini membutuhkan autentikasi.

Terdapat beberapa query parameter yang bisa digunakan:

| Parameter | Keterangan                                               | Default      |
| --------- | -------------------------------------------------------- | ------------ |
| `page`    | Nomor halaman, berupa bilangan bulat positif             | `1`          |
| `limit`   | Jumlah barang per halaman, berupa bilangan bulat positif | `10`         |
| `search`  | Mencari barang berdasarkan nama                          | Tanpa filter |

Contoh request:

`GET /items?page=1&limit=10&search=Arabika`

Response berisi daftar barang pada properti `data` dan informasi pagination pada properti `pagination`, seperti nomor halaman, jumlah data per halaman, total barang, dan total halaman.

### 6. Memperbarui barang

`PUT /items/:id`

Endpoint ini membutuhkan autentikasi. Parameter `id` harus berupa UUID, dan request body harus memuat semua field barang.

Contoh request:

```json
{
  "name": "Kopi Arabika 250g Baru",
  "description": "Kopi enak dan sehat",
  "stock": 120,
  "price": 80000.00
}
```

Jika berhasil, API mengembalikan `200 OK`. Jika barang tidak ditemukan atau bukan milik pengguna yang sedang login, API mengembalikan `404 Not Found`.

### 7. Menghapus barang

`DELETE /items/:id`

Endpoint ini membutuhkan autentikasi dan `id` berupa UUID.

Jika berhasil, API mengembalikan `200 OK`. Jika barang tidak ditemukan atau bukan milik pengguna yang sedang login, API mengembalikan `404 Not Found`.

### Aturan validasi barang

* Nama dan deskripsi wajib diisi, dengan panjang maksimum masing-masing 100 dan 255 karakter.
* Stok harus berupa bilangan bulat yang tidak boleh negatif.
* Harga tidak boleh negatif, maksimal memiliki dua angka desimal, dan harus sesuai dengan kapasitas kolom `DECIMAL(10, 2)`.
* Harga pada response API dikirim sebagai JSON number.
* Setiap pengguna hanya bisa melihat, memperbarui, dan menghapus barang miliknya sendiri.

Request yang tidak valid menghasilkan `400 Bad Request`, sedangkan request ke endpoint yang dilindungi tanpa token valid menghasilkan `401 Unauthorized`.

## Pengujian

Untuk menjalankan unit test:

```bash
npm test
```

Untuk menjalankan aplikasi:

```bash
npm run dev
```

Untuk memeriksa tipe TypeScript:

```bash
npx tsc --noEmit
```

## Jawaban Pertanyaan Take-Home Test

### 1. Bagaimana alur request dan pembagian tugas setiap bagian?

Secara umum, alur request pada aplikasi ini adalah:

```text
Client
  -> Express JSON parser
  -> Router
  -> Middleware autentikasi (jika diperlukan)
  -> Controller dan validasi Zod
  -> Service
  -> Model
  -> Prisma Client / MariaDB adapter
  -> MySQL
```

Saya membagi kode menjadi beberapa bagian supaya setiap bagian memiliki tugas yang jelas.

Router menentukan endpoint yang akan dijalankan. Untuk endpoint yang membutuhkan login, middleware akan memeriksa token terlebih dahulu.

Controller menangani request dari pengguna, memvalidasi input menggunakan Zod, dan menentukan response yang dikirim kembali.

Service berisi proses utama aplikasi, seperti registrasi, login, dan pemeriksaan kepemilikan barang. Model digunakan untuk menjalankan operasi database melalui Prisma.

Dengan pembagian ini, kode lebih mudah dibaca dan diperbaiki karena proses HTTP, aturan aplikasi, dan query database tidak dicampur menjadi satu. Selain itu, unit test bisa dibuat dengan mengganti dependency tertentu menggunakan mock.

### 2. Bagaimana cara menjaga keamanan token JWT?

JWT digunakan untuk memastikan bahwa request ke endpoint yang dilindungi berasal dari pengguna yang memiliki token valid.

Dalam aplikasi ini, token dikirim melalui response login dan digunakan pada header `Authorization` dengan format `Bearer`.

Untuk aplikasi web, ada beberapa cara menyimpan token. `localStorage` mudah digunakan, tetapi token yang tersimpan di sana dapat dibaca oleh JavaScript jika terjadi serangan XSS.

Salah satu pilihan adalah menggunakan cookie `HttpOnly`, `Secure`, dan `SameSite` dengan konfigurasi yang sesuai. Namun, penggunaan cookie juga perlu mempertimbangkan perlindungan CSRF.

Pada implementasi backend saat ini, token masih dikirim dalam response JSON. Jika ingin menggunakan cookie, backend perlu diubah agar dapat mengirim token melalui header `Set-Cookie` dan menangani autentikasi menggunakan cookie tersebut.

### 3. Bagaimana jika beberapa request mengurangi stok barang secara bersamaan?

Misalnya, stok barang hanya tersisa satu, tetapi dua request datang hampir bersamaan untuk mengambil barang tersebut.

Jika aplikasi hanya membaca stok terlebih dahulu lalu menguranginya secara terpisah, kedua request berpotensi membaca nilai stok yang sama. Hal ini bisa menyebabkan stok menjadi tidak sesuai.

Salah satu cara untuk menghindarinya adalah melakukan pengurangan stok langsung di database dengan operasi atomik dan kondisi bahwa stok harus cukup.

Dengan Prisma, salah satu pendekatan yang bisa digunakan adalah `updateMany` dengan filter `id`, `userId`, dan `stock: { gte: quantity }`, lalu mengurangi stok menggunakan `decrement`.

Jika jumlah data yang berhasil diperbarui adalah `0`, berarti kondisi update tidak terpenuhi. Aplikasi kemudian perlu menangani kondisi tersebut, misalnya dengan menolak permintaan karena stok tidak cukup atau barang tidak ditemukan.

Saat ini, API saya berfokus pada CRUD barang dan belum memiliki endpoint khusus untuk pemesanan atau pengurangan stok secara bersamaan. Karena itu, pendekatan tersebut merupakan hal yang perlu diterapkan jika fitur transaksi stok ditambahkan nantinya.
