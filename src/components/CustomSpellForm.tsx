import { useState, type SubmitEvent } from "react";
import type { CustomSpell, CustomSpellInput } from "../types/spell";

export default function CustomSpellForm({
  spellLevels,
  closeDialog,
  onSaveSpell,
  onEditSpell,
  editingSpell,
}: {
  spellLevels: number[];
  closeDialog: () => void;
  onSaveSpell: (spell: CustomSpellInput) => void;
  onEditSpell: (index: string, input: CustomSpellInput) => void;
  editingSpell: CustomSpell | null;
}) {
  const [classesOpen, setClassesOpen] = useState(false);
  const [hasMaterialComponent, setHasMaterialComponent] = useState(
    editingSpell?.components.includes("M") ?? false,
  );
  const [selectedClasses, setSelectedClasses] = useState<string[]>(
    editingSpell?.classes ?? [],
  );

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const formEl = event.currentTarget;
    const formData = new FormData(formEl);
    const name = String(formData.get("custom-spell-name") ?? "").trim();
    const level = Number(formData.get("custom-spell-level"));
    const desc = String(formData.get("custom-spell-desc") ?? "").trim();
    const school = String(formData.get("custom-spell-school") ?? "").trim();
    const casting_time = String(
      formData.get("custom-spell-casting-time") ?? "",
    ).trim();
    const range = String(formData.get("custom-spell-range") ?? "").trim();
    const duration = String(formData.get("custom-spell-duration") ?? "").trim();
    const components = formData.getAll("custom-spell-components").map(String);
    const material = String(
      formData.get("custom-spell-components-desc") ?? "",
    ).trim();
    const concentration = formData.has("custom-spell-concentration");
    const ritual = formData.has("custom-spell-ritual");
    const classes = formData.getAll("custom-spell-classes").map(String);
    const higher_level = String(
      formData.get("custom-spell-higher-levels") ?? "",
    ).trim();
    const input: CustomSpellInput = {
      name,
      level,
      description: desc,
      school,
      casting_time,
      range,
      duration,
      components,
      material,
      concentration,
      ritual,
      classes,
      higher_level,
    };
    if (editingSpell) {
      onEditSpell(editingSpell.index, input);
      closeDialog();
    } else {
      onSaveSpell(input);
    }
    formEl.reset();
    setHasMaterialComponent(false);
    setClassesOpen(false);
    setSelectedClasses([]);
  }

  const spellSchools = [
    "Abjuration",
    "Conjuration",
    "Divination",
    "Enchantment",
    "Evocation",
    "Illusion",
    "Necromancy",
    "Transmutation",
  ];

  const spellClasses = [
    "Artificer",
    "Bard",
    "Cleric",
    "Druid",
    "Paladin",
    "Ranger",
    "Sorcerer",
    "Warlock",
    "Wizard",
  ];

  function handleClassChange(spellClass: string, checked: boolean) {
    setSelectedClasses((previousClasses) =>
      checked
        ? [...previousClasses, spellClass]
        : previousClasses.filter((name) => name !== spellClass),
    );
  }

  return (
    <form className="custom-spell-form" onSubmit={handleSubmit}>
      <div className="input-wrapper">
        <div>
          <label htmlFor="custom-spell-name">
            Spell name <span>*</span>
          </label>
          <input
            required
            type="text"
            placeholder="Enter spell name"
            name="custom-spell-name"
            id="custom-spell-name"
            defaultValue={editingSpell?.name ?? ""}
          />
        </div>
        <div>
          <label htmlFor="custom-spell-level">
            Spell level <span>*</span>
          </label>
          <select
            id="custom-spell-level"
            name="custom-spell-level"
            defaultValue={editingSpell?.level ?? ""}
          >
            {spellLevels.map((level) => (
              <option key={level} value={level}>
                {level === 0 ? "Cantrip" : `Level ${level}`}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="custom-spell-school">
            Spell school <span>*</span>
          </label>
          <select
            id="custom-spell-school"
            name="custom-spell-school"
            defaultValue={editingSpell?.school ?? ""}
          >
            {spellSchools.map((school) => (
              <option key={school} value={school}>
                {school}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="custom-spell-casting-time">
            Casting Time <span>*</span>
          </label>
          <input
            required
            type="text"
            placeholder="#"
            name="custom-spell-casting-time"
            id="custom-spell-casting-time"
            defaultValue={editingSpell?.casting_time ?? ""}
          />
        </div>
        <div>
          <label htmlFor="custom-spell-range">
            Range <span>*</span>
          </label>
          <input
            required
            type="text"
            placeholder="Enter distance"
            name="custom-spell-range"
            id="custom-spell-range"
            defaultValue={editingSpell?.range ?? ""}
          />
        </div>
        <div>
          <label htmlFor="custom-spell-duration">
            Duration <span>*</span>
          </label>
          <input
            required
            type="text"
            placeholder="#"
            name="custom-spell-duration"
            id="custom-spell-duration"
            defaultValue={editingSpell?.duration ?? ""}
          />
        </div>
        <fieldset>
          <legend>Components</legend>
          <div
            className="checkbox-group"
            role="group"
            aria-label="Add Verbal, Somatic, or Material components requirements to your spell."
          >
            <input
              type="checkbox"
              name="custom-spell-components"
              id="custom-spell-components-v"
              value="V"
              defaultChecked={editingSpell?.components.includes("V") ?? false}
            />
            <label htmlFor="custom-spell-components-v">V</label>
            <input
              type="checkbox"
              name="custom-spell-components"
              id="custom-spell-components-s"
              value="S"
              defaultChecked={editingSpell?.components.includes("S") ?? false}
            />
            <label htmlFor="custom-spell-components-s">S</label>
            <input
              type="checkbox"
              name="custom-spell-components"
              id="custom-spell-components-m"
              value="M"
              defaultChecked={editingSpell?.components.includes("M") ?? false}
              onChange={(event) =>
                setHasMaterialComponent(event.currentTarget.checked)
              }
            />
            <label htmlFor="custom-spell-components-m">M</label>
          </div>
        </fieldset>
        <div>
          <label htmlFor="custom-spell-components-desc">
            Material Components Description
          </label>
          <input
            disabled={!hasMaterialComponent}
            type="text"
            placeholder="Enter the material components description"
            name="custom-spell-components-desc"
            id="custom-spell-components-desc"
            defaultValue={editingSpell?.material ?? ""}
          />
        </div>
        <div className="checkbox-wrapper">
          <input
            type="checkbox"
            name="custom-spell-concentration"
            id="custom-spell-concentration"
            defaultChecked={editingSpell?.concentration}
          />
          <label htmlFor="custom-spell-concentration">Concentration</label>
        </div>
        <div className="checkbox-wrapper">
          <input
            type="checkbox"
            name="custom-spell-ritual"
            id="custom-spell-ritual"
            defaultChecked={editingSpell?.ritual}
          />
          <label htmlFor="custom-spell-ritual">Ritual</label>
        </div>
      </div>
      <fieldset>
        <legend>Available for Class(es)</legend>
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
                name="custom-spell-classes"
                id={`custom-spell-${spellClass}`}
                value={spellClass}
                checked={selectedClasses.includes(spellClass)}
                onChange={(event) =>
                  handleClassChange(spellClass, event.currentTarget.checked)
                }
              />
              <label htmlFor={`custom-spell-${spellClass}`}>{spellClass}</label>
            </li>
          ))}
        </ul>
      </fieldset>
      <div>
        <label htmlFor="custom-spell-desc">
          Description <span>*</span>
        </label>
        <textarea
          required
          id="custom-spell-desc"
          name="custom-spell-desc"
          defaultValue={editingSpell?.description ?? ""}
        ></textarea>
      </div>
      <div>
        <label htmlFor="custom-spell-higher-levels">At higher levels</label>
        <textarea
          className="higher-lvls-textarea"
          id="custom-spell-higher-levels"
          name="custom-spell-higher-levels"
          defaultValue={editingSpell?.higher_level ?? ""}
        ></textarea>
      </div>
      <div className="button-wrapper">
        <button type="submit">Save spell</button>
        {editingSpell && <button type="button">Delete spell</button>}
        <button type="button" onClick={closeDialog}>
          Cancel
        </button>
      </div>
    </form>
  );
}
