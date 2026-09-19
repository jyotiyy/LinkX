import { Hono } from "hono";
import { RedirectController } from "../controllers/redirect.controller.js";

export const redirectRoutes = new Hono();

// GET /:shortCode — kept separate from the /api/* routers so short links
// can live at the domain root (e.g. https://linkx.com/aB82kP).
redirectRoutes.get("/:shortCode", RedirectController.handle);
