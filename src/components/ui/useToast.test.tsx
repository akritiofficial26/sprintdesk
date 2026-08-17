import { describe, it, expect, beforeEach, vi } from "vitest";
import { act, render, renderHook, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useToast } from "./useToast";
import { ToastContainer } from "./Toast";
import { useToastStore } from "../../store/toastStore";

describe("useToast", () => {
  beforeEach(() => {
    useToastStore.setState({ toasts: [] });
  });

  it("returns identity-stable actions across re-renders", () => {
    const { result, rerender } = renderHook(() => useToast());
    const initial = result.current;

    rerender();

    expect(result.current.showToast).toBe(initial.showToast);
    expect(result.current.dismissToast).toBe(initial.dismissToast);
  });

  it("showToast pushes onto the shared store with the given variant", () => {
    const { result } = renderHook(() => useToast());

    act(() => result.current.showToast("Sprint saved", "success"));

    const [toast] = useToastStore.getState().toasts;
    expect(toast).toMatchObject({ message: "Sprint saved", variant: "success" });
  });

  it("defaults to the info variant", () => {
    const { result } = renderHook(() => useToast());

    act(() => result.current.showToast("Heads up"));

    expect(useToastStore.getState().toasts[0].variant).toBe("info");
  });

  it("dismissToast removes only the toast it is given", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast("First");
      result.current.showToast("Second");
    });
    const [first, second] = useToastStore.getState().toasts;

    act(() => result.current.dismissToast(first.id));

    const remaining = useToastStore.getState().toasts;
    expect(remaining).toHaveLength(1);
    expect(remaining[0].id).toBe(second.id);
  });

  it("re-renders every consumer when a toast is raised elsewhere", () => {
    const { result } = renderHook(() => useToastStore((s) => s.toasts));
    const raise = renderHook(() => useToast());

    act(() => raise.result.current.showToast("Broadcast"));

    expect(result.current).toHaveLength(1);
  });
});

describe("useToast + ToastContainer", () => {
  beforeEach(() => {
    useToastStore.setState({ toasts: [] });
  });

  function Harness() {
    const { showToast } = useToast();
    return (
      <button type="button" onClick={() => showToast("New notification arrived")}>
        Raise toast
      </button>
    );
  }

  it("renders nothing until a toast is raised", () => {
    render(<ToastContainer />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("renders a hook-raised toast into a polite live region and dismisses it on click", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Harness />
        <ToastContainer />
      </>
    );

    await user.click(screen.getByRole("button", { name: "Raise toast" }));

    const liveRegion = screen.getByRole("status");
    expect(liveRegion).toHaveAttribute("aria-live", "polite");
    expect(liveRegion).toHaveTextContent("New notification arrived");

    await user.click(screen.getByRole("button", { name: "Dismiss notification" }));

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("auto-dismisses the toast once the timeout elapses", () => {
    vi.useFakeTimers();
    try {
      render(<ToastContainer />);
      const { result } = renderHook(() => useToast());

      act(() => result.current.showToast("Temporary"));
      expect(screen.getByRole("status")).toHaveTextContent("Temporary");

      act(() => vi.advanceTimersByTime(5000));

      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });
});
