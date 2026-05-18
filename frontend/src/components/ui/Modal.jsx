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
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`border border-skin-border rounded-t-2xl sm:rounded-2xl w-full ${sizes[size]} animate-slide-up
                    max-h-[90vh] overflow-y-auto flex flex-col`}
        style={{
          boxShadow: "var(--shadow-lg)",
          backgroundColor: "var(--bg-card)",
        }}
      >
        {/* Header */}
        {(title || description) && (
          <div className="px-6 pt-6 pb-4 flex-shrink-0 flex items-start justify-between gap-3">
            <div>
              {title && (
                <h3 className="text-skin-text font-semibold text-lg">{title}</h3>
              )}
              {description && (
                <p className="text-skin-text-secondary text-sm mt-1">
                  {description}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-skin-text-muted hover:text-skin-text hover:bg-skin-hover transition-colors mt-0.5"
              aria-label="Close"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Body */}
        {children && <div className="px-6 pb-4 flex-1 min-h-0">{children}</div>}

        {/* Footer */}
        {showFooter && (
          <div className="px-6 pb-6 flex gap-3 flex-shrink-0">
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