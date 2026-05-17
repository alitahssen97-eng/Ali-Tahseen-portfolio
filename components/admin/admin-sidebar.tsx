"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FileText,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  ExternalLink,
  Mail,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/admin", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/admin/content", label: "النصوص", icon: FileText },
  { href: "/admin/projects", label: "الأعمال", icon: FolderKanban },
  { href: "/admin/messages", label: "الرسائل", icon: Mail },
  { href: "/admin/settings", label: "الإعدادات", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="flex w-full flex-col border-b border-neutral-800 bg-neutral-950/80 p-4 lg:w-64 lg:min-h-screen lg:border-b-0 lg:border-e">
      <div className="mb-8">
        <Link href="/admin" className="font-display text-xl text-cream-50">
          Admin<span className="text-emerald-500">.</span>
        </Link>
        <p className="mt-1 text-xs text-cream-400/50">Ali Tahseen Portfolio</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm transition-colors",
              pathname === href || (href !== "/admin" && pathname.startsWith(`${href}/`))
                ? "bg-emerald-950/50 text-emerald-300"
                : "text-cream-300/70 hover:bg-neutral-900 hover:text-cream-100"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="mt-6 flex flex-col gap-2 border-t border-neutral-800 pt-6">
        <Button asChild variant="ghost" size="sm" className="justify-start">
          <Link href="/" target="_blank">
            <ExternalLink className="h-4 w-4" />
            عرض الموقع
          </Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="justify-start"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          تسجيل الخروج
        </Button>
      </div>
    </aside>
  );
}
