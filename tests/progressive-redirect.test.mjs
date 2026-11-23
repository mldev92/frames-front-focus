import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { execFile, execFileSync, spawnSync } from "node:child_process";
import { createServer } from "node:http";
import { promisify } from "node:util";
import { tmpdir } from "node:os";
import { dirname, join, resolve, sep } from "node:path";

test("Перенаправление старых прогрессивных линз меняет только согласованное правило", (t) => {
  const fixture = mkdtempSync(join(tmpdir(), "o100-progressive-routing-"));
  t.after(() => {
    assert.ok(resolve(fixture).startsWith(resolve(tmpdir()) + sep + "o100-progressive-routing-"));
    rmSync(fixture, { recursive: true, force: true });
  });
  const baseline = join(fixture, "htaccess");
  const candidate = join(fixture, "manifest.json");
  const output = join(fixture, "next.htaccess");
  const destination = "/catalog_s/linzy_dlya_ochkov/progressivnye/";
  const prefix = String.raw`RedirectMatch 301 ^/ochkovye\-linzy/dizayn/progressivnye\.php/?$ https://optika100.com`;
  const older = prefix + "/blog/linzy-dlya-ochkov/progressivnye-linzy/";
  const updated = prefix + destination;
  const original = [
    "# BEGIN O100 FRONTEND",
    "RewriteEngine On",
    "# END O100 FRONTEND",
    "# BEGIN O100 REDIRECTS",
    older,
    "# END O100 REDIRECTS",
    "",
  ].join("\r\n");
  assert.ok(readFileSync("deploy/redirects.production.txt", "utf8").includes(updated));
  const run = (source, rule, withTarget = true) => {
    writeFileSync(baseline, source);
    writeFileSync(
      candidate,
      JSON.stringify({
        codeOnly: { routingRedirects: [rule] },
        files: withTarget ? { [destination.slice(1) + "index.html"]: "present" } : {},
        retiredPaths: [],
      }),
    );
    return [
      "deploy/merge-routing.php",
      baseline,
      "deploy",
      createHash("sha256").update(source).digest("hex"),
      output,
      candidate,
    ];
  };
  execFileSync("php", run(original, updated), { stdio: "pipe" });
  assert.equal(readFileSync(output, "utf8"), original.replace(older, updated));
  const invalid = [
    [original.replace(older, older + "\r\n" + older), updated],
    [original.replace(older, updated), updated],
    [original, updated, false],
    [original, prefix + "/catalog_s/opravy/"],
  ];
  for (const entry of invalid) {
    assert.notEqual(spawnSync("php", run(...entry), { stdio: "pipe" }).status, 0);
  }
});

test("HTTP-приёмка проверяет оба формата 301 и адреса назначения", async (t) => {
  const fixture = mkdtempSync(join(tmpdir(), "o100-redirect-probe-"));
  t.after(() => {
    assert.ok(resolve(fixture).startsWith(resolve(tmpdir()) + sep + "o100-redirect-probe-"));
    rmSync(fixture, { recursive: true, force: true });
  });
  const routes = [
    "/",
    "/catalog_s/linzy_dlya_ochkov/progressivnye/",
    "/catalog_s/linzy_dlya_ochkov/",
    "/blog/",
  ];
  const redirects = new Map([
    ["/ochkovye-linzy/dizayn/progressivnye.php", routes[1]],
    ["/catalog_s/linzy_dlea%20ochkov/", routes[2]],
  ]);
  const rules = [
    String.raw`RedirectMatch 301 ^/ochkovye\-linzy/dizayn/progressivnye\.php/?$ https://optika100.com` +
      routes[1],
    String.raw`RewriteRule ^catalog_s/linzy_dlea\x20ochkov/?$ https://optika100.com` +
      routes[2] +
      " [R=301,END]",
  ];
  const files = {};
  for (const path of routes) {
    const name = path.slice(1) + "index.html";
    mkdirSync(dirname(join(fixture, name)), { recursive: true });
    writeFileSync(join(fixture, name), path);
    files[name] = createHash("sha256").update(path).digest("hex");
  }
  writeFileSync(
    join(fixture, "release-manifest.json"),
    JSON.stringify({
      frontendSha: "a".repeat(40),
      files,
      backendFiles: {},
      acceptancePaths: routes,
      codeOnly: { routingRedirects: rules },
    }),
  );
  const seen = [];
  const server = createServer((request, response) => {
    seen.push(request.url);
    if (redirects.has(request.url)) {
      response.writeHead(301, { location: "https://optika100.com" + redirects.get(request.url) });
      response.end();
      return;
    }
    response.writeHead(routes.includes(request.url) ? 200 : 404);
    response.end(request.url);
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const phpOptions =
    process.platform === "win32" &&
    !execFileSync("php", ["-m"], { encoding: "utf8" }).match(/^curl$/m)
      ? [
          "-d",
          "extension_dir=" +
            join(
              dirname(execFileSync("php", ["-r", "echo PHP_BINARY;"], { encoding: "utf8" })),
              "ext",
            ),
          "-d",
          "extension=curl",
        ]
      : [];
  const { stdout } = await promisify(execFile)("php", [
    ...phpOptions,
    "deploy/accept-catalog-release.php",
    fixture,
    fixture,
    "http://127.0.0.1:" + server.address().port,
    "deploy-code-only",
  ]);
  assert.equal(JSON.parse(stdout).passed, true);
  assert.deepEqual(seen.slice(routes.length), [
    "/ochkovye-linzy/dizayn/progressivnye.php",
    routes[1],
    "/catalog_s/linzy_dlea%20ochkov/",
    routes[2],
  ]);
});
