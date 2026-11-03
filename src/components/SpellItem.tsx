import type { CustomSpell, Spell, SpellDetails } from "../types/spell";
import type { Dispatch, RefObject, SetStateAction } from "react";
import SpellDetailsContent from "./SpellDetailsContent";

export default function SpellItem({
  spell,
  toggleFavorite,
  spellDetails,
  getSpellDetails,
  isLoadingDetails,
  detailsError,
  expandedSpellIndex,
  setExpandedSpellIndex,
  openCustomSpellDialog,
}: {
  spell: Spell;
  toggleFavorite: (index: string) => void;
  spellDetails: SpellDetails | undefined;
  getSpellDetails: (index: string) => Promise<void>;
  isLoadingDetails: boolean;
  detailsError: string;
  expandedSpellIndex: string | null;
  setExpandedSpellIndex: Dispatch<SetStateAction<string | null>>;
  openCustomSpellDialog: (spell: CustomSpell) => void;
}) {
  const isExpanded = expandedSpellIndex === spell.index;

  function toggleSpellDetails(index: string) {
    if (isExpanded) {
      setExpandedSpellIndex(null);
    } else {
      if (!spell.isCustom) {
        getSpellDetails(index);
      }
      setExpandedSpellIndex(index);
    }
  }

  return (
    <>
      <tr>
        <td className="name">
          <button
            className="spell-details-toggle"
            onClick={() => toggleSpellDetails(spell.index)}
            aria-expanded={isExpanded}
          >
            {spell.name}
            <span className="minus" aria-hidden="true">
              {isExpanded && "-"}
            </span>
          </button>
        </td>
        <td className="level">
          <span>{spell.level === 0 ? "Cantrip" : `Level ${spell.level}`}</span>
        </td>
        <td className="favorite">
          <button
            className="favorite-btn"
            onClick={() => toggleFavorite(spell.index)}
            aria-label={
              spell.isFavorite
                ? `Remove ${spell.name} from favorites`
                : `Add ${spell.name} to favorites`
            }
          >
            {spell.isFavorite ? "★" : "☆"}
          </button>
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={3}>
            <section className="spell-details">
              {spell.isCustom ? (
                <>
                  <SpellDetailsContent spellDetails={spell} />
                  <div className="button-wrapper">
                    <button
                      type="button"
                      className="small-btn"
                      onClick={() => openCustomSpellDialog(spell)}
                    >
                      Edit spell
                    </button>
                    <button type="button" className="small-btn">
                      Delete spell
                    </button>
                  </div>
                </>
              ) : isLoadingDetails ? (
                <p className="loading">Loading spell details…</p>
              ) : detailsError ? (
                <p className="error">{detailsError}</p>
              ) : (
                spellDetails?.index === spell.index && (
                  <SpellDetailsContent
                    spellDetails={{
                      ...spellDetails,
                      casting_time:
                        spellDetails.casting_time.toLowerCase() === "action"
                          ? "1 action"
                          : spellDetails.casting_time,
                      school: spellDetails.school.name,
                      classes: spellDetails.classes.map(
                        (spellClass) => spellClass.name,
                      ),
                    }}
                  />
                )
              )}
            </section>
          </td>
        </tr>
      )}
    </>
  );
}
