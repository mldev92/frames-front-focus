"""Доступное место аккаунта Beget в байтах. Пароль передаётся только в теле HTTPS POST."""
import json
import os
import sys
from decimal import Decimal, InvalidOperation
from urllib.error import URLError
from urllib.parse import urlencode
from urllib.request import HTTPRedirectHandler, Request, build_opener


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def available_bytes(response):
    answer = response.get("answer") if isinstance(response, dict) else None
    if not isinstance(answer, dict) or response.get("status") != "success" or answer.get("status") != "success":
        raise ValueError("Beget rejected the account information request")
    result = answer.get("result")
    if not isinstance(result, dict):
        raise ValueError("Missing Beget account information")
    quota = []
    for key in ("plan_quota", "user_quota"):
        try:
            value = Decimal(str(result.get(key)))
        except InvalidOperation:
            raise ValueError(f"Invalid Beget field {key}") from None
        if not value.is_finite() or not 0 <= value <= 2**31:
            raise ValueError(f"Invalid Beget field {key}")
        quota.append(value)
    # Десятичный МБ даёт консервативную оценку, оставляем 1 МБ на округление отчёта.
    return int(max(0, quota[0] - quota[1] - 1) * 1_000_000)


def fetch(login, password):
    if not login or not password:
        raise ValueError("Configure BEGET_API_LOGIN and BEGET_API_PASSWORD in the production environment")
    body = urlencode({"login": login, "passwd": password, "output_format": "json"}).encode()
    request = Request("https://api.beget.com/api/user/getAccountInfo", data=body, method="POST")
    with build_opener(NoRedirect).open(request, timeout=20) as reply:
        data = reply.read(65537)
    if len(data) > 65536:
        raise ValueError("Oversized Beget response")
    return available_bytes(json.loads(data, parse_float=Decimal))


if __name__ == "__main__":
    try:
        print(fetch(os.environ.get("BEGET_API_LOGIN"), os.environ.get("BEGET_API_PASSWORD")))
    except (ValueError, URLError, OSError) as error:
        # Ответ об ошибке от провайдера может содержать входные параметры.
        sys.exit(str(error) if type(error) is ValueError else "Unable to read Beget disk quota")
