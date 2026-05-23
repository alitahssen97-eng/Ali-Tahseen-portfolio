import type { Project } from "@prisma/client";

export const sampleProjects: Project[] = [
  {
    id: "sample-1",
    title: "Aurora Finance Platform",
    description:
      "Enterprise-grade wealth management dashboard with real-time analytics, portfolio visualization, and institutional security standards.",
    descriptionAr: null,
    imageUrl:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80",
    liveLink: "https://example.com",
    githubLink: "https://github.com",
    tags: ["Next.js", "TypeScript", "Prisma", "Supabase"],
    featured: true,
    published: true,
    createdAt: new Date("2025-11-01"),
    updatedAt: new Date("2025-11-01"),
  },
  {
    id: "sample-2",
    title: "Meridian Architecture Studio",
    description:
      "Immersive digital experience for a luxury architecture firm—cinematic scroll narratives, 3D project galleries, and lead capture.",
    descriptionAr: null,
    imageUrl:
      "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=1200&q=80",
    liveLink: "https://example.com",
    githubLink: null,
    tags: ["React", "Framer Motion", "Three.js", "Tailwind"],
    featured: true,
    published: true,
    createdAt: new Date("2025-09-15"),
    updatedAt: new Date("2025-09-15"),
  },
  {
    id: "sample-3",
    title: "Nexus DevOps Control Center",
    description:
      "Unified CI/CD observability platform with pipeline orchestration, incident alerts, and multi-cloud deployment tracking.",
    descriptionAr: null,
    imageUrl:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80",
    liveLink: "https://example.com",
    githubLink: "https://github.com",
    tags: ["Node.js", "Kubernetes", "PostgreSQL", "Redis"],
    featured: false,
    published: true,
    createdAt: new Date("2025-07-20"),
    updatedAt: new Date("2025-07-20"),
  },
  {
    id: "sample-4",
    title: "Velvet Commerce Suite",
    description:
      "Headless e-commerce ecosystem with personalized recommendations, subscription billing, and sub-100ms edge delivery.",
    descriptionAr: null,
    imageUrl:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80",
    liveLink: "https://example.com",
    githubLink: "https://github.com",
    tags: ["Next.js", "Stripe", "GraphQL", "Vercel"],
    featured: false,
    published: true,
    createdAt: new Date("2025-05-08"),
    updatedAt: new Date("2025-05-08"),
  },
  {
    id: "sample-5",
    title: "Cipher Identity Vault",
    description:
      "Zero-trust authentication microservice with WebAuthn, adaptive MFA, and compliance-ready audit trails.",
    descriptionAr: null,
    imageUrl:
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&q=80",
    liveLink: null,
    githubLink: "https://github.com",
    tags: ["Rust", "OAuth 2.0", "PostgreSQL", "gRPC"],
    featured: true,
    published: true,
    createdAt: new Date("2025-03-12"),
    updatedAt: new Date("2025-03-12"),
  },
  {
    id: "sample-6",
    title: "Horizon AI Research Lab",
    description:
      "Interactive research portal for ML experiment tracking, dataset versioning, and collaborative model evaluation.",
    descriptionAr: null,
    imageUrl:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=80",
    liveLink: "https://example.com",
    githubLink: "https://github.com",
    tags: ["Python", "FastAPI", "PyTorch", "Docker"],
    featured: false,
    published: true,
    createdAt: new Date("2025-01-28"),
    updatedAt: new Date("2025-01-28"),
  },
];
