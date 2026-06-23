export const INIT_SQL = `
CREATE TABLE IF NOT EXISTS ecosystems (
  id serial PRIMARY KEY,
  name text NOT NULL,
  type text NOT NULL,
  temperature real NOT NULL,
  rainfall real NOT NULL,
  pollution real NOT NULL,
  deforestation_rate real NOT NULL,
  species jsonb NOT NULL DEFAULT '[]'::jsonb,
  interventions jsonb NOT NULL DEFAULT '[]'::jsonb,
  predictions jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS simulations (
  id serial PRIMARY KEY,
  ecosystem_id integer NOT NULL REFERENCES ecosystems(id) ON DELETE CASCADE,
  weeks integer NOT NULL,
  data_points jsonb NOT NULL DEFAULT '[]'::jsonb,
  final_predictions jsonb NOT NULL DEFAULT '{}'::jsonb,
  run_at timestamp NOT NULL DEFAULT now()
);
`;

export async function ensureSchema(exec: (sql: string) => Promise<unknown>): Promise<void> {
  await exec(INIT_SQL);
}
