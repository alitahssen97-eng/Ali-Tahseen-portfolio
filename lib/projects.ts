import { prisma } from "@/lib/prisma";
import { sampleProjects } from "@/lib/data/sample-projects";
import type { Project } from "@prisma/client";

export async function getPublishedProjects(): Promise<Project[]> {
  if (!process.env.DATABASE_URL) {
    return sampleProjects.map((p) => ({ ...p, published: true }));
  }

  try {
    const projects = await prisma.project.findMany({
      where: { published: true },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    });
    if (projects.length > 0) return projects;
    return sampleProjects.map((p) => ({ ...p, published: true }));
  } catch {
    return sampleProjects.map((p) => ({ ...p, published: true }));
  }
}

export async function getAllProjects(): Promise<Project[]> {
  if (!process.env.DATABASE_URL) return sampleProjects;

  try {
    return await prisma.project.findMany({
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    });
  } catch {
    return sampleProjects;
  }
}

/** @deprecated Use getPublishedProjects */
export async function getProjects(): Promise<Project[]> {
  return getPublishedProjects();
}
