import SpellItem from "./SpellItem";
import { useState, useRef } from "react";
import type {
  CustomSpell,
  CustomSpellInput,
  Spell,
  SpellDetails,
} from "../types/spell";
import CustomSpellFormDialog from "./CustomSpellFormDialog";
import ListIcon from "../assets/ListIcon";
import GridIcon from "../assets/GridIcon";
import SpellCard from "./SpellCard";
import CardTextEditorDialog from "./CardTextEditorDialog";

type SpellListProps = {
  headline: string;
  description: string;
  filteredSpells: Spell[];
  toggleFavorite: (index: string) => void;
  handleSort: (column: "name" | "level" | "favorite" | "relevance") => void;
  sortBy: string;
  sortDirection: string;
  spellDetails: SpellDetails | undefined;
  getSpellDetails: (index: string) => Promise<void>;
  isLoadingDetails: boolean;
  detailsError: string;
  loadSpellDetails: (index: string) => Promise<void>;
  spellDetailsByIndex: Record<string, SpellDetails>;
  detailsLoadingByIndex: Record<string, boolean>;
  detailsErrorByIndex: Record<string, string>;
  isLoadingSpells: boolean;
  spellsError: string;
  isLoadingSpellsByClass: boolean;
  spellsByClassError: string;
  spellsByClassNotice: string;
  selectedClasses: string[];
  spellLevels: number[];
  spellClasses: string[];
  onSaveSpell: (spell: CustomSpellInput) => void;
  onEditSpell: (index: string, input: CustomSpellInput) => void;
  onDeleteSpell: (index: string) => void;
  cardTexts: Record<string, string>;
  onSaveCardText: (spellIndex: string, text: string) => void;
  hasActiveCharacter?: boolean;
  isSpellbook: boolean;
  classAbbreviations: Record<string, string>;
  showPrintPreview: boolean;
  setShowPrintPreview: (value: boolean) => void;
  paperSize: "a4" | "a5";
  setPaperSize: (value: "a4" | "a5") => void;
};

export default function SpellList({
  headline,
  description,
  filteredSpells,
  toggleFavorite,
  handleSort,
  sortBy,
  sortDirection,
  spellDetails,
  getSpellDetails,
  isLoadingDetails,
  detailsError,
  loadSpellDetails,
  spellDetailsByIndex,
  detailsLoadingByIndex,
  detailsErrorByIndex,
  isLoadingSpells,
  spellsError,
  isLoadingSpellsByClass,
  spellsByClassError,
  spellsByClassNotice,
  selectedClasses,
  spellLevels,
  spellClasses,
  onSaveSpell,
  onEditSpell,
  onDeleteSpell,
  cardTexts,
  onSaveCardText,
  hasActiveCharacter,
  isSpellbook,
  classAbbreviations,
  showPrintPreview,
  setShowPrintPreview,
  paperSize,
  setPaperSize,
}: SpellListProps) {
  const [expandedSpellIndex, setExpandedSpellIndex] = useState<string | null>(
    null,
  );
  const [editingSpell, setEditingSpell] = useState<CustomSpell | null>(null);
  const [formVersion, setFormVersion] = useState(0);
  const [activeView, setActiveView] = useState("list");
  const [editingCard, setEditingCard] = useState<{
    index: string;
    text: string;
  } | null>(null);
  const customSpellDialog = useRef<HTMLDialogElement>(null);
  const cardTextDialogRef = useRef<HTMLDialogElement>(null);

  const sheets = Array.from(
    { length: Math.ceil(filteredSpells.length / 8) },
    (_, index) => filteredSpells.slice(index * 8, index * 8 + 8),
  );

  function handleToggleAddSpell(spell: CustomSpell | null = null) {
    setEditingSpell(spell);
    setFormVersion((version) => version + 1);
    customSpellDialog.current?.showModal();
  }

  const renderSpellCard = (spell: Spell) => (
    <SpellCard
      key={spell.index}
      spell={spell}
      loadSpellDetails={loadSpellDetails}
      spellDetails={spellDetailsByIndex[spell.index]}
      isLoading={detailsLoadingByIndex[spell.index] ?? false}
      error={detailsErrorByIndex[spell.index] ?? ""}
      isFavorite={spell.isFavorite}
      toggleFavorite={toggleFavorite}
      hasActiveCharacter={hasActiveCharacter}
      classAbbreviations={classAbbreviations}
      savedCardText={cardTexts[spell.index]}
      onEditCardText={(index, currentText) =>
        openCardTextDialog(index, currentText)
      }
    />
  );

  function openCardTextDialog(index: string, currentText: string) {
    setEditingCard({ index, text: currentText });
    cardTextDialogRef.current?.showModal();
  }

  const cardTextEditor = (
    <CardTextEditorDialog
      cardTextDialogRef={cardTextDialogRef}
      editingCard={editingCard}
      setEditingCard={setEditingCard}
      onSaveCardText={onSaveCardText}
      closeDialog={() => cardTextDialogRef.current?.close()}
    />
  );

  if (showPrintPreview) {
    return (
      <section className="spell-print-preview" data-paper-size={paperSize}>
        <div className="print-controls button-wrapper">
          <button
            className="small-btn"
            type="button"
            onClick={() => setShowPrintPreview(false)}
          >
            Back to spellbook
          </button>
          <span className="print-paper-size-wrapper">
            <label htmlFor="print-paper-size" className="small-label">
              Paper size
            </label>
            <select
              className="print-paper-size"
              id="print-paper-size"
              value={paperSize}
              onChange={(event) => {
                const size = event.currentTarget.value;
                if (size === "a4" || size === "a5") {
                  setPaperSize(size);
                }
              }}
            >
              <option value="a4">A4</option>
              <option value="a5">A5</option>
            </select>
          </span>
          <button
            className="small-btn"
            type="button"
            onClick={() => window.print()}
          >
            Print cards
          </button>
        </div>
        {cardTextEditor}
        <div className="spell-print-grid">
          {paperSize === "a4" ? (
            <div className="spell-card-grid">
              {filteredSpells.map(renderSpellCard)}
            </div>
          ) : (
            <>
              {sheets.map((sheetCards) => (
                <div
                  key={sheetCards[0].index}
                  className="spell-print-sheet"
                  data-paper-size="a5"
                >
                  <div className="spell-print-half spell-card-grid">
                    {sheetCards.slice(0, 4).map(renderSpellCard)}
                  </div>
                  <div className="spell-print-half spell-card-grid">
                    {sheetCards.slice(4).map(renderSpellCard)}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
        <p className="print-instructions">
          <b>Print settings:</b>{" "}
          {paperSize === "a4" ? (
            <>
              Select <b>A4</b> in your print dialog to match this preview.
            </>
          ) : (
            <>
              <b>A5 layout:</b> Print on <b>A4 paper</b> in <b>Landscape</b> at{" "}
              <b>100% (Actual size)</b>. Select <b>1 page per sheet</b>, then
              cut along the center line.
            </>
          )}{" "}
          For best results, Set <b>Scale</b> to <b>100% (Actual size)</b> and{" "}
          <b>Margins</b> to <b>None</b>. Enable <b>Background graphics</b> and
          turn off <b>Headers and footers</b>.
        </p>
      </section>
    );
  }

  return (
    <section className="spell-list">
      <h2>
        {headline}
        <span>
          <button
            className="toggle-add-spell"
            onClick={() => handleToggleAddSpell()}
          >
            Add custom spell
          </button>
        </span>
      </h2>
      <p>{description}</p>
      <CustomSpellFormDialog
        editingSpell={editingSpell}
        dialogRef={customSpellDialog}
        onSaveSpell={onSaveSpell}
        onEditSpell={onEditSpell}
        onDeleteSpell={onDeleteSpell}
        spellLevels={spellLevels}
        spellClasses={spellClasses}
        formVersion={formVersion}
      />
      <div className="spell-view-controls">
        {sortBy !== "relevance" && (
          <button
            className="reset-sort-by"
            onClick={() => handleSort("relevance")}
          >
            Reset sorting
          </button>
        )}
        {isSpellbook && (
          <div className="print-n-view">
            {isSpellbook &&
              activeView === "grid" &&
              filteredSpells.length > 0 && (
                <button
                  className="print-cards small-btn"
                  type="button"
                  onClick={() => setShowPrintPreview(true)}
                >
                  Preview print
                </button>
              )}
            <span className="toggle-view">
              <button
                aria-label="List view"
                aria-pressed={activeView === "list"}
                title="List view"
                className={`list-view ${activeView === "list" ? "active" : ""}`}
                onClick={() => setActiveView("list")}
              >
                <ListIcon />
              </button>
              <button
                aria-label="Card view"
                aria-pressed={activeView === "grid"}
                title="Card view"
                className={`grid-view ${activeView === "grid" ? "active" : ""}`}
                onClick={() => setActiveView("grid")}
              >
                <GridIcon />
              </button>
            </span>
          </div>
        )}
      </div>
      {!isSpellbook || activeView === "list" ? (
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
              ) : selectedClasses.length > 0 && selectedClasses[0] !== "all" && isLoadingSpellsByClass ? (
                <tr>
                  <td colSpan={3}>
                    <p className="loading">
                      Loading spells for {selectedClasses.join(", ")}…
                    </p>
                  </td>
                </tr>
              ) : selectedClasses.length > 0 && selectedClasses[0] !== "all" && spellsByClassError ? (
                <tr>
                  <td colSpan={3}>
                    <p className="error">{spellsByClassError}</p>
                  </td>
                </tr>
              ) : selectedClasses.length > 0 && selectedClasses[0] !== "all" &&
                spellsByClassNotice &&
                filteredSpells.length === 0 ? (
                <tr>
                  <td colSpan={3}>
                    <p className="notice">{spellsByClassNotice}</p>
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
                    onDeleteSpell={onDeleteSpell}
                    hasActiveCharacter={hasActiveCharacter}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <>
          {cardTextEditor}
          <div className="spell-card-grid">
            {filteredSpells.map(renderSpellCard)}
          </div>
        </>
      )}
    </section>
  );
}
