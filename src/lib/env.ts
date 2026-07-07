import { z } from "zod";

const schema = z
  .object({
    DATABASE_URL: z.string().min(1),
    JWT_SECRET: z.string().min(16),
    RESEND_API_KEY: z.string().default(""),
    INQUIRY_TO_EMAIL: z.string().default(""),
    INQUIRY_FROM_EMAIL: z.string().default("")
  })
  .refine(
    (e) =>
      process.env.NODE_ENV !== "production" ||
      (e.RESEND_API_KEY && e.INQUIRY_TO_EMAIL && e.INQUIRY_FROM_EMAIL),
    {
      message: "RESEND_API_KEY, INQUIRY_TO_EMAIL, and INQUIRY_FROM_EMAIL are required in production"
    }
  );

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  const missing = parsed.error.errors
    .map((e) => `${String(e.path[0])}: ${e.message}`)
    .join(" | ");
  throw new Error(`Server misconfiguration — missing/invalid env vars: ${missing}`);
}

export const env = parsed.data;
