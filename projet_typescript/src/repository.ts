import { ValidateSpellPower } from "./decorators";
import { NewEntity, Repository } from "./generics";
import { NewWizard, Spell, Wizard } from "./types";

export class WizardRepository extends Repository<Wizard> {
  registerWizard(wizard: NewWizard): Wizard {
    return this.add(wizard);
  }

  findByHouse(house: Wizard["house"]): Wizard[] {
    return this.findBy((wizard) => wizard.house === house);
  }
}

export class SpellRepository extends Repository<Spell> {
  @ValidateSpellPower
  override add(spell: NewEntity<Spell>): Spell {
    return super.add(spell);
  }
}
