import { useState, type FormEvent } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useAuthStore } from "../../store/authStore";
import { login } from "./authApi";
import { getPasswordStrength } from "./passwordStrength";

const STRENGTH_BAR_COLOR: Record<string, string> = {
  weak: "bg-error",
  fair: "bg-tertiary",
  strong: "bg-success",
};

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setSession = useAuthStore((s) => s.setSession);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const strength = getPasswordStrength(password);

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setSession(data, data.accessToken, data.refreshToken, rememberMe);
      const redirectTo = (location.state as { from?: string } | null)?.from ?? "/dashboard";
      navigate(redirectTo, { replace: true });
    },
  });

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    mutation.mutate({ username: email, password });
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-gutter">
      <div className="relative flex w-full max-w-[440px] flex-col gap-xl overflow-hidden rounded-xl bg-surface-container-lowest p-3xl shadow-subtle">
        <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-tertiary/10 blur-2xl" />

        <div className="relative z-10 flex flex-col items-center gap-md text-center">
          <div className="mb-sm flex h-12 w-12 items-center justify-center rounded-lg bg-primary-container text-on-primary-container">
            <span className="material-symbols-outlined" aria-hidden="true">
              view_kanban
            </span>
          </div>
          <h1 className="text-headline-lg text-on-surface">Welcome back</h1>
          <p className="text-body-md text-on-surface-variant">
            Sign in to manage your sprints and tasks.
          </p>
        </div>

        {mutation.isError && (
          <div
            role="alert"
            className="relative z-10 flex items-center gap-sm rounded-lg bg-error-container p-md text-on-error-container"
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
              error
            </span>
            <span className="text-body-sm">Incorrect credentials. Please try again.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative z-10 flex flex-col gap-lg" noValidate>
          <Input
            label="Email"
            icon="mail"
            type="text"
            placeholder="name@company.com"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="flex flex-col gap-xs">
            <Input
              label="Password"
              icon="lock"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              labelAside={
                <button
                  type="button"
                  className="text-label-md text-primary transition-colors duration-200 hover:text-primary-container"
                >
                  Forgot password?
                </button>
              }
              trailing={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="flex h-11 w-11 items-center justify-center rounded-lg text-on-surface-variant transition-colors duration-200 hover:text-on-surface"
                >
                  <span className="material-symbols-outlined" aria-hidden="true">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              }
            />

            {strength.level !== "empty" && (
              <div className="flex items-center gap-sm" aria-live="polite">
                <div className="flex h-1 flex-1 gap-1 overflow-hidden rounded-full bg-surface-container-highest">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${STRENGTH_BAR_COLOR[strength.level]}`}
                    style={{ width: `${(strength.score / 5) * 100}%` }}
                  />
                </div>
                <span className="text-body-sm text-on-surface-variant">{strength.label}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-sm">
            <input
              id="remember"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 cursor-pointer appearance-none rounded-sm border border-outline-variant checked:border-primary checked:bg-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            />
            <label
              htmlFor="remember"
              className="cursor-pointer select-none text-body-sm text-on-surface-variant hover:text-on-surface"
            >
              Remember me for 30 days
            </label>
          </div>

          <Button type="submit" isLoading={mutation.isPending} className="mt-sm w-full">
            Sign In
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              arrow_forward
            </span>
          </Button>
        </form>

        <div className="relative z-10 mt-md border-t border-outline-variant/30 pt-lg text-center">
          <p className="text-body-sm text-on-surface-variant">
            DummyJSON test account: <code className="font-mono text-code-sm">emilys</code> /{" "}
            <code className="font-mono text-code-sm">emilyspass</code>
          </p>
        </div>
      </div>
    </div>
  );
}
