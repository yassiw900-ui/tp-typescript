import assert from "node:assert/strict";

import { CacheResults } from "./decorators";
import { Identifiable, Repository } from "./generics";
import { SpellRepository, WizardRepository } from "./repository";
import {
  HOUSES,
  House,
  Spell,
  SpellCastEvent,
  Wizard,
} from "./types";

console.log("=== Exercice 1 : ajouter un sorcier ===");

const wizardRepository = new WizardRepository();

const harry = wizardRepository.registerWizard({
  name: "Harry Potter",
  house: "Gryffindor",
  level: 7,
});

const draco = wizardRepository.registerWizard({
  name: "Draco Malfoy",
  house: "Slytherin",
  level: 6,
});

const luna = wizardRepository.registerWizard({
  name: "Luna Lovegood",
  house: "Ravenclaw",
  level: 6,
});

const cedric = wizardRepository.registerWizard({
  name: "Cedric Diggory",
  house: "Hufflepuff",
  level: 7,
});

const hermione = wizardRepository.registerWizard({
  name: "Hermione Granger",
  house: "Gryffindor",
  level: 8,
});

console.log(harry, draco);

assert.equal(harry.id, 1);
assert.equal(draco.id, 2);
assert.equal(wizardRepository.size, 5);
console.log("OK : les ids sont attribues automatiquement par le repository.");

console.log("\n=== Exercice 2 : filtrer par maison ===");

const gryffindorWizards = wizardRepository.findByHouse("Gryffindor");
const slytherinWizards = wizardRepository.findByHouse("Slytherin");

console.log(
  "Gryffindor :",
  gryffindorWizards.map((wizard) => wizard.name),
);
console.log(
  "Slytherin :",
  slytherinWizards.map((wizard) => wizard.name),
);

assert.deepEqual(
  gryffindorWizards.map((wizard) => wizard.name),
  ["Harry Potter", "Hermione Granger"],
);
assert.deepEqual(
  slytherinWizards.map((wizard) => wizard.name),
  ["Draco Malfoy"],
);
console.log("OK : findByHouse accepte uniquement les quatre maisons valides.");

console.log("\n=== Exercice 3 : evenements de sort ===");

const spellRepository = new SpellRepository();

const expelliarmus = spellRepository.add({ name: "Expelliarmus", power: 40 });
const lumos = spellRepository.add({ name: "Lumos", power: 5 });

function eventHandler(event: SpellCastEvent): string {
  return `${event.wizard.name} lance ${event.spell.name} (puissance ${event.spell.power}).`;
}

const spellEvent: SpellCastEvent = {
  type: "spell-cast",
  wizard: harry,
  spell: expelliarmus,
};

console.log(eventHandler(spellEvent));

assert.equal(
  eventHandler(spellEvent),
  "Harry Potter lance Expelliarmus (puissance 40).",
);
console.log("OK : eventHandler n'accepte que les evenements 'spell-cast'.");

console.log("\n=== Exercice 4 : valider la puissance d'un sort ===");

const protego = spellRepository.add({ name: "Protego", power: 30 });
console.log("Sort valide accepte :", protego);

assert.throws(
  () => spellRepository.add({ name: "Malefice", power: -10 }),
  /negative/,
);

try {
  spellRepository.add({ name: "Sort Interdit", power: -1 });
} catch (error) {
  console.log(
    "Sort invalide rejete :",
    error instanceof Error ? error.message : error,
  );
}

assert.equal(spellRepository.size, 3);
console.log("OK : les sorts a puissance negative ne sont jamais stockes.");

console.log("\n=== Exercice 5 : mise en cache ===");

class SpellPowerService {
  public computations = 0;

  @CacheResults
  calculateDamage(spell: Spell): number {
    this.computations += 1;
    return spell.power * 2 + spell.name.length;
  }
}

const service = new SpellPowerService();

const firstCall = service.calculateDamage(expelliarmus);
const secondCall = service.calculateDamage(expelliarmus);

console.log("1er appel :", firstCall, "| calculs :", service.computations);
console.log("2e appel  :", secondCall, "| calculs :", service.computations);

assert.equal(firstCall, secondCall);
assert.equal(service.computations, 1, "le 2e appel doit venir du cache");

service.calculateDamage(lumos);
assert.equal(service.computations, 2);

const otherService = new SpellPowerService();
otherService.calculateDamage(expelliarmus);
assert.equal(otherService.computations, 1);
console.log("OK : cache par instance et par combinaison d'arguments.");

console.log("\n=== Exercice 6 : type guards ===");

function isHouse(value: unknown): value is House {
  return (
    typeof value === "string" && HOUSES.some((house) => house === value)
  );
}

function isWizard(value: unknown): value is Wizard {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === "number" &&
    typeof candidate.name === "string" &&
    isHouse(candidate.house) &&
    typeof candidate.level === "number"
  );
}

console.log('isHouse("Gryffindor") :', isHouse("Gryffindor"));
console.log('isHouse("Durmstrang") :', isHouse("Durmstrang"));
console.log("isWizard(harry) :", isWizard(harry));
console.log(
  'isWizard({ house: "Durmstrang" }) :',
  isWizard({ ...harry, house: "Durmstrang" }),
);

assert.equal(isHouse("Gryffindor"), true);
assert.equal(isHouse("Slytherin"), true);
assert.equal(isHouse("Ravenclaw"), true);
assert.equal(isHouse("Hufflepuff"), true);
assert.equal(isHouse("Durmstrang"), false);
assert.equal(isHouse(42), false);
assert.equal(isWizard(harry), true);
assert.equal(isWizard({ ...harry, house: "Durmstrang" }), false);
assert.equal(isWizard({ ...harry, name: 123 }), false);
assert.equal(isWizard(null), false);
console.log("OK : les valeurs invalides sont rejetees.");

console.log("\n=== Bonus : repository generique ===");

interface Potion extends Identifiable {
  name: string;
  effect: string;
}

const potionRepository = new Repository<Potion>();
const felixFelicis = potionRepository.add({
  name: "Felix Felicis",
  effect: "Chance",
});

console.log(felixFelicis);
assert.equal(felixFelicis.id, 1);
assert.equal(potionRepository.size, 1);

assert.equal(spellRepository.findById(expelliarmus.id)?.name, "Expelliarmus");
assert.equal(wizardRepository.findById(harry.id)?.name, "Harry Potter");
console.log("OK : Repository<T> fonctionne pour Wizard, Spell et Potion.");

console.log("\nTous les tests sont passes.");
