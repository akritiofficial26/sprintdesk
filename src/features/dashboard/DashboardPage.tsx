import { useAuthStore } from "../../store/authStore";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  return (
    <div className="flex flex-col gap-md">
      <div>
        <h1 className="text-headline-md text-on-surface">
          Welcome{user ? `, ${user.firstName}` : ""}
        </h1>
        <p className="text-body-md text-on-surface-variant">
          Your sprint overview will live here.
        </p>
      </div>
      <div className="rounded-lg border border-dashed border-outline-variant bg-surface-container-lowest p-2xl text-center">
        <p className="text-body-md text-on-surface-variant">
          Summary widgets (active sprint, velocity, blockers) — coming in a later phase.
        </p>
      </div>
    </div>
  );
}
