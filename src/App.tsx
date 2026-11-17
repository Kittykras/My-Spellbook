import { useState, useEffect, useRef, useCallback } from "react";
import {
  getSpellsFromAPI,
  getSpellDetailsFromAPI,
  getSpellsByClassFromAPI,
} from "./api/request";
import type {
  Spell,
  SpellDetails,
  CustomSpellInput,
  CustomSpell,
  ApiSpellItem,
  Character,
} from "./types/spell";
import Header from "./components/Header";
import Search from "./components/Search";
import SpellList from "./components/SpellList";
import Tabs from "./components/Tabs";
import "./App.css";
import CharacterSelect from "./components/CharacterSelect";

function App() {
  const [spells, setSpells] = useState<Spell[]>([]);
  const [classSpellIds, setClassSpellIds] = useState<string[]>([]);
  const [spellDetails, setSpellDetails] = useState<SpellDetails>();
  const [searchtext, setSearchtext] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedClass, setSelectedClass] = useState("all");
  const [activeTab, setActiveTab] = useState("All spells");
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState("");
  const [isLoadingSpells, setIsLoadingSpells] = useState(true);
  const [spellsError, setSpellsError] = useState("");
  const [isLoadingSpellsByClass, setIsLoadingSpellsByClass] = useState(false);
  const [spellsByClassError, setSpellsByClassError] = useState("");
  const [spellsByClassNotice, setSpellsByClassNotice] = useState("");
  const [sortBy, setSortBy] = useState("relevance");
  const [sortDirection, setSortDirection] = useState("asc");
  const [customSpells, setCustomSpells] = useState<CustomSpell[]>(() => {
    const savedSpells = localStorage.getItem("spellbook-custom-spells");

    return savedSpells ? JSON.parse(savedSpells) : [];
  });
  const [characters, setCharacters] = useState<Character[]>(() => {
    const savedCharacters = localStorage.getItem("spellbook-characters");

    if (savedCharacters) {
      return JSON.parse(savedCharacters);
    }

    const savedFavoriteIds: string[] = JSON.parse(
      localStorage.getItem("spellbook-favorites") ?? "[]",
    );

    const customFavoriteIds = customSpells
      .filter((spell) => spell.isFavorite)
      .map((spell) => spell.index);

    return [
      {
        id: "clara",
        name: "Clara",
        favoriteSpellIds: [
          ...new Set([...savedFavoriteIds, ...customFavoriteIds]),
        ],
      },
    ];
  });
  const [activeCharacterId, setActiveCharacterId] = useState(
    characters[0]?.id ?? "",
  );
  const [spellDetailsByIndex, setSpellDetailsByIndex] = useState<
    Record<string, SpellDetails>
  >({});
  const [detailsLoadingByIndex, setDetailsLoadingByIndex] = useState<
    Record<string, boolean>
  >({});

  const [detailsErrorByIndex, setDetailsErrorByIndex] = useState<
    Record<string, string>
  >({});
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [paperSize, setPaperSize] = useState<"a4" | "a5">("a4");
  const latestDetailsRequest = useRef(0);
  const latestClassSpellsRequest = useRef(0);
  const requestedSpellDetails = useRef(new Set<string>());

  const activeCharacter = characters.find(
    (character) => character.id === activeCharacterId,
  );

  const spellLevels = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

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

  const classAbbreviations: Record<string, string> = {
    Artificer: "Art",
    Bard: "Brd",
    Cleric: "Clr",
    Druid: "Drd",
    Paladin: "Pal",
    Ranger: "Rgr",
    Sorcerer: "Sor",
    Warlock: "Wlk",
    Wizard: "Wiz",
  };

  const allSpells: Spell[] = [...spells, ...customSpells].map((spell) => ({
    ...spell,
    isFavorite:
      activeCharacter?.favoriteSpellIds.includes(spell.index) ?? false,
  }));

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

      const matchesClass =
        selectedClass === "all" ||
        classSpellIds.includes(spell.index) ||
        (spell.isCustom &&
          spell.classes.some((name) => name.toLowerCase() === selectedClass));

      return matchesSearch && matchesLevel && matchesClass;
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
  const hasFavorites = allSpells.some((spell) => spell.isFavorite);
  const favoriteCount = allSpells.filter((spell) => spell.isFavorite).length;

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

  const loadSpellDetails = useCallback(async (index: string) => {
    if (requestedSpellDetails.current.has(index)) return;

    requestedSpellDetails.current.add(index);

    setDetailsLoadingByIndex((previous) => ({
      ...previous,
      [index]: true,
    }));

    setDetailsErrorByIndex((previous) => ({
      ...previous,
      [index]: "",
    }));

    try {
      const result = await getSpellDetailsFromAPI(index);

      setSpellDetailsByIndex((previous) => ({
        ...previous,
        [index]: result,
      }));
    } catch (error) {
      requestedSpellDetails.current.delete(index);

      console.error("Failed to load spell details:", error);

      setDetailsErrorByIndex((previous) => ({
        ...previous,
        [index]: "Could not load spell details. Please try again.",
      }));
    } finally {
      setDetailsLoadingByIndex((previous) => ({
        ...previous,
        [index]: false,
      }));
    }
  }, []);

  async function getSpellsByClass(classIndex: string) {
    const requestId = ++latestClassSpellsRequest.current;
    setIsLoadingSpellsByClass(true);
    setSpellsByClassError("");
    setSpellsByClassNotice("");

    try {
      const result = await getSpellsByClassFromAPI(classIndex);

      if (requestId !== latestClassSpellsRequest.current) return;

      if (result === null) {
        setClassSpellIds([]);
        setSpellsByClassNotice(
          "This class isn’t available in the spell database. You can still add your own spells.",
        );
        return;
      }

      setClassSpellIds(result.map((spell) => spell.index));
    } catch (error) {
      if (requestId === latestClassSpellsRequest.current) {
        console.error("Failed to load spells:", error);
        setSpellsByClassError(
          "Could not load spells for this class. Please try again.",
        );
      }
    } finally {
      if (requestId === latestClassSpellsRequest.current) {
        setIsLoadingSpellsByClass(false);
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

  useEffect(() => {
    localStorage.setItem("spellbook-characters", JSON.stringify(characters));
  }, [characters]);

  function toggleFavorite(index: string) {
    setCharacters((previousCharacters) =>
      previousCharacters.map((character) => {
        if (character.id !== activeCharacterId) return character;

        const isFavorite = character.favoriteSpellIds.includes(index);

        return {
          ...character,
          favoriteSpellIds: isFavorite
            ? character.favoriteSpellIds.filter((id) => id !== index)
            : [...character.favoriteSpellIds, index],
        };
      }),
    );
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

  function deleteCustomSpell(index: string) {
    setCustomSpells((previousSpells) =>
      previousSpells.filter((spell) => spell.index !== index),
    );
  }

  function handleClassChange(classIndex: string) {
    setSelectedClass(classIndex);
    setClassSpellIds([]);

    if (classIndex === "all") {
      latestClassSpellsRequest.current++;
      setIsLoadingSpellsByClass(false);
      setSpellsByClassError("");
      setSpellsByClassNotice("");
    } else {
      void getSpellsByClass(classIndex);
    }
  }

  function clearSearchAndFilters() {
    setSearchtext("");
    setSelectedLevel("all");
    handleClassChange("all");
  }

  function addCharacter(name: string) {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const newCharacter: Character = {
      id: crypto.randomUUID(),
      name: trimmedName,
      favoriteSpellIds: [],
    };

    setCharacters((previousCharacters) => [
      ...previousCharacters,
      newCharacter,
    ]);
    setActiveCharacterId(newCharacter.id);
  }

  function renameCharacter(id: string, name: string) {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    setCharacters((previousCharacters) =>
      previousCharacters.map((character) =>
        character.id === id ? { ...character, name: trimmedName } : character,
      ),
    );
  }

  function deleteCharacter(id: string) {
    const remainingCharacters = characters.filter(
      (character) => character.id !== id,
    );

    setCharacters(remainingCharacters);

    if (activeCharacterId === id) {
      setActiveCharacterId(remainingCharacters[0]?.id ?? "");
    }
  }

  return (
    <>
      <Header />
      <main>
        <CharacterSelect
          activeCharacterId={activeCharacterId}
          activeCharacter={activeCharacter}
          setActiveCharacterId={setActiveCharacterId}
          characters={characters}
          onAddCharacter={addCharacter}
          onRenameCharacter={renameCharacter}
          onDeleteCharacter={deleteCharacter}
        />
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
        <Search
          spellLevels={spellLevels}
          spellClasses={spellClasses}
          setSearchtext={setSearchtext}
          setSelectedLevel={setSelectedLevel}
          setSelectedClass={handleClassChange}
          searchtext={searchtext}
          selectedLevel={selectedLevel}
          selectedClass={selectedClass}
        />
        {activeTab === "All spells" ? (
          <SpellList
            headline="Explore spells"
            description="Your spells, all in one place"
            spellDetails={spellDetails}
            getSpellDetails={getSpellDetails}
            isLoadingDetails={isLoadingDetails}
            detailsError={detailsError}
            loadSpellDetails={loadSpellDetails}
            spellDetailsByIndex={spellDetailsByIndex}
            detailsLoadingByIndex={detailsLoadingByIndex}
            detailsErrorByIndex={detailsErrorByIndex}
            isLoadingSpells={isLoadingSpells}
            spellsError={spellsError}
            isLoadingSpellsByClass={isLoadingSpellsByClass}
            spellsByClassError={spellsByClassError}
            spellsByClassNotice={spellsByClassNotice}
            selectedClass={selectedClass}
            filteredSpells={filteredSpells}
            toggleFavorite={toggleFavorite}
            handleSort={handleSort}
            sortBy={sortBy}
            sortDirection={sortDirection}
            spellLevels={spellLevels}
            spellClasses={spellClasses}
            onSaveSpell={addCustomSpell}
            onEditSpell={updateCustomSpell}
            onDeleteSpell={deleteCustomSpell}
            hasActiveCharacter={Boolean(activeCharacter)}
            isSpellbook={false}
            classAbbreviations={classAbbreviations}
            showPrintPreview={false}
            setShowPrintPreview={setShowPrintPreview}
            paperSize={paperSize}
            setPaperSize={setPaperSize}
          />
        ) : characters.length === 0 ? (
          <p className="empty-spellbook">
            Create a character to start your spellbook.
          </p>
        ) : isLoadingSpells ||
          spellsError ||
          (selectedClass !== "all" &&
            (isLoadingSpellsByClass || spellsByClassError)) ||
          favoriteSpells.length > 0 ? (
          <SpellList
            headline={`${activeCharacter?.name}’s spellbook`}
            description={`${favoriteCount} saved ${
              favoriteCount === 1 ? "spell" : "spells"
            } · Your magic, ready at a glance`}
            spellDetails={spellDetails}
            getSpellDetails={getSpellDetails}
            isLoadingDetails={isLoadingDetails}
            detailsError={detailsError}
            loadSpellDetails={loadSpellDetails}
            spellDetailsByIndex={spellDetailsByIndex}
            detailsLoadingByIndex={detailsLoadingByIndex}
            detailsErrorByIndex={detailsErrorByIndex}
            isLoadingSpells={isLoadingSpells}
            spellsError={spellsError}
            isLoadingSpellsByClass={isLoadingSpellsByClass}
            spellsByClassError={spellsByClassError}
            spellsByClassNotice=""
            selectedClass={selectedClass}
            filteredSpells={favoriteSpells}
            toggleFavorite={toggleFavorite}
            handleSort={handleSort}
            sortBy={sortBy}
            sortDirection={sortDirection}
            spellLevels={spellLevels}
            spellClasses={spellClasses}
            onSaveSpell={addCustomSpell}
            onEditSpell={updateCustomSpell}
            onDeleteSpell={deleteCustomSpell}
            hasActiveCharacter={Boolean(activeCharacter)}
            isSpellbook={true}
            classAbbreviations={classAbbreviations}
            showPrintPreview={showPrintPreview}
            setShowPrintPreview={setShowPrintPreview}
            paperSize={paperSize}
            setPaperSize={setPaperSize}
          />
        ) : hasFavorites ? (
          <p className="empty-spellbook">
            You have favorites, but none match your search or filters.
            <button className="small-btn" onClick={clearSearchAndFilters}>
              Clear search and filters
            </button>
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
