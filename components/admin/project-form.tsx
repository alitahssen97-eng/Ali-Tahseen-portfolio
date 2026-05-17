"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Project } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ProjectFormProps = {
  project?: Project;
};

export function ProjectForm({ project }: ProjectFormProps) {
  const router = useRouter();
  const isEdit = Boolean(project);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: project?.title ?? "",
    description: project?.description ?? "",
    imageUrl: project?.imageUrl ?? "",
    liveLink: project?.liveLink ?? "",
    githubLink: project?.githubLink ?? "",
    tags: project?.tags.join(", ") ?? "",
    featured: project?.featured ?? false,
    published: project?.published ?? false,
  });

  function setField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      title: form.title,
      description: form.description,
      imageUrl: form.imageUrl,
      liveLink: form.liveLink.trim() || null,
      githubLink: form.githubLink.trim() || null,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      featured: form.featured,
      published: form.published,
    };

    const url = isEdit
      ? `/api/admin/projects/${project!.id}`
      : "/api/admin/projects";
    const method = isEdit ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "فشل الحفظ");
      return;
    }

    router.push("/admin/projects");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">العنوان</Label>
        <Input
          id="title"
          value={form.title}
          onChange={(e) => setField("title", e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">الوصف</Label>
        <Textarea
          id="description"
          value={form.description}
          onChange={(e) => setField("description", e.target.value)}
          rows={5}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="imageUrl">رابط الصورة</Label>
        <Input
          id="imageUrl"
          type="url"
          value={form.imageUrl}
          onChange={(e) => setField("imageUrl", e.target.value)}
          placeholder="https://..."
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="liveLink">رابط المشروع (اختياري)</Label>
          <Input
            id="liveLink"
            type="url"
            value={form.liveLink}
            onChange={(e) => setField("liveLink", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="githubLink">GitHub (اختياري)</Label>
          <Input
            id="githubLink"
            type="url"
            value={form.githubLink}
            onChange={(e) => setField("githubLink", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">التقنيات (مفصولة بفاصلة)</Label>
        <Input
          id="tags"
          value={form.tags}
          onChange={(e) => setField("tags", e.target.value)}
          placeholder="Next.js, TypeScript, Prisma"
        />
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm text-cream-200">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => setField("featured", e.target.checked)}
            className="accent-emerald-500"
          />
          مشروع مميز
        </label>
        <label className="flex items-center gap-2 text-sm text-cream-200">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => setField("published", e.target.checked)}
            className="accent-emerald-500"
          />
          منشور على الموقع
        </label>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "جاري الحفظ..." : isEdit ? "تحديث" : "إنشاء"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          إلغاء
        </Button>
      </div>
    </form>
  );
}
