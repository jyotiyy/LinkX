import { prisma } from "../config/prisma.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import { signToken } from "../utils/jwt.js";
import { ApiError } from "../types/index.js";
import type { RegisterInput, LoginInput } from "../validators/auth.validator.js";

function toPublicUser(user: { id: string; name: string; email: string; createdAt: Date }) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
}

export const AuthService = {
  async register(input: RegisterInput) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw new ApiError("CONFLICT", "An account with this email already exists", 409);
    }

    const passwordHash = await hashPassword(input.password);

    const user = await prisma.user.create({
      data: { name: input.name, email: input.email, passwordHash },
    });

    const token = signToken({ userId: user.id, email: user.email });

    return { user: toPublicUser(user), token };
  },

  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user) {
      throw new ApiError("UNAUTHORIZED", "Invalid email or password", 401);
    }

    const valid = await comparePassword(input.password, user.passwordHash);
    if (!valid) {
      throw new ApiError("UNAUTHORIZED", "Invalid email or password", 401);
    }

    const token = signToken({ userId: user.id, email: user.email });

    return { user: toPublicUser(user), token };
  },

  async getById(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new ApiError("NOT_FOUND", "User not found", 404);
    }
    return toPublicUser(user);
  },
};
