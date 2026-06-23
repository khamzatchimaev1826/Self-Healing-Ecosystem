# Deploy Self-Healing Ecosystem (Free, Public Link)

This guide deploys the app so **anyone with the link** can create ecosystems, run simulations, and view analysis — with **no cost** on free tiers.

| Part | Service | Why |
|------|---------|-----|
| Frontend (React) | [Vercel](https://vercel.com) | Free, permanent URL, auto-deploy from GitHub |
| API (Express) | [Render](https://render.com) | Free Node.js hosting |
| Database (PostgreSQL) | [Neon](https://neon.tech) | Free serverless Postgres (data persists) |

Shared ecosystems are stored in one database — all visitors see the same ecosystem list and can add new ones.

---

## Prerequisites

1. A [GitHub](https://github.com) account with this repo pushed
2. Accounts on Neon, Render, and Vercel (all free)

---

## Step 1 — Database (Neon)

1. Go to [neon.tech](https://neon.tech) → **New Project**
2. Name it `ecosystem` (any region is fine)
3. Copy the **connection string** (starts with `postgresql://...`)
4. Keep it safe — you will use it in Render

Neon free tier keeps your data **forever** (within free storage limits).

---

## Step 2 — API (Render)

1. Go to [render.com](https://render.com) → **New** → **Blueprint**
2. Connect your GitHub repo
3. Render reads `render.yaml` and creates the `ecosystem-api` service
4. When prompted for **DATABASE_URL**, paste your Neon connection string
5. Deploy and wait for the build to finish
6. Copy your API URL, e.g. `https://ecosystem-api-xxxx.onrender.com`

**Note:** Render free tier sleeps after ~15 minutes of inactivity. The first request after sleep may take 30–60 seconds to wake up. Upgrading to a paid plan removes sleep.

Test the API:

```
https://YOUR-API-URL.onrender.com/api/healthz
```

Should return: `{"status":"ok"}`

---

## Step 3 — Frontend (Vercel)

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import the same GitHub repo
3. Vercel auto-detects settings from `vercel.json`:
   - **Install:** `pnpm install`
   - **Build:** `pnpm --filter @workspace/ecosystem run build`
   - **Output:** `artifacts/ecosystem/dist/public`
4. Add environment variable:

   | Name | Value |
   |------|-------|
   | `VITE_API_URL` | `https://YOUR-API-URL.onrender.com` (no trailing slash) |

5. Deploy

Your public app URL will look like: `https://self-healing-model.vercel.app`

Share that link — everyone can use the full app.

---

## Step 4 — Verify end-to-end

1. Open your Vercel URL in a browser
2. Go to **Builder** → create an ecosystem
3. Open **Dashboard** → run a simulation
4. Open the same URL in another browser/device — you should see the ecosystem you created (shared database)

---

## Auto-deploy on every push

After the first setup:

- Push to `main` on GitHub
- Vercel redeploys the frontend automatically
- Render redeploys the API automatically

---

## Local development (VS Code)

See [README.md](./README.md#-local-development-vs-code) for running on your machine before deploying.

Quick start:

```powershell
copy .env.example .env
pnpm install
pnpm run db:up
pnpm run db:push
# Terminal 1:
pnpm run dev:api
# Terminal 2:
pnpm run dev:web
```

Open **http://localhost:3000**

Or in VS Code: **Run and Debug** → **Full Stack (API + Frontend)**

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Frontend loads but no ecosystems / API errors | Check `VITE_API_URL` in Vercel matches your Render URL exactly |
| API build fails on Render | Confirm `DATABASE_URL` is set and Neon project is active |
| First API call very slow | Render free tier waking from sleep — wait and retry |
| CORS errors | API uses open CORS (`cors()`); usually means wrong `VITE_API_URL` |
| Database connection error | Use Neon **pooled** connection string if direct connection fails |

---

## Optional: custom domain

- **Vercel:** Project → Settings → Domains → add your domain (free SSL)
- **Render:** Service → Settings → Custom Domains

Update `VITE_API_URL` if you add a custom domain to the API.
