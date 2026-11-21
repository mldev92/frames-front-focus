import { execFileSync } from "node:child_process";
import path from "node:path";
import { isDeepStrictEqual } from "node:util";
import { pathToFileURL } from "node:url";
import ts from "typescript";
import { registry, standalonePages } from "./standalone-pages.mjs";

const git = (...args) =>
  execFileSync("git", args, { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
const presentation = new Set([
  "component",
  "errorComponent",
  "pendingComponent",
  "notFoundComponent",
  "shellComponent",
  "head",
]);
const print = ts.createPrinter({ removeComments: true });
const buildTools = new Set([
  "vite.config.code-only.ts",
  "deploy/deploy_production.ps1",
  "deploy/release.sh",
  "deploy/verify-release.php",
  "deploy/verify-code-only.php",
  "deploy/accept-catalog-release.php",
  ...[
    "published-page",
    "published-loaders",
    "published-render",
    "standalone-pages",
    "storefront-release-mode",
    "build-code-only",
    "code-only-workflow",
  ].map((n) => "scripts/" + n + ".mjs"),
]);

// Отдельно отслеживаем параметры маршрута и все локальные значения, которые
// читает загрузчик. Изменения импортов, используемых только для вывода, допустимы.
function routeInputs(file) {
  const bindings = new Map();
  const imports = new Map();
  const roots = [];
  let staticPath;
  for (const s of file.statements) {
    if (ts.isImportDeclaration(s)) {
      const clause = s.importClause;
      if (!clause) {
        roots.push(s);
        continue;
      }
      if (clause.isTypeOnly) continue;
      const module = s.moduleSpecifier.text;
      if (clause.name) imports.set(clause.name.text, [module, "default"]);
      const named = clause.namedBindings;
      if (named && ts.isNamespaceImport(named)) imports.set(named.name.text, [module, "*"]);
      if (named && ts.isNamedImports(named))
        for (const n of named.elements) {
          if (!n.isTypeOnly) imports.set(n.name.text, [module, (n.propertyName || n.name).text]);
        }
    } else if (ts.isVariableStatement(s)) {
      for (const d of s.declarationList.declarations) {
        if (d.name.getText(file) !== "Route") {
          bindings.set(d.name.getText(file), d);
          continue;
        }
        const call = d.initializer;
        if (
          !call ||
          !ts.isCallExpression(call) ||
          call.arguments.length !== 1 ||
          !ts.isObjectLiteralExpression(call.arguments[0])
        ) {
          throw Error("Unknown route declaration: " + file.fileName);
        }
        if (
          ts.isCallExpression(call.expression) &&
          ts.isIdentifier(call.expression.expression) &&
          isDeepStrictEqual(imports.get(call.expression.expression.text), [
            "@tanstack/react-router",
            "createFileRoute",
          ]) &&
          call.expression.arguments.length === 1 &&
          ts.isStringLiteral(call.expression.arguments[0]) &&
          call.arguments[0].properties.every(
            (property) =>
              ts.isPropertyAssignment(property) &&
              ts.isIdentifier(property.name) &&
              presentation.has(property.name.text),
          ) &&
          call.arguments[0].properties.some(
            (property) => property.name?.getText(file) === "component",
          )
        ) {
          staticPath = call.expression.arguments[0].text.replace(/\/?$/, "/");
        }
        roots.push(
          call.expression,
          ...call.arguments[0].properties.filter((p) => !presentation.has(p.name?.getText(file))),
        );
      }
    } else if (s.name) bindings.set(s.name.getText(file), s);
    else if (!ts.isExportDeclaration(s)) roots.push(s);
  }
  const visited = new Set();
  const usedImports = new Map();
  function visit(n) {
    if (ts.isIdentifier(n)) {
      const name = n.text;
      if (imports.has(name)) usedImports.set(name, imports.get(name));
      const binding = bindings.get(name);
      if (binding && !visited.has(binding)) {
        visited.add(binding);
        visit(binding);
      }
    }
    ts.forEachChild(n, visit);
  }
  roots.forEach(visit);
  const source = [...roots, ...visited].map((n) =>
    print.printNode(ts.EmitHint.Unspecified, n, file),
  );
  return {
    signature: JSON.stringify([source, [...usedImports].sort()]),
    modules: [...usedImports.values()].map(([module]) => module),
    staticPath,
  };
}

function contract(ref) {
  const files = new Set(
    git("ls-tree", "-rz", "--name-only", ref, "--", "src").split("\0").filter(Boolean),
  );
  const protectedFiles = new Set();
  const routes = new Map();
  const staticRoutes = new Map();
  function inspect(file) {
    return ts.createSourceFile(
      file,
      git("show", ref + ":" + file),
      ts.ScriptTarget.Latest,
      true,
      file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
    );
  }
  function dependency(importer, module) {
    if (!module.startsWith("@/") && !module.startsWith(".")) return;
    const base = module.startsWith("@/")
      ? "src/" + module.slice(2)
      : path.posix.join(path.posix.dirname(importer), module);
    const file = [base, base + ".ts", base + ".tsx", base + "/index.ts", base + "/index.tsx"].find(
      (p) => files.has(p),
    );
    if (!file || protectedFiles.has(file)) return;
    protectedFiles.add(file);
    if (!/\.tsx?$/.test(file)) return;
    for (const s of inspect(file).statements) {
      if (
        (ts.isImportDeclaration(s) || ts.isExportDeclaration(s)) &&
        !s.importClause?.isTypeOnly &&
        !s.isTypeOnly &&
        s.moduleSpecifier
      ) {
        dependency(file, s.moduleSpecifier.text);
      }
    }
  }
  for (const name of files) {
    if (!/^src\/routes\/.+\.tsx?$/.test(name)) continue;
    const { signature, modules, staticPath } = routeInputs(inspect(name));
    routes.set(name, signature);
    if (staticPath) staticRoutes.set(name, staticPath);
    for (const module of modules) dependency(name, module);
  }
  const standalone = files.has(registry)
    ? standalonePages(JSON.parse(git("show", ref + ":" + registry)))
    : [];
  return { routes, staticRoutes, protectedFiles, standalone };
}

// При первом выпуске подключение реестра не меняет остальную логику сборки каталога.
function registryIntegration(parent, target, file) {
  const before = git("show", parent + ":" + file);
  const after = git("show", target + ":" + file);
  const importer = 'import { registry, standalonePages } from "./standalone-pages.mjs";\n';
  const entry =
    '  ...standalonePages(JSON.parse(await readFile(new URL("../" + registry, import.meta.url), "utf8"))),\n';
  return (
    after.includes(importer) &&
    after.includes(entry) &&
    after.replace(importer, "").replace(entry, "") === before
  );
}

export function releaseMode(parent, target = "HEAD") {
  if (!/^[a-f0-9]{40}$/.test(parent)) throw Error("Published frontend SHA required");
  const paths = git("diff", "--no-renames", "--name-only", "-z", parent, target)
    .split("\0")
    .filter(Boolean);
  const reasons = [];
  let before, after;
  const additions = new Map();
  if (paths.includes(registry)) {
    before = contract(parent);
    after = contract(target);
    const added = after.standalone.filter((route) => !before.standalone.includes(route));
    for (const route of added) {
      const file = `src/routes${route.slice(0, -1)}.tsx`;
      if (!before.routes.has(file) && after.staticRoutes.get(file) === route)
        additions.set(file, route);
    }
    if (
      added.length !== additions.size ||
      before.standalone.some((route) => !after.standalone.includes(route))
    ) {
      reasons.push(registry);
    }
  }
  for (const file of paths) {
    if (
      buildTools.has(file) ||
      /^(tests\/|\.github\/workflows\/)/.test(file) ||
      file.endsWith(".md")
    )
      continue;
    if (
      file === registry ||
      additions.has(file) ||
      (additions.size && file === "src/routeTree.gen.ts")
    )
      continue;
    if (
      file === "scripts/generate-production-manifest.mjs" &&
      registryIntegration(parent, target, file)
    )
      continue;
    if (/^public\/.*\.(?:ico|png|jpe?g|webp|avif|svg|woff2?)$/i.test(file)) continue;
    if (file === "package.json" || file === "bun.lock") {
      const buildInputs = (ref) => {
        const parsed = ts.parseConfigFileTextToJson(file, git("show", ref + ":" + file));
        if (parsed.error) throw Error("Invalid dependency manifest: " + file);
        const pkg = file === "bun.lock" ? parsed.config.workspaces[""] : parsed.config;
        // Прямое объявление уже закреплённого парсера не меняет граф пакетов.
        if (pkg.devDependencies?.acorn === "8.16.0") delete pkg.devDependencies.acorn;
        return parsed.config;
      };
      if (isDeepStrictEqual(buildInputs(parent), buildInputs(target))) continue;
    }
    // Параметры сборки, инвентарь, SEO и серверные маршруты проверяются полным путём.
    if (
      /^src\/(?:components\/|hooks\/|lib\/|routes\/|styles\.css$)/.test(file) ||
      file === "src/data/promotions.ts"
    ) {
      before ??= contract(parent);
      after ??= contract(target);
      if (
        !before.protectedFiles.has(file) &&
        !after.protectedFiles.has(file) &&
        before.routes.get(file) === after.routes.get(file)
      )
        continue;
    }
    reasons.push(file);
  }
  return {
    mode: reasons.length ? "full" : "code-only",
    reasons,
    standalonePaths: [...additions.values()],
  };
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = releaseMode(process.argv[2], process.argv[3]);
  if (result.reasons.length)
    console.error("Full catalog build required:", result.reasons.join(", "));
  console.log(result.mode);
}
