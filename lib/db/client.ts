import { prisma } from "@/lib/prisma";

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export { prisma };
