import { forwardRef, useId, type SelectHTMLAttributes } from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  hideLabel?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, hideLabel, id, className = "", ...rest }, ref) => {
    const generatedId = useId();
    const selectId = id ?? generatedId;

    return (
      <div className="flex flex-col gap-xs">
        <label htmlFor={selectId} className={hideLabel ? "sr-only" : "text-label-md text-on-surface-variant"}>
          {label}
        </label>
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={[
              "w-full appearance-none rounded-lg border border-outline-variant bg-surface-bright py-md pl-md pr-2xl text-body-md text-on-surface outline-none",
              "transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/10",
              className,
            ].join(" ")}
            {...rest}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span
            className="material-symbols-outlined pointer-events-none absolute right-md top-1/2 -translate-y-1/2 text-on-surface-variant"
            aria-hidden="true"
          >
            expand_more
          </span>
        </div>
      </div>
    );
  }
);

Select.displayName = "Select";
