export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  onClick,
  type = "button",
  className = "",
  icon,
  iconPosition = "right",
}) {
  const base =
    "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md";

  const variants = {
    primary:
      "bg-emerald-500 hover:bg-emerald-400 text-slate-900 focus:ring-emerald-500/40",
    secondary:
      "border border-skin-border hover:bg-skin-hover text-skin-text-secondary hover:text-skin-text focus:ring-skin-border",
    danger: "bg-red-500 hover:bg-red-400 text-white focus:ring-red-500/40",
    ghost:
      "text-skin-text-secondary hover:text-skin-text hover:bg-skin-hover focus:ring-skin-border",
    outline:
      "border border-skin-border hover:border-emerald-500/50 hover:text-emerald-500 text-skin-text-secondary focus:ring-emerald-500/40",
  };

  const sizes = {
    sm: "text-xs px-3 py-1.5",
    md: "text-sm px-4 py-2.5",
    lg: "text-sm px-6 py-3.5",
  };

  const Spinner = () => (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v8z"
      />
    </svg>
  );

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading && <Spinner />}
      {!loading && icon && iconPosition === "left" && icon}
      {children}
      {!loading && icon && iconPosition === "right" && icon}
    </button>
  );
}
