import type { z } from "zod";
import type {
  LoginUserValidation,
  RegisterUserValidation,
} from "../validations/user.validation.js";

export type RegisterRequest = z.infer<typeof RegisterUserValidation>;
export type LoginRequest = z.infer<typeof LoginUserValidation>;
export type UserResponse = {
  id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
};
