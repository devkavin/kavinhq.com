import { afterEach, expect, test, vi } from "vitest";
import { apiRequest } from "../src/lib/api";
import { normalizeApiError } from "../src/lib/errors";

afterEach(() => vi.restoreAllMocks());

test("normalizes FastAPI validation arrays into readable text", () => {
  expect(normalizeApiError({ detail: [{ loc: ["body", "email"], msg: "Field required" }] })).toBe("Email: Field required");
});

test("returns null for an empty successful response", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 204 })));
  await expect(apiRequest("/api/auth/logout", { method: "POST" })).resolves.toBeNull();
});

test("reports malformed API responses without exposing parser errors", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("not-json", { status: 500 })));
  await expect(apiRequest("/api/projects")).rejects.toThrow("The server returned an unreadable response.");
});

test("performs one refresh attempt after an authenticated 401", async () => {
  const fetchMock = vi.fn()
    .mockResolvedValueOnce(new Response(JSON.stringify({ detail: "expired" }), { status: 401, headers: { "Content-Type": "application/json" } }))
    .mockResolvedValueOnce(new Response(JSON.stringify({ id: "1" }), { status: 200, headers: { "Content-Type": "application/json" } }))
    .mockResolvedValueOnce(new Response(JSON.stringify([{ id: 1 }]), { status: 200, headers: { "Content-Type": "application/json" } }));
  vi.stubGlobal("fetch", fetchMock);
  await expect(apiRequest("/api/projects", {}, true)).resolves.toEqual([{ id: 1 }]);
  expect(fetchMock).toHaveBeenCalledTimes(3);
});
