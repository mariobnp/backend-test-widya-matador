import type { Request, Response, NextFunction } from "express";
import { createResponseError } from "../error/response.error.js";
import { validate } from "../validations/validation.js";
import {
  CreateItemValidation,
  ItemIdValidation,
  ListItemsQueryValidation,
  UpdateItemValidation,
} from "../validations/item.validation.js";
import {
  createItemService,
  deleteItemService,
  listItemsService,
  updateItemService,
} from "../service/item.service.js";

const getUserId = (req: Request): string => {
  if (!req.userId) {
    throw createResponseError(401, "Token tidak ada atau tidak valid.");
  }

  return req.userId;
};

export const createItemController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // validasi request
    const request = validate(CreateItemValidation, req.body);
    const response = await createItemService(getUserId(req), request);

    res.status(201).json({
      success: true,
      message: "Barang berhasil dibuat.",
      data: response,
    });
  } catch (error) {
    next(error);
  }
};

export const listItemsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // validasi query pagination dan pencarian
    const query = validate(ListItemsQueryValidation, req.query);
    const response = await listItemsService(getUserId(req), query);

    res.status(200).json({
      success: true,
      data: response.items,
      pagination: response.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const updateItemController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // validasi id barang dan data pembaruan
    const { id } = validate(ItemIdValidation, req.params);
    const request = validate(UpdateItemValidation, req.body);
    const response = await updateItemService(getUserId(req), id, request);

    res.status(200).json({
      success: true,
      message: "Barang berhasil diperbarui.",
      data: response,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteItemController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // validasi id barang yang akan dihapus
    const { id } = validate(ItemIdValidation, req.params);
    const deletedId = await deleteItemService(getUserId(req), id);

    res.status(200).json({
      success: true,
      message: `Barang dengan ID ${deletedId} berhasil dihapus.`,
    });
  } catch (error) {
    next(error);
  }
};
