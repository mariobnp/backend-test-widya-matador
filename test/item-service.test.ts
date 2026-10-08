import { beforeEach, describe, expect, it, vi } from "vitest";
import { Prisma } from "../src/generated/prisma/client.js";
import {
  countItems,
  createItem,
  deleteItem,
  findItems,
  updateItem,
} from "../src/model/item.model.js";
import {
  createItemService,
  deleteItemService,
  listItemsService,
  updateItemService,
} from "../src/service/item.service.js";

vi.mock("../src/model/item.model.js", () => ({
  countItems: vi.fn(),
  createItem: vi.fn(),
  deleteItem: vi.fn(),
  findItems: vi.fn(),
  updateItem: vi.fn(),
}));

const userId = "84aafeee-884f-431d-b299-59f444948961";
const itemId = "3f198ba0-d7ca-4b0a-bd12-7db32c997f2b";
const itemRequest = {
  name: "Kopi Arabika 250g",
  description: "Kopi enak dan sehat",
  stock: 100,
  price: 75000,
};

const itemRecord = {
  id: itemId,
  ...itemRequest,
  price: new Prisma.Decimal("75000.00"),
  createdAt: new Date("2026-10-08T10:12:00.000Z"),
  updatedAt: new Date("2026-10-08T10:12:00.000Z"),
};

const itemResponse = {
  id: itemId,
  ...itemRequest,
  created_at: itemRecord.createdAt.toISOString(),
  updated_at: itemRecord.updatedAt.toISOString(),
};

const notFoundError = () =>
  new Prisma.PrismaClientKnownRequestError("Record not found", {
    code: "P2025",
    clientVersion: "7.10.0",
  });

describe("item services", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates an item for the authenticated user and maps its response", async () => {
    vi.mocked(createItem).mockResolvedValue(itemRecord);

    await expect(createItemService(userId, itemRequest)).resolves.toEqual(
      itemResponse,
    );
    expect(createItem).toHaveBeenCalledWith(userId, itemRequest);
  });

  it("lists only the user's matching items with pagination metadata", async () => {
    vi.mocked(findItems).mockResolvedValue([itemRecord]);
    vi.mocked(countItems).mockResolvedValue(21);

    await expect(
      listItemsService(userId, { page: 2, limit: 10, search: "Arabika" }),
    ).resolves.toEqual({
      items: [itemResponse],
      pagination: {
        page: 2,
        limit: 10,
        total_items: 21,
        total_pages: 3,
      },
    });
    expect(findItems).toHaveBeenCalledWith(userId, {
      skip: 10,
      take: 10,
      search: "Arabika",
    });
    expect(countItems).toHaveBeenCalledWith(userId, "Arabika");
  });

  it("uses default pagination and reports zero total pages for an empty list", async () => {
    vi.mocked(findItems).mockResolvedValue([]);
    vi.mocked(countItems).mockResolvedValue(0);

    await expect(listItemsService(userId, {})).resolves.toEqual({
      items: [],
      pagination: {
        page: 1,
        limit: 10,
        total_items: 0,
        total_pages: 0,
      },
    });
    expect(findItems).toHaveBeenCalledWith(userId, { skip: 0, take: 10 });
    expect(countItems).toHaveBeenCalledWith(userId, undefined);
  });

  it("updates an item owned by the authenticated user", async () => {
    vi.mocked(updateItem).mockResolvedValue(itemRecord);

    await expect(
      updateItemService(userId, itemId, itemRequest),
    ).resolves.toEqual(itemResponse);
    expect(updateItem).toHaveBeenCalledWith(itemId, userId, itemRequest);
  });

  it("returns not found when the item cannot be updated", async () => {
    vi.mocked(updateItem).mockRejectedValue(notFoundError());

    await expect(
      updateItemService(userId, itemId, itemRequest),
    ).rejects.toMatchObject({
      status: 404,
      message: "Barang tidak ditemukan.",
    });
  });

  it("propagates unexpected update errors", async () => {
    const databaseError = new Error("Database unavailable");
    vi.mocked(updateItem).mockRejectedValue(databaseError);

    await expect(
      updateItemService(userId, itemId, itemRequest),
    ).rejects.toBe(databaseError);
  });

  it("deletes an item owned by the authenticated user", async () => {
    vi.mocked(deleteItem).mockResolvedValue({ id: itemId });

    await expect(deleteItemService(userId, itemId)).resolves.toBe(itemId);
    expect(deleteItem).toHaveBeenCalledWith(itemId, userId);
  });

  it("returns not found when the item cannot be deleted", async () => {
    vi.mocked(deleteItem).mockRejectedValue(notFoundError());

    await expect(deleteItemService(userId, itemId)).rejects.toMatchObject({
      status: 404,
      message: "Barang tidak ditemukan.",
    });
  });

  it("propagates unexpected delete errors", async () => {
    const databaseError = new Error("Database unavailable");
    vi.mocked(deleteItem).mockRejectedValue(databaseError);

    await expect(deleteItemService(userId, itemId)).rejects.toBe(databaseError);
  });
});
