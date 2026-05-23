import type { Metadata, Viewport } from "next";
import { Cairo, Cormorant_Garamond, DM_Sans } from "next/font/google";
import { LocaleProvider } from "@/components/providers/locale-provider";
import { ProfileImageProvider } from "@/components/providers/profile-provider";
import { getProfileImageUrl } from "@/lib/site-settings";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getSiteContentBundle } from "@/lib/content";
import { siteConfig } from "@/lib/constants";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const cairo = Cairo({
  variable: "--font-arabic",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
  keywords: [
    "Ali Tahseen",
    "علي تحسين",
    "Expert Engineer",
    "Full-Stack Developer",
    "Portfolio",
    "Next.js",
  ],
  authors: [{ name: siteConfig.name }],
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#080808",
  colorScheme: "dark",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [contentBundle, profileImageUrl] = await Promise.all([
    getSiteContentBundle(),
    getProfileImageUrl(),
  ]);

  return (
    <html
      lang="en"
      dir="ltr"
      suppressHydrationWarning
      className={`${cormorant.variable} ${dmSans.variable} ${cairo.variable} h-full scroll-smooth`}
    >
      <body className="min-h-full w-full min-w-0 overflow-x-clip bg-[#080808] font-sans text-cream-100 antialiased">
        <LocaleProvider contentBundle={contentBundle}>
          <ProfileImageProvider imageUrl={profileImageUrl}>
            <TooltipProvider>{children}</TooltipProvider>
          </ProfileImageProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
