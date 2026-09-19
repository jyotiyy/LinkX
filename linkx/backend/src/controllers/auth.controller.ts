import type { Context } from "hono";
import { RegisterSchema, LoginSchema } from "../validators/auth.validator.js";
import { AuthService } from "../services/auth.service.js";
import { success } from "../utils/apiResponse.js";
import { getAuth } from "../middleware/auth.middleware.js";

export const AuthController = {
  async register(c: Context) {
    const body = RegisterSchema.parse(await c.req.json());
    const result = await AuthService.register(body);
    return success(c, result, 201);
  },

  async login(c: Context) {
    const body = LoginSchema.parse(await c.req.json());
    const result = await AuthService.login(body);
    return success(c, result, 200);
  },

  async me(c: Context) {
    const { userId } = getAuth(c);
    const user = await AuthService.getById(userId);
    return success(c, user);
  },
};
