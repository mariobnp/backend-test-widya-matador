import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { type ResponseError } from "../error/response.error.js";

const isResponseError = (error: Error): error is ResponseError => {
  return "status" in error;
};

export const errorMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (error instanceof ZodError) {
    res.status(400).json({
      errors: `Validation error: ${JSON.stringify(error)}`,
    });
  } else if (isResponseError(error)) {
    res.status(error.status).json({
      errors: error.message,
    });
  } else {
    res.status(500).json({
      errors: error.message,
    });
  }
};
