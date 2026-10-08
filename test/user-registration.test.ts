import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Prisma } from "../src/generated/prisma/client.js";
import {
  createUser,
  findUserByEmail,
  findUserById,
} from "../src/model/user.model.js";
import {
  getCurrentUserService,
  loginService,
  registerService,
} from "../src/service/user.service.js";
import {
  LoginUserValidation,
  RegisterUserValidation,
} from "../src/validations/user.validation.js";

vi.mock("../src/model/user.model.js", () => ({
  createUser: vi.fn(),
  findUserByEmail: vi.fn(),
  findUserById: vi.fn(),
}));

const registerRequest = {
  name: "Budi Santoso",
  email: "budi@example.com",
  password: "Password123!",
};

const createdUser = {
  id: "84aafeee-884f-431d-b299-59f444948961",
  name: registerRequest.name,
  email: registerRequest.email,
  createdAt: new Date("2026-10-08T10:12:00.000Z"),
  updatedAt: new Date("2026-10-08T10:12:00.000Z"),
};

const userWithPassword = {
  ...createdUser,
  password: "$2b$10$hashed-password",
};

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("RegisterUserValidation", () => {
  it("accepts a valid registration payload", () => {
    expect(RegisterUserValidation.safeParse(registerRequest).success).toBe(true);
  });

  it.each([
    ["empty name", { ...registerRequest, name: "" }],
    ["name containing a number", { ...registerRequest, name: "Budi2" }],
    ["uppercase email", { ...registerRequest, email: "Budi@example.com" }],
    ["invalid email", { ...registerRequest, email: "not-an-email" }],
    ["short password", { ...registerRequest, password: "short7" }],
    ["long password", { ...registerRequest, password: "a".repeat(101) }],
  ])("rejects %s", (_scenario, payload) => {
    expect(RegisterUserValidation.safeParse(payload).success).toBe(false);
  });
});

describe("LoginUserValidation", () => {
  it("accepts a valid login payload", () => {
    expect(
      LoginUserValidation.safeParse({
        email: registerRequest.email,
        password: registerRequest.password,
      }).success,
    ).toBe(true);
  });

  it.each([
    ["empty email", { email: "", password: registerRequest.password }],
    ["uppercase email", { email: "Budi@example.com", password: "Password123!" }],
    ["invalid email", { email: "not-an-email", password: "Password123!" }],
    ["empty password", { email: registerRequest.email, password: "" }],
    ["short password", { email: registerRequest.email, password: "short7" }],
    ["missing email", { password: registerRequest.password }],
    ["missing password", { email: registerRequest.email }],
  ])("rejects %s", (_scenario, payload) => {
    expect(LoginUserValidation.safeParse(payload).success).toBe(false);
  });
});

describe("registerService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a user with a bcrypt hash and returns a safe response", async () => {
    vi.mocked(findUserByEmail).mockResolvedValue(null);
    vi.mocked(createUser).mockResolvedValue(createdUser);

    const response = await registerService(registerRequest);

    expect(findUserByEmail).toHaveBeenCalledWith(registerRequest.email);
    expect(createUser).toHaveBeenCalledOnce();

    const createData = vi.mocked(createUser).mock.calls[0]?.[0];
    expect(createData).toBeDefined();
    expect(createData?.name).toBe(registerRequest.name);
    expect(createData?.email).toBe(registerRequest.email);
    expect(createData?.password).not.toBe(registerRequest.password);
    await expect(
      bcrypt.compare(registerRequest.password, createData!.password),
    ).resolves.toBe(true);

    expect(response).toEqual({
      id: createdUser.id,
      name: createdUser.name,
      email: createdUser.email,
      created_at: createdUser.createdAt.toISOString(),
      updated_at: createdUser.updatedAt.toISOString(),
    });
    expect(response).not.toHaveProperty("password");
  });

  it("returns a conflict when the email already exists", async () => {
    vi.mocked(findUserByEmail).mockResolvedValue({
      ...createdUser,
      password: "stored-hash",
    });

    await expect(registerService(registerRequest)).rejects.toMatchObject({
      status: 409,
      message: "Email sudah terdaftar.",
    });
    expect(createUser).not.toHaveBeenCalled();
  });

  it("converts a Prisma unique-constraint error to a conflict", async () => {
    vi.mocked(findUserByEmail).mockResolvedValue(null);
    vi.mocked(createUser).mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
        code: "P2002",
        clientVersion: "7.10.0",
        meta: { target: ["email"] },
      }),
    );

    await expect(registerService(registerRequest)).rejects.toMatchObject({
      status: 409,
      message: "Email sudah terdaftar.",
    });
  });

  describe("loginService", () => {
    beforeEach(() => {
      vi.clearAllMocks();
      vi.stubEnv("JWT_SECRET", "test-jwt-secret");
    });

    it("returns a signed bearer token for valid credentials", async () => {
      const hashedPassword = await bcrypt.hash(registerRequest.password, 4);
      vi.mocked(findUserByEmail).mockResolvedValue({
        ...userWithPassword,
        password: hashedPassword,
      });

      const response = await loginService({
        email: registerRequest.email,
        password: registerRequest.password,
      });
      const payload = jwt.verify(response.access_token, "test-jwt-secret");

      expect(findUserByEmail).toHaveBeenCalledWith(registerRequest.email);
      expect(response).toMatchObject({
        "token-type": "Bearer",
        expires_in: 3600,
      });
      expect(payload).toMatchObject({ sub: createdUser.id });
      expect(payload).toHaveProperty("exp");
    });

    it("rejects an unknown email with the same unauthorized response", async () => {
      vi.mocked(findUserByEmail).mockResolvedValue(null);

      await expect(
        loginService({
          email: registerRequest.email,
          password: registerRequest.password,
        }),
      ).rejects.toMatchObject({
        status: 401,
        message: "Email atau password salah.",
      });
    });

    it("rejects an incorrect password", async () => {
      vi.mocked(findUserByEmail).mockResolvedValue({
        ...userWithPassword,
        password: await bcrypt.hash("DifferentPassword123!", 4),
      });

      await expect(
        loginService({
          email: registerRequest.email,
          password: registerRequest.password,
        }),
      ).rejects.toMatchObject({
        status: 401,
        message: "Email atau password salah.",
      });
    });

    it("propagates database errors", async () => {
      const databaseError = new Error("Database unavailable");
      vi.mocked(findUserByEmail).mockRejectedValue(databaseError);

      await expect(
        loginService({
          email: registerRequest.email,
          password: registerRequest.password,
        }),
      ).rejects.toBe(databaseError);
    });
  });

  describe("getCurrentUserService", () => {
    it("returns safe user details for an existing id", async () => {
      vi.mocked(findUserById).mockResolvedValue(createdUser);

      await expect(getCurrentUserService(createdUser.id)).resolves.toEqual({
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
        created_at: createdUser.createdAt.toISOString(),
        updated_at: createdUser.updatedAt.toISOString(),
      });
      expect(findUserById).toHaveBeenCalledWith(createdUser.id);
    });

    it("returns not found when the user no longer exists", async () => {
      vi.mocked(findUserById).mockResolvedValue(null);

      await expect(getCurrentUserService(createdUser.id)).rejects.toMatchObject({
        status: 404,
        message: "User tidak ditemukan.",
      });
    });
  });

  it("rethrows database errors that are not unique conflicts", async () => {
    const databaseError = new Error("Database unavailable");
    vi.mocked(findUserByEmail).mockResolvedValue(null);
    vi.mocked(createUser).mockRejectedValue(databaseError);

    await expect(registerService(registerRequest)).rejects.toBe(databaseError);
  });
});
