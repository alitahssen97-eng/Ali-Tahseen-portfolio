"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Project } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Pencil, Plus, Trash2 } from "lucide-react";

export function ProjectsTable() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/admin/projects");
    const data = await res.json();
    setProjects(data.projects ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("حذف هذا المشروع؟")) return;
    await fetch(`/api/admin/projects/${id}`, { method: "DELETE" });
    load();
  }

  async function togglePublished(project: Project) {
    await fetch(`/api/admin/projects/${project.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !project.published }),
    });
    load();
  }

  if (loading) {
    return <p className="text-cream-400/60">جاري التحميل...</p>;
  }

  return (
    <div>
      <div className="mb-6 flex justify-end">
        <Button asChild>
          <Link href="/admin/projects/new">
            <Plus className="h-4 w-4" />
            مشروع جديد
          </Link>
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-neutral-800">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="border-b border-neutral-800 bg-neutral-950/80 text-xs uppercase tracking-wider text-cream-400/50">
            <tr>
              <th className="px-4 py-3 text-start">المشروع</th>
              <th className="px-4 py-3 text-start">الحالة</th>
              <th className="px-4 py-3 text-start">مميز</th>
              <th className="px-4 py-3 text-end">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr
                key={project.id}
                className="border-b border-neutral-800/50 hover:bg-neutral-950/40"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-16 overflow-hidden rounded-sm">
                      <Image
                        src={project.imageUrl}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    <span className="font-medium text-cream-100">
                      {project.title}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => togglePublished(project)}
                    className={`rounded-sm px-2 py-1 text-xs ${
                      project.published
                        ? "bg-emerald-950/60 text-emerald-300"
                        : "bg-neutral-800 text-cream-400"
                    }`}
                  >
                    {project.published ? "منشور" : "مسودة"}
                  </button>
                </td>
                <td className="px-4 py-3 text-cream-300">
                  {project.featured ? "نعم" : "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Button asChild variant="ghost" size="icon">
                      <Link href={`/admin/projects/${project.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(project.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {projects.length === 0 && (
          <p className="p-8 text-center text-cream-400/50">لا توجد مشاريع</p>
        )}
      </div>
    </div>
  );
}
