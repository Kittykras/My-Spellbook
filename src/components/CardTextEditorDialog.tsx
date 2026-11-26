import type { RefObject } from "react";
import CardTextEditorForm from "./CardTextEditorForm";

type CardTextEditorDialogProps = {
  cardTextDialogRef: RefObject<HTMLDialogElement | null>;
  editingCard: { index: string; text: string } | null;
  setEditingCard: (card: { index: string; text: string } | null) => void;
  setSavedCardText: (
    updater: (previous: Record<string, string>) => Record<string, string>,
  ) => void;
  closeDialog: () => void
};

export default function CardTextEditorDialog({
  cardTextDialogRef,
  editingCard,
  setEditingCard,
  setSavedCardText,
  closeDialog,
}: CardTextEditorDialogProps) {
  return (
    <dialog
      ref={cardTextDialogRef}
      className="card-text-dialog"
      aria-labelledby="card-text-dialog-title"
      onClose={() => setEditingCard(null)}
      closedby="any"
    >
      <div className="dialog-scroll">
        <div className="dialog-header">
        <h2 id="card-text-dialog-title" className="add-character-title">
          Edit card text
        </h2>
        <button
          type="button"
          className="close-dialog"
          onClick={closeDialog}
        >
          <span className="sr-only">Close dialog</span>
        </button>
        </div>
        {editingCard && (
          <CardTextEditorForm
            editingCard={editingCard}
            setEditingCard={setEditingCard}
            setSavedCardText={setSavedCardText}
            closeDialog={closeDialog}
          />
        )}
      </div>
    </dialog>
  );
}
