import type { Metadata } from "next";
import { siteConfig } from "@/lib/constants";
import { getSiteUrl } from "@/lib/seo/site-url";

const ogImagePath = "/images/ali-profile.jpg";

export function buildRootMetadata(): Metadata {
  const siteUrl = getSiteUrl();

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: siteConfig.title,
      template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    applicationName: siteConfig.name,
    keywords: [
      "Ali Tahseen",
      "علي تحسين",
      "المهندس علي تحسين",
      "Expert Engineer",
      "Full-Stack Developer",
      "مهندس Full-Stack",
      "Portfolio",
      "معرض أعمال",
      "Web Developer",
      "مطور مواقع",
      "Next.js",
      "Iraq",
      "العراق",
    ],
    authors: [{ name: siteConfig.name, url: siteUrl }],
    creator: siteConfig.name,
    publisher: siteConfig.name,
    alternates: {
      canonical: "/",
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      alternateLocale: ["ar_IQ", "ar"],
      url: siteUrl,
      siteName: siteConfig.name,
      title: siteConfig.title,
      description: siteConfig.description,
      images: [
        {
          url: ogImagePath,
          width: 1200,
          height: 1200,
          alt: siteConfig.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: siteConfig.title,
      description: siteConfig.description,
      images: [ogImagePath],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    category: "technology",
  };
}
