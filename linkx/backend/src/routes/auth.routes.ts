import { Hono } from "hono";
import { AuthController } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

export const authRoutes = new Hono();

authRoutes.post("/register", AuthController.register);
authRoutes.post("/login", AuthController.login);
authRoutes.get("/me", authMiddleware, AuthController.me);
