const text = (html) => html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
  .replace(/<[^>]*>/g, " ").replace(/&nbsp;|&#160;/g, " ").trim();

// Проверка содержимого, а не только существования файла с ответом 200.
export function catalogHtmlProblems(html) {
  const problems = [];
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? "";
  const h1 = main.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? "";
  if (!text(main) || !text(h1)) problems.push("catalog main content or H1 missing");
  if (/Каталог обновляется|Не удалось загрузить каталог|Раздел недоступен|Товар не найден/.test(text(main))) {
    problems.push("catalog rendered unavailable state");
  }
  const descriptions = [...html.matchAll(/<meta\b[^>]*>/gi)]
    .filter(([tag]) => /\bname=["']description["']/i.test(tag))
    .map(([tag]) => tag.match(/\bcontent=(?:"([^"]*)"|'([^']*)')/i))
    .map((match) => match?.[1] ?? match?.[2] ?? "");
  if (descriptions.length !== 1 || !text(descriptions[0])) problems.push("catalog description empty or ambiguous");
  return problems;
}
