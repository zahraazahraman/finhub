export default function Select({
  value,
  onChange,
  options,
  className = "",
}) {
  return (
    <select
      value={value}
      onChange={onChange}
      className={`
        bg-skin-input border border-skin-border rounded-xl px-4
        text-skin-text text-sm h-[46px]
        focus:outline-none focus:ring-2 focus:ring-emerald-500/40
        transition-all duration-150
        ${className}
      `}
      style={{ boxShadow: 'var(--shadow-sm)' }}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}