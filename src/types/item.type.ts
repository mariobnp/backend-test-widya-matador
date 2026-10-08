import type { z } from "zod";
import type {
  CreateItemValidation,
  ItemIdValidation,
  ListItemsQueryValidation,
  UpdateItemValidation,
} from "../validations/item.validation.js";
import type { Item } from "../generated/prisma/client.js";

export type CreateItemRequest = z.infer<typeof CreateItemValidation>;
export type UpdateItemRequest = z.infer<typeof UpdateItemValidation>;
export type ItemIdParams = z.infer<typeof ItemIdValidation>;
export type ListItemsQuery = z.infer<typeof ListItemsQueryValidation>;

export type ItemResponse = {
  id: string;
  name: string;
  description: string;
  stock: number;
  price: number;
  created_at: string;
  updated_at: string;
};

export type ItemResponseSource = Pick<
  Item,
  "id" | "name" | "description" | "stock" | "price" | "createdAt" | "updatedAt"
>;

export type ItemsListResponse = {
  items: ItemResponse[];
  pagination: {
    page: number;
    limit: number;
    total_items: number;
    total_pages: number;
  };
};

export const toItemResponse = (item: ItemResponseSource): ItemResponse => ({
  id: item.id,
  name: item.name,
  description: item.description,
  stock: item.stock,
  price: Number(item.price),
  created_at: item.createdAt.toISOString(),
  updated_at: item.updatedAt.toISOString(),
});
