import { z } from "zod";

const emailSchema = z
  .string()
  .email({ message: "Format email tidak valid." })
  .max(100, { message: "Email maksimal 100 karakter." })
  .refine((value) => value === value.toLowerCase(), {
    message: "Email harus terdiri dari huruf kecil semua.",
  })
  .refine(
    (value) => {
      const localPart = value.slice(0, value.lastIndexOf("@"));
      return (
        localPart.length >= 1 &&
        localPart.length <= 100 &&
        /^[a-z0-9](?:[a-z0-9._+-]*[a-z0-9])?$/.test(localPart) &&
        !localPart.includes("..")
      );
    },
    {
      message:
        "Bagian email sebelum @ harus diawali dan diakhiri huruf atau angka; karakter khusus yang diizinkan adalah titik, garis bawah, tanda hubung, dan plus.",
    },
  );

const passwordSchema = z
  .string()
  .min(8, { message: "Password minimal 8 karakter." })
  .max(100, { message: "Password maksimal 100 karakter." });

export const RegisterUserValidation = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Nama wajib diisi." })
    .max(100, { message: "Nama maksimal 100 karakter." })
    .regex(/^[\p{L} ]+$/u, {
      message: "Nama hanya boleh berisi huruf dan spasi.",
    }),
  email: emailSchema,
  password: passwordSchema,
});

export const LoginUserValidation = z.object({
  email: emailSchema,
  password: passwordSchema,
});
