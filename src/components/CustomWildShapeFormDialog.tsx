import type { RefObject } from "react";
import CustomWildShapeForm from "./CustomWildShapeForm";
import type { CustomWildShape, CustomWildShapeInput, AbilityScores } from "../types/wildShape";

export default function CustomWildShapeFormDialog({
  dialogRef,
  challengeRatings,
  creatureSizes,
  abilities,
  onSaveWildShape,
  editingWildShape,
  onEditWildShape,
  onDeleteWildShape,
  formVersion
}: {
  dialogRef: RefObject<HTMLDialogElement | null>;
  challengeRatings: number[];
  creatureSizes: string[];
  abilities: readonly { key: keyof AbilityScores; label: string }[];
  onSaveWildShape: (input: CustomWildShapeInput) => void;
  editingWildShape: CustomWildShape | null;
  onEditWildShape: (key: string, input: CustomWildShapeInput) => void;
  onDeleteWildShape: (key: string) => void;
  formVersion: number;
}) {
  return (
    <dialog
      ref={dialogRef}
      className="custom-wild-shape-dialog"
      aria-labelledby="custom-wild-shape-title"
      closedby="any"
    >
      <div className="dialog-scroll">
        <div className="dialog-header">
          <h2 id="custom-wild-shape-title" className="custom-wild-shape-title">
            Add Custom Wild Shape
          </h2>
          <button
            type="button"
            className="close-dialog"
            onClick={() => dialogRef.current?.close()}
          >
            <span className="sr-only">Close dialog</span>
          </button>
        </div>
        <CustomWildShapeForm
          key={formVersion}
          challengeRatings={challengeRatings}
          creatureSizes={creatureSizes}
          abilities={abilities}
          onSaveWildShape={onSaveWildShape}
          closeDialog={() => dialogRef.current?.close()}
          editingWildShape={editingWildShape}
          onEditWildShape={onEditWildShape}
          onDeleteWildShape={onDeleteWildShape}
        />
      </div>
    </dialog>
  );
}
