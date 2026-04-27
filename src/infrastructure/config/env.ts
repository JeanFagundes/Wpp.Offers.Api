import { config } from "dotenv";
import { z } from "zod";

config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
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
  AFFILIATE_CODE: z.string().default(""),
  AFFILIATE_PARAM_NAME: z.string().default("tag"),
  AFFILIATE_LINK_SHORTENER_ENABLED: z
    .string()
    .optional()
    .transform((value) => value !== "false"),
  AFFILIATE_LINK_SHORTENER_URL: z.string().default("https://is.gd/create.php"),
  AFFILIATE_LINK_SHORTENER_TIMEOUT_MS: z.coerce.number().default(5000),
  WPP_LOG_LEVEL: z.string().default("info"),
});

export const env = envSchema.parse(process.env);
