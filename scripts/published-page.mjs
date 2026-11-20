import { parseExpressionAt } from "acorn";

// Читаем только литералы и ссылки сериализатора. Скрипты HTML не выполняются.
export function publishedMatches(html) {
  const marker = "$_TSR.router=($R=>";
  const start = html.indexOf(marker);
  if (start < 0 || html.indexOf(marker, start + 1) !== -1)
    throw Error("Missing unique router payload");
  const expression = parseExpressionAt(html, start + marker.length, { ecmaVersion: 2022 });
  if (!html.startsWith(')($R["tsr"])', expression.end)) throw Error("Unsupported router payload");
  const refs = new Map();
  function reference(n) {
    if (
      n.type !== "MemberExpression" ||
      n.object.name !== "$R" ||
      !n.computed ||
      !Number.isSafeInteger(n.property.value) ||
      n.property.value < 0
    )
      throw Error("Invalid serialized reference");
    return n.property.value;
  }
  function read(n) {
    switch (n.type) {
      case "Literal":
        if (n.regex || n.bigint) break;
        return n.value;
      case "ArrayExpression":
        return n.elements.map(read);
      case "ObjectExpression": {
        const result = {};
        for (const p of n.properties) {
          if (p.type !== "Property" || p.computed || p.kind !== "init" || p.method || p.shorthand)
            throw Error("Invalid serialized property");
          const key = p.key.name ?? p.key.value;
          if (Object.hasOwn(result, key)) throw Error("Duplicate serialized property");
          Object.defineProperty(result, key, {
            value: read(p.value),
            enumerable: true,
            writable: true,
            configurable: true,
          });
        }
        return result;
      }
      case "UnaryExpression":
        if (n.operator === "void" && n.argument.value === 0) return undefined;
        if (n.operator === "!" && [0, 1].includes(n.argument.value)) return !n.argument.value;
        if (n.operator === "-" && typeof n.argument.value === "number") return -n.argument.value;
        break;
      case "AssignmentExpression": {
        const key = reference(n.left);
        if (n.operator !== "=" || refs.has(key)) throw Error("Invalid serialized assignment");
        const value = read(n.right);
        refs.set(key, value);
        return value;
      }
      case "MemberExpression": {
        const key = reference(n);
        if (!refs.has(key)) throw Error("Unknown serialized reference");
        return refs.get(key);
      }
    }
    throw Error("Unsupported serialized value " + n.type);
  }
  const { matches } = read(expression);
  if (
    !Array.isArray(matches) ||
    !matches.length ||
    matches.some((m) => typeof m.i !== "string" || m.s !== "success")
  ) {
    throw Error("Published page has incomplete route data");
  }
  return matches.map((m) => ({ id: m.i.replaceAll("\0", "/"), data: m.l }));
}

export function routeFile(pathname) {
  const decoded = decodeURIComponent(pathname);
  if (
    !decoded.startsWith("/") ||
    /[\\\0?#]/.test(decoded) ||
    decoded.split("/").some((p) => p === "." || p === "..")
  ) {
    throw Error("Invalid published route");
  }
  return decoded.replace(/^\/|\/$/g, "") + (decoded === "/" ? "" : "/") + "index.html";
}
