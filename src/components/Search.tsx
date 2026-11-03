import type { Dispatch, SetStateAction } from "react";

type SearchProps = {
  spellLevels: number[];
  setSearchtext: Dispatch<SetStateAction<string>>;
  setSelectedLevel: Dispatch<SetStateAction<string>>;
};

export default function Search({
  spellLevels,
  setSearchtext,
  setSelectedLevel,
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
          onChange={(event) => setSearchtext(event.target.value)}
        />
      </div>
      <div className="spell-level">
        <label htmlFor="spell-level">Spell level</label>
        <select
          id="spell-level"
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
    </section>
  );
}
