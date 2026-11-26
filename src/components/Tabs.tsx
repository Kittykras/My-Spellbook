import type { Dispatch, SetStateAction } from "react";
import type { Character } from "../types/character";

export default function Tabs({
  activeTab,
  setActiveTab,
  activeCharacter,
}: {
  activeTab: string;
  setActiveTab: Dispatch<SetStateAction<string>>;
  activeCharacter: Character | undefined;
}) {
  return (
    <section className="tabs">
      <button
        onClick={() => setActiveTab("All spells")}
        className={`tab-btn ${activeTab == "All spells" ? "active" : ""}`}
      >
        All spells
      </button>
      <button
        onClick={() => setActiveTab("My spellbook")}
        className={`tab-btn ${activeTab == "My spellbook" ? "active" : ""}`}
      >
        My spellbook
      </button>
      {activeCharacter && activeCharacter.classes.includes("Druid") && (
        <>
          <button
            onClick={() => setActiveTab("Wild Shapes")}
            className={`tab-btn ${activeTab == "Wild Shapes" ? "active" : ""}`}
          >
            Wild Shapes
          </button>
          <button
            onClick={() => setActiveTab("My Wild Shapes")}
            className={`tab-btn ${activeTab === "My Wild Shapes" ? "active" : ""}`}
          >
            My Wild Shapes
          </button>
        </>
      )}
    </section>
  );
}
