import { notFound } from "next/navigation";
import { ProjectForm } from "@/components/admin/project-form";
import { prisma } from "@/lib/prisma";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditProjectPage({ params }: PageProps) {
  const { id } = await params;

  if (!process.env.DATABASE_URL) {
    notFound();
  }

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) notFound();

  return (
    <div>
      <h1 className="font-display text-3xl text-cream-50">تعديل المشروع</h1>
      <p className="mt-2 text-cream-400/60">{project.title}</p>
      <div className="mt-8">
        <ProjectForm project={project} />
      </div>
    </div>
  );
}
