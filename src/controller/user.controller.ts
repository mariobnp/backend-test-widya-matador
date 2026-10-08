import type { Request, Response, NextFunction } from "express";
import { validate } from "../validations/validation.js";
import {
  LoginUserValidation,
  RegisterUserValidation,
} from "../validations/user.validation.js";
import {
  getCurrentUserService,
  loginService,
  registerService,
} from "../service/user.service.js";
import { createResponseError } from "../error/response.error.js";

export const registerController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // validasi request
    const request = validate(RegisterUserValidation, req.body);

    const response = await registerService(request);

    res.status(201).json({
      success: true,
      message: "Registrasi berhasil.",
      data: response,
    });
  } catch (error) {
    next(error);
  }
};

export const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // validasi request
    const request = validate(LoginUserValidation, req.body);

    const response = await loginService(request);

    res.status(200).json({
      success: true,
      message: "Login berhasil.",
      data: response,
    });
  } catch (error) {
    next(error);
  }
};

export const currentUserController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // pastikan user id tersedia dari middleware autentikasi
    if (!req.userId) {
      next(createResponseError(401, "Token tidak ada atau tidak valid."));
      return;
    }

    const response = await getCurrentUserService(req.userId);

    res.status(200).json({
      success: true,
      message: "Data user berhasil diambil.",
      data: response,
    });
  } catch (error) {
    next(error);
  }
};
