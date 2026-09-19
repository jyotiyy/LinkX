import { z } from "zod";

const ALIAS_REGEX = /^[A-Za-z0-9_-]+$/;

export const CreateUrlSchema = z.object({
  originalUrl: z
    .string()
    .trim()
    .min(1, "URL is required")
    .max(2048, "URL is too long")
    .url("Must be a valid URL (include http:// or https://)")
    .refine((val) => /^https?:\/\//i.test(val), {
      message: "URL must start with http:// or https://",
    }),
  customAlias: z
    .string()
    .trim()
    .min(3, "Alias must be at least 3 characters")
    .max(30, "Alias must be at most 30 characters")
    .regex(ALIAS_REGEX, "Alias can only contain letters, numbers, hyphens, and underscores")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  expiresAt: z
    .string()
    .datetime()
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export const UpdateUrlSchema = z.object({
  originalUrl: z.string().trim().url("Must be a valid URL").max(2048).optional(),
  customAlias: z
    .string()
    .trim()
    .min(3)
    .max(30)
    .regex(ALIAS_REGEX, "Alias can only contain letters, numbers, hyphens, and underscores")
    .optional(),
  expiresAt: z.string().datetime().optional(),
});

export const PaginationSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? Math.max(1, parseInt(val, 10) || 1) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => {
      const parsed = val ? parseInt(val, 10) : 10;
      if (Number.isNaN(parsed)) return 10;
      return Math.min(Math.max(parsed, 1), 100);
    }),
  search: z
    .string()
    .optional()
    .transform((val) => (val && val.trim().length > 0 ? val.trim() : undefined)),
  sortBy: z.enum(["createdAt", "clickCount"]).optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export type CreateUrlInput = z.infer<typeof CreateUrlSchema>;
export type UpdateUrlInput = z.infer<typeof UpdateUrlSchema>;
export type PaginationInput = z.infer<typeof PaginationSchema>;
