/** Shared layout tokens for consistent spacing across breakpoints */
export const layout = {
  container:
    "mx-auto w-full min-w-0 max-w-7xl [padding-inline:max(1rem,env(safe-area-inset-left,0px))_max(1rem,env(safe-area-inset-right,0px))] sm:[padding-inline:max(1.5rem,env(safe-area-inset-left,0px))_max(1.5rem,env(safe-area-inset-right,0px))] lg:[padding-inline:max(2rem,env(safe-area-inset-left,0px))_max(2rem,env(safe-area-inset-right,0px))]",
  section: "w-full min-w-0 overflow-x-clip py-16 sm:py-28 lg:py-36",
  navbarShell:
    "fixed inset-x-0 top-0 z-50 w-full max-w-[100vw] overflow-x-clip pt-[env(safe-area-inset-top,0px)]",
  navbarInner:
    "grid min-h-14 w-full min-w-0 grid-cols-[1fr_auto_1fr] items-center gap-2 sm:min-h-16 sm:gap-3",
  navbarOffset:
    "pt-[calc(3.5rem+env(safe-area-inset-top,0px))] sm:pt-[calc(4rem+env(safe-area-inset-top,0px))]",
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
