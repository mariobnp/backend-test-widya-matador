import type { Request, Response, NextFunction } from "express";
import { validate } from "../validations/validation.js";
import { RegisterUserValidation } from "../validations/user.validation.js";
import { registerService } from "../service/user.service.js";

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
      message: "Registrasi Berhasil.",
      data: response,
    });
  } catch (error) {
    next(error);
  }
};
