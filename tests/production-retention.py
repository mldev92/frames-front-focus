"""Проверяет полный цикл архивации и защиты выпуска на временном сайте."""
import hashlib
import json
import os
import subprocess
import sys
import tarfile
import tempfile
import time
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def run(*args, ok=True):
    result = subprocess.run(args, capture_output=True, text=True)
    if (result.returncode == 0) != ok:
        raise AssertionError((args, result.stdout, result.stderr))
    return result.stdout


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


class Retention(unittest.TestCase):
    def test_archive_and_headroom(self):
        with tempfile.TemporaryDirectory() as workspace:
            work = Path(workspace)
            sha = "a" * 40
            release, manifest = self.release(work / sha, sha)
            archive = work / "release.tgz"
            with tarfile.open(archive, "w:gz") as tar:
                tar.add(release, arcname=".")
            verify = [sys.executable, ROOT / "scripts/verify-retention-archive.py", archive, sha]
            run(*verify, manifest)
            run(*verify, "0" * 64, ok=False)
            now = int(time.time())
            check = [sys.executable, ROOT / "scripts/check-release-headroom.py"]
            run(*check, f"2000@{now}", archive)
            for reading in ("", f"1@{now}", f"2000@{now-1000}", f"2000@{now+120}"):
                run(*check, reading, archive, ok=False)

    def release(self, path, sha):
        path.mkdir()
        (path / ".release-sha").write_text(sha)
        (path / "index.html").write_text("Shared public content")
        checks = {p.name: digest(p) for p in path.iterdir()}
        manifest = path / "release-manifest.json"
        manifest.write_text(json.dumps({"frontendSha": sha, "files": checks}))
        return path, digest(manifest)

    @unittest.skipUnless(os.name == "posix", "Production uses POSIX release pointers")
    def test_prune_and_interrupted_cleanup(self):
        with tempfile.TemporaryDirectory() as workspace:
            root = Path(workspace) / "public_html"
            base = root / "o100_frontend_releases"
            state = root.parent / ".o100-deploy"
            base.mkdir(parents=True)
            (state / "transactions").mkdir(parents=True)
            (state / "lock").touch()
            live, previous, older, interrupted = [ch * 40 for ch in "abcd"]
            manifests = {}
            for sha in (live, previous, older, interrupted):
                _, manifests[sha] = self.release(base / sha, sha)
                tx = state / "transactions" / f"20261122-{sha}"
                tx.mkdir()
                (tx / "status").write_text("deployed")
            tx = state / "transactions" / f"20261122-{live}"
            (state / "active-transaction").write_text(str(tx))
            (tx / "previous").write_text(str(base / previous))
            (root / "o100_frontend_current").symlink_to(base / live)
            cli = ["php", ROOT / "deploy/retain-release.php", root]
            self.assertEqual(set(json.loads(run(*cli, "list"))["older"]), {older, interrupted})
            for sha in (live, previous):
                run(*cli, "prune", live, sha, manifests[sha], ok=False)
            run(*cli, "prune", older, older, manifests[older], ok=False)
            unexpected = base / older / "extra"
            unexpected.touch()
            run(*cli, "prune", live, older, manifests[older], ok=False)
            unexpected.unlink()
            run(*cli, "prune", live, older, manifests[older])
            self.assertFalse((base / older).exists())

            receipt = state / f"retention-{interrupted}.json"
            receipt.write_bytes((base / interrupted / "release-manifest.json").read_bytes())
            detached = base / f".pruning-{interrupted}-{manifests[interrupted]}"
            (base / interrupted).rename(detached)
            (detached / ".release-sha").unlink()
            self.assertIn(interrupted, json.loads(run(*cli, "list"))["pending"])
            changed = detached / "index.html"
            original = changed.read_bytes()
            changed.write_text("Changed")
            run(*cli, "finish", live, interrupted, manifests[interrupted], ok=False)
            changed.write_bytes(original)
            run(*cli, "finish", live, interrupted, manifests[interrupted])
            self.assertFalse(detached.exists())
            self.assertEqual({p.name for p in base.iterdir()}, {live, previous})


if __name__ == "__main__":
    unittest.main()
