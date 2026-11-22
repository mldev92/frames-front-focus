import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { setTimeout as delay } from "node:timers/promises";

const repo = "mldev92/frames-front-focus";
async function workflow(name, inputs) {
  const url = execFileSync("gh", ["workflow", "run", name, "--repo", repo, "--ref", "main", "--json"], {
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
      head = execFileSync(
        "gh",
        ["run", "view", id, "--repo", repo, "--json", "headBranch", "--jq", ".headBranch"],
        {
          encoding: "utf8",
          stdio: ["ignore", "pipe", "pipe"],
        },
      ).trim();
      break;
    } catch (error) {
      // Сразу после запуска Actions иногда ещё не видит выданный ID.
      if (attempt >= 5 || !/HTTP 404\b/.test(error.stderr || "")) throw error;
      await delay(attempt * 1000);
    }
  }
  if (head !== "main") throw Error("The release workflow did not run from main");
  execFileSync("gh", ["run", "watch", id, "--repo", repo, "--exit-status", "--interval", "20"], {
    stdio: "inherit",
  });
  return id;
}

const request = JSON.parse(readFileSync(0, "utf8").replace(/^\uFEFF/, ""));
if (request.rollback) {
  await workflow("rollback-production.yml", { deployed_sha: request.sha });
} else {
  const inputs = { storefront_ref: request.sha };
  if (request.snapshotRun) {
    inputs.api_snapshot_run_id = request.snapshotRun;
    inputs.api_snapshot_sha256 = request.snapshotDigest;
  }
  const id = request.candidateRun || await workflow("prepare-production.yml", inputs);
  if (request.execute) {
    const publication = { candidate_run_id: id };
    if (request.sha) publication.expected_sha = request.sha;
    await workflow("deploy-production.yml", publication);
  }
}
