import { useState, type SubmitEvent } from "react";
import type { Character } from "../types/character";

type AddCharacterFormProps = {
  spellClasses: string[];
  closeDialog: () => void;
  onAddCharacter: (name: string, classes: string[]) => void;
  onRenameCharacter: (id: string, name: string, classes: string[]) => void;
  onDeleteCharacter: (id: string) => void;
  editingChar: Character | null;
};

export default function AddCharacterForm({
  spellClasses,
  closeDialog,
  onAddCharacter,
  onRenameCharacter,
  onDeleteCharacter,
  editingChar,
}: AddCharacterFormProps) {
  const [classesOpen, setClassesOpen] = useState(false);
  const [selectedClasses, setSelectedClasses] = useState<string[]>(
    editingChar?.classes ?? [],
  );

  function handleClassChange(spellClass: string, checked: boolean) {
    setSelectedClasses((previousClasses) =>
      checked
        ? [...previousClasses, spellClass]
        : previousClasses.filter((name) => name !== spellClass),
    );
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const formEl = event.currentTarget;
    const formData = new FormData(formEl);
    const name = String(formData.get("character-name") ?? "").trim();
    const classes = selectedClasses;
    if (!name) return;
    if (editingChar) {
      onRenameCharacter(editingChar.id, name, classes);
      closeDialog();
      return;
    } else {
      onAddCharacter(name, classes);
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
      <fieldset>
        <legend>Class(es)</legend>
        <button
          type="button"
          className={`select-classes-btn ${selectedClasses.length ? "selected-classes" : ""}`}
          aria-expanded={classesOpen}
          onClick={() => setClassesOpen((prevOpen) => !prevOpen)}
        >
          {selectedClasses.length > 0
            ? selectedClasses.join(", ")
            : "Select classes"}
        </button>
        <ul className="select-classes-list" hidden={!classesOpen}>
          {spellClasses.map((spellClass) => (
            <li key={spellClass}>
              <input
                type="checkbox"
                name="character-classes"
                id={`character-class-${spellClass}`}
                value={spellClass}
                checked={selectedClasses.includes(spellClass)}
                onChange={(event) =>
                  handleClassChange(spellClass, event.currentTarget.checked)
                }
              />
              <label htmlFor={`character-class-${spellClass}`}>{spellClass}</label>
            </li>
          ))}
        </ul>
      </fieldset>
      <div className="button-wrapper">
        <button type="submit">
          {editingChar ? "Save changes" : "Create character"}
        </button>
        {editingChar && (
          <button type="button" onClick={handleDelete}>
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
