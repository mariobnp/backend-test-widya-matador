import express from "express";
import { itemRoutes } from "../routes/item.routes.js";
import { authRoutes, userRoutes } from "../routes/user.routes.js";
import { errorMiddleware } from "../middleware/error.middleware.js";
import swaggerUi from "swagger-ui-express";
import { openApiDocument } from "../config/openapi.js";

export const app = express();

app.use(express.json());
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/items", itemRoutes);
app.get("/api-docs/openapi.json", (_req, res) => {
  res.json(openApiDocument);
});
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(openApiDocument, {
    customSiteTitle: "Inventaris API Documentation",
  }),
);
app.use(errorMiddleware);
