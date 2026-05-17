import { MessagesTable } from "@/components/admin/messages-table";

export default function AdminMessagesPage() {
  return (
    <div>
      <h1 className="font-display text-3xl text-cream-50">رسائل الزوار</h1>
      <p className="mt-2 text-sm text-cream-400/60">
        اعرض رسائل نموذج التواصل مع البريد الإلكتروني للرد.
      </p>
      <div className="mt-8">
        <MessagesTable />
      </div>
    </div>
  );
}
