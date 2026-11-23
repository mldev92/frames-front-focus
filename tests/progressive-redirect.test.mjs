import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, resolve, sep } from "node:path";

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
