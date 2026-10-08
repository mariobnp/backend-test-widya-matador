import { createResponseError } from "../error/response.error.js";
import {
  createUser,
  findUserByEmail,
  findUserById,
} from "../model/user.model.js";
import {
  type LoginRequest,
  type LoginResponse,
  type RegisterRequest,
  toUserResponse,
  type UserResponse,
} from "../types/user.type.js";
import { Prisma } from "../generated/prisma/client.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../config/jwt.js";

export const registerService = async (
  request: RegisterRequest,
): Promise<UserResponse> => {
  // cek user di database berdasarkan email
  const existingUser = await findUserByEmail(request.email);

  // jika email sudah ada maka lempar error
  if (existingUser) {
    throw createResponseError(409, "Email sudah terdaftar.");
  }

  // hashing password
  const hashedPassword = await bcrypt.hash(request.password, 10);

  // create user di database
  let user;
  try {
    user = await createUser({
      name: request.name,
      email: request.email,
      password: hashedPassword,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw createResponseError(409, "Email sudah terdaftar.");
    }

    throw error;
  }

  return toUserResponse(user);
};

export const loginService = async (
  request: LoginRequest,
): Promise<LoginResponse> => {
  // cek user di database berdasarkan email
  const user = await findUserByEmail(request.email);

  // jika email atau password salah maka tolak login
  if (!user || !(await bcrypt.compare(request.password, user.password))) {
    throw createResponseError(401, "Email atau password salah.");
  }

  // buat access token dengan masa berlaku satu jam
  const accessToken = jwt.sign({ sub: user.id }, getJwtSecret(), {
    expiresIn: 3600,
  });

  return {
    "token-type": "Bearer",
    access_token: accessToken,
    expires_in: 3600,
  };
};

export const getCurrentUserService = async (
  userId: string,
): Promise<UserResponse> => {
  // cek user di database berdasarkan id dari token
  const user = await findUserById(userId);

  // jika user tidak ditemukan maka lempar error
  if (!user) {
    throw createResponseError(404, "User tidak ditemukan.");
  }

  return toUserResponse(user);
};
