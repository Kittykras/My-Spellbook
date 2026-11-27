import { useRef, useState } from "react";
import type {
  WildShape,
  CustomWildShapeInput,
  CustomWildShape,
} from "../types/wildShape";
import WildShapeItem from "./WildShapeItem";
import type { Character } from "../types/character";
import type { AbilityScores } from "../types/wildShape";
import ListIcon from "../assets/ListIcon";
import GridIcon from "../assets/GridIcon";
import WildShapeCard from "./WildShapeCard";
import CustomWildShapeFormDialog from "./CustomWildShapeFormDialog";

type WildShapeListProps = {
  wildShapes: WildShape[];
  headline: string;
  description: string;
  isLoading: boolean;
  error: string | null;
  toggleWildShapeFavorite: (key: string) => void;
  activeCharacter: Character | undefined;
  sortBy: "name" | "cr" | "favorite";
  sortDirection: "asc" | "desc";
  handleSort: (column: "name" | "cr" | "favorite") => void;
  isMyWildShapesTab: boolean;
  challengeRatings: number[];
  creatureSizes: string[];
  abilities: readonly { key: keyof AbilityScores; label: string }[];
  onSaveWildShape: (input: CustomWildShapeInput) => void;
  onEditWildShape: (key: string, input: CustomWildShapeInput) => void;
  onDeleteWildShape: (key: string) => void;
  paperSize: "a4" | "a5";
  setPaperSize: (value: "a4" | "a5") => void;
};

export default function WildShapeList({
  wildShapes,
  headline,
  description,
  isLoading,
  error,
  toggleWildShapeFavorite,
  activeCharacter,
  sortBy,
  sortDirection,
  handleSort,
  isMyWildShapesTab,
  onSaveWildShape,
  challengeRatings,
  creatureSizes,
  abilities,
  onEditWildShape,
  onDeleteWildShape,
  paperSize,
  setPaperSize,
}: WildShapeListProps) {
  const [activeView, setActiveView] = useState("list");
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [expandedWildShapeKey, setExpandedWildShapeKey] = useState<
    string | null
  >(null);
  const [editingWildShape, setEditingWildShape] =
    useState<CustomWildShape | null>(null);
  const [formVersion, setFormVersion] = useState(0);
  const customWildShapeDialog = useRef<HTMLDialogElement>(null);

  function toggleWildShapeDetails(key: string) {
    setExpandedWildShapeKey((previousKey) =>
      previousKey === key ? null : key,
    );
  }

  function handleToggleAddWildShape(wildShape: CustomWildShape | null = null) {
    setEditingWildShape(wildShape);
    setFormVersion((version) => version + 1);
    customWildShapeDialog.current?.showModal();
  }

  const sheets = Array.from(
    { length: Math.ceil(wildShapes.length / 8) },
    (_, index) => wildShapes.slice(index * 8, index * 8 + 8),
  );

  const renderWildShapeCard = (wildShape: WildShape) => (
    <WildShapeCard
      key={wildShape.key}
      wildShape={wildShape}
      onToggleFavorite={toggleWildShapeFavorite}
      activeCharacter={activeCharacter}
    />
  );

  if (showPrintPreview) {
    return (
      <section className="wild-shape-print-preview" data-paper-size={paperSize}>
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
        {/* {cardTextEditor} */}
        <div className="wild-shape-print-grid">
          {paperSize === "a4" ? (
            <div className="wild-shape-card-grid">
              {wildShapes.map(renderWildShapeCard)}
            </div>
          ) : (
            <>
              {sheets.map((sheetCards) => (
                <div
                  key={sheetCards[0].key}
                  className="wild-shape-print-sheet"
                  data-paper-size="a5"
                >
                  <div className="wild-shape-print-half wild-shape-card-grid">
                    {sheetCards.slice(0, 4).map(renderWildShapeCard)}
                  </div>
                  <div className="wild-shape-print-half wild-shape-card-grid">
                    {sheetCards.slice(4).map(renderWildShapeCard)}
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
    <section className="wild-shape-list">
      <h2>
        {headline}
        <span>
          <button
            className="toggle-add-wild-shape"
            onClick={() => handleToggleAddWildShape()}
          >
            Add custom wild shape
          </button>
        </span>
      </h2>
      <p>{description}</p>
      <CustomWildShapeFormDialog
        dialogRef={customWildShapeDialog}
        challengeRatings={challengeRatings}
        creatureSizes={creatureSizes}
        abilities={abilities}
        onSaveWildShape={onSaveWildShape}
        editingWildShape={editingWildShape}
        onEditWildShape={onEditWildShape}
        onDeleteWildShape={onDeleteWildShape}
        formVersion={formVersion}
      />
      {isMyWildShapesTab && (
        <div className="wild-shape-view-controls">
          <div className="print-n-view">
            {isMyWildShapesTab &&
              activeView === "grid" &&
              wildShapes.length > 0 && (
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
        </div>
      )}
      {!isMyWildShapesTab || activeView === "list" ? (
        <div className="wild-shape-table">
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
                    Name{" "}
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
                    sortBy === "cr"
                      ? sortDirection === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  <button onClick={() => handleSort("cr")}>
                    CR{" "}
                    {sortBy === "cr" && (
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
                    Favorite{" "}
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
              {isLoading && (
                <tr>
                  <td colSpan={3}>
                    <p className="loading">Loading wild shapes...</p>
                  </td>
                </tr>
              )}
              {error && (
                <tr>
                  <td colSpan={3}>
                    <p className="error">{error}</p>
                  </td>
                </tr>
              )}
              {!isLoading &&
                !error &&
                wildShapes.map((wildShape) => (
                  <WildShapeItem
                    key={wildShape.key}
                    wildShape={wildShape}
                    isExpanded={expandedWildShapeKey === wildShape.key}
                    onToggleDetails={() =>
                      toggleWildShapeDetails(wildShape.key)
                    }
                    onToggleFavorite={() =>
                      toggleWildShapeFavorite(wildShape.key)
                    }
                    activeCharacter={activeCharacter}
                    openCustomWildShapeDialog={() => {
                      if (wildShape.isCustom && wildShape.isOwn) {
                        handleToggleAddWildShape(wildShape);
                      }
                    }}
                  />
                ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="wild-shape-card-grid">
          {wildShapes.map(renderWildShapeCard)}
        </div>
      )}
    </section>
  );
}
