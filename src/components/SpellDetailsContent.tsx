import type { SpellDetailsView } from "../types/spell";

export default function SpellDetailsContent({
  spellDetails,
}: {
  spellDetails: SpellDetailsView;
}) {
  return (
    <>
      <p className="spell-school">
        {spellDetails.school} ·{" "}
        {spellDetails.classes.join(", ")}
      </p>
      <div className="spell-info">
        <div>
          <p className="label">CASTING TIME</p>
          <p className="value">{spellDetails.casting_time.toLowerCase()}</p>
        </div>
        <div>
          <p className="label">RANGE</p>
          <p className="value">{spellDetails.range}</p>
        </div>
        <div>
          <p className="label">DURATION</p>
          <p className="value">{spellDetails.duration}</p>
        </div>
        <div>
          <p className="label">COMPONENTS</p>
          <p className="value">{spellDetails.components.join(", ")} {spellDetails.components.includes("M") ? "*" : ""}</p>
        </div>
      </div>
      <p className="spell-tags">
        Concentration: {spellDetails.concentration ? "Yes" : "No"}
        &nbsp;&nbsp;&nbsp;·&nbsp;&nbsp;&nbsp; Ritual:{" "}
        {spellDetails.ritual ? "Yes" : "No"}
      </p>
      <p className="spell-desc">{spellDetails?.description}</p>
      {spellDetails.higher_level && (
        <>
          <h3 className="higher-lvl-title">At higher levels</h3>
          <p className="higher-lvl-desc">{spellDetails.higher_level}</p>
        </>
      )}
      {spellDetails.material && (
        <p className="spell-material">* - ({spellDetails.material})</p>
      )}
    </>
  );
}
