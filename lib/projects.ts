import { getCachedPublishedProjects } from "@/lib/db/cached";
import { fetchAllProjects } from "@/lib/db/queries/projects";
import { sampleProjects } from "@/lib/data/sample-projects";
import type { Project } from "@prisma/client";

export async function getPublishedProjects(): Promise<Project[]> {
  if (!process.env.DATABASE_URL) {
    return sampleProjects.map((p) => ({ ...p, published: true }));
  }

  try {
    return await getCachedPublishedProjects();
  } catch (error) {
    console.error("Failed to load published projects:", error);
    return [];
  }
}

export async function getAllProjects(): Promise<Project[]> {
  if (!process.env.DATABASE_URL) return sampleProjects;

  try {
    return await fetchAllProjects();
  } catch (error) {
    console.error("Failed to load projects:", error);
    return [];
  }
}

/** @deprecated Use getPublishedProjects */
export async function getProjects(): Promise<Project[]> {
  return getPublishedProjects();
}
