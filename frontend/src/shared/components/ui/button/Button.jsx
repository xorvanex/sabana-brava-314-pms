export default function Button({
  children,
  type = "button",
  disabled = false,
  className = "",
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`w-full rounded-lg bg-emerald-700 px-4 py-2.5 font-medium text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-70 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}