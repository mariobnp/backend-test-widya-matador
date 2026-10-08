import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../config/jwt.js";
import { createResponseError } from "../error/response.error.js";

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  // ambil bearer token dari header authorization
  const authorization = req.header("authorization")?.trim();
  const tokenMatch = authorization?.match(/^Bearer\s+(\S+)$/i);

  // tolak request jika bearer token tidak tersedia
  if (!tokenMatch?.[1]) {
    next(createResponseError(401, "Token tidak ada atau tidak valid."));
    return;
  }

  const secret = getJwtSecret();
  let payload: string | jwt.JwtPayload;
  try {
    payload = jwt.verify(tokenMatch[1], secret);
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(createResponseError(401, "Token tidak ada atau tidak valid."));
      return;
    }

    next(error);
    return;
  }

  // pastikan token memiliki id user
  if (typeof payload === "string" || typeof payload.sub !== "string") {
    next(createResponseError(401, "Token tidak ada atau tidak valid."));
    return;
  }

  req.userId = payload.sub;
  next();
};
