"""Проверяем форму запроса и отказ при недостоверном ответе провайдера."""
import io
import runpy
import unittest
from pathlib import Path
from unittest.mock import patch
from urllib.parse import parse_qs

api = runpy.run_path(str(Path(__file__).parents[1] / "scripts/beget-free-bytes.py"))


def response(plan, used):
    return {"status": "success", "answer": {"status": "success", "result": {"plan_quota": plan, "user_quota": used}}}


class BegetCapacity(unittest.TestCase):
    def test_request(self):
        with patch.dict(api["fetch"].__globals__) as env:
            class Opener:
                def open(inner, request, timeout):
                    self.assertEqual(request.full_url, "https://api.beget.com/api/user/getAccountInfo")
                    self.assertEqual(request.method, "POST")
                    self.assertEqual(parse_qs(request.data.decode()), {"login": ["test"], "passwd": ["A+B&?"], "output_format": ["json"]})
                    self.assertGreater(timeout, 0)
                    return io.BytesIO(b'{"status":"success","answer":{"status":"success","result":{"plan_quota":"100","user_quota":80.5}}}')
            env["build_opener"] = lambda handler: Opener()
            self.assertEqual(api["fetch"]("test", "A+B&?"), 18_500_000)

    def test_invalid(self):
        for invalid in [None, {}, {"status":"error"}, {"status":"success","answer":{"status":"error"}},
                        response(100,None), response(100,"NaN"), response(100,-5), response(100,False)]:
            with self.subTest(invalid=invalid), self.assertRaises(ValueError):
                api["available_bytes"](invalid)
        self.assertEqual(api["available_bytes"](response(90,100)), 0)
        with self.assertRaises(ValueError):
            api["fetch"]("", "")


if __name__ == "__main__":
    unittest.main()
