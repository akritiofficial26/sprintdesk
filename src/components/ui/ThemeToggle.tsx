import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "../../store/themeStore";

export function ThemeToggle() {
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const isDark = theme === "dark";

  const ThemeIcon = isDark ? Sun : Moon;

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      aria-pressed={isDark}
      className="flex items-center justify-center rounded-md p-2 text-on-surface-variant transition-colors hover:text-on-surface"
      type="button"
    >
      <ThemeIcon size={20} strokeWidth={2} aria-hidden="true" />
    </button>
  );
}
