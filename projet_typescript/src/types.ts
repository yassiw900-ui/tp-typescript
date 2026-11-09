export type House = "Gryffindor" | "Slytherin" | "Ravenclaw" | "Hufflepuff";

export const HOUSES: readonly House[] = [
  "Gryffindor",
  "Slytherin",
  "Ravenclaw",
  "Hufflepuff",
];

export interface Wizard {
  id: number;
  name: string;
  house: House;
  level: number;
}

export interface Spell {
  id: number;
  name: string;
  power: number;
}

export type AcademyEvent =
  | { type: "spell-cast"; wizard: Wizard; spell: Spell }
  | { type: "wizard-enrolled"; wizard: Wizard }
  | { type: "house-cup-awarded"; house: House; points: number };

export type SpellCastEvent = Extract<AcademyEvent, { type: "spell-cast" }>;

export type NewWizard = Omit<Wizard, "id">;
