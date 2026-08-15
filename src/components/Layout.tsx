import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { NotificationBell } from "../features/notifications/NotificationBell";
import { ThemeToggle } from "./ui/ThemeToggle";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { to: "/board", label: "Sprint Board", icon: "view_kanban" },
  { to: "/analytics", label: "Analytics", icon: "analytics" },
];

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const clearSession = useAuthStore((s) => s.clearSession);
  const [isNavOpen, setIsNavOpen] = useState(false);

  useEffect(() => {
    setIsNavOpen(false);
  }, [location.pathname]);

  function handleLogout() {
    clearSession();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      {isNavOpen && (
        <div
          className="fixed inset-0 z-40 bg-inverse-surface/40 md:hidden"
          onClick={() => setIsNavOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={[
          "fixed left-0 top-0 z-50 flex h-full w-[240px] flex-col border-r border-outline-variant bg-surface-container-low transition-transform duration-200",
          isNavOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0",
        ].join(" ")}
      >
        <div className="mb-md flex items-center justify-between gap-md border-b border-outline-variant p-lg">
          <div className="flex items-center gap-md">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-on-primary">
              <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                view_kanban
              </span>
            </div>
            <span className="text-headline-sm text-on-surface tracking-tight">SprintDesk</span>
          </div>
          <button
            onClick={() => setIsNavOpen(false)}
            aria-label="Close navigation menu"
            className="text-on-surface-variant transition-colors hover:text-on-surface md:hidden"
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
              close
            </span>
          </button>
        </div>

        <nav className="flex-1 space-y-xs px-md" aria-label="Primary">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  "flex items-center gap-md rounded-lg px-md py-sm text-body-md transition-all",
                  isActive
                    ? "bg-primary-container font-semibold text-on-primary-container"
                    : "text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface",
                ].join(" ")
              }
            >
              <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                {item.icon}
              </span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-outline-variant p-md">
          <div className="flex items-center gap-sm rounded-lg px-sm py-sm">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
              <span className="material-symbols-outlined text-[18px] text-on-primary" aria-hidden="true">
                person
              </span>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-body-sm font-semibold text-on-surface">
                {user ? `${user.firstName} ${user.lastName}` : "..."}
              </p>
              <p className="truncate text-label-md uppercase tracking-widest text-on-surface-variant">
                {user?.email}
              </p>
            </div>
            <button
              onClick={handleLogout}
              aria-label="Log out"
              className="text-on-surface-variant transition-colors hover:text-error"
            >
              <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                logout
              </span>
            </button>
          </div>
        </div>
      </aside>

      <div className="md:pl-[240px]">
        <header className="sticky top-0 z-30 flex items-center gap-md border-b border-outline-variant bg-surface-container-low p-md">
          <button
            onClick={() => setIsNavOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={isNavOpen}
            className="text-on-surface-variant transition-colors hover:text-on-surface md:hidden"
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              menu
            </span>
          </button>
          <span className="text-headline-sm text-on-surface tracking-tight md:hidden">SprintDesk</span>
          <div className="ml-auto flex items-center gap-md">
            <ThemeToggle />
            <NotificationBell />
          </div>
        </header>
        <main className="mx-auto max-w-container-max p-lg">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
