export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-md">
      <div>
        <h1 className="text-headline-md text-on-surface">Analytics</h1>
        <p className="text-body-md text-on-surface-variant">
          Velocity, status distribution, priority breakdown, completion trend.
        </p>
      </div>
      <div className="rounded-lg border border-dashed border-outline-variant bg-surface-container-lowest p-2xl text-center">
        <p className="text-body-md text-on-surface-variant">
          Charts (Recharts, derived live from the board store) land in a later phase.
        </p>
      </div>
    </div>
  );
}
