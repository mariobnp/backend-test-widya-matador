import { beforeEach, describe, expect, it, vi } from "vitest";
import bcrypt from "bcrypt";
import { Prisma } from "../src/generated/prisma/client.js";
import { createUser, findUserByEmail } from "../src/model/user.model.js";
import { registerService } from "../src/service/user.service.js";
import { RegisterUserValidation } from "../src/validations/user.validation.js";

vi.mock("../src/model/user.model.js", () => ({
  createUser: vi.fn(),
  findUserByEmail: vi.fn(),
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

  it("rethrows database errors that are not unique conflicts", async () => {
    const databaseError = new Error("Database unavailable");
    vi.mocked(findUserByEmail).mockResolvedValue(null);
    vi.mocked(createUser).mockRejectedValue(databaseError);

    await expect(registerService(registerRequest)).rejects.toBe(databaseError);
  });
});
