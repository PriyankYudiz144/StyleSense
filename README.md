# StyleSense

> **AI-powered hairstyle consultation platform for modern salons and barbershops.**
> Help your customers see their next haircut before the scissors come out.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688)](https://fastapi.tiangolo.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)

---

## Overview

StyleSense is a tablet-first web application that helps salons run AI-assisted consultations. A barber captures a customer's photo, the platform generates 10–15 personalized hairstyle previews, and the customer picks the look they want — all in under a minute.

**Why it matters:** miscommunication between customers and stylists is the #1 cause of haircut regret. StyleSense bridges that gap visually.

## Core Features

- 📸 **Live photo capture** — works directly from tablet/phone camera
- 🧠 **AI face analysis** — detects face shape, suggests suitable styles
- ✨ **10–15 hairstyle previews** — fades, classic cuts, long styles, color variations, trends
- 👆 **One-tap selection** — customer picks, barber gets reference
- 📂 **Before/after gallery** — captures final results for the customer's record
- 📊 **Salon dashboard** — track customers, sessions, popular styles
- 👥 **Multi-barber support** — admins manage team members and roles
- 📱 **Tablet-first PWA** — installable, fast, works on shaky salon Wi-Fi

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| **State** | TanStack Query (server), Zustand (client) |
| **Forms** | react-hook-form + zod |
| **Backend** | FastAPI, Python 3.11, SQLAlchemy 2.0 (async), Pydantic v2 |
| **Database** | PostgreSQL 15 |
| **Cache / Queue** | Redis |
| **AI** | Replicate / fal.ai (IP-Adapter, InstantID) |
| **Storage** | Cloudflare R2 (S3-compatible) |
| **Auth** | JWT (access + rotating refresh tokens) |
| **DevOps** | Docker Compose, GitHub Actions, Vercel + Railway |

## Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│  Next.js (PWA)  │────────▶│   FastAPI API    │────────▶│  PostgreSQL     │
│  Tablet / Mobile│  HTTPS  │   (async)        │         │                 │
└─────────────────┘         └──────────────────┘         └─────────────────┘
                                     │
                       ┌─────────────┼─────────────┐
                       ▼             ▼             ▼
                  ┌─────────┐  ┌──────────┐  ┌──────────────┐
                  │  Redis  │  │   R2/S3  │  │ Replicate /  │
                  │ (cache) │  │ (photos) │  │   fal.ai     │
                  └─────────┘  └──────────┘  └──────────────┘
```

## Prerequisites

- **Node.js** 20+
- **pnpm** 9+ (or npm 10+)
- **Python** 3.11+
- **Docker** & **Docker Compose**
- A **Replicate** or **fal.ai** API key (for AI generation)
- A **Cloudflare R2** or **AWS S3** bucket (for photo storage)

## Quick Start

### 1. Clone and configure

```bash
git clone https://github.com/your-org/stylesense.git
cd stylesense

# Copy environment templates
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

### 2. Fill in environment variables

**`apps/api/.env`**
```env
DATABASE_URL=postgresql+asyncpg://stylesense:stylesense@localhost:5432/stylesense
REDIS_URL=redis://localhost:6379/0

JWT_SECRET_KEY=change-me-to-a-long-random-string
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# Storage
S3_ENDPOINT_URL=https://<account>.r2.cloudflarestorage.com
S3_BUCKET_NAME=stylesense-uploads
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
S3_REGION=auto

# AI
REPLICATE_API_TOKEN=r8_xxx
# or
FAL_API_KEY=fal_xxx

# CORS
ALLOWED_ORIGINS=http://localhost:3000
```

**`apps/web/.env.local`**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### 3. Start the stack

```bash
docker-compose up -d postgres redis
```

### 4. Set up the backend

```bash
cd apps/api
python -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"

# Run migrations
alembic upgrade head

# Seed demo data (optional)
python -m app.scripts.seed

# Start dev server
uvicorn app.main:app --reload --port 8000
```

API docs available at <http://localhost:8000/docs>

### 5. Set up the frontend

```bash
cd apps/web
pnpm install
pnpm dev
```

App available at <http://localhost:3000>

### 6. Log in with demo account

```
Email:    admin@demo-salon.com
Password: demo1234
```

## Project Structure

```
stylesense/
├── apps/
│   ├── web/                      # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/              # App Router pages
│   │   │   ├── components/       # UI components
│   │   │   ├── lib/              # API client, hooks, utils
│   │   │   ├── stores/           # Zustand stores
│   │   │   └── types/
│   │   └── public/
│   └── api/                      # FastAPI backend
│       ├── app/
│       │   ├── api/v1/           # Route handlers
│       │   ├── core/             # Config, security, dependencies
│       │   ├── db/               # Database session, base classes
│       │   ├── models/           # SQLAlchemy models
│       │   ├── schemas/          # Pydantic schemas
│       │   └── services/         # Business logic (auth, AI, storage)
│       ├── alembic/              # Migrations
│       └── tests/
├── packages/
│   └── shared-types/             # OpenAPI-generated TS types
├── docker-compose.yml
└── .github/workflows/            # CI pipelines
```

## Core User Flows

### Barber consultation flow
1. Log in on the salon tablet
2. Tap **New Consultation**
3. Capture customer photo with camera (or upload)
4. Wait ~20–30 seconds for AI to analyze face and generate previews
5. Customer reviews 10–15 styles, taps to select
6. Selected style stays on screen as a reference during the haircut
7. Optionally capture the final result

### Salon admin flow
1. Sign up the salon (creates admin account)
2. Invite barbers from **Settings → Team**
3. Monitor activity from the dashboard
4. Manage subscription and AI credits

## API Documentation

Once the backend is running, interactive docs are available at:
- **Swagger UI** — <http://localhost:8000/docs>
- **ReDoc** — <http://localhost:8000/redoc>

All endpoints are prefixed `/api/v1`. JWT auth is required except for `/auth/*` and `/health`.

## Development

### Running tests

```bash
# Backend
cd apps/api
pytest

# Frontend
cd apps/web
pnpm test          # unit
pnpm test:e2e      # Playwright
```

### Linting & formatting

```bash
# Backend
cd apps/api
ruff check . && ruff format .
mypy app

# Frontend
cd apps/web
pnpm lint
pnpm format
```

### Database migrations

```bash
cd apps/api

# Create a new migration after model changes
alembic revision --autogenerate -m "describe change"

# Apply migrations
alembic upgrade head

# Rollback one step
alembic downgrade -1
```

### Generating shared TypeScript types

```bash
# From the API (must be running)
cd packages/shared-types
pnpm generate
```

## Roles & Permissions

| Role | Permissions |
|------|-------------|
| **super_admin** | Manages all salons, subscriptions, platform settings |
| **salon_admin** | Manages their salon, team members, billing, all sessions |
| **barber** | Creates consultations, views own sessions and customers |

## AI Credit System

Each salon receives a monthly AI credit allocation based on subscription tier. One credit = one hairstyle preview generation. Credits reset monthly. When a salon hits zero credits, new generations are blocked until refill or upgrade.

| Tier | Monthly Credits | Barbers |
|------|----------------|---------|
| Trial | 30 | 1 |
| Starter | 100 | 1 |
| Pro | 500 | 5 |
| Enterprise | Custom | Unlimited |

Billing integration is intentionally out of scope for MVP — credits are managed manually.

## Deployment

### Frontend (Vercel)
1. Connect the GitHub repo to Vercel
2. Set root directory to `apps/web`
3. Add environment variables from `.env.local`
4. Deploy

### Backend (Railway / Fly.io)
1. Connect repo, point to `apps/api/Dockerfile`
2. Add a Postgres + Redis instance
3. Configure environment variables
4. Run `alembic upgrade head` on deploy
5. Set health check to `/health`

### Database
Use a managed Postgres provider (Neon, Supabase, Railway, RDS). Always enable backups before going live.

## Roadmap

### v0.1 — MVP (current)
- ✅ Auth + salon onboarding
- ✅ Session flow (capture → analyze → generate → select)
- ✅ Dashboard with basic stats
- ✅ Tablet PWA

### v0.2 — Next
- 🔲 Stripe billing integration
- 🔲 Customer SMS notifications with their final look
- 🔲 Style library — barbers can favorite reference styles
- 🔲 Multi-language support (English, Hindi, Gujarati for India market)

### v0.3 — Later
- 🔲 Booking integration
- 🔲 Customer self-service app (suggest a look before arriving)
- 🔲 Anonymous trend analytics for brands
- 🔲 White-label deployments for chains

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/your-feature`)
3. Use conventional commits (`feat:`, `fix:`, `chore:`, `docs:`)
4. Open a pull request — CI must pass (lint + tests)
5. One review approval required before merge

## License

MIT — see [LICENSE](LICENSE) for details.

## Support

- 🐛 **Bugs:** open a GitHub issue
- 💡 **Feature requests:** GitHub Discussions
- 📧 **Salon partnerships:** hello@stylesense.app

---

Built with ❤️ for salons that care about getting it right the first time.
