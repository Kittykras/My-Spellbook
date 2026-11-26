import type { RefObject } from "react";
import AddCharacterForm from "./AddCharacterForm";
import type { Character } from "../types/character";

type AddCharacterDialogProps = {
  dialogRef: RefObject<HTMLDialogElement | null>;
  spellClasses: string[];
  onAddCharacter: (name: string, classes: string[]) => void;
  onRenameCharacter: (id: string, name: string, classes: string[]) => void;
  onDeleteCharacter: (id: string) => void;
  editingChar: Character | null;
  formVersion: number;
  setFormVersion: (updater: (version: number) => number) => void;
};

export default function AddCharacterDialog({
  spellClasses,
  dialogRef,
  onAddCharacter,
  onRenameCharacter,
  onDeleteCharacter,
  editingChar,
  formVersion,
}: AddCharacterDialogProps) {
  return (
    <dialog
      ref={dialogRef}
      className="add-character-dialog"
      aria-labelledby="add-character-title"
      closedby="any"
    >
      <div className="dialog-scroll">
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
          key={formVersion}
          spellClasses={spellClasses}
          closeDialog={() => dialogRef.current?.close()}
          onAddCharacter={onAddCharacter}
          onRenameCharacter={onRenameCharacter}
          onDeleteCharacter={onDeleteCharacter}
          editingChar={editingChar}
        />
      </div>
    </dialog>
  );
}
