import type { RefObject } from "react";
import CustomSpellForm from "./CustomSpellForm";
import type { CustomSpell, CustomSpellInput } from "../types/spell";

type CustomSpellFormDialogProps = {
  dialogRef: RefObject<HTMLDialogElement | null>;
  onSaveSpell: (spell: CustomSpellInput) => void;
  onEditSpell: (index: string, input: CustomSpellInput) => void;
  spellLevels: number[];
  spellClasses: string[];
  editingSpell: CustomSpell | null;
  formVersion: number;
  onDeleteSpell: (index: string) => void;
}

export default function CustomSpellFormDialog({
  dialogRef,
  onSaveSpell,
  onEditSpell,
  onDeleteSpell,
  spellLevels,
  spellClasses,
  editingSpell,
  formVersion
}: 
  CustomSpellFormDialogProps
) {
  return (
    <dialog
      ref={dialogRef}
      className="custom-spell-dialog"
      aria-labelledby="custom-spell-title"
      closedby="any"
    >
      <div className="dialog-header">
        <h2 id="custom-spell-title" className="custom-spell-title">
          {editingSpell ? "Edit custom spell" : "Add custom spell"}
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
        key={formVersion}
        editingSpell={editingSpell}
        onSaveSpell={onSaveSpell}
        onEditSpell={onEditSpell}
        onDeleteSpell={onDeleteSpell}
        spellLevels={spellLevels}
        spellClasses={spellClasses}
        closeDialog={() => dialogRef.current?.close()}
      />
    </dialog>
  );
}
