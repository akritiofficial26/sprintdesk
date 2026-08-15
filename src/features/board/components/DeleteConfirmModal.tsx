import { Modal } from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  taskTitle: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmModal({ isOpen, taskTitle, onCancel, onConfirm }: DeleteConfirmModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title="Delete task"
      footer={
        <>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Delete
          </Button>
        </>
      }
    >
      <p className="text-body-md text-on-surface-variant">
        Are you sure you want to delete <span className="font-semibold text-on-surface">"{taskTitle}"</span>?
        This action cannot be undone.
      </p>
    </Modal>
  );
}
