import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { app } from "../src/app.js";
import { prisma } from "../src/config/prisma.js";

const uniqueEmail = () => `test-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;

describe("Auth API", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("registers a new user", async () => {
    const email = uniqueEmail();
    const res = await app.request("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test User", email, password: "Password123!" }),
    });

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.user.email).toBe(email);
    expect(body.data.token).toBeTruthy();
  });

  it("rejects duplicate email registration", async () => {
    const email = uniqueEmail();
    const payload = { name: "Dup User", email, password: "Password123!" };

    await app.request("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const res = await app.request("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("CONFLICT");
  });

  it("logs in with correct credentials", async () => {
    const email = uniqueEmail();
    const password = "Password123!";
    await app.request("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Login User", email, password }),
    });

    const res = await app.request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.token).toBeTruthy();
  });

  it("rejects invalid credentials", async () => {
    const email = uniqueEmail();
    await app.request("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Bad Login", email, password: "Password123!" }),
    });

    const res = await app.request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: "WrongPassword!" }),
    });

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error.code).toBe("UNAUTHORIZED");
  });
});
