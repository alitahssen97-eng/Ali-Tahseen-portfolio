import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const projects = [
  {
    title: "Aurora Finance Platform",
    description:
      "Enterprise-grade wealth management dashboard with real-time analytics, portfolio visualization, and institutional security standards.",
    imageUrl:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80",
    liveLink: "https://example.com",
    githubLink: "https://github.com",
    tags: ["Next.js", "TypeScript", "Prisma", "Supabase"],
    featured: true,
    published: true,
  },
  {
    title: "Meridian Architecture Studio",
    description:
      "Immersive digital experience for a luxury architecture firm—cinematic scroll narratives, 3D project galleries, and lead capture.",
    imageUrl:
      "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=1200&q=80",
    liveLink: "https://example.com",
    githubLink: null,
    tags: ["React", "Framer Motion", "Three.js", "Tailwind"],
    featured: true,
    published: true,
  },
  {
    title: "Nexus DevOps Control Center",
    description:
      "Unified CI/CD observability platform with pipeline orchestration, incident alerts, and multi-cloud deployment tracking.",
    imageUrl:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80",
    liveLink: "https://example.com",
    githubLink: "https://github.com",
    tags: ["Node.js", "Kubernetes", "PostgreSQL", "Redis"],
    featured: false,
    published: true,
  },
  {
    title: "Velvet Commerce Suite",
    description:
      "Headless e-commerce ecosystem with personalized recommendations, subscription billing, and sub-100ms edge delivery.",
    imageUrl:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80",
    liveLink: "https://example.com",
    githubLink: "https://github.com",
    tags: ["Next.js", "Stripe", "GraphQL", "Vercel"],
    featured: false,
    published: true,
  },
  {
    title: "Cipher Identity Vault",
    description:
      "Zero-trust authentication microservice with WebAuthn, adaptive MFA, and compliance-ready audit trails.",
    imageUrl:
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&q=80",
    liveLink: null,
    githubLink: "https://github.com",
    tags: ["Rust", "OAuth 2.0", "PostgreSQL", "gRPC"],
    featured: true,
    published: true,
  },
  {
    title: "Horizon AI Research Lab",
    description:
      "Interactive research portal for ML experiment tracking, dataset versioning, and collaborative model evaluation.",
    imageUrl:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=80",
    liveLink: "https://example.com",
    githubLink: "https://github.com",
    tags: ["Python", "FastAPI", "PyTorch", "Docker"],
    featured: false,
    published: true,
  },
];

async function main() {
  await prisma.project.deleteMany();
  await prisma.project.createMany({ data: projects });
  console.log(`Seeded ${projects.length} projects.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
