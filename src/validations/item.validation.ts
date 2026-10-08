import { z } from "zod";

const itemFields = {
  name: z
    .string()
    .trim()
    .min(1, { message: "Nama barang wajib diisi." })
    .max(100, { message: "Nama barang maksimal 100 karakter." })
    .refine((value) => /\p{L}/u.test(value), {
      message: "Nama barang harus mengandung minimal satu huruf.",
    }),
  description: z
    .string()
    .min(1, { message: "Deskripsi barang wajib diisi." })
    .max(255, { message: "Deskripsi barang maksimal 255 karakter." }),
  stock: z
    .number()
    .int({ message: "Stok harus berupa bilangan bulat." })
    .nonnegative({ message: "Stok tidak boleh bernilai negatif." }),
  price: z
    .number()
    .finite({ message: "Harga harus berupa angka yang valid." })
    .nonnegative({ message: "Harga tidak boleh bernilai negatif." })
    .max(99_999_999.99, {
      message: "Harga melebihi kapasitas kolom database.",
    })
    .refine((value) => Number(value.toFixed(2)) === value, {
      message: "Harga maksimal memiliki 2 angka di belakang koma.",
    }),
};

export const CreateItemValidation = z.object(itemFields);

// PUT follows the API spec's full-update request shape.
export const UpdateItemValidation = CreateItemValidation;

export const ItemIdValidation = z.object({
  id: z.string().uuid({ message: "ID barang harus berupa UUID yang valid." }),
});

export const ListItemsQueryValidation = z.object({
  page: z.coerce
    .number()
    .int({ message: "page harus berupa bilangan bulat." })
    .positive({ message: "page harus lebih besar dari 0." })
    .optional(),
  limit: z.coerce
    .number()
    .int({ message: "limit harus berupa bilangan bulat." })
    .positive({ message: "limit harus lebih besar dari 0." })
    .optional(),
  search: z.string().optional(),
});
