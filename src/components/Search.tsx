import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";

type SearchProps = {
  spellLevels: number[];
  spellClasses: string[];
  setSearchtext: Dispatch<SetStateAction<string>>;
  setSelectedLevel: Dispatch<SetStateAction<string>>;
  setSelectedClasses: (classIndex: string[]) => void;
  searchtext: string;
  selectedLevel: string;
  selectedClasses: string[];
};

export default function Search({
  spellLevels,
  spellClasses,
  setSearchtext,
  setSelectedLevel,
  setSelectedClasses,
  searchtext,
  selectedLevel,
  selectedClasses,
}: SearchProps) {
  const [classesOpen, setClassesOpen] = useState(false);
  const classesRef = useRef<HTMLFieldSetElement>(null);

  useEffect(() => {
    if (!classesOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        classesRef.current &&
        !classesRef.current.contains(event.target)
      ) {
        setClassesOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [classesOpen]);

  function handleClassChange(spellClass: string, checked: boolean) {
    setSelectedClasses(
      checked
        ? [...selectedClasses, spellClass]
        : selectedClasses.filter((name) => name !== spellClass),
    );
  }

  return (
    <section className="filter-spells">
      <div className="spell-search">
        <label htmlFor="spell-search">Search spells</label>
        <input
          type="search"
          placeholder="Search by spell name..."
          name="spell-search"
          id="spell-search"
          value={searchtext}
          onChange={(event) => setSearchtext(event.target.value)}
        />
      </div>
      <div className="spell-level">
        <label htmlFor="spell-level">Spell level</label>
        <select
          id="spell-level"
          value={selectedLevel}
          onChange={(event) => setSelectedLevel(event.target.value)}
        >
          <option value="all">All levels</option>
          {spellLevels.map((level) => (
            <option key={level} value={level}>
              {level === 0 ? "Cantrip" : `Level ${level}`}
            </option>
          ))}
        </select>
      </div>
      <fieldset className="spell-class" ref={classesRef}>
        <legend>Class(es)</legend>
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
                name="filter-spell-classes"
                id={`filter-spell-${spellClass}`}
                value={spellClass}
                checked={selectedClasses.includes(spellClass)}
                onChange={(event) =>
                  handleClassChange(spellClass, event.target.checked)
                }
              />
              <label htmlFor={`filter-spell-${spellClass}`}>{spellClass}</label>
            </li>
          ))}
        </ul>
      </fieldset>
    </section>
  );
}
