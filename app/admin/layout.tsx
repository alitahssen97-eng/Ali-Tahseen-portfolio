export const metadata = {
  title: "Admin | Ali Tahseen",
  robots: "noindex, nofollow",
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#080808] text-cream-100">{children}</div>
  );
}
