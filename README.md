# 🌿 Self-Healing Ecosystem

### 🌍 Live Application

**Live Demo:** https://self-healing-ecosystem-model.vercel.app

### 📦 Repository

**GitHub Repository:** https://github.com/joshuafranklin1826/Self-Healing-Ecosystem

---

An intelligent full-stack ecosystem simulation platform that models ecological interactions, predicts environmental health, estimates collapse risk, and recommends restoration strategies using multiple machine learning approaches.

## Overview

Self-Healing Ecosystem is a machine learning powered environmental simulation platform designed to model ecosystem behavior across multiple biome types.

The system combines ecological population dynamics, environmental indicators, predictive analytics, and restoration planning to provide real-time ecosystem intelligence and long-term sustainability forecasting.

Users can create ecosystems, simulate environmental changes, apply interventions, and analyze ecological outcomes through an interactive web interface.

---

## Key Features

* Multi-biome ecosystem simulation
* Real-time ecosystem health scoring
* Species population dynamics modeling
* Ecosystem collapse risk prediction
* Recovery time estimation
* Automated intervention recommendations
* Interactive data visualization dashboards
* Scenario simulation and forecasting
* Machine learning driven environmental analysis
* Public cloud deployment accessible worldwide

---

## Supported Ecosystems

| Biome        | Representative Species               |
| ------------ | ------------------------------------ |
| 🌳 Forest    | Oak, Deer, Wolf, Bear, Fox           |
| 🌊 River     | Algae, Fish, Otter, Heron, Pike      |
| 🌾 Grassland | Bison, Gazelle, Prairie Dog, Hawk    |
| ❄️ Polar     | Arctic Moss, Arctic Hare, Polar Bear |

**Total simulated species:** 36+

---

## Technology Stack

### Frontend

* React 18
* Vite
* Tailwind CSS
* Framer Motion
* Recharts
* TanStack Query
* Wouter

### Backend

* Node.js
* Express.js
* Zod
* Pino Logger
* CORS

### Database

* PostgreSQL
* Drizzle ORM
* PGLite support for local environments

### Machine Learning Components

* Weighted Health Classification
* Population Recovery Prediction
* Collapse Risk Classification
* Lotka-Volterra Population Dynamics
* Ecosystem Recommendation Engine

---

## Machine Learning Pipeline

### Ecosystem Health Classifier

Calculates ecosystem health scores using biodiversity metrics and environmental indicators.

### Population Dynamics Engine

Uses Lotka-Volterra differential equations to simulate predator-prey interactions and species relationships.

### Recovery Time Predictor

Estimates ecosystem recovery duration following interventions.

### Collapse Risk Model

Evaluates ecosystem collapse probability using environmental stress variables.

### Recommendation Engine

Generates prioritized restoration actions based on detected ecological threats.

---

## Environmental Parameters

| Parameter          | Range             |
| ------------------ | ----------------- |
| Temperature        | -10°C to 50°C     |
| Rainfall           | 0 to 5000 mm/year |
| Pollution          | 0% to 100%        |
| Deforestation Rate | 0% to 100%        |
| Biodiversity Index | Dynamic           |

---

## Available Interventions

* Reforestation
* Pollution Reduction
* Species Reintroduction
* Habitat Restoration
* Hunting Restrictions

---

## System Architecture

```text
React Frontend
       ↓
Express REST API
       ↓
Machine Learning Pipeline
       ↓
PostgreSQL Database
       ↓
Predictions and Recommendations
```

---

## API Endpoints

| Method | Endpoint                        | Description        |
| ------ | ------------------------------- | ------------------ |
| GET    | `/api/healthz`                  | Health check       |
| POST   | `/api/ecosystems`               | Create ecosystem   |
| GET    | `/api/ecosystems`               | List ecosystems    |
| GET    | `/api/ecosystems/:id`           | Retrieve ecosystem |
| PUT    | `/api/ecosystems/:id/intervene` | Apply intervention |
| POST   | `/api/simulation/:id/run`       | Run simulation     |

---

## Project Structure

```text
artifacts/
├── ecosystem/
│   ├── src/pages
│   └── src/components
│
├── api-server/
│   ├── src/routes
│   └── src/lib
│
└── ecosystem-deck/

lib/
├── db
├── api-spec
└── api-client-react
```

---

## Production Deployment

The application is deployed as a publicly accessible cloud service and can be accessed globally through:

https://self-healing-ecosystem-model.vercel.app

---

## Future Improvements

* Satellite data integration
* Neural-network based health prediction
* Climate scenario simulations
* CSV export support
* Mobile application
* Multi-ecosystem comparison dashboards
* Real-world environmental data ingestion
* Geospatial visualization support

---

## Author

**Mandapalli Joshua Franklin**

---

## License

This project is released under the MIT License.
