// Запятая разделяет выбранные значения, но может входить в название самого пункта.
export function serializeFacetValues(values: string[]): string {
  return values.map((value) => value.replace(/%/g, "%25").replace(/,/g, "%2C")).join(",");
}

export function parseFacetValues(value: string): string[] {
  return value.split(",").map((part) => {
    try { return decodeURIComponent(part).trim(); }
    catch { return part.trim(); }
  }).filter(Boolean);
}
