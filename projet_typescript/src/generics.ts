export interface Identifiable {
  id: number;
}

export type NewEntity<T extends Identifiable> = Omit<T, "id">;

export class Repository<T extends Identifiable> {
  private items: T[] = [];
  private nextId = 1;

  add(input: NewEntity<T>): T {
    const created = { ...input, id: this.nextId } as T;
    this.nextId += 1;
    this.items.push(created);
    return created;
  }

  findAll(): T[] {
    return [...this.items];
  }

  findById(id: number): T | undefined {
    return this.items.find((item) => item.id === id);
  }

  findBy(predicate: (item: T) => boolean): T[] {
    return this.items.filter(predicate);
  }

  update(id: number, changes: Partial<NewEntity<T>>): T | undefined {
    const item = this.findById(id);
    if (!item) {
      return undefined;
    }

    Object.assign(item, changes);
    return item;
  }

  delete(id: number): boolean {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) {
      return false;
    }

    this.items.splice(index, 1);
    return true;
  }

  get size(): number {
    return this.items.length;
  }
}
