import express from "express";
import { userRoutes } from "../routes/user.routes.js";
import { errorMiddleware } from "../middleware/error.middleware.js";

export const app = express();

app.use(express.json());
app.use("/api/v1/auth", userRoutes);
app.use(errorMiddleware);
