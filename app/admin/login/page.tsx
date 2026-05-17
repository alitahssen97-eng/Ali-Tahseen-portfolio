import { Suspense } from "react";
import { AdminLoginForm } from "@/components/admin/admin-login-form";

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-cream-400/60">
          جاري التحميل...
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
