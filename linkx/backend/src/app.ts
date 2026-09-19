import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { authRoutes } from "./routes/auth.routes.js";
import { urlRoutes } from "./routes/url.routes.js";
import { redirectRoutes } from "./routes/redirect.routes.js";
import { failure } from "./utils/apiResponse.js";

export const app = new Hono();

app.use("*", logger());

// Only allow the configured frontend origin — never wildcard in production.
app.use(
  "*",
  cors({
    origin: env.frontendUrl,
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.get("/health", (c) => c.json({ success: true, data: { status: "ok" } }));

// REST API
app.route("/api/auth", authRoutes);
app.route("/api/urls", urlRoutes);

// Public short-link redirects live at the domain root, separate from /api.
app.route("/", redirectRoutes);

app.notFound((c) => failure(c, "NOT_FOUND", "Route not found", 404));

app.onError(errorHandler);
