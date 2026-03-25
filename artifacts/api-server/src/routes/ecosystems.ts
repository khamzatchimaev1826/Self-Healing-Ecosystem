import { Router, type IRouter } from "express";
import { db, ecosystemsTable, simulationsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import {
  runMLPipeline,
  runLotkaVolterra,
  applyInterventionToParams,
  type EcosystemParams,
} from "../lib/ecosystemML.js";

const router: IRouter = Router();

const speciesSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["plant", "herbivore", "predator"]),
  initialPopulation: z.number(),
});

const createEcosystemSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["forest", "river", "grassland"]),
  temperature: z.number().min(-10).max(50),
  rainfall: z.number().min(0).max(5000),
  pollution: z.number().min(0).max(1),
  deforestationRate: z.number().min(0).max(1),
  species: z.array(speciesSchema).min(1),
});

const interventionSchema = z.object({
  type: z.enum(["reforestation", "pollution_reduction", "species_introduction", "habitat_restoration", "hunting_ban"]),
  intensity: z.number().min(0).max(1),
});

function getPopulationsFromSpecies(species: Array<{ type: string; initialPopulation: number }>) {
  let plants = 0, herbivores = 0, predators = 0;
  for (const s of species) {
    if (s.type === "plant") plants += s.initialPopulation;
    else if (s.type === "herbivore") herbivores += s.initialPopulation;
    else if (s.type === "predator") predators += s.initialPopulation;
  }
  return { plants, herbivores, predators };
}

function formatEcosystem(eco: typeof ecosystemsTable.$inferSelect) {
  return {
    id: String(eco.id),
    name: eco.name,
    type: eco.type,
    temperature: eco.temperature,
    rainfall: eco.rainfall,
    pollution: eco.pollution,
    deforestationRate: eco.deforestationRate,
    species: eco.species as Array<{ id: string; name: string; type: string; initialPopulation: number }>,
    predictions: eco.predictions as object,
    interventions: eco.interventions as Array<{ type: string; intensity: number; appliedAt: string }>,
    createdAt: eco.createdAt.toISOString(),
    updatedAt: eco.updatedAt.toISOString(),
  };
}

router.post("/ecosystems", async (req, res) => {
  const parsed = createEcosystemSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const data = parsed.data;
  const { plants, herbivores, predators } = getPopulationsFromSpecies(data.species);
  const params: EcosystemParams = {
    temperature: data.temperature,
    rainfall: data.rainfall,
    pollution: data.pollution,
    deforestationRate: data.deforestationRate,
    plants,
    herbivores,
    predators,
  };
  const predictions = runMLPipeline(params);
  const [eco] = await db.insert(ecosystemsTable).values({
    name: data.name,
    type: data.type,
    temperature: data.temperature,
    rainfall: data.rainfall,
    pollution: data.pollution,
    deforestationRate: data.deforestationRate,
    species: data.species,
    interventions: [],
    predictions,
  }).returning();
  res.status(201).json(formatEcosystem(eco));
});

router.get("/ecosystems", async (_req, res) => {
  const ecosystems = await db.select().from(ecosystemsTable).orderBy(ecosystemsTable.createdAt);
  res.json(ecosystems.map(formatEcosystem));
});

router.get("/ecosystems/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const [eco] = await db.select().from(ecosystemsTable).where(eq(ecosystemsTable.id, id));
  if (!eco) {
    res.status(404).json({ error: "Ecosystem not found" });
    return;
  }
  res.json(formatEcosystem(eco));
});

router.delete("/ecosystems/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  await db.delete(ecosystemsTable).where(eq(ecosystemsTable.id, id));
  res.json({ success: true });
});

router.put("/ecosystems/:id/intervene", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const parsed = interventionSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid intervention" });
    return;
  }
  const [eco] = await db.select().from(ecosystemsTable).where(eq(ecosystemsTable.id, id));
  if (!eco) {
    res.status(404).json({ error: "Ecosystem not found" });
    return;
  }

  const species = eco.species as Array<{ type: string; initialPopulation: number }>;
  const { plants, herbivores, predators } = getPopulationsFromSpecies(species);
  let params: EcosystemParams = {
    temperature: eco.temperature,
    rainfall: eco.rainfall,
    pollution: eco.pollution,
    deforestationRate: eco.deforestationRate,
    plants,
    herbivores,
    predators,
  };
  params = applyInterventionToParams(params, parsed.data.type, parsed.data.intensity);
  const predictions = runMLPipeline(params);

  const existingInterventions = eco.interventions as Array<{ type: string; intensity: number; appliedAt: string }>;
  const newIntervention = {
    type: parsed.data.type,
    intensity: parsed.data.intensity,
    appliedAt: new Date().toISOString(),
  };

  const updatedSpecies = species.map((s) => {
    if (s.type === "plant") return { ...s, initialPopulation: params.plants / (species.filter(x => x.type === "plant").length || 1) };
    if (s.type === "herbivore") return { ...s, initialPopulation: params.herbivores / (species.filter(x => x.type === "herbivore").length || 1) };
    if (s.type === "predator") return { ...s, initialPopulation: params.predators / (species.filter(x => x.type === "predator").length || 1) };
    return s;
  });

  const [updated] = await db.update(ecosystemsTable)
    .set({
      pollution: params.pollution,
      deforestationRate: params.deforestationRate,
      species: updatedSpecies,
      predictions,
      interventions: [...existingInterventions, newIntervention],
      updatedAt: new Date(),
    })
    .where(eq(ecosystemsTable.id, id))
    .returning();

  res.json(formatEcosystem(updated));
});

router.post("/simulation/:id/run", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const [eco] = await db.select().from(ecosystemsTable).where(eq(ecosystemsTable.id, id));
  if (!eco) {
    res.status(404).json({ error: "Ecosystem not found" });
    return;
  }
  const weeks = Number(req.body?.weeks) || 52;
  const clampedWeeks = Math.min(Math.max(weeks, 1), 520);

  const species = eco.species as Array<{ type: string; initialPopulation: number }>;
  const { plants, herbivores, predators } = getPopulationsFromSpecies(species);

  const dataPoints = runLotkaVolterra(plants, herbivores, predators, eco.pollution, eco.deforestationRate, clampedWeeks);

  const lastPoint = dataPoints[dataPoints.length - 1];
  const finalParams: EcosystemParams = {
    temperature: eco.temperature,
    rainfall: eco.rainfall,
    pollution: eco.pollution,
    deforestationRate: eco.deforestationRate,
    plants: lastPoint.plants,
    herbivores: lastPoint.herbivores,
    predators: lastPoint.predators,
  };
  const finalPredictions = runMLPipeline(finalParams);

  const [sim] = await db.insert(simulationsTable).values({
    ecosystemId: id,
    weeks: clampedWeeks,
    dataPoints,
    finalPredictions,
  }).returning();

  res.json({
    id: String(sim.id),
    ecosystemId: String(sim.ecosystemId),
    weeks: sim.weeks,
    dataPoints: sim.dataPoints,
    finalPredictions: sim.finalPredictions,
    runAt: sim.runAt.toISOString(),
  });
});

router.get("/simulation/:id/history", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const sims = await db.select().from(simulationsTable)
    .where(eq(simulationsTable.ecosystemId, id))
    .orderBy(simulationsTable.runAt);

  res.json(sims.map(sim => ({
    id: String(sim.id),
    ecosystemId: String(sim.ecosystemId),
    weeks: sim.weeks,
    dataPoints: sim.dataPoints,
    finalPredictions: sim.finalPredictions,
    runAt: sim.runAt.toISOString(),
  })));
});

export default router;
