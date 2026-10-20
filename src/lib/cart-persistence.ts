// Повторное чтение неизменённой корзины не должно сбрасывать ПВЗ и котировку.
export function mergePersistedCart<T extends { lines: unknown[] }>(
  persisted: unknown,
  current: T,
): T {
  if (!persisted || typeof persisted !== "object") return current;
  const restored = persisted as Partial<T>;
  return {
    ...current,
    ...restored,
    lines: Array.isArray(restored.lines)
      ? JSON.stringify(restored.lines) === JSON.stringify(current.lines)
        ? current.lines
        : restored.lines
      : current.lines,
  };
}
