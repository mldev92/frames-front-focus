type RequestIdentity = { fingerprint: string; key: string };
const storageKey = "optika-request-lens";
let recentRequest: RequestIdentity | undefined;

export async function lensRequestKey(payload: unknown, file?: File | null): Promise<string> {
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  const fileHash = file ? [...new Uint8Array(await crypto.subtle.digest("SHA-256", await file.arrayBuffer()))].join(",") : "";
  const fingerprint = [...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))].join(",") + fileHash;
  let previous = recentRequest;
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) ?? "null") as RequestIdentity | null;
    if (saved?.fingerprint === fingerprint && /^[a-f0-9]{32}$/.test(saved.key)) previous = saved;
  } catch {
    // Повтор в этой вкладке работает и при недоступном локальном хранилище.
  }
  if (previous?.fingerprint === fingerprint) return previous.key;
  const key = Array.from(crypto.getRandomValues(new Uint8Array(16)), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
  const identity = { fingerprint, key };
  recentRequest = identity;
  try {
    localStorage.setItem(storageKey, JSON.stringify(identity));
  } catch {
    // Ключ уже сохранён на время жизни страницы.
  }
  return key;
}
