"use client";

import { useEffect, useState } from "react";
import type { Message, MessageStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Mail, Trash2 } from "lucide-react";

const statusLabels: Record<MessageStatus, string> = {
  PENDING: "جديدة",
  READ: "مقروءة",
  REPLIED: "تم الرد",
  ARCHIVED: "مؤرشفة",
};

export function MessagesTable() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Message | null>(null);

  async function load() {
    const res = await fetch("/api/admin/messages");
    const data = await res.json();
    setMessages(data.messages ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(id: string, status: MessageStatus) {
    await fetch(`/api/admin/messages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
    if (selected?.id === id) {
      setSelected((s) => (s ? { ...s, status } : null));
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("حذف هذه الرسالة؟")) return;
    await fetch(`/api/admin/messages/${id}`, { method: "DELETE" });
    if (selected?.id === id) setSelected(null);
    load();
  }

  if (loading) {
    return <p className="text-cream-400/60">جاري التحميل...</p>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-2 space-y-2">
        {messages.length === 0 ? (
          <p className="text-cream-400/50">لا توجد رسائل بعد</p>
        ) : (
          messages.map((msg) => (
            <button
              key={msg.id}
              type="button"
              onClick={() => {
                setSelected(msg);
                if (msg.status === "PENDING") updateStatus(msg.id, "READ");
              }}
              className={`w-full rounded-lg border p-4 text-start transition-colors ${
                selected?.id === msg.id
                  ? "border-emerald-800/60 bg-emerald-950/30"
                  : "border-neutral-800 bg-neutral-950/40 hover:border-neutral-700"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-medium text-cream-100">{msg.name}</span>
                <span
                  className={`shrink-0 rounded-sm px-2 py-0.5 text-[10px] uppercase ${
                    msg.status === "PENDING"
                      ? "bg-emerald-950 text-emerald-300"
                      : "bg-neutral-800 text-cream-400"
                  }`}
                >
                  {statusLabels[msg.status]}
                </span>
              </div>
              <p className="mt-1 flex items-center gap-1 text-xs text-emerald-400/80">
                <Mail className="h-3 w-3" />
                {msg.email}
              </p>
              <p className="mt-1 truncate text-sm text-cream-400/60">
                {msg.subject}
              </p>
              <p className="mt-2 text-[10px] text-cream-400/40">
                {new Date(msg.createdAt).toLocaleString("ar")}
              </p>
            </button>
          ))
        )}
      </div>

      <div className="lg:col-span-3">
        {selected ? (
          <div className="rounded-lg border border-neutral-800 bg-neutral-950/40 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg text-cream-50">{selected.name}</h3>
                <a
                  href={`mailto:${selected.email}`}
                  className="mt-1 inline-flex items-center gap-1 text-sm text-emerald-400 hover:underline"
                >
                  <Mail className="h-4 w-4" />
                  {selected.email}
                </a>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(selected.id)}
              >
                <Trash2 className="h-4 w-4 text-red-400" />
              </Button>
            </div>

            <p className="mt-4 text-sm text-cream-400/50">الموضوع</p>
            <p className="text-cream-100">{selected.subject}</p>

            <p className="mt-4 text-sm text-cream-400/50">الرسالة</p>
            <p className="whitespace-pre-wrap leading-relaxed text-cream-200">
              {selected.message}
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {(
                ["PENDING", "READ", "REPLIED", "ARCHIVED"] as MessageStatus[]
              ).map((status) => (
                <Button
                  key={status}
                  variant={selected.status === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateStatus(selected.id, status)}
                >
                  {statusLabels[status]}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-neutral-800 text-cream-400/40">
            اختر رسالة لعرض التفاصيل
          </div>
        )}
      </div>
    </div>
  );
}
