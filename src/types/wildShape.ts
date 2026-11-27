export type AbilityScores = {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
};

export type CreatureAction = {
  name: string;
  desc: string;
  action_type: string;
};

export type CreatureTrait = {
  name: string;
  desc: string;
};

export type ApiWildShape = {
  key: string;
  name: string;
  type: {
    name: string;
    key: string;
  };
  size: {
    name: string;
    key: string;
  };
  challenge_rating: number;
  proficiency_bonus?: number;
  experience_points: number;
  armor_class: number;
  hit_points: number;
  hit_dice: string;
  speed: {
    unit: string;
    walk?: number;
    fly?: number;
    swim?: number;
    climb?: number;
    burrow?: number;
  };
  alignment: string;
  ability_scores: AbilityScores;
  modifiers: AbilityScores;
  initiative_bonus: number;
  saving_throws: AbilityScores;
  skill_bonuses: Record<string, number>;
  passive_perception: number;
  darkvision_range: number | null;
  actions: CreatureAction[];
  traits: CreatureTrait[];
  isCustom?: false;
};

export type CustomWildShapeInput = Omit<
  ApiWildShape,
  | "key"
  | "isCustom"
  | "skill_bonuses"
  | "traits"
  | "actions"
> & {
  skill_bonuses: string;
  traits: string;
  actions: string;
  /** Visible to every user when true. */
  isShared?: boolean;
};

export type CustomWildShape = CustomWildShapeInput & {
  key: string;
  isCustom: true;
  isShared: boolean;
  /** False for wild shapes another user has shared; those are read-only. */
  isOwn: boolean;
};

export type WildShape = ApiWildShape | CustomWildShape;

export type WildShapeSortColumn = "name" | "cr" | "favorite";