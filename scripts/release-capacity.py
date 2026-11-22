"""Расчёт места для сборки отдельного дерева выпуска и отката."""
import argparse
import hashlib
import json
import math
import os
from pathlib import Path
import tarfile

BLOCK = 4096


def allocated(size):
    return max(1, math.ceil(size / BLOCK)) * BLOCK


def estimate(archive, tools, parent, batch):
    # Каталоги и записи hard link занимают место даже при неизменных данных.
    directories = set()
    entries = 0
    candidate_files = 0
    new_files = 0
    size = 0
    with tarfile.open(archive, "r:gz") as tar:
        for member in tar:
            path = Path(member.name)
            if path.is_absolute() or ".." in path.parts:
                raise ValueError(f"Unexpected archive path: {path}")
            directories.update(path.parents)
            if member.isdir():
                directories.add(path)
                continue
            if not member.isfile():
                raise ValueError(f"Unexpected archive entry: {path}")
            entries += 1
            candidate_files += 1
            if parent is not None and path.as_posix() in parent:
                digest = hashlib.file_digest(tar.extractfile(member), "sha256").hexdigest()
                if parent[path.as_posix()] == digest:
                    continue
            copies = 3 if path.parts[:1] == ("assets",) else 1
            new_files += copies
            size += copies * allocated(member.size)
    if parent is not None:
        # cp -rl сначала создаёт также каталоги, удалённые из нового выпуска.
        for name in parent:
            directories.update(Path(name).parents)
        entries += len(parent)
    with tarfile.open(tools) as tar:
        for member in tar:
            size += allocated(member.size)
            new_files += 1
    size += allocated(os.path.getsize(tools))
    if batch:
        # zip, xz и распакованный batch; учитываем их одновременно консервативно.
        import lzma
        with lzma.open(batch) as stream:
            while chunk := stream.read(1024 * 1024):
                size += allocated(len(chunk))
        size += 2 * allocated(os.path.getsize(batch))
    else:
        size += allocated(os.path.getsize(archive))
    return {"bytes": size + (len(directories) + 1) * BLOCK + entries * 512 + 16 * 1024**2,
            "files": new_files + len(directories) + (max(candidate_files, len(parent)) if parent is not None else 0) + 128}


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("archive")
    parser.add_argument("tools")
    parser.add_argument("--parent")
    parser.add_argument("--batch")
    args = parser.parse_args()
    parent = json.loads(Path(args.parent).read_text())["files"] if args.parent else None
    print(json.dumps(estimate(args.archive, args.tools, parent, args.batch)))
