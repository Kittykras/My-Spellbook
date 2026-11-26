import type { AbilityScores } from "../types/wildShape";

export function formatChallengeRating(cr: number): string {
  const fractions: Record<number, string> = {
    0.125: "⅛",
    0.25: "¼",
    0.5: "½",
  };

  return fractions[cr] ?? String(cr);
}

export function formatModifier(value: number): string {
  return value >= 0 ? `+${value}` : String(value);
}

export function formatUnit(unit: string): string {
  return unit === "feet" ? "ft." : unit;
}

export function parseSavingThrows(
  text: string,
  modifiers: AbilityScores,
): AbilityScores {
  const saves = { ...modifiers };

  const abilityKeys = {
    str: "strength",
    dex: "dexterity",
    con: "constitution",
    int: "intelligence",
    wis: "wisdom",
    cha: "charisma",
  } as const;

  const pattern =
    /\b(str|dex|con|int|wis|cha)(?:ength|terity|stitution|elligence|dom|risma)?\s*:?\s*([+-]?\s*\d+)/gi;

  for (const match of text.matchAll(pattern)) {
    const abbreviation =
      match[1].toLowerCase() as keyof typeof abilityKeys;

    saves[abilityKeys[abbreviation]] = Number(
      match[2].replace(/\s/g, ""),
    );
  }

  return saves;
}