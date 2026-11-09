import type { CartLine } from "./store/cart";

export function mergeLegacy(lines: CartLine[], sources: string[], incoming: CartLine[]) {
  const current = new Set(incoming.map((line) => line.legacySource).filter((source): source is string => Boolean(source)));
  const removed = lines.filter((line) => line.legacySource && !current.has(line.legacySource));
  const retained = lines.filter((line) => !line.legacySource || current.has(line.legacySource));
  const seen = new Set(sources.filter((source) => current.has(source)));
  for (const line of retained) if (line.legacySource) seen.add(line.legacySource);
  const added: CartLine[] = [];
  for (const line of incoming) {
    if (!line.legacySource || seen.has(line.legacySource)) continue;
    seen.add(line.legacySource);
    added.push(line);
  }
  return {
    lines: removed.length || added.length ? [...retained, ...added] : lines,
    importedSources: [...seen],
    removed,
  };
}

export function consumeSubmitted(lines: CartLine[], submitted: CartLine[]) {
  return lines.flatMap((line) => {
    const bought = submitted.find((item) => item.lineId === line.lineId);
    if (!bought) return [line];
    return line.qty > bought.qty ? [{ ...line, qty: line.qty - bought.qty }] : [];
  });
}

export function consumeAttemptOnce(lines: CartLine[], consumedAttempts: string[], submitted: CartLine[], attemptId: string) {
  if (consumedAttempts.includes(attemptId)) return { lines, consumedAttempts };
  return { lines: consumeSubmitted(lines, submitted), consumedAttempts: [...consumedAttempts, attemptId] };
}
