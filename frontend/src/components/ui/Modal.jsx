import { useEffect } from "react";
import Button from "./Button.jsx";

export default function Modal({
  title,
  description,
  children,
  onClose,
  size = "md",
  showFooter = false,
  confirmLabel = "Confirm",
  confirmVariant = "primary",
  cancelLabel = "Cancel",
  onConfirm,
  loading = false,
}) {
  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`border border-skin-border rounded-2xl w-full ${sizes[size]} animate-slide-up`}
        style={{
          boxShadow: "var(--shadow-lg)",
          backgroundColor: "var(--bg-card)",
        }}
      >
        {/* Header */}
        {(title || description) && (
          <div className="px-6 pt-6 pb-4">
            {title && (
              <h3 className="text-skin-text font-semibold text-lg">{title}</h3>
            )}
            {description && (
              <p className="text-skin-text-secondary text-sm mt-1">
                {description}
              </p>
            )}
          </div>
        )}

        {/* Body */}
        {children && <div className="px-6 pb-4">{children}</div>}

        {/* Footer */}
        {showFooter && (
          <div className="px-6 pb-6 flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={onClose}>
              {cancelLabel}
            </Button>
            <Button
              variant={confirmVariant}
              className="flex-1"
              onClick={onConfirm}
              loading={loading}
            >
              {confirmLabel}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
