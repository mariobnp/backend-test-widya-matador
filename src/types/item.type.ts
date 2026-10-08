import type { z } from "zod";
import type {
  CreateItemValidation,
  ItemIdValidation,
  ListItemsQueryValidation,
  UpdateItemValidation,
} from "../validations/item.validation.js";

export type CreateItemRequest = z.infer<typeof CreateItemValidation>;
export type UpdateItemRequest = z.infer<typeof UpdateItemValidation>;
export type ItemIdParams = z.infer<typeof ItemIdValidation>;
export type ListItemsQuery = z.infer<typeof ListItemsQueryValidation>;
