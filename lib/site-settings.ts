import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/constants";

const SETTINGS_ID = "singleton";

export async function getProfileImageUrl(): Promise<string> {
  if (!process.env.DATABASE_URL) {
    return siteConfig.profileImageFallback;
  }

  try {
    const settings = await prisma.siteSetting.findUnique({
      where: { id: SETTINGS_ID },
    });
    return settings?.profileImageUrl || siteConfig.profileImageFallback;
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
