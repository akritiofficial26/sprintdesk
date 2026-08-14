export function FullScreenLoader({ label = "Loading..." }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-screen flex-col items-center justify-center gap-md bg-background"
    >
      <span
        className="material-symbols-outlined animate-spin text-primary text-[32px]"
        aria-hidden="true"
      >
        progress_activity
      </span>
      <p className="text-body-md text-on-surface-variant">{label}</p>
    </div>
  );
}
