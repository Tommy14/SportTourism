import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  ADMIN_PATH_PREFIX: z.string().default("portal"),
  SMTP_HOST: z.string().default(""),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().default(""),
  SMTP_PASS: z.string().default(""),
  RESEND_API_KEY: z.string().min(1),
  INQUIRY_TO_EMAIL: z.string().email(),
  INQUIRY_FROM_EMAIL: z.string().email(),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_BUCKET: z.string().min(1)
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  const missing = parsed.error.errors
    .map((e) => `${String(e.path[0])}: ${e.message}`)
    .join(" | ");
  throw new Error(`Server misconfiguration — missing/invalid env vars: ${missing}`);
}

export const env = parsed.data;
