import type { Project } from "@prisma/client";
import { isDatabaseConfigured, prisma } from "@/lib/db/client";

const publishedOrderBy = [
  { featured: "desc" as const },
  { createdAt: "desc" as const },
];

/** Published portfolio rows (homepage). Uses composite index on published + sort columns. */
export async function fetchPublishedProjects(): Promise<Project[]> {
  if (!isDatabaseConfigured()) return [];

  return prisma.project.findMany({
    where: { published: true },
    orderBy: publishedOrderBy,
  });
}

/** All projects for admin (drafts included). */
export async function fetchAllProjects(): Promise<Project[]> {
  if (!isDatabaseConfigured()) return [];

  return prisma.project.findMany({
    orderBy: publishedOrderBy,
  });
}
