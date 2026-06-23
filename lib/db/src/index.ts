import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import pg from "pg";
import * as schema from "./schema";
import { ensureSchema } from "./ensureSchema";

const { Pool } = pg;

type DbInstance = ReturnType<typeof drizzlePg<typeof schema>>;

let pool: pg.Pool | null = null;
let db: DbInstance;

const usePglite =
  process.env.USE_PGLITE === "true" ||
  process.env.USE_PGLITE === "1" ||
  !process.env.DATABASE_URL;

function findWorkspaceRoot(): string {
  let dir = process.cwd();
  while (dir !== path.dirname(dir)) {
    if (existsSync(path.join(dir, "pnpm-workspace.yaml"))) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  return process.cwd();
}

function resolvePgliteDataDir(): string {
  const configured = process.env.PGLITE_DATA_DIR ?? ".local/pglite";
  const base = path.isAbsolute(configured)
    ? configured
    : path.join(findWorkspaceRoot(), configured);
  mkdirSync(base, { recursive: true });
  return base;
}

async function initDatabase(): Promise<void> {
  if (usePglite) {
    const { PGlite } = await import("@electric-sql/pglite");
    const { drizzle: drizzlePglite } = await import("drizzle-orm/pglite");
    const dataDir = resolvePgliteDataDir();
    const client = new PGlite(dataDir);
    db = drizzlePglite({ client, schema }) as DbInstance;
    await ensureSchema((sql) => client.exec(sql));
    return;
  }

  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzlePg(pool, { schema });
  await ensureSchema((sql) => pool!.query(sql));
}

await initDatabase();

export { db, pool };
export * from "./schema";
