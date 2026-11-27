import type { Character } from "../types/character";
import type { CustomSpell, CustomSpellInput } from "../types/spell";
import type { CustomWildShape, CustomWildShapeInput } from "../types/wildShape";

export type User = { id: string; email: string };

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function api<T>(
  path: string,
  options: { method?: string; body?: unknown } = {},
): Promise<T> {
  const response = await fetch(`/api${path}`, {
    method: options.method ?? "GET",
    credentials: "include",
    headers:
      options.body === undefined
        ? undefined
        : { "Content-Type": "application/json" },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const data = await response.json();
      if (typeof data?.error === "string") message = data.error;
    } catch {
      // Body was not JSON; keep the generic message.
    }
    throw new ApiError(response.status, message);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

const enc = encodeURIComponent;

// Auth
export async function getCurrentUser(): Promise<User | null> {
  try {
    return await api<User>("/auth/me");
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
}

export const register = (email: string, password: string) =>
  api<User>("/auth/register", { method: "POST", body: { email, password } });

export const login = (email: string, password: string) =>
  api<User>("/auth/login", { method: "POST", body: { email, password } });

export const logout = () => api<void>("/auth/logout", { method: "POST" });

// Characters
export const fetchCharacters = () => api<Character[]>("/characters");

export const createCharacter = (character: {
  id: string;
  name: string;
  classes: string[];
}) => api<Character>("/characters", { method: "POST", body: character });

export const updateCharacter = (
  id: string,
  changes: { name?: string; classes?: string[] },
) =>
  api<Character>(`/characters/${enc(id)}`, { method: "PATCH", body: changes });

export const deleteCharacter = (id: string) =>
  api<void>(`/characters/${enc(id)}`, { method: "DELETE" });

export const setFavoriteSpell = (
  characterId: string,
  spellIndex: string,
  isFavorite: boolean,
) =>
  api<void>(
    `/characters/${enc(characterId)}/favorite-spells/${enc(spellIndex)}`,
    { method: isFavorite ? "PUT" : "DELETE" },
  );

export const setFavoriteWildShape = (
  characterId: string,
  key: string,
  isFavorite: boolean,
) =>
  api<void>(
    `/characters/${enc(characterId)}/favorite-wild-shapes/${enc(key)}`,
    { method: isFavorite ? "PUT" : "DELETE" },
  );

// Custom spells
export const fetchCustomSpells = () => api<CustomSpell[]>("/custom-spells");

export const createCustomSpell = (index: string, input: CustomSpellInput) =>
  api<CustomSpell>("/custom-spells", {
    method: "POST",
    body: { ...input, index },
  });

export const updateCustomSpell = (index: string, input: CustomSpellInput) =>
  api<CustomSpell>(`/custom-spells/${enc(index)}`, {
    method: "PUT",
    body: input,
  });

export const deleteCustomSpell = (index: string) =>
  api<void>(`/custom-spells/${enc(index)}`, { method: "DELETE" });

// Custom wild shapes
export const fetchCustomWildShapes = () =>
  api<CustomWildShape[]>("/custom-wild-shapes");

export const createCustomWildShape = (
  key: string,
  input: CustomWildShapeInput,
) =>
  api<CustomWildShape>("/custom-wild-shapes", {
    method: "POST",
    body: { ...input, key },
  });

export const updateCustomWildShape = (
  key: string,
  input: CustomWildShapeInput,
) =>
  api<CustomWildShape>(`/custom-wild-shapes/${enc(key)}`, {
    method: "PUT",
    body: input,
  });

export const deleteCustomWildShape = (key: string) =>
  api<void>(`/custom-wild-shapes/${enc(key)}`, { method: "DELETE" });

// Card texts
export const fetchCardTexts = () => api<Record<string, string>>("/card-texts");

export const saveCardText = (spellIndex: string, text: string) =>
  api<{ spellIndex: string; text: string }>(`/card-texts/${enc(spellIndex)}`, {
    method: "PUT",
    body: { text },
  });

// One-time migration of data from the localStorage version of the app
const LEGACY_KEYS = {
  characters: "spellbook-characters",
  customSpells: "spellbook-custom-spells",
  customWildShapes: "spellbook-custom-wild-shapes",
  cardTexts: "spellbook-card-texts",
} as const;
const LEGACY_FAVORITES_KEY = "spellbook-favorites";

function readLegacy(key: string): unknown {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : undefined;
  } catch {
    return undefined;
  }
}

export function getLegacyLocalData() {
  const characters = readLegacy(LEGACY_KEYS.characters);
  const customSpells = readLegacy(LEGACY_KEYS.customSpells);
  const customWildShapes = readLegacy(LEGACY_KEYS.customWildShapes);
  const cardTexts = readLegacy(LEGACY_KEYS.cardTexts);

  const data = {
    characters: Array.isArray(characters) ? characters : [],
    customSpells: Array.isArray(customSpells) ? customSpells : [],
    customWildShapes: Array.isArray(customWildShapes) ? customWildShapes : [],
    cardTexts:
      cardTexts && typeof cardTexts === "object" && !Array.isArray(cardTexts)
        ? (cardTexts as Record<string, string>)
        : {},
  };

  const isEmpty =
    data.characters.length === 0 &&
    data.customSpells.length === 0 &&
    data.customWildShapes.length === 0 &&
    Object.keys(data.cardTexts).length === 0;

  return isEmpty ? null : data;
}

export function clearLegacyLocalData() {
  try {
    for (const key of Object.values(LEGACY_KEYS)) localStorage.removeItem(key);
    localStorage.removeItem(LEGACY_FAVORITES_KEY);
  } catch {
    // Storage unavailable; nothing to clear.
  }
}

export const importLocalData = (
  data: NonNullable<ReturnType<typeof getLegacyLocalData>>,
) =>
  api<{
    characters: Character[];
    customSpells: CustomSpell[];
    customWildShapes: CustomWildShape[];
  }>("/import", { method: "POST", body: data });
