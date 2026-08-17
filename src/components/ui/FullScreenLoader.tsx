import { memo } from "react";
import { Skeleton } from "./Skeleton";


const NAV_ROWS = [0, 1, 2];
const SUMMARY_CARDS = [0, 1, 2, 3];


function AppShellSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed left-0 top-0 hidden h-full w-[240px] flex-col border-r border-outline-variant bg-surface-container-low md:flex">
        <div className="flex items-center gap-md border-b border-outline-variant p-lg">
          <Skeleton className="h-8 w-8 shrink-0" />
          <Skeleton className="h-5 w-28" />
        </div>

        <div className="flex flex-col gap-xs px-md pt-md">
          {NAV_ROWS.map((row) => (
            <Skeleton key={row} className="h-9 w-full" />
          ))}
        </div>

        <div className="mt-auto flex items-center gap-sm border-t border-outline-variant p-md">
          <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
          <div className="flex flex-1 flex-col gap-xs">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-2.5 w-32" />
          </div>
        </div>
      </aside>

      <div className="md:pl-[240px]">
        <header className="flex items-center gap-md border-b border-outline-variant bg-surface-container-low p-md">
          <Skeleton className="h-6 w-6 md:hidden" />
          <div className="ml-auto flex items-center gap-md">
            <Skeleton className="h-6 w-6" />
            <Skeleton className="h-6 w-6" />
          </div>
        </header>

        <main className="mx-auto flex max-w-container-max flex-col gap-lg p-lg">
          <Skeleton className="h-[104px] w-full rounded-2xl" />

          <div className="grid gap-md md:grid-cols-2 xl:grid-cols-4">
            {SUMMARY_CARDS.map((card) => (
              <Skeleton key={card} className="h-[132px] w-full rounded-2xl" />
            ))}
          </div>

          <div className="grid gap-lg xl:grid-cols-[1.3fr_0.7fr]">
            <Skeleton className="h-[280px] w-full rounded-2xl" />
            <Skeleton className="h-[280px] w-full rounded-2xl" />
          </div>
        </main>
      </div>
    </div>
  );
}

function AuthSkeleton() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-gutter">
      <div className="flex w-full max-w-[440px] flex-col gap-xl rounded-xl bg-surface-container-lowest p-3xl shadow-subtle">
        <div className="flex flex-col items-center gap-md">
          <Skeleton className="h-12 w-12" />
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>

        <div className="flex flex-col gap-lg">
          <Skeleton className="h-[68px] w-full" />
          <Skeleton className="h-[68px] w-full" />
          <Skeleton className="h-11 w-full" />
        </div>
      </div>
    </div>
  );
}

interface FullScreenLoaderProps {
  label?: string;

  variant?: "app" | "auth";
}


function FullScreenLoaderComponent({ label = "Loading...", variant = "app" }: FullScreenLoaderProps) {
  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">{label}</span>
      {variant === "auth" ? <AuthSkeleton /> : <AppShellSkeleton />}
    </div>
  );
}


export const FullScreenLoader = memo(FullScreenLoaderComponent);

FullScreenLoader.displayName = "FullScreenLoader";
