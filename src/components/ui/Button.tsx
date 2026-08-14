import { forwardRef, type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
}


const variantClasses: Record<Variant, string> = {
  primary: "bg-primary text-on-primary hover:bg-primary-container focus-visible:ring-primary",
  secondary:
    "bg-surface-bright text-on-surface border border-outline-variant hover:bg-surface-container focus-visible:ring-outline",
  danger: "bg-error text-on-error hover:brightness-95 focus-visible:ring-error",
  ghost: "bg-transparent text-on-surface-variant hover:text-primary hover:bg-surface-container focus-visible:ring-outline",
};

const sizeClasses: Record<Size, string> = {
  sm: "text-body-sm px-sm py-xs rounded",
  md: "text-label-md px-lg py-md rounded-lg",
  lg: "text-body-lg px-xl py-md rounded-lg",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", isLoading, disabled, className = "", children, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading || undefined}
        className={[
          "inline-flex items-center justify-center gap-sm font-medium transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          variantClasses[variant],
          sizeClasses[size],
          className,
        ].join(" ")}
        {...rest}
      >
        {isLoading && (
          <span
            className="material-symbols-outlined animate-spin text-[18px]"
            aria-hidden="true"
          >
            progress_activity
          </span>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
