import { Hono } from "hono";
import { UrlController } from "../controllers/url.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

export const urlRoutes = new Hono();

// Every route in this router requires authentication.
urlRoutes.use("*", authMiddleware);

urlRoutes.post("/", UrlController.create);
urlRoutes.get("/", UrlController.list);
urlRoutes.get("/summary", UrlController.summary);
urlRoutes.get("/:id", UrlController.getOne);
urlRoutes.get("/:id/analytics", UrlController.analytics);
urlRoutes.delete("/:id", UrlController.remove);
