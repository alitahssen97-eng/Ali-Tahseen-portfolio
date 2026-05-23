import { siteConfig } from "@/lib/constants";
import { getCachedProfileImageUrl } from "@/lib/db/cached";
import { prisma } from "@/lib/prisma";

const SETTINGS_ID = "singleton";

export async function getProfileImageUrl(): Promise<string> {
  if (!process.env.DATABASE_URL) {
    return siteConfig.profileImageFallback;
  }

  try {
    return await getCachedProfileImageUrl();
  } catch {
    return siteConfig.profileImageFallback;
  }
}

export async function updateProfileImageUrl(url: string) {
  return prisma.siteSetting.upsert({
    where: { id: SETTINGS_ID },
    create: { id: SETTINGS_ID, profileImageUrl: url },
    update: { profileImageUrl: url },
  });
}
