import { formatChallengeRating, formatModifier } from "../utils/formats";
import type { SubmitEvent } from "react";
import type {
  AbilityScores,
  CustomWildShapeInput,
  CustomWildShape,
} from "../types/wildShape";
import { parseSavingThrows } from "../utils/formats";

export default function CustomWildShapeForm({
  challengeRatings,
  creatureSizes,
  abilities,
  onSaveWildShape,
  closeDialog,
  editingWildShape,
  onEditWildShape,
  onDeleteWildShape,
}: {
  challengeRatings: number[];
  creatureSizes: string[];
  abilities: readonly { key: keyof AbilityScores; label: string }[];
  onSaveWildShape: (input: CustomWildShapeInput) => void;
  closeDialog: () => void;
  editingWildShape: CustomWildShape | null;
  onEditWildShape: (key: string, input: CustomWildShapeInput) => void;
  onDeleteWildShape: (key: string) => void;
}) {
  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const formEl = event.currentTarget;
    const formData = new FormData(formEl);

    function getText(field: string): string {
      return String(formData.get(`custom-wild-shape-${field}`) ?? "").trim();
    }

    function getNumber(field: string): number {
      return Number(getText(field));
    }

    const ability_scores: AbilityScores = {
      strength: getNumber("strength"),
      dexterity: getNumber("dexterity"),
      constitution: getNumber("constitution"),
      intelligence: getNumber("intelligence"),
      wisdom: getNumber("wisdom"),
      charisma: getNumber("charisma"),
    };

    const modifiers: AbilityScores = {
      strength: Math.floor((ability_scores.strength - 10) / 2),
      dexterity: Math.floor((ability_scores.dexterity - 10) / 2),
      constitution: Math.floor((ability_scores.constitution - 10) / 2),
      intelligence: Math.floor((ability_scores.intelligence - 10) / 2),
      wisdom: Math.floor((ability_scores.wisdom - 10) / 2),
      charisma: Math.floor((ability_scores.charisma - 10) / 2),
    };

    const name = getText("name");

    if (!name) return;

    const sizeName = getText("size");

    const input: CustomWildShapeInput = {
      name,
      type: {
        name: "Beast",
        key: "beast",
      },
      size: {
        name: sizeName,
        key: sizeName.toLowerCase(),
      },
      challenge_rating: getNumber("cr"),
      experience_points: getNumber("xp"),
      alignment: getText("alignment"),
      armor_class: getNumber("ac"),
      hit_points: getNumber("hp"),
      hit_dice: getText("hit-dice"),
      initiative_bonus: getNumber("initiative"),
      speed: {
        unit: "feet",
        walk: getNumber("speed-walk"),
        fly: getNumber("speed-fly"),
        swim: getNumber("speed-swim"),
        climb: getNumber("speed-climb"),
        burrow: getNumber("speed-burrow"),
      },
      ability_scores,
      modifiers,
      saving_throws: parseSavingThrows(getText("saving-throws"), modifiers),
      skill_bonuses: getText("skills"),
      passive_perception: getNumber("passive-perception"),
      darkvision_range:
        getText("darkvision") === "" ? null : getNumber("darkvision"),
      traits: getText("traits"),
      actions: getText("actions"),
      isShared: formData.has("custom-wild-shape-shared"),
    };
    if (editingWildShape) {
      onEditWildShape(editingWildShape.key, input);
    } else {
      onSaveWildShape(input);
    }
    formEl.reset();
    closeDialog();
  }

  function handleDelete() {
    if (!editingWildShape) return;

    const confirmed = window.confirm(`Delete "${editingWildShape.name}"?`);
    if (!confirmed) return;

    onDeleteWildShape(editingWildShape.key);
    closeDialog();
  }

  return (
    <form className="custom-wild-shape-form" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="custom-wild-shape-name">
          Name <span>*</span>
        </label>
        <input
          required
          type="text"
          placeholder="Enter wild shape name"
          name="custom-wild-shape-name"
          id="custom-wild-shape-name"
          defaultValue={editingWildShape?.name ?? ""}
        />
      </div>
      <div className="input-wrapper">
        <div>
          <label htmlFor="custom-wild-shape-size">
            Size <span>*</span>
          </label>
          <select
            required
            id="custom-wild-shape-size"
            name="custom-wild-shape-size"
            defaultValue={editingWildShape?.size.name ?? ""}
          >
            <option value="" disabled>
              Select size
            </option>
            {creatureSizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="custom-wild-shape-alignment">Alignment</label>
          <input
            type="text"
            placeholder="Enter wild shape alignment"
            name="custom-wild-shape-alignment"
            id="custom-wild-shape-alignment"
            defaultValue={editingWildShape?.alignment ?? ""}
          />
        </div>
        <div>
          <label htmlFor="custom-wild-shape-ac">
            Armor Class <span>*</span>
          </label>
          <input
            required
            type="number"
            min="0"
            step="1"
            max="50"
            placeholder="e.g. 10"
            name="custom-wild-shape-ac"
            id="custom-wild-shape-ac"
            defaultValue={editingWildShape?.armor_class ?? 10}
          />
        </div>
        <div>
          <label htmlFor="custom-wild-shape-initiative">
            Initiative Bonus <span>*</span>
          </label>
          <input
            required
            type="number"
            min="-20"
            step="1"
            max="20"
            placeholder="e.g. +2"
            name="custom-wild-shape-initiative"
            id="custom-wild-shape-initiative"
            defaultValue={editingWildShape?.initiative_bonus ?? ""}
          />
        </div>
        <div>
          <label htmlFor="custom-wild-shape-hp">
            Hit Points <span>*</span>
          </label>
          <input
            required
            type="number"
            min="1"
            step="1"
            max="1000"
            placeholder="e.g. 10"
            name="custom-wild-shape-hp"
            id="custom-wild-shape-hp"
            defaultValue={editingWildShape?.hit_points ?? 10}
          />
        </div>
        <div>
          <label htmlFor="custom-wild-shape-hit-dice">
            Hit dice <span>*</span>
          </label>
          <input
            required
            type="text"
            placeholder="e.g. 6d8 + 18"
            name="custom-wild-shape-hit-dice"
            id="custom-wild-shape-hit-dice"
            defaultValue={editingWildShape?.hit_dice ?? ""}
          />
        </div>
      </div>
      <fieldset>
        <legend>Movement (ft.)</legend>
        <div className="input-wrapper-five-in-row">
          {(
            [
              { key: "walk", label: "Walk" },
              { key: "fly", label: "Fly" },
              { key: "swim", label: "Swim" },
              { key: "climb", label: "Climb" },
              { key: "burrow", label: "Burrow" },
            ] as const
          ).map(({ key, label }) => (
            <div key={key}>
              <label htmlFor={`custom-wild-shape-speed-${key}`}>{label}</label>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="e.g. 30"
                name={`custom-wild-shape-speed-${key}`}
                id={`custom-wild-shape-speed-${key}`}
                defaultValue={editingWildShape?.speed?.[key] ?? ""}
              />
            </div>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend>Abilities</legend>
        <div className="input-wrapper-six-in-row">
          {abilities.map(({ key, label }) => (
            <div key={key}>
              <label htmlFor={`custom-wild-shape-${key}`}>
                {label} <span>*</span>
              </label>
              <input
                required
                type="number"
                min="1"
                max="30"
                step="1"
                defaultValue={editingWildShape?.ability_scores?.[key] ?? 10}
                name={`custom-wild-shape-${key}`}
                id={`custom-wild-shape-${key}`}
              />
            </div>
          ))}
        </div>
      </fieldset>
      <div className="input-wrapper">
        <div>
          <label htmlFor="custom-wild-shape-passive-perception">
            Passive Perception <span>*</span>
          </label>
          <input
            required
            type="number"
            min="0"
            step="1"
            max="50"
            placeholder="e.g. 10"
            name="custom-wild-shape-passive-perception"
            id="custom-wild-shape-passive-perception"
            defaultValue={editingWildShape?.passive_perception ?? 10}
          />
        </div>
        <div>
          <label htmlFor="custom-wild-shape-darkvision">Darkvision (ft.)</label>
          <input
            type="number"
            min="0"
            step="1"
            placeholder="e.g. 60"
            name="custom-wild-shape-darkvision"
            id="custom-wild-shape-darkvision"
            defaultValue={editingWildShape?.darkvision_range ?? ""}
          />
        </div>
        <div>
          <label htmlFor="custom-wild-shape-cr">
            Challenge Rating <span>*</span>
          </label>
          <select
            required
            id="custom-wild-shape-cr"
            name="custom-wild-shape-cr"
            defaultValue={editingWildShape?.challenge_rating ?? ""}
          >
            <option value="" disabled>
              Select CR
            </option>
            {challengeRatings.map((cr) => (
              <option key={cr} value={cr}>
                CR {formatChallengeRating(cr)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="custom-wild-shape-xp">XP</label>
          <input
            type="number"
            min="0"
            step="1"
            placeholder="Enter wild shape XP"
            name="custom-wild-shape-xp"
            id="custom-wild-shape-xp"
            defaultValue={editingWildShape?.experience_points ?? ""}
          />
        </div>
        <div>
          <label htmlFor="custom-wild-shape-saving-throws">Saving Throws</label>
          <input
            type="text"
            placeholder="e.g. dex: +5, wis: +3"
            name="custom-wild-shape-saving-throws"
            id="custom-wild-shape-saving-throws"
            defaultValue={
              editingWildShape
                ? abilities
                    .filter(
                      ({ key }) =>
                        editingWildShape.saving_throws[key] !==
                        editingWildShape.modifiers[key],
                    )
                    .map(
                      ({ key, label }) =>
                        `${label.toLowerCase()}: ${formatModifier(
                          editingWildShape.saving_throws[key],
                        )}`,
                    )
                    .join(", ")
                : ""
            }
          />
        </div>
        <div>
          <label htmlFor="custom-wild-shape-skills">Skills</label>
          <input
            type="text"
            placeholder="e.g. perception: +5, stealth: +3"
            name="custom-wild-shape-skills"
            id="custom-wild-shape-skills"
            defaultValue={editingWildShape?.skill_bonuses ?? ""}
          />
        </div>
      </div>
      <div>
        <label htmlFor="custom-wild-shape-traits">Traits Description</label>
        <textarea
          name="custom-wild-shape-traits"
          id="custom-wild-shape-traits"
          aria-describedby="custom-wild-shape-traits-help"
          defaultValue={editingWildShape?.traits ?? ""}
        />
        <p id="custom-wild-shape-traits-help" className="field-help">
          Use <code>**text**</code> for bold, <code>*text*</code> for italic,
          and a blank line between paragraphs.
        </p>
      </div>
      <div>
        <label htmlFor="custom-wild-shape-actions">Actions Description</label>
        <textarea
          name="custom-wild-shape-actions"
          id="custom-wild-shape-actions"
          aria-describedby="custom-wild-shape-actions-help"
          defaultValue={editingWildShape?.actions ?? ""}
        />
        <p id="custom-wild-shape-actions-help" className="field-help">
          Use <code>**text**</code> for bold, <code>*text*</code> for italic,
          and a blank line between paragraphs.
        </p>
      </div>
      <div>
        <div className="checkbox-wrapper">
          <input
            type="checkbox"
            name="custom-wild-shape-shared"
            id="custom-wild-shape-shared"
            aria-describedby="custom-wild-shape-shared-help"
            defaultChecked={editingWildShape?.isShared ?? false}
          />
          <label htmlFor="custom-wild-shape-shared">Share with everyone</label>
        </div>
        <p id="custom-wild-shape-shared-help" className="field-help">
          All users will be able to see this wild shape and save it for their
          characters. Only you can edit or delete it.
        </p>
      </div>
      <div className="button-wrapper">
        <button type="submit">Save wild shape</button>
        {editingWildShape && (
          <button type="button" onClick={handleDelete}>
            Delete
          </button>
        )}
        <button type="button" onClick={closeDialog}>
          Cancel
        </button>
      </div>
    </form>
  );
}
