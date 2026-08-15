import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  icon?: string;
  trailing?: ReactNode;
  labelAside?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, trailing, labelAside, id, className = "", ...rest }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = error ? `${inputId}-error` : undefined;
    const hintId = hint ? `${inputId}-hint` : undefined;

    return (
      <div className="flex flex-col gap-xs">
        <div className="flex items-center justify-between">
          <label htmlFor={inputId} className="text-label-md text-on-surface-variant">
            {label}
          </label>
          {labelAside}
        </div>
        <div className="relative group">
          {icon && (
            <span
              className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors duration-200 pointer-events-none"
              aria-hidden="true"
            >
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error || undefined}
            aria-describedby={[errorId, hintId].filter(Boolean).join(" ") || undefined}
            className={[
              "w-full bg-surface-bright text-on-surface text-body-md rounded-lg py-md outline-none",
              "border transition-all duration-200",
              "placeholder:text-outline",
              "focus:border-primary focus:ring-2 focus:ring-primary/10",
              icon ? "pl-[44px]" : "px-md",
              trailing ? "pr-[52px]" : icon ? "pr-md" : "",
              error ? "border-error" : "border-outline-variant",
              className,
            ].join(" ")}
            {...rest}
          />
          {trailing && (
            <div className="absolute right-xs top-1/2 -translate-y-1/2 flex items-center">
              {trailing}
            </div>
          )}
        </div>
        {hint && !error && (
          <p id={hintId} className="text-body-sm text-on-surface-variant">
            {hint}
          </p>
        )}
        {error && (
          <p id={errorId} role="alert" className="text-body-sm text-error">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
