import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FullScreenLoader } from "./FullScreenLoader";

describe("FullScreenLoader", () => {
  it("announces itself as a busy live region", () => {
    render(<FullScreenLoader />);

    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toHaveAttribute("aria-busy", "true");
  });

  it("carries the label for assistive tech without showing it visually", () => {
    render(<FullScreenLoader label="Validating your session..." />);

    const label = screen.getByText("Validating your session...");
    expect(label).toBeInTheDocument();
    expect(label).toHaveClass("sr-only");
  });

  it("renders skeleton placeholders, not a spinner", () => {
    const { container } = render(<FullScreenLoader />);

    const placeholders = container.querySelectorAll(".animate-pulse");
    expect(placeholders.length).toBeGreaterThan(0);
    expect(container.querySelector(".animate-spin")).toBeNull();
  });

  it("hides every placeholder from assistive tech", () => {
    const { container } = render(<FullScreenLoader />);

    const placeholders = Array.from(container.querySelectorAll(".animate-pulse"));
    expect(placeholders.every((el) => el.getAttribute("aria-hidden") === "true")).toBe(true);
  });

  it("stops the pulse under prefers-reduced-motion", () => {
    const { container } = render(<FullScreenLoader />);

    const placeholders = Array.from(container.querySelectorAll(".animate-pulse"));
    expect(placeholders.every((el) => el.classList.contains("motion-reduce:animate-none"))).toBe(
      true
    );
  });

  it("renders the app-shell skeleton by default and the auth skeleton on request", () => {
    const app = render(<FullScreenLoader />).container;
    const appPlaceholders = app.querySelectorAll(".animate-pulse").length;

    const auth = render(<FullScreenLoader variant="auth" />).container;
    const authPlaceholders = auth.querySelectorAll(".animate-pulse").length;

    // The two variants mirror different layouts, so they are not the same tree.
    expect(appPlaceholders).not.toBe(authPlaceholders);
    expect(appPlaceholders).toBeGreaterThan(authPlaceholders);
  });
});
