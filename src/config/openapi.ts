import type { JsonObject } from "swagger-ui-express";

export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Sistem Manajemen Inventaris Barang API",
    version: "1.0.0",
    description:
      "REST API untuk autentikasi user dan pengelolaan barang inventaris.",
  },
  servers: [
    {
      url: "http://localhost:3000/api/v1",
      description: "Server development lokal",
    },
  ],
  tags: [
    { name: "Authentication", description: "Registrasi dan login user" },
    { name: "Users", description: "Data user yang sedang login" },
    { name: "Items", description: "Barang milik user yang sedang login" },
  ],
  paths: {
    "/auth/register": {
      post: {
        tags: ["Authentication"],
        summary: "Registrasi user",
        operationId: "registerUser",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterRequest" },
              example: {
                name: "Budi Santoso",
                email: "budi@example.com",
                password: "Password123!",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Registrasi berhasil",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UserSuccessResponse" },
              },
            },
          },
          "400": {
            description: "Validasi request gagal",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "409": {
            description: "Email sudah terdaftar",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "500": {
            description: "Kesalahan server",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "Login user",
        operationId: "loginUser",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
              example: {
                email: "budi@example.com",
                password: "Password123!",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Login berhasil",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginSuccessResponse" },
              },
            },
          },
          "400": {
            description: "Validasi request gagal",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "401": {
            description: "Email atau password salah",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "500": {
            description: "Kesalahan server",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/users/me": {
      get: {
        tags: ["Users"],
        summary: "Ambil data user yang sedang login",
        operationId: "getCurrentUser",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Data user berhasil diambil",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UserSuccessResponse" },
              },
            },
          },
          "401": {
            description: "Token tidak ada atau tidak valid",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "404": {
            description: "User tidak ditemukan",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "500": {
            description: "Kesalahan server",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/items": {
      post: {
        tags: ["Items"],
        summary: "Tambah barang",
        operationId: "createItem",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ItemRequest" },
              example: {
                name: "Kopi Arabika 250g",
                description: "Kopi enak dan sehat",
                stock: 100,
                price: 75000,
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Barang berhasil dibuat",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ItemSuccessResponse" },
              },
            },
          },
          "400": {
            description: "Validasi request gagal",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "401": {
            description: "Token tidak ada atau tidak valid",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "500": {
            description: "Kesalahan server",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      get: {
        tags: ["Items"],
        summary: "Lihat daftar barang",
        operationId: "listItems",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "page",
            in: "query",
            description: "Nomor halaman (default: 1)",
            required: false,
            schema: { type: "integer", minimum: 1, default: 1 },
          },
          {
            name: "limit",
            in: "query",
            description: "Jumlah barang per halaman (default: 10)",
            required: false,
            schema: { type: "integer", minimum: 1, default: 10 },
          },
          {
            name: "search",
            in: "query",
            description: "Filter nama barang",
            required: false,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Daftar barang berhasil diambil",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ItemsListResponse" },
              },
            },
          },
          "400": {
            description: "Validasi query gagal",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "401": {
            description: "Token tidak ada atau tidak valid",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "500": {
            description: "Kesalahan server",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/items/{id}": {
      put: {
        tags: ["Items"],
        summary: "Perbarui barang",
        operationId: "updateItem",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            description: "UUID barang",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ItemRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Barang berhasil diperbarui",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ItemSuccessResponse" },
              },
            },
          },
          "400": {
            description: "ID atau body tidak valid",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "401": {
            description: "Token tidak ada atau tidak valid",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "404": {
            description: "Barang tidak ditemukan atau bukan milik user",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "500": {
            description: "Kesalahan server",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Items"],
        summary: "Hapus barang",
        operationId: "deleteItem",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            description: "UUID barang",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": {
            description: "Barang berhasil dihapus",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["success", "message"],
                  properties: {
                    success: { type: "boolean", example: true },
                    message: {
                      type: "string",
                      example:
                        "Barang dengan ID 3f198ba0-d7ca-4b0a-bd12-7db32c997f2b berhasil dihapus.",
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "ID tidak valid",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "401": {
            description: "Token tidak ada atau tidak valid",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "404": {
            description: "Barang tidak ditemukan atau bukan milik user",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "500": {
            description: "Kesalahan server",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Gunakan access_token yang didapat dari endpoint login.",
      },
    },
    schemas: {
      RegisterRequest: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: {
            type: "string",
            minLength: 1,
            maxLength: 100,
            pattern: "^[\\p{L} ]+$",
            example: "Budi Santoso",
          },
          email: {
            type: "string",
            format: "email",
            maxLength: 100,
            pattern: "^[a-z0-9]",
            example: "budi@example.com",
          },
          password: {
            type: "string",
            minLength: 8,
            maxLength: 100,
            example: "Password123!",
          },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "budi@example.com" },
          password: { type: "string", minLength: 8, maxLength: 100 },
        },
      },
      LoginSuccessResponse: {
        type: "object",
        required: ["success", "message", "data"],
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string", example: "Login berhasil." },
          data: {
            type: "object",
            required: ["token-type", "access_token", "expires_in"],
            properties: {
              "token-type": { type: "string", enum: ["Bearer"] },
              access_token: { type: "string", description: "JWT access token" },
              expires_in: { type: "integer", example: 3600 },
            },
          },
        },
      },
      User: {
        type: "object",
        required: ["id", "name", "email", "created_at", "updated_at"],
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string", example: "Budi Santoso" },
          email: { type: "string", format: "email", example: "budi@example.com" },
          created_at: { type: "string", format: "date-time" },
          updated_at: { type: "string", format: "date-time" },
        },
      },
      UserSuccessResponse: {
        type: "object",
        required: ["success", "message", "data"],
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string" },
          data: { $ref: "#/components/schemas/User" },
        },
      },
      ItemRequest: {
        type: "object",
        required: ["name", "description", "stock", "price"],
        properties: {
          name: { type: "string", minLength: 1, maxLength: 100 },
          description: { type: "string", minLength: 1, maxLength: 255 },
          stock: { type: "integer", minimum: 0, example: 100 },
          price: {
            type: "number",
            minimum: 0,
            maximum: 99999999.99,
            multipleOf: 0.01,
            example: 75000,
          },
        },
      },
      Item: {
        type: "object",
        required: [
          "id",
          "name",
          "description",
          "stock",
          "price",
          "created_at",
          "updated_at",
        ],
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string", example: "Kopi Arabika 250g" },
          description: { type: "string", example: "Kopi enak dan sehat" },
          stock: { type: "integer", minimum: 0, example: 100 },
          price: { type: "number", minimum: 0, example: 75000 },
          created_at: { type: "string", format: "date-time" },
          updated_at: { type: "string", format: "date-time" },
        },
      },
      ItemSuccessResponse: {
        type: "object",
        required: ["success", "message", "data"],
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string" },
          data: { $ref: "#/components/schemas/Item" },
        },
      },
      Pagination: {
        type: "object",
        required: ["page", "limit", "total_items", "total_pages"],
        properties: {
          page: { type: "integer", example: 1 },
          limit: { type: "integer", example: 10 },
          total_items: { type: "integer", example: 1 },
          total_pages: { type: "integer", example: 1 },
        },
      },
      ItemsListResponse: {
        type: "object",
        required: ["success", "data", "pagination"],
        properties: {
          success: { type: "boolean", example: true },
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/Item" },
          },
          pagination: { $ref: "#/components/schemas/Pagination" },
        },
      },
      ErrorResponse: {
        type: "object",
        required: ["errors"],
        properties: {
          errors: {
            type: "string",
            description: "Pesan error atau detail validasi.",
          },
        },
      },
    },
  },
} satisfies JsonObject;
