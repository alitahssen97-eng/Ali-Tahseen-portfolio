import { ProjectForm } from "@/components/admin/project-form";

export default function NewProjectPage() {
  return (
    <div>
      <h1 className="font-display text-3xl text-cream-50">مشروع جديد</h1>
      <div className="mt-8">
        <ProjectForm />
      </div>
    </div>
  );
}

