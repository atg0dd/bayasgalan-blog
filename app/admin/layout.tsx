export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ height: "100dvh", overflow: "hidden" }}>{children}</div>
  );
}
