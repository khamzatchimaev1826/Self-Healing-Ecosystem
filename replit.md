# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Contains the Self-Healing Ecosystem Model — a full-stack web app that simulates ecosystem damage, recovery, and collapse using ML and dynamic simulation.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod, `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (ESM bundle)
- **Frontend**: React + Vite + TailwindCSS + Framer Motion + Recharts

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── ecosystem/            # React frontend (dark neon theme)
│   └── api-server/           # Express API server
├── lib/
│   ├── api-spec/             # OpenAPI spec + Orval codegen config
│   ├── api-client-react/     # Generated React Query hooks
│   ├── api-zod/              # Generated Zod schemas from OpenAPI
│   └── db/                   # Drizzle ORM schema + DB connection
├── scripts/                  # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Application Features

### Self-Healing Ecosystem Model

- **Create ecosystems**: Forest, River, Grassland with configurable species
- **ML predictions**: Health classifier (Healthy/Stressed/Collapsing), recovery time predictor, collapse risk estimator
- **Simulation engine**: Lotka-Volterra population dynamics for plants, herbivores, predators
- **Interventions**: Reforestation, pollution reduction, species introduction, habitat restoration, hunting bans
- **Data persistence**: All ecosystems and simulation runs stored in PostgreSQL

### Pages
1. **Home** (`/`): Landing page with ecosystem list
2. **Builder** (`/builder`): Ecosystem creation with sliders and species selector
3. **Dashboard** (`/dashboard/:id`): Health score, stability, ML predictions, intervention controls
4. **Simulation** (`/simulation/:id`): Live population charts over time
5. **Analysis** (`/analysis/:id`): Collapse risk analysis and recommendations

### API Endpoints
- `POST /api/ecosystems` — create ecosystem (runs ML pipeline)
- `GET /api/ecosystems` — list all ecosystems
- `GET /api/ecosystems/:id` — get ecosystem details
- `PUT /api/ecosystems/:id/intervene` — apply intervention
- `DELETE /api/ecosystems/:id` — delete ecosystem
- `POST /api/simulation/:id/run` — run Lotka-Volterra simulation
- `GET /api/simulation/:id/history` — get simulation history

### ML Engine (`artifacts/api-server/src/lib/ecosystemML.ts`)
5 ML models matching the project spec:
1. **Health Classifier** (Random Forest-inspired): Score from 100 with penalties for temperature (optimal 20–30°C), rainfall (500–1500mm), pollution (>70% critical), deforestation. Biodiversity bonus. Thresholds: ≥70 Healthy, 40–70 Stressed, <40 Collapsing
2. **Recovery Time Predictor** (Gradient Boosting-inspired): Health deficit × pollution × deforestation × biodiversity factors
3. **Collapse Risk Model** (SVM-inspired): Base risk (5%/30%/85%) + external pressure + biodiversity adjustments
4. **Stability Index**: Population evenness across plants/herbivores/predators (spec formula)
5. **Recovery Recommender** (Rule-based): Structured `Recommendation` objects with `action`, `priority` (CRITICAL/HIGH/MEDIUM/LOW), `impact`, `timeline`
- **Lotka-Volterra Simulation**: 10 dt=0.1 steps per week; plant logistic growth; herbivore/predator Lotka-Volterra equations with env modifiers
- **Biodiversity Index**: Normalized average trophic level coverage (0–1)

## Database Schema (`lib/db/src/schema/ecosystems.ts`)

- **ecosystems**: id, name, type, temperature, rainfall, pollution, deforestation_rate, species (jsonb), interventions (jsonb), predictions (jsonb), timestamps
- **simulations**: id, ecosystem_id, weeks, data_points (jsonb), final_predictions (jsonb), run_at

## Development Commands

- `pnpm --filter @workspace/api-server run dev` — start API server
- `pnpm --filter @workspace/ecosystem run dev` — start frontend
- `pnpm --filter @workspace/db run push` — push DB schema
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API client
