import assert from "node:assert/strict";
import test from "node:test";

test("securePost refreshes an expired CSRF token and retries once", async () => {
  const originalFetch = globalThis.fetch;
  const postedTokens = [];
  let csrfRequests = 0;

  globalThis.fetch = async (input, init = {}) => {
    if (String(input).endsWith("/api/store/csrf.php")) {
      csrfRequests++;
      return Response.json({ csrfToken: csrfRequests === 1 ? "old-token" : "new-token" });
    }

    postedTokens.push(init.headers["X-CSRF-Token"]);
    if (postedTokens.length === 1) {
      return Response.json(
        { error: "Сессия устарела. Обновите страницу и повторите попытку.", code: "csrf_invalid" },
        { status: 403 },
      );
    }
    return Response.json({ ok: true });
  };

  try {
    const { securePost } = await import("../../src/lib/api/security.ts?csrf-retry-test");
    assert.deepEqual(await securePost("basket_snapshot.php", {}), { ok: true });
    assert.equal(csrfRequests, 2);
    assert.deepEqual(postedTokens, ["old-token", "new-token"]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("a failed CSRF fetch does not block later submissions", async () => {
  const originalFetch = globalThis.fetch;
  let csrfRequests = 0;
  globalThis.fetch = async (input, init = {}) => {
    if (String(input).endsWith("/api/store/csrf.php")) {
      csrfRequests++;
      return csrfRequests === 1
        ? new Response(null, { status: 503 })
        : Response.json({ csrfToken: "fresh-token" });
    }
    assert.equal(init.headers["X-CSRF-Token"], "fresh-token");
    return Response.json({ ok: true });
  };

  try {
    const { securePost } = await import("../../src/lib/api/security.ts");
    const { withStoreWrite } = await import("../../src/lib/api/store-write.ts");
    await assert.rejects(securePost("order_quote.php", {}), /503/);
    assert.deepEqual(await withStoreWrite(() => securePost("order_quote.php", {})), { ok: true });
    assert.equal(csrfRequests, 2);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
