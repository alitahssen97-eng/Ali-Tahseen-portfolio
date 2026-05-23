"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Languages, Save } from "lucide-react";
import {
  isArabicFieldTranslatable,
  shouldSkipAutoTranslate,
} from "@/lib/translate";

type ContentRow = {
  key: string;
  en: string;
  ar: string;
  group: string;
};

function isLongValue(value: string) {
  return value.length > 80 || value.startsWith("[") || value.startsWith("{");
}

export function ContentEditor() {
  const [rows, setRows] = useState<ContentRow[]>([]);
  const [filter, setFilter] = useState("");
  const [group, setGroup] = useState("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/content")
      .then((r) => r.json())
      .then((data) => setRows(data.rows ?? []))
      .finally(() => setLoading(false));
  }, []);

  const groups = useMemo(
    () => ["all", ...new Set(rows.map((r) => r.group))],
    [rows]
  );

  const filtered = rows.filter((row) => {
    const matchGroup = group === "all" || row.group === group;
    const q = filter.toLowerCase();
    const matchSearch =
      !q ||
      row.key.toLowerCase().includes(q) ||
      row.en.toLowerCase().includes(q) ||
      row.ar.includes(filter);
    return matchGroup && matchSearch;
  });

  function updateRow(key: string, field: "en" | "ar", value: string) {
    setRows((prev) =>
      prev.map((r) => (r.key === key ? { ...r, [field]: value } : r))
    );
  }

  async function translateText(text: string) {
    const res = await fetch("/api/admin/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, source: "ar", target: "en" }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Translation failed");
    return data.translated as string;
  }

  async function translateRow(key: string) {
    const row = rows.find((r) => r.key === key);
    if (!row?.ar.trim() || shouldSkipAutoTranslate(row.ar)) return;

    setTranslating(true);
    setMessage("");
    try {
      const translated = await translateText(row.ar);
      updateRow(key, "en", translated);
      setMessage("تمت ترجمة الحقل إلى الإنجليزية");
    } catch {
      setMessage("فشلت الترجمة. حاول مرة أخرى.");
    } finally {
      setTranslating(false);
    }
  }

  async function translateAllFromArabic() {
    const eligible = rows.filter((r) => isArabicFieldTranslatable(r.ar));
    if (eligible.length === 0) {
      const hasArabic = rows.some((r) => r.ar.trim());
      setMessage(
        hasArabic
          ? "لا توجد حقول نصية للترجمة (القوائم والإحصائيات تُعدَّل يدوياً)."
          : "أضف نصاً عربياً في الحقول أولاً ثم اضغط الترجمة."
      );
      return;
    }

    setTranslating(true);
    setMessage("");
    let failed = 0;

    const updated = [...rows];
    for (const row of eligible) {
      try {
        const translated = await translateText(row.ar);
        const idx = updated.findIndex((r) => r.key === row.key);
        if (idx >= 0) updated[idx] = { ...updated[idx], en: translated };
        await new Promise((r) => setTimeout(r, 350));
      } catch {
        failed += 1;
      }
    }

    setRows(updated);
    setTranslating(false);
    setMessage(
      failed > 0
        ? `تمت ترجمة ${eligible.length - failed} حقول، فشل ${failed}`
        : `تمت ترجمة ${eligible.length} حقول إلى الإنجليزية — احفظ التغييرات`
    );
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/admin/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows }),
    });
    setSaving(false);
    setMessage(res.ok ? "تم الحفظ بنجاح" : "فشل الحفظ");
  }

  if (loading) {
    return <p className="text-cream-400/60">جاري التحميل...</p>;
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <Input
            placeholder="بحث..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="max-w-xs"
          />
          <select
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            className="h-11 rounded-sm border border-neutral-800 bg-neutral-950 px-3 text-sm text-cream-100"
          >
            {groups.map((g) => (
              <option key={g} value={g}>
                {g === "all" ? "كل الأقسام" : g}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={translateAllFromArabic}
            disabled={translating || saving}
          >
            <Languages className="h-4 w-4" />
            {translating ? "جاري الترجمة..." : "ترجمة الكل عربي → إنجليزي"}
          </Button>
          <Button onClick={handleSave} disabled={saving || translating}>
            <Save className="h-4 w-4" />
            {saving ? "جاري الحفظ..." : "حفظ الكل"}
          </Button>
        </div>
      </div>

      {message && (
        <p
          className={`mt-4 text-sm ${message.includes("نجاح") ? "text-emerald-400" : "text-red-400"}`}
        >
          {message}
        </p>
      )}

      <div className="mt-8 space-y-6">
        {filtered.map((row) => (
          <div
            key={row.key}
            className="rounded-lg border border-neutral-800 bg-neutral-950/40 p-4"
          >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="font-mono text-xs text-emerald-500/80">{row.key}</p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                disabled={translating || !isArabicFieldTranslatable(row.ar)}
                onClick={() => translateRow(row.key)}
              >
                <Languages className="h-3 w-3" />
                عربي → إنجليزي
              </Button>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <p className="mb-1 text-xs text-cream-400/50">English</p>
                {isLongValue(row.en) ? (
                  <Textarea
                    value={row.en}
                    onChange={(e) => updateRow(row.key, "en", e.target.value)}
                    rows={4}
                  />
                ) : (
                  <Input
                    value={row.en}
                    onChange={(e) => updateRow(row.key, "en", e.target.value)}
                  />
                )}
              </div>
              <div>
                <p className="mb-1 text-xs text-cream-400/50">العربية</p>
                {isLongValue(row.ar) ? (
                  <Textarea
                    value={row.ar}
                    onChange={(e) => updateRow(row.key, "ar", e.target.value)}
                    rows={4}
                    dir="rtl"
                  />
                ) : (
                  <Input
                    value={row.ar}
                    onChange={(e) => updateRow(row.key, "ar", e.target.value)}
                    dir="rtl"
                  />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
