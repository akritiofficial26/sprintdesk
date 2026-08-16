const BASE = "animate-pulse bg-surface-container-highest motion-reduce:animate-none";

/**
 * The design system's loading placeholder. Purely decorative, so it is hidden
 * from assistive tech — the surrounding live region carries the status text.
 *
 * `animate-pulse` is an opacity keyframe (compositor-only, no layout or paint
 * invalidation), and it is disabled under `prefers-reduced-motion`.
 *
 * The default `rounded-lg` is dropped when the caller supplies its own radius.
 * It has to be: this project overrides `lg` in `theme.extend.borderRadius`,
 * which moves `.rounded-lg` *after* `.rounded-full` and `.rounded-2xl` in the
 * emitted stylesheet — so the base class would otherwise win on source order
 * and a `rounded-full` placeholder would render square.
 */
export function Skeleton({ className = "" }: { className?: string }) {
  const radius = className.includes("rounded") ? "" : " rounded-lg";

  return <div aria-hidden="true" className={`${BASE}${radius} ${className}`} />;
}
