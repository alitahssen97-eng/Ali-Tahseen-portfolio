import { siteConfig } from "@/lib/constants";
import { isDatabaseConfigured, prisma } from "@/lib/db/client";

const SETTINGS_ID = "singleton";

export async function fetchProfileImageUrl(): Promise<string> {
  if (!isDatabaseConfigured()) {
    return siteConfig.profileImageFallback;
  }

  const settings = await prisma.siteSetting.findUnique({
    where: { id: SETTINGS_ID },
    select: { profileImageUrl: true },
  });

  return settings?.profileImageUrl || siteConfig.profileImageFallback;
}
