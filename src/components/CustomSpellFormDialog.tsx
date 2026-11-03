import type { RefObject } from "react";
import CustomSpellForm from "./CustomSpellForm";
import type { CustomSpell, CustomSpellInput } from "../types/spell";

export default function CustomSpellFormDialog({
  dialogRef,
  onSaveSpell,
  onEditSpell,
  spellLevels,
  editingSpell
}: {
  dialogRef: RefObject<HTMLDialogElement | null>;
  onSaveSpell: (spell: CustomSpellInput) => void;
  onEditSpell: (index: string, input: CustomSpellInput) => void;
  spellLevels: number[];
  editingSpell: CustomSpell | null;
}) {
  return (
    <dialog
      ref={dialogRef}
      className="custom-spell-dialog"
      aria-labelledby="custom-spell-title"
      closedby="any"
    >
      <div className="dialog-header">
        <h2 id="custom-spell-title" className="custom-spell-title">
          Add custom spell
        </h2>
        <button
          type="button"
          className="close-dialog"
          onClick={() => dialogRef.current?.close()}
        >
          <span className="sr-only">Close dialog</span>
        </button>
      </div>
      <CustomSpellForm
        editingSpell={editingSpell}
        onSaveSpell={onSaveSpell}
        onEditSpell={onEditSpell}
        spellLevels={spellLevels}
        closeDialog={() => dialogRef.current?.close()}
      />
    </dialog>
  );
}
