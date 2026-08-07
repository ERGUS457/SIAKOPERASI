export default function JurnalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6 pb-8">
      {children}
    </div>
  );
}
