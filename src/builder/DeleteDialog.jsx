import { useEffect, useRef } from 'react';
import Button from '../components/Button';
import { Trash2 } from 'lucide-react';

/**
 * DeleteDialog — Person B (Delivery 3)
 * Native <dialog> element — accessible, keyboard-trapped modal.
 * Requires the user to type the portfolio title to confirm deletion.
 */
export default function DeleteDialog({ open, title, onConfirm, onClose }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const handleConfirm = () => {
    onConfirm?.();
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby="delete-dialog-title"
      className="w-[calc(100%-2rem)] max-w-[480px] p-0 bg-paper text-ink border border-line rounded-[2px] backdrop:bg-ink/40"
    >
      <div className="p-6 space-y-5">
        <div className="flex items-start gap-3">
          <Trash2 className="h-5 w-5 text-danger mt-0.5 shrink-0" />
          <div>
            <h2 id="delete-dialog-title" className="font-serif font-semibold text-lg">
              Delete portfolio?
            </h2>
            <p className="text-sm text-muted mt-1">
              <strong className="text-ink">"{title}"</strong> will be permanently deleted.
              This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-line">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirm}>
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      </div>
    </dialog>
  );
}
