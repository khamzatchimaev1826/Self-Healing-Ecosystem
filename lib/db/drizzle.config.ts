import { defineConfig } from "drizzle-kit";
import { config as loadEnv } from "dotenv";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const configDir = path.dirname(fileURLToPath(import.meta.url));
const rootEnv = path.resolve(configDir, "../../.env");
if (existsSync(rootEnv)) {
  loadEnv({ path: rootEnv });
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  schema: "./src/schema/ecosystems.ts",
  dialect: "postgresql",
  driver: process.env.USE_PGLITE === "true" ? "pglite" : undefined,
  dbCredentials: {
    url:
      process.env.USE_PGLITE === "true"
        ? (process.env.PGLITE_DATA_DIR ?? ".local/pglite")
        : process.env.DATABASE_URL!,
  },
});
