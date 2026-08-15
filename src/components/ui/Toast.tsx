import { createPortal } from "react-dom";
import { useToastStore, type ToastVariant } from "../../store/toastStore";

const variantClasses: Record<ToastVariant, string> = {
  info: "border-outline-variant bg-surface-bright text-on-surface",
  success: "border-success/30 bg-success-container text-success",
  error: "border-error/30 bg-error-container text-on-error-container",
};

const variantIcons: Record<ToastVariant, string> = {
  info: "info",
  success: "check_circle",
  error: "error",
};

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const dismissToast = useToastStore((s) => s.dismissToast);

  if (toasts.length === 0) return null;

  return createPortal(
    <div
      className="fixed bottom-md right-md z-[60] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-sm"
      aria-live="polite"
      role="status"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={[
            "flex items-start gap-sm rounded-lg border p-md shadow-subtle",
            variantClasses[toast.variant],
          ].join(" ")}
        >
          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
            {variantIcons[toast.variant]}
          </span>
          <p className="flex-1 text-body-sm">{toast.message}</p>
          <button
            onClick={() => dismissToast(toast.id)}
            aria-label="Dismiss notification"
            className="text-on-surface-variant transition-colors hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              close
            </span>
          </button>
        </div>
      ))}
    </div>,
    document.body
  );
}
