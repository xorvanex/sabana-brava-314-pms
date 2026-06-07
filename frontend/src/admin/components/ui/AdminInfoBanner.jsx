export default function AdminInfoBanner({ children }) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
      {children}
    </div>
  );
}