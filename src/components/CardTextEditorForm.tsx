import { type SubmitEvent } from "react";

type CardTextEditorFormProps = {
  editingCard: { index: string; text: string };
  setEditingCard: (card: { index: string; text: string } | null) => void;
  setSavedCardText: (
    updater: (previous: Record<string, string>) => Record<string, string>,
  ) => void;
  closeDialog: () => void;
};

export default function CardTextEditorForm({
  editingCard,
  setEditingCard,
  setSavedCardText,
  closeDialog,
}: CardTextEditorFormProps) {
  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const { index, text } = editingCard;
    const trimmedText = text.trim();
    if (!trimmedText) return;

    setSavedCardText((previous) => ({
      ...previous,
      [index]: trimmedText,
    }));
    setEditingCard(null);
    closeDialog();
  }
  
  return (
    <form className="card-text-editor" onSubmit={handleSubmit}>
      <label htmlFor="card-text-editor-textarea">Card text</label>
      <textarea
        id="card-text-editor-textarea"
        name="card-text-editor-textarea"
        required
        rows={8}
        value={editingCard.text}
        onChange={(event) => {
          const text = event.currentTarget.value;
          setEditingCard({ ...editingCard, text });
        }}
      />
      <div className="button-wrapper">
        <button type="submit" disabled={!editingCard.text.trim()}>
          Save card text
        </button>
        <button type="button" onClick={closeDialog}>
          Cancel
        </button>
      </div>
    </form>
  );
}
