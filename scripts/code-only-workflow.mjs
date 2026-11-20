import { execFileSync } from "node:child_process";
import { readFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";

// Локальный деплой использует тот же проверенный артефакт, что и Actions.
const [sha, routing, execute] = process.argv.slice(2);
const backend = JSON.parse(readFileSync(0, "utf8").replace(/^\uFEFF/, ""));
const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();
const refs = git(
  "for-each-ref",
  "--points-at",
  sha,
  "--format=%(refname:strip=3)",
  "refs/remotes/origin",
)
  .split(/\r?\n/)
  .filter((r) => r && r !== "HEAD");
const branch = git("branch", "--show-current");
const ref = refs.includes(branch) ? branch : refs[0];
if (!ref) throw Error("A published branch pointing to the requested commit is required");
async function workflow(name, inputs) {
  const url = execFileSync("gh", ["workflow", "run", name, "--ref", ref, "--json"], {
    input: JSON.stringify(inputs),
    encoding: "utf8",
    stdio: ["pipe", "pipe", "inherit"],
  }).trim();
  const id = url.match(/\/actions\/runs\/(\d+)\b/)?.[1];
  if (!id) throw Error("Cannot identify dispatched workflow: " + url);
  console.log(url);
  let head;
  for (let attempt = 1; ; attempt++) {
    try {
      head = execFileSync("gh", ["run", "view", id, "--json", "headSha", "--jq", ".headSha"], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      }).trim();
      break;
    } catch (error) {
      // Сразу после запуска Actions иногда ещё не видит выданный ID.
      if (attempt >= 5 || !/HTTP 404\b/.test(error.stderr || "")) throw error;
      await delay(attempt * 1000);
    }
  }
  if (head !== sha) throw Error("Workflow branch changed before dispatch");
  execFileSync("gh", ["run", "watch", id, "--exit-status", "--interval", "20"], {
    stdio: "inherit",
  });
  return id;
}
const binding = { backend_sha: backend.sha, routing_sha256: routing };
const run = await workflow("prepare-production.yml", {
  ...binding,
  backend_manifest: JSON.stringify(backend),
});
const directory = mkdtempSync(path.join(tmpdir(), "o100-code-receipt-"));
execFileSync(
  "gh",
  ["run", "download", run, "--name", "production-candidate-checksum", "--dir", directory],
  { stdio: "inherit" },
);
const checksum = readFileSync(path.join(directory, "production-release.tgz.sha256"), "utf8").match(
  /^([a-f0-9]{64})  production-release\.tgz\s*$/,
)?.[1];
if (!checksum) throw Error("Invalid candidate checksum");
console.log("Candidate:", run, "SHA256:", checksum);
if (execute === "execute")
  await workflow("deploy-production.yml", {
    ...binding,
    expected_sha: sha,
    candidate_run_id: run,
    artifact_sha256: checksum,
  });
