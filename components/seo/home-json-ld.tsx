import { siteConfig } from "@/lib/constants";
import { getSiteUrl } from "@/lib/seo/site-url";

export function HomeJsonLd() {
  const siteUrl = getSiteUrl();

  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteConfig.name,
    alternateName: siteConfig.nameAr,
    url: siteUrl,
    email: `mailto:${siteConfig.email}`,
    jobTitle: "Expert Full-Stack Engineer",
    description: siteConfig.description,
    image: `${siteUrl}${siteConfig.profileImage}`,
    sameAs: [siteConfig.instagram.url, siteConfig.whatsapp.url],
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    alternateName: siteConfig.nameAr,
    url: siteUrl,
    description: siteConfig.description,
    inLanguage: ["en", "ar"],
    publisher: {
      "@type": "Person",
      name: siteConfig.name,
    },
  };

  const professional = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: siteConfig.name,
    url: siteUrl,
    description: siteConfig.description,
    email: siteConfig.email,
    areaServed: "Worldwide",
    availableLanguage: ["English", "Arabic"],
  };

  const graph = {
    "@context": "https://schema.org",
    "@graph": [person, website, professional],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
