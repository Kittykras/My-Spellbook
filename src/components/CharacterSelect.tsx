import { useRef, useState, type Dispatch, type SetStateAction } from "react";
import type { Character } from "../types/spell";
import AddCharacterDialog from "./AddCharacterDialog";

type CharacterSelectProps = {
  activeCharacterId: string;
  activeCharacter: Character | undefined;
  setActiveCharacterId: Dispatch<SetStateAction<string>>;
  characters: Character[];
  onAddCharacter: (name: string) => void;
  onRenameCharacter: (id: string, name: string) => void;
  onDeleteCharacter: (id: string) => void;
};

export default function CharacterSelect({
  activeCharacterId,
  activeCharacter,
  setActiveCharacterId,
  characters,
  onAddCharacter,
  onRenameCharacter,
  onDeleteCharacter,
}: CharacterSelectProps) {
  const characterDialog = useRef<HTMLDialogElement>(null);
  const [editingChar, setEditingChar] = useState<Character | null>(null);

  function handleCharacterChange(value: string) {
    if (value === "add-character") {
      characterDialog.current?.showModal();
      return;
    }

    setActiveCharacterId(value);
  }

  function handleEditCharacter() {
    if (activeCharacter) {
      setEditingChar(activeCharacter);
      characterDialog.current?.showModal();
    }
  }

  return (
    <div className="character-select">
      <label htmlFor="active-character">Character</label>
      <select
        id="active-character"
        value={activeCharacterId}
        onChange={(event) => handleCharacterChange(event.currentTarget.value)}
      >
        {characters.length === 0 && (
          <option value="" disabled>
            Select a character
          </option>
        )}
        {characters.map((character) => (
          <option key={character.id} value={character.id}>
            {character.name}
          </option>
        ))}
        <option value="add-character">＋ Add character</option>
      </select>
      <AddCharacterDialog
        dialogRef={characterDialog}
        onAddCharacter={onAddCharacter}
        onRenameCharacter={onRenameCharacter}
        onDeleteCharacter={onDeleteCharacter}
        editingChar={editingChar}
      />
      <button
        type="button"
        className="edit-character-btn"
        onClick={handleEditCharacter}
        aria-label={`Edit ${activeCharacter?.name}`}
        title={`Edit ${activeCharacter?.name}`}
      >
        <span aria-hidden="true">✎</span>
      </button>
    </div>
  );
}
