"""Проверка свежей квоты аккаунта Beget перед отправкой полного выпуска."""
import math
import re
import sys
import tarfile
import time
from pathlib import Path

BLOCK = 4096
RESERVE = 1024 ** 3


def check(reading, archives, now):
    match = re.fullmatch(r"(\d{1,12})@(\d{10})", reading)
    if not match:
        raise ValueError("Enter fresh Beget free MB and UTC Unix time as freeMB@timestamp")
    free_mb, measured = map(int, match.groups())
    if not 0 <= now - measured <= 15 * 60:
        raise ValueError("Beget quota reading must be from the last 15 minutes")
    required = RESERVE
    for path in archives:
        required += path.stat().st_size
        with tarfile.open(path, "r|gz") as tar:
            for member in tar:
                required += BLOCK if member.isdir() else math.ceil(member.size / BLOCK) * BLOCK
    available = free_mb * 1_000_000
    print(f"Account free (conservative): {available} bytes; required including reserve: {required}")
    if available < required:
        raise ValueError("Insufficient Beget account quota for a full release")


if __name__ == "__main__":
    check(sys.argv[1], [Path(path) for path in sys.argv[2:]], time.time())
