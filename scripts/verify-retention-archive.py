"""Проверяет архив выпуска без распаковки на диск."""
import hashlib
import json
import sys
import tarfile
from pathlib import Path, PurePosixPath


def verify(archive, sha, manifest_hash):
    files = {}
    metadata = {}
    with tarfile.open(archive, "r|gz") as stream:
        for entry in stream:
            path = PurePosixPath(entry.name)
            if path.is_absolute() or ".." in path.parts:
                raise ValueError(f"Unsafe archive path: {path}")
            if entry.isdir():
                continue
            name = str(path)
            if not entry.isfile() or name in files:
                raise ValueError(f"Unexpected archive entry: {name}")
            data = stream.extractfile(entry)
            if name in (".release-sha", "release-manifest.json"):
                metadata[name] = data.read()
                files[name] = hashlib.sha256(metadata[name]).hexdigest()
            else:
                files[name] = hashlib.file_digest(data, "sha256").hexdigest()

    manifest = json.loads(metadata["release-manifest.json"])
    if files.pop("release-manifest.json") != manifest_hash:
        raise ValueError("Archive manifest differs from the server")
    if metadata[".release-sha"].decode().strip() != sha or manifest["frontendSha"] != sha:
        raise ValueError("Archive release identity mismatch")
    if not files or files != manifest["files"]:
        raise ValueError("Archive file set or file checksums differ from the manifest")
    with Path(archive).open("rb") as handle:
        digest = hashlib.file_digest(handle, "sha256").hexdigest()
    return {"release": sha, "manifestSha256": manifest_hash, "files": len(files),
            "archiveSha256": digest, "archiveBytes": Path(archive).stat().st_size}


if __name__ == "__main__":
    print(json.dumps(verify(*sys.argv[1:])))
