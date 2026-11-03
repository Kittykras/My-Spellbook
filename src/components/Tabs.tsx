import type { Dispatch, SetStateAction } from "react";

export default function Tabs({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: Dispatch<SetStateAction<string>>;
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
    </section>
  );
}
