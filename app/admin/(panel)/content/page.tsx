import { ContentEditor } from "@/components/admin/content-editor";

export default function AdminContentPage() {
  return (
    <div>
      <h1 className="font-display text-3xl text-cream-50">تعديل النصوص</h1>
      <p className="mt-2 text-sm text-cream-400/60">
        عدّل النصوص بالعربية ثم استخدم «ترجمة عربي → إنجليزي» لمزامنة الإنجليزية،
        واحفظ التغييرات.
      </p>
      <div className="mt-8">
        <ContentEditor />
      </div>
    </div>
  );
}
