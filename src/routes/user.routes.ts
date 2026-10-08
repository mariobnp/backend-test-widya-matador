import express from "express";
import { registerController } from "../controller/user.controller.js";

export const userRoutes = express.Router();

userRoutes.post("/register", registerController);
