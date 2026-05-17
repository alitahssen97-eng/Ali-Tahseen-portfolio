"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Upload } from "lucide-react";

export function ProfileSettings() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => setUrl(data.profileImageUrl ?? ""))
      .finally(() => setLoading(false));
  }, []);

  async function handleSaveUrl(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileImageUrl: url }),
    });
    setSaving(false);
    setMessage(res.ok ? "تم حفظ رابط الصورة" : "فشل الحفظ");
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage("");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "profile");

    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setUploading(false);

    if (res.ok && data.url) {
      setUrl(data.url);
      setMessage("تم رفع الصورة وحفظها بنجاح");
    } else {
      setMessage(data.error ?? "فشل الرفع");
    }
  }

  if (loading) {
    return <p className="text-cream-400/60">جاري التحميل...</p>;
  }

  return (
    <div className="max-w-xl space-y-8">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-full border-2 border-emerald-800/50">
          {url ? (
            <Image src={url} alt="معاينة" fill className="object-cover" unoptimized />
          ) : (
            <div className="flex h-full items-center justify-center bg-neutral-900 text-cream-400/40">
              —
            </div>
          )}
        </div>
        <div className="flex-1 space-y-3">
          <Label>رفع صورة جديدة</Label>
          <p className="text-xs text-cream-400/50">
            JPG أو PNG أو WebP، بحد أقصى 5MB. يتطلب{" "}
            <code className="text-emerald-500/80">SUPABASE_SERVICE_ROLE_KEY</code> في
            ملف .env.
          </p>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-sm border border-neutral-800 px-4 py-2 text-sm text-cream-200 hover:border-emerald-800">
            <Upload className="h-4 w-4" />
            {uploading ? "جاري الرفع..." : "اختر صورة"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      <form onSubmit={handleSaveUrl} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="profileUrl">أو أدخل رابط الصورة مباشرة</Label>
          <Input
            id="profileUrl"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>
        <Button type="submit" disabled={saving}>
          <Save className="h-4 w-4" />
          {saving ? "جاري الحفظ..." : "حفظ الرابط"}
        </Button>
      </form>

      {message && (
        <p
          className={`text-sm ${message.includes("نجاح") || message.includes("حفظ") || message.includes("رفع") ? "text-emerald-400" : "text-red-400"}`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
