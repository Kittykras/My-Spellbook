import type { RefObject } from "react";
import AddCharacterForm from "./AddCharacterForm";
import type { Character } from "../types/spell";

type AddCharacterDialogProps = {
  dialogRef: RefObject<HTMLDialogElement | null>;
  onAddCharacter: (name: string) => void;
  onRenameCharacter: (id: string, name: string) => void;
  onDeleteCharacter: (id: string) => void;
  editingChar: Character | null;
}

export default function AddCharacterDialog({
  dialogRef,
  onAddCharacter,
  onRenameCharacter,
  onDeleteCharacter,
  editingChar,
}: AddCharacterDialogProps) {
  return (
    <dialog
      ref={dialogRef}
      className="add-character-dialog"
      aria-labelledby="add-character-title"
      closedby="any"
    >
      <div className="dialog-header">
        <h2 id="add-character-title" className="add-character-title">
          {editingChar ? "Edit character" : "Add Character"}
        </h2>
        <button
          type="button"
          className="close-dialog"
          onClick={() => dialogRef.current?.close()}
        >
          <span className="sr-only">Close dialog</span>
        </button>
      </div>
      <AddCharacterForm
        closeDialog={() => dialogRef.current?.close()}
        onAddCharacter={onAddCharacter}
        onRenameCharacter={onRenameCharacter}
        onDeleteCharacter={onDeleteCharacter}
        editingChar={editingChar}
      />
    </dialog>
  );
}
