import { pgTable, text, serial, timestamp, real, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const ecosystemsTable = pgTable("ecosystems", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  temperature: real("temperature").notNull(),
  rainfall: real("rainfall").notNull(),
  pollution: real("pollution").notNull(),
  deforestationRate: real("deforestation_rate").notNull(),
  species: jsonb("species").notNull().default([]),
  interventions: jsonb("interventions").notNull().default([]),
  predictions: jsonb("predictions").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertEcosystemSchema = createInsertSchema(ecosystemsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertEcosystem = z.infer<typeof insertEcosystemSchema>;
export type Ecosystem = typeof ecosystemsTable.$inferSelect;

export const simulationsTable = pgTable("simulations", {
  id: serial("id").primaryKey(),
  ecosystemId: integer("ecosystem_id").notNull().references(() => ecosystemsTable.id, { onDelete: "cascade" }),
  weeks: integer("weeks").notNull(),
  dataPoints: jsonb("data_points").notNull().default([]),
  finalPredictions: jsonb("final_predictions").notNull().default({}),
  runAt: timestamp("run_at").notNull().defaultNow(),
});

export const insertSimulationSchema = createInsertSchema(simulationsTable).omit({ id: true, runAt: true });
export type InsertSimulation = z.infer<typeof insertSimulationSchema>;
export type Simulation = typeof simulationsTable.$inferSelect;
