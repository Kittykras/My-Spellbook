import type { ApiSpell, SpellDetails } from "../types/spell";
import type { ApiWildShape } from "../types/wildShape";

type SpellListResponse = {
  results: ApiSpell[];
};

type WildShapeListResponse = {
  results: ApiWildShape[];
  next: string | null;
};

export async function getSpellsFromAPI(): Promise<ApiSpell[]> {
  const url = "https://www.dnd5eapi.co/api/2024/spells";
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Response status: ${response.status}`);
  }

  const result: SpellListResponse = await response.json();
  return result.results;
}

export async function getSpellDetailsFromAPI(
  index: string,
): Promise<SpellDetails> {
  const url = "https://www.dnd5eapi.co/api/2024/spells/" + index;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Response status: ${response.status}`);
  }

  const result: SpellDetails = await response.json();
  return result;
}

export async function getSpellsByClassFromAPI(classIndex: string) {
  const url = `https://www.dnd5eapi.co/api/2024/classes/${classIndex}/spells`;
  const response = await fetch(url);
  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Response status: ${response.status}`);
  }

  const result: SpellListResponse = await response.json();
  return result.results;
}

export async function getBeastsFromAPI(): Promise<ApiWildShape[]> {
  let url: string | null =
    "https://api.open5e.com/v2/creatures/?document__key__in=srd-2024&type=beast";

  const monsters: ApiWildShape[] = [];

  while (url !== null) {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const result: WildShapeListResponse = await response.json();

    monsters.push(...result.results);
    url = result.next;
  }

  return monsters;
}
