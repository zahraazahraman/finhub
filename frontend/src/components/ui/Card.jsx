export default function Card({
  children,
  className = "",
  padding = "md",
  hover = false,
  onClick,
  ...props
}) {
  const paddings = {
    none: "",
    sm:   "p-4",
    md:   "p-6",
    lg:   "p-8",
  };

  return (
    <div
      className={`
      bg-skin-card border border-skin-border rounded-2xl overflow-hidden
      transition-all duration-150 animate-slide-up
      ${paddings[padding]}
      ${hover ? "hover:shadow-md cursor-pointer" : ""}
      ${className}
    `}
      style={{ boxShadow: 'var(--shadow-md)' }}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}