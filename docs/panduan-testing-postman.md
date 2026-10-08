# Panduan Testing API dengan Postman

Panduan ini menguji alur berhasil dari registrasi user sampai menghapus barang.
Pastikan MySQL sudah berjalan, konfigurasi `.env` sudah benar, migrasi database
sudah diterapkan, dan server API aktif.

## 1. Jalankan API

Dari root proyek, jalankan:

```bash
npm run dev
```

Pastikan server berjalan di `http://localhost:3000`.

## 2. Siapkan environment Postman

Buat environment baru, misalnya `Inventaris Local`, lalu tambahkan variable:

| Variable | Initial value | Current value |
| --- | --- | --- |
| `base_url` | `http://localhost:3000/api/v1` | `http://localhost:3000/api/v1` |
| `access_token` | kosong | kosong |
| `item_id` | kosong | kosong |

Pilih environment tersebut di Postman sebelum menjalankan request. Semua contoh
di bawah menggunakan `{{base_url}}`.

Untuk setiap request dengan JSON body, pilih **Body → raw → JSON**. Saat
menggunakan Bearer token, pilih **Authorization → Bearer Token** dan isi nilai
dengan `{{access_token}}`.

## 3. Registrasi user

Buat request:

```http
POST {{base_url}}/auth/register
```

Body:

```json
{
  "name": "Budi Santoso",
  "email": "budi.postman.2026@example.com",
  "password": "Password123!"
}
```

Tekan **Send**. Hasil yang diharapkan: status **201 Created**, dengan response
seperti:

```json
{
  "success": true,
  "message": "Registrasi berhasil.",
  "data": {
    "id": "uuid-user",
    "name": "Budi Santoso",
    "email": "budi.postman.2026@example.com",
    "created_at": "2026-10-08T14:00:00.000Z",
    "updated_at": "2026-10-08T14:00:00.000Z"
  }
}
```

Timestamp dan UUID yang dikembalikan akan berbeda. Jika email tersebut sudah
pernah terdaftar, ganti dengan email baru sebelum menjalankan request.

## 4. Login untuk mendapatkan token

Buat request:

```http
POST {{base_url}}/auth/login
```

Body:

```json
{
  "email": "budi.postman.2026@example.com",
  "password": "Password123!"
}
```

Tekan **Send**. Hasil yang diharapkan: status **200 OK**:

```json
{
  "success": true,
  "message": "Login berhasil.",
  "data": {
    "token-type": "Bearer",
    "access_token": "jwt-token-dari-server",
    "expires_in": 3600
  }
}
```

Salin nilai `data.access_token` ke variable environment `access_token`. Token
berlaku selama satu jam.

Untuk menyimpan token otomatis, tambahkan script berikut pada tab **Scripts →
Post-response** request Login:

```javascript
const response = pm.response.json();
pm.environment.set("access_token", response.data.access_token);
```

## 5. (Opsional) Cek current user

Buat request:

```http
GET {{base_url}}/users/me
```

Pada tab **Authorization**, pilih **Bearer Token**, lalu isi token dengan
`{{access_token}}`. Tidak perlu mengirim body.

Hasil yang diharapkan: status **200 OK** dengan data user yang baru diregistrasi
dan tanpa field password.

## 6. Tambah barang

Buat request:

```http
POST {{base_url}}/items
```

Pilih **Authorization → Bearer Token** dan isi `{{access_token}}`. Pada
**Body → raw → JSON**, kirim:

```json
{
  "name": "Kopi Arabika 250g",
  "description": "Kopi enak dan sehat",
  "stock": 100,
  "price": 75000
}
```

Hasil yang diharapkan: status **201 Created**:

```json
{
  "success": true,
  "message": "Barang berhasil dibuat.",
  "data": {
    "id": "uuid-barang",
    "name": "Kopi Arabika 250g",
    "description": "Kopi enak dan sehat",
    "stock": 100,
    "price": 75000,
    "created_at": "2026-10-08T14:05:00.000Z",
    "updated_at": "2026-10-08T14:05:00.000Z"
  }
}
```

Salin nilai `data.id` ke variable environment `item_id`. ID harus UUID yang
dikembalikan server; jangan memakai teks `uuid-barang` dari contoh.

Untuk menyimpan ID otomatis, tambahkan script berikut pada tab **Scripts →
Post-response** request Create Item:

```javascript
const response = pm.response.json();
pm.environment.set("item_id", response.data.id);
```

## 7. Lihat daftar barang

Buat request:

```http
GET {{base_url}}/items?page=1&limit=10&search=Arabika
```

Gunakan Bearer token `{{access_token}}`; tidak perlu body. Hasil yang
diharapkan: status **200 OK**, array `data` berisi barang yang baru dibuat, dan
metadata pagination:

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-barang",
      "name": "Kopi Arabika 250g",
      "description": "Kopi enak dan sehat",
      "stock": 100,
      "price": 75000,
      "created_at": "2026-10-08T14:05:00.000Z",
      "updated_at": "2026-10-08T14:05:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total_items": 1,
    "total_pages": 1
  }
}
```

## 8. Perbarui barang

Buat request:

```http
PUT {{base_url}}/items/{{item_id}}
```

Gunakan Bearer token `{{access_token}}`. Body update harus mengirim semua field:

```json
{
  "name": "Kopi Arabika 250g Premium",
  "description": "Kopi arabika pilihan, kemasan 250 gram",
  "stock": 120,
  "price": 80000
}
```

Hasil yang diharapkan: status **200 OK**, pesan `Barang berhasil diperbarui.`
dan data barang berisi nama baru, stok `120`, serta harga `80000`.

## 9. Hapus barang

Buat request:

```http
DELETE {{base_url}}/items/{{item_id}}
```

Gunakan Bearer token `{{access_token}}`. Tidak perlu body. Hasil yang
diharapkan: status **200 OK** dan pesan sukses:

```json
{
  "success": true,
  "message": "Barang dengan ID uuid-barang berhasil dihapus."
}
```

Pada respons nyata, `uuid-barang` diganti dengan nilai `item_id` yang
sebenarnya. Alur sukses selesai. Jika request DELETE dijalankan sekali lagi
dengan ID yang sama, barang sudah tidak ada sehingga responsnya bukan lagi
sukses.

## Ringkasan urutan request

1. `POST /auth/register`
2. `POST /auth/login`
3. `GET /users/me` (opsional)
4. `POST /items`
5. `GET /items`
6. `PUT /items/{{item_id}}`
7. `DELETE /items/{{item_id}}`
