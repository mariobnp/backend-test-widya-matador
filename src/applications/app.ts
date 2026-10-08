import express from "express";
import { itemRoutes } from "../routes/item.routes.js";
import { authRoutes, userRoutes } from "../routes/user.routes.js";
import { errorMiddleware } from "../middleware/error.middleware.js";

export const app = express();

app.use(express.json());
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/items", itemRoutes);
app.use(errorMiddleware);
