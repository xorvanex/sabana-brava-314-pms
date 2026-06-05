export default function AdminAlert({ type = "error", message, onDismiss }) {
  if (!message) return null;

  const styles =
    type === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : "border-red-200 bg-red-50 text-red-700";

  return (
    <div
      role="alert"
      className={`flex items-start justify-between gap-3 rounded-lg border px-3 py-2 text-sm ${styles}`}
    >
      <span>{message}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 text-xs font-medium underline"
        >
          Cerrar
        </button>
      )}
    </div>
  );
}