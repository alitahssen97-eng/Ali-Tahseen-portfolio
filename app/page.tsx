import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/sections/hero";
import { AboutSection } from "@/components/sections/about";
import { ProjectsSection } from "@/components/sections/projects";
import { ContactSection } from "@/components/sections/contact";
import { HomeJsonLd } from "@/components/seo/home-json-ld";
import { siteConfig } from "@/lib/constants";
import { getPublishedProjects } from "@/lib/projects";

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
  alternates: { canonical: "/" },
};

/** ISR: serve cached HTML; refresh after admin edits or every 5 minutes. */
export const revalidate = 300;

export default async function HomePage() {
  const projects = await getPublishedProjects();

  return (
    <>
      <HomeJsonLd />
      <Navbar />
      <main className="w-full min-w-0 overflow-x-clip">
        <HeroSection />
        <ProjectsSection projects={projects} />
        <AboutSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
