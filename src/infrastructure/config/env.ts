import { config } from "dotenv";
import { z } from "zod";

config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  WPP_GATEWAY_MODE: z.enum(["embedded", "remote"]).default("embedded"),
  WPP_REMOTE_BASE_URL: z.string().default("http://localhost:3100"),
  WPP_REMOTE_TIMEOUT_MS: z.coerce.number().default(10000),
  WPP_SESSION_SERVICE_PORT: z.coerce.number().default(3100),
  WPP_SESSION_NAME: z.string().default("offers-session"),
  WPP_SESSIONS: z.string().default(""),
  WPP_PHONE_NUMBER: z.string().optional().default(""),
  WPP_AUTH_METHOD: z.enum(["qrcode", "code"]).default("qrcode"),
  WPP_TOKEN_DIR: z.string().default("./.wppconnect/tokens"),
  WPP_QR_DIR: z.string().default("./qrcodes"),
  WPP_SAVE_QR_IMAGE: z
    .string()
    .optional()
    .transform((value) => value === "true"),
  WPP_HEADLESS: z
    .string()
    .optional()
    .transform((value) => value !== "false"),
  WPP_LOG_QR: z
    .string()
    .optional()
    .transform((value) => value !== "false"),

  WPP_START_SESSION_ON_BOOT: z
    .string()
    .optional()
    .transform((value) => value !== "false"),
  WPP_TEST_RECIPIENT: z.string().optional(),
  WPP_LOG_LEVEL: z.string().default("info"),
});

export const env = envSchema.parse(process.env);
