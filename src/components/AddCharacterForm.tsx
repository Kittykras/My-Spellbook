import { type SubmitEvent } from "react";
import type { Character } from "../types/spell";

type AddCharacterFormProps = {
  closeDialog: () => void;
  onAddCharacter: (name: string) => void;
  onRenameCharacter: (id: string, name: string) => void;
  onDeleteCharacter: (id: string) => void;
  editingChar: Character | null;
}

export default function AddCharacterForm({
  closeDialog,
  onAddCharacter,
  onRenameCharacter,
  onDeleteCharacter,
  editingChar,
}: AddCharacterFormProps) {
  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const formEl = event.currentTarget;
    const formData = new FormData(formEl);
    const name = String(formData.get("character-name") ?? "").trim();
    if (!name) return;
    if (editingChar) {
      onRenameCharacter(editingChar.id, name);
      closeDialog();
      return;
    } else {
      onAddCharacter(name);
    }
    formEl.reset();
    closeDialog();
  }

  function handleDelete() {
    if (!editingChar) return;

    const confirmed = window.confirm(`Delete "${editingChar.name}"?`);
    if (!confirmed) return;

    onDeleteCharacter(editingChar.id);
    closeDialog();
  }

  return (
    <form className="add-character-form" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="character-name">
          Character name <span>*</span>
        </label>
        <input
          required
          type="text"
          placeholder="Enter character name"
          name="character-name"
          id="character-name"
          defaultValue={editingChar?.name}
        />
      </div>
      <div className="button-wrapper">
        <button type="submit">
          {editingChar ? "Save changes" : "Create character"}
        </button>
        {editingChar && (
          <button
            type="button"
            onClick={handleDelete}
          >
            Delete character
          </button>
        )}
        <button type="button" onClick={closeDialog}>
          Cancel
        </button>
      </div>
    </form>
  );
}
