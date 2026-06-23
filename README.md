# 🌿 Self Healing Ecosystem

🔗 **Live Demo:** _Deploy via [DEPLOY.md](./DEPLOY.md) — then add your public URL here_

🔗 **Repository:** [github.com/khamzatchimaev1826/Self-Healing-Ecosystem](https://github.com/khamzatchimaev1826/Self-Healing-Ecosystem)

_Example (legacy Replit): [self-healing-model--khamzatchimaev1.replit.app](https://self-healing-model--khamzatchimaev1.replit.app)_

A full-stack Machine Learning powered web application that simulates ecosystem dynamics, predicts ecological health, and recommends interventions for forest, river, grassland, and polar biomes.

**ML Health Accuracy: ✅ Multi-model pipeline (5 ML models)**

---

## 📌 Problem Statement

Ecosystems worldwide face threats from pollution, deforestation, climate change, and biodiversity loss. Monitoring and predicting ecological health in real-time is complex because dozens of interdependent species and environmental factors interact simultaneously.

This project uses Machine Learning to model those dynamics, predict collapse risk, and recommend corrective interventions — all through a live web interface.

---

## 🎯 Objectives

- Simulate population dynamics across 4 biome types with 36+ species
- Predict ecosystem health score using a multi-model ML pipeline
- Forecast population recovery time and collapse risk
- Apply interventions and observe real-time effects
- Provide AI-generated recommendations for ecosystem restoration

---

## 🏗 System Architecture

```
User
  │
  ▼
React Frontend (Vite + TailwindCSS)
  │
  ▼
Express REST API (Node.js)
  │
  ▼
ML Pipeline (5 Models)
  │
  ▼
PostgreSQL Database (Drizzle ORM)
  │
  ▼
Ecosystem Health Score + Predictions
```

---

## 🛠 Technology Stack

### Frontend
- React 18
- Vite
- TailwindCSS (cyberpunk dark theme)
- Framer Motion (animations)
- Recharts (data visualization)
- TanStack Query (data fetching)
- Wouter (routing)

### Backend
- Node.js
- Express.js
- Pino (logging)
- Zod (validation)
- CORS

### Database
- PostgreSQL
- Drizzle ORM

### Machine Learning
- Health Classifier (rule-based + weighted scoring)
- Recovery Time Predictor
- Collapse Risk SVM (Support Vector Machine logic)
- Lotka-Volterra Population Dynamics
- Recommendation Engine

---

## 🌍 Ecosystem Types

| Biome | Species Count | Key Species |
|---|---|---|
| 🌳 Forest | 9 | Oak, Deer, Wolf, Bear, Fox |
| 🌊 River | 9 | Algae, Fish, Otter, Heron, Pike |
| 🌾 Grassland | 9 | Bison, Gazelle, Prairie Dog, Hawk |
| ❄️ Polar | 9 | Arctic Moss, Arctic Hare, Polar Bear |

---

## 🤖 ML Pipeline

### 1. Health Classifier
Scores ecosystem health (0–100) based on temperature, rainfall, pollution, deforestation rate, and species biodiversity.

```
Health Score = 100
  - temperature penalty
  - rainfall penalty
  - pollution penalty (×30)
  - deforestation penalty (×20)
  + biodiversity bonus (+10)

Thresholds: ≥70 = Healthy | 40–69 = Stressed | <40 = Collapsing
```

### 2. Lotka-Volterra Population Dynamics
Simulates predator-prey interactions over time using differential equations:

```
dPlants/dt     = r_p × Plants − a_ph × Plants × Herbivores
dHerbivores/dt = b_ph × Plants × Herbivores − a_hp × Herbivores × Predators
dPredators/dt  = b_hp × Herbivores × Predators − d_p × Predators
```

### 3. Recovery Time Predictor
Estimates weeks until ecosystem reaches Healthy status based on current health deficit.

### 4. Collapse Risk SVM
Classifies collapse probability (0–1) using pollution, deforestation, and biodiversity as feature vectors.

### 5. Recommendation Engine
Generates prioritized intervention actions (HIGH / MEDIUM / LOW) based on the biggest detected threat factors.

---

## 📊 Ecosystem Parameters

| Parameter | Range | Critical Threshold |
|---|---|---|
| Temperature | −10°C to 50°C | >38°C or <17°C |
| Rainfall | 0–5000 mm/yr | <300mm or >2500mm |
| Pollution Level | 0–100% | >70% |
| Deforestation Rate | 0–100%/yr | >30%/yr |

---

## 🔧 Interventions Available

| Intervention | Effect |
|---|---|
| Reforestation | Reduces deforestation rate |
| Pollution Reduction | Lowers pollution level |
| Species Introduction | Boosts target population |
| Habitat Restoration | Improves temperature & rainfall |
| Hunting Ban | Protects predator populations |

---

## 📡 API Documentation

### Health Check
```
GET /api/healthz
Response: { "status": "ok" }
```

### Create Ecosystem
```
POST /api/ecosystems
Body: {
  "name": "Amazon Sector 7",
  "type": "forest",
  "temperature": 26,
  "rainfall": 1400,
  "pollution": 0.15,
  "deforestationRate": 0.2,
  "species": [
    { "id": "oak", "name": "Oak Tree", "type": "plant", "initialPopulation": 70 },
    { "id": "deer", "name": "Deer", "type": "herbivore", "initialPopulation": 40 },
    { "id": "wolf", "name": "Wolf", "type": "predator", "initialPopulation": 15 }
  ]
}
Response: { "id": "1", "healthScore": 82.5, "healthStatus": "Healthy", ... }
```

### List Ecosystems
```
GET /api/ecosystems
Response: [ { "id": "1", "name": "...", "healthStatus": "Healthy", ... } ]
```

### Get Ecosystem
```
GET /api/ecosystems/:id
```

### Apply Intervention
```
PUT /api/ecosystems/:id/intervene
Body: { "type": "reforestation", "intensity": 0.7 }
```

### Run Simulation
```
POST /api/simulation/:id/run
Body: { "weeks": 52 }
Response: { "dataPoints": [...], "finalPredictions": { ... } }
```

---

## 📁 Directory Structure

```
Self-Healing-Ecosystem/
│
├── artifacts/
│   ├── ecosystem/          ← React frontend
│   │   └── src/
│   │       ├── pages/      ← Home, Builder, Dashboard
│   │       └── components/ ← Layout, UI components
│   │
│   ├── api-server/         ← Express API
│   │   └── src/
│   │       ├── routes/     ← ecosystems, simulation
│   │       └── lib/        ← ecosystemML.ts (ML pipeline)
│   │
│   └── ecosystem-deck/     ← 7-slide presentation deck
│
├── lib/
│   ├── db/                 ← PostgreSQL schema (Drizzle ORM)
│   ├── api-spec/           ← OpenAPI spec
│   └── api-client-react/   ← Auto-generated API client
│
├── vercel.json             ← Vercel frontend deployment config
├── render.yaml             ← Render API deployment config
└── README.md
```

---

## 🚀 Local Development

### VS Code (recommended)

1. Install [Node.js](https://nodejs.org) (v20+) and [pnpm](https://pnpm.io) (`npm i -g pnpm`)
2. **No Docker required** — the app uses an embedded local database (PGLite) by default (`USE_PGLITE=true` in `.env`)
3. Open this folder in VS Code
4. Copy environment file: `copy .env.example .env` (PowerShell) or `cp .env.example .env` (Mac/Linux)
5. Run **Terminal → Run Task → Start Full Stack**, or use **Run and Debug → Full Stack (API + Frontend)**
6. Open **http://localhost:3000** (API runs on port 5000 in the background)

**Optional:** Use cloud Postgres (Neon) with `USE_PGLITE=false` and `DATABASE_URL=...` in `.env`.

### Manual terminals

```bash
# Install dependencies
pnpm install

# Start PostgreSQL (Docker)
pnpm run db:up

# Push database schema
pnpm run db:push

# Start API server (terminal 1)
pnpm run dev:api

# Start frontend (terminal 2)
pnpm run dev:web
```

---

## 🌐 Deploy Live (Free, Public Link)

Full step-by-step guide: **[DEPLOY.md](./DEPLOY.md)**

| Service | Platform | Purpose |
|---|---|---|
| Frontend | Vercel | React app (permanent URL) |
| API Server | Render | Express server |
| Database | Neon | PostgreSQL (shared data for all users) |

After deployment, share your Vercel URL — anyone can create ecosystems, simulate, and analyze.

---

## 📈 ML Model Performance

| Model | Type | Output |
|---|---|---|
| Health Classifier | Weighted scoring | 0–100 health score |
| Lotka-Volterra | ODE simulation | Population over time |
| Recovery Predictor | Linear regression | Weeks to recovery |
| Collapse Risk | SVM-style classifier | 0–1 risk score |
| Recommender | Rule-based ranking | Prioritized actions |

---

## 🔮 Future Enhancements

- User authentication and personal ecosystem portfolios
- Real satellite data integration (NASA EarthData API)
- Neural network for health classification
- Climate change scenario modeling
- Export simulation data as CSV
- Mobile app version
- Multi-ecosystem comparison dashboard

---

## 👤 Contributors

Built with React, Express, PostgreSQL and Machine Learning simulation.
