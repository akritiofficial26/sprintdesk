import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";

function OpenableModal({ onClose = () => {} }: { onClose?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)}>
        Open modal
      </button>
      <button type="button">Behind the modal</button>
      <Modal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          onClose();
        }}
        title="Delete task"
        footer={<Button>Confirm</Button>}
      >
        <label htmlFor="reason">Reason</label>
        <input id="reason" />
      </Modal>
    </>
  );
}

describe("Modal", () => {
  it("renders nothing while closed", () => {
    render(
      <Modal isOpen={false} onClose={() => {}} title="Delete task">
        Body
      </Modal>
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("exposes an accessible modal dialog labelled by its title", async () => {
    const user = userEvent.setup();
    render(<OpenableModal />);

    await user.click(screen.getByRole("button", { name: "Open modal" }));

    const dialog = screen.getByRole("dialog", { name: "Delete task" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  it("moves focus into the dialog when it opens", async () => {
    const user = userEvent.setup();
    render(<OpenableModal />);

    await user.click(screen.getByRole("button", { name: "Open modal" }));

    expect(screen.getByRole("dialog")).toContainElement(
      document.activeElement as HTMLElement | null
    );
  });

  it("traps Tab inside the dialog instead of leaking to the page behind it", async () => {
    const user = userEvent.setup();
    render(<OpenableModal />);
    await user.click(screen.getByRole("button", { name: "Open modal" }));

    const dialog = screen.getByRole("dialog");
    const behind = screen.getByRole("button", { name: "Behind the modal" });

    for (let i = 0; i < 6; i += 1) {
      await user.tab();
      expect(behind).not.toHaveFocus();
      expect(dialog).toContainElement(document.activeElement as HTMLElement | null);
    }
  });

  it("wraps backwards on Shift+Tab from the first control", async () => {
    const user = userEvent.setup();
    render(<OpenableModal />);
    await user.click(screen.getByRole("button", { name: "Open modal" }));

    await user.tab({ shift: true });

    expect(screen.getByRole("dialog")).toContainElement(
      document.activeElement as HTMLElement | null
    );
    expect(screen.getByRole("button", { name: "Behind the modal" })).not.toHaveFocus();
  });

  it("restores focus to the trigger when it closes", async () => {
    const user = userEvent.setup();
    render(<OpenableModal />);
    const trigger = screen.getByRole("button", { name: "Open modal" });

    await user.click(trigger);
    await user.click(screen.getByRole("button", { name: "Close dialog" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<OpenableModal onClose={onClose} />);
    await user.click(screen.getByRole("button", { name: "Open modal" }));

    await user.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalledOnce();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes when the backdrop is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<OpenableModal onClose={onClose} />);
    await user.click(screen.getByRole("button", { name: "Open modal" }));

    // The backdrop is aria-hidden by design, so it has no role to query by.
    const backdrop = document.querySelector('[aria-hidden="true"].absolute');
    await user.click(backdrop as Element);

    expect(onClose).toHaveBeenCalledOnce();
  });
});
