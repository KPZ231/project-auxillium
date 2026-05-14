// Prisma Client initializer - updated to trigger reload
import { PrismaClient } from "./generated/client/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  pool?: Pool;
};

// Reuse existing pool/client if available (e.g., in development hot reload)
const getPool = () => {
  if (globalForPrisma.pool) return globalForPrisma.pool;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set");
  const pool = new Pool({ connectionString });
  globalForPrisma.pool = pool;
  return pool;
};

const setupPrisma = () => {
  const pool = getPool();
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
};

// Initialize only if not already set (prevents duplicate clients in development)
export const prisma =
  globalForPrisma.prisma ?? (function init() {
    const client = setupPrisma();
    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prisma = client;
    }
    return client;
  })();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
