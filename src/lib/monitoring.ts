import { apiUrl } from "@/lib/api/security";

let installed = false;

function report(message: string, stack?: string) {
  const payload = JSON.stringify({
    message,
    stack,
    url: window.location.href,
    release: document.querySelector<HTMLMetaElement>('meta[name="release"]')?.content ?? "",
  });
  if (navigator.sendBeacon) {
    navigator.sendBeacon(apiUrl("client_error.php"), new Blob([payload], { type: "application/json" }));
    return;
  }
  void fetch(apiUrl("client_error.php"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  });
}

export function installClientErrorReporting() {
  if (installed || typeof window === "undefined") return;
  installed = true;
  window.addEventListener("error", (event) => {
    report(event.message || "Unhandled browser error", event.error?.stack);
  });
  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason;
    report(
      reason instanceof Error ? reason.message : String(reason),
      reason instanceof Error ? reason.stack : undefined,
    );
  });
}
