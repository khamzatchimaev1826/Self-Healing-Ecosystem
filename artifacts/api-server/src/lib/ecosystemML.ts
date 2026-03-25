export interface EcosystemParams {
  temperature: number;      // -10 to 50 °C
  rainfall: number;         // 0 to 5000 mm
  pollution: number;        // 0 to 1 (stored as fraction; spec treats as 0-100%)
  deforestationRate: number; // 0 to 1 (stored as fraction; spec treats as 0-10 %/year)
  plants: number;           // 10-100 scale (normalized population index)
  herbivores: number;       // 5-100 scale
  predators: number;        // 2-50 scale
}

export interface Recommendation {
  action: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  impact: string;
  timeline: string;
}

export interface MLPredictions {
  healthStatus: "Healthy" | "Stressed" | "Collapsing";
  healthScore: number;
  recoveryTimeWeeks: number;
  collapseRisk: number;
  stabilityIndex: number;
  biodiversityIndex: number;
  recommendations: Recommendation[];
}

export interface SimulationDataPoint {
  week: number;
  plants: number;
  herbivores: number;
  predators: number;
  healthScore: number;
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

/**
 * Health score formula from the spec's dataset generation:
 * Start at 100, subtract penalties for temp/rainfall/pollution/deforestation
 * Award biodiversity bonus if all trophic levels present.
 * Scales pollution (0-1) to (0-100) and deforestationRate (0-1) to (0-10).
 */
export function computeHealthScore(params: EcosystemParams): number {
  const pollutionPct = params.pollution * 100;       // convert fraction → %
  const deforestPct = params.deforestationRate * 10; // convert fraction → %/year

  let score = 100;

  // Temperature impact (optimal: 20-30°C)
  if (params.temperature > 35) {
    score -= (params.temperature - 35) * 2;
  } else if (params.temperature < 20) {
    score -= (20 - params.temperature) * 1.5;
  }

  // Rainfall impact (optimal: 500-1500mm)
  if (params.rainfall < 500) {
    score -= ((500 - params.rainfall) / 100) * 3;
  } else if (params.rainfall > 2000) {
    score -= ((params.rainfall - 2000) / 100) * 2;
  }

  // Pollution impact (critical above 70%)
  if (pollutionPct > 70) {
    score -= (pollutionPct - 70) * 3;
  } else if (pollutionPct > 40) {
    score -= (pollutionPct - 40) * 0.5;
  }

  // Deforestation impact
  score -= deforestPct * 5;

  // Biodiversity bonus: reward having all three trophic levels
  if (params.plants > 30 && params.herbivores > 20 && params.predators > 5) {
    score += 10;
  }

  return clamp(Math.round(score * 10) / 10, 0, 100);
}

/**
 * Classify ecosystem health based on score.
 * Spec: Healthy ≥ 70, Stressed 40-70, Collapsing < 40
 */
export function classifyHealth(healthScore: number): "Healthy" | "Stressed" | "Collapsing" {
  if (healthScore >= 70) return "Healthy";
  if (healthScore >= 40) return "Stressed";
  return "Collapsing";
}

/**
 * Biodiversity index: all three trophic levels present and balanced.
 */
export function computeBiodiversityIndex(params: EcosystemParams): number {
  const plantNorm = clamp(params.plants / 100, 0, 1);
  const herbNorm = clamp(params.herbivores / 100, 0, 1);
  const predNorm = clamp(params.predators / 50, 0, 1);
  return Math.round(((plantNorm + herbNorm + predNorm) / 3) * 100) / 100;
}

/**
 * Stability index based on population evenness (spec formula):
 * evenness = 1 - (|plants - herbivores| + |herbivores - predators|) / total_pop
 */
export function computeStabilityIndex(params: EcosystemParams): number {
  const total = params.plants + params.herbivores + params.predators;
  if (total === 0) return 0;
  const evenness = 1 - (
    Math.abs(params.plants - params.herbivores) +
    Math.abs(params.herbivores - params.predators)
  ) / total;
  return Math.round(clamp(evenness, 0, 1) * 100) / 100;
}

/**
 * Collapse risk model (SVM-inspired rule):
 * Uses biodiversity, stability, and external pressure.
 */
export function estimateCollapseRisk(
  params: EcosystemParams,
  healthScore: number,
  stabilityIndex: number,
  biodiversityIndex: number
): number {
  // Based on spec: health > 70 → 0.05, health > 40 → 0.3, else → 0.85
  // Then adjust based on biodiversity and stability
  let base: number;
  if (healthScore > 70) {
    base = 0.05;
  } else if (healthScore > 40) {
    base = 0.30;
  } else {
    base = 0.85;
  }

  // External pressure adjustment
  const externalPressure = (params.pollution * 0.6 + params.deforestationRate * 0.4);
  const biodiversityPenalty = (1 - biodiversityIndex) * 0.15;
  const stabilityBonus = stabilityIndex * 0.10;

  const risk = base + externalPressure * 0.2 + biodiversityPenalty - stabilityBonus;
  return Math.round(clamp(risk, 0, 1) * 1000) / 1000;
}

/**
 * Recovery time predictor (Gradient Boosting-inspired):
 * Input: health score, biodiversity, pollution, deforestation
 */
export function predictRecoveryTime(params: EcosystemParams, healthScore: number, biodiversityIndex: number): number {
  if (healthScore >= 70) return 0;
  const deficit = 70 - healthScore;
  const pollutionFactor = 1 + params.pollution * 4;
  const deforestFactor = 1 + params.deforestationRate * 3;
  const biodiversityFactor = 1 + (1 - biodiversityIndex) * 2;
  return Math.round(deficit * pollutionFactor * deforestFactor * biodiversityFactor * 0.15);
}

/**
 * Recovery Strategy Recommender — rule-based system from spec.
 * Returns structured objects with priority, impact, timeline.
 */
export function generateRecommendations(
  params: EcosystemParams,
  healthScore: number,
  collapseRisk: number,
  biodiversityIndex: number
): Recommendation[] {
  const recs: Recommendation[] = [];
  const pollutionPct = params.pollution * 100;
  const deforestPct = params.deforestationRate * 10;

  // Emergency first
  if (healthScore < 40) {
    recs.push({
      action: "Emergency Intervention Required",
      priority: "CRITICAL",
      impact: "Prevent imminent ecosystem collapse",
      timeline: "Immediate",
    });
  }

  // High pollution
  if (pollutionPct > 70) {
    recs.push({
      action: "Reduce Pollution",
      priority: "HIGH",
      impact: "Immediate improvement in health score by up to +20 points",
      timeline: "2-4 weeks",
    });
  } else if (pollutionPct > 40) {
    recs.push({
      action: "Implement Pollution Controls",
      priority: "MEDIUM",
      impact: "Steady improvement in long-term ecosystem health",
      timeline: "4-8 weeks",
    });
  }

  // High deforestation
  if (deforestPct > 3) {
    recs.push({
      action: "Implement Reforestation Program",
      priority: "CRITICAL",
      impact: "Restore plant population and prevent collapse",
      timeline: "3-6 months",
    });
  } else if (deforestPct > 1) {
    recs.push({
      action: "Habitat Protection Zones",
      priority: "HIGH",
      impact: "Slow deforestation and protect existing flora",
      timeline: "1-3 months",
    });
  }

  // Low biodiversity
  if (biodiversityIndex < 0.4) {
    recs.push({
      action: "Species Reintroduction Program",
      priority: "MEDIUM",
      impact: "Improve ecosystem resilience and trophic balance",
      timeline: "1-3 months",
    });
  }

  // Low plant population
  if (params.plants < 20) {
    recs.push({
      action: "Emergency Reforestation",
      priority: "CRITICAL",
      impact: "Restore primary producers to prevent trophic cascade failure",
      timeline: "Immediate",
    });
  }

  // Herbivore imbalance
  if (params.herbivores < 10) {
    recs.push({
      action: "Herbivore Species Introduction",
      priority: "MEDIUM",
      impact: "Restore mid-trophic level and predator food supply",
      timeline: "2-4 weeks",
    });
  } else if (params.plants > 10 && params.herbivores > params.plants * 0.8) {
    recs.push({
      action: "Implement Hunting Ban",
      priority: "HIGH",
      impact: "Reduce overgrazing pressure on plant populations",
      timeline: "2-4 weeks",
    });
  }

  // Low predator population
  if (params.predators < 3) {
    recs.push({
      action: "Apex Predator Reintroduction",
      priority: "MEDIUM",
      impact: "Regulate herbivore populations and restore ecological balance",
      timeline: "1-3 months",
    });
  }

  // High collapse risk warning
  if (collapseRisk > 0.7 && healthScore >= 40) {
    recs.push({
      action: "Comprehensive Habitat Restoration",
      priority: "HIGH",
      impact: "Reduce collapse probability below critical 50% threshold",
      timeline: "2-4 months",
    });
  }

  // Positive status
  if (recs.length === 0 && healthScore >= 70) {
    recs.push({
      action: "Maintain Current Conservation Practices",
      priority: "LOW",
      impact: "Ecosystem is thriving — continued monitoring advised",
      timeline: "Ongoing",
    });
  }

  // Limit to top 5 most actionable
  return recs.slice(0, 5);
}

/**
 * Lotka-Volterra simulation engine from spec.
 * Uses dt=0.1 step integration over 'weeks' time steps.
 * Populations scaled to 0-100 range (spec scale).
 */
export function runLotkaVolterra(
  initialPlants: number,
  initialHerbivores: number,
  initialPredators: number,
  pollution: number,
  deforestationRate: number,
  temperature: number,
  rainfall: number,
  weeks: number
): SimulationDataPoint[] {
  const dataPoints: SimulationDataPoint[] = [];
  const stepsPerWeek = 10; // 10 dt=0.1 steps per week

  // Clamp to spec ranges
  let P = clamp(initialPlants, 10, 100);
  let H = clamp(initialHerbivores, 5, 100);
  let X = clamp(initialPredators, 2, 50);

  const pollutionPct = pollution * 100;
  const deforestPct = deforestationRate * 10;

  // Environmental modifiers from spec
  const envMod = Math.max(0.2, 1 - pollution * 0.6 - deforestationRate * 0.4);

  for (let week = 0; week <= weeks; week++) {
    // Calculate health using spec's simulation engine formula
    const biodiversity = Math.min(1, (P + H + X) / 150);
    const tempFactor = Math.max(0, 1 - Math.abs(temperature - 25) / 25);
    const rainFactor = Math.min(1, rainfall / 1000);
    const healthScore = clamp(
      Math.round((biodiversity * 0.4 + tempFactor * 0.3 + rainFactor * 0.3) * 100),
      0, 100
    );

    dataPoints.push({
      week,
      plants: Math.round(P * 10) / 10,
      herbivores: Math.round(H * 10) / 10,
      predators: Math.round(X * 10) / 10,
      healthScore,
    });

    if (week === weeks) break;

    // Run stepsPerWeek dt=0.1 integration steps (spec equations)
    for (let step = 0; step < stepsPerWeek; step++) {
      const dt = 0.1;

      // Plant dynamics (logistic growth with consumption)
      const plantGrowth = 0.5 * P * (1 - P / 100) * envMod;
      const plantConsumption = 0.02 * H * P;
      const dP = (plantGrowth - plantConsumption) * dt;

      // Herbivore dynamics
      const herbGrowth = 0.03 * P * H * envMod;
      const herbDeath = 0.1 * H * X;
      const dH = (herbGrowth - herbDeath) * dt;

      // Predator dynamics
      const predGrowth = 0.02 * H * X;
      const predDeath = 0.15 * X;
      const dX = (predGrowth - predDeath) * dt;

      P = Math.max(0, P + dP);
      H = Math.max(0, H + dH);
      X = Math.max(0, X + dX);

      // Apply additional pressure each week
      if (step === 0) {
        P *= (1 - deforestationRate * 0.01);
        H *= (1 - pollution * 0.005);
        X *= (1 - pollution * 0.005);
      }
    }
  }

  return dataPoints;
}

/**
 * Run the full ML pipeline — all 5 models.
 */
export function runMLPipeline(params: EcosystemParams): MLPredictions {
  const healthScore = computeHealthScore(params);
  const healthStatus = classifyHealth(healthScore);
  const biodiversityIndex = computeBiodiversityIndex(params);
  const stabilityIndex = computeStabilityIndex(params);
  const collapseRisk = estimateCollapseRisk(params, healthScore, stabilityIndex, biodiversityIndex);
  const recoveryTimeWeeks = predictRecoveryTime(params, healthScore, biodiversityIndex);
  const recommendations = generateRecommendations(params, healthScore, collapseRisk, biodiversityIndex);

  return {
    healthStatus,
    healthScore,
    recoveryTimeWeeks,
    collapseRisk,
    stabilityIndex,
    biodiversityIndex,
    recommendations,
  };
}

/**
 * Apply an intervention to ecosystem params and return updated params.
 */
export function applyInterventionToParams(
  params: EcosystemParams,
  interventionType: string,
  intensity: number
): EcosystemParams {
  const p = { ...params };
  switch (interventionType) {
    case "reforestation":
      p.deforestationRate = Math.max(0, p.deforestationRate - intensity * 0.5);
      p.plants = clamp(p.plants * (1 + intensity * 0.6), 0, 100);
      break;
    case "pollution_reduction":
      p.pollution = Math.max(0, p.pollution - intensity * 0.7);
      break;
    case "species_introduction":
      p.herbivores = clamp(p.herbivores * (1 + intensity * 0.4), 0, 100);
      p.predators = clamp(p.predators * (1 + intensity * 0.3), 0, 50);
      break;
    case "habitat_restoration":
      p.deforestationRate = Math.max(0, p.deforestationRate - intensity * 0.3);
      p.pollution = Math.max(0, p.pollution - intensity * 0.25);
      p.plants = clamp(p.plants * (1 + intensity * 0.3), 0, 100);
      break;
    case "hunting_ban":
      p.predators = clamp(p.predators * (1 + intensity * 0.5), 0, 50);
      p.herbivores = clamp(p.herbivores * (1 - intensity * 0.1), 0, 100);
      break;
  }
  return p;
}
