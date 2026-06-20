const BASE = (import.meta.env.VITE_BITRIX_API as string | undefined)?.replace(/\/$/, "") ?? "";

let csrfPromise: Promise<string> | null = null;
const SLOW_API_MS = 2000;

export function apiUrl(path: string): string {
  return `${BASE}/api/store/${path}`;
}

export function telemetryApiUrl(path: string): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/api/store/${path}`;
  }
  return apiUrl(path);
}

function reportSlowApi(input: RequestInfo | URL, elapsedMs: number, status?: number) {
  if (typeof window === "undefined" || elapsedMs < SLOW_API_MS) return;
  const payload = JSON.stringify({
    message: `Slow storefront API request (${Math.round(elapsedMs)} ms)`,
    stack: JSON.stringify({ request: String(input), status }),
    url: window.location.href,
    release: document.querySelector<HTMLMetaElement>('meta[name="release"]')?.content ?? "",
  });
  if (navigator.sendBeacon) {
    navigator.sendBeacon(telemetryApiUrl("client_error.php"), new Blob([payload], { type: "application/json" }));
    return;
  }
  void fetch(telemetryApiUrl("client_error.php"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  });
}

export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const startedAt = typeof performance === "undefined" ? Date.now() : performance.now();
  let status: number | undefined;
  try {
    const response = await fetch(input, init);
    status = response.status;
    return response;
  } finally {
    const finishedAt = typeof performance === "undefined" ? Date.now() : performance.now();
    reportSlowApi(input, finishedAt - startedAt, status);
  }
}

export async function getCsrfToken(force = false): Promise<string> {
  if (force) csrfPromise = null;
  csrfPromise ??= apiFetch(apiUrl("csrf.php"), {
    credentials: "include",
    cache: "no-store",
  }).then(async (response) => {
    if (!response.ok) throw new Error(`CSRF endpoint returned ${response.status}`);
    const data = (await response.json()) as { csrfToken?: string };
    if (!data.csrfToken) throw new Error("CSRF token missing");
    return data.csrfToken;
  });
  return csrfPromise;
}

export async function securePost<T>(
  path: string,
  body: unknown,
  extraHeaders: Record<string, string> = {},
): Promise<T> {
  const csrfToken = await getCsrfToken();
  const response = await apiFetch(apiUrl(path), {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrfToken,
      ...extraHeaders,
    },
    body: JSON.stringify(body),
  });
  const data = (await response.json().catch(() => ({}))) as T & {
    error?: string;
    message?: string;
  };
  if (!response.ok) {
    if (response.status === 403) void getCsrfToken(true);
    throw new Error(data.error ?? data.message ?? `HTTP ${response.status}`);
  }
  return data;
}
