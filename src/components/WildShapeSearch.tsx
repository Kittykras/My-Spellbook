import type { Dispatch, SetStateAction } from "react";
import { formatChallengeRating } from "../utils/formats";

type SearchProps = {
  challengeRatings: number[];
  setSearchtext: Dispatch<SetStateAction<string>>;
  setSelectedMaxCR: Dispatch<SetStateAction<string>>;
  searchtext: string;
  selectedMaxCR: string;
};

export default function WildShapeSearch({
  challengeRatings,
  setSearchtext,
  setSelectedMaxCR,
  searchtext,
  selectedMaxCR,
}: SearchProps) {
  return (
    <section className="filter-spells">
      <div className="spell-search">
        <label htmlFor="spell-search">Search Wild Shapes</label>
        <input
          type="search"
          placeholder="Search by wild shape name..."
          name="spell-search"
          id="spell-search"
          value={searchtext}
          onChange={(event) => setSearchtext(event.target.value)}
        />
      </div>
      <div className="spell-level">
        <label htmlFor="spell-level">Max CR</label>
        <select
          id="spell-level"
          value={selectedMaxCR}
          onChange={(event) => setSelectedMaxCR(event.target.value)}
        >
          <option value="all">All CRs</option>
          {challengeRatings.map((cr) => (
            <option key={cr} value={cr}>
              CR {formatChallengeRating(cr)}
            </option>
          ))}
        </select>
      </div>
    </section>
  );
}
