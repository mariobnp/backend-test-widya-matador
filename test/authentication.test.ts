import type { NextFunction, Request, Response } from "express";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import jwt from "jsonwebtoken";
import { authenticate } from "../src/middleware/auth.middleware.js";

const jwtSecret = "test-jwt-secret";
const userId = "84aafeee-884f-431d-b299-59f444948961";

const runAuthentication = (authorization?: string) => {
  const req = {
    header: vi.fn().mockReturnValue(authorization),
  } as unknown as Request;
  const next = vi.fn() as unknown as NextFunction;

  authenticate(req, {} as Response, next);

  return { req, next };
};

beforeEach(() => {
  vi.stubEnv("JWT_SECRET", jwtSecret);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("authenticate", () => {
  it.each([
    ["missing authorization header", undefined],
    ["non-bearer authorization", "Basic dXNlcjpwYXNz"],
    ["malformed bearer header", "Bearer token extra"],
    ["malformed token", "Bearer not-a-jwt"],
    ["invalid signature", `Bearer ${jwt.sign({ sub: userId }, "wrong-secret")}`],
    ["token without a user id", `Bearer ${jwt.sign({}, jwtSecret)}`],
    [
      "expired token",
      `Bearer ${jwt.sign({ sub: userId }, jwtSecret, { expiresIn: -1 })}`,
    ],
  ])("rejects %s", (_scenario, authorization) => {
    const { next } = runAuthentication(authorization);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 401,
        message: "Token tidak ada atau tidak valid.",
      }),
    );
  });

  it("sets the user id and continues for a valid bearer token", () => {
    const token = jwt.sign({ sub: userId }, jwtSecret, { expiresIn: 3600 });
    const { req, next } = runAuthentication(`Bearer ${token}`);

    expect(req.userId).toBe(userId);
    expect(next).toHaveBeenCalledOnce();
    expect(next).toHaveBeenCalledWith();
  });
});
