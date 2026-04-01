export default function Badge({
  children,
  variant = "default",
  size = "md",
  className = "",
}) {
  const variants = {
    default:  "bg-skin-hover text-skin-text-secondary border-skin-border",
    success:  "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    danger:   "bg-red-500/10 text-red-500 border-red-500/20",
    warning:  "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    info:     "bg-blue-500/10 text-blue-500 border-blue-500/20",
    purple:   "bg-purple-500/10 text-purple-500 border-purple-500/20",
    orange:   "bg-orange-500/10 text-orange-500 border-orange-500/20",
    pink:     "bg-pink-500/10 text-pink-500 border-pink-500/20",
  };

  const sizes = {
    sm: "text-[10px] px-2 py-0.5",
    md: "text-xs px-2.5 py-1",
    lg: "text-sm px-3 py-1.5",
  };

  return (
    <span className={`
      inline-flex items-center font-medium rounded-full border
      ${variants[variant]}
      ${sizes[size]}
      ${className}
    `}>
      {children}
    </span>
  );
}