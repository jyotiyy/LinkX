import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { app } from "../src/app.js";
import { prisma } from "../src/config/prisma.js";

let token: string;
let secondUserToken: string;

async function registerAndLogin(email: string) {
  const res = await app.request("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "URL Tester", email, password: "Password123!" }),
  });
  const body = await res.json();
  return body.data.token as string;
}

describe("URL API", () => {
  beforeAll(async () => {
    token = await registerAndLogin(`url-owner-${Date.now()}@example.com`);
    secondUserToken = await registerAndLogin(`url-other-${Date.now()}@example.com`);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("creates a short URL", async () => {
    const res = await app.request("/api/urls", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ originalUrl: "https://example.com/some/page" }),
    });

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.shortCode).toBeTruthy();
    expect(body.data.clickCount).toBe(0);
  });

  it("creates a short URL with a custom alias", async () => {
    const alias = `alias-${Date.now()}`;
    const res = await app.request("/api/urls", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ originalUrl: "https://example.com", customAlias: alias }),
    });

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.customAlias).toBe(alias);
  });

  it("rejects a duplicate custom alias", async () => {
    const alias = `dup-alias-${Date.now()}`;
    await app.request("/api/urls", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ originalUrl: "https://example.com/1", customAlias: alias }),
    });

    const res = await app.request("/api/urls", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ originalUrl: "https://example.com/2", customAlias: alias }),
    });

    expect(res.status).toBe(409);
  });

  it("rejects a reserved alias", async () => {
    const res = await app.request("/api/urls", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ originalUrl: "https://example.com", customAlias: "admin" }),
    });

    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error.code).toBe("RESERVED_ALIAS");
  });

  it("rejects an invalid URL", async () => {
    const res = await app.request("/api/urls", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ originalUrl: "not-a-url" }),
    });

    expect(res.status).toBe(422);
  });

  it("redirects and tracks a click", async () => {
    const create = await app.request("/api/urls", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ originalUrl: "https://example.com/redirect-target" }),
    });
    const created = (await create.json()).data;

    const redirectRes = await app.request(`/${created.shortCode}`, { redirect: "manual" });
    expect(redirectRes.status).toBe(302);
    expect(redirectRes.headers.get("location")).toBe("https://example.com/redirect-target");

    const getRes = await app.request(`/api/urls/${created.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const updated = (await getRes.json()).data;
    expect(updated.clickCount).toBe(1);
  });

  it("returns 404 for a non-existent short code", async () => {
    const res = await app.request("/does-not-exist-xyz");
    expect(res.status).toBe(404);
  });

  it("prevents a user from accessing another user's URL", async () => {
    const create = await app.request("/api/urls", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ originalUrl: "https://example.com/private" }),
    });
    const created = (await create.json()).data;

    const res = await app.request(`/api/urls/${created.id}`, {
      headers: { Authorization: `Bearer ${secondUserToken}` },
    });

    expect(res.status).toBe(403);
  });

  it("deletes a URL", async () => {
    const create = await app.request("/api/urls", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ originalUrl: "https://example.com/to-delete" }),
    });
    const created = (await create.json()).data;

    const del = await app.request(`/api/urls/${created.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(del.status).toBe(204);

    const getRes = await app.request(`/api/urls/${created.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(getRes.status).toBe(404);
  });

  it("returns 404 when deleting a non-existent URL", async () => {
    const res = await app.request("/api/urls/nonexistent-id-123", {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(404);
  });

  it("rejects requests without a token", async () => {
    const res = await app.request("/api/urls");
    expect(res.status).toBe(401);
  });
});
