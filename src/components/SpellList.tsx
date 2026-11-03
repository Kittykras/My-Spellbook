import SpellItem from "./SpellItem";
import { useState, useRef } from "react";
import type { CustomSpell, CustomSpellInput, Spell, SpellDetails } from "../types/spell";
import CustomSpellFormDialog from "./CustomSpellFormDialog";

type SpellListProps = {
  filteredSpells: Spell[];
  toggleFavorite: (index: string) => void;
  handleSort: (column: "name" | "level" | "favorite" | "relevance") => void;
  sortBy: string;
  sortDirection: string;
  spellDetails: SpellDetails | undefined;
  getSpellDetails: (index: string) => Promise<void>;
  isLoadingDetails: boolean;
  detailsError: string;
  isLoadingSpells: boolean;
  spellsError: string;
  spellLevels: number[];
  onSaveSpell: (spell: CustomSpellInput) => void;
  onEditSpell: (index: string, input: CustomSpellInput) => void;
};

export default function SpellList({
  filteredSpells,
  toggleFavorite,
  handleSort,
  sortBy,
  sortDirection,
  spellDetails,
  getSpellDetails,
  isLoadingDetails,
  detailsError,
  isLoadingSpells,
  spellsError,
  spellLevels,
  onSaveSpell,
  onEditSpell
}: SpellListProps) {
  const [expandedSpellIndex, setExpandedSpellIndex] = useState<string | null>(
    null,
  );
  const [editingSpell, setEditingSpell] = useState<CustomSpell | null>(null);
  const customSpellDialog = useRef<HTMLDialogElement>(null);

  function handleToggleAddSpell(spell: CustomSpell | null = null) {
    setEditingSpell(spell);
    customSpellDialog.current?.showModal();
  }

  return (
    <section className="spell-list">
      <h2>
        Explore spells
        <span>
          {sortBy !== "relevance" && (
            <button
              className="reset-sort-by"
              onClick={() => handleSort("relevance")}
            >
              Reset sorting
            </button>
          )}
          <button className="toggle-add-spell" onClick={() => handleToggleAddSpell()}>
            Add custom spell
          </button>
        </span>
      </h2>
      <p>Your spells, all in one place</p>
      <CustomSpellFormDialog
        editingSpell={editingSpell}
        dialogRef={customSpellDialog}
        onSaveSpell={onSaveSpell}
        onEditSpell={onEditSpell}
        spellLevels={spellLevels}
      />
      <div className="spell-list-table">
        <table>
          <thead>
            <tr>
              <th
                scope="col"
                aria-sort={
                  sortBy === "name"
                    ? sortDirection === "asc"
                      ? "ascending"
                      : "descending"
                    : "none"
                }
              >
                <button onClick={() => handleSort("name")}>
                  SPELL
                  {sortBy === "name" && (
                    <span aria-hidden="true">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </button>
              </th>
              <th
                scope="col"
                aria-sort={
                  sortBy === "level"
                    ? sortDirection === "asc"
                      ? "ascending"
                      : "descending"
                    : "none"
                }
              >
                <button onClick={() => handleSort("level")}>
                  LEVEL
                  {sortBy === "level" && (
                    <span aria-hidden="true">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </button>
              </th>
              <th
                scope="col"
                aria-sort={
                  sortBy === "favorite"
                    ? sortDirection === "asc"
                      ? "ascending"
                      : "descending"
                    : "none"
                }
              >
                <button onClick={() => handleSort("favorite")}>
                  FAVORITE
                  {sortBy === "favorite" && (
                    <span aria-hidden="true">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoadingSpells ? (
              <tr>
                <td colSpan={3}>
                  <p className="loading">Loading spells…</p>
                </td>
              </tr>
            ) : spellsError ? (
              <tr>
                <td colSpan={3}>
                  <p className="error">{spellsError}</p>
                </td>
              </tr>
            ) : (
              filteredSpells.map((spell) => (
                <SpellItem
                  key={spell.index}
                  spell={spell}
                  toggleFavorite={toggleFavorite}
                  spellDetails={spellDetails}
                  getSpellDetails={getSpellDetails}
                  isLoadingDetails={isLoadingDetails}
                  detailsError={detailsError}
                  expandedSpellIndex={expandedSpellIndex}
                  setExpandedSpellIndex={setExpandedSpellIndex}
                  openCustomSpellDialog={handleToggleAddSpell}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
