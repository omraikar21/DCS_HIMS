import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ConfirmDialog from "../components/common/ConfirmDialog";

describe("ConfirmDialog Component", () => {
  it("does not render when open is false", () => {
    render(
      <ConfirmDialog
        open={false}
        title="Delete Item"
        message="Are you sure you want to delete this?"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.queryByText("Delete Item")).toBeNull();
  });

  it("renders title, message, and buttons when open is true", () => {
    render(
      <ConfirmDialog
        open={true}
        title="Delete Item"
        message="Are you sure you want to delete this item permanently?"
        confirmText="Yes, Delete"
        cancelText="Cancel"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByText("Delete Item")).toBeDefined();
    expect(screen.getByText("Are you sure you want to delete this item permanently?")).toBeDefined();
    expect(screen.getByText("Yes, Delete")).toBeDefined();
    expect(screen.getByText("Cancel")).toBeDefined();
  });

  it("triggers onConfirm callback when confirm button is clicked", () => {
    const handleConfirm = vi.fn();
    render(
      <ConfirmDialog
        open={true}
        title="Confirm Action"
        message="Proceed with deletion?"
        onConfirm={handleConfirm}
        onCancel={vi.fn()}
      />
    );

    const confirmButton = screen.getByRole("button", { name: /confirm|delete/i });
    fireEvent.click(confirmButton);
    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });

  it("triggers onCancel callback when cancel button is clicked", () => {
    const handleCancel = vi.fn();
    render(
      <ConfirmDialog
        open={true}
        title="Confirm Action"
        message="Proceed with deletion?"
        onConfirm={vi.fn()}
        onCancel={handleCancel}
      />
    );

    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    fireEvent.click(cancelButton);
    expect(handleCancel).toHaveBeenCalledTimes(1);
  });
});
