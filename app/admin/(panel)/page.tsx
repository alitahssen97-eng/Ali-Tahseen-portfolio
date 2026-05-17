import Link from "next/link";
import { requireAdmin } from "@/lib/auth/admin";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FileText, FolderKanban, Mail, Settings } from "lucide-react";

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  let projectCount = 0;
  let publishedCount = 0;
  let messageCount = 0;

  if (process.env.DATABASE_URL) {
    try {
      [projectCount, publishedCount, messageCount] = await Promise.all([
        prisma.project.count(),
        prisma.project.count({ where: { published: true } }),
        prisma.message.count({ where: { status: "PENDING" } }),
      ]);
    } catch {
      // database unavailable
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-cream-50">لوحة التحكم</h1>
      <p className="mt-2 text-cream-400/60">
        مرحباً، {admin.email}
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <StatCard label="إجمالي المشاريع" value={projectCount} />
        <StatCard label="منشور" value={publishedCount} />
        <StatCard label="رسائل جديدة" value={messageCount} href="/admin/messages" />
      </div>

      <div className="mt-10 flex flex-wrap gap-4">
        <Button asChild>
          <Link href="/admin/content">
            <FileText className="h-4 w-4" />
            تعديل النصوص
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/projects">
            <FolderKanban className="h-4 w-4" />
            إدارة الأعمال
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/messages">
            <Mail className="h-4 w-4" />
            رسائل الزوار
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/settings">
            <Settings className="h-4 w-4" />
            الصورة الشخصية
          </Link>
        </Button>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  href,
}: {
  label: string;
  value: number;
  href?: string;
}) {
  const inner = (
    <>
      <p className="text-3xl font-light text-emerald-400">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-wider text-cream-400/50">
        {label}
      </p>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="rounded-lg border border-neutral-800 bg-neutral-950/40 p-6 transition-colors hover:border-emerald-800/50"
      >
        {inner}
      </Link>
    );
  }

  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-950/40 p-6">
      {inner}
    </div>
  );
}
