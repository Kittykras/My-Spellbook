import type { WildShape } from "../types/wildShape";
import { formatModifier, formatUnit } from "../utils/formats";
import MarkdownContent from "./MarkdownContent";

export default function WildShapeDetailsContent({
  wildShape,
}: {
  wildShape: WildShape;
}) {
  return (
    <>
      <p className="size">
        {wildShape.size.name} / {wildShape.alignment}
      </p>
      <div className="row-two">
        <p className="stat-line">
          <b>AC:</b> {wildShape.armor_class}
        </p>
        <p className="stat-line">
          <b>Initiative:</b> {formatModifier(wildShape.initiative_bonus)}
        </p>
      </div>
      <p className="stat-line">
        <b>HP:</b> {wildShape.hit_points} ({wildShape.hit_dice})
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
      <div className="ability-grid">
        <div className="ability-col">
          <p className="ability-col-top">
            <span className="label">STR</span>
            <span className="score">{wildShape.ability_scores.strength}</span>
          </p>
          <div className="ability-col-mods">
            <p className="ability-pill">
              <span className="label">MOD</span>
              <span className="value">
                {formatModifier(wildShape.modifiers.strength)}
              </span>
            </p>
            <p className="ability-pill">
              <span className="label">SAVE</span>
              <span className="value">
                {formatModifier(wildShape.saving_throws.strength)}
              </span>
            </p>
          </div>
        </div>
        <div className="ability-col">
          <p className="ability-col-top">
            <span className="label">DEX</span>
            <span className="score">{wildShape.ability_scores.dexterity}</span>
          </p>
          <div className="ability-col-mods">
            <p className="ability-pill">
              <span className="label">MOD</span>
              <span className="value">
                {formatModifier(wildShape.modifiers.dexterity)}
              </span>
            </p>
            <p className="ability-pill">
              <span className="label">SAVE</span>
              <span className="value">
                {formatModifier(wildShape.saving_throws.dexterity)}
              </span>
            </p>
          </div>
        </div>
        <div className="ability-col">
          <p className="ability-col-top">
            <span className="label">CON</span>
            <span className="score">
              {wildShape.ability_scores.constitution}
            </span>
          </p>
          <div className="ability-col-mods">
            <p className="ability-pill">
              <span className="label">MOD</span>
              <span className="value">
                {formatModifier(wildShape.modifiers.constitution)}
              </span>
            </p>
            <p className="ability-pill">
              <span className="label">SAVE</span>
              <span className="value">
                {formatModifier(wildShape.saving_throws.constitution)}
              </span>
            </p>
          </div>
        </div>
        <div className="ability-col">
          <p className="ability-col-top">
            <span className="label">INT</span>
            <span className="score">
              {wildShape.ability_scores.intelligence}
            </span>
          </p>
          <div className="ability-col-mods">
            <p className="ability-pill">
              <span className="label">MOD</span>
              <span className="value">
                {formatModifier(wildShape.modifiers.intelligence)}
              </span>
            </p>
            <p className="ability-pill">
              <span className="label">SAVE</span>
              <span className="value">
                {formatModifier(wildShape.saving_throws.intelligence)}
              </span>
            </p>
          </div>
        </div>
        <div className="ability-col">
          <p className="ability-col-top">
            <span className="label">WIS</span>
            <span className="score">{wildShape.ability_scores.wisdom}</span>
          </p>
          <div className="ability-col-mods">
            <p className="ability-pill">
              <span className="label">MOD</span>
              <span className="value">
                {formatModifier(wildShape.modifiers.wisdom)}
              </span>
            </p>
            <p className="ability-pill">
              <span className="label">SAVE</span>
              <span className="value">
                {formatModifier(wildShape.saving_throws.wisdom)}
              </span>
            </p>
          </div>
        </div>
        <div className="ability-col">
          <p className="ability-col-top">
            <span className="label">CHA</span>
            <span className="score">{wildShape.ability_scores.charisma}</span>
          </p>
          <div className="ability-col-mods">
            <p className="ability-pill">
              <span className="label">MOD</span>
              <span className="value">
                {formatModifier(wildShape.modifiers.charisma)}
              </span>
            </p>
            <p className="ability-pill">
              <span className="label">SAVE</span>
              <span className="value">
                {formatModifier(wildShape.saving_throws.charisma)}
              </span>
            </p>
          </div>
        </div>
      </div>
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
      <p className="stat-line">
        <b>CR:</b> {wildShape.challenge_rating} (XP{" "}
        {wildShape.experience_points}
        {wildShape.proficiency_bonus
          ? `, PB ${wildShape.proficiency_bonus}`
          : ""}
        )
      </p>
      {wildShape.traits.length > 0 && (
        <>
          <h3 className="traits-title">Traits</h3>
          {wildShape.isCustom ? (
            <MarkdownContent
              className="trait"
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
                className="action"
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
    </>
  );
}
