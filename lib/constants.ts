/** Shared layout tokens for consistent spacing across breakpoints */
export const layout = {
  container: "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8",
  section: "py-20 sm:py-28 lg:py-36",
  navbarHeight: "h-16",
  navbarOffset: "pt-16",
} as const;

export const siteConfig = {
  name: "Eng. Ali Tahseen",
  nameAr: "المهندس علي تحسين",
  title: "Eng. Ali Tahseen | Expert Engineer",
  description:
    "Expert Full-Stack Engineer crafting ultra-premium digital experiences with precision, performance, and architectural excellence.",
  punchline: "Engineering excellence at the intersection of design and code.",
  /** Replace with your photo: add `public/images/ali-profile.jpg` */
  profileImage: "/images/ali-profile.jpg",
  profileImageFallback: "/images/ali-profile.svg",
  email: "ali.tahssen97@gmail.com",
  instagram: {
    handle: "eng.alitahseen",
    url: "https://www.instagram.com/eng.alitahseen",
  },
  whatsapp: {
    display: "07772009060",
    url: "https://wa.me/9647772009060",
  },
  nav: [
    { id: "about" as const, href: "#about" },
    { id: "work" as const, href: "#projects" },
    { id: "contact" as const, href: "#contact" },
  ],
} as const;
