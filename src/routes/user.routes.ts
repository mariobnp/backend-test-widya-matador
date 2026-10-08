import express from "express";
import {
  currentUserController,
  loginController,
  registerController,
} from "../controller/user.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

// daftarkan endpoint autentikasi
export const authRoutes = express.Router();

authRoutes.post("/register", registerController);
authRoutes.post("/login", loginController);

// daftarkan endpoint user
export const userRoutes = express.Router();

userRoutes.get("/me", authenticate, currentUserController);
