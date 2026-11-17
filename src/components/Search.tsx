import type { Dispatch, SetStateAction } from "react";

type SearchProps = {
  spellLevels: number[];
  spellClasses: string[];
  setSearchtext: Dispatch<SetStateAction<string>>;
  setSelectedLevel: Dispatch<SetStateAction<string>>;
  setSelectedClass: (classIndex: string) => void;
  searchtext: string;
  selectedLevel: string;
  selectedClass: string;
};

export default function Search({
  spellLevels,
  spellClasses,
  setSearchtext,
  setSelectedLevel,
  setSelectedClass, 
  searchtext, 
  selectedLevel,
  selectedClass
}: SearchProps) {
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
      <div className="spell-class">
        <label htmlFor="spell-class">Class</label>
        <select
          id="spell-class"
          value={selectedClass}
          onChange={(event) => setSelectedClass(event.target.value)}
        >
          <option value="all">All classes</option>
          {spellClasses.map((spellclass) => (
            <option key={spellclass} value={spellclass.toLowerCase()}>
              {spellclass}
            </option>
          ))}
        </select>
      </div>
    </section>
  );
}
