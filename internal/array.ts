export function toUniqueArray<T>(value: T | T[]): T[] {
  return new Set(Array.isArray(value) ? value : [value]).values().toArray();
}
