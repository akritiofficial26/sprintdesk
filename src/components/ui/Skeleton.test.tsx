import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Skeleton } from "./Skeleton";

function classesOf(markup: HTMLElement): string[] {
  return Array.from(markup.firstElementChild!.classList);
}

describe("Skeleton", () => {
  it("is hidden from assistive tech", () => {
    const { container } = render(<Skeleton />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });

  it("pulses by default, and not under prefers-reduced-motion", () => {
    const { container } = render(<Skeleton />);
    const classes = classesOf(container);
    expect(classes).toContain("animate-pulse");
    expect(classes).toContain("motion-reduce:animate-none");
  });

  it("applies the default radius when the caller gives none", () => {
    const { container } = render(<Skeleton className="h-4 w-24" />);
    expect(classesOf(container)).toContain("rounded-lg");
  });

  it("drops the default radius when the caller supplies one", () => {
    // `.rounded-lg` is emitted after `.rounded-full` in this project's
    // stylesheet, so keeping both would render a circle as a rounded square.
    const { container } = render(<Skeleton className="h-8 w-8 rounded-full" />);
    const classes = classesOf(container);
    expect(classes).toContain("rounded-full");
    expect(classes).not.toContain("rounded-lg");
  });

  it("passes through caller sizing classes", () => {
    const { container } = render(<Skeleton className="h-[320px] w-full" />);
    const classes = classesOf(container);
    expect(classes).toContain("h-[320px]");
    expect(classes).toContain("w-full");
  });
});
