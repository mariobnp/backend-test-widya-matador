import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client.js";

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const port = Number(process.env.MYSQL_PORT ?? "3306");
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("MYSQL_PORT must be a valid TCP port number");
}

const adapter = new PrismaMariaDb({
  host: requiredEnv("MYSQL_HOST"),
  port,
  user: requiredEnv("MYSQL_USER"),
  password: requiredEnv("MYSQL_PASSWORD"),
  connectionLimit: 5,
});

export const prisma = new PrismaClient({ adapter });
