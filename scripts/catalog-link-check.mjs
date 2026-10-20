// Проверяем реальные ссылки из HTML, а не только список успешно собранных страниц.
export function catalogLinks(html) {
  const links = new Set();
  for (const match of html.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["']/gi)) {
    const url = new URL(match[1].replaceAll("&amp;", "&"), "https://optika100.com");
    if (url.origin !== "https://optika100.com" || !/^\/catalog_[sn]\//.test(url.pathname)) continue;
    links.add(decodeURI(url.pathname).replace(/\/?$/, "/"));
  }
  return [...links];
}

export function redirectPaths(text) {
  return new Set(text.split(/\r?\n/).flatMap((line) => {
    const source = line.match(/^RedirectMatch 301 \^(\S+?)\/\?\$\s/)?.[1];
    return source ? [source.replace(/\\x20/g, " ").replace(/\\([.\-])/g, "$1").replace(/\/?$/, "/")] : [];
  }));
}

// Конечные адреса SEO-редиректов тоже должны входить в проверяемый артефакт.
export function redirectTargets(text) {
  return new Set(text.split(/\r?\n/).flatMap((line) => {
    if (!line.startsWith("RedirectMatch ")) return [];
    const match = line.match(/^RedirectMatch 301 \^\S+\/\?\$\s+(\S+)$/);
    if (!match) throw new Error(`Unsupported redirect: ${line}`);
    const url = new URL(match[1], "https://optika100.com");
    if (url.origin !== "https://optika100.com") throw new Error(`External redirect requires separate review: ${line}`);
    return [decodeURI(url.pathname).replace(/\/?$/, "/")];
  }));
}
