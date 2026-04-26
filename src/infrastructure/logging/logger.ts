export const logger = {
  info: (message: string, metadata?: unknown) => {
    console.log(`[INFO] ${message}`, metadata ?? "");
  },
  warn: (message: string, metadata?: unknown) => {
    console.warn(`[WARN] ${message}`, metadata ?? "");
  },
  error: (message: string, metadata?: unknown) => {
    console.error(`[ERROR] ${message}`, metadata ?? "");
  },
};
