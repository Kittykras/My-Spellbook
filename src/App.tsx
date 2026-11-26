import { useState, useEffect, useRef, useCallback } from "react";
import {
  getSpellsFromAPI,
  getSpellDetailsFromAPI,
  getSpellsByClassFromAPI,
  getBeastsFromAPI,
} from "./api/request";
import type {
  Spell,
  SpellDetails,
  CustomSpellInput,
  CustomSpell,
  ApiSpellItem,
} from "./types/spell";
import type { Character } from "./types/character";
import Header from "./components/Header";
import Search from "./components/Search";
import SpellList from "./components/SpellList";
import Tabs from "./components/Tabs";
import "./App.css";
import CharacterSelect from "./components/CharacterSelect";
import WildShapeList from "./components/WildShapeList";
import type {
  ApiWildShape,
  CustomWildShape,
  CustomWildShapeInput,
  WildShapeSortColumn,
} from "./types/wildShape";
import WildShapeSearch from "./components/WildShapeSearch";

function App() {
  const [spells, setSpells] = useState<Spell[]>([]);
  const [classSpellIds, setClassSpellIds] = useState<string[]>([]);
  const [spellDetails, setSpellDetails] = useState<SpellDetails>();
  const [searchtext, setSearchtext] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("All spells");
  const [wildShapeSearchText, setWildShapeSearchText] = useState("");
  const [selectedMaxCR, setSelectedMaxCR] = useState("all");
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState("");
  const [isLoadingSpells, setIsLoadingSpells] = useState(true);
  const [spellsError, setSpellsError] = useState("");
  const [isLoadingSpellsByClass, setIsLoadingSpellsByClass] = useState(false);
  const [spellsByClassError, setSpellsByClassError] = useState("");
  const [spellsByClassNotice, setSpellsByClassNotice] = useState("");
  const [wildShapes, setWildShapes] = useState<ApiWildShape[]>([]);
  const [isLoadingWildShapes, setIsLoadingWildShapes] = useState(true);
  const [wildShapesError, setWildShapesError] = useState("");
  const [sortBy, setSortBy] = useState("relevance");
  const [sortDirection, setSortDirection] = useState("asc");
  const [wildShapeSortBy, setWildShapeSortBy] =
    useState<WildShapeSortColumn>("name");
  const [wildShapeSortDirection, setWildShapeSortDirection] = useState<
    "asc" | "desc"
  >("asc");
  const [customSpells, setCustomSpells] = useState<CustomSpell[]>(() => {
    const savedSpells = localStorage.getItem("spellbook-custom-spells");

    return savedSpells ? JSON.parse(savedSpells) : [];
  });
  const [customWildShapes, setCustomWildShapes] = useState<CustomWildShape[]>(
    () => {
      const savedWildShapes = localStorage.getItem(
        "spellbook-custom-wild-shapes",
      );

      return savedWildShapes ? JSON.parse(savedWildShapes) : [];
    },
  );
  const [characters, setCharacters] = useState<Character[]>(() => {
    const savedCharacters = localStorage.getItem("spellbook-characters");

    if (!savedCharacters) return [];

    const parsedCharacters: Character[] = JSON.parse(savedCharacters);

    return parsedCharacters.map((character) => ({
      ...character,
      classes: character.classes ?? [],
      favoriteSpellIds: character.favoriteSpellIds ?? [],
      favoriteWildShapeKeys: character.favoriteWildShapeKeys ?? [],
    }));
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
  const isDruid = activeCharacter?.classes.includes("Druid") ?? false;

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

  const allWildShapes = [...wildShapes, ...customWildShapes];

  const challengeRatings = [
    ...new Set(allWildShapes.map((wildShape) => wildShape.challenge_rating)),
  ].sort((a, b) => a - b);

  const creatureSizes = [
    "Tiny",
    "Small",
    "Medium",
    "Large",
    "Huge",
    "Gargantuan",
  ];

  const abilities = [
    { key: "strength", label: "STR" },
    { key: "dexterity", label: "DEX" },
    { key: "constitution", label: "CON" },
    { key: "intelligence", label: "INT" },
    { key: "wisdom", label: "WIS" },
    { key: "charisma", label: "CHA" },
  ] as const;

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
        selectedClasses.length === 0 ||
        (spell.isCustom
          ? spell.classes.some((name) =>
              selectedClasses.some(
                (selected) => selected.toLowerCase() === name.toLowerCase(),
              ),
            )
          : classSpellIds.includes(spell.index));

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

  const filteredWildShapes = allWildShapes
    .filter((wildShape) => {
      const matchesSearch = wildShape.name
        .toLowerCase()
        .includes(wildShapeSearchText.trim().toLowerCase());

      const matchesCR =
        selectedMaxCR === "all" ||
        wildShape.challenge_rating <= Number(selectedMaxCR);

      const matchesFavorites =
        activeTab !== "My Wild Shapes" ||
        (activeCharacter?.favoriteWildShapeKeys.includes(wildShape.key) ??
          false);

      return matchesSearch && matchesCR && matchesFavorites;
    })
    .sort((a, b) => {
      let comparison = 0;

      if (wildShapeSortBy === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (wildShapeSortBy === "cr") {
        comparison = a.challenge_rating - b.challenge_rating;
      } else {
        const aIsFavorite =
          activeCharacter?.favoriteWildShapeKeys.includes(a.key) ?? false;
        const bIsFavorite =
          activeCharacter?.favoriteWildShapeKeys.includes(b.key) ?? false;

        comparison = Number(aIsFavorite) - Number(bIsFavorite);
      }

      if (comparison === 0) {
        return a.name.localeCompare(b.name);
      }

      return wildShapeSortDirection === "asc" ? comparison : -comparison;
    });

  const favoriteSpells = filteredSpells.filter((spell) => spell.isFavorite);
  const hasFavorites = allSpells.some((spell) => spell.isFavorite);
  const favoriteCount = allSpells.filter((spell) => spell.isFavorite).length;
  const favoriteWildShapes = allWildShapes.filter((wildShape) =>
    activeCharacter?.favoriteWildShapeKeys.includes(wildShape.key),
  );
  const favoriteWildShapeCount = favoriteWildShapes.length;
  const isSpellbookTab = activeTab === "My spellbook";
  const isMyWildShapesTab = activeTab === "My Wild Shapes";
  const shouldShowSpellbookList =
    isLoadingSpells ||
    Boolean(spellsError) ||
    (selectedClasses.length > 0 &&
      (isLoadingSpellsByClass || Boolean(spellsByClassError))) ||
    favoriteSpells.length > 0;
  const hasFavoriteWildShapes = favoriteWildShapes.length > 0;
  const shouldShowMyWildShapesList =
    isLoadingWildShapes ||
    Boolean(wildShapesError) ||
    filteredWildShapes.length > 0;

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

  useEffect(() => {
    const requestId = ++latestClassSpellsRequest.current;

    setClassSpellIds([]);
    setSpellsByClassError("");
    setSpellsByClassNotice("");

    if (selectedClasses.length === 0) {
      setIsLoadingSpellsByClass(false);
      return;
    }

    setIsLoadingSpellsByClass(true);

    async function loadClasses() {
      try {
        const results = await Promise.all(
          selectedClasses.map(async (name) => ({
            name,
            spells: await getSpellsByClassFromAPI(name.toLowerCase()),
          })),
        );

        if (requestId !== latestClassSpellsRequest.current) return;

        const ids = results.flatMap(({ spells }) =>
          (spells ?? []).map((spell) => spell.index),
        );

        setClassSpellIds([...new Set(ids)]);

        const unavailable = results
          .filter(({ spells }) => spells === null)
          .map(({ name }) => name);

        if (unavailable.length > 0) {
          setSpellsByClassNotice(
            `Not available in the spell database: ${unavailable.join(", ")}. You can still add your own spells.`,
          );
        }
      } catch (error) {
        if (requestId !== latestClassSpellsRequest.current) return;

        console.error("Failed to load spells by class:", error);
        setSpellsByClassError(
          "Could not load spells for the selected classes. Please try again.",
        );
      } finally {
        if (requestId === latestClassSpellsRequest.current) {
          setIsLoadingSpellsByClass(false);
        }
      }
    }

    void loadClasses();

    return () => {
      latestClassSpellsRequest.current++;
    };
  }, [selectedClasses]);

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

  useEffect(() => {
    let cancelled = false;

    async function loadWildShapes() {
      try {
        const beasts = await getBeastsFromAPI();

        if (!cancelled) {
          setWildShapes(beasts);
        }
      } catch (error) {
        console.error("Failed to load wild shapes:", error);

        if (!cancelled) {
          setWildShapesError(
            "Could not load wild shapes. Please try again later.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingWildShapes(false);
        }
      }
    }

    void loadWildShapes();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "spellbook-custom-wild-shapes",
      JSON.stringify(customWildShapes),
    );
  }, [customWildShapes]);

  useEffect(() => {
    if (
      !isDruid &&
      (activeTab === "Wild Shapes" || activeTab === "My Wild Shapes")
    ) {
      setActiveTab("All spells");
    }
  }, [isDruid, activeTab]);

  useEffect(() => {
    setSelectedClasses(activeCharacter?.classes ?? []);
  }, [activeCharacter?.id, activeCharacter?.classes]);

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

  function toggleWildShapeFavorite(key: string) {
    if (!activeCharacter) return;

    setCharacters((previousCharacters) =>
      previousCharacters.map((character) =>
        character.id === activeCharacter.id
          ? {
              ...character,
              favoriteWildShapeKeys: character.favoriteWildShapeKeys.includes(
                key,
              )
                ? character.favoriteWildShapeKeys.filter(
                    (favoriteKey) => favoriteKey !== key,
                  )
                : [...character.favoriteWildShapeKeys, key],
            }
          : character,
      ),
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

  function handleWildShapeSort(column: WildShapeSortColumn) {
    if (column === wildShapeSortBy) {
      setWildShapeSortDirection((previous) =>
        previous === "asc" ? "desc" : "asc",
      );
    } else {
      setWildShapeSortBy(column);
      setWildShapeSortDirection(column === "favorite" ? "desc" : "asc");
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

  function addCustomWildShape(input: CustomWildShapeInput) {
    const newWildShape: CustomWildShape = {
      ...input,
      key: `custom-${crypto.randomUUID()}`,
      isCustom: true,
    };

    setCustomWildShapes((previous) => [...previous, newWildShape]);
  }

  function updateCustomWildShape(key: string, input: CustomWildShapeInput) {
    setCustomWildShapes((previous) =>
      previous.map((wildShape) =>
        wildShape.key === key ? { ...wildShape, ...input } : wildShape,
      ),
    );
  }

  function deleteCustomWildShape(key: string) {
    setCustomWildShapes((previous) =>
      previous.filter((wildShape) => wildShape.key !== key),
    );

    setCharacters((previous) =>
      previous.map((character) => ({
        ...character,
        favoriteWildShapeKeys: character.favoriteWildShapeKeys.filter(
          (favoriteKey) => favoriteKey !== key,
        ),
      })),
    );
  }

  function clearSearchAndFilters() {
    setSearchtext("");
    setSelectedLevel("all");
    setSelectedClasses([]);
  }

  function clearWildShapeSearchAndFilters() {
    setWildShapeSearchText("");
    setSelectedMaxCR("all");
  }

  function addCharacter(name: string, classes: string[]) {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const newCharacter: Character = {
      id: crypto.randomUUID(),
      name: trimmedName,
      classes: [...classes],
      favoriteSpellIds: [],
      favoriteWildShapeKeys: [],
    };

    setCharacters((previousCharacters) => [
      ...previousCharacters,
      newCharacter,
    ]);
    setActiveCharacterId(newCharacter.id);
  }

  function renameCharacter(id: string, name: string, classes: string[]) {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    setCharacters((previousCharacters) =>
      previousCharacters.map((character) =>
        character.id === id
          ? { ...character, name: trimmedName, classes: [...classes] }
          : character,
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
          spellClasses={spellClasses}
          onAddCharacter={addCharacter}
          onRenameCharacter={renameCharacter}
          onDeleteCharacter={deleteCharacter}
        />
        <Tabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activeCharacter={activeCharacter}
        />
        {(activeTab === "All spells" || activeTab === "My spellbook") && (
          <Search
            spellLevels={spellLevels}
            spellClasses={spellClasses}
            setSearchtext={setSearchtext}
            setSelectedLevel={setSelectedLevel}
            setSelectedClasses={setSelectedClasses}
            searchtext={searchtext}
            selectedLevel={selectedLevel}
            selectedClasses={selectedClasses}
          />
        )}
        {(activeTab === "All spells" || isSpellbookTab) &&
          (isSpellbookTab && characters.length === 0 ? (
            <p className="empty-spellbook">
              Create a character to start your spellbook.
            </p>
          ) : isSpellbookTab && !shouldShowSpellbookList ? (
            hasFavorites ? (
              <p className="empty-spellbook">
                You have favorites, but none match your search or filters.
                <button className="small-btn" onClick={clearSearchAndFilters}>
                  Clear search and filters
                </button>
              </p>
            ) : (
              <p className="empty-spellbook">
                Your spellbook is empty. Add spells using the stars in All
                spells.
              </p>
            )
          ) : (
            <SpellList
              key={activeTab}
              headline={
                isSpellbookTab
                  ? `${activeCharacter?.name}’s spellbook`
                  : "Explore spells"
              }
              description={
                isSpellbookTab
                  ? `${favoriteCount} saved ${
                      favoriteCount === 1 ? "spell" : "spells"
                    } · Your magic, ready at a glance`
                  : "Your spells, all in one place"
              }
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
              spellsByClassNotice={isSpellbookTab ? "" : spellsByClassNotice}
              selectedClasses={selectedClasses}
              filteredSpells={isSpellbookTab ? favoriteSpells : filteredSpells}
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
              isSpellbook={isSpellbookTab}
              classAbbreviations={classAbbreviations}
              showPrintPreview={isSpellbookTab && showPrintPreview}
              setShowPrintPreview={setShowPrintPreview}
              paperSize={paperSize}
              setPaperSize={setPaperSize}
            />
          ))}

        {(activeTab === "Wild Shapes" || isMyWildShapesTab) && (
          <>
            <WildShapeSearch
              challengeRatings={challengeRatings}
              setSearchtext={setWildShapeSearchText}
              setSelectedMaxCR={setSelectedMaxCR}
              searchtext={wildShapeSearchText}
              selectedMaxCR={selectedMaxCR}
            />
            {isMyWildShapesTab && characters.length === 0 ? (
              <p className="empty-spellbook">
                Create a character to save wild shapes.
              </p>
            ) : isMyWildShapesTab && !shouldShowMyWildShapesList ? (
              hasFavoriteWildShapes ? (
                <p className="empty-spellbook">
                  None of your saved wild shapes match your search or filters.
                  <button
                    className="small-btn"
                    onClick={clearWildShapeSearchAndFilters}
                  >
                    Clear search and filters
                  </button>
                </p>
              ) : (
                <p className="empty-spellbook">
                  You have not saved any wild shapes yet. Use the stars in Wild
                  Shapes to add some.
                </p>
              )
            ) : (
              <WildShapeList
                wildShapes={filteredWildShapes}
                headline={
                  isMyWildShapesTab
                    ? `${activeCharacter?.name}'s wild shapes`
                    : "Explore wild shapes"
                }
                description={
                  isMyWildShapesTab
                    ? `${favoriteWildShapeCount} saved ${
                        favoriteWildShapeCount === 1 ? "form" : "forms"
                      } · Your beasts, ready at a glance`
                    : "Find your next beast form"
                }
                isLoading={isLoadingWildShapes}
                error={wildShapesError}
                toggleWildShapeFavorite={toggleWildShapeFavorite}
                activeCharacter={activeCharacter}
                sortBy={wildShapeSortBy}
                sortDirection={wildShapeSortDirection}
                handleSort={handleWildShapeSort}
                isMyWildShapesTab={isMyWildShapesTab}
                challengeRatings={challengeRatings}
                creatureSizes={creatureSizes}
                abilities={abilities}
                onSaveWildShape={addCustomWildShape}
                onEditWildShape={updateCustomWildShape}
                onDeleteWildShape={deleteCustomWildShape}
                paperSize={paperSize}
                setPaperSize={setPaperSize}
              />
            )}
          </>
        )}
      </main>
    </>
  );
}

export default App;
