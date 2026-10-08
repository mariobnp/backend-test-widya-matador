import { prisma } from "../config/prisma.js";
import type { CreateItemRequest, UpdateItemRequest } from "../types/item.type.js";

const itemSelect = {
  id: true,
  name: true,
  description: true,
  stock: true,
  price: true,
  createdAt: true,
  updatedAt: true,
};

export const createItem = (userId: string, data: CreateItemRequest) => {
  return prisma.item.create({
    data: {
      ...data,
      userId,
    },
    select: itemSelect,
  });
};

export const findItems = (
  userId: string,
  options: { skip: number; take: number; search?: string },
) => {
  return prisma.item.findMany({
    where: {
      userId,
      ...(options.search === undefined
        ? {}
        : { name: { contains: options.search } }),
    },
    orderBy: {
      createdAt: "desc",
    },
    skip: options.skip,
    take: options.take,
    select: itemSelect,
  });
};

export const countItems = (userId: string, search?: string) => {
  return prisma.item.count({
    where: {
      userId,
      ...(search === undefined ? {} : { name: { contains: search } }),
    },
  });
};

export const updateItem = (
  id: string,
  userId: string,
  data: UpdateItemRequest,
) => {
  return prisma.item.update({
    where: {
      id,
      userId,
    },
    data,
    select: itemSelect,
  });
};

export const deleteItem = (id: string, userId: string) => {
  return prisma.item.delete({
    where: {
      id,
      userId,
    },
    select: {
      id: true,
    },
  });
};
