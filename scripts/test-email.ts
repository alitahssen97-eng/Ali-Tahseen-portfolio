/**
 * Test Resend configuration: npm run test:email
 */
import { loadProjectEnv } from "./load-env";
import { notifyAdminNewMessage } from "../lib/email";

loadProjectEnv();

async function main() {
  const result = await notifyAdminNewMessage({
    name: "اختبار",
    email: "visitor@example.com",
    subject: "رسالة تجريبية",
    message: "إذا وصلك هذا البريد، إعداد Resend يعمل بشكل صحيح.",
  });

  if (result.ok) {
    console.log("\n✓ تم إرسال بريد الاختبار بنجاح. تحقق من صندوق الوارد والرسائل غير المرغوبة.");
    return;
  }

  console.error("\n✗ فشل إرسال البريد:", result.reason);
  if ("detail" in result && result.detail) {
    console.error("التفاصيل:", result.detail);
  }
  process.exit(1);
}

main();
