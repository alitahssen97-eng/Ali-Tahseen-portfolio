"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Project } from "@prisma/client";
import { Languages, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function isExternalImageUrl(url: string) {
  return url.startsWith("http://") || url.startsWith("https://");
}

type ProjectFormProps = {
  project?: Project;
};

export function ProjectForm({ project }: ProjectFormProps) {
  const router = useRouter();
  const isEdit = Boolean(project);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [translating, setTranslating] = useState<"en2ar" | "ar2en" | null>(
    null
  );
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const [form, setForm] = useState({
    title: project?.title ?? "",
    description: project?.description ?? "",
    descriptionAr: project?.descriptionAr ?? "",
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

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "project");

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "فشل رفع الصورة");
      }
      setField("imageUrl", data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل رفع الصورة");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function translateDescription(direction: "en2ar" | "ar2en") {
    const source = direction === "en2ar" ? "en" : "ar";
    const target = direction === "en2ar" ? "ar" : "en";
    const text = direction === "en2ar" ? form.description : form.descriptionAr;

    if (!text.trim()) {
      setError(
        direction === "en2ar"
          ? "أضف الوصف بالإنجليزية أولاً"
          : "أضف الوصف بالعربية أولاً"
      );
      return;
    }

    setTranslating(direction);
    setError("");
    setInfo("");
    try {
      const res = await fetch("/api/admin/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, source, target }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "فشلت الترجمة");
      const translated = data.translated as string;
      if (direction === "en2ar") {
        setField("descriptionAr", translated);
        setInfo("تمت ترجمة الوصف إلى العربية");
      } else {
        setField("description", translated);
        setInfo("تمت ترجمة الوصف إلى الإنجليزية");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشلت الترجمة");
    } finally {
      setTranslating(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");

    const payload = {
      title: form.title,
      description: form.description,
      descriptionAr: form.descriptionAr.trim() || null,
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
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="description">الوصف (English)</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 text-xs"
            onClick={() => translateDescription("ar2en")}
            disabled={translating !== null || !form.descriptionAr.trim()}
          >
            <Languages className="h-3 w-3" />
            {translating === "ar2en" ? "جاري الترجمة..." : "عربي → إنجليزي"}
          </Button>
        </div>
        <Textarea
          id="description"
          value={form.description}
          onChange={(e) => setField("description", e.target.value)}
          rows={5}
          required
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="descriptionAr">الوصف (العربية)</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 text-xs"
            onClick={() => translateDescription("en2ar")}
            disabled={translating !== null || !form.description.trim()}
          >
            <Languages className="h-3 w-3" />
            {translating === "en2ar" ? "جاري الترجمة..." : "إنجليزي → عربي"}
          </Button>
        </div>
        <Textarea
          id="descriptionAr"
          value={form.descriptionAr}
          onChange={(e) => setField("descriptionAr", e.target.value)}
          rows={5}
          dir="rtl"
          placeholder="اتركه فارغاً لاستخدام الوصف الإنجليزي عند تبديل اللغة"
        />
        <p className="text-xs text-cream-400/50">
          اسم المشروع لن يُترجم تلقائياً — هذا الحقل يُستخدم لإظهار الوصف بالعربية فقط.
        </p>
      </div>

      <div className="space-y-4">
        <Label>صورة المشروع</Label>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="relative aspect-video w-full max-w-xs overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950">
            {form.imageUrl ? (
              <Image
                src={form.imageUrl}
                alt="معاينة المشروع"
                fill
                className="object-cover"
                unoptimized={isExternalImageUrl(form.imageUrl)}
              />
            ) : (
              <div className="flex h-full min-h-[120px] items-center justify-center text-sm text-cream-400/40">
                لا توجد صورة
              </div>
            )}
          </div>
          <div className="flex-1 space-y-3">
            <p className="text-xs text-cream-400/50">
              JPG أو PNG أو WebP، بحد أقصى 5MB
            </p>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-sm border border-neutral-800 px-4 py-2 text-sm text-cream-200 hover:border-emerald-800">
              <Upload className="h-4 w-4" />
              {uploading ? "جاري الرفع..." : "رفع صورة"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                disabled={uploading || loading}
              />
            </label>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="imageUrl">أو أدخل رابط الصورة</Label>
          <Input
            id="imageUrl"
            type="text"
            value={form.imageUrl}
            onChange={(e) => setField("imageUrl", e.target.value)}
            placeholder="https://... أو /uploads/projects/..."
            required
          />
        </div>
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
      {info && <p className="text-sm text-emerald-400">{info}</p>}

      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={
            loading || uploading || translating !== null || !form.imageUrl
          }
        >
          {loading ? "جاري الحفظ..." : isEdit ? "تحديث" : "إنشاء"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          إلغاء
        </Button>
      </div>
    </form>
  );
}
