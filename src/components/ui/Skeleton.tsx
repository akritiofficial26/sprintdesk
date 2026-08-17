const BASE = "animate-pulse bg-surface-container-highest motion-reduce:animate-none";


export function Skeleton({ className = "" }: { className?: string }) {
  const radius = className.includes("rounded") ? "" : " rounded-lg";

  return <div aria-hidden="true" className={`${BASE}${radius} ${className}`} />;
}
