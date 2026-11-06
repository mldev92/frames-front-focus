const legacyUploadHosts = new Set([
  "optika.p2print.site",
  "optika-new.p2print.site",
  "beta.optika100.com",
]);

// В общем индексе Bitrix сохранились абсолютные ссылки прежнего окружения.
// Файлы /upload/ доступны на том же origin, что и действующий API.
export function storefrontUploadUrl(value: string, apiBase: string): string {
  try {
    const source = new URL(value);
    const target = new URL(apiBase);
    if (
      !["http:", "https:"].includes(source.protocol) ||
      !["http:", "https:"].includes(target.protocol) ||
      source.username || source.password ||
      !legacyUploadHosts.has(source.hostname) ||
      !source.pathname.startsWith("/upload/")
    ) return value;
    return `${target.origin}${source.pathname}${source.search}${source.hash}`;
  } catch {
    return value;
  }
}
