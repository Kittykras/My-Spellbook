import { useState, useEffect, useRef } from "react";
import { getSpellsFromAPI, getSpellDetailsFromAPI } from "./api/request";
import type {
  Spell,
  SpellDetails,
  CustomSpellInput,
  CustomSpell,
  ApiSpellItem,
} from "./types/spell";
import Header from "./components/Header";
import Search from "./components/Search";
import SpellList from "./components/SpellList";
import Tabs from "./components/Tabs";
import "./App.css";

function App() {
  const [spells, setSpells] = useState<Spell[]>([]);
  const [spellDetails, setSpellDetails] = useState<SpellDetails>();
  const [searchtext, setSearchtext] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [activeTab, setActiveTab] = useState("All spells");
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState("");
  const [isLoadingSpells, setIsLoadingSpells] = useState(true);
  const [spellsError, setSpellsError] = useState("");
  const [sortBy, setSortBy] = useState("relevance");
  const [sortDirection, setSortDirection] = useState("asc");
  const [customSpells, setCustomSpells] = useState<CustomSpell[]>(() => {
    const savedSpells = localStorage.getItem("spellbook-custom-spells");

    return savedSpells ? JSON.parse(savedSpells) : [];
  });
  const latestDetailsRequest = useRef(0);

  const spellLevels = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  const allSpells: Spell[] = [...spells, ...customSpells];

  const savedFavorites: string[] = JSON.parse(
    localStorage.getItem("spellbook-favorites") ?? "[]",
  );

  function getRelevance(name: string): number {
    const spellName = name.toLowerCase();
    const search = searchtext.toLowerCase();

    if (spellName === search) {
      return 0; // Præcist match
    }

    if (spellName.startsWith(search)) {
      return 1; // Navnet starter med søgningen
    }

    return 2; // Søgningen findes et andet sted i navnet
  }

  const filteredSpells = allSpells
    .filter((spell) => {
      const matchesSearch = spell.name
        .toLowerCase()
        .includes(searchtext.toLowerCase());

      const matchesLevel =
        selectedLevel === "all" || spell.level === Number(selectedLevel);

      return matchesSearch && matchesLevel;
    })
    .sort((a, b) => {
      let finalSort;
      const direction = sortDirection === "asc" ? 1 : -1;
      if (sortBy === "name") {
        finalSort = a.name.localeCompare(b.name) * direction;
      } else if (sortBy === "level") {
        finalSort = (a.level - b.level) * direction;
      } else if (sortBy === "favorite") {
        const favoriteDifference = Number(b.isFavorite) - Number(a.isFavorite);

        if (favoriteDifference !== 0) {
          return favoriteDifference * direction;
        }

        const relevanceDifference = getRelevance(a.name) - getRelevance(b.name);

        finalSort =
          relevanceDifference !== 0 ? relevanceDifference : a.level - b.level;
      } else {
        const relevanceDifference = getRelevance(a.name) - getRelevance(b.name);

        finalSort =
          relevanceDifference !== 0 ? relevanceDifference : a.level - b.level;
      }
      return finalSort;
    });

  const favoriteSpells = filteredSpells.filter((spell) => spell.isFavorite);
  const hasFavorites = spells.some((spell) => spell.isFavorite);

  async function getSpells() {
    setIsLoadingSpells(true);
    setSpellsError("");

    try {
      const result = await getSpellsFromAPI();
      const spellsWithFavorites: ApiSpellItem[] = result.map((spell) => ({
        ...spell,
        isCustom: false,
        isFavorite: savedFavorites.includes(spell.index) ? true : false,
      }));
      setSpells(spellsWithFavorites);
    } catch (error) {
      console.error("Failed to load spells:", error);
      setSpellsError("Could not load spells. Please try again later.");
    } finally {
      setIsLoadingSpells(false);
    }
  }

  async function getSpellDetails(index: string) {
    const requestId = ++latestDetailsRequest.current;

    setIsLoadingDetails(true);
    setDetailsError("");

    try {
      const result = await getSpellDetailsFromAPI(index);
      if (requestId === latestDetailsRequest.current) {
        setSpellDetails(result);
      }
    } catch (error) {
      if (requestId === latestDetailsRequest.current) {
        console.error("Failed to load spell details:", error);
        setDetailsError("Could not load spell details. Please try again.");
      }
    } finally {
      if (requestId === latestDetailsRequest.current) {
        setIsLoadingDetails(false);
      }
    }
  }

  useEffect(() => {
    getSpells().catch((error: unknown) => {
      console.error("Failed to load spells:", error);
    });
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "spellbook-custom-spells",
      JSON.stringify(customSpells),
    );
  }, [customSpells]);

  function toggleFavorite(index: string) {
    if (customSpells.some((spell) => spell.index === index)) {
      setCustomSpells((previousSpells) =>
        previousSpells.map((spell) =>
          spell.index === index
            ? { ...spell, isFavorite: !spell.isFavorite }
            : spell,
        ),
      );

      return;
    }
    const updatedSpells = spells.map((spell) =>
      spell.index === index
        ? { ...spell, isFavorite: !spell.isFavorite }
        : spell,
    );
    setSpells(updatedSpells);
    const favoriteIds = updatedSpells
      .filter((spell) => spell.isFavorite)
      .map((spell) => spell.index);

    localStorage.setItem("spellbook-favorites", JSON.stringify(favoriteIds));
  }

  function handleSort(column: "name" | "level" | "favorite" | "relevance") {
    if (sortBy === column) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else {
        setSortDirection("asc");
      }
    } else {
      setSortBy(column);
      setSortDirection("asc");
    }
  }

  function addCustomSpell(input: CustomSpellInput) {
    const customSpellObj: CustomSpell = {
      ...input,
      index: `custom-${crypto.randomUUID()}`,
      isCustom: true,
      isFavorite: false,
    };
    setCustomSpells((prevCustomSpells) => [
      ...prevCustomSpells,
      customSpellObj,
    ]);
  }

  function updateCustomSpell(index: string, input: CustomSpellInput) {
    setCustomSpells((previousSpells) =>
      previousSpells.map((spell) =>
        spell.index === index ? { ...spell, ...input } : spell,
      ),
    );
  }

  return (
    <>
      <Header />
      <main>
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
        <Search
          spellLevels={spellLevels}
          setSearchtext={setSearchtext}
          setSelectedLevel={setSelectedLevel}
        />
        {activeTab === "All spells" ? (
          <SpellList
            spellDetails={spellDetails}
            getSpellDetails={getSpellDetails}
            isLoadingDetails={isLoadingDetails}
            detailsError={detailsError}
            isLoadingSpells={isLoadingSpells}
            spellsError={spellsError}
            filteredSpells={filteredSpells}
            toggleFavorite={toggleFavorite}
            handleSort={handleSort}
            sortBy={sortBy}
            sortDirection={sortDirection}
            spellLevels={spellLevels}
            onSaveSpell={addCustomSpell}
            onEditSpell={updateCustomSpell}
          />
        ) : isLoadingSpells || spellsError || favoriteSpells.length > 0 ? (
          <SpellList
            spellDetails={spellDetails}
            getSpellDetails={getSpellDetails}
            isLoadingDetails={isLoadingDetails}
            detailsError={detailsError}
            isLoadingSpells={isLoadingSpells}
            spellsError={spellsError}
            filteredSpells={favoriteSpells}
            toggleFavorite={toggleFavorite}
            handleSort={handleSort}
            sortBy={sortBy}
            sortDirection={sortDirection}
            spellLevels={spellLevels}
            onSaveSpell={addCustomSpell}
            onEditSpell={updateCustomSpell}
          />
        ) : hasFavorites ? (
          <p className="empty-spellbook">
            You have favorites, but none match your search or filters.
          </p>
        ) : (
          <p className="empty-spellbook">
            Your spellbook is empty. Add spells using the stars in All spells.
          </p>
        )}
      </main>
    </>
  );
}

export default App;
