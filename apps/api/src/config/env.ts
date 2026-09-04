import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  APP_NAME: z.string().default("Ann's Bank"),
  MONGODB_URI: z
    .string()
    .url("MONGODB_URI must be a valid MongoDB connection string"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  NIBSS_BASE_URL: z.string().url("NIBSS_BASE_URL must be a valid URL"),
  NIBSS_API_KEY: z.string().min(1, "NIBSS_API_KEY is required"),
  NIBSS_API_SECRET: z.string().min(1, "NIBSS_API_SECRET is required"),
  NIBSS_BANK_CODE: z.string().min(1, "NIBSS_BANK_CODE is required"),
  NIBSS_BANK_NAME: z.string().min(1, "NIBSS_BANK_NAME is required"),
});

type Env = z.infer<typeof EnvSchema>;

let cached: Env | null = null;

function loadEnv(): Env {
  if (cached) return cached;

  try {
    const env = EnvSchema.parse(process.env);
    cached = env;
    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Environment validation failed:");
      error.errors.forEach((err) => {
        console.error(`  ${err.path.join(".")}: ${err.message}`);
      });
    }
    process.exit(1);
  }
}

export const env = loadEnv();
