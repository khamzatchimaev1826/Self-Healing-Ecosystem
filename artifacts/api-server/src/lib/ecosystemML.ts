export interface EcosystemParams {
  temperature: number;
  rainfall: number;
  pollution: number;
  deforestationRate: number;
  plants: number;
  herbivores: number;
  predators: number;
}

export interface MLPredictions {
  healthStatus: "Healthy" | "Stressed" | "Collapsing";
  healthScore: number;
  recoveryTimeWeeks: number;
  collapseRisk: number;
  stabilityIndex: number;
  recommendations: string[];
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

function computeHealthScore(params: EcosystemParams): number {
  const tempOptimal = 20;
  const tempScore = Math.max(0, 100 - Math.abs(params.temperature - tempOptimal) * 2);
  const rainfallScore = clamp((params.rainfall / 2000) * 100, 0, 100);
  const pollutionPenalty = params.pollution * 60;
  const deforestPenalty = params.deforestationRate * 50;
  const plantScore = clamp((params.plants / 1000) * 100, 0, 100);
  const herbivoreScore = clamp((params.herbivores / 500) * 100, 0, 100);
  const predatorScore = clamp((params.predators / 100) * 100, 0, 100);

  const ecosystemScore = (plantScore * 0.4 + herbivoreScore * 0.3 + predatorScore * 0.3);
  const envScore = (tempScore * 0.3 + rainfallScore * 0.3) - pollutionPenalty - deforestPenalty;

  const raw = ecosystemScore * 0.6 + envScore * 0.4;
  return clamp(raw, 0, 100);
}

export function classifyHealth(healthScore: number): "Healthy" | "Stressed" | "Collapsing" {
  if (healthScore >= 65) return "Healthy";
  if (healthScore >= 35) return "Stressed";
  return "Collapsing";
}

export function predictRecoveryTime(params: EcosystemParams, healthScore: number): number {
  if (healthScore >= 65) return 0;
  const deficit = 65 - healthScore;
  const pollutionFactor = 1 + params.pollution * 3;
  const deforestFactor = 1 + params.deforestationRate * 2;
  return Math.round(deficit * pollutionFactor * deforestFactor * 0.8);
}

export function estimateCollapseRisk(params: EcosystemParams): number {
  const biodiversityScore = (
    (params.plants > 50 ? 1 : 0) +
    (params.herbivores > 20 ? 1 : 0) +
    (params.predators > 5 ? 1 : 0)
  ) / 3;

  const pressureScore = params.pollution * 0.5 + params.deforestationRate * 0.5;
  const risk = (1 - biodiversityScore) * 0.5 + pressureScore * 0.5;
  return clamp(risk, 0, 1);
}

export function computeStabilityIndex(params: EcosystemParams): number {
  if (params.plants === 0 || params.herbivores === 0) return 0;
  const ratio1 = params.herbivores / params.plants;
  const ratio2 = params.predators / params.herbivores;
  const idealRatio1 = 0.3;
  const idealRatio2 = 0.15;
  const stability = 1 - (Math.abs(ratio1 - idealRatio1) * 2 + Math.abs(ratio2 - idealRatio2) * 2);
  return clamp(stability * (1 - params.pollution * 0.5), 0, 1);
}

export function generateRecommendations(params: EcosystemParams, healthScore: number, collapseRisk: number): string[] {
  const recs: string[] = [];

  if (params.pollution > 0.4) {
    recs.push("Apply pollution reduction measures — pollution levels are critically high");
  }
  if (params.deforestationRate > 0.3) {
    recs.push("Implement reforestation program — deforestation is threatening habitat stability");
  }
  if (params.plants < 200) {
    recs.push("Initiate reforestation — plant populations are dangerously low");
  }
  if (params.herbivores < 30) {
    recs.push("Introduce herbivore species to restore trophic balance");
  }
  if (params.predators < 5) {
    recs.push("Reintroduce apex predators to regulate herbivore populations");
  }
  if (params.herbivores > params.plants * 0.8) {
    recs.push("Implement hunting restrictions — herbivore populations are overgrazing");
  }
  if (collapseRisk > 0.7) {
    recs.push("URGENT: Ecosystem collapse imminent — immediate habitat restoration required");
  }
  if (healthScore > 75) {
    recs.push("Ecosystem is thriving — maintain current conservation practices");
  }
  if (params.rainfall < 300) {
    recs.push("Consider irrigation programs — rainfall is insufficient for ecosystem health");
  }

  if (recs.length === 0) {
    recs.push("Ecosystem is in good health — continue monitoring");
  }

  return recs;
}

export function runLotkaVolterra(
  initialPlants: number,
  initialHerbivores: number,
  initialPredators: number,
  pollution: number,
  deforestationRate: number,
  weeks: number
): SimulationDataPoint[] {
  const dataPoints: SimulationDataPoint[] = [];

  let P = Math.max(initialPlants, 10);
  let H = Math.max(initialHerbivores, 5);
  let X = Math.max(initialPredators, 1);

  const r = 0.1 * (1 - deforestationRate * 0.8) * (1 - pollution * 0.5);
  const K = 1000 * (1 - deforestationRate * 0.6) * (1 - pollution * 0.4);
  const a = 0.005;
  const b = 0.003;
  const c = 0.008;
  const d = 0.004;
  const e = 0.01;

  for (let week = 0; week <= weeks; week++) {
    const params: EcosystemParams = {
      temperature: 20,
      rainfall: 1000,
      pollution,
      deforestationRate,
      plants: P,
      herbivores: H,
      predators: X,
    };
    const healthScore = computeHealthScore(params);

    dataPoints.push({
      week,
      plants: Math.round(P),
      herbivores: Math.round(H),
      predators: Math.round(X),
      healthScore: Math.round(healthScore),
    });

    const dP = r * P * (1 - P / K) - a * P * H;
    const dH = b * P * H - c * H * X - 0.02 * H;
    const dX = d * H * X - e * X;

    P = Math.max(0, P + dP);
    H = Math.max(0, H + dH);
    X = Math.max(0, X + dX);
  }

  return dataPoints;
}

export function runMLPipeline(params: EcosystemParams): MLPredictions {
  const healthScore = computeHealthScore(params);
  const healthStatus = classifyHealth(healthScore);
  const recoveryTimeWeeks = predictRecoveryTime(params, healthScore);
  const collapseRisk = estimateCollapseRisk(params);
  const stabilityIndex = computeStabilityIndex(params);
  const recommendations = generateRecommendations(params, healthScore, collapseRisk);

  return {
    healthStatus,
    healthScore: Math.round(healthScore),
    recoveryTimeWeeks,
    collapseRisk: Math.round(collapseRisk * 100) / 100,
    stabilityIndex: Math.round(stabilityIndex * 100) / 100,
    recommendations,
  };
}

export function applyInterventionToParams(
  params: EcosystemParams,
  interventionType: string,
  intensity: number
): EcosystemParams {
  const p = { ...params };
  switch (interventionType) {
    case "reforestation":
      p.deforestationRate = Math.max(0, p.deforestationRate - intensity * 0.5);
      p.plants = p.plants * (1 + intensity * 0.5);
      break;
    case "pollution_reduction":
      p.pollution = Math.max(0, p.pollution - intensity * 0.6);
      break;
    case "species_introduction":
      p.herbivores = p.herbivores * (1 + intensity * 0.3);
      p.predators = p.predators * (1 + intensity * 0.2);
      break;
    case "habitat_restoration":
      p.deforestationRate = Math.max(0, p.deforestationRate - intensity * 0.3);
      p.pollution = Math.max(0, p.pollution - intensity * 0.2);
      p.plants = p.plants * (1 + intensity * 0.3);
      break;
    case "hunting_ban":
      p.predators = p.predators * (1 + intensity * 0.4);
      p.herbivores = Math.max(0, p.herbivores * (1 - intensity * 0.1));
      break;
  }
  return p;
}
