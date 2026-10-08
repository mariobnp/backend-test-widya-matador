import type { NextFunction, Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createItemController,
  deleteItemController,
  listItemsController,
  updateItemController,
} from "../src/controller/item.controller.js";
import {
  createItemService,
  deleteItemService,
  listItemsService,
  updateItemService,
} from "../src/service/item.service.js";

vi.mock("../src/service/item.service.js", () => ({
  createItemService: vi.fn(),
  deleteItemService: vi.fn(),
  listItemsService: vi.fn(),
  updateItemService: vi.fn(),
}));

const userId = "84aafeee-884f-431d-b299-59f444948961";
const itemId = "3f198ba0-d7ca-4b0a-bd12-7db32c997f2b";
const itemRequest = {
  name: "Kopi Arabika 250g",
  description: "Kopi enak dan sehat",
  stock: 100,
  price: 75000,
};
const itemResponse = {
  id: itemId,
  ...itemRequest,
  created_at: "2026-10-08T10:12:00.000Z",
  updated_at: "2026-10-08T10:12:00.000Z",
};

const runController = async (
  controller: (req: Request, res: Response, next: NextFunction) => Promise<void>,
  request: Partial<Request>,
) => {
  const res = {
    status: vi.fn(),
    json: vi.fn(),
  };
  res.status.mockReturnValue(res);

  const next = vi.fn();
  await controller(
    request as Request,
    res as unknown as Response,
    next as unknown as NextFunction,
  );

  return { res, next };
};

describe("item controllers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates an item and returns 201", async () => {
    vi.mocked(createItemService).mockResolvedValue(itemResponse);

    const { res, next } = await runController(createItemController, {
      userId,
      body: itemRequest,
    });

    expect(createItemService).toHaveBeenCalledWith(userId, itemRequest);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Barang berhasil dibuat.",
      data: itemResponse,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("lists items with validated pagination and search", async () => {
    const pagination = {
      page: 2,
      limit: 10,
      total_items: 11,
      total_pages: 2,
    };
    vi.mocked(listItemsService).mockResolvedValue({
      items: [itemResponse],
      pagination,
    });

    const { res, next } = await runController(listItemsController, {
      userId,
      query: { page: "2", limit: "10", search: "Arabika" },
    });

    expect(listItemsService).toHaveBeenCalledWith(userId, {
      page: 2,
      limit: 10,
      search: "Arabika",
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: [itemResponse],
      pagination,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("updates an item and returns 200", async () => {
    vi.mocked(updateItemService).mockResolvedValue(itemResponse);

    const { res, next } = await runController(updateItemController, {
      userId,
      params: { id: itemId },
      body: itemRequest,
    });

    expect(updateItemService).toHaveBeenCalledWith(userId, itemId, itemRequest);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Barang berhasil diperbarui.",
      data: itemResponse,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("deletes an item and returns its id in the message", async () => {
    vi.mocked(deleteItemService).mockResolvedValue(itemId);

    const { res, next } = await runController(deleteItemController, {
      userId,
      params: { id: itemId },
    });

    expect(deleteItemService).toHaveBeenCalledWith(userId, itemId);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: `Barang dengan ID ${itemId} berhasil dihapus.`,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("passes validation errors to the error middleware", async () => {
    const { next } = await runController(createItemController, {
      userId,
      body: { ...itemRequest, stock: 1.5 },
    });

    expect(createItemService).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ name: "ZodError" }),
    );
  });

  it("rejects requests without an authenticated user id", async () => {
    const { next } = await runController(createItemController, {
      body: itemRequest,
    });

    expect(createItemService).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 401,
        message: "Token tidak ada atau tidak valid.",
      }),
    );
  });

  it("passes service errors to the error middleware", async () => {
    const serviceError = new Error("Database unavailable");
    vi.mocked(createItemService).mockRejectedValue(serviceError);

    const { next } = await runController(createItemController, {
      userId,
      body: itemRequest,
    });

    expect(next).toHaveBeenCalledWith(serviceError);
  });
});
