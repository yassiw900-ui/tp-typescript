export function ValidateSpellPower(
  _target: object,
  _propertyKey: string,
  descriptor: PropertyDescriptor,
): PropertyDescriptor {
  const originalMethod = descriptor.value as (...args: unknown[]) => unknown;

  descriptor.value = function (this: unknown, ...args: unknown[]) {
    const spell = args[0] as { name?: string; power?: number };

    if (typeof spell?.power !== "number" || Number.isNaN(spell.power)) {
      throw new Error("Le sort doit posseder une puissance numerique.");
    }

    if (spell.power < 0) {
      throw new Error(
        `Le sort "${spell.name ?? "inconnu"}" est rejete : sa puissance ` +
          `(${spell.power}) est negative.`,
      );
    }

    return originalMethod.apply(this, args);
  };

  return descriptor;
}

export function CacheResults(
  _target: object,
  _propertyKey: string,
  descriptor: PropertyDescriptor,
): PropertyDescriptor {
  const originalMethod = descriptor.value as (...args: unknown[]) => unknown;
  const cachesByInstance = new WeakMap<object, Map<string, unknown>>();

  descriptor.value = function (this: object, ...args: unknown[]) {
    let cache = cachesByInstance.get(this);
    if (!cache) {
      cache = new Map<string, unknown>();
      cachesByInstance.set(this, cache);
    }

    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = originalMethod.apply(this, args);
    cache.set(key, result);
    return result;
  };

  return descriptor;
}
