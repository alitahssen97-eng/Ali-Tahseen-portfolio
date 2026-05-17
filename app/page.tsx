import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/sections/hero";
import { AboutSection } from "@/components/sections/about";
import { ProjectsSection } from "@/components/sections/projects";
import { ContactSection } from "@/components/sections/contact";
import { getPublishedProjects } from "@/lib/projects";

export default async function HomePage() {
  const projects = await getPublishedProjects();

  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <ProjectsSection projects={projects} />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
