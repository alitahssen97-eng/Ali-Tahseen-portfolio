import { ProfileSettings } from "@/components/admin/profile-settings";

export default function AdminSettingsPage() {
  return (
    <div>
      <h1 className="font-display text-3xl text-cream-50">إعدادات الموقع</h1>
      <p className="mt-2 text-sm text-cream-400/60">
        غيّر الصورة الشخصية التي تظهر في الصفحة الرئيسية وقسم «عني».
      </p>
      <div className="mt-8">
        <ProfileSettings />
      </div>
    </div>
  );
}
