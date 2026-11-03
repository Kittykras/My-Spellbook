export type ApiSpell = {
  index: string;
  level: number;
  name: string;
  url: string;
};

export type ApiSpellItem = ApiSpell & {
  isCustom: false;
  isFavorite: boolean;
};

export type Spell = ApiSpellItem | CustomSpell;

export type SpellClass = {
  index: string;
  name: string;
  url: string;
};

export type SpellSchool = {
  index: string;
  name: string;
  url: string;
}

export type SpellDetails = {
  index: string;
  casting_time: string;
  classes: SpellClass[];
  components: string[];
  material?: string;
  concentration: boolean;
  description: string;
  duration: string;
  higher_level?: string;
  level: number;
  name: string;
  range: string;
  ritual: boolean;
  school: SpellSchool;
  updated_at: string;
  url: string;
  subclasses: SpellClass[];
}

export type CustomSpellInput = {
  name: string;
  level: number;
  description: string;
  school: string;
  casting_time: string;
  range: string;
  duration: string;
  components: string[];
  material?: string;
  concentration: boolean;
  ritual: boolean;
  classes: string[];
  higher_level?: string;
};

export type CustomSpell = CustomSpellInput & {
  index: string;
  isCustom: true;
  isFavorite: boolean;
};

export type SpellDetailsView = {
  school: string;
  classes: string[];
  casting_time: string;
  range: string;
  duration: string;
  components: string[];
  concentration: boolean;
  ritual: boolean;
  description: string;
  material?: string;
  higher_level?: string;
};