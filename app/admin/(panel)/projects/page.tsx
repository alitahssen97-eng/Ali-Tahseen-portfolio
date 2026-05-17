import { ProjectsTable } from "@/components/admin/projects-table";

export default function AdminProjectsPage() {
  return (
    <div>
      <h1 className="font-display text-3xl text-cream-50">إدارة الأعمال</h1>
      <p className="mt-2 text-sm text-cream-400/60">
        أضف، عدّل، انشر أو احذف مشاريعك من هنا.
      </p>
      <div className="mt-8">
        <ProjectsTable />
      </div>
    </div>
  );
}

