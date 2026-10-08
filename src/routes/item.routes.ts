import express from "express";
import {
  createItemController,
  deleteItemController,
  listItemsController,
  updateItemController,
} from "../controller/item.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

export const itemRoutes = express.Router();

// wajibkan autentikasi untuk seluruh endpoint barang
itemRoutes.use(authenticate);

itemRoutes.post("/", createItemController);
itemRoutes.get("/", listItemsController);
itemRoutes.put("/:id", updateItemController);
itemRoutes.delete("/:id", deleteItemController);
