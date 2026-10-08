import { createResponseError } from "../error/response.error.js";
import { createUser, findUserByEmail } from "../model/user.model.js";
import {
  type RegisterRequest,
  toUserResponse,
  type UserResponse,
} from "../types/user.type.js";
import { Prisma } from "../generated/prisma/client.js";
import bcrypt from "bcrypt";

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
