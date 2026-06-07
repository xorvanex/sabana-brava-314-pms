export default function Input({
  label,
  id,
  name,
  type = "text",
  value = "",
  onChange,
  placeholder,
  autoComplete,
  required = true,
  disabled = false,
  readOnly = false,
}) {
  const inputId = id ?? name;
  const inputName = name ?? id;
  const isReadOnly = readOnly || typeof onChange !== "function";

  return (
    <div>
      <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={inputId}
        name={inputName}
        type={type}
        value={value ?? ""}
        onChange={isReadOnly ? undefined : onChange}
        readOnly={isReadOnly}
        disabled={disabled}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required && !disabled && !isReadOnly}
        className={`w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 ${
          disabled || isReadOnly ? "cursor-not-allowed bg-gray-50" : ""
        }`}
      />
    </div>
  );
}