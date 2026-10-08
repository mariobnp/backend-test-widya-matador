import type { z } from "zod";
import type {
  LoginUserValidation,
  RegisterUserValidation,
} from "../validations/user.validation.js";
import type { User } from "../generated/prisma/client.js";

export type RegisterRequest = z.infer<typeof RegisterUserValidation>;

export type LoginRequest = z.infer<typeof LoginUserValidation>;

export type UserResponse = {
  id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
};

export type LoginResponse = {
  "token-type": "Bearer";
  access_token: string;
  expires_in: number;
};

type UserResponseSource = Pick<
  User,
  "id" | "name" | "email" | "createdAt" | "updatedAt"
>;

export const toUserResponse = (user: UserResponseSource): UserResponse => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    created_at: user.createdAt.toISOString(),
    updated_at: user.updatedAt.toISOString(),
  };
};
