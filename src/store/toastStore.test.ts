import { describe, it, expect, beforeEach, vi } from "vitest";
import { useToastStore } from "./toastStore";

describe("toastStore", () => {
  beforeEach(() => {
    useToastStore.setState({ toasts: [] });
  });

  it("starts with no toasts", () => {
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });

  it("showToast adds a toast with the given message and variant", () => {
    useToastStore.getState().showToast("New notification arrived", "success");

    const [toast] = useToastStore.getState().toasts;
    expect(toast.message).toBe("New notification arrived");
    expect(toast.variant).toBe("success");
  });

  it("defaults to the info variant when none is given", () => {
    useToastStore.getState().showToast("Heads up");
    expect(useToastStore.getState().toasts[0].variant).toBe("info");
  });

  it("dismissToast removes only the matching toast", () => {
    useToastStore.getState().showToast("First");
    useToastStore.getState().showToast("Second");
    const [first, second] = useToastStore.getState().toasts;

    useToastStore.getState().dismissToast(first.id);

    const remaining = useToastStore.getState().toasts;
    expect(remaining).toHaveLength(1);
    expect(remaining[0].id).toBe(second.id);
  });

  it("auto-dismisses a toast after the timeout elapses", () => {
    vi.useFakeTimers();
    try {
      useToastStore.getState().showToast("Will vanish");
      expect(useToastStore.getState().toasts).toHaveLength(1);

      vi.advanceTimersByTime(5000);

      expect(useToastStore.getState().toasts).toHaveLength(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
