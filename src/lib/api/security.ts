const BASE = (import.meta.env?.VITE_BITRIX_API as string | undefined)?.replace(/\/$/, "") ?? "";

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

export class StoreApiError extends Error {
  public status: number;
  public data: Record<string, unknown>;

  constructor(message: string, status: number, data: Record<string, unknown>) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

type StoreResponse<T> = T & {
  error?: string;
  message?: string;
  code?: string;
};

async function csrfPost<T>(
  path: string,
  buildInit: (csrfToken: string) => RequestInit,
  retryCsrf = true,
): Promise<T> {
  const csrfToken = await getCsrfToken();
  const response = await apiFetch(apiUrl(path), buildInit(csrfToken));
  const data = (await response.json().catch(() => ({}))) as StoreResponse<T>;
  if (response.ok) return data;

  const csrfExpired = response.status === 403 && (
    data.code === "csrf_invalid"
    || data.error === "Сессия устарела. Обновите страницу и повторите попытку."
  );
  if (retryCsrf && csrfExpired) {
    await getCsrfToken(true);
    return csrfPost(path, buildInit, false);
  }
  throw new StoreApiError(
    data.error ?? data.message ?? `HTTP ${response.status}`,
    response.status,
    data as Record<string, unknown>,
  );
}

export async function securePost<T>(
  path: string,
  body: unknown,
  extraHeaders: Record<string, string> = {},
  signal?: AbortSignal,
): Promise<T> {
  const serializedBody = JSON.stringify(body);
  return csrfPost<T>(path, (csrfToken) => ({
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrfToken,
      ...extraHeaders,
    },
    body: serializedBody,
    signal,
  }));
}

/**
 * Same CSRF-protected POST as securePost, but for multipart/form-data (a file
 * upload). The Content-Type header is deliberately left unset so the browser
 * adds the multipart boundary; the CSRF token rides in the header, which the
 * server reads before the body (o_require_csrf).
 */
export async function securePostForm<T>(path: string, form: FormData): Promise<T> {
  return csrfPost<T>(path, (csrfToken) => ({
    method: "POST",
    credentials: "include",
    headers: { "X-CSRF-Token": csrfToken },
    body: form,
  }));
}
