import { createResponseError } from "../error/response.error.js";
import {
  countItems,
  createItem,
  deleteItem,
  findItemById,
  findItems,
  updateItem,
} from "../model/item.model.js";
import { Prisma } from "../generated/prisma/client.js";
import {
  toItemResponse,
  type CreateItemRequest,
  type ItemResponse,
  type ItemsListResponse,
  type ListItemsQuery,
  type UpdateItemRequest,
} from "../types/item.type.js";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

const isRecordNotFoundError = (error: unknown): boolean =>
  error instanceof Prisma.PrismaClientKnownRequestError &&
  error.code === "P2025";

export const createItemService = async (
  userId: string,
  request: CreateItemRequest,
): Promise<ItemResponse> => {
  // simpan barang dengan kepemilikan user yang sedang login
  const item = await createItem(userId, request);
  return toItemResponse(item);
};

export const listItemsService = async (
  userId: string,
  query: ListItemsQuery,
): Promise<ItemsListResponse> => {
  // gunakan nilai pagination bawaan jika query tidak diberikan
  const page = query.page ?? DEFAULT_PAGE;
  const limit = query.limit ?? DEFAULT_LIMIT;
  const skip = (page - 1) * limit;

  const [items, totalItems] = await Promise.all([
    findItems(userId, {
      skip,
      take: limit,
      ...(query.search === undefined ? {} : { search: query.search }),
    }),
    countItems(userId, query.search),
  ]);

  return {
    items: items.map(toItemResponse),
    pagination: {
      page,
      limit,
      total_items: totalItems,
      total_pages: Math.ceil(totalItems / limit),
    },
  };
};

export const getItemService = async (
  userId: string,
  itemId: string,
): Promise<ItemResponse> => {
  // cari barang yang dimiliki user yang sedang login
  const item = await findItemById(itemId, userId);

  if (!item) {
    throw createResponseError(404, "Barang tidak ditemukan.");
  }

  return toItemResponse(item);
};

export const updateItemService = async (
  userId: string,
  itemId: string,
  request: UpdateItemRequest,
): Promise<ItemResponse> => {
  // perbarui barang hanya jika dimiliki user yang sedang login
  try {
    const item = await updateItem(itemId, userId, request);
    return toItemResponse(item);
  } catch (error) {
    if (isRecordNotFoundError(error)) {
      throw createResponseError(404, "Barang tidak ditemukan.");
    }

    throw error;
  }
};

export const deleteItemService = async (
  userId: string,
  itemId: string,
): Promise<string> => {
  // hapus barang hanya jika dimiliki user yang sedang login
  try {
    const item = await deleteItem(itemId, userId);
    return item.id;
  } catch (error) {
    if (isRecordNotFoundError(error)) {
      throw createResponseError(404, "Barang tidak ditemukan.");
    }

    throw error;
  }
};
