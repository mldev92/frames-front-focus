export async function requestKey(kind: string, payload: unknown, file?: File | null): Promise<string> {
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  const fileHash = file ? [...new Uint8Array(await crypto.subtle.digest("SHA-256", await file.arrayBuffer()))].join(",") : "";
  const fingerprint = [...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))].join(",") + fileHash;
  const storageKey = `optika-request-${kind}`;
  const previous = JSON.parse(localStorage.getItem(storageKey) ?? "null") as { fingerprint: string; key: string } | null;
  if (previous?.fingerprint === fingerprint) return previous.key;
  const key = crypto.randomUUID().replace(/-/g, "");
  localStorage.setItem(storageKey, JSON.stringify({ fingerprint, key }));
  return key;
}
