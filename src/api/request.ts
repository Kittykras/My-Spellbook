import type { ApiSpell, SpellDetails } from "../types/spell";

type SpellListResponse = {
  results: ApiSpell[];
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

export async function getSpellDetailsFromAPI(index: string): Promise<SpellDetails> {
  const url = "https://www.dnd5eapi.co/api/2024/spells/" + index;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Response status: ${response.status}`);
  }

  const result: SpellDetails = await response.json();
  return result;
}