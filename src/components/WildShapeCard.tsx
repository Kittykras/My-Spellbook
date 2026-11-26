import { useLayoutEffect, useRef, useState } from "react";
import type { Character } from "../types/character";
import type { WildShape } from "../types/wildShape";
import {
  formatChallengeRating,
  formatModifier,
  formatUnit,
} from "../utils/formats";
import MarkdownContent from "./MarkdownContent";

type WildShapeCardProps = {
  wildShape: WildShape;
  onToggleFavorite: (key: string) => void;
  activeCharacter: Character | undefined;
};

export default function WildShapeCard({
  wildShape,
  onToggleFavorite,
  activeCharacter,
}: WildShapeCardProps) {
  const isFavorite =
    activeCharacter?.favoriteWildShapeKeys.includes(wildShape.key) ?? false;
  const bodyRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [textOverflows, setTextOverflows] = useState(false);

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
  }, [wildShape.name]);

  useLayoutEffect(() => {
    const body = bodyRef.current;
    const content = contentRef.current;

    if (!body || !content) return;

    function fitText() {
      if (!body || !content) return;

      const styles = getComputedStyle(body);
      const availableHeight =
        body.clientHeight -
        parseFloat(styles.paddingTop) -
        parseFloat(styles.paddingBottom);

      let size = 12;

      body.style.setProperty("--description-size", `${size}px`);

      while (
        content.getBoundingClientRect().height > availableHeight &&
        size > 7.5
      ) {
        size -= 0.5;
        body.style.setProperty("--description-size", `${size}px`);
      }

      setTextOverflows(
        content.getBoundingClientRect().height > availableHeight,
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
  }, [wildShape]);

  return (
    <div className="wild-shape-card-wrapper">
      <div className="wild-shape-card">
        <div className="wild-shape-card-header">
          <h4 ref={titleRef}>{wildShape.name}</h4>
          <p className="size">
            {wildShape.size.name} / {wildShape.alignment}
          </p>
          <p className="cr">
            <b>CR</b> {formatChallengeRating(wildShape.challenge_rating)}
          </p>
          <button
            className="favorite-btn"
            onClick={() => onToggleFavorite(wildShape.key)}
            aria-label={
              !activeCharacter
                ? "Create a character to save wild shapes"
                : isFavorite
                  ? `Remove ${wildShape.name} from favorites`
                  : `Add ${wildShape.name} to favorites`
            }
            disabled={!activeCharacter}
          >
            {isFavorite ? "★" : "☆"}
          </button>
        </div>
        <div className="wild-shape-card-body" ref={bodyRef}>
          <div ref={contentRef}>
            <div className="ability-grid">
              <div className="ability-col">
                <p className="ability-col-top">
                  <span className="label">STR</span>
                  <span className="score">
                    {wildShape.ability_scores.strength} (
                    {formatModifier(wildShape.modifiers.strength)})
                  </span>
                </p>
                <div className="ability-col-save">
                  <span className="label">Save</span>
                  <span className="value">
                    {formatModifier(wildShape.saving_throws.strength)}
                  </span>
                </div>
              </div>
              <div className="ability-col">
                <p className="ability-col-top">
                  <span className="label">DEX</span>
                  <span className="score">
                    {wildShape.ability_scores.dexterity} (
                    {formatModifier(wildShape.modifiers.dexterity)})
                  </span>
                </p>
                <div className="ability-col-save">
                  <span className="label">Save</span>
                  <span className="value">
                    {formatModifier(wildShape.saving_throws.dexterity)}
                  </span>
                </div>
              </div>
              <div className="ability-col">
                <p className="ability-col-top">
                  <span className="label">CON</span>
                  <span className="score">
                    {wildShape.ability_scores.constitution} (
                    {formatModifier(wildShape.modifiers.constitution)})
                  </span>
                </p>
                <div className="ability-col-save">
                  <span className="label">Save</span>
                  <span className="value">
                    {formatModifier(wildShape.saving_throws.constitution)}
                  </span>
                </div>
              </div>
              <div className="ability-col">
                <p className="ability-col-top">
                  <span className="label">INT</span>
                  <span className="score">
                    {wildShape.ability_scores.intelligence} (
                    {formatModifier(wildShape.modifiers.intelligence)})
                  </span>
                </p>
                <div className="ability-col-save">
                  <span className="label">Save</span>
                  <span className="value">
                    {formatModifier(wildShape.saving_throws.intelligence)}
                  </span>
                </div>
              </div>
              <div className="ability-col">
                <p className="ability-col-top">
                  <span className="label">WIS</span>
                  <span className="score">
                    {wildShape.ability_scores.wisdom} (
                    {formatModifier(wildShape.modifiers.wisdom)})
                  </span>
                </p>
                <div className="ability-col-save">
                  <span className="label">Save</span>
                  <span className="value">
                    {formatModifier(wildShape.saving_throws.wisdom)}
                  </span>
                </div>
              </div>
              <div className="ability-col">
                <p className="ability-col-top">
                  <span className="label">CHA</span>
                  <span className="score">
                    {wildShape.ability_scores.charisma} (
                    {formatModifier(wildShape.modifiers.charisma)})
                  </span>
                </p>
                <div className="ability-col-save">
                  <span className="label">Save</span>
                  <span className="value">
                    {formatModifier(wildShape.saving_throws.charisma)}
                  </span>
                </div>
              </div>
            </div>
            <div className="row-two">
              <p className="stat-line">
                <b>AC:</b> {wildShape.armor_class}
              </p>
              <p className="stat-line">
                <b>HP:</b> {wildShape.hit_points} ({wildShape.hit_dice})
              </p>
            </div>
            <div className="stats">
              <p className="stat-line">
                <b>Initiative:</b> {formatModifier(wildShape.initiative_bonus)}
              </p>
              <p className="stat-line">
                <b>Speed:</b>{" "}
                {[
                  wildShape.speed.walk
                    ? `Walk ${wildShape.speed.walk} ${formatUnit(wildShape.speed.unit)}`
                    : "",
                  wildShape.speed.fly
                    ? `Fly ${wildShape.speed.fly} ${formatUnit(wildShape.speed.unit)}`
                    : "",
                  wildShape.speed.swim
                    ? `Swim ${wildShape.speed.swim} ${formatUnit(wildShape.speed.unit)}`
                    : "",
                  wildShape.speed.climb
                    ? `Climb ${wildShape.speed.climb} ${formatUnit(wildShape.speed.unit)}`
                    : "",
                  wildShape.speed.burrow
                    ? `Burrow ${wildShape.speed.burrow} ${formatUnit(wildShape.speed.unit)}`
                    : "",
                ]
                  .filter(Boolean)
                  .join(", ")}
              </p>
              {(wildShape.isCustom
                ? wildShape.skill_bonuses.trim().length > 0
                : Object.keys(wildShape.skill_bonuses).length > 0) && (
                <p className="stat-line skills">
                  <b>Skills:</b>{" "}
                  {wildShape.isCustom
                    ? wildShape.skill_bonuses
                    : Object.entries(wildShape.skill_bonuses)
                        .map(
                          ([skill, bonus]) =>
                            `${skill.replaceAll("_", " ")} ${formatModifier(bonus)}`,
                        )
                        .join(", ")}
                </p>
              )}
              <p className="stat-line">
                <b>Senses:</b>{" "}
                {wildShape.darkvision_range != null &&
                  wildShape.darkvision_range > 0 && (
                    <>Darkvision {wildShape.darkvision_range} ft., </>
                  )}
                Passive Perception {wildShape.passive_perception}
              </p>
              {wildShape.traits.length > 0 && (
                <>
                  <h3 className="traits-title">Traits</h3>
                  {wildShape.isCustom ? (
                    <MarkdownContent
                      className="trait custom-description"
                      text={wildShape.traits}
                    />
                  ) : (
                    wildShape.traits.map((trait) => (
                      <p key={trait.name} className="trait">
                        <b>{trait.name}.</b> {trait.desc}
                      </p>
                    ))
                  )}
                </>
              )}
              {wildShape.actions.length > 0 && (
                <>
                  <h3 className="actions-title">Actions</h3>
                  <div className="actions-list">
                    {wildShape.isCustom ? (
                      <MarkdownContent
                        className="action custom-description"
                        text={wildShape.actions}
                      />
                    ) : (
                      wildShape.actions.map((action) => (
                        <p key={action.name} className="action">
                          <b>{action.name}.</b> {action.desc}
                        </p>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      {textOverflows && (
        <p className="wild-shape-card-warning">
          {wildShape.name}: The text is too long to fit on one card.
        </p>
      )}
    </div>
  );
}
