import { describe, expect, it } from "vitest";
import {
  CreateItemValidation,
  ItemIdValidation,
  ListItemsQueryValidation,
  UpdateItemValidation,
} from "../src/validations/item.validation.js";

const validItem = {
  name: "Kopi Arabika 250g",
  description: "Kopi enak dan sehat",
  stock: 100,
  price: 75000,
};

describe("CreateItemValidation", () => {
  it("accepts a valid item", () => {
    expect(CreateItemValidation.safeParse(validItem).success).toBe(true);
  });

  it.each([
    ["empty name", { ...validItem, name: "" }],
    ["name without a letter", { ...validItem, name: "123 !!!" }],
    ["name over 100 characters", { ...validItem, name: "a".repeat(101) }],
    ["empty description", { ...validItem, description: "" }],
    ["description over 255 characters", { ...validItem, description: "a".repeat(256) }],
    ["negative stock", { ...validItem, stock: -1 }],
    ["fractional stock", { ...validItem, stock: 1.5 }],
    ["string stock", { ...validItem, stock: "10" }],
    ["negative price", { ...validItem, price: -0.01 }],
    ["price with more than two decimals", { ...validItem, price: 1.001 }],
    ["price beyond database capacity", { ...validItem, price: 100_000_000 }],
    ["string price", { ...validItem, price: "75000" }],
  ])("rejects %s", (_scenario, payload) => {
    expect(CreateItemValidation.safeParse(payload).success).toBe(false);
  });
});

describe("UpdateItemValidation", () => {
  it("requires a full valid update payload", () => {
    expect(UpdateItemValidation.safeParse(validItem).success).toBe(true);
    expect(UpdateItemValidation.safeParse({ stock: 5 }).success).toBe(false);
  });
});

describe("ItemIdValidation", () => {
  it("accepts a UUID and rejects an invalid id", () => {
    expect(
      ItemIdValidation.safeParse({
        id: "84aafeee-884f-431d-b299-59f444948961",
      }).success,
    ).toBe(true);
    expect(ItemIdValidation.safeParse({ id: "item-1" }).success).toBe(false);
  });
});

describe("ListItemsQueryValidation", () => {
  it("coerces pagination values from query strings", () => {
    expect(
      ListItemsQueryValidation.parse({
        page: "2",
        limit: "15",
        search: "Arabika",
      }),
    ).toEqual({
      page: 2,
      limit: 15,
      search: "Arabika",
    });
  });

  it.each([
    ["zero page", { page: "0" }],
    ["negative page", { page: "-1" }],
    ["fractional page", { page: "1.5" }],
    ["zero limit", { limit: "0" }],
    ["fractional limit", { limit: "2.5" }],
    ["non-numeric limit", { limit: "many" }],
  ])("rejects %s", (_scenario, query) => {
    expect(ListItemsQueryValidation.safeParse(query).success).toBe(false);
  });
});
