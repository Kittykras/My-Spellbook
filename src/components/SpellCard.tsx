import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Spell, SpellDetails } from "../types/spell";
import { cardDescriptions } from "../data/cardDescriptions";

type SpellCardProps = {
  spell: Spell;
  isFavorite: boolean;
  toggleFavorite: (index: string) => void;
  hasActiveCharacter: boolean | undefined;
  loadSpellDetails: (index: string) => Promise<void>;
  spellDetails: SpellDetails | undefined;
  isLoading: boolean;
  error: string;
  classAbbreviations: Record<string, string>;
  savedCardText?: string;
  onEditCardText: (index: string, currentText: string) => void;
};

export default function SpellCard({
  spell,
  isFavorite,
  toggleFavorite,
  hasActiveCharacter,
  loadSpellDetails,
  spellDetails,
  isLoading,
  error,
  classAbbreviations,
  savedCardText,
  onEditCardText,
}: SpellCardProps) {
  const [textOverflows, setTextOverflows] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardDetails = spell.isCustom
    ? spell
    : spellDetails
      ? {
          ...spellDetails,
          casting_time: spellDetails.casting_time
            .toLowerCase()
            .startsWith("reaction")
            ? "1 reaction"
            : spellDetails.casting_time.toLowerCase() === "action"
              ? "1 action"
              : spellDetails.casting_time,
          school: spellDetails.school.name,
          classes: spellDetails.classes.map((spellClass) => spellClass.name),
        }
      : undefined;
  const classNames = cardDetails?.classes ?? [];

  const displayedClasses = classNames
    .map((name) =>
      classNames.length > 4 ? (classAbbreviations[name] ?? name) : name,
    )
    .join(", ");

  const description =
    savedCardText ?? cardDescriptions[spell.index] ?? cardDetails?.description;

  useEffect(() => {
    if (!spell.isCustom) {
      void loadSpellDetails(spell.index);
    }
  }, [spell.index, spell.isCustom, loadSpellDetails]);

  useLayoutEffect(() => {
    const body = bodyRef.current;
    const content = contentRef.current;

    if (!body || !content) return;

    function fitText() {
      if (!body || !content) return;

      let size = 12;
      body.style.setProperty("--description-size", `${size}px`);

      while (
        content.getBoundingClientRect().height > body.clientHeight &&
        size > 7.5
      ) {
        size -= 0.5;
        body.style.setProperty("--description-size", `${size}px`);
      }

      setTextOverflows(
        content.getBoundingClientRect().height > body.clientHeight,
      );
    }

    fitText();

    const observer = new ResizeObserver(fitText);
    observer.observe(body);

    let cancelled = false;

    void document.fonts.ready.then(() => {
      if (!cancelled) fitText();
    });

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [spell, spellDetails, isLoading, error, description]);

  useLayoutEffect(() => {
    const title = titleRef.current;
    if (!title) return;

    function fitTitle() {
      if (!title) return;

      let size = 24;
      title.style.fontSize = `${size}px`;

      while (title.scrollWidth > title.clientWidth && size > 10) {
        size -= 0.5;
        title.style.fontSize = `${size}px`;
      }
    }

    fitTitle();

    const observer = new ResizeObserver(fitTitle);
    observer.observe(title);

    let cancelled = false;

    void document.fonts.ready.then(() => {
      if (!cancelled) fitTitle();
    });

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [spell.name]);

  return (
    <div className="spell-card-wrapper">
      <div className="spell-card">
        <div className="spell-title">
          <h4 ref={titleRef}>{spell.name}</h4>
          <button
            className="favorite-btn"
            onClick={() => toggleFavorite(spell.index)}
            disabled={!hasActiveCharacter}
            aria-label={
              !hasActiveCharacter
                ? `Create a character to save ${spell.name} to favorites`
                : isFavorite
                  ? `Remove ${spell.name} from favorites`
                  : `Add ${spell.name} to favorites`
            }
            title={
              !hasActiveCharacter
                ? "Create a character to save favorite spells"
                : undefined
            }
          >
            {isFavorite ? "★" : "☆"}
          </button>
        </div>
        {!spell.isCustom &&
          (isLoading ? (
            <p className="loading">Loading spell details…</p>
          ) : error ? (
            <>
              <p className="error">{error}</p>
              <button
                type="button"
                className="small-btn"
                onClick={() => void loadSpellDetails(spell.index)}
              >
                Try again
              </button>
            </>
          ) : null)}
        {cardDetails !== undefined && (
          <>
            <div className="spell-level">
              {spell.level === 0 ? "Cantrip" : `Level ${spell.level}`}
              {" · "}
              {cardDetails.school}
            </div>
            <div className="spell-info">
              <div className="spell-card-casting-time">
                {cardDetails.ritual && <span className="ritual">R</span>}
                <p className="label">CASTING TIME</p>
                <p className="value">
                  {cardDetails.casting_time.toLowerCase()}
                </p>
              </div>
              <div className="spell-card-range">
                <p className="label">RANGE</p>
                <p className="value">{cardDetails.range}</p>
              </div>
              <div className="spell-card-duration">
                <p className="label">DURATION</p>
                <p className="value">{cardDetails.duration}</p>
              </div>
              <div className="spell-card-components">
                <p className="label">COMPONENTS</p>
                <p className="value">
                  {cardDetails.components.join(", ")}{" "}
                  {cardDetails.components.includes("M") ? "*" : ""}
                </p>
                {cardDetails.concentration && (
                  <span className="concentration">C</span>
                )}
              </div>
            </div>
            <div className="spell-card-body" ref={bodyRef}>
              <div className="spell-card-body-content" ref={contentRef}>
                <p className="spell-desc">
                  {description}
                </p>
                {cardDetails.higher_level && (
                  <>
                    <h3 className="higher-lvl-title">At higher levels</h3>
                    <p className="higher-lvl-desc">
                      {cardDetails.higher_level}
                    </p>
                  </>
                )}
                {cardDetails.material && (
                  <p className="spell-material">* - ({cardDetails.material})</p>
                )}
              </div>
            </div>
            <p className="spell-classes" title={classNames.join(", ")}>
              {displayedClasses}
            </p>
          </>
        )}
      </div>
      {textOverflows && (
        <p className="spell-card-warning">
          {spell.name}: The text is too long to fit on this card.
          <button
            type="button"
            className="small-btn"
            onClick={() => onEditCardText(spell.index, description ?? "")}
          >
            Edit card text
          </button>
        </p>
      )}
    </div>
  );
}
